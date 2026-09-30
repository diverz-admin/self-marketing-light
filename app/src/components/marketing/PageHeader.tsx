import React from "react";

/**
 * 모든 마케팅 페이지 상단에 공통으로 쓰는 아이콘 + 제목 헤더.
 * 둥근 그라데이션 타일 안에 흰색 아이콘, 오른쪽에 제목 + 부제.
 */
export default function PageHeader({
  title,
  subtitle,
  iconPath,
  gradient = "linear-gradient(135deg,#152C9E,#2452EB)",
  className = "",
}: {
  title: string;
  subtitle?: string;
  iconPath: string | string[];
  gradient?: string;
  className?: string;
}) {
  const paths = Array.isArray(iconPath) ? iconPath : [iconPath];
  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      <span
        className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
        style={{ background: gradient }}
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
          {paths.map((d, i) => (
            <path key={i} strokeLinecap="round" strokeLinejoin="round" d={d} />
          ))}
        </svg>
      </span>
      <div className="min-w-0">
        <h1 className="text-[24px] font-extrabold text-brand-dark tracking-tight leading-tight">{title}</h1>
        {subtitle && <p className="text-[15px] text-brand-sub mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
