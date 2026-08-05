// 고객 화면 "캠페인 관리" 전체 확인용 임시 데이터.
//
// 아래 화면이 모두 비어 있어 확인이 안 돼서 넣는다.
//   - 리워드마케팅 > [상위노출] 캠페인 관리 (플레이스 / 네이버 쇼핑 / 쿠팡)
//   - 리뷰마케팅 > 네이버 쇼핑 리뷰 관리 (네이버 쇼핑 · 쿠팡 채널을 함께 본다)
// 플레이스 리뷰 관리는 scripts/seed-place-review-demo.mts 가 따로 채운다.
//
// 고객 화면은 "로그인한 회원 본인의 캠페인"만 보여준다.
// 로그인이 걷힌 상태로 보면 viewerId() 가 잡는 가장 먼저 만들어진 회원 앞으로 데이터가 있어야 뜬다.
//
// 실행:      node --env-file=.env.local ./node_modules/.bin/tsx scripts/seed-my-campaigns-demo.mts
// 특정 회원: ... scripts/seed-my-campaigns-demo.mts --email someone@example.com
// 정리:      ... scripts/seed-my-campaigns-demo.mts --clean
import { db } from "../src/db/index.js";
import {
  campaigns,
  products,
  rankKeywords,
  rankSnapshots,
  reviewCampaigns,
  reviewTasks,
  users,
} from "../src/db/schema.js";
import { and, asc, eq, inArray, sql } from "drizzle-orm";

/** 이 스크립트가 넣은 행을 알아보기 위한 표식 (정리할 때 이 값으로 찾는다) */
const CAMPAIGN_MARKER = "demo-seed-my-campaigns";
const REVIEW_MARKER = "[demo-seed] 쇼핑 리뷰 임시 데이터";

const YMD = (d: Date) => d.toISOString().slice(0, 10);
const daysFrom = (base: Date, n: number) => {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
};

const today = new Date();

// ── 리워드 상위노출 캠페인 ──────────────────────────────────────────────

type RewardDemo = {
  platform: "place" | "shopping" | "coupang";
  /** 어드민에 등록된 상품명 — 없으면 같은 카테고리의 첫 상품을 쓴다 */
  productTitle: string;
  targetName: string;
  targetUrl: string;
  keyword: string;
  dailyQty: number;
  days: number;
  startOffset: number;
  status: "running" | "scheduled" | "completed";
  /** 순위 추이 — 시작 순위에서 현재 순위까지 30일간 내려온다 (null = 순위 미측정) */
  rank: { start: number; now: number; prev: number } | null;
};

