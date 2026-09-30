"use client";

import { useState } from "react";
import {
  LandingShell,
  Reveal,
  CheckIcon,
  LIGHT,
  TINT,
  BLUE,
  NAVY,
  EYEBROW,
  EYEBROW_ON_DARK,
  LEAD,
  H2,
} from "@/components/marketing/landing";

/* ─────────────────────────────────────────
   데이터
───────────────────────────────────────── */

const REFUND_TIERS = [
  { range: "월 50만원 이상", rate: "3%", monthly: "1.5만원~", annual: "18만원~", highlight: false },
  { range: "월 200만원 이상", rate: "5%", monthly: "10만원~", annual: "120만원~", highlight: false },
  { range: "월 500만원 이상", rate: "7%", monthly: "35만원~", annual: "420만원~", highlight: true },
  { range: "월 1,000만원 이상", rate: "10%", monthly: "100만원~", annual: "1,200만원~", highlight: false },
];

const OPTIMIZE_FEATURES = [
  { title: "불필요 키워드 제거", desc: "전환 없이 비용만 소모하는 키워드를 매주 진단하고 즉시 제외 처리합니다.", icon: "M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-[#2452EB]", bg: "bg-blue-50" },
  { title: "입찰가 자동 최적화", desc: "시간대·요일·디바이스별 성과 데이터를 분석해 입찰가를 실시간으로 조정합니다.", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z", color: "text-[#2452EB]", bg: "bg-blue-50" },
  { title: "품질지수 개선", desc: "광고 소재와 랜딩페이지 연관도를 높여 품질지수를 올리고 클릭당 비용을 낮춥니다.", icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z", color: "text-[#2452EB]", bg: "bg-blue-50" },
  { title: "전환추적 세팅", desc: "네이버 전환 스크립트를 설치해 실제 구매·신청까지 추적하고 ROAS를 정확히 측정합니다.", icon: "M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59", color: "text-[#2452EB]", bg: "bg-blue-50" },
  { title: "소재 A/B 테스트", desc: "복수의 광고 소재를 동시 운영해 클릭률이 높은 소재로 자동 집중합니다.", icon: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5", color: "text-[#2452EB]", bg: "bg-blue-50" },
  { title: "월간 성과 리포트", desc: "클릭·노출·전환·ROAS 등 핵심 KPI를 정리한 리포트를 매월 제공합니다.", icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z", color: "text-[#2452EB]", bg: "bg-blue-50" },
];

const FAQS = [
  { q: "환급은 어떤 원리로 이루어지나요?", a: "네이버는 공식 인증 광고 대행사에게 광고주 대신 광고비를 집행한 금액의 일부를 수수료 형태로 환급합니다. BlueEgg는 이 환급금 전액을 광고주에게 돌려드립니다. 별도 수수료는 최적화 서비스 이용료로만 청구됩니다." },
  { q: "환급받으려면 광고비가 얼마 이상이어야 하나요?", a: "월 광고비 50만원 이상부터 환급 프로그램 적용이 가능합니다. 광고비 규모가 클수록 환급률이 높아집니다. 정확한 금액은 무료 상담 후 안내해드립니다." },
  { q: "기존 네이버 광고를 이미 운영 중인데 전환 가능한가요?", a: "네, 가능합니다. 기존 광고 계정을 그대로 유지한 채 대행사 연동만 추가하면 됩니다. 광고 데이터 손실 없이 환급 및 최적화 서비스를 즉시 시작할 수 있습니다." },
  { q: "최적화 서비스와 환급은 별개인가요?", a: "아니요, 함께 제공됩니다. 환급 프로그램 신청을 위해 공식 대행사 연동이 필요하며, 이 과정에서 자동으로 계정 최적화 서비스도 함께 진행됩니다. 하나의 계약으로 환급 + 최적화를 모두 받으실 수 있습니다." },
  { q: "환급금은 언제 지급되나요?", a: "네이버로부터 환급금이 입금되는 익월 중 정산 후 지급됩니다. 보통 광고비 집행 후 30~45일 내 지급됩니다." },
];

/* ─────────────────────────────────────────
   서브 컴포넌트
───────────────────────────────────────── */
/* 계산기 구간 — 슬라이더 눈금·구간 칩·환급률 계산이 모두 이 표를 읽는다 */
const CALC_MIN = 50;
const CALC_MAX = 2000;
const CALC_TIERS = [
  { from: 50, rate: 0.03 },
  { from: 200, rate: 0.05 },
  { from: 500, rate: 0.07 },
  { from: 1000, rate: 0.1 },
];
const toPos = (v: number) => ((v - CALC_MIN) / (CALC_MAX - CALC_MIN)) * 100;
/* 네이티브 손잡이(24px)는 양 끝에서 반 폭만큼 안쪽에 멈춘다 — 채움·눈금 위치를 손잡이 중심에 맞춘다 */
const THUMB = 24;
const atThumb = (p: number) => `calc(${p}% + ${(0.5 - p / 100) * THUMB}px)`;

function RefundCalculator() {
  const [spend, setSpend] = useState(500);
  const tierIdx = CALC_TIERS.findLastIndex((t) => spend >= t.from);
  const rate = tierIdx >= 0 ? CALC_TIERS[tierIdx].rate : 0;
  const next = CALC_TIERS[tierIdx + 1];
  const monthly = Math.round(spend * rate);
  const annual = monthly * 12;
  const pct = Math.round(rate * 100);
  const pos = toPos(spend);

  return (
    <div className="w-full rounded-3xl bg-white p-6 shadow-[0_30px_60px_-30px_rgba(3,10,60,.6)] md:p-7">
      {/* 머리 */}
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary-50 text-brand-primary">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" />
          </svg>
        </span>
        <div className="min-w-0">
          <h3 className="text-[17px] font-extrabold text-brand-dark">환급금 계산기</h3>
          <p className="text-[12.5px] text-brand-sub">막대를 움직여 월 광고비를 맞춰 보세요.</p>
        </div>
      </div>

      {/* 월 광고비 */}
      <div className="mt-7 flex items-end justify-between">
        <span className="text-[13px] font-bold text-brand-sub">월 광고비</span>
        <span className="text-[28px] font-extrabold leading-none text-brand-dark tabular-nums">
          {spend.toLocaleString()}
          <span className="ml-0.5 text-[15px] font-bold text-brand-sub">만원</span>
        </span>
      </div>

      {/* 슬라이더 — 채워진 구간은 포인트 블루, 구간 경계마다 눈금 */}
      <div className="relative mt-4 h-6">
        <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-[#E8ECF3]" />
        <div
          className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#6F93FF] to-brand-primary"
          style={{ width: atThumb(pos) }}
        />
        {CALC_TIERS.slice(1).map((t) => (
          <span
            key={t.from}
            className={`absolute top-1/2 h-3.5 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full ${spend >= t.from ? "bg-white/80" : "bg-[#CBD3E0]"}`}
            style={{ left: atThumb(toPos(t.from)) }}
          />
        ))}
        <input
          type="range"
          min={CALC_MIN}
          max={CALC_MAX}
          step={50}
          value={spend}
          onChange={(e) => setSpend(Number(e.target.value))}
          aria-label="월 광고비(만원)"
          style={{ height: THUMB, background: "transparent" }}
          className="absolute inset-0 m-0 w-full cursor-pointer
            [&::-webkit-slider-thumb]:h-6! [&::-webkit-slider-thumb]:w-6! [&::-webkit-slider-thumb]:border-[5px]! [&::-webkit-slider-thumb]:border-brand-primary! [&::-webkit-slider-thumb]:bg-white! [&::-webkit-slider-thumb]:shadow-[0_4px_12px_rgba(36,82,235,.45)]!
            [&::-moz-range-thumb]:h-6! [&::-moz-range-thumb]:w-6! [&::-moz-range-thumb]:border-[5px]! [&::-moz-range-thumb]:border-brand-primary! [&::-moz-range-thumb]:bg-white! [&::-moz-range-track]:bg-transparent!"
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-brand-muted tabular-nums">
        <span>{CALC_MIN}만원</span>
        <span>{CALC_MAX.toLocaleString()}만원</span>
      </div>

      {/* 구간 칩 — 누르면 그 구간 시작 금액으로 이동 */}
      <div className="mt-4 grid grid-cols-4 gap-1.5 rounded-xl bg-[#F3F5F9] p-1">
        {CALC_TIERS.map((t, i) => {
          const on = i === tierIdx;
          return (
            <button
              key={t.from}
              type="button"
              onClick={() => setSpend(t.from)}
              className={`cursor-pointer rounded-lg px-1 py-2 text-center transition-all ${
                on ? "bg-white shadow-[0_2px_8px_rgba(15,23,42,.08)]" : "hover:bg-white/60"
              }`}
            >
              <p className={`text-[14px] font-extrabold tabular-nums ${on ? "text-brand-primary" : "text-brand-muted"}`}>{Math.round(t.rate * 100)}%</p>
              <p className="mt-0.5 text-[10.5px] font-semibold text-brand-muted tabular-nums">{t.from.toLocaleString()}만~</p>
            </button>
          );
        })}
      </div>

      {/* 결과 — 연간 환급금을 주인공으로 */}
      <div className="relative mt-5 overflow-hidden rounded-2xl p-5 text-white" style={{ background: "var(--gradient-point)" }}>
        <div className="relative flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[12.5px] font-bold text-white/75">연간 예상 환급금</p>
            <p className="mt-1.5 text-[34px] font-extrabold leading-none tabular-nums md:text-[38px]">
              {annual > 0 ? annual.toLocaleString() : "—"}
              {annual > 0 && <span className="ml-1 text-[16px] font-bold text-white/80">만원</span>}
            </p>
          </div>
          <div className="shrink-0 space-y-1.5 border-l border-white/20 pl-4 text-right">
            <p className="text-[12px] text-white/70">
              월 <span className="ml-1 text-[15px] font-extrabold text-white tabular-nums">{monthly > 0 ? `${monthly.toLocaleString()}만원` : "—"}</span>
            </p>
            <p className="text-[12px] text-white/70">
              환급률 <span className="ml-1 text-[15px] font-extrabold text-white tabular-nums">{pct}%</span>
            </p>
          </div>
        </div>
      </div>

      {/* 안내 줄은 늘 한 줄을 차지한다 — 최고 구간에서 사라지면 카드 높이가 흔들린다 */}
      <p className="mt-3 truncate text-center text-[12px] text-brand-muted">
        {next ? (
          <>월 {next.from.toLocaleString()}만원부터 환급률 <b className="font-extrabold text-brand-primary">{Math.round(next.rate * 100)}%</b>가 적용됩니다.</>
        ) : (
          <>최고 환급률 <b className="font-extrabold text-brand-primary">{pct}%</b>가 적용되는 구간입니다.</>
        )}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────
   페이지
───────────────────────────────────────── */
export default function NaverRefundPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <LandingShell
      railTitle={
        <>
          광고비 환급,
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

        <div className="relative text-center">
          <Reveal>
            <p className={EYEBROW}>Naver SA refund</p>
            <h2 className={`${H2} mt-4 text-brand-dark`}>
              집행한 광고비 그대로,
              <br />
              <span className="text-brand-primary">최대 10% 돌려받으세요</span>
            </h2>
            <p className={LEAD}>
              네이버 공식 파트너사를 통해 광고비의 최대 10%를 환급받고, 전문가의 광고 관리로 같은 예산에서 더 많은 성과를 만들어 드립니다.
            </p>
          </Reveal>

          {/* 환급 구간 — 환급률만큼 높아지는 계단 기둥. 주인공 구간만 블루로 채운다 */}
          <Reveal delay={120}>
            <div className="mx-auto mt-12 max-w-[760px]">
              <div className="grid h-[260px] grid-cols-4 items-end gap-2.5 sm:h-[320px] sm:gap-4">
                {REFUND_TIERS.map((t, i) => {
                  const on = t.highlight;
                  const rate = parseFloat(t.rate);
                  return (
                    <div key={t.range} className="flex h-full flex-col justify-end">
                      {/* 기둥 위 — 구간 금액 */}
                      <div className="mb-2.5 flex flex-col items-center gap-1.5">
                        {on && (
                          <span className="whitespace-nowrap rounded-full bg-brand-dark px-2 py-0.5 text-[10px] font-extrabold text-white shadow-md sm:px-2.5 sm:py-1 sm:text-[11px]">
                            가장 많이 받는 구간
                          </span>
                        )}
                        <p className={`whitespace-nowrap text-[11.5px] font-bold sm:text-[13px] ${on ? "text-brand-primary" : "text-brand-sub"}`}>
                          {t.range.replace(" 이상", "~")}
                        </p>
                      </div>

                      {/* 기둥 */}
                      <div
                        className={`relative overflow-hidden rounded-t-2xl px-2.5 pt-3 sm:rounded-t-3xl sm:px-4 sm:pt-4 ${
                          on
                            ? "text-white shadow-[0_-18px_40px_-16px_rgba(36,82,235,.6)]"
                            : "border border-b-0 border-brand-primary/10 bg-gradient-to-b from-brand-primary-50 to-brand-primary-50/0"
                        }`}
                        style={{
                          height: `${28 + rate * 7.2}%`,
                          background: on ? "linear-gradient(180deg, #2452EB 0%, #4C74FF 55%, rgba(76,116,255,.15) 100%)" : undefined,
                        }}
                      >
                        <span className={`relative text-[10px] font-extrabold tabular-nums sm:text-[11px] ${on ? "text-white/70" : "text-brand-muted"}`}>
                          STEP {i + 1}
                        </span>
                        <p className={`relative mt-1 text-[26px] font-black leading-none tracking-tight tabular-nums sm:text-[40px] ${on ? "text-white" : "text-brand-dark"}`}>
                          {t.rate}
                        </p>
                        <p className={`relative mt-1 text-[10.5px] font-semibold sm:text-[12px] ${on ? "text-white/75" : "text-brand-muted"}`}>환급률</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 바닥선 + 환급 금액 */}
              <div className="grid grid-cols-4 gap-2.5 border-t border-brand-border pt-4 text-center sm:gap-4">
                {REFUND_TIERS.map((t) => (
                  <dl key={t.range} className="space-y-1">
                    <div>
                      <dt className="text-[11px] text-brand-muted sm:text-[12px]">월 환급</dt>
                      <dd className="whitespace-nowrap text-[12.5px] font-extrabold text-brand-dark tabular-nums sm:text-[14px]">{t.monthly}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-brand-muted sm:text-[12px]">연 환급</dt>
                      <dd className={`whitespace-nowrap text-[13.5px] font-extrabold tabular-nums sm:text-[16px] ${t.highlight ? "text-brand-primary" : "text-brand-dark"}`}>{t.annual}</dd>
                    </div>
                  </dl>
                ))}
              </div>
            </div>
            <p className="mt-5 text-[12px] text-brand-muted">* 월 광고비 기준 예상 금액이며, 네이버 정책에 따라 변동될 수 있습니다.</p>
          </Reveal>
        </div>
      </section>

      {/* ── 2. 환급 계산기 ── 네이비 밴드 */}
      <section id="calculator" className={BLUE} style={{ background: NAVY }}>
        <div className="relative grid items-center gap-10 md:grid-cols-2 md:gap-14">
          <Reveal>
            <p className={EYEBROW_ON_DARK}>Calculator</p>
            <h2 className={`${H2} mt-4 text-white`}>
              얼마를 돌려받는지,
              <br />
              <span className="text-[#8FB0FF]">직접 확인해 보세요</span>
            </h2>
          </Reveal>

          <Reveal delay={120}>
            <RefundCalculator />
          </Reveal>
        </div>
      </section>

      {/* ── 3. 계정 최적화 ── 흰 밴드 */}
      <section className={LIGHT}>
        <div className="relative text-center">
          <Reveal>
            <p className={EYEBROW}>Optimization</p>
            <h2 className={`${H2} mt-4 text-brand-dark`}>
              환급으로 끝나지 않고,
              <br />
              <span className="text-brand-primary">광고 성과까지 챙겨 드립니다</span>
            </h2>
            <p className={LEAD}>
              환급과 함께 키워드·입찰가·소재·품질지수 등 여섯 가지 영역을 전담 매니저가 꾸준히 관리합니다.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
            {OPTIMIZE_FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 80} className="h-full">
                <div className="group relative h-full overflow-hidden rounded-2xl border border-brand-border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/30 hover:shadow-[0_20px_40px_-20px_rgba(36,82,235,.35)]">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-[0_8px_18px_-8px_rgba(36,82,235,.7)]"
                    style={{ background: "var(--gradient-point)" }}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                    </svg>
                  </div>
                  <p className="mt-5 text-[16px] font-extrabold text-brand-dark break-keep">{f.title}</p>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-brand-sub break-keep">{f.desc}</p>
                  {/* 호버 시 아래에서 차오르는 포인트 선 */}
                  <span
                    className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                    style={{ background: "var(--gradient-point)" }}
                  />
                </div>
              </Reveal>
            ))}
          </div>

          {/* 포함 사항 — 한 줄 띠로 묶는다 */}
          <Reveal delay={200}>
            <ul className="mx-auto mt-8 grid max-w-[760px] gap-3 rounded-2xl bg-brand-primary-50 px-5 py-4 text-left sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-brand-primary/15 sm:px-2">
              {["계약 기간 내 최적화 횟수 무제한", "월간 성과 리포트 제공", "전담 매니저 1:1 관리"].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-[14px] font-bold text-brand-dark break-keep sm:justify-center sm:px-4">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white">
                    <CheckIcon className="h-3 w-3" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ── 4. FAQ ── 그레이 밴드 */}
      <section className={TINT}>
        <div className="relative">
          <Reveal>
            <p className={`${EYEBROW} text-center`}>FAQ</p>
            <h2 className={`${H2} mt-4 text-center text-brand-dark`}>자주 묻는 질문</h2>
          </Reveal>

          <div className="mx-auto mt-12 max-w-[720px] space-y-2">
            {FAQS.map((faq, i) => (
              <Reveal key={faq.q} delay={i * 60}>
                <div className="overflow-hidden rounded-xl bg-white">
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
                    <div className="border-t border-brand-border px-5 pb-5 pt-3 text-[14.5px] leading-relaxed text-brand-sub break-keep">
                      {faq.a}
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </LandingShell>
  );
}
