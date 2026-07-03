"use client";

import { useState } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────
   채널 아이콘
───────────────────────────────────────── */
type ChannelKey = "meta" | "instagram" | "blog";

function ChannelChip({ ch, active }: { ch: ChannelKey; active: boolean }) {
  const brand: Record<ChannelKey, { bg: string; fg: string }> = {
    meta: { bg: "#1877F2", fg: "#1877F2" },
    instagram: { bg: "linear-gradient(45deg,#F58529,#DD2A7B,#8134AF)", fg: "#DD2A7B" },
    blog: { bg: "#03C75A", fg: "#03C75A" },
  };
  const bg = active ? "#FFFFFF" : brand[ch].bg;
  const fg = active ? brand[ch].fg : "#FFFFFF";
  return (
    <span className="h-5 w-5 rounded-md flex items-center justify-center shrink-0 text-[12px] font-extrabold" style={{ background: bg, color: fg }}>
      {ch === "meta" && "f"}
      {ch === "blog" && "b"}
      {ch === "instagram" && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="3.5" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      )}
    </span>
  );
}

/* ─────────────────────────────────────────
   데이터
───────────────────────────────────────── */
type Stat = { label: string; value: string; sub: string; subColor?: string };
type Series = { name: string; color: string; data: number[] };
type Row = { name: string; c1: string; c2: string; c3: string; hl: string; hlColor: string; status: string; statusColor: string };
type Channel = {
  label: string;
  period: string;
  stats: Stat[];
  line: { title: string; labels: string[]; data: number[]; yMax: number; fmtY: (v: number) => string; color: string };
  bar: { title: string; labels: string[]; series: [Series, Series]; yMax: number };
  table: { title: string; cols: [string, string, string, string, string, string]; rows: Row[] };
};

const MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월"];
const BLUE = "#2E6BE0";
const GREEN = "#10B981";

