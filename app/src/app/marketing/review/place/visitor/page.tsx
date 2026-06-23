"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const TABS = [
  { label: "블로그리뷰(기자단)", href: "/marketing/review/place/blog-reporter" },
  { label: "블로그리뷰(체험단)", href: "/marketing/review/place/blog-experience" },
  { label: "방문자리뷰",         href: "/marketing/review/place/visitor" },
  { label: "예약자리뷰",         href: "/marketing/review/place/reservation" },
];

const UNIT_PRICE = 1000;

function ImageUploadBox({ bordered }: { bordered?: boolean }) {
  return (
    <button
      className={`aspect-square w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-colors ${
        bordered ? "border-gray-400 bg-gray-50" : "border-gray-200 bg-white hover:bg-gray-50"
      }`}
    >
      <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
      <span className="text-[12px] text-gray-400">이미지 추가</span>
    </button>
  );
}

export default function VisitorReviewPage() {
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
        <span className="text-brand-muted">네이버 플레이스</span>
        <span>›</span>
        <Link href="/marketing/review/place" className="hover:text-brand-text">[리뷰] 캠페인 생성</Link>
        <span>›</span>
        <span className="text-brand-text font-medium">방문자리뷰</span>
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

          {/* 스케줄 설정 */}
          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-5">
            <h2 className="text-[15px] font-extrabold text-brand-dark">스케줄 설정</h2>

            <div>
              <p className="text-[13px] font-semibold text-brand-dark mb-0.5">
                모집 기간 <span className="text-red-500">*</span>
              </p>
              <p className="text-[11.5px] text-blue-500 font-normal mb-2">(익일 구동 접수 마감 오후 5시)</p>
              <button className="w-full flex items-center gap-2 px-3 py-2.5 border border-brand-border rounded-xl text-[13px] text-brand-muted bg-brand-lighter hover:bg-white transition-colors">
                <svg className="w-4 h-4 text-brand-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                시작일 ~ 종료일 선택
              </button>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-brand-dark mb-3">모집 인원 <span className="text-red-500">*</span></p>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-brand-sub shrink-0">총</span>
                <input
                  type="number"
                  value={totalCount}
                  onChange={(e) => setTotalCount(Math.max(1, Number(e.target.value)))}
                  className="flex-1 min-w-0 px-2 py-2 border border-brand-border rounded-xl text-[20px] font-extrabold text-blue-600 text-center bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                  min={1}
                />
                <span className="text-[13px] text-brand-sub shrink-0">/</span>
                <span className="text-[13px] text-brand-sub shrink-0">일</span>
                <input
                  type="number"
                  value={dailyCount}
                  onChange={(e) => setDailyCount(e.target.value)}
                  placeholder="일"
                  className="flex-1 min-w-0 px-2 py-2 border border-brand-border rounded-xl text-[14px] font-bold text-brand-dark text-center bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                  min={1}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-red-50 border border-red-100">
              <p className="text-[12.5px] font-extrabold text-red-600 mb-2">모집 인원 관련 주의사항</p>
              <ul className="space-y-1.5">
                {[
                  "1일 오픈 건 수 부족 시 마지막 날 잔여 수량이 전부 오픈됩니다.",
                  "인원 오기입으로 인해 발생되는 문제는 책임지지 않습니다.",
                ].map((note, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-red-500">
                    <span className="font-bold shrink-0 mt-px">⊕</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 필수 정보 */}
          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-5">
            <h2 className="text-[15px] font-extrabold text-brand-dark">필수 정보</h2>

            <div>
              <p className="text-[13px] font-semibold text-brand-dark mb-2.5">포스팅 유형 <span className="text-red-500">*</span></p>
              <div className="flex items-center gap-6">
                {["후기성", "정보성", "자유성"].map((v) => (
                  <label key={v} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="postingType" checked={postingType === v} onChange={() => setPostingType(v)} className="w-4 h-4 accent-blue-500" />
                    <span className="text-[13px] text-brand-dark">{v}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-brand-dark mb-2.5">제목 유형 <span className="text-red-500">*</span></p>
              <div className="flex items-center gap-6 flex-wrap">
                {["업체명", "업체명 + 키워드", "키워드"].map((v) => (
                  <label key={v} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="titleType" checked={titleType === v} onChange={() => setTitleType(v)} className="w-4 h-4 accent-blue-500" />
                    <span className="text-[13px] text-brand-dark">{v}</span>
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
                <label className="block text-[13px] font-semibold text-brand-dark mb-1.5">
                  {field.label} <span className="text-red-500">*</span>
                </label>
                <input
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-0 py-2 border-b border-brand-border text-[13px] text-brand-dark bg-transparent focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            ))}

            <div>
              <label className="block text-[13px] font-semibold text-brand-dark mb-1">
                해시태그 <span className="text-red-500">*</span>{" "}
                <span className="text-[11.5px] font-normal text-blue-500">(#해시태그로 구분, 일괄 등록 가능)</span>
              </label>
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 mb-1">
                  {hashtags.map((tag, i) => (
                    <span key={i} className="flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[12px] font-medium">
                      {tag}
                      <button onClick={() => setHashtags((p) => p.filter((_, j) => j !== i))} className="text-blue-400 hover:text-blue-600 ml-0.5">×</button>
                    </span>
                  ))}
                </div>
              )}
              <input
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={handleHashtagKey}
                placeholder="입력 후 엔터키로 추가"
                className="w-full px-0 py-2 border-b border-brand-border text-[13px] text-brand-dark bg-transparent focus:outline-none focus:border-blue-500 transition-colors"
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
                rows={6}
                placeholder={`예시)\n-대표 메뉴 (계절음식, 계절 상품 등)\n-이벤트 소개\n-영업시간(오픈, 브레이크 타임, 마감시간, 마지막 주문 시간,)\n-교통안내 (주차, 지하철역 도보 거리, 버스 내려서 도보 거리 등)`}
                className="w-full px-3 py-2.5 border border-brand-border rounded-xl text-[13px] text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all resize-none"
              />
              <p className="text-right text-[11px] text-brand-muted mt-1">{businessInfo.length} / 500</p>
            </div>
          </div>

          {/* 이미지 등록 */}
          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-5">
            <h2 className="text-[15px] font-extrabold text-brand-dark">이미지 등록</h2>

            <div>
              <p className="text-[13px] font-semibold text-brand-dark mb-3">
                썸네일 이미지 <span className="text-red-500">*</span>{" "}
                <span className="text-[12px] font-normal text-blue-500">+ 상세 이미지(최대 3장)</span>
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
              <label className="block text-[13px] font-semibold text-brand-dark mb-1.5">
                포스팅 이미지 <span className="text-red-500">*</span>{" "}
                <span className="text-[12px] font-normal text-blue-500 cursor-pointer hover:underline">(구글 드라이브링크)</span>
              </label>
              <input
                value={postingUrl}
                onChange={(e) => setPostingUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                className="w-full px-0 py-2 border-b border-brand-border text-[13px] text-brand-dark bg-transparent focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="p-4 rounded-xl bg-red-50 border border-red-100">
              <p className="text-[12.5px] font-extrabold text-red-600 mb-2">AI 이미지 자동 분류기 사용 주의사항</p>
              <ul className="space-y-1.5">
                {[
                  "구글 드라이브 링크만 가능합니다.",
                  "반드시 공개엑세스로 설정해주세요.",
                  "인물 모자이크를 지원하지 않습니다.",
                  "드라이브에는 이미지 파일만 존재해야합니다.(폴더 포함X)",
                ].map((note, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-red-500">
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
          <h2 className="text-[15px] font-extrabold text-brand-dark px-1">캠페인 설정</h2>

          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-4">
            {/* 단가 안내 */}
            <div className="flex items-center justify-between px-4 py-3 bg-brand-lighter rounded-xl">
              <span className="text-[13px] text-brand-sub">건당 단가</span>
              <span className="text-[15px] font-extrabold text-brand-dark">{UNIT_PRICE.toLocaleString()}원</span>
            </div>

            {/* 결제 금액 */}
            <div className="flex items-center justify-between px-4 py-3 bg-blue-50 rounded-xl">
              <span className="text-[14px] font-bold text-brand-dark">결제 금액</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[20px] font-extrabold text-blue-600">{orderAmount.toLocaleString()}</span>
                <span className="text-[13px] text-brand-sub">원</span>
              </div>
            </div>

            {orderAmount > balance && (
              <p className="text-[12px] text-red-500 font-medium -mt-1">포인트가 부족합니다.</p>
            )}

            {/* 보유 금액 */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
              <span className="text-[14px] font-bold text-brand-dark">보유 금액</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[20px] font-extrabold text-brand-dark">{balance.toLocaleString()}</span>
                <span className="text-[13px] text-brand-sub">원</span>
              </div>
            </div>

            {/* 동의 항목 */}
            <div className="space-y-3 pt-1">
              {([
                { key: "req1" as const, node: <><span className="text-blue-500 underline cursor-pointer">필수 동의 사항</span> 에 동의합니다. <span className="text-brand-muted">(필수)</span></> },
                { key: "req2" as const, node: <>공정위 문구 여부 포함 동의 <span className="text-brand-muted">(필수)</span></> },
                { key: "opt1" as const, node: <>지도 첨부 여부 <span className="text-brand-muted">(선택)</span></> },
                { key: "opt2" as const, node: <>연락처 첨부 여부 <span className="text-brand-muted">(선택)</span></> },
              ] as const).map((item) => (
                <label key={item.key} className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreements[item.key]}
                    onChange={(e) => setAgreements((p) => ({ ...p, [item.key]: e.target.checked }))}
                    className="w-4 h-4 mt-0.5 accent-blue-500 shrink-0"
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
