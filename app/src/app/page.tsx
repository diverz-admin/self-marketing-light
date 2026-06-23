import { redirect } from "next/navigation";
import React from "react";

const SERVICES = [
  {
    tag: "로컬 매장",
    tagColor: "bg-green-50 text-green-700",
    title: "네이버 플레이스 유입",
    desc: "지역 매장의 네이버 플레이스 유입 마케팅 활동을 지원합니다. 키워드·지역·미션을 설정하고 원하는 기간만큼 운영하세요.",
    price: "100원",
    unit: "/ 1유입",
    href: "/marketing/reward/place",
  },
  {
    tag: "온라인 스토어",
    tagColor: "bg-blue-50 text-blue-700",
    title: "스마트스토어 트래픽",
    desc: "스마트스토어·쿠팡 상품 유입 마케팅 활동을 지원합니다. 키워드와 일 유입량을 설정하고 매출 증가를 경험하세요.",
    price: "80원",
    unit: "/ 1유입",
    href: "/marketing/reward/shopping",
  },
  {
    tag: "리뷰·체험단",
    tagColor: "bg-orange-50 text-orange-700",
    title: "블로그 기자단",
    desc: "블로그 체험단·기자단을 모집해 리뷰 콘텐츠를 생성합니다. 가이드라인을 입력하면 검증된 블로거들이 리뷰를 작성합니다.",
    price: "50,000원",
    unit: "/ 1건",
    href: "/marketing/experience/blog",
  },
];

