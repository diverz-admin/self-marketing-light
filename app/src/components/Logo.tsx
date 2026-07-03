import React from "react";

/* ── BlueEgg 로고 마크 (블루 에그 + 상승 성장 화살표) ── */
export function BlueEggMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="beEggGrad" x1="22" y1="10" x2="82" y2="112" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4C7BE3" />
          <stop offset="52%" stopColor="#1E3FA0" />
          <stop offset="100%" stopColor="#0A1547" />
        </linearGradient>
      </defs>
      {/* 에그 */}
      <path
        d="M50 6 C73 6 89 45 89 73 C89 99 71 114 50 114 C29 114 11 99 11 73 C11 45 27 6 50 6 Z"
        fill="url(#beEggGrad)"
      />
      {/* 성장 라인 */}
      <path
        d="M27 87 L41 72 L49 80 L60 58 L67 65 L79 45"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 화살촉 (우상향) */}
      <path
        d="M65 45 H79 V59"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── BLUE EGG 텍스트 로고 (스텐실 스타일 벡터 + biz) ── */
export function BlueEggText({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 210 30"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* B */}
      <path d="M 2 4 V 26" />
      <path d="M 8 4 H 13 C 16.5 4 18 6 18 9 C 18 12 16.5 14 13 14 H 8" />
      <path d="M 8 16 H 13 C 16.5 16 18 18 18 21 C 18 24 16.5 26 13 26 H 8" />

      {/* L */}
      <path d="M 26 4 V 26" />
      <path d="M 32 26 H 42" />

      {/* U */}
      <path d="M 50 4 V 21 C 50 24.5 52.5 26 55.5 26" />
      <path d="M 64 4 V 21 C 64 24.5 61.5 26 58.5 26" />

      {/* E */}
      <path d="M 74 4 V 26" />
      <path d="M 80 4 H 90" />
      <path d="M 80 15 H 88" />
      <path d="M 80 26 H 90" />

      {/* E */}
      <path d="M 104 4 V 26" />
      <path d="M 110 4 H 120" />
      <path d="M 110 15 H 118" />
      <path d="M 110 26 H 120" />

      {/* G */}
      <path d="M 128 11 V 19" />
      <path d="M 128 8 C 128 5.5 130.5 4 134 4 H 144" />
      <path d="M 128 22 C 128 24.5 130.5 26 134 26 H 144" />
      <path d="M 138 15 H 144 V 22" />

      {/* G */}
      <path d="M 152 11 V 19" />
      <path d="M 152 8 C 152 5.5 154.5 4 158 4 H 168" />
      <path d="M 152 22 C 152 24.5 154.5 26 158 26 H 168" />
      <path d="M 162 15 H 168 V 22" />

      {/* biz (회색) */}
      <text
        x="177"
        y="26"
        fontSize="15"
        fontWeight={800}
        fill="#8B93A7"
        stroke="none"
        style={{ fontFamily: '"Pretendard Variable", Pretendard, "Apple SD Gothic Neo", sans-serif', letterSpacing: "-0.02em" }}
      >
        biz
      </text>
    </svg>
  );
}

/* ── 전체 로고 (마크 + 텍스트 가로 조합형) ── */
export default function Logo({
  className,
  markClassName = "h-8 w-auto",
  textClassName = "h-5 w-auto",
  textColor = "text-[#0B1354]"
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  textColor?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className || ""}`}>
      <BlueEggMark className={markClassName} />
      <BlueEggText className={`${textClassName} ${textColor}`} />
    </div>
  );
}
