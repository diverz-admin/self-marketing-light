"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import PageHeader from "@/components/marketing/PageHeader";

const TYPES = [
  { name: "블로그배포", href: "/marketing/review/place/blog-reporter", desc: "전문 블로거가 방문 리뷰 콘텐츠를 배포합니다.", grad: "linear-gradient(135deg,#0D3473,#6366F1)", accent: "#0D3473", ring: "rgba(13,52,115,0.14)", tint: "#EEF1FE", iconPath: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" },
  { name: "영수증리뷰", href: "/marketing/review/place/receipt", desc: "실구매 영수증 인증 방문 고객이 리뷰를 남깁니다.", grad: "linear-gradient(135deg,#10B981,#059669)", accent: "#059669", ring: "rgba(5,150,105,0.16)", tint: "#E7F7F0", iconPath: "M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" },
];

const UNIT_PRICE = 1000;

function ImageUploadBox({ bordered }: { bordered?: boolean }) {
  return (
    <button
      className={`aspect-square w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-colors ${
        bordered ? "border-brand-primary/50 bg-brand-lighter" : "border-brand-border bg-white hover:bg-brand-lighter"
      }`}
    >
      <svg className="w-7 h-7 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
      <span className="text-[13px] text-brand-muted">이미지 추가</span>
    </button>
  );
}

export default function ReservationReviewPage() {
  const pathname = usePathname();

  const [postingType, setPostingType] = useState("후기성");
  const [titleType, setTitleType] = useState("업체명");
  const [campaignName, setCampaignName] = useState("대박갈비 일산동구청점");
  const [businessName, setBusinessName] = useState("대박갈비 일산동구청점");
  const [mainKeyword, setMainKeyword] = useState("");
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [businessInfo, setBusinessInfo] = useState("");
  const [postingUrl, setPostingUrl] = useState("");
  const [totalCount, setTotalCount] = useState(10);
  const [dailyCount, setDailyCount] = useState("");
  const [agreements, setAgreements] = useState({ req1: false, req2: false, opt1: false, opt2: false });
  const [submitted, setSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

        {/* ── 왼쪽 ── */}
        <div className="space-y-5">

          {/* 스케줄 설정 */}
          <div className="bg-white rounded-2xl border border-brand-border px-8 py-5 space-y-5">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#0D3473,#6366F1)" }}>
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 00-2-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
              <div>
                <h2 className="text-[17px] font-bold text-brand-dark">스케줄 설정</h2>
                <p className="text-[13px] text-brand-sub">캠페인 기간과 모집 인원을 설정하세요</p>
              </div>
            </div>

            <div>
              <p className="text-[15px] font-semibold text-brand-dark mb-0.5">
                모집 기간 <span className="text-red-500">*</span>
              </p>
              <p className="text-[13px] text-brand-primary font-normal mb-2">(익일 구동 접수 마감 오후 5시)</p>
              <button className="w-full flex items-center gap-2 px-3 py-2.5 border border-brand-border rounded-xl text-[15px] text-brand-muted bg-brand-lighter hover:bg-white transition-colors">
                <svg className="w-4 h-4 text-brand-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                시작일 ~ 종료일 선택
              </button>
            </div>

            <div>
              <p className="text-[15px] font-semibold text-brand-dark mb-3">모집 인원 <span className="text-red-500">*</span></p>
              <div className="flex items-center gap-2">
                <span className="text-[15px] text-brand-sub shrink-0">총</span>
                <input
                  type="number"
                  value={totalCount}
                  onChange={(e) => setTotalCount(Math.max(1, Number(e.target.value)))}
                  className="flex-1 min-w-0 px-2 py-2 border border-brand-border rounded-xl text-[22px] font-extrabold text-brand-primary text-center bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                  min={1}
                />
                <span className="text-[15px] text-brand-sub shrink-0">/</span>
                <span className="text-[15px] text-brand-sub shrink-0">일</span>
                <input
                  type="number"
                  value={dailyCount}
                  onChange={(e) => setDailyCount(e.target.value)}
                  placeholder="일"
                  className="flex-1 min-w-0 px-2 py-2 border border-brand-border rounded-xl text-[16px] font-bold text-brand-dark text-center bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                  min={1}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-red-50 border border-red-100">
              <p className="text-[14px] font-extrabold text-red-600 mb-2">모집 인원 관련 주의사항</p>
              <ul className="space-y-1.5">
                {[
                  "1일 오픈 건 수 부족 시 마지막 날 잔여 수량이 전부 오픈됩니다.",
                  "인원 오기입으로 인해 발생되는 문제는 책임지지 않습니다.",
                ].map((note, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-red-500">
                    <span className="font-bold shrink-0 mt-px">⊕</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 필수 정보 */}
          <div className="bg-white rounded-2xl border border-brand-border px-8 py-5 space-y-5">
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

            <div>
              <p className="text-[15px] font-semibold text-brand-dark mb-2.5">포스팅 유형 <span className="text-red-500">*</span></p>
              <div className="flex items-center gap-6">
                {["후기성", "정보성", "자유성"].map((v) => (
                  <label key={v} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="postingType" checked={postingType === v} onChange={() => setPostingType(v)} className="w-4 h-4 accent-[#0D3473]" />
                    <span className="text-[15px] text-brand-dark">{v}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[15px] font-semibold text-brand-dark mb-2.5">제목 유형 <span className="text-red-500">*</span></p>
              <div className="flex items-center gap-6 flex-wrap">
                {["업체명", "업체명 + 키워드", "키워드"].map((v) => (
                  <label key={v} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="titleType" checked={titleType === v} onChange={() => setTitleType(v)} className="w-4 h-4 accent-[#0D3473]" />
                    <span className="text-[15px] text-brand-dark">{v}</span>
                  </label>
                ))}
              </div>
            </div>

            {[
              { label: "캠페인명",    value: campaignName, onChange: setCampaignName, placeholder: "대박갈비 일산동구청점" },
              { label: "업체명",      value: businessName, onChange: setBusinessName, placeholder: "대박갈비 일산동구청점" },
              { label: "메인 키워드", value: mainKeyword,  onChange: setMainKeyword,  placeholder: "1개만 반영됩니다." },
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
          <div className="bg-white rounded-2xl border border-brand-border px-8 py-5 space-y-5">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#10B981,#059669)" }}>
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </span>
              <div>
                <h2 className="text-[17px] font-bold text-brand-dark">이미지 등록</h2>
                <p className="text-[13px] text-brand-sub">썸네일 및 포스팅 이미지를 첨부해 주세요</p>
              </div>
            </div>

            <div>
              <p className="text-[15px] font-semibold text-brand-dark mb-3">
                썸네일 이미지 <span className="text-red-500">*</span>{" "}
                <span className="text-[13px] font-normal text-brand-primary">+ 상세 이미지(최대 3장)</span>
              </p>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <ImageUploadBox bordered />
                <ImageUploadBox />
                <ImageUploadBox />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <ImageUploadBox />
              </div>
            </div>

            <div>
              <label className="block text-[15px] font-semibold text-brand-dark mb-1.5">
                포스팅 이미지 <span className="text-red-500">*</span>{" "}
                <span className="text-[13px] font-normal text-brand-primary cursor-pointer hover:underline">(구글 드라이브링크)</span>
              </label>
              <input
                value={postingUrl}
                onChange={(e) => setPostingUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                className="w-full px-0 py-2 border-b border-brand-border text-[15px] text-brand-dark bg-transparent focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>

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

          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-4">
            {/* 단가 안내 */}
            <div className="flex items-center justify-between px-4 py-3 bg-brand-lighter rounded-xl">
              <span className="text-[15px] text-brand-sub">건당 단가</span>
              <span className="text-[17px] font-extrabold text-brand-dark">{UNIT_PRICE.toLocaleString()}원</span>
            </div>

            {/* 결제 금액 */}
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

            {/* 캠페인 등록 / 결제 버튼 */}
            {/* 결제 / 장바구니 */}
            <div className="grid grid-cols-[1.5fr_1fr] gap-2.5">
              <button
                onClick={handleSubmit}
                disabled={isPending || !agreements.req1 || !agreements.req2}
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
                className="w-full py-3.5 rounded-xl text-[15px] font-extrabold text-brand-primary bg-white border-2 border-brand-primary hover:bg-brand-primary/5 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
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
