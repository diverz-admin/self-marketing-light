/**
 * 포인트 유상·무상 분리 백필 (운영정책 rev.11 · PT-01 / PT-02)
 *
 * 하는 일 두 가지:
 *
 *  1. credits.kind 분류 — rev.11 이전 원장에는 구분이 없어 전부 'paid' 로 채워졌다.
 *     사유(reason)에 보너스·쿠폰·이벤트가 들어간 행을 'free' 로 옮긴다.
 *     PT-01 무상 포인트는 환불 대상이 아니므로, 이 분류가 틀리면 환불 부채가 틀어진다.
 *
 *  2. users 캐시 재구축 — creditBalance / freeBalance 를 원장 합계로 덮어쓴다.
 *     rev.11 이전 코드가 users 잔액만 따로 증감시켜 원장과 어긋나 있었다.
 *
 * 기본은 미리보기다. 실제로 쓰려면 --apply 를 준다.
 *
 *   npx tsx --env-file=.env.local scripts/backfill-credit-kind.mts
 *   npx tsx --env-file=.env.local scripts/backfill-credit-kind.mts --apply
 */

import postgres from "postgres";

const APPLY = process.argv.includes("--apply");

/** 무상 지급으로 볼 사유 — 보수적으로 잡는다. 애매하면 유상으로 남겨 둔다. */
const FREE_REASON_PATTERNS = ["보너스", "쿠폰", "이벤트", "무상", "적립", "프로모션"];

const sql = postgres(process.env.DATABASE_URL!, {
  prepare: false,
  max: 2,
  connect_timeout: 15,
});

function won(n: number): string {
  return `${n.toLocaleString("ko-KR")}P`;
}

async function main() {
  console.log(APPLY ? "▶ 적용 모드\n" : "▶ 미리보기 (실제 반영하려면 --apply)\n");

  // ── 1. kind 분류 ──
  // 배열 파라미터 대신 정규식 하나로 맞춘다 (~* = 대소문자 무시 매칭)
  const pattern = FREE_REASON_PATTERNS.join("|");
  const candidates = await sql<{ id: string; reason: string | null; delta: string }[]>`
    select id, reason, delta from credits
    where kind = 'paid' and reason ~* ${pattern}
  `;

  console.log("── 1. credits.kind 재분류 (paid → free) ──");
  if (candidates.length === 0) {
    console.log("  옮길 행 없음\n");
  } else {
    const byReason = new Map<string, { n: number; sum: number }>();
    for (const c of candidates) {
      const k = c.reason ?? "(없음)";
      const cur = byReason.get(k) ?? { n: 0, sum: 0 };
      cur.n += 1;
      cur.sum += Number(c.delta);
      byReason.set(k, cur);
    }
    for (const [reason, v] of byReason) {
      console.log(`  "${reason}" — ${v.n}행, ${won(v.sum)}`);
    }
    if (APPLY) {
      await sql`update credits set kind = 'free' where kind = 'paid' and reason ~* ${pattern}`;
      console.log(`  → ${candidates.length}행을 free 로 변경했습니다.`);
    }
    console.log();
  }

  // ── 2. users 캐시 재구축 ──
  console.log("── 2. users 잔액 캐시 재구축 (원장 합계로 덮어쓰기) ──");
  const drift = await sql<
    { id: string; name: string; bal: number; ledger: number; free: number }[]
  >`
    select u.id, u.name,
           u.credit_balance::float as bal,
           coalesce((select sum(delta) from credits c where c.user_id = u.id), 0)::float as ledger,
           coalesce((select sum(delta) from credits c where c.user_id = u.id and c.kind = 'free'), 0)::float as free
    from users u
    order by u.created_at
  `;

  let changed = 0;
  for (const r of drift) {
    const diff = r.ledger - r.bal;
    if (Math.abs(diff) < 0.01) continue;
    changed++;
    const sign = diff > 0 ? "+" : "";
    console.log(
      `  ${r.name.padEnd(10)} ${won(r.bal).padStart(10)} → ${won(r.ledger).padStart(10)}  (${sign}${won(diff)})`,
    );
  }
  if (changed === 0) console.log("  어긋난 회원 없음");

  if (APPLY) {
    await sql`
      update users u set
        credit_balance = coalesce((select sum(delta) from credits c where c.user_id = u.id), 0),
        free_balance   = coalesce((select sum(delta) from credits c where c.user_id = u.id and c.kind = 'free'), 0),
        updated_at     = now()
    `;
    console.log(`  → 전체 ${drift.length}명의 캐시를 재구축했습니다.`);
  }

  // ── 결과 ──
  console.log("\n── 재분류 후 잔액 구성 ──");
  const after = await sql<{ total: number; free: number }[]>`
    select coalesce(sum(delta),0)::float total,
           coalesce(sum(delta) filter (where kind='free'),0)::float free
    from credits
  `;
  const t = after[0]?.total ?? 0;
  const f = after[0]?.free ?? 0;
  console.log(`  총 잔액 ${won(t)} = 유상 ${won(t - f)} + 무상 ${won(f)}`);
  console.log(`  환불 대상(유상) ${won(t - f)}`);

  if (!APPLY) console.log("\n※ 미리보기였습니다. 반영하려면 --apply 를 붙여 다시 실행하세요.");
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
