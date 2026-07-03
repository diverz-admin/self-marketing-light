"use client";

import { useState } from "react";
import Link from "next/link";
import { useRailLeft } from "@/components/marketing/useRailLeft";

/* ── 브랜드 아이덴티티 목업 ──────────────────── */
function BrandingMockup() {
  return (
    <div className="relative w-[300px] h-[360px] shrink-0 select-none">

      {/* 가이드북 카드 */}
      <div
        className="absolute left-0 top-0 w-[190px] h-[240px] rounded-2xl shadow-xl overflow-hidden"
        style={{ background: "linear-gradient(160deg,#6366F1 0%,#4338CA 100%)" }}
      >
        <div className="px-5 pt-5 pb-4">
          <p className="text-[10px] font-extrabold text-white/40 uppercase tracking-[0.2em] mb-1">Brand Identity</p>
          <p className="text-[19px] font-extrabold text-white leading-tight mb-3">브랜드<br />가이드북</p>
          {/* 컬러 팔레트 */}
          <div className="flex gap-1.5 mb-4">
            {["#6366F1","#F59E0B","#10B981","#111D37","#F5F6F8"].map((c) => (
              <div key={c} className="w-5 h-5 rounded-full border border-white/20" style={{ background: c }} />
            ))}
          </div>
          {/* 폰트 샘플 */}
          <div className="space-y-1">
            <p className="text-white text-[15px] font-extrabold leading-none">Aa</p>
            <p className="text-white/50 text-[10px] font-medium">Pretendard / 600</p>
          </div>
        </div>
        {/* 하단 줄무늬 */}
        <div className="absolute bottom-0 left-0 right-0 h-[6px] flex">
          {["#6366F1","#818CF8","#A5B4FC","#C7D2FE","#E0E7FF"].map((c,i) => (
            <div key={i} className="flex-1" style={{ background: c }} />
          ))}
        </div>
      </div>

      {/* 로고 카드 */}
      <div className="absolute right-0 top-6 w-[120px] h-[120px] rounded-2xl shadow-xl bg-white flex flex-col items-center justify-center border border-gray-100">
        <div className="h-10 w-10 rounded-xl mb-2" style={{ background: "linear-gradient(135deg,#6366F1,#4338CA)" }}>
          <div className="h-full w-full rounded-xl flex items-center justify-center">
            <span className="text-white font-extrabold text-[20px]">B</span>
          </div>
        </div>
        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">BRAND</p>
        <p className="text-[12px] font-extrabold text-gray-700 tracking-tight">STUDIO</p>
      </div>

      {/* 명함 카드 */}
      <div
        className="absolute right-0 top-[148px] w-[148px] h-[88px] rounded-xl shadow-xl overflow-hidden"
        style={{ background: "linear-gradient(135deg,#1E1B4B,#312E81)" }}
      >
        <div className="px-4 pt-3">
          <p className="text-white text-[12px] font-extrabold mb-0.5">김대표</p>
          <p className="text-white/50 text-[9px] mb-2">CEO · BRAND STUDIO</p>
          <p className="text-white/40 text-[8px]">eggcorp2024@gmail.com</p>
          <p className="text-white/40 text-[8px]">010-0000-0000</p>
        </div>
        <div className="absolute bottom-2 right-2 h-6 w-6 rounded-lg" style={{ background: "rgba(255,255,255,0.12)" }}>
          <span className="flex items-center justify-center h-full text-white font-extrabold text-[11px]">B</span>
        </div>
      </div>

      {/* 키 메시지 카드 */}
      <div className="absolute left-8 bottom-0 w-[200px] bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3">
        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-1">Key Message</p>
        <p className="text-[15px] font-extrabold text-gray-800 leading-snug">"신뢰를 설계하는<br />브랜드 전략"</p>
        <div className="mt-2 flex gap-1.5">
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-500">전략</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-500">아이덴티티</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-500">시스템</span>
        </div>
      </div>

      {/* 플로팅 배지 */}
      <div className="absolute -right-2 bottom-[100px] bg-indigo-600 text-white text-[11px] font-extrabold px-2.5 py-1.5 rounded-xl shadow-lg">
        가이드북 제작
      </div>
      <div className="absolute -left-2 top-[100px] bg-amber-400 text-amber-900 text-[11px] font-extrabold px-2.5 py-1.5 rounded-xl shadow-lg">
        로고 디자인
      </div>
    </div>
  );
}

