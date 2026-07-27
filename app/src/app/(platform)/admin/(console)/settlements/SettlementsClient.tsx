"use client";

import { useState, useTransition } from "react";
import { Card, Badge, TableShell, Th, Td, EmptyState } from "@/components/admin/ui";
import { formatKRW, settlementStatusMeta, type BadgeTone } from "@/lib/admin-format";
import { setSettlementStatus } from "../actions";

export type AdminSettlementRow = {
  id: string;
  period: string;
  amount: number;
  status: string;
  supplierName: string;
  channelType: string;
};

const channelLabel: Record<string, string> = {
  naver_blog: "네이버 블로그",
  instagram: "인스타그램",
  youtube: "유튜브",
  cafe: "카페",
};

const STATUSES = ["pending", "processing", "completed"];

export function SettlementsClient({ rows }: { rows: AdminSettlementRow[] }) {
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  const change = (id: string, status: string) => {
    setBusyId(id);
    startTransition(async () => {
      const res = await setSettlementStatus(id, status);
      setMsg({ id, text: "error" in res ? res.error : "변경됨", ok: !("error" in res) });
      setBusyId(null);
    });
  };

  if (!rows.length) return <Card><EmptyState message="정산 내역이 없습니다." /></Card>;

  return (
    <Card>
      <TableShell
        head={
          <>
            <Th>공급자</Th>
            <Th>채널</Th>
            <Th>정산 기간</Th>
            <Th className="text-right">정산 금액</Th>
            <Th>상태</Th>
            <Th className="text-right">처리</Th>
          </>
        }
      >
        {rows.map((r) => {
          const meta = settlementStatusMeta[r.status] ?? { label: r.status, tone: "gray" as BadgeTone };
          const rowBusy = pending && busyId === r.id;
          return (
            <tr key={r.id} className="hover:bg-brand-light/50 transition-colors">
              <Td>
                <div className="font-semibold text-brand-dark">{r.supplierName}</div>
                {msg?.id === r.id && (
                  <div className={`text-[11.5px] mt-0.5 ${msg.ok ? "text-brand-success" : "text-brand-error"}`}>{msg.text}</div>
                )}
              </Td>
              <Td className="text-brand-sub">{channelLabel[r.channelType] ?? (r.channelType || "-")}</Td>
              <Td className="tabular-nums text-brand-sub">{r.period}</Td>
              <Td className="text-right tabular-nums font-semibold text-brand-dark">{formatKRW(r.amount)}</Td>
              <Td><Badge tone={meta.tone}>{meta.label}</Badge></Td>
              <Td className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  {r.status !== "completed" && (
                    <button
                      onClick={() => change(r.id, "completed")}
                      disabled={rowBusy}
                      className="px-2.5 py-1.5 rounded-lg bg-brand-success-bg text-brand-success text-[12.5px] font-semibold hover:brightness-95 disabled:opacity-50"
                    >
                      정산완료
                    </button>
                  )}
                  <select
                    value={r.status}
                    disabled={rowBusy}
                    onChange={(e) => change(r.id, e.target.value)}
                    className="pl-2 pr-7 py-1.5 rounded-lg border border-brand-border bg-white text-[12.5px] font-medium text-brand-dark focus:outline-none focus:border-brand-primary cursor-pointer disabled:opacity-50"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{settlementStatusMeta[s]?.label ?? s}</option>
                    ))}
                  </select>
                </div>
              </Td>
            </tr>
          );
        })}
      </TableShell>
    </Card>
  );
}
