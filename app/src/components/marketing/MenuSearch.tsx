"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { searchEntries } from "@/lib/nav-menu";
import { NavIconEl } from "./SidebarNav";
import { useDropdown } from "./useDropdown";

/** 찾은 부분만 굵게 */
function Highlight({ text, q }: { text: string; q: string }) {
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <b className="font-extrabold text-brand-primary">{text.slice(i, i + q.length)}</b>
      {text.slice(i + q.length)}
    </>
  );
}

/** 헤더 메뉴·서비스 검색 — 메뉴 이름·묶음 이름·별칭으로 찾아 바로 이동한다 */
export default function MenuSearch() {
  const router = useRouter();
  const entries = useMemo(() => searchEntries(), []);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const { open, setOpen, ref } = useDropdown();

  const term = q.trim().toLowerCase();
  const hits = term
    ? entries.filter(
        (e) =>
          e.label.toLowerCase().includes(term) ||
          e.category.toLowerCase().includes(term) ||
          e.aliases.some((a) => a.toLowerCase().includes(term)),
      ).slice(0, 8)
    : [];

  const go = (href: string) => {
    setOpen(false);
    setQ("");
    router.push(href);
  };

  return (
    <div ref={ref} className="relative flex-1 min-w-0 max-w-[320px] hidden md:block">
      <label className="flex items-center gap-2 px-3.5 h-10 rounded-xl bg-brand-lighter border border-brand-border focus-within:border-brand-primary transition-colors">
        <svg className="w-4 h-4 text-brand-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setCursor(0);
            setOpen(true);
          }}
          onFocus={() => q && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setCursor((c) => Math.min(c + 1, hits.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setCursor((c) => Math.max(c - 1, 0));
            } else if (e.key === "Enter" && hits[cursor]) {
              go(hits[cursor].href);
            }
          }}
          placeholder="메뉴·서비스 검색 (예: 리워드, 순위, 충전)"
          aria-label="메뉴·서비스 검색"
          className="min-w-0 flex-1 bg-transparent text-[14px] text-brand-dark placeholder:text-brand-muted focus:outline-none"
        />
      </label>

      {open && term && (
        <div className="animate-be-fade absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-xl border border-brand-border bg-white p-1.5 shadow-[0_16px_40px_-12px_rgba(17,29,55,.24)]">
          {hits.length === 0 ? (
            <p className="px-3 py-4 text-center text-[13px] text-brand-sub">‘{q.trim()}’ 검색 결과가 없습니다</p>
          ) : (
            hits.map((h, i) => (
              <button
                key={h.href + h.label}
                type="button"
                onMouseEnter={() => setCursor(i)}
                onClick={() => go(h.href)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left ${i === cursor ? "bg-brand-lighter" : ""}`}
              >
                <NavIconEl icon={h.icon} />
                <span className="min-w-0 flex-1 text-[13.5px] text-brand-dark truncate">
                  <Highlight text={h.label} q={q.trim()} />
                </span>
                {h.category && <span className="shrink-0 text-[11.5px] text-brand-muted">{h.category}</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
