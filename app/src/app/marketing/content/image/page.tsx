"use client";

import Link from "next/link";
import { useState } from "react";

/* ── 접시+포크 씬 SVG (프리뷰 카드용) ── */
function PlateScene({ bg, vaseColor = "#1F2937" }: { bg: string; vaseColor?: string }) {
  return (
    <svg viewBox="0 0 160 130" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="160" height="130" fill={bg} />
      {/* 꽃병 */}
      <rect x="18" y="22" width="11" height="36" rx="3" fill={vaseColor} opacity="0.85" />
      <ellipse cx="23.5" cy="22" rx="7" ry="4" fill={vaseColor} opacity="0.85" />
      <circle cx="23.5" cy="15" r="5" fill="white" opacity="0.7" />
      <circle cx="17" cy="11" r="3" fill="white" opacity="0.5" />
      <circle cx="30" cy="12" r="2.5" fill="white" opacity="0.4" />
      {/* 큰 접시 */}
      <ellipse cx="88" cy="78" rx="50" ry="46" fill="white" opacity="0.92" />
      <ellipse cx="88" cy="78" rx="42" ry="38" fill="transparent" stroke="#E5E7EB" strokeWidth="1.5" />
      {/* 포크 */}
      <rect x="30" y="52" width="2.5" height="52" rx="1.2" fill="#9CA3AF" opacity="0.8" />
      <rect x="34" y="52" width="1.5" height="28" rx="0.7" fill="#9CA3AF" opacity="0.6" />
      <rect x="38" y="52" width="2.5" height="52" rx="1.2" fill="#9CA3AF" opacity="0.8" />
      {/* 나이프 */}
      <rect x="143" y="52" width="2.5" height="52" rx="1.2" fill="#9CA3AF" opacity="0.8" />
      {/* 숟가락 */}
      <rect x="149" y="60" width="2.5" height="44" rx="1.2" fill="#9CA3AF" opacity="0.8" />
      <ellipse cx="150.2" cy="57" rx="4.5" ry="7" fill="#9CA3AF" opacity="0.8" />
    </svg>
  );
}

/* ── 구도별 SVG ── */
function AngleScene({ type, bg }: { type: string; bg: string }) {
  if (type === "topdown") {
    return (
      <svg viewBox="0 0 160 130" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="160" height="130" fill={bg} />
        <ellipse cx="80" cy="65" rx="52" ry="50" fill="white" opacity="0.92" />
        <ellipse cx="80" cy="65" rx="42" ry="40" fill="transparent" stroke="#E5E7EB" strokeWidth="1.5" />
        <rect x="22" y="42" width="2.5" height="46" rx="1.2" fill="#9CA3AF" opacity="0.8" />
        <rect x="136" y="42" width="2.5" height="46" rx="1.2" fill="#9CA3AF" opacity="0.8" />
        <rect x="20" y="16" width="10" height="32" rx="3" fill="#1F2937" opacity="0.75" />
      </svg>
    );
  }
  if (type === "45deg") {
    return (
      <svg viewBox="0 0 160 130" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="160" height="130" fill={bg} />
        <ellipse cx="90" cy="85" rx="55" ry="40" fill="white" opacity="0.92" />
        <ellipse cx="90" cy="85" rx="44" ry="32" fill="transparent" stroke="#E5E7EB" strokeWidth="1.5" />
        <rect x="25" y="60" width="2.5" height="50" rx="1.2" fill="#9CA3AF" opacity="0.8" />
        <rect x="148" y="62" width="2.5" height="48" rx="1.2" fill="#9CA3AF" opacity="0.8" />
        <rect x="16" y="18" width="10" height="36" rx="3" fill="#1F2937" opacity="0.75" />
        <ellipse cx="21" cy="18" rx="6" ry="3.5" fill="#1F2937" opacity="0.75" />
        <circle cx="21" cy="12" r="4.5" fill="white" opacity="0.65" />
      </svg>
    );
  }
  /* handheld */
  return (
    <svg viewBox="0 0 160 130" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="160" height="130" fill={bg} />
      <ellipse cx="82" cy="72" rx="50" ry="42" fill="white" opacity="0.92" />
      <ellipse cx="82" cy="72" rx="40" ry="34" fill="transparent" stroke="#E5E7EB" strokeWidth="1.5" />
      {/* 손 */}
      <path d="M55 118 Q60 100 70 95 Q80 90 95 92 Q110 94 118 108 Q122 116 118 122 Q85 130 55 118Z"
        fill="#F5CBA7" opacity="0.85" />
      <rect x="30" y="58" width="2.5" height="44" rx="1.2" fill="#9CA3AF" opacity="0.8" />
    </svg>
  );
}

