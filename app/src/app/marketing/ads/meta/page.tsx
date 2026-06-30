"use client";

import { useState } from "react";

/* ─────────────────────────────────────────
   미니 목업 컴포넌트
───────────────────────────────────────── */
function FeedMockup() {
  return (
    <div className="w-[160px] rounded-[22px] border-[5px] border-[#e0e0e0] shadow-xl overflow-hidden bg-white shrink-0">
      {/* 상단 바 */}
      <div className="bg-white px-2.5 pt-2 pb-1.5 border-b border-gray-100 flex items-center justify-between">
        <span className="font-extrabold text-[13px]" style={{ background: "linear-gradient(90deg,#405DE6,#E1306C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Instagram</span>
        <div className="flex gap-1.5">
          <svg className="w-3 h-3 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
          <svg className="w-3 h-3 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
        </div>
      </div>
      {/* 피드 카드 */}
      <div className="bg-white">
        <div className="flex items-center gap-1.5 px-2 py-1.5">
          <div className="w-5 h-5 rounded-full shrink-0" style={{ background: "linear-gradient(135deg,#405DE6,#E1306C)" }} />
          <div>
            <p className="text-[8px] font-bold text-gray-800">brand_official</p>
            <p className="text-[6px] text-gray-400 flex items-center gap-0.5">광고 · 후원</p>
          </div>
        </div>
        <div className="h-20 w-full" style={{ background: "linear-gradient(135deg,#667eea,#764ba2)" }}>
          <div className="h-full flex flex-col items-center justify-center text-white">
            <p className="text-[10px] font-extrabold">NEW</p>
            <p className="text-[8px] opacity-80">신상품 출시</p>
          </div>
        </div>
        <div className="px-2 pt-1.5 pb-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex gap-1.5">
              <svg className="w-3 h-3 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              <svg className="w-3 h-3 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            </div>
          </div>
          <p className="text-[8px] font-bold text-gray-800">좋아요 2,847개</p>
          <p className="text-[7px] text-gray-500 mt-0.5">brand_official <span className="font-semibold text-gray-700">신상품 런칭 이벤트</span></p>
          <button className="mt-1.5 w-full py-1 rounded-lg text-[7px] font-extrabold text-white" style={{ background: "linear-gradient(90deg,#405DE6,#E1306C)" }}>
            지금 쇼핑하기
          </button>
        </div>
      </div>
    </div>
  );
}

function StoryMockup() {
  return (
    <div className="w-[160px] rounded-[22px] border-[5px] border-[#e0e0e0] shadow-xl overflow-hidden shrink-0" style={{ background: "linear-gradient(160deg,#405DE6,#833AB4,#E1306C)" }}>
      {/* 상단 스토리 progress */}
      <div className="px-2 pt-2 pb-1 flex gap-0.5">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-0.5 rounded-full flex-1 ${i === 1 ? "bg-white" : "bg-white/30"}`} />
        ))}
      </div>
      <div className="flex items-center gap-1.5 px-2 pb-2">
        <div className="w-5 h-5 rounded-full border border-white/50 shrink-0" style={{ background: "rgba(255,255,255,0.3)" }} />
        <p className="text-[8px] text-white font-semibold">brand_official</p>
        <span className="text-[6px] text-white/60 ml-auto">광고</span>
      </div>
      <div className="flex flex-col items-center justify-center py-10 px-3 text-center">
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z"/></svg>
        </div>
        <p className="text-[12px] font-extrabold text-white mb-1">지금 특가!</p>
        <p className="text-[9px] text-white/80 mb-4">오늘만 30% 할인</p>
        <div className="flex items-center gap-1 text-white/80">
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
          <span className="text-[8px] font-semibold">더 보기</span>
        </div>
      </div>
      <div className="px-3 pb-3">
        <button className="w-full py-1.5 rounded-xl text-[8px] font-extrabold text-purple-700 bg-white">
          지금 구매하기
        </button>
      </div>
    </div>
  );
}

function RetargetingMockup() {
  return (
    <div className="w-[160px] rounded-[22px] border-[5px] border-[#e0e0e0] shadow-xl overflow-hidden bg-white shrink-0">
      <div className="bg-white px-2.5 pt-2 pb-1.5 border-b border-gray-100 flex items-center justify-between">
        <span className="font-extrabold text-[11px] text-[#1877F2]">facebook</span>
        <div className="flex gap-1">
          <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
          <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </div>
      </div>
      <div className="p-2 space-y-2">
        {/* 픽셀 배지 */}
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg" style={{ background: "#E6EEFF" }}>
          <div className="w-4 h-4 rounded-full bg-[#1877F2] flex items-center justify-center shrink-0">
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
          </div>
          <p className="text-[7px] font-bold text-[#1877F2]">픽셀 추적 활성화</p>
        </div>
        {/* 리타게팅 카드 */}
        <div className="bg-white rounded-xl border border-gray-100 p-2">
          <div className="flex items-center gap-1 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shrink-0" />
            <div>
              <p className="text-[7px] font-bold text-gray-800">재방문 고객 타겟</p>
              <p className="text-[6px] text-gray-400">광고 · 후원</p>
            </div>
          </div>
          <div className="h-10 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center mb-1.5">
            <p className="text-[8px] font-extrabold text-[#1877F2]">다시 방문하세요!</p>
          </div>
          <p className="text-[7px] text-gray-600 mb-1">이전에 관심 보인 상품 → 다시 보여드립니다.</p>
          <button className="w-full py-0.5 rounded-lg text-[7px] font-bold text-white bg-[#1877F2]">
            지금 확인하기
          </button>
        </div>
      </div>
    </div>
  );
}

function CatalogMockup() {
  return (
    <div className="w-[160px] rounded-[22px] border-[5px] border-[#e0e0e0] shadow-xl overflow-hidden bg-white shrink-0">
      <div className="bg-white px-2.5 pt-2 pb-1.5 border-b border-gray-100 flex items-center justify-between">
        <span className="font-extrabold text-[13px]" style={{ background: "linear-gradient(90deg,#405DE6,#E1306C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Instagram</span>
        <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
      </div>
      <div className="p-2">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-5 h-5 rounded-full shrink-0" style={{ background: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" }} />
          <div>
            <p className="text-[7px] font-bold text-gray-800">shop_official</p>
            <p className="text-[6px] text-gray-400">광고 · 후원</p>
          </div>
        </div>
        {/* 캐러셀 카드들 */}
        <div className="flex gap-1.5 overflow-hidden">
          {[
            { label: "상품 A", price: "29,000" },
            { label: "상품 B", price: "45,000" },
          ].map((p, i) => (
            <div key={i} className={`shrink-0 w-[64px] rounded-lg overflow-hidden border border-gray-100 ${i === 1 ? "opacity-50" : ""}`}>
              <div className="h-12 flex items-center justify-center" style={{ background: i === 0 ? "linear-gradient(135deg,#ffecd2,#fcb69f)" : "linear-gradient(135deg,#a1c4fd,#c2e9fb)" }}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"/></svg>
              </div>
              <div className="p-1">
                <p className="text-[6px] font-bold text-gray-800">{p.label}</p>
                <p className="text-[7px] font-extrabold text-gray-900">{p.price}원</p>
              </div>
            </div>
          ))}
          <div className="shrink-0 w-6 flex items-center justify-center opacity-30">
            <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
          </div>
        </div>
        <button className="mt-1.5 w-full py-1 rounded-lg text-[7px] font-extrabold text-white" style={{ background: "linear-gradient(90deg,#405DE6,#E1306C)" }}>
          컬렉션 보기
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   히어로 폰 목업
───────────────────────────────────────── */
function MetaHeroMockup() {
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
          {/* Dynamic Island */}
          <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-[70px] h-[18px] bg-black rounded-full" />
          <div className="flex items-center gap-1">
            {/* 와이파이 */}
            <svg className="w-3.5 h-3.5 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1.5 8.43a15 15 0 0121 0l-2.1 2.1a12 12 0 00-16.8 0L1.5 8.43z" opacity=".3"/>
              <path d="M5.7 12.63a9 9 0 0112.6 0l-2.1 2.1a6 6 0 00-8.4 0L5.7 12.63z" opacity=".6"/>
              <path d="M9.9 16.83a3 3 0 014.2 0L12 18.93l-2.1-2.1z"/>
            </svg>
            {/* 배터리 */}
            <svg className="w-4 h-3.5 text-gray-800" fill="none" viewBox="0 0 24 12">
              <rect x="0.5" y="0.5" width="20" height="11" rx="3" stroke="currentColor" strokeWidth="1.2"/>
              <rect x="21" y="3.5" width="2.5" height="5" rx="1" fill="currentColor" opacity=".4"/>
              <rect x="2" y="2" width="14" height="8" rx="1.5" fill="currentColor"/>
            </svg>
          </div>
        </div>

        {/* 인스타그램 헤더 */}
        <div className="bg-white px-4 pb-2 flex items-center justify-between border-b border-gray-100">
          <span
            className="font-extrabold text-[17px]"
            style={{ background: "linear-gradient(90deg,#405DE6,#E1306C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            Instagram
          </span>
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            <svg className="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </div>
        </div>

        {/* 스토리 */}
        <div className="flex gap-3 px-3 py-3 border-b border-gray-100 overflow-hidden">
          {[
            { name: "내 스토리", self: true },
            { name: "brand1", self: false },
            { name: "shop2", self: false },
            { name: "cafe3", self: false },
          ].map(({ name, self }) => (
            <div key={name} className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={`w-10 h-10 rounded-full ${self ? "border-2 border-gray-300 bg-gray-100 flex items-center justify-center" : "p-[2px]"}`}
                style={!self ? { background: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" } : {}}
              >
                {self ? (
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                  </svg>
                ) : (
                  <div className="w-full h-full rounded-full bg-white p-[2px]">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-200 to-purple-300" />
                  </div>
                )}
              </div>
              <p className="text-[8px] text-gray-600 truncate w-10 text-center">{name}</p>
            </div>
          ))}
        </div>

        {/* 피드 포스트 */}
        <div>
          {/* 작성자 */}
          <div className="flex items-center gap-2 px-3 py-2.5">
            <div className="w-7 h-7 rounded-full shrink-0 p-[2px]" style={{ background: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366)" }}>
              <div className="w-full h-full rounded-full bg-white p-[2px]">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-300 to-purple-400" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-gray-800">brand_official</p>
              <p className="text-[8px] text-gray-400">광고 · 후원</p>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
            </svg>
          </div>

          {/* 이미지 */}
          <div className="h-[150px] w-full flex flex-col items-center justify-center gap-1" style={{ background: "linear-gradient(135deg,#667eea,#764ba2)" }}>
            <p className="text-[15px] font-extrabold text-white">지금 구매하면</p>
            <p className="text-[13px] font-bold text-white/90">최대 30% 할인</p>
            <p className="text-[10px] text-white/65 mt-1">오늘만 진행되는 특가 이벤트</p>
          </div>

          {/* 액션바 */}
          <div className="flex items-center gap-3 px-3 pt-2.5 pb-1">
            <svg className="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            <svg className="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <svg className="w-5 h-5 text-gray-800 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
            </svg>
          </div>
          <div className="px-3 pb-1">
            <p className="text-[9px] font-bold text-gray-800">좋아요 2,847개</p>
            <p className="text-[9px] text-gray-500 mt-0.5">
              <span className="font-semibold text-gray-800">brand_official</span> 신상품 런칭 이벤트 진행 중!
            </p>
          </div>

          {/* CTA */}
          <div className="px-3 pb-3 pt-1.5">
            <button className="w-full py-2 rounded-xl text-[10px] font-extrabold text-white" style={{ background: "linear-gradient(90deg,#405DE6,#E1306C)" }}>
              지금 쇼핑하기 →
            </button>
          </div>
        </div>

        {/* 하단 네비게이션 바 */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around py-2.5 px-4">
          {[
            "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
            "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
            "M12 4.5v15m7.5-7.5h-15",
            "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
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
        <p className="text-[9px] text-brand-muted mb-0.5">월간 이용자</p>
        <p className="text-[16px] font-extrabold leading-none" style={{ color: "#1877F2" }}>35억+</p>
      </div>
      <div className="absolute -left-8 bottom-20 bg-white rounded-2xl shadow-xl px-4 py-2.5 border border-brand-border">
        <p className="text-[9px] text-brand-muted mb-0.5">전환율 개선</p>
        <p className="text-[15px] font-extrabold leading-none" style={{ color: "#E1306C" }}>+45%</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   데이터
───────────────────────────────────────── */
const PROCESS = [
  { step: "01", title: "광고 목표 설정", desc: "브랜드 인지도·트래픽·전환·앱 설치 등 비즈니스 목표에 맞는 캠페인 목적을 설정합니다." },
  { step: "02", title: "픽셀 & 전환 추적", desc: "Meta 픽셀을 설치하고 구매·장바구니·회원가입 등 전환 이벤트를 추적 설정합니다." },
  { step: "03", title: "타겟 오디언스 설계", desc: "관심사·행동·인구통계 기반 핵심 타겟과 픽셀 데이터 기반 유사 타겟을 설계합니다." },
  { step: "04", title: "소재 제작 & 등록", desc: "피드·스토리·릴스 형식에 맞는 이미지·영상 소재를 제작하고 A/B 테스트를 진행합니다." },
  { step: "05", title: "성과 분석 & 최적화", desc: "CPM·CTR·ROAS를 모니터링하고 주간 리포트와 함께 예산·소재·타겟을 지속 개선합니다." },
];

const FAQS = [
  { q: "Facebook과 Instagram 광고를 동시에 집행할 수 있나요?", a: "네, Meta Business Suite를 통해 Facebook과 Instagram에 동시 집행이 가능합니다. 자동 배치(Advantage+)를 활용하면 성과가 높은 지면에 예산을 자동으로 배분합니다." },
  { q: "Meta 픽셀이 없어도 광고를 시작할 수 있나요?", a: "노출·트래픽 목적 광고는 픽셀 없이도 가능하지만, 전환 최적화를 위해서는 픽셀 설치를 강력히 권장합니다. 픽셀 설치 대행도 함께 진행해드립니다." },
  { q: "최소 광고 예산은 얼마인가요?", a: "일예산 기준 최소 5,000원부터 시작 가능합니다. 다만 전환 최적화가 충분히 작동하려면 일예산 5~10만 원 이상을 권장합니다." },
  { q: "소재는 직접 만들어야 하나요?", a: "소재 기획 및 제작도 대행해드립니다. 피드 이미지, 스토리 영상, 릴스 콘텐츠 제작 비용은 별도 협의합니다." },
];

const SERVICE_SCOPE = [
  {
    title: "계정 & 픽셀 세팅",
    items: ["Meta Business Suite 계정 세팅", "Meta 픽셀 & Conversions API 설치", "전환 이벤트 추적 구성"],
    color: "text-blue-600", bg: "bg-blue-50",
    icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z",
  },
  {
    title: "캠페인 운영",
    items: ["타겟 오디언스 설계 & 세분화", "입찰 전략 & 예산 최적화", "소재 A/B 테스트 운영"],
    color: "text-pink-600", bg: "bg-pink-50",
    icon: "M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75",
  },
  {
    title: "성과 리포트",
    items: ["주간 KPI 성과 대시보드 공유", "ROAS·CPM·CTR 심층 분석", "다음 주 개선 방향 제안"],
    color: "text-purple-600", bg: "bg-purple-50",
    icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  },
];

/* ─────────────────────────────────────────
   페이지
───────────────────────────────────────── */
export default function MetaAdsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <div className="w-full flex gap-5 items-start">

        {/* ── LEFT: 랜딩페이지 ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* 브레드크럼 */}
          <div className="flex items-center gap-2 text-[12px] text-brand-muted px-1">
            <span>퍼포먼스 마케팅</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            <span>META</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            <span className="text-brand-text font-medium">META 퍼포먼스 대행</span>
          </div>

          {/* ══ HERO ══ */}
          <div className="rounded-2xl overflow-hidden relative" style={{ background: "linear-gradient(135deg,#1877F2 0%,#0052CC 100%)" }}>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(255,255,255,0.1),transparent 70%)", transform: "translate(25%,-35%)" }} />
            <div className="absolute bottom-0 left-[30%] w-72 h-72 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(225,48,108,0.15),transparent 70%)", transform: "translateY(40%)" }} />
            <div className="grid grid-cols-1 lg:grid-cols-2 relative z-10">
              <div className="px-10 py-14 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-white/20 text-white tracking-wide">META ADS</span>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white/10 text-white/80">Facebook · Instagram</span>
                </div>
                <h1 className="text-[38px] font-extrabold text-white leading-[1.2] mb-5">
                  35억 명에게<br />
                  <span className="text-white">정확하게 도달하세요</span>
                </h1>
                <p className="text-[15px] text-white/75 leading-relaxed mb-8">
                  Facebook·Instagram을 통해 관심사·행동·인구통계 기반으로 구매 가능성이 가장 높은 고객에게만 광고를 노출합니다.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => alert("무료 상담 연결 예정")}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-extrabold text-blue-700 bg-white cursor-pointer hover:bg-white/90 transition-all shadow-lg"
                  >
                    무료 광고 진단
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                  </button>
                  <button
                    onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold text-white/80 cursor-pointer hover:text-white transition-all"
                    style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
                  >
                    광고 형식 보기
                  </button>
                </div>
                <div className="flex gap-8 mt-8 pt-8 border-t border-white/20">
                  {[
                    { v: "35억+", l: "월간 활성 사용자" },
                    { v: "+45%", l: "평균 전환율 개선" },
                    { v: "3,000+", l: "타겟팅 옵션" },
                  ].map((s) => (
                    <div key={s.l}>
                      <p className="text-[22px] font-extrabold text-white leading-none">{s.v}</p>
                      <p className="text-[11px] text-white/55 mt-1">{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-end justify-center px-10 pt-10 pb-0">
                <MetaHeroMockup />
              </div>
            </div>
          </div>

          {/* ══ FEATURE 1: 피드 광고 (white) ══ */}
          <div id="products" className="rounded-2xl overflow-hidden bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="flex flex-col justify-center px-12 py-14">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest mb-4" style={{ color: "#1877F2" }}>
                  <span className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: "linear-gradient(135deg,#1877F2,#0052CC)" }}>1</span>
                  피드 광고
                </span>
                <h2 className="text-[30px] font-extrabold text-brand-dark leading-tight mb-5">
                  스크롤 중인 고객에게<br />
                  <span style={{ color: "#1877F2" }}>자연스럽게 도달하세요</span>
                </h2>
                <p className="text-[15px] text-brand-sub leading-relaxed mb-8">
                  Instagram·Facebook 피드에 이미지·동영상 광고를 노출합니다. 자연스러운 콘텐츠처럼 보이면서 강력한 전환을 이끌어냅니다.
                </p>
                <div className="space-y-2">
                  {["Instagram & Facebook 동시 노출", "이미지·영상·카루셀 형식", "클릭 유도 CTA 버튼 포함", "정밀 타겟 오디언스 설정"].map((t) => (
                    <div key={t} className="flex items-center gap-2 text-[13px] text-brand-sub">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: "#1877F2" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center px-8 py-14 bg-brand-lighter">
                <div className="flex flex-col items-center gap-6">
                  <FeedMockup />
                  <div className="bg-white rounded-xl border border-brand-border px-5 py-3 text-center shadow-sm">
                    <p className="text-[11px] text-brand-muted mb-1">가장 많이 선택되는 형식</p>
                    <p className="text-[14px] font-extrabold text-brand-dark">피드 <span style={{ color: "#1877F2" }}>노출 최상위</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══ FEATURE 2: 스토리 & 릴스 (gray) ══ */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#F2F4F6" }}>
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="flex items-center justify-center px-8 py-14">
                <div className="flex flex-col items-center gap-6">
                  <StoryMockup />
                  <div className="bg-white rounded-xl border border-brand-border px-5 py-3 text-center shadow-sm">
                    <p className="text-[11px] text-brand-muted mb-1">세대 Z·밀레니얼 특화</p>
                    <p className="text-[14px] font-extrabold text-brand-dark">전체 화면 <span style={{ color: "#E1306C" }}>몰입형 광고</span></p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center px-12 py-14">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest mb-4" style={{ color: "#E1306C" }}>
                  <span className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: "linear-gradient(135deg,#E1306C,#833AB4)" }}>2</span>
                  스토리 & 릴스
                </span>
                <h2 className="text-[30px] font-extrabold text-brand-dark leading-tight mb-5">
                  전체 화면으로<br />
                  <span style={{ color: "#E1306C" }}>브랜드를 각인시키세요</span>
                </h2>
                <p className="text-[15px] text-brand-sub leading-relaxed mb-8">
                  스토리·릴스 형식으로 화면 전체를 점유하는 광고입니다. 건너뛸 수 없는 몰입감으로 브랜드 인지도를 폭발적으로 높입니다.
                </p>
                <div className="space-y-2">
                  {["Instagram 스토리·릴스 동시 집행", "전체 화면 수직 영상 포맷", "10~30초 영상 & 정적 이미지", "스와이프업 링크 연동"].map((t) => (
                    <div key={t} className="flex items-center gap-2 text-[13px] text-brand-sub">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: "#E1306C" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ══ FEATURE 3: 리타게팅 (dark) ══ */}
          <div className="rounded-2xl overflow-hidden relative" style={{ background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)" }}>
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(24,119,242,0.2),transparent 70%)", transform: "translate(20%,-30%)" }} />
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="flex flex-col justify-center px-12 py-14 relative z-10">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-blue-400 uppercase tracking-widest mb-4">
                  <span className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: "linear-gradient(135deg,#1877F2,#0052CC)" }}>3</span>
                  리타게팅
                </span>
                <h2 className="text-[30px] font-extrabold text-white leading-tight mb-5">
                  한 번 방문한 고객을<br />
                  <span style={{ color: "#60A5FA" }}>다시 불러오세요</span>
                </h2>
                <p className="text-[15px] text-white/60 leading-relaxed mb-8">
                  픽셀 데이터로 사이트 방문자·장바구니 이탈자를 추적합니다. 구매 직전 고객에게 다시 광고를 노출해 전환율을 극대화합니다.
                </p>
                <div className="space-y-2">
                  {["Meta 픽셀 기반 방문자 추적", "장바구니·결제 이탈 고객 재노출", "유사 타겟(Lookalike) 자동 확장", "동적 제품 광고(DPA) 연동"].map((t) => (
                    <div key={t} className="flex items-center gap-2 text-[13px] text-white/70">
                      <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center px-8 py-14 relative z-10">
                <div className="flex flex-col items-center gap-6">
                  <RetargetingMockup />
                  <div className="rounded-xl px-5 py-3 text-center" style={{ background: "rgba(24,119,242,0.15)", border: "1px solid rgba(24,119,242,0.3)" }}>
                    <p className="text-[11px] text-blue-300 mb-1">픽셀 기반 정밀 타겟</p>
                    <p className="text-[14px] font-extrabold text-white">전환율 <span className="text-blue-400">평균 3~5배</span> 향상</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══ FEATURE 4: 카탈로그 광고 (white) ══ */}
          <div className="rounded-2xl overflow-hidden bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="flex items-center justify-center px-8 py-14" style={{ background: "#FFF5F7" }}>
                <div className="flex flex-col items-center gap-6">
                  <CatalogMockup />
                  <div className="bg-white rounded-xl border border-pink-100 px-5 py-3 text-center shadow-sm">
                    <p className="text-[11px] mb-1" style={{ color: "#E1306C" }}>이커머스 최적화</p>
                    <p className="text-[14px] font-extrabold text-brand-dark">상품 <span style={{ color: "#E1306C" }}>자동 맞춤 노출</span></p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center px-12 py-14">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest mb-4" style={{ color: "#833AB4" }}>
                  <span className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: "linear-gradient(135deg,#833AB4,#E1306C)" }}>4</span>
                  카탈로그 & 동적 광고
                </span>
                <h2 className="text-[30px] font-extrabold text-brand-dark leading-tight mb-5">
                  수천 개 상품을<br />
                  <span style={{ color: "#833AB4" }}>자동으로 광고하세요</span>
                </h2>
                <p className="text-[15px] text-brand-sub leading-relaxed mb-8">
                  상품 카탈로그를 연동하면 각 고객의 관심사에 맞는 상품을 자동으로 선별해 개인화된 광고를 노출합니다.
                </p>
                <div className="space-y-2">
                  {["쇼핑몰 상품 카탈로그 자동 연동", "고객 관심사 기반 개인화 광고", "캐러셀 형식으로 다수 상품 노출", "장바구니 이탈 상품 자동 리마인드"].map((t) => (
                    <div key={t} className="flex items-center gap-2 text-[13px] text-brand-sub">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: "#833AB4" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ══ 대행 서비스 범위 (gray) ══ */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#F2F4F6" }}>
            <div className="px-10 py-12">
              <div className="text-center mb-8">
                <p className="text-[11px] font-extrabold text-brand-muted uppercase tracking-widest mb-3">서비스 범위</p>
                <h2 className="text-[28px] font-extrabold text-brand-dark mb-2">대행 서비스 전체 범위</h2>
                <p className="text-[14px] text-brand-sub">픽셀 세팅부터 성과 리포트까지 모든 과정을 책임집니다.</p>
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

          {/* ══ 진행 프로세스 (Meta gradient) ══ */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#1877F2 0%,#0052CC 100%)" }}>
            <div className="px-10 py-12">
              <div className="text-center mb-8">
                <p className="text-[11px] font-extrabold text-white/60 uppercase tracking-widest mb-3">진행 프로세스</p>
                <h2 className="text-[28px] font-extrabold text-white mb-2">META 광고 대행 5단계</h2>
                <p className="text-[14px] text-white/60">목표 설정부터 지속 최적화까지 체계적으로 진행합니다.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                {PROCESS.map((p, i) => (
                  <div key={p.step} className="flex flex-col items-center text-center relative">
                    <div className="h-12 w-12 rounded-full flex items-center justify-center mb-3 text-blue-700 font-extrabold text-[14px] bg-white">
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

        {/* ── RIGHT: Fixed CTA 패널
            lg: right 32px / xl: 256px 사이드바 + 32px = 288px
        ── */}
        <div className="hidden lg:block w-64 xl:w-72 shrink-0" />
        <div
          className="hidden lg:block fixed z-30 w-64 xl:w-72 right-8"
          style={{ top: "92px", maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
        >
          <div className="space-y-3 pb-3">

            {/* 메인 CTA 카드 */}
            <div className="rounded-2xl overflow-hidden relative" style={{ background: "linear-gradient(160deg,#1877F2 0%,#0052CC 100%)" }}>
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 110%, rgba(255,255,255,0.1), transparent 60%)" }} />
              <div className="relative z-10 px-5 py-6 text-center">
                <p className="text-[10px] font-extrabold text-white/60 uppercase tracking-widest mb-2">지금 바로 시작하세요</p>
                <h2 className="text-[20px] font-extrabold text-white leading-tight mb-3">
                  META 광고,<br />
                  전문가에게<br />
                  맡기세요
                </h2>
                <p className="text-[11px] text-white/70 leading-relaxed mb-5">
                  무료 광고 진단으로 현재 계정의 문제점을 파악하고 업종 맞춤 META 전략을 제안받으세요.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => alert("무료 상담 연결 예정")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-extrabold text-blue-700 bg-white cursor-pointer hover:bg-white/90 transition-all shadow-lg"
                  >
                    무료 광고 진단 신청
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

            {/* 지표 카드 */}
            <div className="bg-white rounded-2xl border border-brand-border p-4">
              <p className="text-[10px] font-extrabold text-brand-muted uppercase tracking-widest mb-2">플랫폼 현황</p>
              {[
                { label: "월간 활성 사용자", value: "35억+" },
                { label: "국내 Instagram 이용자", value: "1,800만+" },
                { label: "평균 전환율 개선", value: "+45%" },
                { label: "캠페인 시작 소요일", value: "1~3 영업일" },
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
                {["픽셀 & 전환 추적 세팅", "타겟 오디언스 설계", "소재 A/B 테스트 운영", "주간 성과 리포트 제공"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[11px] text-brand-sub">
                    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: "#1877F2" }}>
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
