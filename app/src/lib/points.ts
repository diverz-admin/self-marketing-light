/**
 * 포인트 조회 · 원장 기록.
 *
 * 원장의 유상/무상 분리는 운영정책 rev.11 (2026-09-02) 규정이다.
 *   PT-01 보너스·쿠폰 등 무상 지급 포인트는 환불 대상이 아니다. 유상/무상을 원장에서 분리 관리한다.
 *   PT-02 차감 시 무상 포인트를 먼저 소진한다. 고객에게 유리한 방향이나 환불 부채는 증가한다.
 *   PT-03 유상 포인트는 충전 건별로 나누지 않고 단일 잔액으로 관리한다.
 *   PT-08 최종 거래일(= 마지막 충전 또는 마지막 사용)을 남겨야 5년 소멸을 판정할 수 있다.
 *
 * ── 잔액의 정본은 credits 원장이다 ──
 *
 * users.creditBalance / users.freeBalance 는 목록 화면이 회원마다 합계를 다시
 * 구하지 않아도 되게 두는 캐시일 뿐이다. 정본은 언제나 원장이고, 캐시는 원장을
 * 다시 더해서 덮어쓴다(증감 연산을 하지 않는다 — 한 번 어긋나면 영원히 어긋난다).
 *
 *   creditBalance = Σ delta                      (총 잔액)
 *   freeBalance   = Σ delta where kind='free'    (무상 잔액)
 *   환불 가능액    = creditBalance − freeBalance   (유상 잔액, PT-01/PT-07)
 *
 * 이 구분이 필요한 이유는 rev.11 이전 코드가 users 잔액만 따로 증감시켜 원장과
 * 어긋나 있었기 때문이다. 고객 화면은 원장 합계를, 어드민 화면은 users 컬럼을 읽어
 * 같은 회원의 잔액이 화면마다 다르게 보였다.
 *
 * 포인트를 움직이는 곳은 반드시 아래 grant / spend / revoke 를 거친다.
 */

import { db } from "@/db";
import { credits, pointCharges, users } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

/**
 * 보유 포인트 = 크레딧 원장(credits) 합계.
 * 관리자가 충전 신청을 승인하면 credits 에 +행이 쌓이므로, 이 합계가 곧 화면 잔액이다.
 */
export async function loadPointBalance(userId: string): Promise<number> {
  const [row] = await db
    .select({ balance: sql<number>`coalesce(sum(${credits.delta}), 0)::float` })
    .from(credits)
    .where(eq(credits.userId, userId));

  return row?.balance ?? 0;
}

export type PointChargeRow = {
  id: string;
  date: string;
  /** ISO 시각 — 원장 줄과 섞어 정렬한다 */
  at: string;
  amount: number;
  bonusAmount: number;
  method: string;
  depositorName: string | null;
  receiptType: string | null;
  status: string;
};

/** 본인 충전 신청 내역 — 어드민 "포인트충전" 화면과 같은 행을 본다 */
export async function loadMyPointCharges(userId: string): Promise<PointChargeRow[]> {
  const rows = await db
    .select()
    .from(pointCharges)
    .where(eq(pointCharges.userId, userId))
    .orderBy(desc(pointCharges.createdAt))
    .limit(100);

  return rows.map((c) => ({
    id: c.id,
    date: c.createdAt.toISOString().slice(0, 10),
    at: c.createdAt.toISOString(),
    amount: Number(c.amount),
    bonusAmount: Number(c.bonusAmount),
    method: c.method,
    depositorName: c.depositorName,
    receiptType: c.receiptType,
    status: c.status,
  }));
}

/** 충전 승인·보너스 원장 줄 — 충전 신청 행이 이미 보여 주므로 내역에서 다시 세지 않는다 */
const CHARGE_GRANT_REASONS = ["포인트 충전 승인", "포인트 충전 보너스"];

export type PointEntryRow = {
  id: string;
  /** ISO 시각 — 충전 신청 행과 섞어 정렬한다 */
  at: string;
  /** +적립 / −차감 */
  delta: number;
  reason: string;
  /** 이 줄까지 반영된 잔액 */
  balanceAfter: number;
  /** 주문 차감이면 order, 그 밖의 조정·회수·쿠폰 등은 adjust */
  group: "order" | "adjust";
};

/**
 * 충전 화면 우측 "충전 내역 / 주문 내역"에 쓰는 원장 줄.
 *
 * PT-02 차감은 무상·유상 두 줄로 나뉘어 적히므로 같은 refId·사유·시각 줄을 하나로 합친다.
 * 충전 승인·보너스 적립은 충전 신청 행과 겹치므로 뺀다.
 */