const REWARDS: RewardDemo[] = [
  // 플레이스
  {
    platform: "place",
    productTitle: "버즈빌",
    targetName: "대박갈비 일산동구청점",
    targetUrl: "https://m.place.naver.com/restaurant/1234567",
    keyword: "일산 갈비",
    dailyQty: 100,
    days: 25,
    startOffset: -8,
    status: "running",
    rank: { start: 14, now: 3, prev: 5 },
  },
  {
    platform: "place",
    productTitle: "골든",
    targetName: "미소네 손칼국수",
    targetUrl: "https://m.place.naver.com/restaurant/2345678",
    keyword: "종로 칼국수",
    dailyQty: 80,
    days: 20,
    startOffset: -3,
    status: "running",
    rank: { start: 12, now: 7, prev: 6 },
  },
  {
    platform: "place",
    productTitle: "세븐",
    targetName: "라온한방차 성수점",
    targetUrl: "https://m.place.naver.com/restaurant/3456789",
    keyword: "성수 카페",
    dailyQty: 60,
    days: 14,
    startOffset: 3,
    status: "scheduled",
    rank: null,
  },
  {
    platform: "place",
    productTitle: "프리마",
    targetName: "청담헤어살롱",
    targetUrl: "https://m.place.naver.com/hairshop/4567890",
    keyword: "청담 미용실",
    dailyQty: 50,
    days: 30,
    startOffset: -45,
    status: "completed",
    rank: { start: 9, now: 2, prev: 2 },
  },
  // 네이버 쇼핑
  {
    platform: "shopping",
    productTitle: "버즈빌",
    targetName: "브이라인 콜라겐 크림 50ml",
    targetUrl: "https://smartstore.naver.com/demo/products/33445566",
    keyword: "콜라겐크림",
    dailyQty: 120,
    days: 21,
    startOffset: -10,
    status: "running",
    rank: { start: 21, now: 6, prev: 9 },
  },
  {
    platform: "shopping",
    productTitle: "올스타",
    targetName: "데일리 프로틴바 30입",
    targetUrl: "https://smartstore.naver.com/demo/products/55667788",
    keyword: "프로틴바",
    dailyQty: 90,
    days: 14,
    startOffset: -2,
    status: "running",
    rank: { start: 18, now: 11, prev: 12 },
  },
  {
    platform: "shopping",
    productTitle: "nbt",
    targetName: "무선 충전 거치대 15W",
    targetUrl: "https://smartstore.naver.com/demo/products/77889900",
    keyword: "무선충전거치대",
    dailyQty: 70,
    days: 10,
    startOffset: 4,
    status: "scheduled",
    rank: null,
  },
  {
    platform: "shopping",
    productTitle: "올스타",
    targetName: "유아 원목 책상 세트",
    targetUrl: "https://smartstore.naver.com/demo/products/99001122",
    keyword: "유아 책상",
    dailyQty: 60,
    days: 20,
    startOffset: -40,
    status: "completed",
    rank: { start: 16, now: 4, prev: 4 },
  },
  // 쿠팡
  {
    platform: "coupang",
    productTitle: "쿠팡 검색 트래픽 리워드",
    targetName: "초경량 무선 청소기",
    targetUrl: "https://www.coupang.com/vp/products/7011223344",
    keyword: "무선청소기",
    dailyQty: 40,
    days: 18,
    startOffset: -7,
    status: "running",
    rank: { start: 25, now: 8, prev: 13 },
  },
  {
    platform: "coupang",
    productTitle: "쿠팡 찜하기 리워드",
    targetName: "프리미엄 보온 텀블러 500ml",
    targetUrl: "https://www.coupang.com/vp/products/7022334455",
    keyword: "텀블러",
    dailyQty: 35,
    days: 12,
    startOffset: -1,
    status: "running",
    rank: { start: 19, now: 14, prev: 15 },
  },
  {
    platform: "coupang",
    productTitle: "쿠팡 검색 트래픽 리워드",
    targetName: "반려견 자동급식기",
    targetUrl: "https://www.coupang.com/vp/products/7033445566",
    keyword: "자동급식기",
    dailyQty: 30,
    days: 10,
    startOffset: 5,
    status: "scheduled",
    rank: null,
  },
];

/** 상품 카테고리 — 고객 화면 SCOPE 와 같은 기준으로 골라야 목록에 뜬다 */
const PRODUCT_CATEGORY = {
  place: "reward_place",
  shopping: "reward_shopping",
  coupang: "reward_coupang",
} as const;

const RANK_DAYS = 30;

/** 시작 순위 → 현재 순위로 완만히 내려오는 곡선 (같은 캠페인은 항상 같은 값) */
function rankTrend(startRank: number, endRank: number, seed: number) {
  return Array.from({ length: RANK_DAYS }, (_, i) => {
    const t = i / (RANK_DAYS - 1);
    const base = startRank + (endRank - startRank) * t;
    // 가장자리는 고정하고 중간만 살짝 흔들어 자연스럽게
    const noise = i === 0 || i === RANK_DAYS - 1 ? 0 : Math.round(Math.sin((i + seed) * 1.3) * 0.9);
    return Math.max(1, Math.round(base) + noise);
  });
}

