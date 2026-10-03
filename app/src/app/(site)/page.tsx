"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { AccordionFeatures } from "@/components/ui/accordion-feature-section";
import { platformUrl } from "@/utils/platform";

/* ── 데이터 ─────────────────────────────────────────── */

/* 장점 셋 — 번호 / 제목 / 두 줄 설명 */
const STRENGTHS = [
  {
    no: "01",
    title: "투명한 가격 공개",
    desc: "복잡한 견적 상담 없이 서비스별 가격을 바로 확인할 수 있습니다.\n중간 대행 과정 없이 필요한 마케팅 비용을 투명하게 비교하고 선택하세요.",
    /* 가격표 — 값이 상품처럼 붙어 있다는 뜻 */
    iconPath:
      "M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z M6 6h.008v.008H6V6z",
  },
  {
    no: "02",
    title: "바이럴 채널 한곳에서",
    desc: "블로그, 카페, 리뷰, 커뮤니티까지 바이럴 채널을 한곳에서 고를 수 있습니다.\n필요 없는 채널은 빼고, 우리 브랜드에 맞는 조합만 골라 실행할 수 있습니다.",
    /* 장바구니 — "쇼핑하듯 고른다"를 그대로 */
    iconPath:
      "M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z",
  },
  {
    no: "03",
    title: "실시간 순위 체크",
    desc: "진행 중인 마케팅의 결과를 감으로 판단하지 않습니다.\n내 키워드 순위와 변화 흐름을 실시간으로 확인하며 더 똑똑하게 관리할 수 있습니다.",
    /* 막대 그래프 — 통합 순위관리 카드와 같은 아이콘 */
    iconPath:
      "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  },
];

/* 타깃별 활용 — 브랜드사 · 사장님 · 대행사.
   레퍼런스처럼 노드 이름이 곧 소제목이고, 그 아래 두 줄 설명이 붙는다. */
const AUDIENCES = [
  {
    tag: "브랜드사",
    desc: "신제품 홍보, 리뷰 확보, 콘텐츠 제작, 커뮤니티 노출까지\n브랜드 성장에 필요한 마케팅을 한곳에서 실행할 수 있습니다.",
    iconPath:
      "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z",
  },
  {
    tag: "사장님",
    desc: "우리 매장과 상품에 맞는 바이럴 마케팅만 골라\n예산에 맞게 부담 없이 시작할 수 있습니다.",
    iconPath:
      "M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z",
  },
  {
    tag: "대행사",
    desc: "반복적인 마케팅 실행 업무를 더 빠르고 효율적으로 운영하고\n캠페인 관리와 순위 체크를 한 번에 확인할 수 있습니다.",
    iconPath:
      "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
  },
];

/* 성과 지표 */
const STATS = [
  { k: "300+", v: "함께하는 브랜드·매장" },
  { k: "90%", v: "재계약률" },
  { k: "12,000+", v: "누적 캠페인 실행", point: true },
];

/* 마케팅 종류 — 다섯 갈래. 번호 / 제목 / 두 줄 설명 / 해시태그 */
const CATEGORIES = [
  {
    no: "01",
    title: "통합 순위관리",
    desc: "내 브랜드와 키워드의 현재 순위를 실시간으로 확인하고 관리할 수 있습니다.\n검색 노출 현황을 데이터로 확인해 더 정확한 마케팅 방향을 잡을 수 있습니다.",
    items: ["플레이스 순위", "쇼핑 순위", "키워드 추적"],
    image: "/platform/rank-nav.jpg",
    overlay: "/platform/rank-detail.jpg",
    href: "/marketing/rank",
    iconPath:
      "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  },
  {
    no: "02",
    title: "상위노출 리워드마케팅",
    desc: "고객 참여를 기반으로 브랜드와 상품의 노출을 높이는 마케팅입니다.\n유입, 클릭, 검색 행동을 통해 원하는 키워드의 상위노출을 도와줍니다.",
    items: ["플레이스 유입", "스마트스토어", "쿠팡"],
    image: "/platform/reward-nav.jpg",
    href: "/marketing/reward/place",
    iconPath: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
  },
  {
    no: "03",
    title: "리뷰 / 체험단",
    desc: "실제 고객 경험을 바탕으로 리뷰와 콘텐츠를 확보할 수 있습니다.\n상품 신뢰도를 높이고 구매 전환에 필요한 후기 자산을 쌓을 수 있습니다.",
    items: ["블로그 체험단", "기자단", "방문자·영수증 리뷰"],
    image: "/platform/review-nav-v2.jpg",
    href: "/marketing/review/place",
    iconPath:
      "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
  },
  {
    no: "04",
    title: "콘텐츠 제작",
    desc: "상세페이지, 카드뉴스, 숏폼, SNS 콘텐츠 등\n마케팅에 필요한 콘텐츠를 목적에 맞게 제작할 수 있습니다.",
    items: ["상세페이지", "브랜드 홈페이지", "이미지·영상"],
    image: "/platform/content-nav-v2.jpg",
    href: "/marketing/content/detail",
    iconPath:
      "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z",
  },
  {
    no: "05",
    title: "커뮤니티마케팅",
    desc: "카페, 커뮤니티, 게시판 등 타깃 고객이 모여 있는 채널에\n자연스럽게 브랜드와 상품을 노출할 수 있습니다.",
    items: ["맘카페", "카페·게시판", "오픈채팅"],
    image: "/platform/community-nav-v3.jpg",
    href: "/marketing/community/cafe",
    iconPath:
      "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
  },
];

type FillLine = {
  text: string;
  /** 줄 끝에 붙는 키컬러 조각. 같은 줄이지만 색만 다르다 */
  tail?: string;
};

/* 줄바꿈은 브라우저에 맡기지 않고 직접 끊는다. 한 줄이 접히면 그라디언트가
   두 줄에 한 번에 번져 채움 효과가 깨진다. */
const HERO_TAGLINE: FillLine[] = [
  { text: "바이럴 마케팅. 이제 한곳에서." },
  { text: "가격은 투명하게, 순위는 실시간으로 확인하는" },
  { text: "바이럴마케팅 솔루션", tail: "BlueEgg biz" },
];

/* 좁은 화면용 — 위 문구를 그대로 쓰면 둘째 줄이 한 번 더 접혀 네 줄이 된다.
   줄 수를 세 줄로 맞추려고 둘째 줄을 한 문장으로 끊었다. */
const HERO_TAGLINE_SM: FillLine[] = [
  { text: "바이럴 마케팅. 이제 한곳에서." },
  { text: "가격은 투명하게, 순위는 실시간으로." },
  { text: "바이럴마케팅 솔루션", tail: "BlueEgg biz" },
];

/* 키컬러 램프. 어두운 바탕 위 글자라 --gradient-point-wide 의 어두운 끝(#152C9E)은
   빼고, 읽히는 구간(#2452EB → #2A5EFF)에 밝은 끝을 하나 더 얹었다. */
const KEY_RAMP = "linear-gradient(100deg,#2452EB 0%,#2A5EFF 50%,#79B0FF 100%)";

/** 흰 글자 — 채운 자리는 흰색, 남은 자리는 회색 */
const WHITE_FILL =
  "linear-gradient(90deg,#fff 0%,#fff var(--fill),rgba(255,255,255,.22) var(--fill),rgba(255,255,255,.22) 100%)";
/** 키컬러 글자 — 램프를 통째로 깔고 남은 자리만 회색으로 덮는다 */
const KEY_FILL = `linear-gradient(90deg,transparent 0,transparent var(--fill),rgba(255,255,255,.22) var(--fill),rgba(255,255,255,.22) 100%), ${KEY_RAMP}`;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * 스크롤에 따라 글자가 채워지는 문단.
 *
 * 조각마다 가로 그라디언트를 깔고 `background-clip: text` 로 글자만 남긴다.
 * 채움 위치(`--fill`)를 스크롤 진행도로 밀어 주면 왼쪽부터 차오른다. 줄 단위로
 * 진행도를 어긋나게 줘서 첫 줄부터 차례로 채워진다.
 *
 * 한 줄이 색이 다른 조각으로 나뉘면(`tail`) 조각 폭을 알아야 끊기지 않고 이어서
 * 채울 수 있다. 스크롤마다 폭을 재면 레이아웃이 튀니 따로 재서 들고 있는다.
 *
 * 스크롤마다 리렌더하면 비싸니 ref 로 CSS 변수만 직접 건드린다.
 */
function ScrollFillLines({ lines }: { lines: FillLine[] }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const partRefs = useRef<(HTMLSpanElement | null)[][]>([]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let widths: number[][] = [];
    const measure = () => {
      widths = partRefs.current.map((parts) =>
        parts.map((el) => el?.offsetWidth ?? 0),
      );
    };

    /* 진행도가 눈에 띄게 달라졌을 때만 다시 칠한다 — 스크롤 한 번에 --fill 을
       수십 번 고쳐 쓰면 글자 그라디언트가 그만큼 다시 그려져 스크롤이 끊긴다. */
    let lastP = -1;

    const apply = () => {
      const vh = window.innerHeight || 1;
      const top = host.getBoundingClientRect().top;
      /* 문단이 화면 아래에서 올라오는 동안 0 → 1 */
      const p = reduced ? 1 : clamp01((vh * 0.82 - top) / (vh * 0.5));
      if (Math.abs(p - lastP) < 0.002) return;
      lastP = p;

      partRefs.current.forEach((parts, i) => {
        const q = clamp01(p * lines.length - i);
        const w = widths[i] ?? [];
        const total = w.reduce((a, b) => a + b, 0) || 1;
        let done = q * total; // 이 줄에서 채워진 가로 길이

        parts.forEach((el, j) => {
          const wj = w[j] || 1;
          el?.style.setProperty("--fill", `${(clamp01(done / wj) * 100).toFixed(1)}%`);
          done -= wj;
        });
      });
    };

    /* 스크롤 이벤트는 한 프레임에 여러 번 들어온다(특히 트랙패드).
       프레임당 한 번으로 모아 준다. */
    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        apply();
      });
    };

    const onResize = () => {
      measure();
      lastP = -1; // 폭이 바뀌었으니 같은 진행도라도 다시 칠한다
      apply();
    };

    measure();
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [lines]);

  return (
    <div ref={hostRef} className="text-center">
      {lines.map((line, i) => (
        <span key={line.text} className="block">
          {[{ text: line.text }, ...(line.tail ? [{ text: line.tail, accent: true }] : [])].map(
            (part, j) => (
              <span
                key={part.text}
                ref={(el) => {
                  (partRefs.current[i] ??= [])[j] = el;
                }}
                className={`inline-block bg-clip-text text-transparent${j > 0 ? " ml-[0.3em]" : ""}`}
                style={{
                  backgroundImage: "accent" in part && part.accent ? KEY_FILL : WHITE_FILL,
                }}
              >
                {part.text}
              </span>
            ),
          )}
        </span>
      ))}
    </div>
  );
}

