"use client";

import React, { useState } from "react";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  running: { label: "진행중",   bg: "bg-green-50", text: "text-green-600" },
  pending: { label: "대기중",   bg: "bg-amber-50", text: "text-amber-600" },
  paused:  { label: "일시정지", bg: "bg-gray-100", text: "text-gray-500" },
  done:    { label: "완료",     bg: "bg-blue-50",  text: "text-blue-500" },
};

const SERVICE_LABELS: Record<string, string> = {
  search:  "검색 유입",
  display: "디스플레이",
  youtube: "유튜브",
};

const MOCK_CAMPAIGNS = [
  {
    id: "g1",
    siteUrl: "https://www.mybrand.co.kr",
    keyword: "강남 피부과 추천",
    media: "구글 SA",
    service: "search",
    dailyQty: 150,
    duration: 14,
    status: "running",
    startDate: "2026-06-10",
    endDate: "2026-06-24",
    totalCost: 252000,
    rank: 3,
    rankDiff: -2,
  },
  {
    id: "g2",
    siteUrl: "https://www.luxbag.co.kr",
    keyword: "명품 가방 온라인몰",
    media: "GDN 배너",
    service: "display",
    dailyQty: 200,
    duration: 7,
    status: "pending",
    startDate: "2026-06-21",
    endDate: "2026-06-28",
    totalCost: 126000,
    rank: null,
    rankDiff: 0,
  },
  {
    id: "g3",
    siteUrl: "https://www.fitfood.co.kr",
    keyword: "단백질 식단 배달",
    media: "구글 SA+",
    service: "search",
    dailyQty: 100,
    duration: 30,
    status: "done",
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    totalCost: 450000,
    rank: 1,
    rankDiff: 8,
  },
  {
    id: "g4",
    siteUrl: "https://www.homecare.co.kr",
    keyword: "가정용 공기청정기",
    media: "YT 인스트림",
    service: "youtube",
    dailyQty: 80,
    duration: 14,
    status: "paused",
    startDate: "2026-06-05",
    endDate: "2026-06-19",
    totalCost: 112000,
    rank: 9,
    rankDiff: 3,
  },
  {
    id: "g5",
    siteUrl: "https://www.petshop24.co.kr",
    keyword: "반려동물 간식 쇼핑몰",
    media: "GDN 리타겟",
    service: "display",
    dailyQty: 120,
    duration: 21,
    status: "running",
    startDate: "2026-06-01",
    endDate: "2026-06-22",
    totalCost: 277200,
    rank: 5,
    rankDiff: -1,
  },
];

const STATUS_TABS = ["전체", "진행중", "대기중", "일시정지", "완료"] as const;

