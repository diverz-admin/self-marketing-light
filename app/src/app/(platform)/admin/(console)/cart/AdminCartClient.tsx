"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Card, TableShell, Th, Td, EmptyState, Badge, SearchInput, Tabs,
  Button, Field, Input, Select, Textarea, Notice,
} from "@/components/admin/ui";
import { formatKRW, formatNumber, formatDate } from "@/lib/admin-format";
import { ADMIN_CART_PRODUCTS, ADMIN_CART_STATUS_META, adminCartProduct } from "@/lib/admin-cart";
import { addAdminCartItem, type AdminCartItemInput } from "../actions";

/**
 * 장바구니 담아주기 — 문의로 들어온 건을 관리자가 회원 장바구니에 넣어 준다.
 *
 * 보장형·콘텐츠 제작은 고객이 신청 화면에서 직접 담을 수 없고 금액도 상담마다 달라서,
 * 상품 목록만 고정해 두고 금액은 담을 때 관리자가 정한다.
 */
export type UserOption = { id: string; name: string; email: string };

export type AdminCartRow = {
  id: string;
  userId: string;
  /** 가입 시 등록한 회사명 */
  advertiser: string;
  userName: string;
  /** 연락처 — 상담 건이라 이메일보다 전화번호를 본다 */
  userPhone: string;
  /** 담아준 관리자 */
  adminName: string;
  productKey: string;
  title: string;
  target: string | null;
  note: string | null;
  quantity: number;
  amount: number;
  /** pending | ordered | canceled */
  status: string;
  orderedAt: string | null;
  createdAt: string;
};

const STATUS_FILTERS = [
  { key: "all", label: "전체" },
  { key: "pending", label: "담아둠" },
  { key: "ordered", label: "결제완료" },
];

export function AdminCartClient({ rows, users }: { rows: AdminCartRow[]; users: UserOption[] }) {
  // 담는 일과 담아준 내역 확인은 다른 작업이라 탭으로 나눈다
  const [view, setView] = useState("add");
  const [status, setStatus] = useState("pending");
  const [query, setQuery] = useState("");

  const statusCount = (key: string) =>
    key === "all" ? rows.length : rows.filter((r) => r.status === key).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (!q) return true;
      return (
        r.advertiser.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        r.userPhone.includes(q) ||
        r.title.toLowerCase().includes(q)
      );
    });
  }, [rows, status, query]);

  const pendingCount = rows.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-4">
      <Tabs
        tabs={[
          { key: "add", label: "장바구니에 담기" },
          { key: "history", label: "담아준 내역", count: pendingCount },
        ]}
        value={view}
        onChange={setView}
      />

      {view === "add" ? (
        <AddForm users={users} />
      ) : (
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-brand-border flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatus(f.key)}
                className={`px-3 py-1.5 rounded-xl text-[13px] font-bold transition-all ${
                  status === f.key
                    ? "bg-brand-primary text-white"
                    : "bg-brand-light text-brand-sub hover:bg-brand-border"
                }`}
              >
                {f.label}
                <span className="ml-1.5 tabular-nums opacity-70">{statusCount(f.key)}</span>
              </button>
            ))}
          </div>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="회원 · 연락처 · 상품 검색"
            className="w-full sm:w-64"
          />
        </div>

        {filtered.length ? (
          <>
            <TableShell
              head={
                <>
                  <Th>회원</Th>
                  <Th>상품</Th>
                  <Th>담아준 날짜</Th>
                  <Th className="text-center">수량</Th>
                  <Th className="text-right">금액</Th>
                  <Th>상태</Th>
                  <Th>담아준 사람</Th>
                </>
              }
            >
              {filtered.map((r) => (
                <CartRow key={r.id} row={r} />
              ))}
            </TableShell>
            <div className="px-5 py-3 border-t border-brand-border text-[12.5px] text-brand-muted">
              총 <span className="font-bold text-brand-dark">{filtered.length}</span>건
            </div>
          </>
        ) : (
          <EmptyState message="해당 조건의 건이 없습니다." />
        )}
      </Card>
      )}
    </div>
  );
}

