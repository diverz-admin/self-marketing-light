"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Icon3D from "@/components/marketing/Icon3D";
import type { DashboardNotice } from "@/lib/dashboard-notices";

/* ── 고객사 인터뷰 (익명 · 자동 롤링) ── */
const HL = "text-[#93B4E8]";
const INTERVIEWS: {
  emoji: string;
  role: string;
  line1: React.ReactNode;
  line2: string;
  metrics: { label: string; value: string }[];
}[] = [
  {
    emoji: "🍖", role: "외식업 대표님",
    line1: <>2주 만에 <span className={HL}>&lsquo;○○ 갈비&rsquo; 32위 → 3위</span>.</>,
    line2: "예약 문의가 확 늘었어요.",
    metrics: [{ label: "키워드 순위", value: "32→3위" }, { label: "예약 문의", value: "+180%" }, { label: "방문 리뷰", value: "+45건" }],
  },
  {
    emoji: "💅", role: "뷰티샵 대표님",
    line1: <><span className={HL}>&lsquo;○○ 왁싱&rsquo;</span> 검색하면 맨 위에 떠요.</>,
    line2: "신규 예약이 2배 됐어요.",
    metrics: [{ label: "키워드 순위", value: "21→2위" }, { label: "신규 예약", value: "+120%" }, { label: "방문 리뷰", value: "+38건" }],
  },
  {
    emoji: "🛍️", role: "쇼핑몰 대표님",
    line1: <><span className={HL}>&lsquo;○○ 원피스&rsquo;</span> 상위노출 이후</>,
    line2: "전환 매출이 눈에 띄게 올랐어요.",
    metrics: [{ label: "상품 순위", value: "40→5위" }, { label: "전환 매출", value: "+95%" }, { label: "구매 리뷰", value: "+210건" }],
  },
  {
    emoji: "☕", role: "카페 대표님",
    line1: <><span className={HL}>&lsquo;○○ 감성카페&rsquo;</span> 검색 유입이 급증해</>,
    line2: "주말 웨이팅이 생겼어요.",
    metrics: [{ label: "키워드 순위", value: "28→4위" }, { label: "방문자 수", value: "+160%" }, { label: "저장 수", value: "+320" }],
  },
];

const CARD = "bg-white rounded-2xl border border-[#E2E6ED]";
const SHADOW = { boxShadow: "0 1px 3px rgba(17,29,55,0.05), 0 1px 2px rgba(17,29,55,0.03)" };

/* ── 캠페인 데이터 ── */
const CAMPAIGNS = [
  { id: 1, status: "반려", statusColor: "bg-red-50 text-red-500", channel: "네이버 플레이스", channelColor: "bg-emerald-50 text-emerald-700", product: "블루에그 방향제", reviewer: "앤드류", count: "1건", dateFrom: "2025-07-02", dateTo: "2025-07-11", progress: 0, avatarColor: "#0D3473" },
  { id: 2, status: "진행중", statusColor: "bg-blue-50 text-blue-600", channel: "네이버 쇼핑", channelColor: "bg-blue-50 text-blue-700", product: "버터플라이 자켓", reviewer: "김소현", count: "3건", dateFrom: "2025-07-10", dateTo: "2025-07-20", progress: 45, avatarColor: "#00B493" },
  { id: 3, status: "완료", statusColor: "bg-gray-100 text-gray-500", channel: "쿠팡", channelColor: "bg-orange-50 text-orange-700", product: "블루에그 패딩", reviewer: "이준혁", count: "2건", dateFrom: "2025-06-20", dateTo: "2025-06-30", progress: 100, avatarColor: "#8B5CF6" },
];

/* ── Rank Chart ── */
const RANK_DATA = [
  { date: "10-29", rank: 74 }, { date: "10-30", rank: 53 },
  { date: "10-31", rank: 36 }, { date: "11-01", rank: 34 },
  { date: "11-02", rank: 19 }, { date: "11-03", rank: 18 },
  { date: "11-04", rank: 16 }, { date: "11-05", rank: 8 },
];
const RANK_STORES = ["블루에그 패딩 | 블루에그 패딩", "버터플라이 | 여성 자켓"];

