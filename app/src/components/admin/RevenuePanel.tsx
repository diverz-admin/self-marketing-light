"use client";

import { useState } from "react";
import { Card, SectionHeader, Tabs, EmptyState, Button } from "@/components/admin/ui";
import { RevenueAreaChart, RevenueBarChart } from "@/components/admin/AdminCharts";
import { ChartTableView, type ChartTableRow } from "@/components/admin/ChartTableView";
import { formatKRW } from "@/lib/admin-format";

export type DailyPoint = { date: string; amount: number };
export type MonthlyPoint = { label: string; amount: number };

/** 일별(최근 14일) / 월별(최근 12개월) 매출을 전환해서 본다. */
export function RevenuePanel({
  daily,
  monthly,
  title = "매출 추이",
}: {
  daily: DailyPoint[];
  monthly: MonthlyPoint[];
  title?: string;
}) {
  const [view, setView] = useState<"daily" | "monthly">("daily");
  const [asTable, setAsTable] = useState(false);

  const dailyTotal = daily.reduce((s, d) => s + d.amount, 0);

  // 이번 달 / 지난 달 (배열 마지막이 이번 달)
  const thisMonth = monthly[monthly.length - 1]?.amount ?? 0;
  const lastMonth = monthly[monthly.length - 2]?.amount ?? 0;
  const monthDelta = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null;

  const hasMonthly = monthly.some((m) => m.amount > 0);

  // 차트와 같은 값을 읽을 수 있는 표 뷰 (툴팁이 유일한 열람 수단이 되지 않도록)
  const tableRows: ChartTableRow[] =
    view === "daily"
      ? daily.map((d) => ({ period: d.date, value: formatKRW(d.amount) }))
      : monthly.map((m, i) => {
          const [y, mm] = m.label.split("-");
          return {
            period: `${y}년 ${Number(mm)}월`,
            value: formatKRW(m.amount),
            note: i === monthly.length - 1 ? "진행 중" : undefined,
          };
        });

  return (
    <Card>
      <SectionHeader
        title={title}
        right={
          <div className="flex items-center gap-2">
            <Tabs
              tabs={[
                { key: "daily", label: "일별" },
                { key: "monthly", label: "월별" },
              ]}
              value={view}
              onChange={(k) => setView(k as "daily" | "monthly")}
            />
            <Button
              size="sm"
              variant={asTable ? "primary" : "ghost"}
              aria-pressed={asTable}
              onClick={() => setAsTable((v) => !v)}
            >
              표
            </Button>
          </div>
        }
      />

      <div className="px-5 pt-4 flex flex-wrap items-baseline gap-x-6 gap-y-1">
        {view === "daily" ? (
          <>
            <div>
              <span className="text-[12.5px] text-brand-sub">최근 14일 합계 </span>
              <span className="text-[20px] font-extrabold text-brand-dark font-mono tabular-nums tracking-[-0.02em]">{formatKRW(dailyTotal)}</span>
            </div>
            <span className="text-[12px] text-brand-muted">결제완료 기준</span>
          </>
        ) : (
          <>
            <div>
              <span className="text-[12.5px] text-brand-sub">이번 달 </span>
              <span className="text-[20px] font-extrabold text-brand-dark font-mono tabular-nums tracking-[-0.02em]">{formatKRW(thisMonth)}</span>
            </div>
            <div>
              <span className="text-[12.5px] text-brand-sub">지난 달 </span>
              <span className="text-[15px] font-semibold text-brand-text font-mono tabular-nums tracking-[-0.02em]">{formatKRW(lastMonth)}</span>
            </div>
            {monthDelta !== null && (
              <span
                className={`text-[13px] font-bold font-mono tabular-nums tracking-[-0.02em] ${
                  monthDelta > 0 ? "text-brand-success" : monthDelta < 0 ? "text-brand-error" : "text-brand-muted"
                }`}
              >
                {monthDelta > 0 ? "▲" : monthDelta < 0 ? "▼" : "-"} {Math.abs(monthDelta)}%
              </span>
            )}
            <span className="text-[12px] text-brand-muted">최근 12개월 · 이번 달은 진행 중</span>
          </>
        )}
      </div>

      <div className={asTable ? "" : "p-4"}>
        {asTable ? (
          <ChartTableView periodLabel={view === "daily" ? "날짜" : "월"} valueLabel="매출" rows={tableRows} />
        ) : view === "daily" ? (
          <RevenueAreaChart data={daily} />
        ) : hasMonthly ? (
          <RevenueBarChart data={monthly} />
        ) : (
          <EmptyState message="월별 매출 데이터가 없습니다." />
        )}
      </div>
    </Card>
  );
}
