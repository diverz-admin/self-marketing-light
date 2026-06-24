"use client";

import React, { useState } from "react";

/* ── Types ── */
type Platform = "naver_place" | "naver_shopping";

interface RankItem {
  id: number;
  keyword: string;
  productName: string;
  targetUrl: string;
  currentRank: number | null;
  prevRank: number | null;
  bestRank: number;
  history: (number | null)[];
  checkedAt: string;
  status: "active" | "paused";
}

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
    { id: 1, keyword: "마포 맛집", productName: "홍길동 칼국수", targetUrl: "1234567890", currentRank: 3, prevRank: 5, bestRank: 2, history: [18, 12, 8, 7, 5, 5, 3], checkedAt: "10분 전", status: "active" },
    { id: 2, keyword: "홍대 카페", productName: "블루보틀 홍대점", targetUrl: "9876543210", currentRank: 7, prevRank: 6, bestRank: 4, history: [10, 9, 7, 6, 8, 6, 7], checkedAt: "10분 전", status: "active" },
    { id: 3, keyword: "강남 헬스장", productName: "애니타임 강남점", targetUrl: "1122334455", currentRank: 15, prevRank: 18, bestRank: 10, history: [30, 25, 22, 20, 18, 18, 15], checkedAt: "10분 전", status: "active" },
  ],
  naver_shopping: [
    { id: 1, keyword: "여성 패딩", productName: "버터플라이 구스다운 자켓", targetUrl: "https://smartstore.naver.com/butterfly/products/9001234567", currentRank: 8, prevRank: 16, bestRank: 5, history: [74, 35, 53, 36, 19, 12, 8], checkedAt: "15분 전", status: "active" },
    { id: 2, keyword: "무스탕 자켓", productName: "아우라 무스탕 코트", targetUrl: "https://smartstore.naver.com/aura/products/8887776665", currentRank: 22, prevRank: 20, bestRank: 14, history: [40, 38, 30, 28, 22, 20, 22], checkedAt: "15분 전", status: "active" },
    { id: 3, keyword: "캐시미어 니트", productName: "소프트 캐시미어 터틀넥", targetUrl: "5556667778", currentRank: null, prevRank: null, bestRank: 35, history: [55, 50, 45, 40, null, null, null], checkedAt: "집계 중", status: "paused" },
  ],
};

/* ── Sparkline ── */
function Sparkline({ data, color }: { data: (number | null)[]; color: string }) {
  const valid = data.filter((v): v is number => v !== null);
  if (valid.length < 2) return <div className="w-16 h-8 flex items-center justify-center text-[11px] text-brand-muted">-</div>;

  const W = 64; const H = 32;
  const maxV = Math.max(...valid);
  const minV = Math.min(...valid);
  const range = maxV - minV || 1;

  const points = data
    .map((v, i) => ({ x: (i / (data.length - 1)) * W, y: v !== null ? H - 4 - ((v - minV) / range) * (H - 8) : null, v }))
    .filter((p): p is { x: number; y: number; v: number } => p.y !== null);

  const polyline = points.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline points={polyline} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      {points.length > 0 && (
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={2.5} fill={color} />
      )}
    </svg>
  );
}

