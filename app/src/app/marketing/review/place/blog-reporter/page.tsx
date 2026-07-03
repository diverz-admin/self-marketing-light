"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const TYPES = [
  { name: "블로그배포", href: "/marketing/review/place/blog-reporter", desc: "전문 블로거가 방문 리뷰 콘텐츠를 배포합니다.", grad: "linear-gradient(135deg,#0D3473,#6366F1)", iconPath: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" },
  { name: "영수증리뷰", href: "/marketing/review/place/receipt", desc: "실구매 영수증 인증 방문 고객이 리뷰를 남깁니다.", grad: "linear-gradient(135deg,#10B981,#059669)", iconPath: "M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" },
];

export default function BlogReporterPage() {
  const pathname = usePathname();

  const [postingType, setPostingType] = useState("후기성");
  const [campaignName, setCampaignName] = useState("대박갈비 일산동구청점");
  const [placePid, setPlacePid] = useState("");
  const [placeLink, setPlaceLink] = useState("");
  const [businessName, setBusinessName] = useState("대박갈비 일산동구청점");
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
      {/* 브레드크럼 */}
      <nav className="flex items-center gap-1.5 text-[15px] text-brand-sub">
        <Link href="/marketing" className="hover:text-brand-text">대시보드</Link>
        <span>›</span>
        <Link href="/marketing/review/place" className="hover:text-brand-text">네이버 플레이스</Link>
        <span>›</span>
        <Link href="/marketing/review/place" className="hover:text-brand-text">캠페인 생성</Link>
        <span>›</span>
        <span className="text-brand-text font-medium">블로그배포</span>
      </nav>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TYPES.map((t) => {
            const active = pathname === t.href;
            return (
              <Link key={t.href} href={t.href}
                className={`flex items-center gap-3 rounded-2xl p-4 text-left border-2 transition-all ${
                  active ? "border-brand-primary shadow-[0_0_0_3px_rgba(13,52,115,0.12)] bg-white" : "border-brand-border bg-white hover:border-brand-primary/40"
                }`}
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

        {/* ── 왼쪽 ── */}
        <div className="space-y-5">

          {/* 블로그배포 안내 */}
          <div className="flex gap-3 p-4 rounded-2xl bg-brand-primary-50 border border-brand-primary/15">
            <svg className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
            </svg>
            <div>
              <p className="text-[15px] font-extrabold text-brand-dark mb-1">블로그배포란?</p>
              <p className="text-[14px] text-brand-sub leading-relaxed">
                전문 블로거 네트워크를 통해 플레이스 방문 리뷰 콘텐츠를 배포하는 캠페인입니다.
                SEO 최적화된 블로그 포스팅으로 검색 노출과 신뢰도를 동시에 높일 수 있습니다.
              </p>
            </div>
          </div>

          {/* 스케줄 설정 */}
          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-5">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#0D3473,#6366F1)" }}>
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
              <div>
                <h2 className="text-[17px] font-bold text-brand-dark">스케줄 설정</h2>
                <p className="text-[13px] text-brand-sub">발행 기간과 일발행량을 설정하세요</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-5">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#F97316,#EF4444)" }}>
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </span>
              <div>
                <h2 className="text-[17px] font-bold text-brand-dark">필수 정보</h2>
                <p className="text-[13px] text-brand-sub">포스팅 작성에 필요한 업체 정보를 입력하세요</p>
              </div>
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
                  className="w-full pl-3 pr-9 py-2.5 border border-brand-border rounded-xl text-[15px] text-brand-dark bg-white focus:outline-none focus:border-brand-primary transition-colors"
                />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <p className="text-[13px] text-brand-muted mt-1">업체명 검색 또는 PID 숫자를 직접 입력하세요</p>
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
            </div>

            {/* 포스팅 유형 */}
            <div>
              <p className="text-[15px] font-semibold text-brand-dark mb-2.5">포스팅 유형 <span className="text-red-500">*</span></p>
              <div className="flex items-center gap-6">
                {["후기성", "정보성"].map((v) => (
                  <label key={v} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="postingType" checked={postingType === v} onChange={() => setPostingType(v)} className="w-4 h-4 accent-[#0D3473]" />
                    <span className="text-[15px] text-brand-dark">{v}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 텍스트 입력 필드들 */}
            {[
              { label: "캠페인명", value: campaignName, onChange: setCampaignName, placeholder: "대박갈비 일산동구청점" },
              { label: "업체명",   value: businessName, onChange: setBusinessName, placeholder: "대박갈비 일산동구청점" },
              { label: "메인 키워드", value: mainKeyword, onChange: setMainKeyword, placeholder: "1개만 반영됩니다." },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-[15px] font-semibold text-brand-dark mb-1.5">
                  {field.label} <span className="text-red-500">*</span>
                </label>
                <input
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-0 py-2 border-b border-brand-border text-[15px] text-brand-dark bg-transparent focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
            ))}

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

            {/* 업체 정보 */}
            <div>
              <label className="block text-[15px] font-semibold text-brand-dark mb-1.5">
                업체 정보 <span className="text-red-500">*</span>
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
          </div>

          {/* 이미지 등록 */}
          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-5">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#10B981,#059669)" }}>
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </span>
              <div>
                <h2 className="text-[17px] font-bold text-brand-dark">이미지 등록</h2>
                <p className="text-[13px] text-brand-sub">기본적으로 네이버 플레이스에 등록된 이미지를 사용합니다</p>
              </div>
            </div>

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

            {/* 캠페인 등록 / 결제 버튼 */}
            <button
              onClick={handleSubmit}
              disabled={isPending || !agreements.req1 || !agreements.req2}
              className="w-full py-3.5 rounded-xl text-[17px] font-extrabold text-white bg-brand-dark hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
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