/**
 * 0 에서 목표값까지 굴러 올라가는 숫자.
 *
 * "12,000+" 처럼 숫자 뒤에 기호가 붙은 값을 그대로 받는다 — 숫자만 세고
 * 천 단위 쉼표와 뒤 기호(+·%)는 원래 표기 그대로 붙인다.
 * 화면에 들어올 때 한 번만 돈다. 움직임을 줄여 달라고 설정했으면 최종값만 보여준다.
 */
function RollingNumber({ value, duration = 1500 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [n, setN] = useState(0);

  /* "12,000+" → 숫자 12000 · 쉼표 사용 여부 · 꼬리 "+" */
  const m = value.match(/^([\d,]+)(.*)$/);
  const target = m ? Number(m[1].replace(/,/g, "")) : 0;
  const grouped = m ? m[1].includes(",") : false;
  const tail = m ? m[2] : value;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setN(target);
          return;
        }
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          /* ease-out cubic — 빠르게 올라갔다가 끝에서 부드럽게 멈춘다 */
          setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
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
  }, [target, duration]);

  return (
    <span ref={ref}>
      {grouped ? n.toLocaleString("ko-KR") : n}
      {tail}
    </span>
  );
}

/**
 * 스크롤로 들어오면 제자리로 미끄러져 들어온다.
 *
 * 기본은 아래에서 위로(`up`) — 읽는 방향과 같아 본문 어디에 써도 자연스럽다.
 * 지표 바처럼 가로로 긴 줄만 왼쪽에서 오른쪽으로(`left`) 들어오게 둔다.
 *
 * 한 번 나타나면 관찰을 끊는다 — 오르내릴 때마다 다시 움직이면 읽는 데 방해된다.
 * 움직임을 줄여 달라고 설정한 사람에게는 처음부터 제자리에 놓는다.
 */
