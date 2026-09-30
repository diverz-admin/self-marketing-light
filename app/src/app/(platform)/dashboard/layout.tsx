import React from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

const MOCK = { name: "사용자", email: "user@selfmarketing.kr" };

const NAV_ITEMS = [
  { label: "프로필 설정", href: "/dashboard", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
  { label: "포트폴리오 관리", href: "/dashboard/projects", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /> },
  { label: "블로그 관리", href: "/dashboard/posts", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-lighter flex flex-col">
      <header className="sticky top-0 z-50 h-[60px] bg-white border-b border-brand-border flex items-center justify-between px-6 shrink-0">
        <Link href="/marketing" className="flex items-center">
          <Logo size="h-9" />
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-brand-light border border-brand-border flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 text-brand-sub" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-brand-dark hidden sm:block">{MOCK.name} 님</span>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-[200px] shrink-0 bg-white border-r border-brand-border sticky top-[60px] h-[calc(100vh-60px)] flex-col hidden md:flex">
          <nav className="flex-1 overflow-y-auto py-2">
            <p className="px-4 pt-3 pb-1 text-[11px] font-bold text-brand-muted uppercase tracking-widest">브랜딩 관리</p>
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-2.5 mx-2 px-3 py-2 rounded-xl text-sm font-medium text-brand-sub hover:bg-brand-light hover:text-brand-text transition-all">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>{item.icon}</svg>
                {item.label}
              </Link>
            ))}
            <div className="mx-4 my-2 h-px bg-brand-border" />
            <a href="#" className="flex items-center gap-2.5 mx-2 px-3 py-2 rounded-xl text-sm font-medium text-brand-primary hover:bg-brand-primary-50 transition-all">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              내 페이지 보기
            </a>
          </nav>
        </aside>
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
