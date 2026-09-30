"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * 다크 모드 토글 — 선택은 브라우저(be.theme)에 남긴다.
 * 첫 페인트 전에 적용하는 건 THEME_BOOT_SCRIPT 가 맡고, 여기서는 바꾸기만 한다.
 */
const KEY = "be.theme";
const listeners = new Set<() => void>();
const isDark = () => document.documentElement.classList.contains("dark");
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
};

/** 레이아웃 <head> 대신 본문 맨 앞에 넣는 한 줄 — 흰 화면이 번쩍이지 않게 먼저 칠한다 */
export const THEME_BOOT_SCRIPT = `try{if(localStorage.getItem("${KEY}")==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

function apply(next: "dark" | "light") {
  const run = () => {
    document.documentElement.classList.toggle("dark", next === "dark");
    listeners.forEach((fn) => fn());
  };
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* 저장이 막혀도 이번 화면에는 적용한다 */
  }
  type VT = { ready: Promise<void>; finished: Promise<void> };
  const doc = document as Document & { startViewTransition?: (cb: () => void) => VT };
  if (doc.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // 전환 중에 다른 조작이 끼면 브라우저가 전환을 버린다 — 색은 이미 바뀌었으니 조용히 넘긴다
    const vt = doc.startViewTransition(run);
    vt.ready.catch(() => {});
    vt.finished.catch(() => {});
  } else {
    run();
  }
}

export default function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  // 플랫폼을 벗어나면(공개 홈페이지) 라이트로 돌려 둔다 — 홈페이지는 다크 디자인이 없다
  useEffect(() => {
    // 홈페이지에서 들어오거나 개발 모드가 effect 를 두 번 돌려도 저장된 선택으로 다시 맞춘다
    try {
      document.documentElement.classList.toggle("dark", localStorage.getItem(KEY) === "dark");
    } catch {
      /* 읽기가 막히면 라이트 그대로 */
    }
    listeners.forEach((fn) => fn());
    return () => document.documentElement.classList.remove("dark");
  }, []);

  return (
    <button
      type="button"
      onClick={() => apply(dark ? "light" : "dark")}
      title={dark ? "라이트 모드" : "다크 모드"}
      aria-label={dark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className="h-9 w-9 rounded-xl bg-brand-lighter border border-brand-border flex items-center justify-center hover:border-brand-border-strong transition-colors"
    >
      {dark ? (
        <svg className="w-[18px] h-[18px] text-[#F5B72A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      ) : (
        <svg className="w-[18px] h-[18px] text-brand-sub" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      )}
    </button>
  );
}
