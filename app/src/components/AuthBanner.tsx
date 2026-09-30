"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BlueEggMark, BlueEggText } from "@/components/Logo";

/* 배너 롤링 슬라이드 — 화면 캡처 + 카피가 한 세트로 돈다.
   badge 는 1번 슬라이드에만 붙인다(순위 지표라 리뷰 화면엔 맞지 않는다). */
const SLIDES = [
  {
    img: "/dashboard-preview.png",
    alt: "BLUE EGG biz 대시보드",
    body: "대행사에 맡기고 결과만 기다리고 계신가요?",
    punch: "이제 셀프로 관리하세요!",
    badge: true,
  },
  {
    img: "/slide-rank.png",
    alt: "상위노출 캠페인 순위 추이",
    body: "네이버 플레이스, 쇼핑 등 내 매장과 상품",
    punch: "순위추적을 확인할 수 있어요",
    badge: false,
  },
  {
    img: "/slide-review.png",
    alt: "네이버 플레이스 리뷰 캠페인 신청",
    body: "블로그배포부터 영수증리뷰까지",
    punch: "리뷰 관리도 간편하게!",
    badge: false,
  },
];

const ROLL_MS = 5000;

/* 롤링 상태 — 데스크톱(AuthBanner)과 모바일(AuthBannerCompact)이 같은 규칙을 쓴다. */
function useRollingSlide() {
  const [slide, setSlide] = useState(0);

  const move = (step: number) => setSlide((s) => (s + step + SLIDES.length) % SLIDES.length);

  /* 5초마다 자동 전환. slide 를 의존성에 두어 화살표·닷으로 넘기면
     타이머가 처음부터 다시 돈다(넘기자마자 또 넘어가는 걸 막는다). */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), ROLL_MS);
    return () => clearInterval(id);
  }, [slide]);

  return { slide, setSlide, move };
}

/* 인디케이터 닷 — 두 배너가 공유한다. */
function Dots({
  slide,
  setSlide,
  className = "",
}: {
  slide: number;
  setSlide: (i: number) => void;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {SLIDES.map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => setSlide(i)}
          aria-label={`${i + 1}번째 슬라이드`}
          aria-current={i === slide}
          className={`h-1.5 rounded-full transition-all cursor-pointer ${
            i === slide ? "w-5 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
          }`}
        />
      ))}
    </div>
  );
}

/* 로그인·회원가입이 공유하는 좌측 브랜드 배너.
   두 화면이 같은 카피·캡처를 돌아야 해서 한 군데서만 관리한다. */
export default function AuthBanner() {
  const { slide, setSlide, move } = useRollingSlide();

  return (
    <aside className="hidden lg:flex lg:w-[56%] shrink-0 flex-col justify-between relative overflow-hidden rounded-[28px] px-8 py-10 text-white"
      style={{ background: "var(--gradient-point-wide)" }}
    >
      {/* 데코 — 육각/블롭 */}
      <div className="pointer-events-none absolute -top-16 -right-14 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-[#9CD5FF]/15 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute top-8 right-10 h-24 w-24 rotate-12 rounded-3xl border border-white/15" aria-hidden />
      <div className="pointer-events-none absolute bottom-24 right-6 h-16 w-16 -rotate-12 rounded-2xl border border-white/10" aria-hidden />

      {/* 상단: 로고 */}
      <Link href="/marketing" className="relative inline-flex w-fit items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-lg">
          <BlueEggMark className="h-7 w-auto" />
        </span>
        <BlueEggText className="h-8 w-auto" onDark />
      </Link>

      {/* 중앙: 제품 스크린샷 */}
      <div className="relative my-4 flex justify-center">
        <div className="relative w-full max-w-[780px]">
          <div key={slide} className="animate-roll-fade overflow-hidden rounded-xl bg-[#0B1533] shadow-[0_28px_60px_-18px_rgba(3,10,40,.7)] ring-1 ring-white/20">
            <Image
              src={SLIDES[slide].img}
              alt={SLIDES[slide].alt}
              width={1900}
              height={916}
              priority
              className="w-full"
            />
          </div>

          {/* 플로팅 스탯 카드 — 순위 지표라 1번 슬라이드에만 */}
          {SLIDES[slide].badge && (
          <div className="animate-roll-fade absolute -bottom-8 -right-7 w-[220px] rounded-2xl bg-white p-4.5 shadow-[0_18px_36px_-10px_rgba(3,10,40,.55)]">
            <p className="text-[11px] font-bold text-brand-muted">내 캠페인 순위</p>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-[19px] font-extrabold tabular-nums text-brand-dark">74위</span>
              <svg className="h-3 w-3 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7" />
              </svg>
              <span className="text-[19px] font-extrabold tabular-nums text-brand-primary">8위</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-brand-success">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
              66단계 상승
            </div>
          </div>
          )}
        </div>
      </div>

      {/* 하단: 롤링 카피 + 인디케이터 */}
      <div className="relative">
        {/* key 를 갈아끼워 슬라이드가 바뀔 때마다 페이드가 다시 돈다 */}
        <div key={slide} className="animate-roll-fade min-h-[104px] text-center">
          <p className="text-[19px] font-bold leading-[1.5] text-white/85">{SLIDES[slide].body}</p>
          <p className="mt-2.5 text-[20px] font-extrabold leading-[1.45] text-white">{SLIDES[slide].punch}</p>
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="이전 슬라이드"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/35 text-white transition-colors hover:bg-white hover:text-brand-primary cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <Dots slide={slide} setSlide={setSlide} className="px-1" />

          <button
            type="button"
            onClick={() => move(1)}
            aria-label="다음 슬라이드"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/35 text-white transition-colors hover:bg-white hover:text-brand-primary cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ────────────────────────────────────────────────────────────
   모바일용 컴팩트 배너 — 좌측 패널이 숨겨지는 lg 미만에서 폼 위에 놓는다.
   같은 슬라이드를 돌리되 캡처 이미지는 싣지 않는다. 회원가입 폼이 길어서
   상단에 무거운 히어로가 오면 첫 입력 필드가 한참 아래로 밀린다.
──────────────────────────────────────────────────────────── */
export function AuthBannerCompact({ className = "" }: { className?: string }) {
  const { slide, setSlide, move } = useRollingSlide();

  return (
    <div
      className={`relative overflow-hidden rounded-2xl px-5 py-5 text-white ${className}`}
      style={{ background: "var(--gradient-point-wide)" }}
    >
      <div className="pointer-events-none absolute -top-10 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" aria-hidden />

      <Link href="/marketing" className="relative inline-flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
          <BlueEggMark className="h-6 w-auto" />
        </span>
        <BlueEggText className="h-6 w-auto" onDark />
      </Link>

      {/* 카피 — 슬라이드마다 줄 수가 달라도 배너 높이가 튀지 않게 최소 높이를 잡는다 */}
      <div key={slide} className="animate-roll-fade relative mt-4 min-h-[68px]">
        <p className="text-[13px] leading-relaxed text-white/70">{SLIDES[slide].body}</p>
        <p className="mt-1 text-[18px] font-extrabold leading-snug">{SLIDES[slide].punch}</p>
      </div>

      <div className="relative mt-3 flex items-center justify-between">
        <Dots slide={slide} setSlide={setSlide} />
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="이전 슬라이드"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/35 text-white transition-colors hover:bg-white hover:text-brand-primary cursor-pointer"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="다음 슬라이드"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/35 text-white transition-colors hover:bg-white hover:text-brand-primary cursor-pointer"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
