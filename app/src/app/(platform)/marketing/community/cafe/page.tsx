"use client";

import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────
   히어로 폰 목업
───────────────────────────────────────── */
function NaverCafeHeroMockup() {
  return (
    <div className="relative flex justify-center items-end pb-6 select-none">
      {/* 사이드 버튼 */}
      <div className="absolute left-[-4px] top-[88px] w-[4px] h-7 bg-[#bdbdbd] rounded-l-sm z-10" />
      <div className="absolute left-[-4px] top-[124px] w-[4px] h-7 bg-[#bdbdbd] rounded-l-sm z-10" />
      <div className="absolute right-[-4px] top-[108px] w-[4px] h-10 bg-[#bdbdbd] rounded-r-sm z-10" />

      {/* 폰 본체 */}
      <div
        className="relative overflow-hidden bg-[#f5f5f5] shadow-[0_32px_64px_rgba(0,0,0,0.25)]"
        style={{ width: 248, height: 520, borderRadius: 44, border: "7px solid #d4d4d4" }}
      >
        {/* 상태바 */}
        <div className="relative bg-white flex items-center justify-between px-5 pt-3 pb-1">
          <span className="text-[11px] font-semibold text-gray-800">9:41</span>
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

        {/* 카페 헤더 */}
        <div className="bg-white px-3 pb-0 border-b border-gray-100">
          <div className="flex items-center gap-2 py-2">
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-[17px]" style={{ color: "#03C75A" }}>N</span>
              <span className="text-[15px] font-bold text-gray-800">카페</span>
            </div>
            <div className="flex-1 flex items-center bg-gray-100 rounded-full px-3 py-1 gap-1.5">
              <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
              <span className="text-[11px] text-gray-400">카페 검색</span>
            </div>
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
          </div>
          {/* 카페 탭 */}
          <div className="flex gap-4 overflow-hidden pb-0">
            {["추천","최신","인기","일상","정보"].map((t, i) => (
              <span key={t} className={`text-[11px] pb-2 shrink-0 border-b-2 ${i === 2 ? "font-bold border-[#03C75A] text-gray-900" : "border-transparent text-gray-400"}`}>{t}</span>
            ))}
          </div>
        </div>

        {/* 게시글 목록 */}
        <div className="overflow-hidden divide-y divide-gray-100 bg-white">
          {/* 게시글 1 - 핫딜형 (하이라이트) */}
          <div className="p-3 bg-green-50/50">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: "#03C75A" }}>핫딜</span>
              <span className="text-[9px] font-bold text-gray-800">역대급 할인! 이거 진짜 써봤는데...</span>
            </div>
            <p className="text-[9px] text-gray-500 leading-relaxed mb-2 line-clamp-2">진짜 이 가격에 이 퀄리티면 사야 함... 써보니까 생각보다 훨씬 좋더라고요. 한정 수량이라 빨리 봐야 할 것 같아서 올려봐요</p>
            <div className="flex items-center gap-2 text-[8px] text-gray-400">
              <span>조회 <span className="font-bold text-gray-600">12,847</span></span>
              <span>댓글 <span className="font-bold text-[#03C75A]">342</span></span>
              <span>추천 <span className="font-bold text-gray-600">891</span></span>
            </div>
          </div>

          {/* 게시글 2 - 리뷰형 */}
          <div className="p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600">후기</span>
              <span className="text-[9px] font-bold text-gray-800">6개월 사용 솔직 후기 (장단점 정리)</span>
            </div>
            <div className="flex gap-2">
              <p className="text-[9px] text-gray-500 leading-relaxed flex-1 line-clamp-2">정말 솔직하게 써볼게요. 처음엔 반신반의했는데 지금은 완전 만족합니다. 다만 이런 부분은 아쉬웠어요...</p>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 shrink-0" />
            </div>
            <div className="flex items-center gap-2 text-[8px] text-gray-400 mt-1.5">
              <span>조회 <span className="font-bold text-gray-600">8,231</span></span>
              <span>댓글 <span className="font-bold text-[#03C75A]">198</span></span>
            </div>
          </div>

          {/* 게시글 3 - 질답형 */}
          <div className="p-3 opacity-75">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600">질문</span>
              <span className="text-[9px] font-bold text-gray-700">이거 써보신 분 계세요? 솔직히 어때요?</span>
            </div>
            <div className="text-[8px] text-gray-400">댓글 47 · 조회 3,102</div>
          </div>

          {/* 게시글 4 (희미) */}
          <div className="p-3 opacity-35">
            <div className="h-2 bg-gray-200 rounded w-3/4 mb-1.5" />
            <div className="h-1.5 bg-gray-100 rounded w-full" />
          </div>
        </div>

        {/* 하단 네비 */}
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
        <p className="text-[10px] text-brand-muted mb-0.5">운영 채널</p>
        <p className="text-[18px] font-extrabold leading-none" style={{ color: "#03C75A" }}>1,000+</p>
      </div>
      <div className="absolute -left-8 bottom-20 bg-white rounded-2xl shadow-xl px-4 py-2.5 border border-brand-border">
        <p className="text-[10px] text-brand-muted mb-0.5">평균 조회수</p>
        <p className="text-[17px] font-extrabold leading-none text-brand-primary">5만+</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   게시글 유형 목업 카드
