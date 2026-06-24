import Link from "next/link";

const REVIEW_TYPES = [
  {
    href: "/marketing/review/place/blog-reporter",
    label: "블로그 배포",
    desc: "전문 블로거 네트워크를 통해 플레이스 방문 리뷰 콘텐츠를 배포합니다. SEO 최적화된 블로그 포스팅으로 검색 노출과 신뢰도를 동시에 높입니다.",
    grad: "linear-gradient(135deg,#0341C7,#6366F1)",
    iconPath: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z",
    tag: "블로그",
    tagBg: "bg-brand-lighter",
    tagText: "text-brand-primary",
    points: ["전문 블로거 네트워크", "고조회수 콘텐츠 배포", "SEO 최적화 리뷰"],
  },
  {
    href: "/marketing/review/place/receipt",
    label: "영수증 리뷰",
    desc: "실제 결제 영수증을 보유한 방문 고객이 네이버 플레이스에 리뷰를 남깁니다. 검증된 구매자 리뷰로 신뢰도와 별점을 빠르게 끌어올립니다.",
    grad: "linear-gradient(135deg,#10B981,#059669)",
    iconPath: "M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z",
    tag: "구매 인증",
    tagBg: "bg-emerald-50",
    tagText: "text-emerald-600",
    points: ["영수증 인증 방문자", "별점·리뷰 수 빠른 증가", "신뢰도 높은 실구매 후기"],
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
