"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* ── Types ── */
type Platform = "naver_place" | "naver_shopping";

/* 플랫폼 ↔ 사이드바 라우트 매핑 */
const PLATFORM_ROUTE: Record<Platform, string> = {
  naver_place: "/marketing/rank/place",
  naver_shopping: "/marketing/rank/shopping",
};

// 업체 하나에 속한 개별 키워드의 순위 정보
// 방문자리뷰/블로그리뷰/N1~N3 등 부가 지표 (값 + 전일 대비 변동)
interface KeywordMetric {
  label: string;
  value: string;
  diff: string; // "+3", "-", "+0.000023" 등 표시용 문자열
}

interface KeywordRank {
  keyword: string;
  currentRank: number | null;
  prevRank: number | null;
  bestRank: number;
  history: (number | null)[];
  monthlyVolume: number;
  registeredAt: string;
  productUrl?: string;     // 쇼핑: 키워드마다 서로 다른 상품이라 연결 URL이 다름
  metrics?: KeywordMetric[];
}

interface RankItem {
  id: number;
  productName: string;
  store?: string;          // 네이버 쇼핑: 하나의 업체(스토어)가 여러 상품을 운영
  thumbnail?: string;
  targetUrl: string;
  checkedAt: string;
  status: "active" | "paused";
  keywords: KeywordRank[];
}

// history 배열(오래된 날짜 → 최근 날짜)에 대응하는 날짜 라벨
const HISTORY_DATES = ["06/24", "06/25", "06/26", "06/27", "06/28", "06/29", "06/30"];

// 방문자리뷰 / 블로그리뷰 / N1~N3 지표 묶음 (값, 전일 대비 변동)
const pm = (
  vr: string, vrd: string, br: string, brd: string,
  n1: string, n1d: string, n2: string, n2d: string, n3: string, n3d: string,
): KeywordMetric[] => [
  { label: "방문자리뷰", value: vr, diff: vrd },
  { label: "블로그리뷰", value: br, diff: brd },
  { label: "N1", value: n1, diff: n1d },
  { label: "N2", value: n2, diff: n2d },
  { label: "N3", value: n3, diff: n3d },
];

// 지표 변동 색상: 증가(+) 빨강, 감소(-숫자) 파랑, 변동없음("-") 회색
function diffClass(diff: string): string {
  if (diff === "-" || diff === "") return "text-brand-muted";
  return diff.startsWith("-") ? "text-blue-500" : "text-red-500";
}

// 순위 분포 버킷 (현재 순위 기준)
const RANK_BUCKETS: { label: string; color: string; test: (r: number | null) => boolean }[] = [
  { label: "1~3위",     color: "text-blue-600",   test: (r) => r !== null && r >= 1 && r <= 3 },
  { label: "1~5위",     color: "text-red-500",    test: (r) => r !== null && r >= 1 && r <= 5 },
  { label: "1~10위",    color: "text-brand-dark", test: (r) => r !== null && r >= 1 && r <= 10 },
  { label: "1~20위",    color: "text-orange-500", test: (r) => r !== null && r >= 1 && r <= 20 },
  { label: "6~20위",    color: "text-green-600",  test: (r) => r !== null && r >= 6 && r <= 20 },
  { label: "21~50위",   color: "text-blue-600",   test: (r) => r !== null && r >= 21 && r <= 50 },
  { label: "51~100위",  color: "text-brand-dark", test: (r) => r !== null && r >= 51 && r <= 100 },
  { label: "101~200위", color: "text-brand-dark", test: (r) => r !== null && r >= 101 && r <= 200 },
  { label: "201~300위", color: "text-brand-dark", test: (r) => r !== null && r >= 201 && r <= 300 },
  { label: "순위밖",     color: "text-brand-dark", test: (r) => r === null || r > 300 },
];

/* ── Mock Data ── */
const PLATFORM_META: Record<Platform, {
  label: string; color: string; grad: string; emoji: string; placeholder: string;
  urlLabel: string; urlPlaceholder: string;
  urlFieldLabel: string; urlInputPlaceholder: string;
  exampleUrl: string; exampleId: string;
  urlRegex: RegExp; keywordPlaceholder: string;
}> = {
  naver_place: {
    label: "네이버 플레이스",
    color: "#0D3473",
    grad: "linear-gradient(135deg,#1B3160,#2E6BE0)",
    emoji: "🗺️",
    placeholder: "예) 마포 맛집, 홍대 카페",
    urlLabel: "플레이스 URL 또는 업체 ID",
    urlPlaceholder: "https://map.naver.com/p/entry/place/12345  또는  12345",
    urlFieldLabel: "네이버 플레이스 주소(URL) 혹은 ID",
    urlInputPlaceholder: "플레이스 URL 또는 ID를 입력하세요",
    exampleUrl: "https://map.naver.com/p/entry/place/18709548",
    exampleId: "18709548",
    urlRegex: /place\/(\d+)/,
    keywordPlaceholder: "귀사가 노출되길 원하는 목표 검색어",
  },
  naver_shopping: {
    label: "네이버 쇼핑",
    color: "#0D3473",
    grad: "linear-gradient(135deg,#0D3473,#0D2148)",
    emoji: "🛍️",
    placeholder: "예) 여성 패딩, 무스탕 자켓",
    urlLabel: "상품 URL 또는 상품 ID",
    urlPlaceholder: "https://smartstore.naver.com/...  또는  상품 ID",
    urlFieldLabel: "네이버 쇼핑 상품 주소(URL) 혹은 ID",
    urlInputPlaceholder: "상품 URL 또는 상품 ID를 입력하세요",
    exampleUrl: "https://smartstore.naver.com/store/products/9001234567",
    exampleId: "9001234567",
    urlRegex: /products\/(\d+)/,
    keywordPlaceholder: "상품이 노출되길 원하는 목표 검색어",
  },
};

