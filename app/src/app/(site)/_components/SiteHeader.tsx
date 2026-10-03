"use client";

/**
 * 랜딩 헤더.
 *
 * 히어로 영상 위에 겹쳐 뜬다. 맨 위에서는 배경 없이 투명하고, 조금이라도
 * 스크롤하면 본문 글자와 섞이지 않게 바탕과 경계선이 올라온다.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { platformUrl } from "@/utils/platform";

/* 원페이지 — 모든 메뉴가 한 화면 안의 앵커를 가리킨다 */
/* 원페이지 — 메뉴 하나가 섹션 하나를 가리킨다. 라벨은 그 섹션 제목에서 딴다.
     소개      → "브랜드사도, 사장님도, 대행사도 한 플랫폼에서."
     서비스    → "필요한 바이럴 마케팅을 한곳에서 실행하세요"
     선택 이유 → "블루에그비즈를 선택해야 하는 이유"
     함께한 브랜드 → "많은 브랜드가 블루에그비즈와 함께하고 있습니다"
     문의      → "블루에그와의 파트너십은 변화와 도약을 위한 기회입니다." */
const NAV = [
  { label: "소개", href: "/#about" },
  { label: "서비스", href: "/#services" },
  { label: "선택 이유", href: "/#features" },
  { label: "함께한 브랜드", href: "/#clients" },
  { label: "문의", href: "/#contact" },
];

export default function SiteHeader() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll(); // 새로고침으로 중간에서 시작하는 경우
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      /* 맨 위에서는 히어로 위에 한 칸 내려 얹히고, 스크롤하면 여백을 접고 위로 붙는다.
         · 여백을 안쪽 줄(h-16)에 주면 바탕이 그만큼 안 따라와 글자가 바 밖으로 삐져나온다.
           그래서 여백은 바탕을 칠하는 이 헤더 자체가 갖는다.
         · 트랜지션은 색만 건다(transition-all 로 두면 padding 까지 애니메이션되는데,
           탭이 백그라운드로 가면 중간값에서 멈춰 헤더가 어정쩡한 높이로 남는다). */
      className={`fixed top-0 z-50 w-full transition-colors duration-300 ${
        solid
          ? "border-b border-white/[0.07] pt-0"
          : "border-b border-transparent bg-transparent pt-6 md:pt-10"
      }`}
      /* 스크롤하면 포인트 그라디언트를 깐다 — 가로로 길고 낮은 줄이라 wide 램프를 쓴다
         (--gradient-point 의 45deg 는 밝은 끝이 우상단 모서리에만 몰려 바에서는 안 보인다). */
      style={solid ? { background: "var(--gradient-point-wide)" } : undefined}
    >
      <div className="w-[95.6%] max-w-[1440px] mx-auto h-16 flex items-center justify-between">
        <Link href="/" aria-label="홈으로">
          <Logo size="h-9" onDark />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/85">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 오른쪽 묶음 — 로그인 | 회원가입 · 알약 버튼 */}
        <div className="flex items-center gap-4 text-sm font-medium">
          <a
            href={platformUrl("/login")}
            className="text-white/75 transition-colors hover:text-white"
          >
            로그인
          </a>
          {/* 두 링크를 갈라 주는 얇은 세로줄 */}
          <span className="h-3 w-px bg-white/30" aria-hidden />
          <a
            href={platformUrl("/signup")}
            className="text-white/75 transition-colors hover:text-white"
          >
            회원가입
          </a>
          <a
            href={platformUrl("/signup")}
            /* 투명한 히어로 위에서도, 파란 바 위에서도 읽히게 반투명 흰 면을 깐다 */
            className="ml-2 rounded-full bg-white/15 px-6 py-2.5 text-sm font-bold text-white ring-1 ring-white/35 backdrop-blur-sm transition-colors hover:bg-white hover:text-[#0A1020]"
          >
            무료 체험하기
          </a>
        </div>
      </div>
    </header>
  );
}
