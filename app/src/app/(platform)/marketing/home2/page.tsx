"use client";

import React, { useState } from "react";
import Link from "next/link";

const Y = "#0D3473";        // 메인 옐로우
const YD = "#0D2148";       // 다크 옐로우
const YDD = "#0A2540";      // 더 다크
const YL = "#EAEFF9";       // 라이트 배경

/* ── Rank Line Chart (yellow) ── */
const RANK_CHART_TABS = ["통합스토어", "가격비교"] as const;
const RANK_STORES = ["블루에그 패딩 | 블루에그 패딩", "버터플라이 | 여성 자켓"];
const RANK_DATA = [
  { date: "10-29", rank: 74 }, { date: "10-29", rank: 35 },
  { date: "10-30", rank: 53 }, { date: "10-30", rank: 36 },
  { date: "10-31", rank: 36 }, { date: "11-01", rank: 34 },
  { date: "11-02", rank: 19 }, { date: "11-03", rank: 18 },
  { date: "11-04", rank: 16 }, { date: "11-05", rank: 8 },
];

function RankLineChart() {
  const W = 520, H = 180, pL = 20, pR = 20, pT = 32, pB = 36;
  const iW = W - pL - pR, iH = H - pT - pB, n = RANK_DATA.length;
  const maxR = Math.max(...RANK_DATA.map(d => d.rank));
  const step = iW / (n - 1);
  const pts = RANK_DATA.map((d, i) => ({ x: pL + i * step, y: pT + (d.rank / maxR) * iH, ...d }));
  const polyline = pts.map(p => `${p.x},${p.y}`).join(" ");
  const area = `${pts[0].x},${pT + iH} ${polyline} ${pts[n - 1].x},${pT + iH}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
      <defs>
        <linearGradient id="rankFillY" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={Y} stopOpacity="0.25" />
          <stop offset="100%" stopColor={Y} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 0.33, 0.66, 1].map((f, i) => (
        <line key={i} x1={pL} y1={pT + iH * f} x2={W - pR} y2={pT + iH * f} stroke="#F2F4F6" strokeWidth={1} />
      ))}
      <polygon points={area} fill="url(#rankFillY)" />
      <polyline points={polyline} fill="none" stroke={Y} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="white" stroke={Y} strokeWidth={2} />
          <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize={10} fontWeight={600} fill="#4E5968">{p.rank}</text>
        </g>
      ))}
      {pts.map((p, i) => (
        <text key={i} x={p.x} y={H - 4} textAnchor="middle" fontSize={9.5} fill="#99A0AC">{p.date}</text>
      ))}
    </svg>
  );
}

/* ── Campaign Data ── */
const CAMPAIGNS = [
  { id: 1, status: "반려", statusColor: "bg-red-50 text-red-500", channel: "네이버 플레이스", channelColor: "bg-emerald-50 text-emerald-700", product: "블루에그 방향제", reviewer: "앤드류", count: "1건", dateFrom: "2025-07-02", dateTo: "2025-07-11", avatarColor: Y },
  { id: 2, status: "진행중", statusColor: "bg-amber-50 text-amber-600", channel: "네이버 쇼핑", channelColor: "bg-blue-50 text-blue-700", product: "버터플라이 자켓", reviewer: "김소현", count: "3건", dateFrom: "2025-07-10", dateTo: "2025-07-20", avatarColor: "#00B493" },
  { id: 3, status: "완료", statusColor: "bg-gray-100 text-gray-500", channel: "쿠팡", channelColor: "bg-orange-50 text-orange-700", product: "블루에그 패딩", reviewer: "이준혁", count: "2건", dateFrom: "2025-06-20", dateTo: "2025-06-30", avatarColor: "#8B5CF6" },
];

const CARD = "bg-white rounded-2xl border border-[#E2E6ED]";
const SHADOW = { boxShadow: "0 2px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)" };

/* ── 3D Stat Icons (yellow palette) ── */
function Icon3DClipboard() {
  return (
    <svg width="54" height="54" viewBox="0 0 54 54" fill="none" style={{ filter: "drop-shadow(0 7px 14px rgba(13,52,115,0.45))", flexShrink: 0 }}>
      <defs>
        <linearGradient id="ycbBg" x1="0" y1="0" x2="54" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#93B4E8"/><stop offset="0.55" stopColor="#0D3473"/><stop offset="1" stopColor="#0D2148"/>
        </linearGradient>
        <linearGradient id="ycbPaper" x1="10" y1="4" x2="45" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF"/><stop offset="1" stopColor="#EAEFF9"/>
        </linearGradient>
        <linearGradient id="ycbHl" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="white" stopOpacity="0.5"/><stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <rect x="7" y="15" width="38" height="33" rx="7" fill="url(#ycbBg)"/>
      <rect x="11" y="6" width="32" height="42" rx="6" fill="url(#ycbPaper)"/>
      <rect x="19" y="3" width="16" height="10" rx="5" fill="#93B4E8"/>
      <rect x="21" y="4.5" width="12" height="7" rx="3.5" fill="#C4D6F0"/>
      <rect x="17" y="21" width="20" height="2.2" rx="1.1" fill="#6E97D6"/>
      <rect x="17" y="27" width="15" height="2.2" rx="1.1" fill="#6E97D6"/>
      <rect x="17" y="33" width="18" height="2.2" rx="1.1" fill="#6E97D6"/>
      <rect x="17" y="39" width="11" height="2.2" rx="1.1" fill="#6E97D6"/>
      <rect x="11" y="6" width="32" height="42" rx="6" fill="url(#ycbHl)"/>
      <ellipse cx="21" cy="14" rx="10" ry="6" fill="white" fillOpacity="0.22" transform="rotate(-18 21 14)"/>
    </svg>
  );
}

function Icon3DStar() {
  return (
    <svg width="54" height="54" viewBox="0 0 54 54" fill="none" style={{ filter: "drop-shadow(0 7px 14px rgba(13,52,115,0.45))", flexShrink: 0 }}>
      <defs>
        <linearGradient id="yStarGrad" x1="5" y1="4" x2="49" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#93B4E8"/><stop offset="0.5" stopColor="#0D3473"/><stop offset="1" stopColor="#0A2540"/>
        </linearGradient>
        <linearGradient id="yStarHl" x1="5" y1="4" x2="30" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.52"/><stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d="M27,4 L33,18.5 L48.5,20 L37.5,30.5 L40.5,46 L27,38.5 L13.5,46 L16.5,30.5 L5.5,20 L21,18.5 Z" fill="url(#yStarGrad)"/>
      <path d="M27,4 L33,18.5 L48.5,20 L37.5,30.5 L40.5,46 L27,38.5 L13.5,46 L16.5,30.5 L5.5,20 L21,18.5 Z" fill="url(#yStarHl)"/>
      <ellipse cx="22" cy="14" rx="9" ry="5.5" fill="white" fillOpacity="0.28" transform="rotate(-30 22 14)"/>
    </svg>
  );
}

function Icon3DChart() {
  return (
    <svg width="54" height="54" viewBox="0 0 54 54" fill="none" style={{ filter: "drop-shadow(0 7px 14px rgba(13,52,115,0.45))", flexShrink: 0 }}>
      <defs>
        <linearGradient id="yChartBg" x1="0" y1="0" x2="54" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#93B4E8"/><stop offset="0.5" stopColor="#0D3473"/><stop offset="1" stopColor="#0A2540"/>
        </linearGradient>
        <linearGradient id="yChartHl" x1="3" y1="3" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.30"/><stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="48" height="48" rx="13" fill="url(#yChartBg)"/>
      <rect x="3" y="3" width="48" height="48" rx="13" fill="url(#yChartHl)"/>
      <rect x="10" y="35" width="9" height="13" rx="2.5" fill="white" fillOpacity="0.92"/>
      <rect x="23" y="26" width="9" height="22" rx="2.5" fill="white" fillOpacity="0.92"/>
      <rect x="36" y="16" width="9" height="32" rx="2.5" fill="white" fillOpacity="0.92"/>
      <path d="M37 10 L45 10 L45 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85"/>
      <line x1="35" y1="13" x2="45" y2="10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.85"/>
    </svg>
  );
}

function Icon3DCoin() {
  return (
    <svg width="54" height="54" viewBox="0 0 54 54" fill="none" style={{ filter: "drop-shadow(0 7px 14px rgba(13,52,115,0.48))", flexShrink: 0 }}>
      <defs>
        <radialGradient id="yCoinGrad" cx="0.35" cy="0.3" r="0.78">
          <stop offset="0%" stopColor="#93B4E8"/>
          <stop offset="45%" stopColor="#0D3473"/>
          <stop offset="100%" stopColor="#0A2540"/>
        </radialGradient>
      </defs>
      <circle cx="27" cy="27" r="24" fill="url(#yCoinGrad)"/>
      <circle cx="27" cy="27" r="24" stroke="#0D2148" strokeWidth="1.5" fill="none" strokeOpacity="0.5"/>
      <circle cx="27" cy="27" r="20" stroke="#0D3473" strokeWidth="1" fill="none" strokeOpacity="0.35"/>
      <text x="27" y="35" textAnchor="middle" fontSize="24" fontWeight="900" fill="#0A2540" fontFamily="system-ui,sans-serif" fillOpacity="0.85">P</text>
      <ellipse cx="20" cy="17" rx="9" ry="5.5" fill="white" fillOpacity="0.38" transform="rotate(-30 20 17)"/>
    </svg>
  );
}

/* ── Page ── */
export default function Home2Page() {
  const [rankChannel, setRankChannel] = useState<"네이버 플레이스" | "네이버 쇼핑" | "쿠팡">("네이버 쇼핑");
  const [rankTab, setRankTab] = useState<typeof RANK_CHART_TABS[number]>("통합스토어");
  const [rankStore, setRankStore] = useState(RANK_STORES[0]);
  const [campaignIdx, setCampaignIdx] = useState(0);
  const campaign = CAMPAIGNS[campaignIdx];

  return (
    <div className="w-full space-y-4">

      {/* ── 통계 카드 2×2 + 배너 ── */}
      <div className="flex gap-3 items-stretch">

        {/* 왼쪽: 통계 카드 2×2 */}
        <div className="grid grid-cols-2 gap-3 flex-1 min-w-0">
          {[
            { label: "진행중인 캠페인", value: "2",  unit: "건", change: "+1",     up: true,  icon: <Icon3DClipboard /> },
            { label: "완료된 리뷰",    value: "14", unit: "건", change: "+3",     up: true,  icon: <Icon3DStar />     },
            { label: "순위 추적 상품", value: "5",  unit: "개", change: "+2",     up: true,  icon: <Icon3DChart />    },
            { label: "사용 가능 포인트", value: "0", unit: "P", change: "충전필요", up: false, icon: <Icon3DCoin />     },
          ].map((s, i) => (
            <div key={i} className={`${CARD} px-4 py-3.5 flex items-center gap-3.5 relative overflow-hidden`} style={SHADOW}>
              <span className={`absolute top-2.5 right-3 text-[11px] font-bold px-2 py-0.5 rounded-full ${s.up ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                {s.change}
              </span>
              {s.icon}
              <div className="min-w-0">
                <p className="text-[12px] text-[#99A0AC] font-medium mb-1 leading-none">{s.label}</p>
                <p className="text-[29px] font-extrabold text-[#111D37] leading-none tracking-tight">
                  {s.value}<span className="text-[15px] font-semibold text-[#99A0AC] ml-1">{s.unit}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 오른쪽: 노란 배너 */}
        <div className="rounded-2xl overflow-hidden relative shrink-0 w-[360px]"
          style={{ background: `linear-gradient(145deg,#6E97D6 0%,${Y} 45%,${YD} 100%)`, boxShadow: `0 8px 32px rgba(13,52,115,0.40), 0 2px 8px rgba(0,0,0,0.10)` }}>

          {/* 배경 장식 원 */}
          <div className="absolute pointer-events-none" style={{ right: "-30px", top: "50%", transform: "translateY(-50%)", width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.20)" }} />
          <div className="absolute pointer-events-none" style={{ right: "-60px", top: "50%", transform: "translateY(-50%)", width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }} />

          <div className="relative h-full flex items-center px-6 py-5 gap-4">
            {/* 텍스트 영역 */}
            <div className="flex flex-col justify-between h-full min-w-0 flex-1">
              {/* NEW 뱃지 */}
              <div className="mb-3">
                <span className="inline-block text-[13px] font-extrabold px-3.5 py-1 rounded-full bg-white tracking-tight"
                  style={{ color: YD, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>NEW</span>
              </div>
              <div className="flex-1">
                <h3 className="text-[21px] font-extrabold leading-[1.3] tracking-tight mb-2.5" style={{ color: "#FFFFFF" }}>
                  AI 자동 주문 시스템이<br />오픈되었습니다!
                </h3>
                <p className="text-[13px] leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.72)" }}>
                  쇼핑·쿠팡 캠페인을 AI가 자동으로<br />생성하고 최적의 리뷰어를 매칭합니다.
                </p>
              </div>
              {/* CTA 버튼 */}
              <Link href="/marketing/reward/shopping"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-white text-[15px] font-extrabold hover:bg-white/90 transition-colors"
                style={{ color: YD, boxShadow: "0 4px 16px rgba(0,0,0,0.14)" }}>
                지금 시작하기
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
              </Link>
            </div>

            {/* 앱 목업 카드 */}
            <div className="shrink-0 relative" style={{ width: 120 }}>
              <div className="rounded-2xl bg-white p-3 relative z-10" style={{ boxShadow: "0 12px 32px rgba(0,0,0,0.18)" }}>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <div className="h-5 w-5 rounded-lg flex items-center justify-center shrink-0" style={{ background: Y }}>
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/></svg>
                  </div>
                  <span className="text-[10px] font-bold text-[#111D37] truncate">AI 캠페인</span>
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                </div>
                <div className="space-y-1.5 mb-2.5">
                  <div className="h-1.5 rounded-full bg-[#E2E6ED]" style={{ width: "85%" }} />
                  <div className="h-1.5 rounded-full bg-[#E2E6ED]" style={{ width: "65%" }} />
                  <div className="h-1.5 rounded-full bg-[#E2E6ED]" style={{ width: "75%" }} />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#F2F4F6]">
                  <span className="text-[9px] text-[#99A0AC]">매칭된 리뷰어</span>
                  <span className="text-[10px] font-extrabold" style={{ color: YD }}>12명</span>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-2 border-white flex items-center justify-center z-20"
                style={{ background: YD, boxShadow: `0 4px 12px ${Y}88` }}>
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 공지사항 + 인기 광고 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* 공지사항 */}
        <div className={`${CARD} overflow-hidden`} style={SHADOW}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F2F4F6]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden"
                style={{ background: `linear-gradient(145deg,#93B4E8,${Y} 55%,${YD})`, boxShadow: `0 6px 16px ${Y}66, inset 0 1px 0 rgba(255,255,255,0.28)` }}>
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(145deg,rgba(255,255,255,0.20) 0%,transparent 55%)" }} />
                <svg className="w-[18px] h-[18px] relative z-10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.2} style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.18))" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
                </svg>
              </div>
              <div>
                <p className="text-[17px] font-bold text-[#111D37]">공지사항</p>
                <p className="text-[13px] text-[#99A0AC] mt-0.5">BlueEgg 새소식</p>
              </div>
            </div>
            <Link href="/marketing/notices" className="flex items-center gap-1 text-[13px] font-semibold text-[#5B6472] transition-colors" style={{ }} onMouseEnter={e => (e.currentTarget.style.color = YD)} onMouseLeave={e => (e.currentTarget.style.color = "#5B6472")}>
              더보기 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </Link>
          </div>
          <div className="px-2 py-2">
            {[
              { title: "BlueEgg 6월 1주차 최신 레퍼런스 공유", date: "06.11", isNew: true },
              { title: "[신규 기능 안내] 통합 순위관리 기능 오픈", date: "06.10", isNew: true },
              { title: "[공지] 순위체크 및 AI 주문 시스템 긴급 안정화 작업 완료 안내", date: "05.31", isNew: false },
              { title: "[공지] 순위체크 및 AI 주문 시스템 긴급 안정화 작업 안내", date: "05.31", isNew: false },
              { title: "BlueEgg에 곧 쇼핑,쿠팡 AI 주문 기능이 생성됩니다!", date: "05.18", isNew: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#EAEFF9] transition-colors cursor-pointer group">
                {item.isNew
                  ? <span className="text-[11px] font-extrabold px-1.5 py-0.5 rounded-md text-white shrink-0" style={{ background: Y, color: "#000" }}>NEW</span>
                  : <span className="w-[34px] shrink-0" />}
                <p className="flex-1 text-[15px] text-[#2B3648] truncate group-hover:transition-colors" style={{}}>{item.title}</p>
                <span className="text-[12px] text-[#B0B8C1] shrink-0 tabular-nums">{item.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 인기 광고 */}
        <div className={`${CARD} overflow-hidden`} style={SHADOW}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F2F4F6]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden"
                style={{ background: "linear-gradient(145deg,#FFA07A,#FF6B35 55%,#E84B1A)", boxShadow: "0 6px 16px rgba(255,107,53,0.38), inset 0 1px 0 rgba(255,255,255,0.28)" }}>
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(145deg,rgba(255,255,255,0.20) 0%,transparent 55%)" }} />
                <svg className="w-[18px] h-[18px] text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.18))" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
              <div>
                <p className="text-[17px] font-bold text-[#111D37]">인기 광고</p>
                <p className="text-[13px] text-[#99A0AC] mt-0.5">웍스 광고 매출 TOP</p>
              </div>
            </div>
            <span className="text-[12px] font-extrabold px-2.5 py-1 rounded-full bg-red-500 text-white">HOT</span>
          </div>
          <div className="px-2 py-2">
            {[
              { name: "플레이스 (모든매체사)", badge: "HOT", badgeClass: "bg-red-500 text-white", icon: "🌐", rank: 1, rankBg: "linear-gradient(135deg,#0D3473,#F97316)" },
              { name: "플레이스 (맛집전용)", badge: "HOT", badgeClass: "bg-red-500 text-white", icon: "🍗", rank: 2, rankBg: "linear-gradient(135deg,#94A3B8,#64748B)" },
              { name: "플레이스 (맛집체크)", badge: "NEW", badgeClass: "bg-violet-500 text-white", icon: "✅", rank: 3, rankBg: "linear-gradient(135deg,#CD853F,#A0522D)" },
              { name: "쇼핑 (오픈매장식)", badge: "NEW", badgeClass: "bg-violet-500 text-white", icon: "🛍️", rank: 4, rankBg: "linear-gradient(135deg,#6B7280,#4B5563)" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#EAEFF9] transition-colors cursor-pointer group">
                <div className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[12px] font-extrabold shrink-0" style={{ background: item.rankBg }}>{item.rank}</div>
                <div className="h-9 w-9 rounded-xl bg-[#F5F6F8] border border-[#E2E6ED] flex items-center justify-center shrink-0 text-[18px]">{item.icon}</div>
                <p className="flex-1 text-[15px] font-semibold text-[#111D37]">{item.name}</p>
                <span className={`text-[12px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${item.badgeClass}`}>{item.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 순위 추적 + 운영중 캠페인 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* 순위 추적 */}
        <div className={`${CARD} p-6 flex flex-col`} style={SHADOW}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[17px] font-bold text-[#111D37]">내 캠페인 순위 추적하기</h2>
              <p className="text-[13px] text-[#99A0AC] mt-0.5">채널별 순위 변동을 확인하세요</p>
            </div>
            <Link href="/marketing/rank" className="flex items-center gap-1 text-[13px] font-semibold hover:underline" style={{ color: YD }}>
              등록하기 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
            </Link>
          </div>
          <div className="flex gap-1.5 mb-4">
            {(["네이버 플레이스", "네이버 쇼핑", "쿠팡"] as const).map((ch) => {
              const active = rankChannel === ch;
              return (
                <button key={ch} type="button" onClick={() => setRankChannel(ch)}
                  className="px-3 py-1.5 rounded-xl text-[13px] font-bold transition-all"
                  style={active
                    ? { background: Y, color: "#000" }
                    : { background: YL, color: YDD }}>
                  {ch}
                </button>
              );
            })}
          </div>
          <div className="flex gap-1 mb-4 p-1 bg-[#F2F4F6] rounded-xl">
            {RANK_CHART_TABS.map((tab) => (
              <button key={tab} type="button" onClick={() => setRankTab(tab)}
                className={`flex-1 py-1.5 rounded-lg text-[15px] font-semibold transition-all ${rankTab === tab ? "bg-white text-[#111D37] shadow-sm border border-[#E2E6ED]" : "text-[#5B6472] hover:text-[#2B3648]"}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="mb-4">
            <select value={rankStore} onChange={(e) => setRankStore(e.target.value)}
              className="w-full border border-[#E2E6ED] rounded-xl px-4 py-2.5 text-[15px] text-[#2B3648] bg-white focus:outline-none transition-all"
              style={{ outlineColor: Y }}>
              {RANK_STORES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex-1"><RankLineChart /></div>
        </div>

        {/* 운영중 캠페인 */}
        <div className={`${CARD} p-6 flex flex-col`} style={SHADOW}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[17px] font-bold text-[#111D37]">현재 운영중인 캠페인</h2>
              <p className="text-[13px] text-[#99A0AC] mt-0.5">진행 중인 캠페인을 확인하세요</p>
            </div>
            <Link href="/marketing/reward/shopping" className="flex items-center gap-1 text-[13px] font-semibold hover:underline" style={{ color: YD }}>
              바로가기 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
            </Link>
          </div>
          <div className="flex items-center gap-3 flex-1">
            <button type="button" onClick={() => setCampaignIdx(i => (i - 1 + CAMPAIGNS.length) % CAMPAIGNS.length)}
              className="h-8 w-8 rounded-full border border-[#E2E6ED] flex items-center justify-center shrink-0 hover:bg-[#EAEFF9] transition-all">
              <svg className="w-4 h-4 text-[#5B6472]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <div className="flex-1 rounded-2xl border border-[#E2E6ED] p-5 space-y-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center gap-2">
                <span className={`inline-block text-[13px] font-bold px-2.5 py-1 rounded-lg ${campaign.statusColor}`}>{campaign.status}</span>
                <span className={`inline-block text-[12px] font-semibold px-2.5 py-1 rounded-lg ${campaign.channelColor}`}>{campaign.channel}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#B0B8C1] text-[15px]">ㄴ</span>
                <div className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F5F6F8] border border-[#E2E6ED]">
                  <p className="text-[15px] font-semibold text-[#2B3648]">{campaign.product}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0"
                  style={{ background: campaign.avatarColor === Y ? Y : campaign.avatarColor, color: campaign.avatarColor === Y ? "#000" : "white", boxShadow: `0 2px 8px ${campaign.avatarColor}55` }}>
                  {campaign.reviewer.charAt(0)}
                </div>
                <span className="text-[15px] text-[#2B3648] font-medium">{campaign.reviewer} · {campaign.count}</span>
              </div>
              <p className="text-[13px] text-[#99A0AC] font-medium tabular-nums">{campaign.dateFrom} ~ {campaign.dateTo}</p>
              <button type="button" className="px-4 py-1.5 rounded-xl border border-[#E2E6ED] text-[13px] font-semibold text-[#5B6472] hover:bg-[#EAEFF9] transition-all">복사</button>
            </div>
            <button type="button" onClick={() => setCampaignIdx(i => (i + 1) % CAMPAIGNS.length)}
              className="h-8 w-8 rounded-full border border-[#E2E6ED] flex items-center justify-center shrink-0 hover:bg-[#EAEFF9] transition-all">
              <svg className="w-4 h-4 text-[#5B6472]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
          <div className="flex justify-center gap-1.5 mt-5">
            {CAMPAIGNS.map((_, i) => (
              <button key={i} type="button" onClick={() => setCampaignIdx(i)}
                className="h-1.5 rounded-full transition-all duration-200"
                style={{ width: i === campaignIdx ? 20 : 6, background: i === campaignIdx ? Y : "#E2E6ED" }} />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