function SlideIn({
  children,
  delay = 0,
  className = "",
  from = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  from?: "up" | "left";
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        io.disconnect();
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* 움직임 자체는 CSS(.rise-in / .slide-in)가 갖는다 — 움직임을 줄여 달라는
     설정도 거기서 한 번에 처리한다. 여기서는 "보였다"는 사실과 순서(delay)만 넘긴다. */
  return (
    <div
      ref={ref}
      className={`${from === "left" ? "slide-in" : "rise-in"} ${className}`}
      data-shown={shown}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * 히어로 배경 영상.
 *
 * 화면 밖으로 나가면 멈춘다 — 10MB 짜리 영상을 계속 틀어 두면 본문을 읽는
 * 내내 디코딩이 돌아 스크롤에 쓸 프레임을 갉아먹는다. 다시 올라오면 이어서 튼다.
 */
function HeroVideo() {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      /* 어느 폭에서든 히어로를 빈틈없이 채운다 */
      className="absolute inset-0 -z-20 h-full w-full object-cover"
      src="/hero-movie-v5.mp4"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
    />
  );
}

/* ── 페이지 ─────────────────────────────────────────── */

/* ── 공용 조각 ────────────────────────────────────────
   라톤테크 벤치마킹: 점 찍힌 배지 → 큰 국문 헤드라인 → 보조문구 → 알약 CTA.
   색은 대시보드 배너와 같은 블루 램프(--gradient-point-wide)만 쓴다.        */

/* ── 공용 조각 (pintel.co.kr 벤치마킹) ────────────────────────────
   · 전면 다크. 거의 검정 바탕에 좌상단 네이비 글로우 한 점.
   · 섹션은 좌측 정렬: 파란 eyebrow → 대형 국문 헤드라인 → 보조문구 → 아웃라인 알약 버튼.
   · 헤드라인은 강조어만 흰색, 나머지는 회색으로 떨어뜨려 대비를 만든다.
   · 카드는 어두운 회색 면에 라운드. 지표는 가로로 긴 바 하나에 몰아 넣는다.        */

const INK = "#0A1020";        /* 바탕 — 검정이 아니라 딥네이비 */
const SURFACE = "#121A2E";    /* 카드 면 — 바탕과 같은 네이비 계열로 한 단계 밝게 */
/* 디자인 시스템 규칙 그대로 — 면에는 그라디언트 램프, 글자·점에는 단색 키컬러.
   어두운 바탕이라 단색은 램프에서 가장 밝은 navy-500 을 쓴다. */
const POINT_BG = "var(--gradient-point-wide)";
const POINT = "#2A5EFF";

/** 좌상단 네이비 글로우 — 페이지 전체에 한 겹 깐다 */
/**
 * 배경의 푸른 기운.
 *
 * 밑색은 고정해 두고, 그 위에 큰 파란 덩어리 셋을 아주 느리게 떠다니게 한다
 * (한 바퀴에 40~70초). 눈에 띄게 움직이면 글을 읽는 데 방해되므로 "자세히 보면
 * 움직이는" 속도로 둔다.
 *
 * 움직임은 transform 만 쓴다 — 합성 단계에서 처리돼 스크롤 중에도 프레임을
 * 갉아먹지 않는다. blur 필터 대신 부드럽게 퍼지는 radial-gradient 를 쓰는 이유도
 * 같다(큰 blur 는 프레임마다 다시 계산된다).
 */
function AmbientGlow() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
      /* 첫 화면(히어로 영상)에서는 걷어 둔다 — 영상 위에 파란 기운이 얹히면
         영상이 뿌옇게 보인다. 히어로를 지나면서 서서히 들어온다. */
      style={{
        maskImage: "linear-gradient(to bottom, transparent 0, transparent 85vh, #000 125vh)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0, transparent 85vh, #000 125vh)",
      }}
    >
      {/* 고정 밑색 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 45% at 8% 0%, rgba(24,45,120,.55), transparent 62%), radial-gradient(40% 30% at 90% 8%, rgba(20,38,105,.28), transparent 60%)",
        }}
      />
      {/* 떠다니는 덩어리 — 위치·크기·속도를 서로 어긋나게 둬야 패턴이 안 읽힌다 */}
      <span className="glow-blob glow-blob-a" />
      <span className="glow-blob glow-blob-b" />
      <span className="glow-blob glow-blob-c" />
    </div>
  );
}

