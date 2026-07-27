"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Card, TableShell, Th, Td, EmptyState, Tabs, SearchInput,
  Button, InlineSelect, Modal, ModalFooter, Field, Input, Notice,
} from "@/components/admin/ui";
import { formatKRW, formatDate } from "@/lib/admin-format";
import { setUserRole, adjustCredit } from "../actions";
import { MemberDetailModal } from "@/components/admin/MemberDetailModal";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  creditBalance: number;
  createdAt: string;
  campaignCount: number;
  // 결제현황
  paidAmount: number;
  refundedAmount: number;
  orderCount: number;
  lastPaidAt: string | null;
  chargedAmount: number;
};

const ROLE_TABS = [
  { key: "all", label: "전체" },
  { key: "advertiser", label: "광고주" },
  { key: "supplier", label: "공급자" },
  { key: "admin", label: "관리자" },
];

export function UsersClient({ rows }: { rows: AdminUserRow[] }) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [creditTarget, setCreditTarget] = useState<AdminUserRow | null>(null);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const r of rows) c[r.role] = (c[r.role] ?? 0) + 1;
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (roleFilter !== "all" && r.role !== roleFilter) return false;
      if (!q) return true;
      return r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
    });
  }, [rows, query, roleFilter]);

  const handleRole = (id: string, role: string) => {
    startTransition(async () => {
      const res = await setUserRole(id, role);
      setMsg({ id, text: "error" in res ? res.error : "역할 변경됨", ok: !("error" in res) });
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <Tabs tabs={ROLE_TABS.map((t) => ({ ...t, count: counts[t.key] ?? 0 }))} value={roleFilter} onChange={setRoleFilter} />
        <SearchInput value={query} onChange={setQuery} placeholder="이름 · 이메일 검색" className="md:ml-auto md:w-72" />
      </div>

      <Card>
        {filtered.length ? (
          <TableShell
            head={
              <>
                <Th>회원</Th>
                <Th>역할</Th>
                <Th className="text-right">결제 금액</Th>
                <Th className="text-right">충전 포인트</Th>
                <Th className="text-right">포인트 잔액</Th>
                <Th className="text-center">캠페인</Th>
                <Th>가입일</Th>
                <Th className="text-right">관리</Th>
              </>
            }
          >
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-brand-light/50 transition-colors">
                <Td>
                  {/* 회원명을 누르면 가입정보·사업자등록증·결제내역 상세가 열린다 */}
                  <button
                    onClick={() => setDetailUserId(u.id)}
                    className="text-left font-semibold text-brand-dark hover:text-brand-primary hover:underline"
                  >
                    {u.name}
                  </button>
                  <div className="text-[12.5px] text-brand-muted">{u.email}</div>
                  {msg?.id === u.id && <Notice ok={msg.ok}>{msg.text}</Notice>}
                </Td>
                <Td>
                  <InlineSelect value={u.role} disabled={pending} onChange={(e) => handleRole(u.id, e.target.value)}>
                    <option value="advertiser">광고주</option>
                    <option value="supplier">공급자</option>
                    <option value="admin">관리자</option>
                  </InlineSelect>
                </Td>
                <Td className="text-right tabular-nums">
                  <div className="font-semibold text-brand-dark">{formatKRW(u.paidAmount)}</div>
                  <div className="text-[11.5px] text-brand-muted">
                    {u.orderCount}건
                    {u.refundedAmount > 0 && ` · 환불 ${formatKRW(u.refundedAmount)}`}
                  </div>
                  {u.lastPaidAt && (
                    <div className="text-[11.5px] text-brand-muted">최근 {formatDate(u.lastPaidAt)}</div>
                  )}
                </Td>
                <Td className="text-right tabular-nums text-brand-sub">{formatKRW(u.chargedAmount)}</Td>
                <Td className="text-right tabular-nums font-semibold text-brand-dark">{formatKRW(u.creditBalance)}</Td>
                <Td className="text-center tabular-nums">{u.campaignCount}</Td>
                <Td className="text-brand-sub whitespace-nowrap">{formatDate(u.createdAt)}</Td>
                <Td className="text-right">
                  <div className="flex gap-1.5 justify-end">
                    <Button size="sm" variant="secondary" onClick={() => setDetailUserId(u.id)}>
                      상세
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setCreditTarget(u);
                        setMsg(null);
                      }}
                    >
                      포인트 조정
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </TableShell>
        ) : (
          <EmptyState message="조건에 맞는 회원이 없습니다." />
        )}
      </Card>

      {detailUserId && <MemberDetailModal userId={detailUserId} onClose={() => setDetailUserId(null)} />}

      {creditTarget && (
        <CreditModal
          user={creditTarget}
          onClose={() => setCreditTarget(null)}
          onDone={(text, ok) => {
            setMsg({ id: creditTarget.id, text, ok });
            setCreditTarget(null);
          }}
        />
      )}
    </div>
  );
}

function CreditModal({
  user,
  onClose,
  onDone,
}: {
  user: AdminUserRow;
  onClose: () => void;
  onDone: (t: string, ok: boolean) => void;
}) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [sign, setSign] = useState<1 | -1>(1);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const n = Number(amount.replace(/,/g, ""));
    if (!Number.isFinite(n) || n <= 0) {
      setError("올바른 금액을 입력하세요.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await adjustCredit(user.id, sign * n, reason);
      if ("error" in res) setError(res.error);
      else onDone(`포인트 ${sign > 0 ? "충전" : "차감"} 완료`, true);
    });
  };

  return (
    <Modal
      title="포인트 조정"
      description={`${user.name} · 현재 ${formatKRW(user.creditBalance)}`}
      onClose={onClose}
      footer={<ModalFooter onClose={onClose} onSubmit={submit} pending={pending} submitLabel="적용" />}
    >
      <div className="flex gap-2">
        <button
          onClick={() => setSign(1)}
          className={`flex-1 py-2.5 rounded-xl text-[14px] font-semibold border transition-all ${
            sign === 1 ? "bg-brand-success-bg border-brand-success text-brand-success" : "border-brand-border text-brand-sub"
          }`}
        >
          + 충전
        </button>
        <button
          onClick={() => setSign(-1)}
          className={`flex-1 py-2.5 rounded-xl text-[14px] font-semibold border transition-all ${
            sign === -1 ? "bg-brand-error-bg border-brand-error text-brand-error" : "border-brand-border text-brand-sub"
          }`}
        >
          − 차감
        </button>
      </div>

      <Field label="금액 (원)">
        <Input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="numeric" placeholder="50000" />
      </Field>

      <Field label="사유">
        <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="예: 프로모션 지급" />
      </Field>

      {error && <Notice ok={false}>{error}</Notice>}
    </Modal>
  );
}
