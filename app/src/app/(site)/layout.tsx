import Link from "next/link";
import Logo from "@/components/Logo";
import SiteHeader from "./_components/SiteHeader";
import EggCursor from "./_components/EggCursor";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A1020]">
      {/* 헤더는 히어로 영상 위에 겹쳐 뜬다 (fixed) */}
      <SiteHeader />

      {/* 마우스 포인터를 대신하는 점 알 — 마우스가 있는 기기에서만 뜬다 */}
      <EggCursor />

      <main className="flex-1">{children}</main>

      {/* Footer */}
      {/* 좁은 화면에서는 전부 가운데로 모으고 한 덩어리로 붙인다 — 소제목(Address·
          Contact)과 덩어리 사이 여백까지 그대로 쌓으면 푸터만 한 화면 반을 먹는다.
          md 부터 원래의 두 칸 배치와 소제목이 돌아온다. */}
      <footer className="border-t border-white/[0.07] bg-[#0A1020] py-10 md:py-14">
        <div className="mx-auto w-[95.6%] max-w-[1440px] text-center text-sm text-white/40 md:text-left">
          {/* 로고 · 메뉴 */}
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:gap-6">
            <Logo size="h-7 md:h-8" onDark />
            <nav className="flex items-center gap-5">
              <Link href="/#about" className="hover:text-white transition-colors">
                소개
              </Link>
              <Link href="/#services" className="hover:text-white transition-colors">
                서비스
              </Link>
              <Link href="/#contact" className="hover:text-white transition-colors">
                문의
              </Link>
            </nav>
          </div>

          {/* 주소 · 연락처 — 좁은 화면에서는 소제목을 접고 값만 한 줄씩 쌓는다 */}
          <div className="mt-6 grid gap-1.5 border-t border-white/[0.07] pt-6 sm:grid-cols-2 sm:gap-6 md:mt-12 md:pt-12">
            <div>
              <p className="hidden text-[15px] font-bold text-white/85 md:block">Address</p>
              <p className="text-[13px] leading-[1.7] break-keep md:mt-4 md:text-[14px]">
                경기도 고양시 일산동구 백마로 195, 5007호
              </p>
            </div>
            <div>
              <p className="hidden text-[15px] font-bold text-white/85 md:block">Contact</p>
              <p className="text-[13px] leading-[1.7] md:mt-4 md:text-[14px]">
                <span className="hidden md:inline">E. </span>
                <a
                  href="mailto:blueegg.admin@gmail.com"
                  className="transition-colors hover:text-white"
                >
                  blueegg.admin@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* 등록 정보 · 저작권 — 좁은 화면에서는 위 덩어리에 그대로 이어 붙인다 */}
          <div className="mt-1.5 space-y-1.5 text-[12px] leading-[1.7] text-white/35 md:mt-12 md:space-y-3 md:text-[13px]">
            <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 md:justify-start md:gap-x-4">
              <span>대표자 : 전재민</span>
              {/* 두 항목을 갈라 주는 얇은 세로줄 */}
              <span className="h-3 w-px bg-white/20" aria-hidden />
              <span>사업자등록번호 : 174-88-03266</span>
            </p>
            <p className="break-keep">Copyright &copy; 2026 주식회사 다이버즈. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
