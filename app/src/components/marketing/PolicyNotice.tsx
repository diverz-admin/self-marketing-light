import Link from "next/link";
import { POLICY_PATH } from "@/lib/policy";

type Tone = "info" | "warn";

const TONE: Record<Tone, { box: string; chip: string; icon: string }> = {
  info: {
    box: "bg-blue-50/60 border-blue-100",
    chip: "bg-[#DCE7FB] text-[#2452EB]",
    icon: "text-brand-primary",
  },
  warn: {
    box: "bg-amber-50/70 border-amber-200",
    chip: "bg-amber-100 text-amber-700",
    icon: "text-amber-600",
  },
};

export type PolicyNoticeItem = {
  /** 운영정책 조항 번호 (PT-07, C-01 …) — 근거를 화면에서 바로 확인할 수 있게 함께 보여준다 */
  code?: string;
  text: React.ReactNode;
};

/**
 * 운영정책 중 이 화면에서 고객이 반드시 알아야 하는 항목을 노출하는 박스.
 * 문구는 화면에 직접 적지 말고 @/lib/policy 의 값을 가져다 넘긴다.
 */
export default function PolicyNotice({
  title = "알아두실 점",
  items,
  tone = "info",
  anchor,
  className = "",
}: {
  title?: string;
  items: PolicyNoticeItem[];
  tone?: Tone;
  /** 운영정책 페이지에서 펼쳐 볼 섹션 id */
  anchor?: string;
  className?: string;
}) {
  const t = TONE[tone];

  return (
    <div className={`rounded-2xl border px-4 py-3.5 ${t.box} ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <svg className={`w-4 h-4 shrink-0 ${t.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <span className="text-[13.5px] font-extrabold text-brand-dark">{title}</span>
        </div>
        <Link
          href={anchor ? `${POLICY_PATH}#${anchor}` : POLICY_PATH}
          className="shrink-0 text-[12px] font-bold text-brand-primary hover:underline underline-offset-2"
        >
          운영정책 전문 →
        </Link>
      </div>

      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2">
            {it.code && (
              <span className={`shrink-0 mt-[1px] text-[10.5px] font-extrabold px-1.5 py-0.5 rounded-md tabular-nums ${t.chip}`}>
                {it.code}
              </span>
            )}
            <span className="text-[13px] text-brand-sub leading-relaxed">{it.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
