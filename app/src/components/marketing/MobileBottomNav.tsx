"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BlueEggMark } from "@/components/Logo";
import { useMobileMenu } from "./MobileMenuContext";

/* 모바일 전용 하단 고정 탭바 (사이드바가 숨겨지는 md 미만에서 노출) */

type Tab = { label: string; href?: string; icon: string; center?: boolean; live?: boolean; action?: "menu" };

const TABS: Tab[] = [
  { label: "메뉴", action: "menu", icon: "M4 6h16M4 12h16M4 18h16" },
  { label: "순위관리", href: "/marketing/rank", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" },
  { label: "홈", href: "/marketing", center: true, icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
  { label: "캠페인", href: "/marketing/my/campaigns", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { label: "문의", href: "/marketing/support", icon: "M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { openMenu } = useMobileMenu();
  const isActive = (t: Tab) =>
    !t.href ? false : t.href === "/marketing" ? pathname === "/marketing" : pathname === t.href || pathname.startsWith(t.href + "/");

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E2E6ED] shadow-[0_-4px_20px_rgba(17,29,55,0.06)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="grid grid-cols-5 items-end h-[60px] px-1">
        {TABS.map((t) => {
          const active = isActive(t);

          if (t.action === "menu") {
            return (
              <button
                key={t.label}
                type="button"
                onClick={openMenu}
                className="flex flex-col items-center justify-center gap-1 h-full pb-1 text-[#99A0AC] hover:text-[#0D3473] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
                </svg>
                <span className="text-[10px] font-semibold leading-none">{t.label}</span>
              </button>
            );
          }

          if (t.center) {
            return (
              <Link key={t.label} href={t.href ?? "#"} className="flex flex-col items-center justify-end pb-1.5">
                <span className="-mt-7 h-14 w-14 rounded-full flex items-center justify-center bg-white shadow-[0_6px_16px_rgba(13,52,115,0.30)] border-4 border-white ring-1 ring-[#E2E6ED]">
                  <BlueEggMark className="h-8 w-auto" />
                </span>
                <span className={`text-[10px] font-bold mt-0.5 ${active ? "text-[#0D3473]" : "text-[#99A0AC]"}`}>{t.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={t.label}
              href={t.href ?? "#"}
              className={`flex flex-col items-center justify-center gap-1 h-full pb-1 transition-colors ${active ? "text-[#0D3473]" : "text-[#99A0AC]"}`}
            >
              <span className="relative">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
                </svg>
                {t.live && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-70" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E] border border-white" />
                  </span>
                )}
              </span>
              <span className="text-[10px] font-semibold leading-none">{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