function RankLineChart() {
  const W = 560, H = 200, pL = 24, pR = 24, pT = 36, pB = 40;
  const iW = W - pL - pR, iH = H - pT - pB, n = RANK_DATA.length;
  const maxR = Math.max(...RANK_DATA.map(d => d.rank));
  const step = iW / (n - 1);
  const pts = RANK_DATA.map((d, i) => ({ x: pL + i * step, y: pT + (d.rank / maxR) * iH, ...d }));
  const polyline = pts.map(p => `${p.x},${p.y}`).join(" ");
  const area = `${pts[0].x},${pT + iH} ${polyline} ${pts[n - 1].x},${pT + iH}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 200 }}>
      <defs>
        <linearGradient id="rankFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0D3473" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0D3473" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
        <line key={i} x1={pL} y1={pT + iH * f} x2={W - pR} y2={pT + iH * f} stroke="#F2F4F6" strokeWidth={1} />
      ))}
      <polygon points={area} fill="url(#rankFill)" />
      <polyline points={polyline} fill="none" stroke="#0D3473" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4.5} fill="white" stroke="#0D3473" strokeWidth={2} />
          <text x={p.x} y={p.y - 11} textAnchor="middle" fontSize={10} fontWeight={700} fill="#0D3473">{p.rank}</text>
          <text x={p.x} y={H - 4} textAnchor="middle" fontSize={9.5} fill="#B0B8C1">{p.date}</text>
        </g>
      ))}
    </svg>
  );
}

/* ── Page ── */
export default function DashboardView({ notices }: { notices: DashboardNotice[] }) {
  const [rankChannel, setRankChannel] = useState<"네이버 플레이스" | "네이버 쇼핑">("네이버 쇼핑");
  const [rankStore, setRankStore] = useState(RANK_STORES[0]);

  // 고객 인터뷰 자동 롤링
  const [interviewIdx, setInterviewIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setInterviewIdx((i) => (i + 1) % INTERVIEWS.length), 4500);
    return () => clearInterval(t);
  }, []);
  const interview = INTERVIEWS[interviewIdx];

  return (
    <div className="w-full flex flex-col gap-6">

      {/* 모바일 전용 인사말 (최상단) */}
      <div className="lg:hidden order-1 px-0.5">
        <p className="text-[22px] font-extrabold text-[#111D37] leading-tight">반갑습니다, 사용자님 👋</p>
        <p className="text-[14px] text-[#5B6472] mt-1">오늘도 블루에그와 함께 성장해요.</p>
      </div>

      {/* ── 공지사항(좌) + 고객 인터뷰(우) · 모바일에선 하단 배치 ── */}
      <section className="order-3 lg:order-1 grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">

        {/* 공지사항 */}
        <div className={`${CARD} overflow-hidden flex flex-col`} style={SHADOW}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F2F4F6] shrink-0">
            <div className="flex items-center gap-3">
              <Icon3D name="bell" className="w-11 h-11 shrink-0 -ml-1" />
              <div>
                <p className="text-[19px] font-bold text-[#111D37]">공지사항</p>
                <p className="text-[13px] text-[#99A0AC] mt-0.5">BlueEgg 새소식</p>
              </div>
            </div>
            <Link href="/marketing/notices" className="flex items-center gap-1 text-[13px] font-semibold text-[#5B6472] hover:text-[#0D3473] transition-colors">
              더보기
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          <div className="flex-1 px-2 py-2">
            {notices.length === 0 && (
              <p className="px-4 py-8 text-center text-[14px] text-[#B0B8C1]">등록된 공지사항이 없습니다.</p>
            )}
            {notices.map((item) => (
              <Link key={item.id} href="/marketing/notices" className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl hover:bg-[#F5F6F8] transition-colors cursor-pointer group">
                {item.isNew
                  ? <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#0D3473] text-white shrink-0">NEW</span>
                  : <span className="w-[28px] shrink-0" />}
                <p className="flex-1 text-[15px] text-[#2B3648] truncate group-hover:text-[#0D3473] transition-colors">{item.title}</p>
                <span className="text-[12px] text-[#B0B8C1] shrink-0 tabular-nums">{item.date}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* 고객사 인터뷰 배너 */}
        <div className="relative rounded-2xl overflow-hidden flex flex-col justify-between p-6"
          style={{ background: "radial-gradient(135% 120% at 74% -8%, #2A4C86 0%, #17335F 42%, #0B1A38 100%)", boxShadow: "0 6px 18px rgba(13,52,115,0.18), 0 2px 6px rgba(17,29,55,0.08)" }}>

          {/* 상단: 뱃지 + 후기 더보기 */}
          <div className="relative z-10 flex items-start justify-between">
            <span className="text-[11px] font-extrabold px-3 py-1.5 rounded-full text-white tracking-widest uppercase" style={{ background: "rgba(255,255,255,0.16)" }}>고객 인터뷰</span>
            <Link href="/marketing/community/board"
              className="flex items-center gap-1 text-[12px] font-bold text-white/60 hover:text-white transition-colors">
              후기 더보기
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>

          {/* 중단: 인용문 + 고객 정보 (익명) */}
          <div className="relative z-10 my-4">
            <svg className="w-8 h-8 mb-2 text-white/25" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M7.5 6C5 6 3 8 3 10.5S5 15 7.5 15c.3 0 .6 0 .9-.1C7.8 16.7 6.3 18 4.5 18.4c-.4.1-.6.5-.5.9.1.4.5.7.9.6C8.6 19 11 15.9 11 12v-1.5C11 8 9 6 7.5 6zm10 0C15 6 13 8 13 10.5S15 15 17.5 15c.3 0 .6 0 .9-.1-.6 1.8-2.1 3.1-3.9 3.5-.4.1-.6.5-.5.9.1.4.5.7.9.6 3.7-.9 6.1-4 6.1-7.9v-1.5C21 8 19 6 17.5 6z" />
            </svg>
            <p key={`q-${interviewIdx}`} className="animate-be-fade min-h-[76px] text-[27px] font-extrabold text-white leading-[1.35] tracking-[-0.01em] break-keep">
              &ldquo;{interview.line1}<br />{interview.line2}&rdquo;
            </p>
            <div className="flex items-center justify-between gap-2.5 mt-4">
              <div key={`c-${interviewIdx}`} className="animate-be-fade flex items-center gap-2.5 min-w-0">
                <span className="h-9 w-9 rounded-full flex items-center justify-center text-[18px] shrink-0"
                  style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}>{interview.emoji}</span>
                <p className="text-[14px] font-bold text-white leading-tight truncate">{interview.role}</p>
              </div>
              {/* 롤링 인디케이터 */}
              <div className="flex items-center gap-1.5 shrink-0">
                {INTERVIEWS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setInterviewIdx(i)}
                    aria-label={`인터뷰 ${i + 1}`}
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: i === interviewIdx ? 16 : 6, background: i === interviewIdx ? "#93B4E8" : "rgba(255,255,255,0.28)" }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 하단: 성과 지표 3개 (전체 너비) */}
          <div key={`m-${interviewIdx}`} className="animate-be-fade relative z-10 grid grid-cols-3 gap-2.5">
            {interview.metrics.map((s) => (
              <div key={s.label} className="flex flex-col items-center justify-center gap-1 py-3.5 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
                <span className="text-[16px] font-extrabold text-white tabular-nums">{s.value}</span>
                <span className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. 현재 운영중인 캠페인 ── */}
      {/* ── 4. 현재 운영중인 캠페인(좌) + 내 캠페인 순위 추적하기(우) ── */}
      <section className="order-2 grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">

        {/* 현재 운영중인 캠페인 */}
        <div className={`${CARD} overflow-hidden flex flex-col`} style={SHADOW}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F2F4F6] shrink-0">
            <div className="flex items-center gap-3">
              <Icon3D name="clipboard" className="w-11 h-11 shrink-0 -ml-1" />
              <div>
                <p className="text-[19px] font-bold text-[#111D37]">현재 운영중인 캠페인</p>
                <p className="text-[13px] text-[#99A0AC] mt-0.5">진행 중인 캠페인 현황</p>
              </div>
            </div>
            <Link href="/marketing/my/campaigns" className="flex items-center gap-1 text-[13px] font-semibold text-[#5B6472] hover:text-[#0D3473] transition-colors">
              전체보기
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          <div className="flex-1 px-4 py-3 space-y-2">
            {CAMPAIGNS.map((c) => (
              <div key={c.id}
                className="flex items-center gap-3.5 px-3 py-3 rounded-xl hover:bg-[#F5F6F8] transition-colors group cursor-pointer border border-transparent hover:border-[#E2E6ED]">
                <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-[15px] font-bold shrink-0"
                  style={{ background: c.avatarColor, boxShadow: `0 2px 8px ${c.avatarColor}55` }}>
                  {c.reviewer.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-[12px] font-bold px-2 py-0.5 rounded-md ${c.statusColor}`}>{c.status}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${c.channelColor}`}>{c.channel}</span>
                  </div>
                  <p className="text-[15px] font-semibold text-[#2B3648] truncate group-hover:text-[#0D3473] transition-colors">{c.product}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {c.status === "진행중" && (
                      <div className="w-24 h-1.5 bg-[#F2F4F6] rounded-full overflow-hidden">
                        <div className="h-full bg-[#0D3473] rounded-full" style={{ width: `${c.progress}%` }} />
                      </div>
                    )}
                    <span className="text-[12px] text-[#B0B8C1] whitespace-nowrap tabular-nums">{c.dateFrom} ~ {c.dateTo}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[13px] font-bold text-[#2B3648]">{c.reviewer}</p>
                  <p className="text-[12px] text-[#99A0AC]">{c.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 내 캠페인 순위 추적하기 */}
        <div className={`${CARD} p-6 flex flex-col`} style={SHADOW}>
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <Icon3D name="chart" className="w-11 h-11 shrink-0 -ml-1" />
              <div>
                <p className="text-[19px] font-bold text-[#111D37]">내 캠페인 순위 추적하기</p>
                <p className="text-[13px] text-[#99A0AC] mt-0.5">채널별 순위 변동 확인</p>
              </div>
            </div>
            <Link href="/marketing/rank" className="flex items-center gap-1 text-[13px] font-semibold text-[#0D3473] hover:underline">
              등록하기
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4 shrink-0">
            {(["네이버 플레이스", "네이버 쇼핑"] as const).map((ch) => {
              const active = rankChannel === ch;
              const cfg: Record<string, { on: string; off: string }> = {
                "네이버 플레이스": { on: "bg-emerald-500 text-white", off: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
                "네이버 쇼핑": { on: "bg-[#0D3473] text-white", off: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
              };
              return (
                <button key={ch} type="button" onClick={() => setRankChannel(ch)}
                  className={`px-3 py-1.5 rounded-xl text-[13px] font-bold transition-all ${active ? cfg[ch].on : cfg[ch].off}`}>
                  {ch}
                </button>
              );
            })}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100 ml-auto">
              <span className="text-[13px] font-bold text-emerald-600">74위 → 8위</span>
              <span className="text-[12px] text-emerald-500 font-semibold">↑66</span>
            </div>
          </div>

          <div className="shrink-0 mb-3">
            <select value={rankStore} onChange={(e) => setRankStore(e.target.value)}
              className="w-full border border-[#E2E6ED] rounded-xl px-4 py-2.5 text-[15px] text-[#2B3648] bg-white focus:outline-none focus:border-[#0D3473] focus:ring-2 focus:ring-[#0D3473]/10 transition-all">
              {RANK_STORES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex-1 bg-[#FAFBFC] rounded-2xl border border-[#F2F4F6] px-3 py-2">
            <RankLineChart />
          </div>
        </div>
      </section>


    </div>
  );
}
