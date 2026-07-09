import { redirect } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/marketing/PageHeader";

const REVIEW_TYPES = [
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
  redirect("/marketing/review/shopping/product-experience");
  return (
    <div className="w-full space-y-6">

      {/* 헤더 */}
      <PageHeader
        title="네이버 쇼핑 리뷰"
        subtitle="리뷰 유형을 선택하여 캠페인을 시작하세요."
        iconPath={"M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"}
      />

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
                <span className={`text-[12px] font-bold px-2.5 py-1 rounded-lg ${item.tagBg} ${item.tagText}`}>
                  {item.tag}
                </span>
              </div>

              {/* 제목 + 설명 */}
              <div className="flex-1">
                <h2 className="text-[18px] font-extrabold text-brand-dark mb-1.5">{item.label}</h2>
                <p className="text-[15px] text-brand-sub leading-relaxed">{item.desc}</p>
              </div>

              {/* 포인트 리스트 */}
              <ul className="space-y-1">
                {item.points.map((pt) => (
                  <li key={pt} className="flex items-center gap-2 text-[13px] text-brand-sub">
                    <span className="w-1 h-1 rounded-full shrink-0 bg-brand-muted" />
                    {pt}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="flex items-center justify-between pt-3 border-t border-brand-border">
                <span className="text-[15px] font-bold text-brand-primary">캠페인 시작하기</span>
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
