"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  FileDown,
  LayoutTemplate,
  Mic,
  Palette,
  Quote,
  Ruler,
  Shapes,
  SwatchBook,
  Type,
  Clock,
  Compass,
  Layers,
  MessagesSquare,
  PenTool,
  Repeat,
  Shuffle,
  Tag,
  type LucideIcon,
} from "lucide-react";
import {
  CONSULT_HREF,
  LandingShell,
  Reveal,
  PillLink,
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

/* ── 히어로: 브랜딩이 필요한 이유 ───────────────
   한 줄에 "브랜딩 전 → 후"를 나란히 놓는다. 숫자 근거 없이 사장님이 겪는 장면으로 설득한다. */
const WHY: {
  icon: LucideIcon;
  before: string;
  beforeDesc: string;
  after: string;
  afterDesc: string;
}[] = [
  {
    icon: Tag,
    before: "가격으로만 비교됩니다",
    beforeDesc: "기억에 남을 이유가 없으면 고객은 더 싼 곳을 찾아 떠납니다.",
    after: "가격 말고도 고를 이유가 생깁니다",
    afterDesc: "브랜드만의 이야기와 인상이 고객의 선택 기준이 됩니다.",
  },
  {
    icon: Shuffle,
    before: "채널마다 다른 회사처럼 보입니다",
    beforeDesc:
      "스마트스토어, 인스타, 명함의 톤이 제각각이면 신뢰가 쌓이지 않습니다.",
    after: "어디서 봐도 같은 브랜드로 보입니다",
    afterDesc: "로고·컬러·말투가 모든 채널에서 하나로 맞춰집니다.",
  },
  {
    icon: Repeat,
    before: "만들 때마다 처음부터 고민합니다",
    beforeDesc:
      "상세페이지·배너·문구 하나까지 대표님이 매번 직접 정해야 합니다.",
    after: "가이드북 한 권이 기준이 됩니다",
    afterDesc: "누가 만들어도 같은 톤이 나오니 결정이 빨라집니다.",
  },
];

/* ── 01 비주얼: 브랜드 코어 시트 ────────────────
   예시 문장보다 "무엇을 정하는지"가 먼저 읽혀야 한다. 미션·비전 같은 항목 이름을 가장 크게, 뜻은 한 줄로만 둔다. */
const CORE_ITEMS: { en: string; ko: string; def: string }[] = [
  { en: "Mission", ko: "미션", def: "우리가 존재하는 이유" },
  { en: "Vision", ko: "비전", def: "브랜드가 도달할 미래" },
  { en: "Core value", ko: "핵심 가치", def: "모든 결정의 기준" },
  { en: "Target", ko: "타겟", def: "우리를 선택할 한 사람" },
  { en: "Positioning", ko: "포지셔닝", def: "경쟁 속 우리만의 자리" },
  { en: "Story", ko: "브랜드 스토리", def: "고객이 공감할 이야기" },
];

function StrategyBoard() {
  return (
    <div className="relative w-full max-w-[420px] pt-4">
      <span className="absolute -left-2 top-0 z-10 inline-flex -rotate-3 items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1.5 text-[11px] font-extrabold text-amber-950 shadow-lg">
        <Mic className="h-3.5 w-3.5" strokeWidth={2.4} />
        대표 인터뷰로 정리
      </span>

      <div className="overflow-hidden rounded-3xl border border-brand-border bg-white shadow-[0_30px_60px_-30px_rgba(36,82,235,.45)]">
        <div className="flex items-center justify-between border-b border-brand-border px-5 py-3.5">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-muted">
            Brand Core
          </p>
          <span className="rounded-md bg-brand-primary-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-primary">
            가이드북 1장
          </span>
        </div>

        <ul className="grid grid-cols-2 gap-2 p-4">
          {CORE_ITEMS.map((it, k) => (
            <li
              key={it.ko}
              className="relative rounded-2xl bg-brand-lighter px-3.5 pb-3.5 pt-3"
            >
              <span className="absolute right-3 top-3 text-[10px] font-black text-brand-primary/30 tabular-nums">
                {String(k + 1).padStart(2, "0")}
              </span>
              <p className="text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-brand-primary">
                {it.en}
              </p>
              <p className="mt-1 text-[18px] font-extrabold leading-tight tracking-tight text-brand-dark">
                {it.ko}
              </p>
              <p className="mt-1 text-[11.5px] font-medium text-brand-sub break-keep">
                {it.def}
              </p>
            </li>
          ))}
        </ul>

        {/* 슬로건 — 위 여섯 가지가 한 문장으로 압축된 결과 */}
        <div
          className="mx-4 mb-4 flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-white"
          style={{ background: BLUE_BG }}
        >
          <div className="flex items-center gap-2.5">
            <Quote className="h-5 w-5 shrink-0 text-white/60" strokeWidth={2} />
            <div>
              <p className="text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-white/60">
                Slogan
              </p>
              <p className="text-[18px] font-extrabold leading-tight">슬로건</p>
            </div>
          </div>
          <p className="text-right text-[11.5px] font-medium text-white/75 break-keep">
            한 문장으로 남는 약속
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── 특장점 섹션 데이터 ──────────────────────── */
// points 가 비어 있으면(01) 본문 아래 타일을 그리지 않는다 — 01은 오른쪽 코어 시트가 내용을 다 보여준다
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
    eyebrow: "Brand core",
    title: "디자인보다 먼저,\n브랜드의 뿌리를 정합니다",
    desc: "로고와 컬러는 결과물일 뿐입니다. 브랜드가 왜 존재하고, 무엇을 지키며, 누구에게 어떤 약속을 하는지. 이 근본이 정해져야 모든 디자인과 문구가 한 방향을 봅니다.",
    points: [],
    visual: <StrategyBoard />,
  },
  {
    no: "02",
    eyebrow: "Identity",
    title: "로고·컬러·폰트\n아이덴티티 설계",
    desc: "전략에서 도출한 키워드를 시각 언어로 변환합니다. 단순한 예쁜 로고가 아닌, 브랜드 방향성을 담은 아이덴티티입니다.",
    points: [
      { icon: Shapes, title: "로고 & 심볼" },
      { icon: Palette, title: "컬러 팔레트" },
      { icon: Type, title: "타이포그래피" },
      { icon: Layers, title: "적용 목업" },
    ],
    visual: (
      <div className="w-full max-w-[300px] space-y-3">
        <div className="flex items-center gap-3 rounded-2xl border border-brand-border bg-white p-4 shadow-[0_24px_48px_-24px_rgba(36,82,235,.35)]">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ background: BLUE_BG }}
          >
            <span className="text-[22px] font-extrabold text-white">B</span>
          </div>
          <div>
            <p className="text-[16px] font-extrabold tracking-tight text-gray-800">
              BRAND
            </p>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-gray-400">
              STUDIO
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-[0_24px_48px_-24px_rgba(36,82,235,.35)]">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-brand-muted">
            Color Palette
          </p>
          <div className="flex gap-2">
            {[
              { color: "#2452EB", name: "Primary" },
              { color: "#152C9E", name: "Dark" },
              { color: "#E7ECFF", name: "Light" },
              { color: "#F59E0B", name: "Accent" },
              { color: "#111D37", name: "Black" },
            ].map((c) => (
              <div key={c.name} className="flex-1">
                <div
                  className="mb-1 h-8 rounded-lg ring-1 ring-inset ring-black/5"
                  style={{ background: c.color }}
                />
                <p className="text-center text-[8px] font-bold text-gray-400">
                  {c.name}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-[0_24px_48px_-24px_rgba(36,82,235,.35)]">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-brand-muted">
            Typography
          </p>
          <div className="flex items-end gap-4">
            <p className="text-[34px] font-extrabold leading-none text-brand-dark">
              Aa
            </p>
            <div className="space-y-0.5 pb-0.5">
              <p className="text-[12px] font-bold text-brand-dark">
                Pretendard Bold
              </p>
              <p className="text-[11px] text-brand-muted">
                Headline · Body · Caption
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    no: "03",
    eyebrow: "Guidebook",
    title: "실무에서 바로 쓰는\n브랜드 가이드북",
    desc: "누가 디자인해도 같은 톤이 나오도록 브랜드 규칙을 문서화합니다. 직원 온보딩, 외주 업무 모두 가이드북 한 권으로 해결됩니다.",
    points: [
      { icon: Ruler, title: "로고 사용 규칙" },
      { icon: SwatchBook, title: "컬러·폰트 기준" },
      { icon: LayoutTemplate, title: "적용 예시" },
      { icon: FileDown, title: "PDF + Figma 납품" },
    ],
    visual: (
      <div
        className="w-full max-w-[300px] overflow-hidden rounded-2xl shadow-[0_24px_48px_-20px_rgba(7,15,73,.55)]"
        style={{ background: NAVY }}
      >
        <div className="px-5 pb-6 pt-5">
          <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/30">
            Brand Guidebook
          </p>
          <p className="mb-4 text-[20px] font-extrabold leading-tight text-white">
            브랜드가 일관되면
            <br />
            신뢰가 쌓입니다
          </p>
          {[
            "01. 브랜드 스토리",
            "02. 로고 사용 규칙",
            "03. 컬러 시스템",
            "04. 타이포그래피",
            "05. 디자인 적용 예시",
          ].map((item) => (
            <div key={item} className="mb-2 flex items-center gap-2">
              <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#8FB0FF]" />
              <span className="text-[12px] text-white/65">{item}</span>
            </div>
          ))}
          <div className="mt-4 flex items-center gap-2">
            <span className="rounded-lg bg-white/10 px-2 py-1 text-[10px] font-bold text-white/65">
              PDF
            </span>
            <span className="rounded-lg bg-white/10 px-2 py-1 text-[10px] font-bold text-white/65">
              Figma
            </span>
            <span className="rounded-lg bg-[#2452EB]/50 px-2 py-1 text-[10px] font-bold text-[#C9D8FF]">
              15–70p
            </span>
          </div>
        </div>
      </div>
    ),
  },
];

/* ── 프로세스 ───────────────────────────────── */
const PROCESS: {
  step: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  output: string;
}[] = [
  {
    step: "01",
    icon: MessagesSquare,
    title: "상담 & 인터뷰",
    desc: "브랜드 현황, 목표, 예산을 파악하고 플랜을 추천드립니다.",
    output: "인터뷰 정리",
  },
  {
    step: "02",
    icon: Compass,
    title: "전략 방향 설계",
    desc: "타겟, 포지셔닝, 스토리, 슬로건을 함께 정리합니다.",
    output: "전략 보드",
  },
  {
    step: "03",
    icon: PenTool,
    title: "시각 아이덴티티",
    desc: "로고, 컬러, 폰트 시안을 제작하고 피드백을 반영합니다.",
    output: "로고·컬러 시안",
  },
  {
    step: "04",
    icon: Layers,
    title: "적용 목업 제작",
    desc: "명함, SNS, 패키지 등 실제 환경에 적용한 시안을 보여드립니다.",
    output: "목업 시안",
  },
  {
    step: "05",
    icon: BookOpen,
    title: "가이드북 납품",
    desc: "PDF + Figma 파일로 최종 브랜드 가이드북을 납품합니다.",
    output: "브랜드 가이드북",
  },
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
    duration: "약 2주",
    bg: "linear-gradient(135deg,#5B6B8C 0%,#3C4A66 100%)",
    best: false,
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
    duration: "약 3주",
    bg: BLUE_BG,
    best: false,
    targets: [
      "신규 브랜드 런칭을 준비 중인 스타트업 / 소규모 기업",
      "방향성은 필요하지만 풀 시스템까지는 과하지 않은 단계",
      "브랜드 톤을 빠르게 정리하고 시장에 나가야 하는 경우",
      "대표 의사결정 중심으로 빠른 진행을 원하는 브랜드",
    ],
    sections: [
      { label: "전략 컨설팅", detail: null },
      {
        label: "Brand Identity 핵심 설계",
        detail: "브랜드 컨셉 · 타겟 · 스토리 · 슬로건",
      },
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
    duration: "약 6주",
    bg: NAVY,
    best: true,
    targets: [
      "브랜드를 장기 자산으로 만들고 싶은 기업",
      "투자 유치 · 프랜차이즈 · 유통 입점 등 확장 계획이 명확한 브랜드",
      "마케팅·디자인을 체계적으로 운영할 내부 팀 보유 또는 예정인 브랜드",
      "브랜드 전략과 기준이 필요한 대표",
    ],
    sections: [
      { label: "전략 컨설팅", detail: null },
      {
        label: "Brand Identity 설계",
        detail: "비전·미션·핵심가치 · 타겟 · 포지셔닝 · 스토리 · 슬로건",
      },
      {
        label: "로고 & 심볼 디자인",
        detail: "최초 시안 3안 · 무제한 디벨롭 수정",
      },
      {
        label: "디자인 시스템",
        detail: "컬러 · 타이포 · 그래픽 규칙 · 목업 시안 15종",
      },
      { label: "명함 디자인", detail: null },
      { label: "브랜드 가이드북", detail: "약 50–70p" },
    ],
  },
];

export default function BrandingPage() {
  // 한 번에 하나만 열리게 둔다 — 다 펼쳐 두면 질문 목록을 훑는 이점이 사라진다
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <LandingShell
      railTitle={
        <>
          Total 브랜딩,
          <br />
          상담으로 시작
        </>
      }
    >
      {/* ── 1. 히어로 ── 흰 밴드 · 중앙 정렬 */}
      <section
        className={LIGHT}
        style={{
          backgroundImage:
            "radial-gradient(120% 90% at 50% -10%, rgba(36,82,235,.07), transparent 60%)",
        }}
      >
        <div className="relative text-center">
          <Reveal>
            <p className={EYEBROW}>Total branding</p>
            <h2 className={`${H2} mt-4 text-brand-dark`}>
              로고 하나가 아니라
              <br />
              <span className="text-brand-primary">
                브랜드 전체를 설계합니다
              </span>
            </h2>
            <p className={LEAD}>
              전략·아이덴티티·가이드북까지, 브랜드의 처음부터 끝을 함께
              설계합니다.
            </p>
          </Reveal>

          {/* 브랜딩이 필요한 이유 — 한 보드 안에서 줄마다 전/후를 나란히 비교한다 */}
          <Reveal delay={140}>
            <div className="relative mx-auto mt-14 max-w-[920px] overflow-hidden rounded-[28px] border border-brand-border bg-white text-left shadow-[0_30px_60px_-36px_rgba(15,23,42,.45)]">
              {/* 데스크톱: 오른쪽 절반을 통째로 블루로 칠해 줄 사이 이음매가 안 보이게 한다 */}
              <div
                className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 md:block"
                style={{ background: BLUE_BG }}
                aria-hidden
              >
                <span className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                <span className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-[#8FB0FF]/20 blur-3xl" />
              </div>

              {/* 헤더 */}
              <div className="relative hidden grid-cols-2 md:grid">
                <div className="flex items-center gap-2 px-8 pb-2 pt-7">
                  <span className="rounded-full bg-slate-200/70 px-2.5 py-1 text-[11px] font-extrabold tracking-widest text-slate-500">
                    BEFORE
                  </span>
                  <span className="text-[13px] font-bold text-brand-muted">
                    브랜드가 정리되지 않으면
                  </span>
                </div>
                <div className="flex items-center gap-2 px-8 pb-2 pt-7">
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold tracking-widest text-brand-primary">
                    AFTER
                  </span>
                  <span className="text-[13px] font-bold text-white/75">
                    블루에그 브랜딩 후
                  </span>
                </div>
              </div>

              <div className="relative md:pb-4">
                {WHY.map((w, i) => {
                  const Icon = w.icon;
                  return (
                    <div
                      key={w.before}
                      className={`relative grid md:grid-cols-2 ${i > 0 ? "border-t border-brand-border md:border-t-0" : ""}`}
                    >
                      {/* 전 */}
                      <div
                        className={`flex gap-4 px-6 py-6 md:px-8 md:py-5 ${i > 0 ? "md:border-t md:border-dashed md:border-brand-border" : ""}`}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                          <Icon className="h-5 w-5" strokeWidth={1.9} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[16px] font-extrabold leading-snug text-slate-500 break-keep md:text-[17px]">
                            {w.before}
                          </p>
                          <p className="mt-1 text-[13.5px] leading-relaxed text-brand-muted break-keep">
                            {w.beforeDesc}
                          </p>
                        </div>
                      </div>

                      {/* 후 — 모바일에서는 줄마다 자기 블루 면을 가진다 */}
                      <div
                        className={`relative flex gap-4 bg-gradient-to-br from-[#2A5EFF] via-[#2452EB] to-[#1B3AC4] px-6 py-6 md:bg-none md:px-8 md:py-5 ${
                          i > 0
                            ? "md:border-t md:border-dashed md:border-white/15"
                            : ""
                        }`}
                      >
                        {/* 전→후 화살표 — 두 칸 경계에 걸친다 */}
                        <span className="absolute -top-4 left-6 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-brand-primary shadow-[0_6px_16px_-6px_rgba(7,15,73,.6)] ring-4 ring-white/40 md:-left-4 md:top-1/2 md:-translate-y-1/2">
                          <ArrowRight
                            className="h-4 w-4 rotate-90 md:rotate-0"
                            strokeWidth={2.6}
                          />
                        </span>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-primary shadow-[0_8px_18px_-8px_rgba(7,15,73,.6)]">
                          <Check className="h-5 w-5" strokeWidth={2.6} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[16px] font-extrabold leading-snug text-white break-keep md:text-[17px]">
                            {w.after}
                          </p>
                          <p className="mt-1 text-[13.5px] leading-relaxed text-white/75 break-keep">
                            {w.afterDesc}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>
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
                <h2
                  className={`${H2} mt-5 whitespace-pre-line text-brand-dark`}
                >
                  {f.title}
                </h2>
                <p className="mt-5 text-[15px] leading-relaxed text-brand-sub break-keep md:text-[16.5px]">
                  {f.desc}
                </p>
                {f.points.length > 0 && (
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
                            <Icon
                              className="h-[18px] w-[18px]"
                              strokeWidth={2}
                            />
                          </span>
                          <p className="text-[14.5px] font-extrabold leading-snug text-brand-dark break-keep">
                            {pt.title}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Reveal>

              <Reveal delay={120} className={flip ? "md:order-1" : ""}>
                {/* 비주얼 무대 — 점 격자 위에 카드를 올려 작업물처럼 보이게 한다 */}
                <div
                  className={`relative flex justify-center overflow-hidden rounded-[28px] px-6 py-10 md:py-12 ${flip ? "bg-brand-lighter" : "bg-white"}`}
                  style={{
                    backgroundImage:
                      "radial-gradient(rgba(36,82,235,.10) 1px, transparent 1px)",
                    backgroundSize: "18px 18px",
                  }}
                >
                  <span
                    className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-brand-primary/10 blur-3xl"
                    aria-hidden
                  />
                  <div className="relative flex w-full justify-center">
                    {f.visual}
                  </div>
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
            <h2 className={`${H2} mt-4 text-white`}>인터뷰부터 가이드북까지</h2>
            <p className={LEAD_ON_DARK}>
              디자인을 그리기 전에, 브랜드가 무슨 말을 할지부터 정리합니다.
            </p>
          </Reveal>

          {/* 데스크톱: 레일 위 스텝 노드 + 카드. 마지막 산출물(가이드북)을 가장 밝게 띄운다 */}
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
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                            last
                              ? "text-white"
                              : "bg-white/15 text-white ring-1 ring-inset ring-white/20"
                          }`}
                          style={last ? { background: BLUE_BG } : undefined}
                        >
                          <Icon className="h-5 w-5" strokeWidth={1.8} />
                        </span>
                        <p
                          className={`mt-3.5 text-[15px] font-extrabold leading-snug break-keep ${last ? "text-brand-dark" : "text-white"}`}
                        >
                          {pr.title}
                        </p>
                        <p
                          className={`mb-4 mt-1.5 text-[12.5px] leading-relaxed break-keep ${last ? "text-brand-sub" : "text-white/65"}`}
                        >
                          {pr.desc}
                        </p>
                        <span
                          className={`mt-auto inline-flex rounded-full px-2.5 py-1 text-[11.5px] font-bold break-keep ${
                            last
                              ? "bg-brand-primary text-white"
                              : "bg-white/10 text-white/85 ring-1 ring-inset ring-white/15"
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
                    {i < PROCESS.length - 1 && (
                      <div className="-mb-3 w-px flex-1 bg-gradient-to-b from-white/40 to-white/10" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 rounded-2xl border border-white/15 bg-white/[0.08] p-4">
                    <p className="flex items-center gap-1.5 text-[15px] font-extrabold text-white break-keep">
                      <Icon
                        className="h-4 w-4 shrink-0 text-white/80"
                        strokeWidth={2}
                      />
                      {pr.title}
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-white/65 break-keep">
                      {pr.desc}
                    </p>
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
            <h2 className={`${H2} mt-4 text-center text-brand-dark`}>
              플랜 선택
            </h2>
            <p className={LEAD}>
              브랜드 단계와 예산에 맞는 플랜을 고르시면 됩니다.
            </p>
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
                  <div
                    className="relative overflow-hidden px-6 pb-7 pt-6"
                    style={{ background: tier.bg }}
                  >
                    <span
                      className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl"
                      aria-hidden
                    />
                    {tier.best && (
                      <span className="absolute right-5 top-5 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-extrabold tracking-widest text-amber-950 shadow">
                        BEST
                      </span>
                    )}
                    <p className="relative text-[11px] font-bold uppercase tracking-widest text-white/60">
                      {tier.sub}
                    </p>
                    <p className="relative mt-0.5 text-[21px] font-extrabold text-white">
                      {tier.name}
                    </p>
                    <div className="relative mt-4 flex items-baseline gap-1">
                      <span className="text-[32px] font-extrabold leading-none tracking-tight text-white tabular-nums md:text-[38px]">
                        {tier.price}
                      </span>
                      <span className="text-[15px] font-semibold text-white/75">
                        만원
                      </span>
                      <span className="ml-1 text-[11px] text-white/45">
                        VAT 별도
                      </span>
                    </div>
                    <span className="relative mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[12px] font-bold text-white ring-1 ring-inset ring-white/20">
                      <Clock className="h-3.5 w-3.5" strokeWidth={2.2} />
                      {tier.duration} 소요
                    </span>
                  </div>

                  {/* 구성 */}
                  <div className="flex-1 px-6 py-5">
                    <p className="mb-3 text-[11px] font-extrabold uppercase tracking-widest text-brand-muted">
                      구성
                    </p>
                    <ul className="space-y-2.5">
                      {tier.sections.map((s) => (
                        <li key={s.label} className="flex items-start gap-2.5">
                          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-primary-50 text-brand-primary">
                            <CheckIcon className="h-2.5 w-2.5" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[13.5px] font-bold leading-snug text-brand-dark break-keep">
                              {s.label}
                            </p>
                            {s.detail && (
                              <p className="mt-0.5 text-[12px] leading-snug text-brand-muted break-keep">
                                {s.detail}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 추천 대상 */}
                  <div className="mx-6 mb-5 rounded-2xl bg-brand-lighter px-4 py-4">
                    <p className="mb-2 text-[11px] font-extrabold uppercase tracking-widest text-brand-muted">
                      이런 분께 추천
                    </p>
                    <ul className="space-y-1.5">
                      {tier.targets.map((t) => (
                        <li
                          key={t}
                          className="flex items-start gap-1.5 text-[12.5px] leading-snug text-brand-sub break-keep"
                        >
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
                        tier.best
                          ? "text-white"
                          : "bg-brand-primary-50 text-brand-primary"
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
            작업기간은 피드백 속도 및 수정 횟수에 따라 달라질 수 있습니다.
            가격은 VAT 별도이며, 세부 범위에 따라 변동될 수 있습니다.
          </p>
        </div>
      </section>

      {/* ── 7. FAQ ── 흰 밴드 */}
      <section className={LIGHT}>
        <div className="relative">
          <Reveal>
            <p className={`${EYEBROW} text-center`}>FAQ</p>
            <h2 className={`${H2} mt-4 text-center text-brand-dark`}>
              자주 묻는 질문
            </h2>
          </Reveal>

          <div className="mx-auto mt-12 max-w-[720px] space-y-2.5">
            {FAQS.map((faq, i) => {
              const open = openFaq === i;
              return (
                <Reveal key={faq.q} delay={i * 60}>
                  <div
                    className={`overflow-hidden rounded-2xl border bg-white transition-colors ${open ? "border-brand-primary/30" : "border-brand-border"}`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                      className="flex w-full cursor-pointer items-center gap-3.5 px-5 py-5 text-left md:px-6"
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[13px] font-black transition-colors ${
                          open
                            ? "bg-brand-primary text-white"
                            : "bg-brand-primary-50 text-brand-primary"
                        }`}
                      >
                        Q
                      </span>
                      <span className="flex-1 text-[15.5px] font-bold text-brand-dark break-keep md:text-[16.5px]">
                        {faq.q}
                      </span>
                      <svg
                        className={`h-5 w-5 shrink-0 text-brand-muted transition-transform duration-200 ${open ? "rotate-180 text-brand-primary" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
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
              <span className="text-brand-primary">
                모르겠다면 먼저 물어보세요
              </span>
            </h2>
            <p className={LEAD}>
              브랜드 단계와 예산만 알려 주시면 맞는 플랜을 골라 드립니다.
            </p>
            <div className="mt-9">
              <PillLink>상담 문의하기</PillLink>
            </div>
          </Reveal>
        </div>
      </section>
    </LandingShell>
  );
}
