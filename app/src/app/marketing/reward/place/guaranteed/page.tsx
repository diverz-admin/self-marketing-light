"use client";

import { useState } from "react";
import Link from "next/link";

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
          <span className="text-[10px] font-semibold text-gray-800">9:41</span>
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
            <span className="font-extrabold text-[18px] leading-none" style={{ color: "#03C75A" }}>N</span>
            <span className="flex-1 text-[13px] text-gray-800 font-medium">강남 맛집</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
          <div className="flex gap-3 pt-2 pb-1 overflow-hidden">
            {["지도","플레이스","블로그","이미지"].map((t, i) => (
              <span
                key={t}
                className={`text-[11px] shrink-0 pb-1.5 ${i === 1 ? "font-bold border-b-2" : "text-gray-400"}`}
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
          <div className="relative h-[90px] mx-2 mt-2 rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg,#e8f5e9,#c8e6c9)" }}>
            <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 200 90" preserveAspectRatio="xMidYMid slice">
              <line x1="0" y1="45" x2="200" y2="45" stroke="#4CAF50" strokeWidth="2"/>
              <line x1="100" y1="0" x2="100" y2="90" stroke="#4CAF50" strokeWidth="2"/>
              <line x1="0" y1="22" x2="200" y2="22" stroke="#4CAF50" strokeWidth="0.8" opacity="0.5"/>
              <line x1="0" y1="68" x2="200" y2="68" stroke="#4CAF50" strokeWidth="0.8" opacity="0.5"/>
              <line x1="50" y1="0" x2="50" y2="90" stroke="#4CAF50" strokeWidth="0.8" opacity="0.5"/>
              <line x1="150" y1="0" x2="150" y2="90" stroke="#4CAF50" strokeWidth="0.8" opacity="0.5"/>
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
                className="absolute flex items-center justify-center font-extrabold text-[9px] text-white rounded-full shadow"
                style={{
                  left: pin.x, top: pin.y,
                  width: pin.highlight ? 20 : 15,
                  height: pin.highlight ? 20 : 15,
                  background: pin.highlight ? "#03C75A" : "#555",
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
              { rank: 1, name: "강남 삼겹살 명가", score: "9.8", reviews: "1,204", highlight: false },
              { rank: 2, name: "황금돼지 강남점",  score: "9.5", reviews: "987",   highlight: false },
              { rank: 3, name: "내 업종 플레이스",  score: "9.3", reviews: "450",   highlight: true  },
              { rank: 4, name: "강남불판 거리점",   score: "9.1", reviews: "731",   highlight: false },
              { rank: 5, name: "신선육 강남역점",   score: "8.9", reviews: "622",   highlight: false },
            ].map((item) => (
              <div
                key={item.rank}
                className={`rounded-xl p-2 flex items-center gap-2 ${item.highlight ? "bg-green-50 border border-green-200" : "bg-white"}`}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-extrabold shrink-0"
                  style={{ background: item.highlight ? "#03C75A" : "#f0f0f0", color: item.highlight ? "white" : "#666" }}
                >
                  {item.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[9px] font-bold truncate ${item.highlight ? "text-green-800" : "text-gray-700"}`}>
                    {item.name}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[8px] text-yellow-500">★ {item.score}</span>
                    <span className="text-[7px] text-gray-400">리뷰 {item.reviews}</span>
                  </div>
                </div>
                {item.highlight && (
                  <span className="text-[7px] font-extrabold px-1.5 py-0.5 rounded-full text-white shrink-0" style={{ background: "#03C75A" }}>
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

      {/* 플로팅 배지 */}
      <div className="absolute -right-6 top-16 bg-white rounded-2xl shadow-xl px-4 py-2.5 border border-brand-border">
        <p className="text-[9px] text-brand-muted mb-0.5">보장 순위</p>
        <p className="text-[16px] font-extrabold leading-none" style={{ color: "#03C75A" }}>5위 이내</p>
      </div>
      <div className="absolute -left-8 bottom-20 bg-white rounded-2xl shadow-xl px-4 py-2.5 border border-brand-border">
        <p className="text-[9px] text-brand-muted mb-0.5">미달성 시</p>
        <p className="text-[15px] font-extrabold leading-none text-brand-primary">100% 환불</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   데이터
───────────────────────────────────────── */
const PROCESS = [
  { step: "01", title: "플레이스 분석",    desc: "키워드 현재 순위·경쟁 플레이스·리뷰 점수를 분석하여 5순위 달성 가능성을 진단합니다." },
  { step: "02", title: "트래픽 설계",      desc: "리워드 유입 방식으로 실제 사용자가 키워드 검색 후 플레이스를 방문·저장하도록 설계합니다." },
  { step: "03", title: "캠페인 집행",      desc: "검증된 매체사를 통해 자연스러운 유입을 일별로 조절하며 알고리즘 페널티 없이 순위를 끌어올립니다." },
  { step: "04", title: "순위 모니터링",    desc: "매일 키워드 순위를 트래킹합니다. 1~5순위 유지 일수만 보장 기간(25일)으로 카운트되며, 순위 이탈 시 카운트가 멈추고 즉시 트래픽을 보강합니다." },
  { step: "05", title: "보장 완료 & 리포트", desc: "5순위 이내 달성 확인 후 리포트를 제공합니다. 미달성 시 전액 환불 처리됩니다." },
];

const BENEFITS = [
  {
    title: "5순위 이내 진입 보장",
    desc: "네이버 플레이스 검색 결과 5위 이내 진입을 약속드립니다. 달성 못하면 전액 환불.",
    icon: "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z",
    color: "text-green-600", bg: "bg-green-50",
  },
  {
    title: "알고리즘 친화적 유입",
    desc: "실제 사용자가 키워드를 검색하고 방문하는 방식이라 네이버 페널티 위험 없이 안전하게 순위를 올립니다.",
    icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z",
    color: "text-blue-600", bg: "bg-blue-50",
  },
  {
    title: "매일 순위 트래킹",
    desc: "캠페인 기간 내 매일 키워드 순위를 모니터링하고, 순위 이탈 시 즉시 트래픽을 보강합니다.",
    icon: "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941",
    color: "text-purple-600", bg: "bg-purple-50",
  },
];

const WHY_TOP5 = [
  { stat: "68%", label: "검색 유저의 클릭이 상위 5개에 집중" },
  { stat: "3.2배", label: "5위권 내 플레이스의 방문자 증가" },
  { stat: "92%", label: "플레이스 5위 이내 달성률 (지난 6개월)" },
];

const FAQS = [
  {
    q: "어떤 방식으로 순위를 올리나요?",
    a: "실제 리워드 앱 사용자가 지정 키워드를 검색하고 플레이스를 방문·저장하는 방식입니다. 봇이나 어뷰징이 아닌 실사용자 유입이라 네이버 알고리즘 페널티 위험이 없습니다.",
  },
  {
    q: "5순위 안에 들지 못하면 어떻게 되나요?",
    a: "보장 기간 내 5순위 진입에 실패할 경우 결제 금액 전액을 환불해드립니다. 별도의 위약금이나 조건이 없습니다.",
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

/* ─────────────────────────────────────────
   페이지
───────────────────────────────────────── */
export default function PlaceGuaranteedPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <div className="w-full flex gap-5 items-start">

        {/* ────────────────────────────────
            LEFT: 상세 랜딩페이지
        ──────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* 브레드크럼 */}
          <div className="flex items-center gap-2 text-[12px] text-brand-muted px-1">
            <Link href="/marketing" className="hover:text-brand-text">대시보드</Link>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            <span>리워드 마케팅</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            <span className="text-brand-text font-medium">상위노출 보장형</span>
          </div>

          {/* ══ HERO ══ */}
          <div className="rounded-2xl overflow-hidden relative" style={{ background: "linear-gradient(135deg,#03C75A 0%,#028A3F 100%)" }}>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(255,255,255,0.12),transparent 70%)", transform: "translate(25%,-35%)" }} />
            <div className="absolute bottom-0 left-[40%] w-72 h-72 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(255,255,255,0.06),transparent 70%)", transform: "translateY(40%)" }} />

            <div className="grid grid-cols-1 lg:grid-cols-2 relative z-10">
              {/* 텍스트 */}
              <div className="px-10 py-14 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-white/20 text-white tracking-wide">NAVER PLACE</span>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white/10 text-white/80">상위노출 보장형</span>
                </div>
                <h1 className="text-[38px] font-extrabold text-white leading-[1.2] mb-5">
                  키워드 5순위 안,<br />
                  <span className="text-white">보장합니다</span>
                </h1>
                <p className="text-[15px] text-white/75 leading-relaxed mb-8">
                  네이버 플레이스 검색 결과 상위 5순위 진입을<br />
                  리워드 유입 방식으로 안전하게 달성합니다.<br />
                  미달성 시 100% 환불.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => document.getElementById("contact-panel")?.scrollIntoView({ behavior: "smooth" })}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-extrabold text-green-700 bg-white cursor-pointer hover:bg-white/90 transition-all shadow-lg"
                  >
                    무료 진단 신청
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                  </button>
                  <button
                    onClick={() => document.getElementById("process")?.scrollIntoView({ behavior: "smooth" })}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold text-white/80 cursor-pointer hover:text-white transition-all"
                    style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
                  >
                    진행 방식 보기
                  </button>
                </div>
                <div className="flex gap-8 mt-8 pt-8 border-t border-white/20">
                  {WHY_TOP5.map((s) => (
                    <div key={s.label}>
                      <p className="text-[22px] font-extrabold text-white leading-none">{s.stat}</p>
                      <p className="text-[11px] text-white/55 mt-1 leading-snug">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 폰 목업 */}
              <div className="flex items-end justify-center px-10 pt-10 pb-0">
                <PlaceRankMockup />
              </div>
            </div>
          </div>

          {/* ══ 5순위가 중요한 이유 (white) ══ */}
          <div className="bg-white rounded-2xl border border-brand-border px-10 py-12">
            <div className="text-center mb-8">
              <p className="text-[11px] font-extrabold text-brand-muted uppercase tracking-widest mb-3">왜 5순위인가</p>
              <h2 className="text-[28px] font-extrabold text-brand-dark mb-2">상위 5개에 클릭의 68%가 몰립니다</h2>
              <p className="text-[14px] text-brand-sub">네이버 플레이스에서 6위 이하는 사실상 노출 효과가 없습니다.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end mb-10">
              {[
                { rank: "1위", pct: 100, color: "#03C75A", visitors: "1,200" },
                { rank: "2위", pct: 78,  color: "#10B981", visitors: "940" },
                { rank: "3위", pct: 55,  color: "#34D399", visitors: "660" },
                { rank: "4위", pct: 32,  color: "#6EE7B7", visitors: "380" },
                { rank: "5위", pct: 20,  color: "#A7F3D0", visitors: "240" },
              ].map((bar) => (
                <div key={bar.rank} className="flex flex-col items-center gap-1.5">
                  <span className="text-[11px] font-bold text-brand-dark">{bar.visitors}명</span>
                  <div className="w-full rounded-t-xl" style={{ height: `${bar.pct * 1.2}px`, background: bar.color }} />
                  <span className="text-[12px] font-extrabold text-brand-dark">{bar.rank}</span>
                  <span className="text-[10px] text-brand-muted">{bar.pct}%</span>
                </div>
              ))}
            </div>
            <p className="text-center text-[12px] text-brand-muted">* 월간 일평균 방문자 비율 기준 (업종 평균)</p>
          </div>

          {/* ══ 3가지 혜택 (gray) ══ */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#F2F4F6" }}>
            <div className="px-10 py-12">
              <div className="text-center mb-8">
                <p className="text-[11px] font-extrabold text-brand-muted uppercase tracking-widest mb-3">서비스 특징</p>
                <h2 className="text-[28px] font-extrabold text-brand-dark mb-2">보장형이 다른 이유</h2>
                <p className="text-[14px] text-brand-sub">단순 트래픽이 아닌 순위 보장, 그 차이가 다릅니다.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {BENEFITS.map((b) => (
                  <div key={b.title} className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 ${b.bg}`}>
                      <svg className={`w-5 h-5 ${b.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={b.icon} />
                      </svg>
                    </div>
                    <p className={`text-[14px] font-extrabold mb-2 ${b.color}`}>{b.title}</p>
                    <p className="text-[13px] text-brand-sub leading-relaxed">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ══ 진행 프로세스 (dark) ══ */}
          <div id="process" className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#03C75A 0%,#028A3F 100%)" }}>
            <div className="px-10 py-12">
              <div className="text-center mb-8">
                <p className="text-[11px] font-extrabold text-white/60 uppercase tracking-widest mb-3">진행 프로세스</p>
                <h2 className="text-[28px] font-extrabold text-white mb-2">5단계로 5순위를 만듭니다</h2>
                <p className="text-[14px] text-white/60">분석부터 보장 완료까지 모든 과정을 책임집니다.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                {PROCESS.map((p, i) => (
                  <div key={p.step} className="flex flex-col items-center text-center relative">
                    <div className="h-12 w-12 rounded-full flex items-center justify-center mb-3 text-green-700 font-extrabold text-[14px]" style={{ background: "white" }}>
                      {p.step}
                    </div>
                    {i < PROCESS.length - 1 && (
                      <div className="hidden sm:block absolute top-6 left-[calc(50%+24px)] right-0 h-px bg-white/25" />
                    )}
                    <p className="text-[13px] font-extrabold text-white mb-1.5">{p.title}</p>
                    <p className="text-[11px] text-white/60 leading-relaxed">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ══ FAQ (white) ══ */}
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

          <div className="h-24" />
        </div>
        {/* END LEFT */}

        {/* ────────────────────────────────
            RIGHT: Fixed 문의하기 패널
        ──────────────────────────────── */}
        <div className="hidden lg:block w-64 xl:w-72 shrink-0" />

        <div
          id="contact-panel"
          className="hidden lg:block fixed z-30 w-64 xl:w-72 right-8"
          style={{ top: "92px", maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
        >
          <div className="space-y-3 pb-3">

            {/* 메인 문의 카드 */}
            <div className="rounded-2xl overflow-hidden relative" style={{ background: "linear-gradient(160deg,#03C75A 0%,#028A3F 100%)" }}>
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 110%, rgba(255,255,255,0.12), transparent 60%)" }} />
              <div className="relative z-10 px-5 py-6 text-center">
                <div className="h-10 w-10 rounded-2xl mx-auto mb-3 flex items-center justify-center text-[20px]" style={{ background: "rgba(255,255,255,0.2)" }}>
                  🛡️
                </div>
                <p className="text-[10px] font-extrabold text-white/60 uppercase tracking-widest mb-2">지금 바로 시작하세요</p>
                <h2 className="text-[20px] font-extrabold text-white leading-tight mb-3">
                  플레이스 5순위,<br />
                  보장받으세요
                </h2>
                <p className="text-[11px] text-white/70 leading-relaxed mb-5">
                  무료 진단으로 키워드 현재 순위와<br />
                  5순위 달성 가능성을 먼저 확인하세요.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => alert("문의하기 연결 예정")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-extrabold text-green-700 bg-white cursor-pointer hover:bg-white/90 transition-all shadow-lg"
                  >
                    문의하기
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                  </button>
                  <button
                    onClick={() => alert("무료 진단 연결 예정")}
                    className="w-full px-4 py-2.5 rounded-xl text-[12px] font-semibold text-white/80 cursor-pointer hover:text-white transition-all"
                    style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}
                  >
                    무료 순위 진단 신청
                  </button>
                </div>
              </div>
            </div>

            {/* 보장 지표 카드 */}
            <div className="bg-white rounded-2xl border border-brand-border p-4">
              <p className="text-[10px] font-extrabold text-brand-muted uppercase tracking-widest mb-2">보장 현황</p>
              {[
                { label: "보장 순위", value: "5위 이내" },
                { label: "보장 기간", value: "25일" },
                { label: "평균 달성 기간", value: "7~14일" },
                { label: "달성률 (6개월)", value: "92%" },
                { label: "미달성 환불", value: "100%" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-brand-border last:border-0">
                  <span className="text-[11px] text-brand-sub">{s.label}</span>
                  <span className="text-[12px] font-extrabold text-brand-dark">{s.value}</span>
                </div>
              ))}
              <p className="text-[10px] text-brand-muted leading-relaxed mt-2">
                * 1~5순위 유지 일수만 카운트됩니다. 순위 이탈 시 카운트 일시 정지 후 복귀 시 재개.
              </p>
            </div>

            {/* 포함 항목 카드 */}
            <div className="bg-brand-lighter rounded-2xl border border-brand-border p-4">
              <p className="text-[10px] font-extrabold text-brand-muted uppercase tracking-widest mb-2">서비스 포함 항목</p>
              <ul className="space-y-1.5">
                {["키워드 현재 순위 무료 진단", "리워드 트래픽 캠페인 집행", "매일 순위 모니터링", "5순위 달성 완료 리포트", "미달성 시 전액 환불"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[11px] text-brand-sub">
                    <svg className="w-3 h-3 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
        {/* END RIGHT */}

      </div>
    </>
  );
}
