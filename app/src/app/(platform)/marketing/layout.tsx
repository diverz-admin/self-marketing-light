import React from "react";
import Link from "next/link";
import Image from "next/image";
import SidebarNav from "@/components/marketing/SidebarNav";
import ContentArea from "@/components/marketing/ContentArea";

const MOCK = {
  name: "사용자",
  email: "eggcorp2024@gmail.com",
  creditBalance: 0,
  activeCampaignCount: 0,
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#EDEFF2]">

      {/* ── Left Sidebar (full height) ── */}
      <aside
        className="w-[260px] shrink-0 sticky top-0 h-screen flex-col hidden md:flex border-r border-[#E2E6ED] overflow-hidden" style={{ background: "#FFFFFF" }}
      >
        {/* 로고 */}
        <div className="px-5 pt-5 pb-4 shrink-0">
          <Link href="/marketing" className="flex flex-col gap-1.5">
            <Image src="/blue-egg-logo.png" alt="BLUE EGG biz" width={242} height={113} priority className="h-10 w-auto" />
            <p className="text-[11px] text-[#99A0AC] leading-tight pl-0.5">셀프 마케팅 플랫폼</p>
          </Link>
        </div>

        {/* 네비게이션 */}
        <SidebarNav />

        {/* 로그아웃 */}
        <div className="px-3 py-3 shrink-0 border-t border-[#F2F4F6]">
          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#5B6472] hover:bg-[#F2F4F6] hover:text-[#2B3648] transition-all">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            <span className="text-[15px] font-medium">로그아웃</span>
          </button>
        </div>
      </aside>

      {/* ── Right: Header + Content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="sticky top-0 z-50 h-[72px] bg-white border-b border-[#E2E6ED] flex items-center gap-4 px-5 md:px-6 shrink-0">
          {/* 모바일 전용 로고 */}
          <Link href="/marketing" className="md:hidden shrink-0">
            <Image src="/blue-egg-logo.png" alt="BLUE EGG biz" width={242} height={113} priority className="h-8 w-auto" />
          </Link>

          {/* 검색창 */}
          <div className="flex-1 hidden md:flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#F5F6F8] border border-[#E2E6ED] max-w-xs focus-within:border-[#0D3473] transition-colors">
            <svg className="w-4 h-4 text-[#B0B8C1] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <span className="text-[15px] text-[#B0B8C1]">검색어를 입력하세요</span>
          </div>

          <div className="flex-1 hidden md:block" />

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F6F8] border border-[#E2E6ED]">
              <svg className="w-3.5 h-3.5 text-[#0D3473]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[12px] text-[#5B6472] font-medium">포인트</span>
              <span className="text-[15px] font-extrabold text-[#0D3473]">{MOCK.creditBalance.toLocaleString()} P</span>
            </div>
            <Link href="/marketing/my/charge" className="px-3.5 py-1.5 text-[13px] font-bold bg-[#0D3473] text-white rounded-xl hover:bg-[#0D2148] transition-colors">
              충전하기
            </Link>
            <div className="flex items-center gap-2 pl-3 border-l border-[#E2E6ED] ml-1">
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-white text-[13px] font-bold"
                style={{ background: "linear-gradient(135deg,#0D3473,#6366F1)" }}
              >
                {MOCK.name.charAt(0)}
              </div>
              <span className="text-[15px] font-semibold text-[#111D37] hidden sm:block">{MOCK.name} 님</span>
              <svg className="w-3.5 h-3.5 text-[#B0B8C1] hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <button className="h-8 w-8 rounded-xl bg-[#F5F6F8] border border-[#E2E6ED] flex items-center justify-center hover:bg-[#F2F4F6] transition-colors">
              <svg className="w-4 h-4 text-[#5B6472]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </button>
          </div>
        </header>

        {/* Content (대시보드=우측 레일 / 그 외=하단 배너) */}
        <ContentArea>{children}</ContentArea>
      </div>
    </div>
  );
}
