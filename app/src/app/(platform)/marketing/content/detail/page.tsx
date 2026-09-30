"use client";

import { useState } from "react";
import {
  Camera,
  ClipboardList,
  Download,
  Eye,
  FileStack,
  FileText,
  Hand,
  ImageIcon,
  Lightbulb,
  MessagesSquare,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Timer,
  TrendingUp,
  Upload,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import {
  LandingShell,
  Reveal,
  PillLink,
  CountUp,
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
const HERO_STATS: {
  icon: LucideIcon;
  label: string;
  value: number;
  unit: string;
}[] = [
  { icon: FileStack, label: "누적 상세페이지 제작", value: 1200, unit: "건+" },
  { icon: TrendingUp, label: "평균 전환율 개선", value: 34, unit: "%" },
  { icon: Timer, label: "최단 납품 기간", value: 7, unit: "일" },
];

/* ── 구매 결정 흐름 ──────────────────────────────
   상세페이지 기획의 뼈대. 고객이 위에서 아래로 스크롤하며 거치는 마음의 순서이고,
   각 단계의 속마음(voice)에 답하는 섹션을 배치한다. */
const BUY_FLOW: {
  key: string;
  icon: LucideIcon;
  mind: string;
  voice: string;
  section: string;
}[] = [
  {
    key: "stop",
    icon: Hand,
    mind: "멈춘다",
    voice: "어? 이거 뭐지?",
    section: "후킹 카피 · 대표 이미지",
  },
  {
    key: "relate",
    icon: MessagesSquare,
    mind: "공감한다",
    voice: "맞아, 나도 이게 불편했어",
    section: "고객의 문제 · 불편",
  },
  {
    key: "trust",
    icon: Lightbulb,
    mind: "확신한다",
    voice: "이거라면 해결되겠다",
    section: "해결 방법 · 특장점 · 근거",
  },
  {
    key: "relief",
    icon: ShieldCheck,
    mind: "안심한다",
    voice: "다들 만족했네",
    section: "후기 · 인증 · 비교",
  },
  {
    key: "buy",
    icon: ShoppingCart,
    mind: "구매한다",
    voice: "지금 사야겠다",
    section: "혜택 · 구성 · 구매 버튼",
  },
];

/* ── 히어로 목업 — 폰 안에서 긴 상세페이지가 흘러간다 ───── */
const CARD_SHADOW = "shadow-[0_28px_56px_-20px_rgba(7,15,73,.6)]";

function LongPage() {
  // 섹션 블록 — 높이 차이로 "롱폼"의 리듬을 만든다
  return (
    <div>
      {/* 멈춘다 — 후킹 */}
      <div
        className="relative h-[190px] overflow-hidden px-3 pt-4 text-white"
        style={{ background: NAVY }}
      >
        <span className="absolute -right-6 top-8 h-28 w-28 rounded-full bg-[#2A5EFF]/60 blur-2xl" />
        <p className="relative text-[7px] font-bold tracking-[0.2em] text-[#8FB0FF]">
          NEW ARRIVAL
        </p>
        <p className="relative mt-1 text-[13px] font-extrabold leading-tight">
          아침이 달라지는
          <br />단 한 잔
        </p>
        <div className="relative mx-auto mt-3 h-20 w-16 rounded-t-[26px] rounded-b-lg bg-gradient-to-b from-white/90 to-white/50 shadow-lg" />
      </div>
      {/* 공감한다 — 문제 */}
      <div className="bg-white px-3 py-4">
        <p className="text-[7px] font-extrabold text-brand-primary">
          혹시 이런 고민 있으세요?
        </p>
        {["아침마다 속이 더부룩하다", "커피는 부담스럽다"].map((t) => (
          <div
            key={t}
            className="mt-1.5 flex items-center gap-1 rounded-md bg-brand-lighter px-1.5 py-1"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            <span className="text-[7px] font-bold text-brand-dark">{t}</span>
          </div>
        ))}
      </div>
      {/* 확신한다 — 특장점 */}
      <div className="bg-brand-lighter px-3 py-4">
        <p className="text-[7px] font-extrabold text-brand-primary">
          POINT 01 · 02 · 03
        </p>
        <div className="mt-2 grid grid-cols-3 gap-1">
          {["#DCE5FF", "#E7ECFF", "#F1F4FF"].map((c, k) => (
            <div
              key={c}
              className="flex h-14 flex-col items-center justify-center rounded-md"
              style={{ background: c }}
            >
              <span className="h-5 w-5 rounded-full bg-white" />
              <span className="mt-1 text-[6px] font-extrabold text-brand-primary">
                0{k + 1}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 h-16 rounded-md bg-gradient-to-br from-[#2A5EFF]/25 to-[#152C9E]/25" />
      </div>
      {/* 안심한다 — 후기 */}
      <div className="bg-white px-3 py-4">
        <p className="text-[7px] font-extrabold text-brand-primary">
          실제 구매 후기
        </p>
        {[0, 1].map((k) => (
          <div
            key={k}
            className="mt-1.5 rounded-md border border-brand-border p-1.5"
          >
            <p className="text-[7px] text-amber-400">★★★★★</p>
            <span className="mt-0.5 block h-1 w-4/5 rounded-full bg-brand-border" />
          </div>
        ))}
      </div>
      {/* 구매한다 — CTA */}
      <div className="bg-brand-lighter px-3 pb-5 pt-4">
        <p className="text-[7px] font-extrabold text-brand-dark">
          지금 구매 시 1+1 혜택
        </p>
        <div
          className="mt-2 rounded-md py-1.5 text-center text-[8px] font-extrabold text-white"
          style={{ background: BLUE_BG }}
        >
          구매하기
        </div>
      </div>
    </div>
  );
}

function DetailMockup() {
  // 620×400 캔버스를 그대로 두고 좁은 화면에서는 통째로 축소한다
  return (
    <div
      className="relative mx-auto h-[240px] w-full max-w-[620px] select-none sm:h-[400px]"
      aria-hidden
    >
      <div className="absolute left-1/2 top-0 h-[400px] w-[620px] -translate-x-1/2 origin-top scale-[.58] sm:scale-100">
        {/* PC — 쇼핑몰 PC 화면처럼 가운데 상세 영역만 흘러간다 */}
        <div
          className={`absolute left-0 top-[10px] w-[500px] overflow-hidden rounded-2xl bg-white ${CARD_SHADOW}`}
        >
          <div className="flex items-center gap-3 border-b border-brand-border bg-brand-lighter px-3.5 py-2.5">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex h-6 flex-1 items-center rounded-md bg-white px-2.5 ring-1 ring-inset ring-brand-border">
              <span className="text-[10.5px] font-medium text-brand-sub">
                smartstore.naver.com/mybrand
              </span>
            </div>
          </div>
          <div className="relative flex h-[340px] justify-center overflow-hidden bg-slate-100">
            <div className="w-[250px] bg-white shadow-[0_0_0_1px_rgba(15,23,42,.05)]">
              <div
                className="animate-scroll-y"
                style={{ animationDuration: "28s" }}
              >
                <LongPage />
                <LongPage />
              </div>
            </div>
          </div>
        </div>

        {/* 모바일 — PC 오른쪽에 겹쳐 선다 */}
        <div
          className={`absolute right-0 top-[40px] z-10 w-[170px] overflow-hidden rounded-[30px] border-[6px] border-brand-dark bg-white ${CARD_SHADOW}`}
        >
          <div className="relative z-10 flex items-center justify-between bg-white px-3 pb-1.5 pt-2">
            <span className="h-1.5 w-10 rounded-full bg-brand-dark" />
            <span className="text-[8px] font-extrabold text-brand-muted">
              스마트스토어
            </span>
          </div>
          <div className="relative h-[310px] overflow-hidden">
            <div className="animate-scroll-y">
              <LongPage />
              <LongPage />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 특장점 비주얼 ───────────────────────────── */
// 01 — 구매 전환 퍼널. 아래로 갈수록 좁아지고 짙어져 "읽는 사람이 사는 사람이 되는" 흐름을 보여 준다.
//      각 단 왼쪽은 고객의 속마음, 가운데는 그 마음에 답하는 섹션.
const FUNNEL_STYLE = [
  { w: "100%", bg: "#F1F4FF", dark: false },
  { w: "94%", bg: "#E3E9FF", dark: false },
  { w: "88%", bg: "#C9D6FF", dark: false },
  { w: "82%", bg: "#5B84FF", dark: true },
  { w: "76%", bg: BLUE_BG, dark: true },
];

function FlowBlueprint() {
  return (
    <div className="w-full max-w-[380px] rounded-3xl border border-brand-border bg-white p-5 shadow-[0_30px_60px_-30px_rgba(36,82,235,.45)]">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-muted">
          Conversion funnel
        </p>
        <span className="rounded-md bg-brand-primary-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-primary">
          속마음 → 섹션
        </span>
      </div>

      <ol className="mt-4 flex flex-col items-center gap-1.5">
        {BUY_FLOW.map((b, i) => {
          const Icon = b.icon;
          const st = FUNNEL_STYLE[i];
          return (
            <li
              key={b.key}
              className="rounded-2xl px-3.5 py-3"
              style={{ width: st.w, background: st.bg }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${st.dark ? "bg-white/20 text-white" : "bg-white text-brand-primary shadow-sm"}`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.3} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p
                      className={`text-[14px] font-extrabold leading-tight ${st.dark ? "text-white" : "text-brand-dark"}`}
                    >
                      {b.mind}
                    </p>
                    <p
                      className={`truncate text-[11px] font-bold ${st.dark ? "text-white/75" : "text-brand-primary"}`}
                    >
                      “{b.voice}”
                    </p>
                  </div>
                  <p
                    className={`mt-0.5 text-[10.5px] font-medium ${st.dark ? "text-white/65" : "text-brand-muted"}`}
                  >
                    {b.section}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* 퍼널 끝 — 결과 */}
      <div className="mt-3 flex items-center justify-center gap-1.5 text-[11.5px] font-extrabold text-brand-primary">
        <span className="h-px w-8 bg-brand-primary/30" />
        읽는 사람이 사는 사람이 됩니다
        <span className="h-px w-8 bg-brand-primary/30" />
      </div>
    </div>
  );
}

// 02 — AI로 만드는 연출컷 네 가지. 실제 사진(Unsplash)을 쓰되 브랜드 로고가 크게 보이는 컷은 피했다.
const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?w=360&h=360&fit=crop&q=70`;
const AI_SHOTS = [
  { label: "제품 단독컷", src: unsplash("1523275335684-37898b6baf30") },
  { label: "라이프스타일", src: unsplash("1612817288484-6f916006741a") },
  { label: "배경 합성", src: unsplash("1629198688000-71f23e745b6e") },
  { label: "인포그래픽", src: unsplash("1620916566398-39f1143ab7be"), info: true },
];

function AiImageGrid() {
  return (
    <div className="w-full max-w-[340px] rounded-3xl border border-brand-border bg-white p-5 shadow-[0_30px_60px_-30px_rgba(36,82,235,.45)]">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-muted">AI images</p>
        <span className="inline-flex items-center gap-1 rounded-md bg-brand-primary-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-primary">
          <Camera className="h-3 w-3" strokeWidth={2.4} />
          촬영 없이
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {AI_SHOTS.map((s) => (
          <div key={s.label}>
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-brand-lighter">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt={s.label} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              {s.info && (
                // 인포그래픽 — 사진 위에 특징 콜아웃을 얹는다
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/55 via-transparent to-transparent">
                  <span className="absolute left-2 top-2 rounded-md bg-brand-primary px-1.5 py-0.5 text-[9px] font-extrabold text-white shadow">POINT 01</span>
                  <span className="absolute right-2 top-[38%] rounded-full bg-white/95 px-2 py-0.5 text-[9.5px] font-extrabold text-brand-dark shadow">24h 보습</span>
                  <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2 py-0.5 text-[9.5px] font-extrabold text-brand-dark shadow">저자극 테스트 완료</span>
                </div>
              )}
            </div>
            <p className="mt-1.5 text-center text-[11.5px] font-bold text-brand-sub">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// 03 — 포트폴리오 월. 1,200건이라는 숫자를 실제 작업물이 쌓인 벽으로 보여 준다
const PORTFOLIO = [
  "1523275335684-37898b6baf30",
  "1612817288484-6f916006741a",
  "1629198688000-71f23e745b6e",
  "1620916566398-39f1143ab7be",
  "1505740420928-5e560c06d30e",
];

function PortfolioWall() {
  return (
    <div className="w-full max-w-[340px] rounded-3xl border border-brand-border bg-white p-5 shadow-[0_30px_60px_-30px_rgba(36,82,235,.45)]">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-muted">Portfolio</p>
          <p className="mt-1.5 text-[34px] font-extrabold leading-none tracking-tight text-brand-dark tabular-nums">
            <CountUp to={1200} />
            <span className="ml-1 text-[15px] font-extrabold text-brand-primary">건+</span>
          </p>
        </div>
        <span className="mb-1 rounded-md bg-brand-primary-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-primary">누적 제작</span>
      </div>

      {/* 미니 상세페이지 썸네일 — 사진 + 본문 줄 */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {PORTFOLIO.map((id) => (
          <div key={id} className="overflow-hidden rounded-xl border border-brand-border bg-white">
            <div className="relative aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={unsplash(id)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <div className="space-y-1 p-1.5">
              <span className="block h-1 w-4/5 rounded-full bg-brand-border-strong" />
              <span className="block h-1 w-3/5 rounded-full bg-brand-border" />
              <span className="block h-3 w-full rounded bg-brand-lighter" />
            </div>
          </div>
        ))}
        <div className="flex flex-col items-center justify-center rounded-xl text-white" style={{ background: BLUE_BG }}>
          <p className="text-[18px] font-extrabold tabular-nums">+1,195</p>
          <p className="text-[9.5px] font-bold text-white/70">건 더</p>
        </div>
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
    eyebrow: "Planning",
    title: "예쁜 페이지가 아니라\n팔리는 구조를 만듭니다",
    desc: "고객은 멈추고, 공감하고, 확신하고, 안심해야 구매합니다. 이 순서대로 섹션과 카피를 쌓아 끝까지 읽히고 결국 사게 만듭니다.",
    points: [],
    visual: <FlowBlueprint />,
  },
  {
    no: "02",
    eyebrow: "AI image",
    title: "촬영 없이도\n제품이 돋보이게",
    desc: "AI 이미지 생성이 기본 포함됩니다. 가진 사진 한 장으로 연출컷·배경 합성·인포그래픽까지 만들어 냅니다.",
    points: [
      { icon: Wand2, title: "컨셉 배경 생성" },
      { icon: ImageIcon, title: "라이프스타일 연출" },
      { icon: Upload, title: "촬영본 업그레이드" },
      { icon: FileText, title: "썸네일·대표이미지" },
    ],
    visual: <AiImageGrid />,
  },
  {
    no: "03",
    eyebrow: "Experience",
    title: "만들어 본 사람들만이\n압니다",
    desc: "1,200건의 상세페이지를 만들며 무엇이 팔리고 무엇이 안 팔리는지 쌓아 왔습니다. 처음 만드는 제품도 이미 검증된 구조 위에서 시작합니다.",
    points: [
      { icon: Lightbulb, title: "카테고리별 노하우" },
      { icon: ShieldCheck, title: "검증된 섹션 구조" },
      { icon: TrendingUp, title: "팔리는 패턴 데이터" },
      { icon: Timer, title: "빠른 방향 설정" },
    ],
    visual: <PortfolioWall />,
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
    title: "상담 & 제품 분석",
    desc: "제품 종류·판매 채널·경쟁사를 파악하고 맞는 구성을 제안드립니다.",
    output: "제품 분석",
  },
  {
    step: "02",
    icon: ClipboardList,
    title: "기획 & 설계",
    desc: "구매 흐름에 맞는 섹션 구성과 핵심 카피 방향을 설계합니다.",
    output: "와이어프레임",
  },
  {
    step: "03",
    icon: Sparkles,
    title: "AI 이미지 제작",
    desc: "제품 이미지, 배경 합성, 라이프스타일 이미지를 AI로 제작합니다.",
    output: "연출 이미지",
  },
  {
    step: "04",
    icon: Eye,
    title: "시안 & 수정",
    desc: "기획안 기반으로 풀 디자인 시안을 제작하고 피드백을 반영합니다.",
    output: "디자인 시안",
  },
  {
    step: "05",
    icon: Download,
    title: "최종 납품",
    desc: "Figma 소스와 쇼핑몰 업로드용 이미지 파일을 납품합니다.",
    output: "업로드 파일",
  },
];

/* ── FAQ ────────────────────────────────────── */
const FAQS = [
  {
    q: "제품 사진이 없어도 제작이 가능한가요?",
    a: "네, AI 이미지 생성이 기본 포함되어 있어 별도 촬영 없이도 고퀄리티 이미지를 제작할 수 있습니다. 기존 제품 사진이 있다면 더 좋은 결과물을 만들 수 있습니다.",
  },
  {
    q: "스마트스토어·쿠팡 등 쇼핑몰에 바로 올릴 수 있나요?",
    a: "Figma 파일과 최적화된 이미지 파일로 납품됩니다. 쇼핑몰 등록용 PNG/JPG 파일도 함께 제공되어 바로 업로드할 수 있습니다.",
  },
  {
    q: "분량은 어떻게 책정되나요?",
    a: "제품 특성에 따라 약 6–7섹션(20,000px+)부터 15섹션 이상(50,000px+)까지 구성합니다. 상담 시 맞는 분량을 제안드립니다.",
  },
  {
    q: "디자인 수정은 몇 번까지 가능한가요?",
    a: "분량에 따라 2–4회 수정이 포함됩니다. 기획 단계와 디자인 단계로 나누어 진행합니다.",
  },
];

export default function DetailPage() {
  // 한 번에 하나만 열리게 둔다 — 다 펼쳐 두면 질문 목록을 훑는 이점이 사라진다
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <LandingShell
      railTitle={
        <>
          상세페이지 제작,
          <br />
          상담으로 시작
        </>
      }
    >
      {/* ── 1. 히어로 ── 흰 밴드 · 중앙 정렬, 아래는 블루 무대 위 목업 */}
      <section
        className={`${LIGHT} pb-0 md:pb-0`}
        style={{
          backgroundImage:
            "radial-gradient(120% 90% at 50% -10%, rgba(36,82,235,.07), transparent 60%)",
        }}
      >
        <div className="relative text-center">
          <Reveal>
            <p className={EYEBROW}>Detail page</p>
            <h2 className={`${H2} mt-4 text-brand-dark`}>
              팔리는 상세페이지,
              <br />
              <span className="text-brand-primary">기획이 먼저입니다</span>
            </h2>
            <p className={LEAD}>
              고객이 멈추고, 공감하고, 확신하고, 구매하는 순서대로.
              스마트스토어·쿠팡·자사몰 어디에나 맞게 만들어 드립니다.
            </p>
          </Reveal>

          {/* 목업 무대 — 블루 면이 밴드 바닥까지 내려와 다음 섹션과 이어진다 */}
          <Reveal delay={220}>
            <div className="relative mx-auto mt-12 max-w-[760px]">
              <div
                className="absolute inset-x-0 bottom-0 top-16 overflow-hidden rounded-t-[36px] sm:top-28"
                style={{ background: "var(--gradient-point)" }}
              >
                <span
                  className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl"
                  aria-hidden
                />
                <span
                  className="pointer-events-none absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-[#8FB0FF]/20 blur-3xl"
                  aria-hidden
                />
                <span
                  className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  aria-hidden
                />
                <span
                  className="pointer-events-none absolute inset-0 opacity-60"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                    maskImage: "linear-gradient(180deg, #000 30%, transparent)",
                    WebkitMaskImage:
                      "linear-gradient(180deg, #000 30%, transparent)",
                  }}
                  aria-hidden
                />
              </div>
              <div className="relative px-4 pb-8 sm:pb-10">
                <DetailMockup />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 지표 밴드 ── 히어로의 블루 무대 바로 아래, 네이비 띠 위에 숫자만 크게 */}
      <section
        className="relative overflow-hidden px-7 py-12 text-white md:px-14 md:py-14"
        style={{ background: NAVY }}
      >
        <span
          className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-[#2A5EFF]/30 blur-3xl"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute -bottom-24 right-0 h-56 w-56 rounded-full bg-[#8FB0FF]/15 blur-3xl"
          aria-hidden
        />
        <div className="relative grid gap-8 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-white/10">
          {HERO_STATS.map((st, i) => {
            const Icon = st.icon;
            return (
              <Reveal key={st.label} delay={i * 90}>
                <div className="flex items-center gap-4 sm:flex-col sm:gap-0 sm:px-4 sm:text-center">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#8FB0FF] ring-1 ring-inset ring-white/15">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div className="sm:mt-4">
                    <p className="text-[34px] font-extrabold leading-none tracking-tight tabular-nums md:text-[44px]">
                      <CountUp to={st.value} />
                      <span className="ml-1 align-baseline text-[16px] font-extrabold text-[#8FB0FF] md:text-[20px]">
                        {st.unit}
                      </span>
                    </p>
                    <p className="mt-2 text-[13px] font-semibold text-white/60 break-keep">
                      {st.label}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
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
                {/* points 가 비어 있으면(01) 타일을 그리지 않는다 — 01은 오른쪽 퍼널이 내용을 다 보여준다 */}
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
                          <p className="text-[14px] font-extrabold leading-snug text-brand-dark break-keep">
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
            <h2 className={`${H2} mt-4 text-white`}>
              분석부터 업로드 파일까지
            </h2>
            <p className={LEAD_ON_DARK}>
              제품과 판매 채널부터 여쭙고, 팔리는 구조를 먼저 잡습니다.
            </p>
          </Reveal>

          {/* 데스크톱: 레일 위 스텝 노드 + 카드. 마지막(업로드 파일)을 가장 밝게 띄운다 */}
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

      {/* ── 6. FAQ ── 흰 밴드 */}
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

      {/* ── 7. 마무리 ── 그레이 밴드 */}
      <section className={TINT}>
        <div className="relative text-center">
          <Reveal>
            <h2 className={`${H2} text-brand-dark`}>
              어떤 구조가 맞는지,
              <br />
              <span className="text-brand-primary">먼저 물어보세요</span>
            </h2>
            <p className={LEAD}>
              제품과 판매 채널만 알려 주시면 맞는 구성과 견적을 안내해 드립니다.
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
