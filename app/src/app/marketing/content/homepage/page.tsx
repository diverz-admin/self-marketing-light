"use client";

import { useState } from "react";
import Link from "next/link";

/* ── 브라우저/홈페이지 목업 ──────────────────── */
function HomepageMockup() {
  return (
    <div className="relative w-[300px] h-[340px] shrink-0 select-none">

      {/* 브라우저 창 */}
      <div
        className="absolute left-0 top-0 w-[260px] rounded-2xl overflow-hidden shadow-2xl"
        style={{ border: "1.5px solid rgba(255,255,255,0.18)", background: "#0F172A" }}
      >
        {/* 탭 바 */}
        <div className="flex items-center gap-2 px-3 py-2" style={{ background: "#1E293B" }}>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#EF4444" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#F59E0B" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#10B981" }} />
          </div>
          <div className="flex-1 mx-2 h-5 rounded-md flex items-center px-2.5 gap-1.5" style={{ background: "#0F172A" }}>
            <svg className="w-2.5 h-2.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={2}>
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l2 2"/>
            </svg>
            <div className="h-1.5 rounded-full flex-1" style={{ background: "rgba(255,255,255,0.15)" }} />
          </div>
        </div>

        {/* 히어로 영역 */}
        <div className="px-4 pt-3 pb-3" style={{ background: "linear-gradient(160deg,#1E3A6E 0%,#1D4ED8 100%)" }}>
          <div className="h-1.5 w-14 rounded-full mb-2" style={{ background: "rgba(147,197,253,0.6)" }} />
          <div className="h-4 w-32 rounded-lg mb-1.5" style={{ background: "rgba(255,255,255,0.92)" }} />
          <div className="h-2.5 w-24 rounded-lg mb-3" style={{ background: "rgba(255,255,255,0.5)" }} />
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-lg" style={{ background: "#38BDF8" }} />
            <div className="h-6 w-16 rounded-lg" style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)" }} />
          </div>
        </div>

        {/* 서비스 카드 */}
        <div className="px-3 py-3 grid grid-cols-3 gap-2" style={{ background: "#0F172A" }}>
          {[
            { color: "#38BDF8", label: "기획" },
            { color: "#818CF8", label: "디자인" },
            { color: "#34D399", label: "SEO" },
          ].map((c) => (
            <div key={c.label} className="rounded-xl p-2.5 flex flex-col gap-1.5" style={{ background: `${c.color}20`, border: `1px solid ${c.color}35` }}>
              <div className="h-4 w-4 rounded-lg shrink-0" style={{ background: c.color }} />
              <div className="h-1.5 w-full rounded-full" style={{ background: `${c.color}80` }} />
              <div className="text-[7px] font-bold" style={{ color: c.color }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* 텍스트 블록 */}
        <div className="px-3 pb-3 space-y-1.5" style={{ background: "#0F172A" }}>
          <div className="h-1.5 w-full rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
          <div className="h-1.5 w-4/5 rounded-full" style={{ background: "rgba(255,255,255,0.10)" }} />
          <div className="h-1.5 w-3/5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
        </div>
      </div>

      {/* 모바일 미리보기 */}
      <div
        className="absolute right-0 bottom-0 w-[92px] h-[158px] rounded-[22px] overflow-hidden shadow-2xl"
        style={{ border: "2px solid rgba(255,255,255,0.25)", background: "#0F172A" }}
      >
        {/* 노치 */}
        <div className="h-4 flex items-center justify-center" style={{ background: "#1E293B" }}>
          <div className="w-8 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.25)" }} />
        </div>
        {/* 히어로 */}
        <div className="px-2 py-2" style={{ background: "linear-gradient(160deg,#1E3A6E,#1D4ED8)" }}>
          <div className="h-2 w-full rounded-full mb-1" style={{ background: "rgba(255,255,255,0.85)" }} />
          <div className="h-1.5 w-3/4 rounded-full mb-2" style={{ background: "rgba(255,255,255,0.45)" }} />
          <div className="h-4 w-full rounded-lg" style={{ background: "#38BDF8" }} />
        </div>
        {/* 콘텐츠 */}
        <div className="px-2 py-2 space-y-1.5" style={{ background: "#0F172A" }}>
          <div className="h-1.5 w-full rounded-full" style={{ background: "rgba(255,255,255,0.18)" }} />
          <div className="h-1.5 w-4/5 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
          <div className="h-1.5 w-3/5 rounded-full" style={{ background: "rgba(255,255,255,0.09)" }} />
        </div>
      </div>

      {/* SEO 배지 — 브라우저 창 안쪽에 붙임 */}
      <div
        className="absolute top-[68px] left-[196px] text-white text-[10px] font-extrabold px-2.5 py-1.5 rounded-xl shadow-lg"
        style={{ background: "#0EA5E9" }}
      >
        SEO 최적화
      </div>
      {/* 모바일 최적화 배지 */}
      <div
        className="absolute bottom-[140px] left-[-2px] text-white text-[10px] font-extrabold px-2.5 py-1.5 rounded-xl shadow-lg"
        style={{ background: "#10B981" }}
      >
        모바일 최적화
      </div>
    </div>
  );
}

