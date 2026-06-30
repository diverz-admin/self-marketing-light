import React from "react";
import Link from "next/link";
import SidebarNav from "@/components/marketing/SidebarNav";

const MOCK = {
  name: "사용자",
  email: "eggcorp2024@gmail.com",
  creditBalance: 0,
  activeCampaignCount: 0,
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-brand-lighter">

      {/* ── Left Sidebar (full height) ── */}
      <aside
        className="w-[250px] shrink-0 sticky top-0 h-screen flex-col hidden md:flex border-r border-[#E5E8EB] overflow-hidden" style={{ background: "#F9FAFE" }}
      >
        {/* 로고 */}
        <div className="px-5 pt-5 pb-4 shrink-0">
          <Link href="/marketing" className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-xl bg-[#0341C7] flex items-center justify-center shrink-0" style={{ boxShadow: "0 2px 8px rgba(49,130,246,0.35)" }}>
              <svg className="w-[18px] h-[18px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M12 11v4m0 0h-1.5M12 15h1.5" />
              </svg>
            </span>
            <div>
              <p className="text-[16px] font-extrabold text-[#191F28] tracking-tight leading-tight">DIVERZ</p>
              <p className="text-[10px] text-[#8B95A1] leading-tight">셀프 마케팅 플랫폼</p>
            </div>
          </Link>
        </div>

        {/* 유저 프로필 */}
        <div className="mx-3 mb-2 px-3 py-2.5 rounded-xl shrink-0 bg-[#F9FAFB] border border-[#E5E8EB]">
          <div className="flex items-center gap-2.5">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-[13px] shrink-0"
              style={{ background: "linear-gradient(135deg,#0341C7,#6366F1)" }}
            >
              {MOCK.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#191F28] truncate leading-tight">{MOCK.name}</p>
              <p className="text-[11px] text-[#8B95A1] truncate leading-tight">{MOCK.email}</p>
            </div>
          </div>
        </div>

        {/* 네비게이션 */}
        <SidebarNav />

        {/* 로그아웃 */}
        <div className="px-3 py-3 shrink-0 border-t border-[#F2F4F6]">
          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#6B7684] hover:bg-[#F2F4F6] hover:text-[#333D4B] transition-all">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            <span className="text-[13px] font-medium">로그아웃</span>
          </button>
        </div>
      </aside>

      {/* ── Right: Header + Content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="sticky top-0 z-50 h-[60px] bg-white border-b border-[#E5E8EB] flex items-center gap-4 px-5 shrink-0">
          {/* 모바일 전용 로고 */}
          <Link href="/marketing" className="flex items-center gap-2 md:hidden shrink-0">
            <span className="h-8 w-8 rounded-[10px] bg-[#0341C7] flex items-center justify-center text-white font-extrabold text-sm">D</span>
            <span className="font-extrabold text-[15px] text-[#191F28] tracking-tight">DIVERZ</span>
          </Link>

          {/* 검색창 */}
          <div className="flex-1 hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F9FAFB] border border-[#E5E8EB] max-w-xs">
            <svg className="w-4 h-4 text-[#B0B8C1] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <span className="text-[13px] text-[#B0B8C1]">검색어를 입력하세요</span>
          </div>

          <div className="flex-1 hidden md:block" />

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F9FAFB] border border-[#E5E8EB]">
              <svg className="w-3.5 h-3.5 text-[#0341C7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[11px] text-[#6B7684] font-medium">포인트</span>
              <span className="text-[13px] font-extrabold text-[#0341C7]">{MOCK.creditBalance.toLocaleString()} P</span>
            </div>
            <Link href="/marketing/my/charge" className="px-3.5 py-1.5 text-[12px] font-bold bg-[#0341C7] text-white rounded-xl hover:bg-[#0235A8] transition-colors">
              충전하기
            </Link>
            <div className="flex items-center gap-2 pl-3 border-l border-[#E5E8EB] ml-1">
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-white text-[12px] font-bold"
                style={{ background: "linear-gradient(135deg,#0341C7,#6366F1)" }}
              >
                {MOCK.name.charAt(0)}
              </div>
              <span className="text-[13px] font-semibold text-[#191F28] hidden sm:block">{MOCK.name} 님</span>
              <svg className="w-3.5 h-3.5 text-[#B0B8C1] hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <button className="h-8 w-8 rounded-xl bg-[#F9FAFB] border border-[#E5E8EB] flex items-center justify-center hover:bg-[#F2F4F6] transition-colors">
              <svg className="w-4 h-4 text-[#6B7684]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex flex-1 min-h-0">
          <main className="flex-1 p-6 md:p-8 overflow-y-auto min-w-0">{children}</main>
        </div>

        {/* 하단 고정 배너 (고객 지원 / 트래픽 제휴) */}
        <div className="shrink-0 border-t border-[#E5E8EB] bg-white px-5 md:px-8 py-5">
          <div className="flex items-stretch gap-3 flex-wrap">
            {/* 고객 지원 */}
            <div className="flex items-center gap-3 flex-1 min-w-[280px] rounded-xl border border-[#E5E8EB] bg-[#F9FAFB] px-5 py-5">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#8B95A1] uppercase tracking-wider mb-1">고객 지원</p>
                <p className="text-[15px] font-bold text-[#191F28] leading-snug truncate">세팅에 도움이 필요하신가요?</p>
              </div>
              <Link href="/marketing/support" className="ml-auto shrink-0 px-5 py-3 rounded-xl text-[13px] font-bold bg-white border border-[#E5E8EB] text-[#333D4B] hover:bg-[#F2F4F6] transition-colors whitespace-nowrap">
                전문 무료상담 신청
              </Link>
            </div>
            {/* 트래픽 제휴 */}
            <div className="flex items-center gap-3 flex-1 min-w-[280px] rounded-xl bg-[#191F28] px-5 py-5">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-1">트래픽 제휴</p>
                <p className="text-[15px] font-bold text-white leading-snug truncate">광고대행사를 운영중이신가요?</p>
              </div>
              <Link href="/marketing/support" className="ml-auto shrink-0 px-5 py-3 rounded-xl text-[13px] font-bold bg-white/10 text-white hover:bg-white/20 transition-colors whitespace-nowrap">
                제휴 문의하기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