function CartRow({ row }: { row: AdminCartRow }) {
  const meta = ADMIN_CART_STATUS_META[row.status] ?? { label: row.status, tone: "gray" as const };

  return (
    <tr className="hover:bg-brand-light/50 transition-colors align-top">
      <Td>
        <div className="font-semibold text-brand-dark">{row.advertiser}</div>
        <div className="text-[12px] text-brand-muted tabular-nums">
          {row.userPhone || <span className="text-brand-muted">연락처 미등록</span>}
        </div>
      </Td>
      <Td>
        <div className="text-brand-dark font-medium">{row.title}</div>
        {/* 안내 메모는 고객 장바구니에도 함께 보이는 값이라 여기서도 확인할 수 있게 둔다 */}
        {row.note && <div className="text-[12px] text-brand-muted whitespace-pre-wrap mt-0.5">{row.note}</div>}
      </Td>
      <Td className="text-[13px] text-brand-sub whitespace-nowrap">{formatDate(row.createdAt)}</Td>
      <Td className="text-center tabular-nums">{formatNumber(row.quantity)}</Td>
      <Td className="text-right tabular-nums font-semibold text-brand-dark">{formatKRW(row.amount)}</Td>
      <Td>
        <Badge tone={meta.tone}>{meta.label}</Badge>
      </Td>
      <Td className="text-[13px]">
        {row.adminName ? (
          <span className="text-brand-text">{row.adminName}</span>
        ) : (
          <span className="text-brand-muted">-</span>
        )}
      </Td>
    </tr>
  );
}

/** 담기 — 회원 · 상품 · 금액만 정하면 바로 회원 장바구니에 들어간다 */
function AddForm({ users }: { users: UserOption[] }) {
  const [form, setForm] = useState<AdminCartItemInput>({
    userId: "",
    productKey: ADMIN_CART_PRODUCTS[0].key,
    target: "",
    note: "",
    quantity: "1",
    amount: "",
  });
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof AdminCartItemInput>(key: K, value: AdminCartItemInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const product = adminCartProduct(form.productKey);

  const submit = () => {
    setMsg(null);
    startTransition(async () => {
      const res = await addAdminCartItem(form);
      if ("error" in res) {
        setMsg({ text: res.error, ok: false });
        return;
      }
      const who = users.find((u) => u.id === form.userId);
      setMsg({ text: `${who?.name ?? "회원"} 장바구니에 담았습니다.`, ok: true });
      // 회원은 그대로 두고 내용만 비운다 — 같은 회원에게 여러 건 담는 경우가 많다
      setForm((f) => ({ ...f, target: "", note: "", quantity: "1", amount: "" }));
    });
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-5 py-4 border-b border-brand-border">
        <p className="text-[14px] font-bold text-brand-dark">장바구니에 담기</p>
        <p className="text-[12.5px] text-brand-muted mt-0.5">
          문의 기반 견적이라 금액은 상담 결과대로 직접 입력합니다.
        </p>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="회원">
            <Select value={form.userId} onChange={(e) => set("userId", e.target.value)}>
              <option value="">회원을 선택하세요</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="상품" hint={product?.desc}>
            <Select value={form.productKey} onChange={(e) => set("productKey", e.target.value)}>
              {ADMIN_CART_PRODUCTS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.group} · {p.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="대상" hint="고객이 장바구니에서 어떤 건인지 알아볼 수 있게 적습니다">
          <Input
            value={form.target}
            onChange={(e) => set("target", e.target.value)}
            placeholder={product?.targetPlaceholder}
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="수량">
            <Input value={form.quantity} onChange={(e) => set("quantity", e.target.value)} inputMode="numeric" />
          </Field>
          <Field label="금액 (원)" hint="총 결제 금액">
            <Input
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              inputMode="numeric"
              placeholder="0"
            />
          </Field>
          <Field label="합계">
            <Input value={formatKRW(Number(form.amount || 0))} readOnly disabled />
          </Field>
        </div>

        <Field label="안내 메모" hint="고객 장바구니에 함께 보입니다">
          <Textarea
            value={form.note}
            onChange={(e) => set("note", e.target.value)}
            className="min-h-[72px]"
            placeholder="예) 상담해주신 조건으로 담아드렸습니다. 결제 후 3일 내 착수됩니다."
          />
        </Field>

        {msg && <Notice ok={msg.ok}>{msg.text}</Notice>}

        <div className="flex justify-end">
          <Button onClick={submit} disabled={pending || !form.userId || !form.amount}>
            {pending ? "담는 중..." : "장바구니에 담기"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
