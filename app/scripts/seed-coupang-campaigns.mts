// 쿠팡 상위노출 신청 확인용 임시 데이터.
//
// 발주 관리의 "쿠팡 상위노출" 탭이 비어 있어 화면을 확인할 수 없어서 넣는다.
// 고객이 신청 화면에서 담는 값과 같은 모양(inputs.productName / productUrl / keyword)으로 만든다.
//
// 실행:  node --env-file=.env.local ./node_modules/.bin/tsx scripts/seed-coupang-campaigns.mts
// 정리:  같은 명령에 --clean 을 붙이면 이 스크립트가 넣은 건만 지운다.
import { db } from "../src/db/index.js";
import { campaigns, products, users } from "../src/db/schema.js";
import { asc, eq, sql } from "drizzle-orm";

/** 이 스크립트가 넣은 행을 알아보기 위한 표식 (inputs 안에 남긴다) */
const MARKER = "demo-seed-coupang";

const YMD = (d: Date) => d.toISOString().slice(0, 10);
const daysFrom = (base: Date, n: number) => {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
};
const today = new Date();

type Demo = {
  productName: string;
  productUrl: string;
  keyword: string;
  dailyQty: number;
  days: number;
  startOffset: number;
  status: "running" | "scheduled" | "completed";
};

const DEMOS: Demo[] = [
  {
    productName: "무선 이어폰 프로",
    productUrl: "https://www.coupang.com/vp/products/1234567890",
    keyword: "무선 이어폰",
    dailyQty: 30,
    days: 14,
    startOffset: -6,
    status: "running",
  },
  {
    productName: "홈트레이닝 매트",
    productUrl: "https://www.coupang.com/vp/products/2345678901",
    keyword: "요가매트",
    dailyQty: 20,
    days: 10,
    startOffset: -3,
    status: "running",
  },
  {
    productName: "캠핑 폴딩 의자",
    productUrl: "https://www.coupang.com/vp/products/3456789012",
    keyword: "캠핑의자",
    dailyQty: 50,
    days: 7,
    startOffset: 2,
    status: "scheduled",
  },
  {
    productName: "유아 원목 책상",
    productUrl: "https://www.coupang.com/vp/products/4567890123",
    keyword: "유아 책상",
    dailyQty: 25,
    days: 12,
    startOffset: -30,
    status: "completed",
  },
];

async function main() {
  const clean = process.argv.includes("--clean");

  // 이 스크립트가 넣었던 건은 항상 먼저 지운다 (여러 번 실행해도 쌓이지 않게)
  const removed = await db
    .delete(campaigns)
    .where(sql`${campaigns.inputs} ->> 'seed' = ${MARKER}`)
    .returning({ id: campaigns.id });
  if (removed.length) console.log(`기존 임시 데이터 ${removed.length}건 삭제`);

  if (clean) {
    console.log("정리만 하고 종료합니다.");
    process.exit(0);
  }

  const coupangProducts = await db
    .select({ id: products.id, title: products.title, unitPrice: products.unitPrice })
    .from(products)
    .where(eq(products.category, "reward_coupang"))
    .orderBy(asc(products.title));

  if (!coupangProducts.length) {
    console.error("쿠팡 상품이 없습니다. 리워드 상품등록에서 먼저 만들어 주세요.");
    process.exit(1);
  }

  const memberRows = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .orderBy(asc(users.createdAt))
    .limit(10);

  if (!memberRows.length) {
    console.error("회원이 없습니다.");
    process.exit(1);
  }

  for (const [i, d] of DEMOS.entries()) {
    // 상품·광고주를 골고루 섞어 목록이 한쪽으로 쏠리지 않게 한다
    const product = coupangProducts[i % coupangProducts.length];
    const member = memberRows[i % memberRows.length];
    const start = daysFrom(today, d.startOffset);
    const end = daysFrom(start, d.days - 1);
    const totalQty = d.dailyQty * d.days;

    await db.insert(campaigns).values({
      userId: member.id,
      productId: product.id,
      status: d.status,
      inputs: {
        seed: MARKER,
        productName: d.productName,
        productUrl: d.productUrl,
        keyword: d.keyword,
      },
      dailyQty: d.dailyQty,
      totalQty,
      startDate: YMD(start),
      endDate: YMD(end),
      quotedAmount: String(Number(product.unitPrice) * totalQty),
      paidAmount: "0",
    });

    console.log(`+ ${d.productName} · ${d.keyword} — ${product.title} · 일 ${d.dailyQty} × ${d.days}일 (${member.name})`);
  }

  console.log(`\n완료: 쿠팡 상위노출 ${DEMOS.length}건 등록`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
