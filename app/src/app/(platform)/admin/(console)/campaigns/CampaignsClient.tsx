"use client";

import { useMemo, useState, useTransition } from "react";
import { Card, Badge, TableShell, Th, Td, EmptyState } from "@/components/admin/ui";
import { formatKRW, formatDate, campaignStatusMeta, type BadgeTone } from "@/lib/admin-format";
import { setCampaignStatus } from "../actions";

export type AdminCampaignRow = {
  id: string;
  status: string;
  keyword: string;
  region: string;
  totalQty: number;
  dailyQty: number | null;
  delivered: number;
  startDate: string | null;
  endDate: string | null;
  quotedAmount: number;
  paidAmount: number;
  createdAt: string;
  userName: string;
  userEmail: string;
  productTitle: string;
  businessName: string;
};

const TABS = [
  { key: "all", label: "전체" },
  { key: "submitted", label: "승인대기" },
  { key: "reviewing", label: "검수중" },
  { key: "running", label: "진행중" },
  { key: "completed", label: "완료" },
  { key: "canceled", label: "취소/환불" },
];

const ALL_STATUSES = ["draft", "submitted", "reviewing", "scheduled", "running", "paused", "completed", "canceled", "refunded"];

export function CampaignsClient({ rows }: { rows: AdminCampaignRow[] }) {
  const [tab, setTab] = useState("all");
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const r of rows) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    if (tab === "all") return rows;
    if (tab === "canceled") return rows.filter((r) => r.status === "canceled" || r.status === "refunded");
    return rows.filter((r) => r.status === tab);
  }, [rows, tab]);

  const change = (id: string, status: string) => {
    setBusyId(id);
    startTransition(async () => {
      const res = await setCampaignStatus(id, status);
      setMsg({ id, text: "error" in res ? res.error : "상태 변경됨", ok: !("error" in res) });
      setBusyId(null);
    });
  };

  const tabCount = (key: string) => {
    if (key === "all") return counts.all ?? 0;
    if (key === "canceled") return (counts.canceled ?? 0) + (counts.refunded ?? 0);
    return counts[key] ?? 0;
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
            <span className={`ml-1.5 ${tab === t.key ? "text-white/70" : "text-brand-muted"}`}>{tabCount(t.key)}</span>
          </button>
        ))}
      </div>

      <Card>
        {filtered.length ? (
          <TableShell
            head={
              <>
                <Th>광고주 / 사업장</Th>
                <Th>상품 · 키워드</Th>
                <Th>진행률</Th>
                <Th className="text-right">금액</Th>
                <Th>상태</Th>
                <Th className="text-right">처리</Th>
              </>
            }
          >
            {filtered.map((c) => {
              const meta = campaignStatusMeta[c.status] ?? { label: c.status, tone: "gray" as BadgeTone };
              const pct = c.totalQty > 0 ? Math.min(100, Math.round((c.delivered / c.totalQty) * 100)) : 0;
              const isPendingApproval = c.status === "submitted" || c.status === "reviewing";
              const rowBusy = pending && busyId === c.id;
              return (
                <tr key={c.id} className="hover:bg-brand-light/50 transition-colors align-top">
                  <Td>
                    <div className="font-semibold text-brand-dark">{c.userName}</div>
                    <div className="text-[12.5px] text-brand-muted">{c.businessName}</div>
                    {msg?.id === c.id && (
                      <div className={`text-[11.5px] mt-0.5 ${msg.ok ? "text-brand-success" : "text-brand-error"}`}>{msg.text}</div>
                    )}
                  </Td>
                  <Td>
                    <div className="text-brand-dark">{c.productTitle}</div>
                    <div className="text-[12.5px] text-brand-muted">
                      {c.keyword ? `“${c.keyword}”` : "-"}{c.region ? ` · ${c.region}` : ""}
                    </div>
                  </Td>
                  <Td className="min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-brand-border overflow-hidden min-w-[70px]">
                        <div className="h-full rounded-full bg-brand-primary" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[12px] text-brand-sub tabular-nums whitespace-nowrap">{c.delivered}/{c.totalQty}</span>
                    </div>
                  </Td>
                  <Td className="text-right">
                    <div className="tabular-nums font-semibold text-brand-dark">{formatKRW(c.quotedAmount)}</div>
                    <div className="text-[11.5px] text-brand-muted">결제 {formatKRW(c.paidAmount)}</div>
                  </Td>
                  <Td><Badge tone={meta.tone}>{meta.label}</Badge></Td>
                  <Td>
                    <div className="flex items-center justify-end gap-1.5">
                      {isPendingApproval && (
                        <>
                          <button
                            onClick={() => change(c.id, "scheduled")}
                            disabled={rowBusy}
                            className="px-2.5 py-1.5 rounded-lg bg-brand-success-bg text-brand-success text-[12.5px] font-semibold hover:brightness-95 disabled:opacity-50"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => change(c.id, "canceled")}
                            disabled={rowBusy}
                            className="px-2.5 py-1.5 rounded-lg bg-brand-error-bg text-brand-error text-[12.5px] font-semibold hover:brightness-95 disabled:opacity-50"
                          >
                            반려
                          </button>
                        </>
                      )}
                      <select
                        value={c.status}
                        disabled={rowBusy}
                        onChange={(e) => change(c.id, e.target.value)}
                        className="pl-2 pr-7 py-1.5 rounded-lg border border-brand-border bg-white text-[12.5px] font-medium text-brand-dark focus:outline-none focus:border-brand-primary cursor-pointer disabled:opacity-50"
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s}>{campaignStatusMeta[s]?.label ?? s}</option>
                        ))}
                      </select>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </TableShell>
        ) : (
          <EmptyState message="해당 상태의 캠페인이 없습니다." />
        )}
      </Card>
    </div>
  );
}
