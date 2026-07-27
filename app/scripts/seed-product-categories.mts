// 기존 상품에 카테고리를 배정하고, 6개 카테고리가 모두 채워지도록 샘플을 보충한다.
import { db } from "../src/db/index.js";
import { products } from "../src/db/schema.js";
import { eq, sql } from "drizzle-orm";

type Cat =
  | "reward_place"
  | "reward_shopping"
  | "place_blog_distribute"
  | "place_receipt"
  | "shopping_product_provided"
  | "shopping_product_not_provided";

// 기존 상품 → 카테고리
const ASSIGN: [string, Cat][] = [
  ["네이버 플레이스 트래픽", "reward_place"],
  ["네이버 쇼핑 트래픽", "reward_shopping"],
  ["블로그 체험단 리뷰", "place_blog_distribute"],
  ["영수증 방문 리뷰", "place_receipt"],
];

for (const [title, category] of ASSIGN) {
  await db.update(products).set({ category }).where(eq(products.title, title));
}

// 비어 있는 카테고리 보충
const EXTRA: {
  category: Cat;
  title: string;
  description: string;
  productType: "place_traffic" | "store_traffic" | "blog_review" | "visit_review";
  unit: "per_visit_day" | "per_item" | "subscription";
  unitPrice: string;
  channel: string;
  efficiency?: string;
  avgRankUpRate?: string;
  subscriptionInfo?: string;
  estDurationDays?: number;
}[] = [
  {
    category: "shopping_product_provided",
    title: "네이버 쇼핑 제품제공 리뷰",
    description: "구매자에게 제품을 제공하고 실사용 리뷰를 확보합니다.",
    productType: "blog_review",
    unit: "per_item",
    unitPrice: "18000",
    channel: "shopping",
    estDurationDays: 14,
  },
  {
    category: "shopping_product_not_provided",
    title: "네이버 쇼핑 제품미제공 리뷰",
    description: "제품 제공 없이 리뷰어가 직접 구매 후 리뷰를 작성합니다.",
    productType: "blog_review",
    unit: "per_item",
    unitPrice: "32000",
    channel: "shopping",
    estDurationDays: 14,
  },
  {
    category: "reward_place",
    title: "플레이스 저장하기 리워드",
    description: "플레이스 저장·공유 액션으로 지표를 끌어올립니다.",
    productType: "place_traffic",
    unit: "per_visit_day",
    unitPrice: "1200",
    channel: "place",
    efficiency: "88",
    avgRankUpRate: "9.5",
    subscriptionInfo: "월 구독 / 30일 자동 연장",
  },
  {
    category: "reward_shopping",
    title: "네이버 쇼핑 찜하기 리워드",
    description: "상품 찜·장바구니 액션 기반 리워드 캠페인.",
    productType: "store_traffic",
    unit: "per_visit_day",
    unitPrice: "1500",
    channel: "shopping",
    efficiency: "82",
    avgRankUpRate: "11.0",
    subscriptionInfo: "월 구독",
  },
  {
    category: "place_blog_distribute",
    title: "플레이스 블로그배포 (기자단)",
    description: "블로그 기자단을 통해 플레이스 노출을 확대합니다.",
    productType: "blog_review",
    unit: "per_item",
    unitPrice: "28000",
    channel: "place",
    estDurationDays: 10,
  },
  {
    category: "place_receipt",
    title: "플레이스 영수증리뷰 (대량)",
    description: "영수증 인증 기반 방문 리뷰를 대량으로 확보합니다.",
    productType: "visit_review",
    unit: "per_item",
    unitPrice: "11000",
    channel: "place",
    estDurationDays: 21,
  },
];

for (const e of EXTRA) {
  const existing = await db.select({ id: products.id }).from(products).where(eq(products.title, e.title)).limit(1);
  if (existing.length) {
    await db.update(products).set({ category: e.category }).where(eq(products.id, existing[0].id));
    continue;
  }
  await db.insert(products).values({
    category: e.category,
    productType: e.productType,
    title: e.title,
    description: e.description,
    unit: e.unit,
    unitPrice: e.unitPrice,
    channel: e.channel,
    efficiency: e.efficiency ?? null,
    avgRankUpRate: e.avgRankUpRate ?? null,
    subscriptionInfo: e.subscriptionInfo ?? null,
    estDurationDays: e.estDurationDays ?? null,
    formSchema: {},
  });
}

const summary = await db.execute<{ category: string | null; c: number }>(sql`
  select category::text as category, count(*)::int as c
  from ${products} group by 1 order by 1 nulls last
`);
console.log("카테고리별 상품 수:");
for (const r of summary) console.log(`  ${String(r.category ?? "(미분류)").padEnd(32)} ${r.c}개`);
process.exit(0);
