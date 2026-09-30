"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signout } from "@/app/(platform)/auth/actions";

const MENU = [
  {
    href: "/marketing/my/profile",
    label: "내 정보 보기",
    icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
  },
];

export default function HeaderUserMenu({ displayName }: { displayName: string }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  /* 바깥 클릭·ESC 로 닫는다. 열려 있을 때만 리스너를 건다. */
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 pl-3 border-l border-brand-border ml-1 py-1 pr-1.5 rounded-xl hover:bg-brand-lighter transition-colors cursor-pointer"
      >
        <div
          className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-white text-[13px] font-bold"
          style={{ background: "#2452EB" }}
        >
          {displayName.charAt(0)}
        </div>
        <span className="text-[15px] font-semibold text-brand-dark hidden sm:block">{displayName} 님</span>
        <svg
          className={`w-3.5 h-3.5 text-[#B0B8C1] hidden sm:block transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="animate-be-fade absolute right-0 top-[calc(100%+8px)] z-50 w-[212px] rounded-xl border border-brand-border bg-white p-1.5 shadow-[0_16px_40px_-12px_rgba(17,29,55,.24)]"
        >
          <div className="px-3 py-2.5 border-b border-brand-border mb-1">
            <p className="text-[13.5px] font-bold text-brand-dark truncate">{displayName} 님</p>
          </div>

          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] font-medium text-brand-text hover:bg-brand-lighter transition-colors"
            >
              <svg className="w-4 h-4 shrink-0 text-brand-sub" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={m.icon} />
              </svg>
              {m.label}
            </Link>
          ))}

          <form action={signout} className="border-t border-brand-border mt-1 pt-1">
            <button
              type="submit"
              role="menuitem"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] font-medium text-brand-sub hover:bg-brand-error-bg hover:text-[#E5484D] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              로그아웃
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
