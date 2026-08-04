"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import PageHeader from "@/components/marketing/PageHeader";
import { createReviewCampaign } from "../../../actions";
import type { ReviewProductOption } from "@/lib/review-products";

const TYPES = [
  { name: "블로그배포", href: "/marketing/review/place/blog-reporter", desc: "전문 블로거가 방문 리뷰 콘텐츠를 배포합니다.", grad: "linear-gradient(135deg,#0D3473,#6366F1)", accent: "#0D3473", ring: "rgba(13,52,115,0.14)", tint: "#EEF1FE", iconPath: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" },
  { name: "영수증리뷰", href: "/marketing/review/place/receipt", desc: "실구매 영수증 인증 방문 고객이 리뷰를 남깁니다.", grad: "linear-gradient(135deg,#10B981,#059669)", accent: "#059669", ring: "rgba(5,150,105,0.16)", tint: "#E7F7F0", iconPath: "M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" },
];

/** 플레이스 리뷰 신청 폼 공통 섹션 헤더 (블로그배포와 동일 규격) */
const GRAD_SCHEDULE = "linear-gradient(135deg,#0D3473,#6366F1)";
const GRAD_REQUIRED = "linear-gradient(135deg,#F97316,#EF4444)";
const GRAD_DETAIL = "linear-gradient(135deg,#10B981,#059669)";

const ICON_SCHEDULE = "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z";
const ICON_REQUIRED = "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z";
const ICON_DETAIL = "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z";

function SectionHead({ grad, iconPath, title, desc }: { grad: string; iconPath: string; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: grad }}>
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
      </span>
      <div>
        <h2 className="text-[17px] font-bold text-brand-dark">{title}</h2>
        <p className="text-[13px] text-brand-sub">{desc}</p>
      </div>
    </div>
  );
}

/** 시작일 + n일 → "YYYY-MM-DD" */
function addDays(dateStr: string, days: number) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

