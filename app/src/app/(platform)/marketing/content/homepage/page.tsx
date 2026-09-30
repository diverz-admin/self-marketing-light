"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileCode,
  Gauge,
  Globe,
  Layers,
  LayoutTemplate,
  Lock,
  MessagesSquare,
  MonitorSmartphone,
  MousePointer2,
  PenTool,
  Repeat,
  Rocket,
  Search,
  Share2,
  Tags,
  Timer,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  CONSULT_HREF,
  LandingShell,
  Reveal,
  PillLink,
  CountUp,
  CheckIcon,
  LIGHT,
  TINT,
  BLUE,
  BLUE_BG,
  NAVY,
  EYEBROW,
  EYEBROW_ON_DARK,
  LEAD,
  LEAD_ON_DARK,
  H2,
} from "@/components/marketing/landing";

/* ── 히어로 지표 ─────────────────────────────── */
const HERO_STATS: { label: string; value: number; unit: string; note: string; icon: LucideIcon }[] = [
  { label: "누적 제작", value: 500, unit: "건+", note: "병원·학원·매장·기업 사이트", icon: Layers },
  { label: "재의뢰·추천율", value: 97, unit: "%", note: "다시 맡기거나 소개해 주신 비율", icon: Repeat },
  { label: "최단 납품", value: 10, unit: "일", note: "Standard 플랜 · 영업일 기준", icon: Timer },
];

/* ── 히어로 목업 — PC 브라우저 + 모바일 ─────────
   같은 사이트가 두 화면에 동시에 떠 있어 "반응형"이 말없이 읽힌다.
   600×380 캔버스를 그대로 두고 좁은 화면에서는 통째로 축소한다. */
const CARD_SHADOW = "shadow-[0_28px_56px_-20px_rgba(7,15,73,.6)]";

