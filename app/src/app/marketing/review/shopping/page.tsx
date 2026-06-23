import Link from "next/link";

const REVIEW_TYPES = [
  {
    href: "/marketing/review/shopping/blog-reporter",
    label: "블로그리뷰(기자단)",
    desc: "전문 블로거 기자단이 상품을 직접 사용·분석 후 고품질 콘텐츠를 작성합니다. SEO 최적화된 리뷰로 검색 노출을 극대화합니다.",
    grad: "linear-gradient(135deg,#3182F6,#6366F1)",
    iconPath: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z",
    tag: "고품질",
    tagBg: "bg-blue-50",
    tagText: "text-blue-600",
    points: ["전문 기자단 네트워크", "고조회수 블로그 콘텐츠", "SEO 최적화 리뷰"],
  },
  {
    href: "/marketing/review/shopping/blog-experience",
    label: "블로그리뷰(체험단)",
    desc: "체험단 회원들이 직접 구매 후 솔직한 상품 후기를 작성합니다. 자연스러운 입소문으로 신규 구매자 유입을 늘립니다.",
    grad: "linear-gradient(135deg,#10B981,#059669)",
    iconPath: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
    tag: "입소문",
    tagBg: "bg-emerald-50",
    tagText: "text-emerald-600",
    points: ["대규모 체험단 풀", "자연스러운 바이럴 효과", "실구매 후 솔직 후기"],
  },
  {
    href: "/marketing/review/shopping/product-experience",
    label: "상품 체험단",
    desc: "무료 샘플 또는 할인 제공 후 실제 사용 경험을 기반으로 리뷰를 수집합니다. 신제품 런칭 및 브랜드 인지도 향상에 효과적입니다.",
    grad: "linear-gradient(135deg,#F59E0B,#EF4444)",
    iconPath: "M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z",
    tag: "신제품",
    tagBg: "bg-amber-50",
    tagText: "text-amber-600",
    points: ["샘플·할인 제공 연동", "신제품 런칭 특화", "구매 전환율 향상"],
  },
];

export default function ShoppingReviewDashboard() {
  return (
    <div className="w-full space-y-6">

      {/* 헤더 */}
      <div>
        <div className="flex items-center gap-2 text-[12px] text-brand-muted mb-3">
          <span>리뷰·체험단</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-brand-text font-medium">네이버 쇼핑 체험단</span>
        </div>
        <h1 className="text-[22px] font-extrabold text-brand-dark tracking-tight">네이버 쇼핑 체험단</h1>
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