// ── 쇼핑·쿠팡 리뷰 캠페인 ───────────────────────────────────────────────

type ReviewDemo = {
  platform: "naver_shopping" | "coupang";
  reviewType: "product_provided" | "product_not_provided";
  storeName: string;
  targetUrl: string;
  keyword: string;
  totalQty: number;
  unitPrice: number;
  status: "running" | "recruiting" | "setting" | "completed" | "canceled";
  startOffset: number;
  endOffset: number;
  hashtags: string[];
  requestNote: string;
  /** 등록해 둘 작성 URL 개수 */
  doneUrls: number;
};

const REVIEWS: ReviewDemo[] = [
  {
    platform: "naver_shopping",
    reviewType: "product_provided",
    storeName: "브이라인 콜라겐 크림 체험단",
    targetUrl: "https://smartstore.naver.com/demo/products/33445566",
    keyword: "콜라겐크림추천",
    totalQty: 30,
    unitPrice: 18000,
    status: "running",
    startOffset: -14,
    endOffset: 8,
    hashtags: ["#콜라겐크림", "#안티에이징", "#스킨케어"],
    requestNote: "발림성과 사용 후 2주 변화를 꼭 언급해주세요.",
    doneUrls: 18,
  },
  {
    platform: "naver_shopping",
    reviewType: "product_provided",
    storeName: "홈트 저항밴드 체험단",
    targetUrl: "https://smartstore.naver.com/demo/products/44556677",
    keyword: "저항밴드추천",
    totalQty: 15,
    unitPrice: 18000,
    status: "recruiting",
    startOffset: -4,
    endOffset: 16,
    hashtags: ["#저항밴드", "#홈트레이닝", "#운동용품"],
    requestNote: "강도별(3단계) 사용 예시를 사진으로 담아주세요.",
    doneUrls: 5,
  },
  {
    platform: "naver_shopping",
    reviewType: "product_not_provided",
    storeName: "저자극 유아 이유식 리뷰",
    targetUrl: "https://smartstore.naver.com/demo/products/77889900",
    keyword: "이유식추천",
    totalQty: 20,
    unitPrice: 32000,
    status: "setting",
    startOffset: 3,
    endOffset: 24,
    hashtags: ["#이유식", "#유아식품", "#아기이유식"],
    requestNote: "월령별 급여량 안내를 본문에 넣어주세요.",
    doneUrls: 0,
  },
  {
    platform: "coupang",
    reviewType: "product_provided",
    storeName: "쿠팡 건강기능식품 체험단",
    targetUrl: "https://www.coupang.com/vp/products/7044556677",
    keyword: "건강기능식품추천",
    totalQty: 30,
    unitPrice: 18000,
    status: "running",
    startOffset: -12,
    endOffset: 10,
    hashtags: ["#건강기능식품", "#비타민", "#영양제"],
    requestNote: "섭취 방법과 원료 원산지를 함께 적어주세요.",
    doneUrls: 20,
  },
  {
    platform: "coupang",
    reviewType: "product_not_provided",
    storeName: "쿠팡 주방용품 리뷰",
    targetUrl: "https://www.coupang.com/vp/products/7055667788",
    keyword: "주방용품추천",
    totalQty: 25,
    unitPrice: 32000,
    status: "completed",
    startOffset: -45,
    endOffset: -12,
    hashtags: ["#주방용품", "#쿡웨어", "#조리도구"],
    requestNote: "실사용 조리 사진을 3장 이상 넣어주세요.",
    doneUrls: 25,
  },
  {
    platform: "coupang",
    reviewType: "product_provided",
    storeName: "쿠팡 반려동물 간식 체험단",
    targetUrl: "https://www.coupang.com/vp/products/7066778899",
    keyword: "강아지간식추천",
    totalQty: 12,
    unitPrice: 18000,
    status: "canceled",
    startOffset: -20,
    endOffset: -6,
    hashtags: ["#강아지간식", "#반려동물용품", "#펫푸드"],
    requestNote: "성분표 촬영본을 첨부해주세요.",
    doneUrls: 3,
  },
];

