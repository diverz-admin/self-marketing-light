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
      className="relative block rounded-2xl overflow-hidden p-6 min-h-[220px] group"
      style={{ background: b.grad }}
    >
      <div key={idx} className="animate-roll-fade">
        <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/15 text-white mb-3">{b.tag}</span>
        <span className="flex h-12 w-12 rounded-xl bg-white items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.18)] mb-3">
          <Icon3D name={b.icon} className="w-8 h-8" />
        </span>
        <p className="text-[18px] font-extrabold text-white leading-snug whitespace-pre-line">{b.title}</p>
        <p className="text-[13px] text-white/60 leading-relaxed mt-2 whitespace-pre-line">{b.desc}</p>
      </div>
      <svg className="absolute top-5 right-5 w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
      {/* 인디케이터 */}
      <div className="absolute bottom-4 left-5 flex gap-1">
        {ROLLING_BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.preventDefault(); setIdx(i); }}
            className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50"}`}
            aria-label={`배너 ${i + 1}`}
          />
        ))}
      </div>
    </Link>
  );
}

/** 고객 지원 / 트래픽 제휴 배너 — 대시보드는 우측 레일, 그 외 페이지는 하단 배너로 배치 */
export default function ContentArea({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname === "/marketing";

  return (
    <>
      {/* Content + (대시보드 전용) 우측 레일 */}
      <div className="flex flex-1 min-h-0">
        <main className="flex-1 overflow-y-auto min-w-0 px-6 md:px-8 py-6 md:py-8">
          {isDashboard
            ? children
            : <div className="mx-auto w-full max-w-[1280px]">{children}</div>}
        </main>

        {isDashboard && (
          <aside className="hidden xl:block w-[320px] shrink-0 border-l border-[#E2E6ED] bg-[#EDEFF2] overflow-y-auto">
            <div className="p-5 space-y-4">
              {/* 고객 지원 */}
              <div className="flex flex-col min-h-[240px] rounded-2xl border border-[#E2E6ED] bg-white p-6">
                <p className="text-[12px] font-bold text-[#99A0AC] uppercase tracking-wider mb-2">고객 지원</p>
                <p className="text-[18px] font-bold text-[#111D37] leading-snug">세팅에 도움이<br />필요하신가요?</p>
                <Link href="/marketing/support" className="mt-auto block text-center px-5 py-3.5 rounded-xl text-[14px] font-bold bg-[#F5F6F8] border border-[#E2E6ED] text-[#2B3648] hover:bg-[#EDEFF2] transition-colors">
                  전문 무료상담 신청
                </Link>
              </div>
              {/* 트래픽 제휴 */}
              <div className="flex flex-col min-h-[240px] rounded-2xl bg-[#111D37] p-6">
                <p className="text-[12px] font-bold text-white/40 uppercase tracking-wider mb-2">트래픽 제휴</p>
                <p className="text-[18px] font-bold text-white leading-snug">광고대행사를<br />운영중이신가요?</p>
                <Link href="/marketing/support" className="mt-auto block text-center px-5 py-3.5 rounded-xl text-[14px] font-bold bg-white/10 text-white hover:bg-white/20 transition-colors">
                  제휴 문의하기
                </Link>
              </div>

              {/* 맨 하단 롤링 광고배너 */}
              <RollingBanner />
            </div>
          </aside>
        )}
      </div>

      {/* 하단 배너 (대시보드 외 페이지) */}
      {!isDashboard && (
        <div className="shrink-0 border-t border-[#E2E6ED] bg-[#EDEFF2] px-5 md:px-8 py-5">
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
    </>
  );
}
