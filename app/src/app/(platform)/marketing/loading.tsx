/** 화면을 불러오는 동안 — 로고 알이 통통 튀고 점 세 개가 깜빡인다 */
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center justify-center py-32">
      <svg viewBox="0 0 100 120" className="h-10 w-auto animate-bounce" aria-hidden>
        <defs>
          <linearGradient id="be-egg" x1="22" y1="10" x2="82" y2="112" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4C7BE3" />
            <stop offset="52%" stopColor="#1E3FA0" />
            <stop offset="100%" stopColor="#0A1547" />
          </linearGradient>
        </defs>
        <path d="M50 6 C73 6 89 45 89 73 C89 99 71 114 50 114 C29 114 11 99 11 73 C11 45 27 6 50 6 Z" fill="url(#be-egg)" />
        <path d="M27 87 L41 72 L49 80 L60 58 L67 65 L79 45" fill="none" stroke="#FFF" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="mt-3 flex gap-[5px] text-brand-primary">
        {[0, 1, 2].map((i) => (
          <i key={i} className="h-[5px] w-[5px] rounded-full bg-current animate-pulse" style={{ animationDelay: `${i * 0.16}s` }} />
        ))}
      </span>
      <span className="mt-2 text-[12.5px] font-bold text-brand-muted">화면을 불러오는 중…</span>
    </div>
  );
}
