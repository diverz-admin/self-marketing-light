import React from "react";
import Link from "next/link";
import Image from "next/image";
import ContactForm from "./_components/ContactForm";
import { PLATFORM_ENTRY } from "@/utils/platform";

/* ── 데이터 ─────────────────────────────────────────── */

const TRUST = [
  { k: "24시간", v: "자동 실행 시스템" },
  { k: "단위당", v: "투명 과금 · 노거품" },
  { k: "실시간", v: "성과 대시보드" },
];

const KEYWORDS = [
  "네이버 플레이스 유입",
  "스마트스토어 트래픽",
  "쿠팡 상품 유입",
  "블로그 체험단",
  "블로그 기자단",
  "방문자 리뷰",
  "영수증 리뷰",
  "통합 순위관리",
  "네이버 파워링크",
  "구글 GDN",
  "메타 광고",
  "맘카페 마케팅",
  "상세페이지 제작",
  "브랜드 홈페이지",
];

const STRENGTHS = [
  {
    tag: "NO 대행 리스크",
    title: "광고비 소진 걱정 없이",
    desc: "상담·계약·월 리테이너 없이 단위당 단가로만 과금합니다. 무분별한 광고비 소진 리스크가 없습니다.",
  },
  {
    tag: "즉시 실행",
    title: "상품처럼 고르고 바로 시작",
    desc: "복잡한 견적과 미팅 대신, 카탈로그에서 선택하고 결제하면 마케팅이 자동으로 실행됩니다.",
  },
  {
    tag: "완전 투명",
    title: "단가·수량 전부 공개",
    desc: "단위당 단가, 예상 수량, 진행·잔여 수량을 모두 공개합니다. 숨은 비용도 과장된 약속도 없습니다.",
  },
  {
    tag: "데이터 중심",
    title: "결과를 실시간으로 추적",
    desc: "일별 유입량, 진행 상태, 사용 금액을 실시간 대시보드로 확인하며 스스로 판단하고 조정합니다.",
  },
];

const CATEGORIES = [
  {
    no: "01",
    title: "유입 마케팅",
    desc: "네이버 플레이스·스마트스토어·쿠팡·구글까지, 원하는 채널에 실질 유입을 만듭니다.",
    items: ["플레이스 유입", "스마트스토어", "쿠팡", "구글"],
    href: "/marketing/reward/place",
  },
  {
    no: "02",
    title: "리뷰 · 체험단",
    desc: "검증된 블로거·체험단이 가이드라인에 맞춰 신뢰도 높은 리뷰 콘텐츠를 생성합니다.",
    items: ["블로그 체험단", "기자단", "방문자·영수증 리뷰"],
    href: "/marketing/experience/blog",
  },
  {
    no: "03",
    title: "콘텐츠 · 디자인",
    desc: "상세페이지, 브랜드 홈페이지, 이미지·영상까지 브랜드 톤에 맞는 콘텐츠를 제작합니다.",
    items: ["상세페이지", "브랜드 홈페이지", "이미지·영상"],
    href: "/marketing/content/detail",
  },
  {
    no: "04",
    title: "통합 순위관리",
    desc: "플레이스·쇼핑 순위를 한 화면에서 추적하고 목표 키워드를 체계적으로 관리합니다.",
    items: ["플레이스 순위", "쇼핑 순위", "키워드 추적"],
    href: "/marketing/rank",
  },
  {
    no: "05",
    title: "유료 광고",
    desc: "네이버 파워링크·CPC, 메타·구글 광고를 목표와 예산에 맞춰 운영합니다.",
    items: ["네이버 CPC", "메타 광고", "구글 GDN"],
    href: "/marketing/ads/naver-cpc",
  },
  {
    no: "06",
    title: "커뮤니티 마케팅",
    desc: "맘카페·오픈채팅·커뮤니티 채널에서 자연스러운 브랜드 노출을 확보합니다.",
    items: ["맘카페", "카페·게시판", "오픈채팅"],
    href: "/marketing/community",
  },
];