/** 파란 영문 라벨 */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[15px] font-semibold leading-[1.4] tracking-tight md:text-[20px]"
      style={{ color: POINT }}
    >
      {children}
    </p>
  );
}

/** 아웃라인 알약 버튼 — 레퍼런스의 Detail view ● */
function PillButton({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const inner = (
    <>
      {children}
      <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
    </>
  );
  /* 레퍼런스 실측 260×60, 글자 16 */
  const cls =
    "inline-flex h-[52px] items-center gap-6 rounded-full border border-white/80 px-7 text-[15px] font-bold text-white transition-colors hover:bg-white hover:text-[#0A1020] md:h-[60px] md:px-[30px] md:text-[16px]";
  return external ? (
    <a href={href} className={cls}>{inner}</a>
  ) : (
    <Link href={href} className={cls}>{inner}</Link>
  );
}

/**
 * 섹션 머리 — 좌측 정렬.
 * `head` 는 [흰색으로 강조할 앞부분, 회색으로 떨어뜨릴 뒷부분] 두 조각이다.
 */
function SectionHead({
  eyebrow,
  head,
  lead,
  cta,
  center = false,
}: {
  eyebrow: string;
  head: [React.ReactNode, React.ReactNode?];
  lead?: React.ReactNode;
  cta?: { href: string; label: string; external?: boolean };
  /** 가운데 정렬 — 폭이 묶인 조각들도 같이 가운데로 모은다 */
  center?: boolean;
}) {
  /* 좁은 화면에서는 머리글·보조문구를 가운데로 모은다. 왼쪽 정렬은 md 부터. */
  const mid = center ? " mx-auto" : " mx-auto md:mx-0";
  return (
    <div className={center ? "text-center" : "text-center md:text-left"}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className={`mt-4 max-w-[920px] text-[32px] font-extrabold leading-[1.32] tracking-tight balance-narrow text-white break-keep md:mt-5 md:text-[54px]${mid}`}>
        {head[0]}
        {head[1] && (
          /* 뒷부분은 회색 대신 키컬러 램프로 — 흰 앞부분과 대비를 유지하면서
             브랜드 색을 얹는다 */
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: KEY_RAMP }}
          >
            {head[1]}
          </span>
        )}
      </h2>
      {lead && (
        /* 줄바꿈은 문구에서 <br/> 로 직접 잡는다. 폭이 좁으면 그 줄이 한 번 더
           접혀 문단이 깨지므로, 가장 긴 줄이 들어가는 만큼 열어 둔다. */
        <p className={`mt-[18px] max-w-[780px] text-[15px] font-medium leading-[1.66] balance-narrow text-white/60 break-keep md:text-[18px]${mid}`}>
          {lead}
        </p>
      )}
      {cta && (
        <div className="mt-[49px]">
          <PillButton href={cta.href} external={cta.external}>{cta.label}</PillButton>
        </div>
      )}
    </div>
  );
}

