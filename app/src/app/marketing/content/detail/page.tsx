"use client";

import { useState } from "react";
import Link from "next/link";

/* ── 상세페이지 목업 ─────────────────────────── */
function DetailMockup() {
  return (
    <div className="relative w-[300px] h-[340px] shrink-0 select-none">

      {/* 스마트스토어 스타일 세로 스크롤 카드 */}
      <div
        className="absolute left-0 top-0 w-[190px] rounded-2xl overflow-hidden shadow-2xl"
        style={{ border: "1.5px solid rgba(255,255,255,0.18)", background: "#0D1F14" }}
      >
        {/* 제품 이미지 영역 */}
        <div className="relative h-[120px]" style={{ background: "linear-gradient(160deg,#064E3B 0%,#065F46 100%)" }}>
          {/* AI 이미지 placeholder */}
          <div className="absolute inset-3 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.3)" }}>
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl mx-auto mb-1 flex items-center justify-center" style={{ background: "rgba(16,185,129,0.4)" }}>
                <svg className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-[7px] font-bold text-emerald-400">AI 이미지</p>
            </div>
          </div>
          {/* AI 뱃지 */}
          <div className="absolute top-2 right-2 text-[7px] font-extrabold px-1.5 py-0.5 rounded-md text-white" style={{ background: "#8B5CF6" }}>AI</div>
        </div>

        {/* 카피 영역 */}
        <div className="px-3 py-2.5">
          <div className="h-1.5 w-20 rounded-full mb-1.5" style={{ background: "rgba(16,185,129,0.6)" }} />
          <div className="h-3 w-full rounded-lg mb-1" style={{ background: "rgba(255,255,255,0.85)" }} />
          <div className="h-2 w-4/5 rounded-lg" style={{ background: "rgba(255,255,255,0.4)" }} />
        </div>

        {/* 구분선 */}
        <div className="mx-3 h-px" style={{ background: "rgba(16,185,129,0.2)" }} />

        {/* 특장점 블록 */}
        <div className="px-3 py-2.5 space-y-1.5">
          {[
            { color: "#10B981", label: "핵심 특징 01" },
            { color: "#34D399", label: "핵심 특징 02" },
            { color: "#6EE7B7", label: "핵심 특징 03" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-md shrink-0" style={{ background: item.color }} />
              <div className="h-1.5 flex-1 rounded-full" style={{ background: `${item.color}50` }} />
            </div>
          ))}
        </div>

        {/* 구분선 */}
        <div className="mx-3 h-px" style={{ background: "rgba(16,185,129,0.2)" }} />

        {/* 후기 영역 */}
        <div className="px-3 py-2">
          <div className="flex gap-0.5 mb-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="#F59E0B">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
            <span className="text-[7px] text-emerald-400 font-bold ml-1">4.9</span>
          </div>
          <div className="h-1 w-full rounded-full mb-0.5" style={{ background: "rgba(255,255,255,0.12)" }} />
          <div className="h-1 w-3/4 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* CTA 버튼 */}
        <div className="px-3 pb-3">
          <div className="h-6 w-full rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#10B981,#059669)" }}>
            <span className="text-[8px] font-extrabold text-white">구매하기</span>
          </div>
        </div>
      </div>

      {/* 오른쪽: 섹션 레이어 스택 */}
      <div className="absolute right-0 top-4 space-y-2">
        {[
          { label: "히어로 섹션", color: "#10B981", w: "w-[108px]" },
          { label: "특장점", color: "#34D399", w: "w-[98px]" },
          { label: "사용법", color: "#059669", w: "w-[88px]" },
          { label: "후기/리뷰", color: "#8B5CF6", w: "w-[98px]" },
          { label: "구매 CTA", color: "#6D28D9", w: "w-[108px]" },
        ].map((s, i) => (
          <div
            key={s.label}
            className={`${s.w} rounded-xl px-2.5 py-2 flex items-center gap-2 shadow-md`}
            style={{ background: `${s.color}18`, border: `1px solid ${s.color}40`, marginLeft: `${i % 2 === 0 ? 0 : 8}px` }}
          >
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-[8px] font-bold" style={{ color: s.color }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* 배지들 */}
      <div
        className="absolute top-[96px] left-[-6px] text-white text-[10px] font-extrabold px-2.5 py-1.5 rounded-xl shadow-lg"
        style={{ background: "#8B5CF6" }}
      >
        AI 이미지 생성
      </div>
      <div
        className="absolute bottom-[30px] right-[4px] text-white text-[10px] font-extrabold px-2.5 py-1.5 rounded-xl shadow-lg"
        style={{ background: "#10B981" }}
      >
        전환율 최적화
      </div>
    </div>
  );
}

/* ── 특장점 ──────────────────────────────────── */
const FEATURES = [
  {
    no: "01",
    title: "구매를 이끄는\n기획부터 시작합니다",
    desc: "예쁜 디자인보다 팔리는 구조가 중요합니다. 제품 분석 → 핵심 메시지 → 섹션 구성까지, 전환율을 고려한 기획을 먼저 설계합니다.",
    points: ["제품 특성 & 경쟁사 분석", "구매 결정 흐름 기반 섹션 설계", "핵심 카피 & 메시지 방향 정리", "와이어프레임 기획안 제공"],
    visual: (
      <div className="w-full max-w-[280px] space-y-2">
        {[
          { label: "① 제품 분석", sub: "경쟁사 · 타겟 · USP", color: "#10B981", done: true },
          { label: "② 핵심 메시지", sub: "카피 · 슬로건 · 소구점", color: "#10B981", done: true },
          { label: "③ 섹션 기획", sub: "히어로 · 특장점 · 후기 · CTA", color: "#10B981", done: true },
          { label: "④ 디자인 착수", sub: "시안 제작 & 피드백", color: "#10B981", done: false },
        ].map((item, i, arr) => (
          <div key={item.label} className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0 mt-1">
              <div
                className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-extrabold shrink-0"
                style={{ background: item.done ? item.color : "#E5E8EB", color: item.done ? "white" : "#6B7684" }}
              >
                {item.done ? "✓" : i + 1}
              </div>
              {i < arr.length - 1 && (
                <div className="w-px h-3 mt-0.5" style={{ background: item.done ? `${item.color}50` : "#E5E8EB" }} />
              )}
            </div>
            <div
              className="flex-1 rounded-xl px-3 py-2"
              style={{ background: item.done ? `${item.color}10` : "#F9FAFB", border: `1px solid ${item.done ? `${item.color}30` : "#E5E8EB"}` }}
            >
              <p className="text-[11px] font-bold leading-tight" style={{ color: item.done ? item.color : "#6B7684" }}>{item.label}</p>
              <p className="text-[9px] mt-0.5" style={{ color: item.done ? `${item.color}99` : "#9CA3AF" }}>{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    ),
    bg: "white",
    accent: "#10B981",
  },
  {
    no: "02",
    title: "AI 이미지 생성으로\n제품을 돋보이게",
    desc: "별도 촬영 없이도 고퀄리티 제품 이미지를 만들 수 있습니다. AI 이미지 생성이 모든 플랜에 기본 포함되어 있습니다.",
    points: ["제품 컨셉에 맞는 배경 이미지 생성", "라이프스타일 연출 이미지 제작", "썸네일·대표이미지 제작 (Premium)", "무보정 촬영본 업그레이드 가능"],
    visual: (
      <div className="w-full max-w-[280px] space-y-2.5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-4">
          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-3">AI Image Generation</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "제품컷", color: "#10B981", icon: "📦" },
              { label: "라이프스타일", color: "#8B5CF6", icon: "🛋️" },
              { label: "배경 합성", color: "#0EA5E9", icon: "🌿" },
              { label: "인포그래픽", color: "#F59E0B", icon: "📊" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl p-3 flex flex-col items-center gap-1"
                style={{ background: `${item.color}12`, border: `1px solid ${item.color}25` }}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-[9px] font-bold" style={{ color: item.color }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md px-4 py-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#8B5CF620" }}>
            <span className="text-[14px]">✨</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-700">별도 촬영 비용 0원</p>
            <p className="text-[9px] text-gray-400">AI로 프리미엄 이미지 생성</p>
          </div>
        </div>
      </div>
    ),
    bg: "#F9FAFB",
    accent: "#8B5CF6",
  },
  {
    no: "03",
    title: "50,000px+\n브랜드 감성 디자인",
    desc: "단순 나열식 디자인이 아닌 브랜드 톤에 맞는 감성 디자인으로 제작합니다. 섹션마다 스크롤을 멈추게 만드는 레이아웃을 설계합니다.",
    points: ["브랜드 컬러·폰트 시스템 반영", "섹션별 비주얼 & 레이아웃 다양화", "Figma 소스 파일 납품", "모바일·PC 동시 최적화"],
    visual: (
      <div className="w-full max-w-[280px] space-y-2">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-4">
          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-3">Section Stack</p>
          {[
            { label: "히어로 + 핵심 카피", px: "5,000px", color: "#10B981" },
            { label: "특장점 3–5가지", px: "10,000px", color: "#34D399" },
            { label: "제품 상세 설명", px: "15,000px", color: "#059669" },
            { label: "사용 후기 / 인증", px: "8,000px", color: "#8B5CF6" },
            { label: "구매 CTA", px: "3,000px", color: "#6D28D9" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-[10px] text-gray-600 flex-1">{s.label}</span>
              <span className="text-[9px] font-bold" style={{ color: s.color }}>{s.px}</span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between">
            <span className="text-[9px] font-bold text-gray-400">총 분량</span>
            <span className="text-[10px] font-extrabold text-violet-600">41,000px+</span>
          </div>
        </div>
      </div>
    ),
    bg: "white",
    accent: "#10B981",
  },
];

/* ── 프로세스 ───────────────────────────────── */
const PROCESS = [
  { step: "01", title: "상담 & 제품 분석", desc: "제품 종류·판매 채널·경쟁사를 파악하고 적합한 플랜을 추천드립니다." },
  { step: "02", title: "기획 & 레이아웃 설계", desc: "구매 전환 흐름에 맞는 섹션 구성과 핵심 카피 방향을 설계합니다." },
  { step: "03", title: "AI 이미지 생성 & 소재 준비", desc: "제품 이미지, 배경 합성, 라이프스타일 이미지를 AI로 제작합니다." },
  { step: "04", title: "디자인 시안 제작 & 수정", desc: "기획안 기반으로 풀 디자인 시안을 제작하고 피드백을 반영합니다." },
  { step: "05", title: "최종 납품", desc: "Figma 소스 + 이미지 파일 납품. 썸네일·대표이미지 포함 (Premium)." },
];

/* ── FAQ ────────────────────────────────────── */
const FAQS = [
  {
    q: "제품 사진이 없어도 제작이 가능한가요?",
    a: "네, AI 이미지 생성이 모든 플랜에 포함되어 있어 별도 촬영 없이도 고퀄리티 이미지를 제작할 수 있습니다. 기존 제품 사진이 있다면 더 좋은 결과물을 만들 수 있습니다.",
  },
  {
    q: "스마트스토어·쿠팡 등 쇼핑몰에 바로 올릴 수 있나요?",
    a: "Figma 파일과 최적화된 이미지 파일로 납품됩니다. 쇼핑몰 등록용 PNG/JPG 파일도 함께 제공되어 바로 업로드할 수 있습니다.",
  },
  {
    q: "분량은 어떻게 책정되나요?",
    a: "Standard는 약 6–7섹션(20,000px+), Deluxe는 약 10섹션(40,000px+), Premium은 15섹션 이상(50,000px+)입니다. 제품 특성에 따라 협의 가능합니다.",
  },
  {
    q: "디자인 수정은 몇 번까지 가능한가요?",
    a: "Standard 2회, Deluxe 3회, Premium 4회 수정이 포함됩니다. 기획 단계와 디자인 단계로 나누어 진행합니다.",
  },
];

/* ── 가격 플랜 ───────────────────────────────── */
const TIERS = [
  {
    id: "standard",
    name: "Standard",
    sub: "입문용",
    price: "79",
    unit: "만원",
    duration: "7 영업일",
    grad: "linear-gradient(135deg,#10B981,#059669)",
    checkColor: "text-emerald-500",
    targets: ["간단한 제품 설명이 필요한 경우", "빠른 출시가 필요한 신제품", "예산을 최소화하고 싶은 셀러"],
    specs: [
      { label: "분량", value: "20,000px+ (약 6–7섹션)" },
      { label: "결과물", value: "Figma" },
      { label: "수정", value: "2회 (기획 1회, 디자인 1회)" },
    ],
    includes: ["기획", "디자인", "AI 이미지 생성"],
    highlight: "",
  },
  {
    id: "deluxe",
    name: "Deluxe",
    sub: "주력 매출형",
    price: "149",
    unit: "만원",
    duration: "10 영업일",
    grad: "linear-gradient(135deg,#3B82F6,#1D4ED8)",
    checkColor: "text-blue-500",
    targets: ["주력 제품 매출을 높이고 싶은 경우", "경쟁이 많은 카테고리의 상품", "브랜드 인지도를 높이고 싶은 셀러"],
    specs: [
      { label: "분량", value: "40,000px+ (약 10섹션)" },
      { label: "결과물", value: "Figma" },
      { label: "수정", value: "3회 (기획 1회, 디자인 2회)" },
    ],
    includes: ["기획", "디자인", "AI 이미지 생성"],
    highlight: "",
  },
  {
    id: "premium",
    name: "Premium",
    sub: "브랜드/전환 최적화형",
    price: "219",
    unit: "만원~",
    duration: "12–14 영업일",
    grad: "linear-gradient(135deg,#8B5CF6,#6D28D9)",
    checkColor: "text-violet-500",
    best: true,
    targets: ["프리미엄 제품 / D2C 브랜드", "설명이 많은 복잡한 제품", "전환율 극대화가 목표인 셀러"],
    specs: [
      { label: "분량", value: "50,000px+ (약 15섹션 이상)" },
      { label: "결과물", value: "Figma" },
      { label: "수정", value: "4회 (기획 2회, 디자인 2회)" },
    ],
    includes: ["기획", "디자인", "AI 이미지 생성", "썸네일 + 대표이미지 제공"],
    highlight: "썸네일 + 대표이미지 제공",
  },
];

function Check({ color }: { color: string }) {
  return (
    <svg className={`w-3.5 h-3.5 shrink-0 mt-[1px] ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

export default function DetailPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="w-full flex gap-6 items-start">

      {/* ── 메인 콘텐츠 ────────────────────── */}
      <div className="flex-1 min-w-0 space-y-0">

        {/* ── 오른쪽 고정 CTA 패널 ────── */}
        <div
          className="hidden lg:block fixed z-30 w-64 xl:w-72 right-8 xl:right-[288px]"
          style={{ top: "92px" }}
        >
          <div className="rounded-2xl overflow-hidden shadow-xl border border-emerald-100">
            <div className="px-5 pt-6 pb-6" style={{ background: "linear-gradient(135deg,#10B981,#059669)" }}>
              <p className="text-[10px] font-extrabold text-white/50 uppercase tracking-widest mb-2">Detail Page</p>
              <p className="text-[17px] font-extrabold text-white leading-tight mb-1">기획부터 AI 이미지까지</p>
              <p className="text-[17px] font-extrabold text-white leading-tight mb-5">원스톱 제작</p>
              <p className="text-[11px] text-white/55 leading-relaxed mb-5">
                전환율 중심 기획 · AI 이미지 생성<br />감성 디자인 · Figma 납품까지<br />한 팀이 끝까지 담당합니다.
              </p>
              <div className="space-y-2">
                {[
                  { label: "Standard", price: "79만원~", sub: "7 영업일" },
                  { label: "Deluxe", price: "149만원~", sub: "10 영업일" },
                  { label: "Premium", price: "219만원~", sub: "12–14 영업일" },
                ].map((t) => (
                  <div key={t.label} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/10">
                    <div>
                      <span className="text-[12px] font-bold text-white block leading-tight">{t.label}</span>
                      <span className="text-[10px] text-white/40">{t.sub}</span>
                    </div>
                    <span className="text-[12px] font-extrabold text-emerald-200">{t.price}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white px-4 py-5 space-y-2.5">
              <button
                className="w-full py-3 rounded-xl text-[13px] font-extrabold text-white transition-opacity hover:opacity-85"
                style={{ background: "linear-gradient(135deg,#10B981,#059669)" }}
              >
                무료 상세페이지 상담 신청
              </button>
              <button className="w-full py-3 rounded-xl text-[13px] font-bold text-brand-sub bg-brand-lighter hover:bg-brand-border transition-colors border border-brand-border">
                카카오로 문의하기
              </button>
            </div>
          </div>
        </div>

        {/* 브레드크럼 */}
        <nav className="flex items-center gap-1.5 text-[13px] text-brand-sub mb-6 px-1">
          <Link href="/marketing" className="hover:text-brand-text">대시보드</Link>
          <span>›</span>
          <span className="text-brand-muted">콘텐츠</span>
          <span>›</span>
          <span className="text-brand-text font-medium">상세페이지</span>
        </nav>

        {/* ── HERO ──────────────────────────── */}
        <section className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(160deg,#022C22 0%,#064E3B 55%,#065F46 100%)" }}>
          <div className="px-8 py-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-extrabold text-emerald-300 uppercase tracking-[0.2em] mb-3">Detail Page</p>
              <h1 className="text-[30px] font-extrabold text-white leading-tight mb-4">
                팔리는 상세페이지,<br />
                기획이 먼저입니다
              </h1>
              <p className="text-[14px] text-white/75 leading-relaxed mb-6">
                전환율 기반 기획 · AI 이미지 생성 · 감성 디자인<br />
                스마트스토어·쿠팡·자사몰 모두 대응합니다.
              </p>
              <div className="flex flex-wrap gap-2">
                {["전환율 최적화", "AI 이미지 포함", "Figma 납품", "7일 완성"].map((t) => (
                  <span key={t} className="text-[11px] font-bold px-3 py-1.5 rounded-lg text-white" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <DetailMockup />
          </div>
        </section>

        {/* ── 숫자 강조 ──────────────────────── */}
        <section className="rounded-2xl bg-white border border-brand-border py-6 px-8">
          <div className="grid grid-cols-3 gap-6 divide-x divide-brand-border">
            {[
              { num: "1,200+", label: "누적 상세페이지 제작" },
              { num: "평균 +34%", label: "전환율 개선 효과" },
              { num: "7일", label: "최단 납품 기간" },
            ].map((s) => (
              <div key={s.label} className="text-center px-2">
                <p className="text-[24px] font-extrabold text-emerald-600 leading-tight">{s.num}</p>
                <p className="text-[12px] text-brand-sub mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 특장점 3섹션 ───────────────────── */}
        {FEATURES.map((f, i) => (
          <section
            key={f.no}
            className="rounded-2xl overflow-hidden"
            style={{ background: f.bg }}
          >
            <div className={`px-8 py-10 flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-8`}>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-extrabold uppercase tracking-widest mb-2" style={{ color: f.accent }}>
                  FEATURE {f.no}
                </p>
                <h2 className="text-[22px] font-extrabold text-brand-dark leading-tight mb-3 whitespace-pre-line">
                  {f.title}
                </h2>
                <p className="text-[13px] text-brand-sub leading-relaxed mb-5">{f.desc}</p>
                <ul className="space-y-2">
                  {f.points.map((pt) => (
                    <li key={pt} className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke={f.accent} strokeWidth={2.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="text-[12px] font-semibold text-brand-dark">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="shrink-0 flex justify-center w-full md:w-auto">
                {f.visual}
              </div>
            </div>
          </section>
        ))}

        {/* ── 프로세스 ────────────────────────── */}
        <section className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(160deg,#022C22 0%,#064E3B 100%)" }}>
          <div className="px-8 py-10">
            <p className="text-[11px] font-extrabold text-emerald-400/70 uppercase tracking-widest mb-2">Process</p>
            <h2 className="text-[22px] font-extrabold text-white mb-8">5단계 제작 프로세스</h2>
            <div className="space-y-0">
              {PROCESS.map((p, i) => (
                <div key={p.step} className="flex gap-4">
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white shrink-0"
                      style={{ background: "linear-gradient(135deg,#10B981,#059669)" }}
                    >
                      {p.step}
                    </div>
                    {i < PROCESS.length - 1 && (
                      <div className="w-px flex-1 my-1" style={{ background: "rgba(16,185,129,0.3)" }} />
                    )}
                  </div>
                  <div className={`pb-6 ${i === PROCESS.length - 1 ? "pb-0" : ""}`}>
                    <p className="text-[14px] font-bold text-white mb-1">{p.title}</p>
                    <p className="text-[12px] text-emerald-300/55 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 가격 플랜 ───────────────────────── */}
        <section className="rounded-2xl bg-brand-lighter border border-brand-border px-8 py-10">
          <p className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-widest mb-2">Pricing</p>
          <h2 className="text-[22px] font-extrabold text-brand-dark mb-2">플랜 선택</h2>
          <p className="text-[13px] text-brand-sub mb-8">제품 종류와 목적에 맞는 플랜을 선택하세요.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`relative flex flex-col rounded-2xl overflow-hidden bg-white ${
                  tier.best
                    ? "border-2 border-violet-400 shadow-[0_4px_24px_rgba(139,92,246,0.15)]"
                    : "border border-brand-border"
                }`}
              >
                {tier.best && (
                  <div
                    className="absolute top-4 right-4 text-white text-[10px] font-extrabold tracking-widest px-2.5 py-1 rounded-full"
                    style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)" }}
                  >
                    BEST
                  </div>
                )}
                <div className="px-5 pt-5 pb-8" style={{ background: tier.grad }}>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-0.5">{tier.sub}</p>
                  <p className="text-white text-[18px] font-extrabold">{tier.name}</p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-white text-[28px] font-extrabold">{tier.price}</span>
                    <span className="text-white/70 text-[13px] font-semibold">{tier.unit}</span>
                  </div>
                  <p className="text-white/40 text-[10px] mt-0.5">VAT 별도</p>
                  <div className="mt-3 flex items-center gap-1.5 bg-white/15 rounded-lg px-2.5 py-1.5 w-fit">
                    <svg className="w-3 h-3 text-white/70 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-white text-[11px] font-bold">{tier.duration} 소요</span>
                  </div>
                </div>
                <div className="px-4 py-4 border-b border-brand-border">
                  <p className="text-[9px] font-extrabold text-brand-muted uppercase tracking-widest mb-2">추천 대상</p>
                  <ul className="space-y-1.5">
                    {tier.targets.map((t, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check color={tier.checkColor} />
                        <span className="text-[11px] text-brand-sub leading-snug">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-4 py-4 border-b border-brand-border">
                  <p className="text-[9px] font-extrabold text-brand-muted uppercase tracking-widest mb-2">스펙</p>
                  <ul className="space-y-1.5">
                    {tier.specs.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[10px] font-bold text-brand-muted w-10 shrink-0 pt-[1px]">{s.label}</span>
                        <span className="text-[11px] text-brand-dark leading-snug">{s.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-4 py-4 flex-1">
                  <p className="text-[9px] font-extrabold text-brand-muted uppercase tracking-widest mb-2">포함 구성</p>
                  <ul className="space-y-1.5">
                    {tier.includes.map((inc, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: tier.grad.includes("#") ? (tier.grad.split(",")[1]?.trim().replace(")", "") ?? "#10B981") : "#10B981" }} />
                        <span className={`text-[11px] leading-snug ${inc === tier.highlight ? "font-bold text-brand-dark" : "text-brand-sub"}`}>
                          {inc}
                        </span>
                        {inc === tier.highlight && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-violet-50 text-violet-600 shrink-0">추가</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-4 pb-4 pt-2">
                  <button
                    className="w-full py-2.5 rounded-xl text-[13px] font-bold text-white hover:opacity-85 transition-opacity"
                    style={{ background: tier.grad }}
                  >
                    문의하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ────────────────────────────── */}
        <section className="rounded-2xl bg-white border border-brand-border px-8 py-10">
          <p className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-widest mb-2">FAQ</p>
          <h2 className="text-[22px] font-extrabold text-brand-dark mb-6">자주 묻는 질문</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-brand-border overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-brand-lighter transition-colors"
                >
                  <span className="text-[13px] font-bold text-brand-dark">{faq.q}</span>
                  <svg
                    className={`w-4 h-4 text-brand-muted shrink-0 ml-3 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 border-t border-brand-border bg-brand-lighter">
                    <p className="text-[13px] text-brand-sub leading-relaxed pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── 하단 CTA 배너 ──────────────────── */}
        <section
          className="rounded-2xl px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ background: "linear-gradient(135deg,#10B981,#059669)" }}
        >
          <div>
            <p className="text-[11px] font-extrabold text-emerald-100/50 uppercase tracking-widest mb-1">무료 상담</p>
            <p className="text-[20px] font-extrabold text-white leading-tight">어떤 플랜이 맞는지<br />모르겠다면 먼저 물어보세요</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button className="px-6 py-3 rounded-xl text-[13px] font-extrabold bg-white text-emerald-700 hover:bg-emerald-50 transition-colors">
              무료 상담 신청
            </button>
            <button className="px-6 py-3 rounded-xl text-[13px] font-bold bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors">
              카카오로 문의
            </button>
          </div>
        </section>

        {/* 안내 */}
        <div className="flex items-start gap-3 px-1 pb-8">
          <svg className="w-4 h-4 text-brand-muted shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-[11px] text-brand-muted leading-relaxed">
            작업기간은 영업일 기준이며, 피드백 속도 및 수정 횟수에 따라 달라질 수 있습니다. 가격은 VAT 별도이며, 세부 범위에 따라 변동될 수 있습니다.
          </p>
        </div>

      </div>

      {/* 오른쪽 고정 패널 자리 확보용 */}
      <div className="hidden lg:block w-64 xl:w-72 shrink-0" />

    </div>
  );
}
