"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { InlineSelect } from "@/components/admin/ui";
import type { PeriodParams } from "@/lib/period-filter";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

/**
 * 완료 캠페인 연/월/일 조회.
 * 선택값을 URL 쿼리에 넣어 서버가 SQL 범위로 걸러 오게 한다 (완료 데이터가 계속 쌓이므로).
 */
export function PeriodPicker({
  years,
  value,
  count,
  label = "완료 조회",
}: {
  /** 완료 데이터가 존재하는 연도 목록 (서버 집계) */
  years: number[];
  value: PeriodParams;
  /** 현재 조건에 걸린 건수 */
  count: number;
  label?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const move = (next: PeriodParams) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of ["year", "month", "day"] as const) {
      const v = next[key];
      if (v) params.set(key, String(v));
      else params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const daysInMonth =
    value.year && value.month ? new Date(Date.UTC(value.year, value.month, 0)).getUTCDate() : 31;

  return (
    <div className="flex items-center gap-2 px-5 py-3 border-b border-brand-border bg-brand-light/60 flex-wrap">
      <span className="text-[13px] font-bold text-brand-dark mr-1">{label}</span>

      <InlineSelect
        value={value.year ? String(value.year) : ""}
        onChange={(e) => move({ year: e.target.value ? Number(e.target.value) : undefined })}
      >
        <option value="">전체 연도</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}년
          </option>
        ))}
      </InlineSelect>

      <InlineSelect
        value={value.month ? String(value.month) : ""}
        disabled={!value.year}
        onChange={(e) =>
          move({ year: value.year, month: e.target.value ? Number(e.target.value) : undefined })
        }
      >
        <option value="">전체 월</option>
        {MONTHS.map((m) => (
          <option key={m} value={m}>
            {m}월
          </option>
        ))}
      </InlineSelect>

      <InlineSelect
        value={value.day ? String(value.day) : ""}
        disabled={!value.month}
        onChange={(e) =>
          move({ year: value.year, month: value.month, day: e.target.value ? Number(e.target.value) : undefined })
        }
      >
        <option value="">전체 일</option>
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d}>
            {d}일
          </option>
        ))}
      </InlineSelect>

      {value.year && (
        <button
          onClick={() => move({})}
          className="text-[12px] font-semibold text-brand-primary underline ml-0.5"
        >
          초기화
        </button>
      )}

      <span className="text-[12px] text-brand-muted ml-1">
        <span className="font-bold text-brand-dark">{count}</span>건
      </span>
    </div>
  );
}