export async function loadMyPointEntries(userId: string): Promise<PointEntryRow[]> {
  const rows = await db
    .select({
      id: credits.id,
      delta: sql<number>`${credits.delta}::float`,
      reason: credits.reason,
      refId: credits.refId,
      createdAt: credits.createdAt,
      balanceAfter: sql<number>`(sum(${credits.delta}) over (order by ${credits.createdAt}, ${credits.id}))::float`,
    })
    .from(credits)
    .where(eq(credits.userId, userId))
    .orderBy(desc(credits.createdAt), desc(credits.id))
    .limit(300);

  const merged: PointEntryRow[] = [];
  const byKey = new Map<string, PointEntryRow>();
  for (const r of rows) {
    const reason = r.reason ?? "포인트 조정";
    if (CHARGE_GRANT_REASONS.includes(reason)) continue;

    const at = r.createdAt.toISOString();
    const key = r.refId ? `${r.refId}|${reason}|${at}` : r.id;
    const same = byKey.get(key);
    if (same) {
      same.delta += r.delta;
      // 최신순이라 먼저 본 줄이 나중에 적힌 줄 — 그 잔액이 합친 뒤의 잔액이다
      continue;
    }
    const row: PointEntryRow = {
      id: r.id,
      at,
      delta: r.delta,
      reason,
      balanceAfter: r.balanceAfter,
      group: r.delta < 0 && reason.startsWith("장바구니 주문") ? "order" : "adjust",
    };
    byKey.set(key, row);
    merged.push(row);
  }
  return merged;
}


/* ────────────────────────────────────────────────────────────
   원장 기록 — PT-01 / PT-02 유상·무상 분리

   모든 기록은 "원장에 줄을 적고 → 원장에서 잔액을 다시 구해 캐시에 덮어쓴다"는
   같은 모양을 따른다. 캐시를 증감시키지 않으므로 원장과 어긋날 수 없다.
──────────────────────────────────────────────────────────── */

/** db.transaction 콜백이 받는 트랜잭션 핸들 */
export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** PT-01 paid = 고객이 돈을 낸 포인트(환불 대상) / free = 무상 지급분(환불 대상 아님) */
export type CreditKind = "paid" | "free";

export type Balances = {
  /** 총 잔액 */
  total: number;
  /** 무상 잔액 */
  free: number;
  /** PT-07 환불 가능액 = 유상 잔액 */
  refundable: number;
};

type LedgerEntry = {
  userId: string;
  /** 양수로 준다. 방향(+/−)은 함수가 정한다. */
  amount: number;
  reason: string;
  /** 관련 order_id 또는 campaign_id */
  refId?: string;
};

/** 원장에서 잔액을 구한다 — 이 한 곳만이 잔액을 "계산"한다 */
async function sumLedger(runner: Tx | typeof db, userId: string): Promise<Balances> {
  const [row] = await runner
    .select({
      total: sql<number>`coalesce(sum(${credits.delta}), 0)::float`,
      free: sql<number>`coalesce(sum(${credits.delta}) filter (where ${credits.kind} = 'free'), 0)::float`,
    })
    .from(credits)
    .where(eq(credits.userId, userId));

  const total = row?.total ?? 0;
  const free = row?.free ?? 0;
  return { total, free, refundable: Math.max(0, total - free) };
}

/**
 * 같은 회원에 대한 동시 기록을 직렬화한다.
 *
 * 원장은 append-only 라 잠글 행이 없다. 그래서 회원 행을 잠가 순서를 만든다.
 * 이게 없으면 잔액 5,000P 인 회원이 3,000P 결제 두 건을 동시에 통과시킬 수 있다.
 */
async function lockMember(tx: Tx, userId: string): Promise<void> {
  const [row] = await tx
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .for("update")
    .limit(1);
  if (!row) throw new Error("회원을 찾을 수 없습니다.");
}

