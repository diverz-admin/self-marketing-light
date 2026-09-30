// 네이버 플레이스 리뷰 신청(블로그 배포) 확인용 상품 — 개발본 체험 화면과 같은 두 가지.
//   블로그 리뷰 5,000P / 프리미엄 15,000P
// 어드민 "리뷰 상품등록"에서 가격을 넣기 전까지 신청 화면이 「판매 중지」로 보여 확인이 안 돼서 넣는다.
//
// 실행: node --env-file=.env.local ./node_modules/.bin/tsx scripts/seed-place-review-products.mts
// 정리: ... scripts/seed-place-review-products.mts --clean
import { db } from "../src/db/index.js";
import { products } from "../src/db/schema.js";
import { and, eq, inArray } from "drizzle-orm";

const DEMOS = [
  { title: "블로그 리뷰", unitPrice: 5000, costPrice: 3000, maxQty: 100, blogGrade: "준최2~4 일괄 배포" },
  { title: "프리미엄", unitPrice: 15000, costPrice: 9000, maxQty: 30, blogGrade: "준최2~4 일괄 배포" },
];

const where = and(
  eq(products.channel, "place"),
  eq(products.reviewType, "blog_distribute"),
  inArray(products.title, DEMOS.map((d) => d.title)),
);

const removed = await db.delete(products).where(where).returning({ id: products.id });
if (removed.length) console.log(`기존 예시 상품 ${removed.length}건 삭제`);
if (process.argv.includes("--clean")) process.exit(0);

for (const d of DEMOS) {
  await db.insert(products).values({
    productType: "blog_review",
    category: "place_blog_distribute",
    channel: "place",
    reviewType: "blog_distribute",
    title: d.title,
    unit: "per_item",
    unitPrice: String(d.unitPrice),
    costPrice: String(d.costPrice),
    maxQty: d.maxQty,
    blogGrade: d.blogGrade,
    isActive: true,
  });
  console.log(`+ ${d.title} · ${d.unitPrice.toLocaleString()}P / 1건`);
}
process.exit(0);
