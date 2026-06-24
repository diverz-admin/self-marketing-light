"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const TABS = [
  { label: "블로그배포", href: "/marketing/review/place/blog-reporter" },
  { label: "영수증리뷰", href: "/marketing/review/place/receipt" },
];

const UNIT_PRICE = 1500;

export default function ReceiptReviewPage() {
  const pathname = usePathname();

  const [placePid, setPlacePid] = useState("");
  const [startDate, setStartDate] = useState("2026-06-24");
  const [issueDays, setIssueDays] = useState(7);
  const [dailyVolume, setDailyVolume] = useState(5);
  const [businessName, setBusinessName] = useState("대박갈비 일산동구청점");
  const [mainKeyword, setMainKeyword] = useState("");
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [businessInfo, setBusinessInfo] = useState("");
  const [reviewGuide, setReviewGuide] = useState("");
  const [agreements, setAgreements] = useState({ req1: false, req2: false, opt1: false });
  const [submitted, setSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const totalCount = issueDays * dailyVolume;
  const orderAmount = UNIT_PRICE * totalCount;
  const balance = 11500;

  const handleHashtagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || !hashtagInput.trim()) return;
    e.preventDefault();
    const raw = hashtagInput.trim();
    setHashtags((p) => [...p, raw.startsWith("#") ? raw : `#${raw}`]);
    setHashtagInput("");
  };

  const handleSubmit = async () => {
    if (!agreements.req1 || !agreements.req2) return;
    setIsPending(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsPending(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl border border-brand-border p-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-green-50 mx-auto flex items-center justify-center mb-5">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-[20px] font-extrabold text-brand-dark mb-2">캠페인 등록 완료</h2>
          <p className="text-[14px] text-brand-sub mb-8">검수 후 1~2일 내 캠페인이 시작됩니다.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/marketing/review/place" className="px-5 py-3 rounded-2xl text-[14px] font-bold bg-brand-primary text-white">
              캠페인 목록으로
            </Link>
            <button onClick={() => setSubmitted(false)} className="px-5 py-3 rounded-2xl text-[14px] font-bold bg-brand-lighter text-brand-text border border-brand-border cursor-pointer">
              새 캠페인 등록
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* 브레드크럼 */}
      <nav className="flex items-center gap-1.5 text-[13px] text-brand-sub">
        <Link href="/marketing" className="hover:text-brand-text">대시보드</Link>
        <span>›</span>
        <Link href="/marketing/review/place" className="hover:text-brand-text">네이버 플레이스</Link>
        <span>›</span>
        <span className="text-brand-text font-medium">영수증리뷰</span>
      </nav>

      {/* 탭 */}
      <div className="bg-white rounded-2xl border border-brand-border px-2 py-2 flex items-center gap-1 overflow-x-auto">
        {TABS.map((tab) => (
          <Link key={tab.href} href={tab.href}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${
              pathname === tab.href ? "bg-brand-primary text-white shadow-sm" : "text-brand-sub hover:bg-brand-lighter hover:text-brand-dark"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">

        {/* ── 왼쪽 ── */}
        <div className="space-y-5">

          {/* 영수증리뷰 안내 */}
          <div className="flex gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
            <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />
            </svg>
            <div>
              <p className="text-[13px] font-extrabold text-emerald-800 mb-1">영수증리뷰란?</p>
              <p className="text-[12.5px] text-emerald-700 leading-relaxed">
                실제 결제 영수증을 보유한 방문 고객이 네이버 플레이스에 리뷰를 남기는 캠페인입니다.
                검증된 구매자의 진성 리뷰로 별점과 신뢰도를 빠르게 높일 수 있습니다.
              </p>
            </div>
          </div>

          {/* 스케줄 설정 */}
          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-5">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#0341C7,#6366F1)" }}>
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
              <div>
                <h2 className="text-[15px] font-bold text-brand-dark">스케줄 설정</h2>
                <p className="text-[12px] text-brand-sub">발행 기간과 일발행량을 설정하세요</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* 플레이스 PID */}
              <div>
                <label className="block text-[13px] font-semibold text-brand-dark mb-1.5">
                  플레이스 PID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    value={placePid}
                    onChange={(e) => setPlacePid(e.target.value)}
                    placeholder="업체명을 검색하세요"
                    className="w-full pl-3 pr-9 py-2.5 border border-brand-border rounded-xl text-[13px] text-brand-dark bg-white focus:outline-none focus:border-brand-primary transition-colors"
                  />
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <p className="text-[11.5px] text-brand-muted mt-1">업체명 검색 또는 PID 숫자를 직접 입력하세요</p>
              </div>

              {/* 발행 시작일 */}
              <div>
                <label className="block text-[13px] font-semibold text-brand-dark mb-1.5">
                  발행 시작일 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-3 pr-9 py-2.5 border border-brand-border rounded-xl text-[13px] text-brand-dark bg-white focus:outline-none focus:border-brand-primary transition-colors"
                  />
                </div>
                <p className="text-[11.5px] text-brand-muted mt-1">원하는 발행 시작일을 선택해주세요</p>
              </div>

              {/* 발행 일수 */}
              <div>
                <label className="block text-[13px] font-semibold text-brand-dark mb-1.5">
                  발행 일수 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={issueDays}
                  onChange={(e) => setIssueDays(Math.min(7, Math.max(1, Number(e.target.value))))}
                  min={1}
                  max={7}
                  className="w-full px-3 py-2.5 border border-brand-border rounded-xl text-[13px] text-brand-dark bg-white focus:outline-none focus:border-brand-primary transition-colors"
                />
                <p className="text-[11.5px] text-brand-muted mt-1">1~7일 사이로 입력해주세요</p>
              </div>

              {/* 일발행량 */}
              <div>
                <label className="block text-[13px] font-semibold text-brand-dark mb-1.5">
                  일발행량 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={dailyVolume}
                  onChange={(e) => setDailyVolume(Math.max(1, Number(e.target.value)))}
                  min={1}
                  className="w-full px-3 py-2.5 border border-brand-border rounded-xl text-[13px] text-brand-dark bg-white focus:outline-none focus:border-brand-primary transition-colors"
                />
                <p className="text-[11.5px] text-brand-muted mt-1">하루에 발행할 건수를 입력해주세요</p>
              </div>
            </div>
          </div>

          {/* 필수 정보 */}
          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-5">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#F97316,#EF4444)" }}>
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
              </span>
              <div>
                <h2 className="text-[15px] font-bold text-brand-dark">필수 정보</h2>
                <p className="text-[12px] text-brand-sub">업체명, 키워드, 해시태그를 입력하세요</p>
              </div>
            </div>

            {[
              { label: "업체명",      value: businessName, onChange: setBusinessName, placeholder: "대박갈비 일산동구청점" },
              { label: "메인 키워드", value: mainKeyword,  onChange: setMainKeyword,  placeholder: "1개만 반영됩니다." },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-[13px] font-semibold text-brand-dark mb-1.5">
                  {field.label} <span className="text-red-500">*</span>
                </label>
                <input
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-0 py-2 border-b border-brand-border text-[13px] text-brand-dark bg-transparent focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
            ))}

            <div>
              <label className="block text-[13px] font-semibold text-brand-dark mb-1">
                해시태그 <span className="text-red-500">*</span>{" "}
                <span className="text-[11.5px] font-normal text-brand-primary">(#해시태그로 구분, 일괄 등록 가능)</span>
              </label>
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 mb-1">
                  {hashtags.map((tag, i) => (
                    <span key={i} className="flex items-center gap-1 px-2.5 py-0.5 bg-brand-lighter text-brand-primary rounded-full text-[12px] font-medium">
                      {tag}
                      <button onClick={() => setHashtags((p) => p.filter((_, j) => j !== i))} className="text-brand-muted hover:text-brand-primary ml-0.5">×</button>
                    </span>
                  ))}
                </div>
              )}
              <input
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={handleHashtagKey}
                placeholder="입력 후 엔터키로 추가"
                className="w-full px-0 py-2 border-b border-brand-border text-[13px] text-brand-dark bg-transparent focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-brand-dark mb-1.5">
                업체 정보 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={businessInfo}
                onChange={(e) => setBusinessInfo(e.target.value)}
                maxLength={500}
                rows={5}
                placeholder={`예시)\n-대표 메뉴 (계절음식, 계절 상품 등)\n-이벤트 소개\n-영업시간(오픈, 브레이크 타임, 마감시간, 마지막 주문 시간)\n-교통안내 (주차, 지하철역 도보 거리 등)`}
                className="w-full px-3 py-2.5 border border-brand-border rounded-xl text-[13px] text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all resize-none"
              />
              <p className="text-right text-[11px] text-brand-muted mt-1">{businessInfo.length} / 500</p>
            </div>
          </div>

          {/* 리뷰 가이드 */}
          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-5">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#10B981,#059669)" }}>
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </span>
              <div>
                <h2 className="text-[15px] font-bold text-brand-dark">리뷰 가이드</h2>
                <p className="text-[12px] text-brand-sub">리뷰어에게 전달할 안내사항을 작성하세요</p>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-brand-dark mb-1.5">
                리뷰어에게 전달할 안내사항 <span className="text-[12px] font-normal text-brand-muted">(선택)</span>
              </label>
              <textarea
                value={reviewGuide}
                onChange={(e) => setReviewGuide(e.target.value)}
                maxLength={300}
                rows={4}
                placeholder={`예시)\n-방문 후 영수증 촬영 필수\n-별점 5점으로 작성 요청\n-특정 메뉴나 서비스 언급 요청 사항 등`}
                className="w-full px-3 py-2.5 border border-brand-border rounded-xl text-[13px] text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all resize-none"
              />
              <p className="text-right text-[11px] text-brand-muted mt-1">{reviewGuide.length} / 300</p>
            </div>

            {/* 영수증 주의사항 */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-[12.5px] font-extrabold text-amber-700 mb-2">영수증 인증 안내</p>
              <ul className="space-y-1.5">
                {[
                  "리뷰어는 실제 방문 후 영수증 사진을 제출해야 합니다.",
                  "영수증은 결제일로부터 7일 이내만 인정됩니다.",
                  "영수증 미제출 시 캠페인 참여가 취소될 수 있습니다.",
                  "네이버 플레이스 리뷰 작성 후 URL을 제출해야 완료 처리됩니다.",
                ].map((note, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-amber-700">
                    <span className="font-bold shrink-0 mt-px">•</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* ── 오른쪽: 캠페인 설정 ── */}
        <div className="space-y-4 sticky top-8 self-start">
          <div className="flex items-center gap-3 px-1">
            <span className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)" }}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </span>
            <div>
              <h2 className="text-[15px] font-bold text-brand-dark">캠페인 설정</h2>
              <p className="text-[12px] text-brand-sub">결제 및 동의 후 캠페인을 등록하세요</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-4">
            {/* 단가 안내 */}
            <div className="flex items-center justify-between px-4 py-3 bg-brand-lighter rounded-xl">
              <span className="text-[13px] text-brand-sub">건당 단가</span>
              <span className="text-[15px] font-extrabold text-brand-dark">{UNIT_PRICE.toLocaleString()}원</span>
            </div>

            {/* 결제 금액 */}
            <div className="flex items-center justify-between px-4 py-3 bg-brand-lighter border border-brand-border rounded-xl">
              <span className="text-[14px] font-bold text-brand-dark">결제 금액</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[20px] font-extrabold text-brand-primary">{orderAmount.toLocaleString()}</span>
                <span className="text-[13px] text-brand-sub">원</span>
              </div>
            </div>

            {orderAmount > balance && (
              <p className="text-[12px] text-red-500 font-medium -mt-1">포인트가 부족합니다.</p>
            )}

            {/* 보유 금액 */}
            <div className="flex items-center justify-between px-4 py-3 bg-brand-lighter rounded-xl">
              <span className="text-[14px] font-bold text-brand-dark">보유 금액</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[20px] font-extrabold text-brand-dark">{balance.toLocaleString()}</span>
                <span className="text-[13px] text-brand-sub">원</span>
              </div>
            </div>

            {/* 동의 항목 */}
            <div className="space-y-3 pt-1">
              {([
                { key: "req1" as const, node: <><span className="text-brand-primary underline cursor-pointer">필수 동의 사항</span> 에 동의합니다. <span className="text-brand-muted">(필수)</span></> },
                { key: "req2" as const, node: <>영수증 인증 정책에 동의합니다. <span className="text-brand-muted">(필수)</span></> },
                { key: "opt1" as const, node: <>리뷰 가이드 전달 동의 <span className="text-brand-muted">(선택)</span></> },
              ] as const).map((item) => (
                <label key={item.key} className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreements[item.key]}
                    onChange={(e) => setAgreements((p) => ({ ...p, [item.key]: e.target.checked }))}
                    className="w-4 h-4 mt-0.5 accent-[#0341C7] shrink-0"
                  />
                  <span className="text-[12.5px] text-brand-dark leading-relaxed">{item.node}</span>
                </label>
              ))}
            </div>

            {/* 캠페인 등록 / 결제 버튼 */}
            <button
              onClick={handleSubmit}
              disabled={isPending || !agreements.req1 || !agreements.req2}
              className="w-full py-3.5 rounded-xl text-[15px] font-extrabold text-white bg-brand-dark hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPending ? "등록 중..." : (
                <>
                  캠페인 등록 / 결제
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
