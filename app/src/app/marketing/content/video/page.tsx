"use client";

import { useState } from "react";
import Link from "next/link";

/* ── 영상 편집기 목업 ────────────────────────── */
function VideoMockup() {
  return (
    <div className="relative w-[300px] h-[340px] shrink-0 select-none">

      {/* 메인 영상 플레이어 */}
      <div
        className="absolute left-0 top-0 w-[260px] rounded-2xl overflow-hidden shadow-2xl"
        style={{ border: "1.5px solid rgba(255,255,255,0.18)", background: "#0D0A00" }}
      >
        {/* 상단 바 */}
        <div className="flex items-center justify-between px-3 py-2" style={{ background: "#1A1400" }}>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#EF4444" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#F59E0B" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#10B981" }} />
          </div>
          <span className="text-[7px] font-bold" style={{ color: "rgba(255,165,0,0.5)" }}>PREMIERE PRO</span>
          <div className="w-4 h-4" />
        </div>

        {/* 프리뷰 영역 */}
        <div className="relative h-[110px] flex items-center justify-center" style={{ background: "linear-gradient(160deg,#3D1A00 0%,#7C2D00 50%,#EA580C 100%)" }}>
          {/* 영상 그리드 오버레이 */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.3) 1px,transparent 1px)", backgroundSize: "20px 20px" }} />
          {/* 재생 버튼 */}
          <div className="relative z-10 h-10 w-10 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)", border: "1.5px solid rgba(255,255,255,0.3)" }}>
            <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          {/* 4K 배지 */}
          <div className="absolute top-2 right-2 text-[7px] font-extrabold px-1.5 py-0.5 rounded-md text-white" style={{ background: "#F97316" }}>4K</div>
          {/* 시간 */}
          <div className="absolute bottom-2 right-2 text-[8px] font-bold text-white/70">00:58</div>
        </div>

        {/* 타임라인 */}
        <div className="px-3 py-2.5" style={{ background: "#111007" }}>
          {/* 진행 바 */}
          <div className="h-1 rounded-full mb-2 overflow-hidden" style={{ background: "#2A2200" }}>
            <div className="h-full w-[45%] rounded-full" style={{ background: "linear-gradient(90deg,#F97316,#EA580C)" }} />
          </div>

          {/* 트랙 */}
          {[
            { label: "V1", color: "#F97316", width: "80%" },
            { label: "V2", color: "#EF4444", width: "55%" },
            { label: "A1", color: "#10B981", width: "90%" },
            { label: "GFX", color: "#8B5CF6", width: "40%" },
          ].map((track) => (
            <div key={track.label} className="flex items-center gap-2 mb-1.5">
              <span className="text-[7px] font-bold w-5 shrink-0" style={{ color: track.color }}>{track.label}</span>
              <div className="flex-1 h-3 rounded-sm overflow-hidden" style={{ background: "#1E1800" }}>
                <div className="h-full rounded-sm" style={{ width: track.width, background: `${track.color}55`, borderLeft: `2px solid ${track.color}` }} />
              </div>
            </div>
          ))}
        </div>

        {/* 하단 도구 바 */}
        <div className="px-3 py-2 flex items-center gap-3" style={{ background: "#1A1400" }}>
          {["✂", "⏭", "🔊", "📤"].map((icon, i) => (
            <div key={i} className="h-5 w-5 rounded-md flex items-center justify-center text-[9px]" style={{ background: "rgba(249,115,22,0.15)" }}>
              {icon}
            </div>
          ))}
          <div className="ml-auto flex gap-1">
            <div className="h-2 w-6 rounded-full" style={{ background: "rgba(249,115,22,0.4)" }} />
            <div className="h-2 w-4 rounded-full" style={{ background: "rgba(249,115,22,0.25)" }} />
          </div>
        </div>
      </div>

      {/* 오른쪽: 출력 포맷 카드들 */}
      <div className="absolute right-0 top-6 space-y-2">
        {[
          { label: "YouTube", ratio: "16:9", color: "#EF4444" },
          { label: "Instagram", ratio: "1:1", color: "#E1306C" },
          { label: "Reels", ratio: "9:16", color: "#F97316" },
        ].map((fmt) => (
          <div
            key={fmt.label}
            className="w-[96px] rounded-xl px-2.5 py-2 flex items-center justify-between shadow-md"
            style={{ background: `${fmt.color}18`, border: `1px solid ${fmt.color}40` }}
          >
            <span className="text-[9px] font-bold" style={{ color: fmt.color }}>{fmt.label}</span>
            <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-md" style={{ background: `${fmt.color}30`, color: fmt.color }}>{fmt.ratio}</span>
          </div>
        ))}
      </div>

      {/* 배지 */}
      <div
        className="absolute top-[88px] left-[-6px] text-white text-[10px] font-extrabold px-2.5 py-1.5 rounded-xl shadow-lg"
        style={{ background: "#8B5CF6" }}
      >
        모션 그래픽
      </div>
      <div
        className="absolute bottom-[50px] right-[4px] text-white text-[10px] font-extrabold px-2.5 py-1.5 rounded-xl shadow-lg"
        style={{ background: "#F97316" }}
      >
        멀티 포맷 납품
      </div>
    </div>
  );
}