/* ── 특장점 섹션 데이터 ──────────────────────── */
const FEATURES = [
  {
    no: "01",
    title: "인터뷰부터 검색등록까지\n원스톱 제작",
    desc: "따로 기획사, 디자이너, 개발사를 찾을 필요 없습니다. 인터뷰 → 기획 → 디자인 → 검색등록까지 하나의 팀이 끝까지 담당합니다.",
    points: ["온라인/방문 인터뷰 기반 기획", "반응형 디자인 (PC·모바일 동시)", "네이버·구글 검색 등록", "납품 후 수정 기간 제공"],
    visual: (
      <div className="w-full max-w-[280px] space-y-2">
        {[
          { step: "01", label: "인터뷰 & 기획", done: true, color: "#0EA5E9" },
          { step: "02", label: "디자인 시안", done: true, color: "#0EA5E9" },
          { step: "03", label: "피드백 & 수정", done: true, color: "#0EA5E9" },
          { step: "04", label: "검색 등록", done: false, color: "#0EA5E9" },
          { step: "05", label: "납품 완료", done: false, color: "#0EA5E9" },
        ].map((item, i, arr) => (
          <div key={item.step} className="flex items-center gap-3">
            <div className="flex flex-col items-center shrink-0">
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-extrabold"
                style={{ background: item.done ? item.color : "#E5E8EB", color: item.done ? "white" : "#6B7684" }}
              >
                {item.done ? "✓" : item.step}
              </div>
              {i < arr.length - 1 && (
                <div className="w-px h-3 mt-0.5" style={{ background: item.done ? `${item.color}60` : "#E5E8EB" }} />
              )}
            </div>
            <div
              className="flex-1 rounded-xl px-3 py-2"
              style={{ background: item.done ? `${item.color}10` : "#F9FAFB", border: `1px solid ${item.done ? `${item.color}30` : "#E5E8EB"}` }}
            >
              <span className="text-[12px] font-bold" style={{ color: item.done ? item.color : "#6B7684" }}>{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    ),
    bg: "white",
    accent: "#0EA5E9",
  },
  {
    no: "02",
    title: "모바일 최적화 &\n빠른 로딩 속도",
    desc: "방문자의 70% 이상이 모바일로 접속합니다. 모든 플랜에 반응형 디자인이 기본 포함되며, 페이지 속도 최적화까지 진행합니다.",
    points: ["PC·태블릿·모바일 전 디바이스 대응", "이미지·코드 최적화로 빠른 로딩", "Core Web Vitals 기준 준수", "카카오톡 공유 미리보기 최적화"],
    visual: (
      <div className="w-full max-w-[280px] bg-white rounded-2xl border border-gray-100 shadow-md p-5">
        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-4">Page Speed Score</p>
        {[
          { label: "Performance", score: 96, color: "#10B981" },
          { label: "SEO", score: 100, color: "#0EA5E9" },
          { label: "Accessibility", score: 98, color: "#6366F1" },
          { label: "Best Practices", score: 95, color: "#F59E0B" },
        ].map((item) => (
          <div key={item.label} className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-gray-500">{item.label}</span>
              <span className="text-[11px] font-extrabold" style={{ color: item.color }}>{item.score}</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${item.score}%`, background: item.color }} />
            </div>
          </div>
        ))}
      </div>
    ),
    bg: "#F9FAFB",
    accent: "#0EA5E9",
  },
  {
    no: "03",
    title: "네이버·구글 SEO\n검색 노출 최적화",
    desc: "홈페이지를 만들어도 검색에 안 나오면 의미가 없습니다. 모든 플랜에 네이버·구글 검색 등록과 기본 SEO 세팅이 포함됩니다.",
    points: ["메타 태그·오픈그래프 최적화", "네이버 서치어드바이저 등록", "구글 서치콘솔 등록", "사이트맵·로봇 파일 세팅"],
    visual: (
      <div className="w-full max-w-[280px] space-y-2.5">
        {/* 구글 검색 결과 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-4">
          <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest mb-2">Google Search</p>
          <div className="space-y-2">
            {[
              { rank: 1, title: "내 홈페이지", url: "mysite.com", highlight: true },
              { rank: 2, title: "경쟁사 A", url: "competitor.com", highlight: false },
              { rank: 3, title: "경쟁사 B", url: "other.com", highlight: false },
            ].map((r) => (
              <div key={r.rank} className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold w-4 shrink-0" style={{ color: r.highlight ? "#10B981" : "#D1D5DB" }}>
                  {r.rank}
                </span>
                <div className={`flex-1 rounded-lg px-2.5 py-1.5 ${r.highlight ? "bg-sky-50 border border-sky-100" : "bg-gray-50"}`}>
                  <p className="text-[10px] font-bold" style={{ color: r.highlight ? "#0284C7" : "#9CA3AF" }}>{r.title}</p>
                  <p className="text-[8px]" style={{ color: r.highlight ? "#0EA5E9" : "#D1D5DB" }}>{r.url}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* 네이버 검색 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-4">
          <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest mb-2">Naver Search</p>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 border border-green-100">
            <span className="text-[12px] font-extrabold text-green-600">N</span>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-green-700">내 홈페이지 — 상단 노출</p>
              <p className="text-[8px] text-green-500">mysite.com</p>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-green-500 text-white">1위</span>
          </div>
        </div>
      </div>
    ),
    bg: "white",
    accent: "#0EA5E9",
  },
];

/* ── 프로세스 ───────────────────────────────── */
const PROCESS = [
  { step: "01", title: "상담 & 견적", desc: "홈페이지 목적, 분량, 예산을 파악하고 최적 플랜을 추천드립니다." },
  { step: "02", title: "인터뷰 & 기획", desc: "브랜드·서비스 인터뷰를 바탕으로 사이트맵과 와이어프레임을 설계합니다." },
  { step: "03", title: "디자인 시안 제작", desc: "메인페이지 시안을 제작하고 피드백을 반영해 완성도를 높입니다." },
  { step: "04", title: "전 페이지 디자인", desc: "확정된 메인 시안 기반으로 서브페이지까지 일관성 있게 완성합니다." },
  { step: "05", title: "검색 등록 & 납품", desc: "네이버·구글 검색 등록 후 최종 납품, 수정 기간을 제공합니다." },
];

/* ── FAQ ────────────────────────────────────── */
const FAQS = [
  {
    q: "디자인 수정은 몇 번까지 가능한가요?",
    a: "플랜마다 수정 횟수가 다릅니다. Standard는 2회, Deluxe는 3회, Premium은 4회 수정이 포함됩니다. 추가 수정은 별도 협의 가능합니다.",
  },
  {
    q: "제작 완료 후 직접 수정할 수 있나요?",
    a: "관리자 페이지가 있는 CMS 방식으로 납품 시 텍스트·이미지를 직접 수정할 수 있습니다. 원하시면 상담 시 말씀해 주세요.",
  },
  {
    q: "도메인·호스팅은 포함되나요?",
    a: "도메인과 호스팅은 별도 비용입니다. 가이드 제공 후 직접 구매하시거나 대행 진행도 가능합니다. 비용은 연 5–10만원 내외입니다.",
  },
  {
    q: "납품 파일 형식은 어떻게 되나요?",
    a: "Figma 디자인 소스 파일과 HTML/CSS 또는 워드프레스 등 협의한 방식으로 납품됩니다. 개발 방식은 상담 시 결정합니다.",
  },
];

/* ── 가격 플랜 ───────────────────────────────── */
const TIERS = [
  {
    id: "standard",
    name: "Standard",
    sub: "기본형",
    price: "99",
    unit: "만원",
    duration: "10 영업일",
    grad: "linear-gradient(135deg,#0EA5E9,#0284C7)",
    checkColor: "text-sky-500",
    best: false,
    targets: [
      "소규모 사업자 / 1인 브랜드",
      "빠른 온라인 존재감이 필요한 경우",
      "단순 제품·서비스 소개가 필요한 경우",
    ],
    specs: [
      { label: "분량", value: "웹페이지 랜딩 (1페이지)" },
      { label: "수정", value: "2회 (기획 1회, 디자인 1회)" },
    ],
    includes: ["온라인 인터뷰", "기획", "디자인", "모바일 최적화", "SEO 세팅", "네이버 / 구글 검색등록"],
    highlights: [],
  },
  {
    id: "deluxe",
    name: "Deluxe",
    sub: "비즈니스형",
    price: "199",
    unit: "만원",
    duration: "3주",
    grad: "linear-gradient(135deg,#3B82F6,#1D4ED8)",
    checkColor: "text-blue-500",
    best: false,
    targets: [
      "서비스업 / 전문직 / 스타트업",
      "다양한 서비스 메뉴를 소개해야 하는 경우",
      "온라인 신뢰도를 높이고 싶은 브랜드",
    ],
    specs: [
      { label: "분량", value: "메인페이지 1 + 서브페이지 5" },
      { label: "수정", value: "3회 (기획 1회, 디자인 2회)" },
    ],
    includes: ["온라인 인터뷰", "기획", "디자인", "모바일 최적화", "SEO 세팅", "네이버 / 구글 검색등록"],
    highlights: [],
  },
  {
    id: "premium",
    name: "Premium",
    sub: "풀 브랜딩형",
    price: "399",
    unit: "만원",
    duration: "5주–6주",
    grad: "linear-gradient(135deg,#6366F1,#4338CA)",
    checkColor: "text-indigo-500",
    best: true,
    targets: [
      "브랜드 아이덴티티가 중요한 기업",
      "투자 유치 · 유통 입점을 준비 중인 브랜드",
      "온라인에서 강한 첫인상이 필요한 경우",
    ],
    specs: [
      { label: "분량", value: "메인페이지 1 + 서브페이지 7" },
      { label: "수정", value: "4회 (기획 2회, 디자인 2회)" },
    ],
    includes: ["방문 인터뷰", "기본 브랜딩", "기획", "디자인", "모바일 최적화", "SEO 세팅", "네이버 / 구글 검색등록"],
    highlights: ["방문 인터뷰", "기본 브랜딩"],
  },
];

function Check({ color }: { color: string }) {
  return (
    <svg className={`w-3.5 h-3.5 shrink-0 mt-[1px] ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

export default function HomepagePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="w-full flex gap-6 items-start">

      {/* ── 메인 콘텐츠 ────────────────────── */}
      <div className="flex-1 min-w-0 space-y-0">

        {/* ── 오른쪽 고정 CTA 패널 ────── */}
        <div
          className="hidden lg:block fixed z-30 w-64 xl:w-72 right-8"
          style={{ top: "92px" }}
        >
          <div className="rounded-2xl overflow-hidden shadow-xl border border-sky-100">
            <div className="px-5 pt-6 pb-6" style={{ background: "linear-gradient(135deg,#0EA5E9,#0284C7)" }}>
              <p className="text-[10px] font-extrabold text-white/50 uppercase tracking-widest mb-2">Homepage</p>
              <p className="text-[17px] font-extrabold text-white leading-tight mb-1">인터뷰부터</p>
              <p className="text-[17px] font-extrabold text-white leading-tight mb-5">검색등록까지</p>
              <p className="text-[11px] text-white/50 leading-relaxed mb-5">
                기획·디자인·모바일 최적화<br />SEO·검색 등록까지<br />원스톱으로 진행합니다.
              </p>
              <div className="space-y-2">
                {[
                  { label: "Standard", price: "99만원~", sub: "10 영업일" },
                  { label: "Deluxe", price: "199만원~", sub: "약 3주" },
                  { label: "Premium", price: "399만원~", sub: "5–6주" },
                ].map((t) => (
                  <div key={t.label} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/10">
                    <div>
                      <span className="text-[12px] font-bold text-white block leading-tight">{t.label}</span>
                      <span className="text-[10px] text-white/40">{t.sub}</span>
                    </div>
                    <span className="text-[12px] font-extrabold text-sky-200">{t.price}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white px-4 py-5 space-y-2.5">
              <button
                className="w-full py-3 rounded-xl text-[13px] font-extrabold text-white transition-opacity hover:opacity-85"
                style={{ background: "linear-gradient(135deg,#0EA5E9,#0284C7)" }}
              >
                무료 홈페이지 상담 신청
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
          <span className="text-brand-text font-medium">홈페이지</span>
        </nav>

        {/* ── HERO ──────────────────────────── */}
        <section className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(160deg,#050D1F 0%,#0C2150 60%,#0E3A7A 100%)" }}>
          <div className="px-8 py-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-extrabold text-sky-300 uppercase tracking-[0.2em] mb-3">Homepage</p>
              <h1 className="text-[30px] font-extrabold text-white leading-tight mb-4">
                홈페이지 하나로<br />
                신뢰를 만드세요
              </h1>
              <p className="text-[14px] text-white/75 leading-relaxed mb-6">
                인터뷰 · 기획 · 디자인 · SEO까지<br />
                비즈니스에 맞는 홈페이지를 제작합니다.
              </p>
              <div className="flex flex-wrap gap-2">
                {["반응형 디자인", "SEO 최적화", "검색 등록", "모바일 최적화"].map((t) => (
                  <span key={t} className="text-[11px] font-bold px-3 py-1.5 rounded-lg text-white" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <HomepageMockup />
          </div>
        </section>

        {/* ── 숫자 강조 ──────────────────────── */}
        <section className="rounded-2xl bg-white border border-brand-border py-6 px-8">
          <div className="grid grid-cols-3 gap-6 divide-x divide-brand-border">
            {[
              { num: "500+", label: "누적 홈페이지 제작" },
              { num: "97%", label: "재의뢰 & 추천율" },
              { num: "10일", label: "최단 납품 기간" },
            ].map((s) => (
              <div key={s.label} className="text-center px-2">
                <p className="text-[28px] font-extrabold text-sky-500 leading-tight">{s.num}</p>
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
        <section className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(160deg,#050D1F 0%,#0C2150 100%)" }}>
          <div className="px-8 py-10">
            <p className="text-[11px] font-extrabold text-sky-400/60 uppercase tracking-widest mb-2">Process</p>
            <h2 className="text-[22px] font-extrabold text-white mb-8">5단계 제작 프로세스</h2>
            <div className="space-y-0">
              {PROCESS.map((p, i) => (
                <div key={p.step} className="flex gap-4">
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white shrink-0"
                      style={{ background: "linear-gradient(135deg,#0EA5E9,#0284C7)" }}
                    >
                      {p.step}
                    </div>
                    {i < PROCESS.length - 1 && (
                      <div className="w-px flex-1 my-1" style={{ background: "rgba(14,165,233,0.3)" }} />
                    )}
                  </div>
                  <div className={`pb-6 ${i === PROCESS.length - 1 ? "pb-0" : ""}`}>
                    <p className="text-[14px] font-bold text-white mb-1">{p.title}</p>
                    <p className="text-[12px] text-sky-200/50 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 가격 플랜 ───────────────────────── */}
        <section className="rounded-2xl bg-brand-lighter border border-brand-border px-8 py-10">
          <p className="text-[11px] font-extrabold text-sky-500 uppercase tracking-widest mb-2">Pricing</p>
          <h2 className="text-[22px] font-extrabold text-brand-dark mb-2">플랜 선택</h2>
          <p className="text-[13px] text-brand-sub mb-8">사이트 규모와 목적에 맞는 플랜을 선택하세요.</p>

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
                    className="absolute top-4 right-4 text-white text-[10px] font-extrabold tracking-widest px-2.5 py-1 rounded-full"
                    style={{ background: "linear-gradient(135deg,#6366F1,#4338CA)" }}
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
                        <span className="text-[10px] font-bold text-brand-muted w-8 shrink-0 pt-[1px]">{s.label}</span>
                        <span className="text-[11px] text-brand-dark leading-snug">{s.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-4 py-4 flex-1">
                  <p className="text-[9px] font-extrabold text-brand-muted uppercase tracking-widest mb-2">포함 구성</p>
                  <ul className="space-y-1.5">
                    {tier.includes.map((inc, i) => {
                      const isHighlight = tier.highlights.includes(inc);
                      return (
                        <li key={i} className="flex items-center gap-1.5">
                          <Check color={tier.checkColor} />
                          <span className={`text-[11px] leading-snug ${isHighlight ? "font-bold text-brand-dark" : "text-brand-sub"}`}>
                            {inc}
                          </span>
                          {isHighlight && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 shrink-0">추가</span>
                          )}
                        </li>
                      );
                    })}
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
          <p className="text-[11px] font-extrabold text-sky-500 uppercase tracking-widest mb-2">FAQ</p>
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
          style={{ background: "linear-gradient(135deg,#0EA5E9,#0284C7)" }}
        >
          <div>
            <p className="text-[11px] font-extrabold text-sky-100/50 uppercase tracking-widest mb-1">무료 상담</p>
            <p className="text-[20px] font-extrabold text-white leading-tight">어떤 플랜이 맞는지<br />모르겠다면 먼저 물어보세요</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button className="px-6 py-3 rounded-xl text-[13px] font-extrabold bg-white text-sky-700 hover:bg-sky-50 transition-colors">
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
            작업기간은 피드백 속도 및 수정 횟수에 따라 달라질 수 있습니다. 가격은 VAT 별도이며, 세부 범위에 따라 변동될 수 있습니다.
          </p>
        </div>

      </div>

      {/* 오른쪽 고정 패널 자리 확보용 */}
      <div className="hidden lg:block w-64 xl:w-72 shrink-0" />

    </div>
  );
}