const FEATURES = [
  {
    title: "상품화된 마케팅",
    desc: "상담·계약 없이 카탈로그에서 바로 선택하고 주문하세요. 광고대행사의 복잡한 절차가 필요 없습니다.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    ),
  },
  {
    title: "투명한 단가·수량",
    desc: "단위당 단가, 예상 수량, 진행/잔여 수량을 모두 공개합니다. 거품 없는 가격으로 제공합니다.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
  {
    title: "실시간 대시보드",
    desc: "일별 유입량, 진행 상태, 사용 금액을 실시간으로 확인하세요. 결과 보고서를 기다릴 필요가 없습니다.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    ),
  },
];

const STEPS = [
  { num: "01", label: "회원가입" },
  { num: "02", label: "서비스 선택" },
  { num: "03", label: "예산·기간 입력" },
  { num: "04", label: "결제" },
  { num: "05", label: "자동 실행" },
  { num: "06", label: "대시보드 추적" },
];

export default function HomePage() {
  redirect("/marketing");
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-brand-border bg-white/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-brand-primary flex items-center justify-center text-white font-bold text-base">
              M
            </span>
            <span className="font-bold text-lg text-brand-dark tracking-tight">
              SelfMarketing
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-sub">
            <a
              href="#services"
              className="hover:text-brand-text transition-colors"
            >
              서비스
            </a>
            <a
              href="#features"
              className="hover:text-brand-text transition-colors"
            >
              특징
            </a>
            <a
              href="#how"
              className="hover:text-brand-text transition-colors"
            >
              이용 방법
            </a>
            <a
              href="/login"
              className="hover:text-brand-text transition-colors"
            >
              로그인
            </a>
          </nav>
          <a
            href="/signup"
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors"
          >
            무료로 시작하기
          </a>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-brand-dark text-white">
          <div className="max-w-6xl mx-auto px-6 py-24 md:py-36">
            <span className="inline-block text-[13px] font-bold px-3 py-1 rounded-full bg-brand-primary/20 text-brand-primary mb-6">
              셀프 마케팅 플랫폼
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.15] mb-6 max-w-2xl">
              광고대행사 없이,
              <br />
              직접 마케팅을
              <br />
              실행하세요
            </h1>
            <p className="text-lg text-white/60 max-w-lg leading-relaxed mb-10">
              마케팅 서비스를 쇼핑몰에서 상품 사듯 직접 골라 실행하고,
              <br className="hidden md:block" />
              진행 현황을 실시간 대시보드로 확인하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/signup"
                className="px-6 py-3.5 rounded-lg text-sm font-bold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors w-fit"
              >
                무료로 시작하기
              </a>
              <a
                href="#services"
                className="px-6 py-3.5 rounded-lg text-sm font-bold bg-white/10 text-white hover:bg-white/20 transition-colors w-fit"
              >
                서비스 둘러보기
              </a>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="bg-white border-b border-brand-border">
          <div className="max-w-6xl mx-auto px-6 py-14">
            <p className="text-center text-xs font-bold text-brand-sub uppercase tracking-wider mb-6">
              이렇게 사용하세요
            </p>
            <div className="flex flex-wrap justify-center">
              {STEPS.map((step, i) => (
                <div key={step.num} className="flex items-center">
                  <div className="text-center px-3 md:px-5">
                    <span className="block text-[11px] font-bold text-brand-primary mb-1">
                      {step.num}
                    </span>
                    <span className="text-sm font-semibold text-brand-text">
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <svg
                      className="w-4 h-4 text-brand-border shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="bg-brand-light">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <h2 className="text-2xl md:text-3xl font-extrabold text-brand-dark mb-2">
              마케팅 서비스
            </h2>
            <p className="text-brand-sub mb-12">
              지금 바로 주문 가능한 마케팅 상품입니다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {SERVICES.map((svc) => (
                <div
                  key={svc.title}
                  className="bg-white rounded-2xl border border-brand-border p-6 hover:border-brand-primary/30 hover:shadow-sm transition-all"
                >
                  <span
                    className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded mb-4 ${svc.tagColor}`}
                  >
                    {svc.tag}
                  </span>
                  <h3 className="text-base font-bold text-brand-dark mb-2">
                    {svc.title}
                  </h3>
                  <p className="text-sm text-brand-sub leading-relaxed mb-5">
                    {svc.desc}
                  </p>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-xl font-extrabold text-brand-dark">
                        {svc.price}
                      </span>
                      <span className="text-xs text-brand-sub ml-1">
                        {svc.unit}
                      </span>
                    </div>
                    <a
                      href={svc.href}
                      className="text-xs font-bold text-brand-primary hover:text-brand-primary-hover transition-colors"
                    >
                      주문하기 →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-white border-t border-brand-border">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <h2 className="text-2xl md:text-3xl font-extrabold text-brand-dark mb-2">
              왜 셀프마케팅인가요?
            </h2>
            <p className="text-brand-sub mb-12">
              기존 광고대행의 복잡함과 불투명함을 없앴습니다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FEATURES.map((feat) => (
                <div
                  key={feat.title}
                  className="p-6 rounded-2xl border border-brand-border hover:border-brand-primary/20 transition-colors"
                >
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                    <svg
                      className="w-5 h-5 text-brand-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      {feat.icon}
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-brand-dark mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-brand-sub leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Compliance note */}
        <section className="bg-brand-light border-t border-brand-border">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <p className="text-xs text-brand-sub leading-relaxed">
              ※ 본 서비스는 마케팅 활동 실행을 지원하는 도구입니다. 네이버·쿠팡
              등 외부 플랫폼의 순위·노출은 해당 플랫폼의 정책에 따라 결과가
              달라질 수 있으며, "순위 보장", "1페이지 확정" 등 확정적 효과를
              약속하지 않습니다. 유입 지원 활동 외의 전환·매출은 상품 경쟁력에
              따라 달라집니다.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-brand-primary">
          <div className="max-w-6xl mx-auto px-6 py-20 text-center">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">
              지금 바로 마케팅을 시작하세요
            </h2>
            <p className="text-white/70 mb-8">
              무료로 가입하고, 원하는 서비스를 바로 주문하세요.
            </p>
            <a
              href="/signup"
              className="inline-block px-8 py-4 rounded-lg text-sm font-bold bg-white text-brand-primary hover:bg-brand-light transition-colors"
            >
              무료 계정 만들기
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-border bg-white py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-brand-sub">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded bg-brand-primary flex items-center justify-center text-white font-bold text-xs">
              M
            </span>
            <span className="font-bold text-brand-dark">SelfMarketing</span>
          </div>
          <span>
            &copy; {new Date().getFullYear()} SelfMarketing. All rights
            reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
