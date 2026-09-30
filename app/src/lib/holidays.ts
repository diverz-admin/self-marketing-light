/**
 * CS-03 법정공휴일 — 공공데이터 API 연동과 캐시.
 *
 * 공휴일은 매년 바뀌고 임시공휴일도 생긴다. 코드에 적어 두면 반드시 낡는데,
 * 이 값에 기대는 계산이 한둘이 아니다:
 *
 *   PT-10  환불 접수 후 영업일 7일 이내 입금
 *   HD-01  신청 건 담당자 영업일 1일 이내 배정
 *   PU-02  마감시각 이후·주말·공휴일 결제분은 다음 영업일 발주
 *   CS-02  "영업일" = 법정공휴일을 제외한 월~금
 *
 * 그래서 한국천문연구원 특일 정보 API 에서 연 단위로 받아 `holidays` 테이블에
 * 캐시한다. 조회에 실패하면 캐시 값을 쓰고, 캐시도 비어 있으면 policy.ts 의
 * 대체 상수로 떨어진다(틀릴 수 있으나 주말 판정은 남는다).
 *
 * API 키는 DATA_GO_KR_SERVICE_KEY 환경변수로 준다. 키가 없으면 동기화는 건너뛰고
 * 캐시·대체 상수로만 동작한다 — 키가 없다고 화면이 멈추지는 않는다.
 */

import { db } from "@/db";
import { holidays } from "@/db/schema";
import { inArray, sql } from "drizzle-orm";
import { POLICY } from "./policy";

const API_BASE =
  "https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo";

/** 공휴일 목록을 브라우저로 내려보낼 때 쓰는 모양 */
export type HolidayCalendar = {
  /** YYYY-MM-DD 배열 — Set 은 직렬화되지 않아 배열로 넘긴다 */
  dates: string[];
  /** 어디서 온 값인지. 화면에 표시하지는 않고 디버깅·운영 점검용이다. */
  source: "db" | "fallback";
};

/** 올해와 내년 — 예상 집행일 계산이 연말에 다음 해로 넘어가기 때문에 두 해를 본다 */
export function defaultYears(now = new Date()): number[] {
  const y = now.getFullYear();
  return [y, y + 1];
}

/**
 * 영업일 계산에 쓸 공휴일 목록을 읽는다.
 *
 * DB 가 비어 있거나 조회가 실패하면 policy.ts 의 대체 상수로 떨어진다.
 * 절대 던지지 않는다 — 공휴일을 못 읽었다고 장바구니가 열리지 않으면 안 된다.
 */
export async function loadHolidayCalendar(
  years: number[] = defaultYears(),
): Promise<HolidayCalendar> {
  try {
    const rows = await db
      .select({ date: holidays.date })
      .from(holidays)
      .where(inArray(holidays.year, years));

    if (rows.length > 0) {
      return { dates: rows.map((r) => r.date), source: "db" };
    }
  } catch {
    // 조회 실패 — 아래 대체 상수로 떨어진다
  }

  const prefixes = years.map((y) => `${y}-`);
  return {
    dates: POLICY.order.holidays.filter((d) => prefixes.some((p) => d.startsWith(p))),
    source: "fallback",
  };
}

/** 계산 함수에 바로 넘길 수 있는 Set */
export async function loadHolidaySet(years?: number[]): Promise<Set<string>> {
  const cal = await loadHolidayCalendar(years);
  return new Set(cal.dates);
}

type ApiItem = {
  /** 20260101 형태 */
  locdate: number | string;
  dateName: string;
  /** Y = 공휴일 */
  isHoliday: string;
};

/** 20260101 → 2026-01-01 */
function toIsoDate(locdate: number | string): string | null {
  const s = String(locdate);
  if (!/^\d{8}$/.test(s)) return null;
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

/**
 * 공공데이터 API 에서 한 해 공휴일을 받아 캐시에 넣는다.
 *
 * 같은 날짜가 이미 있으면 이름만 갱신한다(임시공휴일이 나중에 이름이 바뀌는 경우).
 * source='manual' 로 관리자가 직접 넣은 날짜는 덮어쓰지 않는다 — API 에 아직
 * 반영되지 않은 임시공휴일을 손으로 넣어 둔 것이기 때문이다.
 */
export async function syncHolidays(
  year: number,
): Promise<{ ok: boolean; year: number; count: number; reason?: string }> {
  const key = process.env.DATA_GO_KR_SERVICE_KEY;
  if (!key) {
    return { ok: false, year, count: 0, reason: "DATA_GO_KR_SERVICE_KEY 미설정" };
  }

  const url = `${API_BASE}?serviceKey=${encodeURIComponent(key)}&solYear=${year}&numOfRows=100&_type=json`;

  let items: ApiItem[] = [];
  try {
    const res = await fetch(url, {
      // 연 단위로 도는 작업이라 캐시하지 않는다
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      return { ok: false, year, count: 0, reason: `API 응답 ${res.status}` };
    }
    const json = await res.json();
    const body = json?.response?.body?.items?.item;
    if (!body) return { ok: false, year, count: 0, reason: "응답에 항목이 없습니다" };
    items = Array.isArray(body) ? body : [body];
  } catch (e) {
    return { ok: false, year, count: 0, reason: e instanceof Error ? e.message : "요청 실패" };
  }

  const rows = items
    .filter((it) => String(it.isHoliday).toUpperCase() === "Y")
    .map((it) => ({ date: toIsoDate(it.locdate), name: it.dateName }))
    .filter((r): r is { date: string; name: string } => r.date !== null)
    .map((r) => ({ date: r.date, name: r.name, year, source: "api" as const }));

  if (rows.length === 0) {
    return { ok: false, year, count: 0, reason: "공휴일 항목이 없습니다" };
  }

  await db
    .insert(holidays)
    .values(rows)
    .onConflictDoUpdate({
      target: holidays.date,
      set: { name: sql`excluded.name`, source: sql`excluded.source`, fetchedAt: new Date() },
      // 관리자가 손으로 넣은 임시공휴일(source='manual')은 API 값으로 덮지 않는다.
      // 'fallback'(아래 seedFallbackHolidays)은 임시값이므로 덮어쓴다.
      setWhere: sql`${holidays.source} <> 'manual'`,
    });

  return { ok: true, year, count: rows.length };
}

/** 올해·내년을 한 번에 맞춘다 — 연 1회 도는 작업의 진입점 */
export async function syncHolidayCalendar(years: number[] = defaultYears()) {
  const results = [];
  for (const y of years) {
    results.push(await syncHolidays(y));
  }
  return results;
}

/**
 * API 키가 아직 없을 때 쓰는 임시 적재 — policy.ts 의 대체 상수를 캐시에 넣는다.
 *
 * source='fallback' 으로 표시해 두므로, 나중에 syncHolidays 가 돌면 API 값으로
 * 덮인다. 손으로 넣은 임시공휴일(source='manual')과 섞이지 않는다.
 */
export async function seedFallbackHolidays(
  years: number[] = defaultYears(),
): Promise<number> {
  const rows = POLICY.order.holidays
    .filter((d) => years.some((y) => d.startsWith(`${y}-`)))
    .map((date) => ({
      date,
      name: "(임시) 법정공휴일",
      year: Number(date.slice(0, 4)),
      source: "fallback" as const,
    }));

  if (rows.length === 0) return 0;

  await db
    .insert(holidays)
    .values(rows)
    .onConflictDoNothing({ target: holidays.date });

  return rows.length;
}
