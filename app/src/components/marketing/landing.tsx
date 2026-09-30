"use client";

/**
 * 상세 랜딩 공용 문법.
 *
 * 쇼핑 리뷰(`/marketing/review/shopping`)에서 잡은 톤앤매너를 한 곳에 모아 둔다.
 * 「추가 서비스」 화면들이 전부 이 모듈을 쓰기 때문에, 톤을 바꿀 일이 생기면
 * 화면 여덟 개를 돌아다닐 게 아니라 여기만 고치면 된다.
 *
 * 문법은 이렇다.
 * · 카드 하나에 전 섹션을 욱여넣지 않는다. 밴드(흰 ↔ 연회색 ↔ 네이비/블루)를
 *   번갈아 깔아 스크롤이 구간으로 끊기게 한다.
 * · 섹션은 영문 아이브로우 → 한글 헤드라인 → 보조문구 순으로 중앙 정렬한다.
 * · 한 섹션에 메시지 하나. 여백을 크게 줘서 한 호흡씩 읽히게 한다.
 * · 모든 행동은 상담 창구 한 곳으로 모은다(우측 레일 · 모바일 하단 바).
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { POLICY } from "@/lib/policy";

/** 상담 창구 — 개발본과 같이 카카오톡 채널로 연결한다 */
export const CONSULT_HREF = "https://pf.kakao.com/_JymrX/chat";

/* ── 밴드 ── */
export const SEC = "relative overflow-hidden px-7 md:px-14 py-20 md:py-28";
export const LIGHT = `${SEC} bg-white`;
export const TINT = `${SEC} bg-brand-lighter`;
export const BLUE = `${SEC} text-white`;
export const BLUE_BG = "linear-gradient(135deg,#2A5EFF 0%,#2452EB 55%,#1B3AC4 100%)";
export const NAVY = "linear-gradient(135deg,#152C9E 0%,#111D37 100%)";
/** 키컬러 램프 — 버튼·배지 면에 쓴다 */
export const POINT_BG = "var(--gradient-point)";

/* ── 타이포 ── */
/** 영문 라벨 — 헤드라인 위 한 줄 */
export const EYEBROW =
  "text-[12.5px] md:text-[13px] font-extrabold uppercase tracking-[0.14em] text-brand-primary";
/** 어두운 밴드 위에서는 키컬러가 죽는다. 밝은 블루로 바꿔 쓴다. */
export const EYEBROW_ON_DARK =
  "text-[12.5px] md:text-[13px] font-extrabold uppercase tracking-[0.14em] text-[#8FB0FF]";
/** 보조문구 */
export const LEAD =
  "mx-auto mt-4 max-w-[620px] text-[15px] md:text-[16.5px] leading-relaxed text-brand-sub break-keep balance-lines";
/** 어두운 밴드용 보조문구 */
export const LEAD_ON_DARK =
  "mx-auto mt-4 max-w-[620px] text-[15px] md:text-[16.5px] leading-relaxed text-white/70 break-keep balance-lines";
/** 두 줄 헤드라인 — 화면에서 가장 큰 글자다 */
export const H2 = "text-[30px] md:text-[46px] font-extrabold leading-[1.22] tracking-tight break-keep";

/* ── 아이콘 ── */
export function ArrowIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

export function ChatIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm3.75 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm3.75 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  );
}

export function CheckIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

/**
 * 0 에서 목표값까지 굴러 올라가는 숫자.
 * 화면에 들어올 때 한 번만 돈다 — 오르내릴 때마다 다시 세면 읽기를 방해한다.
 * 애니메이션을 끈 사용자에게는 세지 않고 최종값만 보여준다.
 */
export function CountUp({ to, duration = 1600 }: { to: number; duration?: number }) {
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

  // 1,000 이상은 천 단위 쉼표 — "1200" 보다 "1,200" 이 규모로 읽힌다
  return <span ref={ref}>{n.toLocaleString("ko-KR")}</span>;
}

/**
 * "1,200+" · "평균 +34%" 처럼 문자가 섞인 지표를 숫자 부분만 굴려 보여준다.
 * 운영팀이 넘긴 표기를 그대로 두고 싶어서, 파싱해 쓰는 쪽을 택했다.
 */
export function StatValue({ text }: { text: string }) {
  const m = /^(\D*)([\d,]+)(.*)$/.exec(text);
  if (!m) return <>{text}</>;
  const [, prefix, digits, suffix] = m;
  return (
    <>
      {prefix}
      <CountUp to={Number(digits.replace(/,/g, ""))} />
      <span className="ml-0.5 align-baseline text-[15px] font-extrabold text-brand-dark/75 md:text-[17px]">{suffix}</span>
    </>
  );
}