/* ── Rank Change Badge ── */
function RankChange({ current, prev }: { current: number | null; prev: number | null }) {
  if (current === null || prev === null) return <span className="text-[12px] text-brand-muted">-</span>;
  const diff = prev - current;
  if (diff === 0) return <span className="text-[12px] font-bold text-brand-muted">-</span>;
  if (diff > 0) return (
    <span className="flex items-center gap-0.5 text-[12px] font-bold text-emerald-500">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
      {diff}
    </span>
  );
  return (
    <span className="flex items-center gap-0.5 text-[12px] font-bold text-red-500">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
      {Math.abs(diff)}
    </span>
  );
}

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
export default function RankManagementPage() {
  const [activePlatform, setActivePlatform] = useState<Platform>("naver_place");
  const [selectedId, setSelectedId] = useState<number | null>(1);
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
  const selected = items.find(i => i.id === selectedId) ?? items[0];

  const activeCount = items.filter(i => i.status === "active").length;
  const topCount = items.filter(i => i.currentRank !== null && i.currentRank <= 10).length;
  const avgRank = items.filter(i => i.currentRank !== null).reduce((s, i) => s + i.currentRank!, 0) / (items.filter(i => i.currentRank !== null).length || 1);

  const handleCheck = async () => {
    setChecking(true);
    await new Promise(r => setTimeout(r, 1200));
    setChecking(false);
  };

  /* ── History Chart ── */
  function HistoryChart({ item, color }: { item: RankItem; color: string }) {
    const W = 500; const H = 160;
    const pL = 36; const pR = 20; const pT = 24; const pB = 32;
    const iW = W - pL - pR; const iH = H - pT - pB;

    const valid = item.history.filter((v): v is number => v !== null);
    if (valid.length < 2) return <div className="flex items-center justify-center h-[160px] text-brand-muted text-[13px]">데이터 수집 중...</div>;

    const maxV = Math.max(...valid);
    const minV = Math.min(...valid);
    const range = maxV - minV || 1;
    const n = item.history.length;

    const pts = item.history.map((v, i) => {
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
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
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
              onClick={() => { setActivePlatform(p); setSelectedId(MOCK_DATA[p][0]?.id ?? null); }}
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

      {/* ── 요약 카드 ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "추적 중인 키워드", value: `${activeCount}개`, sub: `총 ${items.length}개 등록`, icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" },
          { label: "10위 이내 진입", value: `${topCount}개`, sub: "현재 기준", icon: "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" },
          { label: "평균 순위", value: avgRank ? `${avgRank.toFixed(1)}위` : "-", sub: "추적 키워드 기준", icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-brand-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: meta.grad }}>
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
              </div>
              <p className="text-[12px] text-brand-sub font-medium">{card.label}</p>
            </div>
            <p className="text-[22px] font-extrabold text-brand-dark leading-tight">{card.value}</p>
            <p className="text-[11px] text-brand-muted mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── 메인 영역 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* 키워드 목록 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-brand-border overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[18px]">{meta.emoji}</span>
              <p className="text-[14px] font-bold text-brand-dark">{meta.label}</p>
            </div>
            <span className="text-[12px] text-brand-sub">{items.length}개 키워드</span>
          </div>

          <div className="divide-y divide-brand-border">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`w-full text-left px-5 py-4 transition-colors hover:bg-brand-lighter ${selectedId === item.id ? "bg-blue-50/60" : ""}`}
              >
                <div className="flex items-start gap-3">
                  {/* 순위 */}
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 text-white font-extrabold text-[14px]"
                    style={{ background: item.currentRank !== null && item.currentRank <= 10 ? meta.grad : "linear-gradient(135deg,#E5E7EB,#D1D5DB)" }}
                  >
                    {item.currentRank ?? "-"}
                  </div>
                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-brand-dark truncate">{item.productName}</p>
                    <p className="text-[11px] text-brand-sub truncate mt-0.5">"{item.keyword}"</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <RankChange current={item.currentRank} prev={item.prevRank} />
                      <span className="text-[11px] text-brand-muted">{item.checkedAt}</span>
                    </div>
                  </div>
                  {/* 스파크라인 */}
                  <div className="shrink-0">
                    <Sparkline data={item.history} color={meta.color} />
                  </div>
                </div>
              </button>
            ))}
          </div>

        </div>

        {/* 상세 차트 */}
        <div className="lg:col-span-3 space-y-4">
          {selected && (
            <>
              {/* 순위 히스토리 카드 */}
              <div className="bg-white rounded-2xl border border-brand-border p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-[11px] text-brand-sub font-medium mb-1">키워드 &ldquo;{selected.keyword}&rdquo;</p>
                    <h3 className="text-[16px] font-bold text-brand-dark mb-2">{selected.productName}</h3>
                    {/* URL / ID 표시 */}
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-lighter border border-brand-border max-w-full">
                      <svg className="w-3.5 h-3.5 text-brand-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      {selected.targetUrl.startsWith("http") ? (
                        <a
                          href={selected.targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[12px] text-brand-primary truncate hover:underline"
                        >
                          {selected.targetUrl}
                        </a>
                      ) : (
                        <span className="text-[12px] text-brand-sub font-mono truncate">ID: {selected.targetUrl}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-brand-sub">현재 순위</p>
                    <p className="text-[28px] font-extrabold leading-tight" style={{ color: meta.color }}>
                      {selected.currentRank ?? "-"}
                      <span className="text-[14px] font-medium text-brand-sub ml-1">위</span>
                    </p>
                  </div>
                </div>

                {/* 순위 요약 */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: "최고 순위", value: `${selected.bestRank}위` },
                    { label: "전일 순위", value: selected.prevRank ? `${selected.prevRank}위` : "-" },
                    { label: "순위 변동", value: selected.currentRank !== null && selected.prevRank !== null ? (selected.prevRank - selected.currentRank > 0 ? `▲ ${selected.prevRank - selected.currentRank}` : selected.prevRank - selected.currentRank < 0 ? `▼ ${Math.abs(selected.prevRank - selected.currentRank)}` : "-") : "-" },
                  ].map(({ label, value }, i) => (
                    <div key={i} className="bg-brand-lighter rounded-xl px-4 py-3 text-center">
                      <p className="text-[11px] text-brand-sub mb-1">{label}</p>
                      <p className="text-[15px] font-extrabold text-brand-dark">{value}</p>
                    </div>
                  ))}
                </div>

                <p className="text-[12px] font-semibold text-brand-sub mb-3">최근 7일 순위 추이</p>
                <HistoryChart item={selected} color={meta.color} />
              </div>

              {/* 플랫폼별 안내 카드 */}
              <div className="bg-white rounded-2xl border border-brand-border p-5">
                <p className="text-[13px] font-bold text-brand-dark mb-3">플랫폼 순위 기준 안내</p>
                <div className="space-y-2">
                  {activePlatform === "naver_place" && [
                    "검색 키워드 입력 후 플레이스 탭 기준 순위입니다.",
                    "지역 + 키워드 조합으로 순위가 결정됩니다.",
                    "저장/길찾기/리뷰 미션 수행 시 순위 상승에 유리합니다.",
                  ].map((t, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0" style={{ background: meta.color }} />
                      <p className="text-[13px] text-brand-sub">{t}</p>
                    </div>
                  ))}
                  {activePlatform === "naver_shopping" && [
                    "네이버쇼핑 검색 결과 내 상품 순위입니다.",
                    "통합스토어 / 가격비교 각각 순위가 다릅니다.",
                    "클릭수, 구매전환율이 순위에 영향을 미칩니다.",
                  ].map((t, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0" style={{ background: meta.color }} />
                      <p className="text-[13px] text-brand-sub">{t}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── 모달 ── */}
      {showModal && (
        <AddKeywordModal platform={activePlatform} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
