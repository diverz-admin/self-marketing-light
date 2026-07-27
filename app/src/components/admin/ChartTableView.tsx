"use client";

import { Th, Td, EmptyState } from "@/components/admin/ui";

export type ChartTableRow = { period: string; value: string; note?: string };

/**
 * 차트의 "표 뷰 쌍".
 * 값을 툴팁으로만 읽게 두지 않기 위한 접근성 채널이며, 색 대비가 낮은 마크의
 * 대체 읽기 수단이기도 하다. 숫자 열은 세로 정렬이 필요하므로 tabular-nums를 쓴다.
 */
export function ChartTableView({
  periodLabel,
  valueLabel,
  rows,
}: {
  periodLabel: string;
  valueLabel: string;
  rows: ChartTableRow[];
}) {
  if (!rows.length) return <EmptyState message="표시할 데이터가 없습니다." />;

  return (
    // TableShell을 쓰지 않고 직접 그린다 — TableShell의 overflow-x 컨테이너가
    // 중첩 스크롤 영역이 되어 sticky 헤더의 기준을 가로채기 때문.
    // 스크롤 컨테이너는 이 div 하나뿐이어야 th의 sticky가 동작한다.
    <div className="max-h-[260px] overflow-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            {/* 반투명 배경이면 스크롤되는 행이 비쳐 보이므로 실색으로 덮는다 */}
            <Th className="sticky top-0 z-10 bg-[#F5F6F8] border-b border-brand-border">{periodLabel}</Th>
            <Th className="sticky top-0 z-10 bg-[#F5F6F8] border-b border-brand-border text-right">{valueLabel}</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {rows.map((r) => (
            <tr key={r.period} className="hover:bg-brand-light/50 transition-colors">
              <Td className="whitespace-nowrap">
                {r.period}
                {r.note && <span className="text-[12px] text-brand-muted ml-1.5">{r.note}</span>}
              </Td>
              <Td className="text-right tabular-nums font-semibold text-brand-dark">{r.value}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
