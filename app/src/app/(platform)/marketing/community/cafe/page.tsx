"use client";

import { useState } from "react";
import {
  LandingShell,
  Reveal,
  CountUp,
  PillLink,
  CheckIcon,
  LIGHT,
  TINT,
  BLUE,
  BLUE_BG,
  NAVY,
  EYEBROW,
  EYEBROW_ON_DARK,
  LEAD,
  LEAD_ON_DARK,
  H2,
} from "@/components/marketing/landing";

/* ─────────────────────────────────────────
   히어로 폰 목업
───────────────────────────────────────── */
function NaverCafeHeroMockup() {
  return (
    <div className="relative flex justify-center items-end pb-6 select-none text-left">
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

      {/* 떠 있는 반응 카드 — 목업 속 인기글에서 일어나는 일 */}
      <div className="absolute -right-4 top-20 flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5 shadow-[0_18px_36px_-14px_rgba(7,15,73,.45)] sm:-right-16">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#03C75A]/12 text-[#03C75A]">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
        </span>
        <div>
          <p className="text-[10.5px] font-semibold text-brand-muted">새 댓글</p>
          <p className="text-[12.5px] font-extrabold text-brand-dark">저도 써봤는데 좋더라고요</p>
        </div>
      </div>
      <div className="absolute -left-4 bottom-24 flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5 shadow-[0_18px_36px_-14px_rgba(7,15,73,.45)] sm:-left-16">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-primary-50 text-brand-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" /></svg>
        </span>
        <div>
          <p className="text-[10.5px] font-semibold text-brand-muted">인기글 진입</p>
          <p className="text-[12.5px] font-extrabold text-brand-dark tabular-nums">조회 12,847</p>
        </div>
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
          <span className="whitespace-nowrap text-[11.5px] font-bold text-white/75">카페 게시글 등록</span>
        </div>
        <svg className="w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
        <div className="flex-1 text-center">
          <span className="whitespace-nowrap text-[11.5px] font-bold text-white">브랜드명 검색 시 노출</span>
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
    tags: ["카테고리별 채널", "타겟 매칭"],
    color: "text-[#2452EB]", bg: "bg-blue-50",
  },
  {
    icon: "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z",
    title: "직접 기획·관리·실행",
    desc: "외주나 재판매 없이 100% 직접 진행합니다. 명확한 가이드라인 기반의 체계적·전문적 업무 프로세스로 신뢰를 드립니다.",
    tags: ["외주 0%", "가이드라인 기반"],
    color: "text-blue-600", bg: "bg-blue-50",
  },
  {
    icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
    title: "실시간 성과 리포트",
    desc: "광고주와 실시간 소통하며 조회수·댓글·반응 데이터를 주간 단위로 공유합니다. 투명하게 성과를 확인하실 수 있습니다.",
    tags: ["주간 리포트", "조회·댓글·반응"],
    color: "text-[#2452EB]", bg: "bg-blue-50",
  },
  {
    icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
    title: "100% A/S 보장",
    desc: "저희 측 과실 또는 판단 미스 시 100% A/S를 보장합니다. 안전하고 책임감 있는 마케팅을 약속드립니다.",
    tags: ["과실 시 재진행", "책임 마케팅"],
    color: "text-[#2452EB]", bg: "bg-blue-50",
  },
];

