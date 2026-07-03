import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "서비스 소개 | BLUE EGG",
  description: "광고대행사 없이 직접 마케팅을 실행하는 셀프 마케팅 플랫폼, BLUE EGG를 소개합니다.",
};

const VALUES = [
  {
    title: "직접 실행",
    desc: "상담과 계약을 거치지 않고, 필요한 마케팅을 카탈로그에서 바로 선택해 실행합니다.",
  },
  {
    title: "투명한 가격",
    desc: "단위당 단가와 수량을 모두 공개합니다. 숨은 비용도, 과장된 약속도 없습니다.",
  },
  {
    title: "데이터 중심",
    desc: "진행 현황과 성과를 실시간 대시보드로 확인하며 스스로 판단하고 조정합니다.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-brand-dark text-white">
        <div className="max-w-3xl mx-auto px-6 py-20 md:py-28">
          <span className="inline-block text-[15px] font-bold px-3 py-1 rounded-full bg-brand-primary/20 text-brand-primary mb-6">
            About BLUE EGG
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6">
            마케팅을 누구나
            <br />
            직접 할 수 있도록
          </h1>
          <p className="text-lg text-white/60 leading-relaxed">
            BLUE EGG는 소상공인과 온라인 셀러가 광고대행사에 의존하지 않고
            스스로 마케팅을 실행할 수 있도록 만든 셀프 마케팅 플랫폼입니다.
            복잡한 상담과 불투명한 견적 대신, 상품처럼 고르고 결제하면 바로
            시작되는 마케팅을 지향합니다.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-dark mb-12">
            우리가 지키는 원칙
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="p-7 rounded-2xl border border-brand-border"
              >
                <h3 className="text-lg font-bold text-brand-dark mb-3">
                  {v.title}
                </h3>
                <p className="text-sm text-brand-sub leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-primary">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-6">
            지금 바로 시작해보세요
          </h2>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 rounded-lg text-sm font-bold bg-white text-brand-primary hover:bg-brand-light transition-colors"
          >
            무료 계정 만들기
          </Link>
        </div>
      </section>
    </>
  );
}
