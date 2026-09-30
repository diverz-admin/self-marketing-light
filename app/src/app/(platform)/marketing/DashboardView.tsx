"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon3D from "@/components/marketing/Icon3D";
import type { DashboardNotice } from "@/lib/dashboard-notices";
import type { RecentOrder } from "@/lib/recent-orders";
import type { CampaignCounts, DashboardCampaign } from "@/lib/dashboard-campaigns";
import { useFavorites } from "@/lib/favorites";
import type { RankBoardItem, RankPoint } from "@/lib/rank-board";

const CARD = "bg-white rounded-2xl";

/**
 * 종료일까지 남은 일수 — 진행 중 캠페인 줄에 D-n 으로 붙인다.
 * 기간만 적혀 있으면 "언제 끝나지?"를 매번 암산해야 한다. 이미 지난 건은
 * 표시하지 않는다(샘플 데이터처럼 과거 날짜면 D-음수가 나와 더 헷갈린다).
 */
function remainingDays(endDate: string): number | null {
  const end = new Date(`${endDate}T23:59:59+09:00`).getTime();
  if (Number.isNaN(end)) return null;
  const days = Math.ceil((end - Date.now()) / 86_400_000);
  return days >= 0 ? days : null;
}



/* ── Rank Chart — 통합순위관리의 최근 7회 측정 ── */
function RankLineChart({ data }: { data: RankPoint[] }) {
  const pts0 = data.filter((d) => d.rank != null) as { date: string; rank: number }[];
  if (pts0.length === 0) {
    return <p className="py-16 text-center text-[13.5px] text-brand-sub">아직 측정된 순위가 없습니다</p>;
  }
  const W = 560, H = 200, pL = 24, pR = 24, pT = 36, pB = 40;
  const iW = W - pL - pR, iH = H - pT - pB, n = pts0.length;
  const minR = Math.min(...pts0.map(d => d.rank));
  const maxR = Math.max(...pts0.map(d => d.rank));
  const span = Math.max(1, maxR - minR);
  const step = n > 1 ? iW / (n - 1) : 0;
  const pts = pts0.map((d, i) => ({ x: n > 1 ? pL + i * step : W / 2, y: pT + ((d.rank - minR) / span) * iH, ...d }));
  const polyline = pts.map(p => `${p.x},${p.y}`).join(" ");
  const area = `${pts[0].x},${pT + iH} ${polyline} ${pts[n - 1].x},${pT + iH}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 200 }}>
      <defs>
        <linearGradient id="rankFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2452EB" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#2452EB" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1].map((f, i) => (
        <line key={i} x1={pL} y1={pT + iH * f} x2={W - pR} y2={pT + iH * f}
          stroke="#EAEEF5" strokeWidth={i % 2 === 0 ? 1 : 0.5} />
      ))}
      {pts.map((p, i) => (
        <line key={`v${i}`} x1={p.x} y1={pT} x2={p.x} y2={pT + iH} stroke="#F2F5FA" strokeWidth={1} />
      ))}
      {n > 1 && <polygon points={area} fill="url(#rankFill)" />}
      <polyline points={polyline} fill="none" stroke="#2452EB" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4.5} fill="#FFFFFF" stroke="#2452EB" strokeWidth={2} />
          <text x={p.x} y={p.y - 11} textAnchor="middle" fontSize={10} fontWeight={700} fill="#152C9E">{p.rank}</text>
          <text x={p.x} y={H - 4} textAnchor="middle" fontSize={9.5} fill="#8C97AC">{p.date.slice(5)}</text>
        </g>
      ))}
    </svg>
  );
}

/* ── Page ── */
export default function DashboardView(
  { notices, userName, balance, recentOrders, myCampaigns, campaignCounts, rankItems }:
  { notices: DashboardNotice[]; userName: string | null; balance: number;
    recentOrders: RecentOrder[]; myCampaigns: DashboardCampaign[]; campaignCounts: CampaignCounts;
    rankItems: RankBoardItem[] },
) {
  const router = useRouter();
  const [rankChannel, setRankChannel] = useState<"place" | "shopping">("place");
  const channelItems = rankItems.filter((r) => r.platform === rankChannel);
  const [rankId, setRankId] = useState<string | null>(null);
  const rankItem = channelItems.find((r) => r.id === rankId) ?? channelItems[0] ?? null;
  const rankPts = (rankItem?.history ?? []).filter((p) => p.date).slice(-7);
  const rankVals = rankPts.map((p) => p.rank).filter((r): r is number => r != null);
  const rankFrom = rankVals[0];
  const rankTo = rankVals[rankVals.length - 1];

  // 실시간 주문 현황은 30초마다 새로 받는다
  useEffect(() => {
    const t = setInterval(() => router.refresh(), 30_000);
    return () => clearInterval(t);
  }, [router]);

  const shown = myCampaigns;

  // 즐겨찾기 — 사이드바 ★ 로 담은 바로가기 (브라우저 localStorage)
  const favorites = useFavorites();

  // KPI — 목록은 3건만 보여주지만 개수는 서버에서 전체를 센 값을 쓴다.
  const KPIS = [
    { label: "보유 포인트", value: balance.toLocaleString(), unit: "P", action: "충전", href: "/marketing/my/charge" },
    { label: "진행중 캠페인", value: String(campaignCounts.running), unit: "건", action: null, href: null },
    { label: "완료 캠페인", value: String(campaignCounts.done), unit: "건", action: null, href: null },
    { label: "전체 캠페인", value: String(campaignCounts.total), unit: "건", action: "전체보기", href: "/marketing/my/campaigns" },
  ];

  return (
    // 우측 레일을 걷어낸 뒤 본문이 화면 끝까지 늘어났다.
    // 폭 제한 + 가운데 정렬.
    <div className="w-full mx-auto flex flex-col gap-6 max-w-[1500px]">

      {/* ── Welcome 배너 + KPI 스트립 ──
          시안: 네이비 배너 아래쪽에 KPI 4칸이 걸쳐 올라온다.
          값은 전부 실데이터다 — 포인트는 크레딧 원장 합계, 캠페인 수는 CAMPAIGNS 집계. */}
      <section className="order-0">
        <div
          className="rounded-2xl px-7 md:px-12 pt-11 md:pt-14 pb-20 md:pb-24"
          style={{ background: "var(--gradient-point-wide)" }}
        >
          <p className="text-[27px] md:text-[36px] font-bold text-white leading-tight break-keep">
            {userName ? `${userName}님, 오늘도 좋은 하루 되세요` : "오늘도 좋은 하루 되세요"}
          </p>

          {/* 즐겨찾기 — 사이드바 메뉴의 ★ 로 담는다. localStorage 라 브라우저별로 따로 남는다. */}
          {favorites.length === 0 ? (
            <p className="mt-5 text-[13.5px] text-white/60">
              자주 쓰는 메뉴의 <b className="font-bold text-[#F5B72A]">★</b> 을 누르면 여기에 바로가기가 생깁니다.
            </p>
          ) : (
            <div className="mt-5 flex flex-wrap gap-2">
              {favorites.map((f) => (
                <Link key={f.href} href={f.href}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13.5px] font-semibold text-white bg-white/12 border border-white/16 hover:bg-white/20 transition-colors">
                  <span className="text-[#F5B72A]">★</span>
                  {f.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="-mt-14 md:-mt-16 mx-3 md:mx-5 rounded-2xl bg-white p-2.5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {KPIS.map((k) => (
              <div key={k.label} className="rounded-lg bg-white border border-[#E2E6ED] px-5 py-4 transition-colors hover:border-[#C9D2E0]">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[12px] font-semibold text-[#5B6472]">{k.label}</p>
                  {k.action && (
                    <Link href={k.href!} className="text-[12px] font-bold text-[color:var(--point-500)] hover:underline shrink-0">
                      {k.action}
                    </Link>
                  )}
                </div>
                <p className="mt-2.5 text-[24px] font-extrabold text-[#111D37] leading-none tabular-nums">
                  {k.value}
                  <span className="ml-1 text-[13px] font-bold text-[#99A0AC]">{k.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 공지사항(좌) + 고객 인터뷰(우) · 모바일에선 하단 배치 ── */}
      <section className="order-2 grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">

        {/* 공지사항 */}
        <div className={`${CARD} overflow-hidden flex flex-col`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F2F4F6] shrink-0">
            <div className="flex items-center gap-3">
              <Icon3D name="bell" className="w-11 h-11 shrink-0 -ml-1" />
              <div>
                <p className="text-[19px] font-bold text-[#111D37]">공지사항</p>
                <p className="text-[13px] text-[#99A0AC] mt-0.5">BlueEgg 새소식</p>
              </div>
            </div>
            <Link href="/marketing/notices" className="flex items-center gap-1 text-[13px] font-semibold text-[#5B6472] hover:text-[color:var(--point-500)] transition-colors">
              더보기
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          <div className="flex-1 px-2 py-2">
            {notices.length === 0 && (
              <p className="px-4 py-8 text-center text-[14px] text-[#B0B8C1]">등록된 공지사항이 없습니다.</p>
            )}
            {notices.map((item) => (
              <Link key={item.id} href={`/marketing/notices?post=${item.id}`} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl hover:bg-[#F5F6F8] transition-colors cursor-pointer group">
                {item.isNew
                  ? <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md text-white shrink-0" style={{ background: "var(--gradient-point)" }}>NEW</span>
                  : <span className="w-[28px] shrink-0" />}
                <p className="flex-1 text-[15px] text-[#2B3648] truncate group-hover:text-[color:var(--point-500)] transition-colors">{item.title}</p>
                <span className="text-[12px] text-[#B0B8C1] shrink-0 tabular-nums">{item.date}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── 실시간 주문 현황 (목업 기준 블록) ──
            다른 회원의 활동이 섞이는 피드라 이름은 서버에서 이미 가려서 내려온다. */}
        <div className={`${CARD} overflow-hidden flex flex-col p-6`}>

          <div className="flex items-center justify-between gap-2 shrink-0">
            <span className="inline-flex items-center gap-2 text-[19px] font-bold text-[#111D37]">
              <span className="relative flex w-[7px] h-[7px]">
                <span className="absolute inline-flex w-full h-full rounded-full bg-[#1E9E54] opacity-60 animate-ping" />
                <span className="relative inline-flex w-[7px] h-[7px] rounded-full bg-[#1E9E54]" />
              </span>
              실시간 주문 현황
            </span>
            <span className="text-[13px] text-[#99A0AC]">최근 {recentOrders.length}건</span>
          </div>

          <div className="mt-4 flex-1 flex flex-col justify-center">
            {recentOrders.length === 0 ? (
              <p className="py-10 text-center text-[14px] text-[#99A0AC]">아직 접수된 주문이 없습니다</p>
            ) : (
              recentOrders.map((o) => (
                <div key={o.id}
                  className="flex items-center gap-3 py-3 border-t border-[#F2F4F6] first:border-t-0">
                  <span className="h-9 w-9 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0"
                    style={{ background: "var(--gradient-point)", boxShadow: "var(--shadow-point)" }}>
                    {o.tile}
                  </span>
                  <p className="flex-1 min-w-0 text-[14px] text-[#2B3648] truncate">
                    <b className="font-bold text-[#111D37]">{o.maskedName}</b> 님이{" "}
                    <span className="font-semibold text-[color:var(--point-500)]">{o.service}</span>
                  </p>
                  <span className="shrink-0 text-[13px] font-bold text-[#2B3648] tabular-nums">{o.qty}건</span>
                  <span className="shrink-0 w-[56px] text-right text-[12px] text-[#B0B8C1] tabular-nums">{o.ago}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── 4. 현재 운영중인 캠페인 ── */}
      {/* ── 4. 현재 운영중인 캠페인(좌) + 내 캠페인 순위 추적하기(우) ── */}
      <section className="order-1 grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">

        {/* 현재 운영중인 캠페인 */}
        <div className={`${CARD} overflow-hidden flex flex-col`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F2F4F6] shrink-0">
            <div className="flex items-center gap-3">
              <Icon3D name="clipboard" className="w-11 h-11 shrink-0 -ml-1" />
              <div>
                <p className="text-[19px] font-bold text-[#111D37]">현재 운영중인 캠페인</p>
                <p className="text-[13px] text-[#99A0AC] mt-0.5">진행 중인 캠페인 현황</p>
              </div>
            </div>
            <Link href="/marketing/my/campaigns" className="flex items-center gap-1 text-[13px] font-semibold text-[#5B6472] hover:text-[color:var(--point-500)] transition-colors">
              전체보기
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          <div className="flex-1 px-4 py-3 space-y-2">
            {shown.length === 0 && (
              <p className="py-12 text-center text-[14px] text-[#99A0AC]">진행중인 캠페인이 없습니다</p>
            )}
            {shown.map((c) => (
              <div key={c.id}
                className="flex items-center gap-3.5 px-3 py-3 rounded-xl hover:bg-[#F5F6F8] transition-colors group cursor-pointer border border-transparent hover:border-[#E2E6ED]">
                <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-[15px] font-bold shrink-0"
                  style={{ background: "var(--gradient-point)", boxShadow: "var(--shadow-point)" }}>
                  {c.targetName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  {/* 상태 · 채널 */}
                  {/* 카드 자체가 "진행 중"만 담으므로 상태 칩은 두지 않는다 — 채널만 표시 */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">{c.channel}</span>
                  </div>

                  {/* 신청 대상 */}
                  <p className="text-[15px] font-semibold text-[#2B3648] truncate group-hover:text-[color:var(--point-500)] transition-colors">{c.targetName}</p>

                  {/* 상품 · 키워드 */}
                  <div className="flex items-center gap-1.5 mt-1 text-[12.5px] text-[#5B6472] min-w-0">
                    {c.productTitle && (
                      <>
                        <span className="truncate">{c.productTitle}</span>
                        <span className="text-[#D2D8E2]">·</span>
                      </>
                    )}
                    <span className="truncate text-[color:var(--point-500)] font-medium">{c.keyword}</span>
                  </div>

                  {c.startDate && c.endDate && (
                    <span className="block mt-1 text-[12px] text-[#B0B8C1] whitespace-nowrap tabular-nums">
                      {c.startDate} ~ {c.endDate}
                      {remainingDays(c.endDate) !== null && (
                        <span className="ml-2 text-[#5B6472] font-medium">D-{remainingDays(c.endDate)}</span>
                      )}
                    </span>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[13px] font-bold text-[#2B3648] tabular-nums">{c.qty}건</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold text-[#1E9E54]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1E9E54]" />
                    {c.statusLabel}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 내 캠페인 순위 추적하기 — 파란 면. 위의 대비를 위해 안쪽 요소를 전부 밝은 톤으로 뒤집는다. */}
        <div className="rounded-2xl p-6 flex flex-col"
          style={{ background: "var(--gradient-point)", boxShadow: "var(--shadow-point)" }}>
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <Icon3D name="chart" className="w-11 h-11 shrink-0 -ml-1" />
              <div>
                <p className="text-[19px] font-bold text-white">내 캠페인 순위 추적하기</p>
                <p className="text-[13px] text-white/60 mt-0.5">채널별 순위 변동 확인</p>
              </div>
            </div>
            <Link href="/marketing/rank" className="flex items-center gap-1 text-[13px] font-semibold text-white/75 hover:text-white transition-colors">
              등록하기
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4 shrink-0">
            {([["place", "네이버 플레이스"], ["shopping", "네이버 쇼핑"]] as const).map(([key, label]) => {
              const active = rankChannel === key;
              return (
                <button key={key} type="button" onClick={() => { setRankChannel(key); setRankId(null); }}
                  className={`px-3 py-1.5 rounded-xl text-[13px] font-bold transition-all ${active ? "bg-white text-[color:var(--point-600)]" : "bg-white/12 text-white/75 hover:bg-white/20"}`}>
                  {label}
                </button>
              );
            })}
            {rankFrom != null && rankTo != null && rankVals.length > 1 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl ml-auto"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.16)" }}>
                <span className="text-[13px] font-bold text-white">{rankFrom}위 → {rankTo}위</span>
                {rankFrom !== rankTo && (
                  <span className={`text-[12px] font-semibold ${rankFrom > rankTo ? "text-[#7DE8AC]" : "text-[#FFB4B8]"}`}>
                    {rankFrom > rankTo ? "↑" : "↓"}{Math.abs(rankFrom - rankTo)}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="shrink-0 mb-3">
            <select value={rankItem?.id ?? ""} onChange={(e) => setRankId(e.target.value)} disabled={channelItems.length === 0}
              className="w-full rounded-xl px-4 py-2.5 text-[15px] text-white bg-white/12 border border-white/16 focus:outline-none focus:border-white/40 transition-all [&>option]:text-[#2B3648]">
              {channelItems.length === 0 && <option value="">추적 중인 키워드가 없습니다</option>}
              {channelItems.map(r => <option key={r.id} value={r.id}>{r.keyword} | {r.name ?? "확인 중"}</option>)}
            </select>
          </div>

          <div className="flex-1 rounded-2xl px-3 py-2" style={{ background: "#FFFFFF", border: "1px solid rgba(255,255,255,0.6)" }}>
            {channelItems.length === 0 ? (
              <p className="py-16 text-center text-[13.5px] text-brand-sub">추적 중인 캠페인이 없습니다 — 신청하면 자동으로 순위가 기록됩니다</p>
            ) : (
              <RankLineChart data={rankPts} />
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
