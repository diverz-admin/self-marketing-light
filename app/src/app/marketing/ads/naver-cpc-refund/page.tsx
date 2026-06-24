"use client";

import { useState } from "react";

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
  { title: "불필요 키워드 제거", desc: "전환 없이 비용만 소모하는 키워드를 매주 진단하고 즉시 제외 처리합니다.", icon: "M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-red-500", bg: "bg-red-50" },
  { title: "입찰가 자동 최적화", desc: "시간대·요일·디바이스별 성과 데이터를 분석해 입찰가를 실시간으로 조정합니다.", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z", color: "text-blue-500", bg: "bg-blue-50" },
  { title: "품질지수 개선", desc: "광고 소재와 랜딩페이지 연관도를 높여 품질지수를 올리고 클릭당 비용을 낮춥니다.", icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z", color: "text-amber-500", bg: "bg-amber-50" },
  { title: "전환추적 세팅", desc: "네이버 전환 스크립트를 설치해 실제 구매·신청까지 추적하고 ROAS를 정확히 측정합니다.", icon: "M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z", color: "text-green-500", bg: "bg-green-50" },
  { title: "소재 A/B 테스트", desc: "복수의 광고 소재를 동시 운영해 클릭률이 높은 소재로 자동 집중합니다.", icon: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5", color: "text-purple-500", bg: "bg-purple-50" },
  { title: "월간 성과 리포트", desc: "클릭·노출·전환·ROAS 등 핵심 KPI를 정리한 리포트를 매월 제공합니다.", icon: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3", color: "text-indigo-500", bg: "bg-indigo-50" },
];

const PROCESS = [
  { step: "01", title: "광고 계정 연동", desc: "네이버 광고 계정 접근 권한을 공유해주시면, 현재 운영 현황을 전수 진단합니다.", icon: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" },
  { step: "02", title: "무료 계정 진단", desc: "낭비 키워드, 낮은 품질지수, 비효율 광고그룹을 분석하고 개선 우선순위를 도출합니다.", icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" },
  { step: "03", title: "최적화 실행", desc: "진단 결과를 바탕으로 키워드·입찰가·소재를 즉시 최적화하고 성과 개선을 시작합니다.", icon: "M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" },
  { step: "04", title: "환급 신청 대행", desc: "네이버 공식 환급 프로그램에 대행사 명의로 신청하고, 환급금을 고객께 전액 지급합니다.", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { step: "05", title: "월간 성과 공유", desc: "매월 성과 리포트와 함께 다음 달 운영 전략을 공유하고 지속적인 개선을 반복합니다.", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" },
];

const FAQS = [
  { q: "환급은 어떤 원리로 이루어지나요?", a: "네이버는 공식 인증 광고 대행사에게 광고주 대신 광고비를 집행한 금액의 일부를 수수료 형태로 환급합니다. DIVERZ는 이 환급금 전액을 광고주에게 돌려드립니다. 별도 수수료는 최적화 서비스 이용료로만 청구됩니다." },
  { q: "환급받으려면 광고비가 얼마 이상이어야 하나요?", a: "월 광고비 50만원 이상부터 환급 프로그램 적용이 가능합니다. 광고비 규모가 클수록 환급률이 높아집니다. 정확한 금액은 무료 상담 후 안내해드립니다." },
  { q: "기존 네이버 광고를 이미 운영 중인데 전환 가능한가요?", a: "네, 가능합니다. 기존 광고 계정을 그대로 유지한 채 대행사 연동만 추가하면 됩니다. 광고 데이터 손실 없이 환급 및 최적화 서비스를 즉시 시작할 수 있습니다." },
  { q: "최적화 서비스와 환급은 별개인가요?", a: "아니요, 함께 제공됩니다. 환급 프로그램 신청을 위해 공식 대행사 연동이 필요하며, 이 과정에서 자동으로 계정 최적화 서비스도 함께 진행됩니다. 하나의 계약으로 환급 + 최적화를 모두 받으실 수 있습니다." },
  { q: "환급금은 언제 지급되나요?", a: "네이버로부터 환급금이 입금되는 익월 중 정산 후 지급됩니다. 보통 광고비 집행 후 30~45일 내 지급됩니다." },
];

/* ─────────────────────────────────────────
   서브 컴포넌트
───────────────────────────────────────── */
function RefundCalculator() {
  const [spend, setSpend] = useState(500);
  const getRate = (v: number) => {
    if (v >= 1000) return 0.10;
    if (v >= 500) return 0.07;
    if (v >= 200) return 0.05;
    if (v >= 50) return 0.03;
    return 0;
  };
  const rate = getRate(spend);
  const monthly = Math.round(spend * rate);
  const annual = monthly * 12;
  const pct = Math.round(rate * 100);

  return (
    <div className="bg-white rounded-2xl border border-brand-border p-6 w-full">
      <h3 className="text-[15px] font-extrabold text-brand-dark mb-1">환급금 계산기</h3>
      <p className="text-[12px] text-brand-sub mb-5">월 광고비를 입력하면 예상 환급금을 알 수 있습니다.</p>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] text-brand-sub font-medium">월 광고비</span>
          <span className="text-[16px] font-extrabold text-brand-dark">{spend.toLocaleString()}만원</span>
        </div>
        <input type="range" min={50} max={2000} step={50} value={spend} onChange={(e) => setSpend(Number(e.target.value))} className="w-full accent-green-500 h-2" />
        <div className="flex justify-between text-[10px] text-brand-muted mt-1">
          <span>50만원</span>
          <span>2,000만원</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-green-50 border border-green-100 p-3 text-center">
          <p className="text-[11px] text-green-600 font-semibold mb-1">환급률</p>
          <p className="text-[22px] font-extrabold text-green-700">{pct}%</p>
        </div>
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-center">
          <p className="text-[11px] text-blue-600 font-semibold mb-1">월 환급금</p>
          <p className="text-[18px] font-extrabold text-blue-700">{monthly > 0 ? `${monthly}만원` : "—"}</p>
        </div>
        <div className="rounded-xl bg-purple-50 border border-purple-100 p-3 text-center">
          <p className="text-[11px] text-purple-600 font-semibold mb-1">연간 환급금</p>
          <p className="text-[18px] font-extrabold text-purple-700">{annual > 0 ? `${annual}만원` : "—"}</p>
        </div>
      </div>
      {rate === 0 && (
        <p className="text-[12px] text-brand-muted text-center mt-3">월 50만원 이상부터 환급이 적용됩니다.</p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   페이지
───────────────────────────────────────── */
export default function NaverRefundPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [provider, setProvider] = useState("naver-sa");
  const [accountId, setAccountId] = useState("");
  const [accountName, setAccountName] = useState("");
  const [advertiserId, setAdvertiserId] = useState("");
  const [agreed, setAgreed] = useState(false);

  return (
    <>
      {/* 고정 문의 배너 */}
      <div
        className="animate-banner-float fixed bottom-6 right-6 xl:right-[280px] z-50 flex items-center gap-4 px-5 py-4 rounded-2xl shadow-2xl"
        style={{ background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", border: "1px solid #86efac", minWidth: "340px" }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-extrabold text-brand-dark leading-tight mb-0.5">환급 가능 여부 무료로 확인하세요</p>
          <p className="text-[11px] text-brand-sub leading-snug">계정 연동 없이 광고비만 알려주시면 바로 안내해드립니다.</p>
        </div>
        <button
          onClick={() => alert("문의하기 연결 예정")}
          className="shrink-0 px-4 py-2.5 rounded-xl text-[13px] font-extrabold text-white hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          style={{ background: "linear-gradient(135deg,#03C75A,#02A64E)" }}
        >
          무료 문의
        </button>
      </div>

      <div className="w-full space-y-4">

        {/* 브레드크럼 */}
        <div className="flex items-center gap-2 text-[12px] text-brand-muted px-1">
          <span>퍼포먼스 마케팅</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
          <span>네이버</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
          <span className="text-brand-text font-medium">네이버 SA 최적화/환급</span>
        </div>

        {/* ══════════════════════════════
            HERO
        ══════════════════════════════ */}
        <div className="rounded-2xl overflow-hidden relative" style={{ background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)" }}>
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(3,199,90,0.15),transparent 70%)", transform: "translate(20%,-30%)" }} />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(49,130,246,0.12),transparent 70%)", transform: "translateY(40%)" }} />
          <div className="grid grid-cols-1 lg:grid-cols-2 relative z-10">
            {/* 왼쪽: 텍스트 */}
            <div className="px-10 py-14 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg text-white" style={{ background: "rgba(3,199,90,0.25)", border: "1px solid rgba(3,199,90,0.4)" }}>NAVER SA</span>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg text-white/60" style={{ background: "rgba(255,255,255,0.08)" }}>광고비 환급</span>
              </div>
              <h1 className="text-[38px] font-extrabold text-white leading-[1.2] mb-5">
                광고비를<br />
                <span style={{ color: "#03C75A" }}>돌려받으세요</span>
              </h1>
              <p className="text-[15px] text-white/60 leading-relaxed mb-8">
                네이버 공식 파트너사를 통해 광고비 최대 10%를 환급받고,<br />
                전문 최적화로 동일 예산에서 더 많은 성과를 내세요.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => alert("무료 상담 연결 예정")}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-extrabold text-white cursor-pointer hover:opacity-90 transition-all"
                  style={{ background: "linear-gradient(135deg,#03C75A,#02A64E)" }}
                >
                  무료 상담 시작
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                </button>
                <button
                  onClick={() => document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" })}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold text-white/70 cursor-pointer hover:text-white transition-all"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  환급금 계산하기
                </button>
              </div>
              <div className="flex gap-8 mt-8 pt-8 border-t border-white/10">
                {[
                  { v: "최대 10%", l: "광고비 환급률" },
                  { v: "월 1회", l: "자동 정산" },
                  { v: "무제한", l: "계정 최적화" },
                ].map((s) => (
                  <div key={s.l}>
                    <p className="text-[22px] font-extrabold text-white leading-none">{s.v}</p>
                    <p className="text-[11px] text-white/45 mt-1">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* 오른쪽: 환급 구간 카드 */}
            <div className="flex items-center justify-center px-8 py-12">
              <div className="w-full rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <p className="text-[11px] text-white/45 font-bold uppercase tracking-widest mb-5">환급 구간별 혜택</p>
                <div className="space-y-2.5">
                  {REFUND_TIERS.map((t) => (
                    <div
                      key={t.range}
                      className={`flex items-center justify-between rounded-xl px-4 py-3.5 ${t.highlight ? "border border-green-400/40" : ""}`}
                      style={{ background: t.highlight ? "rgba(3,199,90,0.15)" : "rgba(255,255,255,0.05)" }}
                    >
                      <div>
                        <p className="text-[11px] text-white/55 leading-none mb-1">{t.range}</p>
                        <p className="text-[14px] font-extrabold text-white">
                          {t.monthly} <span className="text-[11px] font-normal text-white/40">/ 월</span>
                        </p>
                      </div>
                      <span className={`text-[22px] font-extrabold ${t.highlight ? "text-green-400" : "text-white/40"}`}>{t.rate}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-white/25 mt-4">* 네이버 정책에 따라 변동될 수 있습니다.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════
            FEATURE 1: 환급 신청
        ══════════════════════════════ */}
        <div className="rounded-2xl overflow-hidden bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="flex flex-col justify-center px-12 py-14">
              <span className="text-[11px] font-extrabold text-green-600 uppercase tracking-widest mb-4">환급 신청 대행</span>
              <h2 className="text-[30px] font-extrabold text-brand-dark leading-tight mb-5">
                환급 신청은 복잡하지만<br />
                <span style={{ color: "#03C75A" }}>DIVERZ는 쉽습니다</span>
              </h2>
              <p className="text-[15px] text-brand-sub leading-relaxed mb-8">
                광고주 ID 하나만 등록하면 신청부터 지급까지<br />
                모든 과정을 대신 처리해드립니다.
              </p>
              <button
                onClick={() => document.getElementById("form")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-1.5 text-[14px] font-bold text-green-600 cursor-pointer w-fit hover:underline"
              >
                지금 바로 신청하기
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
              </button>
            </div>
            <div className="flex items-center justify-center px-8 py-10 bg-brand-lighter">
              <div className="w-full max-w-sm">
                <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-sm">
                  <p className="text-[11px] font-extrabold text-brand-muted uppercase tracking-widest mb-4">진행 프로세스</p>
                  {PROCESS.map((p, i) => (
                    <div key={p.step} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-extrabold text-white" style={{ background: "linear-gradient(135deg,#03C75A,#02A64E)" }}>
                          {p.step}
                        </span>
                        {i < PROCESS.length - 1 && <span className="w-px flex-1 bg-brand-border my-1" />}
                      </div>
                      <div className="pb-4 pt-1">
                        <p className="text-[13px] font-bold text-brand-dark mb-0.5">{p.title}</p>
                        <p className="text-[11px] text-brand-sub leading-relaxed">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════
            FEATURE 2: 환급 계산기 (dark)
        ══════════════════════════════ */}
        <div id="calculator" className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)" }}>
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="flex flex-col justify-center px-12 py-14">
              <span className="text-[11px] font-extrabold text-green-400 uppercase tracking-widest mb-4">환급 계산</span>
              <h2 className="text-[30px] font-extrabold text-white leading-tight mb-5">
                환급금이 얼마인지<br />
                <span style={{ color: "#03C75A" }}>한눈에 보입니다</span>
              </h2>
              <p className="text-[15px] text-white/60 leading-relaxed mb-8">
                월 광고비 규모에 따라 환급률이 달라집니다.<br />
                오른쪽 계산기로 예상 환급금을 직접 확인하세요.
              </p>
              <div className="rounded-xl overflow-hidden border border-white/10">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.07)" }}>
                      <th className="text-left px-4 py-3 font-bold text-white/40 text-[11px]">광고비</th>
                      <th className="text-center px-4 py-3 font-bold text-white/40 text-[11px]">환급률</th>
                      <th className="text-right px-4 py-3 font-bold text-white/40 text-[11px]">월 환급</th>
                      <th className="text-right px-4 py-3 font-bold text-white/40 text-[11px]">연간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {REFUND_TIERS.map((t) => (
                      <tr key={t.range} className="border-t border-white/5" style={{ background: t.highlight ? "rgba(3,199,90,0.12)" : "transparent" }}>
                        <td className="px-4 py-2.5 text-white/70 text-[12px]">{t.range}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`font-extrabold text-[14px] ${t.highlight ? "text-green-400" : "text-white/60"}`}>{t.rate}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-white/70 font-bold text-[12px]">{t.monthly}</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className={`font-extrabold text-[12px] ${t.highlight ? "text-green-400" : "text-white/60"}`}>{t.annual}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex items-center justify-center px-8 py-12">
              <div className="w-full max-w-sm">
                <RefundCalculator />
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════
            FEATURE 3: 계정 최적화 (gray)
        ══════════════════════════════ */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#F2F4F6" }}>
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="flex items-center justify-center p-10">
              <div className="grid grid-cols-2 gap-3 w-full">
                {OPTIMIZE_FEATURES.map((f) => (
                  <div key={f.title} className="rounded-xl p-4 bg-white border border-brand-border flex gap-3 shadow-sm">
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${f.bg}`}>
                      <svg className={`w-4 h-4 ${f.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-brand-dark mb-0.5">{f.title}</p>
                      <p className="text-[10px] text-brand-sub leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-center px-12 py-14">
              <span className="text-[11px] font-extrabold text-brand-primary uppercase tracking-widest mb-4">계정 최적화</span>
              <h2 className="text-[30px] font-extrabold text-brand-dark leading-tight mb-5">
                계정 최적화는 어렵지만<br />
                <span className="text-brand-primary">DIVERZ는 자동입니다</span>
              </h2>
              <p className="text-[15px] text-brand-sub leading-relaxed mb-8">
                키워드·입찰가·소재·품질지수까지<br />
                6가지 핵심 영역을 전문가가 지속 관리합니다.
              </p>
              <div className="space-y-2">
                {["계약 기간 내 최적화 횟수 무제한", "월간 성과 리포트 제공", "전담 매니저 1:1 관리"].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-[13px] text-brand-sub">
                    <svg className="w-4 h-4 text-brand-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════
            FAQ
        ══════════════════════════════ */}
        <div className="bg-white rounded-2xl border border-brand-border px-10 py-12">
          <div className="max-w-2xl mx-auto">
            <p className="text-[11px] font-extrabold text-brand-muted uppercase tracking-widest text-center mb-3">FAQ</p>
            <h2 className="text-[28px] font-extrabold text-brand-dark text-center mb-8">자주 묻는 질문</h2>
            <div className="space-y-2">
              {FAQS.map((faq, i) => (
                <div key={i} className="border border-brand-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-brand-lighter transition-colors cursor-pointer"
                  >
                    <span className="text-[14px] font-semibold text-brand-dark pr-4">{faq.q}</span>
                    <svg className={`w-4 h-4 text-brand-muted shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 pt-3 text-[14px] text-brand-sub leading-relaxed border-t border-brand-border">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════
            광고주 ID 등록 폼
        ══════════════════════════════ */}
        <div id="form" className="rounded-2xl overflow-hidden" style={{ background: "#F2F4F6" }}>
          <div className="px-10 py-10 text-center border-b border-brand-border" style={{ background: "white" }}>
            <p className="text-[11px] font-extrabold text-green-600 uppercase tracking-widest mb-3">광고주 ID 등록</p>
            <h2 className="text-[28px] font-extrabold text-brand-dark mb-2">지금 바로 신청하세요</h2>
            <p className="text-[14px] text-brand-sub">정보 입력 후 영업일 1~3일 내 담당자가 연락드립니다.</p>
          </div>
          <div className="p-8 grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 items-start">
            {/* 왼쪽: 폼 */}
            <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
              <div className="px-8 py-6 border-b border-brand-border" style={{ background: "linear-gradient(135deg,#f8faff,#eef4ff)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg text-white" style={{ background: "linear-gradient(135deg,#03C75A,#02A64E)" }}>NAVER SA</span>
                  <span className="text-[11px] px-2.5 py-1 rounded-lg text-brand-sub bg-brand-lighter border border-brand-border">광고비 환급</span>
                </div>
                <h3 className="text-[20px] font-extrabold text-brand-dark mt-3 mb-1">광고주 ID 등록</h3>
                <p className="text-[13px] text-brand-sub">아래 정보를 입력하시면 환급 신청이 즉시 접수됩니다.</p>
              </div>
              <div className="px-8 py-7 space-y-5">
                <div>
                  <label className="text-[13px] font-bold text-brand-dark mb-2 block">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full text-white text-[10px] font-extrabold mr-1.5" style={{ background: "linear-gradient(135deg,#03C75A,#02A64E)" }}>1</span>
                    매체사 선택
                  </label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full border border-brand-border rounded-xl px-4 py-3 text-[13px] text-brand-dark bg-white focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 pr-10"
                  >
                    <option value="naver-sa">네이버 SA (검색광고)</option>
                    <option value="naver-gfa">네이버 GFA (성과형 DA)</option>
                    <option value="kakao">카카오모먼트</option>
                    <option value="google">구글 Ads</option>
                  </select>
                </div>
                <div>
                  <label className="text-[13px] font-bold text-brand-dark mb-2 block">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full text-white text-[10px] font-extrabold mr-1.5" style={{ background: "linear-gradient(135deg,#03C75A,#02A64E)" }}>2</span>
                    네이버 계정 ID
                  </label>
                  <input
                    type="text"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    placeholder="예) naver_id123"
                    className="w-full border border-brand-border rounded-xl px-4 py-3 text-[13px] text-brand-dark placeholder:text-brand-muted focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-bold text-brand-dark mb-2 block">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full text-white text-[10px] font-extrabold mr-1.5" style={{ background: "linear-gradient(135deg,#03C75A,#02A64E)" }}>3</span>
                    네이버 계정 이름
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="예) 홍길동"
                    className="w-full border border-brand-border rounded-xl px-4 py-3 text-[13px] text-brand-dark placeholder:text-brand-muted focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-bold text-brand-dark mb-2 block">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full text-white text-[10px] font-extrabold mr-1.5" style={{ background: "linear-gradient(135deg,#03C75A,#02A64E)" }}>4</span>
                    광고주 ID <span className="text-brand-muted font-normal">(숫자)</span>
                  </label>
                  <input
                    type="text"
                    value={advertiserId}
                    onChange={(e) => setAdvertiserId(e.target.value.replace(/\D/g, ""))}
                    placeholder="예) 1234567"
                    className="w-full border border-brand-border rounded-xl px-4 py-3 text-[13px] text-brand-dark placeholder:text-brand-muted focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  />
                  <p className="text-[11px] text-brand-muted mt-1.5">네이버 광고 관리시스템 &gt; 계정 관리 &gt; 광고주 정보에서 확인하세요.</p>
                </div>
                <div className="rounded-xl bg-brand-lighter border border-brand-border p-4">
                  <p className="text-[12px] font-extrabold text-brand-dark mb-2.5">📋 필독 안내 사항</p>
                  <ul className="space-y-1.5">
                    {[
                      "광고주 ID는 네이버 광고 관리시스템 내 숫자 형태의 고유 식별자입니다.",
                      "잘못된 정보 입력 시 환급 처리가 지연될 수 있습니다.",
                      "환급 신청 후 영업일 기준 1~3일 내로 담당자가 연락드립니다.",
                      "본 서비스는 네이버 공식 파트너 프로그램을 통해 제공됩니다.",
                    ].map((txt) => (
                      <li key={txt} className="flex items-start gap-2 text-[12px] text-brand-sub">
                        <span className="text-brand-muted mt-0.5 shrink-0">·</span>
                        {txt}
                      </li>
                    ))}
                  </ul>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-brand-border accent-green-500 cursor-pointer"
                  />
                  <span className="text-[13px] text-brand-sub leading-snug">
                    개인정보 수집·이용에 동의하며, 환급 서비스 신청을 위해 위 정보가 활용됨을 확인합니다.
                    <span className="text-brand-primary underline ml-1 cursor-pointer">[전문 보기]</span>
                  </span>
                </label>
                <button
                  disabled={!agreed || !accountId || !advertiserId}
                  onClick={() => alert("신청이 접수되었습니다. 담당자가 곧 연락드립니다.")}
                  className="w-full py-4 rounded-2xl text-[15px] font-extrabold text-white flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg,#191F28,#333D4B)" }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  광고주 ID 등록 신청
                </button>
              </div>
            </div>
            {/* 오른쪽: 스티키 패널 */}
            <div className="sticky top-6 space-y-4">
              <div className="bg-white rounded-2xl border border-brand-border p-5">
                <h3 className="text-[13px] font-extrabold text-brand-dark mb-3 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: "linear-gradient(135deg,#03C75A,#02A64E)" }}>①</span>
                  환급 대상 광고 상품
                </h3>
                <div className="space-y-1">
                  {["파워링크 (SA 검색광고)", "쇼핑검색광고", "브랜드검색", "디스플레이광고 (GFA)"].map((item, i) => (
                    <div key={item} className="flex items-center gap-2.5 py-2 border-b border-brand-border last:border-0">
                      <span className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shrink-0" style={{ background: "linear-gradient(135deg,#03C75A,#02A64E)" }}>
                        {i + 1}
                      </span>
                      <span className="text-[12px] font-semibold text-brand-dark">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-brand-border p-5">
                <h3 className="text-[13px] font-extrabold text-brand-dark mb-3 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: "linear-gradient(135deg,#03C75A,#02A64E)" }}>②</span>
                  광고주 ID 확인 방법
                </h3>
                <div className="space-y-2.5 mb-4">
                  {[
                    { n: 1, t: "네이버 광고 관리시스템 접속", sub: "searchad.naver.com" },
                    { n: 2, t: "우측 상단 계정 설정 클릭", sub: "계정명 옆 설정 아이콘" },
                    { n: 3, t: "광고주 정보에서 ID 확인", sub: "숫자 7자리 광고주 ID" },
                  ].map((s) => (
                    <div key={s.n} className="flex items-start gap-2.5">
                      <span className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg,#03C75A,#02A64E)" }}>{s.n}</span>
                      <div>
                        <p className="text-[12px] font-semibold text-brand-dark leading-tight">{s.t}</p>
                        <p className="text-[11px] text-brand-muted">{s.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-brand-border overflow-hidden text-[10px]">
                  <div className="bg-white border-b border-brand-border px-3 py-2 flex items-center gap-2">
                    <span className="font-extrabold text-[11px]" style={{ color: "#03C75A" }}>N</span>
                    <span className="text-brand-muted font-medium">광고주센터</span>
                    <div className="ml-auto flex items-center gap-1">
                      <span className="px-1.5 py-0.5 rounded border border-green-400 text-green-600 text-[9px] font-bold">계정 관리</span>
                      <span className="text-red-500 font-bold text-[9px]">광고 플랫폼 ▾</span>
                    </div>
                  </div>
                  <div className="bg-white border-b border-brand-border px-3 py-1.5 flex gap-3">
                    {["광고 계정", "관리 계정", "즐겨찾기"].map((t, i) => (
                      <span key={t} className={`text-[10px] pb-0.5 ${i === 0 ? "font-bold text-brand-primary border-b-2 border-brand-primary" : "text-brand-muted"}`}>{t}</span>
                    ))}
                  </div>
                  <div className="bg-brand-lighter px-3 py-1.5 grid grid-cols-[1fr_60px_70px] text-[9px] text-brand-muted font-semibold border-b border-brand-border">
                    <span>계정 이름 ↑↓</span>
                    <span className="text-center">권한</span>
                    <span className="text-center">플랫폼</span>
                  </div>
                  <div className="px-3 py-2 grid grid-cols-[1fr_60px_70px] text-[9px] bg-white">
                    <div className="flex items-center gap-1">
                      <input type="checkbox" className="w-2.5 h-2.5 accent-green-500" readOnly />
                      <span className="text-blue-500 underline">다이버즈</span>
                      <span className="text-red-500 font-bold">(1234567)</span>
                    </div>
                    <span className="text-center text-brand-sub">핵심자</span>
                    <span className="text-center text-brand-sub">검색광고</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => window.open("https://www.aurabiz.kr/menus/rebate/", "_blank")}
                className="w-full py-3.5 rounded-2xl text-[13px] font-extrabold text-white flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
                style={{ background: "linear-gradient(135deg,#03C75A,#02A64E)" }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                10초만에 환급 신청하기
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════
            BOTTOM CTA
        ══════════════════════════════ */}
        <div className="rounded-2xl overflow-hidden relative py-16 px-10 text-center" style={{ background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 50%, rgba(3,199,90,0.12), transparent 70%)" }} />
          <div className="relative z-10">
            <p className="text-[11px] font-extrabold text-green-400 uppercase tracking-widest mb-4">지금 바로 시작하세요</p>
            <h2 className="text-[32px] font-extrabold text-white leading-tight mb-4">
              광고비, 이제<br />
              <span style={{ color: "#03C75A" }}>돌려받으세요</span>
            </h2>
            <p className="text-[15px] text-white/55 leading-relaxed mb-8">
              네이버 공식 파트너를 통해 광고비 최대 10%를 환급받고<br />
              전문 최적화로 더 많은 성과를 만들어보세요.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => alert("무료 상담 연결 예정")}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-[15px] font-extrabold text-white cursor-pointer hover:opacity-90 transition-all shadow-lg"
                style={{ background: "linear-gradient(135deg,#03C75A,#02A64E)" }}
              >
                무료 환급 상담 시작
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
              </button>
              <button
                onClick={() => window.open("https://www.aurabiz.kr/menus/rebate/", "_blank")}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-[15px] font-semibold text-white/70 cursor-pointer hover:text-white transition-all"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                10초 빠른 신청
              </button>
            </div>
          </div>
        </div>

        <div className="h-24" />

      </div>
    </>
  );
}
