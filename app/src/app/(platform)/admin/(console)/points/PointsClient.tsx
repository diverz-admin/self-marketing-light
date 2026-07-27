"use client";

import React, { useMemo, useState, useTransition } from "react";
import {
  Card, TableShell, Th, Td, EmptyState, Badge, Tabs, SearchInput,
  Button, Modal, ModalFooter, Field, Input, Select, Notice,
} from "@/components/admin/ui";
import {
  formatKRW, formatDateTime, pointChargeStatusMeta, chargeMethodLabel, receiptTypeLabel,
} from "@/lib/admin-format";
import { setPointChargeStatus, createPointCharge } from "../actions";
import { MemberDetailModal } from "@/components/admin/MemberDetailModal";

export type PointChargeRow = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  bonusAmount: number;
  method: string;
  depositorName: string | null;
  receiptType: string | null;
  status: string;
  memo: string | null;
  createdAt: string;
  processedAt: string | null;
};

export type UserOption = { id: string; name: string; email: string; creditBalance: number };

const STATUS_TABS = [
  { key: "all", label: "전체" },
  { key: "requested", label: "입금대기" },
  { key: "approved", label: "충전완료" },
  { key: "canceled", label: "취소" },
];

/** KST 기준 그룹 키 — 일별 "2026-07-22", 월별 "2026-07" */
const kstDate = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date(iso));

const groupLabel = (key: string, period: "day" | "month") => {
  const [y, m, d] = key.split("-");
  return period === "day" ? `${y}. ${m}. ${d}.` : `${y}년 ${Number(m)}월`;
};

type Group = { key: string; label: string; rows: PointChargeRow[]; total: number; waiting: number };