───────────────────────────────────────── */
function HotDealCard() {
  return (
    <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden w-full max-w-sm">
      {/* 카페 게시판 헤더 */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
        <span className="font-extrabold text-[15px]" style={{ color: "#03C75A" }}>N</span>
        <span className="text-[12px] text-gray-600 font-medium">핫딜·할인정보 게시판</span>
      </div>
      {/* 게시글 */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full text-white" style={{ background: "#03C75A" }}>핫딜</span>
          <span className="text-[11px] text-gray-400">맛집투어 카페</span>
        </div>
        <h3 className="text-[16px] font-extrabold text-gray-900 mb-2 leading-snug">역대급 가격 나왔네요... 이거 진짜 사야 할 것 같아서 공유해요</h3>
        <p className="text-[13px] text-gray-600 leading-relaxed mb-3">얼마 전부터 쓰기 시작했는데 솔직히 이 가격에 이 퀄리티면 거의 사기 수준이에요. 카페 분들한테도 공유하고 싶어서요. 한정 수량이라 빨리 확인해보셔야 할 것 같아요.</p>
        <div className="flex items-center gap-1 text-[12px] mb-3">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#03C75A" }}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
          <span className="text-blue-600 underline text-[12px]">구매 링크 (클릭 시 이동)</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2.5 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <span>조회 <span className="font-bold text-gray-700">12,847</span></span>
            <span>댓글 <span className="font-bold" style={{ color: "#03C75A" }}>342</span></span>
            <span>추천 <span className="font-bold text-gray-700">891</span></span>
          </div>
          <span className="text-gray-300">15분 전</span>
        </div>
      </div>
    </div>
  );
}

function ReviewCard() {
  return (
    <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden w-full max-w-sm">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
        <span className="font-extrabold text-[15px]" style={{ color: "#03C75A" }}>N</span>
        <span className="text-[12px] text-gray-600 font-medium">사용 후기 게시판</span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">후기</span>
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(s => <span key={s} className="text-[11px]" style={{ color: "#03C75A" }}>★</span>)}
          </div>
        </div>
        <h3 className="text-[16px] font-extrabold text-gray-900 mb-2 leading-snug">6개월 장기 사용 솔직 후기 (장단점 모두 작성)</h3>
        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <p className="text-[13px] text-gray-600 leading-relaxed">처음에는 반신반의했는데... 막상 써보니까 생각보다 훨씬 좋더라고요. 특히 이 부분이 정말 마음에 들었어요. 물론 아쉬운 점도 있긴 한데 전반적으로 만족합니다.</p>
          </div>
          <div className="grid grid-cols-2 gap-1 shrink-0">
            {["bg-gradient-to-br from-blue-100 to-blue-200","bg-gradient-to-br from-green-100 to-green-200"].map((c,i)=>(
              <div key={i} className={`w-12 h-12 rounded-lg ${c}`} />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2.5 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <span>조회 <span className="font-bold text-gray-700">8,231</span></span>
            <span>댓글 <span className="font-bold" style={{ color: "#03C75A" }}>198</span></span>
          </div>
          <span className="text-gray-300">1시간 전</span>
        </div>
      </div>
    </div>
  );
}

function QACard() {
  return (
    <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden w-full max-w-sm">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
        <span className="font-extrabold text-[15px]" style={{ color: "#03C75A" }}>N</span>
        <span className="text-[12px] text-gray-600 font-medium">자유·질문 게시판</span>
      </div>
      <div className="p-4">
        {/* 질문 */}
        <div className="flex items-start gap-2 mb-3 pb-3 border-b border-gray-100">
          <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0 mt-0.5" />
          <div>
            <p className="text-[12px] text-gray-500 mb-0.5">익명 회원</p>
            <p className="text-[13px] text-gray-800 font-medium">이거 써보신 분 계세요? 진짜 효과 있나요? 솔직한 의견 부탁드려요 ㅠㅠ</p>
          </div>
        </div>
        {/* 베스트 댓글 */}
        <div className="space-y-2">
          {[
            { name: "카페지기", text: "저 3개월째 쓰고 있는데 진짜 좋아요! 이 부분이 특히 만족스럽더라고요.", badge: "베스트" },
            { name: "회원1234", text: "저도 추천해요. 처음엔 어색했는데 익숙해지면 없어서 못 살 것 같아요 ㅎㅎ", badge: "" },
          ].map((c, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-green-100 shrink-0 mt-0.5 flex items-center justify-center">
                <span className="text-[8px] font-bold" style={{ color: "#03C75A" }}>N</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[11px] font-bold text-gray-800">{c.name}</span>
                  {c.badge && <span className="text-[8px] font-bold px-1 py-0.5 rounded text-white" style={{ background: "#03C75A" }}>{c.badge}</span>}
                </div>
                <p className="text-[12px] text-gray-600 leading-relaxed">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2.5 mt-2 border-t border-gray-100">
          <span>댓글 <span className="font-bold text-gray-700">47</span></span>
          <span>조회 <span className="font-bold text-gray-700">3,102</span></span>
        </div>
      </div>
    </div>
  );
}

function ContentCard() {
  return (
    <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden w-full max-w-sm">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
        <span className="font-extrabold text-[15px]" style={{ color: "#03C75A" }}>N</span>
        <span className="text-[12px] text-gray-600 font-medium">정보·꿀팁 게시판</span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">정보글</span>
        </div>
        <h3 className="text-[16px] font-extrabold text-gray-900 mb-2 leading-snug">✅ 이 분야 전문가가 알려주는 꼭 알아야 할 7가지</h3>
        <div className="space-y-1.5 mb-3">
          {["1. 처음 시작할 때 이것만 알면 됩니다","2. 전문가들이 추천하는 방법은?","3. 실제로 효과 있는 방법 TOP 3"].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: "#03C75A" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
              </svg>
              <p className="text-[13px] text-gray-700">{item}</p>
            </div>
          ))}
          <p className="text-[12px] text-gray-400 pl-5">+ 4가지 더...</p>
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2.5 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <span>조회 <span className="font-bold text-gray-700">21,445</span></span>
            <span>댓글 <span className="font-bold" style={{ color: "#03C75A" }}>503</span></span>
          </div>
          <span className="text-gray-300">3시간 전</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   노출형 목업
───────────────────────────────────────── */
function ExposureMockup() {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
      {/* 흐름 설명 레이블 */}
      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 text-center">
          <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">① 카페 게시글 등록</span>
        </div>
        <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
        <div className="flex-1 text-center">
          <span className="text-[11px] font-extrabold text-amber-600 uppercase tracking-widest">② 브랜드명 검색 시 노출</span>
        </div>
      </div>

      {/* 두 프레임 나란히 */}
      <div className="flex items-start gap-3 w-full">

        {/* 왼쪽: 카페 게시글 */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-100 bg-gray-50">
            <span className="font-extrabold text-[13px]" style={{ color: "#03C75A" }}>N</span>
            <span className="text-[10px] font-semibold text-gray-600">카페 게시판</span>
          </div>
          <div className="p-3">
            <div className="flex items-center gap-1 mb-1.5">
              <div className="w-4 h-4 rounded-full bg-gray-200 shrink-0" />
              <span className="text-[9px] text-gray-500">일반회원 · 맛집카페</span>
            </div>
            <p className="text-[11px] font-bold text-gray-800 mb-1.5 leading-snug">브랜드 써봤는데 진짜 좋더라..</p>
            <p className="text-[9px] text-gray-500 leading-relaxed mb-2">오래 고민하다 써봤는데 생각보다 훨씬 만족스럽네요. 특히 이 부분이 정말...</p>
            {/* 댓글 */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              {["ㄹㅇ 저도 써봤는데 좋더라고요", "어디서 사셨어요?", "저도 관심있었는데 감사해요!", "저도 추천해요 진짜"].map((c, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-green-100 shrink-0 mt-0.5" />
                  <p className="text-[9px] text-gray-600 leading-tight">{c}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-gray-100 text-[8px] text-gray-400">
              <span>댓글 <span className="font-bold text-gray-600">4</span></span>
              <span>조회 <span className="font-bold text-gray-600">1,243</span></span>
            </div>
          </div>
        </div>

        {/* 오른쪽: 네이버 검색 결과 */}
        <div className="flex-1 bg-white rounded-xl overflow-hidden shadow-sm" style={{ border: "2px solid #F59E0B" }}>
          {/* 하이라이트 라벨 */}
          <div className="flex items-center gap-1 px-2 py-1" style={{ background: "#F59E0B" }}>
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span className="text-[9px] font-extrabold text-white">검색 결과 노출 중</span>
          </div>
          {/* 네이버 검색창 */}
          <div className="px-2 py-2 border-b border-gray-100">
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
              <span className="font-extrabold text-[12px]" style={{ color: "#03C75A" }}>N</span>
              <span className="text-[10px] text-gray-800 font-semibold flex-1">브랜드명</span>
              <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
            </div>
            <div className="flex gap-2 mt-1.5 overflow-hidden">
              {["전체","카페","블로그","이미지"].map((t, i) => (
                <span key={t} className={`text-[9px] shrink-0 pb-0.5 ${i === 1 ? "font-bold border-b border-[#03C75A]" : "text-gray-400"}`} style={i === 1 ? { color: "#03C75A" } : {}}>{t}</span>
              ))}
            </div>
          </div>
          {/* 카페 검색 결과 */}
          <div className="p-2 space-y-1.5">
            <p className="text-[8px] text-gray-400">카페 게시글</p>
            {/* 하이라이트 결과 */}
            <div className="rounded-lg p-2" style={{ background: "#FFFBEB", border: "1px solid #F59E0B" }}>
              <div className="flex items-center gap-1 mb-1">
                <span className="font-extrabold text-[9px]" style={{ color: "#03C75A" }}>N</span>
                <span className="text-[8px] text-gray-400">맛집카페 · 일반게시판</span>
              </div>
              <p className="text-[10px] font-bold text-blue-700 leading-tight mb-0.5">
                <span className="text-amber-600">브랜드</span> 써봤는데 진짜 좋더라..
              </p>
              <p className="text-[8px] text-gray-500 leading-tight">오래 고민하다 써봤는데 생각보다 훨씬 만족...</p>
              <div className="flex items-center gap-2 mt-1 text-[8px] text-gray-400">
                <span>댓글 4</span>
                <span>조회 1,243</span>
              </div>
            </div>
            {/* 일반 결과 (희미) */}
            <div className="rounded-lg p-2 bg-gray-50 opacity-50">
              <p className="text-[9px] text-blue-600 font-medium">브랜드 관련 카페 글 모음...</p>
              <p className="text-[8px] text-gray-400">다른 게시글 내용...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   데이터
───────────────────────────────────────── */
const STRENGTHS = [
  {
    icon: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21",
    title: "1,000+ 채널 보유",
    desc: "다양한 규모와 카테고리의 카페 1,000개 이상을 직접 관리합니다. 업종·타겟에 맞는 채널을 정밀하게 선정합니다.",
    color: "text-[#2E6BE0]", bg: "bg-blue-50",
  },
  {
    icon: "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z",
    title: "직접 기획·관리·실행",
    desc: "외주나 재판매 없이 100% 직접 진행합니다. 명확한 가이드라인 기반의 체계적·전문적 업무 프로세스로 신뢰를 드립니다.",
    color: "text-blue-600", bg: "bg-blue-50",
  },
  {
    icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
    title: "실시간 성과 리포트",
    desc: "광고주와 실시간 소통하며 조회수·댓글·반응 데이터를 주간 단위로 공유합니다. 투명하게 성과를 확인하실 수 있습니다.",
    color: "text-[#2E6BE0]", bg: "bg-blue-50",
  },
  {
    icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
    title: "100% A/S 보장",
    desc: "저희 측 과실 또는 판단 미스 시 100% A/S를 보장합니다. 안전하고 책임감 있는 마케팅을 약속드립니다.",
    color: "text-[#2E6BE0]", bg: "bg-blue-50",
  },
];

const PROCESS = [
  { step: "01", title: "브리핑 & 목표 설정", desc: "업종·타겟·메시지·예산을 상담합니다. 어떤 반응을 이끌어낼지 전략 방향을 함께 결정합니다." },
  { step: "02", title: "채널 선정 & 기획", desc: "1,000+ 채널 중 업종과 타겟에 최적화된 카페를 선정하고 게시글 유형 및 콘텐츠를 기획합니다." },
  { step: "03", title: "원고 작성 & 검토", desc: "자연스럽고 신뢰감 있는 게시글을 작성하고 광고주 확인 후 수정·보완합니다." },
  { step: "04", title: "게시 & 확산", desc: "선정된 카페에 게시글을 등록하고 댓글 반응 유도를 통해 자연 확산을 촉진합니다." },
  { step: "05", title: "성과 리포트 제공", desc: "조회수·댓글수·반응 데이터를 정리한 성과 리포트를 제공하고 다음 캠페인 방향을 제안합니다." },
];

const FAQS = [
  { q: "어떤 카페에 게시글을 등록하나요?", a: "업종·타겟에 맞는 카테고리의 활성 카페를 선정합니다. 맛집, 육아, 재테크, 뷰티, 건강 등 다양한 분야의 카페 1,000개 이상을 운영 중입니다. 원하시는 카테고리를 말씀해주시면 최적 채널을 제안드립니다." },
  { q: "게시글이 삭제되면 어떻게 되나요?", a: "저희 측 과실로 인한 삭제 시 100% A/S를 보장합니다. 카페 운영자 정책 변경 등 불가항력적 사유는 협의하여 처리합니다. 사전에 안전한 채널만 선정하여 리스크를 최소화합니다." },
  { q: "최소 진행 수량이 있나요?", a: "최소 10개 카페부터 진행 가능합니다. 다만 효과적인 바이럴을 위해 30개 이상 진행을 권장합니다. 예산과 목표에 맞춰 유연하게 조정 가능합니다." },
  { q: "얼마나 걸리나요?", a: "계약 후 원고 기획·검토를 포함해 보통 3~5 영업일 내 게시 시작합니다. 캠페인 기간은 보통 1~4주이며 목표에 따라 단기·장기로 조정 가능합니다." },
];

/* ─────────────────────────────────────────
   페이지
───────────────────────────────────────── */
export default function NaverCafePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // 오른쪽 CTA 패널을 콘텐츠 컬럼 우측에 맞춰 fixed로 배치 (스크롤해도 고정)
  const railRef = useRef<HTMLDivElement>(null);
  const [railLeft, setRailLeft] = useState<number>();
  useEffect(() => {
    const update = () => {
      if (railRef.current) setRailLeft(railRef.current.getBoundingClientRect().left);
    };
    update();
    window.addEventListener("resize", update);
    const ro = new ResizeObserver(update);
    if (railRef.current) ro.observe(railRef.current);
    return () => {
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, []);

  return (
    <>
      <div className="w-full flex gap-5 items-start pb-24 lg:pb-0">

        {/* ── LEFT: 랜딩페이지 ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* ══ HERO ══ */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#1B3160 0%,#111D37 100%)" }}>
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="px-5 py-9 md:px-10 md:py-14 flex flex-col justify-center">
                <span className="inline-block text-[14px] font-extrabold tracking-wide mb-5" style={{ color: "#9DBBF5" }}>바이럴 / 커뮤니티 / 네이버 카페 침투</span>
                <h1 className="text-[26px] md:text-[38px] font-extrabold text-white leading-[1.28] mb-4">
                  광고 같지 않은 진짜 입소문,<br />
                  <span style={{ color: "#7EA6F5" }}>네이버 카페에서.</span>
                </h1>
                <p className="text-[15px] text-white/65 leading-relaxed mb-8">
                  1,000만 카페 회원에게 자연스럽게 도달해, 광고처럼 보이지 않는<br />
                  진짜 입소문을 만들어 드립니다.
                </p>
                {/* 메타 정보 */}
                <div className="inline-flex flex-wrap items-center gap-y-4 rounded-2xl px-6 py-5" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                  {[
                    { k: "운영 채널", v: "1,000+" },
                    { k: "평균 조회수", v: "5만+" },
                    { k: "A/S 보장", v: "100%" },
                  ].map((m, i) => (
                    <div key={m.k} className={`flex flex-col gap-1 pr-6 ${i > 0 ? "pl-6" : ""}`} style={i > 0 ? { borderLeft: "1px solid rgba(255,255,255,0.15)" } : {}}>
                      <span className="text-[12px] text-white/50">{m.k}</span>
                      <span className="text-[15px] font-bold text-white">{m.v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-end justify-center px-10 pt-10 pb-0">
                <NaverCafeHeroMockup />
              </div>
            </div>
          </div>

          {/* ══ FEATURE 1: 핫딜 정보형 (white) ══ */}
          <div id="types" className="rounded-2xl overflow-hidden bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="flex flex-col justify-center px-5 py-9 md:px-12 md:py-14">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-widest mb-4" style={{ color: "#2E6BE0" }}>
                  <span className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[11px] font-extrabold shrink-0" style={{ background: "#2E6BE0" }}>1</span>
                  핫딜 정보형
                </span>
                <h2 className="text-[24px] md:text-[34px] font-extrabold text-brand-dark leading-tight mb-5">
                  가격 정보로<br />
                  <span style={{ color: "#2E6BE0" }}>구매 욕구를 자극하세요</span>
                </h2>
                <p className="text-[17px] text-brand-sub leading-relaxed mb-8">
                  핫딜·특가·한정 이벤트 정보를 카페에 자연스럽게 공유합니다. "광고 같지 않은" 정보성 게시글로 구매 전환을 이끌어냅니다.
                </p>
                <div className="space-y-2">
                  {["구매 의도가 높은 사용자 집중 도달", "정보 공유형 자연스러운 문체", "구매 링크·이벤트 페이지 연동", "댓글 반응 유도로 신뢰도 증폭"].map((t) => (
                    <div key={t} className="flex items-center gap-2 text-[15px] text-brand-sub">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: "#2E6BE0" }}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-last lg:order-none flex items-center justify-center px-5 py-9 md:px-8 md:py-14 bg-brand-lighter">
                <HotDealCard />
              </div>
            </div>
          </div>

          {/* ══ FEATURE 2: 리뷰형 (gray) ══ */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#F2F4F6" }}>
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="order-last lg:order-none flex items-center justify-center px-5 py-9 md:px-8 md:py-14">
                <ReviewCard />
              </div>
              <div className="flex flex-col justify-center px-5 py-9 md:px-12 md:py-14">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-widest mb-4 text-[#2E6BE0]">
                  <span className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[11px] font-extrabold shrink-0 bg-[#2E6BE0]">2</span>
                  리뷰형
                </span>
                <h2 className="text-[24px] md:text-[34px] font-extrabold text-brand-dark leading-tight mb-5">
                  실사용자 후기처럼<br />
                  <span className="text-[#2E6BE0]">신뢰를 쌓으세요</span>
                </h2>
                <p className="text-[17px] text-brand-sub leading-relaxed mb-8">
                  실제 경험담처럼 작성한 리뷰형 게시글로 높은 신뢰도를 형성합니다. 구매 전 검색하는 사용자에게 결정적 영향을 미칩니다.
                </p>
                <div className="space-y-2">
                  {["실사용 경험 기반의 자연스러운 후기", "장단점 균형 있는 신뢰감 있는 작성", "사진·이미지 첨부로 생동감 추가", "스타 평점 포함 구매 심리 자극"].map((t) => (
                    <div key={t} className="flex items-center gap-2 text-[15px] text-brand-sub">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: "#2E6BE0" }}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ══ FEATURE 3: 자유·질답형 (dark) ══ */}
          <div className="rounded-2xl overflow-hidden bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="flex flex-col justify-center px-5 py-9 md:px-12 md:py-14">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-widest mb-4 text-[#2E6BE0]">
                  <span className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[11px] font-extrabold shrink-0" style={{ background: "#2E6BE0" }}>3</span>
                  자유·질답형
                </span>
                <h2 className="text-[24px] md:text-[34px] font-extrabold text-brand-dark leading-tight mb-5">
                  자연스러운 대화 속<br />
                  <span className="text-[#2E6BE0]">브랜드를 심으세요</span>
                </h2>
                <p className="text-[17px] text-brand-sub leading-relaxed mb-8">
                  질문→답변 형태로 브랜드를 자연스럽게 언급합니다. 실제 회원들의 추천처럼 보이기 때문에 전환 효과가 탁월합니다.
                </p>
                <div className="space-y-2">
                  {["질문 게시글 + 베스트 댓글 구성", "실제 회원 추천처럼 보이는 자연스러운 작성", "경쟁 브랜드 대비 우위 표현", "커뮤니티 내 바이럴 확산 유도"].map((t) => (
                    <div key={t} className="flex items-center gap-2 text-[15px] text-brand-sub">
                      <svg className="w-4 h-4 text-[#2E6BE0] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-last lg:order-none flex items-center justify-center px-5 py-9 md:px-8 md:py-14 relative z-10">
                <QACard />
              </div>
            </div>
          </div>

          {/* ══ FEATURE 4: 콘텐츠 기획형 (white) ══ */}
          <div className="rounded-2xl overflow-hidden bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="order-last lg:order-none flex items-center justify-center px-5 py-9 md:px-8 md:py-14" style={{ background: "#EFF4FD" }}>
                <ContentCard />
              </div>
              <div className="flex flex-col justify-center px-5 py-9 md:px-12 md:py-14">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-widest mb-4 text-[#2E6BE0]">
                  <span className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[11px] font-extrabold shrink-0 bg-[#2E6BE0]">4</span>
                  콘텐츠 기획형
                </span>
                <h2 className="text-[24px] md:text-[34px] font-extrabold text-brand-dark leading-tight mb-5">
                  정보로 신뢰를 쌓고<br />
                  <span className="text-[#2E6BE0]">브랜드를 각인시키세요</span>
                </h2>
                <p className="text-[17px] text-brand-sub leading-relaxed mb-8">
                  업종 관련 유익한 정보글로 카페 내 신뢰도를 구축합니다. 지속 반복 노출을 통해 잠재 고객의 뇌리에 브랜드를 남깁니다.
                </p>
                <div className="space-y-2">
                  {["정보성 고품질 롱폼 콘텐츠 작성", "업종 전문성 어필로 신뢰도 구축", "지속적 반복 노출로 브랜드 인지도 향상", "카페 내 '유익한 글' 상위 노출 유도"].map((t) => (
                    <div key={t} className="flex items-center gap-2 text-[15px] text-brand-sub">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: "#2E6BE0" }}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ══ FEATURE 5: 노출형 (amber/dark) ══ */}
          <div className="rounded-2xl overflow-hidden bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="flex flex-col justify-center px-5 py-9 md:px-12 md:py-14">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-widest mb-4 text-[#2E6BE0]">
                  <span className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[11px] font-extrabold shrink-0 bg-[#2E6BE0]">5</span>
                  노출형
                </span>
                <h2 className="text-[24px] md:text-[34px] font-extrabold text-brand-dark leading-tight mb-4">
                  브랜드명 검색 시<br />
                  <span className="text-[#2E6BE0]">긍정 게시글이 보이게</span>
                </h2>

                {/* 핵심 설명 박스들 */}
                <div className="space-y-3 mb-6">
                  <div className="rounded-xl px-4 py-3 bg-blue-50">
                    <p className="text-[15px] text-gray-800 leading-relaxed">
                      <span className="font-extrabold text-[#0D3473]">노출형</span>은 별도의 클린 작업 없이 <span className="font-bold">반영구적으로 유지</span>할 수 있는 게시글 형식입니다. 브랜드명 검색 시 긍정적인 포스팅과 댓글 노출을 목표로 하는 <span className="font-bold">반영구 유지 상품</span>입니다.
                    </p>
                  </div>
                  <div className="rounded-xl px-4 py-3 bg-gray-50">
                    <p className="text-[13px] text-gray-600 leading-relaxed">
                      채널 지정이 불가하며, 게시글 유지를 위해 <span className="font-bold text-gray-800">비교적 규제가 심하지 않은 채널</span>로 진행됩니다.
                    </p>
                    <p className="text-[12px] text-red-500 mt-1.5">
                      * 카페 운영자 측 삭제 게시글 (12시간 이내)은 1회에 한해 A/S 가능합니다.
                    </p>
                  </div>
                </div>

                {/* 두 가지 상품 */}
                <div className="space-y-2">
                  <p className="text-[13px] font-bold text-gray-700 mb-2">댓글·조회수에 따라 두 가지 상품으로 구분됩니다.</p>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-[#C9D8F5]">
                    <span className="shrink-0 text-[12px] font-extrabold px-2.5 py-1 rounded-lg text-white bg-[#2E6BE0]">노출형 1</span>
                    <p className="text-[15px] text-gray-700">댓글 <span className="font-bold text-gray-900">4개</span> 포함 · 조회수 <span className="font-bold text-gray-900">1,000</span> 이상</p>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
                    <span className="shrink-0 text-[12px] font-extrabold px-2.5 py-1 rounded-lg text-white bg-gray-400">노출형 2</span>
                    <p className="text-[15px] text-gray-700">댓글 <span className="font-bold text-gray-900">2개</span> 포함 · 조회수 <span className="font-bold text-gray-900">500</span> 이상</p>
                  </div>
                </div>
                <p className="text-[12px] text-brand-muted mt-3">* 키워드에 따라 단가가 상이하니 자세한 내용은 담당자에게 문의해주세요.</p>
              </div>

              <div className="order-last lg:order-none flex items-center justify-center px-5 py-9 md:px-8 md:py-14 bg-brand-lighter">
                <ExposureMockup />
              </div>
            </div>
          </div>

          {/* ══ 차별화 강점 (gray, 4 cards) ══ */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#F2F4F6" }}>
            <div className="px-5 py-8 md:px-10 md:py-12">
              <div className="text-center mb-8">
                <p className="text-[12px] font-extrabold text-brand-muted uppercase tracking-widest mb-3">왜 저희를 선택하나요?</p>
                <h2 className="text-[23px] md:text-[31px] font-extrabold text-brand-dark mb-2">업계 최고의 카페 마케팅</h2>
                <p className="text-[16px] text-brand-sub">직접 기획하고, 직접 관리하고, 직접 실행합니다.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {STRENGTHS.map((s) => (
                  <div key={s.title} className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${s.bg}`}>
                        <svg className={`w-5 h-5 ${s.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={s.icon}/>
                        </svg>
                      </div>
                      <span className={`text-[17px] font-extrabold ${s.color}`}>{s.title}</span>
                    </div>
                    <p className="text-[15px] text-brand-sub leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ══ 진행 프로세스 (green gradient) ══ */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#1B3160 0%,#111D37 100%)" }}>
            <div className="px-5 py-8 md:px-10 md:py-12">
              <div className="text-center mb-8">
                <p className="text-[12px] font-extrabold text-white/60 uppercase tracking-widest mb-3">진행 프로세스</p>
                <h2 className="text-[23px] md:text-[31px] font-extrabold text-white mb-2">카페 침투 마케팅 5단계</h2>
                <p className="text-[16px] text-white/60">브리핑부터 성과 리포트까지 체계적으로 진행합니다.</p>
              </div>
              {/* 데스크톱: 5열 스텝 */}
              <div className="hidden sm:grid sm:grid-cols-5 gap-4">
                {PROCESS.map((p, i) => (
                  <div key={p.step} className="flex flex-col items-center text-center relative">
                    <div className="h-12 w-12 rounded-full flex items-center justify-center mb-3 font-extrabold text-[16px] bg-white text-[#0D3473]">
                      {p.step}
                    </div>
                    {i < PROCESS.length - 1 && (
                      <div className="absolute top-6 left-[calc(50%+24px)] right-0 h-px bg-white/25" />
                    )}
                    <p className="text-[15px] font-extrabold text-white mb-1.5">{p.title}</p>
                    <p className="text-[12px] text-white/60 leading-relaxed">{p.desc}</p>
                  </div>
                ))}
              </div>
              {/* 모바일: 세로 타임라인 (컴팩트) */}
              <div className="sm:hidden space-y-4">
                {PROCESS.map((p, i) => (
                  <div key={p.step} className="flex items-start gap-3.5">
                    <div className="relative flex flex-col items-center shrink-0">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center font-extrabold text-[15px] bg-white text-[#0D3473] z-10">
                        {p.step}
                      </div>
                      {i < PROCESS.length - 1 && (
                        <div className="absolute top-10 w-px h-[calc(100%-1rem)] bg-white/25" />
                      )}
                    </div>
                    <div className="min-w-0 pt-1.5">
                      <p className="text-[15px] font-extrabold text-white mb-1">{p.title}</p>
                      <p className="text-[13px] text-white/60 leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ══ FAQ (white) ══ */}
          <div className="bg-white rounded-2xl border border-brand-border px-5 py-8 md:px-10 md:py-12">
            <div className="max-w-2xl mx-auto">
              <p className="text-[12px] font-extrabold text-brand-muted uppercase tracking-widest text-center mb-3">FAQ</p>
              <h2 className="text-[23px] md:text-[31px] font-extrabold text-brand-dark text-center mb-8">자주 묻는 질문</h2>
              <div className="space-y-2">
                {FAQS.map((faq, i) => (
                  <div key={i} className="border border-brand-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-brand-lighter transition-colors cursor-pointer"
                    >
                      <span className="text-[16px] font-semibold text-brand-dark pr-4">{faq.q}</span>
                      <svg className={`w-4 h-4 text-brand-muted shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-5 pt-3 text-[16px] text-brand-sub leading-relaxed border-t border-brand-border">
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

        {/* ── RIGHT: Fixed CTA 패널 (콘텐츠 우측 정렬 · 스크롤 고정) ── */}
        <div ref={railRef} className="hidden lg:block w-64 xl:w-72 shrink-0" />
        <div
          className="hidden lg:block fixed z-30 w-64 xl:w-72"
          style={{ left: railLeft, top: 92, maxHeight: "calc(100vh - 112px)", overflowY: "auto", visibility: railLeft == null ? "hidden" : "visible" }}
        >
          <div className="space-y-3 pb-3">

            {/* 메인 CTA 카드 */}
            <div className="rounded-2xl overflow-hidden relative" style={{ background: "linear-gradient(160deg,#1B3160 0%,#111D37 100%)" }}>
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 110%, rgba(46,107,224,0.18), transparent 60%)" }} />
              <div className="relative z-10 px-5 py-6 text-center">
                <p className="text-[11px] font-extrabold text-white/50 uppercase tracking-widest mb-2">지금 바로 시작하세요</p>
                <h2 className="text-[22px] font-extrabold text-white leading-snug mb-3">
                  네이버 카페 마케팅,<br />
                  전문가에게 맡기세요
                </h2>
                <p className="text-[12px] text-white/60 leading-relaxed mb-5">
                  무료 상담으로 업종·목표에 맞는 최적의 카페 침투 전략을 제안받으세요.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => alert("문의하기 연결 예정")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-extrabold cursor-pointer transition-all shadow-lg text-[#0D3473] bg-white hover:bg-white/90"
                  >
                    문의하기
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                  </button>
                  <button
                    onClick={() => alert("카카오 채널 연결 예정")}
                    className="w-full px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white/70 cursor-pointer hover:text-white transition-all"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)" }}
                  >
                    카카오 채널 상담
                  </button>
                </div>
              </div>
            </div>

            {/* 운영 현황 카드 */}
            <div className="bg-white rounded-2xl border border-brand-border p-4">
              <p className="text-[11px] font-extrabold text-brand-muted uppercase tracking-widest mb-2">운영 현황</p>
              {[
                { label: "보유 채널", value: "1,000+" },
                { label: "평균 게시글 조회수", value: "5만+" },
                { label: "평균 댓글 반응", value: "200+" },
                { label: "A/S 보장", value: "100%" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-brand-border last:border-0">
                  <span className="text-[12px] text-brand-sub">{s.label}</span>
                  <span className="text-[13px] font-extrabold text-brand-dark">{s.value}</span>
                </div>
              ))}
            </div>

            {/* 대행 포함 범위 카드 */}
            <div className="bg-brand-lighter rounded-2xl border border-brand-border p-4">
              <p className="text-[11px] font-extrabold text-brand-muted uppercase tracking-widest mb-2">포함 범위</p>
              <ul className="space-y-1.5">
                {["채널 선정 & 기획", "원고 작성 & 검토", "게시 & 반응 유도", "성과 리포트 제공"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[12px] text-brand-sub">
                    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: "#2E6BE0" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
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

      {/* 모바일 하단 고정 CTA */}
      <div className="lg:hidden fixed inset-x-0 bottom-[60px] md:bottom-0 z-40 bg-white border-t border-brand-border px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(17,29,55,0.10)]">
        <button
          onClick={() => alert("무료 상담 연결 예정")}
          className="w-full py-3.5 rounded-xl text-[16px] font-extrabold text-white flex items-center justify-center gap-2 active:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg,#1D3E7E,#0D3473)" }}
        >
          무료 상담 신청
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
        </button>
      </div>
    </>
  );
}