const CHANNELS: Record<ChannelKey, Channel> = {
  meta: {
    label: "메타광고",
    period: "2026년 6월 기준",
    stats: [
      { label: "총 광고비", value: "₩390,000", sub: "전월비 ▼7%", subColor: "text-red-500" },
      { label: "총 노출수", value: "156K", sub: "CTR 3.00%" },
      { label: "클릭수", value: "4,680", sub: "CPC ₩83" },
      { label: "전환수", value: "234", sub: "전환율 5.0%" },
      { label: "ROAS", value: "0.8x", sub: "광고 수익률" },
    ],
    line: { title: "월별 광고비 추이", labels: MONTHS, data: [31, 29, 36, 33, 40, 37], yMax: 60, fmtY: (v) => `${v}만`, color: BLUE },
    bar: {
      title: "클릭 · 전환 추이", labels: MONTHS, yMax: 6000,
      series: [
        { name: "클릭", color: BLUE, data: [3800, 3400, 4500, 4100, 4900, 4680] },
        { name: "전환", color: GREEN, data: [190, 170, 225, 205, 245, 234] },
      ],
    },
    table: {
      title: "캠페인별 성과 (이번달)",
      cols: ["캠페인명", "광고비", "클릭수", "전환수", "ROAS", "상태"],
      rows: [
        { name: "여름 프로모션", c1: "₩150,000", c2: "1,800", c3: "90", hl: "4.2x", hlColor: "text-[#16A34A]", status: "진행중", statusColor: "bg-blue-50 text-[#2E6BE0]" },
        { name: "브랜드 인지도", c1: "₩120,000", c2: "1,440", c3: "72", hl: "3.8x", hlColor: "text-[#D97706]", status: "진행중", statusColor: "bg-blue-50 text-[#2E6BE0]" },
        { name: "신규 고객 리타겟팅", c1: "₩120,000", c2: "1,440", c3: "72", hl: "2.1x", hlColor: "text-[#D97706]", status: "진행중", statusColor: "bg-blue-50 text-[#2E6BE0]" },
      ],
    },
  },
  instagram: {
    label: "인스타그램 운영",
    period: "2026년 6월 기준",
    stats: [
      { label: "총 도달수", value: "89K", sub: "전월비 ▲12%", subColor: "text-[#2E6BE0]" },
      { label: "좋아요", value: "5,120", sub: "참여율 6.2%" },
      { label: "댓글", value: "380", sub: "전월비 ▲8%" },
      { label: "저장", value: "842", sub: "저장률 0.9%" },
      { label: "팔로워 증가", value: "+820", sub: "증가율 3.1%" },
    ],
    line: { title: "월별 도달수 추이", labels: MONTHS, data: [62, 68, 71, 79, 85, 89], yMax: 100, fmtY: (v) => `${v}K`, color: BLUE },
    bar: {
      title: "좋아요 · 저장 추이", labels: MONTHS, yMax: 6000,
      series: [
        { name: "좋아요", color: BLUE, data: [3900, 4200, 4600, 4800, 5000, 5120] },
        { name: "저장", color: GREEN, data: [520, 610, 700, 780, 820, 842] },
      ],
    },
    table: {
      title: "게시물별 성과 (이번달)",
      cols: ["게시물", "도달", "좋아요", "저장", "참여율", "상태"],
      rows: [
        { name: "여름 신상 릴스", c1: "32K", c2: "2,100", c3: "340", hl: "7.6%", hlColor: "text-[#16A34A]", status: "발행완료", statusColor: "bg-blue-50 text-[#2E6BE0]" },
        { name: "브랜드 스토리", c1: "21K", c2: "1,480", c3: "210", hl: "6.9%", hlColor: "text-[#16A34A]", status: "발행완료", statusColor: "bg-blue-50 text-[#2E6BE0]" },
        { name: "이벤트 안내", c1: "15K", c2: "980", c3: "150", hl: "5.4%", hlColor: "text-[#D97706]", status: "예약", statusColor: "bg-brand-lighter text-brand-muted" },
      ],
    },
  },
  blog: {
    label: "블로그 발행",
    period: "2026년 6월 기준",
    stats: [
      { label: "발행 글", value: "12개", sub: "전월비 ▲2건", subColor: "text-[#2E6BE0]" },
      { label: "방문자", value: "8,400", sub: "전월비 ▲9%" },
      { label: "조회수", value: "21K", sub: "페이지뷰" },
      { label: "상위노출 키워드", value: "18개", sub: "TOP10 기준" },
      { label: "평균 체류", value: "2:14", sub: "이탈 38%" },
    ],
    line: { title: "월별 방문자 추이", labels: MONTHS, data: [5.2, 5.8, 6.3, 7.1, 7.8, 8.4], yMax: 10, fmtY: (v) => `${v}K`, color: BLUE },
    bar: {
      title: "조회수 · 신규유입 추이", labels: MONTHS, yMax: 24000,
      series: [
        { name: "조회수", color: BLUE, data: [14000, 16000, 17500, 19000, 20000, 21000] },
        { name: "신규유입", color: GREEN, data: [3200, 3600, 4100, 4500, 4900, 5200] },
      ],
    },
    table: {
      title: "포스팅별 성과 (이번달)",
      cols: ["제목", "조회수", "방문자", "유입키워드", "순위", "상태"],
      rows: [
        { name: "여름 휴가지 추천 TOP5", c1: "4,200", c2: "1,800", c3: "12개", hl: "2위", hlColor: "text-[#16A34A]", status: "발행완료", statusColor: "bg-blue-50 text-[#2E6BE0]" },
        { name: "제품 사용 후기 정리", c1: "3,100", c2: "1,240", c3: "8개", hl: "5위", hlColor: "text-[#16A34A]", status: "발행완료", statusColor: "bg-blue-50 text-[#2E6BE0]" },
        { name: "6월 이벤트 공지", c1: "1,900", c2: "760", c3: "4개", hl: "12위", hlColor: "text-[#D97706]", status: "임시저장", statusColor: "bg-brand-lighter text-brand-muted" },
      ],
    },
  },
};

