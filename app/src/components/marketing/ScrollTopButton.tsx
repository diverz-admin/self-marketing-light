"use client";

import { useEffect, useState } from "react";

/** 본문을 한참 내리면 오른쪽 아래에 「최상단으로」 버튼을 띄운다 (카카오 버튼 위) */
export default function ScrollTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = document.getElementById("be-scroll");
    if (!el) return;
    const onScroll = () => setShow(el.scrollTop > 600);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;
  return (
    <button
      type="button"
      onClick={() => document.getElementById("be-scroll")?.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="최상단으로"
      title="최상단으로"
      className="animate-be-fade fixed right-5 bottom-[92px] md:bottom-24 z-40 h-11 w-11 rounded-full border border-brand-border bg-white shadow-[0_8px_24px_-8px_rgba(17,29,55,.3)] flex items-center justify-center text-brand-sub hover:text-brand-primary"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    </button>
  );
}
