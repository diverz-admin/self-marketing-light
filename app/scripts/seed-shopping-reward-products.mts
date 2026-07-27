// 네이버 쇼핑 리워드 매체 상품 — 쇼핑 신청 화면의 상품 카드와 동일하게 구성.
// 실행: npx tsx --env-file=.env.local scripts/seed-shopping-reward-products.mts
import { db } from "../src/db/index.js";
import { products } from "../src/db/schema.js";
import { and, eq } from "drizzle-orm";

type Row = {
  title: string;
  subtitle: string;
  tier: "공통" | "맞집" | "일반";
  initial: string;
  color: string;
  price: string;
  efficiency: string;
  sale?: boolean;
  recommended?: boolean;
  riseRate: string;
  rankBefore: number;
  rankAfter: number;
};

const ROWS: Row[] = [
  { title: "올스타", subtitle: "1일 단위 구독", tier: "공통", initial: "O", color: "#111D37", price: "80", efficiency: "65",
    sale: true, riseRate: "58", rankBefore: 17, rankAfter: 6 },
  { title: "버즈빌", subtitle: "+150여 채널", tier: "공통", initial: "B", color: "#E5484D", price: "120", efficiency: "80",
    riseRate: "73", rankBefore: 18, rankAfter: 3 },
  { title: "nbt", subtitle: "+200여 채널", tier: "공통", initial: "N", color: "#111111", price: "110", efficiency: "75",
    riseRate: "69", rankBefore: 16, rankAfter: 4 },
];

for (const r of ROWS) {
  const values = {
    category: "reward_shopping" as const,
    productType: "store_traffic" as const,
    channel: "shopping",
    title: r.title,
    subtitle: r.subtitle,
    tier: r.tier,
    badgeInitial: r.initial,
    badgeColor: r.color,
    unit: "per_visit_day" as const,
    unitPrice: r.price,
    efficiency: r.efficiency,
    isSale: r.sale ?? false,
    isRecommended: r.recommended ?? false,
    rankUpUserRate: r.riseRate,
    rankBefore: r.rankBefore,
    rankAfter: r.rankAfter,
    minQty: 10,
    isActive: true,
    updatedAt: new Date(),
  };

  const found = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.title, r.title), eq(products.category, "reward_shopping")))
    .limit(1);

  if (found.length) {
    await db.update(products).set(values).where(eq(products.id, found[0].id));
    console.log(`  갱신 ${r.title}`);
  } else {
    await db.insert(products).values({ ...values, formSchema: {} });
    console.log(`  생성 ${r.title}`);
  }
}

console.log("\n네이버 쇼핑 리워드 매체 상품 준비 완료");
process.exit(0);
