"use client";

import { useState } from "react";
import { Card, SectionHeader, Tabs, Button } from "@/components/admin/ui";
import { CumulativeAreaChart } from "@/components/admin/AdminCharts";
import { ChartTableView, type ChartTableRow } from "@/components/admin/ChartTableView";
import { formatNumber } from "@/lib/admin-format";

/** count = 해당 시점까지의 누적 회원수, added = 그 구간의 신규 가입수 */
export type CumulativePoint = { label: string; count: number; added: number };

/**
 * 누적 회원가입수 추이 — 일별(최근 14일) / 월별(최근 12개월).
 * 누적선과 함께 "그 구간에 몇 명 늘었는지"를 표 뷰에서 같이 읽을 수 있게 한다.
 */
export function MemberTrendPanel({
  daily,
  monthly,
}: {
  daily: CumulativePoint[];
  monthly: CumulativePoint[];
}) {
  const [view, setView] = useState<"daily" | "monthly">("daily");
  const [asTable, setAsTable] = useState(false);

  const series = view === "daily" ? daily : monthly;
  const current = series[series.length - 1]?.count ?? 0;
  const startCount = series[0]?.count ?? 0;
  const addedInRange = series.reduce((s, p) => s + p.added, 0);
  const growth = startCount - addedInRange > 0
    ? Math.round((addedInRange / (startCount - series[0].added)) * 100)
    : null;

  const tableRows: ChartTableRow[] = series.map((p, i) => {
    const period =
      view === "daily"
        ? p.label
        : (() => {
            const [y, m] = p.label.split("-");
            return `${y}년 ${Number(m)}월`;
          })();
    return {
      period,
      value: `${formatNumber(p.count)}명`,
      note:
        view === "monthly" && i === series.length - 1
          ? "진행 중"
          : p.added > 0
            ? `+${formatNumber(p.added)}`
            : undefined,
    };
  });

  return (
    <Card>
      <SectionHeader
        title="누적 회원가입수"
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
        <div>
          <span className="text-[12.5px] text-brand-sub">현재 누적 </span>
          <span className="text-[20px] font-extrabold text-brand-dark">{formatNumber(current)}</span>
          <span className="text-[13px] font-bold text-brand-muted ml-0.5">명</span>
        </div>
        <div>
          <span className="text-[12.5px] text-brand-sub">
            {view === "daily" ? "최근 14일 증가 " : "최근 12개월 증가 "}
          </span>
          <span className="text-[15px] font-semibold text-brand-text">+{formatNumber(addedInRange)}명</span>
          {growth !== null && growth > 0 && (
            <span className="text-[13px] font-bold text-brand-success ml-1.5">▲ {growth}%</span>
          )}
        </div>
      </div>

      <div className={asTable ? "" : "p-4"}>
        {asTable ? (
          <ChartTableView
            periodLabel={view === "daily" ? "날짜" : "월"}
            valueLabel="누적 회원"
            rows={tableRows}
          />
        ) : (
          <CumulativeAreaChart data={series} isMonthly={view === "monthly"} />
        )}
      </div>
    </Card>
  );
}
