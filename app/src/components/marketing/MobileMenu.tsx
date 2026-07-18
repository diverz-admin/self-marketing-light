"use client";

import Link from "next/link";
import Image from "next/image";
import SidebarNav from "./SidebarNav";
import { useMobileMenu } from "./MobileMenuContext";

/* 모바일 전용 햄버거 메뉴 + 좌측 슬라이드 드로어 (PC 사이드바 전체를 노출) */
export default function MobileMenu() {
  const { open, openMenu, closeMenu } = useMobileMenu();

  // 내비게이션 링크 클릭 시 자동으로 닫힘 (아코디언 토글 버튼은 유지)
  const closeIfLink = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a")) closeMenu();
  };

  return (
    <>
      {/* 햄버거 버튼 (모바일 전용) */}
      <button
        type="button"
        onClick={openMenu}
        aria-label="메뉴 열기"
        className="md:hidden shrink-0 -ml-1 h-9 w-9 flex items-center justify-center rounded-xl text-[#2B3648] hover:bg-[#F2F4F6] transition-colors"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* 배경 오버레이 */}
      <div
        aria-hidden
        onClick={closeMenu}
        className={`md:hidden fixed inset-0 z-[100] bg-black/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* 드로어 패널 */}
      <div
        onClick={closeIfLink}
        className={`md:hidden fixed inset-y-0 left-0 z-[101] w-[280px] max-w-[85%] bg-white flex flex-col shadow-[0_0_40px_rgba(17,29,55,0.25)] transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* 로고 + 닫기 */}
        <div className="px-5 pt-5 pb-4 shrink-0 flex items-start justify-between">
          <Link href="/marketing" className="flex flex-col gap-1.5">
            <Image src="/blue-egg-logo-v2.png" alt="BLUE EGG biz" width={242} height={113} className="h-9 w-auto" />
            <p className="text-[11px] text-[#99A0AC] leading-tight pl-0.5">셀프 마케팅 플랫폼</p>
          </Link>
          <button
            type="button"
            onClick={closeMenu}
            aria-label="메뉴 닫기"
            className="shrink-0 h-8 w-8 flex items-center justify-center rounded-lg text-[#5B6472] hover:bg-[#F2F4F6] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 네비게이션 (PC 사이드바와 동일) */}
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
      </div>
    </>
  );
}
