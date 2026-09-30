"use client";

import { useState } from "react";
import { toast } from "@/components/ui/toast";

/**
 * 키워드·해시태그 칩 입력 — Enter(또는 쉼표)로 한 개씩 추가, ✕ 로 삭제.
 * 첫 번째 칩을 대표로 표시할 수 있다(메인 키워드).
 */
export default function ChipInput({
  id, values, onChange, max, placeholder, limitMessage, stripSpaces = false, markFirst = false,
}: {
  id?: string;
  values: string[];
  onChange: (next: string[]) => void;
  max: number;
  placeholder: string;
  limitMessage: string;
  /** 해시태그처럼 띄어쓰기를 없앤다 */
  stripSpaces?: boolean;
  /** 첫 칩에 「대표」 표시 */
  markFirst?: boolean;
}) {
  const [text, setText] = useState("");

  const commit = () => {
    let v = text.trim().replace(/^#/, "");
    if (stripSpaces) v = v.replace(/\s+/g, "");
    if (!v) return;
    if (values.includes(v)) {
      setText("");
      return;
    }
    if (values.length >= max) {
      toast.info(limitMessage);
      return;
    }
    onChange([...values, v]);
    setText("");
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-brand-border bg-white px-2.5 py-2 focus-within:border-brand-primary">
      {values.map((v, i) => (
        <span
          key={v}
          className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[13px] font-bold ${
            markFirst && i === 0 ? "bg-brand-primary text-white" : "bg-brand-primary-50 text-brand-primary"
          }`}
        >
          {markFirst && i === 0 && <span className="text-[10.5px] font-extrabold opacity-80">대표</span>}
          {stripSpaces ? `#${v}` : v}
          <button
            type="button"
            aria-label={`${v} 삭제`}
            onClick={() => onChange(values.filter((x) => x !== v))}
            className="opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </span>
      ))}
      <input
        id={id}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && !text && values.length) {
            onChange(values.slice(0, -1));
          }
        }}
        onBlur={commit}
        placeholder={values.length ? "" : placeholder}
        className="min-w-[160px] flex-1 bg-transparent px-1 py-1 text-[14px] text-brand-dark placeholder:text-brand-muted focus:outline-none"
      />
    </div>
  );
}
