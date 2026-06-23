"use client";

import React, { useState } from "react";
import Link from "next/link";

const INPUT_CLASS = "w-full px-4 py-[13px] border border-brand-border rounded-2xl text-[15px] bg-brand-lighter text-brand-dark placeholder-brand-muted focus:outline-none focus:bg-white focus:border-brand-primary transition-all";
const TEXTAREA_CLASS = "w-full px-4 py-[13px] border border-brand-border rounded-2xl text-[15px] bg-brand-lighter text-brand-dark placeholder-brand-muted focus:outline-none focus:bg-white focus:border-brand-primary transition-all resize-none";
const LABEL_CLASS = "block text-[14px] font-semibold text-brand-dark mb-2";

export default function BlogCampaignPage() {
  const [reviewCount, setReviewCount] = useState(5);
  const [duration, setDuration] = useState(14);
  const [isPending, setIsPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const totalCost = reviewCount * 50000;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsPending(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-3xl">
        <div className="bg-white rounded-2xl border border-brand-border p-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-brand-success-bg mx-auto flex items-center justify-center mb-5">
            <svg className="w-8 h-8 text-brand-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-[20px] font-extrabold text-brand-dark mb-2">캠페인 신청 완료</h2>
          <p className="text-[14px] text-brand-sub mb-8">검수 후 블로거 모집이 시작됩니다.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/marketing/my/campaigns" className="px-5 py-3 rounded-2xl text-[14px] font-bold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors">주문내역 확인</Link>
            <button onClick={() => setSubmitted(false)} className="px-5 py-3 rounded-2xl text-[14px] font-bold bg-brand-light text-brand-text hover:bg-brand-border transition-colors cursor-pointer">새 캠페인 신청</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-5">
      <nav className="flex items-center gap-1.5 text-[13px] text-brand-sub">
        <Link href="/marketing" className="hover:text-brand-text transition-colors">대시보드</Link>
        <span className="text-brand-border">›</span>
        <span className="text-brand-text font-medium">블로그 기자단</span>
      </nav>

      {/* Product Info */}
      <div className="bg-white rounded-2xl border border-brand-border p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-block text-[11px] font-bold px-2 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-100 mb-3">리뷰·체험단</span>
            <h1 className="text-[22px] font-extrabold text-brand-dark mb-2">블로그 기자단</h1>
            <p className="text-[14px] text-brand-sub leading-relaxed max-w-lg">검증된 블로거들이 직접 방문하거나 상품을 체험하고 리뷰 콘텐츠를 작성합니다. 가이드라인을 입력하면 원하는 방향의 리뷰를 모집합니다.</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[26px] font-extrabold text-brand-dark leading-none">50,000원</p>
            <p className="text-[13px] text-brand-sub mt-0.5">/ 1건</p>
          </div>
        </div>
        <div className="mt-5 pt-5 border-t border-brand-border grid grid-cols-3 gap-4 text-center">
          {[["최소 주문", "1건"], ["최대 주문", "100건"], ["예상 완료", "14~30일"]].map(([label, val]) => (
            <div key={label}>
              <p className="text-[12px] text-brand-sub mb-1">{label}</p>
              <p className="text-[14px] font-bold text-brand-text">{val}</p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 업체·상품 정보 */}
        <div className="bg-white rounded-2xl border border-brand-border p-6 space-y-5">
          <h2 className="text-[17px] font-bold text-brand-dark">업체 · 상품 정보</h2>
          <div>
            <label className={LABEL_CLASS}>업체명 / 상품명 <span className="text-brand-error">*</span></label>
            <input name="business_name" required placeholder="예) 홍길동 칼국수 / 오가닉 마스크팩" className={INPUT_CLASS} />
          </div>
          <div>
            <label className={LABEL_CLASS}>서비스 소개 <span className="text-brand-error">*</span></label>
            <textarea name="intro" required rows={4} placeholder="블로거에게 전달할 업체/상품 소개글을 입력하세요." className={TEXTAREA_CLASS} />
          </div>
          <div>
            <label className={LABEL_CLASS}>
              리뷰 가이드라인
              <span className="ml-1.5 text-[12px] font-normal text-brand-sub">선택</span>
            </label>
            <textarea name="guideline" rows={3} placeholder="예) 방문 후 메인 메뉴와 분위기 위주로 작성해주세요." className={TEXTAREA_CLASS} />
          </div>
        </div>

        {/* 모집 인원 및 기간 */}
        <div className="bg-white rounded-2xl border border-brand-border p-6 space-y-6">
          <h2 className="text-[17px] font-bold text-brand-dark">모집 인원 및 기간</h2>
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[14px] font-semibold text-brand-text">모집 인원</label>
              <span className="text-[16px] font-extrabold text-brand-primary">{reviewCount}<span className="text-[13px] font-medium text-brand-sub ml-1">명</span></span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={reviewCount}
              onChange={(e) => setReviewCount(Number(e.target.value))}
            />
            <div className="flex justify-between text-[12px] text-brand-muted mt-2">
              <span>1명</span>
              <span>50명</span>
            </div>
          </div>
          <div>
            <label className="block text-[14px] font-semibold text-brand-text mb-3">진행 기간</label>
            <div className="grid grid-cols-3 gap-2">
              {[14, 21, 30].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`py-3 rounded-2xl text-[14px] font-bold border transition-colors ${
                    duration === d
                      ? "bg-brand-primary text-white border-brand-primary"
                      : "bg-white text-brand-sub border-brand-border hover:border-brand-primary/50 hover:text-brand-primary"
                  }`}
                >
                  {d}일
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 비용 요약 */}
        <div className="bg-brand-dark rounded-2xl p-6 text-white">
          <h2 className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-5">예상 비용 요약</h2>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-[14px]">
              <span className="text-white/50">모집 인원</span>
              <span>{reviewCount}명</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-white/50">진행 기간</span>
              <span>{duration}일</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-white/50">단가</span>
              <span>50,000원/건</span>
            </div>
            <div className="border-t border-white/10 pt-4 flex justify-between items-end">
              <span className="text-[15px]">예상 비용</span>
              <span className="text-[28px] font-extrabold text-brand-primary leading-none">{totalCost.toLocaleString()}<span className="text-[18px]">원</span></span>
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-[17px] rounded-2xl text-[15px] font-bold bg-brand-primary hover:bg-brand-primary-hover transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "신청 중..." : "캠페인 신청하기"}
          </button>
          <p className="text-[12px] text-white/30 text-center mt-3">※ 신청 후 검수를 거쳐 블로거 모집이 시작됩니다</p>
        </div>
      </form>
    </div>
  );
}
