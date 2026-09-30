"use client";

/**
 * 쇼핑 리뷰 — 상담형 상세 랜딩.
 *
 * 이 화면은 "신청 폼"이 아니다. 개발본(rv_shop_apply)과 같이 상담으로 시작한다.
 * 제품 제공 여부·배송/회수·수량이 건마다 달라 단가를 미리 정할 수 없기 때문이고,
 * 운영정책 SV-04(추가 서비스의 견적·작업범위 합의는 상담 기록으로 대체)와도 맞다.
 * 그래서 장바구니·즉시 결제가 없고, 모든 행동이 상담 창구 한 곳으로 모인다.
 *
 * 레이아웃은 제품 상세페이지 형식이다 — 한 섹션에 메시지 하나,
 * 큰 타이포와 넉넉한 여백, 스크롤하며 순서대로 읽히는 구성.
 * 좌우 끝까지 닿아야 해서 ContentArea 에서 이 경로만 풀블리드로 처리한다.
 * 화면 이름은 히어로가 겸한다(PageHeader 를 따로 두면 제목이 두 번 나온다).
 */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { POLICY } from "@/lib/policy";

/** 상담 창구 — 개발본과 같이 카카오톡 채널로 연결한다 */
const CONSULT_HREF = "https://pf.kakao.com/_JymrX/chat";

/**
 * 운영 실적 — 운영팀이 넘긴 2025년 집계값을 그대로 적는다.
 * 화면에서 계산하거나 추정하지 않는다(집계 기준이 바뀌면 이 표만 고친다).
 */
const STATS = [
  { label: "월 평균 문의건수", value: 86, unit: "건" },
  { label: "함께했던 상품", value: 2533, unit: "건" },
  { label: "재계약률", value: 78, unit: "%" },
];
const STATS_NOTE = "*2025년 기준";

const STEPS = [
  { no: "01", title: "상담 신청", desc: "채팅으로 상품·목표·예산을 알려주세요." },
  { no: "02", title: "조건·견적 협의", desc: "채널(쇼핑/쿠팡)·제품 제공 여부·수량·기간을 맞춰 견적을 드립니다." },
  { no: "03", title: "리뷰어 매칭", desc: "상품에 맞는 실사용자 리뷰어를 매칭합니다." },
  { no: "04", title: "구매·리뷰 진행", desc: "리뷰어가 구매·수령 후 리뷰를 작성합니다." },
  { no: "05", title: "결과 리포트", desc: "작성된 리뷰 목록과 결과를 정리해 전달합니다." },
];

const FAQS = [
  {
    q: "네이버 쇼핑과 쿠팡 둘 다 되나요?",
    a: "네, 한 번의 상담으로 두 채널을 함께 진행할 수 있습니다. 채널별 조건은 상담에서 안내드립니다.",
  },
  {
    q: "제품을 꼭 제공해야 하나요?",
    a: "아니요. 제품 제공형과 리뷰어 실구매형(구매비 정산) 중 선택할 수 있습니다.",
  },
  {
    q: "어뷰징 위험은 없나요?",
    a: "실제 사용자의 실구매·실사용 기반이라 매크로 방식이 아닙니다.",
  },
  {
    q: "비용은 어떻게 정해지나요?",
    a: "제품 제공 여부·배송/회수·수량에 따라 건마다 달라 정가 대신 상담 견적으로 진행합니다.",
  },
  {
    q: "리뷰가 누락·삭제되면요?",
    a: "진행 결과를 리포트로 확인하고, 누락 건은 상담을 통해 보완합니다.",
  },
];

/* 히어로에 띄우는 리뷰 카드 샘플. 이 서비스가 만들어 내는 결과물의 예시다.
   별점을 5·5·4 로 섞는다 — 전부 5점이면 만들어 낸 티가 난다. */