/* 레퍼런스 — 실제 고객 로고 이미지로 교체 예정 (아래는 예시 플레이스홀더) */
const FEATURED_BRANDS = [
  { name: "○○ 왁싱", cat: "뷰티·왁싱", metric: "키워드 21→2위", grad: "from-[#3a1f2b] to-[#1a1017]" },
  { name: "라온 베이커리", cat: "베이커리", metric: "신규 방문 +120%", grad: "from-[#3a2a17] to-[#1a1410]" },
  { name: "미도 감성카페", cat: "카페·디저트", metric: "리뷰 +38건", grad: "from-[#17263a] to-[#0f1622]" },
  { name: "정직한 정육", cat: "정육·식자재", metric: "플레이스 노출 3배", grad: "from-[#2a1717] to-[#170f0f]" },
  { name: "블루 필라테스", cat: "피트니스", metric: "예약 문의 2.5배", grad: "from-[#161f3a] to-[#0d1122]" },
];

const BRAND_LOGOS = [
  "하루 헤어", "온담 한식", "코지 브런치", "펫프렌즈",
  "그린필 요가", "수리 네일", "담은 반찬", "베러 스터디카페",
  "오늘 청과", "미소 치과", "리버 피자", "한강 포차",
  "달콤 디저트", "청춘 곱창", "포근 이불", "스마일 세탁",
  "바른 정형외과", "노을 감성주점", "채움 도시락", "라움 뷰티",
];

/* 고객 인터뷰 — 실제 사진/영상 썸네일로 교체 예정 (아래 grad는 플레이스홀더) */
const INTERVIEWS = [
  {
    no: "사례 1",
    label: "대행사 수수료 부담",
    title: "대행사 없이 직접 하니\n광고비가 절반이에요",
    caption:
      "광고대행사 계약을 해지하고 블루에그로 전환하신 강남 ‘○○ 왁싱’ 대표님",
    grad: "from-[#3a1f2b] via-[#241521] to-[#12060d]",
  },
  {
    no: "사례 2",
    label: "오르지 않던 순위",
    title: "플레이스 순위가\n21위에서 2위로 올랐어요",
    caption:
      "네이버 플레이스 리워드를 운영 중인 부산 ‘라온 베이커리’ 점주님",
    grad: "from-[#16263f] via-[#101a2c] to-[#0a0f1a]",
  },
  {
    no: "사례 3",
    label: "깜깜이 성과 관리",
    title: "대시보드로 매일\n성과를 눈으로 확인해요",
    caption:
      "실시간 대시보드로 캠페인을 관리하는 대전 ‘미도 감성카페’ 대표님",
    grad: "from-[#173a2b] via-[#102419] to-[#0a1610]",
  },
];

