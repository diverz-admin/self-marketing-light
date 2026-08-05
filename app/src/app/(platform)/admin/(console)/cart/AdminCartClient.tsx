"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  Card, TableShell, Th, Td, EmptyState, Badge, SearchInput, Tabs,
  Button, Field, Input, Select, Notice,
} from "@/components/admin/ui";
import { PeriodPicker } from "@/components/admin/PeriodPicker";
import type { PeriodParams } from "@/lib/period-filter";
import { formatKRW, formatNumber, formatDate } from "@/lib/admin-format";
import {
  ADMIN_CART_PRODUCTS, ADMIN_CART_STATUS_META, ADMIN_CART_TIERS, adminCartProduct,
} from "@/lib/admin-cart";
import { addAdminCartItem, type AdminCartItemInput } from "../actions";

/**
 * 장바구니 담아주기 — 문의로 들어온 건을 관리자가 회원 장바구니에 넣어 준다.
 *
 * 보장형·콘텐츠 제작은 고객이 신청 화면에서 직접 담을 수 없고 금액도 상담마다 달라서,
 * 상품 목록만 고정해 두고 금액은 담을 때 관리자가 정한다.
 */
export type UserOption = {
  id: string;
  name: string;
  email: string;
  /** 가입 시 등록한 업체명(상호명) — 회원을 찾는 기준 */
  orgName: string;
  phone: string;
};

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

export function AdminCartClient({
  rows,
  users,
  years,
  period,
}: {
  rows: AdminCartRow[];
  users: UserOption[];
  /** 결제 건이 있는 연도 (서버 집계) */
  years: number[];
  period: PeriodParams;
}) {
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
        r.title.toLowerCase().includes(q) ||
        (r.target ?? "").toLowerCase().includes(q)
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
            placeholder="업체명 · 연락처 · 상품 · 대상 검색"
            className="w-full sm:w-64"
          />
        </div>

        {/* 결제완료 건만 결제일로 좁혀 본다 — 담아둔 건은 결제일이 없어 나눌 수 없다 */}
        {status === "ordered" && (
          <PeriodPicker years={years} value={period} count={filtered.length} label="결제일 조회" />
        )}

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
              {/* 결제완료를 기간으로 나눠 보는 목적은 대개 정산이라 합계를 함께 적는다 */}
              {status === "ordered" && (
                <>
                  {" · 결제 합계 "}
                  <span className="font-bold text-brand-dark">
                    {formatKRW(filtered.reduce((sum, r) => sum + r.amount, 0))}
                  </span>
                </>
              )}
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
  const group = adminCartProduct(row.productKey)?.group;

  return (
    <tr className="hover:bg-brand-light/50 transition-colors align-top">
      {/* 담을 때 입력한 값은 빠짐없이 보여준다 — 여기서 확인이 안 되면 다시 담아야 한다 */}
      <Td>
        <div className="font-semibold text-brand-dark">{row.advertiser}</div>
        <div className="text-[12px] text-brand-muted">
          {row.userName}
          {row.userPhone && <span className="tabular-nums">{` · ${row.userPhone}`}</span>}
        </div>
      </Td>
      <Td>
        <div className="text-brand-dark font-medium">
          {group && <span className="text-brand-muted font-normal">{group} · </span>}
          {row.title}
        </div>
        {row.target && <div className="text-[12px] text-brand-sub mt-0.5">대상 · {row.target}</div>}
        {/* 안내 메모는 고객 장바구니에도 함께 보이는 값이라 여기서도 확인할 수 있게 둔다 */}
        {row.note && (
          <div className="text-[12px] text-brand-muted whitespace-pre-wrap mt-0.5">메모 · {row.note}</div>
        )}
      </Td>
      <Td className="text-[13px] text-brand-sub whitespace-nowrap">
        {formatDate(row.createdAt)}
        {/* 기간 조회 기준이 결제일이라 언제 결제됐는지 같이 보여준다 */}
        {row.orderedAt && (
          <div className="text-[12px] text-brand-muted">결제 {formatDate(row.orderedAt)}</div>
        )}
      </Td>
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

/** 회원을 부르는 이름 — 담아줄 때 기준은 업체명(상호명)이고, 없으면 가입자 이름으로 대신한다 */
function memberLabel(u: UserOption) {
  return u.orgName || u.name;
}

/**
 * 회원 검색 — 회원이 수백 명이라 드롭다운으로는 찾지 못한다.
 * 상담 건은 업체명(상호명)으로 들어오므로 그 이름으로 좁혀서 고른다.
 */
function MemberSearch({
  users,
  value,
  onChange,
}: {
  users: UserOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const selected = users.find((u) => u.id === value) ?? null;

  // 바깥을 누르면 목록만 닫는다 (고른 회원은 유지)
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? users.filter(
          (u) => u.orgName.toLowerCase().includes(q) || u.name.toLowerCase().includes(q),
        )
      : users;
    // 목록이 길면 고르기 어려워 앞에서 끊는다 — 더 좁히려면 검색어를 더 넣으면 된다
    return list.slice(0, 30);
  }, [users, query]);

  const pick = (u: UserOption) => {
    onChange(u.id);
    setQuery(memberLabel(u));
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setCursor((c) => {
        const next = e.key === "ArrowDown" ? c + 1 : c - 1;
        return Math.max(0, Math.min(matches.length - 1, next));
      });
      return;
    }
    if (e.key === "Enter" && open && matches[cursor]) {
      e.preventDefault();
      pick(matches[cursor]);
    }
  };

  return (
    <div ref={boxRef} className="relative">
      <SearchInput
        value={query}
        onChange={(v) => {
          setQuery(v);
          setCursor(0);
          setOpen(true);
          // 글자를 고치면 고른 회원과 화면이 어긋나므로 선택을 푼다
          if (value) onChange("");
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="업체명(상호명) 검색"
      />

      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto rounded-xl border border-brand-border bg-white shadow-lg">
          {matches.length ? (
            matches.map((u, i) => (
              <button
                key={u.id}
                type="button"
                onMouseEnter={() => setCursor(i)}
                onClick={() => pick(u)}
                className={`block w-full text-left px-3.5 py-2.5 transition-colors ${
                  i === cursor ? "bg-brand-light" : "hover:bg-brand-light"
                }`}
              >
                <div className="text-[13.5px] font-semibold text-brand-dark">{memberLabel(u)}</div>
                <div className="text-[12px] text-brand-muted">
                  {u.name}
                  {u.phone ? ` · ${u.phone}` : ""}
                </div>
              </button>
            ))
          ) : (
            <div className="px-3.5 py-3 text-[13px] text-brand-muted">검색 결과가 없습니다.</div>
          )}
        </div>
      )}

      {selected && (
        <p className="mt-1.5 text-[12.5px] text-brand-primary font-semibold">
          {memberLabel(selected)}
          <span className="text-brand-muted font-normal">
            {" · "}
            {selected.name}
            {selected.phone ? ` · ${selected.phone}` : ""}
          </span>
        </p>
      )}
    </div>
  );
}

