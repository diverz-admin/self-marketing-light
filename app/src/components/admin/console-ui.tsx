/**
 * 대시보드 전용 "콘솔" 표현 부품.
 *
 * 기존 어드민 UI(`components/admin/ui.tsx`)는 부드러운 SaaS 톤이다. 여기 것들은
 * 운영 콘솔처럼 보이게 하는 요소만 모았다 — 모노스페이스 수치, 얇은 격자,
 * 데이터 밀도, 갱신 시각. 대시보드에서 먼저 입혀 보고 판단하기 위해 공용 ui.tsx 를
 * 건드리지 않고 따로 뒀다. 방향이 확정되면 그때 합치면 된다.
 *
 * 설계 원칙 — "IT스러움"은 장식이 아니라 정보 밀도에서 나온다.
 *   · 숫자는 모노로 찍어 자릿수가 세로로 맞는다
 *   · 큰 수치 옆에는 추세(스파크라인)를 붙여 값 하나가 맥락을 갖게 한다
 *   · 지금 보는 값이 언제 것인지 항상 밝힌다
 */

import { Num, DeltaChip, Sparkline } from "@/components/ui/metrics";

/* 수치 표기 부품은 고객 대시보드와 공유한다 */
export { Num, DeltaChip, Sparkline, cumulative } from "@/components/ui/metrics";

/* ────────────────────────────────────────────────────────────
   카드 · 헤더
──────────────────────────────────────────────────────────── */

/**
 * 지표 카드.
 *
 * 공용 StatCard 와 다른 점: 값이 모노고, 추세선을 품고, 아이콘 대신 짧은 키를
 * 단다. 아이콘은 자리를 많이 먹는 데 비해 구분에 거의 기여하지 않는다 —
 * 지표 4장이 나란히 놓이면 라벨을 읽지 아이콘을 보지 않는다.
 */
export function MetricCard({
  label,
  metricKey,
  value,
  unit,
  sub,
  delta,
  series,
  tone = "text-brand-primary",
}: {
  label: string;
  /** 카드 우상단의 짧은 식별자 — 콘솔의 지표 이름처럼 쓴다 */
  metricKey: string;
  value: string;
  /** 단위는 한글이라 모노 밖에 둔다 */
  unit?: string;
  sub?: React.ReactNode;
  delta?: number | null;
  series?: number[];
  /** 추세선 색 */
  tone?: string;
}) {
  return (
    <div className="group relative bg-white rounded-xl border border-brand-border p-4 md:p-[18px] transition-colors hover:border-brand-border-strong">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12.5px] font-semibold text-brand-sub">{label}</p>
        <span className="shrink-0 rounded bg-brand-light px-1.5 py-0.5 text-[10px] font-medium text-brand-muted">
          <Num>{metricKey}</Num>
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[25px] md:text-[27px] font-extrabold text-brand-dark leading-none">
            <Num>{value}</Num>
            {unit && <span className="text-[14px] font-bold text-brand-sub ml-0.5">{unit}</span>}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11.5px] text-brand-muted">
            {delta !== undefined && <DeltaChip delta={delta ?? null} />}
            {sub && <span className="truncate">{sub}</span>}
          </div>
        </div>

        {series && series.length > 1 && (
          <Sparkline values={series} className={`shrink-0 ${tone}`} />
        )}
      </div>
    </div>
  );
}

/**
 * 섹션 제목 위에 붙는 얇은 키.
 * 콘솔의 섹션 구분처럼 읽히게 하고, 한글 제목과 시선 높이를 나눈다.
 */
export function SectionKey({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10.5px] font-semibold text-brand-muted mb-1">
      <Num className="tracking-[0.08em]">{children}</Num>
    </p>
  );
}

export { LastUpdated } from "./LastUpdated";
