"use client";

import React, { useMemo, useState } from "react";

/**
 * 캠페인 아코디언 안에서 쓰는 순위 추이 표시.
 * 상위노출·보장형 관리 화면이 같은 컴포넌트를 쓴다.
 */
export type RankPoint = { date: string; rank: number };

const RANGE_OPTIONS = [
  { key: "7", label: "7일" },
  { key: "30", label: "30일" },
  { key: "all", label: "전체" },
];

/** 대상 링크 — 목록을 좁게 쓰려고 테이블 대신 아코디언 안에서 보여준다 */
export function TargetLink({ label, url }: { label: string; url: string | null }) {
  return (
    <div className="text-[12.5px]">
      <span className="font-bold text-brand-muted mr-1.5">{label}</span>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="text-brand-primary underline break-all">
          {url.replace(/^https?:\/\//, "")}
        </a>
      ) : (
        <span className="text-brand-muted">등록된 링크가 없습니다</span>
      )}
    </div>
  );
}

/** "2026-07-08" → "7/8" */
const shortDate = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;

export function RankTrendPanel({
  targetName,
  keyword,
  targetUrl,
  linkLabel,
  history,
  aside,
}: {
  targetName: string;
  keyword: string;
  targetUrl: string | null;
  linkLabel: string;
  history: RankPoint[];
  /** 보장 카운트처럼 화면별로 덧붙이는 블록 */
  aside?: React.ReactNode;
}) {
  const [range, setRange] = useState("7");

  const series = useMemo(() => {
    if (range === "all") return history;
    return history.slice(-Number(range));
  }, [history, range]);

  const link = <TargetLink label={linkLabel} url={targetUrl} />;

  if (!history.length) {
    return (
      <div className="px-6 py-5 space-y-3">
        {link}
        {aside}
        <p className="text-[13px] text-brand-muted">
          {keyword ? `“${keyword}” 키워드의 순위 이력이 아직 없습니다.` : "연결된 순위 키워드가 없습니다."}
        </p>
      </div>
    );
  }

  const first = history[0].rank;
  const latest = history[history.length - 1].rank;
  const improved = first - latest;

  return (
    <div className="px-6 py-5 flex flex-col lg:flex-row gap-6">
      {/* 왼쪽: 최초 → 현재 */}
      <div className="lg:w-[190px] shrink-0">
        <p className="text-[14px] font-extrabold text-brand-dark">{targetName}</p>
        {keyword && <p className="text-[12.5px] text-brand-muted mt-0.5">{keyword}</p>}
        <div className="mt-2.5">{link}</div>

        <div className="flex items-end gap-3 mt-5">
          <div>
            <p className="text-[11px] font-bold text-brand-muted mb-0.5">최초 순위</p>
            <p className="text-[22px] font-extrabold text-brand-sub tabular-nums leading-none">
              {first}
              <span className="text-[12px] font-semibold ml-0.5">위</span>
            </p>
          </div>
          <span className="text-brand-muted pb-1">→</span>
          <div>
            <p className="text-[11px] font-bold text-brand-muted mb-0.5">현재 순위</p>
            <p className="text-[26px] font-extrabold text-brand-dark tabular-nums leading-none">
              {latest}
              <span className="text-[12px] font-semibold ml-0.5">위</span>
            </p>
          </div>
        </div>
        {improved !== 0 && (
          <p className={`text-[12.5px] font-bold mt-2 ${improved > 0 ? "text-green-600" : "text-red-500"}`}>
            {improved > 0 ? `▲ ${improved}단계 상승` : `▼ ${Math.abs(improved)}단계 하락`}
          </p>
        )}
        {aside && <div className="mt-3">{aside}</div>}
      </div>

      {/* 오른쪽: 추이 차트 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-[13px] font-bold text-brand-dark">순위 추이</p>
          <div className="flex gap-1">
            {RANGE_OPTIONS.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`px-2.5 py-1 rounded-lg text-[12px] font-bold transition-all ${
                  range === r.key ? "bg-brand-primary text-white" : "bg-white text-brand-sub border border-brand-border"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <RankLineChart points={series} />
      </div>
    </div>
  );
}

/**
 * 순위 꺾은선 — 순위는 값이 작을수록 위로 가야 해서 y축을 뒤집어 그린다.
 * 외부 차트 라이브러리 없이 SVG 로 그려 어드민 번들을 키우지 않는다.
 */
export function RankLineChart({ points }: { points: RankPoint[] }) {
  if (points.length === 0) return null;

  const W = 720;
  const H = 180;
  const padX = 28;
  const padY = 26;

  const ranks = points.map((p) => p.rank);
  const min = Math.min(...ranks);
  const max = Math.max(...ranks);
  const span = Math.max(1, max - min);

  const x = (i: number) => (points.length === 1 ? W / 2 : padX + (i * (W - padX * 2)) / (points.length - 1));
  const y = (rank: number) => padY + ((rank - min) / span) * (H - padY * 2);

  const line = points.map((p, i) => `${x(i)},${y(p.rank)}`).join(" ");
  const area = `${padX},${H - padY} ${line} ${x(points.length - 1)},${H - padY}`;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H + 22}`} className="w-full min-w-[520px]" role="img" aria-label="순위 추이">
        <defs>
          <linearGradient id="rankFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2452EB" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#2452EB" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map((t) => (
          <line
            key={t}
            x1={padX}
            x2={W - padX}
            y1={padY + t * (H - padY * 2)}
            y2={padY + t * (H - padY * 2)}
            stroke="#E7EBF2"
            strokeWidth={1}
          />
        ))}

        <polygon points={area} fill="url(#rankFill)" />
        <polyline points={line} fill="none" stroke="#2452EB" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <g key={`${p.date}-${i}`}>
            <circle cx={x(i)} cy={y(p.rank)} r={4} fill="white" stroke="#2452EB" strokeWidth={2} />
            <text x={x(i)} y={y(p.rank) - 10} textAnchor="middle" className="fill-brand-dark" fontSize={11} fontWeight={700}>
              {p.rank}위
            </text>
            <text x={x(i)} y={H + 14} textAnchor="middle" className="fill-brand-muted" fontSize={11}>
              {shortDate(p.date)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
