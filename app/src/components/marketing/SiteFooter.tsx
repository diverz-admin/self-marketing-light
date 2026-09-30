import Link from "next/link";

/** 플랫폼 공통 푸터 — 본문 맨 아래. 회사 정보는 개발본과 같은 문구 */
export default function SiteFooter() {
  return (
    <footer className="border-t border-brand-border bg-white px-6 md:px-12 lg:px-16 py-7 pb-[92px] md:pb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="text-[12px] leading-[1.75] text-brand-muted">
          <p className="text-[13px] font-extrabold text-brand-sub">BLUE EGG · 셀프 마케팅 플랫폼</p>
          <p className="mt-1">
            <span className="font-semibold text-brand-sub">주식회사 다이버즈 (DIVERZ Inc.)</span>
            <span className="mx-2 text-brand-border-strong">|</span>대표자 전채민
            <span className="mx-2 text-brand-border-strong">|</span>사업자등록번호 174-88-03266
          </p>
          <p>
            경기도 고양시 일산동구 백마로 195, 5007호 (장항동, 엠시티타워&amp;엠시티오피스텔)
            <span className="mx-2 text-brand-border-strong">|</span>영업시간 10:00 - 19:00
          </p>
        </div>
        <div className="flex flex-col gap-1.5 text-[12px] text-brand-muted md:items-end">
          <div className="flex gap-3 font-semibold text-brand-sub">
            <Link href="/terms" className="hover:text-brand-primary">이용약관</Link>
            <Link href="/privacy" className="font-bold hover:text-brand-primary">개인정보처리방침</Link>
          </div>
          <p>COPYRIGHT © DIVERZ Inc. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  );
}