/**
 * 타깃 롤링 패널 — 레퍼런스(pintel)의 Agentic AI Workflow 블록 문법.
 *
 * 왼쪽 정사각 패널의 원형 노드가 일정 간격으로 순환하고, 오른쪽 설명이 그에
 * 맞춰 바뀐다. 노드를 누르면 그 항목으로 바로 넘어가고 순환은 다시 시작한다.
 */
function AudienceRoller() {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false); // 마우스를 올려 두면 멈춘다

  useEffect(() => {
    if (held) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(
      () => setActive((i) => (i + 1) % AUDIENCES.length),
      3600,
    );
    return () => clearInterval(id);
  }, [held, active]);

  const cur = AUDIENCES[active];

  return (
    /* 글이 왼쪽, 패널이 오른쪽. 폭·여백은 레퍼런스 실측(글 35.1% / 사이 17.9%
       / 패널 45%) 그대로. 문서 순서는 패널이 먼저라 order 로 자리를 바꾼다 —
       넓은 화면에서는 글 왼쪽·패널 오른쪽, 좁은 화면에서는 글이 위로 온다. */
    <div className="grid items-center gap-7 sm:gap-14 lg:grid-cols-[minmax(0,35.1%)_minmax(0,45%)] lg:gap-x-[17.9%] lg:gap-y-0">
      {/* ── 왼쪽: 원형 노드 패널 (레퍼런스는 정사각) ── */}
      {/* 레퍼런스 실측 — 660×660, 라운드 130px, rgba(255,255,255,.05) + blur(30px),
          테두리 선은 없다. 불투명하게 두면 뒤를 지나는 알이 경계에서 뚝 잘린다. */}
      <div
        /* 패널은 정사각이라 안쪽 궤도(68.8%) 위아래로 빈 자리가 남는다. 좁은 화면에서는
           그 빈 자리가 글과 도형 사이 간격처럼 보여서, 패널 자체를 조금 줄여 붙인다. */
        className="relative order-2 mx-auto aspect-square w-[86%] max-w-[660px] overflow-hidden rounded-[90px] backdrop-blur-[30px] sm:w-full sm:rounded-[130px] lg:mx-0"
        style={{ background: "rgba(255,255,255,.05)" }}
        onMouseEnter={() => setHeld(true)}
        onMouseLeave={() => setHeld(false)}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-[130px]"
          aria-hidden
          style={{
            background:
              "radial-gradient(42% 42% at 50% 50%, rgba(42,94,255,.38), transparent 72%)",
          }}
        />
        {/* 노드를 잇는 점선 궤도 — 패널의 68.8% (레퍼런스 445/647).
            가운데 정렬과 회전이 같은 transform 을 두고 다투므로,
            바깥에서 자리를 잡고 안쪽만 돌린다. */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[68.8%] w-[68.8%] -translate-x-1/2 -translate-y-1/2"
          aria-hidden
        >
          {/* CSS 점선은 점 크기·간격을 못 만진다. 원을 SVG 로 그리고 둥근 캡 +
              길이 0 인 대시로 찍으면 선 두께가 곧 점 지름이 된다. */}
          <svg className="orbit-spin h-full w-full" viewBox="0 0 100 100" aria-hidden>
            <circle
              cx="50"
              cy="50"
              r="49.6"
              fill="none"
              stroke="#fff"
              strokeOpacity="0.7"
              strokeWidth="0.8"
              strokeDasharray="0.01 3.4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {/* 글자로 쓰던 자리를 실제 브랜드 락업으로 바꾼다.
              어두운 면이라 onDark 로 흰색 반전한다. */}
          <Logo size="h-[42px] md:h-[64px]" onDark />
        </div>

        {AUDIENCES.map((a, i) => {
          /* 위에서 시작해 시계 방향. 중심 거리는 패널의 31.5% (레퍼런스 204/647) */
          const rad = (-90 + (360 / AUDIENCES.length) * i) * (Math.PI / 180);
          const on = i === active;
          return (
            <button
              key={a.tag}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={on}
              /* 노드 지름은 패널의 19.9% (레퍼런스 129/647) */
              className="absolute flex h-[19.9%] w-[19.9%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full"
              style={{
                left: `${50 + 31.5 * Math.cos(rad)}%`,
                top: `${50 + 31.5 * Math.sin(rad)}%`,
              }}
            >
              {/* 꺼진 면과 켜진 면을 겹쳐 두고 투명도만 바꾼다 —
                  그라디언트는 transition 이 안 먹는다 */}
              <span className="absolute inset-0 rounded-full bg-white/10" aria-hidden />
              <span
                className="absolute inset-0 rounded-full transition-opacity duration-500"
                aria-hidden
                style={{ background: POINT_BG, opacity: on ? 1 : 0 }}
              />
              <svg
                /* 색을 지정하지 않으면 부모 글자색을 물려받아 어둡게 나온다.
                   라벨과 같은 흰색으로 맞춘다. */
                className={`relative h-[26px] w-[26px] transition-colors duration-500 md:h-[34px] md:w-[34px] ${on ? "text-white" : "text-white/70"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.4}
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={a.iconPath} />
              </svg>
              <span
                className={`relative mt-1.5 text-[13px] font-semibold leading-[1.4] transition-colors duration-500 md:text-[16px] ${on ? "text-white" : "text-white/70"}`}
              >
                {a.tag}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── 글 덩어리 — lg 이상에서는 왼쪽 ──
          머리글은 공용 SectionHead 를 그대로 쓴다. 따로 짜 두면 다른 섹션과
          치수가 어긋나기 시작한다. */}
      <div className="lg:order-1">
        <SectionHead
          eyebrow="About BLUE EGG"
          head={[<>브랜드사도, 사장님도, 대행사도 </>, <>한 플랫폼에서.</>]}
        />

        {/* 바뀌는 부분 — 노드 이름이 소제목, 그 아래 두 줄 설명.
            높이가 들썩이지 않게 최소 높이를 잡아 둔다 */}
        <div className="mt-[18px] min-h-[150px] text-center md:text-left" key={cur.tag}>
          <p className="text-[17px] font-bold leading-[1.5] text-white break-keep md:text-[20px]">
            {cur.tag}
          </p>
          <p className="mt-[5px] whitespace-normal text-[15px] font-medium leading-[1.66] balance-narrow text-white/60 break-keep md:whitespace-pre-line md:text-[18px]">
            {cur.desc}
          </p>
        </div>

      </div>
    </div>
  );
}

/* 지표 바 한 칸 — 세 칸이 같은 여백·같은 글자 크기를 써야 간격이 같아 보인다 */
const STAT_CELL = "px-9 py-14 md:px-14 md:py-20";
const STAT_NUM =
  "mt-5 text-[60px] font-bold leading-[0.95] tracking-tight text-white tabular-nums md:text-[64px] lg:text-[76px]";

/* 섹션 껍데기 — 좌우 여백과 상하 리듬을 한 곳에서 잡는다.
   폭은 레퍼런스 기준(화면의 95.6%, 1440px 에서 멈춤)으로 통일했다.
   About 블록의 패널·여백 비율이 이 폭을 전제로 잡혀 있다. */
const SHELL = "relative mx-auto w-[95.6%] max-w-[1440px]";
const SEC = "relative py-28 md:py-40";
/* 섹션 제목과 그 아래 내용 사이 간격 — 섹션마다 다르면 페이지 리듬이 흔들린다 */
const HEAD_GAP = "mt-16 md:mt-20";

/* ── 페이지 ─────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="relative isolate" style={{ background: INK }}>
      <AmbientGlow />

      {/* ══════════ 1. 히어로 ══════════
          풀스크린 배경 영상만 둔다. 헤드라인·보조문구·행동 유도는 영상 안에
          들어 있어서 화면에 겹쳐 쓰지 않는다. */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* 배경 영상 — 점 알(-z-10)보다 한 겹 더 뒤에 깔아 알이 영상 위로 보이게 한다 */}
        <HeroVideo />
        {/* 영상 위를 누르는 판.
            영상 자체가 카피를 담고 있어 위쪽은 거의 건드리지 않는다. 아래쪽만
            남겨 다음 섹션(어두운 바탕)으로 자연스럽게 이어지게 한다. */}
        <div
          className="absolute inset-0 -z-20"
          aria-hidden
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,16,32,.10), rgba(10,16,32,0) 45%, rgba(10,16,32,.45))",
          }}
        />

        <div className={`${SHELL} text-center`}>
          {/* 카피는 영상이 직접 말한다. 문서 구조상 필요한 제목만 남겨 둔다. */}
          <h1 className="sr-only">바이럴 마케팅 솔루션</h1>
        </div>
      </section>

      {/* 히어로 바로 아래 카피. 넓은 화면에서는 한 화면을 통째로 쓰지만,
          좁은 화면에서 같은 높이를 주면 글 위아래가 화면 반씩 비어 허전하다. */}
      <section className="relative flex min-h-[58vh] items-center justify-center py-20 md:min-h-screen md:py-0">
        <div
          /* 26px 은 390px(아이폰) 이상에서만 세 줄이 유지된다. 갤럭시 계열(360px)에서는
             둘째 줄이 한 번 더 접혀서, 그 아래에서만 24px 로 내려 둔다. */
          className={`${SHELL} text-[24px] font-extrabold leading-[1.5] tracking-tight break-keep min-[380px]:text-[26px] sm:text-[32px] md:text-[48px]`}
        >
          {/* 좁은 화면에서는 세 줄로 끊어 읽히는 문구를 쓴다 */}
          <div className="md:hidden">
            <ScrollFillLines lines={HERO_TAGLINE_SM} />
          </div>
          <div className="hidden md:block">
            <ScrollFillLines lines={HERO_TAGLINE} />
          </div>

          {/* 카피를 다 읽은 자리에서 바로 들어갈 수 있게 버튼을 붙인다.
              글자 크기를 컨테이너에서 물려받지 않도록 따로 지정한다. */}
          <div className="mt-12 text-center md:mt-16">
            <a
              href={platformUrl("/signup")}
              className="inline-flex h-[56px] items-center gap-6 rounded-full px-8 text-[15px] font-bold leading-none tracking-normal text-white transition-opacity hover:opacity-90 md:h-[64px] md:px-[34px] md:text-[17px]"
              style={{ background: POINT_BG }}
            >
              무료 체험하기
              <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      {/* ══════════ 2. 플랫폼 소개 ══════════
          누구를 위한 플랫폼인지 먼저 밝힌다. */}
      <section id="about" className={`${SEC} scroll-mt-24`}>
        <div className={SHELL}>
          <SlideIn>
            <AudienceRoller />
          </SlideIn>
        </div>
      </section>

      {/* ══════════ 3. 마케팅 종류 ══════════
          가운데 머리글 아래로 카드 다섯 장을 한 줄에 늘어놓는다 */}
      <section id="services" className={`${SEC} scroll-mt-24`}>
        <div className={SHELL}>
          <SlideIn>
          <SectionHead
            center
            eyebrow="Services"
            head={[<>필요한 바이럴 마케팅을 </>, <>한곳에서 실행하세요</>]}
            lead={
              <>
                블루에그비즈에서는 목적에 맞는 바이럴 마케팅 상품을
                <br className="hidden md:inline" />
                쇼핑하듯 고르고 바로 실행할 수 있습니다.
              </>
            }
          />
          </SlideIn>

          {/* 카드 다섯 장 대신 아코디언 + 미리보기.
              고른 항목의 플랫폼 화면이 오른쪽에 뜬다. */}
          <SlideIn delay={120} className={HEAD_GAP}>
            <AccordionFeatures
              accent={POINT}
              features={CATEGORIES.map((c, i) => ({
                id: i + 1,
                no: c.no,
                title: c.title,
                image: c.image,
                overlay: "overlay" in c ? c.overlay : undefined,
                description: c.desc,
                tags: c.items,
              }))}
            />
          </SlideIn>
        </div>
      </section>

      {/* ══════════ 4. 장점 ══════════
          카드가 왼쪽, 제목이 오른쪽. 문서에서는 제목이 먼저 오게 두고(읽는 순서·
          좁은 화면에서는 제목 → 카드) 넓은 화면에서만 order 로 좌우를 바꾼다.
          좁은 제목 칸에서는 줄바꿈을 강제하지 않고 글이 알아서 접히게 둔다. */}
      <section id="features" className={`${SEC} scroll-mt-24`}>
        <div className={`${SHELL} grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,34%)] lg:items-start lg:gap-x-[6%]`}>
          <SlideIn className="lg:order-2">
            <SectionHead
              eyebrow="Why BLUE EGG"
              head={[<>블루에그비즈를 </>, <>선택해야 하는 이유</>]}
              lead={
                <>
                  마케팅은 무엇을 해야 할지, 얼마가 필요한지, 효과가 있는지 알기 어렵습니다.
                  블루에그비즈는 바이럴 채널 선택부터 성과 확인까지 한곳에서 해결하도록 만들었습니다.
                </>
              }
            />
          </SlideIn>

          {/* 서비스 카드와 같은 문법 — 번호 / 제목 / 두 줄 설명.
              왼쪽 칸 안에서 세 장을 가로로 늘어놓는다(좁은 화면에서는 쌓인다). */}
          <div className="grid gap-5 md:grid-cols-3 lg:order-1">
            {STRENGTHS.map((st, i) => (
              /* 커서를 올리면 포인트 컬러로 바뀐다. 서비스 카드와 같은 방식 —
                 배경 두 장을 겹쳐 두고 위 장의 투명도만 바꾼다(색을 갈아 끼우면
                 그라디언트가 튄다). 글자는 그 위로 올린다. */
              <SlideIn key={st.title} delay={i * 120} className="h-full">
              <div
                /* 높이는 세 장이 나란히 설 때만 맞춘다 — 한 장씩 쌓이는 좁은 화면에서
                   420px 를 그대로 쓰면 카드 가운데가 텅 빈다. */
                className="group relative flex flex-col overflow-hidden rounded-[30px] pb-[30px] pl-[30px] pr-[26px] pt-[34px] md:min-h-[420px]"
              >
                <span
                  className="absolute inset-0"
                  aria-hidden
                  style={{ background: "rgba(255,255,255,.05)" }}
                />
                <span
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden
                  style={{ background: POINT_BG }}
                />

                {/* 번호·아이콘은 한 줄로 위에, 설명은 바닥. 아이콘을 가운데에 띄우면
                    제목·설명과 아무 관계 없이 떠 보인다. */}
                <div className="relative flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className="text-[15px] font-bold tracking-tight transition-colors duration-300 group-hover:text-white"
                      style={{ color: POINT }}
                    >
                      {st.no}
                    </span>
                    <svg
                      className="-mt-3 h-[76px] w-[76px] shrink-0 text-white/20 transition-colors duration-300 group-hover:text-white/70"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.1}
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={st.iconPath} />
                    </svg>
                  </div>
                  <p className="mt-4 text-[22px] font-bold leading-[1.3] tracking-tight text-white break-keep md:text-[24px]">
                    {st.title}
                  </p>

                  <p className="mt-6 whitespace-normal text-[14px] font-medium leading-[1.7] text-white/55 break-keep transition-colors duration-300 group-hover:text-white/85 md:mt-auto md:whitespace-pre-line md:pt-10 md:text-[15px]">
                    {st.desc}
                  </p>
                </div>
              </div>
              </SlideIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ 5. 지표 바 ══════════
          레퍼런스처럼 가로로 긴 바 하나에 몰고, 오른쪽 끝에 파란 정사각을 붙인다 */}
      {/* 아래 여백만 더 준다 — 다음 섹션이 포인트 컬러 한 판이라
          바와 색 면 사이를 넉넉히 띄워야 구간이 나뉘어 읽힌다 */}
      <section id="clients" className={`${SEC} scroll-mt-24 pb-36 md:pb-[200px]`}>
        <div className={SHELL}>
          {/* 바 위에 제목을 왼쪽 정렬로 세운다. 아이브로우는 두지 않는다 —
              숫자가 곧 근거라 영문 라벨까지 얹으면 머리가 무거워진다. */}
          <SlideIn className="text-center md:text-left">
            <h2 className="mx-auto max-w-[920px] text-[32px] font-extrabold leading-[1.32] tracking-tight balance-narrow text-white break-keep md:mx-0 md:text-[54px]">
              많은 브랜드가{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: KEY_RAMP }}>
                블루에그비즈와 함께하고 있습니다
              </span>
            </h2>
            <p className="mx-auto mt-[18px] max-w-[780px] text-[15px] font-medium leading-[1.66] balance-narrow text-white/60 break-keep md:mx-0 md:text-[18px]">
              작은 매장부터 성장 중인 브랜드까지,
              <br className="hidden md:inline" />
              블루에그비즈는 필요한 마케팅을 더 쉽고 투명하게 시작할 수 있도록 돕습니다.
            </p>
          </SlideIn>

          {/* 세 칸을 같은 폭으로 나눈다 — 칸마다 여백·글자 크기가 같아야 숫자
              사이 간격이 눈으로도 같게 읽힌다. 파란 칸도 같은 문법을 쓴다. */}
          <div
            className={`${HEAD_GAP} grid overflow-hidden rounded-[36px] sm:grid-cols-2 lg:grid-cols-3`}
            style={{ background: SURFACE }}
          >
            {STATS.map((s, i) => (
              <SlideIn
                key={s.v}
                from="left"
                delay={i * 130}
                /* 2칸으로 접히는 폭에서는 마지막 칸이 한 줄을 다 쓴다 */
                className={`h-full ${i === STATS.length - 1 ? "sm:col-span-2 lg:col-span-1" : ""}`}
              >
                <div
                  className={`h-full ${STAT_CELL}`}
                  style={s.point ? { background: POINT_BG } : undefined}
                >
                  <p className="text-[14px] font-bold text-white/60 break-keep md:text-[15px]">{s.v}</p>
                  <p className={STAT_NUM}>
                    <RollingNumber value={s.k} />
                  </p>
                </div>
              </SlideIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ 6. 무료체험 안내 ══════════
          마지막은 문의 폼 대신 포인트 컬러 한 판으로 덮고 버튼 하나만 남긴다.
          바탕이 파랗기 때문에 버튼은 흰 면 · 파란 글씨로 뒤집어 대비를 준다. */}
      <section
        id="contact"
        className={`${SEC} scroll-mt-24 text-center`}
        style={{ background: POINT_BG }}
      >
        <div className={SHELL}>
          <SlideIn>
            <p className="text-[13px] font-bold tracking-[0.18em] text-white/70 uppercase md:text-[14px]">
              Start Free
            </p>
            <h2 className="mt-5 text-[30px] font-bold leading-[1.28] tracking-tight balance-narrow text-white break-keep md:text-[46px]">
              지금 바로 무료로 시작해보세요
            </h2>
            {/* 한 문장씩 한 줄 — 좁은 화면에서는 줄바꿈을 접고 자연스럽게 흐르게 둔다 */}
            <p className="mx-auto mt-6 max-w-[760px] text-[14px] font-medium leading-[1.8] balance-narrow text-white/75 break-keep md:text-[16px]">
              가입만 하면 블루에그비즈의 마케팅 상품을 바로 둘러볼 수 있습니다.
              <br className="hidden md:inline" />
              필요한 것만 골라, 원하는 만큼 시작하세요.
            </p>

            <a
              href={platformUrl("/signup")}
              className="mt-11 inline-flex h-[56px] items-center gap-6 rounded-full bg-white px-8 text-[15px] font-bold text-[#1B3ED8] transition-colors hover:bg-white/90 md:h-[64px] md:px-[34px] md:text-[17px]"
            >
              무료 체험하기
              <span className="h-1.5 w-1.5 rounded-full bg-[#1B3ED8]" aria-hidden />
            </a>
          </SlideIn>
        </div>
      </section>
    </div>
  );
}
