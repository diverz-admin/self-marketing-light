/**
 * 관리 화면 공용 기간 필터 — 완료된 캠페인을 연/월/일로 좁혀 조회한다.
 * 완료 데이터는 계속 쌓이므로 클라이언트에서 거르지 않고 SQL 범위 조건으로 넘긴다.
 */
export type PeriodParams = { year?: number; month?: number; day?: number };

type RawSearchParams = Record<string, string | string[] | undefined>;

const toInt = (v: string | string[] | undefined) => {
  const raw = Array.isArray(v) ? v[0] : v;
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isInteger(n) ? n : undefined;
};

/** ?year=2026&month=7&day=23 → { year, month, day } (상위 값이 없으면 하위 값은 버린다) */
export function parsePeriod(sp: RawSearchParams | undefined): PeriodParams {
  if (!sp) return {};
  const year = toInt(sp.year);
  if (!year) return {};
  const month = toInt(sp.month);
  if (!month || month < 1 || month > 12) return { year };
  const day = toInt(sp.day);
  if (!day || day < 1 || day > 31) return { year, month };
  return { year, month, day };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** 선택한 기간의 시작·끝 날짜 (양끝 포함). 연도가 없으면 null = 기간 조건 없음 */
export function periodRange(p: PeriodParams): { start: string; end: string } | null {
  if (!p.year) return null;
  if (!p.month) return { start: `${p.year}-01-01`, end: `${p.year}-12-31` };
  if (!p.day) {
    // 다음 달 0일 = 이번 달 마지막 날
    const last = new Date(Date.UTC(p.year, p.month, 0)).getUTCDate();
    return { start: `${p.year}-${pad(p.month)}-01`, end: `${p.year}-${pad(p.month)}-${pad(last)}` };
  }
  const d = `${p.year}-${pad(p.month)}-${pad(p.day)}`;
  return { start: d, end: d };
}

/** "2026년 7월 23일" 형태 라벨 */
export function periodLabel(p: PeriodParams): string {
  if (!p.year) return "전체 기간";
  if (!p.month) return `${p.year}년`;
  if (!p.day) return `${p.year}년 ${p.month}월`;
  return `${p.year}년 ${p.month}월 ${p.day}일`;
}
