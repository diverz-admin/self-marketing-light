import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "요금 안내 | BLUE EGG",
  description: "상담·계약 없이 단위당 투명한 단가로 마케팅을 실행하세요.",
};

const PLANS = [
  {
    tag: "로컬 매장",
    title: "네이버 플레이스 유입",
    price: "100원",
    unit: "/ 1유입",
    points: ["키워드·지역·미션 설정", "원하는 기간만큼 운영", "실시간 유입 추적"],
    href: "/marketing/reward/place",
  },
  {
    tag: "온라인 스토어",
    title: "스마트스토어 트래픽",
    price: "80원",
    unit: "/ 1유입",
    points: ["키워드·일 유입량 설정", "스마트스토어·쿠팡 지원", "일별 리포트 제공"],
    href: "/marketing/reward/shopping",
    featured: true,
  },
  {
    tag: "리뷰·체험단",
    title: "블로그 기자단",
    price: "50,000원",
    unit: "/ 1건",
    points: ["검증된 블로거 매칭", "가이드라인 기반 리뷰", "콘텐츠 결과물 확인"],
    href: "/marketing/experience/blog",
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="bg-brand-dark text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            거품 없는 투명한 요금
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            상담·계약 없이, 단위당 단가로 필요한 만큼만 사용하세요.
          </p>
        </div>
      </section>

      <section className="bg-brand-light">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANS.map((plan) => (
              <div
                key={plan.title}
                className={`bg-white rounded-2xl border p-7 flex flex-col ${
                  plan.featured
                    ? "border-brand-primary shadow-sm ring-1 ring-brand-primary/20"
                    : "border-brand-border"
                }`}
              >
                <span className="text-[12px] font-bold text-brand-sub uppercase tracking-wider mb-2">
                  {plan.tag}
                </span>
                <h3 className="text-lg font-bold text-brand-dark mb-4">
                  {plan.title}
                </h3>
                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-brand-dark">
                    {plan.price}
                  </span>
                  <span className="text-sm text-brand-sub ml-1">
                    {plan.unit}
                  </span>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.points.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-2 text-sm text-brand-text"
                    >
                      <svg
                        className="w-4 h-4 text-brand-primary shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {p}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`w-full text-center px-4 py-3 rounded-lg text-sm font-bold transition-colors ${
                    plan.featured
                      ? "bg-brand-primary text-white hover:bg-brand-primary-hover"
                      : "bg-brand-light text-brand-dark hover:bg-brand-border/40"
                  }`}
                >
                  시작하기
                </Link>
              </div>
            ))}
          </div>

          <p className="text-xs text-brand-sub leading-relaxed mt-10 max-w-3xl">
            ※ 단가는 서비스·시기에 따라 달라질 수 있으며, 외부 플랫폼의 순위·노출은
            해당 플랫폼 정책에 따라 결과가 달라질 수 있습니다. 확정적 효과를
            약속하지 않습니다.
          </p>
        </div>
      </section>
    </>
  );
}