/* ── 특장점 섹션 데이터 ──────────────────────── */
const FEATURES = [
  {
    no: "01",
    title: "브랜드 전략부터\n설계합니다",
    desc: "디자인 작업 전, 브랜드의 미션·비전·타겟·포지셔닝을 인터뷰 기반으로 정리합니다. 방향이 없는 디자인은 금방 흔들립니다.",
    points: ["브랜드 인터뷰 (대표 1:1)", "시장 포지셔닝 정리", "핵심 타겟 & 페르소나 설정", "브랜드 스토리 & 슬로건 도출"],
    visual: (
      <div className="w-full max-w-[280px] bg-white rounded-2xl border border-gray-100 shadow-md p-5">
        <p className="text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-3">Brand Strategy</p>
        {[
          { label: "브랜드 미션", value: "신뢰를 설계한다", color: "#6366F1" },
          { label: "핵심 타겟", value: "30대 스타트업 대표", color: "#F59E0B" },
          { label: "포지셔닝", value: "프리미엄 · 신뢰 · 전문성", color: "#10B981" },
          { label: "슬로건", value: "브랜드가 말한다", color: "#6366F1" },
        ].map((item) => (
          <div key={item.label} className="mb-3">
            <p className="text-[10px] font-bold text-gray-400 mb-0.5">{item.label}</p>
            <div className="h-7 rounded-lg flex items-center px-2.5" style={{ background: `${item.color}15` }}>
              <span className="text-[12px] font-bold" style={{ color: item.color }}>{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    ),
    bg: "white",
    accent: "#6366F1",
  },
  {
    no: "02",
    title: "로고·컬러·폰트\n아이덴티티 설계",
    desc: "전략에서 도출한 키워드를 시각 언어로 변환합니다. 단순한 예쁜 로고가 아닌, 브랜드 방향성을 담은 아이덴티티입니다.",
    points: ["로고 & 심볼 디자인 (시안 제공)", "브랜드 컬러 팔레트 구성", "타이포그래피 시스템", "목업 시안 (패키지·명함·SNS 등)"],
    visual: (
      <div className="w-full max-w-[280px] space-y-3">
        {/* 로고 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-4 flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#6366F1,#4338CA)" }}>
            <span className="text-white font-extrabold text-[22px]">B</span>
          </div>
          <div>
            <p className="text-[16px] font-extrabold text-gray-800 tracking-tight">BRAND</p>
            <p className="text-[11px] font-semibold text-gray-400 tracking-[0.2em]">STUDIO</p>
          </div>
        </div>
        {/* 컬러 팔레트 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Color Palette</p>
          <div className="flex gap-2">
            {[
              { color: "#6366F1", name: "Primary" },
              { color: "#4338CA", name: "Dark" },
              { color: "#E0E7FF", name: "Light" },
              { color: "#F59E0B", name: "Accent" },
              { color: "#111D37", name: "Black" },
            ].map((c) => (
              <div key={c.name} className="flex-1">
                <div className="h-8 rounded-lg mb-1" style={{ background: c.color }} />
                <p className="text-[8px] font-bold text-gray-400 text-center">{c.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    bg: "#F5F6F8",
    accent: "#6366F1",
  },
  {
    no: "03",
    title: "실무에서 바로 쓰는\n브랜드 가이드북",
    desc: "누가 디자인해도 같은 톤이 나오도록 브랜드 규칙을 문서화합니다. 직원 온보딩, 외주 업무 모두 가이드북 한 권으로 해결됩니다.",
    points: ["로고 사용 규칙 & 금지 사례", "컬러·폰트 사용 기준", "명함·SNS·패키지 적용 예시", "PDF + Figma 파일 납품"],
    visual: (
      <div
        className="w-full max-w-[280px] rounded-2xl shadow-md overflow-hidden"
        style={{ background: "linear-gradient(160deg,#1E1B4B 0%,#312E81 100%)" }}
      >
        <div className="px-5 pt-5 pb-6">
          <p className="text-[10px] font-extrabold text-white/30 uppercase tracking-[0.2em] mb-1">Brand Guidebook</p>
          <p className="text-[20px] font-extrabold text-white leading-tight mb-4">브랜드가 일관되면<br />신뢰가 쌓입니다</p>
          {[
            "01. 브랜드 스토리",
            "02. 로고 사용 규칙",
            "03. 컬러 시스템",
            "04. 타이포그래피",
            "05. 디자인 적용 예시",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
              <span className="text-[12px] text-white/60">{item}</span>
            </div>
          ))}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white/10 text-white/60">PDF</span>
            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white/10 text-white/60">Figma</span>
            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-500/40 text-indigo-300">15–70p</span>
          </div>
        </div>
      </div>
    ),
    bg: "white",
    accent: "#6366F1",
  },
];

/* ── 프로세스 ───────────────────────────────── */
const PROCESS = [
  { step: "01", title: "상담 & 인터뷰", desc: "브랜드 현황, 목표, 예산을 파악하고 플랜을 추천드립니다." },
  { step: "02", title: "전략 방향 설계", desc: "타겟, 포지셔닝, 스토리, 슬로건을 함께 정리합니다." },
  { step: "03", title: "시각 아이덴티티 작업", desc: "로고, 컬러, 폰트 시안을 제작하고 피드백을 반영합니다." },
  { step: "04", title: "적용 목업 제작", desc: "명함, SNS, 패키지 등 실제 환경에 적용한 시안을 보여드립니다." },
  { step: "05", title: "가이드북 완성 납품", desc: "PDF + Figma 파일로 최종 브랜드 가이드북을 납품합니다." },
];

/* ── FAQ ────────────────────────────────────── */
const FAQS = [
  {
    q: "디자인 수정은 몇 번까지 가능한가요?",
    a: "플랜마다 수정 횟수가 다릅니다. Standard는 2회, Deluxe는 3회, Premium은 무제한 수정이 가능합니다.",
  },
  {
    q: "브랜드가 이미 있는데 리브랜딩도 가능한가요?",
    a: "가능합니다. 기존 브랜드 자산을 검토하고 리브랜딩 범위를 함께 설계합니다. 상담 시 현재 자료를 공유해 주시면 됩니다.",
  },
  {
    q: "납품 파일 형식은 어떻게 되나요?",
    a: "로고는 AI, SVG, PNG 원본 포함, 가이드북은 PDF와 Figma 소스 파일로 납품됩니다.",
  },
  {
    q: "중간에 플랜 변경이 가능한가요?",
    a: "작업 착수 전 변경은 자유롭습니다. 착수 이후에는 추가 비용이 발생할 수 있으니 상담 시 미리 말씀해 주세요.",
  },
];

/* ── 가격 플랜 ───────────────────────────────── */
const TIERS = [
  {
    id: "standard",
    name: "Standard",
    sub: "기본 브랜딩",
    price: "190",
    unit: "만원",
    duration: "약 2주",
    grad: "linear-gradient(135deg,#10B981,#059669)",
    checkColor: "text-emerald-500",
    targets: [
      "1인 브랜드 / 소규모 사업자",
      "MVP 단계에서 최소한의 브랜드 정리가 필요한 경우",
      "제품·서비스는 있지만 브랜드 정리가 안 된 상태",
      "예산은 제한적이지만 대충은 하기 싫은 대표",
    ],
    sections: [
      { label: "브랜드 방향성 정리", detail: "인터뷰 기반" },
      { label: "브랜드 컨셉 & 키 메시지 정리", detail: null },
      { label: "로고 디자인", detail: "최초 시안 1안 · 수정 2회" },
      { label: "컬러 & 폰트 가이드", detail: null },
      { label: "기본 목업 시안 3종", detail: null },
      { label: "명함 디자인", detail: null },
      { label: "브랜드 가이드북", detail: "약 15–20p" },
    ],
  },
  {
    id: "deluxe",
    name: "Deluxe",
    sub: "브랜딩",
    price: "490",
    unit: "만원",
    duration: "약 3주",
    grad: "linear-gradient(135deg,#3B82F6,#1D4ED8)",
    checkColor: "text-blue-500",
    targets: [
      "신규 브랜드 런칭을 준비 중인 스타트업 / 소규모 기업",
      "방향성은 필요하지만 풀 시스템까지는 과하지 않은 단계",
      "브랜드 톤을 빠르게 정리하고 시장에 나가야 하는 경우",
      "대표 의사결정 중심으로 빠른 진행을 원하는 브랜드",
    ],
    sections: [
      { label: "전략 컨설팅", detail: null },
      { label: "Brand Identity 핵심 설계", detail: "브랜드 컨셉 · 타겟 · 스토리 · 슬로건" },
      { label: "로고 & 심볼 디자인", detail: "최초 시안 2안 · 수정 3회" },
      { label: "기본 디자인 시스템", detail: "컬러 · 폰트 · 목업 시안 7종" },
      { label: "명함 디자인", detail: null },
      { label: "브랜드 가이드북", detail: "약 30–40p" },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    sub: "고급화 브랜딩",
    price: "1,000",
    unit: "만원",
    duration: "약 6주",
    grad: "linear-gradient(135deg,#6366F1,#4338CA)",
    checkColor: "text-indigo-500",
    best: true,
    targets: [
      "브랜드를 장기 자산으로 만들고 싶은 기업",
      "투자 유치 · 프랜차이즈 · 유통 입점 등 확장 계획이 명확한 브랜드",
      "마케팅·디자인을 체계적으로 운영할 내부 팀 보유 또는 예정인 브랜드",
      "브랜드 전략과 기준이 필요한 대표",
    ],
    sections: [
      { label: "전략 컨설팅", detail: null },
      { label: "Brand Identity 설계", detail: "비전·미션·핵심가치 · 타겟 · 포지셔닝 · 스토리 · 슬로건" },
      { label: "로고 & 심볼 디자인", detail: "최초 시안 3안 · 무제한 디벨롭 수정" },
      { label: "디자인 시스템", detail: "컬러 · 타이포 · 그래픽 규칙 · 목업 시안 15종" },
      { label: "명함 디자인", detail: null },
      { label: "브랜드 가이드북", detail: "약 50–70p" },
    ],
  },
];

function Check({ color }: { color: string }) {
  return (
    <svg className={`w-3.5 h-3.5 shrink-0 mt-[1px] ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

export default function BrandingPage() {
  const { railRef, railLeft } = useRailLeft();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="w-full flex gap-6 items-start">

      {/* ── 메인 콘텐츠 ────────────────────── */}
      <div className="flex-1 min-w-0 space-y-0">

      {/* ── 오른쪽 고정 CTA 패널 (fixed) ────── */}
      <div
        className="hidden lg:block fixed z-30 w-64 xl:w-72"
        style={{ top: 92, left: railLeft, visibility: railLeft == null ? "hidden" : "visible" }}
      >
        <div className="rounded-2xl overflow-hidden shadow-xl border border-indigo-100">
          <div className="px-5 pt-6 pb-6" style={{ background: "linear-gradient(135deg,#6366F1,#4338CA)" }}>
            <p className="text-[11px] font-extrabold text-white/50 uppercase tracking-widest mb-2">Total Branding</p>
            <p className="text-[19px] font-extrabold text-white leading-tight mb-1">브랜드 전략부터</p>
            <p className="text-[19px] font-extrabold text-white leading-tight mb-5">가이드북까지</p>
            <p className="text-[12px] text-white/50 leading-relaxed mb-5">
              인터뷰 기반 전략 설계부터<br />로고·가이드북 납품까지<br />원스톱으로 진행합니다.
            </p>
            <div className="space-y-2">
              {[
                { label: "Standard", price: "190만원~", sub: "약 2주" },
                { label: "Deluxe", price: "490만원~", sub: "약 3주" },
                { label: "Premium", price: "1,000만원~", sub: "약 6주" },
              ].map((t) => (
                <div key={t.label} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/10">
                  <div>
                    <span className="text-[13px] font-bold text-white block leading-tight">{t.label}</span>
                    <span className="text-[11px] text-white/40">{t.sub}</span>
                  </div>
                  <span className="text-[13px] font-extrabold text-indigo-200">{t.price}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white px-4 py-5 space-y-2.5">
            <button
              className="w-full py-3 rounded-xl text-[15px] font-extrabold text-white transition-opacity hover:opacity-85"
              style={{ background: "linear-gradient(135deg,#6366F1,#4338CA)" }}
            >
              무료 브랜딩 상담 신청
            </button>
            <button className="w-full py-3 rounded-xl text-[15px] font-bold text-brand-sub bg-brand-lighter hover:bg-brand-border transition-colors border border-brand-border">
              카카오로 문의하기
            </button>
          </div>
        </div>
      </div>

        {/* 브레드크럼 */}
        <nav className="flex items-center gap-1.5 text-[15px] text-brand-sub mb-6 px-1">
          <Link href="/marketing" className="hover:text-brand-text">대시보드</Link>
          <span>›</span>
          <span className="text-brand-muted">콘텐츠</span>
          <span>›</span>
          <span className="text-brand-text font-medium">Total 브랜딩</span>
        </nav>

        {/* ── HERO ──────────────────────────── */}
        <section className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(160deg,#1E1B4B 0%,#312E81 60%,#4338CA 100%)" }}>
          <div className="px-8 py-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-extrabold text-indigo-300/70 uppercase tracking-[0.2em] mb-3">Total Branding</p>
              <h1 className="text-[34px] font-extrabold text-white leading-tight mb-4">
                브랜드가<br />
                말하게 만드세요
              </h1>
              <p className="text-[16px] text-indigo-200/75 leading-relaxed mb-6">
                전략 · 아이덴티티 · 가이드북까지<br />
                브랜드의 처음부터 끝을 설계합니다.
              </p>
              <div className="flex flex-wrap gap-2">
                {["브랜드 전략", "로고 디자인", "가이드북", "명함"].map((t) => (
                  <span key={t} className="text-[12px] font-bold px-3 py-1.5 rounded-lg bg-white/10 text-indigo-100 border border-white/10">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <BrandingMockup />
          </div>
        </section>

        {/* ── 숫자 강조 ──────────────────────── */}
        <section className="rounded-2xl bg-white border border-brand-border py-6 px-8">
          <div className="grid grid-cols-3 gap-6 divide-x divide-brand-border">
            {[
              { num: "300+", label: "누적 브랜딩 프로젝트" },
              { num: "98%", label: "재의뢰 & 추천율" },
              { num: "15일", label: "평균 납품 기간" },
            ].map((s) => (
              <div key={s.label} className="text-center px-2">
                <p className="text-[31px] font-extrabold text-indigo-600 leading-tight">{s.num}</p>
                <p className="text-[13px] text-brand-sub mt-0.5">{s.label}</p>
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
              {/* 텍스트 */}
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-extrabold uppercase tracking-widest mb-2" style={{ color: f.accent }}>
                  FEATURE {f.no}
                </p>
                <h2 className="text-[25px] font-extrabold text-brand-dark leading-tight mb-3 whitespace-pre-line">
                  {f.title}
                </h2>
                <p className="text-[15px] text-brand-sub leading-relaxed mb-5">{f.desc}</p>
                <ul className="space-y-2">
                  {f.points.map((pt) => (
                    <li key={pt} className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke={f.accent} strokeWidth={2.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="text-[13px] font-semibold text-brand-dark">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* 비주얼 */}
              <div className="shrink-0 flex justify-center w-full md:w-auto">
                {f.visual}
              </div>
            </div>
          </section>
        ))}

        {/* ── 프로세스 ────────────────────────── */}
        <section className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(160deg,#0F0B2D 0%,#1E1B4B 100%)" }}>
          <div className="px-8 py-10">
            <p className="text-[12px] font-extrabold text-indigo-400/60 uppercase tracking-widest mb-2">Process</p>
            <h2 className="text-[25px] font-extrabold text-white mb-8">5단계 브랜딩 프로세스</h2>
            <div className="space-y-0">
              {PROCESS.map((p, i) => (
                <div key={p.step} className="flex gap-4 group">
                  {/* 스텝 라인 */}
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-[12px] font-extrabold text-white shrink-0"
                      style={{ background: "linear-gradient(135deg,#6366F1,#4338CA)" }}
                    >
                      {p.step}
                    </div>
                    {i < PROCESS.length - 1 && (
                      <div className="w-px flex-1 my-1" style={{ background: "rgba(99,102,241,0.3)" }} />
                    )}
                  </div>
                  {/* 내용 */}
                  <div className={`pb-6 ${i === PROCESS.length - 1 ? "pb-0" : ""}`}>
                    <p className="text-[16px] font-bold text-white mb-1">{p.title}</p>
                    <p className="text-[13px] text-indigo-200/60 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 가격 플랜 ───────────────────────── */}
        <section className="rounded-2xl bg-brand-lighter border border-brand-border px-8 py-10">
          <p className="text-[12px] font-extrabold text-indigo-500 uppercase tracking-widest mb-2">Pricing</p>
          <h2 className="text-[25px] font-extrabold text-brand-dark mb-2">플랜 선택</h2>
          <p className="text-[15px] text-brand-sub mb-8">브랜드 단계와 예산에 맞는 플랜을 선택하세요.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`relative flex flex-col rounded-2xl overflow-hidden bg-white ${
                  tier.best
                    ? "border-2 border-indigo-400 shadow-[0_4px_24px_rgba(99,102,241,0.15)]"
                    : "border border-brand-border"
                }`}
              >
                {tier.best && (
                  <div
                    className="absolute top-4 right-4 text-white text-[11px] font-extrabold tracking-widest px-2.5 py-1 rounded-full"
                    style={{ background: "linear-gradient(135deg,#6366F1,#4338CA)" }}
                  >
                    BEST
                  </div>
                )}
                <div className="px-5 pt-5 pb-8" style={{ background: tier.grad }}>
                  <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest mb-0.5">{tier.sub}</p>
                  <p className="text-white text-[20px] font-extrabold">{tier.name}</p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-white text-[31px] font-extrabold">{tier.price}</span>
                    <span className="text-white/70 text-[15px] font-semibold">{tier.unit}</span>
                  </div>
                  <p className="text-white/40 text-[11px] mt-0.5">VAT 별도</p>
                  <div className="mt-3 flex items-center gap-1.5 bg-white/15 rounded-lg px-2.5 py-1.5 w-fit">
                    <svg className="w-3 h-3 text-white/70 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-white text-[12px] font-bold">{tier.duration} 소요</span>
                  </div>
                </div>
                <div className="px-4 py-4 border-b border-brand-border">
                  <p className="text-[10px] font-extrabold text-brand-muted uppercase tracking-widest mb-2">추천 대상</p>
                  <ul className="space-y-1.5">
                    {tier.targets.map((t, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check color={tier.checkColor} />
                        <span className="text-[12px] text-brand-sub leading-snug">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-4 py-4 flex-1">
                  <p className="text-[10px] font-extrabold text-brand-muted uppercase tracking-widest mb-2">구성</p>
                  <ul className="space-y-2">
                    {tier.sections.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-[4px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: tier.grad.includes("#") ? tier.grad.split(",")[1]?.trim().split(")")[0] ?? "#6366F1" : "#6366F1" }} />
                        <div>
                          <p className="text-[12px] font-bold text-brand-dark leading-snug">{s.label}</p>
                          {s.detail && <p className="text-[11px] text-brand-muted mt-0.5">{s.detail}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-4 pb-4 pt-2">
                  <button
                    className="w-full py-2.5 rounded-xl text-[15px] font-bold text-white hover:opacity-85 transition-opacity"
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
          <p className="text-[12px] font-extrabold text-indigo-500 uppercase tracking-widest mb-2">FAQ</p>
          <h2 className="text-[25px] font-extrabold text-brand-dark mb-6">자주 묻는 질문</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-brand-border overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-brand-lighter transition-colors"
                >
                  <span className="text-[15px] font-bold text-brand-dark">{faq.q}</span>
                  <svg
                    className={`w-4 h-4 text-brand-muted shrink-0 ml-3 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 border-t border-brand-border bg-brand-lighter">
                    <p className="text-[15px] text-brand-sub leading-relaxed pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── 하단 CTA 배너 ──────────────────── */}
        <section
          className="rounded-2xl px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ background: "linear-gradient(135deg,#6366F1,#4338CA)" }}
        >
          <div>
            <p className="text-[12px] font-extrabold text-indigo-200/60 uppercase tracking-widest mb-1">무료 상담</p>
            <p className="text-[22px] font-extrabold text-white leading-tight">어떤 플랜이 맞는지<br />모르겠다면 먼저 물어보세요</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button className="px-6 py-3 rounded-xl text-[15px] font-extrabold bg-white text-indigo-700 hover:bg-indigo-50 transition-colors">
              무료 상담 신청
            </button>
            <button className="px-6 py-3 rounded-xl text-[15px] font-bold bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors">
              카카오로 문의
            </button>
          </div>
        </section>

        {/* 안내 */}
        <div className="flex items-start gap-3 px-1 pb-8">
          <svg className="w-4 h-4 text-brand-muted shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-[12px] text-brand-muted leading-relaxed">
            소요기간은 영업일 기준이 아니며, 브랜드 환경 및 피드백 속도에 따라 달라질 수 있습니다. 가격은 VAT 별도이며, 세부 범위에 따라 변동될 수 있습니다.
          </p>
        </div>

      </div>

      {/* 오른쪽 고정 패널 자리 확보용 */}
      <div ref={railRef} className="hidden lg:block w-64 xl:w-72 shrink-0" />

    </div>
  );
}
