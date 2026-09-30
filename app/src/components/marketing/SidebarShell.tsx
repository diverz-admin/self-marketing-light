"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import SidebarNav from "./SidebarNav";

/* ── 접힘 상태 — 새로고침해도 유지되도록 브라우저에 남긴다 ── */
const KEY = "be.sidebarCollapsed";
const listeners = new Set<() => void>();
function readCollapsed() {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
function setCollapsed(v: boolean) {
  try {
    window.localStorage.setItem(KEY, v ? "1" : "0");
  } catch {
    /* 저장이 막혀도 이번 화면에서는 접힌다 */
  }
  listeners.forEach((fn) => fn());
}
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
};

const HOME_D =
  "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25";

export default function SidebarShell({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(subscribe, readCollapsed, () => false);
  const onHome = pathname === "/marketing";

  return (
    <aside
      className={`${collapsed ? "w-[68px]" : "w-[260px]"} shrink-0 sticky top-0 h-screen flex-col hidden md:flex overflow-hidden transition-[width] duration-200`}
      // 레일은 본문 배경보다 한 단계 어둡게 둔다 — 경계가 잡힌다
      style={{ background: "var(--rail-bg, #ECEEF2)" }}
    >
      {/* 로고 */}
      <div className={`${collapsed ? "px-3" : "px-5"} pt-5 pb-3 shrink-0`}>
        <Link href="/marketing" className="inline-flex" aria-label="BLUE EGG 홈">
          {collapsed ? (
            <Image src="/blue-egg-mark.png" alt="" width={120} height={120} unoptimized className="h-10 w-auto" />
          ) : (
            <Image src="/blue-egg-logo.png" alt="BLUE EGG biz" width={659} height={280} priority unoptimized className="be-logo h-12 w-auto self-start" />
          )}
        </Link>
      </div>

      {/* 홈 · 접기 */}
      <div className={`flex ${collapsed ? "flex-col gap-1" : "items-center justify-between"} px-2 pb-1 shrink-0`}>
        <Link
          href="/marketing"
          aria-label="홈"
          title="홈"
          className={`h-10 w-10 ${collapsed ? "mx-auto" : ""} flex items-center justify-center rounded-lg transition-colors ${
            onHome ? "text-white" : "text-[#5B6472] hover:bg-[#E2E6EC]"
          }`}
          style={onHome ? { background: "linear-gradient(135deg,#2452EB 0%,#152C9E 55%,#111D37 100%)", boxShadow: "0 4px 12px rgba(17,29,55,0.26)" } : undefined}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
            <path d={HOME_D} />
          </svg>
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "사이드바 펴기" : "사이드바 접기"}
          title={collapsed ? "사이드바 펴기" : "사이드바 접기"}
          className={`h-10 w-10 ${collapsed ? "mx-auto" : ""} flex items-center justify-center rounded-lg text-[#5B6472] hover:bg-[#E2E6EC] transition-colors`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <SidebarNav collapsed={collapsed} />

      {/* 어드민 바로가기 */}
      {isAdmin && (
      <div className="shrink-0 border-t border-[#E0E4EA] px-3 py-3">
        {(
          <Link
            href="/admin"
            title="어드민 페이지"
            className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""} rounded-lg px-2 py-2 text-[13.5px] font-bold text-[#2452EB] hover:bg-[#E2E6EC]`}
          >
            <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {!collapsed && "어드민 페이지"}
          </Link>
        )}
      </div>
      )}
    </aside>
  );
}