/* ── 페이지 ─────────────────────────────────────────── */

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-electric text-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24 relative grid lg:grid-cols-2 gap-14 lg:gap-6 items-center">
          {/* left — copy */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 text-sm font-bold px-3.5 py-1.5 rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur mb-7">
              <span className="h-1.5 w-1.5 rounded-full bg-electric-glow" />
              온·오프라인 셀프 마케팅 플랫폼
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.12] mb-6">
              광고대행사 없이,
              <br />
              <span className="text-gradient-electric">당신의 브랜드를</span>
              <br />
              직접 성장시키세요
            </h1>
            <p className="text-lg text-white/65 max-w-md leading-relaxed mb-9">
              마케팅을 쇼핑하듯 직접 골라 실행하고, 진행 현황을 실시간
              대시보드로 확인하세요. 상담도, 계약도, 거품도 없습니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <a
                href={PLATFORM_ENTRY}
                className="px-7 py-4 rounded-xl text-sm font-bold bg-electric text-white hover:bg-electric-hover transition-colors shadow-[0_10px_30px_-8px_rgba(29,62,255,.7)] w-fit"
              >
                무료로 시작하기
              </a>
              <Link
                href="/contact"
                className="px-7 py-4 rounded-xl text-sm font-bold bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/20 transition-colors w-fit"
              >
                무료 상담받기
              </Link>
            </div>

            <dl className="flex flex-wrap gap-x-8 gap-y-4">
              {TRUST.map((t) => (
                <div key={t.v} className="flex items-baseline gap-2.5">
                  <dt className="text-xl font-extrabold text-electric-glow">
                    {t.k}
                  </dt>
                  <dd className="text-sm text-white/60">{t.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* right — monitor mockup (angled, floating) */}
          <div className="relative w-full lg:justify-self-end lg:-mr-[3rem] xl:-mr-[6rem] animate-monitor-float">
            <div
              className="pointer-events-none absolute inset-x-6 top-2 -bottom-4 bg-electric/25 blur-3xl rounded-[3rem]"
              aria-hidden
            />
            <div className="relative mx-auto max-w-lg lg:max-w-none lg:w-[62rem] transform-gpu lg:[transform:perspective(2600px)_rotateY(-12deg)_rotateX(4deg)]">
              {/* monitor body */}
              <div className="rounded-[1.5rem] bg-gradient-to-b from-[#222941] to-[#11162a] p-2.5 md:p-3 ring-1 ring-white/10 shadow-[0_60px_140px_-30px_rgba(0,0,0,.9)]">
                {/* screen */}
                <div className="rounded-xl overflow-hidden ring-1 ring-black/50 bg-black">
                  <Image
                    src="/dashboard-preview.png"
                    alt="BLUE EGG 실시간 대시보드 — 캠페인 순위 추적, 운영 현황, 성과 지표"
                    width={1899}
                    height={916}
                    priority
                    className="w-full h-auto block"
                    sizes="(max-width: 1024px) 96vw, 780px"
                  />
                </div>
                {/* bottom bezel */}
                <div className="h-7 md:h-8 flex items-center justify-center">
                  <span className="text-[11px] font-extrabold tracking-[0.35em] text-white/30">
                    BLUE EGG
                  </span>
                </div>
              </div>
              {/* stand neck */}
              <div className="mx-auto h-9 w-20 bg-gradient-to-b from-[#1b2133] to-[#11162a]" />
              {/* stand base */}
              <div className="mx-auto h-3 w-56 rounded-full bg-gradient-to-b from-[#232a41] to-[#0c101f] ring-1 ring-white/5" />
            </div>
          </div>
        </div>
      </section>

      {/* Strengths / Why us */}
      <section id="features" className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <p className="text-sm font-bold text-electric uppercase tracking-widest mb-3">
            Why BLUE EGG
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark mb-4 max-w-2xl">
            대행사에 맡기는 대신,
            <br />
            직접 하니까 달라지는 것들
          </h2>
          <p className="text-brand-sub mb-14 max-w-xl">
            기존 광고대행의 복잡함과 불투명함을 걷어냈습니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {STRENGTHS.map((s) => (
              <div
                key={s.title}
                className="group p-8 rounded-2xl border border-brand-border hover:border-electric/40 hover:shadow-[0_12px_40px_-16px_rgba(29,62,255,.35)] transition-all"
              >
                <span className="inline-block text-[12px] font-bold px-2.5 py-1 rounded-md bg-electric/8 text-electric mb-5">
                  {s.tag}
                </span>
                <h3 className="text-xl font-bold text-brand-dark mb-3">
                  {s.title}
                </h3>
                <p className="text-sm text-brand-sub leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service categories */}
      <section id="services" className="bg-brand-dark text-white">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div>
              <p className="text-sm font-bold text-electric-glow uppercase tracking-widest mb-3">
                All-in-One
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                하나의 플랫폼,
                <br />
                6가지 마케팅 올인원
              </h2>
            </div>
            <p className="text-white/55 max-w-sm">
              유입부터 리뷰, 콘텐츠, 순위, 광고, 커뮤니티까지. 필요한 것만
              골라 한 곳에서 실행합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((c) => (
              <Link
                key={c.no}
                href={c.href}
                className="group relative p-7 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 hover:ring-electric/60 hover:bg-white/[0.06] transition-all"
              >
                <span className="block text-sm font-bold text-white/25 mb-5">
                  {c.no}
                </span>
                <h3 className="text-lg font-bold mb-2.5 group-hover:text-electric-glow transition-colors">
                  {c.title}
                </h3>
                <p className="text-sm text-white/55 leading-relaxed mb-5">
                  {c.desc}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {c.items.map((it) => (
                    <span
                      key={it}
                      className="text-[12px] font-medium px-2 py-0.5 rounded bg-white/8 text-white/70"
                    >
                      {it}
                    </span>
                  ))}
                </div>
                <span className="absolute top-7 right-7 text-white/20 group-hover:text-electric-glow transition-colors">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Keyword marquee — full-bleed strip at section bottom */}
        <div className="border-t border-white/5 py-6 overflow-hidden">
          <div className="marquee-mask">
            <div className="marquee-track">
              {[...KEYWORDS, ...KEYWORDS].map((kw, i) => (
                <span
                  key={i}
                  className="mx-4 text-sm font-semibold text-white/35 whitespace-nowrap"
                >
                  {kw}
                  <span className="ml-8 text-electric-soft">✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trusted brands */}
      <section className="bg-white border-t border-brand-border">
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-8">
          <p className="text-sm font-bold text-electric uppercase tracking-widest mb-3">
            이유 있는 선택
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-brand-dark mb-5">
            <span className="text-electric">탑 브랜드</span>는 블루에그를 사용합니다
          </h2>
          <p className="text-brand-sub leading-relaxed max-w-2xl">
            잘 되는 매장들은 왜 블루에그를 선택할까요?
            <br className="hidden md:block" />
            브랜드의 선택에서 드러나는 신뢰, 블루에그는 확실한 차이를 만듭니다.
          </p>
        </div>

        {/* Featured cards */}
        <div className="max-w-6xl mx-auto px-6 pb-8">
          <div className="grid grid-flow-col auto-cols-[68%] sm:auto-cols-[40%] lg:grid-flow-row lg:grid-cols-5 gap-4 overflow-x-auto lg:overflow-visible scrollbar-none -mx-1 px-1">
            {FEATURED_BRANDS.map((b) => (
              <div
                key={b.name}
                className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${b.grad} aspect-[4/5] p-6 flex flex-col justify-between ring-1 ring-black/20`}
              >
                <span className="text-[11px] font-bold text-white/50 tracking-wide">
                  {b.cat}
                </span>
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-2xl md:text-[1.6rem] font-extrabold text-white text-center leading-tight">
                    {b.name}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 self-start text-[12px] font-bold px-2.5 py-1 rounded-md bg-electric/90 text-white">
                  {b.metric}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Logo wall — full-bleed marquee rows */}
        <div className="pb-8 marquee-mask flex flex-col gap-3">
          {[
            BRAND_LOGOS.slice(0, 7),
            BRAND_LOGOS.slice(7, 14),
            BRAND_LOGOS.slice(13, 20),
          ].map((row, ri) => (
            <div key={ri} className="overflow-hidden">
              <div className={`marquee-track ${ri % 2 ? "reverse" : ""}`}>
                {[...row, ...row].map((name, i) => (
                  <div
                    key={i}
                    className="mx-1.5 h-20 w-[190px] shrink-0 rounded-2xl bg-brand-light border border-brand-border shadow-[0_2px_10px_-4px_rgba(17,29,55,.10)] flex items-center justify-center transition-colors hover:border-electric/40 hover:bg-white"
                  >
                    <span className="text-[15px] font-extrabold text-brand-sub whitespace-nowrap">
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="max-w-6xl mx-auto px-6 pb-24">
          <p className="text-[11px] text-brand-muted">
            ※ 표시된 브랜드명·성과는 예시이며, 실제 고객 로고로 교체 예정입니다.
          </p>
        </div>
      </section>

      {/* Customer interviews */}
      <section className="bg-[#0A0E1A] text-white">
        <div className="max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* left — sticky text */}
          <div className="lg:sticky lg:top-24 self-start">
            <p className="text-sm font-bold text-white/50 mb-4">
              셀프 마케팅의 기준
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15] mb-7">
              <span className="text-gradient-electric">500+의 매장</span>이
              <br />
              블루에그로 갈아탄 이유
            </h2>
            <p className="text-white/55 leading-relaxed mb-2">
              셀프 마케팅이라고 다 똑같을까요?
            </p>
            <p className="text-white/55 leading-relaxed mb-10">
              결국 사장님들이 블루에그를 선택한 이유,
              <br />
              실제 고객 후기로 확인하세요.
            </p>
            <a
              href={PLATFORM_ENTRY}
              className="inline-flex px-7 py-4 rounded-full text-sm font-bold bg-electric text-white hover:bg-electric-hover transition-colors shadow-[0_10px_30px_-8px_rgba(29,62,255,.7)]"
            >
              후기 확인하기
            </a>
            <p className="text-[11px] text-white/30 mt-8">
              ※ 후기·수치는 예시이며, 실제 고객 인터뷰 영상으로 교체 예정입니다.
            </p>
          </div>

          {/* right — interview cards */}
          <div className="flex flex-col gap-6">
            {INTERVIEWS.map((iv) => (
              <article
                key={iv.no}
                className={`relative rounded-3xl overflow-hidden bg-gradient-to-b ${iv.grad} ring-1 ring-white/10 p-7 min-h-[380px] flex flex-col`}
              >
                <div className="flex items-center gap-2.5 mb-6">
                  <span className="text-xs font-bold px-3 py-1 rounded-full ring-1 ring-white/25">
                    {iv.no}
                  </span>
                  <span className="text-sm font-medium text-white/65">
                    {iv.label}
                  </span>
                </div>
                <h3 className="text-2xl md:text-[1.75rem] font-extrabold leading-snug whitespace-pre-line">
                  {iv.title}
                </h3>
                <p className="mt-auto text-sm text-white/55 leading-relaxed max-w-[82%]">
                  {iv.caption}
                </p>
                <button
                  type="button"
                  aria-label="인터뷰 영상 재생"
                  className="absolute bottom-7 right-7 h-11 w-11 rounded-full bg-white/12 ring-1 ring-white/25 backdrop-blur flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-electric text-white">
        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-5">
            지금, 직접 시작하세요
          </h2>
          <p className="text-white/65 mb-10 text-lg">
            무료로 가입하고 원하는 서비스를 바로 주문하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={PLATFORM_ENTRY}
              className="px-8 py-4 rounded-xl text-sm font-bold bg-electric text-white hover:bg-electric-hover transition-colors shadow-[0_10px_30px_-8px_rgba(29,62,255,.7)]"
            >
              무료 계정 만들기
            </a>
            <Link
              href="/pricing"
              className="px-8 py-4 rounded-xl text-sm font-bold bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/20 transition-colors"
            >
              요금 살펴보기
            </Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-black text-white">
        <div className="max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20">
          {/* left — headline + contact info */}
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.2] mb-14">
              블루에그와의
              <br />
              파트너십은
              <br />
              <span className="text-white/40">변화와 도약</span>을 위한
              <br />
              기회입니다.
            </h2>
            <dl className="space-y-2.5 text-sm">
              <div className="flex gap-3">
                <dt className="font-bold text-white/70 w-5">T.</dt>
                <dd className="text-white/85">010.0000.0000</dd>
              </div>
              <div className="flex gap-3">
                <dt className="font-bold text-white/70 w-5">E.</dt>
                <dd className="text-white/85">help@blueegg.example</dd>
              </div>
              <div className="flex gap-3">
                <dt className="font-bold text-white/70 w-5">A.</dt>
                <dd className="text-white/85">서울특별시 · 주소를 입력해주세요</dd>
              </div>
            </dl>
            <p className="text-[11px] text-white/25 mt-8">
              ※ 연락처·주소는 예시이며 실제 정보로 교체해주세요.
            </p>
          </div>

          {/* right — form */}
          <div className="lg:pt-2">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
