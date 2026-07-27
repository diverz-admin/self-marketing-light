"use client";

import { useState } from "react";
import { Card, SectionHeader, Tabs, EmptyState, Button } from "@/components/admin/ui";
import { SignupAreaChart, SignupBarChart } from "@/components/admin/AdminCharts";
import { ChartTableView, type ChartTableRow } from "@/components/admin/ChartTableView";
import { formatNumber } from "@/lib/admin-format";

export type SignupDailyPoint = { date: string; count: number };
export type SignupMonthlyPoint = { label: string; count: number };

export type SignupSummary = {
  today: number;
  yesterday: number;
  thisMonth: number;
  lastMonth: number;
  total: number;
};

/** 신규 가입 현황 — 오늘/이번 달/전체 + 일별(14일)·월별(12개월) 추이 */
export function SignupPanel({
  summary,
  daily,
  monthly,
}: {
  summary: SignupSummary;
  daily: SignupDailyPoint[];
  monthly: SignupMonthlyPoint[];
}) {
  const [view, setView] = useState<"daily" | "monthly">("daily");
  const [asTable, setAsTable] = useState(false);

  const dayDelta = summary.today - summary.yesterday;
  const monthDelta =
    summary.lastMonth > 0
      ? Math.round(((summary.thisMonth - summary.lastMonth) / summary.lastMonth) * 100)
      : null;

  const hasMonthly = monthly.some((m) => m.count > 0);

  // 차트와 같은 값을 읽을 수 있는 표 뷰 (툴팁이 유일한 열람 수단이 되지 않도록)
  const tableRows: ChartTableRow[] =
    view === "daily"
      ? daily.map((d) => ({ period: d.date, value: `${formatNumber(d.count)}명` }))
      : monthly.map((m, i) => {
          const [y, mm] = m.label.split("-");
          return {
            period: `${y}년 ${Number(mm)}월`,
            value: `${formatNumber(m.count)}명`,
            note: i === monthly.length - 1 ? "진행 중" : undefined,
          };
        });

  return (
    <Card>
      <SectionHeader
        title="신규 회원 가입"
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

      <div className="grid grid-cols-3 divide-x divide-brand-border border-b border-brand-border">
        <Metric
          label="오늘 가입"
          value={summary.today}
          sub={
            <span
              className={
                dayDelta > 0 ? "text-brand-success" : dayDelta < 0 ? "text-brand-error" : "text-brand-muted"
              }
            >
              {dayDelta > 0 ? "▲" : dayDelta < 0 ? "▼" : "-"} 어제 {formatNumber(summary.yesterday)}명
            </span>
          }
          accent
        />
        <Metric
          label="이번 달 가입"
          value={summary.thisMonth}
          sub={
            monthDelta !== null ? (
              <span
                className={
                  monthDelta > 0 ? "text-brand-success" : monthDelta < 0 ? "text-brand-error" : "text-brand-muted"
                }
              >
                {monthDelta > 0 ? "▲" : monthDelta < 0 ? "▼" : "-"} {Math.abs(monthDelta)}% · 지난달{" "}
                {formatNumber(summary.lastMonth)}명
              </span>
            ) : (
              <span className="text-brand-muted">지난달 {formatNumber(summary.lastMonth)}명</span>
            )
          }
        />
        <Metric label="전체 회원" value={summary.total} sub={<span className="text-brand-muted">누적 가입자</span>} />
      </div>

      <div className={asTable ? "" : "p-4"}>
        {asTable ? (
          <ChartTableView periodLabel={view === "daily" ? "날짜" : "월"} valueLabel="신규 가입" rows={tableRows} />
        ) : view === "daily" ? (
          <SignupAreaChart data={daily} />
        ) : hasMonthly ? (
          <SignupBarChart data={monthly} />
        ) : (
          <EmptyState message="월별 가입 데이터가 없습니다." />
        )}
      </div>
    </Card>
  );
}

function Metric({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number;
  sub?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="px-5 py-4">
      <p className="text-[12.5px] font-semibold text-brand-sub">{label}</p>
      <p
        // 큰 단독 숫자는 비례 폰트 — tabular-nums는 표·축처럼 세로 정렬이 필요한 곳에만
        className={`text-[24px] md:text-[26px] font-extrabold mt-1 leading-none ${
          accent ? "text-[#5B3FB0]" : "text-brand-dark"
        }`}
      >
        {formatNumber(value)}
        <span className="text-[13px] font-bold text-brand-muted ml-0.5">명</span>
      </p>
      {sub && <p className="text-[12px] mt-1.5 font-medium">{sub}</p>}
    </div>
  );
}
