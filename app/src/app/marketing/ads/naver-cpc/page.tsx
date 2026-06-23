"use client";

import { useState } from "react";

/* ─────────────────────────────────────────
   미니 목업 컴포넌트 4종
───────────────────────────────────────── */
function PowerlinkMockup() {
  return (
    <div className="w-[160px] rounded-[22px] border-[5px] border-[#e0e0e0] shadow-xl overflow-hidden bg-white shrink-0">
      <div className="bg-white px-2.5 pt-2 pb-1.5 border-b border-gray-100">
        <div className="flex items-center gap-1.5 border-b-2 border-[#03C75A] pb-1">
          <span className="font-extrabold text-[11px]" style={{ color: "#03C75A" }}>N</span>
          <span className="text-[9px] text-gray-700 font-medium flex-1">키워드 검색</span>
          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
        </div>
        <div className="flex gap-2 pt-1.5">
          {["통합","이미지","쇼핑","블로그"].map((t,i)=>(
            <span key={t} className={`text-[7px] pb-0.5 ${i===0?"font-bold text-[#03C75A] border-b border-[#03C75A]":"text-gray-400"}`}>{t}</span>
          ))}
        </div>
      </div>
      <div className="bg-[#f8f8f8] px-2 py-1.5 space-y-1.5">
        <p className="text-[7px] text-gray-400">관련 광고</p>
        <div className="bg-white rounded-lg p-2 shadow-sm border-l-2 border-[#03C75A]">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[7px] text-gray-400">brand.com</span>
            <span className="text-[6px] border border-gray-300 text-gray-400 px-0.5 rounded">광고</span>
          </div>
          <p className="text-[8px] font-bold text-[#1a73c8] leading-snug mb-1"><span className="text-[#03C75A]">키워드</span> 관련 최저가 · 당일 배송</p>
          <p className="text-[7px] text-gray-500 leading-tight">100% 정품 보장, 첫구매 쿠폰 즉시 발급.</p>
          <div className="mt-1 pt-1 border-t border-gray-100 flex items-center gap-1">
            <span className="text-[7px] font-bold text-[#1a73c8] bg-blue-50 px-1 py-0.5 rounded">이벤트</span>
            <span className="text-[7px] text-gray-400">신규 회원 혜택</span>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2 opacity-70">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[7px] text-gray-400">shop2.com</span>
            <span className="text-[6px] border border-gray-300 text-gray-400 px-0.5 rounded">광고</span>
          </div>
          <p className="text-[8px] font-bold text-[#1a73c8] leading-snug">공식 스토어 · 이달 특가</p>
          <p className="text-[7px] text-gray-400 mt-0.5">최대 30% 할인 진행 중</p>
        </div>
        <div className="bg-white rounded-lg p-2 opacity-30">
          <p className="text-[8px] font-bold text-[#1a73c8]">브랜드 공식몰 · 론칭 이벤트</p>
        </div>
      </div>
    </div>
  );
}

