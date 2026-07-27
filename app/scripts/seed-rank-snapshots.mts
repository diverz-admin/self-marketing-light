// 상위노출 캠페인의 순위 추이 차트용 샘플 데이터.
// 캠페인 키워드마다 rank_keywords 행을 맞춰 만들고, 30일치 rank_snapshots 를 채운다.
// 실행: npx tsx --env-file=.env.local scripts/seed-rank-snapshots.mts
import { db } from "../src/db/index.js";
import { campaigns, products, rankKeywords, rankSnapshots } from "../src/db/schema.js";
import { and, eq, inArray, isNull, or, sql } from "drizzle-orm";

const PLACE_TYPES = ["place_traffic"] as const;
const SHOPPING_TYPES = ["store_traffic", "store_action"] as const;

const DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const toYMD = (d: Date) => d.toISOString().slice(0, 10);

/** 시작 순위 → 목표 순위로 완만히 내려오는 곡선 (같은 키워드는 항상 같은 값) */
function trend(startRank: number, endRank: number, seed: number) {
  const out: number[] = [];
  for (let i = 0; i < DAYS; i++) {
    const t = i / (DAYS - 1);
    const base = startRank + (endRank - startRank) * t;
    // 가장자리는 고정하고 중간만 살짝 흔들어 자연스럽게
    const noise = i === 0 || i === DAYS - 1 ? 0 : Math.round(Math.sin((i + seed) * 1.3) * 0.9);
    out.push(Math.max(1, Math.round(base) + noise));
  }
  return out;
}

const rows = await db
  .select({
    userId: campaigns.userId,
    keyword: sql<string>`${campaigns.inputs}->>'keyword'`,
    storeName: sql<string>`coalesce(${campaigns.inputs}->>'storeName', ${campaigns.inputs}->>'productName')`,
    targetUrl: sql<string>`coalesce(${campaigns.inputs}->>'placeUrl', ${campaigns.inputs}->>'productUrl')`,
    productType: products.productType,
  })
  .from(campaigns)
  .leftJoin(products, eq(campaigns.productId, products.id))
  .where(
    and(
      isNull(products.reviewType),
      or(
        inArray(products.category, ["reward_place", "reward_shopping"]),
        and(
          isNull(products.category),
          inArray(products.productType, [...PLACE_TYPES, ...SHOPPING_TYPES]),
        ),
      ),
    ),
  );

const today = new Date();
let made = 0;

for (const [idx, r] of rows.entries()) {
  if (!r.keyword) continue;
  const platform = (PLACE_TYPES as readonly string[]).includes(r.productType ?? "") ? "place" : "shopping";

  // 키워드 행 확보 (없으면 생성)
  const found = await db
    .select({ id: rankKeywords.id })
    .from(rankKeywords)
    .where(
      and(
        eq(rankKeywords.userId, r.userId),
        eq(rankKeywords.keyword, r.keyword),
        eq(rankKeywords.platform, platform),
      ),
    )
    .limit(1);

  const startRank = 22 + ((idx * 7) % 18); // 22 ~ 39
  const endRank = 1 + (idx % 6); // 1 ~ 6
  const series = trend(startRank, endRank, idx);
  const current = series[series.length - 1];
  const previous = series[series.length - 2];

  let keywordId = found[0]?.id;
  if (keywordId) {
    await db
      .update(rankKeywords)
      .set({ currentRank: current, previousRank: previous, lastCheckedAt: today })
      .where(eq(rankKeywords.id, keywordId));
  } else {
    const [created] = await db
      .insert(rankKeywords)
      .values({
        userId: r.userId,
        platform,
        keyword: r.keyword,
        targetName: r.storeName ?? null,
        targetUrl: r.targetUrl ?? null,
        currentRank: current,
        previousRank: previous,
        lastCheckedAt: today,
      })
      .returning({ id: rankKeywords.id });
    keywordId = created.id;
  }

  // 기존 이력은 지우고 다시 채운다 (여러 번 돌려도 중복되지 않게)
  await db.delete(rankSnapshots).where(eq(rankSnapshots.keywordId, keywordId));
  await db.insert(rankSnapshots).values(
    series.map((rank, i) => ({
      keywordId: keywordId!,
      snapshotDate: toYMD(new Date(today.getTime() - (DAYS - 1 - i) * DAY_MS)),
      rank,
    })),
  );

  made++;
  console.log(`  ${platform.padEnd(8)} ${r.keyword.padEnd(14)} ${startRank}위 → ${current}위`);
}

console.log(`\n순위 이력 생성 완료: 키워드 ${made}개 × ${DAYS}일`);
process.exit(0);
