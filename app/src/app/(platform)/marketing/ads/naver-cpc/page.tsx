"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { POLICY } from "@/lib/policy";
import {
  LandingShell,
  Reveal,
  CountUp,
  PillLink,
  CheckIcon,
  ChatIcon,
  ArrowIcon,
  CONSULT_HREF,
  SEC,
  LIGHT,
  TINT,
  BLUE,
  POINT_BG,
  EYEBROW,
  EYEBROW_ON_DARK,
  LEAD,
  LEAD_ON_DARK,
  H2,
} from "@/components/marketing/landing";

/* ─────────────────────────────────────────
   아이폰 목업 — 시안(네이버 앱으로 검색한 아이폰을 비스듬히 놓은 사진) 기준.
   화면은 실제 아이폰 크기(375×812pt)로 그린 뒤 통째로 줄인다. 그래야 글자·간격이
   실제 앱과 같은 비율로 보인다(작은 글자로 흉내 내면 장난감처럼 보인다).
───────────────────────────────────────── */
const SCREEN_W = 375;
const SCREEN_H = 812;
const SCALE = 0.56;

function IPhoneFrame({ children }: { children: ReactNode }) {
  const w = SCREEN_W * SCALE;
  const h = SCREEN_H * SCALE;
  return (
    <div className="shrink-0 [perspective:1600px]" aria-hidden>
      <div
        className="relative [transform-style:preserve-3d]"
        style={{ transform: "rotateY(-18deg) rotateX(7deg) rotateZ(8deg)" }}
      >
        {/* 측면 버튼 — 왼쪽: 동작 버튼·음량 두 개, 오른쪽: 측면 버튼 */}
        <span className="absolute -left-[3px] top-[92px] h-[20px] w-[4px] rounded-l-[3px] bg-[#2b2d32]" />
        <span className="absolute -left-[3px] top-[128px] h-[38px] w-[4px] rounded-l-[3px] bg-[#2b2d32]" />
        <span className="absolute -left-[3px] top-[174px] h-[38px] w-[4px] rounded-l-[3px] bg-[#2b2d32]" />
        <span className="absolute -right-[3px] top-[142px] h-[58px] w-[4px] rounded-r-[3px] bg-[#1d1f23]" />

        {/* 블랙 티타늄 몸체 — 오른쪽·아래 두께는 겹친 그림자로 */}
        <div
          className="rounded-[44px] p-[3px] shadow-[3px_4px_0_0_#18191c,4px_6px_0_0_#0f1012,22px_36px_48px_-12px_rgba(17,29,55,.4)]"
          style={{ background: "linear-gradient(150deg,#74787f 0%,#2f3136 18%,#141518 50%,#2c2e33 80%,#62666d 100%)" }}
        >
          {/* 베젤 */}
          <div className="rounded-[41px] bg-black p-[7px]">
            {/* 화면 */}
            <div className="relative overflow-hidden rounded-[34px] bg-white" style={{ width: w, height: h }}>
              <div
                className="absolute left-0 top-0 flex flex-col bg-white"
                style={{ width: SCREEN_W, height: SCREEN_H, transform: `scale(${SCALE})`, transformOrigin: "top left" }}
              >
                <StatusBar />
                <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
                <NaverToolbar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 상태바 — 시각·위치 표시 · 다이내믹 아일랜드 · 신호·와이파이·저전력 배터리 */
function StatusBar() {
  return (
    <div className="relative flex h-[54px] shrink-0 items-center justify-between px-[30px] pt-[6px] text-[16px] font-semibold text-black">
      <span className="flex items-center gap-[5px] tabular-nums">
        1:28
        <svg width="15" height="15" viewBox="0 0 12 12"><circle cx="6" cy="6" r="6" fill="#2F7BF6" /><path d="M8.6 3.4L3.3 5.6l2.3.7.7 2.3z" fill="#fff" /></svg>
      </span>
      <span className="absolute left-1/2 top-[11px] h-[35px] w-[122px] -translate-x-1/2 rounded-full bg-black" />
      <span className="flex items-center gap-[6px]">
        <svg width="18" height="12" viewBox="0 0 17 10" fill="currentColor">
          <rect x="0" y="7" width="3" height="3" rx=".7" />
          <rect x="4.5" y="5" width="3" height="5" rx=".7" />
          <rect x="9" y="2.5" width="3" height="7.5" rx=".7" />
          <rect x="13.5" y="0" width="3" height="10" rx=".7" />
        </svg>
        <svg width="17" height="12" viewBox="0 0 16 11" fill="currentColor">
          <path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.1-1.2A10.2 10.2 0 008 .5 10.2 10.2 0 00.9 3.4L2 4.6a8.5 8.5 0 016-2.4z" />
          <path d="M8 5.6c1.4 0 2.6.5 3.6 1.4l1.1-1.2A6.8 6.8 0 008 3.9a6.8 6.8 0 00-4.7 1.9l1.1 1.2c1-.9 2.2-1.4 3.6-1.4z" />
          <path d="M8 9.1l2.2-2.3a3.2 3.2 0 00-4.4 0L8 9.1z" />
        </svg>
        <span className="inline-flex h-[14px] min-w-[27px] items-center justify-center rounded-[4px] bg-[#FFD60A] px-[3px] text-[11px] font-bold leading-none text-black">71</span>
      </span>
    </div>
  );
}

/** 네이버 앱 하단 툴바 + 홈 인디케이터 */
function NaverToolbar() {
  return (
    <div className="shrink-0 border-t border-[#eceef1] bg-white">
      <div className="flex items-center justify-between px-[26px] pt-[12px] text-[#222]">
        <span className="flex h-[24px] w-[24px] items-center justify-center rounded-[5px] border-[2px] border-[#222] text-[12px] font-black leading-none">N</span>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c3c7ce" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 12a8 8 0 11-2.3-5.7M20 4v5h-5" /></svg>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M4 9h16M4 15h16" /></svg>
      </div>
      <div className="flex justify-center pb-[8px] pt-[18px]">
        <span className="h-[5px] w-[134px] rounded-full bg-black" />
      </div>
    </div>
  );
}

/** 네이버 앱 검색 헤더 — 회색 알약(초록 N · 검색어 · 지우기 · 초록 마이크) + 탭 줄 */
function NaverSearchHeader({ query, tabs, active }: { query: string; tabs: string[]; active?: string }) {
  return (
    <div className="shrink-0 bg-white">
      <div className="px-[16px] pt-[6px]">
        <div className="flex items-center gap-[10px] rounded-full bg-[#F1F3F5] px-[16px] py-[11px]">
          <span className="text-[22px] font-black leading-none text-[#03C75A]">N</span>
          <span className="flex-1 truncate text-[17px] font-bold text-black">{query}</span>
          <span className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#9EA4AC] text-[13px] font-bold leading-none text-white">×</span>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#03C75A" strokeWidth={2.2} strokeLinecap="round">
            <rect x="9" y="3" width="6" height="11" rx="3" />
            <path d="M5 11a7 7 0 0014 0M12 18v3" />
          </svg>
        </div>
      </div>
      <div className="flex gap-[18px] overflow-hidden whitespace-nowrap border-b border-[#eceef1] px-[18px] pt-[12px] text-[15px] text-[#555]">
        {tabs.map((t) => (
          <span
            key={t}
            className={`relative pb-[10px] ${t === active ? "font-bold text-black after:absolute after:inset-x-0 after:bottom-0 after:h-[2.5px] after:rounded-full after:bg-black" : ""}`}
          >
            {t === "AI" ? (
              <span className="relative">
                AI
                <span className="absolute -right-[9px] -top-[4px] h-[12px] w-[12px] rounded-full bg-[#FF3B30] text-center text-[8px] font-bold leading-[12px] text-white">N</span>
              </span>
            ) : (
              t
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

const AdTag = () => (
  <span className="rounded-[4px] border border-[#cfd3d8] px-[5px] py-[1px] text-[11px] leading-none text-[#888]">광고</span>
);

/* ─────────────────────────────────────────
   목업 화면 4종 — 파워링크 · 쇼핑검색 · 브랜드검색 · 파워콘텐츠
───────────────────────────────────────── */
function PowerlinkMockup() {
  const ads = [
    { site: "bluesmile-dental.co.kr", title: "강남 임플란트, 1:1 맞춤 상담", desc: "보건복지부 인증 · 야간진료 · 무료 CT 촬영 이벤트 진행 중", ext: ["예약", "오시는 길", "진료시간"] },
    { site: "gn-implant.com", title: "강남역 3분 · 당일 임플란트", desc: "20년 경력 원장 직접 진료. 첫 방문 상담 무료", ext: ["상담신청", "이벤트"] },
    { site: "smileline.kr", title: "강남 치과 추천 · 수면 임플란트", desc: "통증 걱정 없는 수면 진료, 주말 진료 가능", ext: [] },
    { site: "yes-dental.kr", title: "임플란트 전문의 · 사후관리 10년", desc: "정기 검진·스케일링 무료, 분할 결제 가능", ext: ["후기", "가격표"] },
  ];
  return (
    <IPhoneFrame>
      <NaverSearchHeader query="강남 임플란트" tabs={["AI", "블로그", "카페", "클립", "이미지", "지식iN", "동영상"]} />
      <div className="h-full bg-[#F4F5F7] px-[12px] pt-[12px]">
        <div className="mb-[8px] flex items-center justify-between px-[4px] text-[13px] text-[#777]">
          <span>
            <b className="font-bold text-[#03C75A]">파워링크</b> ‘강남 임플란트’ 관련 광고
          </span>
          <span>등록 안내</span>
        </div>
        <div className="space-y-[8px]">
          {ads.map((a, i) => (
            <div key={a.site} className={`rounded-[14px] bg-white p-[14px] ${i === 0 ? "ring-2 ring-[#03C75A]/70" : ""}`}>
              <div className="mb-[6px] flex items-center gap-[6px] text-[13px] text-[#1E8F3E]">
                {a.site} <AdTag />
              </div>
              <p className="text-[17px] font-bold leading-snug text-[#0B3FC1]">{a.title}</p>
              <p className="mt-[4px] text-[14px] leading-snug text-[#555]">{a.desc}</p>
              {a.ext.length > 0 && (
                <div className="mt-[10px] flex gap-[6px]">
                  {a.ext.map((e) => (
                    <span key={e} className="rounded-full border border-[#e3e6ea] px-[10px] py-[4px] text-[13px] text-[#333]">{e}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </IPhoneFrame>
  );
}

/** 운동화 아이콘 — 쇼핑 시각 자료의 상품 이미지 자리 */
function ShoeIcon({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
      <path d="M6 44c10 0 18-4 24-14l6 2c4 10 12 12 22 12v6H6z" fill="#fff" stroke="#9aa3ae" strokeWidth="2" strokeLinejoin="round" />
      <path d="M6 50h52" stroke="#9aa3ae" strokeWidth="3" strokeLinecap="round" />
      <path d="M22 36l3 3M27 32l3 3" stroke="#c3c9d1" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** 쇼핑검색 — 폰 목업 대신 상품 카드를 띄워 「이미지·가격이 함께 보인다」를 바로 보여 준다 */
function ShoppingVisual() {
  return (
    <div className="relative h-[470px] w-full max-w-[400px]" aria-hidden>
      {/* 뒤 카드 두 장 — 검색 결과가 이어진다는 느낌만 */}
      <div className="absolute left-[4%] top-[70px] w-[46%] -rotate-[8deg] rounded-2xl bg-white p-3 opacity-80 shadow-[0_12px_28px_-12px_rgba(17,29,55,.25)]">
        <div className="flex h-[92px] items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg,#f3ede6,#e6dccf)" }}><ShoeIcon size={52} /></div>
        <p className="mt-2 truncate text-[12px] text-brand-sub">발편한 워킹화 메쉬</p>
        <p className="text-[15px] font-extrabold text-brand-dark">59,900<span className="text-[11px] font-medium">원</span></p>
      </div>
      <div className="absolute right-[2%] top-[36px] w-[44%] rotate-[7deg] rounded-2xl bg-white p-3 opacity-80 shadow-[0_12px_28px_-12px_rgba(17,29,55,.25)]">
        <div className="flex h-[92px] items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg,#e7ecf5,#d5dcea)" }}><ShoeIcon size={52} /></div>
        <p className="mt-2 truncate text-[12px] text-brand-sub">쿠셔닝 런닝화 블랙</p>
        <p className="text-[15px] font-extrabold text-brand-dark">72,000<span className="text-[11px] font-medium">원</span></p>
      </div>

      {/* 주인공 카드 — 광고 상품 */}
      <div className="absolute left-1/2 top-[96px] w-[62%] -translate-x-1/2 rounded-[22px] bg-white p-4 shadow-[0_28px_56px_-18px_rgba(17,29,55,.4)] ring-1 ring-black/[0.04]">
        <div className="relative flex h-[150px] items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg,#eef1f5,#dfe4ea)" }}>
          <ShoeIcon size={96} />
          <span className="absolute left-2.5 top-2.5 rounded-md bg-white/90 px-1.5 py-0.5 text-[11px] font-bold text-brand-sub">광고</span>
          <span className="absolute right-2.5 top-2.5 rounded-full bg-[#03C75A] px-2 py-0.5 text-[11px] font-extrabold text-white">N pay</span>
        </div>
        <p className="mt-3 line-clamp-2 text-[14px] font-semibold leading-snug text-brand-dark">편한 러닝화 에어쿠션 클래식 화이트</p>
        <p className="mt-1 text-[22px] font-extrabold tracking-tight text-brand-dark tabular-nums">
          89,000<span className="ml-0.5 text-[14px] font-bold">원</span>
        </p>
        <div className="mt-1 flex items-center gap-1.5 text-[12px] text-brand-muted">
          <span className="font-bold text-[#FF6B00]">★ 4.8</span>
          <span>리뷰 2,314</span>
          <span>· 스포츠몰</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          <span className="rounded-lg bg-brand-lighter py-1.5 text-center text-[12px] font-bold text-brand-sub">무료배송</span>
          <span className="rounded-lg bg-brand-primary-50 py-1.5 text-center text-[12px] font-bold text-brand-primary">구매하기</span>
        </div>
      </div>

      {/* 떠 있는 라벨 */}
      <div className="absolute left-0 top-[20px] flex items-center gap-2 rounded-full bg-white px-3.5 py-2 shadow-[0_10px_24px_-10px_rgba(17,29,55,.3)]">
        <span className="h-2 w-2 rounded-full bg-[#03C75A]" />
        <span className="text-[13px] font-extrabold text-brand-dark">쇼핑검색 상단 노출</span>
      </div>
      <div className="absolute bottom-0 right-[4%] rounded-2xl bg-white px-4 py-3 shadow-[0_14px_30px_-12px_rgba(17,29,55,.32)]">
        <p className="text-[11px] font-semibold text-brand-muted">한 번에 보이는 정보</p>
        <div className="mt-1.5 flex gap-1.5">
          {["이미지", "가격", "리뷰"].map((t) => (
            <span key={t} className="rounded-md px-2 py-1 text-[12px] font-extrabold text-white" style={{ background: "var(--gradient-point)" }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** 브랜드검색 — 폰 목업 대신 「검색하면 이 한 장이 결과 상단을 다 차지한다」를 카드로 보여 준다 */
function BrandVisual() {
  return (
    <div className="relative h-[430px] w-full max-w-[420px]" aria-hidden>
      {/* 검색창 — 무엇을 검색했는지 */}
      <div className="absolute left-1/2 top-[6px] z-10 flex w-[78%] -translate-x-1/2 items-center gap-2.5 rounded-full bg-white px-4 py-3 shadow-[0_14px_30px_-14px_rgba(17,29,55,.35)] ring-1 ring-black/[0.04]">
        <span className="text-[18px] font-black leading-none text-[#03C75A]">N</span>
        <span className="flex-1 text-[15px] font-bold text-brand-dark">블루에그</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#03C75A" strokeWidth={2.4} strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
      </div>

      {/* 브랜드검색 결과 카드 */}
      <div className="absolute left-1/2 top-[74px] w-[86%] -translate-x-1/2 overflow-hidden rounded-[24px] bg-white shadow-[0_30px_60px_-20px_rgba(17,29,55,.42)] ring-1 ring-black/[0.04]">
        <div className="relative h-[168px]" style={{ background: "var(--gradient-point)" }}>
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_85%_10%,rgba(255,255,255,.28),transparent_55%)]" />
          <span className="absolute right-3 top-3 rounded-md border border-white/50 px-1.5 py-0.5 text-[11px] text-white/85">광고</span>
          <div className="absolute bottom-5 left-5 text-white">
            <p className="text-[12px] font-semibold opacity-85">가을 시즌 한정</p>
            <p className="mt-1 text-[22px] font-extrabold leading-tight">신규 가입 첫 캠페인<br />최대 30% 할인</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-5 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary text-[16px] font-black text-white">B</span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-extrabold text-brand-dark">블루에그 공식 사이트</p>
            <p className="text-[12px] text-[#1E8F3E]">blueeggbiz.com</p>
          </div>
        </div>
        <div className="grid grid-cols-3 border-t border-brand-border text-center text-[13px] font-semibold text-brand-sub">
          {["서비스 소개", "요금 안내", "상담 신청"].map((t, i) => (
            <span key={t} className={`py-3 ${i > 0 ? "border-l border-brand-border" : ""}`}>{t}</span>
          ))}
        </div>
      </div>

      {/* 떠 있는 라벨 */}
      <div className="absolute -right-2 top-[130px] rounded-2xl bg-white px-4 py-3 shadow-[0_14px_30px_-12px_rgba(17,29,55,.32)]">
        <p className="text-[11px] font-semibold text-brand-muted">검색 결과 상단</p>
        <p className="mt-0.5 text-[20px] font-extrabold leading-none text-brand-primary">100% 독점</p>
      </div>
      <div className="absolute bottom-[8px] right-[2%] flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-[0_12px_26px_-12px_rgba(17,29,55,.3)]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E5484D" strokeWidth={2.4} strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" /></svg>
        <span className="text-[13px] font-extrabold text-brand-dark">경쟁사 광고 노출 없음</span>
      </div>
      <div className="absolute bottom-[8px] left-[4%] flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2.5 shadow-[0_12px_26px_-12px_rgba(17,29,55,.3)]">
        <span className="rounded-md px-1.5 py-0.5 text-[11px] font-extrabold text-white" style={{ background: "var(--gradient-point)" }}>이미지</span>
        <span className="rounded-md px-1.5 py-0.5 text-[11px] font-extrabold text-white" style={{ background: "var(--gradient-point)" }}>영상</span>
        <span className="text-[12px] font-bold text-brand-sub">소재 활용</span>
      </div>
    </div>
  );
}

function ContentMockup() {
  const posts = [
    { title: "강남 임플란트 비용, 병원 고르기 전 꼭 확인할 5가지", desc: "상담 전에 체크하면 좋은 항목과 실제 비용 구성까지 정리했어요.", brand: "블루스마일치과", bg: "linear-gradient(135deg,#dff1ea,#c5e6d8)" },
    { title: "임플란트 수술 후 관리법 총정리", desc: "시술 직후부터 한 달까지 단계별 관리 방법을 알려드려요.", brand: "스마일라인", bg: "linear-gradient(135deg,#e5ecfb,#cfdaf5)" },
    { title: "뼈이식 필요한 경우, 비용 차이는?", desc: "뼈이식이 필요한 상황과 추가 비용이 생기는 이유를 설명해요.", brand: "예스치과", bg: "linear-gradient(135deg,#f5eee4,#ebdcc8)" },
  ];
  return (
    <IPhoneFrame>
      <NaverSearchHeader query="임플란트 비용" tabs={["AI", "블로그", "카페", "클립", "이미지", "지식iN", "동영상"]} />
      <div className="h-full bg-[#F4F5F7] px-[12px] pt-[12px]">
        <div className="mb-[8px] px-[4px] text-[13px] text-[#777]">
          <b className="font-bold text-[#03C75A]">파워컨텐츠</b> ‘임플란트 비용’ 관련 광고
        </div>
        <div className="space-y-[8px]">
          {posts.map((p, i) => (
            <div key={p.title} className={`rounded-[14px] bg-white p-[14px] ${i === 0 ? "ring-2 ring-[#03C75A]/70" : ""}`}>
              <div className="flex gap-[12px]">
                <div className="min-w-0 flex-1">
                  <div className="mb-[6px] flex items-center gap-[6px] text-[13px] text-[#555]">
                    <span className="h-[18px] w-[18px] rounded-full bg-[#dfe3e8]" />
                    {p.brand} <AdTag />
                  </div>
                  <p className="text-[16px] font-bold leading-snug text-black">{p.title}</p>
                  <p className="mt-[4px] line-clamp-2 text-[13px] leading-snug text-[#666]">{p.desc}</p>
                </div>
                <div className="h-[78px] w-[78px] shrink-0 rounded-[10px]" style={{ background: p.bg }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </IPhoneFrame>
  );
}

/* ─────────────────────────────────────────
   품질지수 비교 목업
───────────────────────────────────────── */
/* 관리 전·후 품질지수 — 같은 0~10 척도의 네 항목을 세로 기둥 쌍으로 비교한다.
   관리 전은 회색(맥락), 관리 후는 포인트 블루(주인공). 값 글자는 글자색 토큰을 쓴다. */
const QS_ROWS = [
  { label: "광고 소재 관련성", before: 3, after: 9 },
  { label: "키워드 연관도", before: 4, after: 10 },
  { label: "랜딩페이지 품질", before: 2, after: 8 },
  { label: "클릭률(CTR)", before: 3, after: 9 },
];
const QS_STATS = [
  { label: "CPC 절감", value: "42%", dir: "down" as const },
  { label: "CTR 향상", value: "2.3배", dir: "up" as const },
  { label: "ROAS 개선", value: "38%", dir: "up" as const },
];

function QualityScoreMockup() {
  return (
    <div className="w-full select-none space-y-4 text-left">
      <div className="rounded-2xl border border-brand-border bg-gradient-to-b from-[#F6F8FC] to-white p-5 md:p-7">
        {/* 제목 + 범례 */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[14px] font-extrabold text-brand-dark">네이버 광고 품질지수 <span className="font-semibold text-brand-muted">(10점 만점)</span></p>
          <div className="flex items-center gap-3 text-[12px] font-semibold text-brand-sub">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-[#C9CFD8]" />관리 전</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-brand-primary" />관리 후</span>
          </div>
        </div>

        {/* 세로 막대 — 관리 전(회색 기둥) 뒤에 관리 후(블루 그라데이션 기둥)를 엇갈려 세우고,
            흰 카드가 기둥 위에 떠 있는 형태. 아래로 갈수록 바탕색으로 흐려진다. */}
        <ul className="grid h-[260px] grid-cols-4 gap-3 md:h-[340px] md:gap-6">
          {QS_ROWS.map((r, i) => (
            <li key={r.label} className="relative h-full">
              {/* 관리 전 */}
              <div
                className="absolute bottom-0 left-0 w-[46%] rounded-t-[10px] bg-gradient-to-b from-[#D5DAE2] to-[#D5DAE2]/0"
                style={{ height: `${r.before * 10}%` }}
              >
                <span className="absolute inset-x-0 top-2 text-center text-[11px] font-bold text-brand-sub tabular-nums md:top-3 md:text-[12px]">{r.before}</span>
              </div>
              {/* 관리 후 */}
              <div
                className="absolute bottom-0 right-0 w-[62%] rounded-t-[12px] bg-gradient-to-b from-brand-primary via-[#4C74FF]/80 to-[#4C74FF]/0 shadow-[0_-12px_30px_-18px_rgba(36,82,235,.6)]"
                style={{ height: `${r.after * 10}%` }}
              >
                <div className="px-2.5 pt-2.5 md:px-4 md:pt-4">
                  <p className="text-[18px] font-extrabold leading-none text-white tabular-nums md:text-[26px]">
                    {r.after}<span className="ml-0.5 text-[11px] font-bold text-white/70 md:text-[13px]">점</span>
                  </p>
                  <p className="mt-1.5 hidden text-[11.5px] font-semibold leading-snug text-white/75 md:block">관리 후</p>
                </div>
              </div>

              {/* 떠 있는 카드 — 좌우로 엇갈려 배치 */}
              <div
                className={`absolute z-10 hidden w-[132px] rounded-xl bg-white px-3.5 py-3 shadow-[0_14px_34px_-12px_rgba(15,23,42,.28)] md:block ${
                  i % 2 === 0 ? "-left-3" : "-right-3"
                }`}
                style={{ bottom: `${r.before * 10 + 6}%` }}
              >
                <p className="text-[12.5px] font-extrabold text-brand-dark break-keep">{r.label}</p>
                <p className="mt-1 flex items-center gap-1.5 text-[11.5px] font-semibold text-brand-muted tabular-nums">
                  {r.before}점 → {r.after}점
                  <span className="rounded-full bg-brand-primary-50 px-1.5 py-px text-[10.5px] font-extrabold text-brand-primary">+{r.after - r.before}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>

        {/* 항목명 — 모바일은 카드 대신 막대 아래에 */}
        <ul className="mt-3 grid grid-cols-4 gap-3 border-t border-brand-border pt-3 md:hidden">
          {QS_ROWS.map((r) => (
            <li key={r.label} className="text-center">
              <p className="text-[11.5px] font-bold leading-tight text-brand-dark break-keep">{r.label}</p>
              <span className="mt-1 inline-block rounded-full bg-brand-primary-50 px-1.5 py-px text-[10.5px] font-extrabold text-brand-primary tabular-nums">+{r.after - r.before}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 효과 수치 */}
      <div className="grid grid-cols-3 gap-2.5">
        {QS_STATS.map((s) => (
          <div key={s.label} className="rounded-2xl border border-brand-border bg-white px-3 py-4 text-center">
            <p className="text-[12px] font-semibold text-brand-sub">{s.label}</p>
            <p className="mt-1.5 flex items-center justify-center gap-1 text-[22px] font-extrabold leading-none text-brand-dark tabular-nums md:text-[26px]">
              <svg className={`h-5 w-5 ${s.dir === "down" ? "rotate-180" : ""} text-brand-primary`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-6 6m6-6l6 6" />
              </svg>
              {s.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const QUALITY_PILLARS = [
  {
    title: "광고 소재 CTR 최적화",
    desc: "클릭률(CTR)은 품질지수를 가르는 가장 큰 기준입니다. 업종·시즌·타깃에 맞춘 제목과 설명문을 A/B 테스트로 계속 다듬어, 더 많이 눌리는 광고로 만듭니다.",
    badge: "CTR ↑ 평균 2.3배",
    badgeColor: "bg-blue-50 text-[#2452EB] border-blue-100",
    iconBg: "bg-blue-50",
    iconColor: "text-[#2452EB]",
    icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6",
  },
  {
    title: "키워드·광고·랜딩 연관성",
    desc: "검색 키워드와 광고 문구, 랜딩페이지 메시지가 한 흐름으로 이어지도록 맞춥니다. 세 단계가 맞물릴수록 네이버는 광고의 관련성을 높게 평가합니다.",
    badge: "관련성 지수 TOP",
    badgeColor: "bg-blue-50 text-[#2452EB] border-blue-100",
    iconBg: "bg-blue-50",
    iconColor: "text-[#2452EB]",
    icon: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244",
  },
  {
    title: "랜딩페이지 UX·속도 개선",
    desc: "페이지가 뜨는 데 3초를 넘기면 이탈률이 53% 높아집니다. 로딩 속도를 줄이고 광고와 이어지는 내용을 앞에 배치해, 전환율과 품질지수를 함께 끌어올립니다.",
    badge: "이탈률 ↓ 최대 47%",
    badgeColor: "bg-blue-50 text-[#2452EB] border-blue-100",
    iconBg: "bg-blue-50",
    iconColor: "text-[#2452EB]",
    icon: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .28 2.716-1.144 2.716H4.942c-1.424 0-2.144-1.716-1.144-2.716L5 14.5",
  },
  {
    title: "제외 키워드·무효 클릭 차단",
    desc: "광고와 상관없는 검색어에 나가는 비용부터 막습니다. 제외 키워드를 촘촘히 설정해 같은 예산을 필요한 클릭에만 쓰고, 품질지수를 떨어뜨리는 요인도 함께 없앱니다.",
    badge: "광고비 낭비 ↓ 30%",
    badgeColor: "bg-blue-50 text-[#2452EB] border-blue-100",
    iconBg: "bg-blue-50",
    iconColor: "text-[#2452EB]",
    icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636",
  },
];

const PROCESS = [
  { step: "01", title: "무료 계정 진단", desc: "현재 광고 계정의 품질지수·낭비 키워드·소재 문제점을 무료로 분석합니다." },
  { step: "02", title: "키워드 발굴 & 구조 설계", desc: "검색량·경쟁도·수익성을 분석하고 캠페인→광고그룹→키워드 계층 구조를 설계합니다." },
  { step: "03", title: "소재 작성 & 품질 최적화", desc: "CTR을 높이는 제목·설명문을 작성하고 키워드-광고-랜딩 3단 연관성을 정렬합니다." },
  { step: "04", title: "입찰가 & 품질지수 관리", desc: "시간대·디바이스별 입찰가 최적화와 동시에 품질지수를 지속 모니터링·개선합니다." },
  { step: "05", title: "리포트 & 전략 개선", desc: "주간 성과 리포트와 함께 CPC·CTR·ROAS·품질지수 개선 방향을 제안합니다." },
];

const FAQS = [
  { q: "네이버 SA와 GFA의 차이가 무엇인가요?", a: "SA(Search Advertising)는 검색 키워드 기반 광고로 구매 의도가 높은 사용자에게 도달합니다. GFA(Guaranteed Fixed Advertising)는 디스플레이 배너 광고로 브랜드 인지도 확장에 적합합니다." },
  { q: "품질지수가 낮으면 어떤 문제가 생기나요?", a: "품질지수가 낮으면 같은 키워드에서도 경쟁사 대비 높은 CPC를 지불해야 하고 광고 순위가 하락합니다. 반면 품질지수 상위 광고는 더 낮은 비용으로 더 높은 위치에 노출됩니다. BlueEgg는 소재·키워드·랜딩페이지 연관성 정렬로 품질지수를 체계적으로 개선합니다." },
  { q: "최소 광고 예산이 얼마인가요?", a: "파워링크 기준 일예산 1만 원부터 시작 가능합니다. 업종과 키워드 경쟁도에 따라 적정 예산을 함께 산정해드립니다." },
  { q: "광고 등록 후 얼마나 걸려야 노출되나요?", a: "소재 검토는 보통 1~2 영업일 소요됩니다. 승인 후 즉시 노출되며, 키워드·입찰가·품질지수에 따라 노출 순위가 결정됩니다." },
  { q: "기존 네이버 광고 계정이 있어도 대행 가능한가요?", a: "네, 가능합니다. 기존 계정에 대한 무료 진단으로 품질지수 현황, 낭비 키워드, 소재 개선점을 분석한 후 개선 전략을 제안드립니다." },
  { q: "자동입찰은 어떻게 동작하나요? PC를 켜 둬야 하나요?", a: "저희 서버에서 24시간 돌기 때문에 광고주님 PC를 켜 두실 필요가 없습니다. 5분 간격으로 순위를 확인해 목표 순위에서 밀리면 올리고, 순위가 유지되는 구간에서는 10원 단위로 다시 낮춰 같은 자리를 더 싸게 지킵니다." },
  { q: "부정클릭이 걱정됩니다. 대응이 되나요?", a: "클릭당 과금이라 반복 클릭은 그대로 광고비 손실입니다. 같은 사용자가 짧은 시간에 반복 클릭하는 패턴을 탐지해 차단하고, 매체 설정에서도 전환율이 낮은 제휴 파트너 매체를 꺼 둬 새는 예산을 함께 막습니다." },
  { q: "광고비 환급은 어떻게 받을 수 있나요?", a: "네이버 공식 환급 프로그램 및 소재 효율화를 통한 CPC 절감으로 실질적인 광고비를 줄입니다. 상세 환급 조건과 절차는 별도 '네이버 광고비 환급받기' 서비스 페이지에서 확인하세요." },
];


/* 광고주가 실제로 들고 오는 고민 — 쇼핑 리뷰(캠페인 신청)의 고민 카드와 같은 문법.
   카드가 좁아 한 줄을 열 글자 안쪽으로 끊는다. 마지막 줄이 굵게 나간다. */
const PAIN_POINTS = [
  {
    tag: "첫 세팅",
    lines: ["광고를 처음 하는데", "어디서부터 손댈지", "모르겠어요"],
    icon: "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z",
  },
  {
    tag: "예산 누수",
    lines: ["광고비는 나가는데", "성과가 어디서 나는지", "보이지 않아요"],
    icon: "M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181",
  },
  {
    tag: "운영 시간",
    lines: ["순위는 계속 바뀌는데", "들여다볼 시간이", "없어요"],
    icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    tag: "대량 관리",
    lines: ["키워드 수백 개를", "일일이 손으로 맞추긴", "어려워요"],
    icon: "M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z",
  },
  {
    tag: "품질지수",
    lines: ["같은 키워드인데", "경쟁사보다 비싸게", "물고 있어요"],
    icon: "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941",
  },
];



/* 시작을 막는 조건들을 없앴다는 이야기 — 결정 직전에 한 번 더 짚는다 */
const NO_LOCK_IN = [
  { k: "월 최소 광고비", v: "없음" },
  { k: "계약 기간", v: "없음" },
  { k: "계정 진단", v: "무료" },
];

/* ─────────────────────────────────────────
   페이지
───────────────────────────────────────── */
/* 개선 1~4 — 상품 4종. 문구는 그대로 두고 밴드 문법에만 얹는다. */
const FEATURES = [
  {
    eyebrow: "개선 1. 검색 노출",
    head: ["하위에 묻히던 광고,", "검색 결과 최상단"],
    lead: "검색 결과 아래쪽 광고는 고객 눈에 닿기도 전에 지나갑니다. 파워링크는 통합검색 1~10위, 가장 먼저 보이는 자리에 노출돼 지금 막 구매를 고민하는 고객을 가장 먼저 만납니다.",
    points: ["검색결과 1~10위 노출", "최저 클릭비용 70원~", "PC·모바일 동시 노출", "키워드별 입찰가 자유 설정"],
  },
  {
    eyebrow: "개선 2. 쇼핑 전환",
    head: ["글자로만 보이던 상품,", "사진과 가격으로 한눈에"],
    lead: "글자만으로는 상품의 매력이 다 전해지지 않습니다. 쇼핑검색 광고는 상품 이미지와 가격을 쇼핑 결과 상단에 함께 보여 줘, 비교하던 고객이 그 자리에서 구매를 결정하게 만듭니다.",
    points: ["쇼핑 탭 상단 배치", "상품 이미지+가격 노출", "높은 구매 전환율", "쇼핑몰·스마트스토어 연동"],
  },
  {
    eyebrow: "개선 3. 브랜드 독점",
    head: ["경쟁사와 뒤섞이던 노출,", "브랜드 검색 결과 독점"],
    lead: "브랜드명을 검색한 고객 앞에 경쟁사 광고가 먼저 보이면 찾아온 고객을 빼앗깁니다. 브랜드검색은 결과 최상단 전체를 이미지·영상 소재로 채워, 우리 브랜드를 찾은 고객을 그대로 우리 사이트로 안내합니다.",
    points: ["검색 결과 100% 독점", "이미지·영상 소재 활용", "브랜드 인지도 폭발적 향상", "경쟁사 광고 차단 효과"],
  },
  {
    eyebrow: "개선 4. 콘텐츠형 노출",
    head: ["지나치던 광고,", "끝까지 읽히는 콘텐츠"],
    lead: "광고처럼 보이면 고객은 스크롤을 넘깁니다. 파워컨텐츠는 블로그·카페 글 형태로 검색 결과에 노출돼, 정보를 찾던 고객이 끝까지 읽고 자연스럽게 문의까지 남기게 합니다.",
    points: ["블로그형 콘텐츠 자연 노출", "거부감 없는 정보성 광고", "병원·학원·서비스 업종 특화", "콘텐츠 제작 대행 가능"],
  },
];

/* 히어로 아래 지표 — 운영팀이 넘긴 값을 그대로 적는다. 화면에서 추정하지 않는다.
   scale 이 있으면 소수 한 자리로 읽는다(23 · scale 10 → 2.3). */
const HERO_STATS: { label: string; value: number; unit: string; prefix?: string; scale?: number }[] = [
  { label: "평균 CPC 절감", value: 42, unit: "%", prefix: "▼ " },
  { label: "CTR 향상", value: 23, unit: "배", scale: 10 },
  { label: "ROAS 개선", value: 38, unit: "%", prefix: "▲ " },
];

const AS_IS = [
  { label: "클릭당 비용", value: "300원~" },
  { label: "광고 노출 순위", value: "5~10위 (하위)" },
  { label: "CTR", value: "0.8% (낮음)" },
  { label: "월 예산 소진 속도", value: "3일 내 소진" },
];
const TO_BE = [
  { label: "클릭당 비용", value: "↓ 120원~" },
  { label: "광고 노출 순위", value: "↑ 1~3위 (최상단)" },
  { label: "CTR", value: "↑ 3.2% (3배↑)" },
  { label: "월 예산 효율", value: "2배 이상 연장" },
];

/** 상품 한 줄 — 좌우를 번갈아 놓아 스크롤이 지루해지지 않게 한다 */
function FeatureSection({
  data,
  mockup,
  flip,
  band,
}: {
  data: (typeof FEATURES)[number];
  mockup: React.ReactNode;
  flip: boolean;
  band: string;
}) {
  // "개선 1. 검색 노출" → 번호 1 · 이름 "검색 노출"
  const m = data.eyebrow.match(/(\d+)\.\s*(.+)$/);
  const step = m ? Number(m[1]) : 0;
  const label = m ? m[2] : data.eyebrow;
  return (
    <section className={band}>
      <div className="relative grid items-center gap-10 md:grid-cols-2 md:gap-14">
        <Reveal className={flip ? "md:order-2" : ""}>
          {/* 번호 배지 + 영역 이름 */}
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-primary-50 py-1 pl-1 pr-3.5">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-extrabold text-white tabular-nums"
              style={{ background: "var(--gradient-point)" }}
            >
              {String(step).padStart(2, "0")}
            </span>
            <span className="text-[13.5px] font-extrabold text-brand-primary">{label}</span>
          </span>

          <h2 className={`${H2} mt-5 text-brand-dark`}>
            {data.head[0]}
            <br />
            <span className="text-brand-primary">{data.head[1]}</span>
          </h2>
          <p className="mt-5 max-w-[480px] text-[15px] md:text-[16.5px] leading-relaxed text-brand-sub break-keep">
            {data.lead}
          </p>

          {/* 핵심 포인트 — 2×2 카드 */}
          <ul className="mt-8 grid max-w-[480px] grid-cols-1 gap-2.5 sm:grid-cols-2">
            {data.points.map((t) => (
              <li
                key={t}
                className="flex items-center gap-2.5 rounded-2xl border border-brand-border bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(17,29,55,.04)]"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary-50 text-brand-primary">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                <span className="text-[14.5px] font-bold leading-snug text-brand-dark break-keep">{t}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120} className={flip ? "md:order-1" : ""}>
          {/* 기울인 폰이 옆 칸·아래 밴드에 닿지 않게 여백을 둔다 */}
          <div className="flex justify-center py-6 md:py-10">{mockup}</div>
        </Reveal>
      </div>
    </section>
  );
}

export default function NaverSaPage() {
  // 한 번에 하나만 열리게 둔다 — 다 펼쳐 두면 질문 목록을 훑는 이점이 사라진다
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <LandingShell
      railTitle={
        <>
          네이버 SA광고,
          <br />
          상담으로 시작
        </>
      }
    >
      {/* ── 1. 히어로 ── 흰 밴드 · 중앙 정렬 */}
      <section
        className={`${LIGHT} pb-0`}
        style={{ backgroundImage: "radial-gradient(120% 90% at 50% -10%, rgba(36,82,235,.07), transparent 60%)" }}
      >

        <div className="relative text-center">
          <Reveal>
            <p className={EYEBROW}>Naver SA</p>
            <h2 className={`${H2} mt-4 text-brand-dark`}>
              품질지수는 올리고,
              <br />
              <span className="text-brand-primary">광고비는 낮춥니다</span>
            </h2>
            <p className={LEAD}>
              네이버 품질지수를 최적화해 클릭당 비용은 낮추고 전환은 높였으며, 광고를 검색 결과 최상단에 노출시켰습니다.
            </p>
          </Reveal>

          {/* 지표 3칸 — 화면에 들어올 때 한 번 굴러 올라간다 */}
          <Reveal delay={120}>
            {/* 쇼핑 리뷰의 Track record 카드와 같은 면·여백·글자 크기를 쓴다 */}
            <div className="mx-auto mt-12 max-w-[920px] rounded-[28px] border border-white/70 bg-white/75 px-6 py-8 shadow-[0_24px_60px_-30px_rgba(17,29,55,.28)] backdrop-blur md:px-12 md:py-11">
            <dl className="grid grid-cols-1 divide-y divide-brand-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {HERO_STATS.map((s) => (
                <div key={s.label} className="px-2 py-6 text-center sm:px-6 sm:py-1">
                  <dt className="text-[13px] font-bold text-brand-sub break-keep">{s.label}</dt>
                  <dd className="mt-3.5 text-[40px] font-extrabold leading-none tracking-tight text-brand-dark tabular-nums md:text-[54px]">
                    {s.prefix}
                    {s.scale ? (
                      <>
                        <CountUp to={Math.floor(s.value / s.scale)} />.
                        <CountUp to={s.value % s.scale} />
                      </>
                    ) : (
                      <CountUp to={s.value} />
                    )}
                    <span className="ml-0.5 align-baseline text-[16px] font-extrabold text-brand-dark/75 md:text-[19px]">
                      {s.unit}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
            </div>
          </Reveal>

        </div>
      </section>

      {/* ── 2. 고민 ── 키컬러 밴드 · 고민 카드 행.
          쇼핑 리뷰(캠페인 신청)와 같은 문법 — 아이콘 배지가 카드 위로 반쯤 걸치고,
          테두리 없이 면으로만 띄운 카드가 옆으로 흐른다. */}
      <section className={SEC} style={{ background: POINT_BG }}>
        <div className="relative text-center">
          <Reveal>
            <p className={EYEBROW_ON_DARK}>Pain points</p>
            <h2 className={`${H2} mt-4 text-white`}>
              검색광고, <span className="text-[#8FB0FF]">이런 고민 있으셨나요?</span>
            </h2>
          </Reveal>

          {/* 같은 목록을 두 벌 이어 붙이고 트랙을 밀어 이음매를 감춘다.
              위쪽 pt 는 카드 밖으로 걸친 배지가 잘리지 않게 두는 자리다. */}
          <Reveal>
            <div className="marquee-mask mt-24 -mx-7 overflow-hidden pt-[38px] pb-2 md:-mx-14">
              <div className="marquee-track marquee-pausable gap-5" style={{ animationDuration: "36s" }}>
                {[...PAIN_POINTS, ...PAIN_POINTS].map((t, i) => (
                  <div
                    key={`${t.tag}-${i}`}
                    aria-hidden={i >= PAIN_POINTS.length}
                    className="relative flex w-[212px] shrink-0 flex-col items-center rounded-[26px] bg-gradient-to-b from-white/[0.13] to-white/[0.05] px-5 pb-8 pt-14"
                  >
                    <span className="absolute -top-[34px] flex h-[68px] w-[68px] items-center justify-center rounded-full bg-white shadow-[0_14px_30px_-10px_rgba(3,10,40,.55)]">
                      <svg className="h-8 w-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
                      </svg>
                    </span>
                    <p className="text-[14.5px] leading-[1.85] text-white/80 break-keep">
                      {t.lines.map((l, k) => (
                        <span key={l} className={k === t.lines.length - 1 ? "font-extrabold text-white" : ""}>
                          {l}
                          {k < t.lines.length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                    <p className="mt-auto pt-7 text-[13px] font-bold text-[#9FBBFF]">{t.tag}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 2~5. 상품 4종 ── 흰 ↔ 연회색 밴드를 번갈아 깐다 */}
      {[<PowerlinkMockup key="p" />, <ShoppingVisual key="s" />, <BrandVisual key="b" />, <ContentMockup key="c" />].map(
        (m, i) => (
          <FeatureSection
            key={FEATURES[i].eyebrow}
            data={FEATURES[i]}
            mockup={m}
            flip={i % 2 === 1}
            band={i % 2 === 1 ? TINT : LIGHT}
          />
        ),
      )}

      {/* ── 6. 품질지수 ── 키컬러 밴드. 이 화면에서 가장 무거운 이야기다.
          쇼핑 리뷰 랜딩과 같은 면(--gradient-point)을 쓴다 — 네이비를 따로 쓰면
          같은 톤의 랜딩 두 개가 서로 다른 어두운 색을 갖게 된다. */}
      <section className={BLUE} style={{ background: POINT_BG }}>
        <div className="relative text-center">
          <Reveal>
            <p className={EYEBROW_ON_DARK}>Quality score</p>
            <h2 className={`${H2} mt-4 text-white`}>
              같은 예산 그대로,
              <br />
              <span className="text-[#8FB0FF]">더 높은 순위로</span>
            </h2>
            <p className={LEAD_ON_DARK}>
              네이버 SA 광고 순위는 입찰가 × 품질지수로 정해집니다. 품질지수가 높은 광고는 더 낮은 클릭 비용으로 경쟁사 위에 섭니다.
            </p>
          </Reveal>

          {/* 순위 공식 — 품질지수가 어디에 곱해지는지 한 줄로 */}
          <Reveal delay={80}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 text-[15px] font-extrabold md:text-[17px]">
              <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-white">입찰가</span>
              <span className="text-white/60">×</span>
              <span className="rounded-full bg-white px-4 py-2 text-brand-primary shadow-[0_8px_24px_-8px_rgba(7,15,73,.5)]">품질지수</span>
              <span className="text-white/60">=</span>
              <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-white">광고 순위</span>
            </div>
          </Reveal>

          {/* 관리 전후 — 말로 설명하는 것보다 나란히 놓는 편이 빠르다 */}
          <Reveal delay={120}>
            <div className="relative mt-12 grid gap-4 text-left md:grid-cols-2 md:gap-6">
              {/* AS-IS */}
              <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-6 md:p-7">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-extrabold tracking-wide text-white/70">AS-IS</span>
                    <p className="mt-2 text-[18px] font-extrabold text-white/75">품질지수 낮음</p>
                  </div>
                  <p className="text-[34px] font-black leading-none text-white/60 tabular-nums">
                    3<span className="text-[15px] font-bold text-white/40">/10</span>
                  </p>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[30%] rounded-full bg-white/40" />
                </div>
                <ul className="mt-5 divide-y divide-white/10">
                  {AS_IS.map((row) => (
                    <li key={row.label} className="flex items-center justify-between py-3 text-[15px]">
                      <span className="text-white/60">{row.label}</span>
                      <span className="font-bold text-white/75">{row.value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 가운데 화살표 */}
              <span className="absolute left-1/2 top-1/2 z-10 hidden h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-brand-primary shadow-[0_10px_28px_-8px_rgba(7,15,73,.6)] md:flex">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>

              {/* TO-BE */}
              <div className="rounded-3xl bg-white p-6 shadow-[0_30px_60px_-24px_rgba(7,15,73,.6)] ring-4 ring-white/15 md:p-7">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-md bg-brand-primary-50 px-2 py-0.5 text-[11px] font-extrabold tracking-wide text-brand-primary">TO-BE</span>
                    <p className="mt-2 text-[18px] font-extrabold text-brand-dark">품질지수 높음</p>
                  </div>
                  <p className="text-[34px] font-black leading-none text-brand-primary tabular-nums">
                    9<span className="text-[15px] font-bold text-brand-muted">/10</span>
                  </p>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-brand-primary-50">
                  <div className="h-full w-[90%] rounded-full" style={{ background: "var(--gradient-point)" }} />
                </div>
                <ul className="mt-5 divide-y divide-brand-border">
                  {TO_BE.map((row) => (
                    <li key={row.label} className="flex items-center justify-between py-3 text-[15px]">
                      <span className="text-brand-sub">{row.label}</span>
                      <span className="font-extrabold text-brand-primary">{row.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          {/* 4대 전략 */}
          <Reveal delay={140}>
            <p className="mt-16 text-[13px] font-extrabold tracking-[0.18em] text-white/60">품질지수를 올리는 4가지 방법</p>
          </Reveal>
          <div className="mt-5 grid gap-4 text-left sm:grid-cols-2">
            {QUALITY_PILLARS.map((pillar, i) => (
              <Reveal key={pillar.title} delay={i * 90} className="h-full">
                <div className="relative h-full overflow-hidden rounded-3xl border border-white/12 bg-white/[0.07] p-6 transition-colors hover:bg-white/[0.11] md:p-7">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-primary shadow-[0_8px_20px_-8px_rgba(7,15,73,.5)]">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={pillar.icon} />
                    </svg>
                  </div>
                  <h3 className="mt-5 text-[18px] font-extrabold leading-snug text-white break-keep">{pillar.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-white/70 break-keep">{pillar.desc}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-[13px] font-extrabold text-white">
                    <svg className="h-3.5 w-3.5 text-[#8FB0FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                    </svg>
                    {pillar.badge}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={160}>
            <div className="mt-6 rounded-2xl bg-white p-6">
              <p className="mb-4 text-center text-[16px] font-extrabold text-brand-dark">관리 후 품질지수 개선 실적</p>
              <QualityScoreMockup />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 8. 진행 프로세스 ── 흰 밴드 (바로 위 품질지수가 블루라 겹치지 않게) */}
      <section className={LIGHT}>
        <div className="relative text-center">
          <Reveal>
            <p className={EYEBROW}>How it works</p>
            <h2 className={`${H2} mt-4 text-brand-dark`}>진단부터 <span className="text-brand-primary">리포트까지</span></h2>
            <p className={LEAD}>계정을 들여다보는 일부터 시작합니다. 진단은 무료입니다.</p>
          </Reveal>

          {/* 데스크톱: 5열 스텝 */}
          <div className="mt-14 hidden gap-4 sm:grid sm:grid-cols-5">
            {PROCESS.map((p, i) => (
              <Reveal key={p.step} delay={i * 90}>
                <div className="relative flex flex-col items-center text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full text-[16px] font-extrabold text-white shadow-[0_8px_20px_-8px_rgba(36,82,235,.55)]" style={{ background: "var(--gradient-point)" }}>
                    {p.step}
                  </div>
                  {i < PROCESS.length - 1 && (
                    <div className="absolute top-6 left-[calc(50%+24px)] right-0 border-t border-dashed border-brand-primary/30" />
                  )}
                  <p className="mb-1.5 text-[15px] font-extrabold text-brand-dark break-keep">{p.title}</p>
                  <p className="text-[12.5px] leading-relaxed text-brand-sub break-keep">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* 모바일: 세로 타임라인 */}
          <div className="mt-10 space-y-4 text-left sm:hidden">
            {PROCESS.map((p, i) => (
              <div key={p.step} className="flex items-start gap-3.5">
                <div className="relative flex shrink-0 flex-col items-center">
                  <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full text-[15px] font-extrabold text-white" style={{ background: "var(--gradient-point)" }}>
                    {p.step}
                  </div>
                  {i < PROCESS.length - 1 && <div className="absolute top-10 h-[calc(100%-1rem)] border-l border-dashed border-brand-primary/30" />}
                </div>
                <div className="min-w-0 pt-1.5">
                  <p className="mb-1 text-[15px] font-extrabold text-brand-dark break-keep">{p.title}</p>
                  <p className="text-[13px] leading-relaxed text-brand-sub break-keep">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. FAQ ── 그레이 밴드 */}
      <section className={TINT}>
        <div className="relative">
          <Reveal>
            <div className="text-center">
              <p className={EYEBROW}>FAQ</p>
              <h2 className={`${H2} mt-4 text-brand-dark`}>궁금한 점을 먼저 확인하세요</h2>
            </div>
          </Reveal>

          <div className="mx-auto mt-12 max-w-[720px] space-y-2.5">
            {FAQS.map((faq, i) => {
              const open = openFaq === i;
              return (
                <Reveal key={faq.q} delay={i * 60}>
                  <div className="overflow-hidden rounded-2xl border border-brand-border bg-white">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                      className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left"
                    >
                      <span className="text-[15.5px] md:text-[17px] font-bold text-brand-dark break-keep">{faq.q}</span>
                      <svg
                        className={`h-5 w-5 shrink-0 text-brand-muted transition-transform ${open ? "rotate-180" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {open && (
                      <p className="animate-be-fade border-t border-brand-border px-6 py-5 text-[14.5px] md:text-[15.5px] leading-relaxed text-brand-sub break-keep">
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

      {/* ── 10. 마무리 ── 흰 밴드 */}
      <section className={LIGHT}>
        <div className="relative text-center">
          <Reveal>
            <h2 className={`${H2} text-brand-dark`}>
              계정부터 한번
              <br />
              <span className="text-brand-primary">들여다볼까요?</span>
            </h2>
            <p className={LEAD}>
              지금 광고 계정의 품질지수·낭비 키워드·소재 문제점을 무료로 진단해 드립니다. 채팅으로 편하게 말씀만 주세요.
            </p>

            {/* 시작을 막는 조건이 없다는 걸 결정 직전에 한 번 더 짚는다 */}
            <dl className="mx-auto mt-10 grid max-w-[560px] grid-cols-1 divide-y divide-brand-border overflow-hidden rounded-[22px] border border-brand-border bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {NO_LOCK_IN.map((n) => (
                <div key={n.k} className="px-5 py-4">
                  <dt className="text-[13px] font-bold text-brand-sub break-keep">{n.k}</dt>
                  <dd className="mt-1.5 text-[20px] font-extrabold tracking-tight text-brand-primary">{n.v}</dd>
                </div>
              ))}
            </dl>

          </Reveal>

          {/* 쇼핑 리뷰 마무리와 같은 3카드 — 상담 외에 갈 곳을 같이 열어 둔다 */}
          <div className="mt-12 grid gap-4 text-left sm:grid-cols-3">
            {[
              { title: "상담 문의", desc: "업종·예산·현재 계정 상태를 알려주시면 진단 결과와 함께 제안드립니다.", href: CONSULT_HREF, cta: "문의하기" },
              { title: "서비스 신청내역", desc: "신청한 상담·견적의 진행 상황을 확인하세요.", href: "/marketing/my/service-inquiries", cta: "바로가기" },
              { title: "내 캠페인 현황", desc: "진행 중인 캠페인을 한 곳에서 확인합니다.", href: "/marketing/my/campaigns", cta: "바로가기" },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 90} className="h-full">
                <div className="flex h-full flex-col rounded-2xl border border-brand-border bg-white p-6">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
                    style={{ background: POINT_BG }}
                  >
                    <ChatIcon className="h-5 w-5" />
                  </span>
                  <p className="mt-4 text-[17px] font-extrabold text-brand-dark break-keep">{c.title}</p>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-brand-sub break-keep">{c.desc}</p>
                  <Link
                    href={c.href}
                    className="mt-auto inline-flex items-center gap-1 pt-5 text-[13.5px] font-extrabold text-brand-primary hover:underline"
                  >
                    {c.cta}
                    <ArrowIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={280}>
            <div className="mt-12 flex flex-col items-center gap-3">
              <PillLink>상담 문의하기</PillLink>
              <p className="text-[13px] text-brand-muted">{POLICY.support.hours} 응대</p>
            </div>
          </Reveal>
        </div>
      </section>
    </LandingShell>
  );
}
