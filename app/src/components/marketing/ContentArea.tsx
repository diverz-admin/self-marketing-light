"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon3D, { Icon3DName } from "./Icon3D";

/** 하단 롤링 광고배너 (자동 순환) */
const ROLLING_BANNERS: {
  tag: string; title: string; desc: string; icon: Icon3DName; href: string; grad: string;
}[] = [
  { tag: "신규",   title: "플레이스 리워드\n신규 상품 추가",   desc: "새 리워드 상품으로 순위를 더 빠르게 끌어올리세요.", icon: "coin",      href: "/marketing/reward/place",         grad: "linear-gradient(135deg,#1B3160,#2E6BE0)" },
  { tag: "이벤트", title: "홈페이지 제작\n10% 할인 이벤트",     desc: "지금 신청하면 제작비를 10% 즉시 할인해 드려요.",   icon: "clipboard", href: "/marketing/support",              grad: "linear-gradient(135deg,#2E6BE0,#1D4ED8)" },
  { tag: "오픈",   title: "네이버 카페 침투\n신규 채널 오픈",   desc: "1,000만 카페 회원에게 자연스럽게 도달하세요.",     icon: "chat",      href: "/marketing/community/cafe",       grad: "linear-gradient(135deg,#0D3473,#0D2148)" },
  { tag: "안내",   title: "광고비 최대 10%\n환급 프로그램",     desc: "집행한 광고비의 일부를 현금으로 돌려받으세요.",     icon: "search",    href: "/marketing/ads/naver-cpc-refund", grad: "linear-gradient(135deg,#3B6FE0,#2E6BE0)" },
];