function ShoppingMockup() {
  return (
    <div className="w-[160px] rounded-[22px] border-[5px] border-[#e0e0e0] shadow-xl overflow-hidden bg-white shrink-0">
      <div className="bg-white px-2.5 pt-2 pb-1 border-b border-gray-100">
        <div className="flex items-center gap-1.5 border-b-2 border-[#03C75A] pb-1">
          <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          <span className="text-[9px] text-gray-700 font-medium flex-1">운동화</span>
          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
        </div>
        <div className="flex gap-1 pt-1 overflow-hidden">
          {["무료배송","가격","판매처"].map(f=>(
            <span key={f} className="text-[7px] text-gray-500 border border-gray-200 rounded-full px-1.5 py-0.5 shrink-0">{f}</span>
          ))}
        </div>
      </div>
      <div className="bg-white divide-y divide-gray-100">
        <div className="flex gap-2 p-2 bg-white">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 shrink-0 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"/></svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[8px] font-bold text-gray-800 leading-snug">편한 운동화 그레이슈즈 클래식</p>
            <p className="text-[9px] font-extrabold text-gray-900 mt-0.5">119,000<span className="text-[7px] font-normal">원</span></p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[7px] text-red-500">★4.9</span>
              <span className="text-[7px] border border-gray-300 text-gray-500 px-0.5 rounded">광고 ⓘ</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 p-2 opacity-60">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 shrink-0" />
          <div className="flex-1">
            <p className="text-[7px] font-bold text-gray-800">건강 기능 발편한 운동화</p>
            <p className="text-[8px] font-extrabold text-gray-900">150,000<span className="text-[6px] font-normal">원</span></p>
          </div>
        </div>
        <div className="flex gap-2 p-2 opacity-30">
          <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
          <div className="flex-1">
            <p className="text-[7px] font-bold text-gray-800">[공식몰] 남녀공용 러닝화</p>
            <p className="text-[8px] font-extrabold text-gray-900">99,000<span className="text-[6px] font-normal">원</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandMockup() {
  return (
    <div className="w-[160px] rounded-[22px] border-[5px] border-[#e0e0e0] shadow-xl overflow-hidden bg-white shrink-0">
      <div className="bg-white px-2.5 pt-2 pb-1.5 border-b border-gray-100">
        <div className="flex items-center gap-1.5 border-b-2 border-[#03C75A] pb-1">
          <span className="font-extrabold text-[11px]" style={{ color: "#03C75A" }}>N</span>
          <span className="text-[9px] text-gray-700 font-medium flex-1">브랜드명</span>
          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
        </div>
      </div>
      <div className="bg-white">
        <div className="mx-2 mt-2 rounded-xl overflow-hidden border border-gray-100">
          <div className="h-14 bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center relative">
            <span className="text-white font-extrabold text-[11px]">BRAND</span>
            <span className="absolute top-1 right-1 text-[6px] border border-white/40 text-white/70 px-1 rounded">광고</span>
          </div>
          <div className="p-2">
            <p className="text-[8px] font-extrabold text-gray-800">브랜드 공식 스토어</p>
            <p className="text-[7px] text-gray-500 mt-0.5 leading-tight">공식 인증 최저가 · 신상품 매주 업데이트</p>
          </div>
        </div>
        <div className="mx-2 mt-1.5 grid grid-cols-4 gap-1 pb-2">
          {["신상품","베스트","세일","이벤트"].map(link=>(
            <div key={link} className="text-center">
              <div className="w-7 h-7 rounded-lg bg-purple-50 mx-auto mb-0.5 flex items-center justify-center">
                <div className="w-3 h-3 rounded bg-purple-200" />
              </div>
              <p className="text-[6px] text-gray-500">{link}</p>
            </div>
          ))}
        </div>
        <div className="h-1.5 bg-gray-50 border-y border-gray-100" />
        <div className="px-2 py-2 space-y-1.5 opacity-40">
          <div className="h-2.5 bg-gray-200 rounded w-3/4" />
          <div className="h-2 bg-gray-100 rounded w-full" />
        </div>
      </div>
    </div>
  );
}

function ContentMockup() {
  return (
    <div className="w-[160px] rounded-[22px] border-[5px] border-[#e0e0e0] shadow-xl overflow-hidden bg-white shrink-0">
      <div className="bg-white px-2.5 pt-2 pb-1.5 border-b border-gray-100">
        <div className="flex items-center gap-1.5 border-b-2 border-[#03C75A] pb-1">
          <span className="font-extrabold text-[11px]" style={{ color: "#03C75A" }}>N</span>
          <span className="text-[9px] text-gray-700 font-medium flex-1">업종 정보 검색</span>
          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
        </div>
        <div className="flex gap-2 pt-1.5">
          {["통합","블로그","이미지","카페"].map((t,i)=>(
            <span key={t} className={`text-[7px] pb-0.5 ${i===0?"font-bold text-[#03C75A] border-b border-[#03C75A]":"text-gray-400"}`}>{t}</span>
          ))}
        </div>
      </div>
      <div className="bg-[#f8f8f8] px-2 py-1.5 space-y-1.5">
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="h-16 bg-gradient-to-br from-amber-100 to-orange-100 relative flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z"/></svg>
            <span className="absolute top-1 right-1 text-[6px] border border-amber-300 text-amber-500 bg-white px-1 rounded">광고</span>
          </div>
          <div className="p-2">
            <p className="text-[8px] font-bold text-gray-800 leading-snug">업종 전문가가 알려주는 핵심 정보</p>
            <p className="text-[7px] text-gray-500 mt-0.5 leading-tight">실제 사용 후기부터 전문가 팁까지.</p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2 opacity-55">
          <div className="flex gap-1.5">
            <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
            <div className="flex-1">
              <p className="text-[7px] font-bold text-gray-700 leading-snug">블로그 · 정보성 포스팅 제목</p>
              <p className="text-[6px] text-gray-400 mt-0.5">관련 내용 요약 텍스트...</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2 opacity-25">
          <div className="h-2 bg-gray-200 rounded w-3/4 mb-1" />
          <div className="h-1.5 bg-gray-100 rounded w-full" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   히어로 폰 목업
───────────────────────────────────────── */
function NaverSearchMockup() {
  return (
    <div className="relative flex justify-center items-end pb-6 select-none">
      {/* 좌측 볼륨 버튼 */}
      <div className="absolute left-[-4px] top-[88px] w-[4px] h-7 bg-[#bdbdbd] rounded-l-sm z-10" />
      <div className="absolute left-[-4px] top-[124px] w-[4px] h-7 bg-[#bdbdbd] rounded-l-sm z-10" />
      {/* 우측 전원 버튼 */}
      <div className="absolute right-[-4px] top-[108px] w-[4px] h-10 bg-[#bdbdbd] rounded-r-sm z-10" />

      {/* 폰 본체 */}
      <div
        className="relative overflow-hidden bg-white shadow-[0_32px_64px_rgba(0,0,0,0.25)]"
        style={{
          width: 248,
          height: 520,
          borderRadius: 44,
          border: "7px solid #d4d4d4",
        }}
      >
        {/* 상태바 + Dynamic Island */}
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

        {/* 네이버 검색창 */}
        <div className="bg-white px-3 pb-0">
          <div className="flex items-center gap-2 border-b-2 border-[#03C75A] pb-2">
            <span className="font-extrabold text-[18px] leading-none" style={{ color: "#03C75A" }}>N</span>
            <span className="flex-1 text-[13px] text-gray-800 font-medium">내 업종 키워드</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
          {/* 탭 */}
          <div className="flex gap-4 pt-2 pb-1 overflow-hidden">
            {["쇼핑","이미지","블로그","카페"].map((t, i) => (
              <span
                key={t}
                className={`text-[11px] shrink-0 pb-1.5 ${i === 0 ? "font-bold border-b-2 border-[#03C75A]" : "text-gray-400"}`}
                style={i === 0 ? { color: "#03C75A" } : {}}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* 검색 결과 */}
        <div className="px-2 pt-2 pb-3 space-y-2 overflow-hidden" style={{ background: "#f5f5f5" }}>
          <p className="text-[9px] text-gray-400 px-1">관련 광고</p>

          {/* 광고 카드 1 */}
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-1 mb-1.5">
              <span className="text-[9px] text-gray-400">브랜드명 · brand.com</span>
              <span className="text-[7px] border border-gray-300 text-gray-400 px-1 rounded">광고</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <p className="text-[11px] font-bold text-[#1a73c8] leading-snug mb-1">
                  <span style={{ color: "#03C75A" }}>키워드</span>는 브랜드에서 · 이달의 혜택
                </p>
                <p className="text-[9px] text-gray-500 leading-relaxed">고품질 제품과 합리적인 가격, 첫구매 쿠폰!</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 shrink-0 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="3" y="3" width="18" height="18" rx="2"/><path strokeLinecap="round" d="M3 9h18M9 21V9"/>
                </svg>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-[#1a73c8] bg-blue-50 px-1.5 py-0.5 rounded">이벤트</span>
              <span className="text-[9px] text-gray-500">신규 회원 혜택 3만원</span>
            </div>
          </div>

          {/* 광고 카드 2 */}
          <div className="bg-white rounded-xl p-3 shadow-sm opacity-75">
            <div className="flex items-center gap-1 mb-1.5">
              <span className="text-[9px] text-gray-400">shop.brand2.com</span>
              <span className="text-[7px] border border-gray-300 text-gray-400 px-1 rounded">광고</span>
            </div>
            <p className="text-[11px] font-bold text-[#1a73c8] leading-snug">전국 지점 · 론칭 기념 이벤트</p>
            <p className="text-[9px] text-gray-500 mt-1">트렌디한 컬렉션, 역대급 할인 행사.</p>
          </div>

          {/* 광고 카드 3 (희미) */}
          <div className="bg-white rounded-xl p-3 shadow-sm opacity-35">
            <p className="text-[10px] font-bold text-gray-300">신상품 할인 이벤트!</p>
          </div>
        </div>

        {/* 하단 네비게이션 바 */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around py-2.5 px-4">
          {[
            "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
            "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
            "M10 19l-7-7m0 0l7-7m-7 7h18",
            "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z",
            "M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z",
          ].map((d, i) => (
            <svg key={i} className={`w-5 h-5 ${i === 0 ? "text-gray-900" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={i === 0 ? 2 : 1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={d}/>
            </svg>
          ))}
        </div>
      </div>

      {/* 플로팅 배지 */}
      <div className="absolute -right-6 top-16 bg-white rounded-2xl shadow-xl px-4 py-2.5 border border-brand-border">
        <p className="text-[9px] text-brand-muted mb-0.5">클릭당 비용</p>
        <p className="text-[16px] font-extrabold leading-none text-green-600">70원~</p>
      </div>
      <div className="absolute -left-8 bottom-20 bg-white rounded-2xl shadow-xl px-4 py-2.5 border border-brand-border">
        <p className="text-[9px] text-brand-muted mb-0.5">검색결과</p>
        <p className="text-[15px] font-extrabold leading-none text-brand-primary">최상단</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   데이터
───────────────────────────────────────── */
const PROCESS = [
  { step: "01", title: "광고 목표 설정", desc: "업종·타겟·예산을 분석하여 파워링크·쇼핑검색·브랜드검색 등 최적 상품을 선택합니다." },
  { step: "02", title: "키워드 발굴 & 구조 설계", desc: "키워드 도구로 검색량·경쟁도를 분석하고, 캠페인→광고그룹→키워드 계층 구조를 설계합니다." },
  { step: "03", title: "소재 작성 & 등록", desc: "클릭률을 높이는 제목·설명문을 작성하고 네이버 광고 시스템에 등록·검토 요청합니다." },
  { step: "04", title: "입찰가 최적화", desc: "시간대·디바이스·지역별 성과를 분석해 입찰가를 조정하고 ROAS를 지속 개선합니다." },
  { step: "05", title: "리포트 & 개선 제안", desc: "주간 성과 리포트를 제공하고 다음 주 개선 방향을 함께 논의합니다." },
];

const FAQS = [
  { q: "네이버 SA와 GFA의 차이가 무엇인가요?", a: "SA(Search Advertising)는 검색 키워드 기반 광고로 구매 의도가 높은 사용자에게 도달합니다. GFA(Guaranteed Fixed Advertising)는 디스플레이 배너 광고로 브랜드 인지도 확장에 적합합니다." },
  { q: "최소 광고 예산이 얼마인가요?", a: "파워링크 기준 일예산 1만 원부터 시작 가능합니다. 업종과 키워드 경쟁도에 따라 적정 예산을 함께 산정해드립니다." },
  { q: "광고 등록 후 얼마나 걸려야 노출되나요?", a: "소재 검토는 보통 1~2 영업일 소요됩니다. 승인 후 즉시 노출되며, 키워드·입찰가에 따라 노출 순위가 결정됩니다." },
  { q: "기존 네이버 광고 계정이 있어도 대행 가능한가요?", a: "네, 가능합니다. 기존 계정에 대한 무료 진단을 먼저 진행한 후 개선 방향을 제안드립니다." },
];

const SERVICE_SCOPE = [
  {
    title: "계정 세팅",
    items: ["광고 계정 개설 대행", "캠페인·광고그룹 구조 설계", "전환 추적 스크립트 설치"],
    color: "text-green-600", bg: "bg-green-50",
    icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z",
  },
  {
    title: "운영 최적화",
    items: ["키워드 발굴 및 제외 관리", "입찰가·일예산 자동 조정", "소재 A/B 테스트"],
    color: "text-blue-600", bg: "bg-blue-50",
    icon: "M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75",
  },
  {
    title: "성과 리포트",
    items: ["주간 KPI 성과 리포트", "클릭·전환·ROAS 분석", "다음 주 개선 방향 제안"],
    color: "text-purple-600", bg: "bg-purple-50",
    icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  },
];

/* ─────────────────────────────────────────
   페이지
───────────────────────────────────────── */
export default function NaverSaPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <div className="w-full flex gap-5 items-start">

        {/* ────────────────────────────────
            LEFT: 랜딩페이지 섹션들
        ──────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4">

        {/* 브레드크럼 */}
        <div className="flex items-center gap-2 text-[12px] text-brand-muted px-1">
          <span>퍼포먼스 마케팅</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
          <span>네이버</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
          <span className="text-brand-text font-medium">네이버 SA광고</span>
        </div>

        {/* ══════════════════════════════
            HERO
        ══════════════════════════════ */}
        <div className="rounded-2xl overflow-hidden relative" style={{ background: "linear-gradient(135deg,#03C75A 0%,#028A3F 100%)" }}>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(255,255,255,0.12),transparent 70%)", transform: "translate(25%,-35%)" }} />
          <div className="absolute bottom-0 left-[40%] w-72 h-72 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(255,255,255,0.06),transparent 70%)", transform: "translateY(40%)" }} />
          <div className="grid grid-cols-1 lg:grid-cols-2 relative z-10">
            {/* 왼쪽: 텍스트 + CTA */}
            <div className="px-10 py-14 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-white/20 text-white tracking-wide">NAVER SA</span>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white/10 text-white/80">Search Advertising</span>
              </div>
              <h1 className="text-[38px] font-extrabold text-white leading-[1.2] mb-5">
                검색하는 고객에게<br />
                <span className="text-white">정확하게 도달하세요</span>
              </h1>
              <p className="text-[15px] text-white/75 leading-relaxed mb-8">
                구매 의도가 높은 고객이 검색하는 순간,<br />
                네이버 결과 최상단에 내 광고를 노출합니다.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => alert("무료 상담 연결 예정")}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-extrabold text-green-700 bg-white cursor-pointer hover:bg-white/90 transition-all shadow-lg"
                >
                  무료 계정 진단
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                </button>
                <button
                  onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold text-white/80 cursor-pointer hover:text-white transition-all"
                  style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
                >
                  광고 상품 보기
                </button>
              </div>
              <div className="flex gap-8 mt-8 pt-8 border-t border-white/20">
                {[
                  { v: "3,400만", l: "월간 이용자" },
                  { v: "70원~", l: "최저 클릭 비용" },
                  { v: "24/7", l: "자동 노출" },
                ].map((s) => (
                  <div key={s.l}>
                    <p className="text-[22px] font-extrabold text-white leading-none">{s.v}</p>
                    <p className="text-[11px] text-white/55 mt-1">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* 오른쪽: 폰 목업 */}
            <div className="flex items-end justify-center px-10 pt-10 pb-0">
              <NaverSearchMockup />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════
            FEATURE 1: 파워링크 (white)
        ══════════════════════════════ */}
        <div id="products" className="rounded-2xl overflow-hidden bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="flex flex-col justify-center px-12 py-14">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-green-600 uppercase tracking-widest mb-4">
                <span className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: "linear-gradient(135deg,#03C75A,#02A64E)" }}>1</span>
                파워링크
              </span>
              <h2 className="text-[30px] font-extrabold text-brand-dark leading-tight mb-5">
                검색 결과 최상단을<br />
                <span style={{ color: "#03C75A" }}>내 광고로 채우세요</span>
              </h2>
              <p className="text-[15px] text-brand-sub leading-relaxed mb-8">
                네이버 통합검색 결과 1~10위에 노출되는 텍스트 광고.<br />
                구매 의도가 높은 고객에게 가장 직접적으로 도달합니다.
              </p>
              <div className="space-y-2">
                {["검색결과 1~10위 노출", "최저 클릭비용 70원~", "PC·모바일 동시 노출", "키워드별 입찰가 자유 설정"].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-[13px] text-brand-sub">
                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {t}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center px-8 py-14 bg-brand-lighter">
              <div className="flex flex-col items-center gap-6">
                <PowerlinkMockup />
                <div className="bg-white rounded-xl border border-brand-border px-5 py-3 text-center shadow-sm">
                  <p className="text-[11px] text-brand-muted mb-1">가장 인기 있는 광고 상품</p>
                  <p className="text-[14px] font-extrabold text-brand-dark">클릭당 <span style={{ color: "#03C75A" }}>70원~</span> 시작</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════
            FEATURE 2: 쇼핑검색광고 (gray)
        ══════════════════════════════ */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#F2F4F6" }}>
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="flex items-center justify-center px-8 py-14">
              <div className="flex flex-col items-center gap-6">
                <ShoppingMockup />
                <div className="bg-white rounded-xl border border-brand-border px-5 py-3 text-center shadow-sm">
                  <p className="text-[11px] text-brand-muted mb-1">이커머스 전환 특화</p>
                  <p className="text-[14px] font-extrabold text-brand-dark">상품 이미지 + 가격 <span className="text-brand-primary">동시 노출</span></p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center px-12 py-14">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-brand-primary uppercase tracking-widest mb-4">
                <span className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: "linear-gradient(135deg,#3182F6,#6366F1)" }}>2</span>
                쇼핑검색광고
              </span>
              <h2 className="text-[30px] font-extrabold text-brand-dark leading-tight mb-5">
                상품 이미지·가격으로<br />
                <span className="text-brand-primary">구매를 바로 유도하세요</span>
              </h2>
              <p className="text-[15px] text-brand-sub leading-relaxed mb-8">
                네이버 쇼핑 검색결과에 상품 이미지와 가격을 함께 노출.<br />
                이커머스 구매 전환에 최적화되어 있습니다.
              </p>
              <div className="space-y-2">
                {["쇼핑 탭 상단 배치", "상품 이미지+가격 노출", "높은 구매 전환율", "쇼핑몰·스마트스토어 연동"].map((t) => (
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
            FEATURE 3: 브랜드검색 (dark)
        ══════════════════════════════ */}
        <div className="rounded-2xl overflow-hidden relative" style={{ background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)" }}>
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(139,92,246,0.15),transparent 70%)", transform: "translate(20%,-30%)" }} />
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="flex flex-col justify-center px-12 py-14">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-purple-400 uppercase tracking-widest mb-4">
                <span className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)" }}>3</span>
                브랜드검색
              </span>
              <h2 className="text-[30px] font-extrabold text-white leading-tight mb-5">
                브랜드 키워드 검색 시<br />
                <span style={{ color: "#a78bfa" }}>결과 전체를 독점하세요</span>
              </h2>
              <p className="text-[15px] text-white/60 leading-relaxed mb-8">
                브랜드명 검색 시 결과 최상단 전체를 프리미엄으로 점유.<br />
                이미지·동영상 소재로 강력한 브랜드 인상을 남깁니다.
              </p>
              <div className="space-y-2">
                {["검색 결과 100% 독점", "이미지·영상 소재 활용", "브랜드 인지도 폭발적 향상", "경쟁사 광고 차단 효과"].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-[13px] text-white/70">
                    <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {t}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center px-8 py-14">
              <div className="flex flex-col items-center gap-6">
                <BrandMockup />
                <div className="rounded-xl px-5 py-3 text-center" style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
                  <p className="text-[11px] text-purple-300 mb-1">브랜드 강화 특화</p>
                  <p className="text-[14px] font-extrabold text-white">결과 <span className="text-purple-400">100% 독점</span> 노출</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════
            FEATURE 4: 파워컨텐츠 (white)
        ══════════════════════════════ */}
        <div className="rounded-2xl overflow-hidden bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="flex items-center justify-center px-8 py-14 bg-amber-50">
              <div className="flex flex-col items-center gap-6">
                <ContentMockup />
                <div className="bg-white rounded-xl border border-amber-200 px-5 py-3 text-center shadow-sm">
                  <p className="text-[11px] text-amber-600 mb-1">콘텐츠형 광고</p>
                  <p className="text-[14px] font-extrabold text-brand-dark">자연스러운 <span className="text-amber-600">블로그형 노출</span></p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center px-12 py-14">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-amber-600 uppercase tracking-widest mb-4">
                <span className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)" }}>4</span>
                파워컨텐츠
              </span>
              <h2 className="text-[30px] font-extrabold text-brand-dark leading-tight mb-5">
                광고 같지 않은 광고로<br />
                <span className="text-amber-600">신뢰를 먼저 얻으세요</span>
              </h2>
              <p className="text-[15px] text-brand-sub leading-relaxed mb-8">
                블로그·카페 형태로 자연스럽게 노출되는 콘텐츠 광고.<br />
                정보성 콘텐츠를 선호하는 업종에 가장 효과적입니다.
              </p>
              <div className="space-y-2">
                {["블로그형 콘텐츠 자연 노출", "거부감 없는 정보성 광고", "병원·학원·서비스 업종 특화", "콘텐츠 제작 대행 가능"].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-[13px] text-brand-sub">
                    <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
            대행 서비스 범위 (gray)
        ══════════════════════════════ */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#F2F4F6" }}>
          <div className="px-10 py-12">
            <div className="text-center mb-8">
              <p className="text-[11px] font-extrabold text-brand-muted uppercase tracking-widest mb-3">서비스 범위</p>
              <h2 className="text-[28px] font-extrabold text-brand-dark mb-2">대행 서비스 전체 범위</h2>
              <p className="text-[14px] text-brand-sub">계정 세팅부터 성과 리포트까지 모든 과정을 책임집니다.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {SERVICE_SCOPE.map((cat) => (
                <div key={cat.title} className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${cat.bg}`}>
                      <svg className={`w-5 h-5 ${cat.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
                      </svg>
                    </div>
                    <span className={`text-[14px] font-extrabold ${cat.color}`}>{cat.title}</span>
                  </div>
                  <ul className="space-y-2.5">
                    {cat.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-[13px] text-brand-sub">
                        <svg className={`w-3.5 h-3.5 ${cat.color} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════
            진행 프로세스 (dark)
        ══════════════════════════════ */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#03C75A 0%,#028A3F 100%)" }}>
          <div className="px-10 py-12">
            <div className="text-center mb-8">
              <p className="text-[11px] font-extrabold text-white/60 uppercase tracking-widest mb-3">진행 프로세스</p>
              <h2 className="text-[28px] font-extrabold text-white mb-2">광고 대행 5단계</h2>
              <p className="text-[14px] text-white/60">목표 설정부터 성과 개선까지 체계적으로 진행합니다.</p>
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

        {/* ══════════════════════════════
            FAQ (white)
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

          <div className="h-24" />

        </div>
        {/* END LEFT ──────────────────── */}

        {/* ────────────────────────────────
            RIGHT: Fixed CTA 패널
            레이아웃 오프셋:
            - top: 60px 헤더 + 32px main padding = 92px
            - right(lg): main right padding = 32px
            - right(xl): 256px 레이아웃 사이드바 + 32px padding = 288px
        ──────────────────────────────── */}

        {/* flex 레이아웃 공간 유지용 placeholder */}
        <div className="hidden lg:block w-64 xl:w-72 shrink-0" />

        {/* 실제 고정 패널
            lg: right 32px (레이아웃 사이드바 없음, main padding만)
            xl: right 288px (레이아웃 사이드바 256px + padding 32px)
        */}
        <div
          className="hidden lg:block fixed z-30 w-64 xl:w-72 right-8 xl:right-[288px]"
          style={{
            top: "92px",
            maxHeight: "calc(100vh - 108px)",
            overflowY: "auto",
          }}
        >
          <div className="space-y-3 pb-3">

            {/* 메인 CTA 카드 */}
            <div className="rounded-2xl overflow-hidden relative" style={{ background: "linear-gradient(160deg,#03C75A 0%,#028A3F 100%)" }}>
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 110%, rgba(255,255,255,0.12), transparent 60%)" }} />
              <div className="relative z-10 px-5 py-6 text-center">
                <p className="text-[10px] font-extrabold text-white/60 uppercase tracking-widest mb-2">지금 바로 시작하세요</p>
                <h2 className="text-[20px] font-extrabold text-white leading-tight mb-3">
                  네이버 SA 광고,<br />
                  전문가에게<br />
                  맡기세요
                </h2>
                <p className="text-[11px] text-white/70 leading-relaxed mb-5">
                  무료 계정 진단으로 현재 광고의 문제점을 파악하고 업종에 맞는 최적 전략을 제안받으세요.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => alert("무료 상담 연결 예정")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-extrabold text-green-700 bg-white cursor-pointer hover:bg-white/90 transition-all shadow-lg"
                  >
                    무료 계정 진단 신청
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                  </button>
                  <button
                    onClick={() => alert("문의하기 연결 예정")}
                    className="w-full px-4 py-2.5 rounded-xl text-[12px] font-semibold text-white/80 cursor-pointer hover:text-white transition-all"
                    style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}
                  >
                    상담 문의하기
                  </button>
                </div>
              </div>
            </div>

            {/* 신뢰 지표 카드 */}
            <div className="bg-white rounded-2xl border border-brand-border p-4">
              <p className="text-[10px] font-extrabold text-brand-muted uppercase tracking-widest mb-2">운영 현황</p>
              {[
                { label: "월간 네이버 이용자", value: "3,400만+" },
                { label: "최저 클릭 비용", value: "70원~" },
                { label: "평균 ROAS 개선", value: "+38%" },
                { label: "광고 등록 소요일", value: "1~2 영업일" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-brand-border last:border-0">
                  <span className="text-[11px] text-brand-sub">{s.label}</span>
                  <span className="text-[12px] font-extrabold text-brand-dark">{s.value}</span>
                </div>
              ))}
            </div>

            {/* 대행 범위 카드 */}
            <div className="bg-brand-lighter rounded-2xl border border-brand-border p-4">
              <p className="text-[10px] font-extrabold text-brand-muted uppercase tracking-widest mb-2">대행 포함 범위</p>
              <ul className="space-y-1.5">
                {["계정 개설 & 구조 설계", "키워드 발굴 & 입찰 최적화", "소재 작성 & A/B 테스트", "주간 성과 리포트 제공"].map((item) => (
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
        {/* END RIGHT ─────────────────── */}

      </div>
    </>
  );
}
