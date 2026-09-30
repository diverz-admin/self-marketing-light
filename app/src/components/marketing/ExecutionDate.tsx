"use client";

import { useSyncExternalStore } from "react";
import { expectedExecutionDate, formatExecutionDate } from "@/lib/policy";

const subscribe = () => () => {};
/** 서버는 방문자의 시간대를 모른다 — 집행일은 브라우저에서만 계산한다 */
const serverSnapshot = () => null;

/**
 * PU-02 / PD-03 예상 집행일.
 * 마감시각 전 결제분은 당일, 이후·주말·공휴일 결제분은 다음 영업일에 발주된다.
 *
 * CS-03 공휴일은 서버(`loadHolidayCalendar`)가 읽어 내려준다. holidays 를 주지
 * 않으면 policy.ts 의 대체 상수로 계산하므로 연도가 지나면 틀릴 수 있다.
 */
export default function ExecutionDate({
  holidays,
  fallback = "—",
}: {
  holidays?: readonly string[];
  fallback?: string;
}) {
  const label = useSyncExternalStore(
    subscribe,
    // holidays 는 프롭이라 스냅샷 함수를 매 렌더 새로 만든다.
    // useSyncExternalStore 는 값이 같으면 리렌더하지 않으므로 문자열 비교로 충분하다.
    () => formatExecutionDate(expectedExecutionDate(new Date(), holidays)),
    serverSnapshot,
  );
  return <>{label ?? fallback}</>;
}