function RollingBanner() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % ROLLING_BANNERS.length), 3500);
    return () => clearInterval(t);
  }, [paused]);
  const b = ROLLING_BANNERS[idx];
  return (
    <Link
      href={b.href}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative flex flex-col rounded-2xl overflow-hidden px-6 py-6 group min-h-[200px]"
      style={{ background: b.grad }}
    >
      {/* 장식 원 */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/[0.06] pointer-events-none" />
      <div className="absolute -bottom-10 -left-6 w-28 h-28 rounded-full bg-white/[0.05] pointer-events-none" />

      <div key={idx} className="animate-roll-fade relative flex flex-col h-full min-w-0">
        {/* 상단: 아이콘 + 태그 */}
        <div className="flex items-center justify-between">
          <span className="flex h-12 w-12 rounded-xl bg-white items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.18)]">
            <Icon3D name={b.icon} className="w-7 h-7" />
          </span>
          <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/15 text-white">{b.tag}</span>
        </div>

        {/* 중단: 제목 + 설명 */}
        <div className="mt-4 min-w-0">
          <p className="text-[19px] font-extrabold text-white leading-tight whitespace-pre-line">{b.title}</p>
          <p className="text-[13px] text-white/60 leading-relaxed mt-2">{b.desc}</p>
        </div>

        {/* 하단: CTA */}
        <span className="mt-auto inline-flex items-center gap-1.5 text-[13.5px] font-bold text-white/85 group-hover:text-white transition-colors">
          자세히 보기
          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

/** 고객 지원 / 트래픽 제휴 배너 — 대시보드는 우측 레일, 그 외 페이지는 하단 배너로 배치 */
export default function ContentArea({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname === "/marketing";
  // 통합 순위관리 = 카드/여백 없이 화면을 꽉 채우는 풀블리드 원페이지
  const isFullBleed = pathname.startsWith("/marketing/rank");
  // SA광고 최적화 등 = 1280px 제한 없이 콘텐츠 영역 전체 폭 사용(중앙 정렬·좌우 여백만 유지)
  const isWide = pathname === "/marketing/ads/naver-cpc" || pathname === "/marketing/ads/naver-cpc-refund" || pathname === "/marketing/reward/place/guaranteed";

  return (
    <>
      {/* Content + (대시보드 전용) 우측 레일 */}
      <div className="flex flex-1 min-h-0">
        {/* 스크롤 영역: 본문 + 하단 배너가 함께 스크롤 (배너 고정 아님) */}
        <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
        <main className={`flex-1 ${isDashboard ? "" : "bg-white"} ${isFullBleed ? "pb-[76px] md:pb-0" : "px-6 md:px-10 pt-6 md:pt-10 pb-[76px] md:pb-10"}`}>
          {/* 제목은 각 페이지 최상단(박스 밖), 콘텐츠 카드가 박스 역할 */}
          {children}
        </main>

        {/* 하단 배너 (스크롤 흐름 내부 · 고정 아님 · 대시보드·풀블리드 제외) */}
        {!isDashboard && !isFullBleed && (
          <div className="hidden md:block shrink-0 border-t border-[#E2E6ED] bg-[#EDEFF2] px-5 md:px-8 py-5">
            <div className="flex items-stretch gap-3 flex-wrap">
              {/* 고객 지원 */}
              <div className="flex items-center gap-3 flex-1 min-w-[280px] rounded-xl border border-[#E2E6ED] bg-[#F5F6F8] px-5 py-5">
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-[#99A0AC] uppercase tracking-wider mb-1">고객 지원</p>
                  <p className="text-[17px] font-bold text-[#111D37] leading-snug truncate">세팅에 도움이 필요하신가요?</p>
                </div>
                <Link href="/marketing/support" className="ml-auto shrink-0 px-5 py-3 rounded-xl text-[15px] font-bold bg-white border border-[#E2E6ED] text-[#2B3648] hover:bg-[#F2F4F6] transition-colors whitespace-nowrap">
                  전문 무료상담 신청
                </Link>
              </div>
              {/* 트래픽 제휴 */}
              <div className="flex items-center gap-3 flex-1 min-w-[280px] rounded-xl bg-[#111D37] px-5 py-5">
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-white/40 uppercase tracking-wider mb-1">트래픽 제휴</p>
                  <p className="text-[17px] font-bold text-white leading-snug truncate">광고대행사를 운영중이신가요?</p>
                </div>
                <Link href="/marketing/support" className="ml-auto shrink-0 px-5 py-3 rounded-xl text-[15px] font-bold bg-white/10 text-white hover:bg-white/20 transition-colors whitespace-nowrap">
                  제휴 문의하기
                </Link>
              </div>
            </div>
          </div>
        )}
        </div>
        {/* END 스크롤 영역 */}

        {isDashboard && (
          <aside className="hidden xl:flex flex-col w-[320px] shrink-0 border-l border-[#E2E6ED] bg-[#EDEFF2] overflow-hidden">
            <div className="flex-1 min-h-0 flex flex-col p-5 gap-4 overflow-y-auto">
              {/* 고객 지원 */}
              <div className="shrink-0 flex flex-col rounded-2xl border border-[#E2E6ED] bg-white px-6 py-6">
                <span className="inline-flex h-12 w-12 rounded-xl bg-[#EEF3FC] items-center justify-center shrink-0 mb-3.5">
                  <svg className="w-6 h-6 text-[#2E6BE0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 4.5v6.75A6.75 6.75 0 015.25 11.25V4.5m0 6.75V15a6.75 6.75 0 006.75 6.75m0 0a2.25 2.25 0 104.5 0 2.25 2.25 0 00-4.5 0zM3 8.25h2.25M18.75 8.25H21" />
                  </svg>
                </span>
                <p className="text-[12px] font-bold text-[#99A0AC] uppercase tracking-wider mb-1.5">고객 지원</p>
                <p className="text-[19px] font-extrabold text-[#111D37] leading-snug">세팅에 도움이<br />필요하신가요?</p>
                <p className="text-[13px] text-[#6B7280] leading-relaxed mt-2.5">전문 컨설턴트가 캠페인 세팅부터 최적화까지 1:1로 도와드립니다.</p>
                <Link href="/marketing/support" className="mt-8 flex items-center justify-center gap-1.5 w-full px-4 py-3.5 rounded-xl text-[14px] font-bold bg-[#0D3473] text-white hover:bg-[#0D2148] transition-colors">
                  전문 무료상담 신청
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </Link>
              </div>
              {/* 트래픽 제휴 */}
              <div className="shrink-0 flex flex-col rounded-2xl bg-[#111D37] px-6 py-6">
                <span className="inline-flex h-12 w-12 rounded-xl bg-white/10 items-center justify-center shrink-0 mb-3.5">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                </span>
                <p className="text-[12px] font-bold text-white/40 uppercase tracking-wider mb-1.5">트래픽 제휴</p>
                <p className="text-[19px] font-extrabold text-white leading-snug">광고대행사를<br />운영중이신가요?</p>
                <p className="text-[13px] text-white/55 leading-relaxed mt-2.5">제휴사 전용 특별 단가와 전담 매니저를 지원해 드립니다.</p>
                <Link href="/marketing/support" className="mt-8 flex items-center justify-center gap-1.5 w-full px-4 py-3.5 rounded-xl text-[14px] font-bold bg-white text-[#0D3473] hover:bg-white/90 transition-colors">
                  제휴 문의하기
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </Link>
              </div>

              {/* 롤링 광고배너 */}
              <div className="shrink-0 flex flex-col">
                <RollingBanner />
              </div>
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