/** 신청 화면(ProductExperienceForm)이 담는 setting 모양 그대로 만든다 */
function reviewSetting(d: ReviewDemo) {
  return {
    channel: d.platform === "coupang" ? "쿠팡" : "네이버 쇼핑",
    selectedType: d.reviewType === "product_provided" ? "제품제공" : "제품미제공",
    titleType: "상품명",
    photoReview: true,
    dailyCount: String(Math.max(1, Math.round(d.totalQty / 7))),
    postingUrl: "",
    hashtags: d.hashtags,
  };
}

// ── 실행 ────────────────────────────────────────────────────────────────

async function main() {
  const clean = process.argv.includes("--clean");
  const wantEmail = process.argv.includes("--email")
    ? process.argv[process.argv.indexOf("--email") + 1]
    : null;

  // --email 로 대상을 고르고, 없으면 로그인 없이 볼 때의 데모 회원(가장 먼저 만들어진 회원)
  const [viewer] = wantEmail
    ? await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(eq(users.email, wantEmail))
        .limit(1)
    : await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .orderBy(asc(users.createdAt))
        .limit(1);

  if (!viewer) {
    console.error(wantEmail ? `${wantEmail} 회원을 찾지 못했습니다.` : "회원이 없습니다.");
    process.exit(1);
  }

  // 이 스크립트가 넣었던 건은 항상 먼저 지운다 (여러 번 실행해도 쌓이지 않게)
  const removedCampaigns = await db
    .delete(campaigns)
    .where(sql`${campaigns.inputs} ->> 'seed' = ${CAMPAIGN_MARKER}`)
    .returning({ id: campaigns.id });

  // rank_snapshots 는 키워드에 걸린 cascade 로 함께 지워진다
  const removedKeywords = await db
    .delete(rankKeywords)
    .where(
      and(
        eq(rankKeywords.userId, viewer.id),
        inArray(rankKeywords.keyword, [...new Set(REWARDS.map((r) => r.keyword))]),
      ),
    )
    .returning({ id: rankKeywords.id });

  const oldReviews = await db
    .select({ id: reviewCampaigns.id })
    .from(reviewCampaigns)
    .where(eq(reviewCampaigns.adminMemo, REVIEW_MARKER));
  if (oldReviews.length) {
    const ids = oldReviews.map((r) => r.id);
    await db.delete(reviewTasks).where(inArray(reviewTasks.reviewCampaignId, ids));
    await db.delete(reviewCampaigns).where(inArray(reviewCampaigns.id, ids));
  }

  if (removedCampaigns.length || removedKeywords.length || oldReviews.length) {
    console.log(
      `기존 임시 데이터 삭제 — 상위노출 ${removedCampaigns.length}건 · 순위키워드 ${removedKeywords.length}건 · 리뷰 ${oldReviews.length}건`,
    );
  }

  if (clean) {
    console.log("정리만 하고 종료합니다.");
    process.exit(0);
  }

  // ── 상위노출 캠페인 ──
  const productRows = await db
    .select({
      id: products.id,
      title: products.title,
      category: products.category,
      unitPrice: products.unitPrice,
    })
    .from(products)
    .where(inArray(products.category, ["reward_place", "reward_shopping", "reward_coupang"]))
    .orderBy(asc(products.title));

  for (const [i, d] of REWARDS.entries()) {
    const category = PRODUCT_CATEGORY[d.platform];
    const inCategory = productRows.filter((p) => p.category === category);
    if (!inCategory.length) {
      console.warn(`! ${category} 상품이 없어 "${d.targetName}" 는 건너뜁니다.`);
      continue;
    }
    const product = inCategory.find((p) => p.title === d.productTitle) ?? inCategory[0];

    const start = daysFrom(today, d.startOffset);
    const end = daysFrom(start, d.days - 1);
    const totalQty = d.dailyQty * d.days;

    await db.insert(campaigns).values({
      userId: viewer.id,
      productId: product.id,
      status: d.status,
      // 플레이스는 storeName/placeUrl, 쇼핑·쿠팡은 productName/productUrl 로 신청된다
      inputs: {
        seed: CAMPAIGN_MARKER,
        keyword: d.keyword,
        ...(d.platform === "place"
          ? { storeName: d.targetName, placeUrl: d.targetUrl }
          : { productName: d.targetName, productUrl: d.targetUrl }),
      },
      dailyQty: d.dailyQty,
      totalQty,
      startDate: YMD(start),
      endDate: YMD(end),
      quotedAmount: String(Number(product.unitPrice) * totalQty),
      paidAmount: "0",
    });

    // 순위·추이는 rank_keywords + rank_snapshots 에서 회원+플랫폼+키워드로 맞춰 온다
    if (d.rank) {
      const [kw] = await db
        .insert(rankKeywords)
        .values({
          userId: viewer.id,
          platform: d.platform,
          keyword: d.keyword,
          targetName: d.targetName,
          targetUrl: d.targetUrl,
          currentRank: d.rank.now,
          previousRank: d.rank.prev,
          lastCheckedAt: today,
        })
        .returning({ id: rankKeywords.id });

      const trend = rankTrend(d.rank.start, d.rank.now, i);
      await db.insert(rankSnapshots).values(
        trend.map((rank, day) => ({
          keywordId: kw.id,
          snapshotDate: YMD(daysFrom(today, day - (RANK_DAYS - 1))),
          rank,
        })),
      );
    }

    console.log(
      `+ [상위노출/${d.platform}] ${d.targetName} · ${d.keyword} — ${product.title} · 일 ${d.dailyQty} × ${d.days}일`,
    );
  }

  // ── 쇼핑·쿠팡 리뷰 캠페인 ──
  for (const d of REVIEWS) {
    const start = daysFrom(today, d.startOffset);
    const end = daysFrom(today, d.endOffset);

    const [campaign] = await db
      .insert(reviewCampaigns)
      .values({
        userId: viewer.id,
        platform: d.platform,
        reviewType: d.reviewType,
        storeName: d.storeName,
        targetUrl: d.targetUrl,
        keyword: d.keyword,
        totalQty: d.totalQty,
        completedQty: d.doneUrls,
        unitPrice: String(d.unitPrice),
        totalAmount: String(d.unitPrice * d.totalQty),
        startDate: YMD(start),
        endDate: YMD(end),
        status: d.status,
        setting: reviewSetting(d),
        requestNote: d.requestNote,
        adminMemo: REVIEW_MARKER,
      })
      .returning({ id: reviewCampaigns.id });

    // 작성 URL — 캠페인 기간 안에서 하루에 5건씩 밀며 채운다
    if (d.doneUrls > 0) {
      await db.insert(reviewTasks).values(
        Array.from({ length: d.doneUrls }, (_, i) => {
          const written = daysFrom(start, Math.floor(i / 5));
          const slug = `${d.keyword.replace(/[^가-힣a-zA-Z0-9]/g, "")}${String(i + 1).padStart(2, "0")}`;
          return {
            reviewCampaignId: campaign.id,
            reviewerName: `리뷰어${String(i + 1).padStart(2, "0")}`,
            status: "approved" as const,
            postUrl: `https://blog.naver.com/demo_${slug}/223${900000 + i}`,
            scheduledDate: YMD(written),
            completedAt: written,
          };
        }),
      );
    }

    console.log(`+ [리뷰/${d.platform}] ${d.storeName} — URL ${d.doneUrls}/${d.totalQty}건`);
  }

  console.log(
    `\n완료: ${viewer.name} (${viewer.email}) 앞으로 상위노출 ${REWARDS.length}건 · 리뷰 ${REVIEWS.length}건 등록`,
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