const PROCESS = [
  { step: "01", icon: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z", output: "전략 방향", title: "브리핑 & 목표 설정", desc: "업종·타겟·메시지·예산을 상담합니다. 어떤 반응을 이끌어낼지 전략 방향을 함께 결정합니다." },
  { step: "02", icon: "M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z", output: "기획안", title: "채널 선정 & 기획", desc: "1,000+ 채널 중 업종과 타겟에 최적화된 카페를 선정하고 게시글 유형 및 콘텐츠를 기획합니다." },
  { step: "03", icon: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10", output: "확정 원고", title: "원고 작성 & 검토", desc: "자연스럽고 신뢰감 있는 게시글을 작성하고 광고주 확인 후 수정·보완합니다." },
  { step: "04", icon: "M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46", output: "게시글 URL", title: "게시 & 확산", desc: "선정된 카페에 게시글을 등록하고 댓글 반응 유도를 통해 자연 확산을 촉진합니다." },
  { step: "05", icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6", output: "성과 리포트", title: "성과 리포트 제공", desc: "조회수·댓글수·반응 데이터를 정리한 성과 리포트를 제공하고 다음 캠페인 방향을 제안합니다." },
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
/* 게시글 유형 5종 — 문구는 그대로 두고 밴드 문법에만 얹는다 */
const TYPES = [
  {
    no: "1",
    tag: "핫딜 정보형",
    head: ["가격 정보로", "구매 욕구를 자극하세요"],
    lead: "핫딜·특가·한정 이벤트 정보를 카페에 자연스럽게 공유합니다. 「광고 같지 않은」 정보성 게시글로 구매 전환을 이끌어냅니다.",
    points: ["구매 의도가 높은 사용자 집중 도달", "정보 공유형 자연스러운 문체", "구매 링크·이벤트 페이지 연동", "댓글 반응 유도로 신뢰도 증폭"],
  },
  {
    no: "2",
    tag: "리뷰형",
    head: ["실사용자 후기처럼", "신뢰를 쌓으세요"],
    lead: "실제 경험담처럼 작성한 리뷰형 게시글로 높은 신뢰도를 형성합니다. 구매 전 검색하는 사용자에게 결정적 영향을 미칩니다.",
    points: ["실사용 경험 기반의 자연스러운 후기", "장단점 균형 있는 신뢰감 있는 작성", "사진·이미지 첨부로 생동감 추가", "스타 평점 포함 구매 심리 자극"],
  },
  {
    no: "3",
    tag: "자유·질답형",
    head: ["자연스러운 대화 속", "브랜드를 심으세요"],
    lead: "질문→답변 형태로 브랜드를 자연스럽게 언급합니다. 실제 회원들의 추천처럼 보이기 때문에 전환 효과가 탁월합니다.",
    points: ["질문 게시글 + 베스트 댓글 구성", "실제 회원 추천처럼 보이는 자연스러운 작성", "경쟁 브랜드 대비 우위 표현", "커뮤니티 내 바이럴 확산 유도"],
  },
  {
    no: "4",
    tag: "콘텐츠 기획형",
    head: ["정보로 신뢰를 쌓고", "브랜드를 각인시키세요"],
    lead: "업종 관련 유익한 정보글로 카페 내 신뢰도를 구축합니다. 지속 반복 노출을 통해 잠재 고객의 뇌리에 브랜드를 남깁니다.",
    points: ["정보성 고품질 롱폼 콘텐츠 작성", "업종 전문성 어필로 신뢰도 구축", "지속적 반복 노출로 브랜드 인지도 향상", "카페 내 「유익한 글」 상위 노출 유도"],
  },
  {
    no: "5",
    tag: "노출형",
    head: ["브랜드명 검색 시", "긍정 게시글이 보이게"],
    lead: "별도의 클린 작업 없이 반영구적으로 유지되는 게시글 형식입니다. 브랜드명을 검색했을 때 긍정적인 포스팅과 댓글이 먼저 보이는 것을 목표로 합니다.",
    points: ["반영구 유지 상품", "브랜드명 검색 결과 점유", "긍정 포스팅·댓글 동시 노출"],
    note: "채널 지정이 불가하며, 게시글 유지를 위해 비교적 규제가 심하지 않은 채널로 진행됩니다. 카페 운영자 측 삭제 게시글(12시간 이내)은 1회에 한해 A/S 가능합니다.",
  },
];

/* 히어로 지표 — 운영팀이 넘긴 값을 그대로 적는다 */
const HERO_STATS = [
  { label: "운영 채널", value: 1000, unit: "개+" },
  { label: "평균 조회수", value: 5, unit: "만+" },
  { label: "A/S 보장", value: 100, unit: "%" },
];

/** 목업 무대 — 블루 면 위에 흰 카드가 떠 있게. 레일·그래프와 같은 문법 */
function MockupStage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[22px] px-5 py-10 md:min-h-[480px] md:px-8"
      style={{ background: "var(--gradient-point)" }}
    >
      <div className="relative flex w-full justify-center text-left drop-shadow-[0_24px_40px_rgba(7,15,73,.35)]">{children}</div>
    </div>
  );
}

/** 게시글 유형 5종 — 길게 다섯 밴드를 늘어놓는 대신 탭 달린 카드 한 장으로 */
function TypeTabs() {
  const [idx, setIdx] = useState(0);
  const t = TYPES[idx];
  const mockups = [<HotDealCard key="h" />, <ReviewCard key="r" />, <QACard key="q" />, <ContentCard key="c" />, <ExposureMockup key="e" />];
  const go = (d: number) => setIdx((i) => (i + d + TYPES.length) % TYPES.length);

  return (
    <section id="types" className={TINT}>
      <div className="relative">
        <Reveal>
          <div className="text-center">
            <p className={EYEBROW}>Post types</p>
            <h2 className={`${H2} mt-4 text-brand-dark`}>
              카페 게시글,
              <br />
              <span className="text-brand-primary">목적에 따라 다섯 가지로</span>
            </h2>
            <p className={LEAD}>구매 전환·신뢰 형성·검색 노출까지, 목표에 맞는 유형을 골라 진행합니다.</p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-12 overflow-hidden rounded-[28px] border border-brand-border bg-white shadow-[0_30px_60px_-36px_rgba(15,23,42,.35)]">
            {/* 탭 머리 — 카드 윗변에 붙인 다섯 칸. 좁은 폭에서는 가로로 밀어서 본다 */}
            <div className="overflow-x-auto border-b border-brand-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div role="tablist" className="grid min-w-[560px] grid-cols-5">
                {TYPES.map((ty, i) => {
                  const on = i === idx;
                  return (
                    <button
                      key={ty.tag}
                      role="tab"
                      type="button"
                      aria-selected={on}
                      onClick={() => setIdx(i)}
                      className={`relative cursor-pointer px-3 py-4 text-center transition-colors ${
                        on ? "bg-brand-primary-50/50" : "hover:bg-brand-lighter"
                      } ${i > 0 ? "border-l border-brand-border" : ""}`}
                    >
                      <span className={`block text-[11px] font-extrabold tracking-wider tabular-nums ${on ? "text-brand-primary" : "text-brand-muted"}`}>
                        TYPE {ty.no.padStart(2, "0")}
                      </span>
                      <span className={`mt-1 block whitespace-nowrap text-[14.5px] font-extrabold ${on ? "text-brand-dark" : "text-brand-sub"}`}>{ty.tag}</span>
                      <span
                        className={`absolute inset-x-0 bottom-0 h-[3px] origin-center transition-transform duration-300 ${on ? "scale-x-100" : "scale-x-0"}`}
                        style={{ background: "var(--gradient-point)" }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 패널 — 탭이 바뀔 때마다 다시 그려 페이드로 들어온다 */}
            <div key={idx} role="tabpanel" className="animate-be-fade grid gap-2 p-2 md:grid-cols-2 md:p-2.5">
              <div className="relative flex flex-col px-4 pb-4 pt-6 text-left md:px-7 md:pb-6 md:pt-8">
                <h3 className="relative mt-2 text-[26px] font-extrabold leading-[1.3] tracking-tight text-brand-dark break-keep md:text-[30px]">
                  {t.head[0]}
                  <br />
                  <span className="text-brand-primary">{t.head[1]}</span>
                </h3>
                <p className="mt-4 text-[14.5px] leading-relaxed text-brand-sub break-keep md:text-[15.5px]">{t.lead}</p>

                <ul className="mt-6 divide-y divide-brand-border rounded-2xl bg-brand-lighter px-4">
                  {t.points.map((pt) => (
                    <li key={pt} className="flex items-center gap-3 py-3 text-[14px] font-semibold text-brand-dark break-keep">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white">
                        <CheckIcon className="h-2.5 w-2.5" />
                      </span>
                      {pt}
                    </li>
                  ))}
                </ul>

                {t.note && (
                  /* 조건이 붙는 상품이다. 작게라도 같은 자리에 적어 둔다. */
                  <p className="mt-3 flex gap-2 text-[12.5px] leading-relaxed text-brand-muted break-keep">
                    <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                    {t.note}
                  </p>
                )}

                {/* 이전·다음 + 진행 막대 */}
                <div className="mt-auto flex items-center gap-4 pt-7">
                  <div className="flex gap-1.5">
                    {[-1, 1].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => go(d)}
                        aria-label={d < 0 ? "이전 유형" : "다음 유형"}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-brand-border text-brand-sub transition-colors hover:border-brand-primary hover:bg-brand-primary hover:text-white"
                      >
                        <svg className={`h-4 w-4 ${d < 0 ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-1 gap-1.5">
                    {TYPES.map((ty, i) => (
                      <span key={ty.tag} className={`h-1 flex-1 rounded-full transition-colors ${i <= idx ? "bg-brand-primary" : "bg-brand-border"}`} />
                    ))}
                  </div>
                  <span className="text-[13px] font-extrabold text-brand-dark tabular-nums">
                    {t.no.padStart(2, "0")}
                    <span className="font-semibold text-brand-muted"> / {String(TYPES.length).padStart(2, "0")}</span>
                  </span>
                </div>
              </div>

              <MockupStage>{mockups[idx]}</MockupStage>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function NaverCafePage() {
  // 한 번에 하나만 열리게 둔다 — 다 펼쳐 두면 질문 목록을 훑는 이점이 사라진다
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <LandingShell
      railTitle={
        <>
          네이버 카페 침투,
          <br />
          상담으로 시작
        </>
      }
    >
      {/* ── 1. 히어로 ── 흰 밴드 · 중앙 정렬, 아래는 블루 무대 위 폰 */}
      <section
        className={`${LIGHT} pb-0 md:pb-0`}
        style={{ backgroundImage: "radial-gradient(120% 90% at 50% -10%, rgba(36,82,235,.07), transparent 60%)" }}
      >
        <div className="relative text-center">
          <Reveal>
            <p className={EYEBROW}>Naver cafe</p>
            <h2 className={`${H2} mt-4 text-brand-dark`}>
              광고 같지 않은 진짜 입소문,
              <br />
              <span className="text-brand-primary">네이버 카페에서</span>
            </h2>
            <p className={LEAD}>
              1,000만 카페 회원에게 자연스럽게 도달해, 광고처럼 보이지 않는 진짜 입소문을 만들어 드립니다.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <dl className="mx-auto mt-10 grid max-w-[640px] grid-cols-3 gap-2.5 sm:gap-3">
              {HERO_STATS.map((st) => (
                <div key={st.label} className="rounded-2xl border border-brand-border bg-white px-2 py-4 text-center shadow-[0_10px_24px_-18px_rgba(15,23,42,.35)] sm:py-5">
                  <dt className="text-[12px] font-bold text-brand-sub break-keep sm:text-[13px]">{st.label}</dt>
                  <dd className="mt-2 text-[24px] font-extrabold leading-none tracking-tight text-brand-dark tabular-nums sm:text-[32px] md:text-[36px]">
                    <CountUp to={st.value} />
                    <span className="ml-0.5 align-baseline text-[13px] font-extrabold text-brand-primary sm:text-[16px]">{st.unit}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {/* 폰 무대 — 블루 면이 밴드 바닥까지 내려와 다음 섹션과 이어진다 */}
          <Reveal delay={220}>
            <div className="relative mx-auto mt-12 max-w-[680px]">
              <div
                className="absolute inset-x-0 bottom-0 top-24 overflow-hidden rounded-t-[36px]"
                style={{ background: "var(--gradient-point)" }}
              >
              </div>
              <div className="relative flex justify-center">
                <NaverCafeHeroMockup />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 2. 게시글 유형 5종 ── 연회색 밴드 · 탭 */}
      <TypeTabs />

      {/* ── 3. 차별화 강점 ── 네이비 밴드 */}
      <section className={BLUE} style={{ background: NAVY }}>
        <div className="relative text-center">
          <Reveal>
            <p className={EYEBROW_ON_DARK}>Why us</p>
            <h2 className={`${H2} mt-4 text-white`}>
              맡기실 만한 이유가
              <br />
              <span className="text-[#8FB0FF]">네 가지 있습니다</span>
            </h2>
            <p className={LEAD_ON_DARK}>재판매나 외주 없이, 채널 선정부터 원고·게시·리포트까지 저희가 직접 합니다.</p>
          </Reveal>

          <div className="mt-12 grid gap-4 text-left sm:grid-cols-2">
            {STRENGTHS.map((st, i) => (
              <Reveal key={st.title} delay={i * 90} className="h-full">
                <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-white/[0.10] to-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,.6)] md:p-8">
                  {/* 상단 하이라이트 라인 + 호버 글로우 */}
                  <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#8FB0FF]/70 to-transparent" />
                  <span className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#4F7BFF]/25 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
                  {/* 배경 인덱스 넘버 */}
                  <span className="pointer-events-none absolute right-5 top-3 select-none text-[64px] font-black leading-none tracking-tighter text-white/[0.06] tabular-nums md:text-[76px]">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-primary shadow-[0_10px_24px_-8px_rgba(79,123,255,.55)] ring-4 ring-white/10 transition-transform duration-300 group-hover:scale-105">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={st.icon} />
                    </svg>
                  </div>
                  <h3 className="relative mt-6 text-[19px] font-extrabold leading-snug tracking-tight text-white break-keep md:text-[20px]">{st.title}</h3>
                  <p className="relative mb-6 mt-2.5 text-[14px] leading-relaxed text-white/65 break-keep">{st.desc}</p>

                  <div className="relative mt-auto flex flex-wrap gap-1.5 border-t border-white/10 pt-5">
                    {st.tags.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 rounded-full bg-white/[0.08] px-2.5 py-1 text-[12px] font-semibold text-[#C9D8FF] ring-1 ring-inset ring-white/10">
                        <svg className="h-3 w-3 text-[#8FB0FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. 진행 프로세스 ── 블루 밴드 */}
      <section className={BLUE} style={{ background: BLUE_BG }}>
        <div className="relative text-center">
          <Reveal>
            <p className={EYEBROW_ON_DARK}>How it works</p>
            <h2 className={`${H2} mt-4 text-white`}>브리핑부터 리포트까지</h2>
            <p className={LEAD_ON_DARK}>어떤 반응을 만들지부터 같이 정하고 시작합니다.</p>
          </Reveal>

          {/* 데스크톱: 레일 위 스텝 노드 + 카드 */}
          <div className="relative mt-14 hidden sm:block">
            <div className="pointer-events-none absolute left-[10%] right-[10%] top-[22px] h-[2px] rounded-full bg-gradient-to-r from-white/15 via-white/45 to-white/80" />
            <div className="grid grid-cols-5 gap-3 lg:gap-4">
              {PROCESS.map((pr, i) => {
                const last = i === PROCESS.length - 1;
                return (
                  <Reveal key={pr.step} delay={i * 90} className="h-full">
                    <div className="group flex h-full flex-col items-center">
                      <span
                        className={`relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[13px] font-extrabold text-brand-primary tabular-nums shadow-[0_8px_18px_-6px_rgba(7,15,73,.6)] ring-[6px] transition-transform duration-300 group-hover:scale-110 ${
                          last ? "ring-white/30" : "ring-white/10"
                        }`}
                      >
                        {pr.step}
                      </span>
                      <span className="h-4 w-px bg-white/30" />
                      <div
                        className={`flex w-full flex-1 flex-col items-center rounded-2xl border p-4 text-center backdrop-blur-sm transition-all duration-300 group-hover:-translate-y-1 lg:p-5 ${
                          last
                            ? "border-white/40 bg-white/[0.18] shadow-[0_20px_40px_-20px_rgba(7,15,73,.7)]"
                            : "border-white/15 bg-white/[0.08] group-hover:border-white/30 group-hover:bg-white/[0.12]"
                        }`}
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-inset ring-white/20">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={pr.icon} />
                          </svg>
                        </span>
                        <p className="mt-3.5 text-[15px] font-extrabold leading-snug text-white break-keep">{pr.title}</p>
                        <p className="mb-4 mt-1.5 text-[12.5px] leading-relaxed text-white/65 break-keep">{pr.desc}</p>
                        <span
                          className={`mt-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-bold break-keep ${
                            last ? "bg-white text-brand-primary" : "bg-white/10 text-white/85 ring-1 ring-inset ring-white/15"
                          }`}
                        >
                          <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                          {pr.output}
                        </span>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>

          {/* 모바일: 세로 타임라인 */}
          <div className="mt-10 space-y-3 text-left sm:hidden">
            {PROCESS.map((pr, i) => (
              <div key={pr.step} className="flex items-stretch gap-3.5">
                <div className="relative flex shrink-0 flex-col items-center">
                  <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[13px] font-extrabold text-brand-primary tabular-nums ring-4 ring-white/10">
                    {pr.step}
                  </div>
                  {i < PROCESS.length - 1 && <div className="-mb-3 w-px flex-1 bg-gradient-to-b from-white/40 to-white/10" />}
                </div>
                <div className="min-w-0 flex-1 rounded-2xl border border-white/15 bg-white/[0.08] p-4">
                  <p className="text-[15px] font-extrabold text-white break-keep">{pr.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-white/65 break-keep">{pr.desc}</p>
                  <span className="mt-3 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[11.5px] font-bold text-white/85 ring-1 ring-inset ring-white/15">
                    {pr.output}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. FAQ ── 그레이 밴드 */}
      <section className={TINT}>
        <div className="relative">
          <Reveal>
            <p className={`${EYEBROW} text-center`}>FAQ</p>
            <h2 className={`${H2} mt-4 text-center text-brand-dark`}>자주 묻는 질문</h2>
          </Reveal>

          <div className="mx-auto mt-12 max-w-[720px] space-y-2.5">
            {FAQS.map((faq, i) => {
              const open = openFaq === i;
              return (
                <Reveal key={faq.q} delay={i * 60}>
                  <div className={`overflow-hidden rounded-2xl border bg-white transition-colors ${open ? "border-brand-primary/30" : "border-brand-border"}`}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                      className="flex w-full cursor-pointer items-center gap-3.5 px-5 py-5 text-left md:px-6"
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[13px] font-black transition-colors ${
                          open ? "bg-brand-primary text-white" : "bg-brand-primary-50 text-brand-primary"
                        }`}
                      >
                        Q
                      </span>
                      <span className="flex-1 text-[15.5px] font-bold text-brand-dark break-keep md:text-[16.5px]">{faq.q}</span>
                      <svg
                        className={`h-5 w-5 shrink-0 text-brand-muted transition-transform duration-200 ${open ? "rotate-180 text-brand-primary" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {open && (
                      <p className="animate-be-fade border-t border-brand-border px-5 py-5 pl-[62px] text-[14.5px] leading-relaxed text-brand-sub break-keep md:px-6 md:pl-[66px]">
                        {faq.a}
                      </p>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 6. 마무리 ── 흰 밴드 */}
      <section className={LIGHT}>
        <div className="relative text-center">
          <Reveal>
            <h2 className={`${H2} text-brand-dark`}>
              어떤 이야기를 퍼뜨릴지,
              <br />
              <span className="text-brand-primary">같이 정해볼까요?</span>
            </h2>
            <p className={LEAD}>업종·타겟·예산을 말씀해 주시면 어떤 카페에 어떤 글이 맞을지 제안드립니다.</p>
            <div className="mt-9">
              <PillLink>상담 문의하기</PillLink>
            </div>
          </Reveal>
        </div>
      </section>
    </LandingShell>
  );
}
