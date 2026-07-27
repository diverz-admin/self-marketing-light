"use client";

import { useMemo, useState, useTransition } from "react";
import { Card, Badge, TableShell, Th, Td, EmptyState } from "@/components/admin/ui";
import { formatKRW, formatDateTime, paymentStatusMeta, type BadgeTone } from "@/lib/admin-format";
import { setOrderStatus } from "../actions";

export type AdminOrderRow = {
  id: string;
  amount: number;
  method: string;
  pgTxId: string;
  status: string;
  createdAt: string;
  userName: string;
  userEmail: string;
  productTitle: string;
};

const TABS = [
  { key: "all", label: "전체" },
  { key: "paid", label: "결제완료" },
  { key: "refunded", label: "환불" },
  { key: "partial_refund", label: "부분환불" },
];

const methodLabel: Record<string, string> = {
  card: "카드",
  bank_transfer: "계좌이체",
  virtual_account: "가상계좌",
  credit: "크레딧",
};

export function OrdersClient({ rows }: { rows: AdminOrderRow[] }) {
  const [tab, setTab] = useState("all");
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  const filtered = useMemo(() => (tab === "all" ? rows : rows.filter((r) => r.status === tab)), [rows, tab]);

  const change = (id: string, status: string) => {
    setBusyId(id);
    startTransition(async () => {
      const res = await setOrderStatus(id, status);
      setMsg({ id, text: "error" in res ? res.error : "처리됨", ok: !("error" in res) });
      setBusyId(null);
    });
  };

  return (
    <div>
      <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3.5 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all border ${
              tab === t.key ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-brand-sub border-brand-border hover:bg-brand-light"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        {filtered.length ? (
          <TableShell
            head={
              <>
                <Th>주문자</Th>
                <Th>상품</Th>
                <Th>결제수단</Th>
                <Th className="text-right">금액</Th>
                <Th>상태</Th>
                <Th>일시</Th>
                <Th className="text-right">처리</Th>
              </>
            }
          >
            {filtered.map((o) => {
              const meta = paymentStatusMeta[o.status] ?? { label: o.status, tone: "gray" as BadgeTone };
              const rowBusy = pending && busyId === o.id;
              return (
                <tr key={o.id} className="hover:bg-brand-light/50 transition-colors">
                  <Td>
                    <div className="font-semibold text-brand-dark">{o.userName}</div>
                    <div className="text-[12px] text-brand-muted">{o.userEmail}</div>
                    {msg?.id === o.id && (
                      <div className={`text-[11.5px] mt-0.5 ${msg.ok ? "text-brand-success" : "text-brand-error"}`}>{msg.text}</div>
                    )}
                  </Td>
                  <Td>{o.productTitle}</Td>
                  <Td className="text-brand-sub">
                    {methodLabel[o.method] ?? (o.method || "-")}
                    {o.pgTxId && <div className="text-[11px] text-brand-muted">{o.pgTxId}</div>}
                  </Td>
                  <Td className="text-right tabular-nums font-semibold text-brand-dark">{formatKRW(o.amount)}</Td>
                  <Td><Badge tone={meta.tone}>{meta.label}</Badge></Td>
                  <Td className="text-brand-sub whitespace-nowrap">{formatDateTime(o.createdAt)}</Td>
                  <Td className="text-right">
                    {o.status === "paid" ? (
                      <button
                        onClick={() => change(o.id, "refunded")}
                        disabled={rowBusy}
                        className="px-3 py-1.5 rounded-lg bg-brand-error-bg text-brand-error text-[12.5px] font-semibold hover:brightness-95 disabled:opacity-50"
                      >
                        환불 처리
                      </button>
                    ) : (
                      <button
                        onClick={() => change(o.id, "paid")}
                        disabled={rowBusy}
                        className="px-3 py-1.5 rounded-lg bg-brand-light text-brand-sub text-[12.5px] font-semibold hover:bg-brand-primary-50 disabled:opacity-50"
                      >
                        결제완료로
                      </button>
                    )}
                  </Td>
                </tr>
              );
            })}
          </TableShell>
        ) : (
          <EmptyState message="해당 상태의 주문이 없습니다." />
        )}
      </Card>
    </div>
  );
}
