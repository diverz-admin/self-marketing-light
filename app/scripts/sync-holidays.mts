/**
 * CS-03 공휴일 캐시 동기화 — 공공데이터 API → holidays 테이블.
 *
 * 연 1회(또는 임시공휴일이 지정될 때) 돌린다.
 *   npx tsx --env-file=.env.local scripts/sync-holidays.mts [연도...]
 *
 * DATA_GO_KR_SERVICE_KEY 가 없으면 동기화를 건너뛰고 현재 캐시 상태만 보여 준다.
 */
import {
  syncHolidayCalendar,
  loadHolidayCalendar,
  seedFallbackHolidays,
  defaultYears,
} from "../src/lib/holidays.js";

const years = process.argv.slice(2).map(Number).filter(Number.isFinite);
const targets = years.length ? years : defaultYears();

console.log(`대상 연도: ${targets.join(", ")}\n`);

for (const r of await syncHolidayCalendar(targets)) {
  console.log(r.ok ? `  ${r.year}: ${r.count}일 반영` : `  ${r.year}: 건너뜀 — ${r.reason}`);
}

// API 키가 없어 캐시가 비면, 대체 상수라도 넣어 DB 경로가 동작하게 한다
let cal = await loadHolidayCalendar(targets);
if (cal.source === "fallback" && process.argv.includes("--seed-fallback")) {
  const n = await seedFallbackHolidays(targets);
  console.log(`\n  대체 상수 ${n}일을 캐시에 넣었습니다 (source=fallback).`);
  cal = await loadHolidayCalendar(targets);
}
console.log(`\n현재 사용되는 목록: ${cal.dates.length}일 (출처 ${cal.source === "db" ? "DB" : "대체 상수"})`);
if (cal.source === "fallback") {
  console.log("  ⚠️  DB 캐시가 비어 policy.ts 의 대체 상수를 쓰고 있습니다.");
  console.log("     --seed-fallback 을 주면 대체 상수를 캐시에 넣습니다.");
}
console.log("  " + cal.dates.slice(0, 12).join(", ") + (cal.dates.length > 12 ? " …" : ""));
process.exit(0);
