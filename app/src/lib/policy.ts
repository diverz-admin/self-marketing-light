/**
 * BLUE EGG 운영 정책 — 화면이 참조하는 단일 출처.
 *
 * 근거 문서: BLUEEGG_운영정책_초안_20260902.pdf (Part 1 확정 규정 91건)
 * 조항 번호(PT-07, C-01 …)는 문서와 1:1로 맞춘다. 정책이 바뀌면 이 파일만 고치고,
 * 화면은 POLICY / POLICY_SECTIONS 를 그대로 읽어 쓴다. 화면에 숫자를 직접 적지 않는다.
 *
 * Part 2(미확정 19건)는 확정 전이므로 고객 화면에 노출하지 않는다.
 */

/* ────────────────────────────────────────────────────────────
   1. 화면이 계산·표시에 쓰는 정책 값
──────────────────────────────────────────────────────────── */
export const POLICY = {
  /** 개정일 — 공지 이력 표기에 쓴다 (TM-02: 화면에는 최신본만 표시) */
  revisedAt: "2026년 9월 2일",

  point: {
    /** P-00 실입금액 = 요청 포인트 × 1.1 (부가세 포함) */
    vatRate: 0.1,
    /** 최소 충전 포인트 */
    minCharge: 10_000,
    /** 충전 요청 단위 — 이 단위로 나누어떨어져야 접수된다 */
    chargeUnit: 1_000,
    /** PT-07 최소 환불 금액 */
    minRefund: 10_000,
    /** PT-08 미사용 포인트 소멸 — 최종 거래일 기준 */
    expiryYears: 5,
    /** PT-10 환불 접수 후 입금까지 영업일 */
    refundBusinessDays: 7,
  },

  cart: {
    /** C-02 담은 지 이 일수가 지나면 "확인 필요"를 표시한다 */
    staleDays: 30,
  },

  order: {
    /**
     * PU-02 당일 집행 마감시각 (24시간제).
     * 정책 문서에는 시각이 없었고, 개발본 신청 화면이 "당일 마감 13:30"으로
     * 안내하고 있어 그 값을 정본으로 삼는다. null 이면 규칙만 안내한다.
     *
     * ⚠️ 이 값은 `expectedExecutionDate` 의 "오늘 발주 / 내일 발주"를 가른다.
     * 화면 문구만 바꾸는 값이 아니다.
     */
    cutoffHour: 13 as number | null,
    /** 마감 분 — 개발본 신청 화면이 "당일 마감 13:30"으로 안내한다 */
    cutoffMinute: 30,
    /**
     * CS-03 대체용 공휴일 목록 — 정상 경로가 아니다.
     *
     * 정본은 `holidays` 테이블이며 공공데이터 API 에서 연 단위로 받는다.
     * 아래 값은 DB 조회가 실패했을 때만 쓰는 마지막 방어선이고, 매년 손으로
     * 갱신해야 하므로 방치되면 틀린 값이 된다. 새 연도를 여기 추가하는 대신
     * `syncHolidays()` 가 돌고 있는지를 먼저 확인할 것.
     */
    holidays: [
      "2026-01-01", "2026-02-16", "2026-02-17", "2026-02-18", "2026-03-01", "2026-03-02",
      "2026-05-05", "2026-05-24", "2026-05-25", "2026-06-06", "2026-08-15", "2026-08-17",
      "2026-09-24", "2026-09-25", "2026-09-26", "2026-10-03", "2026-10-05", "2026-10-09",
      "2026-12-25",
      "2027-01-01", "2027-02-06", "2027-02-07", "2027-02-08", "2027-02-09", "2027-03-01",
      "2027-05-05", "2027-05-13", "2027-06-06", "2027-08-15", "2027-08-16", "2027-09-14",
      "2027-09-15", "2027-09-16", "2027-10-03", "2027-10-04", "2027-10-09", "2027-10-11",
      "2027-12-25",
    ] as string[],
  },

  coupon: {
    /** CP-02 쿠폰 유효기간 — 발급일 기준 */
    validDays: 30,
    /** 이미 구현: 쿠폰은 주문당 1장 */
    maxPerOrder: 1,
  },

  notice: {
    /** NT-01 / TM-01 불이익 변경·약관 개정 사전 공지 */
    priorDays: 7,
  },

  support: {
    /** CS-01 상담 응대 시간 */
    hours: "평일 10:00 ~ 19:00",
    /** CS-01 주말·공휴일 휴무 */
    holidayNote: "주말·공휴일 휴무",
    /** CS-02 영업일 정의 */
    businessDayDef: "법정공휴일을 제외한 월~금",
    /** HD-01 담당자 배정 */
    assignBusinessDays: 1,
    kakaoChannel: "@blueegg",
  },

  referral: {
    /** 확정된 추천 요율 */
    rates: [
      { label: "상위노출", rate: "5%" },
      { label: "리뷰", rate: "5%" },
      { label: "보장형", rate: "3%" },
    ],
    /** 유효기간 */
    validMonths: 12,
    /** RF-02 포인트로만 지급 */
    payout: "포인트",
  },

  rank: {
    /** R-02 무료 1건은 등록일 기준 최초 1건 */
    freeCount: 1,
  },

  guaranteed: {
    /** 18. 보장형 운영 — 실제 구현은 선불이다 (GU-01) */
    prepaid: true,
    /** 기간 카운트: 목표 순위 유지 일수만 카운트, 이탈일은 종료일이 밀린다 */
    countsOnlyHeldDays: true,
    /** 정찰가표 — 상담 결과로 최종 확정된다 */
    listPrices: [
      { label: "네이버 플레이스 1위", price: 35_000 },
      { label: "네이버 플레이스 3위", price: 22_000 },
      { label: "네이버 쇼핑 1위", price: 48_000 },
    ],
  },

  /** SS-02 탈퇴 시 파기·보관 범위 */
  retention: {
    purgeNow: ["이름", "전화번호", "이메일", "사업자등록증 파일"],
    keepYears: 5,
    keepItems: ["충전·결제·환불 내역", "감사 로그", "세금계산서 발행 기록"],
    keepNote: "개인 식별 정보 제외",
  },
} as const;

