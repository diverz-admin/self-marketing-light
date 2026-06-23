import React from "react";
import Link from "next/link";
import SidebarNav from "@/components/marketing/SidebarNav";

const MOCK = {
  name: "사용자",
  email: "eggcorp2024@gmail.com",
  creditBalance: 0,
  activeCampaignCount: 0,
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-brand-lighter">

      {/* ── Left Sidebar (full height) ── */}
      <aside
        className="w-[250px] shrink-0 sticky top-0 h-screen flex-col hidden md:flex rounded-tr-[32px] overflow-hidden"
        style={{ background: "linear-gradient(180deg, #1A7ADE 0%, #0F6ED3 45%, #0A4FA8 100%)" }}
      >
        {/* 로고 */}
        <div className="px-5 pt-6 pb-4 shrink-0">
          <Link href="/marketing" className="flex items-center gap-3">
            <span
              className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.22)", backdropFilter: "blur(4px)" }}
            >
              <svg className="w-[20px] h-[20px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M12 11v4m0 0h-1.5M12 15h1.5" />
              </svg>
            </span>
            <div>
              <p className="text-[16px] font-extrabold text-white tracking-tight leading-tight">DIVERZ</p>
              <p className="text-[10px] text-white/50 leading-tight">마케팅 자동화 플랫폼</p>
            </div>
          </Link>
        </div>

        {/* 유저 프로필 */}
        <div className="mx-3 mb-3 px-3 py-3 rounded-xl shrink-0" style={{ background: "rgba(255,255,255,0.12)" }}>
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-[14px] shrink-0"
              style={{ background: "linear-gradient(135deg,#60A5FA,#A78BFA)" }}
            >
              {MOCK.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white truncate leading-tight">{MOCK.name}</p>
              <p className="text-[11px] text-white/45 truncate leading-tight">{MOCK.email}</p>
            </div>
          </div>
        </div>

        {/* 네비게이션 */}
        <SidebarNav />
      </aside>

      {/* ── Right: Header + Content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="sticky top-0 z-50 h-[60px] bg-white border-b border-brand-border flex items-center justify-between px-5 shrink-0">
          {/* 모바일 전용 로고 */}
          <Link href="/marketing" className="flex items-center gap-2 md:hidden">
            <span className="h-8 w-8 rounded-[10px] bg-brand-primary flex items-center justify-center text-white font-extrabold text-sm">M</span>
            <span className="font-extrabold text-[15px] text-brand-dark tracking-tight">SelfMarketing</span>
          </Link>
          <div className="hidden md:block" />

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-lighter border border-brand-border">
              <svg className="w-3.5 h-3.5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[11px] text-brand-sub font-medium">포인트</span>
              <span className="text-[13px] font-extrabold text-brand-primary">{MOCK.creditBalance.toLocaleString()} P</span>
            </div>
            <Link href="/marketing/my/charge" className="px-3.5 py-1.5 text-xs font-bold bg-brand-primary text-white rounded-xl hover:bg-brand-primary-hover transition-colors">
              충전하기
            </Link>
            <div className="flex items-center gap-2 pl-3 border-l border-brand-border ml-1">
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-white text-[12px] font-bold"
                style={{ background: "linear-gradient(135deg,#3182F6,#6366F1)" }}
              >
                {MOCK.name.charAt(0)}
              </div>
              <span className="text-[13px] font-semibold text-brand-dark hidden sm:block">{MOCK.name} 님</span>
            </div>
          </div>
        </header>

        {/* Content + Right Sidebar */}
        <div className="flex flex-1 min-h-0">
          <main className="flex-1 p-6 md:p-8 overflow-y-auto min-w-0">{children}</main>

          {/* Right Sidebar */}
          <aside className="hidden xl:flex w-[256px] shrink-0 flex-col border-l border-brand-border bg-white sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto">
            <div className="p-4 space-y-3">

              {/* 커뮤니티 배너 */}
              <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#1B1F3B 0%,#2D1F6E 50%,#3B2094 100%)" }}>
                <div className="relative px-4 pt-4 pb-3">
                  {/* 배경 장식 */}
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
                        <p className="text-[10px] font-extrabold text-white/50 uppercase tracking-widest leading-none">DIVERZ</p>
                        <p className="text-[13px] font-extrabold text-white leading-tight">커뮤니티</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-white/60 leading-relaxed mb-3">
                      마케터들과 노하우를 공유하고 최신 마케팅 정보를 얻어가세요.
                    </p>
                    <div className="space-y-1.5">
                      {/* 카카오 오픈채팅 */}
                      <a
                        href="/marketing/community"
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[12px] font-bold transition-all"
                        style={{ background: "#FEE500", color: "#3A1D1D" }}
                      >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 3C6.477 3 2 6.582 2 11c0 2.67 1.45 5.04 3.728 6.593L4.5 21l3.858-2.12A11.27 11.27 0 0012 19c5.523 0 10-3.582 10-8S17.523 3 12 3z"/>
                        </svg>
                        카카오 오픈채팅
                        <svg className="w-3 h-3 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                      </a>
                      {/* 네이버 카페 */}
                      <a
                        href="/marketing/community"
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[12px] font-bold transition-all"
                        style={{ background: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.2)" }}
                      >
                        <span className="font-extrabold text-[13px] leading-none shrink-0" style={{ color: "#03C75A" }}>N</span>
                        네이버 카페
                        <svg className="w-3 h-3 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-brand-border p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-[15px]"
                    style={{ background: "linear-gradient(135deg,#3182F6,#8B5CF6)" }}
                  >
                    {MOCK.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-brand-dark leading-tight">{MOCK.name} 님</p>
                    <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-100">Bronze</span>
                  </div>
                </div>
                <div className="border-t border-brand-border">
                  <div className="flex items-center justify-between py-3">
                    <span className="text-[13px] text-brand-sub">사용 가능 포인트</span>
                    <span className="text-[15px] font-extrabold text-brand-dark">{MOCK.creditBalance.toLocaleString()}<span className="text-[11px] font-medium text-brand-sub ml-0.5">P</span></span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-t border-brand-border">
                    <span className="text-[13px] text-brand-sub">진행 중인 광고</span>
                    <span className="text-[15px] font-extrabold text-brand-primary">{MOCK.activeCampaignCount}<span className="text-[11px] font-medium text-brand-sub ml-0.5">개</span></span>
                  </div>
                </div>
                <Link href="/marketing/my/charge" className="mt-3 block text-center py-2.5 rounded-xl text-[13px] font-bold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors">
                  포인트 충전하기
                </Link>
              </div>

              <div className="rounded-2xl border border-brand-border p-4">
                <p className="text-[11px] font-bold text-brand-muted uppercase tracking-wider mb-2">고객 지원</p>
                <p className="text-[14px] font-bold text-brand-dark leading-snug mb-3">세팅에 도움이<br />필요하신가요?</p>
                <a href="/marketing/support" className="block text-center py-2.5 rounded-xl text-[13px] font-bold bg-brand-lighter text-brand-text hover:bg-brand-border transition-colors">전문 무료상담 신청</a>
              </div>

              <div className="rounded-2xl bg-brand-dark p-4 text-white">
                <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-2">트래픽 제휴</p>
                <p className="text-[14px] font-bold leading-snug mb-3">광고대행사를<br />운영중이신가요?</p>
                <a href="/marketing/support" className="block text-center py-2.5 rounded-xl text-[13px] font-bold bg-white/10 text-white hover:bg-white/20 transition-colors">제휴 문의하기</a>
              </div>

              <div className="rounded-2xl bg-brand-primary p-4 text-white">
                <p className="text-[11px] font-bold text-white/60 uppercase tracking-wider mb-2">무료 서비스</p>
                <p className="text-[14px] font-bold leading-snug mb-3">키워드 순위를<br />매일 추적하세요</p>
                <Link href="/marketing/rank" className="block text-center py-2.5 rounded-xl text-[13px] font-bold bg-white/20 text-white hover:bg-white/30 transition-colors">순위 체크 시작</Link>
              </div>

            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
