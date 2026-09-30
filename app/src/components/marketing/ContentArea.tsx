"use client";

import React from "react";
import { usePathname } from "next/navigation";
import SiteFooter from "./SiteFooter";

/** 마케팅 본문 영역 — 스크롤 컨테이너와 페이지별 여백만 담당한다. */
export default function ContentArea({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // SA광고 최적화 등 = 1280px 제한 없이 콘텐츠 영역 전체 폭 사용(중앙 정렬·좌우 여백만 유지)
  const isWide = pathname === "/marketing/ads/naver-cpc" || pathname === "/marketing/ads/naver-cpc-refund" || pathname === "/marketing/reward/place/guaranteed";

  return (
    <>
      {/* Content */}
      <div className="flex flex-1 min-h-0">
        {/* 스크롤 영역 */}
        <div id="be-scroll" className="flex flex-col flex-1 min-w-0 overflow-y-auto">
        <main className="flex-1 bg-white px-6 md:px-12 lg:px-16 pt-6 md:pt-10 pb-12 md:pb-16">
          {/* 제목은 각 페이지 최상단(박스 밖), 콘텐츠 카드가 박스 역할 */}
          {children}
        </main>
        {/* 회사 정보 — 사이드바가 아니라 본문 맨 아래에 둔다 */}
        <SiteFooter />

        </div>
        {/* END 스크롤 영역 */}

      </div>
    </>
  );
}