export default function GoogleRewardManagePage() {
  const [tab, setTab] = useState<string>("전체");
  const [search, setSearch] = useState("");

  const filtered = MOCK_CAMPAIGNS.filter((c) => {
    const matchTab = tab === "전체" || STATUS_CONFIG[c.status]?.label === tab;
    const matchSearch = c.keyword.includes(search) || c.siteUrl.includes(search) || c.media.includes(search);
    return matchTab && matchSearch;
  });

  const total = MOCK_CAMPAIGNS.length;
  const running = MOCK_CAMPAIGNS.filter((c) => c.status === "running").length;
  const totalCost = MOCK_CAMPAIGNS.reduce((s, c) => s + c.totalCost, 0);

  return (
    <div className="w-full space-y-4">
      <nav className="flex items-center gap-1.5 text-[15px] text-brand-sub">
        <Link href="/marketing" className="hover:text-brand-text">대시보드</Link>
        <span>›</span>
        <span className="text-brand-muted">구글</span>
        <span>›</span>
        <span className="text-brand-text font-medium">[리워드] 캠페인 관리</span>
      </nav>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "전체 캠페인",  value: `${total}개`,                        icon: "📋" },
          { label: "진행중",       value: `${running}개`,                       icon: "▶️" },
          { label: "총 집행 금액", value: `${totalCost.toLocaleString()}원`,    icon: "💰" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-brand-border p-4 flex items-center gap-3">
            <span className="text-[25px]">{kpi.icon}</span>
            <div>
              <p className="text-[12px] text-brand-muted">{kpi.label}</p>
              <p className="text-[20px] font-extrabold text-brand-dark">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-extrabold text-brand-dark">캠페인 목록</h2>
          <Link href="/marketing/reward/google"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[15px] font-bold text-white"
            style={{ background: "linear-gradient(135deg,#EA4335,#FBBC05)" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            새 캠페인
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_TABS.map((t) => (
              <button key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
                  tab === t ? "bg-brand-dark text-white" : "bg-brand-lighter text-brand-sub hover:text-brand-text"
                }`}>
                {t}
              </button>
            ))}
          </div>
          <div className="ml-auto relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="키워드 / URL 검색"
              className="pl-8 pr-3 py-1.5 border border-brand-border rounded-lg text-[13px] text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all w-44" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[15px]">
            <thead>
              <tr className="border-b border-brand-border">
                {["매체/서비스", "사이트 URL", "키워드", "일 작업량", "기간", "총 비용", "순위", "상태", "관리"].map((h) => (
                  <th key={h} className="pb-2 text-left text-[12px] font-bold text-brand-muted whitespace-nowrap pr-3 last:pr-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[15px] text-brand-muted">캠페인이 없습니다.</td>
                </tr>
              ) : filtered.map((c) => {
                const sc = STATUS_CONFIG[c.status];
                const rankUp = c.rankDiff < 0;
                const rankDown = c.rankDiff > 0;
                return (
                  <tr key={c.id} className="border-b border-brand-border/50 hover:bg-brand-lighter/50 transition-colors">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-[12px] font-extrabold shrink-0"
                          style={{ background: "linear-gradient(135deg,#EA4335,#FBBC05)" }}>G</div>
                        <div>
                          <p className="font-bold text-brand-dark text-[13px]">{c.media}</p>
                          <p className="text-[12px] text-brand-muted">{SERVICE_LABELS[c.service]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-3 max-w-[160px]">
                      <p className="truncate text-brand-sub text-[12px]">{c.siteUrl}</p>
                    </td>
                    <td className="py-3 pr-3">
                      <span className="font-medium text-brand-dark">{c.keyword}</span>
                    </td>
                    <td className="py-3 pr-3 text-brand-sub">{c.dailyQty.toLocaleString()}</td>
                    <td className="py-3 pr-3 whitespace-nowrap text-brand-sub text-[12px]">
                      <p>{c.startDate}</p>
                      <p>~{c.endDate}</p>
                    </td>
                    <td className="py-3 pr-3 font-bold text-brand-dark whitespace-nowrap">{c.totalCost.toLocaleString()}원</td>
                    <td className="py-3 pr-3">
                      {c.rank != null ? (
                        <div className="flex items-center gap-1">
                          <span className="font-extrabold text-brand-dark">{c.rank}위</span>
                          {rankUp && <span className="text-[12px] text-green-500 font-bold">▲{Math.abs(c.rankDiff)}</span>}
                          {rankDown && <span className="text-[12px] text-red-500 font-bold">▼{c.rankDiff}</span>}
                          {!rankUp && !rankDown && <span className="text-[12px] text-brand-muted">-</span>}
                        </div>
                      ) : (
                        <span className="text-brand-muted">-</span>
                      )}
                    </td>
                    <td className="py-3 pr-3">
                      <span className={`px-2 py-1 rounded-lg text-[12px] font-bold ${sc.bg} ${sc.text}`}>{sc.label}</span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1.5">
                        {c.status === "running" && (
                          <button className="px-2 py-1 rounded-lg text-[12px] font-bold bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors">정지</button>
                        )}
                        {c.status === "paused" && (
                          <button className="px-2 py-1 rounded-lg text-[12px] font-bold bg-green-50 text-green-600 hover:bg-green-100 transition-colors">재개</button>
                        )}
                        <button className="px-2 py-1 rounded-lg text-[12px] font-bold bg-brand-lighter text-brand-sub hover:text-brand-text transition-colors">상세</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