/* ── 특장점 ──────────────────────────────────── */
const FEATURES = [
  {
    no: "01",
    title: "숏폼부터 브랜드 필름까지\n모든 영상을 제작합니다",
    desc: "30초 SNS 광고부터 3분 브랜드 스토리 영상까지, 채널·목적·예산에 맞게 제작합니다. 기획 단계부터 함께하기 때문에 방향이 명확합니다.",
    points: ["SNS 숏폼 (릴스·쇼츠·틱톡)", "유튜브 브랜드 필름", "제품 소개 영상", "TV CF / 캠페인 영상"],
    visual: (
      <div className="w-full max-w-[280px] space-y-2.5">
        {[
          { type: "SNS 숏폼", duration: "15–30초", color: "#F97316", platform: "릴스·쇼츠" },
          { type: "제품 소개", duration: "30–60초", color: "#EF4444", platform: "스마트스토어·유튜브" },
          { type: "브랜드 필름", duration: "1–3분", color: "#8B5CF6", platform: "유튜브·TV" },
        ].map((item) => (
          <div
            key={item.type}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-white shadow-md border border-gray-100"
          >
            <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${item.color}15` }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill={item.color}>
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-brand-dark">{item.type}</p>
              <p className="text-[10px] text-brand-muted">{item.platform}</p>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-1 rounded-lg shrink-0" style={{ background: `${item.color}15`, color: item.color }}>{item.duration}</span>
          </div>
        ))}
      </div>
    ),
    bg: "white",
    accent: "#F97316",
  },
  {
    no: "02",
    title: "모션 그래픽 & 자막으로\n영상을 완성합니다",
    desc: "단순 컷 편집을 넘어 모션 그래픽 인트로·아웃트로, 브랜드 자막 디자인, 효과음·BGM까지 하나의 팀에서 처리합니다.",
    points: ["브랜드 컬러 자막 디자인", "모션 그래픽 인트로/아웃트로 (Deluxe+)", "저작권 해결 배경음악 삽입", "영문·다국어 자막 옵션"],
    visual: (
      <div className="w-full max-w-[280px] space-y-2.5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-4">
          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-3">Production Elements</p>
          {[
            { label: "자막 디자인", icon: "T", color: "#F97316" },
            { label: "모션 그래픽", icon: "✦", color: "#EF4444" },
            { label: "배경음악 (BGM)", icon: "♪", color: "#10B981" },
            { label: "컬러 그레이딩", icon: "◑", color: "#8B5CF6" },
            { label: "사운드 믹싱", icon: "≋", color: "#0EA5E9" },
          ].map((el) => (
            <div key={el.label} className="flex items-center gap-3 mb-2.5 last:mb-0">
              <div
                className="h-7 w-7 rounded-lg flex items-center justify-center text-[12px] font-extrabold shrink-0"
                style={{ background: `${el.color}18`, color: el.color }}
              >
                {el.icon}
              </div>
              <span className="text-[12px] font-semibold text-brand-dark flex-1">{el.label}</span>
              <div className="w-16 h-1.5 rounded-full overflow-hidden bg-gray-100">
                <div className="h-full rounded-full" style={{ width: "100%", background: el.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    bg: "#F9FAFB",
    accent: "#EF4444",
  },
  {
    no: "03",
    title: "16:9부터 9:16까지\n멀티 포맷 동시 납품",
    desc: "하나의 촬영본으로 유튜브, 인스타그램, 릴스, 쇼핑몰까지 각 채널에 최적화된 비율로 동시 납품합니다. 따로 편집 의뢰할 필요 없습니다.",
    points: ["16:9 (유튜브·TV)", "9:16 (릴스·쇼츠·틱톡)", "1:1 (인스타그램 피드)", "썸네일 이미지 별도 제공"],
    visual: (
      <div className="w-full max-w-[280px]">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5">
          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-4">Multi-Format Output</p>
          <div className="flex items-end justify-center gap-4">
            {/* 16:9 */}
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-lg overflow-hidden" style={{ width: 80, height: 45, background: "linear-gradient(135deg,#F97316,#EA580C)" }}>
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
              <span className="text-[8px] font-bold text-orange-500">16:9</span>
              <span className="text-[7px] text-gray-400">YouTube</span>
            </div>
            {/* 1:1 */}
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-lg overflow-hidden" style={{ width: 50, height: 50, background: "linear-gradient(135deg,#EC4899,#BE185D)" }}>
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
              <span className="text-[8px] font-bold text-pink-500">1:1</span>
              <span className="text-[7px] text-gray-400">Instagram</span>
            </div>
            {/* 9:16 */}
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-lg overflow-hidden" style={{ width: 30, height: 54, background: "linear-gradient(135deg,#8B5CF6,#6D28D9)" }}>
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
              <span className="text-[8px] font-bold text-violet-500">9:16</span>
              <span className="text-[7px] text-gray-400">Reels</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
            <div className="h-5 w-5 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#F9731615" }}>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="#F97316"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
            </div>
            <span className="text-[10px] font-semibold text-brand-sub">모든 포맷 동시 납품 포함</span>
          </div>
        </div>
      </div>
    ),
    bg: "white",
    accent: "#F97316",
  },
];

/* ── 프로세스 ───────────────────────────────── */
const PROCESS = [
  { step: "01", title: "상담 & 방향 설정", desc: "채널·목적·예산을 파악하고 영상 방향과 플랜을 추천드립니다." },
  { step: "02", title: "스크립트 & 콘티 기획", desc: "스크립트와 스토리보드를 작성하고 기획안을 확정합니다." },
  { step: "03", title: "촬영 / 소재 수집", desc: "직접 촬영 또는 제공 소재를 기반으로 영상 원본을 준비합니다." },
  { step: "04", title: "편집 & 모션·자막", desc: "편집 + 모션 그래픽 + 자막 디자인 + BGM 삽입 후 시안을 전달합니다." },
  { step: "05", title: "수정 & 멀티 포맷 납품", desc: "피드백 반영 후 채널별 최적화 포맷으로 최종 납품합니다." },
];

/* ── FAQ ────────────────────────────────────── */
const FAQS = [
  {
    q: "촬영 장비와 스튜디오는 어떻게 되나요?",
    a: "Standard·Deluxe는 제공 소재 기반 편집 위주이며, Premium은 전문 PD·감독이 배정되어 현장 촬영을 지원합니다. 스튜디오 필요 시 별도 협의 가능합니다.",
  },
  {
    q: "배경음악 저작권은 괜찮나요?",
    a: "모든 BGM은 상업용 라이선스가 확보된 음원을 사용합니다. 유튜브·SNS 광고 집행 시에도 저작권 문제가 없습니다.",
  },
  {
    q: "모델이나 배우가 필요한 경우 어떻게 하나요?",
    a: "Premium 플랜에서 배우·모델 캐스팅을 지원합니다. Standard·Deluxe는 별도 협의 후 추가 비용으로 캐스팅 가능합니다.",
  },
  {
    q: "납품 후 추가 수정이 가능한가요?",
    a: "플랜별 수정 횟수(Standard 2회, Deluxe 3회, Premium 무제한) 초과 시 회당 별도 비용이 발생합니다. 수정 범위에 따라 상담 후 진행합니다.",
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
    duration: "약 7 영업일",
    grad: "linear-gradient(135deg,#F97316,#EA580C)",
    checkColor: "text-orange-500",
    best: false,
    targets: [
      "제품 소개 영상이 처음인 소상공인",
      "SNS 숏폼 영상 한 편이 필요한 브랜드",
      "빠른 납기로 광고 영상이 필요한 마케터",
    ],
    specs: [
      { label: "길이", value: "최대 30초" },
      { label: "해상도", value: "FHD 1080p" },
      { label: "자막", value: "기본 자막 포함" },
      { label: "수정", value: "2회" },
      { label: "납품", value: "MP4" },
    ],
    includes: ["제품 컷 촬영 편집", "배경음악 삽입", "기본 자막 디자인", "16:9 / 9:16 듀얼 컷"],
    highlight: "",
  },
  {
    id: "deluxe",
    name: "Deluxe",
    sub: "브랜드형",
    price: "199",
    unit: "만원",
    duration: "약 10 영업일",
    grad: "linear-gradient(135deg,#DC2626,#9F1239)",
    checkColor: "text-red-500",
    best: false,
    targets: [
      "브랜드 스토리텔링 영상이 필요한 기업",
      "유튜브 광고 소재 제작이 필요한 마케터",
      "제품 론칭 하이라이트 영상 제작자",
    ],
    specs: [
      { label: "길이", value: "최대 60초" },
      { label: "해상도", value: "FHD 1080p / 4K 옵션" },
      { label: "자막", value: "디자인 자막 + 영문 자막" },
      { label: "수정", value: "3회" },
      { label: "납품", value: "MP4 / MOV" },
    ],
    includes: ["Standard 전체 포함", "모션 그래픽 인트로/아웃트로", "브랜드 컬러 자막 디자인", "영문 자막 추가", "유튜브 / 인스타 최적화 컷"],
    highlight: "모션 그래픽 인트로·아웃트로 포함",
  },
  {
    id: "premium",
    name: "Premium",
    sub: "풀 프로덕션",
    price: "399",
    unit: "만원~",
    duration: "약 14–20 영업일",
    grad: "linear-gradient(135deg,#1E1B4B,#4338CA)",
    checkColor: "text-indigo-500",
    best: true,
    targets: [
      "TV CF / 유튜브 브랜드 필름이 필요한 기업",
      "시즌 캠페인 시리즈 영상 제작 브랜드",
      "전문 감독·배우 캐스팅이 필요한 프로젝트",
    ],
    specs: [
      { label: "길이", value: "최대 3분 (협의)" },
      { label: "해상도", value: "4K UHD" },
      { label: "자막", value: "풀 자막 + 다국어 옵션" },
      { label: "수정", value: "무제한" },
      { label: "납품", value: "MP4 / MOV / 원본 프로젝트" },
    ],
    includes: ["Deluxe 전체 포함", "전문 PD·감독 배정", "배우 / 모델 캐스팅", "현장 촬영 지원", "다국어 자막 옵션", "원본 프로젝트 파일 제공", "전략 기획 미팅 2회"],
    highlight: "현장 촬영 + 전문 감독 배정",
  },
];

function Check({ color }: { color: string }) {
  return (
    <svg className={`w-3.5 h-3.5 shrink-0 mt-[1px] ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

export default function VideoPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="w-full flex gap-6 items-start">

      <div className="flex-1 min-w-0 space-y-0">

        {/* ── 우측 고정 CTA 패널 ────── */}
        <div
          className="hidden lg:block fixed z-30 w-64 xl:w-72 right-8 xl:right-[288px]"
          style={{ top: "92px" }}
        >
          <div className="rounded-2xl overflow-hidden shadow-xl border border-orange-100">
            <div className="px-5 pt-6 pb-6" style={{ background: "linear-gradient(135deg,#F97316,#C2410C)" }}>
              <p className="text-[10px] font-extrabold text-white/50 uppercase tracking-widest mb-2">Video Production</p>
              <p className="text-[17px] font-extrabold text-white leading-tight mb-1">기획부터 납품까지</p>
              <p className="text-[17px] font-extrabold text-white leading-tight mb-5">원스톱 영상 제작</p>
              <p className="text-[11px] text-white/55 leading-relaxed mb-5">
                스크립트·모션그래픽·자막 디자인<br />멀티 포맷 납품까지<br />한 팀이 끝까지 담당합니다.
              </p>
              <div className="space-y-2">
                {[
                  { label: "Standard", price: "99만원~", sub: "약 7 영업일" },
                  { label: "Deluxe", price: "199만원~", sub: "약 10 영업일" },
                  { label: "Premium", price: "399만원~", sub: "약 14–20 영업일" },
                ].map((t) => (
                  <div key={t.label} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/10">
                    <div>
                      <span className="text-[12px] font-bold text-white block leading-tight">{t.label}</span>
                      <span className="text-[10px] text-white/40">{t.sub}</span>
                    </div>
                    <span className="text-[12px] font-extrabold text-orange-200">{t.price}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white px-4 py-5 space-y-2.5">
              <button
                className="w-full py-3 rounded-xl text-[13px] font-extrabold text-white transition-opacity hover:opacity-85"
                style={{ background: "linear-gradient(135deg,#F97316,#C2410C)" }}
              >
                무료 영상 제작 상담 신청
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
          <span className="text-brand-text font-medium">영상 제작</span>
        </nav>

        {/* ── HERO ──────────────────────────── */}
        <section className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(160deg,#1C0900 0%,#431005 55%,#7C2D00 100%)" }}>
          <div className="px-8 py-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-extrabold text-orange-300 uppercase tracking-[0.2em] mb-3">Video Production</p>
              <h1 className="text-[30px] font-extrabold text-white leading-tight mb-4">
                영상 하나가<br />
                브랜드를 바꿉니다
              </h1>
              <p className="text-[14px] text-white/75 leading-relaxed mb-6">
                숏폼부터 브랜드 필름까지<br />
                기획 · 모션 · 멀티 포맷 납품까지 원스톱으로.
              </p>
              <div className="flex flex-wrap gap-2">
                {["모션 그래픽", "4K 고화질", "멀티 포맷", "저작권 BGM"].map((t) => (
                  <span key={t} className="text-[11px] font-bold px-3 py-1.5 rounded-lg text-white" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <VideoMockup />
          </div>
        </section>

        {/* ── 숫자 강조 ──────────────────────── */}
        <section className="rounded-2xl bg-white border border-brand-border py-6 px-8">
          <div className="grid grid-cols-3 gap-6 divide-x divide-brand-border">
            {[
              { num: "800+", label: "누적 영상 제작" },
              { num: "16개", label: "지원 납품 포맷" },
              { num: "7일", label: "최단 납품 기간" },
            ].map((s) => (
              <div key={s.label} className="text-center px-2">
                <p className="text-[28px] font-extrabold text-orange-500 leading-tight">{s.num}</p>
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
        <section className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(160deg,#1C0900 0%,#431005 100%)" }}>
          <div className="px-8 py-10">
            <p className="text-[11px] font-extrabold text-orange-400/70 uppercase tracking-widest mb-2">Process</p>
            <h2 className="text-[22px] font-extrabold text-white mb-8">5단계 제작 프로세스</h2>
            <div className="space-y-0">
              {PROCESS.map((p, i) => (
                <div key={p.step} className="flex gap-4">
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white shrink-0"
                      style={{ background: "linear-gradient(135deg,#F97316,#EA580C)" }}
                    >
                      {p.step}
                    </div>
                    {i < PROCESS.length - 1 && (
                      <div className="w-px flex-1 my-1" style={{ background: "rgba(249,115,22,0.3)" }} />
                    )}
                  </div>
                  <div className={`pb-6 ${i === PROCESS.length - 1 ? "pb-0" : ""}`}>
                    <p className="text-[14px] font-bold text-white mb-1">{p.title}</p>
                    <p className="text-[12px] text-orange-200/55 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 가격 플랜 ───────────────────────── */}
        <section className="rounded-2xl bg-brand-lighter border border-brand-border px-8 py-10">
          <p className="text-[11px] font-extrabold text-orange-500 uppercase tracking-widest mb-2">Pricing</p>
          <h2 className="text-[22px] font-extrabold text-brand-dark mb-2">플랜 선택</h2>
          <p className="text-[13px] text-brand-sub mb-8">채널·목적·예산에 맞는 플랜을 선택하세요.</p>

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
                    style={{ background: "linear-gradient(135deg,#1E1B4B,#4338CA)" }}
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
                  {tier.highlight && (
                    <div className="mb-2.5 flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[10px] font-bold" style={{ background: "#FFF7ED", border: "1px solid #FED7AA", color: "#C2410C" }}>
                      <span>★</span>
                      <span className="flex-1">{tier.highlight}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md font-extrabold" style={{ background: "#F97316", color: "white" }}>추가</span>
                    </div>
                  )}
                  <ul className="space-y-1.5">
                    {tier.includes.map((inc, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="mt-[3px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: tier.id === "standard" ? "#F97316" : tier.id === "deluxe" ? "#DC2626" : "#6366F1" }} />
                        <span className="text-[11px] text-brand-sub leading-snug">{inc}</span>
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
          <p className="text-[11px] font-extrabold text-orange-500 uppercase tracking-widest mb-2">FAQ</p>
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
          style={{ background: "linear-gradient(135deg,#F97316,#C2410C)" }}
        >
          <div>
            <p className="text-[11px] font-extrabold text-orange-100/50 uppercase tracking-widest mb-1">무료 상담</p>
            <p className="text-[20px] font-extrabold text-white leading-tight">어떤 플랜이 맞는지<br />모르겠다면 먼저 물어보세요</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button className="px-6 py-3 rounded-xl text-[13px] font-extrabold bg-white text-orange-600 hover:bg-orange-50 transition-colors">
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
            소요기간은 영업일 기준이며, 촬영 여부·피드백 속도에 따라 달라질 수 있습니다. 가격은 VAT 별도이며, 세부 범위에 따라 변동될 수 있습니다.
          </p>
        </div>

      </div>

      {/* 오른쪽 고정 패널 자리 확보용 */}
      <div className="hidden lg:block w-64 xl:w-72 shrink-0" />

    </div>
  );
}
