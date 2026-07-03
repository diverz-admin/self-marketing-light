"use client";

import { useState } from "react";
import Link from "next/link";
import { useRailLeft } from "@/components/marketing/useRailLeft";

/* ── Before/After 페어 데이터 ─────────────────── */
const BA_PAIRS = [
  { kw: "ramen",   lock: 12, beforeBg: "#2a1a0a", afterBg: "#0d0d12", label: "라멘" },
  { kw: "bulgogi", lock: 5,  beforeBg: "#1a0a08", afterBg: "#0a0a0f", label: "불고기" },
  { kw: "seafood", lock: 23, beforeBg: "#0e1a10", afterBg: "#080c10", label: "해산물" },
  { kw: "dessert", lock: 8,  beforeBg: "#1a100a", afterBg: "#f0ece8", label: "디저트" },
  { kw: "bento",   lock: 17, beforeBg: "#141a14", afterBg: "#f8f8f6", label: "도시락" },
  { kw: "coffee",  lock: 31, beforeBg: "#100c08", afterBg: "#1a1208", label: "음료" },
];

/* ── BA 카드 컴포넌트 ─────────────────────────── */
function BAPair({ pair }: { pair: typeof BA_PAIRS[0] }) {
  const src = `https://loremflickr.com/320/320/${pair.kw}?lock=${pair.lock}`;
  return (
    <div className="flex gap-1.5 shrink-0">
      {/* BEFORE — 보정 전(어둡고 탁한 사진) */}
      <div className="relative w-[160px] h-[160px] rounded-2xl overflow-hidden"
        style={{ background: pair.beforeBg, border: "1px solid rgba(255,255,255,0.06)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={`${pair.label} before`} loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "saturate(0.5) brightness(0.62) contrast(0.9)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg,rgba(0,0,0,0.25),rgba(0,0,0,0.35))" }} />
        <span className="absolute bottom-2 left-2 text-[11px] font-extrabold text-white/80 bg-black/50 px-2 py-0.5 rounded-md tracking-wide">BEFORE</span>
      </div>
      {/* AFTER — 보정 후(선명한 프로 사진) */}
      <div className="relative w-[160px] h-[160px] rounded-2xl overflow-hidden ring-2 ring-[#EC4899]"
        style={{ background: pair.afterBg }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={`${pair.label} after`} loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "saturate(1.12) brightness(1.05) contrast(1.05)" }} />
        {/* 조명 효과 */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 35% 30%, rgba(255,255,255,0.12), transparent 55%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg,transparent 55%,rgba(0,0,0,0.30) 100%)" }} />
        <span className="absolute bottom-2 right-2 text-[11px] font-extrabold text-white bg-[#EC4899] px-2 py-0.5 rounded-md tracking-wide">AFTER</span>
        <span className="absolute top-2 left-2 text-[10px] font-bold text-white bg-black/40 px-1.5 py-0.5 rounded">{pair.label}</span>
      </div>
    </div>
  );
}

/* ── 특장점 ──────────────────────────────────── */
const FEATURES = [
  {
    icon: "🎨",
    title: "전문 편집·보정",
    desc: "포토그래퍼와 리터처가 색감, 조명, 그림자까지 세밀하게 보정합니다.",
  },
  {
    icon: "⚡",
    title: "빠른 납품",
    desc: "촬영 후 평균 2~3 영업일 내 고해상도 파일로 납품합니다.",
  },
  {
    icon: "🛍️",
    title: "플랫폼 최적화",
    desc: "스마트스토어·쿠팡·배민·인스타 등 플랫폼별 최적 규격으로 출력합니다.",
  },
  {
    icon: "🔄",
    title: "무제한 수정",
    desc: "납품 후 색감·구도 수정을 패키지 내 횟수 제한 없이 지원합니다.",
  },
  {
    icon: "💡",
    title: "컨설팅 포함",
    desc: "어떤 컷이 필요한지 모르셔도 괜찮습니다. 업종별 최적 구성을 제안합니다.",
  },
];

