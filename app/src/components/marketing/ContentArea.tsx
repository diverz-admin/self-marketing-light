"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon3D, { Icon3DName } from "./Icon3D";
import OpenChatWidget from "./OpenChatWidget";

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
      className="relative flex items-center gap-3 rounded-2xl overflow-hidden px-4 py-3.5 group"
      style={{ background: b.grad }}
    >
      <div key={idx} className="animate-roll-fade flex items-center gap-3 min-w-0 flex-1">
        <span className="flex h-11 w-11 rounded-xl bg-white items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.18)]">
          <Icon3D name={b.icon} className="w-7 h-7" />
        </span>
        <div className="min-w-0 flex-1">
          <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/15 text-white mb-1">{b.tag}</span>
          <p className="text-[15px] font-extrabold text-white leading-tight whitespace-pre-line">{b.title}</p>
        </div>
      </div>
      <svg className="w-4 h-4 text-white/50 shrink-0 group-hover:text-white group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
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
            <div className="flex-1 min-h-0 flex flex-col p-5 gap-4">
              {/* 고객 지원 */}
              <div className="shrink-0 flex items-center gap-3 rounded-2xl border border-[#E2E6ED] bg-white px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold text-[#99A0AC] uppercase tracking-wider mb-1">고객 지원</p>
                  <p className="text-[16px] font-bold text-[#111D37] leading-snug">세팅에 도움이<br />필요하신가요?</p>
                </div>
                <Link href="/marketing/support" className="shrink-0 whitespace-nowrap px-4 py-3 rounded-xl text-[13px] font-bold bg-[#F5F6F8] border border-[#E2E6ED] text-[#2B3648] hover:bg-[#EDEFF2] transition-colors">
                  전문 무료상담 신청
                </Link>
              </div>
              {/* 트래픽 제휴 */}
              <div className="shrink-0 flex items-center gap-3 rounded-2xl bg-[#111D37] px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold text-white/40 uppercase tracking-wider mb-1">트래픽 제휴</p>
                  <p className="text-[16px] font-bold text-white leading-snug">광고대행사를<br />운영중이신가요?</p>
                </div>
                <Link href="/marketing/support" className="shrink-0 whitespace-nowrap px-4 py-3 rounded-xl text-[13px] font-bold bg-white/10 text-white hover:bg-white/20 transition-colors">
                  제휴 문의하기
                </Link>
              </div>

              {/* 롤링 광고배너 */}
              <div className="shrink-0">
                <RollingBanner />
              </div>

              {/* 맨 하단 실시간 오픈채팅 — 남은 높이를 끝까지 채움 (하단 끝선 정렬) */}
              <div className="flex-1 min-h-0">
                <OpenChatWidget />
              </div>
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
