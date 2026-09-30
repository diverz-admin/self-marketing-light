"use client";

import { useState } from "react";
import {
  Bell,
  Camera,
  Captions,
  CheckCircle2,
  ClipboardList,
  Film,
  Image as ImageIcon,
  Languages,
  Layers,
  MessagesSquare,
  MonitorPlay,
  Music,
  PackageCheck,
  Play,
  Ratio,
  Scissors,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Timer,
  Tv,
  type LucideIcon,
} from "lucide-react";
import {
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

/* ── 목업에 쓰는 장면 한 컷 — 같은 장면이 편집기·폰·포맷 카드에 반복돼 "한 촬영본"이 읽힌다 */
const SCENE = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=720&h=405&fit=crop&q=75";
const SCENE_TALL = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=320&h=560&fit=crop&q=75";

/* ── 히어로 지표 ─────────────────────────────── */
const HERO_STATS: { label: string; value: number; unit: string; note: string; icon: LucideIcon }[] = [
  { label: "누적 영상 제작", value: 800, unit: "편+", note: "숏폼·제품 소개·브랜드 필름", icon: Film },
  { label: "지원 납품 포맷", value: 16, unit: "개", note: "비율·해상도·파일 형식 조합", icon: Layers },
  { label: "최단 납품", value: 7, unit: "일", note: "영업일 기준", icon: Timer },
];

/* ── 히어로 목업 — 편집기 + 세로 숏폼 ──────────
   600×380 캔버스를 그대로 두고 좁은 화면에서는 통째로 축소한다. */
const CARD_SHADOW = "shadow-[0_28px_56px_-20px_rgba(7,15,73,.6)]";

function VideoMockup() {
  return (
    <div className="relative mx-auto h-[230px] w-full max-w-[600px] select-none sm:h-[380px]" aria-hidden>
      <div className="absolute left-1/2 top-0 h-[380px] w-[600px] -translate-x-1/2 origin-top scale-[.58] sm:scale-100">
        {/* 편집기 */}
        <div className={`absolute left-[40px] top-[18px] w-[460px] overflow-hidden rounded-2xl bg-[#0E1630] ${CARD_SHADOW}`}>
          <div className="flex items-center gap-3 border-b border-white/10 px-3.5 py-2.5">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
            </div>
            <span className="text-[10.5px] font-semibold text-white/55">brand_film_final.mp4</span>
            <span className="ml-auto rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] font-extrabold text-[#8FB0FF]">4K</span>
          </div>

          {/* 프리뷰 */}
          <div className="relative mx-3 mt-3 h-[196px] overflow-hidden rounded-xl bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SCENE} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {/* 로어서드 — 모션 그래픽 */}
            <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-lg bg-white/95 py-1 pl-1 pr-2.5 shadow">
              <span className="flex h-5 w-5 items-center justify-center rounded-md text-[9px] font-black text-white" style={{ background: BLUE_BG }}>
                M
              </span>
              <span className="text-[10px] font-extrabold text-brand-dark">MYBRAND COFFEE</span>
            </div>
            {/* 자막 */}
            <p className="absolute inset-x-0 bottom-4 text-center">
              <span className="rounded-md bg-brand-primary px-2.5 py-1 text-[13px] font-extrabold text-white">매일 아침, 한 잔을 정성껏</span>
            </p>
          </div>

          {/* 타임라인 */}
          <div className="relative px-3 pb-3.5 pt-3">
            <div className="mb-2 flex items-center justify-between text-[9px] font-bold text-white/40 tabular-nums">
              <span className="flex items-center gap-1.5 text-white/70">
                <Play className="h-3 w-3 fill-white/70" strokeWidth={0} />
                00:12
              </span>
              <span>00:30</span>
            </div>
            {[
              { label: "영상", blocks: [[0, 38], [40, 30], [72, 28]], tone: "bg-[#2A5EFF]" },
              { label: "자막", blocks: [[6, 22], [34, 26], [66, 24]], tone: "bg-[#8FB0FF]" },
              { label: "모션", blocks: [[0, 14], [84, 16]], tone: "bg-[#A78BFA]" },
              { label: "BGM", blocks: [[0, 100]], tone: "bg-[#34D399]/70" },
            ].map((tr) => (
              <div key={tr.label} className="mb-1.5 flex items-center gap-2 last:mb-0">
                <span className="w-6 shrink-0 text-[8.5px] font-bold text-white/45">{tr.label}</span>
                <div className="relative h-3 flex-1 rounded-sm bg-white/[0.06]">
                  {tr.blocks.map(([l, w]) => (
                    <span key={l} className={`absolute inset-y-0 rounded-sm ${tr.tone}`} style={{ left: `${l}%`, width: `${w}%` }} />
                  ))}
                </div>
              </div>
            ))}
            {/* 플레이헤드 */}
            <span className="pointer-events-none absolute bottom-3 top-8 left-[calc(2rem+0.75rem+40%)] w-0.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,.8)]" />
          </div>
        </div>

        {/* 세로 숏폼 */}
        <div className={`absolute right-[4px] top-[110px] z-10 w-[140px] overflow-hidden rounded-[26px] border-[5px] border-brand-dark bg-black ${CARD_SHADOW}`}>
          <div className="relative aspect-[9/16]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SCENE_TALL} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
            <div className="absolute left-1/2 top-1.5 h-1.5 w-10 -translate-x-1/2 rounded-full bg-black" />
            <span className="absolute left-2.5 top-5 text-[9px] font-extrabold text-white">Reels</span>
            <p className="absolute inset-x-2 bottom-12 text-center">
              <span className="rounded bg-brand-primary px-1.5 py-0.5 text-[9px] font-extrabold text-white">한 잔을 정성껏</span>
            </p>
            <div className="absolute bottom-3 left-2.5 flex items-center gap-1.5">
              <span className="h-4 w-4 rounded-full ring-1 ring-white" style={{ background: BLUE_BG }} />
              <span className="text-[8.5px] font-bold text-white">mybrand</span>
            </div>
          </div>
        </div>

        {/* 플로팅 카드 — 영상이 만들어 내는 결과(포맷 · 저작권 · 납품)를 목업 둘레에 띄운다 */}
        {/* 좌상: 멀티 포맷 */}
        <div className="absolute -left-[88px] top-[150px] z-20 -rotate-3">
          <div className="animate-bob" style={{ animationDelay: "0ms" }}>
            <div className="rounded-2xl bg-white p-3 shadow-[0_20px_40px_-16px_rgba(7,15,73,.55)] ring-1 ring-black/5">
              <p className="text-[10px] font-extrabold text-brand-muted">동시 납품 포맷</p>
              <div className="mt-2 flex items-end gap-2">
                {[
                  { r: "16:9", w: 34, h: 19 },
                  { r: "1:1", w: 22, h: 22 },
                  { r: "9:16", w: 14, h: 25 },
                ].map((f) => (
                  <div key={f.r} className="flex flex-col items-center gap-1">
                    <span className="rounded-[4px]" style={{ width: f.w, height: f.h, background: BLUE_BG }} />
                    <span className="text-[9px] font-extrabold text-brand-primary">{f.r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 좌하: BGM 라이선스 */}
        <div className="absolute -left-[60px] -bottom-[4px] z-20 rotate-2">
          <div className="animate-bob" style={{ animationDelay: "1200ms" }}>
            <div className="flex items-center gap-2.5 rounded-2xl bg-white py-2.5 pl-2.5 pr-4 shadow-[0_20px_40px_-16px_rgba(7,15,73,.55)] ring-1 ring-black/5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Music className="h-4 w-4" strokeWidth={2.4} />
              </span>
              <div>
                <p className="text-[11.5px] font-extrabold text-brand-dark">BGM 상업용 라이선스</p>
                <p className="flex items-center gap-1 text-[9.5px] font-bold text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" strokeWidth={2.6} />
                  광고 집행 가능
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 우상: 납품 알림 */}
        <div className="absolute -right-[84px] top-[4px] z-30 w-[200px] rotate-2">
          <div className="animate-bob" style={{ animationDelay: "600ms" }}>
            <div className="flex items-center gap-2.5 rounded-2xl bg-white/95 p-3 shadow-[0_20px_40px_-16px_rgba(7,15,73,.55)] ring-1 ring-black/5 backdrop-blur">
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: BLUE_BG }}>
                <Bell className="h-4 w-4" strokeWidth={2.4} />
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold text-brand-dark">최종 영상이 도착했어요</p>
                <p className="text-[9.5px] font-semibold text-brand-muted">MP4 · 3개 포맷</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 특장점 비주얼 ───────────────────────────── */
const VISUAL_CARD = "w-full max-w-[320px] rounded-3xl border border-brand-border bg-white p-5 shadow-[0_30px_60px_-30px_rgba(36,82,235,.45)]";

// 01 — 목적별 영상 라인업
function VideoLineup() {
  const items = [
    { type: "SNS 숏폼", channel: "릴스 · 쇼츠 · 틱톡", duration: "15–30초", icon: Smartphone, active: true },
    { type: "제품 소개", channel: "스마트스토어 · 유튜브", duration: "30–60초", icon: ShoppingBag, active: false },
    { type: "브랜드 필름", channel: "유튜브 · TV", duration: "1–3분", icon: Film, active: false },
  ];
  return (
    <div className={VISUAL_CARD}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-muted">Line-up</p>
        <span className="rounded-md bg-brand-primary-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-primary">목적별 추천</span>
      </div>
      <ul className="mt-4 space-y-2">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <li
              key={it.type}
              className={`flex items-center gap-3 rounded-2xl px-3 py-3 ${it.active ? "bg-brand-primary-50 ring-1 ring-inset ring-brand-primary/20" : "bg-brand-lighter"}`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${it.active ? "text-white" : "bg-white text-brand-primary"}`}
                style={it.active ? { background: BLUE_BG } : undefined}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-extrabold text-brand-dark">{it.type}</p>
                <p className="text-[11px] font-medium text-brand-muted">{it.channel}</p>
              </div>
              <span className="shrink-0 rounded-lg bg-white px-2 py-1 text-[11px] font-extrabold text-brand-primary ring-1 ring-inset ring-brand-border">{it.duration}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// 02 — 한 프레임 위에 자막·모션이 얹히고 아래로 트랙이 쌓인다
function EditLayers() {
  const tracks = [
    { label: "자막", icon: Captions, blocks: [[8, 26], [40, 24], [70, 22]] },
    { label: "모션", icon: Sparkles, blocks: [[0, 16], [82, 18]] },
    { label: "BGM", icon: Music, blocks: [[0, 100]] },
  ];
  return (
    <div className={VISUAL_CARD}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-muted">Post-production</p>
        <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">한 팀 처리</span>
      </div>
      <div className="relative mt-4 aspect-video overflow-hidden rounded-2xl bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SCENE} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-0.5 text-[9.5px] font-extrabold text-brand-dark shadow">MYBRAND COFFEE</span>
        <p className="absolute inset-x-0 bottom-3 text-center">
          <span className="rounded-md bg-brand-primary px-2 py-0.5 text-[11.5px] font-extrabold text-white">매일 아침, 한 잔을 정성껏</span>
        </p>
      </div>
      <div className="mt-4 space-y-2">
        {tracks.map((tr) => {
          const Icon = tr.icon;
          return (
            <div key={tr.label} className="flex items-center gap-2.5">
              <span className="flex w-14 shrink-0 items-center gap-1 text-[11px] font-bold text-brand-sub">
                <Icon className="h-3.5 w-3.5 text-brand-primary" strokeWidth={2.2} />
                {tr.label}
              </span>
              <div className="relative h-3.5 flex-1 rounded bg-brand-lighter">
                {tr.blocks.map(([l, w]) => (
                  <span key={l} className="absolute inset-y-0 rounded" style={{ left: `${l}%`, width: `${w}%`, background: BLUE_BG, opacity: 0.85 }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 03 — 같은 장면을 세 비율로 잘라 나란히
function FormatFrames() {
  const frames = [
    { ratio: "16:9", channel: "유튜브 · TV", w: 120, h: 68 },
    { ratio: "1:1", channel: "인스타 피드", w: 72, h: 72 },
    { ratio: "9:16", channel: "릴스 · 쇼츠", w: 48, h: 86 },
  ];
  return (
    <div className={VISUAL_CARD}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-muted">Multi-format</p>
        <span className="rounded-md bg-brand-primary-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-primary">촬영본 1개</span>
      </div>
      <div className="mt-5 flex items-end justify-center gap-3">
        {frames.map((f) => (
          <div key={f.ratio} className="flex flex-col items-center">
            <div className="relative overflow-hidden rounded-lg bg-black ring-1 ring-brand-border" style={{ width: f.w, height: f.h }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={SCENE} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/85">
                  <Play className="ml-px h-2.5 w-2.5 fill-brand-primary text-brand-primary" strokeWidth={0} />
                </span>
              </span>
            </div>
            <span className="mt-2 text-[12px] font-extrabold text-brand-primary tabular-nums">{f.ratio}</span>
            <span className="text-[10px] font-medium text-brand-muted">{f.channel}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-2 rounded-xl bg-brand-lighter px-3 py-2.5">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary-50 text-brand-primary">
          <CheckIcon className="h-2.5 w-2.5" />
        </span>
        <span className="text-[12px] font-bold text-brand-dark">썸네일 이미지 별도 제공</span>
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
    eyebrow: "Any format",
    title: "숏폼부터 브랜드 필름까지\n목적에 맞게 제작",
    desc: "30초 SNS 광고부터 3분 브랜드 스토리 영상까지, 채널·목적·예산에 맞춰 제작합니다. 기획 단계부터 함께해서 방향이 흔들리지 않습니다.",
    points: [
      { icon: Smartphone, title: "SNS 숏폼" },
      { icon: ShoppingBag, title: "제품 소개 영상" },
      { icon: Film, title: "유튜브 브랜드 필름" },
      { icon: Tv, title: "TV CF · 캠페인" },
    ],
    visual: <VideoLineup />,
  },
  {
    no: "02",
    eyebrow: "Post-production",
    title: "자막·모션·BGM까지\n한 팀에서 완성",
    desc: "단순 컷 편집에서 끝나지 않습니다. 브랜드 자막 디자인, 모션 그래픽 인트로·아웃트로, 효과음과 BGM까지 한 팀이 맞춰서 마무리합니다.",
    points: [
      { icon: Captions, title: "브랜드 컬러 자막" },
      { icon: Sparkles, title: "모션 인트로·아웃트로" },
      { icon: Music, title: "저작권 해결 BGM" },
      { icon: Languages, title: "영문·다국어 자막" },
    ],
    visual: <EditLayers />,
  },
  {
    no: "03",
    eyebrow: "Multi-format",
    title: "16:9부터 9:16까지\n채널별 동시 납품",
    desc: "하나의 촬영본을 유튜브, 인스타그램, 릴스, 쇼핑몰 규격에 맞춰 한 번에 납품합니다. 채널마다 따로 편집을 맡기실 필요가 없습니다.",
    points: [
      { icon: MonitorPlay, title: "16:9 유튜브·TV" },
      { icon: Smartphone, title: "9:16 릴스·쇼츠" },
      { icon: Ratio, title: "1:1 인스타 피드" },
      { icon: ImageIcon, title: "썸네일 별도 제공" },
    ],
    visual: <FormatFrames />,
  },
];

/* ── 프로세스 ───────────────────────────────── */
const PROCESS: { step: string; icon: LucideIcon; title: string; desc: string; output: string }[] = [
  { step: "01", icon: MessagesSquare, title: "상담 & 방향 설정", desc: "채널·목적·예산을 파악하고 영상 방향과 구성을 제안드립니다.", output: "견적서" },
  { step: "02", icon: ClipboardList, title: "스크립트 & 콘티", desc: "스크립트와 스토리보드를 작성하고 기획안을 확정합니다.", output: "콘티" },
  { step: "03", icon: Camera, title: "촬영 / 소재 수집", desc: "직접 촬영하거나 보내 주신 소재로 영상 원본을 준비합니다.", output: "원본 소스" },
  { step: "04", icon: Scissors, title: "편집 & 모션·자막", desc: "편집에 모션 그래픽·자막·BGM을 입혀 시안을 전달합니다.", output: "1차 시안" },
  { step: "05", icon: PackageCheck, title: "수정 & 멀티 포맷 납품", desc: "피드백을 반영해 채널별 포맷으로 최종 납품합니다.", output: "최종 영상" },
];

/* ── FAQ ────────────────────────────────────── */
const FAQS = [
  {
    q: "촬영 장비와 스튜디오는 어떻게 되나요?",
    a: "보내 주신 소재로 편집하는 것이 기본이며, 필요하면 전문 PD·감독이 배정되어 현장 촬영도 지원합니다. 스튜디오는 별도 협의 가능합니다.",
  },
  {
    q: "배경음악 저작권은 괜찮나요?",
    a: "모든 BGM은 상업용 라이선스가 확보된 음원을 사용합니다. 유튜브·SNS 광고 집행 시에도 저작권 문제가 없습니다.",
  },
  {
    q: "모델이나 배우가 필요한 경우 어떻게 하나요?",
    a: "배우·모델 캐스팅도 지원합니다. 필요한 인원과 촬영 범위에 따라 상담 후 비용을 안내드립니다.",
  },
  {
    q: "납품 후 추가 수정이 가능한가요?",
    a: "포함된 수정 횟수를 넘기면 회당 별도 비용이 발생합니다. 수정 범위에 따라 상담 후 진행합니다.",
  },
];

export default function VideoPage() {
  // 한 번에 하나만 열리게 둔다 — 다 펼쳐 두면 질문 목록을 훑는 이점이 사라진다
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <LandingShell
      railTitle={
        <>
          영상 제작,
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
            <p className={EYEBROW}>Video production</p>
            <h2 className={`${H2} mt-4 text-brand-dark`}>
              영상 하나로
              <br />
              <span className="text-brand-primary">스크롤을 멈추게 하세요</span>
            </h2>
            <p className={LEAD}>기획·촬영·편집·모션부터 채널별 포맷 납품까지, 쓰실 곳에 맞는 영상을 처음부터 끝까지 만들어 드립니다.</p>
            {/* 기본 포함 사항 — 상담 전에도 기본값이 보이게 */}
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {["저작권 해결 BGM", "자막 디자인", "16:9 · 9:16 듀얼 컷"].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-white px-3 py-1.5 text-[12.5px] font-bold text-brand-text shadow-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-primary" strokeWidth={2.6} />
                  {t}
                </li>
              ))}
              <li className="text-[12px] font-semibold text-brand-muted">기본 포함</li>
            </ul>
          </Reveal>

          {/* 목업 무대 — 블루 면이 밴드 바닥까지 내려와 다음 섹션과 이어진다 */}
          <Reveal delay={160}>
            <div className="relative mx-auto mt-12 max-w-[760px]">
              <div className="absolute inset-x-0 bottom-0 top-16 overflow-hidden rounded-t-[36px] sm:top-28" style={{ background: "var(--gradient-point)" }}>
                <span className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden />
                <span className="pointer-events-none absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-[#8FB0FF]/20 blur-3xl" aria-hidden />
                <span className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" aria-hidden />
                {/* 필름 스트립 — 무대 위아래로 프레임 구멍이 흐른다 */}
                <span
                  className="pointer-events-none absolute inset-x-0 bottom-3 h-2.5 opacity-30"
                  style={{ backgroundImage: "linear-gradient(90deg, #fff 0 10px, transparent 10px 22px)", backgroundSize: "22px 100%" }}
                  aria-hidden
                />
              </div>
              <div className="relative px-4 pb-10 sm:pb-12">
                <VideoMockup />
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

      {/* ── 2~4. 특장점 ── 연회색 ↔ 흰 밴드를 번갈아 깐다 */}
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
            <h2 className={`${H2} mt-4 text-white`}>기획부터 납품까지</h2>
            <p className={LEAD_ON_DARK}>어디에 올릴 영상인지부터 여쭙고, 거기에 맞춰 포맷을 잡습니다.</p>
          </Reveal>

          {/* 데스크톱: 레일 위 스텝 노드 + 카드. 마지막(최종 납품)을 가장 밝게 띄운다 */}
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

      {/* ── 6. FAQ ── 흰 밴드 */}
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

      {/* ── 7. 마무리 ── 그레이 밴드 */}
      <section className={TINT}>
        <div className="relative text-center">
          <Reveal>
            <h2 className={`${H2} text-brand-dark`}>
              어떤 영상이 맞는지,
              <br />
              <span className="text-brand-primary">먼저 물어보세요</span>
            </h2>
            <p className={LEAD}>어디에 쓸 영상인지만 알려 주시면 맞는 구성과 견적을 안내해 드립니다.</p>
            <div className="mt-9">
              <PillLink>상담 문의하기</PillLink>
            </div>
          </Reveal>
        </div>
      </section>
    </LandingShell>
  );
}
