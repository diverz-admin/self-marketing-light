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

/** 플레이스 리뷰 신청 폼 공통 섹션 헤더 (영수증리뷰와 동일 규격) */
const GRAD_SCHEDULE = "linear-gradient(135deg,#0D3473,#6366F1)";
const GRAD_REQUIRED = "linear-gradient(135deg,#F97316,#EF4444)";
const GRAD_DETAIL = "linear-gradient(135deg,#10B981,#059669)";
const GRAD_EXTRA = "linear-gradient(135deg,#0EA5E9,#2563EB)";

const ICON_SCHEDULE = "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z";
const ICON_REQUIRED = "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z";
const ICON_DETAIL = "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z";
const ICON_EXTRA = "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z";

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

/** 상품은 어드민 "리뷰 상품등록"(channel=place, reviewType=blog_distribute)에서 내려온다 */
export default function BlogReporterForm({ products }: { products: ReviewProductOption[] }) {
  const pathname = usePathname();

  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const product = products.find((p) => p.id === productId);
  const unitPrice = product?.unitPrice ?? 0;
  const [error, setError] = useState<string | null>(null);

  const [postingType, setPostingType] = useState("후기성");
  const [campaignName, setCampaignName] = useState("대박갈비 일산동구청점");
  const [placeLink, setPlaceLink] = useState("");
  const [mainKeyword, setMainKeyword] = useState("");
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [businessInfo, setBusinessInfo] = useState("");
  const [postingUrl, setPostingUrl] = useState("");
  const [useCustomImage, setUseCustomImage] = useState(false);
  const [startDate, setStartDate] = useState("2026-06-24");
  const [issueDays, setIssueDays] = useState(7);
  const [dailyVolume, setDailyVolume] = useState(5);
  const [agreements, setAgreements] = useState({ req1: false, req2: false, opt1: false, opt2: false });
  const [submitted, setSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const balance = 11500;

  // 스케줄·필수 정보가 모두 채워져야 결제 가능
  const incomplete =
    !startDate || issueDays < 1 || dailyVolume < 1 ||
    !campaignName.trim() || !placeLink.trim() || !mainKeyword.trim() ||
    hashtags.length === 0 || !businessInfo.trim();

  const handleHashtagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || !hashtagInput.trim()) return;
    e.preventDefault();
    const raw = hashtagInput.trim();
    setHashtags((p) => [...p, raw.startsWith("#") ? raw : `#${raw}`]);
    setHashtagInput("");
  };

  const totalCount = issueDays * dailyVolume;
  const orderAmount = unitPrice * totalCount;

  const handleSubmit = async () => {
    if (!agreements.req1 || !agreements.req2) return;
    if (!product) { setError("판매 중인 블로그배포 상품이 없습니다. 관리자에게 문의해주세요."); return; }
    setError(null);
    setIsPending(true);

    // 신청 내용은 어드민 "플레이스 리뷰" 화면에 신청 상태로 뜬다
    const res = await createReviewCampaign({
      productId,
      platform: "place",
      reviewType: "blog_distribute",
      storeName: campaignName,
      targetUrl: placeLink,
      keyword: mainKeyword,
      totalQty: totalCount,
      startDate,
      endDate: addDays(startDate, issueDays - 1),
      setting: { postingType, hashtags, businessInfo, postingUrl, useCustomImage, issueDays, dailyVolume },
      requestNote: businessInfo,
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

        {/* ── 왼쪽: 안내 + 스케줄 + 필수 정보 + 상세 정보 + 이미지 등록 (하나의 박스) ── */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">

            {/* 유형 안내 */}
            <div className="relative overflow-hidden border-b border-brand-border bg-gradient-to-br from-brand-primary-50 via-white to-brand-primary-50/40 px-8 py-5">
              {/* 데코 그라데이션 블롭 */}
              <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-brand-primary/10 blur-3xl" aria-hidden />

              <div className="relative flex gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm" style={{ background: "linear-gradient(135deg,#0D3473,#6366F1)" }}>
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-extrabold text-brand-dark">블로그배포란?</p>
                    <span className="inline-flex items-center rounded-full bg-brand-primary/10 px-2 py-0.5 text-[11px] font-bold text-brand-primary">플레이스 리뷰</span>
                  </div>
                  <p className="mt-1 text-[14px] leading-relaxed text-brand-sub">
                    전문 블로거 네트워크를 통해 플레이스 방문 리뷰 콘텐츠를 배포하는 캠페인입니다.
                    SEO 최적화된 블로그 포스팅으로 검색 노출과 신뢰도를 동시에 높일 수 있습니다.
                  </p>

                  {/* 배포 등급 안내 */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-2 rounded-xl border border-brand-border/70 bg-white/70 px-3 py-2.5 backdrop-blur-sm">
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-brand-dark">
                      <svg className="h-3.5 w-3.5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                      배포 등급
                    </span>
                    <span className="inline-flex items-center gap-1 text-[12.5px] font-bold text-brand-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
                      준최2~4 일괄 배포
                    </span>
                    <span className="inline-flex items-center gap-1 text-[12.5px] font-bold text-amber-700">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      최적블은 개별 문의 필요
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
              <SectionHead grad={GRAD_REQUIRED} iconPath={ICON_REQUIRED} title="필수 정보" desc="캠페인명, 플레이스 링크, 키워드를 입력하세요" />

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

              {/* 플레이스 링크 */}
              <div>
                <label className="block text-[15px] font-semibold text-brand-dark mb-1.5">
                  플레이스 링크 <span className="text-red-500">*</span>
                </label>
                <input
                  value={placeLink}
                  onChange={(e) => setPlaceLink(e.target.value)}
                  placeholder="https://m.place.naver.com/restaurant/..."
                  className="w-full px-0 py-2 border-b border-brand-border text-[15px] text-brand-dark bg-transparent focus:outline-none focus:border-brand-primary transition-colors"
                />
                <p className="text-[13px] text-brand-muted mt-1">네이버 플레이스 모바일 주소를 붙여넣어 주세요</p>
              </div>

              {/* 포스팅 유형 */}
              <div>
                <p className="text-[15px] font-semibold text-brand-dark mb-2.5">포스팅 유형 <span className="text-red-500">*</span></p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: "후기성", label: "후기성", desc: "방문 경험 중심으로 작성됩니다" },
                    { val: "정보성", label: "정보성", desc: "업체 정보 중심으로 작성됩니다" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setPostingType(opt.val)}
                      className={`flex flex-col items-start gap-0.5 px-3.5 py-2.5 rounded-xl border text-left transition-all ${
                        postingType === opt.val
                          ? "border-brand-primary bg-brand-lighter"
                          : "border-brand-border bg-white hover:bg-brand-lighter"
                      }`}
                    >
                      <span className={`text-[15px] font-bold ${postingType === opt.val ? "text-brand-primary" : "text-brand-dark"}`}>{opt.label}</span>
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

              {/* 해시태그 */}
              <div>
                <label className="block text-[15px] font-semibold text-brand-dark mb-1">
                  해시태그 <span className="text-red-500">*</span>{" "}
                  <span className="text-[13px] font-normal text-brand-primary">(#해시태그로 구분, 일괄 등록 가능)</span>
                </label>
                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 mb-1">
                    {hashtags.map((tag, i) => (
                      <span key={i} className="flex items-center gap-1 px-2.5 py-0.5 bg-brand-lighter text-brand-primary rounded-full text-[13px] font-medium">
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
                  className="w-full px-0 py-2 border-b border-brand-border text-[15px] text-brand-dark bg-transparent focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
            </div>

            {/* 상세 정보 */}
            <div className="px-8 py-5 space-y-5 border-t border-brand-border">
              <SectionHead grad={GRAD_DETAIL} iconPath={ICON_DETAIL} title="업체 정보" desc="포스팅 작성에 필요한 업체 정보를 작성하세요" />

              <div>
                <label className="block text-[15px] font-semibold text-brand-dark mb-1.5">
                  포스팅에 반영할 업체 정보 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={businessInfo}
                  onChange={(e) => setBusinessInfo(e.target.value)}
                  maxLength={500}
                  rows={6}
                  placeholder={`예시)\n-대표 메뉴 (계절음식, 계절 상품 등)\n-이벤트 소개\n-영업시간(오픈, 브레이크 타임, 마감시간, 마지막 주문 시간,)\n-교통안내 (주차, 지하철역 도보 거리, 버스 내려서 도보 거리 등)`}
                  className="w-full px-3 py-2.5 border border-brand-border rounded-xl text-[15px] text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all resize-none"
                />
                <p className="text-right text-[12px] text-brand-muted mt-1">{businessInfo.length} / 500</p>
              </div>

              {/* 포스팅 작성 안내 */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-[14px] font-extrabold text-amber-700 mb-2">포스팅 작성 안내</p>
                <ul className="space-y-1.5">
                  {[
                    "입력하신 업체 정보를 바탕으로 블로거가 포스팅을 작성합니다.",
                    "메인 키워드는 1개만 반영되며, 나머지는 해시태그로 노출됩니다.",
                    "작성된 포스팅은 발행 후 캠페인 관리 화면에서 확인할 수 있습니다.",
                  ].map((note, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] text-amber-700">
                      <span className="font-bold shrink-0 mt-px">•</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 이미지 등록 */}
            <div className="px-8 py-5 space-y-5 border-t border-brand-border">
              <SectionHead grad={GRAD_EXTRA} iconPath={ICON_EXTRA} title="이미지 등록" desc="기본적으로 네이버 플레이스에 등록된 이미지를 사용합니다" />

              {/* 포스팅 이미지 직접 전달 토글 */}
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[15px] font-semibold text-brand-dark">포스팅 이미지 직접 전달 <span className="text-[13px] font-normal text-brand-sub">(선택)</span></p>
                    <p className="text-[13px] text-brand-sub mt-0.5">
                      {useCustomImage ? "구글 드라이브 링크로 전달한 이미지를 사용합니다" : "네이버 플레이스에 등록된 이미지를 사용합니다"}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={useCustomImage}
                    onClick={() => setUseCustomImage((v) => !v)}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${useCustomImage ? "bg-green-500" : "bg-brand-border"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${useCustomImage ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              </div>

              {useCustomImage && (
                <>
                  {/* 포스팅 이미지 URL */}
                  <div>
                    <label className="block text-[15px] font-semibold text-brand-dark mb-1.5">
                      포스팅 이미지{" "}
                      <span className="text-[13px] font-normal text-brand-primary cursor-pointer hover:underline">(구글 드라이브링크)</span>
                    </label>
                    <input
                      value={postingUrl}
                      onChange={(e) => setPostingUrl(e.target.value)}
                      placeholder="https://drive.google.com/drive/folders/..."
                      className="w-full px-0 py-2 border-b border-brand-border text-[15px] text-brand-dark bg-transparent focus:outline-none focus:border-brand-primary transition-colors"
                    />
                  </div>

                  {/* AI 주의사항 */}
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                    <p className="text-[14px] font-extrabold text-red-600 mb-2">AI 이미지 자동 분류기 사용 주의사항</p>
                    <ul className="space-y-1.5">
                      {[
                        "구글 드라이브 링크만 가능합니다.",
                        "반드시 공개엑세스로 설정해주세요.",
                        "인물 모자이크를 지원하지 않습니다.",
                        "드라이브에는 이미지 파일만 존재해야합니다.(폴더 포함X)",
                      ].map((note, i) => (
                        <li key={i} className="flex items-start gap-2 text-[13px] text-red-500">
                          <span className="font-bold shrink-0 mt-px">⊕</span>
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
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
            {/* 상품 선택 — 어드민에 등록된 블로그배포 상품 */}
            {products.length === 0 ? (
              <p className="px-4 py-3 rounded-xl bg-amber-50 text-[13px] font-semibold text-amber-700">
                판매 중인 블로그배포 상품이 없습니다. 관리자에게 문의해주세요.
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
                { key: "req2" as const, node: <>공정위 문구 여부 포함 동의 <span className="text-brand-muted">(필수)</span></> },
                { key: "opt1" as const, node: <>지도 첨부 여부 <span className="text-brand-muted">(선택)</span></> },
                { key: "opt2" as const, node: <>연락처 첨부 여부 <span className="text-brand-muted">(선택)</span></> },
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