/* ── 서비스 패키지 ───────────────────────────── */
const PACKAGES = [
  {
    name: "베이직",
    desc: "처음 시작하는 사장님께 추천",
    items: ["대표 메뉴 3종 촬영", "컷당 3장 납품", "기본 보정 포함", "1:1 / 4:3 규격"],
    accent: "#6366F1",
    popular: false,
  },
  {
    name: "스탠다드",
    desc: "스마트스토어·배달앱 운영자",
    items: ["메뉴 10종 촬영", "컷당 5장 납품", "고급 색감 보정", "전 플랫폼 규격 포함", "SNS용 세로 컷 추가"],
    accent: "#EC4899",
    popular: true,
  },
  {
    name: "프리미엄",
    desc: "브랜드 이미지를 높이고 싶은 경우",
    items: ["메뉴 전체 촬영", "컷당 10장 납품", "시네마틱 보정", "영상 클립 1개 포함", "월 1회 정기 업데이트"],
    accent: "#8B5CF6",
    popular: false,
  },
];

/* ── 프로세스 ───────────────────────────────── */
const PROCESS = [
  { step: "01", title: "문의 & 상담", desc: "업종, 메뉴 수, 원하는 분위기를 상담합니다. 맞춤 패키지를 추천해 드립니다." },
  { step: "02", title: "일정 조율 & 방문 촬영", desc: "매장 또는 스튜디오에서 전문 포토그래퍼가 직접 촬영합니다." },
  { step: "03", title: "편집 & 보정", desc: "전문 리터처가 색감·조명·그림자를 세밀하게 보정합니다." },
  { step: "04", title: "시안 검토", desc: "보정된 시안을 공유하고 고객 피드백을 반영합니다." },
  { step: "05", title: "최종 납품", desc: "플랫폼별 최적 규격으로 고해상도 PNG/JPG 파일을 납품합니다." },
];

/* ── FAQ ────────────────────────────────────── */
const FAQS = [
  {
    q: "매장이 없어도 촬영이 가능한가요?",
    a: "스튜디오 촬영도 가능합니다. 제품이나 음식을 스튜디오로 가져오시면 전문 세팅 환경에서 촬영합니다.",
  },
  {
    q: "촬영 당일 몇 시간이 걸리나요?",
    a: "메뉴 수에 따라 다르지만, 베이직 기준 1~2시간, 스탠다드 2~4시간, 프리미엄은 하루 일정으로 진행됩니다.",
  },
  {
    q: "편집·납품은 얼마나 걸리나요?",
    a: "촬영 완료 후 평균 2~3 영업일 내 시안을 공유하고, 수정 반영 후 최종 납품까지 약 5 영업일이 소요됩니다.",
  },
  {
    q: "납품 파일 형식은 어떻게 되나요?",
    a: "고해상도 PNG 및 JPG 파일로 납품합니다. 플랫폼별 규격(스마트스토어 1:1, 쿠팡 3:4 등)으로 각각 리사이징하여 제공합니다.",
  },
];