/** 지표 3칸 — 히어로 아래에 붙는 흰 카드 */
export function StatRow({ stats }: { stats: { num: string; label: string }[] }) {
  return (
    <dl className="mx-auto mt-12 grid max-w-[640px] grid-cols-1 divide-y divide-brand-border rounded-[22px] border border-brand-border bg-white/70 px-6 py-6 backdrop-blur sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {stats.map((s) => (
        <div key={s.label} className="px-2 py-4 text-center sm:px-4 sm:py-1">
          <dt className="text-[13px] font-bold text-brand-sub break-keep">{s.label}</dt>
          <dd className="mt-3 text-[30px] font-extrabold leading-none tracking-tight text-brand-dark tabular-nums md:text-[38px]">
            <StatValue text={s.num} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * 스크롤하며 하나씩 올라오는 등장 효과.
 * 상세페이지는 위에서 아래로 읽는 흐름이라, 한 번에 다 보이면 순서가 사라진다.
 * 한 번 보이면 관찰을 끊는다 — 오르내릴 때마다 다시 흔들리면 읽기를 방해한다.
 */
export function Reveal({
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

/** 알약형 CTA — 이 톤의 기본 버튼 형태 */
export function PillLink({
  href = CONSULT_HREF,
  children,
  tone = "blue",
}: {
  href?: string;
  children: React.ReactNode;
  tone?: "blue" | "white";
}) {
  const blue = tone === "blue";
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-extrabold transition-opacity hover:opacity-90 ${
        blue ? "text-white" : "bg-white text-brand-primary"
      }`}
      style={blue ? { background: POINT_BG, boxShadow: "var(--shadow-point)" } : undefined}
    >
      <ChatIcon className="h-[17px] w-[17px]" />
      {children}
    </Link>
  );
}

/**
 * 우측 상담 레일 — 스크롤을 따라다니는 네이비 CTA 카드 한 장.
 * 요약표를 곁들이지 않는다. 카드가 늘어날수록 정작 눌러야 할 버튼이 묻힌다.
 */
export function ConsultRail({
  title,
  eyebrow = "지금 바로 상담하세요",
}: {
  title: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="hidden w-72 shrink-0 lg:block xl:w-80">
      <div className="sticky top-4 pb-3">
        {/* 면은 키컬러 램프로 채운다 — 어두운 네이비는 본문의 네이비 밴드와 겹쳐 레일이 묻힌다 */}
        <div className="relative overflow-hidden rounded-2xl shadow-[0_24px_50px_-24px_rgba(20,40,160,.55)]" style={{ background: POINT_BG }}>

          <div className="relative z-10 flex min-h-[440px] flex-col items-center px-6 pb-8 pt-10 text-center">
            {/* 말풍선 일러스트 — 흰 카드가 블루 면 위에 떠 있는 형태 */}
            <div className="relative mb-7 h-[104px] w-[150px]">
              <div className="absolute left-0 top-2 flex h-[54px] w-[92px] items-center justify-center gap-1.5 rounded-2xl rounded-bl-md border border-white/25 bg-white/15 backdrop-blur-sm">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/80" style={{ animationDelay: `${i * 180}ms` }} />
                ))}
              </div>
              <div className="absolute bottom-0 right-0 flex h-[58px] w-[98px] items-center justify-center rounded-2xl rounded-br-md bg-white shadow-[0_16px_30px_-12px_rgba(7,15,73,.55)]">
                <ChatIcon className="h-6 w-6 text-brand-primary" />
              </div>
            </div>

            <p className="mb-3 text-[12px] font-bold text-white/70">{eyebrow}</p>
            <h2 className="mb-7 text-[23px] font-extrabold leading-[1.4] text-white break-keep">{title}</h2>

            <Link
              href={CONSULT_HREF}
              className="group mt-auto flex w-full items-center justify-between gap-2 rounded-2xl bg-white py-2 pl-5 pr-2 text-[14.5px] font-extrabold text-brand-primary shadow-[0_14px_28px_-12px_rgba(7,15,73,.6)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-12px_rgba(7,15,73,.7)]"
            >
              상담 문의하기
              <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition-transform group-hover:translate-x-0.5" style={{ background: POINT_BG }}>
                <ArrowIcon className="h-4 w-4" />
              </span>
            </Link>
            {/* 언제 답이 오는지 — 정책에 적힌 응대 시간을 그대로 읽는다 */}
            <p className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/60">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
              </svg>
              {POLICY.support.hours} 응대
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 상세 랜딩 한 벌.
 * 좌측에 밴드로 쌓은 본문, 우측에 상담 레일, 레일이 접히는 폭에서는 하단 고정 바.
 * `railTitle` 은 레일 카드에 들어갈 두 줄짜리 문구다.
 */
export function LandingShell({
  railTitle,
  railEyebrow,
  children,
}: {
  railTitle: React.ReactNode;
  railEyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full pb-24 lg:pb-0">
      <div className="flex items-stretch gap-5">
        <div className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-2xl">{children}</div>
        </div>
        <ConsultRail title={railTitle} eyebrow={railEyebrow} />
      </div>

      {/* 레일이 접히는 폭(lg 미만) — 스크롤 어디서든 상담으로 갈 수 있게 하단에 고정한다 */}
      <div className="fixed inset-x-0 bottom-[60px] z-40 border-t border-brand-border bg-white px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:bottom-0 lg:hidden">
        <Link
          href={CONSULT_HREF}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15.5px] font-extrabold text-white"
          style={{ background: POINT_BG }}
        >
          상담 문의하기
          <ArrowIcon />
        </Link>
      </div>
    </div>
  );
}
