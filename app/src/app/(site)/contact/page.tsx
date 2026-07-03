import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "문의 | BLUE EGG",
  description: "서비스 도입·제휴·기타 문의를 남겨주세요.",
};

const CHANNELS = [
  { label: "이메일", value: "help@blueegg.example", href: "mailto:help@blueegg.example" },
  { label: "운영 시간", value: "평일 10:00 – 18:00 (KST)" },
];

export default function ContactPage() {
  return (
    <>
      <section className="bg-brand-dark text-white">
        <div className="max-w-3xl mx-auto px-6 py-20 md:py-24 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            무엇이든 문의하세요
          </h1>
          <p className="text-white/60 text-lg">
            서비스 도입, 제휴, 기타 궁금한 점을 남겨주시면 확인 후 연락드립니다.
          </p>
        </div>
      </section>

      <section className="bg-brand-light">
        <div className="max-w-5xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Contact info */}
          <div>
            <h2 className="text-lg font-bold text-brand-dark mb-6">연락처</h2>
            <dl className="space-y-5">
              {CHANNELS.map((c) => (
                <div key={c.label}>
                  <dt className="text-xs font-bold text-brand-sub uppercase tracking-wider mb-1">
                    {c.label}
                  </dt>
                  <dd className="text-sm text-brand-text">
                    {c.href ? (
                      <a
                        href={c.href}
                        className="text-brand-primary hover:text-brand-primary-hover transition-colors"
                      >
                        {c.value}
                      </a>
                    ) : (
                      c.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Form (UI only — 연동은 추후) */}
          <form className="bg-white rounded-2xl border border-brand-border p-7 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-bold text-brand-sub mb-1.5"
              >
                이름
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="w-full px-3 py-2.5 rounded-lg border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                placeholder="홍길동"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-brand-sub mb-1.5"
              >
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="w-full px-3 py-2.5 rounded-lg border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-xs font-bold text-brand-sub mb-1.5"
              >
                문의 내용
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="w-full px-3 py-2.5 rounded-lg border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 resize-none"
                placeholder="문의하실 내용을 적어주세요."
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-3 rounded-lg text-sm font-bold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors"
            >
              문의 보내기
            </button>
            <p className="text-[11px] text-brand-sub text-center">
              ※ 폼 전송 기능은 아직 연동되지 않았습니다. 우선 이메일로 문의해주세요.
            </p>
          </form>
        </div>
      </section>
    </>
  );
}