const REVIEWS = [
  {
    rating: 5,
    text: "받아보고 바로 써봤는데 생각보다 훨씬 좋아요. 재구매 의사 있습니다.",
    channels: ["네이버 쇼핑", "쿠팡"],
  },
  {
    rating: 5,
    text: "배송도 빠르고 포장도 꼼꼼했어요. 사진이랑 똑같아서 만족합니다.",
    channels: ["네이버 쇼핑"],
  },
  {
    rating: 4,
    text: "한 달 써보고 남깁니다. 가격 대비 성능이 확실히 좋네요.",
    channels: ["쿠팡"],
  },
];

/* 이런 분들에게 — 고민을 그대로 옮긴 카드.
   출처는 "패션 A사" 처럼 업체를 특정하지 않고 고민 유형으로 적는다.
   실제 고객 인용이 아니므로, 있지도 않은 레퍼런스를 만든 것처럼 보이면 안 된다. */
const TARGETS = [
  { icon: "🆕", tag: "신규 출시", lines: ["이제 막 상품을 올렸는데", "리뷰가 하나도 없어", "구매가 붙지 않아요"] },
  { icon: "🛒", tag: "채널 확장", lines: ["쇼핑이랑 쿠팡을", "따로 맡기다 보니", "관리가 번거로워요"] },
  { icon: "📦", tag: "제공 부담", lines: ["제품을 계속 보내기엔", "배송·회수 비용이", "부담스러워요"] },
  { icon: "⚠️", tag: "정책 리스크", lines: ["어뷰징으로 걸릴까 봐", "선뜻 시작을", "못 하겠어요"] },
  { icon: "💬", tag: "견적", lines: ["얼마가 드는지 몰라서", "문의부터", "망설여져요"] },
];

/* 어두운 밴드·CTA 카드 면 — 키컬러 램프(--gradient-point)를 그대로 쓴다 */
const POINT_BG = "var(--gradient-point)";

/* ── 섹션 문법 (toss.im 벤치마킹) ──
 * · 아이브로우·설명 문단을 두지 않는다. 헤드라인 다음 바로 항목이 온다.
 * · 헤드라인은 문장이 아니라 두 줄짜리 구(句)다 — "~합니다" 대신 "~하게".
 * · 항목은 설명 문단이 아니라 divider 로 끊은 짧은 줄로 늘어놓는다.
 * · 한 섹션에 메시지 하나. 여백을 크게 줘서 스크롤이 한 호흡씩 끊기게 한다.
 */
/* ── 섹션 문법 (NICEbizmap 벤치마킹) ──
 * · 영문 아이브로우 → 한글 헤드라인 → 보조문구 순서로 중앙 정렬한다.
 * · 밴드를 흰색 ↔ 연블루 ↔ 블루로 번갈아 깔아 스크롤이 구간으로 끊기게 한다.
 * · 섹션마다 화면/카드 목업을 두고, 반짝임 장식으로 여백을 채운다.
 * · CTA 는 아이콘이 붙은 알약형 버튼.
 */
const SEC = "relative overflow-hidden px-7 md:px-14 py-20 md:py-28";
const LIGHT = `${SEC} bg-white`;
const TINT = `${SEC} bg-brand-lighter`;
const BLUE = `${SEC} text-white`;
const BLUE_BG = "linear-gradient(135deg,#2A5EFF 0%,#2452EB 55%,#1B3AC4 100%)";
/* 영문 라벨 — 헤드라인 위 한 줄 */
const EYEBROW = "text-[13.5px] md:text-[14.5px] font-extrabold uppercase tracking-[0.14em] text-brand-primary";
/* 보조문구 */
const LEAD = "mx-auto mt-4 max-w-[620px] text-[16.5px] md:text-[18px] leading-relaxed text-brand-sub break-keep";
/* 두 줄 헤드라인 — 이 화면에서 가장 큰 글자다 */
const H2 = "text-[34px] md:text-[52px] font-extrabold leading-[1.22] tracking-tight break-keep";

function ArrowIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

/**
 * 0 에서 목표값까지 굴러 올라가는 숫자.
 * 화면에 들어올 때 한 번만 돈다 — 오르내릴 때마다 다시 세면 읽기를 방해한다.
 * 애니메이션을 끈 사용자에게는 세지 않고 최종값만 보여준다.
 */
function CountUp({ to, duration = 1600 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const start = performance.now();
        const tick = (now: number) => {
          if (reduce) return setN(to);
          const p = Math.min((now - start) / duration, 1);
          /* ease-out cubic — 빠르게 올라갔다가 끝에서 부드럽게 멈춘다 */
          setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  return <span ref={ref}>{n}</span>;
}

/**
 * 스크롤하며 하나씩 올라오는 등장 효과.
 * 상세페이지는 위에서 아래로 읽는 흐름이라, 한 번에 다 보이면 순서가 사라진다.
 * 한 번 보이면 관찰을 끊는다 — 오르내릴 때마다 다시 흔들리면 읽기를 방해한다.
 */
/** 알약형 CTA — 레퍼런스의 기본 버튼 형태 */
function PillLink({
  href,
  children,
  tone = "blue",
}: {
  href: string;
  children: React.ReactNode;
  tone?: "blue" | "white";
}) {
  const blue = tone === "blue";
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-[16.5px] font-extrabold transition-opacity hover:opacity-90 ${
        blue ? "text-white" : "bg-white text-brand-primary"
      }`}
      style={blue ? { background: "var(--gradient-point)", boxShadow: "var(--shadow-point)" } : undefined}
    >
      <ChatIcon className="h-[17px] w-[17px]" />
      {children}
    </Link>
  );
}

function ChatIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm3.75 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm3.75 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  );
}

/**
 * 검색 결과 리스팅 목업 — 같은 상품·같은 가격에서 리뷰만 다를 때를 나란히 보여준다.
 * 실제 판매 데이터가 아니라 설명용 예시다.
 */
function ListingCard({
  rating,
  count,
  highlight = false,
}: {
  rating: string;
  count: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 transition-all ${
        highlight
          ? "bg-white ring-2 ring-brand-primary shadow-[0_18px_40px_-14px_rgba(36,82,235,.35)]"
          : "bg-brand-lighter opacity-70"
      }`}
    >
      <div className="flex gap-3.5 text-left">
        {/* 썸네일 — 예시 상품(텀블러). 회색 사각형 대신 실제 제품 컷을 넣어
            "같은 상품, 리뷰만 다름"이라는 비교가 한눈에 읽히게 한다. */}
        <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-xl bg-white">
          <Image
            src="/tumbler.png"
            alt="스트로우 텀블러 800ml"
            width={136}
            height={215}
            className="h-[74px] w-auto object-contain"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold text-brand-primary">스트로우 텀블러 800ml</p>
          <p className="mt-1 text-[15px] font-extrabold text-brand-dark">
            49,000원
            <span className="ml-1.5 text-[11.5px] font-semibold text-brand-muted">무료배송</span>
          </p>

          {/* 별점 — 비교의 핵심이라 테두리로 감싼다 */}
          <span
            className={`mt-2 inline-flex items-center gap-1 rounded-lg border px-2 py-1 ${
              highlight ? "border-brand-primary bg-brand-primary/5" : "border-brand-border bg-white"
            }`}
          >
            <svg className="h-3.5 w-3.5 text-[#F5B72A]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.48 3.5a.56.56 0 011.04 0l2.12 5.11a.56.56 0 00.48.35l5.52.44c.5.04.7.66.32.99l-4.2 3.6a.56.56 0 00-.19.56l1.29 5.38a.56.56 0 01-.84.61l-4.73-2.88a.56.56 0 00-.58 0L6.98 20.54a.56.56 0 01-.84-.61l1.29-5.38a.56.56 0 00-.19-.56l-4.2-3.6a.56.56 0 01.32-.99l5.52-.44a.56.56 0 00.48-.35L11.48 3.5z" />
            </svg>
            <span className="text-[13px] font-extrabold text-brand-dark tabular-nums">{rating}</span>
            <span className="text-[12px] text-brand-muted tabular-nums">({count})</span>
          </span>

          <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-brand-muted">
            텀블러 브랜드
            <span className="rounded bg-brand-lighter px-1.5 py-0.5 font-bold text-brand-sub">공식</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/** 리뷰 카드 목업 — 이 서비스가 만들어 내는 결과물 */
function ReviewCard({
  review,
  className = "",
}: {
  review: (typeof REVIEWS)[number];
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-brand-border bg-white p-5 text-left shadow-[0_24px_50px_-18px_rgba(17,29,55,.28)] ${className}`}>
      <div className="flex items-center gap-2.5">
        <span className="h-9 w-9 shrink-0 rounded-lg bg-brand-lighter" />
        <div className="min-w-0">
          <p className="text-[12.5px] font-bold text-brand-dark">실사용자 리뷰</p>
          <p className="text-[11px] text-brand-muted">구매 인증 완료</p>
        </div>
      </div>
      <div className="mt-3.5 flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map((n) => (
          <svg
            key={n}
            className={`h-4 w-4 ${n < review.rating ? "text-[#F5B72A]" : "text-brand-border"}`}
            viewBox="0 0 24 24" fill="currentColor"
          >
            <path d="M11.48 3.5a.56.56 0 011.04 0l2.12 5.11a.56.56 0 00.48.35l5.52.44c.5.04.7.66.32.99l-4.2 3.6a.56.56 0 00-.19.56l1.29 5.38a.56.56 0 01-.84.61l-4.73-2.88a.56.56 0 00-.58 0L6.98 20.54a.56.56 0 01-.84-.61l1.29-5.38a.56.56 0 00-.19-.56l-4.2-3.6a.56.56 0 01.32-.99l5.52-.44a.56.56 0 00.48-.35L11.48 3.5z" />
          </svg>
        ))}
        <span className="ml-1.5 text-[12.5px] font-extrabold text-brand-dark tabular-nums">
          {review.rating}
        </span>
      </div>
      <p className="mt-2.5 min-h-[40px] text-[12.5px] leading-relaxed text-brand-sub break-keep">
        {review.text}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {review.channels.map((c) => (
          <span
            key={c}
            className="rounded-md px-2 py-1 text-[10.5px] font-bold"
            style={
              c === "쿠팡"
                ? { background: "#E5484D1A", color: "#E5484D" }
                : { background: "#03C75A1A", color: "#03C75A" }
            }
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* reduced-motion 은 CSS 로만 처리한다 — effect 안에서 동기로 setState 하면
     불필요한 연쇄 렌더가 생긴다. 애니메이션을 끈 사용자는 처음부터 보이게 둔다. */
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        shown
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-6 motion-reduce:opacity-100 motion-reduce:translate-y-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function ShoppingReviewLanding() {
  // 한 번에 하나만 열리게 둔다 — 다 펼쳐 두면 질문 목록을 훑는 이점이 사라진다
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="w-full pb-24 lg:pb-0">
      {/* 좌: 상세페이지 블럭 · 우: 상담 레일 */}
      <div className="flex items-stretch gap-5">

        {/* ══════════ LEFT — 상세페이지 블럭 ══════════ */}
        <div className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-2xl">

          {/* ── 1. 히어로 ── 흰 밴드 · 중앙 정렬. 목업이 아래 밴드로 걸쳐 내려온다. */}
          <section
            className={`${LIGHT} pb-0`}
            /* 흰 밴드가 밋밋해지지 않게 위쪽에 아주 옅은 블루를 깐다 */
            style={{ backgroundImage: "radial-gradient(120% 90% at 50% -10%, rgba(36,82,235,.07), transparent 60%)" }}
          >
            {/* 장식 */}
            <div className="pointer-events-none absolute -left-10 top-10 h-28 w-28 rounded-full bg-brand-primary/5 blur-2xl" aria-hidden />

            <div className="relative text-center">
              <Reveal>
                <p className={EYEBROW}>Real Buyer Review</p>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="mx-auto mt-4 max-w-[680px] text-[36px] md:text-[52px] font-extrabold leading-[1.22] tracking-tight text-brand-dark break-keep">
                  상품은 좋은데
                  <br />
                  <span className="text-brand-primary">리뷰가 없어</span> 고민이신가요?
                </h1>
              </Reveal>
              <Reveal delay={140}>
                <p className={LEAD}>
                  네이버 쇼핑과 쿠팡에서 실제로 구매한 분들이 후기를 남겨요.
                  <br className="hidden sm:block" />
                  별점이 쌓일수록 고민하던 고객도 결제까지 갑니다.
                </p>
              </Reveal>
              <Reveal delay={200}>
                <div className="mt-8">
                  <PillLink href={CONSULT_HREF}>상담 문의하기</PillLink>
                </div>
              </Reveal>

              {/* 결과물 목업 — 아래 연블루 밴드 위로 걸쳐 내려간다.
                  카드마다 기울기를 조금씩 달리해 늘어놓은 느낌을 준다. */}
              <div className="relative mx-auto mt-14 w-full max-w-[880px] pb-16">
                <div className="grid gap-4 md:grid-cols-3">
                  {REVIEWS.map((r, i) => (
                    <Reveal key={r.text} delay={260 + i * 110} className="h-full">
                      <ReviewCard
                        review={r}
                        className={`h-full ${["rotate-[-2.5deg]", "rotate-[1deg]", "rotate-[-1deg]"][i]}`}
                      />
                    </Reveal>
                  ))}
                </div>

                {/* 떠 있는 작은 카드 */}
                <Reveal delay={600}>
                  <div className="absolute -right-2 -top-5 hidden rounded-xl bg-white px-3.5 py-2.5 shadow-[0_16px_34px_-10px_rgba(17,29,55,.3)] sm:block">
                    <p className="text-[10.5px] font-bold text-brand-muted">평균 별점</p>
                    <p className="text-[19px] font-extrabold leading-none text-brand-dark">4.8</p>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ── 2. 이런 분들에게 ── 네이비 밴드 · 고민 카드 행
              아이콘 배지가 카드 위로 반쯤 걸쳐 올라온다. */}
          <section className={SEC} style={{ background: POINT_BG }}>
            <div className="relative text-center">
              <Reveal>
                <p className="text-[13.5px] md:text-[14.5px] font-extrabold uppercase tracking-[0.14em] text-[#8FB0FF]">
                  Who it&apos;s for
                </p>
                <h2 className={`${H2} mt-4 text-white`}>
                  이런 고민, <span className="text-[#8FB0FF]">하고 계신가요?</span>
                </h2>
              </Reveal>

              {/* 카드가 끊기지 않고 옆으로 흐른다. 같은 목록을 두 벌 이어 붙이고 트랙을 -50% 밀어
                  이음매를 감춘다. 위쪽 pt 는 카드 밖으로 걸친 아이콘 배지가 잘리지 않게 두는 자리다. */}
              <Reveal>
                <div className="marquee-mask mt-24 -mx-7 overflow-hidden pt-[38px] pb-2 md:-mx-14">
                  <div className="marquee-track marquee-pausable gap-5" style={{ animationDuration: "36s" }}>
                    {[...TARGETS, ...TARGETS].map((t, i) => (
                      /* 테두리 없이 면으로만 띄운다. 위에서 아래로 옅어지는 그라디언트가 카드에 부피감을 준다. */
                      <div
                        key={`${t.tag}-${i}`}
                        aria-hidden={i >= TARGETS.length}
                        className="relative flex w-[238px] shrink-0 flex-col items-center rounded-[26px] bg-gradient-to-b from-white/[0.13] to-white/[0.05] px-5 pb-8 pt-14"
                      >
                        {/* 아이콘 배지 — 카드 위로 반쯤 걸친다 */}
                        <span className="absolute -top-[34px] flex h-[68px] w-[68px] items-center justify-center rounded-full bg-white text-[36px] shadow-[0_14px_30px_-10px_rgba(3,10,40,.55)]">
                          {t.icon}
                        </span>
                        <p className="text-[16px] leading-[1.85] text-white/80 break-keep">
                          {t.lines.map((l, k) => (
                            <span key={l} className={k === t.lines.length - 1 ? "font-extrabold text-white" : ""}>
                              {l}
                              {k < t.lines.length - 1 && <br />}
                            </span>
                          ))}
                        </p>
                        <p className="mt-auto pt-7 text-[14.5px] font-bold text-[#9FBBFF]">{t.tag}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── 3. 리뷰가 있고 없고의 차이 ── 흰 밴드
              수치를 지어내지 않는다. 구매자가 실제로 겪는 장면만 양쪽에 늘어놓는다. */}
          <section className={LIGHT}>
            <div className="relative text-center">
              <Reveal>
                <p className={EYEBROW}>Why reviews</p>
                <h2 className={`${H2} mt-4 text-brand-dark`}>
                  같은 상품이라도
                  <br />
                  <span className="text-brand-primary">리뷰가 있고 없고는 다릅니다</span>
                </h2>
              </Reveal>

              {/* 같은 상품·같은 가격에서 리뷰만 다를 때 — 말보다 리스팅을 나란히 놓는 편이 빠르다 */}
              <Reveal delay={100}>
                <div className="mt-12 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
                  <div>
                    <ListingCard rating="3.0" count="2" />
                    <p className="mt-3 text-[15px] text-brand-muted">별점 3.0 · 후기 2개</p>
                  </div>

                  <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full text-[14.5px] font-extrabold text-white"
                    style={{ background: "var(--gradient-point)" }}>
                    VS
                  </span>

                  <div>
                    <ListingCard rating="4.9" count="1,284" highlight />
                    <p className="mt-3 text-[15px] font-bold text-brand-dark">별점 4.9 · 후기 1,284개</p>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── 4. 실적 ── 그레이 밴드 · 운영 수치 3칸
              이 화면은 단가를 못 적는 대신(상담 견적) "얼마나 해왔는지"로 신뢰를 보인다.
              값은 STATS 상수 한 곳에서만 온다 — 문구와 숫자가 따로 놀지 않게. */}
          <section className={TINT}>
            <div className="relative text-center">
              <Reveal>
                <p className={EYEBROW}>Track record</p>
                <h2 className={`${H2} mt-4 text-brand-dark`}>
                  많은 분들이 <span className="text-brand-primary">믿고 선택해주셨습니다</span>
                </h2>
              </Reveal>

              <Reveal delay={120}>
                <div className="mx-auto mt-12 max-w-[920px] rounded-[28px] border border-white/70 bg-white/75 px-6 py-8 shadow-[0_24px_60px_-30px_rgba(17,29,55,.28)] backdrop-blur md:px-12 md:py-11">
                  {/* 3칸 · 모바일에서는 세로로 쌓이고 구분선도 가로로 눕는다 */}
                  <dl className="grid grid-cols-1 divide-y divide-brand-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    {STATS.map((s) => (
                      <div key={s.label} className="px-2 py-6 text-center sm:px-6 sm:py-1">
                        <dt className="text-[14.5px] font-bold text-brand-sub break-keep">{s.label}</dt>
                        <dd className="mt-3.5 whitespace-nowrap text-[46px] md:text-[62px] font-extrabold leading-none tracking-tight text-brand-dark tabular-nums">
                          <CountUp to={s.value} />
                          <span className="ml-0.5 align-baseline text-[17.5px] md:text-[21px] font-extrabold text-brand-dark/75">
                            {s.unit}
                          </span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                  {/* 집계 시점 — 숫자만 크게 띄우고 기준을 안 적으면 언제 값인지 알 수 없다 */}
                  <p className="mt-7 text-right text-[13px] text-brand-muted">{STATS_NOTE}</p>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── 5. 진행 프로세스 ── 블루 밴드 */}
          <section className={BLUE} style={{ background: BLUE_BG }}>
            <div className="relative text-center">
              <Reveal>
                <p className="text-[13.5px] md:text-[14.5px] font-extrabold uppercase tracking-[0.14em] text-white/60">
                  Process
                </p>
                <h2 className={`${H2} mt-4 text-white`}>상담부터 <span className="text-[#8FB0FF]">리포트까지</span></h2>
                <p className="mx-auto mt-4 max-w-[560px] text-[16.5px] md:text-[18px] leading-relaxed text-white/65 break-keep">
                  상품과 목표만 알려주시면 나머지는 저희가 맞춥니다.
                </p>
              </Reveal>

              <ol className="mt-12 grid gap-3 text-left sm:grid-cols-2 lg:grid-cols-5">
                {STEPS.map((v, i) => (
                  <Reveal key={v.no} delay={i * 70} className="h-full">
                    <li className="flex h-full flex-col rounded-2xl border border-white/12 bg-white/[0.08] p-5">
                      <span className="text-[22px] font-extrabold leading-none tabular-nums text-white/45">{v.no}</span>
                      <p className="mt-3 text-[17.5px] font-extrabold text-white break-keep">{v.title}</p>
                      <p className="mt-2 text-[14.5px] leading-relaxed text-white/60 break-keep">{v.desc}</p>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>
          </section>

          {/* ── 6. FAQ ── 그레이 밴드 */}
          <section className={TINT}>
            <div className="relative">
              <Reveal>
                <div className="text-center">
                  <p className={EYEBROW}>FAQ</p>
                  <h2 className={`${H2} mt-4 text-brand-dark`}>궁금한 점을 먼저 확인하세요</h2>
                </div>
              </Reveal>

              <div className="mx-auto mt-12 max-w-[720px] space-y-2.5">
                {FAQS.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <Reveal key={f.q} delay={i * 60}>
                      <div className="overflow-hidden rounded-2xl border border-brand-border bg-white">
                        <button
                          type="button"
                          onClick={() => setOpenFaq(open ? null : i)}
                          aria-expanded={open}
                          className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left"
                        >
                          <span className="text-[17px] md:text-[19px] font-bold text-brand-dark break-keep">{f.q}</span>
                          <svg
                            className={`h-5 w-5 shrink-0 text-brand-muted transition-transform ${open ? "rotate-180" : ""}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {open && (
                          <p className="animate-be-fade border-t border-brand-border px-6 py-5 text-[16px] md:text-[17px] leading-relaxed text-brand-sub break-keep">
                            {f.a}
                          </p>
                        )}
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── 7. 마무리 — 3카드 그리드 ── 흰 밴드 */}
          <section className={LIGHT}>
            <div className="relative text-center">
              <Reveal>
                <p className={EYEBROW}>We Support U</p>
                <h2 className={`${H2} mt-4 text-brand-dark`}>
                  상품과 목표만 알려주세요
                </h2>
                <p className={LEAD}>
                  채널·제품 제공 여부·수량·기간을 상담에서 정하고 견적을 드립니다.
                </p>
              </Reveal>

              <div className="mt-12 grid gap-4 text-left sm:grid-cols-3">
                {[
                  { title: "상담 문의", desc: "상품·목표·예산을 알려주시면 조건에 맞춰 견적을 드립니다.", href: CONSULT_HREF, cta: "문의하기" },
                  { title: "서비스 신청내역", desc: "신청한 상담·견적의 진행 상황을 확인하세요.", href: "/marketing/my/service-inquiries", cta: "바로가기" },
                  { title: "내 캠페인 현황", desc: "진행 중인 리워드·리뷰 캠페인을 한 곳에서 확인합니다.", href: "/marketing/my/campaigns", cta: "바로가기" },
                ].map((c, i) => (
                  <Reveal key={c.title} delay={i * 90} className="h-full">
                    <div className="flex h-full flex-col rounded-2xl border border-brand-border bg-white p-6">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
                        style={{ background: "var(--gradient-point)" }}>
                        <ChatIcon className="h-5 w-5" />
                      </span>
                      <p className="mt-4 text-[19px] font-extrabold text-brand-dark break-keep">{c.title}</p>
                      <p className="mt-2 text-[15px] leading-relaxed text-brand-sub break-keep">{c.desc}</p>
                      <Link
                        href={c.href}
                        className="mt-auto pt-5 inline-flex items-center gap-1 text-[15px] font-extrabold text-brand-primary hover:underline"
                      >
                        {c.cta}
                        <ArrowIcon className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={280}>
                <div className="mt-12 flex flex-col items-center gap-3">
                  <PillLink href={CONSULT_HREF}>상담 문의하기</PillLink>
                  <p className="text-[14.5px] text-brand-muted">{POLICY.support.hours} 응대</p>
                </div>
              </Reveal>
            </div>
          </section>

          </div>
        </div>
        {/* END LEFT */}

        {/* ══════════ RIGHT — 상담 레일 (sticky · 좌측 블럭과 상단 정렬) ══════════ */}
        <div className="hidden lg:block w-72 xl:w-80 shrink-0">
          <div className="sticky top-4 space-y-2.5 pb-3">

            {/* 메인 CTA 카드 */}
            <div className="relative overflow-hidden rounded-2xl" style={{ background: POINT_BG }}>
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: "radial-gradient(circle at 50% 110%, rgba(255,255,255,0.12), transparent 60%)" }}
              />
              {/* 한 문장만 남긴다 — 레일은 스크롤 내내 따라다니므로 읽을 게 많으면 오히려 안 읽힌다.
                  "가짜 후기가 아니다"가 이 서비스의 유일한 후킹 포인트라 그 한 줄에 전부 건다. */}
              <div className="relative z-10 px-6 py-10 text-center">
                <p className="text-[11.5px] font-extrabold uppercase tracking-widest text-white/60">
                  실구매 인증 리뷰
                </p>
                <h2 className="mt-4 text-[23px] font-extrabold leading-[1.55] text-white break-keep">
                  가짜 후기 아닌
                  <br />
                  진짜 후기로
                  <br />
                  브랜드 신뢰를 쌓아가요
                </h2>

                <Link
                  href={CONSULT_HREF}
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-[15px] font-extrabold text-brand-primary shadow-lg transition-all hover:bg-white/90"
                >
                  상담 문의하기
                  <ArrowIcon className="w-3.5 h-3.5" />
                </Link>
                {/* 언제 답이 오는지 — 정책(CS-01)에 적힌 값을 그대로 읽는다 */}
                <p className="mt-3.5 text-[11.5px] text-white/55">{POLICY.support.hours} 응대</p>
              </div>
            </div>
          </div>
        </div>
        {/* END RIGHT */}
      </div>

      {/* 레일이 접히는 폭(lg 미만) — 스크롤 어디서든 상담으로 갈 수 있게 하단에 고정한다 */}
      <div className="lg:hidden fixed inset-x-0 bottom-[60px] md:bottom-0 z-40 border-t border-brand-border bg-white px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <Link
          href={CONSULT_HREF}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[17px] font-extrabold text-white"
          style={{ background: "var(--gradient-point)" }}
        >
          상담 문의하기
          <ArrowIcon />
        </Link>
      </div>
    </div>
  );
}
