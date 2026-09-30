"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NaverPlacePin, NaverShoppingTile, CoupangBurst } from "@/components/ui/channel-logos";
import { Sparkline } from "@/components/ui/metrics";
import { addRankKeyword } from "@/app/(platform)/marketing/actions";
import {
  Area, CartesianGrid, ComposedChart, LabelList, Line,
  ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

/* ── Types ── */
type Platform = "naver_place" | "naver_shopping" | "coupang";

/** 화면 플랫폼 값 → DB rank_platform enum */
const DB_PLATFORM: Record<Platform, "place" | "shopping" | "coupang"> = {
  naver_place: "place",
  naver_shopping: "shopping",
  coupang: "coupang",
};

/* 플랫폼 ↔ 사이드바 라우트 매핑 */
const PLATFORM_ROUTE: Record<Platform, string> = {
  naver_place: "/marketing/rank/place",
  naver_shopping: "/marketing/rank/shopping",
  coupang: "/marketing/rank/coupang",
};

// 업체 하나에 속한 개별 키워드의 순위 정보
// 방문자리뷰/블로그리뷰 등 부가 지표 (값 + 전일 대비 변동)
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

// 방문자리뷰 / 블로그리뷰 지표 묶음 (값, 전일 대비 변동)
const pm = (vr: string, vrd: string, br: string, brd: string): KeywordMetric[] => [
  { label: "방문자리뷰", value: vr, diff: vrd },
  { label: "블로그리뷰", value: br, diff: brd },
];

// 지표 변동 색상: 증가(+) 빨강, 감소(-숫자) 파랑, 변동없음("-") 회색
function diffClass(diff: string): string {
  if (diff === "-" || diff === "") return "text-brand-muted";
  return diff.startsWith("-") ? "text-blue-500" : "text-red-500";
}

/* 순위 분포 버킷 (오늘 순위 기준).
   ⚠️ 구간은 겹치면 안 된다 — 예전 표(1~3·1~5·1~10·1~20·6~20…)는 한 키워드가 여러 칸에 동시에 잡혀
   합이 전체 개수와 맞지 않았고, 칸을 눌러 거르는 필터도 만들 수 없었다. */
const RANK_BUCKETS: { key: string; label: string; test: (r: number | null) => boolean }[] = [
  { key: "1-10",    label: "1~10위",   test: (r) => r !== null && r >= 1 && r <= 10 },
  { key: "11-20",   label: "11~20위",  test: (r) => r !== null && r >= 11 && r <= 20 },
  { key: "21-50",   label: "21~50위",  test: (r) => r !== null && r >= 21 && r <= 50 },
  { key: "51-100",  label: "51~100위", test: (r) => r !== null && r >= 51 && r <= 100 },
  { key: "101-200", label: "101~200위", test: (r) => r !== null && r >= 101 && r <= 200 },
  { key: "201-300", label: "201~300위", test: (r) => r !== null && r >= 201 && r <= 300 },
  { key: "out",     label: "순위밖",    test: (r) => r === null || r > 300 },
];

/* [SPEC:rank-group] 순위 그룹 — 폴더형이다. 항목 하나는 그룹 하나에만 속한다.
   태그형(여러 그룹에 걸침)으로 하면 "이 그룹에서 빼면 어디로 가나"가 매번 모호해지고
   합계·분포 숫자가 중복 집계된다. */
type RankGroup = { id: number; name: string; platform: Platform };

/* 페이징 — 모바일 5 / 그 외 10 (목업과 동일) */
function usePageSize() {
  const [size, setSize] = useState(10);
  useEffect(() => {
    const calc = () => setSize(document.documentElement.clientWidth <= 700 ? 5 : 10);
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return size;
}

/* ── Mock Data ── */
const PLATFORM_META: Record<Platform, {
  label: string; color: string; grad: string; Logo: (p: { size?: number }) => React.ReactElement; placeholder: string;
  urlLabel: string; urlPlaceholder: string;
  urlFieldLabel: string; urlInputPlaceholder: string;
  exampleUrl: string; exampleId: string;
  urlRegex: RegExp; keywordPlaceholder: string;
}> = {
  naver_place: {
    label: "네이버 플레이스",
    color: "#2452EB",
    grad: "var(--gradient-point)",
    Logo: NaverPlacePin,
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
    color: "#2452EB",
    grad: "var(--gradient-point)",
    Logo: NaverShoppingTile,
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
  coupang: {
    label: "쿠팡",
    color: "#2452EB",
    grad: "var(--gradient-point)",
    Logo: CoupangBurst,
    placeholder: "예) 무선 청소기, 캠핑 의자",
    urlLabel: "상품 URL 또는 상품 ID",
    urlPlaceholder: "https://www.coupang.com/vp/products/...  또는  상품 ID",
    urlFieldLabel: "쿠팡 상품 주소(URL) 혹은 ID",
    urlInputPlaceholder: "상품 URL 또는 상품 ID를 입력하세요",
    exampleUrl: "https://www.coupang.com/vp/products/7654321098",
    exampleId: "7654321098",
    urlRegex: /products\/(\d+)/,
    keywordPlaceholder: "상품이 노출되길 원하는 목표 검색어",
  },
};

const MOCK_DATA: Record<Platform, RankItem[]> = {
  naver_place: [
    {
      id: 1, productName: "홍길동 칼국수", targetUrl: "1234567890", checkedAt: "10분 전", status: "active",
      keywords: [
        { keyword: "마포 맛집",   currentRank: 3,  prevRank: 5,  bestRank: 2,  history: [18, 12, 8, 7, 5, 5, 3],   monthlyVolume: 4080, registeredAt: "2026-06-23", metrics: pm("926", "+3", "479", "-") },
        { keyword: "마포 칼국수", currentRank: 6,  prevRank: 8,  bestRank: 5,  history: [20, 15, 12, 9, 8, 8, 6],   monthlyVolume: 2210, registeredAt: "2026-06-23", metrics: pm("926", "+3", "479", "-") },
        { keyword: "공덕 맛집",   currentRank: 11, prevRank: 11, bestRank: 9,  history: [22, 18, 15, 13, 11, 11, 11], monthlyVolume: 3300, registeredAt: "2026-06-25", metrics: pm("926", "+3", "479", "-") },
      ],
    },
    {
      id: 2, productName: "블루보틀 홍대점", targetUrl: "9876543210", checkedAt: "10분 전", status: "active",
      keywords: [
        { keyword: "홍대 카페",   currentRank: 7, prevRank: 6, bestRank: 4, history: [10, 9, 7, 6, 8, 6, 7], monthlyVolume: 12500, registeredAt: "2026-06-20", metrics: pm("1342", "+12", "880", "+5") },
        { keyword: "연남동 카페", currentRank: 4, prevRank: 5, bestRank: 3, history: [12, 9, 7, 6, 5, 5, 4],  monthlyVolume: 6700,  registeredAt: "2026-06-20", metrics: pm("1342", "+12", "880", "+5") },
      ],
    },
    {
      id: 3, productName: "애니타임 강남점", targetUrl: "1122334455", checkedAt: "10분 전", status: "active",
      keywords: [
        { keyword: "강남 헬스장", currentRank: 15, prevRank: 18, bestRank: 10, history: [30, 25, 22, 20, 18, 18, 15], monthlyVolume: 8300, registeredAt: "2026-06-18", metrics: pm("612", "+8", "203", "+2") },
        { keyword: "강남역 PT",  currentRank: 9,  prevRank: 12, bestRank: 7,  history: [25, 20, 16, 14, 12, 12, 9],  monthlyVolume: 4500, registeredAt: "2026-06-18", metrics: pm("612", "+8", "203", "+2") },
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
  coupang: [
    // ── 셀러(스토어): 리빙무드 — 상품 2개 ──
    {
      id: 1, store: "리빙무드", productName: "극세사 차렵이불 SS", targetUrl: "https://www.coupang.com/vp/products/7654321098", checkedAt: "12분 전", status: "active",
      keywords: [
        { keyword: "차렵이불",   currentRank: 5,  prevRank: 9,  bestRank: 3,  history: [28, 21, 16, 12, 9, 7, 5],   monthlyVolume: 21400, registeredAt: "2026-06-22", productUrl: "https://www.coupang.com/vp/products/7654321098" },
        { keyword: "극세사 이불", currentRank: 9,  prevRank: 11, bestRank: 7,  history: [24, 20, 17, 14, 12, 11, 9], monthlyVolume: 13600, registeredAt: "2026-06-22", productUrl: "https://www.coupang.com/vp/products/7654321100" },
      ],
    },
    {
      id: 2, store: "리빙무드", productName: "경추 라텍스 베개", targetUrl: "https://www.coupang.com/vp/products/7654321099", checkedAt: "12분 전", status: "active",
      keywords: [
        { keyword: "경추 베개",  currentRank: 13, prevRank: 17, bestRank: 10, history: [38, 32, 27, 22, 19, 17, 13], monthlyVolume: 9800, registeredAt: "2026-06-20", productUrl: "https://www.coupang.com/vp/products/7654321099" },
      ],
    },
    // ── 셀러(스토어): 데일리핏 — 상품 2개 ──
    {
      id: 3, store: "데일리핏", productName: "남성 무지 반팔티 3팩", targetUrl: "https://www.coupang.com/vp/products/6543210987", checkedAt: "12분 전", status: "active",
      keywords: [
        { keyword: "남성 반팔티", currentRank: 7,  prevRank: 6,  bestRank: 4,  history: [16, 12, 9, 7, 8, 6, 7],   monthlyVolume: 28900, registeredAt: "2026-06-19", productUrl: "https://www.coupang.com/vp/products/6543210987" },
        { keyword: "무지 반팔",   currentRank: 11, prevRank: 13, bestRank: 8,  history: [30, 24, 20, 16, 14, 13, 11], monthlyVolume: 15200, registeredAt: "2026-06-19", productUrl: "https://www.coupang.com/vp/products/6543210988" },
      ],
    },
    {
      id: 4, store: "데일리핏", productName: "기능성 냉감 언더셔츠", targetUrl: "https://www.coupang.com/vp/products/6543210989", checkedAt: "12분 전", status: "active",
      keywords: [
        { keyword: "냉감 언더셔츠", currentRank: 18, prevRank: 15, bestRank: 12, history: [35, 30, 26, 22, 18, 15, 18], monthlyVolume: 7300, registeredAt: "2026-06-18", productUrl: "https://www.coupang.com/vp/products/6543210989" },
      ],
    },
    // ── 셀러(스토어): 그린키친 — 상품 1개 ──
    {
      id: 5, store: "그린키친", productName: "인덕션 프라이팬 3종 세트", targetUrl: "9012345678", checkedAt: "집계 중", status: "paused",
      keywords: [
        { keyword: "인덕션 프라이팬", currentRank: null, prevRank: null, bestRank: 22, history: [42, 38, 33, 28, null, null, null], monthlyVolume: 11800, registeredAt: "2026-06-15", productUrl: "https://www.coupang.com/vp/products/9012345678" },
        { keyword: "프라이팬 세트",   currentRank: 26,   prevRank: 29,   bestRank: 20, history: [48, 43, 38, 33, 30, 29, 26],   monthlyVolume: 8100, registeredAt: "2026-06-15", productUrl: "https://www.coupang.com/vp/products/9012345679" },
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
  const [error, setError] = useState<string | null>(null);

  // 등록한 키워드는 어드민 "키워드 순위" 화면에서 관리·집계된다
  const handleAdd = async () => {
    if (!keyword.trim() || !name.trim() || !targetUrl.trim()) return;
    setError(null);
    setSaving(true);
    const res = await addRankKeyword({
      platform: DB_PLATFORM[platform],
      keyword,
      targetName: name,
      targetUrl,
    });
    setSaving(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }
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
                {/* 채널 심볼 자체가 색을 가지므로 그라디언트 타일을 깔지 않는다 —
                    두 색이 겹치면 심볼이 안 읽힌다 */}
                <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-brand-light">
                  <meta.Logo size={22} />
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
                  className="w-full px-4 py-3 border border-brand-border rounded-xl text-[16px] bg-brand-lighter focus:outline-none focus:border-[color:var(--point-500)] focus:bg-white transition-all"
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
                    className="w-full pl-9 pr-4 py-3 border border-brand-border rounded-xl text-[15px] bg-brand-lighter focus:outline-none focus:border-[color:var(--point-500)] focus:bg-white transition-all"
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
                  className="w-full px-4 py-3 border border-brand-border rounded-xl text-[16px] bg-brand-lighter focus:outline-none focus:border-[color:var(--point-500)] focus:bg-white transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] font-semibold text-red-500">
                {error}
              </p>
            )}

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
const SAMPLE_COUPANG_STORES = ["리빙무드", "데일리핏", "그린키친", "베스트홈", "스마트리빙", "데일리셀렉트"];
function lookupStoreName(platform: Platform, id: string): string | null {
  if (KNOWN_STORES[id]) return KNOWN_STORES[id];
  if (!/^\d{6,}$/.test(id)) return null;
  const list = platform === "naver_place" ? SAMPLE_PLACE_STORES : platform === "coupang" ? SAMPLE_COUPANG_STORES : SAMPLE_SHOPPING_STORES;
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

/** 순위 추이 툴팁 — 마우스를 올린 날의 순위와 전날 대비 증감을 같이 보여준다. */
function RankTooltip({
  active, payload, color,
}: {
  active?: boolean;
  payload?: { payload: { label: string; rank: number | null; diff: number | null } }[];
  color: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  if (d.rank === null) return null;
  return (
    <div className="rounded-xl border border-brand-border bg-white px-3 py-2 shadow-[0_4px_16px_rgba(17,29,55,0.10)]">
      <p className="text-[12px] text-brand-sub mb-0.5">{d.label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[16px] font-extrabold tabular-nums" style={{ color }}>{d.rank}위</span>
        {d.diff !== null && d.diff !== 0 && (
          // 순위는 숫자가 작아질수록 좋다 — diff 가 음수면 상승이다
          <span className={`text-[12px] font-bold ${d.diff < 0 ? "text-emerald-600" : "text-red-500"}`}>
            {d.diff < 0 ? "▲" : "▼"} {Math.abs(d.diff)}
          </span>
        )}
      </div>
    </div>
  );
}

/* 순위 추이 — 기간 탭(7일/30일/전체) + 날짜·순위 칩 + 풀와이드 그래프.
   호버 액션(툴팁·점선 커서·확대되는 점)이 필요해 직접 그리던 SVG 를 recharts 로 바꿨다.
   순위는 1위가 위로 가야 하므로 Y축을 reversed 로 뒤집는다. */
type ReviewCount = { visit?: number | null; blog?: number | null };

export function PeriodRankChart({
  base,
  color,
  uid,
  reviews,
}: {
  base: (number | null)[];
  color: string;
  uid: string;
  /** 네이버 플레이스만 — base 와 같은 날짜 순서의 방문자(방)·블로그(블) 리뷰 수. 주면 날짜 칩 아래에 표시한다 */
  reviews?: ReviewCount[];
}) {
  const [days, setDays] = useState(7);
  const series = buildRankSeries(base, days);
  const n = series.length;
  const valid = series.filter((s): s is { rank: number; label: string } => s.rank !== null);
  const chips = [...series].reverse();
  // 칩과 같은 칸에 맞춘다 — 기록보다 기간이 길면 앞쪽은 비운다
  const reviewChips = reviews
    ? [...Array<ReviewCount | undefined>(Math.max(0, n - reviews.length)).fill(undefined), ...reviews.slice(-n)].reverse()
    : null;

  // 전날 대비 증감을 미리 붙여 둔다 (툴팁에서 쓴다)
  const data = series.map((s, i) => {
    const prev = i > 0 ? series[i - 1].rank : null;
    return { ...s, diff: s.rank !== null && prev !== null ? s.rank - prev : null };
  });

  const maxV = valid.length ? Math.max(...valid.map((v) => v.rank)) : 10;
  const minV = valid.length ? Math.min(...valid.map((v) => v.rank)) : 1;
  const pad = Math.max(1, Math.round((maxV - minV || 1) * 0.25));
  const last = data[n - 1];

  // 점이 많아지면 전부 찍기엔 빽빽하다 — 라벨과 점을 같은 간격으로 솎는다
  const dotStep = n > 20 ? Math.max(1, Math.ceil(n / 14)) : 1;
  const showDot = (i: number) => i % dotStep === 0 || i === n - 1;

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
        <div className="flex items-stretch gap-1 w-max">
          {chips.map((d, i) => (
            <div key={i} className={`flex flex-col items-center justify-center px-2.5 py-1 min-w-[44px] shrink-0 ${i > 0 ? "border-l border-brand-border" : ""}`}>
              <span className="text-[10px] text-brand-muted leading-none mb-0.5">{d.label}</span>
              <span className={`text-[12px] font-bold leading-none ${i === 0 ? "text-[color:var(--point-500)]" : "text-brand-dark"}`}>{d.rank === null ? "-" : `${d.rank}위`}</span>
              {reviewChips && (
                <>
                  <span className="mt-1 text-[10px] text-brand-muted leading-none tabular-nums">방 {reviewChips[i]?.visit != null ? reviewChips[i]!.visit!.toLocaleString() : "—"}</span>
                  <span className="mt-0.5 text-[10px] text-brand-muted leading-none tabular-nums">블 {reviewChips[i]?.blog != null ? reviewChips[i]!.blog!.toLocaleString() : "—"}</span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      {valid.length < 2 ? (
        <div className="flex items-center justify-center h-[180px] text-brand-muted text-[15px]">데이터 수집 중...</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={data} margin={{ top: 28, right: 24, left: 8, bottom: 8 }}>
            <defs>
              <linearGradient id={`prcFill-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.16} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
              {/* 배경 도트 그리드 — 면이 비어 보이지 않게 아주 옅게 깐다 */}
              <pattern id={`prcDots-${uid}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="#C9D2E0" fillOpacity="0.35" />
              </pattern>
              <filter id={`prcDotShadow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="rgba(17,29,55,0.28)" />
              </filter>
            </defs>

            <rect x="0" y="0" width="100%" height="100%" fill={`url(#prcDots-${uid})`} style={{ pointerEvents: "none" }} />

            <CartesianGrid strokeDasharray="4 8" stroke="#E2E6ED" horizontal vertical={false} />

            {/* 최신 지점 기준선 — 지금 위치가 어디인지 한눈에 */}
            {last?.rank !== null && (
              <ReferenceLine x={last.label} stroke={color} strokeDasharray="4 4" strokeWidth={1} strokeOpacity={0.5} />
            )}

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#99A0AC" }}
              tickMargin={10}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis reversed hide domain={[Math.max(1, minV - pad), maxV + pad]} />

            <Tooltip
              content={<RankTooltip color={color} />}
              cursor={{ stroke: "#99A0AC", strokeDasharray: "3 3", strokeOpacity: 0.6 }}
            />

            {/* Y축을 뒤집었으므로 기준선(baseValue)을 직접 지정하지 않으면
                면이 위쪽(=1위 방향)으로 채워진다. 도메인 아래끝을 바닥으로 잡아 선 아래를 채운다. */}
            <Area
              type="monotone"
              dataKey="rank"
              baseValue={maxV + pad}
              stroke="none"
              fill={`url(#prcFill-${uid})`}
              connectNulls
              isAnimationActive={false}
              activeDot={false}
            />
            <Line
              type="monotone"
              dataKey="rank"
              stroke={color}
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              connectNulls
              isAnimationActive={false}
              dot={(props) => {
                const { cx, cy, index, payload } = props as { cx: number; cy: number; index: number; payload: { rank: number | null } };
                if (payload.rank === null || !showDot(index)) return <g key={`d${index}`} />;
                return <circle key={`d${index}`} cx={cx} cy={cy} r={4} fill="#FFFFFF" stroke={color} strokeWidth={2} />;
              }}
              activeDot={{
                r: 6,
                fill: "#FFFFFF",
                stroke: color,
                strokeWidth: 2.5,
                filter: `url(#prcDotShadow-${uid})`,
              }}
            >
              <LabelList
                dataKey="rank"
                position="top"
                offset={14}
                content={(props) => {
                  const { x, y, value, index } = props as { x: number; y: number; value: number | null; index: number };
                  if (value === null || value === undefined || !showDot(index)) return null;
                  return (
                    <text x={x} y={y} dy={-4} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#4E5968">
                      {value}위
                    </text>
                  );
                }}
              />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

/* ── Page ── */
export default function RankManagement({
  initialPlatform = "naver_place",
  membershipLive = true,
  freeLimit = 1,
  banner,
}: {
  initialPlatform?: Platform;
  /** 멤버십 이용중인가 — false 면 먼저 등록한 freeLimit 개만 열리고 나머지는 잠긴다 */
  membershipLive?: boolean;
  freeLimit?: number;
  /**
   * 제목 아래에 끼워 넣을 배너(멤버십 현황).
   * 바깥에서 먼저 렌더하면 제목보다 위에 놓인다 — 화면의 이름이 맨 위여야
   * "여기가 어디인지"를 먼저 읽는다. 순서를 이 컴포넌트가 정하도록 프롭으로 받는다.
   */
  banner?: React.ReactNode;
}) {
  const router = useRouter();
  const [activePlatform, setActivePlatform] = useState<Platform>(initialPlatform);
  // 라우트(사이드바 이동 등)로 initialPlatform이 바뀌면 탭도 동기화
  useEffect(() => { setActivePlatform(initialPlatform); }, [initialPlatform]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [keywords, setKeywords] = useState(["", "", ""]);
  const [targetId, setTargetId] = useState("");
  const [registering, setRegistering] = useState(false);
  const [registerDone, setRegisterDone] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  /* ── 목록 조작 상태 ──
     MOCK_DATA 를 그대로 그리면 삭제·재측정·그룹 편성이 화면에 남지 않는다. state 로 들고 다닌다. */
  const [data, setData] = useState<Record<Platform, RankItem[]>>(MOCK_DATA);
  const [search, setSearch] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [distFilter, setDistFilter] = useState<string | null>(null);
  /* 페이지 번호는 "어떤 목록의 몇 페이지인지"를 같이 들고 다닌다.
     탭·검색·분포가 바뀌면 키가 달라져 저절로 1페이지로 돌아간다 — 효과로 되돌리면 한 프레임 늦어
     없는 페이지의 빈 목록이 먼저 보인다. */
  const [pageState, setPageState] = useState<{ key: string; n: number }>({ key: "", n: 1 });
  const pageSize = usePageSize();
  // 재측정 요청 중인 항목 — 같은 항목을 두 번 요청하지 못하게 잠근다
  const [refreshing, setRefreshing] = useState<Record<number, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);

  /* 그룹(폴더형) */
  const [groupList, setGroupList] = useState<RankGroup[]>([]);
  const [groupOf, setGroupOf] = useState<Record<number, number | null>>({});
  const [groupSeq, setGroupSeq] = useState(500);
  const [groupAddOpen, setGroupAddOpen] = useState(false);
  const [groupNewName, setGroupNewName] = useState("");
  const [groupEditId, setGroupEditId] = useState<number | null>(null);
  // 드래그 중인 대상 — 행(item) 또는 그룹 헤더(group)
  const [drag, setDrag] = useState<{ kind: "item" | "group"; id: number } | null>(null);
  const [dropTarget, setDropTarget] = useState<number | "none" | null>(null);

  // 검색어는 입력할 때마다 다시 그리면 버벅인다 — 220ms 눌러서 반영
  useEffect(() => {
    const t = setTimeout(() => setSearchQ(search.trim().toLowerCase()), 220);
    return () => clearTimeout(t);
  }, [search]);

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast((cur) => (cur === text ? null : cur)), 2600);
  };

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
  const isShopping = activePlatform !== "naver_place";
  const isCoupang = activePlatform === "coupang";
  const unitLabel = isShopping ? "상품" : "키워드";

  const platformItems = data[activePlatform];

  /* [SPEC:rank-membership] 잠금 판정 — 멤버십이 없으면 먼저 등록한 freeLimit 개만 열린다.
     "먼저 등록한 것"이 기준이라 등록일(registeredAt)이 판정 근거다. 채널을 가리지 않고 회원 전체에서 센다. */
  const unlockedIds = (() => {
    if (membershipLive) return null; // null = 전부 열림
    const all = (Object.keys(data) as Platform[]).flatMap((p) => data[p]);
    const ordered = [...all].sort((a, b) => {
      const ka = a.keywords[0]?.registeredAt ?? "";
      const kb = b.keywords[0]?.registeredAt ?? "";
      return ka.localeCompare(kb) || a.id - b.id;
    });
    return new Set(ordered.slice(0, freeLimit).map((i) => i.id));
  })();
  const isLocked = (it: RankItem) => unlockedIds !== null && !unlockedIds.has(it.id);
  const lockedCount = (Object.keys(data) as Platform[])
    .flatMap((p) => data[p])
    .filter(isLocked).length;

  // 대표 키워드의 오늘 순위 — 분포·필터·정렬이 모두 이 값을 본다
  const curRank = (it: RankItem) => it.keywords[0]?.currentRank ?? null;

  // 검색: 업체명(상품명) · 키워드
  const searched = searchQ
    ? platformItems.filter(
        (it) =>
          it.productName.toLowerCase().includes(searchQ) ||
          (it.store ?? "").toLowerCase().includes(searchQ) ||
          it.keywords.some((k) => k.keyword.toLowerCase().includes(searchQ)),
      )
    : platformItems;

  const allKeywords = searched.flatMap((i) => i.keywords);

  // 분포는 검색 결과(searched) 기준으로 세고, 표만 선택 구간으로 좁힌다
  const distCounts = RANK_BUCKETS.map((b) => searched.filter((it) => b.test(curRank(it))).length);
  const filtered = distFilter
    ? searched.filter((it) => RANK_BUCKETS.find((b) => b.key === distFilter)?.test(curRank(it)))
    : searched;

  /* 페이징 — 그룹핑은 현재 페이지 항목 기준이라 페이지가 넘어가면 같은 헤더가 다시 나올 수 있다 */
  const pageKey = `${activePlatform}|${searchQ}|${distFilter ?? ""}`;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const curPage = Math.min(pageState.key === pageKey ? pageState.n : 1, totalPages);
  const setPage = (n: number) => setPageState({ key: pageKey, n });
  const pageItems = filtered.slice((curPage - 1) * pageSize, curPage * pageSize);

  /* [SPEC:rank-group] 그룹 헤더 + 소속 행.
     ⚠️ 빈 그룹도 헤더를 그린다 — 방금 만든 그룹이 화면에서 사라지면 「편성」에 닿을 방법이 없다.
     ⚠️ 미분류는 항상 맨 마지막. */
  const platformGroups = groupList.filter((g) => g.platform === activePlatform);
  const groups: { gid: number | null; name: string | null; items: RankItem[]; empty: boolean }[] = (() => {
    const out = platformGroups.map((g) => ({
      gid: g.id as number | null, name: g.name as string | null,
      items: [] as RankItem[], empty: false,
    }));
    const none = { gid: null as number | null, name: null as string | null, items: [] as RankItem[], empty: false };
    out.push(none);
    for (const it of pageItems) {
      const gid = groupOf[it.id] ?? null;
      const bucket = gid !== null ? out.find((o) => o.gid === gid) : undefined;
      (bucket ?? none).items.push(it);
    }
    // 이 페이지에 항목이 없는 그룹은 접는다. 단 전체 기준 0개(진짜 빈 그룹)는 남긴다.
    return out.filter((o) => {
      if (o.items.length) return true;
      if (o.gid === null) return false;
      const total = platformItems.filter((it) => (groupOf[it.id] ?? null) === o.gid).length;
      if (total) return false;
      o.empty = true;
      return true;
    });
  })();

  const storeCount = isShopping
    ? new Set(searched.map((it) => it.store ?? it.productName)).size
    : searched.length;

  /* [SPEC:rank-refresh] 항목별 재측정 — 같은 항목의 중복 요청을 막는다.
     ⚠️ 전체 갱신 버튼은 두지 않는다: 전 항목 크롤링이 한 번에 돌면 비용·차단 위험이 크다.
     목업은 3초 뒤 오늘 순위(history 마지막)만 바뀌는 데모다. */
  const requestRefresh = (item: RankItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (refreshing[item.id]) {
      showToast(`'${item.keywords[0]?.keyword ?? item.productName}' 는 이미 새로고침을 요청했습니다 · 순위를 확인하고 있어요`);
      return;
    }
    setRefreshing((r) => ({ ...r, [item.id]: true }));
    setTimeout(() => {
      setData((prev) => {
        const next = { ...prev };
        next[activePlatform] = prev[activePlatform].map((it) => {
          if (it.id !== item.id) return it;
          const keywords = it.keywords.map((k, ki) => {
            if (ki !== 0) return k;
            const base = k.currentRank ?? 20;
            const moved = Math.max(1, base + (Math.random() < 0.6 ? -1 : 1) * (1 + Math.floor(Math.random() * 3)));
            const history = [...k.history];
            history[history.length - 1] = moved;
            return { ...k, prevRank: k.currentRank, currentRank: moved, history };
          });
          return { ...it, keywords };
        });
        return next;
      });
      setRefreshing((r) => { const n = { ...r }; delete n[item.id]; return n; });
      showToast(`${item.productName} · 순위를 다시 측정했습니다`);
    }, 3000);
  };

  const deleteItem = (item: RankItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setData((prev) => ({ ...prev, [activePlatform]: prev[activePlatform].filter((it) => it.id !== item.id) }));
    setGroupOf((g) => { const n = { ...g }; delete n[item.id]; return n; });
    if (expandedId === item.id) setExpandedId(null);
    showToast(`${item.productName} · 순위 추적을 삭제했습니다`);
  };

  /* ── 그룹 조작 ── */
  const addGroup = () => {
    const name = groupNewName.trim();
    if (!name) { showToast("그룹 이름을 입력해 주세요"); return; }
    const id = groupSeq + 1;
    setGroupSeq(id);
    setGroupList((gs) => [...gs, { id, name, platform: activePlatform }]);
    setGroupNewName("");
    setGroupAddOpen(false);
    showToast(`'${name}' 그룹을 만들었습니다`);
  };
  const renameGroup = (gid: number) => {
    const cur = groupList.find((g) => g.id === gid);
    const next = window.prompt("그룹 이름", cur?.name ?? "");
    if (next === null) return;
    const name = next.trim();
    if (!name) { showToast("그룹 이름을 입력해 주세요"); return; }
    setGroupList((gs) => gs.map((g) => (g.id === gid ? { ...g, name } : g)));
  };
  const deleteGroup = (gid: number) => {
    setGroupList((gs) => gs.filter((g) => g.id !== gid));
    // 소속 항목은 지우지 않고 미분류로 돌린다
    setGroupOf((m) => {
      const n = { ...m };
      for (const k of Object.keys(n)) if (n[+k] === gid) n[+k] = null;
      return n;
    });
    if (groupEditId === gid) setGroupEditId(null);
    showToast("그룹을 삭제했습니다 · 소속 항목은 미분류로 옮겼습니다");
  };
  const assignGroup = (itemId: number, gid: number | null) =>
    setGroupOf((m) => ({ ...m, [itemId]: gid }));

  /* 그룹 순서는 groupList 배열 순서가 정한다 — 헤더를 끌어 바꾼다.
     ⚠️ "그룹의 첫 항목이 목록에 나오는 순"으로 하면 키워드를 넣을 때마다 그룹 위치가 튄다. */
  const moveGroupBefore = (dragId: number, targetId: number | null) => {
    if (dragId === targetId) return;
    setGroupList((gs) => {
      const arr = [...gs];
      const from = arr.findIndex((g) => g.id === dragId);
      if (from < 0) return gs;
      const [moved] = arr.splice(from, 1);
      const to = targetId === null ? arr.length : arr.findIndex((g) => g.id === targetId);
      arr.splice(to < 0 ? arr.length : to, 0, moved);
      return arr;
    });
  };

  /* ── History Chart ── */
  return (
    // 여백은 ContentArea(본문 컨테이너)와 같은 값을 쓴다. 이 화면만 풀블리드라
    // 여백을 직접 줘야 하는데, 값이 다르면 메뉴를 옮길 때 본문이 좌우로 흔들린다.
    <div className="min-h-full bg-white px-6 md:px-12 lg:px-16 pt-6 md:pt-10 pb-[76px] md:pb-10">

      {/* ── 상단: 브레드크럼 + 제목 + 액션 ──
          배너 안에 제목을 넣었던 구성을 되돌렸다. 운영 사이트는 제목을 평문으로
          두고 배너를 쓰지 않는다 — 화면 이름이 색면에 묻히지 않는다. */}
      <nav className="flex items-center gap-1.5 text-[12.5px] text-brand-muted mb-1.5">
        <Link href="/marketing" className="hover:text-brand-text">홈</Link>
        <span>›</span>
        <span className="text-brand-sub font-medium">통합순위관리</span>
      </nav>

      {/* ⚠️ 전체 갱신 버튼은 두지 않는다 — 전 항목 크롤링이 한 번에 돌면 비용·차단 위험이 크다.
          재측정은 목록의 행별 「새로고침」으로만 한다.
          「순위 추적 추가」도 제목 옆에 두지 않는다 — 같은 버튼이 아래 목록 머리글에
          한 번 더 있어, 화면 하나에 같은 동작이 둘로 보였다. */}
      <div className="min-w-0">
        <h1 className="text-[22px] font-extrabold text-brand-dark leading-tight">통합순위관리</h1>
        <p className="text-[13.5px] text-brand-sub mt-1.5">
          네이버 플레이스·쇼핑, 쿠팡 키워드 순위를 한 페이지에서 추적하세요.
        </p>
      </div>

      {banner && <div className="mt-4">{banner}</div>}

      {/* ── 채널 선택 — 카드 3장. 활성은 파란 테두리 ── */}
      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        {(Object.keys(PLATFORM_META) as Platform[]).map((p) => {
          const m = PLATFORM_META[p];
          const isActive = p === activePlatform;
          return (
            <button
              key={p}
              onClick={() => {
                setActivePlatform(p);
                setExpandedId(null);
                // scroll: false — 채널은 같은 화면에서 보는 범위만 바꾼다
                router.push(PLATFORM_ROUTE[p], { scroll: false });
              }}
              className={`flex flex-col items-start gap-1.5 px-3 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-4 sm:py-3.5 rounded-xl border bg-white text-left transition-colors ${
                isActive
                  ? "border-brand-primary ring-1 ring-brand-primary/25"
                  : "border-brand-border hover:border-brand-border-strong"
              }`}
            >
              <m.Logo size={26} />
              <span className="min-w-0">
                <span className={`block text-[11.5px] sm:text-[12.5px] font-semibold whitespace-nowrap ${isActive ? "text-brand-primary" : "text-brand-sub"}`}>
                  {m.label}
                </span>
                <span className="block text-[20px] font-extrabold text-brand-dark leading-tight tabular-nums">
                  {data[p].length}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* ── 순위 추적 추가 (접이식 패널) ── */}
      {showAddForm && (
        <div className="mt-4 rounded-xl border border-brand-border bg-white overflow-hidden">
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
              type="button"
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

      {/* ── 순위 분포 ──
          운영 사이트처럼 구간마다 작은 카드로 둔다. 구간을 누르면 아래 목록이
          그 구간만 남는다 (개수는 전체 기준 그대로). */}
      <p className="mt-5 mb-2 text-[12.5px] text-brand-sub">
        <b className="font-bold text-brand-dark">{allKeywords.length}개</b> 키워드 추적 중 · 순위 분포
        <span className="text-brand-muted"> (오늘 기준 · 구간을 눌러 필터)</span>
        {distFilter && (
          <button onClick={() => setDistFilter(null)}
            className="ml-2 text-[12px] font-bold text-[color:var(--point-500)] underline">
            필터 해제
          </button>
        )}
      </p>
      <div className="flex items-stretch gap-2 flex-wrap">
        {RANK_BUCKETS.map((b, i) => {
          const count = distCounts[i];
          const on = distFilter === b.key;
          return (
            <button
              key={b.key}
              type="button"
              onClick={() => setDistFilter(on ? null : b.key)}
              className={`min-w-[86px] rounded-lg border bg-white px-3 py-2 text-left transition-colors ${
                on ? "border-brand-primary ring-1 ring-brand-primary/25" : "border-brand-border hover:border-brand-border-strong"
              }`}
            >
              <p className={`text-[11px] whitespace-nowrap ${on ? "text-brand-primary font-bold" : "text-brand-muted"}`}>{b.label}</p>
              <p className={`text-[16px] font-extrabold leading-tight ${
                on ? "text-brand-primary" : count > 0 ? "text-brand-dark" : "text-brand-muted"
              }`}>
                {count}<span className="text-[11px] font-semibold text-brand-muted ml-0.5">개</span>
              </p>
            </button>
          );
        })}
      </div>

      {/* ── 순위 목록 ──
          상자를 두지 않는다. 위 카드(탭·분포)만 면을 가지므로 "지금 보는 범위"와
          "목록"이 나뉘고, 목록은 페이지 위에 그대로 펼쳐진다. */}
      <div className="mt-6 md:mt-8 flex flex-col">

      {isCoupang ? (
        /* 쿠팡은 아직 추적 파이프라인이 없다 — 빈 표를 보여 주면 "내 키워드가 사라졌다"로 읽힌다 */
        <div className="px-6 py-20 text-center">
          <div className="text-[40px] leading-none mb-3">📦</div>
          <p className="text-[17px] font-bold text-brand-dark">쿠팡 순위관리 준비중</p>
          <p className="text-[14px] text-brand-sub mt-1.5 leading-relaxed">
            쿠팡 키워드 순위 추적 기능은 준비 중입니다.<br />
            곧 플레이스·쇼핑처럼 순위를 추적하실 수 있어요.
          </p>
        </div>
      ) : (
      <>
      {/* ── 순위 목록 타이틀 밴드 + 검색 ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap px-5 md:px-6 pt-4 pb-3 border-b border-brand-border">
        <div className="flex items-center gap-2 min-w-0">
          <meta.Logo size={22} />
          <p className="text-[19px] font-extrabold text-brand-dark">{meta.label} 순위 목록</p>
          <span className="text-[12px] text-brand-muted hidden lg:block">행을 클릭하면 순위 추이 그래프와 상세가 열립니다</span>
        </div>
        {/* 오른쪽 — 검색과 추가 버튼을 목록 옆에 둔다.
            ⚠️ 전체 갱신 버튼은 두지 않는다 — 전 항목 크롤링이 한 번에 돌면 비용·차단 위험이 크다.
            재측정은 목록의 행별 「새로고침」으로만 한다. */}
        <div className="flex items-center gap-2">
        <div className="relative">
          <svg className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="M20 20l-3.5-3.5" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isShopping ? "상품명·키워드 검색" : "업체명·키워드 검색"}
            className="w-[220px] pl-9 pr-8 py-2 rounded-lg border border-brand-border text-[13px] bg-white focus:outline-none focus:border-[#2452EB] focus:ring-2 focus:ring-[#2452EB]/15 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} title="지우기"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full flex items-center justify-center text-brand-muted hover:bg-brand-lighter">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )}
        </div>

        <button
          onClick={() => { setShowAddForm(v => !v); setRegisterDone(false); }}
          className="flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-lg text-[13.5px] font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--gradient-point)", boxShadow: "var(--shadow-point)" }}
        >
          <svg className={`w-4 h-4 transition-transform ${showAddForm ? "rotate-45" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          순위 추적 추가
        </button>
        </div>
      </div>

      {/* ── 그룹 바 ──
          안내 문구와 컨트롤을 함께 오른쪽 끝으로 모은다. 양 끝으로 벌리면(justify-between)
          넓은 화면에서 둘 사이가 멀어져 같은 줄의 내용으로 읽히지 않는다. */}
      <div className="flex items-center justify-end gap-3 flex-wrap px-5 md:px-6 py-3 border-b border-brand-border">
        <p className="text-[13px] text-brand-sub">
          {platformGroups.length
            ? <><b className="font-bold text-brand-dark">{platformGroups.length}개 그룹</b>으로 묶어 보고 있습니다</>
            : <b className="font-bold text-brand-dark">키워드별로 그룹 만들기</b>}
        </p>
        {groupAddOpen ? (
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              value={groupNewName}
              onChange={(e) => setGroupNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addGroup(); if (e.key === "Escape") setGroupAddOpen(false); }}
              maxLength={20}
              placeholder="예: 강남점 · 여름 시즌"
              className="w-[180px] px-3 py-2 rounded-lg border border-brand-border text-[13px] focus:outline-none focus:border-[#2452EB]"
            />
            <button onClick={addGroup} className="px-3 py-2 rounded-lg text-[13px] font-bold text-white"
              style={{ background: "var(--gradient-point)" }}>만들기</button>
            <button onClick={() => { setGroupAddOpen(false); setGroupNewName(""); }}
              className="px-3 py-2 rounded-lg text-[13px] font-semibold border border-brand-border text-brand-sub hover:bg-brand-lighter">취소</button>
          </div>
        ) : (
          <button onClick={() => setGroupAddOpen(true)}
            className="px-3.5 py-2 rounded-lg text-[13px] font-bold border border-brand-border bg-white text-brand-text hover:bg-brand-lighter transition-colors">
            + 그룹 만들기
          </button>
        )}
      </div>

        {/* 컬럼 헤더 */}
        <div className="flex items-center gap-3 px-5 md:px-6 pt-3 pb-2 border-b border-brand-border text-[11.5px] font-semibold text-brand-muted">
          <span className="w-4 shrink-0" />
          <span className="w-40 sm:w-44 shrink-0">{isShopping ? "상품명" : "업체명"}</span>
          <span className="hidden sm:block w-28 shrink-0">메인 키워드</span>
          <span className="flex-1 min-w-0">현재 순위 · 7일 추이</span>
          <span className="hidden md:block w-24 shrink-0 text-right">월 검색량</span>
          <span className="hidden lg:block w-24 shrink-0 text-right">등록일</span>
          <span className="w-[132px] shrink-0 text-right">관리</span>
        </div>

        <div>
          {filtered.length === 0 && (
            <p className="px-5 py-12 text-center text-[14px] text-brand-muted">
              {distFilter
                ? `이 순위 구간에 해당하는 ${unitLabel}가 없습니다`
                : searchQ
                  ? `'${search}' 검색 결과가 없습니다`
                  : `추적 중인 ${meta.label} ${unitLabel}가 없습니다`}
            </p>
          )}
          {groups.map((group) => (
            <div
              key={group.gid ?? "__none"}
              className="pb-1"
            >
              {/* ── 그룹 헤더 ──
                  ①키워드 행을 놓으면 그 그룹으로 편입 ②다른 그룹 헤더를 놓으면 순서 변경.
                  ⚠️ 미분류는 끌 수 없고 항상 맨 아래다. */}
              <div
                draggable={group.gid !== null}
                onDragStart={(e) => {
                  if (group.gid === null) return;
                  e.stopPropagation();
                  setDrag({ kind: "group", id: group.gid });
                }}
                onDragEnd={() => { setDrag(null); setDropTarget(null); }}
                onDragOver={(e) => { e.preventDefault(); setDropTarget(group.gid ?? "none"); }}
                onDragLeave={() => setDropTarget(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  if (drag?.kind === "item") assignGroup(drag.id, group.gid);
                  else if (drag?.kind === "group") moveGroupBefore(drag.id, group.gid);
                  setDrag(null);
                  setDropTarget(null);
                }}
                className={`flex items-center gap-2.5 px-5 md:px-6 py-2 rounded-lg mx-3 md:mx-4 transition-colors ${
                  dropTarget === (group.gid ?? "none") ? "bg-[#2452EB]/[0.10]" : "bg-white"
                }`}
              >
                {group.gid !== null && (
                  <span className="cursor-grab text-brand-muted text-[13px] select-none" title="끌어서 그룹 순서 바꾸기">⠿</span>
                )}
                <span className="h-6 w-6 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: group.gid === null ? "linear-gradient(135deg,#C4CBD6,#98A2B3)" : "var(--gradient-point)" }}>
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                </span>
                <span className={`text-[14px] font-extrabold ${group.gid === null ? "text-brand-muted" : "text-brand-dark"}`}>
                  {group.gid === null ? "미분류" : group.name}
                </span>
                <span className="text-[12px] font-semibold text-brand-muted">· {unitLabel} {group.items.length}개</span>
                {dropTarget === (group.gid ?? "none") && (
                  <span className="text-[11px] font-bold text-[color:var(--point-500)]">여기에 놓기</span>
                )}
                {group.gid !== null && (
                  <span className="ml-auto flex items-center gap-1">
                    <button onClick={() => setGroupEditId(group.gid)} title="이 그룹에 넣을 키워드 고르기"
                      className="px-2 py-1 rounded-md text-[11.5px] font-bold border border-brand-border bg-white text-brand-text hover:bg-brand-lighter">편성</button>
                    <button onClick={() => renameGroup(group.gid!)}
                      className="px-2 py-1 rounded-md text-[11.5px] font-bold border border-brand-border bg-white text-brand-text hover:bg-brand-lighter">이름</button>
                    <button onClick={() => deleteGroup(group.gid!)}
                      className="px-2 py-1 rounded-md text-[11.5px] font-bold border border-red-200 bg-white text-red-500 hover:bg-red-50">삭제</button>
                  </span>
                )}
              </div>

              {/* 빈 그룹은 다음에 뭘 해야 하는지 그 자리에서 알려 준다.
                  드래그가 주 경로지만 버튼도 남긴다 — 터치 기기에는 드래그가 없다. */}
              {group.empty && (
                <div className="flex items-center justify-center gap-2 px-5 py-5 text-[13px] text-brand-muted border-b border-brand-border">
                  <span>{unitLabel} 행을 끌어다 놓으세요</span>
                  <span className="text-brand-border">또는</span>
                  <button onClick={() => setGroupEditId(group.gid)}
                    className="px-2.5 py-1 rounded-md text-[12px] font-bold border border-brand-border bg-white text-brand-text hover:bg-brand-lighter">
                    편성에서 고르기
                  </button>
                </div>
              )}

              <div>
                {group.items.map((item) => {
                  const locked = isLocked(item);
                  const isOpen = !locked && expandedId === item.id;
            const main = item.keywords[0];
            const extraCount = item.keywords.length - 1;
            /* 요약 행의 순위 표시용 파생값.
               history 는 과거→현재 순이라 마지막이 최신이다.
               delta 는 "전일 대비 몇 계단 올랐나" — 순위는 작을수록 좋으므로 (전일 - 오늘). */
            const hist = main.history;
            const prevRank = hist.length >= 2 ? hist[hist.length - 2] : null;
            const delta =
              main.currentRank !== null && prevRank !== null ? prevRank - main.currentRank : null;
            /* 스파크라인은 위로 갈수록 좋아 보여야 하는데 순위는 반대다. 부호를 뒤집어 그린다. */
            const sparkValues = hist.filter((r): r is number => r !== null).map((r) => -r);
            return (
              <div key={item.id}>
                {/* 요약 행 — 업체 대표 키워드 기준.
                    행을 그룹 헤더로 끌어다 놓으면 그 그룹으로 옮겨진다. */}
                <div
                  role="button"
                  tabIndex={locked ? -1 : 0}
                  draggable={!locked}
                  onDragStart={() => setDrag({ kind: "item", id: item.id })}
                  onDragEnd={() => { setDrag(null); setDropTarget(null); }}
                  onClick={() => { if (!locked) setExpandedId(isOpen ? null : item.id); }}
                  onKeyDown={(e) => {
                    if (locked) return;
                    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpandedId(isOpen ? null : item.id); }
                  }}
                  className={`w-full text-left px-5 md:px-6 py-3.5 transition-colors flex items-center gap-3 ${
                    locked ? "opacity-70 cursor-default" : "cursor-pointer hover:bg-white"
                  } ${isOpen ? "bg-[#2452EB]/[0.05]" : ""} ${drag?.kind === "item" && drag.id === item.id ? "opacity-40" : ""}`}
                >
                  {/* 펼침 화살표 (잠긴 행은 자물쇠) */}
                  {locked ? (
                    <span className="w-4 shrink-0 text-[13px] leading-none" title="멤버십이 없어 잠긴 키워드">🔒</span>
                  ) : (
                    <svg
                      className={`w-4 h-4 text-brand-muted shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  )}

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
                      <span className="shrink-0 text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-brand-lighter text-[color:var(--point-500)]">+{extraCount}</span>
                    )}
                  </span>

                  {/* 3. 순위 테이블 (가장 최근 날짜가 왼쪽) — 대표 키워드.
                      ⚠️ 잠긴 행도 목록에서 지우지 않는다 — 지우면 "내가 등록한 게 사라졌다"로 읽힌다.
                      잠겼다는 사실과 푸는 방법을 보여줘야 한다. */}
                  <div className="flex-1 min-w-0 flex items-center gap-2.5 sm:gap-3.5">
                    {locked ? (
                      <span className="text-[13px] font-semibold text-brand-muted truncate">
                        멤버십이 필요합니다 · 순위 추적이 중지되었습니다
                      </span>
                    ) : (
                      <>
                        {/* 현재 순위 + 전일 대비 */}
                        <span className="shrink-0 flex items-baseline gap-1.5">
                          <span className="text-[17px] font-extrabold leading-none tabular-nums text-brand-dark">
                            {main.currentRank === null ? "-" : `${main.currentRank}위`}
                          </span>
                          {delta !== null && delta !== 0 && (
                            <span
                              className={`inline-flex items-center gap-0.5 text-[12px] font-bold leading-none ${
                                delta > 0 ? "text-brand-success" : "text-brand-error"
                              }`}
                              title={`전일 대비 ${Math.abs(delta)}계단 ${delta > 0 ? "상승" : "하락"}`}
                            >
                              <svg className={`w-3 h-3 ${delta > 0 ? "" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                              </svg>
                              {Math.abs(delta)}
                            </span>
                          )}
                        </span>

                        {/* 7일 추이 — 숫자를 다 늘어놓는 대신 모양만 보여준다.
                            자세한 수치는 행을 펼치면 나오는 순위 추이 그래프에서 본다. */}
                        <Sparkline
                          values={sparkValues}
                          width={104}
                          height={26}
                          className="hidden sm:block shrink-0 text-[color:var(--point-500)]"
                        />
                        <span className="hidden lg:block shrink-0 text-[11px] text-brand-muted">7일</span>
                      </>
                    )}
                  </div>

                  {/* 4. 월 검색량 */}
                  <span className="hidden md:block w-24 shrink-0 text-right text-[13px] font-semibold text-brand-dark">
                    {main.monthlyVolume.toLocaleString()}
                  </span>

                  {/* 5. 등록날짜 */}
                  <span className="hidden lg:block w-24 shrink-0 text-right text-[13px] text-brand-sub">{main.registeredAt}</span>

                  {/* 6. 관리 — 잠긴 키워드에는 새로고침을 노출하지 않는다 */}
                  <span className="w-[132px] shrink-0 flex items-center justify-end gap-1">
                    {!locked && (
                      <button
                        onClick={(e) => requestRefresh(item, e)}
                        title={refreshing[item.id] ? "이미 요청했습니다 · 순위 확인 중" : "이 키워드만 다시 측정"}
                        className={`px-2 py-1 rounded-md text-[11.5px] font-bold transition-colors ${
                          refreshing[item.id]
                            ? "bg-brand-lighter text-brand-muted cursor-default"
                            : "bg-brand-lighter text-brand-text hover:bg-brand-border/60"
                        }`}
                      >
                        {refreshing[item.id] ? "요청됨" : "새로고침"}
                      </button>
                    )}
                    <button
                      onClick={(e) => deleteItem(item, e)}
                      className="px-2 py-1 rounded-md text-[11.5px] font-bold text-red-500 hover:bg-red-50 transition-colors"
                    >
                      삭제
                    </button>
                  </span>
                </div>

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
                              <a href={item.targetUrl} target="_blank" rel="noopener noreferrer" className="text-[13px] text-[color:var(--point-500)] truncate hover:underline">
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
                                  <a href={k.productUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 max-w-full text-[12px] text-[color:var(--point-500)] hover:underline">
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

                          {/* 지표 — 기본 지표와 부가 지표(플레이스)를 한 표에 이어 붙인다.
                              표를 둘로 나눠 두면 같은 줄에서 칸 높이·경계가 어긋나 보인다. */}
                          {(() => {
                            const cells: { label: string; value: string; diff?: string }[] = [
                              { label: "월 검색량", value: k.monthlyVolume.toLocaleString() },
                              { label: "등록일", value: k.registeredAt },
                              { label: "최초 순위", value: firstRank !== null ? `${firstRank}위` : "-" },
                              { label: "오늘 순위", value: k.currentRank !== null ? `${k.currentRank}위` : "-" },
                              { label: "순위 변동", value: kDiff === null ? "-" : kDiff > 0 ? `▲ ${kDiff}` : kDiff < 0 ? `▼ ${Math.abs(kDiff)}` : "-" },
                              ...(k.metrics ?? []).map((mt) => ({ label: mt.label, value: mt.value, diff: mt.diff })),
                            ];
                            return (
                              <div
                                className="grid rounded-lg border border-brand-border overflow-hidden"
                                style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}
                              >
                                {cells.map((c, i) => (
                                  <div key={`h-${i}`} className={`px-1 md:px-2 py-1.5 text-center text-[10px] md:text-[12px] font-bold text-brand-muted bg-brand-lighter border-b border-brand-border ${i > 0 ? "border-l border-brand-border" : ""}`}>
                                    {c.label}
                                  </div>
                                ))}
                                {cells.map((c, i) => (
                                  <div key={`v-${i}`} className={`px-1 md:px-2 py-2 text-center ${i > 0 ? "border-l border-brand-border" : ""}`}>
                                    {/* 전일 대비 변동(부가 지표에만 있다)은 값 오른쪽에 붙인다 —
                                        아래로 내리면 그 칸만 두 줄이 돼 줄 높이가 어긋난다. */}
                                    <p className="flex items-baseline justify-center gap-1 text-[12px] md:text-[14px] font-bold text-brand-dark leading-none break-all">
                                      <span>{c.value}</span>
                                      {c.diff !== undefined && (
                                        <span className={`text-[9px] md:text-[12px] font-semibold ${diffClass(c.diff)}`}>{c.diff}</span>
                                      )}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}

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
                          /* 쿠팡은 위에서 '준비중'으로 빠지므로 이 상세는 그려지지 않는다 */
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

        {/* ── 페이징 (모바일 5 / 그 외 10) ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 px-5 py-3 border-t border-brand-border">
            <button
              onClick={() => setPage(Math.max(1, curPage - 1))}
              disabled={curPage === 1}
              className="px-2.5 py-1.5 rounded-lg text-[13px] font-bold text-brand-sub disabled:opacity-35 hover:bg-brand-lighter transition-colors"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`min-w-[30px] px-2 py-1.5 rounded-lg text-[13px] font-bold transition-colors ${
                  n === curPage ? "text-white" : "text-brand-sub hover:bg-brand-lighter"
                }`}
                style={n === curPage ? { background: "var(--gradient-point)" } : undefined}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, curPage + 1))}
              disabled={curPage === totalPages}
              className="px-2.5 py-1.5 rounded-lg text-[13px] font-bold text-brand-sub disabled:opacity-35 hover:bg-brand-lighter transition-colors"
            >
              ›
            </button>
          </div>
        )}
      </>
      )}
      </div>

      {/* ── 모달 ── */}
      {showModal && (
        <AddKeywordModal platform={activePlatform} onClose={() => setShowModal(false)} />
      )}

      {/* ── 그룹 편성 모달 — 드래그가 안 되는 기기를 위한 두 번째 경로 ── */}
      {groupEditId !== null && (
        <GroupAssignModal
          groupName={groupList.find((g) => g.id === groupEditId)?.name ?? ""}
          items={platformItems}
          groupOf={groupOf}
          groupId={groupEditId}
          unitLabel={unitLabel}
          onToggle={(itemId, on) => assignGroup(itemId, on ? groupEditId : null)}
          onClose={() => setGroupEditId(null)}
        />
      )}

      {/* ── 토스트 ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] px-4 py-2.5 rounded-xl text-[13.5px] font-semibold text-white shadow-lg"
          style={{ background: "#111D37" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

/** 그룹 편성 — 이 그룹에 넣을 항목을 체크로 고른다. 폴더형이라 체크하면 다른 그룹에서 빠진다. */
function GroupAssignModal({
  groupName, items, groupOf, groupId, unitLabel, onToggle, onClose,
}: {
  groupName: string;
  items: RankItem[];
  groupOf: Record<number, number | null>;
  groupId: number;
  unitLabel: string;
  onToggle: (itemId: number, on: boolean) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label={`${groupName} 그룹 편성`}
        className="relative w-full max-w-md max-h-[80vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between gap-3 px-5 py-4" style={{ background: "var(--gradient-point)" }}>
          <div className="min-w-0">
            <p className="text-[17px] font-extrabold text-white truncate">{groupName}</p>
            <p className="text-[12.5px] text-white/70 mt-0.5">이 그룹에 넣을 {unitLabel}를 고르세요</p>
          </div>
          <button onClick={onClose} aria-label="닫기"
            className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-white/80 hover:text-white hover:bg-white/15">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {items.length === 0 && (
            <p className="px-4 py-10 text-center text-[14px] text-brand-muted">추적 중인 {unitLabel}가 없습니다</p>
          )}
          {items.map((it) => {
            const mine = (groupOf[it.id] ?? null) === groupId;
            const other = groupOf[it.id] != null && !mine;
            return (
              <label key={it.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-lighter cursor-pointer">
                <input
                  type="checkbox"
                  checked={mine}
                  onChange={(e) => onToggle(it.id, e.target.checked)}
                  className="h-4 w-4 accent-[#2452EB] shrink-0"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-brand-dark truncate">{it.productName}</span>
                  <span className="block text-[12px] text-brand-sub truncate">{it.keywords[0]?.keyword}</span>
                </span>
                {other && (
                  <span className="shrink-0 text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-brand-lighter text-brand-muted">
                    다른 그룹
                  </span>
                )}
              </label>
            );
          })}
        </div>
        <div className="px-5 py-3.5 border-t border-brand-border">
          <button onClick={onClose}
            className="w-full py-3 rounded-xl text-[15px] font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--gradient-point)" }}>
            완료
          </button>
        </div>
      </div>
    </div>
  );
}
