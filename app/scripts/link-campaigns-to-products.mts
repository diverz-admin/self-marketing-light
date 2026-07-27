// 상위노출 캠페인을 실제 상품(버즈빌·프리마 등)에 연결한다.
// 신청 화면이 DB 상품을 쓰기 전에 만들어진 캠페인은 "네이버 플레이스 트래픽" 같은
// 대표 상품에 붙어 있어 어드민 상품 컬럼이 매체를 보여주지 못한다.
// 실행: npx tsx --env-file=.env.local scripts/link-campaigns-to-products.mts
import { db } from "../src/db/index.js";
import { campaigns, products } from "../src/db/schema.js";
import { and, eq, isNotNull, isNull, sql } from "drizzle-orm";

let total = 0;

for (const category of ["reward_place", "reward_shopping"] as const) {
  // 매체 상품 = 카드 묶음(tier)이 지정된 상품
  const media = await db
    .select({ id: products.id, title: products.title, unitPrice: products.unitPrice })
    .from(products)
    .where(and(eq(products.category, category), eq(products.isActive, true), isNotNull(products.tier)))
    .orderBy(products.title);

  if (!media.length) {
    console.log(`${category}: 매체 상품이 없어 건너뜁니다.`);
    continue;
  }

  // 대표 상품(묶음 미지정)에 붙어 있는 캠페인만 대상으로 한다
  const targets = await db
    .select({ id: campaigns.id, keyword: sql<string>`${campaigns.inputs}->>'keyword'` })
    .from(campaigns)
    .innerJoin(products, eq(campaigns.productId, products.id))
    .where(and(eq(products.category, category), isNull(products.tier)));

  for (const [i, c] of targets.entries()) {
    const pick = media[i % media.length];
    await db
      .update(campaigns)
      .set({ productId: pick.id, updatedAt: new Date() })
      .where(eq(campaigns.id, c.id));
    console.log(`  ${(c.keyword ?? "-").padEnd(14)} → ${pick.title} (${Number(pick.unitPrice)}원)`);
  }
  total += targets.length;
}

console.log(`\n캠페인 ${total}건을 매체 상품에 연결했습니다.`);
process.exit(0);