const CATEGORIES = ["음식", "사장", "제품"] as const;
type Category = (typeof CATEGORIES)[number];

const TONES = [
  { id: "warm",    label: "따뜻한 색감", desc: "황금빛 분위기 색감",   badge: "WARM",    bg: "#D4B48C" },
  { id: "cool",    label: "차가운 색감", desc: "시원하고 청량한 색감", badge: "COOL",    bg: "#BACED8" },
  { id: "neutral", label: "중립",        desc: "자연스러운 색감",      badge: "NEUTRAL", bg: "#CEC5B8" },
];

const BACKGROUNDS = [
  { id: "darkwood", label: "다크우드", desc: "고급스러운 나무",    badge: "DARK WOOD", bg: "#2C1810", vase: "#F5F5F5" },
  { id: "slate",    label: "슬레이트", desc: "모던한 돌판",        badge: "SLATE",     bg: "#374151", vase: "#F5F5F5" },
  { id: "marble",   label: "마블",     desc: "럭셔리 대리석",     badge: "MARBLE",    bg: "#EEE9E2", vase: "#1F2937" },
  { id: "white",    label: "화이트",   desc: "깔끔한 흰색",       badge: "WHITE",     bg: "#F8F8F6", vase: "#1F2937" },
  { id: "gravel",   label: "자갈",     desc: "자연스러운 조약돌", badge: "GRAVEL",    bg: "#111827", vase: "#F5F5F5" },
];

const ANGLES = [
  { id: "topdown",  label: "탑다운",   desc: "90도 위에서",   badge: "TOP DOWN", bg: "#D8D0C8" },
  { id: "45deg",    label: "45도",     desc: "입체감 강조",   badge: "45°",      bg: "#C8D8D0" },
  { id: "handheld", label: "핸드헬드", desc: "손에 들고 촬영", badge: "HAND",    bg: "#D8CCC8" },
];

const RATIOS = [
  { id: "1:1",  label: "1:1",  desc: "정사각형",    w: 28, h: 28 },
  { id: "4:3",  label: "4:3",  desc: "교교형",      w: 32, h: 24 },
  { id: "3:4",  label: "3:4",  desc: "세로형",      w: 24, h: 32 },
  { id: "16:9", label: "16:9", desc: "가로 와이드", w: 36, h: 20 },
  { id: "9:16", label: "9:16", desc: "세로 와이드", w: 20, h: 36 },
];

