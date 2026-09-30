"use client";

import { useSyncExternalStore } from "react";

/**
 * 전역 토스트 — 화면 상단 가운데에 잠깐 떴다 사라지는 한 줄 안내.
 *
 * 어느 컴포넌트에서든 `toast.success("…")` 처럼 부른다. 상태를 모듈에 두고
 * useSyncExternalStore 로 <Toaster /> 하나에만 잇는다 — Provider 를 감쌀 필요가 없다.
 */
type Kind = "success" | "error" | "info";
type Item = { id: number; kind: Kind; title: string; desc?: string };

let items: Item[] = [];
let seq = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());

function push(kind: Kind, title: string, desc?: string) {
  const id = seq++;
  items = [...items, { id, kind, title, desc }].slice(-4);
  emit();
  setTimeout(() => {
    items = items.filter((t) => t.id !== id);
    emit();
  }, kind === "error" ? 4200 : 2800);
}

export const toast = Object.assign((title: string, desc?: string) => push("info", title, desc), {
  success: (title: string, desc?: string) => push("success", title, desc),
  error: (title: string, desc?: string) => push("error", title, desc),
  info: (title: string, desc?: string) => push("info", title, desc),
});

const STYLE: Record<Kind, { bg: string; fg: string; icon: string }> = {
  success: { bg: "var(--success-bg)", fg: "var(--success-fg)", icon: "M4.5 12.75l6 6 9-13.5" },
  error: { bg: "var(--danger-bg)", fg: "var(--danger-fg)", icon: "M12 9v3.75m0 3.75h.008M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  info: { bg: "var(--progress-bg)", fg: "var(--progress-fg)", icon: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" },
};

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
};
const EMPTY: Item[] = [];

export function Toaster() {
  const list = useSyncExternalStore(subscribe, () => items, () => EMPTY);
  if (list.length === 0) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] flex flex-col items-center gap-2 pointer-events-none w-[min(92vw,420px)]">
      {list.map((t) => {
        const s = STYLE[t.kind];
        return (
          <div
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            className="animate-be-fade pointer-events-auto w-full flex items-start gap-2.5 rounded-xl border border-brand-border bg-white px-4 py-3 shadow-[0_16px_40px_-12px_rgba(17,29,55,.28)]"
          >
            <span className="mt-px h-6 w-6 rounded-full flex items-center justify-center shrink-0" style={{ background: s.bg, color: s.fg }}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-brand-dark leading-snug">{t.title}</p>
              {t.desc && <p className="text-[12.5px] text-brand-sub mt-0.5 leading-snug">{t.desc}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
