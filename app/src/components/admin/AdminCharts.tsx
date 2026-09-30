"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";

// 접미 "원" — U+20A9(₩)는 가로 획이 뒤 숫자에 닿아 취소선처럼 보인다 (admin-format.ts 참고)
const KRW = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";

// ── 차트 공통 스펙 ──
// 마크는 얇게, 그리드/축은 물러나게. 면적 채움은 10% 워시(포화된 블록 금지).
// 그리드선은 실선 헤어라인 — 점선은 "예측/임계값"으로 오독된다.
// 색은 CSS 변수로 뺀다 — 같은 차트가 밝은 페이지(회원관리)와 다크 대시보드(.console)
// 양쪽에 놓이므로, 컴포넌트를 복제하는 대신 놓인 자리의 토큰을 따르게 한다.
// SVG 의 fill/stroke 는 var() 를 그대로 받는다.
const GRID = "var(--chart-grid, #EEF1F5)";
const AXIS = "var(--chart-axis, #E2E6ED)";
// 축 눈금도 모노로 — 카드 수치와 같은 계열로 읽히게 한다 (console-ui.tsx 의 Num 과 짝)
const TICK = { fontSize: 11, fill: "var(--chart-tick, #99A0AC)", fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace' } as const;
const AREA_FILL_OPACITY = 0.1;
const LINE_WIDTH = 2;
const BAR_SIZE = 22;          // ≤24px, 밴드 여백은 공기로 남긴다
const BAR_RADIUS: [number, number, number, number] = [4, 4, 0, 0]; // 데이터 끝만 둥글게, 기준선은 각지게

const TOOLTIP_PROPS = {
  labelStyle: { color: "var(--chart-tip-label, #5B6472)", fontSize: 12 },
  contentStyle: {
    borderRadius: 10,
    border: "1px solid var(--chart-tip-border, #E2E6ED)",
    background: "var(--chart-tip-bg, #FFFFFF)",
    color: "var(--chart-tip-text, #111D37)",
    fontSize: 13,
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
  },
} as const;

/** "2026-07" → "2026년 7월" (마지막 항목은 진행 중임을 명시) */
const monthLabel = (v: unknown, isCurrent: boolean) => {
  const [y, m] = String(v).split("-");
  return `${y}년 ${Number(m)}월${isCurrent ? " (진행 중)" : ""}`;
};

/** 일별 매출 (면적). date 예: "2026-07-22" */
export function RevenueAreaChart({ data }: { data: { date: string; amount: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2452EB" stopOpacity={AREA_FILL_OPACITY} />
            <stop offset="100%" stopColor="#2452EB" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis
          dataKey="date"
          tick={TICK}
          tickLine={false}
          axisLine={{ stroke: AXIS }}
          tickFormatter={(v) => String(v).slice(5)}
        />
        <YAxis
          tick={TICK}
          tickLine={false}
          axisLine={false}
          width={54}
          tickFormatter={(v) => (v >= 10000 ? `${Math.round(v / 10000)}만` : String(v))}
        />
        <Tooltip {...TOOLTIP_PROPS} formatter={(v) => [KRW(Number(v)), "매출"]} />
        <Area type="monotone" dataKey="amount" stroke="#2452EB" strokeWidth={LINE_WIDTH} fill="url(#revFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** 월별 매출 (막대). label 예: "2026-07" */
export function RevenueBarChart({ data }: { data: { label: string; amount: number }[] }) {
  const last = data.length - 1;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis
          dataKey="label"
          tick={TICK}
          tickLine={false}
          axisLine={{ stroke: AXIS }}
          tickFormatter={(v) => `${Number(String(v).slice(5))}월`}
        />
        <YAxis
          tick={TICK}
          tickLine={false}
          axisLine={false}
          width={54}
          tickFormatter={(v) => (v >= 10000 ? `${Math.round(v / 10000)}만` : String(v))}
        />
        <Tooltip
          {...TOOLTIP_PROPS}
          cursor={{ fill: "#F5F6F8" }}
          formatter={(v) => [KRW(Number(v)), "매출"]}
          labelFormatter={(v) => monthLabel(v, String(v) === data[last]?.label)}
        />
        <Bar dataKey="amount" radius={BAR_RADIUS} barSize={BAR_SIZE}>
          {data.map((d, i) => (
            // 마지막 막대(이번 달)는 아직 진행 중이라 연한 단계로 구분한다.
            // 색만으로 구분되지 않도록 툴팁 라벨과 패널 설명에 "진행 중"을 함께 표기한다.
            <Cell key={i} fill={i === last ? "#7189B8" : "#2452EB"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** 일별 신규 가입 (면적). date 예: "2026-07-22" */
export function SignupAreaChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="signupFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5B3FB0" stopOpacity={AREA_FILL_OPACITY} />
            <stop offset="100%" stopColor="#5B3FB0" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis
          dataKey="date"
          tick={TICK}
          tickLine={false}
          axisLine={{ stroke: AXIS }}
          tickFormatter={(v) => String(v).slice(5)}
        />
        <YAxis tick={TICK} tickLine={false} axisLine={false} width={40} allowDecimals={false} />
        <Tooltip {...TOOLTIP_PROPS} formatter={(v) => [`${Number(v).toLocaleString("ko-KR")}명`, "신규 가입"]} />
        <Area type="monotone" dataKey="count" stroke="#5B3FB0" strokeWidth={LINE_WIDTH} fill="url(#signupFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/**
 * 누적 회원수 (면적). 일별이면 label "2026-07-22", 월별이면 "2026-07".
 * 누적값은 단조 증가라 막대보다 면적이 읽기 쉽다.
 */
export function CumulativeAreaChart({
  data,
  isMonthly,
}: {
  data: { label: string; count: number }[];
  isMonthly: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="cumulFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5B3FB0" stopOpacity={AREA_FILL_OPACITY} />
            <stop offset="100%" stopColor="#5B3FB0" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis
          dataKey="label"
          tick={TICK}
          tickLine={false}
          axisLine={{ stroke: AXIS }}
          tickFormatter={(v) => (isMonthly ? `${Number(String(v).slice(5))}월` : String(v).slice(5))}
        />
        <YAxis tick={TICK} tickLine={false} axisLine={false} width={46} allowDecimals={false} />
        <Tooltip
          {...TOOLTIP_PROPS}
          formatter={(v) => [`${Number(v).toLocaleString("ko-KR")}명`, "누적 회원"]}
          labelFormatter={(v) =>
            isMonthly ? monthLabel(v, String(v) === data[data.length - 1]?.label) : String(v)
          }
        />
        <Area type="monotone" dataKey="count" stroke="#5B3FB0" strokeWidth={LINE_WIDTH} fill="url(#cumulFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** 월별 신규 가입 (막대). label 예: "2026-07" */
export function SignupBarChart({ data }: { data: { label: string; count: number }[] }) {
  const last = data.length - 1;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis
          dataKey="label"
          tick={TICK}
          tickLine={false}
          axisLine={{ stroke: AXIS }}
          tickFormatter={(v) => `${Number(String(v).slice(5))}월`}
        />
        <YAxis tick={TICK} tickLine={false} axisLine={false} width={40} allowDecimals={false} />
        <Tooltip
          {...TOOLTIP_PROPS}
          cursor={{ fill: "#F5F6F8" }}
          formatter={(v) => [`${Number(v).toLocaleString("ko-KR")}명`, "신규 가입"]}
          labelFormatter={(v) => monthLabel(v, String(v) === data[last]?.label)}
        />
        <Bar dataKey="count" radius={BAR_RADIUS} barSize={BAR_SIZE}>
          {data.map((d, i) => (
            <Cell key={i} fill={i === last ? "#9B87D2" : "#5B3FB0"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