/* ── 재사용 카드 컴포넌트 ── */
function StyleCard({
  selected, onClick, badge, label, desc, preview,
}: {
  selected: boolean;
  onClick: () => void;
  badge: string;
  label: string;
  desc: string;
  preview: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col rounded-xl overflow-hidden border-2 transition-all text-left ${
        selected ? "border-brand-primary shadow-md shadow-brand-primary/10" : "border-transparent hover:border-brand-primary/30"
      }`}
    >
      {/* 이미지 영역 */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        {preview}
        {/* 배지 */}
        <div className="absolute bottom-0 inset-x-0 flex justify-center pb-2">
          <span className="text-[9px] font-extrabold tracking-widest text-white bg-black/40 px-2 py-0.5 rounded">
            {badge}
          </span>
        </div>
        {/* 선택 체크 */}
        {selected && (
          <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-brand-primary flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
      {/* 텍스트 */}
      <div className="px-2 pt-2 pb-2.5 bg-white">
        <p className="text-[12px] font-bold text-brand-dark">{label}</p>
        <p className="text-[10px] text-brand-muted mt-0.5">{desc}</p>
      </div>
    </button>
  );
}

export default function ImagePage() {
  const [category, setCategory] = useState<Category>("음식");
  const [tone, setTone] = useState("warm");
  const [background, setBackground] = useState("darkwood");
  const [angle, setAngle] = useState("topdown");
  const [ratio, setRatio] = useState("1:1");
  const [uploaded, setUploaded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleGenerate = async () => {
    if (!uploaded) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1800));
    setGenerating(false);
    setGenerated(true);
  };

  const selectedTone = TONES.find((t) => t.id === tone)!;
  const selectedBg   = BACKGROUNDS.find((b) => b.id === background)!;
  const selectedAngle = ANGLES.find((a) => a.id === angle)!;

  return (
    <div className="w-full space-y-4">
      <nav className="flex items-center gap-1.5 text-[13px] text-brand-sub">
        <Link href="/marketing" className="hover:text-brand-text">대시보드</Link>
        <span>›</span>
        <span className="text-brand-muted">콘텐츠</span>
        <span>›</span>
        <span className="text-brand-text font-medium">10초 이미지 제작</span>
      </nav>

      {/* ── Before / After 배너 ── */}
      <div className="rounded-2xl overflow-hidden border border-[#1E2D4A]" style={{ background: "#0B1628" }}>
        <p className="px-5 pt-4 pb-3 text-white text-[14px] font-bold">30초만 투자하여 매장을 리뉴얼해보세요</p>
        <div className="grid grid-cols-4 gap-0 px-3 pb-4">
          {/* 각 쌍: BEFORE(왼) + AFTER(오른, 핑크 테두리) */}
          {[
            {
              beforeGrad: "linear-gradient(160deg,#3D2810 0%,#5C3A18 50%,#2C1C08 100%)",
              afterGrad:  "linear-gradient(160deg,#1A1A20 0%,#2D2D35 50%,#111118 100%)",
              beforeFood: "🍜", afterFood: "🍲",
            },
            {
              beforeGrad: "linear-gradient(160deg,#2A1808 0%,#4A2A10 50%,#1E1206 100%)",
              afterGrad:  "linear-gradient(160deg,#181820 0%,#252530 50%,#101018 100%)",
              beforeFood: "🥘", afterFood: "🦞",
            },
            {
              beforeGrad: "linear-gradient(160deg,#0E1A10 0%,#1A2C1C 50%,#0A1208 100%)",
              afterGrad:  "linear-gradient(160deg,#1C1C10 0%,#2C2C18 50%,#141408 100%)",
              beforeFood: "🥗", afterFood: "🍱",
            },
            {
              beforeGrad: "linear-gradient(160deg,#1A1010 0%,#2C1818 50%,#120C0C 100%)",
              afterGrad:  "linear-gradient(160deg,#F8F4EE 0%,#EDE5D8 50%,#F0E8DC 100%)",
              beforeFood: "🍵", afterFood: "🧁",
            },
          ].map((pair, i) => (
            <div key={i} className="flex gap-1.5 px-1.5">
              {/* BEFORE */}
              <div className="relative flex-1 rounded-xl overflow-hidden h-[148px]"
                style={{ background: pair.beforeGrad }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[44px] opacity-30 select-none">{pair.beforeFood}</span>
                </div>
                <span className="absolute bottom-2 left-2 text-[9px] font-bold text-white/70 bg-black/40 px-1.5 py-0.5 rounded">BEFORE</span>
              </div>
              {/* AFTER (핑크 테두리) */}
              <div className="relative flex-1 rounded-xl overflow-hidden h-[148px] ring-2 ring-[#EC4899]"
                style={{ background: pair.afterGrad }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[44px] opacity-60 select-none">{pair.afterFood}</span>
                </div>
                <span className="absolute bottom-2 right-2 text-[9px] font-bold text-white bg-[#EC4899] px-1.5 py-0.5 rounded">AFTER</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 서비스 소개 ── */}
      <div className="bg-white rounded-2xl border border-brand-border p-5">
        <div className="flex items-start gap-3">
          <span className="text-[24px]">🐯</span>
          <div className="flex-1">
            <h2 className="text-[16px] font-extrabold text-brand-dark mb-1">AI 스튜디오 이미지 촬영</h2>
            <p className="text-[13px] text-brand-sub">
              사진을 업로드하면 <span className="font-bold text-brand-dark">전문 스튜디오</span>에서 체촬영한 것처럼 고품질 이미지로 변환됩니다.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[13px] text-brand-muted line-through">10,000P</span>
              <span className="text-[13px] text-brand-sub">→</span>
              <span className="text-[14px] font-extrabold text-pink-600">한정 할인 2,000P</span>
              <span className="text-[12px] text-brand-muted">/1회</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 메인 2컬럼 ── */}
      <div className="grid grid-cols-[1fr_320px] gap-4 items-start">

        {/* 왼쪽: 1·2단계 */}
        <div className="bg-white rounded-2xl border border-brand-border p-6 space-y-8">

          {/* 1. 카테고리 */}
          <div>
            <p className="text-[14px] font-extrabold text-brand-dark mb-3">1. 카테고리 선택</p>
            <div className="flex gap-2">
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-bold border transition-all ${
                    category === c
                      ? "bg-brand-dark text-white border-brand-dark"
                      : "bg-brand-lighter text-brand-sub border-brand-border hover:border-brand-primary/40"
                  }`}>
                  {c === "음식" ? "🍽️" : c === "사장" ? "👤" : "📦"} {c}
                  {c !== "음식" && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-pink-500 text-white ml-1">NEW</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 2. 스타일 */}
          <div className="space-y-7">
            <p className="text-[14px] font-extrabold text-brand-dark">2. 스타일 선택</p>

            {/* 배경 */}
            <div>
              <p className="text-[13px] font-bold text-brand-dark mb-3">배경</p>
              <div className="flex gap-3 flex-wrap">
                {BACKGROUNDS.map((b) => (
                  <div key={b.id} className="w-[136px]">
                    <StyleCard
                      selected={background === b.id}
                      onClick={() => setBackground(b.id)}
                      badge={b.badge}
                      label={b.label}
                      desc={b.desc}
                      preview={<PlateScene bg={b.bg} vaseColor={b.vase} />}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 구도 */}
            <div>
              <p className="text-[13px] font-bold text-brand-dark mb-3">구도</p>
              <div className="flex gap-3">
                {ANGLES.map((a) => (
                  <div key={a.id} className="w-[160px]">
                    <StyleCard
                      selected={angle === a.id}
                      onClick={() => setAngle(a.id)}
                      badge={a.badge}
                      label={a.label}
                      desc={a.desc}
                      preview={<AngleScene type={a.id} bg={a.bg} />}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 비율 */}
            <div>
              <p className="text-[13px] font-bold text-brand-dark mb-3">비율</p>
              <div className="flex gap-2 flex-wrap">
                {RATIOS.map((r) => (
                  <button key={r.id} onClick={() => setRatio(r.id)}
                    className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-all ${
                      ratio === r.id
                        ? "border-brand-primary bg-brand-primary/5"
                        : "border-brand-border hover:border-brand-primary/40 bg-brand-lighter"
                    }`}>
                    <div className="flex items-center justify-center" style={{ width: 40, height: 40 }}>
                      <div className="rounded border-2 bg-white" style={{
                        borderColor: ratio === r.id ? "#3182F6" : "#9CA3AF",
                        width: r.w,
                        height: r.h,
                      }} />
                    </div>
                    <p className="text-[12px] font-bold text-brand-dark">{r.label}</p>
                    <p className="text-[10px] text-brand-muted">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 3단계 업로드 */}
        <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-4 sticky top-4">
          <p className="text-[14px] font-extrabold text-brand-dark">3. 이미지 업로드</p>

          {generated ? (
            <div className="space-y-3">
              <div className="rounded-xl h-[240px] flex flex-col items-center justify-center gap-3 overflow-hidden relative">
                <PlateScene bg={selectedBg.bg} vaseColor={selectedBg.vase} />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 gap-2">
                  <span className="text-[40px]">✨</span>
                  <p className="text-[13px] font-bold text-white">AI 이미지 생성 완료!</p>
                </div>
              </div>
              <button className="w-full py-3 rounded-xl text-[13px] font-extrabold text-white"
                style={{ background: "linear-gradient(135deg,#EC4899,#8B5CF6)" }}>
                이미지 다운로드
              </button>
              <button onClick={() => { setGenerated(false); setUploaded(false); }}
                className="w-full py-2.5 rounded-xl text-[13px] font-bold text-brand-sub bg-brand-lighter border border-brand-border hover:text-brand-text transition-colors">
                다시 생성하기
              </button>
            </div>
          ) : (
            <>
              {/* 업로드 영역 */}
              <div
                onClick={() => setUploaded(true)}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); setUploaded(true); }}
                className={`rounded-xl border-2 border-dashed h-[220px] flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                  dragOver   ? "border-pink-400 bg-pink-50" :
                  uploaded   ? "border-green-400 bg-green-50" :
                  "border-brand-border hover:border-pink-300 hover:bg-pink-50/40"
                }`}>
                {uploaded ? (
                  <>
                    <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-[13px] font-bold text-green-600">이미지 업로드 완료</p>
                    <p className="text-[11px] text-brand-muted">클릭하여 교체</p>
                  </>
                ) : (
                  <>
                    <div className="h-11 w-11 rounded-full bg-brand-lighter border border-brand-border flex items-center justify-center">
                      <svg className="w-5 h-5 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-[13px] text-brand-sub font-medium">이미지를 드래그하거나 클릭하여 업로드</p>
                      <p className="text-[11px] text-brand-muted mt-0.5">PNG, JPG, WEBP (최대 20MB)</p>
                    </div>
                  </>
                )}
              </div>

              {/* 선택 요약 */}
              <div className="rounded-xl bg-brand-lighter border border-brand-border p-3 space-y-1.5">
                {[
                  { label: "카테고리", value: category },
                  { label: "배경",     value: selectedBg.label },
                  { label: "구도",     value: selectedAngle.label },
                  { label: "비율",     value: ratio },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-[11px] text-brand-muted">{row.label}</span>
                    <span className="text-[11px] font-bold text-brand-dark">{row.value}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleGenerate}
                disabled={!uploaded || generating}
                className="w-full py-3.5 rounded-xl text-[14px] font-extrabold text-white transition-all disabled:opacity-40 cursor-pointer hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#EC4899,#8B5CF6)" }}>
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    AI 생성 중...
                  </span>
                ) : "AI 이미지 생성하기 (2,000P)"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
