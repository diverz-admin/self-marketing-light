"use client";

import { useState } from "react";
import { toast } from "@/components/ui/toast";
import { addRankKeyword } from "@/app/(platform)/marketing/actions";

/**
 * 캠페인 관리 행을 펼쳤을 때의 상세 — 개발본과 같은 짜임.
 *   왼쪽: 대상명 · 키워드 / 아래에 최초 → 최근 순위
 *   오른쪽: 통합순위관리에 추가 · 링크 / 일 작업량·총 작업량·기간 / 순위 추이(7·30·60일)
 */
export type DetailPoint = { date: string; rank: number | null; visit?: number; blog?: number };

/** 부드러운 곡선 — 점 사이를 Catmull-Rom 으로 잇는다 */
function smoothPath(pts: [number, number][]) {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

function TrendCurve({ points }: { points: DetailPoint[] }) {
  const data = points.filter((p) => p.rank != null) as (DetailPoint & { rank: number })[];
  if (data.length === 0) return <p className="py-14 text-center text-[13px] text-brand-muted">아직 순위가 측정되지 않았습니다.</p>;
  const W = 1100, H = 240, padX = 18, padT = 34, padB = 30;
  const min = Math.min(...data.map((d) => d.rank));
  const max = Math.max(...data.map((d) => d.rank));
  const span = Math.max(1, max - min);
  const step = data.length > 1 ? (W - padX * 2) / (data.length - 1) : 0;
  const xy: [number, number][] = data.map((d, i) => [
    data.length > 1 ? padX + i * step : W / 2,
    padT + ((d.rank - min) / span) * (H - padT - padB),
  ]);
  const line = smoothPath(xy);
  const every = Math.ceil(data.length / 10);
  const last = xy[xy.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H + 8}`} className="w-full h-auto" role="img" aria-label="순위 추이">
      <defs>
        <linearGradient id="camp-rank-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--point-500)" stopOpacity={0.16} />
          <stop offset="100%" stopColor="var(--point-500)" stopOpacity={0} />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((t) => (
        <line key={t} x1={padX} x2={W - padX} y1={padT + t * (H - padT - padB)} y2={padT + t * (H - padT - padB)} stroke="var(--border)" strokeDasharray="3 5" />
      ))}
      {line && (
        <path d={`${line} L${last[0]},${H - padB} L${xy[0][0]},${H - padB} Z`} fill="url(#camp-rank-fill)" />
      )}
      {line && <path d={line} fill="none" stroke="var(--point-500)" strokeWidth={2.4} strokeLinecap="round" />}
      <line x1={last[0]} x2={last[0]} y1={padT - 12} y2={H - padB} stroke="var(--point-500)" strokeOpacity={0.5} strokeDasharray="3 4" />
      {xy.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={4} fill="var(--surface, #fff)" stroke="var(--point-500)" strokeWidth={2} />
          {data.length <= 14 && (
            <text x={x} y={y - 10} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--text-strong)">{data[i].rank}위</text>
          )}
          {(i % every === 0 || i === xy.length - 1) && (
            <text x={x} y={H + 2} textAnchor="middle" fontSize={11} fill="var(--text-muted)">{data[i].date}</text>
          )}
        </g>
      ))}
    </svg>
  );
}

export default function CampaignRankDetail({
  platform, targetName, targetUrl, keyword, dailyQty, totalQty, period, history, linkLabel,
}: {
  platform: "place" | "shopping" | "coupang";
  targetName: string;
  targetUrl: string;
  keyword: string;
  dailyQty: number;
  totalQty: number;
  /** "2026-09-17~10-01" 처럼 보여줄 기간 */
  period: string;
  /** 오래된 → 최근. 날짜는 MM/DD */
  history: DetailPoint[] | undefined;
  linkLabel: string;
}) {
  const [range, setRange] = useState<7 | 30 | 60>(7);
  const [adding, setAdding] = useState(false);
  const all = history ?? [];
  const pts = all.slice(-range);
  const recent = all.slice(-8).reverse();
  const ranks = all.map((p) => p.rank).filter((r): r is number => r != null);
  const first = ranks[0] ?? null;
  const last = ranks[ranks.length - 1] ?? null;
  const moved = first != null && last != null ? first - last : 0;

  const addTracking = async () => {
    if (adding) return;
    setAdding(true);
    const res = await addRankKeyword({ platform, keyword, targetName, targetUrl });
    setAdding(false);
    if ("error" in res) toast.error(res.error);
    else toast.success("통합순위관리에 추가했습니다", "오늘부터 순위가 기록됩니다.");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-5 px-5 py-5">
      {/* 왼쪽 — 대상 · 순위 요약 */}
      <div className="flex lg:flex-col justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[17px] font-extrabold text-brand-dark truncate">{targetName}</p>
          <p className="mt-1 flex items-center gap-1 text-[13px] text-brand-sub">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            {keyword || "—"}
          </p>
        </div>
        <div>
          <div className="flex items-end gap-3">
            <div>
              <p className="text-[12px] text-brand-sub">최초 순위</p>
              <p className="text-[22px] font-extrabold text-brand-muted tabular-nums leading-tight">
                {first ?? "—"}<span className="text-[13px] font-bold ml-0.5">{first != null ? "위" : ""}</span>
              </p>
            </div>
            <span className="pb-1.5 text-brand-muted">→</span>
            <div>
              <p className="text-[12px] text-brand-sub">최근 순위</p>
              <p className="text-[26px] font-extrabold text-brand-primary tabular-nums leading-tight">
                {last ?? "—"}<span className="text-[13px] font-bold ml-0.5">{last != null ? "위" : ""}</span>
              </p>
            </div>
          </div>
          {moved !== 0 && (
            <p className={`mt-1 text-[13px] font-extrabold ${moved > 0 ? "text-brand-primary" : "text-brand-error"}`}>
              {moved > 0 ? "↑" : "↓"}{Math.abs(moved)}단계
            </p>
          )}
        </div>
      </div>

      {/* 오른쪽 — 요약 · 순위 추이 */}
      <div className="min-w-0">
        <div className="flex justify-end gap-2">
          <button type="button" onClick={addTracking} disabled={adding} className="rounded-lg border border-brand-border bg-brand-primary-50 px-3 py-1.5 text-[12.5px] font-bold text-brand-primary disabled:opacity-60">
            {adding ? "추가 중…" : "+ 통합순위관리에 추가"}
          </button>
          {targetUrl && (
            <a href={targetUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-brand-border bg-brand-primary-50 px-3 py-1.5 text-[12.5px] font-bold text-brand-primary hover:underline">
              {linkLabel} ↗
            </a>
          )}
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { label: "일 작업량", value: `일 ${dailyQty.toLocaleString()}건` },
            { label: "총 작업량", value: `${totalQty.toLocaleString()}건` },
            { label: "기간", value: period },
          ].map((t) => (
            <div key={t.label} className="rounded-xl border border-brand-border bg-white px-4 py-3">
              <p className="text-[12px] text-brand-sub">{t.label}</p>
              <p className="mt-0.5 text-[16px] font-extrabold text-brand-dark tabular-nums">{t.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-[14px] font-bold text-brand-dark">순위 추이</p>
          <div className="flex items-center gap-1">
            {([7, 30, 60] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setRange(d)}
                aria-pressed={range === d}
                className={`rounded-lg px-2.5 py-1 text-[12px] font-bold ${range === d ? "bg-brand-dark text-white" : "text-brand-sub hover:bg-brand-lighter"}`}
              >
                {d}일
              </button>
            ))}
          </div>
        </div>

        {all.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-brand-border bg-white px-4 py-10 text-center">
            <p className="text-[14px] font-bold text-brand-dark">이 캠페인은 순위 추적에 연결되지 않았습니다.</p>
            <p className="mt-1 text-[12.5px] text-brand-sub">「+ 통합순위관리에 추가」를 누르면 오늘부터 순위가 기록됩니다.</p>
          </div>
        ) : (
          <>
            <div className="mt-2 flex overflow-x-auto scrollbar-none">
              {recent.map((p, i) => (
                <div key={p.date + i} className={`min-w-[60px] px-2.5 py-0.5 text-center ${i > 0 ? "border-l border-brand-border" : ""}`}>
                  <p className="text-[11px] text-brand-muted tabular-nums">{p.date}</p>
                  <p className={`mt-0.5 text-[15px] leading-tight font-extrabold tabular-nums ${i === 0 ? "text-brand-primary" : "text-brand-dark"}`}>
                    {p.rank != null ? `${p.rank}위` : "밖"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-brand-muted tabular-nums">방 {p.visit != null ? p.visit.toLocaleString() : "—"}</p>
                  <p className="text-[11px] text-brand-muted tabular-nums">블 {p.blog != null ? p.blog.toLocaleString() : "—"}</p>
                </div>
              ))}
            </div>
            <div className="mt-2">
              <TrendCurve points={pts} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
