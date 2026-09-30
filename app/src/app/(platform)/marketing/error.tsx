"use client";

import Link from "next/link";

/** 화면 하나가 렌더 중 실패했을 때 — 헤더·사이드바는 그대로 두고 본문만 대신한다 */
export default function MarketingError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="max-w-md mx-auto py-24 text-center">
      <span className="mx-auto h-12 w-12 rounded-full flex items-center justify-center" style={{ background: "var(--danger-bg)", color: "var(--danger-fg)" }}>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </span>
      <h1 className="mt-4 text-[20px] font-extrabold text-brand-dark">문제가 발생했습니다</h1>
      <p className="mt-1.5 text-[14px] text-brand-sub">잠시 후 다시 시도해 주세요.</p>
      {error.digest && (
        <p className="mt-3 text-[12px] text-brand-muted">
          확인 번호 <span className="font-mono">{error.digest}</span>
        </p>
      )}
      <div className="mt-6 flex justify-center gap-2">
        <button type="button" onClick={reset} className="rounded-xl bg-brand-primary px-5 py-2.5 text-[14px] font-bold text-white hover:bg-brand-primary-hover">
          새로고침
        </button>
        <Link href="/marketing" className="rounded-xl border border-brand-border px-5 py-2.5 text-[14px] font-bold text-brand-dark hover:bg-brand-lighter">
          홈으로
        </Link>
      </div>
    </div>
  );
}
