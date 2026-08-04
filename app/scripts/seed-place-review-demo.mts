// 플레이스 리뷰 관리(고객 화면) 확인용 임시 데이터.
//
// 고객 화면은 "로그인한 회원 본인의 캠페인"만 보여준다.
// 로그인 상태로 보면 그 계정, 로그인을 걷어 둔 상태로 보면 viewerId() 가 잡는
// 가장 먼저 만들어진 회원 앞으로 데이터가 있어야 화면에 뜬다.
//
// 실행:  node --env-file=.env.local ./node_modules/.bin/tsx scripts/seed-place-review-demo.mts
// 특정 회원:  ... scripts/seed-place-review-demo.mts --email someone@example.com
// 정리:  ... scripts/seed-place-review-demo.mts --clean
import { db } from "../src/db/index.js";
import { reviewCampaigns, reviewTasks, users } from "../src/db/schema.js";
import { asc, eq, inArray } from "drizzle-orm";

/** 이 스크립트가 넣은 행을 알아보기 위한 표식 (정리할 때 이 값으로 찾는다) */
const MARKER = "[demo-seed] 플레이스 리뷰 임시 데이터";

const YMD = (d: Date) => d.toISOString().slice(0, 10);
const daysFrom = (base: Date, n: number) => {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
};

const today = new Date();

type Demo = {
  reviewType: "blog_distribute" | "receipt";
  storeName: string;
  targetUrl: string;
  keyword: string;
  totalQty: number;
  unitPrice: number;
  status: "running" | "completed" | "setting";
  startOffset: number;
  endOffset: number;
  setting: Record<string, unknown>;
  requestNote: string;
  /** 등록해 둘 작성 URL 개수 */
  doneUrls: number;
};

const DEMOS: Demo[] = [
  {
    reviewType: "blog_distribute",
    storeName: "대박갈비 일산동구청점",
    targetUrl: "https://m.place.naver.com/restaurant/1234567",
    keyword: "일산 갈비",
    totalQty: 35,
    unitPrice: 28000,
    status: "running",
    startOffset: -12,
    endOffset: 6,
    setting: {
      postingType: "후기성",
      hashtags: ["#일산갈비", "#일산동구청맛집", "#대박갈비"],
      businessInfo:
        "- 대표 메뉴: 생갈비, 양념갈비, 갈비탕\n- 이벤트: 점심 갈비탕 세트 20% 할인\n- 영업시간: 11:00~22:00 (브레이크 15:00~17:00, 라스트오더 21:00)\n- 교통: 일산동구청 도보 3분, 건물 주차 2시간 무료",
      postingUrl: "",
      useCustomImage: false,
      issueDays: 7,
      dailyVolume: 5,
    },
    requestNote: "점심 세트 메뉴를 꼭 언급해주세요.",
    doneUrls: 12,
  },
  {
    reviewType: "receipt",
    storeName: "커피살롱 홍대점",
    targetUrl: "https://m.place.naver.com/restaurant/2345678",
    keyword: "홍대 카페",
    totalQty: 50,
    unitPrice: 11000,
    status: "running",
    startOffset: -5,
    endOffset: 5,
    setting: {
      issueDays: 10,
      dailyVolume: 5,
      receiptAttached: true,
      bizNumber: "",
      emphasis: "- 시그니처 메뉴: 흑임자 라떼\n- 2층 좌석 · 콘센트 많음\n- 주말 브런치 세트",
    },
    requestNote: "- 시그니처 메뉴: 흑임자 라떼\n- 2층 좌석 · 콘센트 많음\n- 주말 브런치 세트",
    doneUrls: 18,
  },
  {
    reviewType: "receipt",
    storeName: "온천집 성수점",
    targetUrl: "https://m.place.naver.com/restaurant/3456789",
    keyword: "성수 이자카야",
    totalQty: 30,
    unitPrice: 11000,
    status: "completed",
    startOffset: -40,
    endOffset: -11,
    setting: {
      issueDays: 6,
      dailyVolume: 5,
      receiptAttached: false,
      bizNumber: "123-45-67890",
      emphasis: "사케 페어링 코스를 강조해주세요.",
    },
    requestNote: "사케 페어링 코스를 강조해주세요.",
    doneUrls: 30,
  },
  {
    reviewType: "blog_distribute",
    storeName: "교동짬뽕 홍대점",
    targetUrl: "https://m.place.naver.com/restaurant/4567890",
    keyword: "홍대 짬뽕",
    totalQty: 20,
    unitPrice: 28000,
    status: "setting",
    startOffset: 3,
    endOffset: 6,
    setting: {
      postingType: "정보성",
      hashtags: ["#홍대짬뽕", "#교동짬뽕"],
      businessInfo: "- 대표 메뉴: 백짬뽕, 삼선짬뽕\n- 웨이팅 앱 이용 안내\n- 홍대입구역 3번 출구 도보 5분",
      postingUrl: "https://drive.google.com/drive/folders/demo-folder",
      useCustomImage: true,
      issueDays: 4,
      dailyVolume: 5,
    },
    requestNote: "백짬뽕 위주로 소개해주세요.",
    doneUrls: 0,
  },
];

async function main() {
  const clean = process.argv.includes("--clean");

  // --email 로 대상을 고르고, 없으면 로그인 없이 볼 때의 데모 회원(가장 먼저 만들어진 회원)
  const emailArg = process.argv[process.argv.indexOf("--email") + 1];
  const wantEmail = process.argv.includes("--email") ? emailArg : null;

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
  const existing = await db
    .select({ id: reviewCampaigns.id })
    .from(reviewCampaigns)
    .where(eq(reviewCampaigns.adminMemo, MARKER));

  if (existing.length) {
    const ids = existing.map((r) => r.id);
    await db.delete(reviewTasks).where(inArray(reviewTasks.reviewCampaignId, ids));
    await db.delete(reviewCampaigns).where(inArray(reviewCampaigns.id, ids));
    console.log(`기존 임시 데이터 ${existing.length}건 삭제`);
  }

  if (clean) {
    console.log("정리만 하고 종료합니다.");
    process.exit(0);
  }

  for (const d of DEMOS) {
    const start = daysFrom(today, d.startOffset);
    const end = daysFrom(today, d.endOffset);

    const [campaign] = await db
      .insert(reviewCampaigns)
      .values({
        userId: viewer.id,
        platform: "place",
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
        setting: d.setting,
        requestNote: d.requestNote,
        adminMemo: MARKER,
      })
      .returning({ id: reviewCampaigns.id });

    // 작성 URL — 캠페인 기간 안에서 하루씩 밀며 채운다
    if (d.doneUrls > 0) {
      await db.insert(reviewTasks).values(
        Array.from({ length: d.doneUrls }, (_, i) => {
          const written = daysFrom(start, Math.floor(i / 5));
          return {
            reviewCampaignId: campaign.id,
            reviewerName: `리뷰어${String(i + 1).padStart(2, "0")}`,
            status: "approved" as const,
            postUrl: `https://blog.naver.com/demo/${Date.now()}${i}`,
            receiptUrl: d.reviewType === "receipt" ? `https://example.com/receipt/${i + 1}.jpg` : null,
            scheduledDate: YMD(written),
            completedAt: written,
          };
        }),
      );
    }

    console.log(`+ ${d.storeName} (${d.reviewType}) — URL ${d.doneUrls}/${d.totalQty}건`);
  }

  console.log(`\n완료: ${viewer.name} (${viewer.email}) 앞으로 ${DEMOS.length}건 등록`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