/* ─────────────────────────────────────────
   차트
───────────────────────────────────────── */
function LineChart({ labels, data, yMax, fmtY, color }: { labels: string[]; data: number[]; yMax: number; fmtY: (v: number) => string; color: string }) {
  const W = 760, H = 260, pL = 52, pR = 20, pT = 16, pB = 34;
  const iW = W - pL - pR, iH = H - pT - pB;
  const n = data.length;
  const step = n > 1 ? iW / (n - 1) : 0;
  const x = (i: number) => pL + i * step;
  const y = (v: number) => pT + (1 - v / yMax) * iH;
  const pts = data.map((v, i) => ({ x: x(i), y: y(v) }));
  const poly = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${pts[0].x},${pT + iH} ${poly} ${pts[n - 1].x},${pT + iH}`;
  const ticks = [1, 0.75, 0.5, 0.25, 0].map((f) => ({ y: pT + (1 - f) * iH, v: Math.round(yMax * f * 10) / 10 }));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <linearGradient id="lcArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.14" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pL} y1={t.y} x2={W - pR} y2={t.y} stroke="#EEF1F6" strokeWidth={1} strokeDasharray={i === ticks.length - 1 ? "0" : "3 4"} />
          <text x={pL - 8} y={t.y + 4} textAnchor="end" fontSize={12} fill="#B0B7C3">{fmtY(t.v)}</text>
        </g>
      ))}
      <polygon points={area} fill="url(#lcArea)" />
      <polyline points={poly} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4.5} fill="white" stroke={color} strokeWidth={2.5} />
      ))}
      {labels.map((l, i) => (
        <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize={12} fill="#8A94A6">{l}</text>
      ))}
    </svg>
  );
}

function BarChart({ labels, series, yMax }: { labels: string[]; series: [Series, Series]; yMax: number }) {
  const W = 760, H = 280, pL = 48, pR = 20, pT = 16, pB = 40;
  const iW = W - pL - pR, iH = H - pT - pB;
  const n = labels.length;
  const groupW = iW / n;
  const barW = Math.min(16, groupW * 0.22);
  const gap = 4;
  const y = (v: number) => pT + (1 - v / yMax) * iH;
  const ticks = [1, 0.75, 0.5, 0.25, 0].map((f) => ({ y: pT + (1 - f) * iH, v: Math.round(yMax * f) }));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pL} y1={t.y} x2={W - pR} y2={t.y} stroke="#EEF1F6" strokeWidth={1} strokeDasharray={i === ticks.length - 1 ? "0" : "3 4"} />
          <text x={pL - 8} y={t.y + 4} textAnchor="end" fontSize={12} fill="#B0B7C3">{t.v.toLocaleString()}</text>
        </g>
      ))}
      {labels.map((l, gi) => {
        const cx = pL + groupW * gi + groupW / 2;
        const x0 = cx - barW - gap / 2;
        const x1 = cx + gap / 2;
        return (
          <g key={gi}>
            {[series[0], series[1]].map((s, si) => {
              const v = s.data[gi];
              const h = Math.max(2, (v / yMax) * iH);
              const bx = si === 0 ? x0 : x1;
              return <rect key={si} x={bx} y={pT + iH - h} width={barW} height={h} rx={3} fill={s.color} />;
            })}
            <text x={cx} y={H - 8} textAnchor="middle" fontSize={12} fill="#8A94A6">{l}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─────────────────────────────────────────
   페이지
───────────────────────────────────────── */
const CHANNEL_ORDER: ChannelKey[] = ["meta", "instagram", "blog"];

const CONNECT: Record<ChannelKey, { name: string; metrics: string; postId: number }> = {
  meta: { name: "메타광고", metrics: "실제 광고비·노출·전환·ROAS 데이터", postId: 11 },
  instagram: { name: "인스타그램", metrics: "실제 도달·좋아요·저장·팔로워 데이터", postId: 12 },
  blog: { name: "네이버 블로그", metrics: "실제 방문자·조회수·키워드 순위 데이터", postId: 13 },
};

export default function MarketingReportPage() {
  const [channel, setChannel] = useState<ChannelKey>("meta");
  const [month, setMonth] = useState(6);
  const c = CHANNELS[channel];
  const cn = CONNECT[channel];

  return (
    <div className="w-full space-y-5">
      {/* 타이틀 + 월 선택 */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[25px] font-extrabold text-brand-dark leading-tight">SNS 대시보드</h1>
          <p className="text-[15px] text-brand-sub mt-1">메타광고 · 인스타그램 운영 · 블로그 발행 성과를 확인합니다.</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-brand-border bg-white px-1.5 py-1.5">
          <button onClick={() => setMonth((m) => (m > 1 ? m - 1 : 12))} className="h-7 w-7 rounded-lg flex items-center justify-center text-brand-muted hover:bg-brand-lighter transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="text-[15px] font-bold text-brand-dark w-10 text-center">{month}월</span>
          <button onClick={() => setMonth((m) => (m < 12 ? m + 1 : 1))} className="h-7 w-7 rounded-lg flex items-center justify-center text-brand-muted hover:bg-brand-lighter transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {/* 채널 탭 */}
      <div className="flex items-center gap-2 flex-wrap">
        {CHANNEL_ORDER.map((k) => {
          const active = channel === k;
          return (
            <button key={k} onClick={() => setChannel(k)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[15px] font-bold transition-all border ${
                active ? "text-white border-transparent shadow-sm" : "bg-white text-brand-text border-brand-border hover:bg-brand-lighter"
              }`}
              style={active ? { background: "linear-gradient(135deg,#1B3160,#2E6BE0)" } : {}}>
              <ChannelChip ch={k} active={active} />
              {CHANNELS[k].label}
            </button>
          );
        })}
      </div>

      {/* 계정 연동 안내 배너 (채널별) */}
      <div className="rounded-2xl overflow-hidden flex flex-col sm:flex-row sm:items-center gap-4 p-6"
        style={{ background: "linear-gradient(135deg,#1B3160 0%,#111D37 100%)" }}>
        <span className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-extrabold text-white">아직 {cn.name} 계정을 연결하지 않으셨나요?</p>
          <p className="text-[13px] text-white/60 mt-1 leading-relaxed">계정을 연동하면 {cn.metrics}가 자동으로 표시됩니다. (현재 화면은 샘플 데이터)</p>
        </div>
        <Link href={`/marketing/community/board?post=${cn.postId}`}
          className="shrink-0 inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-white text-[#0D3473] text-[14px] font-bold hover:bg-white/90 transition-colors whitespace-nowrap">
          내 계정 연동 방법 보기
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
        </Link>
      </div>

      {/* KPI 카드 5개 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {c.stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-brand-border p-5">
            <p className="text-[13px] text-brand-sub mb-2">{s.label}</p>
            <p className="text-[26px] font-extrabold text-brand-dark leading-none tabular-nums">{s.value}</p>
            <p className={`text-[12px] mt-2 ${s.subColor ?? "text-brand-muted"}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* 차트 2개 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-brand-border p-6">
          <p className="text-[16px] font-extrabold text-brand-dark mb-4">{c.line.title}</p>
          <LineChart labels={c.line.labels} data={c.line.data} yMax={c.line.yMax} fmtY={c.line.fmtY} color={c.line.color} />
        </div>
        <div className="bg-white rounded-2xl border border-brand-border p-6">
          <p className="text-[16px] font-extrabold text-brand-dark mb-4">{c.bar.title}</p>
          <BarChart labels={c.bar.labels} series={c.bar.series} yMax={c.bar.yMax} />
          <div className="flex items-center justify-center gap-5 mt-2">
            {c.bar.series.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-[13px] text-brand-sub">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 캠페인 테이블 */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-border">
          <p className="text-[16px] font-extrabold text-brand-dark">{c.table.title}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-brand-border bg-brand-lighter">
                {c.table.cols.map((h) => (
                  <th key={h} className="px-6 py-3 text-[13px] font-bold text-brand-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {c.table.rows.map((r) => (
                <tr key={r.name} className="border-b border-brand-border last:border-0 hover:bg-brand-lighter/40 transition-colors">
                  <td className="px-6 py-4 text-[15px] font-bold text-brand-dark whitespace-nowrap">{r.name}</td>
                  <td className="px-6 py-4 text-[15px] text-brand-sub tabular-nums whitespace-nowrap">{r.c1}</td>
                  <td className="px-6 py-4 text-[15px] text-brand-sub tabular-nums whitespace-nowrap">{r.c2}</td>
                  <td className="px-6 py-4 text-[15px] text-brand-sub tabular-nums whitespace-nowrap">{r.c3}</td>
                  <td className={`px-6 py-4 text-[15px] font-extrabold tabular-nums whitespace-nowrap ${r.hlColor}`}>{r.hl}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-[13px] font-bold px-2.5 py-1 rounded-md ${r.statusColor}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}