export function PointsClient({ rows, users }: { rows: PointChargeRow[]; users: UserOption[] }) {
  const [status, setStatus] = useState("requested");
  const [period, setPeriod] = useState<"day" | "month">("month");
  // "" = 전체 기간. 기본은 가장 최근 기간만 보여 목록이 끝없이 늘어나지 않게 한다.
  const [periodKey, setPeriodKey] = useState<string>("");
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const r of rows) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (!q) return true;
      return (
        r.userName.toLowerCase().includes(q) ||
        r.userEmail.toLowerCase().includes(q) ||
        (r.depositorName ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, status, query]);

  /**
   * 처리해야 할 입금대기는 기간과 무관하게 맨 위 한 덩어리로 모으고,
   * 나머지는 일별/월별로 묶어 최신 기간부터 보여준다.
   * (건수가 늘어나도 언제 것인지 바로 구분되도록)
   */
  const { pendingRows, groups } = useMemo(() => {
    const waiting: PointChargeRow[] = [];
    const rest: PointChargeRow[] = [];
    for (const r of filtered) (r.status === "requested" ? waiting : rest).push(r);

    const map = new Map<string, PointChargeRow[]>();
    for (const r of rest) {
      const day = kstDate(r.createdAt);
      const key = period === "day" ? day : day.slice(0, 7);
      const list = map.get(key);
      if (list) list.push(r);
      else map.set(key, [r]);
    }

    const built: Group[] = [...map.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1)) // 최신 기간 먼저
      .map(([key, list]) => ({
        key,
        label: groupLabel(key, period),
        rows: list,
        total: list.reduce((s, r) => s + r.amount + r.bonusAmount, 0),
        waiting: 0,
      }));

    return { pendingRows: waiting, groups: built };
  }, [filtered, period]);

  // 드롭다운에 쓸 기간 목록 (건수 포함)
  const periodOptions = useMemo(
    () => groups.map((g) => ({ key: g.key, label: g.label, count: g.rows.length })),
    [groups],
  );

  // 선택된 기간이 사라지면(검색/상태 변경 등) 자동으로 최신 기간으로 되돌린다
  const activeKey = periodKey && periodOptions.some((o) => o.key === periodKey) ? periodKey : "";
  const visibleGroups =
    activeKey === "" ? groups.slice(0, 1) : groups.filter((g) => g.key === activeKey);
  const hiddenCount = groups.length - visibleGroups.length;

  const pendingTotal = pendingRows.reduce((s, r) => s + r.amount, 0);
  const hasAny = pendingRows.length > 0 || visibleGroups.length > 0;

  const changeStatus = (id: string, next: string) => {
    startTransition(async () => {
      const res = await setPointChargeStatus(id, next);
      setMsg({ id, text: "error" in res ? res.error : "처리 완료", ok: !("error" in res) });
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <Tabs
          tabs={STATUS_TABS.map((t) => ({ ...t, count: counts[t.key] ?? 0 }))}
          value={status}
          onChange={setStatus}
        />
        <div className="md:ml-auto flex gap-2">
          <SearchInput value={query} onChange={setQuery} placeholder="회원 · 입금자명 검색" className="md:w-64" />
          <Button onClick={() => setCreating(true)}>수기 충전 등록</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-[13px] text-brand-sub">기간</span>
        {/* Select는 w-full이라 폭은 래퍼로 준다 */}
        <div className="w-[104px]">
          <Select
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value as "day" | "month");
              setPeriodKey(""); // 단위가 바뀌면 최신 기간부터 다시
            }}
            className="py-2"
          >
            <option value="day">일별</option>
            <option value="month">월별</option>
          </Select>
        </div>
        <div className="w-[200px]">
          <Select
            value={activeKey}
            onChange={(e) => setPeriodKey(e.target.value)}
            className="py-2"
            disabled={!periodOptions.length}
          >
            <option value="">
              {periodOptions.length ? `최근 ${periodOptions[0].label}` : "기간 없음"}
            </option>
            {periodOptions.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label} ({o.count}건)
              </option>
            ))}
          </Select>
        </div>
        {hiddenCount > 0 && (
          <span className="text-[12.5px] text-brand-muted">
            다른 기간 {hiddenCount}개는 위 드롭다운에서 선택
          </span>
        )}
      </div>

      <Card>
        {hasAny ? (
          <TableShell
            head={
              <>
                <Th>회원</Th>
                <Th>결제수단</Th>
                <Th className="text-right">충전 금액</Th>
                <Th className="text-right">보너스</Th>
                <Th>신청일</Th>
                <Th>상태</Th>
                <Th className="text-right">처리</Th>
              </>
            }
          >
            {/* 처리 대기 — 기간과 무관하게 항상 최상단 */}
            {pendingRows.length > 0 && (
              <>
                <tr className="bg-brand-warning-bg/60">
                  <td colSpan={7} className="px-4 py-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-bold text-brand-warning">입금대기</span>
                      <span className="text-[12.5px] text-brand-sub">{pendingRows.length}건</span>
                      <span className="text-[12.5px] text-brand-sub ml-auto tabular-nums">
                        합계 {formatKRW(pendingTotal)}
                      </span>
                    </div>
                  </td>
                </tr>
                {pendingRows.map((r) => (
                  <ChargeRow
                    key={r.id}
                    row={r}
                    msg={msg}
                    pending={pending}
                    onChange={changeStatus}
                    onSelectMember={setDetailUserId}
                  />
                ))}
              </>
            )}

            {/* 선택한 기간 하나만 표시 — 데이터가 쌓여도 목록 길이가 일정하게 유지된다 */}
            {visibleGroups.map((g) => (
              <React.Fragment key={g.key}>
                <tr className="bg-brand-light">
                  <td colSpan={7} className="px-4 py-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-bold text-brand-dark">{g.label}</span>
                      <span className="text-[12.5px] text-brand-sub">{g.rows.length}건</span>
                      <span className="text-[12.5px] text-brand-sub ml-auto tabular-nums">
                        합계 {formatKRW(g.total)}
                      </span>
                    </div>
                  </td>
                </tr>
                {g.rows.map((r) => (
                  <ChargeRow key={r.id} row={r} msg={msg} pending={pending} onChange={changeStatus} onSelectMember={setDetailUserId} />
                ))}
              </React.Fragment>
            ))}
          </TableShell>
        ) : (
          <EmptyState message="해당 조건의 충전 내역이 없습니다." />
        )}
      </Card>

      {detailUserId && <MemberDetailModal userId={detailUserId} onClose={() => setDetailUserId(null)} />}

      {creating && <CreateChargeModal users={users} onClose={() => setCreating(false)} />}
    </div>
  );
}

