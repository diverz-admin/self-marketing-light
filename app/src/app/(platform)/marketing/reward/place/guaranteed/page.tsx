"use client";

import { useEffect, useRef, useState } from "react";
import { Bookmark, CalendarCheck, ChartLine, FileCheck, MapPin, Rocket, Route, ScanSearch, Search, ShieldCheck, Trophy, type LucideIcon } from "lucide-react";
import { POLICY } from "@/lib/policy";
import {
  ArrowIcon,
  Reveal,
  LIGHT,
  TINT,
  BLUE,
  BLUE_BG,
  POINT_BG,
  EYEBROW,
  EYEBROW_ON_DARK,
  LEAD,
  LEAD_ON_DARK,
  H2,
} from "@/components/marketing/landing";

/* ─────────────────────────────────────────
   네이버 플레이스 상위 5순위 목업 (폰)
───────────────────────────────────────── */
function PlaceRankMockup() {
  return (
    <div className="relative flex justify-center items-end pb-6 select-none">
      {/* 볼륨 버튼 */}
      <div className="absolute left-[-4px] top-[88px] w-[4px] h-7 bg-[#bdbdbd] rounded-l-sm z-10" />
      <div className="absolute left-[-4px] top-[124px] w-[4px] h-7 bg-[#bdbdbd] rounded-l-sm z-10" />
      <div className="absolute right-[-4px] top-[108px] w-[4px] h-10 bg-[#bdbdbd] rounded-r-sm z-10" />

      <div
        className="relative overflow-hidden bg-white shadow-[0_32px_64px_rgba(0,0,0,0.25)]"
        style={{ width: 248, height: 520, borderRadius: 44, border: "7px solid #d4d4d4" }}
      >
        {/* 상태바 */}
        <div className="relative bg-white flex items-center justify-between px-5 pt-3 pb-1">
          <span className="text-[11px] font-semibold text-gray-800">9:41</span>
          <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-[70px] h-[18px] bg-black rounded-full" />
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1.5 8.43a15 15 0 0121 0l-2.1 2.1a12 12 0 00-16.8 0L1.5 8.43z" opacity=".3"/>
              <path d="M5.7 12.63a9 9 0 0112.6 0l-2.1 2.1a6 6 0 00-8.4 0L5.7 12.63z" opacity=".6"/>
              <path d="M9.9 16.83a3 3 0 014.2 0L12 18.93l-2.1-2.1z"/>
            </svg>
            <svg className="w-4 h-3.5 text-gray-800" fill="none" viewBox="0 0 24 12">
              <rect x="0.5" y="0.5" width="20" height="11" rx="3" stroke="currentColor" strokeWidth="1.2"/>
              <rect x="21" y="3.5" width="2.5" height="5" rx="1" fill="currentColor" opacity=".4"/>
              <rect x="2" y="2" width="14" height="8" rx="1.5" fill="currentColor"/>
            </svg>
          </div>
        </div>

        {/* 검색창 */}
        <div className="bg-white px-3 pb-0">
          <div className="flex items-center gap-2 border-b-2 pb-2" style={{ borderColor: "#03C75A" }}>
            <span className="font-extrabold text-[20px] leading-none" style={{ color: "#03C75A" }}>N</span>
            <span className="flex-1 text-[15px] text-gray-800 font-medium">강남 미용실</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
          <div className="flex gap-3 pt-2 pb-1 overflow-hidden">
            {["지도","플레이스","블로그","이미지"].map((t, i) => (
              <span
                key={t}
                className={`text-[12px] shrink-0 pb-1.5 ${i === 1 ? "font-bold border-b-2" : "text-gray-400"}`}
                style={i === 1 ? { color: "#03C75A", borderColor: "#03C75A" } : {}}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* 플레이스 목록 */}
        <div className="overflow-hidden" style={{ background: "#f5f5f5" }}>
          {/* 지도 영역 */}
          <div className="relative h-[90px] mx-2 mt-2 rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg,#EEF2FB,#D8E2F5)" }}>
            <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 200 90" preserveAspectRatio="xMidYMid slice">
              <line x1="0" y1="45" x2="200" y2="45" stroke="#94A9D6" strokeWidth="2"/>
              <line x1="100" y1="0" x2="100" y2="90" stroke="#94A9D6" strokeWidth="2"/>
              <line x1="0" y1="22" x2="200" y2="22" stroke="#94A9D6" strokeWidth="0.8" opacity="0.5"/>
              <line x1="0" y1="68" x2="200" y2="68" stroke="#94A9D6" strokeWidth="0.8" opacity="0.5"/>
              <line x1="50" y1="0" x2="50" y2="90" stroke="#94A9D6" strokeWidth="0.8" opacity="0.5"/>
              <line x1="150" y1="0" x2="150" y2="90" stroke="#94A9D6" strokeWidth="0.8" opacity="0.5"/>
            </svg>
            {/* 핀들 */}
            {[
              { x: "42%", y: "38%", label: "1", highlight: false },
              { x: "55%", y: "52%", label: "2", highlight: false },
              { x: "48%", y: "60%", label: "3", highlight: true },
              { x: "62%", y: "44%", label: "4", highlight: false },
              { x: "35%", y: "55%", label: "5", highlight: false },
            ].map((pin) => (
              <div
                key={pin.label}
                className="absolute flex items-center justify-center font-extrabold text-[10px] text-white rounded-full shadow"
                style={{
                  left: pin.x, top: pin.y,
                  width: pin.highlight ? 20 : 15,
                  height: pin.highlight ? 20 : 15,
                  background: pin.highlight ? "#2452EB" : "#555",
                  transform: "translate(-50%,-50%)",
                  zIndex: pin.highlight ? 2 : 1,
                }}
              >
                {pin.label}
              </div>
            ))}
          </div>

          {/* 순위 목록 */}
          <div className="mx-2 mt-1.5 space-y-1 pb-2">
            {[
              { rank: 1, name: "헤어살롱 청담점", score: "9.8", reviews: "1,204", highlight: false },
              { rank: 2, name: "로라헤어 강남역점", score: "9.5", reviews: "987",   highlight: false },
              { rank: 3, name: "내 업종 플레이스",  score: "9.3", reviews: "450",   highlight: true  },
              { rank: 4, name: "모노헤어 신논현점", score: "9.1", reviews: "731",   highlight: false },
              { rank: 5, name: "블룸 헤어 강남점", score: "8.9", reviews: "622",   highlight: false },
            ].map((item) => (
              <div
                key={item.rank}
                className={`rounded-xl p-2 flex items-center gap-2 ${item.highlight ? "bg-blue-50 border border-[#C9D8F5]" : "bg-white"}`}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0"
                  style={{ background: item.highlight ? "#2452EB" : "#f0f0f0", color: item.highlight ? "white" : "#666" }}
                >
                  {item.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-bold truncate ${item.highlight ? "text-[#2452EB]" : "text-gray-700"}`}>
                    {item.name}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[9px] text-yellow-500">★ {item.score}</span>
                    <span className="text-[8px] text-gray-400">리뷰 {item.reviews}</span>
                  </div>
                </div>
                {item.highlight && (
                  <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-full text-white shrink-0" style={{ background: "#2452EB" }}>
                    보장
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 하단 네비게이션 */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around py-2.5 px-4">
          {["M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6","M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z","M10 19l-7-7m0 0l7-7m-7 7h18","M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z","M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"].map((d, i) => (
            <svg key={i} className={`w-5 h-5 ${i === 0 ? "text-gray-900" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={i === 0 ? 2 : 1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={d}/>
            </svg>
          ))}
        </div>
      </div>

      {/* 플로팅 배지 — 화면 안 글자를 덮지 않게 기기 밖으로 더 빼고,
          가리켜야 할 줄(보장 순위 = 지도, 환불 = 내 업종 플레이스) 높이에 맞춘다. */}
      <div className="absolute -right-[92px] top-[150px] z-20 rounded-2xl border border-brand-border bg-white px-4 py-2.5 shadow-[0_18px_36px_-16px_rgba(17,29,55,.45)]">
        <p className="mb-0.5 text-[10px] text-brand-muted">보장 순위</p>
        <p className="text-[18px] font-extrabold leading-none" style={{ color: "#2452EB" }}>5위 이내</p>
        {/* 기기 쪽으로 이어지는 꼬리 */}
        <span className="absolute left-[-5px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-b border-l border-brand-border bg-white" aria-hidden />
      </div>
      <div className="absolute -left-[96px] top-[330px] z-20 rounded-2xl border border-brand-border bg-white px-4 py-2.5 shadow-[0_18px_36px_-16px_rgba(17,29,55,.45)]">
        <p className="mb-0.5 text-[10px] text-brand-muted">미달성 시</p>
        <p className="text-[17px] font-extrabold leading-none text-brand-primary">100% 환불</p>
        <span className="absolute right-[-5px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-r border-t border-brand-border bg-white" aria-hidden />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   데이터
───────────────────────────────────────── */
const PROCESS: { step: string; icon: LucideIcon; title: string; desc: string; output: string }[] = [
  { step: "01", icon: ScanSearch, title: "플레이스 분석", desc: "키워드 현재 순위·경쟁 플레이스·리뷰 점수를 분석하여 5순위 달성 가능성을 진단합니다.", output: "달성 가능성 진단" },
  { step: "02", icon: Route, title: "트래픽 설계", desc: "실제 사용자가 키워드 검색 후 플레이스를 방문·저장하도록 리워드 유입을 설계합니다.", output: "유입 설계안" },
  { step: "03", icon: Rocket, title: "캠페인 집행", desc: "검증된 매체사를 통해 유입을 일별로 조절하며 알고리즘 페널티 없이 순위를 끌어올립니다.", output: "일별 유입 조절" },
  { step: "04", icon: ChartLine, title: "순위 모니터링", desc: "매일 순위를 확인하고, 5위 안에 머문 날만 보장 기간(25일)으로 셉니다. 이탈하면 즉시 트래픽을 보강합니다.", output: "25일 카운트" },
  { step: "05", icon: FileCheck, title: "보장 완료 & 리포트", desc: "5순위 이내 달성 확인 후 리포트를 제공합니다. 기간 내 미달성이면 결제 금액을 전액 환불합니다.", output: "리포트 · 환불 보장" },
];

/* ── "무엇을 보장하나" 카드 아래 미니 비주얼 ─────────
   파란 밴드 위라 흰 반투명 판 위에 그린다. 설명을 한 번 더 그림으로 읽히게 하는 용도라 글은 최소로. */
const VIZ_PANEL = "mt-auto rounded-xl bg-white/[0.12] p-3.5 ring-1 ring-inset ring-white/15";

// 01 — 순위 사다리: 내 가게가 보장선(5위) 안에 들어와 있다
function VizRankLadder() {
  const rows = [1, 2, 3, 4, 5, 6];
  return (
    <div className={VIZ_PANEL}>
      <ul className="space-y-1">
        {rows.map((r) => {
          const mine = r === 3;
          return (
            <li key={r}>
              {r === 6 && (
                <div className="my-1.5 flex items-center gap-1.5">
                  <span className="h-px flex-1 border-t border-dashed border-amber-300" />
                  <span className="text-[9.5px] font-extrabold text-amber-300">보장선</span>
                  <span className="h-px flex-1 border-t border-dashed border-amber-300" />
                </div>
              )}
              <div className={`flex items-center gap-2 rounded-md px-2 py-1 ${mine ? "bg-white" : r === 6 ? "opacity-40" : "bg-white/10"}`}>
                <span className={`w-3 text-[10px] font-black tabular-nums ${mine ? "text-brand-primary" : "text-white/70"}`}>{r}</span>
                <span className={`h-1.5 flex-1 rounded-full ${mine ? "bg-brand-primary" : "bg-white/25"}`} style={{ maxWidth: `${100 - r * 9}%` }} />
                {mine && <span className="text-[9.5px] font-extrabold text-brand-primary">내 가게</span>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// 02 — 실사용자 행동 흐름: 검색 → 방문 → 저장
function VizUserFlow() {
  const steps: { icon: LucideIcon; label: string }[] = [
    { icon: Search, label: "키워드 검색" },
    { icon: MapPin, label: "플레이스 방문" },
    { icon: Bookmark, label: "저장" },
  ];
  return (
    <div className={VIZ_PANEL}>
      <div className="flex items-center justify-between">
        {steps.map((st, i) => {
          const Icon = st.icon;
          return (
            <div key={st.label} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-primary shadow">
                  <Icon className="h-4 w-4" strokeWidth={2.4} />
                </span>
                <span className="mt-1.5 text-[10px] font-bold text-white/85">{st.label}</span>
              </div>
              {i < steps.length - 1 && <span className="mb-5 h-px w-4 shrink-0 bg-white/40" />}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-[10px] font-semibold text-white/60">봇 · 어뷰징 없이 실제 앱 사용자</p>
    </div>
  );
}

// 03 — 25일 순위 추이: 6위로 밀린 날을 보강해 다시 5위 안으로
function VizDailyTrack() {
  const ranks = [7, 6, 5, 4, 4, 3, 3, 3, 4, 3, 2, 3, 3, 6, 4, 3, 3, 2, 2, 3, 2, 2, 3, 2, 2];
  const W = 220, H = 70, maxR = 8;
  const x = (i: number) => (i / (ranks.length - 1)) * W;
  const y = (r: number) => ((r - 1) / (maxR - 1)) * H;
  const d = ranks.map((r, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(r).toFixed(1)}`).join(" ");
  const dip = 13; // 6위로 밀린 날
  return (
    <div className={VIZ_PANEL}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-[70px] w-full overflow-visible" aria-hidden>
        {/* 5위 보장선 */}
        <line x1="0" x2={W} y1={y(5.5)} y2={y(5.5)} stroke="#FCD34D" strokeDasharray="4 3" strokeWidth="1" />
        <path d={d} fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(dip)} cy={y(ranks[dip])} r="3.5" fill="#FCD34D" />
        <circle cx={x(ranks.length - 1)} cy={y(ranks[ranks.length - 1])} r="3.5" fill="#fff" />
      </svg>
      <div className="mt-2 flex items-center justify-between text-[10px] font-bold">
        <span className="text-white/60">1일차</span>
        <span className="inline-flex items-center gap-1 text-amber-300">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
          이탈 시 즉시 보강
        </span>
        <span className="text-white/60">25일차</span>
      </div>
    </div>
  );
}

const BENEFITS = [
  {
    title: "5순위 이내 진입 보장",
    desc: "네이버 플레이스 검색 결과 5위 이내 진입을 약속드립니다. 달성 못하면 전액 환불.",
    icon: "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z",
    viz: VizRankLadder,
  },
  {
    title: "알고리즘 친화적 유입",
    desc: "실제 사용자가 키워드를 검색하고 방문하는 방식이라 네이버 페널티 위험 없이 안전하게 순위를 올립니다.",
    icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z",
    viz: VizUserFlow,
  },
  {
    title: "매일 순위 트래킹",
    desc: "캠페인 기간 내 매일 키워드 순위를 모니터링하고, 순위 이탈 시 즉시 트래픽을 보강합니다.",
    icon: "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941",
    viz: VizDailyTrack,
  },
];

/**
 * 순위별 방문 비중 막대.
 *
 * 화면에 들어오면 1위부터 차례로 차오른다. 다섯 개가 한 번에 서면 "1위가
 * 압도적"이라는 이 그림의 요점이 안 읽힌다 — 순서대로 세워야 격차가 보인다.
 * 한 번 서면 다시 돌리지 않는다(오르내릴 때마다 움직이면 읽는 데 방해된다).
 */
function RankBars() {
  const ref = useRef<HTMLDivElement>(null);
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setGrown(true);
        io.disconnect();
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* 막대마다 한 박자씩 늦게 출발한다 */
  const delay = (i: number) => `${i * 120}ms`;

  return (
    <div ref={ref} className="mx-auto mt-12 max-w-[720px]">
      {/* 넓은 화면: 세로 막대 — 바닥에서 위로 자란다 */}
      <div className="hidden items-end gap-2 md:grid md:grid-cols-5">
        {RANK_BARS.map((bar, i) => (
          <div key={bar.rank} className="flex flex-col items-center gap-1.5">
            <span
              className="text-[12px] font-bold text-brand-dark transition-opacity duration-500 ease-out motion-reduce:transition-none"
              style={{ opacity: grown ? 1 : 0, transitionDelay: delay(i) }}
            >
              {bar.visitors}명
            </span>
            <div
              className="w-full rounded-t-xl transition-[height] duration-[700ms] ease-out motion-reduce:transition-none"
              style={{
                height: grown ? `${bar.pct * 1.6}px` : 0,
                transitionDelay: delay(i),
                background: bar.color,
              }}
            />
            <span className="text-[13px] font-extrabold text-brand-dark">{bar.rank}</span>
            <span className="text-[11px] text-brand-muted">{bar.pct}%</span>
          </div>
        ))}
      </div>

      {/* 좁은 화면: 가로 막대 — 왼쪽에서 오른쪽으로 자란다 */}
      <div className="space-y-2.5 md:hidden">
        {RANK_BARS.map((bar, i) => (
          <div key={bar.rank} className="flex items-center gap-3">
            <span className="w-8 shrink-0 text-left text-[13px] font-extrabold text-brand-dark">{bar.rank}</span>
            <div className="h-8 flex-1 overflow-hidden rounded-lg bg-brand-lighter">
              <div
                className="flex h-full items-center justify-end overflow-hidden rounded-lg px-2 transition-[width] duration-[700ms] ease-out motion-reduce:transition-none"
                style={{
                  /* 글자가 들어갈 최소 폭은 다 자란 뒤에만 준다 — 0에서 출발해야 자라는 게 보인다 */
                  width: grown ? `${bar.pct}%` : 0,
                  minWidth: grown ? 44 : 0,
                  transitionDelay: delay(i),
                  background: bar.color,
                }}
              >
                <span
                  className="whitespace-nowrap text-[11px] font-bold text-white transition-opacity duration-500 ease-out motion-reduce:transition-none"
                  style={{ opacity: grown ? 1 : 0, transitionDelay: `calc(${delay(i)} + 260ms)` }}
                >
                  {bar.visitors}명
                </span>
              </div>
            </div>
            <span className="w-9 shrink-0 text-right text-[12px] font-bold text-brand-muted">{bar.pct}%</span>
          </div>
        ))}
      </div>

      <p className="mt-6 text-[13px] text-brand-muted">* 월간 일평균 방문자 비율 기준 (업종 평균)</p>
    </div>
  );
}

const FAQS = [
  {
    q: "결제는 언제, 어떻게 하나요?",
    a: `보장형은 카카오 오픈채팅 상담으로 접수합니다. 상담에서 키워드와 금액이 확정되면 담당자가 장바구니에 담아드리고, 보유 포인트로 결제하시면 캠페인이 등록됩니다. 결제는 선입금이며, 미달성 시 전액 환불됩니다. 상담 시간은 ${POLICY.support.hours}입니다.`,
  },
  {
    q: "어떤 방식으로 순위를 올리나요?",
    a: "실제 리워드 앱 사용자가 지정 키워드를 검색하고 플레이스를 방문·저장하는 방식입니다. 봇이나 어뷰징이 아닌 실사용자 유입이라 네이버 알고리즘 페널티 위험이 없습니다.",
  },
  {
    q: "5순위 안에 들지 못하면 어떻게 되나요?",
    a: "보장형은 선입금 방식입니다. 결제하신 금액으로 캠페인을 집행하고, 보장 기간이 종료된 시점에 목표 순위를 달성하지 못했다면 결제 금액 전액을 포인트로 환급해 드립니다. 별도의 위약금이나 조건은 없습니다.",
  },
  {
    q: "결과가 나오기까지 얼마나 걸리나요?",
    a: "업종·지역·현재 순위에 따라 다르지만, 보통 캠페인 시작 후 7~14일 내에 5순위 이내 진입을 달성합니다. 경쟁도가 낮은 키워드는 더 빠를 수 있습니다.",
  },
  {
    q: "어떤 업종에 효과적인가요?",
    a: "음식점, 카페, 뷰티샵, 병원, 학원, 숙박업 등 네이버 플레이스로 고객을 유치하는 모든 로컬 비즈니스에 효과적입니다. 사전 무료 진단을 통해 효과 가능성을 먼저 확인해드립니다.",
  },
  {
    q: "키워드를 여러 개 설정할 수 있나요?",
    a: "기본 플랜은 키워드 1개 기준입니다. 추가 키워드는 별도 문의를 통해 맞춤 견적을 안내해드립니다.",
  },
  {
    q: "25일 보장은 어떻게 계산되나요?",
    a: "보장 기간은 총 25일입니다. 단, 1~5순위 안에 머문 날만 카운트됩니다. 순위가 6위 이하로 이탈한 날은 카운트가 멈추고, 트래픽 보강 후 다시 5순위 이내로 복귀한 날부터 카운트가 재개됩니다. 25일이 누적되면 보장 완료로 처리됩니다.",
  },
];

/* 히어로 요약 — 이 화면에서 가장 먼저 확인할 세 가지 */
// 보조 설명(note)은 FAQ 에 적힌 조건과 같은 말만 쓴다 — 계약 조건을 화면마다 다르게 말하면 안 된다
const HERO_META: { k: string; num: string; unit: string; note: string; icon: LucideIcon }[] = [
  { k: "보장 순위", num: "5", unit: "위 이내", note: "지정 키워드 · 네이버 플레이스", icon: Trophy },
  { k: "보장 기간", num: "25", unit: "일", note: "5위 안에 머문 날만 카운트", icon: CalendarCheck },
];

/* 순위별 방문 비중 — 업종 평균값을 그대로 적는다 (화면에서 계산하지 않는다) */
const RANK_BARS = [
  { rank: "1위", pct: 100, color: "#2452EB", visitors: "1,200" },
  { rank: "2위", pct: 78, color: "#2452EB", visitors: "940" },
  { rank: "3위", pct: 55, color: "#5B84D6", visitors: "660" },
  { rank: "4위", pct: 32, color: "#88A9E8", visitors: "380" },
  { rank: "5위", pct: 20, color: "#BBCEF2", visitors: "240" },
];

/* 운영 실적 — 운영팀 집계값 */
const STATS = [
  { label: "6개월 달성률", value: "92", unit: "%" },
  { label: "평균 달성 기간", value: "7~14", unit: "일" },
  { label: "미달성 환불", value: "100", unit: "%" },
];

/* ─────────────────────────────────────────
   페이지
───────────────────────────────────────── */
export default function PlaceGuaranteedPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  /* 접수는 카카오 오픈채팅 한 곳으로 모은다 — 정책상 금액·조건 합의가 상담 기록으로 남아야 한다 */
  const consult = () =>
    alert(
      `보장형은 카카오 오픈채팅 상담으로 접수합니다. 카카오톡 채널 ${POLICY.support.kakaoChannel} 로 문의해 주세요. (상담 시간 ${POLICY.support.hours})`,
    );

  return (
    <div className="w-full pb-24 lg:pb-0">
      {/* 좌: 상세페이지 블럭 · 우: 상담 레일 — 쇼핑 리뷰 랜딩과 같은 뼈대 */}
      <div className="flex items-stretch gap-5">

        {/* ══════════ LEFT — 상세페이지 블럭 ══════════ */}
        <div className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-2xl">

          {/* ── 1. 히어로 ── 흰 밴드 · 가운데 정렬.
              제목 → 폰 목업(실제 화면). 보장 조건은 바로 아래 띠로 뺐다. */}
          <section
            className={LIGHT}
            style={{ backgroundImage: "radial-gradient(120% 90% at 50% -10%, rgba(36,82,235,.07), transparent 60%)" }}
          >
            <div className="pointer-events-none absolute -left-10 top-10 h-28 w-28 rounded-full bg-brand-primary/5 blur-2xl" aria-hidden />

            <div className="relative">
              {/* ── 제목 ── 가운데 정렬 */}
              <div className="text-center">
                <Reveal>
                  <p className={EYEBROW}>Guaranteed ranking</p>
                  <h1 className="mx-auto mt-4 max-w-[680px] text-[32px] md:text-[46px] font-extrabold leading-[1.22] tracking-tight text-brand-dark break-keep">
                    키워드 5순위,
                    <br />
                    <span className="text-brand-primary">못 올리면 전액 환불</span>합니다
                  </h1>
                </Reveal>
                <Reveal delay={80}>
                  <p className={LEAD}>
                    네이버 플레이스 검색 상위 5순위 진입을 리워드 유입으로 올립니다.
                    <br className="hidden sm:block" />
                    선입금으로 집행하고, 보장 기간이 끝났는데 목표에 못 닿으면 결제 금액을 전액 돌려드립니다.
                  </p>
                </Reveal>
              </div>

              {/* ── 폰 목업 ── 배지가 기기 밖으로 나오므로 좌우에 자리를 비워 둔다 */}
              <Reveal delay={260}>
                <div className="relative mt-12 flex justify-center px-10 pb-2 sm:px-20">
                  {/* 기기 뒤 글로우 — 흰 밴드에서 기기가 떠 보이게 받쳐 준다 */}
                  <div
                    className="pointer-events-none absolute left-1/2 top-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full"
                    aria-hidden
                    style={{ background: "radial-gradient(circle, rgba(36,82,235,.13), transparent 68%)" }}
                  />
                  <PlaceRankMockup />
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── 1-1. 보장 조건 ── 히어로 바로 아래 연회색 띠. 보증서형 티켓 한 장만 둔다 */}
          <section className="relative overflow-hidden bg-brand-lighter px-7 py-14 md:px-14 md:py-16">
            <Reveal>
              <div className="relative mx-auto max-w-[620px]">
                {/* 카드 위에 걸친 라벨 — 이 숫자들이 무엇인지 한 단어로 못 박는다 */}
                <span
                  className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full px-4 py-1.5 text-[12px] font-extrabold tracking-tight text-white"
                  style={{ background: POINT_BG, boxShadow: "var(--shadow-point)" }}
                >
                  보장 조건
                </span>

                {/* 보증서형 티켓 — 왼쪽 두 칸은 조건, 오른쪽 블루 칸은 약속. 사이를 절취선으로 끊는다 */}
                <div className="relative grid overflow-hidden rounded-[28px] bg-white text-left shadow-[0_30px_60px_-30px_rgba(17,29,55,.35)] ring-1 ring-brand-border sm:grid-cols-[1fr_1fr_1.15fr]">
                  {HERO_META.map((m, i) => {
                    const Icon = m.icon;
                    return (
                      <div key={m.k} className={`px-6 pb-6 pt-9 sm:pb-7 sm:pt-10 ${i === 1 ? "border-t border-dashed border-brand-border sm:border-l sm:border-t-0" : ""}`}>
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-primary-50 text-brand-primary">
                            <Icon className="h-4 w-4" strokeWidth={2.2} />
                          </span>
                          <span className="text-[13px] font-bold text-brand-sub">{m.k}</span>
                        </div>
                        <p className="mt-4 whitespace-nowrap font-extrabold leading-none tracking-tight text-brand-dark">
                          <span className="text-[44px] tabular-nums md:text-[52px]">{m.num}</span>
                          <span className="ml-1 text-[18px] md:text-[20px]">{m.unit}</span>
                        </p>
                        <p className="mt-3 text-[12px] font-semibold text-brand-muted break-keep">{m.note}</p>
                      </div>
                    );
                  })}

                  {/* 약속 칸 */}
                  <div className="relative overflow-hidden px-6 pb-6 pt-9 text-white sm:pb-7 sm:pt-10" style={{ background: POINT_BG }}>
                    <span className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/15 blur-2xl" aria-hidden />
                    {/* 절취선 홈 — 티켓처럼 위아래를 반원으로 파낸다 */}
                    <span className="absolute -left-3 -top-3 hidden h-6 w-6 rounded-full bg-brand-lighter sm:block" aria-hidden />
                    <span className="absolute -bottom-3 -left-3 hidden h-6 w-6 rounded-full bg-brand-lighter sm:block" aria-hidden />
                    <div className="relative flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
                        <ShieldCheck className="h-4 w-4" strokeWidth={2.2} />
                      </span>
                      <span className="text-[13px] font-bold text-white/80">미달성 시</span>
                    </div>
                    <p className="relative mt-4 whitespace-nowrap text-[36px] font-extrabold leading-none tracking-tight md:text-[42px]">전액 환불</p>
                    <p className="relative mt-3 text-[12px] font-semibold text-white/75 break-keep">결제 금액 100% 포인트 환급 · 위약금 없음</p>
                  </div>
                </div>

                {/* 도장 — 약속을 한 번 더 찍어 둔다 */}
                <span className="absolute -right-3 -top-7 z-10 hidden h-[84px] w-[84px] rotate-12 flex-col items-center justify-center rounded-full border-2 border-dashed border-amber-500 bg-amber-50 text-amber-600 shadow-lg sm:flex" aria-hidden>
                  <span className="text-[20px] font-black leading-none">100%</span>
                  <span className="mt-0.5 text-[10px] font-extrabold">환불 보장</span>
                </span>
              </div>
            </Reveal>
          </section>

          {/* ── 2. 무엇을 보장하나 ── 키컬러 밴드 */}
          <section className={BLUE} style={{ background: POINT_BG }}>
            <div className="relative text-center">
              <Reveal>
                <p className={EYEBROW_ON_DARK}>What we guarantee</p>
                <h2 className={`${H2} mt-4 text-white`}>
                  단순 트래픽이 아니라
                  <br />
                  <span className="text-[#8FB0FF]">순위를 보장합니다</span>
                </h2>
                <p className={LEAD_ON_DARK}>
                  실사용자 유입이라 플랫폼 페널티 위험이 없고, 순위는 매일 확인합니다.
                </p>
              </Reveal>

              <div className="mt-12 grid gap-4 text-left sm:grid-cols-3">
                {BENEFITS.map((b, i) => {
                  const Viz = b.viz;
                  return (
                  <Reveal key={b.title} delay={i * 90} className="h-full">
                    {/* 파란 밴드 위라 흰 면을 얕게 깔면 카드가 바탕에 묻힌다.
                        위에서 아래로 옅어지는 흰 면으로 두께를 준다. */}
                    <div
                      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/25 p-6 shadow-[0_18px_40px_-24px_rgba(3,10,40,.7)] backdrop-blur-[2px] transition-transform duration-300 hover:-translate-y-1 md:p-7"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,.24) 0%, rgba(255,255,255,.14) 100%)",
                      }}
                    >
                      {/* 상단 하이라이트 라인 + 배경 인덱스 넘버 */}
                      <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" aria-hidden />
                      <span className="pointer-events-none absolute right-5 top-3 select-none text-[64px] font-black leading-none tracking-tighter text-white/[0.08] tabular-nums" aria-hidden>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {/* 입체 아이콘 — 위에서 빛이 드는 유광 칩.
                          윗면은 하이라이트, 아랫면은 안쪽 그림자로 두께를 만든다. */}
                      <span
                        className="relative flex h-14 w-14 items-center justify-center rounded-[18px]"
                        style={{
                          background:
                            "linear-gradient(145deg,#FFFFFF 0%,#E4EDFF 42%,#A9C4FF 100%)",
                          boxShadow:
                            "0 12px 22px -8px rgba(3,10,40,.65), inset 0 2px 3px rgba(255,255,255,.95), inset 0 -4px 7px rgba(43,74,170,.38)",
                        }}
                      >
                        <span
                          className="pointer-events-none absolute inset-x-2 top-1.5 h-3.5 rounded-full bg-white/75 blur-[3px]"
                          aria-hidden
                        />
                        <svg
                          className="relative h-6 w-6 text-[#1B3ED8]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d={b.icon} />
                        </svg>
                      </span>
                      <p className="mt-5 text-[16.5px] font-extrabold text-white break-keep">{b.title}</p>
                      <p className="mb-5 mt-2 text-[14px] leading-relaxed text-white/75 break-keep">{b.desc}</p>
                      <Viz />
                    </div>
                  </Reveal>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── 3. 왜 5순위인가 ── 흰 밴드. 수치는 업종 평균을 그대로 적는다. */}
          <section className={LIGHT}>
            <div className="relative text-center">
              <Reveal>
                <p className={EYEBROW}>Why top 5</p>
                <h2 className={`${H2} mt-4 text-brand-dark`}>
                  상위 5개에
                  <br />
                  <span className="text-brand-primary">클릭의 68%</span>가 몰립니다
                </h2>
                <p className={LEAD}>네이버 플레이스에서 6위 아래는 사실상 노출 효과가 없습니다.</p>
              </Reveal>

              <Reveal delay={120}>
                <RankBars />
              </Reveal>
            </div>
          </section>

          {/* ── 4. 보장 현황 ── 그레이 밴드 · 운영 수치
              값은 운영팀이 넘긴 집계다. 화면에서 계산하지 않는다. */}
          <section className={TINT}>
            <div className="relative text-center">
              <Reveal>
                <p className={EYEBROW}>Track record</p>
                <h2 className={`${H2} mt-4 text-brand-dark`}>숫자로 먼저 보여드립니다</h2>
              </Reveal>

              <Reveal delay={120}>
                <div className="mx-auto mt-12 max-w-[920px] rounded-[28px] border border-white/70 bg-white/75 px-6 py-8 shadow-[0_24px_60px_-30px_rgba(17,29,55,.28)] backdrop-blur md:px-12 md:py-11">
                  <dl className="grid grid-cols-1 divide-y divide-brand-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    {STATS.map((s) => (
                      <div key={s.label} className="px-2 py-6 text-center sm:px-6 sm:py-1">
                        <dt className="text-[13px] font-bold text-brand-sub break-keep">{s.label}</dt>
                        <dd className="mt-3.5 text-[34px] md:text-[46px] font-extrabold leading-[0.95] tracking-tight text-brand-dark tabular-nums break-keep">
                          {s.value}
                          <span className="ml-0.5 align-baseline text-[15px] md:text-[18px] font-extrabold text-brand-dark/75">
                            {s.unit}
                          </span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-7 text-right text-[12px] text-brand-muted">*최근 6개월 집행 기준</p>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── 5. 진행 프로세스 ── 블루 밴드 */}
          <section id="process" className={BLUE} style={{ background: BLUE_BG }}>
            <div className="relative text-center">
              <Reveal>
                <p className={EYEBROW_ON_DARK}>Process</p>
                <h2 className={`${H2} mt-4 text-white`}>
                  5단계로 <span className="text-[#8FB0FF]">5순위를 만듭니다</span>
                </h2>
                <p className={LEAD_ON_DARK}>분석부터 보장 완료까지 한 담당자가 맡습니다.</p>
              </Reveal>

              {/* 데스크톱: 레일 위 스텝 노드 + 카드. 마지막(보장 완료)을 가장 밝게 띄운다 */}
              <div className="relative mt-14 hidden lg:block">
                <div className="pointer-events-none absolute left-[10%] right-[10%] top-[22px] h-[2px] rounded-full bg-gradient-to-r from-white/15 via-white/45 to-white/80" />
                <ol className="grid grid-cols-5 gap-3">
                  {PROCESS.map((pr, i) => {
                    const last = i === PROCESS.length - 1;
                    const Icon = pr.icon;
                    return (
                      <Reveal key={pr.step} delay={i * 90} className="h-full">
                        <li className="group flex h-full flex-col items-center">
                          <span
                            className={`relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[13px] font-extrabold text-brand-primary tabular-nums shadow-[0_8px_18px_-6px_rgba(7,15,73,.6)] ring-[6px] transition-transform duration-300 group-hover:scale-110 ${
                              last ? "ring-white/30" : "ring-white/10"
                            }`}
                          >
                            {pr.step}
                          </span>
                          <span className="h-4 w-px bg-white/30" />
                          <div
                            className={`flex w-full flex-1 flex-col items-center rounded-2xl border p-4 text-center transition-all duration-300 group-hover:-translate-y-1 ${
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
                        </li>
                      </Reveal>
                    );
                  })}
                </ol>
              </div>

              {/* 좁은 화면: 세로 타임라인 */}
              <ol className="mt-10 space-y-3 text-left lg:hidden">
                {PROCESS.map((pr, i) => {
                  const Icon = pr.icon;
                  const last = i === PROCESS.length - 1;
                  return (
                    <li key={pr.step} className="flex items-stretch gap-3.5">
                      <div className="relative flex shrink-0 flex-col items-center">
                        <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[13px] font-extrabold text-brand-primary tabular-nums ring-4 ring-white/10">
                          {pr.step}
                        </div>
                        {i < PROCESS.length - 1 && <div className="-mb-3 w-px flex-1 bg-gradient-to-b from-white/40 to-white/10" />}
                      </div>
                      <div className={`min-w-0 flex-1 rounded-2xl border p-4 ${last ? "border-white bg-white" : "border-white/15 bg-white/[0.08]"}`}>
                        <p className={`flex items-center gap-1.5 text-[15px] font-extrabold break-keep ${last ? "text-brand-dark" : "text-white"}`}>
                          <Icon className={`h-4 w-4 shrink-0 ${last ? "text-brand-primary" : "text-white/80"}`} strokeWidth={2} />
                          {pr.title}
                        </p>
                        <p className={`mt-1 text-[13px] leading-relaxed break-keep ${last ? "text-brand-sub" : "text-white/65"}`}>{pr.desc}</p>
                        <span
                          className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[11.5px] font-bold ${
                            last ? "bg-brand-primary text-white" : "bg-white/10 text-white/85 ring-1 ring-inset ring-white/15"
                          }`}
                        >
                          {pr.output}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>

          {/* ── 6. FAQ ── 그레이 밴드 */}
          <section className={TINT}>
            <div className="relative">
              <Reveal>
                <div className="text-center">
                  <p className={EYEBROW}>FAQ</p>
                  <h2 className={`${H2} mt-4 text-brand-dark`}>궁금한 점을 먼저 확인하세요</h2>
                </div>
              </Reveal>

              <div className="mx-auto mt-12 max-w-[720px] space-y-2.5">
                {FAQS.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <Reveal key={f.q} delay={i * 60}>
                      <div className="overflow-hidden rounded-2xl border border-brand-border bg-white">
                        <button
                          type="button"
                          onClick={() => setOpenFaq(open ? null : i)}
                          aria-expanded={open}
                          className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left"
                        >
                          <span className="text-[15.5px] md:text-[17px] font-bold text-brand-dark break-keep">{f.q}</span>
                          <svg
                            className={`h-5 w-5 shrink-0 text-brand-muted transition-transform ${open ? "rotate-180" : ""}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {open && (
                          <p className="animate-be-fade border-t border-brand-border px-6 py-5 text-[14.5px] md:text-[15.5px] leading-relaxed text-brand-sub break-keep">
                            {f.a}
                          </p>
                        )}
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>

          </div>
        </div>
        {/* END LEFT */}

        {/* ══════════ RIGHT — 신청 레일 (sticky) ══════════ */}
        <div className="hidden w-72 shrink-0 lg:block xl:w-80">
          <div className="sticky top-4 pb-3">
            {/* 한 문장만 남긴다 — 레일은 스크롤 내내 따라다녀 읽을 게 많으면 오히려 안 읽힌다 */}
            <div className="relative overflow-hidden rounded-2xl" style={{ background: POINT_BG }}>
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: "radial-gradient(circle at 50% 110%, rgba(255,255,255,0.12), transparent 60%)" }}
              />
              <div className="relative z-10 px-6 py-10 text-center">
                <p className="text-[11.5px] font-extrabold uppercase tracking-widest text-white/60">선입금 · 미달성 전액 환불</p>
                <h2 className="mt-4 text-[21px] font-extrabold leading-[1.55] text-white break-keep">
                  플레이스 5순위,
                  <br />
                  못 올리면
                  <br />
                  전액 환불합니다
                </h2>

                <button
                  type="button"
                  onClick={consult}
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-[14px] font-extrabold text-brand-primary shadow-lg transition-all hover:bg-white/90"
                >
                  상담으로 신청하기
                  <ArrowIcon className="h-3.5 w-3.5" />
                </button>
                {/* 언제 답이 오는지 — 정책(CS-01)에 적힌 값을 그대로 읽는다 */}
                <p className="mt-3.5 text-[11.5px] text-white/55">{POLICY.support.hours} 응대</p>
              </div>
            </div>
          </div>
        </div>
        {/* END RIGHT */}
      </div>

      {/* 레일이 접히는 폭(lg 미만) — 스크롤 어디서든 접수로 갈 수 있게 하단에 고정한다 */}
      <div className="fixed inset-x-0 bottom-[60px] z-40 border-t border-brand-border bg-white px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:bottom-0 lg:hidden">
        <button
          type="button"
          onClick={consult}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15.5px] font-extrabold text-white"
          style={{ background: POINT_BG }}
        >
          상담으로 신청하기
          <ArrowIcon />
        </button>
      </div>
    </div>
  );
}
