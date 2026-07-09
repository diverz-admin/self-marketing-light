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
  {
    href: "/marketing/community/openchat",
    label: "오픈채팅",
    desc: "카카오 오픈채팅으로 실시간 마케터 네트워킹",
    icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
    count: "5개 채팅방",
    color: "#F5C800",
    bg: "linear-gradient(135deg,#FEE500,#F5C800)",
    textDark: true,
  },
  {
    href: "/marketing/community/chatroom",
    label: "채팅방 관리",
    desc: "내가 운영하는 채팅방을 한 곳에서 관리하세요.",
    icon: "M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    count: "4개 채팅방",
    color: "#8B5CF6",
    bg: "linear-gradient(135deg,#8B5CF6,#6D28D9)",
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
                stroke={s.textDark ? "#3A1D1D" : "white"}
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
          style={{ background: "linear-gradient(135deg,#FEE500 0%,#F5C800 100%)" }}
        >
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 bg-black/10">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#3A1D1D">
                <path d="M12 3C6.477 3 2 6.582 2 11c0 2.67 1.45 5.04 3.728 6.593L4.5 21l3.858-2.12A11.27 11.27 0 0012 19c5.523 0 10-3.582 10-8S17.523 3 12 3z"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[16px] font-bold text-[#3A1D1D]">카카오 오픈채팅</p>
              <p className="text-[13px] text-[#3A1D1D]/65">실시간 마케팅 Q&A</p>
            </div>
            <a
              href="/marketing/community/openchat"
              className="px-4 py-2 rounded-xl text-[13px] font-bold bg-[#3A1D1D] text-[#FEE500]"
            >
              참여하기
            </a>
          </div>
        </div>

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