export default function ImagePage() {
  const { railRef, railLeft } = useRailLeft();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="w-full flex gap-6 items-start">

      {/* ── 오른쪽 고정 CTA 패널 ────── */}
      <div className="hidden lg:block fixed z-30 w-64 xl:w-72" style={{ top: 92, left: railLeft, visibility: railLeft == null ? "hidden" : "visible" }}>
        <div className="rounded-2xl overflow-hidden shadow-xl" style={{ border: "1px solid rgba(236,72,153,0.2)" }}>
          <div className="px-5 pt-6 pb-6" style={{ background: "linear-gradient(145deg,#0f0a1e,#1e1040)" }}>
            <p className="text-[11px] font-extrabold text-pink-400/60 uppercase tracking-widest mb-2">고퀄리티 이미지 제작</p>
            <p className="text-[19px] font-extrabold text-white leading-tight mb-1">전문가가 직접 찍고</p>
            <p className="text-[19px] font-extrabold text-white leading-tight mb-5">보정까지 완성</p>
            <p className="text-[12px] leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.45)" }}>
              스마트폰 사진과 비교되는<br />
              진짜 프로 촬영 이미지로<br />
              매장·상품을 새롭게 바꿔드립니다.
            </p>
            <div className="space-y-2 mb-5">
              {["📸 전문 포토그래퍼 직접 촬영", "🎨 고급 보정 포함", "⚡ 2~3일 내 납품", "🛍️ 플랫폼별 규격 최적화"].map((t) => (
                <div key={t} className="flex items-center gap-2 text-[12px]" style={{ color: "rgba(255,255,255,0.75)" }}>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white px-4 py-5 space-y-2.5">
            <button
              onClick={() => alert("문의하기 연결 예정")}
              className="w-full py-3 rounded-xl text-[15px] font-extrabold text-white transition-opacity hover:opacity-85"
              style={{ background: "linear-gradient(135deg,#EC4899,#8B5CF6)" }}
            >
              문의하기
            </button>
            <button
              onClick={() => alert("카카오 문의 연결 예정")}
              className="w-full py-3 rounded-xl text-[15px] font-bold text-brand-sub bg-brand-lighter hover:bg-brand-border transition-colors border border-brand-border"
            >
              카카오로 문의하기
            </button>
          </div>
        </div>
      </div>

      {/* ── 메인 콘텐츠 ────────────────────── */}
      <div className="flex-1 min-w-0 space-y-0">

        {/* 브레드크럼 */}
        <nav className="flex items-center gap-1.5 text-[15px] text-brand-sub mb-6 px-1">
          <Link href="/marketing" className="hover:text-brand-text">대시보드</Link>
          <span>›</span>
          <span className="text-brand-muted">콘텐츠</span>
          <span>›</span>
          <span className="text-brand-text font-medium">고퀄리티 이미지 제작</span>
        </nav>

        {/* ── HERO ──────────────────────────── */}
        <section className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(160deg,#080c18 0%,#0f1628 60%,#0a0e1e 100%)" }}>
          <div className="px-8 pt-10 pb-4">
            <p className="text-[12px] font-extrabold uppercase tracking-[0.2em] mb-3" style={{ color: "#EC4899" }}>Professional Photography</p>
            <h1 className="text-[34px] font-extrabold text-white leading-tight mb-3">
              30초만 투자해서<br />
              <span style={{ background: "linear-gradient(90deg,#EC4899,#8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                매장을 리뉴얼해보세요
              </span>
            </h1>
            <p className="text-[16px] leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.55)" }}>
              전문 포토그래퍼가 직접 방문해 촬영하고, 고급 보정까지 완성합니다.<br />
              스마트폰 사진과 확연히 다른 결과물을 경험해 보세요.
            </p>
          </div>

          {/* Before/After 갤러리 */}
          <div className="px-6 pb-8">
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {BA_PAIRS.map((pair, i) => (
                <BAPair key={i} pair={pair} />
              ))}
            </div>
          </div>
        </section>

        {/* ── 숫자 강조 ──────────────────────── */}
        <section className="rounded-2xl bg-white border border-brand-border py-6 px-8">
          <div className="grid grid-cols-4 gap-4 divide-x divide-brand-border">
            {[
              { num: "2~3일", label: "평균 납품 기간" },
              { num: "500+", label: "누적 제작 건수" },
              { num: "98%", label: "고객 재의뢰율" },
              { num: "전 플랫폼", label: "최적화 규격 제공" },
            ].map((s) => (
              <div key={s.label} className="text-center px-2">
                <p className="text-[25px] font-extrabold leading-tight"
                  style={{ background: "linear-gradient(135deg,#EC4899,#8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {s.num}
                </p>
                <p className="text-[12px] text-brand-sub mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 특장점 그리드 ──────────────────── */}
        <section className="rounded-2xl bg-white border border-brand-border px-8 py-10">
          <p className="text-[12px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "#EC4899" }}>Why us</p>
          <h2 className="text-[25px] font-extrabold text-brand-dark mb-6">왜 다를까요</h2>
          <div className="grid grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl p-5 border border-brand-border hover:border-pink-200 transition-colors"
                style={{ background: "#FAFBFF" }}>
                <span className="text-[27px] mb-3 block">{f.icon}</span>
                <p className="text-[16px] font-extrabold text-brand-dark mb-1">{f.title}</p>
                <p className="text-[13px] text-brand-sub leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 패키지 ─────────────────────────── */}
        <section className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(160deg,#080c18 0%,#0f1628 100%)" }}>
          <div className="px-8 py-10">
            <p className="text-[12px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "#EC4899" }}>Packages</p>
            <h2 className="text-[25px] font-extrabold text-white mb-8">패키지 안내</h2>
            <div className="grid grid-cols-3 gap-4">
              {PACKAGES.map((pkg) => (
                <div key={pkg.name} className={`rounded-2xl p-5 relative ${pkg.popular ? "ring-2 ring-[#EC4899]" : ""}`}
                  style={{ background: "rgba(255,255,255,0.05)", border: pkg.popular ? undefined : "1px solid rgba(255,255,255,0.08)" }}>
                  {pkg.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-extrabold text-white px-3 py-1 rounded-full"
                      style={{ background: "linear-gradient(135deg,#EC4899,#8B5CF6)" }}>
                      인기
                    </span>
                  )}
                  <div className="h-1.5 w-8 rounded-full mb-4" style={{ background: pkg.accent }} />
                  <p className="text-[18px] font-extrabold text-white mb-1">{pkg.name}</p>
                  <p className="text-[12px] mb-4" style={{ color: "rgba(255,255,255,0.45)" }}>{pkg.desc}</p>
                  <ul className="space-y-2 mb-5">
                    {pkg.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke={pkg.accent} strokeWidth={2.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.75)" }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => alert("문의하기 연결 예정")}
                    className="w-full py-2.5 rounded-xl text-[13px] font-extrabold transition-opacity hover:opacity-85"
                    style={pkg.popular
                      ? { background: "linear-gradient(135deg,#EC4899,#8B5CF6)", color: "white" }
                      : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.12)" }
                    }
                  >
                    문의하기
                  </button>
                </div>
              ))}
            </div>
            <p className="text-center text-[12px] mt-5" style={{ color: "rgba(255,255,255,0.3)" }}>
              패키지 외 맞춤 견적도 가능합니다 · 문의하기를 통해 상담해 주세요
            </p>
          </div>
        </section>

        {/* ── 프로세스 ────────────────────────── */}
        <section className="rounded-2xl bg-white border border-brand-border px-8 py-10">
          <p className="text-[12px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "#EC4899" }}>Process</p>
          <h2 className="text-[25px] font-extrabold text-brand-dark mb-8">진행 프로세스</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PROCESS.map((p, i) => (
              <div key={p.step} className="relative rounded-2xl p-5 flex flex-col bg-brand-lighter border border-brand-border">
                {/* 단계 연결 화살표 (데스크톱) */}
                {i < PROCESS.length - 1 && (
                  <svg className="hidden lg:block absolute top-9 -right-3 w-5 h-5 text-brand-muted z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
                <div className="h-10 w-10 rounded-xl flex items-center justify-center text-[15px] font-extrabold text-white mb-4 shrink-0"
                  style={{ background: "linear-gradient(135deg,#EC4899,#8B5CF6)", boxShadow: "0 6px 16px rgba(236,72,153,0.30)" }}>
                  {p.step}
                </div>
                <p className="text-[15px] font-bold text-brand-dark mb-1.5 leading-snug">{p.title}</p>
                <p className="text-[13px] text-brand-sub leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ────────────────────────────── */}
        <section className="rounded-2xl bg-white border border-brand-border px-8 py-10">
          <p className="text-[12px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "#EC4899" }}>FAQ</p>
          <h2 className="text-[25px] font-extrabold text-brand-dark mb-6">자주 묻는 질문</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-brand-border overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-brand-lighter transition-colors"
                >
                  <span className="text-[15px] font-bold text-brand-dark">{faq.q}</span>
                  <svg className={`w-4 h-4 text-brand-muted shrink-0 ml-3 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
        <section className="rounded-2xl px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ background: "linear-gradient(135deg,#0f0a1e,#1e1040)" }}>
          <div>
            <p className="text-[12px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "#EC4899" }}>문의하기</p>
            <p className="text-[22px] font-extrabold text-white leading-tight">
              지금 바로 무료 상담을<br />
              <span style={{ color: "rgba(255,255,255,0.6)" }}>받아보세요</span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => alert("문의하기 연결 예정")}
              className="px-6 py-3 rounded-xl text-[15px] font-extrabold text-white transition-opacity hover:opacity-85"
              style={{ background: "linear-gradient(135deg,#EC4899,#8B5CF6)" }}
            >
              문의하기
            </button>
            <button
              onClick={() => alert("카카오 문의 연결 예정")}
              className="px-6 py-3 rounded-xl text-[15px] font-bold text-white/80 border border-white/15 hover:bg-white/10 transition-colors"
            >
              카카오로 문의
            </button>
          </div>
        </section>

        <div className="h-8" />
      </div>

      {/* 오른쪽 고정 패널 자리 확보 */}
      <div ref={railRef} className="hidden lg:block w-64 xl:w-72 shrink-0" />
    </div>
  );
}
