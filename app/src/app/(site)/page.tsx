import React from "react";
import Link from "next/link";
import ContactForm from "./_components/ContactForm";
import { BlueEggMark } from "@/components/Logo";
import { PLATFORM_ENTRY } from "@/utils/platform";

/* ── 데이터 ─────────────────────────────────────────── */

/* 히어로 하단 피처 바 */
const HERO_FEATURES = [
  {
    title: "AI 마케팅 자동화",
    desc: "업무 효율을 높여보세요",
    iconPath: "M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 21v-1.5M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z",
  },
  {
    title: "데이터 분석 & 인사이트",
    desc: "데이터로 더 스마트하게",
    iconPath: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  },
  {
    title: "콘텐츠 제작 & 배포",
    desc: "콘텐츠로 더 강력하게",
    iconPath: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  },
  {
    title: "통합 성과 관리",
    desc: "성과를 한눈에 관리하세요",
    iconPath: "M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 2.65m5.96 11.72a14.926 14.926 0 01-5.841 2.58m-.119-8.51a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z",
  },
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

/* 타깃별 활용 — 브랜드사 · 자영업자 · 대행사 */
const AUDIENCES = [
  {
    tag: "브랜드사",
    title: "브랜드 성장을\n직접 설계합니다",
    desc: "여러 채널과 캠페인을 하나의 대시보드에서 통합 관리하고, 브랜딩부터 전환까지 데이터로 운영합니다.",
    items: ["멀티 채널 통합 관리", "브랜드 콘텐츠 제작", "성과 데이터 분석"],
    iconPath: "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z",
  },
  {
    tag: "자영업자",
    title: "사장님이 직접,\n쉽고 저렴하게",
    desc: "상담도 계약도 없이, 우리 매장에 필요한 마케팅만 상품처럼 골라 바로 실행합니다. 단위당 과금으로 부담이 없습니다.",
    items: ["플레이스·리뷰 마케팅", "필요한 만큼만 결제", "간편한 셀프 실행"],
    iconPath: "M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z",
  },
  {
    tag: "대행사",
    title: "여러 광고주를\n효율적으로 운영",
    desc: "클라이언트별 캠페인을 한 곳에서 진행하고, 정산·리포트까지 자동화해 운영 리소스를 크게 줄입니다.",
    items: ["다수 광고주 통합 관리", "정산·세금계산서 자동화", "화이트라벨 리포트"],
    iconPath: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
  },
];

/* 성과 통계 */
const STATS = [
  { k: "500+", v: "함께하는 브랜드·매장" },
  { k: "12,000+", v: "누적 캠페인 실행" },
  { k: "6종", v: "올인원 마케팅 카테고리" },
  { k: "24시간", v: "자동 실행 시스템" },
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

/* 작동 방식 — 4단계 프로세스 */
const STEPS = [
  {
    no: "01",
    title: "고르기",
    desc: "원하는 채널과 서비스를 카탈로그에서 상품처럼 선택합니다. 상담도 견적 미팅도 없습니다.",
    iconPath: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z",
  },
  {
    no: "02",
    title: "결제",
    desc: "단위당 단가로 필요한 만큼만 결제합니다. 월 리테이너도 최소 계약 기간도 없습니다.",
    iconPath: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z",
  },
  {
    no: "03",
    title: "자동 실행",
    desc: "결제 즉시 캠페인이 자동으로 시작·운영됩니다. 복잡한 세팅은 플랫폼이 대신합니다.",
    iconPath: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
  },
  {
    no: "04",
    title: "성과 확인",
    desc: "일별 유입량·진행 상태·사용 금액을 실시간 대시보드로 추적하며 직접 판단하고 조정합니다.",
    iconPath: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
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
      {/* Hero — light, 3D 오브젝트 컴포지션 */}
      <section className="hero-light relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6 pt-14 md:pt-20">

          {/* ── 중앙 카피 ── */}
          <div className="relative z-20 mx-auto max-w-4xl text-center">
            <h1 className="text-[34px] leading-[1.2] sm:text-6xl sm:leading-[1.16] font-extrabold tracking-tight mb-6">
              <span className="text-electric">마케팅,</span>
              <br />
              <span className="text-brand-dark sm:whitespace-nowrap">이제 블루에그비즈 단 하나로!</span>
            </h1>
            <p className="text-lg text-brand-sub leading-relaxed mb-9">
              전략부터 실행, 성과 분석까지
              <br />
              마케팅의 모든 것을 하나의 플랫폼에서 완성하세요.
            </p>
            <a
              href={PLATFORM_ENTRY}
              className="inline-flex px-9 py-4 rounded-full text-base font-bold bg-electric text-white hover:bg-electric-hover transition-colors shadow-[0_16px_40px_-10px_rgba(29,62,255,.65)]"
            >
              무료로 시작하기
            </a>
          </div>

          {/* ── 3D / 글래스 오브젝트 스테이지 ── */}
          <div className="relative h-[300px] md:h-[380px] mt-2 md:-mt-6" aria-hidden>
            {/* 좌측 클러스터 */}
            <div className="hidden md:block absolute left-0 bottom-0 w-[42%] h-full">
              {/* 차트 글래스 카드 */}
              <div className="absolute left-2 top-6 w-44 rounded-2xl bg-white/55 ring-1 ring-white/70 backdrop-blur-md shadow-[0_24px_50px_-24px_rgba(29,62,255,.5)] p-3.5 animate-float-b">
                <div className="flex gap-1 mb-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-electric/40" />
                  <span className="h-1.5 w-1.5 rounded-full bg-electric/25" />
                  <span className="h-1.5 w-1.5 rounded-full bg-electric/15" />
                </div>
                <svg viewBox="0 0 130 60" className="w-full">
                  <polygon points="6,54 6,44 32,34 56,40 82,20 106,26 124,10 124,54" fill="#1D3EFF" opacity="0.08" />
                  <polyline points="6,44 32,34 56,40 82,20 106,26 124,10" fill="none" stroke="#1D3EFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M112 10h12v12" fill="none" stroke="#1D3EFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {/* 파이 글래스 카드 */}
              <div className="absolute left-4 bottom-4 h-20 w-20 rounded-2xl bg-white/55 ring-1 ring-white/70 backdrop-blur-md shadow-[0_20px_44px_-20px_rgba(29,62,255,.5)] flex items-center justify-center animate-float-a">
                <svg viewBox="0 0 36 36" className="h-11 w-11 -rotate-90">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#C7D6FF" strokeWidth="7" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#1D3EFF" strokeWidth="7" strokeDasharray="55 100" strokeLinecap="round" />
                </svg>
              </div>
              {/* 블루에그 센터피스 + 포디움 */}
              <div className="absolute right-2 lg:right-6 bottom-0 animate-float-a">
                <div className="absolute left-1/2 -translate-x-1/2 bottom-1 h-7 w-40 rounded-[50%] bg-gradient-to-b from-white/90 to-sky-100/30 blur-[1px]" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-2.5 h-3 w-32 rounded-[50%] bg-electric/10 blur-md" />
                <BlueEggMark className="relative h-52 lg:h-60 w-auto drop-shadow-[0_28px_36px_rgba(29,62,255,.35)]" />
              </div>
            </div>

            {/* 우측 클러스터 */}
            <div className="hidden md:block absolute right-0 bottom-0 w-[46%] h-full">
              {/* 큰 상승 화살표 */}
              <svg viewBox="0 0 120 150" className="absolute right-6 lg:right-16 top-0 h-40 lg:h-52 w-auto animate-float-b">
                <defs>
                  <linearGradient id="heroArrow" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#7DA6FF" />
                    <stop offset="100%" stopColor="#1D3EFF" />
                  </linearGradient>
                </defs>
                <path d="M14 132 L86 46" fill="none" stroke="url(#heroArrow)" strokeWidth="18" strokeLinecap="round" />
                <path d="M52 30 h48 v48" fill="none" stroke="url(#heroArrow)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {/* 타겟(과녁) + 포디움 */}
              <div className="absolute left-2 lg:left-6 bottom-0 animate-float-a">
                <div className="absolute left-1/2 -translate-x-1/2 bottom-1 h-6 w-36 rounded-[50%] bg-gradient-to-b from-white/90 to-sky-100/30 blur-[1px]" />
                <svg viewBox="0 0 130 130" className="relative h-36 lg:h-44 w-auto drop-shadow-[0_24px_34px_rgba(29,62,255,.3)]">
                  <circle cx="65" cy="65" r="60" fill="#DCE7FF" />
                  <circle cx="65" cy="65" r="46" fill="#ffffff" />
                  <circle cx="65" cy="65" r="33" fill="#9FBBF7" />
                  <circle cx="65" cy="65" r="20" fill="#ffffff" />
                  <circle cx="65" cy="65" r="9" fill="#1D3EFF" />
                  <path d="M95 35 l22 -14 -6 14 14 -6 -14 22z" fill="#1D3EFF" opacity="0.9" />
                </svg>
              </div>
              {/* 바 차트 글래스 카드 */}
              <div className="absolute right-0 top-16 h-24 w-20 rounded-2xl bg-white/55 ring-1 ring-white/70 backdrop-blur-md shadow-[0_20px_44px_-20px_rgba(29,62,255,.5)] flex items-end justify-center gap-1.5 p-3 animate-float-a">
                <span className="w-2.5 h-6 rounded-full bg-electric/40" />
                <span className="w-2.5 h-10 rounded-full bg-electric/70" />
                <span className="w-2.5 h-14 rounded-full bg-electric" />
              </div>
              {/* 리뷰 글래스 카드 */}
              <div className="absolute right-4 bottom-6 w-44 rounded-2xl bg-white/55 ring-1 ring-white/70 backdrop-blur-md shadow-[0_24px_50px_-24px_rgba(29,62,255,.5)] p-3.5 animate-float-b">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-6 w-6 rounded-full bg-electric/20 flex items-center justify-center">
                    <svg className="h-3.5 w-3.5 text-electric" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5z" /></svg>
                  </span>
                  <div className="flex gap-0.5">
                    {[0, 1, 2, 3, 4].map((n) => (
                      <svg key={n} className="h-3 w-3 text-electric" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.3 5.8 20.9l1.6-6.8L2.2 8.9l6.9-.6z" /></svg>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-1.5 w-full rounded-full bg-electric/15" />
                  <div className="h-1.5 w-3/4 rounded-full bg-electric/10" />
                </div>
              </div>
            </div>
          </div>

          {/* ── 하단 피처 바 ── */}
          <div className="relative z-20 pb-16 md:pb-20 -mt-4">
            <div className="rounded-3xl bg-white/55 ring-1 ring-white/70 backdrop-blur-md shadow-[0_24px_70px_-30px_rgba(29,62,255,.45)] px-3 md:px-6 py-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-5">
                {HERO_FEATURES.map((f) => (
                  <div
                    key={f.title}
                    className="flex items-center gap-3 px-4 lg:border-l lg:first:border-l-0 border-brand-border/60"
                  >
                    <span className="shrink-0 text-electric">
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={f.iconPath} />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <p className="text-[15px] font-extrabold text-brand-dark truncate">{f.title}</p>
                      <p className="text-[13px] text-brand-sub truncate">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audiences — 누가 쓰나요 */}
      <section id="audiences" className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-electric/[0.07] blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 right-[-6rem] h-96 w-96 rounded-full bg-sky-400/[0.07] blur-3xl" aria-hidden />
        <div className="relative max-w-6xl mx-auto px-6 py-24">
          <div className="max-w-2xl mb-14">
            <p className="text-sm font-bold text-electric uppercase tracking-widest mb-3">
              For Everyone
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark mb-4 leading-tight">
              브랜드사도, 사장님도, 대행사도
              <br />
              한 플랫폼에서
            </h2>
            <p className="text-brand-sub">
              규모도 목적도 다르지만, 마케팅을 직접 굴린다는 목표는 같습니다. 블루에그는 세 주체 모두에게 맞는 방식으로 작동합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {AUDIENCES.map((a) => (
              <div
                key={a.tag}
                className="group relative flex flex-col p-8 rounded-3xl border border-brand-border hover:border-electric/40 hover:shadow-[0_12px_40px_-16px_rgba(29,62,255,.35)] transition-all"
              >
                <span className="h-12 w-12 rounded-xl flex items-center justify-center bg-electric/8 text-electric mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={a.iconPath} />
                  </svg>
                </span>
                <span className="inline-flex w-fit items-center text-[12px] font-bold px-3 py-1 rounded-full bg-electric/8 text-electric mb-4">
                  {a.tag}
                </span>
                <h3 className="text-xl font-bold text-brand-dark mb-3 leading-snug whitespace-pre-line">
                  {a.title}
                </h3>
                <p className="text-sm text-brand-sub leading-relaxed mb-6">{a.desc}</p>
                <ul className="mt-auto space-y-2.5 border-t border-brand-border pt-5">
                  {a.items.map((it) => (
                    <li key={it} className="flex items-center gap-2.5 text-sm text-brand-text">
                      <svg className="w-4 h-4 text-electric shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative overflow-hidden bg-brand-light border-b border-brand-border">
        <div className="pointer-events-none absolute top-1/2 -right-32 h-96 w-96 -translate-y-1/2 rounded-full bg-electric/[0.06] blur-3xl" aria-hidden />
        <div className="relative max-w-6xl mx-auto px-6 py-24">
          <div className="max-w-2xl mb-14">
            <p className="text-sm font-bold text-electric uppercase tracking-widest mb-3">
              How it works
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark mb-4 leading-tight">
              마케팅을 쇼핑하듯,
              <br />
              단 4단계로 끝냅니다
            </h2>
            <p className="text-brand-sub">
              복잡한 상담·계약·세팅 없이, 고르고 결제하면 나머지는 플랫폼이 자동으로 처리합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((s, i) => (
              <div key={s.no} className="relative">
                {/* connector arrow (desktop) */}
                {i < STEPS.length - 1 && (
                  <span
                    className="hidden lg:block absolute top-11 -right-3 z-10 text-brand-border"
                    aria-hidden
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
                    </svg>
                  </span>
                )}
                <div className="h-full p-7 rounded-3xl bg-white border border-brand-border hover:border-electric/40 hover:shadow-[0_12px_40px_-16px_rgba(29,62,255,.35)] transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <span className="h-12 w-12 rounded-xl flex items-center justify-center bg-electric/8 text-electric">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={s.iconPath} />
                      </svg>
                    </span>
                    <span className="text-3xl font-extrabold text-brand-border tabular-nums">{s.no}</span>
                  </div>
                  <h3 className="text-xl font-bold text-brand-dark mb-2.5">{s.title}</h3>
                  <p className="text-sm text-brand-sub leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <a
              href={PLATFORM_ENTRY}
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-sm font-bold bg-electric text-white hover:bg-electric-hover transition-colors shadow-[0_10px_30px_-8px_rgba(29,62,255,.5)]"
            >
              지금 골라보기
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
              </svg>
            </a>
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
                className="group p-8 rounded-3xl border border-brand-border hover:border-electric/40 hover:shadow-[0_12px_40px_-16px_rgba(29,62,255,.35)] transition-all"
              >
                <span className="inline-block text-[12px] font-bold px-3 py-1 rounded-full bg-electric/8 text-electric mb-5">
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
                className="group relative p-7 rounded-3xl bg-white/[0.03] ring-1 ring-white/10 hover:ring-electric/60 hover:bg-white/[0.06] transition-all"
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
                      className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-white/8 text-white/70"
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

      {/* Stats band */}
      <section className="hero-electric text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6">
            {STATS.map((s) => (
              <div key={s.v} className="text-center lg:text-left">
                <p className="text-4xl md:text-5xl font-extrabold tracking-tight text-white tabular-nums">
                  {s.k}
                </p>
                <p className="mt-2 text-sm text-white/60">{s.v}</p>
              </div>
            ))}
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
                <span className="inline-flex items-center gap-1.5 self-start text-[12px] font-bold px-3 py-1 rounded-full bg-electric/90 text-white">
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
              className="px-8 py-4 rounded-full text-sm font-bold bg-electric text-white hover:bg-electric-hover transition-colors shadow-[0_10px_30px_-8px_rgba(29,62,255,.7)]"
            >
              무료 계정 만들기
            </a>
            <Link
              href="/pricing"
              className="px-8 py-4 rounded-full text-sm font-bold bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/20 transition-colors"
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
