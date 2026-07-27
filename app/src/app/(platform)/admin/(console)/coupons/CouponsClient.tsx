"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Card, TableShell, Th, Td, EmptyState, Badge, Tabs, SearchInput,
  Button, Modal, ModalFooter, Field, Input, Select, Textarea, Notice, SectionHeader,
} from "@/components/admin/ui";
import { formatKRW, formatDate, formatDateTime, couponDiscountTypeLabel } from "@/lib/admin-format";
import { upsertCoupon, toggleCouponActive, deleteCoupon, type CouponInput } from "../actions";

export type CouponRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  totalQuota: number | null;
  issuedCount: number;
  usedCount: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
};

export type RedemptionRow = {
  id: string;
  couponName: string;
  couponCode: string;
  userName: string;
  userEmail: string;
  discountAmount: number;
  usedAt: string;
};

const VIEW_TABS = [
  { key: "coupons", label: "쿠폰 정의" },
  { key: "usage", label: "사용 내역" },
];

export function CouponsClient({ rows, redemptions }: { rows: CouponRow[]; redemptions: RedemptionRow[] }) {
  const [view, setView] = useState("coupons");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<CouponRow | "new" | null>(null);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  const filteredCoupons = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q));
  }, [rows, query]);

  const filteredUsage = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return redemptions;
    return redemptions.filter(
      (r) =>
        r.couponName.toLowerCase().includes(q) ||
        r.couponCode.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q),
    );
  }, [redemptions, query]);

  const runToggle = (row: CouponRow) => {
    startTransition(async () => {
      const res = await toggleCouponActive(row.id, !row.isActive);
      setMsg({ id: row.id, text: "error" in res ? res.error : "변경됨", ok: !("error" in res) });
    });
  };

  const runDelete = (row: CouponRow) => {
    startTransition(async () => {
      const res = await deleteCoupon(row.id);
      if ("error" in res) setMsg({ id: row.id, text: res.error, ok: false });
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <Tabs
          tabs={VIEW_TABS.map((t) => ({ ...t, count: t.key === "coupons" ? rows.length : redemptions.length }))}
          value={view}
          onChange={setView}
        />
        <div className="md:ml-auto flex gap-2">
          <SearchInput value={query} onChange={setQuery} placeholder="쿠폰명 · 코드 검색" className="md:w-64" />
          {view === "coupons" && <Button onClick={() => setEditing("new")}>쿠폰 등록</Button>}
        </div>
      </div>

      {view === "coupons" ? (
        <Card>
          {filteredCoupons.length ? (
            <TableShell
              head={
                <>
                  <Th>쿠폰</Th>
                  <Th>할인</Th>
                  <Th>사용 조건</Th>
                  <Th className="text-center">발급/사용</Th>
                  <Th>기간</Th>
                  <Th>상태</Th>
                  <Th className="text-right">관리</Th>
                </>
              }
            >
              {filteredCoupons.map((c) => {
                const usageRate = c.issuedCount > 0 ? Math.round((c.usedCount / c.issuedCount) * 100) : 0;
                return (
                  <tr key={c.id} className="hover:bg-brand-light/50 transition-colors">
                    <Td>
                      <div className="font-semibold text-brand-dark">{c.name}</div>
                      <div className="text-[12.5px] text-brand-muted font-mono">{c.code}</div>
                      {msg?.id === c.id && <Notice ok={msg.ok}>{msg.text}</Notice>}
                    </Td>
                    <Td>
                      <div className="font-semibold text-brand-dark tabular-nums">
                        {c.discountType === "percent" ? `${c.discountValue}%` : formatKRW(c.discountValue)}
                      </div>
                      <div className="text-[12px] text-brand-muted">
                        {couponDiscountTypeLabel[c.discountType]}
                        {c.maxDiscountAmount ? ` · 최대 ${formatKRW(c.maxDiscountAmount)}` : ""}
                      </div>
                    </Td>
                    <Td className="text-brand-sub">
                      {c.minOrderAmount > 0 ? `${formatKRW(c.minOrderAmount)} 이상` : "제한 없음"}
                    </Td>
                    <Td className="text-center tabular-nums">
                      <div className="font-semibold text-brand-dark">
                        {c.usedCount} / {c.issuedCount}
                      </div>
                      <div className="text-[12px] text-brand-muted">
                        사용률 {usageRate}%
                        {c.totalQuota != null && ` · 한도 ${c.totalQuota}`}
                      </div>
                    </Td>
                    <Td className="text-brand-sub text-[12.5px] whitespace-nowrap">
                      {c.startsAt || c.endsAt ? (
                        <>
                          {formatDate(c.startsAt)} ~ {formatDate(c.endsAt)}
                        </>
                      ) : (
                        "상시"
                      )}
                    </Td>
                    <Td>
                      <Badge tone={c.isActive ? "green" : "gray"}>{c.isActive ? "활성" : "중지"}</Badge>
                    </Td>
                    <Td className="text-right">
                      <div className="flex gap-1.5 justify-end">
                        <Button size="sm" variant="secondary" onClick={() => setEditing(c)}>
                          수정
                        </Button>
                        <Button size="sm" variant="ghost" disabled={pending} onClick={() => runToggle(c)}>
                          {c.isActive ? "중지" : "활성"}
                        </Button>
                        <Button size="sm" variant="danger" disabled={pending} onClick={() => runDelete(c)}>
                          삭제
                        </Button>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </TableShell>
          ) : (
            <EmptyState message="등록된 쿠폰이 없습니다." />
          )}
        </Card>
      ) : (
        <Card>
          <SectionHeader title="쿠폰 사용 카운팅" />
          {filteredUsage.length ? (
            <TableShell
              head={
                <>
                  <Th>쿠폰</Th>
                  <Th>사용 회원</Th>
                  <Th className="text-right">할인 금액</Th>
                  <Th>사용일시</Th>
                </>
              }
            >
              {filteredUsage.map((r) => (
                <tr key={r.id} className="hover:bg-brand-light/50 transition-colors">
                  <Td>
                    <div className="font-semibold text-brand-dark">{r.couponName}</div>
                    <div className="text-[12.5px] text-brand-muted font-mono">{r.couponCode}</div>
                  </Td>
                  <Td>
                    <div className="text-brand-dark">{r.userName}</div>
                    <div className="text-[12.5px] text-brand-muted">{r.userEmail}</div>
                  </Td>
                  <Td className="text-right tabular-nums font-semibold text-brand-dark">
                    {formatKRW(r.discountAmount)}
                  </Td>
                  <Td className="text-brand-sub whitespace-nowrap">{formatDateTime(r.usedAt)}</Td>
                </tr>
              ))}
            </TableShell>
          ) : (
            <EmptyState message="쿠폰 사용 내역이 없습니다." />
          )}
        </Card>
      )}

      {editing && <CouponModal coupon={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

const toDateInput = (iso: string | null) => (iso ? iso.slice(0, 10) : "");

function CouponModal({ coupon, onClose }: { coupon: CouponRow | null; onClose: () => void }) {
  const [form, setForm] = useState<CouponInput>({
    id: coupon?.id,
    code: coupon?.code ?? "",
    name: coupon?.name ?? "",
    description: coupon?.description ?? "",
    discountType: coupon?.discountType ?? "amount",
    discountValue: coupon ? String(coupon.discountValue) : "",
    minOrderAmount: coupon ? String(coupon.minOrderAmount) : "0",
    maxDiscountAmount: coupon?.maxDiscountAmount != null ? String(coupon.maxDiscountAmount) : "",
    totalQuota: coupon?.totalQuota != null ? String(coupon.totalQuota) : "",
    startsAt: toDateInput(coupon?.startsAt ?? null),
    endsAt: toDateInput(coupon?.endsAt ?? null),
    isActive: coupon?.isActive ?? true,
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof CouponInput>(key: K, value: CouponInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await upsertCoupon(form);
      if ("error" in res) setError(res.error);
      else onClose();
    });
  };

  return (
    <Modal
      title={coupon ? "쿠폰 수정" : "쿠폰 등록"}
      description="쿠폰 금액과 사용 조건을 정의합니다."
      onClose={onClose}
      footer={<ModalFooter onClose={onClose} onSubmit={submit} pending={pending} />}
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="쿠폰 코드">
          <Input value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="WELCOME10" />
        </Field>
        <Field label="쿠폰명">
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="신규가입 할인" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="할인 유형">
          <Select value={form.discountType} onChange={(e) => set("discountType", e.target.value)}>
            <option value="amount">정액 할인 (원)</option>
            <option value="percent">정률 할인 (%)</option>
          </Select>
        </Field>
        <Field label={form.discountType === "percent" ? "할인율 (%)" : "할인 금액 (원)"}>
          <Input
            value={form.discountValue}
            onChange={(e) => set("discountValue", e.target.value)}
            inputMode="numeric"
            placeholder={form.discountType === "percent" ? "10" : "10000"}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="최소 주문 금액">
          <Input value={form.minOrderAmount} onChange={(e) => set("minOrderAmount", e.target.value)} inputMode="numeric" />
        </Field>
        <Field label="최대 할인 금액" hint="정률 할인 상한 (선택)">
          <Input
            value={form.maxDiscountAmount}
            onChange={(e) => set("maxDiscountAmount", e.target.value)}
            inputMode="numeric"
            placeholder="비우면 제한 없음"
          />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="발급 한도">
          <Input value={form.totalQuota} onChange={(e) => set("totalQuota", e.target.value)} inputMode="numeric" placeholder="무제한" />
        </Field>
        <Field label="시작일">
          <Input type="date" value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
        </Field>
        <Field label="종료일">
          <Input type="date" value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} />
        </Field>
      </div>

      <Field label="설명">
        <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} className="min-h-[80px]" />
      </Field>

      <label className="flex items-center gap-2 text-[14px] text-brand-dark cursor-pointer">
        <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 accent-[#0D3473]" />
        활성 상태로 저장
      </label>

      {error && <Notice ok={false}>{error}</Notice>}
    </Modal>
  );
}
