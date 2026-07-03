import Link from "next/link";

type Ad = {
  href: string;
  category: string;
  title: string;
  desc: string;
  metric: string;
  badge: { label: string; cls: string };
  iconBg: string;
  icon: React.ReactNode;
};

const ADS: Ad[] = [
  {
    href: "/marketing/ads/naver-cpc",
    category: "네이버 광고",
    title: "SA 광고 대행",
    desc: "클릭당 70원~ · 검색결과 최상단 노출",
    metric: "클릭당 70원~",
    badge: { label: "인기", cls: "bg-[#D4EEFF] text-[#0187E6]" },
    iconBg: "linear-gradient(135deg,#03C75A,#029B49)",
    icon: <span className="text-white font-extrabold text-[19px] leading-none select-none">N</span>,
  },
  {
    href: "/marketing/ads/meta",
    category: "META 광고",
    title: "퍼포먼스 대행",
    desc: "35억 명 도달 · 정밀 타겟팅 전환 최적화",
    metric: "전환율 +45%",
    badge: { label: "추천", cls: "bg-[#E8ECF8] text-[#0D3473]" },
    iconBg: "linear-gradient(135deg,#1877F2,#0C5FD6)",
    icon: (
      <svg className="w-[19px] h-[19px] text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    href: "/marketing/community/cafe",
    category: "바이럴 마케팅",
    title: "네이버 카페 침투",
    desc: "1,000+ 채널 운영 · 100% A/S 보장",
    metric: "1,000+ 채널",
    badge: { label: "NEW", cls: "bg-[#DFF5E6] text-[#1E9E54]" },
    iconBg: "linear-gradient(135deg,#0D3473,#111D37)",
    icon: (
      <svg className="w-[19px] h-[19px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
];

export default function AdBanners() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {ADS.map((ad) => (
        <Link
          key={ad.href}
          href={ad.href}
          className="card-hover group flex flex-col justify-between gap-4 rounded-2xl border border-[#E2E6ED] bg-white p-5"
        >
          {/* 상단: 아이콘칩 + 카테고리 + 뱃지 */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: ad.iconBg, boxShadow: "0 4px 12px rgba(17,29,55,.16)" }}
              >
                {ad.icon}
              </span>
              <span className="text-[13px] font-semibold text-[#99A0AC] truncate">{ad.category}</span>
            </div>
            <span className={`shrink-0 text-[12px] font-bold px-2 py-0.5 rounded-full ${ad.badge.cls}`}>
              {ad.badge.label}
            </span>
          </div>

          {/* 중단: 타이틀 + 설명 */}
          <div>
            <p className="text-[19px] font-extrabold text-[#111D37] leading-tight tracking-tight">{ad.title}</p>
            <p className="text-[14px] text-[#5B6472] mt-1.5 leading-relaxed">{ad.desc}</p>
          </div>

          {/* 하단: 지표 링크 */}
          <div className="flex items-center justify-between pt-3 border-t border-[#EDEFF2]">
            <span className="text-[15px] font-extrabold text-[#0D3473] tabular-nums">{ad.metric}</span>
            <span className="flex items-center gap-1 text-[13px] font-bold text-[#0D3473] group-hover:gap-1.5 transition-all">
              바로가기
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
