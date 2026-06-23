import Link from "next/link";

const ADS = [
  {
    href: "/marketing/ads/naver-cpc",
    category: "네이버 광고",
    title: "SA 광고 대행",
    desc: "클릭당 70원~, 검색결과 최상단",
    grad: "linear-gradient(135deg,#03C75A,#029B49)",
    icon: (
      <span className="text-white font-extrabold text-[18px] leading-none select-none">N</span>
    ),
  },
  {
    href: "/marketing/ads/meta",
    category: "META 광고",
    title: "퍼포먼스 대행",
    desc: "35억 명 도달, 전환율 +45%",
    grad: "linear-gradient(135deg,#1877F2,#0C5FD6)",
    icon: (
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    href: "/marketing/community/cafe",
    category: "바이럴",
    title: "네이버 카페 침투",
    desc: "1,000+ 채널, 100% A/S 보장",
    grad: "linear-gradient(135deg,#1B1F3B,#3B2094)",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
];

export default function AdBanners() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {ADS.map((ad) => (
        <Link
          key={ad.href}
          href={ad.href}
          className="group relative rounded-2xl overflow-hidden flex flex-col justify-between gap-3 px-4 py-4 min-h-[80px] hover:opacity-90 transition-opacity"
          style={{ background: ad.grad }}
        >
          {/* 상단: 카테고리 + 아이콘 */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/70 tracking-wide">{ad.category}</span>
            <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
              {ad.icon}
            </div>
          </div>

          {/* 하단: 타이틀 + 설명 + 화살표 */}
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[15px] font-extrabold text-white leading-tight">{ad.title}</p>
              <p className="text-[11px] text-white/65 mt-0.5">{ad.desc}</p>
            </div>
            <svg className="w-4 h-4 text-white/60 shrink-0 group-hover:text-white transition-colors mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  );
}