function HomepageMockup() {
  return (
    <div className="relative mx-auto h-[230px] w-full max-w-[600px] select-none sm:h-[380px]" aria-hidden>
      <div className="absolute left-1/2 top-0 h-[380px] w-[600px] -translate-x-1/2 origin-top scale-[.58] sm:scale-100">
        {/* PC 브라우저 */}
        <div className={`absolute left-[40px] top-[18px] w-[460px] overflow-hidden rounded-2xl bg-white ${CARD_SHADOW}`}>
          <div className="flex items-center gap-3 border-b border-brand-border bg-brand-lighter px-3.5 py-2.5">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex h-6 flex-1 items-center gap-1.5 rounded-md bg-white px-2.5 ring-1 ring-inset ring-brand-border">
              <Lock className="h-3 w-3 text-emerald-500" strokeWidth={2.4} />
              <span className="text-[10.5px] font-medium text-brand-sub">www.mybrand.co.kr</span>
            </div>
          </div>
          {/* 사이트 내비 */}
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-black text-white" style={{ background: BLUE_BG }}>
                M
              </span>
              <span className="text-[12px] font-extrabold text-brand-dark">MYBRAND</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-semibold text-brand-sub">
              <span>소개</span>
              <span>서비스</span>
              <span>사례</span>
              <span className="rounded-full px-2.5 py-1 text-white" style={{ background: BLUE_BG }}>
                상담 신청
              </span>
            </div>
          </div>
          {/* 사이트 히어로 */}
          <div className="relative mx-4 overflow-hidden rounded-xl px-6 py-7 text-white" style={{ background: NAVY }}>
            <span className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-[#2A5EFF]/50 blur-2xl" />
            <p className="relative text-[9px] font-bold uppercase tracking-[0.2em] text-[#8FB0FF]">Since 2018</p>
            <p className="relative mt-1.5 text-[22px] font-extrabold leading-tight">
              믿고 맡기는
              <br />
              우리 동네 전문가
            </p>
            <span className="relative mt-4 inline-flex rounded-full bg-white px-3 py-1.5 text-[10px] font-extrabold text-brand-primary">무료 상담 받기 →</span>
            <MousePointer2 className="absolute bottom-3 left-[118px] h-5 w-5 fill-white text-brand-dark drop-shadow" strokeWidth={1.6} />
          </div>
          {/* 서비스 카드 */}
          <div className="grid grid-cols-3 gap-2 p-4">
            {["서비스 소개", "고객 후기", "오시는 길"].map((t) => (
              <div key={t} className="rounded-lg bg-brand-lighter p-2.5">
                <span className="block h-5 w-5 rounded-md bg-brand-primary-50" />
                <p className="mt-2 text-[10px] font-bold text-brand-dark">{t}</p>
                <span className="mt-1 block h-1.5 w-4/5 rounded-full bg-brand-border" />
              </div>
            ))}
          </div>
        </div>

        {/* 모바일 */}
        <div className={`absolute right-[4px] top-[128px] z-10 w-[150px] overflow-hidden rounded-[26px] border-[5px] border-brand-dark bg-white ${CARD_SHADOW}`}>
          <div className="mx-auto mt-1.5 h-1.5 w-12 rounded-full bg-brand-dark" />
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-[9px] font-extrabold text-brand-dark">MYBRAND</span>
            <span className="space-y-0.5">
              <span className="block h-0.5 w-3 bg-brand-dark" />
              <span className="block h-0.5 w-3 bg-brand-dark" />
            </span>
          </div>
          <div className="relative mx-2 overflow-hidden rounded-lg px-3 py-4 text-white" style={{ background: NAVY }}>
            <span className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#2A5EFF]/50 blur-xl" />
            <p className="relative text-[12px] font-extrabold leading-tight">
              믿고 맡기는
              <br />
              우리 동네 전문가
            </p>
            <span className="relative mt-2.5 inline-flex rounded-full bg-white px-2 py-1 text-[8px] font-extrabold text-brand-primary">무료 상담 →</span>
          </div>
          <div className="space-y-1.5 p-2 pb-4">
            {["서비스 소개", "고객 후기"].map((t) => (
              <div key={t} className="flex items-center gap-1.5 rounded-md bg-brand-lighter p-1.5">
                <span className="h-4 w-4 rounded bg-brand-primary-50" />
                <span className="text-[8.5px] font-bold text-brand-dark">{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 플로팅 카드 — 홈페이지가 만들어 내는 결과(검색 노출 · 속도 · 문의)를 목업 둘레에 띄운다 */}
        {/* 좌상: 네이버 검색 결과 */}
        <div className="absolute -left-[92px] top-[160px] z-20 w-[190px] -rotate-3">
          <div className="animate-bob" style={{ animationDelay: "0ms" }}>
            <div className="rounded-2xl bg-white p-3 shadow-[0_20px_40px_-16px_rgba(7,15,73,.55)] ring-1 ring-black/5">
              <div className="flex items-center gap-1.5 rounded-full border border-brand-border px-2.5 py-1.5">
                <span className="text-[11px] font-black text-[#03C75A]">N</span>
                <span className="flex-1 text-[10.5px] font-semibold text-brand-dark">마이브랜드</span>
                <Search className="h-3 w-3 text-[#03C75A]" strokeWidth={2.6} />
              </div>
              <div className="mt-2 flex items-center gap-1.5 px-0.5">
                <span className="flex h-4 w-4 items-center justify-center rounded text-[8px] font-black text-white" style={{ background: BLUE_BG }}>
                  M
                </span>
                <span className="text-[10.5px] font-extrabold text-brand-primary">마이브랜드 공식 홈페이지</span>
              </div>
              <span className="ml-0.5 mt-1.5 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9.5px] font-extrabold text-emerald-600">
                <CheckCircle2 className="h-3 w-3" strokeWidth={2.6} />
                검색 등록 완료
              </span>
            </div>
          </div>
        </div>

        {/* 좌하: 모바일 성능 점수 */}
        <div className="absolute -left-[64px] -bottom-[4px] z-20 rotate-2">
          <div className="animate-bob" style={{ animationDelay: "1200ms" }}>
            <div className="flex items-center gap-2.5 rounded-2xl bg-white py-2.5 pl-2.5 pr-4 shadow-[0_20px_40px_-16px_rgba(7,15,73,.55)] ring-1 ring-black/5">
              <div className="relative h-11 w-11">
                <svg viewBox="0 0 44 44" className="h-full w-full -rotate-90">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="#DDF5E8" strokeWidth="4.5" />
                  <circle cx="22" cy="22" r="18" fill="none" stroke="#10B981" strokeWidth="4.5" strokeLinecap="round" strokeDasharray={113.1} strokeDashoffset={113.1 * 0.04} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[13px] font-extrabold text-emerald-600">96</span>
              </div>
              <div>
                <p className="text-[11.5px] font-extrabold text-brand-dark">모바일 성능</p>
                <p className="text-[9.5px] font-semibold text-brand-muted">빠른 로딩 · 반응형</p>
              </div>
            </div>
          </div>
        </div>

        {/* 우상: 새 상담 문의 알림 — 홈페이지의 목적은 결국 문의다 */}
        <div className="absolute -right-[84px] top-[4px] z-30 w-[200px] rotate-2">
          <div className="animate-bob" style={{ animationDelay: "600ms" }}>
            <div className="flex items-center gap-2.5 rounded-2xl bg-white/95 p-3 shadow-[0_20px_40px_-16px_rgba(7,15,73,.55)] ring-1 ring-black/5 backdrop-blur">
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: BLUE_BG }}>
                <Bell className="h-4 w-4" strokeWidth={2.4} />
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold text-brand-dark">새 상담 문의가 왔어요</p>
                <p className="text-[9.5px] font-semibold text-brand-muted">홈페이지 · 방금 전</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 특장점 비주얼 ───────────────────────────── */
// 01 — 한 팀이 끝까지 가는 제작 트래커
function OneStopTracker() {
  const steps = [
    { label: "인터뷰 & 기획", state: "done" },
    { label: "디자인 시안", state: "done" },
    { label: "피드백 & 수정", state: "now" },
    { label: "검색 등록", state: "todo" },
    { label: "납품 완료", state: "todo" },
  ] as const;
  return (
    <div className="w-full max-w-[320px] rounded-3xl border border-brand-border bg-white p-5 shadow-[0_30px_60px_-30px_rgba(36,82,235,.45)]">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-muted">Project</p>
        <span className="rounded-md bg-brand-primary-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-primary">담당 팀 1개</span>
      </div>
      <p className="mt-1 text-[16px] font-extrabold text-brand-dark">mybrand.co.kr 제작</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-lighter">
        <div className="h-full w-[55%] rounded-full" style={{ background: BLUE_BG }} />
      </div>
      <ul className="mt-4 space-y-2">
        {steps.map((s, i) => (
          <li
            key={s.label}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
              s.state === "now" ? "bg-brand-primary-50 ring-1 ring-inset ring-brand-primary/20" : s.state === "done" ? "bg-brand-lighter" : ""
            }`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold ${
                s.state === "done" ? "bg-brand-primary text-white" : s.state === "now" ? "bg-white text-brand-primary ring-2 ring-brand-primary" : "bg-brand-lighter text-brand-muted"
              }`}
            >
              {s.state === "done" ? <CheckIcon className="h-3 w-3" /> : String(i + 1).padStart(2, "0")}
            </span>
            <span className={`text-[13px] font-bold ${s.state === "todo" ? "text-brand-muted" : "text-brand-dark"}`}>{s.label}</span>
            {s.state === "now" && <span className="ml-auto text-[10px] font-extrabold text-brand-primary">진행 중</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

// 02 — 라이트하우스식 원형 점수
function SpeedScores() {
  const scores = [
    { label: "Performance", score: 96 },
    { label: "SEO", score: 100 },
    { label: "Accessibility", score: 98 },
    { label: "Best Practices", score: 95 },
  ];
  const R = 26;
  const C = 2 * Math.PI * R;
  return (
    <div className="w-full max-w-[320px] rounded-3xl border border-brand-border bg-white p-5 shadow-[0_30px_60px_-30px_rgba(36,82,235,.45)]">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-muted">Page speed</p>
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
          <MonitorSmartphone className="h-3 w-3" strokeWidth={2.4} />
          모바일 기준
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {scores.map((s) => (
          <div key={s.label} className="flex flex-col items-center rounded-2xl bg-brand-lighter py-3.5">
            <div className="relative h-16 w-16">
              <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
                <circle cx="32" cy="32" r={R} fill="none" stroke="#DDF5E8" strokeWidth="6" />
                <circle cx="32" cy="32" r={R} fill="none" stroke="#10B981" strokeWidth="6" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - s.score / 100)} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[17px] font-extrabold text-emerald-600 tabular-nums">{s.score}</span>
            </div>
            <p className="mt-2 text-[11px] font-bold text-brand-sub">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// 03 — 검색 결과에 내 사이트가 뜨는 모습. 순위 보장처럼 읽히지 않게 "등록 완료"만 표시한다
function SearchPreview() {
  return (
    <div className="w-full max-w-[320px] space-y-3">
      <div className="rounded-3xl border border-brand-border bg-white p-4 shadow-[0_30px_60px_-30px_rgba(36,82,235,.45)]">
        <div className="flex items-center gap-2 rounded-full border border-brand-border px-3 py-2">
          <span className="text-[13px] font-black text-[#03C75A]">N</span>
          <span className="flex-1 text-[12px] font-semibold text-brand-dark">마이브랜드</span>
          <Search className="h-3.5 w-3.5 text-[#03C75A]" strokeWidth={2.6} />
        </div>
        <div className="mt-3 rounded-2xl bg-brand-lighter p-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-black text-white" style={{ background: BLUE_BG }}>
              M
            </span>
            <div className="min-w-0">
              <p className="text-[12.5px] font-extrabold text-brand-primary">마이브랜드 공식 홈페이지</p>
              <p className="text-[10px] text-emerald-600">www.mybrand.co.kr</p>
            </div>
          </div>
          <p className="mt-2 text-[10.5px] leading-relaxed text-brand-sub">믿고 맡기는 우리 동네 전문가. 서비스 소개, 고객 후기, 오시는 길을 확인하세요.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: "네이버 서치어드바이저", color: "#03C75A", mark: "N" },
          { name: "구글 서치콘솔", color: "#4285F4", mark: "G" },
        ].map((e) => (
          <div key={e.name} className="rounded-2xl border border-brand-border bg-white p-3 shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-black text-white" style={{ background: e.color }}>
                {e.mark}
              </span>
              <span className="text-[10px] font-bold text-brand-sub">{e.name}</span>
            </div>
            <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-600">
              <CheckIcon className="h-2.5 w-2.5" />
              등록 완료
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 특장점 섹션 데이터 ──────────────────────── */
const FEATURES: {
  no: string;
  eyebrow: string;
  title: string;
  desc: string;
  points: { icon: LucideIcon; title: string }[];
  visual: React.ReactNode;
}[] = [
  {
    no: "01",
    eyebrow: "One-stop",
    title: "인터뷰부터 검색등록까지\n원스톱 제작",
    desc: "따로 기획사, 디자이너, 개발사를 찾을 필요 없습니다. 인터뷰 → 기획 → 디자인 → 검색등록까지 하나의 팀이 끝까지 담당합니다.",
    points: [
      { icon: MessagesSquare, title: "인터뷰 기반 기획" },
      { icon: MonitorSmartphone, title: "반응형 디자인" },
      { icon: Search, title: "네이버·구글 등록" },
      { icon: Wrench, title: "납품 후 수정 기간" },
    ],
    visual: <OneStopTracker />,
  },
  {
    no: "02",
    eyebrow: "Mobile first",
    title: "모바일 최적화 &\n빠른 로딩 속도",
    desc: "방문자의 70% 이상이 모바일로 접속합니다. 모든 플랜에 반응형 디자인이 기본 포함되며, 페이지 속도 최적화까지 진행합니다.",
    points: [
      { icon: MonitorSmartphone, title: "전 디바이스 대응" },
      { icon: Zap, title: "이미지·코드 최적화" },
      { icon: Gauge, title: "Core Web Vitals 준수" },
      { icon: Share2, title: "카톡 공유 미리보기" },
    ],
    visual: <SpeedScores />,
  },
  {
    no: "03",
    eyebrow: "SEO",
    title: "네이버·구글 SEO\n검색 노출 최적화",
    desc: "홈페이지를 만들어도 검색에 안 나오면 의미가 없습니다. 모든 플랜에 네이버·구글 검색 등록과 기본 SEO 세팅이 포함됩니다.",
    points: [
      { icon: Tags, title: "메타·오픈그래프" },
      { icon: Search, title: "네이버 서치어드바이저" },
      { icon: Globe, title: "구글 서치콘솔" },
      { icon: FileCode, title: "사이트맵·robots" },
    ],
    visual: <SearchPreview />,
  },
];

/* ── 프로세스 ───────────────────────────────── */
const PROCESS: { step: string; icon: LucideIcon; title: string; desc: string; output: string }[] = [
  { step: "01", icon: MessagesSquare, title: "상담 & 견적", desc: "홈페이지 목적, 분량, 예산을 파악하고 최적 플랜을 추천드립니다.", output: "견적서" },
  { step: "02", icon: ClipboardList, title: "인터뷰 & 기획", desc: "브랜드·서비스 인터뷰를 바탕으로 사이트맵과 와이어프레임을 설계합니다.", output: "사이트맵" },
  { step: "03", icon: PenTool, title: "메인 시안", desc: "메인페이지 시안을 제작하고 피드백을 반영해 완성도를 높입니다.", output: "메인 시안" },
  { step: "04", icon: LayoutTemplate, title: "전 페이지 디자인", desc: "확정된 메인 시안 기반으로 서브페이지까지 일관성 있게 완성합니다.", output: "전체 페이지" },
  { step: "05", icon: Rocket, title: "검색 등록 & 오픈", desc: "네이버·구글 검색 등록 후 최종 납품, 수정 기간을 제공합니다.", output: "사이트 오픈" },
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
    duration: "10 영업일",
    bg: "linear-gradient(135deg,#5B6B8C 0%,#3C4A66 100%)",
    best: false,
    targets: ["소규모 사업자 / 1인 브랜드", "빠른 온라인 존재감이 필요한 경우", "단순 제품·서비스 소개가 필요한 경우"],
    specs: [
      { label: "분량", value: "랜딩 1페이지" },
      { label: "수정", value: "2회 (기획 1 · 디자인 1)" },
    ],
    includes: ["온라인 인터뷰", "기획", "디자인", "모바일 최적화", "SEO 세팅", "네이버 / 구글 검색등록"],
    highlights: [] as string[],
  },
  {
    id: "deluxe",
    name: "Deluxe",
    sub: "비즈니스형",
    price: "199",
    duration: "3주",
    bg: BLUE_BG,
    best: false,
    targets: ["서비스업 / 전문직 / 스타트업", "다양한 서비스 메뉴를 소개해야 하는 경우", "온라인 신뢰도를 높이고 싶은 브랜드"],
    specs: [
      { label: "분량", value: "메인 1 + 서브 5페이지" },
      { label: "수정", value: "3회 (기획 1 · 디자인 2)" },
    ],
    includes: ["온라인 인터뷰", "기획", "디자인", "모바일 최적화", "SEO 세팅", "네이버 / 구글 검색등록"],
    highlights: [] as string[],
  },
  {
    id: "premium",
    name: "Premium",
    sub: "풀 브랜딩형",
    price: "399",
    duration: "5–6주",
    bg: NAVY,
    best: true,
    targets: ["브랜드 아이덴티티가 중요한 기업", "투자 유치 · 유통 입점을 준비 중인 브랜드", "온라인에서 강한 첫인상이 필요한 경우"],
    specs: [
      { label: "분량", value: "메인 1 + 서브 7페이지" },
      { label: "수정", value: "4회 (기획 2 · 디자인 2)" },
    ],
    includes: ["방문 인터뷰", "기본 브랜딩", "기획", "디자인", "모바일 최적화", "SEO 세팅", "네이버 / 구글 검색등록"],
    highlights: ["방문 인터뷰", "기본 브랜딩"],
  },
];

export default function HomepagePage() {
  // 한 번에 하나만 열리게 둔다 — 다 펼쳐 두면 질문 목록을 훑는 이점이 사라진다
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <LandingShell
      railTitle={
        <>
          홈페이지 제작,
          <br />
          상담으로 시작
        </>
      }
    >
      {/* ── 1. 히어로 ── 흰 밴드 · 중앙 정렬, 아래는 블루 무대 위 목업 */}
      <section
        className={`${LIGHT} pb-0 md:pb-0`}
        style={{ backgroundImage: "radial-gradient(120% 90% at 50% -10%, rgba(36,82,235,.07), transparent 60%)" }}
      >
        <div className="relative text-center">
          <Reveal>
            <p className={EYEBROW}>Homepage</p>
            <h2 className={`${H2} mt-4 text-brand-dark`}>
              홈페이지 하나로
              <br />
              <span className="text-brand-primary">신뢰를 만드세요</span>
            </h2>
            <p className={LEAD}>인터뷰·기획·디자인·SEO까지, 비즈니스에 맞는 홈페이지를 처음부터 끝까지 만들어 드립니다.</p>
            {/* 모든 플랜 공통 포함 — 가격표까지 내려가지 않아도 기본값이 보이게 */}
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {["반응형 디자인", "SEO 세팅", "네이버·구글 검색 등록"].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-white px-3 py-1.5 text-[12.5px] font-bold text-brand-text shadow-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-primary" strokeWidth={2.6} />
                  {t}
                </li>
              ))}
              <li className="text-[12px] font-semibold text-brand-muted">전 플랜 기본 포함</li>
            </ul>
          </Reveal>

          {/* 목업 무대 — 블루 면이 밴드 바닥까지 내려와 다음 섹션과 이어진다 */}
          <Reveal delay={220}>
            <div className="relative mx-auto mt-12 max-w-[760px]">
              <div className="absolute inset-x-0 bottom-0 top-16 overflow-hidden rounded-t-[36px] sm:top-28" style={{ background: "var(--gradient-point)" }}>
                <span className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden />
                <span className="pointer-events-none absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-[#8FB0FF]/20 blur-3xl" aria-hidden />
                <span className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" aria-hidden />
                {/* 옅은 격자 — 설계도 위에 사이트를 올린 느낌 */}
                <span
                  className="pointer-events-none absolute inset-0 opacity-60"
                  style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                    maskImage: "linear-gradient(180deg, #000 30%, transparent)",
                    WebkitMaskImage: "linear-gradient(180deg, #000 30%, transparent)",
                  }}
                  aria-hidden
                />
              </div>
              <div className="relative px-4 pb-8 sm:pb-10">
                <HomepageMockup />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 1-1. 지표 ── 네이비 띠. 목업 무대의 블루가 그대로 내려와 이어진다 */}
      <section className="relative overflow-hidden px-7 py-12 text-white md:px-14 md:py-14" style={{ background: NAVY }}>
        <span className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#4F7BFF]/25 blur-3xl" aria-hidden />
        <span className="pointer-events-none absolute -right-20 -bottom-24 h-64 w-64 rounded-full bg-[#8FB0FF]/15 blur-3xl" aria-hidden />
        <dl className="relative mx-auto grid max-w-[880px] grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-white/10">
          {HERO_STATS.map((st, i) => {
            const Icon = st.icon;
            return (
              <Reveal key={st.label} delay={i * 90}>
                <div className="flex items-center gap-4 rounded-2xl bg-white/[0.05] px-5 py-4 ring-1 ring-inset ring-white/10 sm:flex-col sm:gap-0 sm:bg-transparent sm:px-4 sm:py-2 sm:text-center sm:ring-0">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#8FB0FF] ring-1 ring-inset ring-white/15">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 sm:mt-4">
                    <dt className="text-[12.5px] font-bold text-white/60 break-keep sm:text-[13px]">{st.label}</dt>
                    <dd className="mt-1 text-[32px] font-extrabold leading-none tracking-tight tabular-nums sm:mt-2.5 md:text-[44px]">
                      <CountUp to={st.value} />
                      <span className="ml-0.5 align-baseline text-[16px] font-extrabold text-[#8FB0FF] md:text-[20px]">{st.unit}</span>
                    </dd>
                    <dd className="mt-2 text-[12px] font-medium text-white/45 break-keep sm:mt-3">{st.note}</dd>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </dl>
      </section>

      {/* ── 2~4. 특장점 ── 연회색 ↔ 흰 밴드를 번갈아 깐다 (히어로가 흰색이라 회색부터) */}
      {FEATURES.map((f, i) => {
        const flip = i % 2 === 1;
        return (
          <section key={f.no} className={flip ? LIGHT : TINT}>
            <div className="relative grid items-center gap-10 md:grid-cols-2 md:gap-14">
              <Reveal className={flip ? "md:order-2" : ""}>
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-[14px] font-black text-white tabular-nums shadow-[0_10px_20px_-10px_rgba(36,82,235,.8)]"
                    style={{ background: BLUE_BG }}
                  >
                    {f.no}
                  </span>
                  <p className={EYEBROW}>{f.eyebrow}</p>
                </div>
                <h2 className={`${H2} mt-5 whitespace-pre-line text-brand-dark`}>{f.title}</h2>
                <p className="mt-5 text-[15px] leading-relaxed text-brand-sub break-keep md:text-[16.5px]">{f.desc}</p>
                <ul className="mt-8 grid grid-cols-2 gap-2.5">
                  {f.points.map((pt) => {
                    const Icon = pt.icon;
                    return (
                      <li
                        key={pt.title}
                        className={`group flex items-center gap-3 rounded-2xl border border-brand-border px-3.5 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-[0_16px_32px_-20px_rgba(36,82,235,.4)] ${
                          flip ? "bg-brand-lighter/60" : "bg-white"
                        }`}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary-50 text-brand-primary transition-colors group-hover:bg-brand-primary group-hover:text-white">
                          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                        </span>
                        <p className="text-[14px] font-extrabold leading-snug text-brand-dark break-keep">{pt.title}</p>
                      </li>
                    );
                  })}
                </ul>
              </Reveal>

              <Reveal delay={120} className={flip ? "md:order-1" : ""}>
                {/* 비주얼 무대 — 점 격자 위에 카드를 올려 작업물처럼 보이게 한다 */}
                <div
                  className={`relative flex justify-center overflow-hidden rounded-[28px] px-6 py-10 md:py-12 ${flip ? "bg-brand-lighter" : "bg-white"}`}
                  style={{ backgroundImage: "radial-gradient(rgba(36,82,235,.10) 1px, transparent 1px)", backgroundSize: "18px 18px" }}
                >
                  <span className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-brand-primary/10 blur-3xl" aria-hidden />
                  <div className="relative flex w-full justify-center">{f.visual}</div>
                </div>
              </Reveal>
            </div>
          </section>
        );
      })}

      {/* ── 5. 진행 프로세스 ── 블루 밴드 */}
      <section className={BLUE} style={{ background: BLUE_BG }}>
        <div className="relative text-center">
          <Reveal>
            <p className={EYEBROW_ON_DARK}>How it works</p>
            <h2 className={`${H2} mt-4 text-white`}>상담부터 검색 등록까지</h2>
            <p className={LEAD_ON_DARK}>목적과 분량을 먼저 여쭙고, 거기에 맞는 플랜부터 잡습니다.</p>
          </Reveal>

          {/* 데스크톱: 레일 위 스텝 노드 + 카드. 마지막(사이트 오픈)을 가장 밝게 띄운다 */}
          <div className="relative mt-14 hidden sm:block">
            <div className="pointer-events-none absolute left-[10%] right-[10%] top-[22px] h-[2px] rounded-full bg-gradient-to-r from-white/15 via-white/45 to-white/80" />
            <div className="grid grid-cols-5 gap-3 lg:gap-4">
              {PROCESS.map((pr, i) => {
                const last = i === PROCESS.length - 1;
                const Icon = pr.icon;
                return (
                  <Reveal key={pr.step} delay={i * 90} className="h-full">
                    <div className="group flex h-full flex-col items-center">
                      <span
                        className={`relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[13px] font-extrabold text-brand-primary tabular-nums shadow-[0_8px_18px_-6px_rgba(7,15,73,.6)] ring-[6px] transition-transform duration-300 group-hover:scale-110 ${
                          last ? "ring-white/30" : "ring-white/10"
                        }`}
                      >
                        {pr.step}
                      </span>
                      <span className="h-4 w-px bg-white/30" />
                      <div
                        className={`flex w-full flex-1 flex-col items-center rounded-2xl border p-4 text-center transition-all duration-300 group-hover:-translate-y-1 lg:p-5 ${
                          last
                            ? "border-white bg-white shadow-[0_24px_48px_-20px_rgba(7,15,73,.75)]"
                            : "border-white/15 bg-white/[0.08] backdrop-blur-sm group-hover:border-white/30 group-hover:bg-white/[0.12]"
                        }`}
                      >
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${last ? "text-white" : "bg-white/15 text-white ring-1 ring-inset ring-white/20"}`}
                          style={last ? { background: BLUE_BG } : undefined}
                        >
                          <Icon className="h-5 w-5" strokeWidth={1.8} />
                        </span>
                        <p className={`mt-3.5 text-[15px] font-extrabold leading-snug break-keep ${last ? "text-brand-dark" : "text-white"}`}>{pr.title}</p>
                        <p className={`mb-4 mt-1.5 text-[12.5px] leading-relaxed break-keep ${last ? "text-brand-sub" : "text-white/65"}`}>{pr.desc}</p>
                        <span
                          className={`mt-auto inline-flex rounded-full px-2.5 py-1 text-[11.5px] font-bold break-keep ${
                            last ? "bg-brand-primary text-white" : "bg-white/10 text-white/85 ring-1 ring-inset ring-white/15"
                          }`}
                        >
                          {pr.output}
                        </span>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>

          {/* 모바일: 세로 타임라인 */}
          <div className="mt-10 space-y-3 text-left sm:hidden">
            {PROCESS.map((pr, i) => {
              const Icon = pr.icon;
              return (
                <div key={pr.step} className="flex items-stretch gap-3.5">
                  <div className="relative flex shrink-0 flex-col items-center">
                    <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[13px] font-extrabold text-brand-primary tabular-nums ring-4 ring-white/10">
                      {pr.step}
                    </div>
                    {i < PROCESS.length - 1 && <div className="-mb-3 w-px flex-1 bg-gradient-to-b from-white/40 to-white/10" />}
                  </div>
                  <div className="min-w-0 flex-1 rounded-2xl border border-white/15 bg-white/[0.08] p-4">
                    <p className="flex items-center gap-1.5 text-[15px] font-extrabold text-white break-keep">
                      <Icon className="h-4 w-4 shrink-0 text-white/80" strokeWidth={2} />
                      {pr.title}
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-white/65 break-keep">{pr.desc}</p>
                    <span className="mt-3 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[11.5px] font-bold text-white/85 ring-1 ring-inset ring-white/15">
                      {pr.output}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 6. 가격 플랜 ── 그레이 밴드 */}
      <section className={TINT}>
        <div className="relative">
          <Reveal>
            <p className={`${EYEBROW} text-center`}>Pricing</p>
            <h2 className={`${H2} mt-4 text-center text-brand-dark`}>플랜 선택</h2>
            <p className={LEAD}>사이트 규모와 목적에 맞는 플랜을 고르시면 됩니다.</p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 items-stretch gap-4 md:grid-cols-3">
            {TIERS.map((tier, ti) => (
              <Reveal key={tier.id} delay={ti * 90} className="h-full">
                <div
                  className={`group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white transition-all duration-300 hover:-translate-y-1 ${
                    tier.best
                      ? "ring-2 ring-brand-primary shadow-[0_28px_56px_-28px_rgba(36,82,235,.55)]"
                      : "border border-brand-border shadow-sm hover:shadow-[0_20px_40px_-24px_rgba(36,82,235,.35)]"
                  }`}
                >
                  {/* 헤더 — 이름·가격·기간 */}
                  <div className="relative overflow-hidden px-6 pb-7 pt-6" style={{ background: tier.bg }}>
                    <span className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden />
                    {tier.best && (
                      <span className="absolute right-5 top-5 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-extrabold tracking-widest text-amber-950 shadow">BEST</span>
                    )}
                    <p className="relative text-[11px] font-bold uppercase tracking-widest text-white/60">{tier.sub}</p>
                    <p className="relative mt-0.5 text-[21px] font-extrabold text-white">{tier.name}</p>
                    <div className="relative mt-4 flex items-baseline gap-1">
                      <span className="text-[32px] font-extrabold leading-none tracking-tight text-white tabular-nums md:text-[38px]">{tier.price}</span>
                      <span className="text-[15px] font-semibold text-white/75">만원</span>
                      <span className="ml-1 text-[11px] text-white/45">VAT 별도</span>
                    </div>
                    <span className="relative mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[12px] font-bold text-white ring-1 ring-inset ring-white/20">
                      <Clock className="h-3.5 w-3.5" strokeWidth={2.2} />
                      {tier.duration} 소요
                    </span>
                  </div>

                  {/* 스펙 — 분량·수정 */}
                  <dl className="grid grid-cols-2 border-b border-brand-border">
                    {tier.specs.map((sp, k) => (
                      <div key={sp.label} className={`px-5 py-4 ${k === 0 ? "border-r border-brand-border" : ""}`}>
                        <dt className="text-[11px] font-extrabold uppercase tracking-widest text-brand-muted">{sp.label}</dt>
                        <dd className="mt-1 text-[13px] font-bold leading-snug text-brand-dark break-keep">{sp.value}</dd>
                      </div>
                    ))}
                  </dl>

                  {/* 포함 구성 */}
                  <div className="flex-1 px-6 py-5">
                    <p className="mb-3 text-[11px] font-extrabold uppercase tracking-widest text-brand-muted">포함 구성</p>
                    <ul className="space-y-2.5">
                      {tier.includes.map((inc) => {
                        const plus = tier.highlights.includes(inc);
                        return (
                          <li key={inc} className="flex items-center gap-2.5">
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                                plus ? "bg-amber-400 text-amber-950" : "bg-brand-primary-50 text-brand-primary"
                              }`}
                            >
                              <CheckIcon className="h-2.5 w-2.5" />
                            </span>
                            <span className="text-[13.5px] font-bold text-brand-dark">{inc}</span>
                            {plus && <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-700">추가</span>}
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* 추천 대상 */}
                  <div className="mx-6 mb-5 rounded-2xl bg-brand-lighter px-4 py-4">
                    <p className="mb-2 text-[11px] font-extrabold uppercase tracking-widest text-brand-muted">이런 분께 추천</p>
                    <ul className="space-y-1.5">
                      {tier.targets.map((t) => (
                        <li key={t} className="flex items-start gap-1.5 text-[12.5px] leading-snug text-brand-sub break-keep">
                          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-brand-primary/60" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="px-6 pb-6">
                    <Link
                      href={CONSULT_HREF}
                      className={`flex w-full items-center justify-center rounded-xl py-3 text-[15px] font-bold transition-opacity hover:opacity-85 ${
                        tier.best ? "text-white" : "bg-brand-primary-50 text-brand-primary"
                      }`}
                      style={tier.best ? { background: BLUE_BG } : undefined}
                    >
                      문의하기
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* 견적이 달라지는 조건 — 숫자만 크게 띄우고 조건을 안 적으면 오해를 만든다 */}
          <p className="mx-auto mt-8 max-w-[560px] text-center text-[12.5px] leading-relaxed text-brand-muted break-keep">
            작업기간은 피드백 속도 및 수정 횟수에 따라 달라질 수 있습니다. 가격은 VAT 별도이며, 도메인·호스팅은 별도 비용입니다.
          </p>
        </div>
      </section>

      {/* ── 7. FAQ ── 흰 밴드 */}
      <section className={LIGHT}>
        <div className="relative">
          <Reveal>
            <p className={`${EYEBROW} text-center`}>FAQ</p>
            <h2 className={`${H2} mt-4 text-center text-brand-dark`}>자주 묻는 질문</h2>
          </Reveal>

          <div className="mx-auto mt-12 max-w-[720px] space-y-2.5">
            {FAQS.map((faq, i) => {
              const open = openFaq === i;
              return (
                <Reveal key={faq.q} delay={i * 60}>
                  <div className={`overflow-hidden rounded-2xl border bg-white transition-colors ${open ? "border-brand-primary/30" : "border-brand-border"}`}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                      className="flex w-full cursor-pointer items-center gap-3.5 px-5 py-5 text-left md:px-6"
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[13px] font-black transition-colors ${
                          open ? "bg-brand-primary text-white" : "bg-brand-primary-50 text-brand-primary"
                        }`}
                      >
                        Q
                      </span>
                      <span className="flex-1 text-[15.5px] font-bold text-brand-dark break-keep md:text-[16.5px]">{faq.q}</span>
                      <svg
                        className={`h-5 w-5 shrink-0 text-brand-muted transition-transform duration-200 ${open ? "rotate-180 text-brand-primary" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {open && (
                      <p className="animate-be-fade border-t border-brand-border px-5 py-5 pl-[62px] text-[14.5px] leading-relaxed text-brand-sub break-keep md:px-6 md:pl-[66px]">
                        {faq.a}
                      </p>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 8. 마무리 ── 그레이 밴드 */}
      <section className={TINT}>
        <div className="relative text-center">
          <Reveal>
            <h2 className={`${H2} text-brand-dark`}>
              어떤 플랜이 맞는지
              <br />
              <span className="text-brand-primary">모르겠다면 먼저 물어보세요</span>
            </h2>
            <p className={LEAD}>분량·예산·일정만 알려 주시면 맞는 플랜을 골라 드립니다.</p>
            <div className="mt-9">
              <PillLink>상담 문의하기</PillLink>
            </div>
          </Reveal>
        </div>
      </section>
    </LandingShell>
  );
}
