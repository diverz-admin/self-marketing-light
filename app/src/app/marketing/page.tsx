"use client";

import React, { useState } from "react";
import Link from "next/link";

const CARD = "bg-white rounded-2xl border border-[#E5E8EB]";
const SHADOW = { boxShadow: "0 2px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)" };

/* ── 캠페인 데이터 ── */
const CAMPAIGNS = [
  { id: 1, status: "반려", statusColor: "bg-red-50 text-red-500", channel: "네이버 플레이스", channelColor: "bg-emerald-50 text-emerald-700", product: "아우라 방향제", reviewer: "앤드류", count: "1건", dateFrom: "2025-07-02", dateTo: "2025-07-11", progress: 0, avatarColor: "#0341C7" },
  { id: 2, status: "진행중", statusColor: "bg-blue-50 text-blue-600", channel: "네이버 쇼핑", channelColor: "bg-blue-50 text-blue-700", product: "버터플라이 자켓", reviewer: "김소현", count: "3건", dateFrom: "2025-07-10", dateTo: "2025-07-20", progress: 45, avatarColor: "#00B493" },
  { id: 3, status: "완료", statusColor: "bg-gray-100 text-gray-500", channel: "쿠팡", channelColor: "bg-orange-50 text-orange-700", product: "아우라 패딩", reviewer: "이준혁", count: "2건", dateFrom: "2025-06-20", dateTo: "2025-06-30", progress: 100, avatarColor: "#8B5CF6" },
];

/* ── Rank Chart ── */
const RANK_DATA = [
  { date: "10-29", rank: 74 }, { date: "10-30", rank: 53 },
  { date: "10-31", rank: 36 }, { date: "11-01", rank: 34 },
  { date: "11-02", rank: 19 }, { date: "11-03", rank: 18 },
  { date: "11-04", rank: 16 }, { date: "11-05", rank: 8 },
];
const RANK_STORES = ["아우라 패딩 | 아우라 패딩", "버터플라이 | 여성 자켓"];

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
          <stop offset="0%" stopColor="#0341C7" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0341C7" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
        <line key={i} x1={pL} y1={pT + iH * f} x2={W - pR} y2={pT + iH * f} stroke="#F2F4F6" strokeWidth={1} />
      ))}
      <polygon points={area} fill="url(#rankFill)" />
      <polyline points={polyline} fill="none" stroke="#0341C7" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4.5} fill="white" stroke="#0341C7" strokeWidth={2} />
          <text x={p.x} y={p.y - 11} textAnchor="middle" fontSize={10} fontWeight={700} fill="#0341C7">{p.rank}</text>
          <text x={p.x} y={H - 4} textAnchor="middle" fontSize={9.5} fill="#B0B8C1">{p.date}</text>
        </g>
      ))}
    </svg>
  );
}

