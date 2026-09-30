"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Download, Eye, Lightbulb, MessageCircle, Palette, RefreshCw, ShoppingBag, Smartphone, Sparkles, Zap, type LucideIcon } from "lucide-react";
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

/* ── Before/After 페어 데이터 ─────────────────── */
const BA_PAIRS = [
  { photo: "1569718212165-3a8278d5f624", beforeBg: "#2a1a0a", afterBg: "#0d0d12", label: "라멘" },
  { photo: "1590301157890-4810ed352733", beforeBg: "#1a0a08", afterBg: "#0a0a0f", label: "비빔밥" },
  { photo: "1615141982883-c7ad0e69fd62", beforeBg: "#0e1a10", afterBg: "#080c10", label: "해산물" },
  { photo: "1488477181946-6428a0291777", beforeBg: "#1a100a", afterBg: "#f0ece8", label: "디저트" },
  { photo: "1546069901-ba9599a7e63c", beforeBg: "#141a14", afterBg: "#f8f8f6", label: "샐러드볼" },
  { photo: "1509042239860-f550ce710b93", beforeBg: "#100c08", afterBg: "#1a1208", label: "커피" },
];

/* ── 보정 전 사진 연출 ─────────────────────────
   같은 사진을 "사장님이 폰으로 대충 찍은" 느낌으로 망가뜨린다. 쌍마다 실패 유형을 달리해 반복돼 보이지 않게 한다. */
const BAD_SHOTS: { img: React.CSSProperties; overlay: string }[] = [
  // 형광등 아래 누렇게 뜬 색감 + 약한 흔들림
  { img: { filter: "sepia(.55) saturate(.9) hue-rotate(-12deg) brightness(.82) contrast(.85) blur(.8px)", transform: "scale(1.15) rotate(-3deg)" },
    overlay: "linear-gradient(180deg,rgba(255,200,80,.18),rgba(80,50,0,.25))" },
  // 구석에 쏠린 구도 + 어두운 실내
  { img: { filter: "saturate(.6) brightness(.55) contrast(.9)", transform: "scale(1.6) translate(18%,14%) rotate(4deg)" },
    overlay: "radial-gradient(circle at 70% 70%,transparent 30%,rgba(0,0,0,.45))" },
  // 플래시 번짐 — 가운데만 하얗게 날아간다
  { img: { filter: "saturate(.7) contrast(.75) brightness(1.1) blur(.5px)", transform: "scale(1.2) rotate(-6deg)" },
    overlay: "radial-gradient(circle at 42% 38%,rgba(255,255,255,.75),rgba(255,255,255,.15) 30%,rgba(0,0,0,.35) 75%)" },
  // 초점 나간 사진 + 푸르죽죽한 화이트밸런스
  { img: { filter: "blur(2.2px) saturate(.55) hue-rotate(18deg) brightness(.85)", transform: "scale(1.25) rotate(2deg)" },
    overlay: "linear-gradient(160deg,rgba(90,130,200,.25),rgba(20,30,60,.3))" },
  // 너무 가까이 들이댄 크롭 + 칙칙함
  { img: { filter: "saturate(.5) brightness(.7) contrast(.8) blur(.6px)", transform: "scale(2.1) translate(-12%,-8%) rotate(-8deg)" },
    overlay: "linear-gradient(0deg,rgba(0,0,0,.35),rgba(0,0,0,.1))" },
  // 역광 — 전체가 뿌옇고 물 빠진 색
  { img: { filter: "saturate(.45) brightness(1.15) contrast(.6) blur(.7px)", transform: "scale(1.3) rotate(5deg)" },
    overlay: "linear-gradient(200deg,rgba(255,255,255,.55),rgba(255,240,220,.15) 60%,rgba(0,0,0,.15))" },
];

