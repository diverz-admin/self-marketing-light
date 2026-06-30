"use client";

import React, { useState } from "react";

/* ── Types ── */
type Platform = "naver_place" | "naver_shopping";

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
  metrics?: KeywordMetric[];
}

interface RankItem {
  id: number;
  productName: string;
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
  { label: "1~5위",     color: "text-blue-600",   test: (r) => r !== null && r >= 1 && r <= 5 },
  { label: "6~10위",    color: "text-red-500",    test: (r) => r !== null && r >= 6 && r <= 10 },
  { label: "11~20위",   color: "text-orange-500", test: (r) => r !== null && r >= 11 && r <= 20 },
  { label: "21~50위",   color: "text-green-600",  test: (r) => r !== null && r >= 21 && r <= 50 },
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
    color: "#03C75A",
    grad: "linear-gradient(135deg,#03C75A,#02A84A)",
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
    color: "#0341C7",
    grad: "linear-gradient(135deg,#0341C7,#0235A8)",
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
    {
      id: 1, productName: "버터플라이 구스다운 자켓", targetUrl: "https://smartstore.naver.com/butterfly/products/9001234567", checkedAt: "15분 전", status: "active",
      keywords: [
        { keyword: "여성 패딩",  currentRank: 8,  prevRank: 16, bestRank: 5,  history: [74, 35, 53, 36, 19, 12, 8],  monthlyVolume: 33400, registeredAt: "2026-06-22" },
        { keyword: "구스다운",   currentRank: 12, prevRank: 14, bestRank: 9,  history: [40, 30, 22, 18, 15, 14, 12], monthlyVolume: 18800, registeredAt: "2026-06-22" },
      ],
    },
    {
      id: 2, productName: "아우라 무스탕 코트", targetUrl: "https://smartstore.naver.com/aura/products/8887776665", checkedAt: "15분 전", status: "active",
      keywords: [
        { keyword: "무스탕 자켓", currentRank: 22, prevRank: 20, bestRank: 14, history: [40, 38, 30, 28, 22, 20, 22], monthlyVolume: 9600, registeredAt: "2026-06-19" },
        { keyword: "여성 무스탕", currentRank: 18, prevRank: 19, bestRank: 13, history: [35, 30, 26, 22, 20, 19, 18], monthlyVolume: 7100, registeredAt: "2026-06-19" },
      ],
    },
    {
      id: 3, productName: "소프트 캐시미어 터틀넥", targetUrl: "5556667778", checkedAt: "집계 중", status: "paused",
      keywords: [
        { keyword: "캐시미어 니트", currentRank: null, prevRank: null, bestRank: 35, history: [55, 50, 45, 40, null, null, null], monthlyVolume: 5200, registeredAt: "2026-06-15" },
        { keyword: "터틀넥",       currentRank: 40,   prevRank: 42,   bestRank: 33, history: [60, 55, 50, 46, 44, 42, 40],     monthlyVolume: 8900, registeredAt: "2026-06-15" },
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
            <p className="text-[16px] font-bold text-brand-dark">키워드 추가 완료!</p>
            <p className="text-[13px] text-brand-sub mt-1">곧 순위 추적이 시작됩니다</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center text-[18px]" style={{ background: meta.grad }}>
                  {meta.emoji}
                </div>
                <div>
                  <p className="text-[15px] font-bold text-brand-dark">{meta.label}</p>
                  <p className="text-[11px] text-brand-sub">키워드 추가</p>
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
                <label className="block text-[13px] font-semibold text-brand-dark mb-1.5">
                  {platform === "naver_place" ? "매장명" : "상품명"} <span className="text-red-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={platform === "naver_place" ? "예) 홍길동 칼국수" : "예) 버터플라이 구스다운 자켓"}
                  className="w-full px-4 py-3 border border-brand-border rounded-xl text-[14px] bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-brand-dark mb-1.5">
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
                    className="w-full pl-9 pr-4 py-3 border border-brand-border rounded-xl text-[13px] bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-brand-muted">URL 전체 또는 숫자 ID만 입력 가능합니다</p>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-brand-dark mb-1.5">
                  추적 키워드 <span className="text-red-500">*</span>
                </label>
                <input
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder={meta.placeholder}
                  className="w-full px-4 py-3 border border-brand-border rounded-xl text-[14px] bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={saving || !keyword.trim() || !name.trim() || !targetUrl.trim()}
              className="mt-5 w-full py-3 rounded-xl text-[14px] font-bold text-white transition-all disabled:opacity-50"
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

/* ── Page ── */
export default function RankManagement({ initialPlatform = "naver_place" }: { initialPlatform?: Platform }) {
  const [activePlatform, setActivePlatform] = useState<Platform>(initialPlatform);
  const [expandedId, setExpandedId] = useState<number | null>(1);
  const [showModal, setShowModal] = useState(false);
  const [checking, setChecking] = useState(false);
  const [keywords, setKeywords] = useState(["", "", ""]);
  const [targetId, setTargetId] = useState("");
  const [registering, setRegistering] = useState(false);
  const [registerDone, setRegisterDone] = useState(false);

  const setKeyword = (i: number, v: string) =>
    setKeywords(prev => prev.map((k, idx) => (idx === i ? v : k)));

  const meta = PLATFORM_META[activePlatform];
  const items = MOCK_DATA[activePlatform];

  const allKeywords = items.flatMap(i => i.keywords);

  const handleCheck = async () => {
    setChecking(true);
    await new Promise(r => setTimeout(r, 1200));
    setChecking(false);
  };

  /* ── History Chart ── */
  function HistoryChart({ history, color }: { history: (number | null)[]; color: string }) {
    const W = 680; const H = 190;
    const pL = 36; const pR = 20; const pT = 24; const pB = 32;
    const iW = W - pL - pR; const iH = H - pT - pB;

    const valid = history.filter((v): v is number => v !== null);
    if (valid.length < 2) return <div className="flex items-center justify-center h-[160px] text-brand-muted text-[13px]">데이터 수집 중...</div>;

    const maxV = Math.max(...valid);
    const minV = Math.min(...valid);
    const range = maxV - minV || 1;
    const n = history.length;

    const pts = history.map((v, i) => {
      if (v === null) return null;
      return {
        x: pL + (i / (n - 1)) * iW,
        y: pT + ((v - minV) / range) * iH,
        v,
      };
    }).filter(Boolean) as { x: number; y: number; v: number }[];

    const polyline = pts.map(p => `${p.x},${p.y}`).join(" ");
    const area = `${pts[0].x},${pT + iH} ${polyline} ${pts[pts.length - 1].x},${pT + iH}`;

    const labels = ["7일전", "6일전", "5일전", "4일전", "3일전", "2일전", "오늘"];

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
        <defs>
          <linearGradient id={`hFill-${activePlatform}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {[0, 0.33, 0.66, 1].map((f, i) => (
          <line key={i} x1={pL} y1={pT + iH * f} x2={W - pR} y2={pT + iH * f} stroke="#F2F4F6" strokeWidth={1} />
        ))}
        <polygon points={area} fill={`url(#hFill-${activePlatform})`} />
        <polyline points={polyline} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4} fill="white" stroke={color} strokeWidth={2} />
            <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize={10} fontWeight={600} fill="#4E5968">{p.v}위</text>
          </g>
        ))}
        {labels.map((label, i) => (
          <text key={i} x={pL + (i / (n - 1)) * iW} y={H - 4} textAnchor="middle" fontSize={9.5} fill="#8B95A1">{label}</text>
        ))}
      </svg>
    );
  }

  return (
    <div className="w-full space-y-5">

      {/* ── 헤더 ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-extrabold text-brand-dark leading-tight">통합 순위관리</h1>
          <p className="text-[14px] text-brand-sub mt-1">네이버 플레이스, 네이버 쇼핑 키워드 순위를 한 곳에서 추적하세요.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCheck}
            disabled={checking}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-brand-border bg-white text-[13px] font-semibold text-brand-text hover:bg-brand-lighter transition-colors disabled:opacity-60"
          >
            <svg className={`w-4 h-4 text-brand-primary ${checking ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {checking ? "순위 체크 중..." : "전체 순위 새로고침"}
          </button>
        </div>
      </div>

      {/* ── 플랫폼 탭 ── */}
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(PLATFORM_META) as Platform[]).map((p) => {
          const m = PLATFORM_META[p];
          const isActive = p === activePlatform;
          return (
            <button
              key={p}
              onClick={() => { setActivePlatform(p); setExpandedId(MOCK_DATA[p][0]?.id ?? null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all border ${
                isActive
                  ? "text-white border-transparent shadow-sm"
                  : "bg-white text-brand-sub border-brand-border hover:border-brand-primary/40 hover:text-brand-text"
              }`}
              style={isActive ? { background: m.grad, borderColor: "transparent" } : {}}
            >
              <span className="text-[15px]">{m.emoji}</span>
              {m.label}
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${isActive ? "bg-white/20 text-white" : "bg-brand-lighter text-brand-muted"}`}>
                {MOCK_DATA[p].length}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── 순위 검색 폼 ── */}
      {registerDone ? (
        <div className="bg-white rounded-2xl border border-brand-border p-8 flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ background: meta.grad }}>
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-[16px] font-bold text-brand-dark">순위 추적 슬롯이 등록되었습니다!</p>
          <p className="text-[13px] text-brand-sub">잠시 후 아래 목록에 반영됩니다.</p>
          <button
            onClick={() => { setRegisterDone(false); setKeywords(["", "", ""]); setTargetId(""); }}
            className="mt-1 px-5 py-2 rounded-xl text-[13px] font-semibold border border-brand-border text-brand-text hover:bg-brand-lighter transition-colors"
          >
            새 슬롯 추가
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
          <div className="p-5 space-y-5">

            {/* 안내 배너 */}
            <div className="pl-4 border-l-4 border-brand-primary space-y-1.5" style={{ borderColor: meta.color }}>
              <p className="text-[14px] text-brand-dark">
                {meta.label} 순위 <span className="font-extrabold">300위</span>까지 조회가능합니다.
              </p>
              <div className="flex items-center gap-1.5 flex-wrap text-[12px] text-brand-sub">
                <span className="text-brand-muted">ex )</span>
                <span>키워드 :</span>
                <span className="font-semibold text-brand-primary underline cursor-pointer">{meta.exampleUrl.includes("place") ? "홍대 술집" : "인기 상품"}</span>
                <svg className="w-3 h-3 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
                <span>키워드 1 :</span>
                <span className="font-semibold text-brand-primary underline cursor-pointer">{meta.exampleUrl.includes("place") ? "왕십리 미용실" : "베스트 아이템"}</span>
                <svg className="w-3 h-3 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
                <span>{activePlatform === "naver_place" ? "플레이스" : "상품"} ID :</span>
                <span className="font-semibold text-brand-primary underline cursor-pointer">{meta.exampleId}</span>
                <svg className="w-3 h-3 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
              </div>
            </div>

            {/* ID + 키워드 그리드 */}
            <div className="grid grid-cols-2 gap-4">
              {/* ID / URL — 첫 번째 */}
              <div>
                <label className="block text-[13px] font-bold text-brand-dark mb-2">
                  {activePlatform === "naver_place" ? "플레이스" : "상품"} ID <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={targetId}
                  onChange={e => setTargetId(e.target.value)}
                  placeholder={`ex. ${meta.exampleId}`}
                  className="w-full px-4 py-3 border border-brand-border rounded-xl text-[14px] bg-brand-lighter placeholder-brand-muted text-brand-dark focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                />
                {targetId.startsWith("http") && extractIdFromUrl(activePlatform, targetId) && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-[11px] text-brand-sub">ID 추출됨:</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {extractIdFromUrl(activePlatform, targetId)}
                    </span>
                  </div>
                )}
              </div>

              {/* 키워드 1 */}
              <div>
                <label className="block text-[13px] font-bold text-brand-dark mb-2">
                  키워드1 <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={keywords[0]}
                  onChange={e => setKeyword(0, e.target.value)}
                  placeholder={`ex. ${meta.exampleUrl.includes("place") ? "을지로 맛집" : "여성 패딩"}`}
                  className="w-full px-4 py-3 border border-brand-border rounded-xl text-[14px] bg-brand-lighter placeholder-brand-muted text-brand-dark focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                />
              </div>

              {/* 키워드 2 */}
              <div>
                <label className="block text-[13px] font-bold text-brand-dark mb-2">키워드2</label>
                <input
                  type="text"
                  value={keywords[1]}
                  onChange={e => setKeyword(1, e.target.value)}
                  placeholder={`ex. ${meta.exampleUrl.includes("place") ? "을지로 순대국" : "겨울 자켓"}`}
                  className="w-full px-4 py-3 border border-brand-border rounded-xl text-[14px] bg-brand-lighter placeholder-brand-muted text-brand-dark focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                />
              </div>

              {/* 키워드 3 */}
              <div>
                <label className="block text-[13px] font-bold text-brand-dark mb-2">키워드3</label>
                <input
                  type="text"
                  value={keywords[2]}
                  onChange={e => setKeyword(2, e.target.value)}
                  placeholder={`ex. ${meta.exampleUrl.includes("place") ? "을지로 점심" : "패딩 점퍼"}`}
                  className="w-full px-4 py-3 border border-brand-border rounded-xl text-[14px] bg-brand-lighter placeholder-brand-muted text-brand-dark focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* 순위 검색 버튼 */}
          <div className="px-5 pb-5">
            <button
              disabled={registering || !keywords[0].trim() || !targetId.trim()}
              onClick={async () => {
                setRegistering(true);
                await new Promise(r => setTimeout(r, 900));
                setRegistering(false);
                setRegisterDone(true);
              }}
              className="w-full py-4 rounded-xl text-[15px] font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-40 bg-brand-dark"
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
        </div>
      )}

      {/* ── 순위 분포 ── */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {RANK_BUCKETS.map((b) => {
          const count = allKeywords.filter((k) => b.test(k.currentRank)).length;
          return (
            <div key={b.label} className="shrink-0 min-w-[82px] flex-1 rounded-xl border border-brand-border bg-white px-3 py-2.5 text-center">
              <p className="text-[11px] text-brand-muted mb-1 whitespace-nowrap">{b.label}</p>
              <p className={`text-[16px] font-extrabold leading-none ${count > 0 ? b.color : "text-brand-muted"}`}>{count}개</p>
            </div>
          );
        })}
      </div>

      {/* ── 상품별 순위 목록 (아코디언) ── */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[18px]">{meta.emoji}</span>
            <p className="text-[14px] font-bold text-brand-dark">{meta.label} 순위 목록</p>
          </div>
          <span className="text-[12px] text-brand-sub">{items.length}개 업체 · {allKeywords.length}개 키워드 · 클릭하면 키워드별 상세가 열립니다</span>
        </div>

        {/* 컬럼 헤더 */}
        <div className="flex items-center gap-3 px-5 py-2.5 bg-brand-lighter/60 border-b border-brand-border text-[11px] font-bold text-brand-muted">
          <span className="w-4 shrink-0" />
          <span className="w-40 sm:w-44 shrink-0">업체명</span>
          <span className="hidden sm:block w-28 shrink-0">메인 키워드</span>
          <span className="flex-1 min-w-0">순위 (최근순)</span>
          <span className="hidden md:block w-24 shrink-0 text-right">월 검색량</span>
          <span className="hidden lg:block w-24 shrink-0 text-right">등록일</span>
        </div>

        <div className="divide-y divide-brand-border">
          {items.map((item) => {
            const isOpen = expandedId === item.id;
            const main = item.keywords[0];
            const extraCount = item.keywords.length - 1;
            return (
              <div key={item.id}>
                {/* 요약 행 — 업체 대표 키워드 기준 */}
                <button
                  onClick={() => setExpandedId(isOpen ? null : item.id)}
                  className={`w-full text-left px-5 py-3.5 transition-colors hover:bg-brand-lighter flex items-center gap-3 ${isOpen ? "bg-blue-50/40" : ""}`}
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
                    <div className="relative shrink-0">
                      <div className="h-9 w-9 rounded-lg overflow-hidden bg-brand-lighter border border-brand-border flex items-center justify-center">
                        {item.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.thumbnail} alt={item.productName} className="h-full w-full object-cover" />
                        ) : (
                          <svg className="w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                        )}
                      </div>
                      <span
                        className="absolute -bottom-1 -right-1 h-4 min-w-[16px] px-1 rounded-md flex items-center justify-center text-white font-extrabold text-[9px] border border-white"
                        style={{ background: main.currentRank !== null && main.currentRank <= 10 ? meta.grad : "linear-gradient(135deg,#9CA3AF,#6B7280)" }}
                      >
                        {main.currentRank ?? "-"}
                      </span>
                    </div>
                    <p className="text-[13px] font-bold text-brand-dark truncate">{item.productName}</p>
                  </div>

                  {/* 2. 메인 키워드 (+N개) */}
                  <span className="hidden sm:flex w-28 shrink-0 items-center gap-1 text-[12px] text-brand-sub truncate">
                    <span className="truncate">{main.keyword}</span>
                    {extraCount > 0 && (
                      <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-brand-lighter text-brand-primary">+{extraCount}</span>
                    )}
                  </span>

                  {/* 3. 순위 테이블 (가장 최근 날짜가 왼쪽) — 대표 키워드 */}
                  <div className="flex-1 min-w-0 overflow-x-auto">
                    <div className="flex items-stretch gap-1 w-max">
                      {main.history
                        .map((rank, i) => ({ date: HISTORY_DATES[i] ?? "", rank }))
                        .reverse()
                        .map((d, i) => (
                          <div
                            key={i}
                            className={`flex flex-col items-center justify-center px-2 py-1 rounded-md min-w-[44px] ${i === 0 ? "bg-blue-50 border border-blue-100" : "bg-brand-lighter"}`}
                          >
                            <span className="text-[9px] text-brand-muted leading-none mb-0.5">{d.date}</span>
                            <span className={`text-[12px] font-bold leading-none ${i === 0 ? "text-brand-primary" : "text-brand-dark"}`}>
                              {d.rank === null ? "-" : `${d.rank}위`}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* 4. 월 검색량 */}
                  <span className="hidden md:block w-24 shrink-0 text-right text-[12px] font-semibold text-brand-dark">
                    {main.monthlyVolume.toLocaleString()}
                  </span>

                  {/* 5. 등록날짜 */}
                  <span className="hidden lg:block w-24 shrink-0 text-right text-[12px] text-brand-sub">{main.registeredAt}</span>
                </button>

                {/* 아코디언 상세 — 업체 정보 + 키워드별 카드 */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-4 bg-brand-lighter/30 border-t border-brand-border space-y-4">
                    {/* 업체 URL/ID */}
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-brand-border">
                      <svg className="w-3.5 h-3.5 text-brand-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      {item.targetUrl.startsWith("http") ? (
                        <a href={item.targetUrl} target="_blank" rel="noopener noreferrer" className="text-[12px] text-brand-primary truncate hover:underline">
                          {item.targetUrl}
                        </a>
                      ) : (
                        <span className="text-[12px] text-brand-sub font-mono truncate">ID: {item.targetUrl}</span>
                      )}
                      <span className="ml-auto shrink-0 text-[11px] font-semibold text-brand-muted">키워드 {item.keywords.length}개</span>
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
                                className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-white font-extrabold text-[12px]"
                                style={{ background: k.currentRank !== null && k.currentRank <= 10 ? meta.grad : "linear-gradient(135deg,#E5E7EB,#D1D5DB)" }}
                              >
                                {k.currentRank ?? "-"}
                              </span>
                              <div className="min-w-0">
                                <p className="text-[13px] font-bold text-brand-dark truncate">{k.keyword}</p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[10px] text-brand-sub">현재 순위</p>
                              <p className="text-[20px] font-extrabold leading-tight" style={{ color: meta.color }}>
                                {k.currentRank ?? "-"}
                                <span className="text-[12px] font-medium text-brand-sub ml-0.5">위</span>
                              </p>
                            </div>
                          </div>

                          {/* 2열 레이아웃 — 왼쪽: 데이터, 오른쪽: 그래프 */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

                            {/* 왼쪽: 월 검색량/등록일 + 순위 요약 + 지표 */}
                            <div className="space-y-3 min-w-0">
                              {/* 월 검색량 · 등록일 */}
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  { label: "월 검색량", value: k.monthlyVolume.toLocaleString() },
                                  { label: "등록일", value: k.registeredAt },
                                ].map(({ label, value }, i) => (
                                  <div key={i} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-brand-lighter">
                                    <span className="text-[11px] font-semibold text-brand-sub">{label}</span>
                                    <span className="text-[15px] font-extrabold text-brand-dark">{value}</span>
                                  </div>
                                ))}
                              </div>

                              {/* 순위 요약 */}
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { label: "최초 순위", value: firstRank !== null ? `${firstRank}위` : "-" },
                                  { label: "오늘 순위", value: k.currentRank !== null ? `${k.currentRank}위` : "-" },
                                  { label: "순위 변동", value: kDiff === null ? "-" : kDiff > 0 ? `▲ ${kDiff}` : kDiff < 0 ? `▼ ${Math.abs(kDiff)}` : "-" },
                                ].map(({ label, value }, i) => (
                                  <div key={i} className="bg-brand-lighter rounded-lg px-3 py-2 text-center">
                                    <p className="text-[10px] text-brand-sub mb-0.5">{label}</p>
                                    <p className="text-[13px] font-extrabold text-brand-dark">{value}</p>
                                  </div>
                                ))}
                              </div>

                              {/* 부가 지표 (방문자리뷰/블로그리뷰/N1~N3) */}
                              {k.metrics && k.metrics.length > 0 && (
                                <div className="overflow-x-auto">
                                  <div
                                    className="grid rounded-lg border border-brand-border overflow-hidden min-w-max"
                                    style={{ gridTemplateColumns: `repeat(${k.metrics.length}, minmax(78px, 1fr))` }}
                                  >
                                    {k.metrics.map((mt, i) => (
                                      <div key={`h-${i}`} className={`px-2 py-1.5 text-center text-[11px] font-bold text-brand-muted bg-brand-lighter border-b border-brand-border ${i > 0 ? "border-l border-brand-border" : ""}`}>
                                        {mt.label}
                                      </div>
                                    ))}
                                    {k.metrics.map((mt, i) => (
                                      <div key={`v-${i}`} className={`px-2 py-2 text-center ${i > 0 ? "border-l border-brand-border" : ""}`}>
                                        <p className="text-[12.5px] font-bold text-brand-dark leading-none">{mt.value}</p>
                                        <p className={`text-[10.5px] font-semibold leading-none mt-1 ${diffClass(mt.diff)}`}>{mt.diff}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* 오른쪽: 순위 테이블 + 순위 추이 그래프 */}
                            <div className="border-t border-brand-border pt-3 md:border-t-0 md:border-l md:pt-0 md:pl-4 space-y-3">
                              {/* 순위 테이블 (최근 날짜 왼쪽) */}
                              <div className="overflow-x-auto">
                                <div className="flex items-stretch gap-1 w-max">
                                  {k.history
                                    .map((rank, i) => ({ date: HISTORY_DATES[i] ?? "", rank }))
                                    .reverse()
                                    .map((d, i) => (
                                      <div
                                        key={i}
                                        className={`flex flex-col items-center justify-center px-2 py-1 rounded-md min-w-[44px] ${i === 0 ? "bg-blue-50 border border-blue-100" : "bg-brand-lighter"}`}
                                      >
                                        <span className="text-[9px] text-brand-muted leading-none mb-0.5">{d.date}</span>
                                        <span className={`text-[12px] font-bold leading-none ${i === 0 ? "text-brand-primary" : "text-brand-dark"}`}>
                                          {d.rank === null ? "-" : `${d.rank}위`}
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              </div>

                              {/* 순위 추이 그래프 */}
                              <div>
                                <p className="text-[12px] font-semibold text-brand-sub mb-2">최근 7일 순위 추이</p>
                                <HistoryChart history={k.history} color={meta.color} />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* 플랫폼별 안내 */}
                    <div className="bg-white rounded-xl border border-brand-border p-4">
                      <p className="text-[13px] font-bold text-brand-dark mb-3">플랫폼 순위 기준 안내</p>
                      <div className="space-y-2">
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
                            <div className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0" style={{ background: meta.color }} />
                            <p className="text-[13px] text-brand-sub">{t}</p>
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

      {/* ── 모달 ── */}
      {showModal && (
        <AddKeywordModal platform={activePlatform} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
