import Link from "next/link";

const REVIEW_TYPES = [
  {
    href: "/marketing/review/place/blog-reporter",
    label: "블로그리뷰(기자단)",
    desc: "전문 블로거 기자단이 직접 방문 취재 후 고품질 콘텐츠를 작성합니다. SEO 최적화된 리뷰로 검색 노출을 극대화합니다.",
    grad: "linear-gradient(135deg,#3182F6,#6366F1)",
    iconPath: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z",
    tag: "고품질",
    tagBg: "bg-blue-50",
    tagText: "text-blue-600",
    points: ["전문 기자단 네트워크", "고조회수 블로그 콘텐츠", "SEO 최적화 리뷰"],
  },
  {
    href: "/marketing/review/place/blog-experience",
    label: "블로그리뷰(체험단)",
    desc: "체험단 회원들이 직접 방문 후 솔직한 후기를 작성합니다. 자연스러운 입소문으로 신규 고객 유입을 늘립니다.",
    grad: "linear-gradient(135deg,#10B981,#059669)",
    iconPath: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
    tag: "입소문",
    tagBg: "bg-emerald-50",
    tagText: "text-emerald-600",
    points: ["대규모 체험단 풀", "자연스러운 바이럴 효과", "방문 후 솔직 후기"],
  },
  {
    href: "/marketing/review/place/visitor",
    label: "방문자 리뷰",
    desc: "실제 방문 고객이 네이버 플레이스에 직접 리뷰를 남기도록 유도합니다. 리뷰 수 증가로 플레이스 신뢰도와 검색 순위를 동시에 높입니다.",
    grad: "linear-gradient(135deg,#F59E0B,#EF4444)",
    iconPath: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
    tag: "신뢰도",
    tagBg: "bg-amber-50",
    tagText: "text-amber-600",
    points: ["플레이스 별점 상승", "리뷰 수 빠른 증가", "검색 순위 개선"],
  },
  {
    href: "/marketing/review/place/reservation",
    label: "예약자 리뷰",
    desc: "네이버 예약 고객 대상으로 리뷰를 체계적으로 관리합니다. 예약 완료 고객의 높은 전환율로 리뷰 퀄리티가 보장됩니다.",
    grad: "linear-gradient(135deg,#8B5CF6,#6D28D9)",
    iconPath: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z",
    tag: "예약 연동",
    tagBg: "bg-purple-50",
    tagText: "text-purple-600",
    points: ["네이버 예약 연동", "높은 리뷰 전환율", "예약자 타겟 관리"],
  },
];

export default function PlaceReviewDashboard() {
  return (
    <div className="w-full space-y-6">

      {/* 헤더 */}
      <div>
        <div className="flex items-center gap-2 text-[12px] text-brand-muted mb-3">
          <span>리뷰·체험단</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          <span className="text-brand-text font-medium">네이버 플레이스 리뷰</span>
        </div>
        <h1 className="text-[22px] font-extrabold text-brand-dark tracking-tight">네이버 플레이스 리뷰</h1>
        <p className="text-[14px] text-brand-sub mt-1">리뷰 유형을 선택하여 캠페인을 시작하세요.</p>
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REVIEW_TYPES.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group bg-white rounded-2xl border border-brand-border hover:border-transparent hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col"
          >
            {/* 카드 상단 컬러 바 */}
            <div className="h-1.5 w-full" style={{ background: item.grad }} />

            <div className="p-5 flex flex-col gap-4 flex-1">
              {/* 아이콘 + 태그 */}
              <div className="flex items-start justify-between">
                <span
                  className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: item.grad }}
                >
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath} />
                  </svg>
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${item.tagBg} ${item.tagText}`}>
                  {item.tag}
                </span>
              </div>

              {/* 제목 + 설명 */}
              <div className="flex-1">
                <h2 className="text-[16px] font-extrabold text-brand-dark mb-1.5">{item.label}</h2>
                <p className="text-[13px] text-brand-sub leading-relaxed">{item.desc}</p>
              </div>

              {/* 포인트 리스트 */}
              <ul className="space-y-1">
                {item.points.map((pt) => (
                  <li key={pt} className="flex items-center gap-2 text-[12px] text-brand-sub">
                    <span className="w-1 h-1 rounded-full shrink-0 bg-brand-muted" />
                    {pt}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="flex items-center justify-between pt-3 border-t border-brand-border">
                <span className="text-[13px] font-bold text-brand-primary">캠페인 시작하기</span>
                <span className="h-7 w-7 rounded-full bg-brand-lighter flex items-center justify-center group-hover:bg-brand-primary transition-colors">
                  <svg className="w-3.5 h-3.5 text-brand-primary group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