const MOCK_DATA: Record<Platform, RankItem[]> = {
  naver_place: [
    {
      id: 1, productName: "홍길동 칼국수", targetUrl: "1234567890", checkedAt: "10분 전", status: "active",
      keywords: [
        { keyword: "마포 맛집",   currentRank: 3,  prevRank: 5,  bestRank: 2,  history: [18, 12, 8, 7, 5, 5, 3],   monthlyVolume: 4080, registeredAt: "2026-06-23", metrics: pm("926", "+3", "479", "-", "0.451398", "+0.000023", "0.484899", "+0.000533", "0.546557", "+0.000048") },
        { keyword: "마포 칼국수", currentRank: 6,  prevRank: 8,  bestRank: 5,  history: [20, 15, 12, 9, 8, 8, 6],   monthlyVolume: 2210, registeredAt: "2026-06-23", metrics: pm("926", "+3", "479", "-", "0.412034", "+0.000110", "0.398221", "-0.000087", "0.501330", "+0.000210") },
        { keyword: "공덕 맛집",   currentRank: 11, prevRank: 11, bestRank: 9,  history: [22, 18, 15, 13, 11, 11, 11], monthlyVolume: 3300, registeredAt: "2026-06-25", metrics: pm("926", "+3", "479", "-", "0.388912", "-0.000045", "0.421007", "+0.000301", "0.477640", "+0.000019") },
      ],
    },
    {
      id: 2, productName: "블루보틀 홍대점", targetUrl: "9876543210", checkedAt: "10분 전", status: "active",
      keywords: [
        { keyword: "홍대 카페",   currentRank: 7, prevRank: 6, bestRank: 4, history: [10, 9, 7, 6, 8, 6, 7], monthlyVolume: 12500, registeredAt: "2026-06-20", metrics: pm("1342", "+12", "880", "+5", "0.512004", "+0.000451", "0.498220", "+0.000120", "0.561300", "+0.000077") },
        { keyword: "연남동 카페", currentRank: 4, prevRank: 5, bestRank: 3, history: [12, 9, 7, 6, 5, 5, 4],  monthlyVolume: 6700,  registeredAt: "2026-06-20", metrics: pm("1342", "+12", "880", "+5", "0.534551", "+0.000620", "0.502118", "+0.000044", "0.578901", "+0.000133") },
      ],
    },
    {
      id: 3, productName: "애니타임 강남점", targetUrl: "1122334455", checkedAt: "10분 전", status: "active",
      keywords: [
        { keyword: "강남 헬스장", currentRank: 15, prevRank: 18, bestRank: 10, history: [30, 25, 22, 20, 18, 18, 15], monthlyVolume: 8300, registeredAt: "2026-06-18", metrics: pm("612", "+8", "203", "+2", "0.331204", "+0.000302", "0.298771", "-0.000051", "0.402118", "+0.000088") },
        { keyword: "강남역 PT",  currentRank: 9,  prevRank: 12, bestRank: 7,  history: [25, 20, 16, 14, 12, 12, 9],  monthlyVolume: 4500, registeredAt: "2026-06-18", metrics: pm("612", "+8", "203", "+2", "0.356880", "+0.000410", "0.310022", "+0.000133", "0.418900", "+0.000200") },
      ],
    },
  ],
  naver_shopping: [
    // ── 업체(스토어): 버터플라이 — 상품 2개 ──
    {
      id: 1, store: "버터플라이", productName: "구스다운 롱패딩", targetUrl: "https://smartstore.naver.com/butterfly/products/9001234567", checkedAt: "15분 전", status: "active",
      keywords: [
        { keyword: "여성 패딩",  currentRank: 8,  prevRank: 16, bestRank: 5,  history: [74, 35, 53, 36, 19, 12, 8],  monthlyVolume: 33400, registeredAt: "2026-06-22", productUrl: "https://smartstore.naver.com/butterfly/products/9001234567" },
        { keyword: "구스다운",   currentRank: 12, prevRank: 14, bestRank: 9,  history: [40, 30, 22, 18, 15, 14, 12], monthlyVolume: 18800, registeredAt: "2026-06-22", productUrl: "https://smartstore.naver.com/butterfly/products/9001234571" },
      ],
    },
    {
      id: 2, store: "버터플라이", productName: "경량 다운 베스트", targetUrl: "https://smartstore.naver.com/butterfly/products/9001234568", checkedAt: "15분 전", status: "active",
      keywords: [
        { keyword: "경량 패딩",  currentRank: 15, prevRank: 19, bestRank: 11, history: [45, 40, 33, 28, 22, 19, 15], monthlyVolume: 12500, registeredAt: "2026-06-20", productUrl: "https://smartstore.naver.com/butterfly/products/9001234568" },
      ],
    },
    // ── 업체(스토어): 블루에그 — 상품 2개 ──
    {
      id: 3, store: "블루에그", productName: "무스탕 코트", targetUrl: "https://smartstore.naver.com/aura/products/8887776665", checkedAt: "15분 전", status: "active",
      keywords: [
        { keyword: "무스탕 자켓", currentRank: 22, prevRank: 20, bestRank: 14, history: [40, 38, 30, 28, 22, 20, 22], monthlyVolume: 9600, registeredAt: "2026-06-19", productUrl: "https://smartstore.naver.com/aura/products/8887776665" },
        { keyword: "여성 무스탕", currentRank: 18, prevRank: 19, bestRank: 13, history: [35, 30, 26, 22, 20, 19, 18], monthlyVolume: 7100, registeredAt: "2026-06-19", productUrl: "https://smartstore.naver.com/aura/products/8887776667" },
      ],
    },
    {
      id: 4, store: "블루에그", productName: "램스울 핸드메이드 코트", targetUrl: "https://smartstore.naver.com/aura/products/8887776666", checkedAt: "15분 전", status: "active",
      keywords: [
        { keyword: "핸드메이드 코트", currentRank: 27, prevRank: 24, bestRank: 20, history: [48, 44, 40, 35, 30, 24, 27], monthlyVolume: 6400, registeredAt: "2026-06-18", productUrl: "https://smartstore.naver.com/aura/products/8887776666" },
      ],
    },
    // ── 업체(스토어): 소프트 — 상품 1개 ──
    {
      id: 5, store: "소프트", productName: "캐시미어 터틀넥", targetUrl: "5556667778", checkedAt: "집계 중", status: "paused",
      keywords: [
        { keyword: "캐시미어 니트", currentRank: null, prevRank: null, bestRank: 35, history: [55, 50, 45, 40, null, null, null], monthlyVolume: 5200, registeredAt: "2026-06-15", productUrl: "https://smartstore.naver.com/soft/products/5556667778" },
        { keyword: "터틀넥",       currentRank: 40,   prevRank: 42,   bestRank: 33, history: [60, 55, 50, 46, 44, 42, 40],     monthlyVolume: 8900, registeredAt: "2026-06-15", productUrl: "https://smartstore.naver.com/soft/products/5556667779" },
      ],
    },
  ],
};