/* ── BA 카드 컴포넌트 ─────────────────────────── */
function BAPair({ pair, idx }: { pair: typeof BA_PAIRS[0]; idx: number }) {
  const bad = BAD_SHOTS[idx % BAD_SHOTS.length];
  const src = `https://images.unsplash.com/photo-${pair.photo}?w=360&h=360&fit=crop&q=70`;
  return (
    <div className="flex shrink-0 gap-1.5 pr-3">
      {/* BEFORE — 보정 전(대충 찍은 폰 사진) */}
      <div className="relative w-[160px] h-[160px] rounded-2xl overflow-hidden"
        style={{ background: pair.beforeBg, border: "1px solid rgba(255,255,255,0.06)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={`${pair.label} before`} loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
          style={bad.img} />
        <div className="absolute inset-0" style={{ background: bad.overlay }} />
        <span className="absolute bottom-2 left-2 text-[11px] font-extrabold text-white/80 bg-black/50 px-2 py-0.5 rounded-md tracking-wide">BEFORE</span>
      </div>
      {/* AFTER — AI 보정 후 */}
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

/* ── 핵심 카드 안 보정 전후 한 장 ── 같은 사진을 반으로 갈라 왼쪽만 폰 사진처럼 망가뜨린다 */
function HeroSplit() {
  const src = `https://images.unsplash.com/photo-${BA_PAIRS[0].photo}?w=560&h=420&fit=crop&q=75`;
  return (
    <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden rounded-2xl ring-1 ring-white/20 lg:aspect-auto lg:min-h-[180px] lg:flex-1">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="보정 후" loading="lazy" className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: "saturate(1.12) brightness(1.05) contrast(1.05)" }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: "sepia(.5) saturate(.7) brightness(.72) contrast(.85) blur(.6px)", clipPath: "inset(0 50% 0 0)" }} />
      <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_12px_rgba(0,0,0,.35)]" />
      <span className="absolute left-1/2 top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[11px] font-black text-brand-primary shadow-md">↔</span>
      <span className="absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-0.5 text-[11px] font-extrabold tracking-wide text-white/85">BEFORE</span>
      <span className="absolute bottom-2 right-2 rounded-md bg-white px-2 py-0.5 text-[11px] font-extrabold tracking-wide text-brand-primary">AFTER</span>
    </div>
  );
}

/* ── 특장점 ──────────────────────────────────── */
// 첫 항목은 리드 문구("폰 사진이면 충분")를 그대로 받는 핵심 카드로 크게 보여준다
const FEATURES: { icon: LucideIcon; title: string; desc: string; tags: string[] }[] = [
  {
    icon: Palette,
    title: "AI 전문 보정",
    desc: "보내 주신 사진을 AI로 색감·조명·배경까지 다시 만듭니다. 필터 한 번 씌우는 보정 앱으로는 나오지 않는 차이입니다.",
    tags: ["색감·조명 보정", "배경 정리"],
  },
  {
    icon: Zap,
    title: "빠른 납품",
    desc: "사진 접수 후 평균 2~3 영업일 내 고해상도 파일로 납품합니다.",
    tags: ["평균 2~3 영업일"],
  },
  {
    icon: ShoppingBag,
    title: "플랫폼 최적화",
    desc: "스마트스토어·쿠팡·배민·인스타 등 플랫폼별 최적 규격으로 출력합니다.",
    tags: ["채널별 리사이징"],
  },
  {
    icon: RefreshCw,
    title: "무제한 수정",
    desc: "납품 후 색감·구도 수정을 패키지 내 횟수 제한 없이 지원합니다.",
    tags: ["횟수 제한 없음"],
  },
  {
    icon: Lightbulb,
    title: "컨설팅 포함",
    desc: "어떤 컷을 찍어야 할지 모르셔도 괜찮습니다. 업종별로 필요한 컷과 폰 촬영 요령을 안내해 드립니다.",
    tags: ["업종별 컷 가이드"],
  },
];

/* ── 서비스 패키지 ───────────────────────────── */
const PACKAGES = [
  {
    name: "베이직",
    desc: "처음 시작하는 사장님께 추천",
    items: ["대표 메뉴 3종 보정", "컷당 3장 납품", "기본 보정 포함", "1:1 / 4:3 규격"],
    accent: "#6366F1",
    popular: false,
  },
  {
    name: "스탠다드",
    desc: "스마트스토어·배달앱 운영자",
    items: ["메뉴 10종 보정", "컷당 5장 납품", "고급 색감 보정", "전 플랫폼 규격 포함", "SNS용 세로 컷 추가"],
    accent: "#EC4899",
    popular: true,
  },
  {
    name: "프리미엄",
    desc: "브랜드 이미지를 높이고 싶은 경우",
    items: ["메뉴 전체 보정", "컷당 10장 납품", "시네마틱 보정", "영상 클립 1개 포함", "월 1회 정기 업데이트"],
    accent: "#8B5CF6",
    popular: false,
  },
];

/* ── 프로세스 ───────────────────────────────── */
// who: 그 단계를 누가 하는지. 사장님 몫이 "사진 보내기·시안 확인" 둘뿐이라는 게 이 섹션의 요점이다
const PROCESS: { step: string; icon: LucideIcon; who: "함께" | "사장님" | "블루에그"; title: string; desc: string }[] = [
  { step: "01", icon: MessageCircle, who: "함께", title: "문의 & 상담", desc: "업종, 메뉴 수, 원하는 분위기를 상담합니다. 맞춤 패키지와 필요한 컷을 안내해 드립니다." },
  { step: "02", icon: Smartphone, who: "사장님", title: "사진 전달", desc: "스마트폰으로 찍은 원본 사진을 보내 주세요. 폰 촬영 요령은 미리 알려 드립니다." },
  { step: "03", icon: Sparkles, who: "블루에그", title: "AI 보정", desc: "AI로 색감·조명·배경을 보정해 메뉴가 맛있어 보이는 사진으로 만듭니다." },
  { step: "04", icon: Eye, who: "사장님", title: "시안 검토", desc: "보정된 시안을 공유하고 고객 피드백을 반영합니다." },
  { step: "05", icon: Download, who: "블루에그", title: "최종 납품", desc: "플랫폼별 최적 규격으로 고해상도 PNG/JPG 파일을 납품합니다." },
];

/* ── FAQ ────────────────────────────────────── */
const FAQS = [
  {
    q: "스마트폰으로 찍은 사진도 되나요?",
    a: "네, 폰 사진이면 충분합니다. 어두운 조명, 누렇게 뜬 색감, 지저분한 배경은 AI 보정으로 정리합니다. 다만 초점이 심하게 나갔거나 메뉴가 너무 작게 찍힌 사진은 접수할 때 다시 찍어 주시길 안내드릴 수 있습니다.",
  },
  {
    q: "사진은 어떻게 보내면 되나요?",
    a: "상담 때 안내드리는 방법으로 원본 파일을 보내 주시면 됩니다. 메신저로 보내면 화질이 떨어질 수 있어 원본 전송을 권장합니다.",
  },
  {
    q: "AI 보정이면 실제 메뉴와 달라 보이지 않나요?",
    a: "메뉴 자체는 바꾸지 않습니다. 색감·조명·배경·구도를 다듬어 실제 메뉴가 더 맛있어 보이게 하는 데 집중합니다.",
  },
  {
    q: "보정·납품은 얼마나 걸리나요?",
    a: "사진 접수 후 평균 2~3 영업일 내 시안을 공유하고, 수정 반영 후 최종 납품까지 약 5 영업일이 소요됩니다.",
  },
  {
    q: "납품 파일 형식은 어떻게 되나요?",
    a: "고해상도 PNG 및 JPG 파일로 납품합니다. 플랫폼별 규격(스마트스토어 1:1, 쿠팡 3:4 등)으로 각각 리사이징하여 제공합니다.",
  },
];

export default function ImagePage() {
  // 한 번에 하나만 열리게 둔다 — 다 펼쳐 두면 질문 목록을 훑는 이점이 사라진다
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <LandingShell
      railTitle={
        <>
          이미지 제작,
          <br />
          상담으로 시작
        </>
      }
    >
      {/* ── 1. 히어로 ── 흰 밴드 · 중앙 정렬 */}
      <section
        className={LIGHT}
        style={{ backgroundImage: "radial-gradient(120% 90% at 50% -10%, rgba(36,82,235,.07), transparent 60%)" }}
      >
        <div className="pointer-events-none absolute -left-10 top-10 h-28 w-28 rounded-full bg-brand-primary/5 blur-2xl" aria-hidden />

        <div className="relative text-center">
          <Reveal>
            <p className={EYEBROW}>AI photo retouching</p>
            <h2 className={`${H2} mt-4 text-brand-dark`}>
              폰으로 찍은 사진 그대로
              <br />
              <span className="text-brand-primary">맛있어 보이게 바꿔 드립니다</span>
            </h2>
            <p className={LEAD}>
              촬영은 사장님 폰으로 충분합니다. 보내 주신 사진을 AI가 색감·조명·배경까지 보정해 배달앱·스마트스토어에 바로 쓸 수 있게 만들어 드립니다.
            </p>
          </Reveal>

        </div>

        {/* 보정 전후 사진이 끊김 없이 흐른다 — 목록을 두 번 이어 붙여 -50% 지점에서 이음매 없이 되돌아간다 */}
        <Reveal delay={120}>
          <div className="marquee-mask relative mt-12 overflow-hidden">
            <div className="marquee-track marquee-pausable py-1" style={{ animationDuration: "48s" }}>
              {[...BA_PAIRS, ...BA_PAIRS].map((pair, i) => (
                <BAPair key={i} pair={pair} idx={i} />
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── 2. 왜 다른가 ── 그레이 밴드 */}
      <section className={TINT}>
        <div className="relative text-center">
          <Reveal>
            <p className={EYEBROW}>Why us</p>
            <h2 className={`${H2} mt-4 text-brand-dark`}>왜 다를까요</h2>
            <p className={LEAD}>사진은 폰으로 찍어 보내 주시면 됩니다. 맛있어 보이게 만드는 일은 저희가 합니다.</p>
          </Reveal>

          {/* 벤토 — 핵심 카드가 왼쪽 두 줄을 차지하고 나머지 넷이 2×2로 붙는다. 다섯 장이어도 빈칸이 남지 않는다 */}
          <div className="mt-12 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              const hero = i === 0;
              return (
                <Reveal key={f.title} delay={i * 80} className={`h-full ${hero ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : ""}`}>
                  <div
                    className={`group relative flex h-full flex-col overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 md:p-7 ${
                      hero
                        ? "text-white shadow-[0_24px_48px_-24px_rgba(36,82,235,.7)]"
                        : "border border-brand-border bg-white shadow-sm hover:border-brand-primary/30 hover:shadow-[0_20px_40px_-24px_rgba(36,82,235,.35)]"
                    }`}
                    style={hero ? { background: BLUE_BG } : undefined}
                  >
                    {hero && (
                      <>
                        <span className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden />
                        <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" aria-hidden />
                      </>
                    )}
                    {/* 배경 인덱스 넘버 */}
                    <span
                      className={`pointer-events-none absolute right-5 top-3 select-none font-black leading-none tracking-tighter tabular-nums ${
                        hero ? "text-[88px] text-white/10 md:text-[110px]" : "text-[56px] text-brand-primary/[0.06] md:text-[64px]"
                      }`}
                      aria-hidden
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <div
                      className={`relative flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105 ${
                        hero
                          ? "bg-white text-brand-primary ring-4 ring-white/15"
                          : "bg-brand-primary/[0.08] text-brand-primary ring-1 ring-inset ring-brand-primary/10"
                      }`}
                    >
                      <Icon className="h-6 w-6" strokeWidth={1.8} />
                    </div>

                    <h3
                      className={`relative mt-6 font-extrabold leading-snug tracking-tight break-keep ${
                        hero ? "text-[22px] md:text-[26px]" : "text-[18px] text-brand-dark md:text-[19px]"
                      }`}
                    >
                      {f.title}
                    </h3>
                    <p
                      className={`relative mb-6 mt-2.5 leading-relaxed break-keep ${
                        hero ? "text-[15px] text-white/80" : "text-[14px] text-brand-sub"
                      }`}
                    >
                      {f.desc}
                    </p>
                    {hero && <HeroSplit />}

                    <div className={`relative mt-auto flex flex-wrap gap-1.5 border-t pt-5 ${hero ? "border-white/15" : "border-brand-border"}`}>
                      {f.tags.map((t) => (
                        <span
                          key={t}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                            hero ? "bg-white/15 text-white ring-1 ring-inset ring-white/20" : "bg-brand-primary/[0.06] text-brand-primary"
                          }`}
                        >
                          <Check className="h-3 w-3" strokeWidth={3} />
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. 패키지 ── 네이비 밴드 */}
      <section className={BLUE} style={{ background: NAVY }}>
        <div className="relative text-center">
          <Reveal>
            <p className={EYEBROW_ON_DARK}>Packages</p>
            <h2 className={`${H2} mt-4 text-white`}>패키지 안내</h2>
            <p className={LEAD_ON_DARK}>메뉴 수와 쓰실 채널에 맞춰 고르시면 됩니다.</p>
          </Reveal>

          <div className="mt-12 grid gap-4 text-left md:grid-cols-3">
            {PACKAGES.map((pkg, i) => (
              <Reveal key={pkg.name} delay={i * 90} className="h-full">
                <div
                  className={`relative h-full rounded-2xl p-6 ${
                    pkg.popular ? "bg-white" : "bg-white/[0.07]"
                  }`}
                >
                  {pkg.popular && (
                    <span
                      className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[11px] font-extrabold text-white"
                      style={{ background: BLUE_BG }}
                    >
                      인기
                    </span>
                  )}
                  <div className={`mb-4 h-1.5 w-8 rounded-full ${pkg.popular ? "bg-brand-primary" : "bg-white/30"}`} />
                  <p className={`mb-1 text-[19px] font-extrabold ${pkg.popular ? "text-brand-dark" : "text-white"}`}>{pkg.name}</p>
                  <p className={`mb-5 text-[12.5px] ${pkg.popular ? "text-brand-muted" : "text-white/45"}`}>{pkg.desc}</p>
                  <ul className="mb-6 space-y-2.5">
                    {pkg.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className={`mt-0.5 shrink-0 ${pkg.popular ? "text-brand-primary" : "text-[#8FB0FF]"}`}>
                          <CheckIcon className="h-3.5 w-3.5" />
                        </span>
                        <span className={`text-[13.5px] break-keep ${pkg.popular ? "text-brand-sub" : "text-white/75"}`}>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={CONSULT_HREF}
                    className={`flex w-full items-center justify-center rounded-xl py-2.5 text-[13.5px] font-extrabold transition-opacity hover:opacity-85 ${
                      pkg.popular ? "text-white" : "bg-white/10 text-white/80"
                    }`}
                    style={pkg.popular ? { background: BLUE_BG } : undefined}
                  >
                    문의하기
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <p className="mt-8 text-[12.5px] text-white/40">패키지 외 맞춤 견적도 가능합니다 · 상담으로 말씀해 주세요</p>
          </Reveal>
        </div>
      </section>

      {/* ── 4. 진행 프로세스 ── 블루 밴드 */}
      <section className={BLUE} style={{ background: BLUE_BG }}>
        <div className="relative text-center">
          <Reveal>
            <p className={EYEBROW_ON_DARK}>How it works</p>
            <h2 className={`${H2} mt-4 text-white`}>사진 보내고, 받으면 끝</h2>
            <p className={LEAD_ON_DARK}>업종과 메뉴 수를 여쭙고, 어떤 컷을 찍어 보내시면 되는지부터 알려 드립니다.</p>
          </Reveal>

          <Reveal delay={80}>
            <div className="mt-7 inline-flex flex-wrap items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[13px] font-semibold text-white/85 ring-1 ring-inset ring-white/15">
              <span className="text-white/60">사장님이 하실 일은</span>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-[12px] font-extrabold text-brand-primary">사진 보내기</span>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-[12px] font-extrabold text-brand-primary">시안 확인</span>
              <span className="text-white/60">두 가지뿐입니다</span>
            </div>
          </Reveal>

          {/* 데스크톱: 레일 위 스텝 노드 + 카드. AI 보정 단계를 가장 밝게 띄운다 */}
          <div className="relative mt-14 hidden sm:block">
            <div className="pointer-events-none absolute left-[10%] right-[10%] top-[22px] h-[2px] rounded-full bg-gradient-to-r from-white/20 via-white/60 to-white/20" />
            <div className="grid grid-cols-5 gap-3 lg:gap-4">
              {PROCESS.map((pr, i) => {
                const hero = pr.step === "03";
                const Icon = pr.icon;
                return (
                  <Reveal key={pr.step} delay={i * 90} className="h-full">
                    <div className="group flex h-full flex-col items-center">
                      <span
                        className={`relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full text-[13px] font-extrabold tabular-nums shadow-[0_8px_18px_-6px_rgba(7,15,73,.6)] ring-[6px] transition-transform duration-300 group-hover:scale-110 ${
                          hero ? "bg-gradient-to-br from-[#FDE68A] to-[#F59E0B] text-[#7C2D12] ring-amber-200/30" : "bg-white text-brand-primary ring-white/10"
                        }`}
                      >
                        {pr.step}
                      </span>
                      <span className="h-4 w-px bg-white/30" />
                      <div
                        className={`relative flex w-full flex-1 flex-col items-center overflow-hidden rounded-2xl border p-4 text-center transition-all duration-300 group-hover:-translate-y-1 lg:p-5 ${
                          hero
                            ? "border-white bg-white shadow-[0_24px_48px_-20px_rgba(7,15,73,.75)]"
                            : "border-white/15 bg-white/[0.08] backdrop-blur-sm group-hover:border-white/30 group-hover:bg-white/[0.12]"
                        }`}
                      >
                        {hero && <span className="pointer-events-none absolute -top-10 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-amber-300/40 blur-2xl" />}
                        <span
                          className={`relative flex h-10 w-10 items-center justify-center rounded-xl ${
                            hero ? "bg-gradient-to-br from-brand-primary to-[#6D5BFF] text-white" : "bg-white/15 text-white ring-1 ring-inset ring-white/20"
                          }`}
                        >
                          <Icon className="h-5 w-5" strokeWidth={1.8} />
                        </span>
                        <p className={`relative mt-3.5 text-[15px] font-extrabold leading-snug break-keep ${hero ? "text-brand-dark" : "text-white"}`}>{pr.title}</p>
                        <p className={`relative mb-4 mt-1.5 text-[12.5px] leading-relaxed break-keep ${hero ? "text-slate-500" : "text-white/65"}`}>{pr.desc}</p>
                        <span
                          className={`relative mt-auto inline-flex rounded-full px-2.5 py-1 text-[11.5px] font-bold ${
                            hero
                              ? "bg-brand-primary text-white"
                              : pr.who === "사장님"
                                ? "bg-white text-brand-primary"
                                : "bg-white/10 text-white/80 ring-1 ring-inset ring-white/15"
                          }`}
                        >
                          {pr.who}
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
              const hero = pr.step === "03";
              const Icon = pr.icon;
              return (
                <div key={pr.step} className="flex items-stretch gap-3.5">
                  <div className="relative flex shrink-0 flex-col items-center">
                    <div
                      className={`z-10 flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-extrabold tabular-nums ring-4 ${
                        hero ? "bg-gradient-to-br from-[#FDE68A] to-[#F59E0B] text-[#7C2D12] ring-amber-200/30" : "bg-white text-brand-primary ring-white/10"
                      }`}
                    >
                      {pr.step}
                    </div>
                    {i < PROCESS.length - 1 && <div className="-mb-3 w-px flex-1 bg-gradient-to-b from-white/40 to-white/10" />}
                  </div>
                  <div className={`min-w-0 flex-1 rounded-2xl border p-4 ${hero ? "border-white bg-white" : "border-white/15 bg-white/[0.08]"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className={`flex items-center gap-1.5 text-[15px] font-extrabold break-keep ${hero ? "text-brand-dark" : "text-white"}`}>
                        <Icon className={`h-4 w-4 shrink-0 ${hero ? "text-brand-primary" : "text-white/80"}`} strokeWidth={2} />
                        {pr.title}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          hero ? "bg-brand-primary text-white" : pr.who === "사장님" ? "bg-white text-brand-primary" : "bg-white/10 text-white/80"
                        }`}
                      >
                        {pr.who}
                      </span>
                    </div>
                    <p className={`mt-1 text-[13px] leading-relaxed break-keep ${hero ? "text-slate-500" : "text-white/65"}`}>{pr.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. FAQ ── 흰 밴드 */}
      <section className={LIGHT}>
        <div className="relative">
          <Reveal>
            <p className={`${EYEBROW} text-center`}>FAQ</p>
            <h2 className={`${H2} mt-4 text-center text-brand-dark`}>자주 묻는 질문</h2>
          </Reveal>

          <div className="mx-auto mt-12 max-w-[720px] space-y-2">
            {FAQS.map((faq, i) => (
              <Reveal key={faq.q} delay={i * 60}>
                <div className="overflow-hidden rounded-xl border border-brand-border">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left transition-colors hover:bg-brand-lighter"
                  >
                    <span className="pr-4 text-[15.5px] font-semibold text-brand-dark break-keep">{faq.q}</span>
                    <svg
                      className={`h-4 w-4 shrink-0 text-brand-muted transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFaq === i && (
                    <div className="border-t border-brand-border bg-brand-lighter px-5 pb-5 pt-3 text-[14.5px] leading-relaxed text-brand-sub break-keep">
                      {faq.a}
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. 마무리 ── 그레이 밴드 */}
      <section className={TINT}>
        <div className="relative text-center">
          <Reveal>
            <h2 className={`${H2} text-brand-dark`}>
              어떤 컷이 필요한지,
              <br />
              <span className="text-brand-primary">먼저 물어보세요</span>
            </h2>
            <p className={LEAD}>업종·메뉴 수·원하시는 분위기만 알려 주시면 맞는 패키지를 골라 드립니다.</p>
            <div className="mt-9">
              <PillLink>상담 문의하기</PillLink>
            </div>
          </Reveal>
        </div>
      </section>
    </LandingShell>
  );
}