/** 실입금액 (부가세 포함) — 충전 화면과 어드민이 같은 식을 쓴다 */
export function chargeAmountWithVat(points: number): number {
  return Math.floor(points * (1 + POLICY.point.vatRate));
}

/** 캠페인 중도 해지 환불액 — 정산 공식(구현 완료) */
export function partialRefund(paid: number, doneDays: number, totalDays: number): number {
  if (totalDays <= 0) return paid;
  return paid - Math.round((paid * doneDays) / totalDays);
}

export function ymd(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/**
 * CS-03 공휴일 목록.
 *
 * 정본은 `holidays` 테이블이고, 값은 공공데이터 API 에서 연 단위로 받아 캐시한다
 * (`lib/holidays.ts`). 아래 함수들이 목록을 인자로 받는 이유가 그것이다 —
 * 서버에서 조회한 값을 브라우저까지 내려 보내야 양쪽 계산이 같아진다.
 *
 * 목록을 주지 않으면 POLICY.order.holidays(대체용 상수)를 쓴다. 이 상수는 매년
 * 손으로 갱신해야 하므로 방치되면 틀린 값이 된다 — DB 조회가 실패했을 때의
 * 마지막 방어선이지 정상 경로가 아니다.
 */
export type HolidaySet = ReadonlySet<string> | readonly string[];

function isHoliday(d: Date, holidays?: HolidaySet): boolean {
  const key = ymd(d);
  if (!holidays) return POLICY.order.holidays.includes(key);
  return holidays instanceof Set ? holidays.has(key) : (holidays as readonly string[]).includes(key);
}

/** CS-02 영업일 = 법정공휴일을 제외한 월~금 */
export function isBusinessDay(d: Date, holidays?: HolidaySet): boolean {
  const dow = d.getDay();
  if (dow === 0 || dow === 6) return false;
  return !isHoliday(d, holidays);
}

/**
 * PU-02 예상 집행일.
 * 마감시각 전 결제분은 당일, 이후·주말·공휴일 결제분은 다음 영업일에 발주한다.
 * 마감시각이 아직 정해지지 않았으면(cutoffHour === null) 결제일이 영업일인지만 본다.
 */
export function expectedExecutionDate(from: Date = new Date(), holidays?: HolidaySet): Date {
  const d = new Date(from);
  const cutoff = POLICY.order.cutoffHour;
  const cutoffMin = POLICY.order.cutoffMinute ?? 0;
  const pastCutoff =
    cutoff !== null && (d.getHours() > cutoff || (d.getHours() === cutoff && d.getMinutes() >= cutoffMin));
  if (isBusinessDay(d, holidays) && !pastCutoff) return d;
  do {
    d.setDate(d.getDate() + 1);
  } while (!isBusinessDay(d, holidays));
  return d;
}

/**
 * 영업일 n일 뒤 — PT-10 환불 입금(7영업일) · HD-01 담당자 배정(1영업일).
 * 시작일 당일은 세지 않는다. "영업일 1일 이내"는 다음 영업일까지를 뜻한다.
 */
export function addBusinessDays(from: Date, days: number, holidays?: HolidaySet): Date {
  const d = new Date(from);
  let left = Math.max(0, Math.trunc(days));
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    if (isBusinessDay(d, holidays)) left--;
  }
  return d;
}

