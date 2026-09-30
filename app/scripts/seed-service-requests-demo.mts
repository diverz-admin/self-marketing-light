// 고객 화면 "서비스 신청내역" 확인용 임시 데이터.
//
// 추가 서비스 상담 신청이 아직 쌓이지 않아 화면이 비어 있어 확인이 안 돼서 넣는다.
// 상태 6가지(신청접수·상담중·견적발송·진행중·완료·취소)가 모두 한 번씩 보이게 구성했다.
//
// 고객 화면은 "로그인한 회원 본인의 신청"만 보여준다.
// 로그인이 걷힌 상태로 보면 viewerId() 가 잡는 가장 먼저 만들어진 회원 앞으로 데이터가 있어야 뜬다.
//
// 실행:      node --env-file=.env.local ./node_modules/.bin/tsx scripts/seed-service-requests-demo.mts
// 특정 회원: ... scripts/seed-service-requests-demo.mts --email someone@example.com
// 정리:      ... scripts/seed-service-requests-demo.mts --clean
import { db } from "../src/db/index.js";
import { serviceRequests, users } from "../src/db/schema.js";
import { and, asc, eq } from "drizzle-orm";

/** 이 스크립트가 넣은 행을 알아보기 위한 표식 (정리할 때 이 값으로 찾는다) */
const MARKER = "[demo-seed] 서비스 신청내역 임시 데이터";

type Demo = {
  category: "performance" | "viral" | "content";
  serviceKey: string;
  serviceName: string;
  status: "requested" | "reviewing" | "quoted" | "in_progress" | "completed" | "canceled";
  quotedAmount: number;
  /** 며칠 전에 신청했는지 */
  daysAgo: number;
};

const DEMOS: Demo[] = [
  { category: "viral", serviceKey: "cafe", serviceName: "네이버 카페 침투", status: "requested", quotedAmount: 0, daysAgo: 0 },
  { category: "performance", serviceKey: "perf", serviceName: "네이버 SA광고 최적화", status: "reviewing", quotedAmount: 0, daysAgo: 2 },
  { category: "content", serviceKey: "content_detail", serviceName: "상세페이지 제작", status: "quoted", quotedAmount: 790_000, daysAgo: 5 },
  { category: "content", serviceKey: "content_video", serviceName: "영상 제작", status: "in_progress", quotedAmount: 1_990_000, daysAgo: 12 },
  { category: "performance", serviceKey: "ad_refund", serviceName: "네이버 광고비 환급받기", status: "in_progress", quotedAmount: 0, daysAgo: 18 },
  { category: "content", serviceKey: "content", serviceName: "고퀄리티 이미지 제작", status: "completed", quotedAmount: 350_000, daysAgo: 34 },
  { category: "content", serviceKey: "content_home", serviceName: "홈페이지 제작", status: "completed", quotedAmount: 990_000, daysAgo: 58 },
  { category: "content", serviceKey: "content_branding", serviceName: "Total 브랜딩", status: "canceled", quotedAmount: 0, daysAgo: 71 },
];

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
    : await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .orderBy(asc(users.createdAt))
        .limit(1);

  if (!viewer) {
    console.error(wantEmail ? `회원을 찾을 수 없습니다: ${wantEmail}` : "회원이 한 명도 없습니다");
    process.exit(1);
  }

  // 이 스크립트가 넣었던 건은 항상 먼저 지운다 (여러 번 실행해도 쌓이지 않게)
  const removed = await db
    .delete(serviceRequests)
    .where(and(eq(serviceRequests.userId, viewer.id), eq(serviceRequests.adminMemo, MARKER)))
    .returning({ id: serviceRequests.id });

  if (clean) {
    console.log(`정리 완료: ${viewer.name} (${viewer.email}) 임시 신청 ${removed.length}건 삭제`);
    process.exit(0);
  }

  const now = Date.now();
  await db.insert(serviceRequests).values(
    DEMOS.map((d) => {
      const at = new Date(now - d.daysAgo * 24 * 60 * 60 * 1000);
      return {
        userId: viewer.id,
        category: d.category,
        serviceKey: d.serviceKey,
        serviceName: d.serviceName,
        inputs: {},
        quotedAmount: String(d.quotedAmount),
        status: d.status,
        adminMemo: MARKER,
        createdAt: at,
        updatedAt: at,
      };
    }),
  );

  console.log(`완료: ${viewer.name} (${viewer.email}) 앞으로 서비스 신청 ${DEMOS.length}건 등록`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
