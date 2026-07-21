import Link from "next/link";
import PageHeader from "@/components/marketing/PageHeader";

const SECTIONS = [
  {
    href: "/marketing/community/board",
    label: "게시판",
    desc: "마케팅 노하우, 정보, 질문을 자유롭게 공유하세요.",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M12 11v4m0 0h-1.5M12 15h1.5",
    count: "7개 게시글",
    color: "#0D3473",
    bg: "linear-gradient(135deg,#0D3473,#0D2148)",
  },
];

export default function CommunityPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">

      {/* 헤더 */}
      <PageHeader title="커뮤니티" subtitle="마케터들과 노하우를 공유하고 최신 마케팅 정보를 얻어가세요." iconPath={"M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"} />

      {/* 서브섹션 카드 */}
      <div className="grid gap-4">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group rounded-2xl border border-brand-border bg-white p-5 flex items-center gap-4 hover:shadow-md hover:border-brand-primary/30 transition-all"
          >
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: s.bg }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="white"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[18px] font-bold text-brand-dark mb-0.5">{s.label}</p>
              <p className="text-[13px] text-brand-sub truncate">{s.desc}</p>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1">
              <span className="text-[12px] font-semibold text-brand-muted">{s.count}</span>
              <svg className="w-4 h-4 text-brand-muted group-hover:text-brand-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* 외부 채널 */}
      <div className="space-y-3">
        <p className="text-[13px] font-semibold text-brand-muted uppercase tracking-wider">외부 채널</p>

        <div
          className="rounded-2xl overflow-hidden p-5"
          style={{ background: "linear-gradient(135deg,#03C75A 0%,#02A64E 100%)" }}
        >
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 bg-white/20">
              <span className="text-[22px] font-extrabold text-white leading-none">N</span>
            </div>
            <div className="flex-1">
              <p className="text-[16px] font-bold text-white">네이버 카페</p>
              <p className="text-[13px] text-white/65">마케팅 정보 공유 카페</p>
            </div>
            <a
              href="/marketing/community/board"
              className="px-4 py-2 rounded-xl text-[13px] font-bold bg-white text-green-700"
            >
              방문하기
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