/** 원장을 다시 더해 캐시 컬럼에 덮어쓴다 */
async function syncCache(tx: Tx, userId: string, touchTransactionDate: boolean): Promise<Balances> {
  const b = await sumLedger(tx, userId);
  await tx
    .update(users)
    .set({
      creditBalance: String(b.total),
      freeBalance: String(b.free),
      // PT-08 최종 거래일 — 5년 소멸 판정의 기준
      ...(touchTransactionDate ? { lastTransactionAt: new Date() } : {}),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
  return b;
}

/**
 * 포인트 지급 — 충전 승인, 보너스, 쿠폰 적립, 캠페인 중도 종료 환급(M-02).
 *
 * kind 에 기본값을 두지 않는다. 무상 지급을 유상으로 잘못 적으면 그만큼 환불
 * 부채가 생기는데, 그 사실이 원장 어디에도 남지 않기 때문이다.
 */
export async function grantCredit(
  tx: Tx,
  kind: CreditKind,
  { userId, amount, reason, refId }: LedgerEntry,
): Promise<Balances | null> {
  if (!Number.isFinite(amount) || amount <= 0) return null;

  await lockMember(tx, userId);
  await tx.insert(credits).values({ userId, kind, delta: String(amount), reason, refId });
  return syncCache(tx, userId, true);
}

/**
 * PT-02 포인트 차감 — 무상을 먼저 소진하고 모자란 만큼만 유상에서 뺀다.
 *
 * 무상 3,000 · 유상 7,000 인 회원이 5,000을 쓰면 무상 3,000 + 유상 2,000 으로
 * 나뉘어 두 줄이 적힌다. 남는 잔액은 유상 5,000 이므로 그만큼만 환불 대상이다.
 * 고객에게 유리한 방향이지만 그만큼 회사의 환불 부채는 늘어난다.
 *
 * 잔액이 모자라면 던진다 — 부분 차감은 하지 않는다.
 */
export async function spendCredit(
  tx: Tx,
  { userId, amount, reason, refId }: LedgerEntry,
): Promise<{ fromFree: number; fromPaid: number; balances: Balances }> {
  if (!Number.isFinite(amount) || amount <= 0) {
    const balances = await sumLedger(tx, userId);
    return { fromFree: 0, fromPaid: 0, balances };
  }

  await lockMember(tx, userId);
  const before = await sumLedger(tx, userId);

  if (before.total < amount) {
    throw new Error(
      `포인트가 부족합니다. (잔액 ${before.total.toLocaleString()}P / 필요 ${amount.toLocaleString()}P)`,
    );
  }

  const fromFree = Math.min(before.free, amount);
  const fromPaid = amount - fromFree;

  const rows = [];
  if (fromFree > 0) {
    rows.push({ userId, kind: "free" as const, delta: String(-fromFree), reason, refId });
  }
  if (fromPaid > 0) {
    rows.push({ userId, kind: "paid" as const, delta: String(-fromPaid), reason, refId });
  }
  await tx.insert(credits).values(rows);

  const balances = await syncCache(tx, userId, true);
  return { fromFree, fromPaid, balances };
}

/**
 * 지급을 되돌린다 — 충전 승인 취소처럼 "준 것을 도로 거두는" 경우.
 *
 * 차감(spendCredit)과 다르다. 차감은 고객이 쓴 것이라 무상부터 빼지만, 되돌리기는
 * 준 것과 같은 종류에서 빼야 원장이 맞는다. 이미 써 버려 잔액이 모자라면 그만큼만
 * 빼고 음수로 만들지 않는다(회수 부족분은 상담으로 처리한다 — CG-02).
 */
export async function revokeCredit(
  tx: Tx,
  kind: CreditKind,
  { userId, amount, reason, refId }: LedgerEntry,
): Promise<Balances | null> {
  if (!Number.isFinite(amount) || amount <= 0) return null;

  await lockMember(tx, userId);
  const before = await sumLedger(tx, userId);

  // 같은 종류에서 뺄 수 있는 만큼만 뺀다
  const available = kind === "free" ? before.free : before.refundable;
  const take = Math.min(amount, Math.max(0, available));
  if (take <= 0) return before;

  await tx.insert(credits).values({ userId, kind, delta: String(-take), reason, refId });
  return syncCache(tx, userId, true);
}

/**
 * 잔액 조회 — 총액 / 무상 / 환불 가능액(유상).
 *
 * PT-11 환불 접수 후 입금 전까지 잔액을 잠그지 않으므로, 송금 직전에 이 함수를
 * 다시 불러 환불액을 재산정해야 한다. 재산정 결과가 최소 환불 금액(PT-07)
 * 미만이면 환불을 취소하고 고객에게 안내한다.
 */
export async function loadBalances(userId: string): Promise<Balances> {
  return sumLedger(db, userId);
}

/**
 * PT-07 환불 가능액 = 유상 잔액.
 * 이미 읽어 둔 두 값으로 계산할 때 쓴다(화면에서 잔액을 다시 조회하지 않도록).
 */
export function refundableBalance(creditBalance: number, freeBalance: number): number {
  return Math.max(0, creditBalance - freeBalance);
}

/**
 * 캐시 컬럼을 원장 기준으로 다시 맞춘다.
 *
 * 정상 경로에서는 필요하지 않다 — 백필 스크립트와, 원장을 직접 손댄 뒤
 * 복구할 때만 쓴다. touchTransactionDate 를 올리지 않으므로 PT-08 최종 거래일은
 * 건드리지 않는다(재계산은 거래가 아니다).
 */
export async function rebuildBalanceCache(tx: Tx, userId: string): Promise<Balances> {
  return syncCache(tx, userId, false);
}

/**
 * 최근 n일의 일별 잔액 추이 — 고객 대시보드 KPI 카드의 추세선이 쓴다.
 *
 * 원장을 날짜별로 누계 내어, 그날 하루가 끝난 시점의 잔액을 만든다.
 * 기간 이전의 거래도 시작 잔액에 포함해야 선이 0에서 솟는 것처럼 보이지 않는다.
 */
export async function loadBalanceTrend(userId: string, days = 14): Promise<number[]> {
  const rows = await db
    .select({
      day: sql<string>`to_char(${credits.createdAt} at time zone 'Asia/Seoul', 'YYYY-MM-DD')`,
      delta: sql<number>`sum(${credits.delta})::float`,
    })
    .from(credits)
    .where(eq(credits.userId, userId))
    .groupBy(sql`1`);

  const byDay = new Map(rows.map((r) => [r.day, r.delta]));

  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" });
  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    keys.push(fmt.format(d));
  }

  // 기간 시작 이전까지의 누계 = 첫날의 시작 잔액
  const first = keys[0];
  let running = rows.reduce((sum, r) => (r.day < first ? sum + r.delta : sum), 0);

  return keys.map((k) => {
    running += byDay.get(k) ?? 0;
    return running;
  });
}