/** 상품은 어드민 "리뷰 상품등록"(channel=place, reviewType=receipt)에서 내려온다 */
export default function ReceiptReviewForm({ products }: { products: ReviewProductOption[] }) {
  const pathname = usePathname();

  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const product = products.find((p) => p.id === productId);
  const unitPrice = product?.unitPrice ?? 0;
  const [error, setError] = useState<string | null>(null);

  const [campaignName, setCampaignName] = useState("대박갈비 일산동구청점");
  const [placePid, setPlacePid] = useState("");
  const [startDate, setStartDate] = useState("2026-06-24");
  const [issueDays, setIssueDays] = useState(7);
  const [dailyVolume, setDailyVolume] = useState(5);
  const [mainKeyword, setMainKeyword] = useState("");
  const [receiptAttached, setReceiptAttached] = useState(true);
  const [bizNumber, setBizNumber] = useState("");
  const [emphasis, setEmphasis] = useState("");
  const [agreements, setAgreements] = useState({ req1: false, req2: false, opt1: false });
  const [submitted, setSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const totalCount = issueDays * dailyVolume;
  const orderAmount = unitPrice * totalCount;
  const balance = 11500;

  // 스케줄·필수 정보가 모두 채워져야 결제 가능
  const incomplete =
    !startDate || issueDays < 1 || dailyVolume < 1 ||
    !campaignName.trim() || !placePid.trim() || !mainKeyword.trim() ||
    (!receiptAttached && !bizNumber.trim());

  const handleSubmit = async () => {
    if (!agreements.req1 || !agreements.req2) return;
    if (!product) { setError("판매 중인 영수증리뷰 상품이 없습니다. 관리자에게 문의해주세요."); return; }
    setError(null);
    setIsPending(true);

    // 신청 내용은 어드민 "플레이스 리뷰" 화면에 신청 상태로 뜬다
    const res = await createReviewCampaign({
      productId,
      platform: "place",
      reviewType: "receipt",
      storeName: campaignName,
      targetUrl: placePid,
      keyword: mainKeyword,
      totalQty: totalCount,
      startDate,
      endDate: addDays(startDate, issueDays - 1),
      setting: { issueDays, dailyVolume, receiptAttached, bizNumber, emphasis },
      requestNote: emphasis,
    });

    setIsPending(false);
    if ("error" in res) { setError(res.error); return; }
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
          <h2 className="text-[22px] font-extrabold text-brand-dark mb-2">캠페인 등록 완료</h2>
          <p className="text-[16px] text-brand-sub mb-8">검수 후 1~2일 내 캠페인이 시작됩니다.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/marketing/review/place" className="px-5 py-3 rounded-2xl text-[16px] font-bold bg-brand-primary text-white">
              캠페인 목록으로
            </Link>
            <button onClick={() => setSubmitted(false)} className="px-5 py-3 rounded-2xl text-[16px] font-bold bg-brand-lighter text-brand-text border border-brand-border cursor-pointer">
              새 캠페인 등록
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <PageHeader
        title="네이버 플레이스 리뷰 신청"
        subtitle="리뷰 유형을 선택하고 캠페인을 신청하세요."
        iconPath={["M15 10.5a3 3 0 11-6 0 3 3 0 016 0z", "M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"]}
      />
      {/* 유형 선택 */}
      <div className="rounded-2xl p-5 space-y-4" style={{ background: "linear-gradient(135deg,#1B3160 0%,#111D37 100%)" }}>
        <div className="flex items-center gap-3">
          <span className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </span>
          <div>
            <h2 className="text-[17px] font-bold text-white">유형 선택</h2>
            <p className="text-[13px] text-white/60">리뷰 유형을 선택하세요</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {TYPES.map((t) => {
            const active = pathname === t.href;
            return (
              <Link key={t.href} href={t.href}
                className={`flex items-center gap-3 rounded-2xl p-4 text-left border-2 transition-all ${
                  active ? "" : "border-brand-border bg-white hover:border-brand-primary/40"
                }`}
                style={active ? { borderColor: t.accent, background: t.tint, boxShadow: `0 0 0 3px ${t.ring}` } : undefined}
              >
                <span className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: t.grad }}>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={t.iconPath} />
                  </svg>
                </span>
                <div>
                  <p className="text-[16px] font-extrabold text-brand-dark">{t.name}</p>
                  <p className="text-[13px] text-brand-sub leading-snug">{t.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">

        {/* ── 왼쪽: 안내 + 스케줄 + 필수 정보 + 강조 내용 (하나의 박스) ── */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">

            {/* 유형 안내 */}
            <div className="relative overflow-hidden border-b border-brand-border bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 px-8 py-5">
              {/* 데코 그라데이션 블롭 */}
              <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-emerald-400/15 blur-3xl" aria-hidden />

              <div className="relative flex gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm" style={{ background: "linear-gradient(135deg,#10B981,#059669)" }}>
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-extrabold text-brand-dark">영수증리뷰란?</p>
                    <span className="inline-flex items-center rounded-full bg-emerald-500/12 px-2 py-0.5 text-[11px] font-bold text-emerald-700">실구매 인증</span>
                  </div>
                  <p className="mt-1 text-[14px] leading-relaxed text-brand-sub">
                    실제 결제 영수증을 보유한 방문 고객이 네이버 플레이스에 리뷰를 남기는 캠페인입니다.
                    검증된 구매자의 진성 리뷰로 별점과 신뢰도를 빠르게 높일 수 있습니다.
                  </p>

                  {/* 핵심 포인트 */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-2 rounded-xl border border-brand-border/70 bg-white/70 px-3 py-2.5 backdrop-blur-sm">
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-brand-dark">
                      <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      핵심 포인트
                    </span>
                    <span className="inline-flex items-center gap-1 text-[12.5px] font-bold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      실결제 영수증 인증
                    </span>
                    <span className="inline-flex items-center gap-1 text-[12.5px] font-bold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      진성 방문 고객 리뷰
                    </span>
                    <span className="inline-flex items-center gap-1 text-[12.5px] font-bold text-amber-700">
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.287 3.958c.3.922-.755 1.688-1.54 1.118l-3.366-2.446a1 1 0 00-1.176 0l-3.366 2.446c-.784.57-1.838-.196-1.539-1.118l1.287-3.958a1 1 0 00-.364-1.118L2.98 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.958z" />
                      </svg>
                      별점·신뢰도 상승
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 스케줄 설정 */}
            <div className="px-8 py-5 space-y-5">
              <SectionHead grad={GRAD_SCHEDULE} iconPath={ICON_SCHEDULE} title="스케줄 설정" desc="발행 기간과 일발행량을 설정하세요" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 발행 시작일 */}
                <div>
                  <label className="block text-[15px] font-semibold text-brand-dark mb-1.5">
                    발행 시작일 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-3 pr-9 py-2.5 border border-brand-border rounded-xl text-[15px] text-brand-dark bg-white focus:outline-none focus:border-brand-primary transition-colors"
                    />
                  </div>
                  <p className="text-[13px] text-brand-muted mt-1">원하는 발행 시작일을 선택해주세요</p>
                </div>

                {/* 발행 일수 */}
                <div>
                  <label className="block text-[15px] font-semibold text-brand-dark mb-1.5">
                    발행 일수 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={issueDays}
                    onChange={(e) => setIssueDays(Math.min(7, Math.max(1, Number(e.target.value))))}
                    min={1}
                    max={7}
                    className="w-full px-3 py-2.5 border border-brand-border rounded-xl text-[15px] text-brand-dark bg-white focus:outline-none focus:border-brand-primary transition-colors"
                  />
                  <p className="text-[13px] text-brand-muted mt-1">1~7일 사이로 입력해주세요</p>
                </div>

                {/* 일발행량 */}
                <div>
                  <label className="block text-[15px] font-semibold text-brand-dark mb-1.5">
                    일발행량 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={dailyVolume}
                    onChange={(e) => setDailyVolume(Math.max(1, Number(e.target.value)))}
                    min={1}
                    className="w-full px-3 py-2.5 border border-brand-border rounded-xl text-[15px] text-brand-dark bg-white focus:outline-none focus:border-brand-primary transition-colors"
                  />
                  <p className="text-[13px] text-brand-muted mt-1">하루에 발행할 건수를 입력해주세요</p>
                </div>
              </div>
            </div>

            {/* 필수 정보 */}
            <div className="px-8 py-5 space-y-5 border-t border-brand-border">
              <SectionHead grad={GRAD_REQUIRED} iconPath={ICON_REQUIRED} title="필수 정보" desc="캠페인명, 플레이스 PID, 키워드를 입력하세요" />

              {/* 캠페인명 */}
              <div>
                <label className="block text-[15px] font-semibold text-brand-dark mb-1.5">
                  캠페인명 <span className="text-red-500">*</span>
                </label>
                <input
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="대박갈비 일산동구청점"
                  className="w-full px-0 py-2 border-b border-brand-border text-[15px] text-brand-dark bg-transparent focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>

              {/* 플레이스 PID */}
              <div>
                <label className="block text-[15px] font-semibold text-brand-dark mb-1.5">
                  플레이스 PID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    value={placePid}
                    onChange={(e) => setPlacePid(e.target.value)}
                    placeholder="업체명을 검색하세요"
                    className="w-full px-0 pr-8 py-2 border-b border-brand-border text-[15px] text-brand-dark bg-transparent focus:outline-none focus:border-brand-primary transition-colors"
                  />
                  <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <p className="text-[13px] text-brand-muted mt-1">업체명 검색 또는 PID 숫자를 직접 입력하세요</p>
              </div>

              {/* 영수증 첨부 여부 */}
              <div>
                <p className="text-[15px] font-semibold text-brand-dark mb-2.5">영수증 첨부 여부 <span className="text-red-500">*</span></p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: true,  label: "영수증 첨부", desc: "영수증을 첨부합니다" },
                    { val: false, label: "영수증 미첨부", desc: "작업으로 진행됩니다" },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setReceiptAttached(opt.val)}
                      className={`flex flex-col items-start gap-0.5 px-3.5 py-2.5 rounded-xl border text-left transition-all ${
                        receiptAttached === opt.val
                          ? "border-brand-primary bg-brand-lighter"
                          : "border-brand-border bg-white hover:bg-brand-lighter"
                      }`}
                    >
                      <span className={`text-[15px] font-bold ${receiptAttached === opt.val ? "text-brand-primary" : "text-brand-dark"}`}>{opt.label}</span>
                      <span className="text-[13px] text-brand-muted">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 메인 키워드 */}
              <div>
                <label className="block text-[15px] font-semibold text-brand-dark mb-1.5">
                  메인 키워드 <span className="text-red-500">*</span>
                </label>
                <input
                  value={mainKeyword}
                  onChange={(e) => setMainKeyword(e.target.value)}
                  placeholder="1개만 반영됩니다."
                  className="w-full px-0 py-2 border-b border-brand-border text-[15px] text-brand-dark bg-transparent focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>

              {/* 영수증 미첨부 시 사업자번호 */}
              {!receiptAttached && (
                <div>
                  <label className="block text-[15px] font-semibold text-brand-dark mb-1.5">
                    사업자번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={bizNumber}
                    onChange={(e) => setBizNumber(e.target.value)}
                    placeholder="000-00-00000"
                    className="w-full px-0 py-2 border-b border-brand-border text-[15px] text-brand-dark bg-transparent focus:outline-none focus:border-brand-primary transition-colors"
                  />
                  <p className="text-[13px] text-brand-muted mt-1">영수증 미첨부 시 사업자번호 입력은 필수입니다</p>
                </div>
              )}
            </div>

            {/* 강조 내용 */}
            <div className="px-8 py-5 space-y-5 border-t border-brand-border">
              <SectionHead grad={GRAD_DETAIL} iconPath={ICON_DETAIL} title="강조 내용" desc="키워드 혹은 강조해야 할 내용을 작성하세요" />

              <div>
                <label className="block text-[15px] font-semibold text-brand-dark mb-1.5">
                  키워드 혹은 강조해야 할 내용 <span className="text-[13px] font-normal text-brand-muted">(선택)</span>
                </label>
                <textarea
                  value={emphasis}
                  onChange={(e) => setEmphasis(e.target.value)}
                  maxLength={300}
                  rows={6}
                  placeholder={`예시)\n-강조하고 싶은 키워드\n-꼭 언급되어야 할 메뉴나 서비스\n-부각하고 싶은 이벤트나 장점 등`}
                  className="w-full px-3 py-2.5 border border-brand-border rounded-xl text-[15px] text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all resize-none"
                />
                <p className="text-right text-[12px] text-brand-muted mt-1">{emphasis.length} / 300</p>
              </div>

              {/* 영수증 주의사항 */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-[14px] font-extrabold text-amber-700 mb-2">영수증 인증 안내</p>
                <ul className="space-y-1.5">
                  {[
                    "영수증은 결제일로부터 7일 이내만 인정됩니다.",
                    "영수증 미제출 시 캠페인 참여가 취소될 수 있습니다.",
                    "네이버 플레이스 리뷰 작성 후 URL을 제출해야 완료 처리됩니다.",
                  ].map((note, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] text-amber-700">
                      <span className="font-bold shrink-0 mt-px">•</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
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
              <h2 className="text-[17px] font-bold text-brand-dark">캠페인 설정</h2>
              <p className="text-[13px] text-brand-sub">결제 및 동의 후 캠페인을 등록하세요</p>
            </div>
          </div>

          {/* 결제 */}
          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-4">
            {/* 상품 선택 — 어드민에 등록된 영수증리뷰 상품 */}
            {products.length === 0 ? (
              <p className="px-4 py-3 rounded-xl bg-amber-50 text-[13px] font-semibold text-amber-700">
                판매 중인 영수증리뷰 상품이 없습니다. 관리자에게 문의해주세요.
              </p>
            ) : products.length > 1 ? (
              <div>
                <label className="block text-[13px] font-bold text-brand-dark mb-1.5">상품 선택</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-brand-border rounded-xl text-[14px] text-brand-dark bg-white focus:outline-none focus:border-brand-primary"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} · {p.unitPrice.toLocaleString()}원
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center justify-between px-4 py-3 bg-brand-lighter rounded-xl">
                <span className="text-[15px] text-brand-sub">상품</span>
                <span className="text-[15px] font-bold text-brand-dark">{product?.title}</span>
              </div>
            )}

            {/* 단가 · 결제 금액 */}
            <div className="flex items-center justify-between px-4 py-3 bg-brand-lighter rounded-xl">
              <span className="text-[15px] text-brand-sub">건당 단가</span>
              <span className="text-[17px] font-extrabold text-brand-dark">{unitPrice.toLocaleString()}원</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-brand-lighter border border-brand-border rounded-xl">
              <span className="text-[16px] font-bold text-brand-dark">결제 금액</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[22px] font-extrabold text-brand-primary">{orderAmount.toLocaleString()}</span>
                <span className="text-[15px] text-brand-sub">원</span>
              </div>
            </div>

            {orderAmount > balance && (
              <p className="text-[13px] text-red-500 font-medium -mt-1">포인트가 부족합니다.</p>
            )}

            {/* 보유 금액 */}
            <div className="flex items-center justify-between px-4 py-3 bg-brand-lighter rounded-xl">
              <span className="text-[16px] font-bold text-brand-dark">보유 금액</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[22px] font-extrabold text-brand-dark">{balance.toLocaleString()}</span>
                <span className="text-[15px] text-brand-sub">원</span>
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
                    className="w-4 h-4 mt-0.5 accent-[#0D3473] shrink-0"
                  />
                  <span className="text-[14px] text-brand-dark leading-relaxed">{item.node}</span>
                </label>
              ))}
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] font-semibold text-red-500">
                {error}
              </p>
            )}

            {/* 결제 / 장바구니 */}
            {incomplete && (
              <p className="text-[12px] font-semibold text-red-500 mb-2">스케줄·필수 정보를 모두 입력해주세요</p>
            )}
            <div className="grid grid-cols-[1.5fr_1fr] gap-2.5">
              <button
                onClick={handleSubmit}
                disabled={isPending || !agreements.req1 || !agreements.req2 || incomplete}
                className="w-full py-3.5 rounded-xl text-[15px] font-extrabold text-white bg-brand-primary hover:bg-brand-primary-hover transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                {isPending ? "등록 중..." : (
                  <>
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046a1 1 0 01.65 1.212L10.44 8H15a1 1 0 01.788 1.615l-7 9A1 1 0 017 18v-6H3a1 1 0 01-.788-1.615l7-9a1 1 0 011.088-.34z" clipRule="evenodd" />
                    </svg>
                    즉시 포인트 차감하기
                  </>
                )}
              </button>

              <Link
                href="/marketing/cart"
                aria-disabled={incomplete}
                className={`w-full py-3.5 rounded-xl text-[15px] font-extrabold text-brand-primary bg-white border-2 border-brand-primary hover:bg-brand-primary/5 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${incomplete ? "opacity-40 pointer-events-none" : ""}`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                장바구니
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