/* ── Add Keyword Modal ── */
function AddKeywordModal({ platform, onClose }: { platform: Platform; onClose: () => void }) {
  const meta = PLATFORM_META[platform];
  const [keyword, setKeyword] = useState("");
  const [name, setName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleAdd = async () => {
    if (!keyword.trim() || !name.trim() || !targetUrl.trim()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    setSaving(false);
    setDone(true);
    setTimeout(onClose, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-6">
            <div className="h-12 w-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: meta.grad }}>
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-[18px] font-bold text-brand-dark">키워드 추가 완료!</p>
            <p className="text-[15px] text-brand-sub mt-1">곧 순위 추적이 시작됩니다</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center text-[20px]" style={{ background: meta.grad }}>
                  {meta.emoji}
                </div>
                <div>
                  <p className="text-[17px] font-bold text-brand-dark">{meta.label}</p>
                  <p className="text-[12px] text-brand-sub">키워드 추가</p>
                </div>
              </div>
              <button onClick={onClose} className="h-7 w-7 rounded-full hover:bg-brand-lighter flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[15px] font-semibold text-brand-dark mb-1.5">
                  {platform === "naver_place" ? "매장명" : "상품명"} <span className="text-red-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={platform === "naver_place" ? "예) 홍길동 칼국수" : "예) 버터플라이 구스다운 자켓"}
                  className="w-full px-4 py-3 border border-brand-border rounded-xl text-[16px] bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-brand-dark mb-1.5">
                  {meta.urlLabel} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <input
                    value={targetUrl}
                    onChange={e => setTargetUrl(e.target.value)}
                    placeholder={meta.urlPlaceholder}
                    className="w-full pl-9 pr-4 py-3 border border-brand-border rounded-xl text-[15px] bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                  />
                </div>
                <p className="mt-1.5 text-[12px] text-brand-muted">URL 전체 또는 숫자 ID만 입력 가능합니다</p>
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-brand-dark mb-1.5">
                  추적 키워드 <span className="text-red-500">*</span>
                </label>
                <input
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder={meta.placeholder}
                  className="w-full px-4 py-3 border border-brand-border rounded-xl text-[16px] bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={saving || !keyword.trim() || !name.trim() || !targetUrl.trim()}
              className="mt-5 w-full py-3 rounded-xl text-[16px] font-bold text-white transition-all disabled:opacity-50"
              style={{ background: meta.grad }}
            >
              {saving ? "추가 중..." : "순위 추적 시작"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function extractIdFromUrl(platform: Platform, input: string): string | null {
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) return trimmed;
  const match = trimmed.match(PLATFORM_META[platform].urlRegex);
  return match ? match[1] : null;
}

/* ── ID → 쇼핑몰(스토어)/매장 자동 연동 (목업) ──
   실제로는 네이버 API 조회. 여기서는 알려진 ID는 실제명, 그 외 유효 ID는 샘플에서 연동. */
const KNOWN_STORES: Record<string, string> = {
  "9001234567": "버터플라이 스토어",
  "8887776665": "블루에그 공식스토어",
  "18709548": "홍길동 칼국수",
};
const SAMPLE_SHOPPING_STORES = ["라움 리빙", "데일리무드", "코코네일샵", "그린테이블", "노르딕홈", "무드컴퍼니", "어반셀렉트"];
const SAMPLE_PLACE_STORES = ["미도인 성수점", "온천집 강남점", "역전할머니맥주 홍대점", "파리바게뜨 이태원점", "스타벅스 강남점"];
function lookupStoreName(platform: Platform, id: string): string | null {
  if (KNOWN_STORES[id]) return KNOWN_STORES[id];
  if (!/^\d{6,}$/.test(id)) return null;
  const list = platform === "naver_place" ? SAMPLE_PLACE_STORES : SAMPLE_SHOPPING_STORES;
  const hash = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
  return list[hash % list.length];
}

/* 순위 추이 라벨용 기준일(오늘) — mock 표시용 고정 날짜 */
const RANK_REF_DATE = new Date(2026, 6, 8); // 2026-07-08
function fmtDaysAgo(ago: number): string {
  const d = new Date(RANK_REF_DATE);
  d.setDate(RANK_REF_DATE.getDate() - ago);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/* 기간(7/30/전체)별 순위 시리즈 생성 — base는 최근 7일(오래된→최근) */
function buildRankSeries(base: (number | null)[], days: number): { rank: number | null; label: string }[] {
  const arr: (number | null)[] = [];
  const first = base.find((v): v is number => v !== null) ?? 30;
  if (days <= base.length) {
    arr.push(...base.slice(base.length - days));
  } else {
    const extra = days - base.length;
    for (let i = 0; i < extra; i++) {
      const t = i / extra;
      const val = Math.round(first + (1 - t) * extra * 0.9 + Math.sin(i * 1.1) * Math.min(5, extra * 0.12));
      arr.push(Math.max(1, val));
    }
    arr.push(...base);
  }
  const total = arr.length;
  return arr.map((rank, i) => {
    const ago = total - 1 - i;
    return { rank, label: fmtDaysAgo(ago) };
  });
}

/* 순위 추이 — 기간 탭(7일/30일/전체) + 날짜·순위 칩 + 풀와이드 그래프 */
export function PeriodRankChart({ base, color, uid }: { base: (number | null)[]; color: string; uid: string }) {
  const [days, setDays] = useState(7);
  const series = buildRankSeries(base, days);
  const n = series.length;
  const valid = series.filter((s): s is { rank: number; label: string } => s.rank !== null);
  const chips = [...series].reverse();

  const W = 920, H = 240, pL = 40, pR = 20, pT = 26, pB = 30;
  const iW = W - pL - pR, iH = H - pT - pB;
  const maxV = valid.length ? Math.max(...valid.map((v) => v.rank)) : 10;
  const minV = valid.length ? Math.min(...valid.map((v) => v.rank)) : 1;
  const range = maxV - minV || 1;
  const x = (i: number) => pL + (n > 1 ? (i / (n - 1)) * iW : iW / 2);
  const y = (r: number) => pT + ((r - minV) / range) * iH;
  const pts = series
    .map((s, i) => (s.rank === null ? null : { x: x(i), y: y(s.rank), rank: s.rank }))
    .filter((p): p is { x: number; y: number; rank: number } => p !== null);
  const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = pts.length ? `${pts[0].x},${pT + iH} ${line} ${pts[pts.length - 1].x},${pT + iH}` : "";
  const labelStep = Math.max(1, Math.ceil(n / 8));
  const dotStep = n > 20 ? Math.max(1, Math.ceil(n / 14)) : 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[13px] font-semibold text-brand-sub">순위 추이</p>
        <div className="flex gap-1">
          {[{ l: "7일", d: 7 }, { l: "30일", d: 30 }, { l: "전체", d: 60 }].map((t) => (
            <button key={t.d} onClick={() => setDays(t.d)}
              className={`px-2.5 py-1 rounded-lg text-[12px] font-bold transition-all ${days === t.d ? "bg-brand-dark text-white" : "bg-brand-lighter text-brand-sub hover:bg-brand-border"}`}>
              {t.l}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto mb-2 scrollbar-none">
        <div className="flex items-stretch w-max">
          {chips.map((d, i) => (
            <div key={i} className={`flex flex-col items-center justify-center px-2.5 py-1 min-w-[44px] shrink-0 ${i > 0 ? "border-l border-brand-border" : ""}`}>
              <span className="text-[10px] text-brand-muted leading-none mb-0.5">{d.label}</span>
              <span className={`text-[12px] font-bold leading-none ${i === 0 ? "text-brand-primary" : "text-brand-dark"}`}>{d.rank === null ? "-" : `${d.rank}위`}</span>
            </div>
          ))}
        </div>
      </div>
      {valid.length < 2 ? (
        <div className="flex items-center justify-center h-[180px] text-brand-muted text-[15px]">데이터 수집 중...</div>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          <defs>
            <linearGradient id={`prc-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.16" />
              <stop offset="100%" stopColor={color} stopOpacity="0.01" />
            </linearGradient>
          </defs>
          {[0, 0.33, 0.66, 1].map((f, i) => (
            <line key={i} x1={pL} y1={pT + iH * f} x2={W - pR} y2={pT + iH * f} stroke="#F2F4F6" strokeWidth={1} />
          ))}
          <polygon points={area} fill={`url(#prc-${uid})`} />
          <polyline points={line} fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
          {pts.map((p, idx) => (idx % dotStep === 0 || idx === pts.length - 1) ? (
            <g key={idx}>
              <circle cx={p.x} cy={p.y} r={4} fill="white" stroke={color} strokeWidth={2} />
              <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize={10} fontWeight={600} fill="#4E5968">{p.rank}위</text>
            </g>
          ) : null)}
          {series.map((s, i) => (i % labelStep === 0 || i === n - 1) ? (
            <text key={`l${i}`} x={x(i)} y={H - 6} textAnchor="middle" fontSize={9.5} fill="#99A0AC">{s.label}</text>
          ) : null)}
        </svg>
      )}
    </div>
  );
}

/* ── Page ── */
export default function RankManagement({ initialPlatform = "naver_place" }: { initialPlatform?: Platform }) {
  const router = useRouter();
  const [activePlatform, setActivePlatform] = useState<Platform>(initialPlatform);
  // 라우트(사이드바 이동 등)로 initialPlatform이 바뀌면 탭도 동기화
  useEffect(() => { setActivePlatform(initialPlatform); }, [initialPlatform]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [checking, setChecking] = useState(false);
  const [keywords, setKeywords] = useState(["", "", ""]);
  const [targetId, setTargetId] = useState("");
  const [registering, setRegistering] = useState(false);
  const [registerDone, setRegisterDone] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // 상품/플레이스 ID → 쇼핑몰(매장)명 자동 연동
  const [storeName, setStoreName] = useState<string | null>(null);
  const [storeLoading, setStoreLoading] = useState(false);
  useEffect(() => {
    const eff = targetId.startsWith("http") ? extractIdFromUrl(activePlatform, targetId) : targetId.trim();
    if (!eff || !/^\d{6,}$/.test(eff)) {
      setStoreName(null);
      setStoreLoading(false);
      return;
    }
    setStoreName(null);
    setStoreLoading(true);
    const t = setTimeout(() => {
      setStoreName(lookupStoreName(activePlatform, eff));
      setStoreLoading(false);
    }, 550);
    return () => clearTimeout(t);
  }, [targetId, activePlatform]);

  const setKeyword = (i: number, v: string) =>
    setKeywords(prev => prev.map((k, idx) => (idx === i ? v : k)));

  const meta = PLATFORM_META[activePlatform];
  const items = MOCK_DATA[activePlatform];

  const allKeywords = items.flatMap(i => i.keywords);

  // 네이버 쇼핑: 하나의 업체(스토어)가 여러 상품을 운영 → 업체별로 묶어서 표시
  const isShopping = activePlatform === "naver_shopping";
  const groups: { store: string | null; items: RankItem[] }[] = (() => {
    if (!isShopping) return [{ store: null, items }];
    const map = new Map<string, RankItem[]>();
    for (const it of items) {
      const key = it.store ?? it.productName;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    return [...map.entries()].map(([store, its]) => ({ store, items: its }));
  })();
  const storeCount = isShopping ? groups.length : items.length;

  const handleCheck = async () => {
    setChecking(true);
    await new Promise(r => setTimeout(r, 1200));
    setChecking(false);
  };

  /* ── History Chart ── */
  return (
    <div className="min-h-full bg-white p-6 md:p-10">

      {/* ── 헤더 (박스 밖): 타이틀 + 액션 ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap px-1 md:px-2 pb-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <span className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md" style={{ background: "linear-gradient(135deg,#1D3E7E,#0D3473)" }}>
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </span>
            <div className="min-w-0">
              <h1 className="text-[22px] font-extrabold text-brand-dark leading-tight">통합 순위관리</h1>
              <p className="text-[14px] text-brand-sub mt-0.5">네이버 플레이스·쇼핑 키워드 순위를 한 페이지에서 추적하세요.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCheck}
              disabled={checking}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-brand-border bg-white text-[14px] font-semibold text-brand-text hover:bg-brand-lighter transition-colors disabled:opacity-60"
            >
              <svg className={`w-4 h-4 text-brand-primary ${checking ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {checking ? "체크 중..." : "새로고침"}
            </button>
            <button
              onClick={() => { setShowAddForm(v => !v); setRegisterDone(false); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[14px] font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#1B3160,#2E6BE0)" }}
            >
              <svg className={`w-4 h-4 transition-transform ${showAddForm ? "rotate-45" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              순위 추적 추가
            </button>
          </div>
        </div>

      {/* ── 박스: 탭 + 순위분포 + 목록 ── */}
      <div className="flex flex-col rounded-2xl border border-brand-border overflow-hidden bg-white shadow-[0_8px_28px_rgba(17,29,55,0.10)]">

        {/* ── 플랫폼 탭 + 요약 ── */}
        <div className="flex items-center justify-between gap-3 flex-wrap px-5 md:px-6 py-3 border-b border-brand-border bg-brand-lighter/40">
          <div className="inline-flex gap-1 p-1 rounded-xl bg-brand-lighter border border-brand-border">
            {(Object.keys(PLATFORM_META) as Platform[]).map((p) => {
              const m = PLATFORM_META[p];
              const isActive = p === activePlatform;
              return (
                <button
                  key={p}
                  onClick={() => { setActivePlatform(p); setExpandedId(null); router.push(PLATFORM_ROUTE[p]); }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[14px] font-bold transition-all ${
                    isActive ? "bg-white text-brand-dark shadow-sm" : "text-brand-sub hover:text-brand-text"
                  }`}
                >
                  <span className="text-[16px]">{m.emoji}</span>
                  {m.label}
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${isActive ? "bg-brand-primary/10 text-brand-primary" : "bg-white text-brand-muted"}`}>
                    {MOCK_DATA[p].length}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[13px] text-brand-sub">
            {isShopping
              ? `${storeCount}개 업체 · ${items.length}개 상품 · ${allKeywords.length}개 키워드`
              : `${storeCount}개 업체 · ${allKeywords.length}개 키워드`}
          </p>
        </div>

      {/* ── 순위 추적 추가 (접이식 패널) ── */}
      {showAddForm && (
        <div className="border-b border-brand-border bg-brand-lighter/40">
          {registerDone ? (
            <div className="px-5 md:px-6 py-8 flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ background: meta.grad }}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-[18px] font-bold text-brand-dark">순위 추적 슬롯이 등록되었습니다!</p>
              <p className="text-[15px] text-brand-sub">잠시 후 아래 목록에 반영됩니다.</p>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => { setRegisterDone(false); setKeywords(["", "", ""]); setTargetId(""); }}
                  className="px-5 py-2 rounded-xl text-[15px] font-semibold border border-brand-border bg-white text-brand-text hover:bg-brand-lighter transition-colors"
                >
                  새 슬롯 추가
                </button>
                <button
                  onClick={() => { setShowAddForm(false); setRegisterDone(false); }}
                  className="px-5 py-2 rounded-xl text-[15px] font-semibold text-brand-sub hover:bg-white transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          ) : (
            <div className="px-5 md:px-6 py-5 space-y-4">

              {/* 안내 라인 */}
              <div className="flex items-center gap-x-3 gap-y-1.5 flex-wrap text-[13px]">
                <span className="inline-flex items-center gap-1.5 font-semibold text-brand-dark">
                  <svg className="w-4 h-4 text-[#2E6BE0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><circle cx="11" cy="11" r="7"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
                  {meta.label} 순위 <span className="text-[#2E6BE0] font-extrabold">300위</span>까지 조회 가능
                </span>
                <span className="text-brand-border">|</span>
                <span className="text-brand-muted">예시 ID</span>
                <span className="font-semibold text-brand-dark px-2 py-0.5 rounded-md bg-white border border-brand-border">{meta.exampleId}</span>
              </div>

              {/* ID + 키워드 그리드 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
              {/* ID / URL — 첫 번째 */}
              <div>
                <label className="block text-[15px] font-bold text-brand-dark mb-2">
                  {activePlatform === "naver_place" ? "플레이스" : "상품"} ID <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={targetId}
                  onChange={e => setTargetId(e.target.value)}
                  placeholder={`ex. ${meta.exampleId}`}
                  className="w-full px-4 py-3 border border-brand-border rounded-xl text-[16px] bg-white placeholder-brand-muted text-brand-dark focus:outline-none focus:border-[#2E6BE0] focus:ring-2 focus:ring-[#2E6BE0]/15 transition-all"
                />
                {targetId.startsWith("http") && extractIdFromUrl(activePlatform, targetId) && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-[#2E6BE0] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-[12px] text-brand-sub">ID 추출됨:</span>
                    <span className="text-[12px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {extractIdFromUrl(activePlatform, targetId)}
                    </span>
                  </div>
                )}

                {/* 쇼핑몰(매장) 자동 연동 */}
                {storeLoading && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[12px] text-brand-muted">
                    <svg className="w-3.5 h-3.5 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="#D7E3FA" strokeWidth="3" />
                      <path d="M21 12a9 9 0 00-9-9" stroke="#2E6BE0" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    {activePlatform === "naver_place" ? "매장" : "쇼핑몰"} 정보를 불러오는 중…
                  </div>
                )}
                {!storeLoading && storeName && (
                  <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                    <svg className="w-3 h-3 text-[#2E6BE0] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-[12px] text-brand-sub">{activePlatform === "naver_place" ? "매장" : "쇼핑몰"}:</span>
                    <span className="inline-flex items-center gap-1 text-[12px] font-bold px-2 py-0.5 rounded-md bg-[#EEF3FC] text-[#2E6BE0] border border-[#D7E3FA]">
                      <span aria-hidden>🏬</span>{storeName}
                    </span>
                    <span className="text-[11px] text-brand-muted">자동 연동됨</span>
                  </div>
                )}
              </div>

              {/* 키워드 1 */}
              <div>
                <label className="block text-[15px] font-bold text-brand-dark mb-2">
                  키워드1 <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={keywords[0]}
                  onChange={e => setKeyword(0, e.target.value)}
                  placeholder={`ex. ${meta.exampleUrl.includes("place") ? "을지로 맛집" : "여성 패딩"}`}
                  className="w-full px-4 py-3 border border-brand-border rounded-xl text-[16px] bg-white placeholder-brand-muted text-brand-dark focus:outline-none focus:border-[#2E6BE0] focus:ring-2 focus:ring-[#2E6BE0]/15 transition-all"
                />
              </div>

              {/* 키워드 2·3 — 네이버 플레이스에서만 노출 */}
              {activePlatform === "naver_place" && (
                <>
                  <div>
                    <label className="block text-[15px] font-bold text-brand-dark mb-2">키워드2</label>
                    <input
                      type="text"
                      value={keywords[1]}
                      onChange={e => setKeyword(1, e.target.value)}
                      placeholder="ex. 을지로 순대국"
                      className="w-full px-4 py-3 border border-brand-border rounded-xl text-[16px] bg-white placeholder-brand-muted text-brand-dark focus:outline-none focus:border-[#2E6BE0] focus:ring-2 focus:ring-[#2E6BE0]/15 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[15px] font-bold text-brand-dark mb-2">키워드3</label>
                    <input
                      type="text"
                      value={keywords[2]}
                      onChange={e => setKeyword(2, e.target.value)}
                      placeholder="ex. 을지로 점심"
                      className="w-full px-4 py-3 border border-brand-border rounded-xl text-[16px] bg-white placeholder-brand-muted text-brand-dark focus:outline-none focus:border-[#2E6BE0] focus:ring-2 focus:ring-[#2E6BE0]/15 transition-all"
                    />
                  </div>
                </>
              )}

            </div>

            {/* 순위 검색 버튼 */}
            <button
              disabled={registering || !keywords[0].trim() || !targetId.trim()}
              onClick={async () => {
                setRegistering(true);
                await new Promise(r => setTimeout(r, 900));
                setRegistering(false);
                setRegisterDone(true);
              }}
              className="w-full py-3.5 rounded-xl text-[16px] font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg,#1B3160 0%,#111D37 100%)" }}
            >
              {registering ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  검색 중...
                </>
              ) : "순위 검색"}
            </button>
            </div>
          )}
        </div>
      )}

      {/* ── 순위 분포 (블럭 그리드) ── */}
      <div className="border-b border-brand-border bg-white p-3 md:px-6 md:py-4">
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {RANK_BUCKETS.map((b) => {
            const count = allKeywords.filter((k) => b.test(k.currentRank)).length;
            return (
              <div
                key={b.label}
                className="rounded-xl border border-brand-border bg-white px-1 py-2.5 text-center shadow-[0_1px_2px_rgba(17,29,55,0.04)]"
              >
                <p className="text-[10px] md:text-[11px] text-brand-muted mb-1 whitespace-nowrap">{b.label}</p>
                <p className={`text-[16px] md:text-[18px] font-extrabold leading-none ${count > 0 ? b.color : "text-brand-muted"}`}>
                  {count}<span className="text-[11px] font-semibold text-brand-muted ml-0.5">개</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 순위 목록 타이틀 밴드 ── */}
      <div className="flex items-center justify-between gap-3 px-5 md:px-6 py-3 border-b border-brand-border">
        <div className="flex items-center gap-2">
          <span className="text-[18px]">{meta.emoji}</span>
          <p className="text-[15px] font-bold text-brand-dark">{meta.label} 순위 목록</p>
        </div>
        <span className="text-[12px] text-brand-muted hidden sm:block">행을 클릭하면 키워드별 상세가 열립니다</span>
      </div>

        {/* 컬럼 헤더 */}
        <div className="flex items-center gap-3 px-5 md:px-6 py-2.5 bg-brand-lighter/60 border-b border-brand-border text-[12px] font-bold text-brand-muted">
          <span className="w-4 shrink-0" />
          <span className="w-40 sm:w-44 shrink-0">{isShopping ? "상품명" : "업체명"}</span>
          <span className="hidden sm:block w-28 shrink-0">메인 키워드</span>
          <span className="flex-1 min-w-0">순위 (최근순)</span>
          <span className="hidden md:block w-24 shrink-0 text-right">월 검색량</span>
          <span className="hidden lg:block w-24 shrink-0 text-right">등록일</span>
        </div>

        <div>
          {groups.map((group) => (
            <div key={group.store ?? "__all"} className="border-b border-brand-border last:border-b-0">
              {isShopping && group.store && (
                <div className="flex items-center gap-2.5 px-5 md:px-6 py-2.5 bg-brand-lighter/70 border-b border-brand-border">
                  <span className="h-6 w-6 rounded-md flex items-center justify-center shrink-0" style={{ background: meta.grad }}>
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72" />
                    </svg>
                  </span>
                  <span className="text-[14px] font-extrabold text-brand-dark">{group.store}</span>
                  <span className="text-[12px] font-semibold text-brand-muted">· 상품 {group.items.length}개</span>
                </div>
              )}
              <div className="divide-y divide-brand-border">
                {group.items.map((item) => {
                  const isOpen = expandedId === item.id;
            const main = item.keywords[0];
            const extraCount = item.keywords.length - 1;
            return (
              <div key={item.id}>
                {/* 요약 행 — 업체 대표 키워드 기준 */}
                <button
                  onClick={() => setExpandedId(isOpen ? null : item.id)}
                  className={`w-full text-left px-5 md:px-6 py-3.5 transition-colors hover:bg-brand-lighter flex items-center gap-3 ${isOpen ? "bg-blue-50/40" : ""}`}
                >
                  {/* 펼침 화살표 */}
                  <svg
                    className={`w-4 h-4 text-brand-muted shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>

                  {/* 1. 업체명 (썸네일 + 대표 순위 뱃지 + 이름) */}
                  <div className="w-40 sm:w-44 shrink-0 flex items-center gap-2.5 min-w-0">
                    {/* 요약 행: 썸네일 없이 순위 뱃지만 */}
                    <span
                      className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-white font-extrabold text-[12px]"
                      style={{ background: main.currentRank !== null && main.currentRank <= 10 ? meta.grad : "linear-gradient(135deg,#9CA3AF,#6B7280)" }}
                    >
                      {main.currentRank ?? "-"}
                    </span>
                    <p className="text-[15px] font-bold text-brand-dark truncate">{item.productName}</p>
                  </div>

                  {/* 2. 메인 키워드 (+N개) */}
                  <span className="hidden sm:flex w-28 shrink-0 items-center gap-1 text-[13px] text-brand-sub truncate">
                    <span className="truncate">{main.keyword}</span>
                    {extraCount > 0 && (
                      <span className="shrink-0 text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-brand-lighter text-brand-primary">+{extraCount}</span>
                    )}
                  </span>

                  {/* 3. 순위 테이블 (가장 최근 날짜가 왼쪽) — 대표 키워드 */}
                  <div className="flex-1 min-w-0 overflow-x-auto">
                    <div className="flex items-stretch w-max">
                      {main.history
                        .map((rank, i) => ({ date: HISTORY_DATES[i] ?? "", rank }))
                        .reverse()
                        .map((d, i) => (
                          <div
                            key={i}
                            className={`flex flex-col items-center justify-center px-2.5 py-1 min-w-[46px] ${i > 0 ? "border-l border-brand-border" : ""}`}
                          >
                            <span className="text-[10px] text-brand-muted leading-none mb-0.5">{d.date}</span>
                            <span className={`text-[13px] font-bold leading-none ${i === 0 ? "text-brand-primary" : "text-brand-dark"}`}>
                              {d.rank === null ? "-" : `${d.rank}위`}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* 4. 월 검색량 */}
                  <span className="hidden md:block w-24 shrink-0 text-right text-[13px] font-semibold text-brand-dark">
                    {main.monthlyVolume.toLocaleString()}
                  </span>

                  {/* 5. 등록날짜 */}
                  <span className="hidden lg:block w-24 shrink-0 text-right text-[13px] text-brand-sub">{main.registeredAt}</span>
                </button>

                {/* 아코디언 상세 — 업체 정보 + 키워드별 카드 */}
                {isOpen && (
                  <div className="px-5 md:px-6 pb-5 pt-4 bg-brand-lighter/30 border-t border-brand-border space-y-4">
                    {/* 상세 상단: 큰 썸네일(왼쪽) + 업체명·ID(오른쪽) */}
                    <div className="flex items-start gap-4">
                      {/* 큰 썸네일 */}
                      <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden bg-white border border-brand-border flex items-center justify-center shrink-0">
                        {item.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.thumbnail} alt={item.productName} className="h-full w-full object-cover" />
                        ) : (
                          <svg className="w-8 h-8 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                        )}
                      </div>
                      {/* 업체명 + ID */}
                      <div className="min-w-0 flex-1 pt-0.5">
                        {isShopping && item.store && (
                          <p className="text-[12px] font-semibold text-brand-muted truncate mb-0.5">{item.store}</p>
                        )}
                        <p className="text-[17px] font-bold text-brand-dark truncate">{item.productName}</p>
                        {!isShopping && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-brand-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            {item.targetUrl.startsWith("http") ? (
                              <a href={item.targetUrl} target="_blank" rel="noopener noreferrer" className="text-[13px] text-brand-primary truncate hover:underline">
                                {item.targetUrl}
                              </a>
                            ) : (
                              <span className="text-[13px] text-brand-sub font-mono truncate">ID: {item.targetUrl}</span>
                            )}
                          </div>
                        )}
                        <p className="mt-1 text-[12px] font-semibold text-brand-muted">키워드 {item.keywords.length}개</p>
                      </div>
                    </div>

                    {/* 키워드별 상세 카드 */}
                    {item.keywords.map((k, ki) => {
                      const firstRank = k.history.find((v): v is number => v !== null) ?? null;
                      const kDiff = k.currentRank !== null && k.prevRank !== null ? k.prevRank - k.currentRank : null;
                      return (
                        <div key={ki} className="bg-white rounded-xl border border-brand-border p-4 space-y-3">
                          {/* 키워드 헤더 */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-white font-extrabold text-[13px]"
                                style={{ background: k.currentRank !== null && k.currentRank <= 10 ? meta.grad : "linear-gradient(135deg,#E5E7EB,#D1D5DB)" }}
                              >
                                {k.currentRank ?? "-"}
                              </span>
                              <div className="min-w-0">
                                <p className="text-[15px] font-bold text-brand-dark truncate">{k.keyword}</p>
                                {k.productUrl && (
                                  <a href={k.productUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 max-w-full text-[12px] text-brand-primary hover:underline">
                                    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                    <span className="truncate">상품 링크</span>
                                  </a>
                                )}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[11px] text-brand-sub">현재 순위</p>
                              <p className="text-[22px] font-extrabold leading-tight" style={{ color: meta.color }}>
                                {k.currentRank ?? "-"}
                                <span className="text-[13px] font-medium text-brand-sub ml-0.5">위</span>
                              </p>
                            </div>
                          </div>

                          {/* 지표 — 부가 지표 있으면 좌/우 분할, 없으면(쇼핑) 한 줄 5열 */}
                          <div className={k.metrics && k.metrics.length > 0 ? "grid grid-cols-1 lg:grid-cols-2 gap-3 items-start" : ""}>
                            {/* 기본 지표 — 박스 대신 선 구분 표 (헤더행 + 값행) */}
                            {(() => {
                              const basic = [
                                { label: "월 검색량", value: k.monthlyVolume.toLocaleString() },
                                { label: "등록일", value: k.registeredAt },
                                { label: "최초 순위", value: firstRank !== null ? `${firstRank}위` : "-" },
                                { label: "오늘 순위", value: k.currentRank !== null ? `${k.currentRank}위` : "-" },
                                { label: "순위 변동", value: kDiff === null ? "-" : kDiff > 0 ? `▲ ${kDiff}` : kDiff < 0 ? `▼ ${Math.abs(kDiff)}` : "-" },
                              ];
                              return (
                                <div className="grid rounded-lg border border-brand-border overflow-hidden" style={{ gridTemplateColumns: `repeat(${basic.length}, minmax(0, 1fr))` }}>
                                  {basic.map((m, i) => (
                                    <div key={`h-${i}`} className={`px-1 md:px-2 py-1.5 text-center text-[10px] md:text-[12px] font-bold text-brand-muted bg-brand-lighter border-b border-brand-border ${i > 0 ? "border-l border-brand-border" : ""}`}>
                                      {m.label}
                                    </div>
                                  ))}
                                  {basic.map((m, i) => (
                                    <div key={`v-${i}`} className={`px-1 md:px-2 py-2 text-center ${i > 0 ? "border-l border-brand-border" : ""}`}>
                                      <p className="text-[12px] md:text-[14px] font-bold text-brand-dark leading-none break-all">{m.value}</p>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}

                            {/* 오른쪽: 부가 지표 (방문자리뷰/블로그리뷰/N1~N3) */}
                            {k.metrics && k.metrics.length > 0 && (
                              <div
                                className="grid rounded-lg border border-brand-border overflow-hidden"
                                style={{ gridTemplateColumns: `repeat(${k.metrics.length}, minmax(0, 1fr))` }}
                              >
                                {k.metrics.map((mt, i) => (
                                  <div key={`h-${i}`} className={`px-1 md:px-2 py-1.5 text-center text-[10px] md:text-[12px] font-bold text-brand-muted bg-brand-lighter border-b border-brand-border ${i > 0 ? "border-l border-brand-border" : ""}`}>
                                    {mt.label}
                                  </div>
                                ))}
                                {k.metrics.map((mt, i) => (
                                  <div key={`v-${i}`} className={`px-1 md:px-2 py-2 text-center ${i > 0 ? "border-l border-brand-border" : ""}`}>
                                    <p className="text-[11px] md:text-[14px] font-bold text-brand-dark leading-none break-all">{mt.value}</p>
                                    <p className={`text-[9px] md:text-[12px] font-semibold leading-tight mt-1 ${diffClass(mt.diff)} break-all`}>{mt.diff}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* 순위 추이 — 풀와이드 + 기간 탭(7일/30일/전체) */}
                          <div className="border-t border-brand-border pt-3">
                            <PeriodRankChart base={k.history} color={meta.color} uid={`${item.id}-${ki}`} />
                          </div>
                        </div>
                      );
                    })}

                    {/* 플랫폼별 안내 */}
                    <div className="bg-white rounded-xl border border-brand-border px-3.5 py-3">
                      <p className="text-[13px] font-bold text-brand-dark mb-1.5">플랫폼 순위 기준 안내</p>
                      <div className="space-y-1">
                        {(activePlatform === "naver_place"
                          ? [
                              "검색 키워드 입력 후 플레이스 탭 기준 순위입니다.",
                              "지역 + 키워드 조합으로 순위가 결정됩니다.",
                              "저장/길찾기/리뷰 미션 수행 시 순위 상승에 유리합니다.",
                            ]
                          : [
                              "네이버쇼핑 검색 결과 내 상품 순위입니다.",
                              "통합스토어 / 가격비교 각각 순위가 다릅니다.",
                              "클릭수, 구매전환율이 순위에 영향을 미칩니다.",
                            ]
                        ).map((t, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <div className="h-1 w-1 rounded-full mt-[7px] shrink-0" style={{ background: meta.color }} />
                            <p className="text-[12px] text-brand-sub leading-relaxed">{t}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 모달 ── */}
      {showModal && (
        <AddKeywordModal platform={activePlatform} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