function ChargeRow({
  row: r,
  msg,
  pending,
  onChange,
  onSelectMember,
}: {
  row: PointChargeRow;
  msg: { id: string; text: string; ok: boolean } | null;
  pending: boolean;
  onChange: (id: string, next: string) => void;
  onSelectMember: (userId: string) => void;
}) {
  const meta = pointChargeStatusMeta[r.status] ?? { label: r.status, tone: "gray" as const };
  return (
    <tr className="hover:bg-brand-light/50 transition-colors">
      <Td>
        {/* 회원명을 누르면 회원관리와 같은 상세 모달이 열린다 */}
        <button
          onClick={() => onSelectMember(r.userId)}
          className="text-left font-semibold text-brand-dark hover:text-brand-primary hover:underline"
        >
          {r.userName}
        </button>
        <div className="text-[12.5px] text-brand-muted">{r.userEmail}</div>
        {msg?.id === r.id && <Notice ok={msg.ok}>{msg.text}</Notice>}
      </Td>
      <Td>
        <div>{chargeMethodLabel[r.method] ?? r.method}</div>
        {r.depositorName && <div className="text-[12.5px] text-brand-muted">입금자 {r.depositorName}</div>}
        {r.receiptType && (
          <div className="text-[12px] text-brand-muted">{receiptTypeLabel[r.receiptType] ?? r.receiptType}</div>
        )}
      </Td>
      <Td className="text-right tabular-nums font-semibold text-brand-dark">{formatKRW(r.amount)}</Td>
      <Td className="text-right tabular-nums text-brand-sub">
        {r.bonusAmount > 0 ? `+${formatKRW(r.bonusAmount)}` : "-"}
      </Td>
      <Td className="text-brand-sub whitespace-nowrap">{formatDateTime(r.createdAt)}</Td>
      <Td>
        <Badge tone={meta.tone}>{meta.label}</Badge>
      </Td>
      <Td className="text-right">
        {r.status === "requested" ? (
          <div className="flex gap-1.5 justify-end">
            <Button size="sm" disabled={pending} onClick={() => onChange(r.id, "approved")}>
              승인
            </Button>
            <Button size="sm" variant="danger" disabled={pending} onClick={() => onChange(r.id, "canceled")}>
              취소
            </Button>
          </div>
        ) : r.status === "approved" ? (
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => onChange(r.id, "canceled")}>
            승인취소
          </Button>
        ) : (
          <Button size="sm" variant="secondary" disabled={pending} onClick={() => onChange(r.id, "approved")}>
            승인
          </Button>
        )}
      </Td>
    </tr>
  );
}

function CreateChargeModal({ users, onClose }: { users: UserOption[]; onClose: () => void }) {
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [bonusAmount, setBonusAmount] = useState("");
  const [method, setMethod] = useState("bank_transfer");
  const [depositorName, setDepositorName] = useState("");
  const [receiptType, setReceiptType] = useState("none");
  const [memo, setMemo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await createPointCharge({ userId, amount, bonusAmount, method, depositorName, receiptType, memo });
      if ("error" in res) setError(res.error);
      else onClose();
    });
  };

  return (
    <Modal
      title="수기 충전 등록"
      description="입금대기 상태로 등록됩니다. 승인 시 포인트가 지급됩니다."
      onClose={onClose}
      footer={<ModalFooter onClose={onClose} onSubmit={submit} pending={pending} submitLabel="등록" />}
    >
      <Field label="회원">
        <Select value={userId} onChange={(e) => setUserId(e.target.value)}>
          <option value="">회원을 선택하세요</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email}) · 잔액 {u.creditBalance.toLocaleString("ko-KR")}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="충전 금액 (원)">
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="numeric" placeholder="500000" />
        </Field>
        <Field label="보너스 포인트">
          <Input value={bonusAmount} onChange={(e) => setBonusAmount(e.target.value)} inputMode="numeric" placeholder="50000" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="결제수단">
          <Select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="bank_transfer">무통장입금</option>
            <option value="card">카드결제</option>
            <option value="virtual_account">가상계좌</option>
          </Select>
        </Field>
        <Field label="증빙">
          <Select value={receiptType} onChange={(e) => setReceiptType(e.target.value)}>
            <option value="none">미발행</option>
            <option value="tax_invoice">세금계산서</option>
            <option value="cash_receipt">현금영수증</option>
          </Select>
        </Field>
      </div>

      <Field label="입금자명">
        <Input value={depositorName} onChange={(e) => setDepositorName(e.target.value)} placeholder="홍길동" />
      </Field>

      <Field label="메모">
        <Input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="예: 프로모션 충전" />
      </Field>

      {error && <Notice ok={false}>{error}</Notice>}
    </Modal>
  );
}