/* ── Page ── */
export default function MarketingDashboardPage() {
  const [rankChannel, setRankChannel] = useState<"네이버 플레이스" | "네이버 쇼핑">("네이버 쇼핑");
  const [rankStore, setRankStore] = useState(RANK_STORES[0]);

  return (
    <div className="w-full space-y-5">

      {/* ── 공지사항(좌) + 신규 기능 포인트 배너(우) ── */}
      <section className="grid grid-cols-2 gap-4 items-stretch">

        {/* 공지사항 */}
        <div className={`${CARD} overflow-hidden flex flex-col`} style={SHADOW}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F2F4F6] shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(145deg,#60A5FA,#0341C7)", boxShadow: "0 4px 12px rgba(3,65,199,0.35)" }}>
                <svg className="w-[17px] h-[17px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
                </svg>
              </div>
              <div>
                <p className="text-[15px] font-bold text-[#191F28]">공지사항</p>
                <p className="text-[12px] text-[#8B95A1] mt-0.5">다이버즈 새소식</p>
              </div>
            </div>
            <Link href="/marketing/notices" className="flex items-center gap-1 text-[12px] font-semibold text-[#6B7684] hover:text-[#0341C7] transition-colors">
              더보기
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          <div className="flex-1 px-2 py-2">
            {[
              { title: "6월 1주차 최신 레퍼런스 공유", date: "06.11", isNew: true },
              { title: "통합 순위관리 기능 오픈 안내", date: "06.10", isNew: true },
              { title: "AI 주문 시스템 안정화 완료 안내", date: "05.31", isNew: false },
              { title: "AI 주문 시스템 긴급 안정화 작업 안내", date: "05.31", isNew: false },
              { title: "쇼핑·쿠팡 AI 주문 기능 출시 예정", date: "05.18", isNew: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl hover:bg-[#F9FAFB] transition-colors cursor-pointer group">
                {item.isNew
                  ? <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#0341C7] text-white shrink-0">NEW</span>
                  : <span className="w-[28px] shrink-0" />}
                <p className="flex-1 text-[13px] text-[#333D4B] truncate group-hover:text-[#0341C7] transition-colors">{item.title}</p>
                <span className="text-[11px] text-[#B0B8C1] shrink-0 tabular-nums">{item.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 신규 기능 포인트 배너 */}
        <div className="relative rounded-2xl overflow-hidden flex flex-col justify-between p-6"
          style={{ background: "linear-gradient(145deg,#F59E0B 0%,#D97706 50%,#B45309 100%)", boxShadow: "0 12px 40px rgba(245,158,11,0.30), 0 4px 12px rgba(0,0,0,0.08)" }}>
          <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.07)" }} />
          <div className="absolute -left-6 -bottom-8 w-40 h-40 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.05)" }} />

          {/* 상단: 뱃지 + 코인 아이콘 */}
          <div className="relative z-10 flex items-start justify-between">
            <span className="text-[10px] font-extrabold px-3 py-1.5 rounded-full text-white tracking-widest uppercase" style={{ background: "rgba(255,255,255,0.2)" }}>NEW SERVICE</span>
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.18)", boxShadow: "0 4px 16px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)" }}>
              <svg width="34" height="34" viewBox="0 0 38 38" fill="none">
                <circle cx="19" cy="19" r="16" fill="#FDE68A" />
                <circle cx="19" cy="19" r="16" stroke="#D97706" strokeWidth="1.2" fill="none" strokeOpacity="0.4" />
                <text x="19" y="25.5" textAnchor="middle" fontSize="18" fontWeight="900" fill="#7C2D12" fillOpacity="0.85" fontFamily="system-ui,sans-serif">P</text>
                <ellipse cx="13.5" cy="11" rx="6.5" ry="3.8" fill="white" fillOpacity="0.35" transform="rotate(-30 13.5 11)" />
              </svg>
            </div>
          </div>

          {/* 중단: 타이틀 + 설명 */}
          <div className="relative z-10 my-4">
            <h3 className="text-[20px] font-extrabold text-white leading-tight tracking-tight mb-2">
              신규 서비스 이용 시<br />포인트 최대 <span className="text-amber-200">3배</span> 적립!
            </h3>
            <p className="text-[12.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
              쇼핑·쿠팡·플레이스 리뷰 캠페인<br />신규 이용 시 포인트를 3배로 드립니다.
            </p>
          </div>

          {/* 하단: 서비스 뱃지 + CTA */}
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex gap-2">
              {[{ label: "쇼핑", icon: "🛍️" }, { label: "쿠팡", icon: "📦" }, { label: "플레이스", icon: "📍" }].map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.22)" }}>
                  <span className="text-[18px] leading-none">{s.icon}</span>
                  <span className="text-[10px] font-bold text-white">{s.label}</span>
                  <span className="text-[9px] font-extrabold text-amber-200">×3 P</span>
                </div>
              ))}
            </div>
            <Link href="/marketing/my/charge"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-[#B45309] text-[12px] font-extrabold hover:bg-white/90 transition-all whitespace-nowrap"
              style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
              충전하기
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. 현재 운영중인 캠페인 ── */}
      {/* ── 4. 현재 운영중인 캠페인(좌) + 내 캠페인 순위 추적하기(우) ── */}
      <section className="grid grid-cols-2 gap-4 items-stretch">

        {/* 현재 운영중인 캠페인 */}
        <div className={`${CARD} overflow-hidden flex flex-col`} style={SHADOW}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F2F4F6] shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(145deg,#3B82F6,#0341C7)", boxShadow: "0 4px 12px rgba(3,65,199,0.35)" }}>
                <svg className="w-[17px] h-[17px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                </svg>
              </div>
              <div>
                <p className="text-[15px] font-bold text-[#191F28]">현재 운영중인 캠페인</p>
                <p className="text-[12px] text-[#8B95A1] mt-0.5">진행 중인 캠페인 현황</p>
              </div>
            </div>
            <Link href="/marketing/my/campaigns" className="flex items-center gap-1 text-[12px] font-semibold text-[#6B7684] hover:text-[#0341C7] transition-colors">
              전체보기
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          <div className="flex-1 px-4 py-3 space-y-2">
            {CAMPAIGNS.map((c) => (
              <div key={c.id}
                className="flex items-center gap-3.5 px-3 py-3 rounded-xl hover:bg-[#F9FAFB] transition-colors group cursor-pointer border border-transparent hover:border-[#E5E8EB]">
                <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0"
                  style={{ background: c.avatarColor, boxShadow: `0 2px 8px ${c.avatarColor}55` }}>
                  {c.reviewer.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${c.statusColor}`}>{c.status}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${c.channelColor}`}>{c.channel}</span>
                  </div>
                  <p className="text-[13px] font-semibold text-[#333D4B] truncate group-hover:text-[#0341C7] transition-colors">{c.product}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {c.status === "진행중" && (
                      <div className="w-24 h-1.5 bg-[#F2F4F6] rounded-full overflow-hidden">
                        <div className="h-full bg-[#0341C7] rounded-full" style={{ width: `${c.progress}%` }} />
                      </div>
                    )}
                    <span className="text-[11px] text-[#B0B8C1] whitespace-nowrap tabular-nums">{c.dateFrom} ~ {c.dateTo}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[12px] font-bold text-[#333D4B]">{c.reviewer}</p>
                  <p className="text-[11px] text-[#8B95A1]">{c.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 내 캠페인 순위 추적하기 */}
        <div className={`${CARD} p-6 flex flex-col`} style={SHADOW}>
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(145deg,#A78BFA,#7C3AED)", boxShadow: "0 4px 12px rgba(124,58,237,0.35)" }}>
                <svg className="w-[17px] h-[17px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
              <div>
                <p className="text-[15px] font-bold text-[#191F28]">내 캠페인 순위 추적하기</p>
                <p className="text-[12px] text-[#8B95A1] mt-0.5">채널별 순위 변동 확인</p>
              </div>
            </div>
            <Link href="/marketing/rank" className="flex items-center gap-1 text-[12px] font-semibold text-[#0341C7] hover:underline">
              등록하기
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4 shrink-0">
            {(["네이버 플레이스", "네이버 쇼핑"] as const).map((ch) => {
              const active = rankChannel === ch;
              const cfg: Record<string, { on: string; off: string }> = {
                "네이버 플레이스": { on: "bg-emerald-500 text-white", off: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
                "네이버 쇼핑": { on: "bg-[#0341C7] text-white", off: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
              };
              return (
                <button key={ch} type="button" onClick={() => setRankChannel(ch)}
                  className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all ${active ? cfg[ch].on : cfg[ch].off}`}>
                  {ch}
                </button>
              );
            })}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100 ml-auto">
              <span className="text-[12px] font-bold text-emerald-600">74위 → 8위</span>
              <span className="text-[11px] text-emerald-500 font-semibold">↑66</span>
            </div>
          </div>

          <div className="shrink-0 mb-3">
            <select value={rankStore} onChange={(e) => setRankStore(e.target.value)}
              className="w-full border border-[#E5E8EB] rounded-xl px-4 py-2.5 text-[13px] text-[#333D4B] bg-white focus:outline-none focus:border-[#0341C7] focus:ring-2 focus:ring-[#0341C7]/10 transition-all">
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
