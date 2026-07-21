import Link from "next/link";

const MOCK = {
  name: "사용자",
  creditBalance: 0,
  activeCampaignCount: 0,
};

export default function RightSidebar() {
  return (
    <div className="hidden xl:flex shrink-0 sticky top-[60px] h-[calc(100vh-60px)]">
      <aside className="w-[256px] border-l border-brand-border bg-white flex flex-col">

        {/* 커뮤니티 배너 — 고정 */}
        <div className="shrink-0 p-4 border-b border-brand-border">
          <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#1B1F3B 0%,#2D1F6E 50%,#3B2094 100%)" }}>
            <div className="relative px-4 pt-4 pb-3">
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(139,92,246,0.4),transparent 70%)", transform: "translate(30%,-30%)" }} />
              <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(99,102,241,0.3),transparent 70%)", transform: "translate(-30%,30%)" }} />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold text-white/50 uppercase tracking-widest leading-none">BlueEgg</p>
                    <p className="text-[15px] font-extrabold text-white leading-tight">커뮤니티</p>
                  </div>
                </div>
                <p className="text-[12px] text-white/60 leading-relaxed mb-3">
                  마케터들과 노하우를 공유하고 최신 마케팅 정보를 얻어가세요.
                </p>
                <div className="space-y-1.5">
                  <a href="/marketing/community" className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[13px] font-bold transition-all" style={{ background: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.2)" }}>
                    <span className="font-extrabold text-[15px] leading-none shrink-0" style={{ color: "#03C75A" }}>N</span>
                    네이버 카페
                    <svg className="w-3 h-3 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">

            {/* 사용자 정보 */}
            <div className="rounded-2xl border border-brand-border p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-[17px]" style={{ background: "linear-gradient(135deg,#0D3473,#8B5CF6)" }}>
                  {MOCK.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[16px] font-bold text-brand-dark leading-tight">{MOCK.name} 님</p>
                  <span className="text-[12px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-100">Bronze</span>
                </div>
              </div>
              <div className="border-t border-brand-border">
                <div className="flex items-center justify-between py-3">
                  <span className="text-[15px] text-brand-sub">사용 가능 포인트</span>
                  <span className="text-[17px] font-extrabold text-brand-dark">{MOCK.creditBalance.toLocaleString()}<span className="text-[12px] font-medium text-brand-sub ml-0.5">P</span></span>
                </div>
                <div className="flex items-center justify-between py-3 border-t border-brand-border">
                  <span className="text-[15px] text-brand-sub">진행 중인 광고</span>
                  <span className="text-[17px] font-extrabold text-brand-primary">{MOCK.activeCampaignCount}<span className="text-[12px] font-medium text-brand-sub ml-0.5">개</span></span>
                </div>
              </div>
              <Link href="/marketing/my/charge" className="mt-3 block text-center py-2.5 rounded-xl text-[15px] font-bold bg-brand-primary text-white hover:opacity-90 transition-opacity">
                포인트 충전하기
              </Link>
            </div>

            {/* 고객 지원 */}
            <div className="rounded-2xl border border-brand-border p-4">
              <p className="text-[12px] font-bold text-brand-muted uppercase tracking-wider mb-2">고객 지원</p>
              <p className="text-[16px] font-bold text-brand-dark leading-snug mb-3">세팅에 도움이<br />필요하신가요?</p>
              <a href="/marketing/support" className="block text-center py-2.5 rounded-xl text-[15px] font-bold bg-brand-lighter text-brand-text hover:bg-brand-border transition-colors">전문 무료상담 신청</a>
            </div>

            {/* 트래픽 제휴 */}
            <div className="rounded-2xl bg-brand-dark p-4 text-white">
              <p className="text-[12px] font-bold text-white/40 uppercase tracking-wider mb-2">트래픽 제휴</p>
              <p className="text-[16px] font-bold leading-snug mb-3">광고대행사를<br />운영중이신가요?</p>
              <a href="/marketing/support" className="block text-center py-2.5 rounded-xl text-[15px] font-bold bg-white/10 text-white hover:bg-white/20 transition-colors">제휴 문의하기</a>
            </div>

          </div>
        </div>
      </aside>
    </div>
  );
}