/** 담기 — 회원 · 상품 · 금액만 정하면 바로 회원 장바구니에 들어간다 */
function AddForm({ users }: { users: UserOption[] }) {
  const [form, setForm] = useState<AdminCartItemInput>({
    userId: "",
    productKey: ADMIN_CART_PRODUCTS[0].key,
    tier: "",
    quantity: "1",
    amount: "",
  });
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof AdminCartItemInput>(key: K, value: AdminCartItemInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const product = adminCartProduct(form.productKey);
  const selected = users.find((u) => u.id === form.userId) ?? null;

  const submit = () => {
    setMsg(null);
    startTransition(async () => {
      const res = await addAdminCartItem(form);
      if ("error" in res) {
        setMsg({ text: res.error, ok: false });
        return;
      }
      setMsg({ text: `${selected ? memberLabel(selected) : "회원"} 장바구니에 담았습니다.`, ok: true });
      // 회원은 그대로 두고 내용만 비운다 — 같은 회원에게 여러 건 담는 경우가 많다
      setForm((f) => ({ ...f, quantity: "1", amount: "" }));
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

      <div className="p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
          <Field label="회원" hint="업체명(상호명)으로 검색합니다">
            <MemberSearch users={users} value={form.userId} onChange={(id) => set("userId", id)} />
          </Field>
          <Field label="상품" hint={product?.desc}>
            <Select
              value={form.productKey}
              onChange={(e) => {
                const next = adminCartProduct(e.target.value);
                // 등급 없는 상품으로 바꾸면 남아 있던 등급을 지운다
                setForm((f) => ({
                  ...f,
                  productKey: e.target.value,
                  tier: next?.tiered ? ADMIN_CART_TIERS[0] : "",
                }));
              }}
            >
              {ADMIN_CART_PRODUCTS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.group} · {p.label}
                </option>
              ))}
            </Select>
          </Field>

          {/*
            등급은 콘텐츠 상품에만 있다 (이미지 제작 제외).
            셋 중 하나라 셀렉트보다 나란히 보이는 편이 고르기 쉽고,
            없는 상품에서도 자리를 비우지 않아야 등급이 있다는 걸 안다.
          */}
          <Field
            label="등급"
            hint={
              product?.tiered
                ? "신청 페이지의 Standard · Deluxe · Premium과 같은 구분입니다"
                : "이 상품은 등급 구분이 없습니다"
            }
          >
            {product?.tiered ? (
              <div className="flex gap-1.5 rounded-xl border border-brand-border bg-brand-light p-1">
                {ADMIN_CART_TIERS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("tier", t)}
                    className={`flex-1 rounded-lg py-2 text-[13px] font-bold transition-all ${
                      form.tier === t
                        ? "bg-brand-primary text-white shadow-sm"
                        : "text-brand-sub hover:bg-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-brand-border bg-brand-light/60 py-[9px] px-3.5 text-[13px] text-brand-muted">
                해당 없음
              </div>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="수량">
              <Input
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                inputMode="numeric"
              />
            </Field>
            <Field label="금액 (원)" hint="상담 결과 금액을 그대로 적습니다">
              <Input
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                inputMode="numeric"
                placeholder="0"
              />
            </Field>
          </div>
        </div>

        {msg && <Notice ok={msg.ok}>{msg.text}</Notice>}
      </div>

      {/* 담기 직전 확인 줄 — 무엇을 누구에게 얼마로 담는지 한 줄로 다시 보여준다 */}
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-t border-brand-border bg-brand-light/60 flex-wrap">
        <div className="text-[13px] min-w-0">
          <span className="font-bold text-brand-dark">
            {selected ? memberLabel(selected) : "회원 미선택"}
          </span>
          <span className="text-brand-sub">
            {" · "}
            {product?.label}
            {form.tier ? ` ${form.tier}` : ""}
            {` · ${formatNumber(Number(form.quantity || 0))}개`}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[11.5px] font-semibold text-brand-muted">합계</div>
            <div className="text-[19px] font-extrabold text-brand-dark tabular-nums leading-tight">
              {formatKRW(Number(form.amount || 0))}
            </div>
          </div>
          <Button onClick={submit} disabled={pending || !form.userId || !form.amount}>
            {pending ? "담는 중..." : "장바구니에 담기"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