/** 기한이 지났는지 — 어드민 대시보드의 "처리 지연" 표시에 쓴다 */
export function isOverdue(since: Date, businessDays: number, holidays?: HolidaySet, now = new Date()): boolean {
  return now > addBusinessDays(since, businessDays, holidays);
}

/** 화면 표시용 "9월 11일 (금)" */
export function formatExecutionDate(d: Date): string {
  const week = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${week})`;
}

/** C-02 담은 지 오래된 장바구니 항목인지 */
export function isStaleCartItem(addedAt?: number, now = Date.now()): boolean {
  if (!addedAt) return false;
  return now - addedAt > POLICY.cart.staleDays * 24 * 60 * 60 * 1000;
}

/* ────────────────────────────────────────────────────────────
   2. 상담(카카오톡)으로만 처리되는 항목 — 예외 상황 창구 일원화
──────────────────────────────────────────────────────────── */
export const CONSULT_ONLY: { label: string; code: string }[] = [
  { label: "포인트 환불", code: "PT-09" },
  { label: "캠페인 취소", code: "C-03" },
  { label: "집행 전 중단", code: "RW-01" },
  { label: "입금 불일치(과입금·미달입금)", code: "CG-02" },
  { label: "회원 탈퇴", code: "ME-01a" },
  { label: "사업자등록번호 변경", code: "ME-02" },
  { label: "리뷰 목표 미달", code: "RV-01" },
  { label: "추가 서비스 환불", code: "SV-01" },
  { label: "보장형 신청", code: "18" },
];

/* ────────────────────────────────────────────────────────────
   3. 고객 고지용 운영정책 본문
──────────────────────────────────────────────────────────── */
export type PolicyRule = {
  /** 문서 조항 번호 */
  code: string;
  text: string;
  /** 특히 눈에 띄어야 하는 항목 (요약 카드·주의 박스에 뽑아 쓴다) */
  highlight?: boolean;
};

export type PolicySection = {
  /** URL 앵커 — /marketing/policy#points */
  id: string;
  title: string;
  summary: string;
  rules: PolicyRule[];
  /** 표 형태로 함께 보여줄 부가 정보 */
  table?: { caption?: string; head: string[]; rows: string[][] };
  note?: string;
};

export const POLICY_SECTIONS: PolicySection[] = [
  {
    id: "points",
    title: "포인트 충전·환불",
    summary: "포인트는 선불 예치금입니다. 충전·차감·환불의 기준을 안내합니다.",
    rules: [
      {
        code: "P-00",
        text: `포인트는 선불 예치금입니다. 계좌이체 입금이 확인되면 충전 건별로 세금계산서를 개별 발행합니다. 실제 입금하실 금액은 요청 포인트 × 1.1(부가세 10% 포함)입니다.`,
        highlight: true,
      },
      {
        code: "PT-01",
        text: "보너스·쿠폰·추천 적립으로 받으신 무상 포인트는 환불 대상이 아닙니다. 유상 포인트와 무상 포인트는 원장에서 분리해 관리합니다.",
        highlight: true,
      },
      {
        code: "PT-02",
        text: "포인트를 사용하실 때는 무상 포인트가 먼저 소진됩니다.",
      },
      {
        code: "PT-03",
        text: "유상 포인트는 충전 건별로 나누지 않고 단일 잔액으로 관리합니다.",
      },
      {
        code: "PT-05",
        text: "환불 계좌는 입금자명과 예금주가 동일한 계좌만 가능합니다.",
        highlight: true,
      },
      {
        code: "PT-06",
        text: "환불 이체 수수료는 고객 부담이며 환불액에서 차감됩니다. 세금계산서 기준액은 수수료 차감 전 금액입니다.",
      },
      {
        code: "PT-07",
        text: `최소 환불 금액은 ${POLICY.point.minRefund.toLocaleString()}P입니다. 잔액이 이보다 적으면 환불이 불가합니다.`,
        highlight: true,
      },
      {
        code: "PT-08",
        text: `미사용 포인트는 최종 거래일로부터 ${POLICY.point.expiryYears}년이 지나면 소멸합니다. 소멸 전에 미리 안내드립니다.`,
        highlight: true,
      },
      {
        code: "PT-09",
        text: "환불 신청은 카카오톡 상담으로만 접수합니다.",
      },
      {
        code: "PT-10",
        text: `환불 접수 후 영업일 ${POLICY.point.refundBusinessDays}일 이내에 입금해 드립니다.`,
        highlight: true,
      },
      {
        code: "CG-01",
        text: "충전은 입금 확인 후 승인됩니다. 처리 기한은 환불과 동일한 기준을 적용합니다.",
      },
      {
        code: "CG-02",
        text: "과입금·미달입금은 담당자가 연락드려 협의합니다.",
      },
      {
        code: "CG-03",
        text: "미입금 상태의 충전 요청은 자동으로 만료되지 않습니다.",
      },
    ],
    note: "환불 처리 시 ① 입금자명과 환불 계좌 예금주 일치 ② 잔액 최소 환불 금액 이상 ③ 무상 포인트 제외 ④ 이체 수수료 차감 을 확인합니다.",
  },
  {
    id: "settlement",
    title: "캠페인 정산·중도 해지",
    summary: "캠페인을 중간에 멈출 때 환불이 어떻게 계산되는지 안내합니다.",
    rules: [
      {
        code: "M-01",
        text: "중도 해지 시 고객 사유는 수행분을 공제하고, 회사 사유는 전액 환불합니다.",
        highlight: true,
      },
      {
        code: "M-02",
        text: "캠페인 중도 종료 환불은 포인트로 환급됩니다. 현금 환불을 원하시면 포인트 환불 절차로 별도 신청해 주세요.",
        highlight: true,
      },
      {
        code: "M-05",
        text: "부분 수행일은 관리자가 확인한 정수 일수를 기준으로 합니다.",
      },
      {
        code: "RW-01",
        text: "집행 전(접수 대기) 중단은 공식 없이 상담으로 결정합니다.",
      },
      {
        code: "DT-01",
        text: "캠페인 기간이 변경되면 금액 조정 여부를 관리자가 판단하며, 변경 사유가 함께 기록됩니다.",
      },
      {
        code: "PD-01",
        text: "집행 중인 캠페인은 결제 시점의 단가로 고정됩니다. 이후 단가가 올라도 추가 청구하지 않습니다.",
        highlight: true,
      },
    ],
    table: {
      caption: "환불액 계산",
      head: ["항목", "내용"],
      rows: [
        ["공식", "환불액 = 결제액 − round(결제액 × 수행일수 ÷ 총일수)"],
        ["기준액", "쿠폰 할인 후 실제 결제하신 금액"],
        ["재정산", "환불은 누계로 관리해 차액만 이동합니다"],
      ],
    },
  },
  {
    id: "cart",
    title: "장바구니·주문",
    summary: "담긴 상품의 가격 기준과 취소 경로를 안내합니다.",
    rules: [
      {
        code: "C-01",
        text: "장바구니에 담으신 뒤 단가가 바뀌면 주문 시점의 가격으로 다시 계산됩니다. 화면에 보이는 가격도 페이지에 들어오실 때 최신화됩니다.",
        highlight: true,
      },
      {
        code: "C-02",
        text: `장바구니는 기한 없이 보관되지만, 담으신 지 ${POLICY.cart.staleDays}일이 지나면 "확인 필요"로 표시됩니다.`,
      },
      {
        code: "C-03",
        text: "주문 취소는 고객님이 직접 하실 수 없습니다. 카카오톡 상담으로 요청해 주세요.",
        highlight: true,
      },
      {
        code: "PD-03",
        text: "신청 화면과 장바구니에 당일 집행 마감시각과 예상 집행일을 표시합니다. 여러 상품을 함께 담으신 경우 가장 이른 마감시각을 기준으로 합니다.",
      },
      {
        code: "PU-02",
        text: "마감시각 전 결제분은 당일, 이후·주말·공휴일 결제분은 다음 영업일에 발주됩니다.",
        highlight: true,
      },
      {
        code: "CP-02",
        text: `쿠폰 유효기간은 발급일로부터 ${POLICY.coupon.validDays}일입니다.`,
      },
      {
        code: "AG-02",
        text: "결제 주체는 언제나 로그인한 계정입니다. 대행사가 소속 광고주 명의로 담아도 대행사 포인트에서 차감됩니다.",
      },
    ],
    note: `쿠폰은 주문당 ${POLICY.coupon.maxPerOrder}장까지 사용하실 수 있고, 할인은 항목별로 비례 배분됩니다. 잔액이 부족하면 주문 전체가 보류되며 부족분이 자동으로 계산됩니다.`,
  },
  {
    id: "notification",
    title: "알림",
    summary: "어떤 알림이 어느 채널로 가는지 안내합니다.",
    rules: [
      { code: "A-01", text: "알림은 기한 없이 보관되며, 직접 삭제하실 수 있습니다." },
      {
        code: "A-02",
        text: "마감 임박 알림은 D-3, D-1 두 번 발송됩니다. 캠페인 기간이 3일 이하면 D-1만 발송합니다.",
      },
      {
        code: "MK-01",
        text: "알림톡은 거래 정보 전용입니다. 계약 이행 통지이므로 마케팅 수신 동의와 무관하게 발송됩니다.",
        highlight: true,
      },
      { code: "MK-02", text: "알림톡은 야간을 포함해 24시간 발송될 수 있습니다." },
      { code: "MK-03", text: "광고성 정보는 카카오톡 채널로 분리해 보내드립니다." },
    ],
    table: {
      caption: "알림 채널 배분 (A-03)",
      head: ["이벤트", "채널"],
      rows: [
        ["포인트·결제 (충전 승인, 관리자 조정, 카드결제)", "알림톡 + 앱"],
        ["캠페인 승인 · 구동 시작 · 완료", "알림톡 + 앱"],
        ["마감 임박 D-3 · D-1", "알림톡 + 앱"],
        ["추천 보상 회수", "알림톡 + 앱"],
        ["불이익 변경 공지", "알림톡 + 앱"],
        ["캠페인 중단", "앱 내부만"],
        ["추천 보상 적립, 쿠폰 지급, 순위 갱신, 장바구니, 대행사 전환", "앱 내부만"],
      ],
    },
  },
  {
    id: "rank",
    title: "통합순위관리",
    summary: "무료 제공 범위와 유료 전환 시 적용 방식을 안내합니다.",
    rules: [
      {
        code: "R-01",
        text: `유료화로 전환될 경우 유예 없이 즉시 적용됩니다. 다만 시행 ${POLICY.notice.priorDays}일 전에 미리 공지드립니다.`,
        highlight: true,
      },
      {
        code: "R-02",
        text: `무료 ${POLICY.rank.freeCount}건은 등록일 기준 최초 ${POLICY.rank.freeCount}건입니다. 기준은 이후 변경되지 않습니다.`,
      },
      { code: "R-04", text: "순위 측정 실패를 이유로 한 요금 조정은 하지 않습니다." },
      {
        code: "H-03",
        text: "순위 데이터는 측정 기준 시각을 화면에 표기합니다. 데이터가 없는 구간은 선이 끊긴 형태로 표시됩니다.",
      },
    ],
  },
  {
    id: "referral",
    title: "추천인·대행사",
    summary: "추천 보상 요율과 지급 방식, 대행사 소속 규정입니다.",
    rules: [
      {
        code: "RF-02",
        text: `추천 보상은 ${POLICY.referral.payout}로만 지급되므로 원천징수 대상이 아닙니다.`,
        highlight: true,
      },
      { code: "RF-03a", text: "부정한 적립이 확인되면 지급된 추천 보상을 회수할 수 있습니다." },
      { code: "RF-03b", text: "회수 시 사유와 함께 앱 알림과 알림톡으로 안내드립니다." },
      {
        code: "AG-04",
        text: "대행사 전환이 반려되어도 재신청 제한은 없습니다. 반려 시 사유를 안내드리므로 보완 후 바로 다시 신청하실 수 있습니다.",
      },
      {
        code: "PV-02",
        text: "대행사 코드로 가입하시면 자동으로 해당 대행사 소속이 됩니다. 대행사 승격 시 기존 가입분에도 소급 적용됩니다.",
        highlight: true,
      },
      {
        code: "PV-02b",
        text: "소속 사실은 가입 시 안내드리며, 승격 소급 대상자에게는 승격 시점에 앱 알림으로 고지합니다.",
      },
    ],
    table: {
      caption: "확정 추천 요율",
      head: ["구분", "요율"],
      rows: [
        ...POLICY.referral.rates.map((r) => [r.label, r.rate]),
        ["유효기간", `${POLICY.referral.validMonths}개월`],
        ["기준액", "실결제액의 수행분"],
      ],
    },
    note: "포인트 충전 자체는 추천 보상 대상이 아닙니다.",
  },
  {
    id: "account",
    title: "가입·계정",
    summary: "가입 자격과 계정 관리 규정입니다.",
    rules: [
      {
        code: "TX-01",
        text: "사업자 회원만 가입하실 수 있습니다. 개인(비사업자) 가입은 받지 않습니다.",
        highlight: true,
      },
      {
        code: "TX-02",
        text: "사업자등록번호는 필수 입력이며 형식(체크섬) 검증을 거칩니다. 국세청 실재 조회는 하지 않습니다.",
      },
      { code: "ME-01a", text: "회원 탈퇴는 카카오톡 상담으로 접수합니다." },
      {
        code: "ME-02",
        text: "사업자등록번호 변경은 상담을 거쳐 처리합니다. 나머지 사업자 정보(업체명·주소·업태·업종)는 직접 수정하실 수 있습니다.",
      },
      {
        code: "ME-03",
        text: "계정 양도는 금지됩니다. 사업장이 바뀌면 신규 가입을 이용해 주세요.",
        highlight: true,
      },
      {
        code: "SC-01",
        text: "계정 도용이 의심되면 비밀번호 재설정을 안내드립니다. 카카오 전용 계정은 비밀번호가 없으므로 이용 정지로 대응합니다.",
      },
      {
        code: "SC-02",
        text: "계정 관리 소홀로 도용되어 사용된 포인트에 대해서는 회사가 책임지지 않습니다.",
        highlight: true,
      },
      { code: "SS-01", text: "로그인 세션은 장기간 유지됩니다. 공용 PC 사용 시 주의해 주세요." },
    ],
  },
  {
    id: "suspension",
    title: "계정 제재",
    summary: "이용이 정지될 경우의 처리 기준입니다.",
    rules: [
      {
        code: "AB-01",
        text: "이용이 정지되면 로그인이 차단되며, 로그인 화면에 정지 사실과 문의 경로를 안내드립니다.",
      },
      {
        code: "AB-02a",
        text: "정지되어도 포인트 잔액은 보존되며, 정지 상태에서도 환불 신청은 접수됩니다.",
        highlight: true,
      },
      { code: "AB-02b", text: "정지 시 진행 중인 캠페인은 건별로 판단합니다." },
      { code: "AB-03a", text: "정지 사유는 기록으로 남깁니다." },
      { code: "AB-03b", text: "소명하시면 정지가 해제될 수 있습니다.", highlight: true },
    ],
  },
  {
    id: "support",
    title: "상담·담당자",
    summary: "상담 창구와 응대 시간입니다.",
    rules: [
      {
        code: "CS-01",
        text: `상담 응대 시간은 ${POLICY.support.hours}입니다 (${POLICY.support.holidayNote}).`,
        highlight: true,
      },
      { code: "CS-02", text: `"영업일"은 ${POLICY.support.businessDayDef}을 말합니다.` },
      {
        code: "HD-01",
        text: `신청 건의 담당자는 접수 후 영업일 ${POLICY.support.assignBusinessDays}일 이내에 배정됩니다.`,
      },
      {
        code: "SL-01",
        text: "회사 귀책 장애로 캠페인이 지연되면 건별로 협의해 처리합니다.",
      },
    ],
    note: "예외 상황은 모두 카카오톡 상담 창구로 일원화되어 있습니다.",
  },
  {
    id: "guaranteed",
    title: "보장형 캠페인",
    summary: "접수 방식, 결제 구조, 기간 카운트 기준입니다.",
    rules: [
      {
        code: "18",
        text: "보장형은 카카오 오픈채팅 상담으로 접수하며, 담당자가 캠페인을 등록해 드립니다.",
      },
      {
        code: "GU-01",
        text: "보장형은 선입금 방식입니다. 결제하신 금액으로 캠페인을 집행하고, 보장 기간 종료 시 목표 순위를 달성하지 못하면 전액 환불해 드립니다.",
        highlight: true,
      },
      {
        code: "18",
        text: "보장 기간은 목표 순위를 유지한 날만 카운트됩니다. 순위가 이탈한 날은 카운트가 멈추고 그만큼 종료일이 밀립니다.",
        highlight: true,
      },
      {
        code: "18",
        text: "금액은 정찰가표를 참고해 상담 결과로 확정됩니다.",
      },
      {
        code: "KW-02",
        text: "동일 키워드에 대한 중복 수주 제한은 두지 않습니다.",
      },
    ],
    table: {
      caption: "정찰가표 (상담으로 최종 확정)",
      head: ["구분", "일 단가"],
      rows: POLICY.guaranteed.listPrices.map((p) => [p.label, `${p.price.toLocaleString()}원`]),
    },
  },
  {
    id: "products",
    title: "상품·발주·신청 검증",
    summary: "신청하실 때 적용되는 검증 기준입니다.",
    rules: [
      {
        code: "VL-01",
        text: "캠페인 신청 링크는 채널별 허용 도메인까지 검증합니다. 예를 들어 네이버 플레이스는 naver.me · map.naver.com · m.place.naver.com 형태의 주소만 받습니다.",
        highlight: true,
      },
      {
        code: "VL-02",
        text: "파일 업로드는 이미지와 PDF만 가능하며 10MB까지 허용됩니다.",
      },
      { code: "KW-01", text: "동일 키워드에 여러 고객이 동시에 신청하는 것을 제한하지 않습니다." },
      { code: "PU-03", text: "발주는 건별로 취소됩니다. 일괄 취소는 제공하지 않습니다." },
    ],
  },
  {
    id: "extra-service",
    title: "추가 서비스(콘텐츠 제작)",
    summary: "홈페이지·상세페이지·영상 등 제작 서비스 규정입니다.",
    rules: [
      { code: "SV-02", text: "추가 서비스도 포인트로 결제합니다." },
      {
        code: "SV-01",
        text: "환불 금액은 견적 잔액을 기본값으로 하며, 사유에 따라 협의로 조정합니다.",
      },
      {
        code: "SV-03a",
        text: "산출물 수정 횟수는 플랫폼 공통 규정이 아니라 상담 단계에서 개별 협의합니다.",
      },
      {
        code: "SV-03b",
        text: "제작물 저작권은 고객님께 양도하되, 회사는 포트폴리오 사용권을 유보합니다.",
        highlight: true,
      },
      { code: "SV-04", text: "견적·작업범위 합의는 카카오톡 상담 기록으로 대체합니다." },
    ],
  },
  {
    id: "privacy",
    title: "개인정보·공지·약관",
    summary: "정보 처리, 보관 기간, 약관 개정 안내 방식입니다.",
    rules: [
      {
        code: "PV-01",
        text: "가입 시 개인정보 처리 위탁에 대한 동의를 별도로 받습니다. 수탁자(솔라피·카카오·매체사) 목록은 개인정보 처리방침에 공개합니다.",
        highlight: true,
      },
      {
        code: "SS-02",
        text: `탈퇴하시면 개인정보는 파기하고, 거래·감사 기록은 ${POLICY.retention.keepYears}년간 보관합니다.`,
      },
      {
        code: "NT-01",
        text: `요금제 변경·서비스 중단 등 고객에게 불리한 변경은 시행 ${POLICY.notice.priorDays}일 전에 공지사항 게시와 알림톡으로 안내드립니다.`,
        highlight: true,
      },
      {
        code: "TM-01",
        text: `약관 개정도 ${POLICY.notice.priorDays}일 전 공지로 갈음하며, 로그인 시 재동의는 받지 않습니다.`,
      },
      { code: "TM-02", text: "화면에는 최신본만 표시되며, 개정 이력은 내부적으로 보관합니다." },
      {
        code: "TR-02",
        text: "로그인하지 않은 둘러보기 상태에서는 상품 단가가 표시되지 않습니다.",
      },
    ],
    table: {
      caption: "탈퇴 시 파기·보관 범위 (SS-02)",
      head: ["구분", "대상"],
      rows: [
        ["즉시 파기", POLICY.retention.purgeNow.join(", ")],
        [
          `${POLICY.retention.keepYears}년 보관`,
          `${POLICY.retention.keepItems.join(", ")} (${POLICY.retention.keepNote})`,
        ],
      ],
    },
  },
];

/** 요약 카드에 뽑아 쓰는, 특히 눈에 띄어야 하는 항목 */
export const POLICY_HIGHLIGHTS = POLICY_SECTIONS.flatMap((s) =>
  s.rules.filter((r) => r.highlight).map((r) => ({ ...r, sectionId: s.id, sectionTitle: s.title }))
);

/** 화면 안내 박스가 조항 번호로 본문을 끌어다 쓴다 */
const RULE_INDEX = new Map(
  POLICY_SECTIONS.flatMap((s) => s.rules.map((r) => [`${s.id}:${r.code}`, r] as const))
);

export function policyRule(sectionId: string, code: string): PolicyRule | undefined {
  return RULE_INDEX.get(`${sectionId}:${code}`);
}

export const POLICY_PATH = "/terms";
