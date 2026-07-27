// 어드민 신규 화면 확인용 샘플 데이터.
// 되돌리려면: npx tsx --env-file=.env.local scripts/clear-admin-sample.mts
import { db } from "../src/db/index.js";
import {
  users, campaigns, orders, pointCharges, coupons, couponRedemptions, notices,
  boardPosts, rankKeywords, pricingRules, guaranteedCampaigns, campaignExtensions,
  reviewCampaigns, reviewTasks, serviceRequests,
} from "../src/db/schema.js";
import { eq } from "drizzle-orm";

const userRows = await db.select().from(users).where(eq(users.role, "advertiser"));
if (userRows.length < 4) throw new Error("광고주 회원이 부족합니다.");
const [u1, u2, u3, u4, u5, u6] = userRows;

const campaignRows = await db.select().from(campaigns).limit(3);
const orderRows = await db.select().from(orders).limit(3);

const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

// ── 포인트충전 ──
await db.insert(pointCharges).values([
  { userId: u1.id, amount: "500000", bonusAmount: "50000", method: "bank_transfer", depositorName: "김서준", receiptType: "tax_invoice", status: "requested" },
  { userId: u2.id, amount: "1000000", bonusAmount: "150000", method: "bank_transfer", depositorName: "이하윤", receiptType: "tax_invoice", status: "requested" },
  { userId: u3.id, amount: "300000", bonusAmount: "0", method: "card", receiptType: "cash_receipt", status: "approved", processedAt: new Date() },
  { userId: u4.id, amount: "2000000", bonusAmount: "400000", method: "virtual_account", depositorName: "최지우", receiptType: "tax_invoice", status: "approved", processedAt: new Date() },
  { userId: u5.id, amount: "100000", bonusAmount: "0", method: "bank_transfer", depositorName: "정민서", status: "rejected", memo: "입금 확인 불가", processedAt: new Date() },
]);

// ── 쿠폰 ──
const couponRows = await db.insert(coupons).values([
  { code: "WELCOME10", name: "신규가입 1만원 할인", description: "첫 캠페인 결제 시 사용 가능", discountType: "amount", discountValue: "10000", minOrderAmount: "50000", totalQuota: 500, issuedCount: 312, usedCount: 187, startsAt: new Date("2026-01-01"), endsAt: new Date("2026-12-31") },
  { code: "SPRING15", name: "봄맞이 15% 할인", description: "리워드 상품 전용", discountType: "percent", discountValue: "15", minOrderAmount: "100000", maxDiscountAmount: "50000", totalQuota: 200, issuedCount: 168, usedCount: 94, startsAt: new Date("2026-03-01"), endsAt: new Date("2026-05-31") },
  { code: "REVIEW5000", name: "리뷰 캠페인 5천원 할인", discountType: "amount", discountValue: "5000", minOrderAmount: "30000", issuedCount: 421, usedCount: 265 },
  { code: "VIP20", name: "VIP 20% 할인", description: "월 500만원 이상 결제 고객", discountType: "percent", discountValue: "20", minOrderAmount: "1000000", maxDiscountAmount: "300000", totalQuota: 50, issuedCount: 23, usedCount: 11 },
  { code: "OLDEVENT", name: "종료된 이벤트 쿠폰", discountType: "amount", discountValue: "3000", issuedCount: 90, usedCount: 88, isActive: false, endsAt: new Date("2026-02-28") },
]).returning();

await db.insert(couponRedemptions).values([
  { couponId: couponRows[0].id, userId: u1.id, orderId: orderRows[0]?.id ?? null, discountAmount: "10000" },
  { couponId: couponRows[0].id, userId: u2.id, orderId: orderRows[1]?.id ?? null, discountAmount: "10000" },
  { couponId: couponRows[1].id, userId: u3.id, orderId: orderRows[2]?.id ?? null, discountAmount: "45000" },
  { couponId: couponRows[2].id, userId: u4.id, discountAmount: "5000" },
  { couponId: couponRows[3].id, userId: u5.id, discountAmount: "280000" },
  { couponId: couponRows[1].id, userId: u6.id, discountAmount: "50000" },
]);

// ── 공지사항 ──
await db.insert(notices).values([
  { title: "[중요] 4월 정기 점검 안내 (4/15 02:00~05:00)", content: "안정적인 서비스 제공을 위해 정기 점검을 진행합니다. 점검 시간 동안 캠페인 신청 및 결제가 일시 중단됩니다.", category: "maintenance", isPinned: true, viewCount: 1842, publishedAt: new Date() },
  { title: "통합순위관리 기능 오픈 안내", content: "이제 네이버 플레이스·쇼핑·쿠팡 순위를 한 곳에서 추적할 수 있습니다. 키워드 1개는 무료로 제공됩니다.", category: "update", isPinned: true, viewCount: 3201, publishedAt: new Date() },
  { title: "봄맞이 15% 할인 쿠폰 이벤트", content: "3월 한 달간 리워드 상품 결제 시 15% 할인 쿠폰을 드립니다.", category: "event", viewCount: 2517, publishedAt: new Date() },
  { title: "보장형 캠페인 상품 가격 개편 안내", content: "보장 순위 및 기간별 단가가 조정되었습니다.", category: "service", viewCount: 984, publishedAt: new Date() },
  { title: "쿠팡 리워드 서비스 정식 출시", content: "쿠팡 상품 순위 리워드 캠페인을 이용하실 수 있습니다.", category: "update", viewCount: 1573, publishedAt: new Date() },
  { title: "(작성중) 5월 프로모션 기획", content: "내부 검토중인 초안입니다.", category: "event", isPublished: false, viewCount: 0 },
]);

// ── 게시판 ──
await db.insert(boardPosts).values([
  { boardType: "review", title: "플레이스 트래픽 2주 써본 후기", content: "강남 맛집 키워드로 돌렸는데 12위에서 4위까지 올랐습니다.", authorName: "김서준", isPinned: true, viewCount: 892, commentCount: 23 },
  { boardType: "review", title: "영수증 리뷰 캠페인 만족합니다", content: "리뷰어분들 퀄리티가 좋네요.", authorName: "이하윤", viewCount: 431, commentCount: 8 },
  { boardType: "commerce", title: "쿠팡 로켓배송 진입 후기 공유", content: "리워드 캠페인 병행하니 확실히 노출이 늘었습니다.", authorName: "박도윤", viewCount: 1247, commentCount: 41 },
  { boardType: "qna", title: "보장형이랑 일반 리워드 차이가 뭔가요?", content: "둘 중에 뭘 선택해야 할지 모르겠습니다.", authorName: "최지우", viewCount: 318, commentCount: 5 },
  { boardType: "tip", title: "플레이스 키워드 고르는 법 정리", content: "검색량과 경쟁도를 같이 봐야 합니다.", authorName: "정민서", isPinned: true, viewCount: 2104, commentCount: 67 },
  { boardType: "free", title: "다들 마케팅 예산 얼마나 쓰시나요", content: "월 200 정도 쓰는데 적정한지 궁금하네요.", authorName: "강예은", viewCount: 654, commentCount: 32 },
  { boardType: "free", title: "광고성 도배글입니다", content: "차단된 게시글", authorName: "스팸계정", isBlinded: true, viewCount: 12, commentCount: 0 },
]);

// ── 통합순위관리 ──
await db.insert(rankKeywords).values([
  { userId: u1.id, platform: "place", keyword: "강남 맛집", targetName: "미도인 강남점", targetUrl: "https://map.naver.com/", isPaid: false, currentRank: 4, previousRank: 12, lastCheckedAt: new Date() },
  { userId: u1.id, platform: "place", keyword: "역삼 파스타", targetName: "미도인 강남점", isPaid: true, monthlyFee: "30000", currentRank: 7, previousRank: 5, lastCheckedAt: new Date() },
  { userId: u1.id, platform: "place", keyword: "강남역 저녁", targetName: "미도인 강남점", isPaid: true, monthlyFee: "30000", currentRank: 15, previousRank: 15, lastCheckedAt: new Date() },
  { userId: u2.id, platform: "shopping", keyword: "무선 이어폰", targetName: "사운드랩 프로", isPaid: false, currentRank: 9, previousRank: 22, lastCheckedAt: new Date() },
  { userId: u2.id, platform: "shopping", keyword: "블루투스 이어폰 가성비", targetName: "사운드랩 프로", isPaid: true, monthlyFee: "40000", currentRank: 3, previousRank: 8, lastCheckedAt: new Date() },
  { userId: u3.id, platform: "coupang", keyword: "캠핑 의자", targetName: "아웃도어랩 체어", isPaid: false, currentRank: 11, previousRank: 6, lastCheckedAt: new Date() },
  { userId: u3.id, platform: "coupang", keyword: "접이식 캠핑의자", targetName: "아웃도어랩 체어", isPaid: true, monthlyFee: "35000", currentRank: 2, previousRank: 4, lastCheckedAt: new Date() },
  { userId: u4.id, platform: "place", keyword: "홍대 카페", targetName: "커피살롱 홍대", isPaid: false, currentRank: 18, previousRank: 31, lastCheckedAt: new Date() },
  // 구글은 순위추적 플랫폼에서 제외됐다 — 플레이스로 대체
  { userId: u5.id, platform: "place", keyword: "서울 요가원", targetName: "요가스튜디오 원", isPaid: true, monthlyFee: "50000", currentRank: 6, previousRank: 9, lastCheckedAt: new Date() },
  { userId: u6.id, platform: "shopping", keyword: "유아 원목 책상", targetName: "리틀우드", isPaid: false, isActive: false },
]);

// ── 금액 설정 (pricing_rules) ──
await db.insert(pricingRules).values([
  { category: "rank", key: "extra_keyword", label: "추가 키워드 (2개째부터)", unitPrice: "30000", unit: "월", sortOrder: 1 },
  { category: "rank", key: "place_keyword", label: "플레이스 키워드", unitPrice: "30000", unit: "월", sortOrder: 2 },
  { category: "rank", key: "shopping_keyword", label: "쇼핑 키워드", unitPrice: "40000", unit: "월", sortOrder: 3 },
  { category: "rank", key: "coupang_keyword", label: "쿠팡 키워드", unitPrice: "35000", unit: "월", sortOrder: 4 },

  { category: "guaranteed", key: "place_top1", label: "플레이스 1위 보장", unitPrice: "35000", unit: "일", sortOrder: 1 },
  { category: "guaranteed", key: "place_top3", label: "플레이스 3위 보장", unitPrice: "22000", unit: "일", sortOrder: 2 },
  { category: "guaranteed", key: "shopping_top1", label: "쇼핑 1위 보장", unitPrice: "48000", unit: "일", sortOrder: 3 },
  { category: "guaranteed", key: "extension_daily", label: "연장 단가", unitPrice: "20000", unit: "일", sortOrder: 4 },

  { category: "place_review", key: "blog_distribute", label: "블로그 배포", unitPrice: "35000", unit: "건", sortOrder: 1 },
  { category: "place_review", key: "receipt", label: "영수증 리뷰", unitPrice: "12000", unit: "건", sortOrder: 2 },
  { category: "place_review", key: "visitor", label: "방문자 리뷰", unitPrice: "9000", unit: "건", sortOrder: 3 },
  { category: "place_review", key: "reservation", label: "예약자 리뷰", unitPrice: "15000", unit: "건", sortOrder: 4 },
  { category: "place_review", key: "blog_experience", label: "블로그 체험단", unitPrice: "45000", unit: "건", sortOrder: 5 },
  { category: "place_review", key: "blog_reporter", label: "블로그 기자단", unitPrice: "28000", unit: "건", sortOrder: 6 },

  { category: "shopping_review", key: "naver_product_provided", label: "네이버쇼핑 · 제품 제공", unitPrice: "18000", unit: "건", sortOrder: 1 },
  { category: "shopping_review", key: "naver_product_not_provided", label: "네이버쇼핑 · 제품 미제공", unitPrice: "32000", unit: "건", sortOrder: 2 },
  { category: "shopping_review", key: "coupang_product_provided", label: "쿠팡 · 제품 제공", unitPrice: "16000", unit: "건", sortOrder: 3 },
  { category: "shopping_review", key: "coupang_product_not_provided", label: "쿠팡 · 제품 미제공", unitPrice: "29000", unit: "건", sortOrder: 4 },
]);

// ── 보장형 캠페인 ──
const guaranteedRows = await db.insert(guaranteedCampaigns).values([
  { userId: u1.id, platform: "place", keyword: "강남 맛집", targetName: "미도인 강남점", targetUrl: "https://map.naver.com/", targetRank: 3, guaranteedDays: 30, achievedDays: 0, status: "requested", amount: "660000" },
  { userId: u2.id, platform: "shopping", keyword: "무선 이어폰", targetName: "사운드랩 프로", targetRank: 1, guaranteedDays: 30, achievedDays: 0, status: "reviewing", amount: "1440000" },
  { userId: u3.id, platform: "place", keyword: "홍대 브런치", targetName: "커피살롱 홍대", targetRank: 1, guaranteedDays: 30, achievedDays: 3, currentRank: 5, startDate: daysFromNow(-3), endDate: daysFromNow(27), status: "setting", amount: "1050000" },
  { userId: u4.id, platform: "place", keyword: "성수 디저트", targetName: "스위트랩", targetRank: 3, guaranteedDays: 60, achievedDays: 41, currentRank: 2, startDate: daysFromNow(-45), endDate: daysFromNow(15), status: "running", amount: "1320000" },
  { userId: u5.id, platform: "coupang", keyword: "캠핑 의자", targetName: "아웃도어랩 체어", targetRank: 1, guaranteedDays: 30, achievedDays: 30, currentRank: 1, startDate: daysFromNow(-40), endDate: daysFromNow(-10), status: "completed", amount: "1440000" },
]).returning();

// ── 리뷰/체험단 캠페인 ──
const reviewRows = await db.insert(reviewCampaigns).values([
  // 플레이스
  { userId: u1.id, platform: "place", reviewType: "blog_distribute", storeName: "미도인 강남점", keyword: "강남 맛집", targetUrl: "https://map.naver.com/", totalQty: 20, unitPrice: "35000", totalAmount: "700000", status: "requested", requestNote: "20~30대 타겟 블로거 위주로 부탁드립니다." },
  { userId: u2.id, platform: "place", reviewType: "receipt", storeName: "커피살롱 홍대", keyword: "홍대 카페", totalQty: 50, unitPrice: "12000", totalAmount: "600000", status: "paid" },
  { userId: u3.id, platform: "place", reviewType: "receipt", storeName: "스위트랩 성수", keyword: "성수 디저트", totalQty: 30, completedQty: 0, unitPrice: "12000", totalAmount: "360000", startDate: daysFromNow(-5), endDate: daysFromNow(25), status: "setting", setting: { guide: "방문 후 영수증 사진과 함께 솔직한 후기를 남겨주세요.", mission: "메뉴 2개 이상 주문 / 사진 3장 이상", provideDetail: "" } },
  { userId: u4.id, platform: "place", reviewType: "blog_experience", storeName: "요가스튜디오 원", keyword: "서울 요가원", totalQty: 10, unitPrice: "45000", totalAmount: "450000", startDate: daysFromNow(-12), endDate: daysFromNow(18), status: "running", setting: { guide: "1일 체험 후 상세 후기 작성", mission: "사진 5장 이상 / 1500자 이상", provideDetail: "1회 체험권 (5만원 상당)" } },
  { userId: u5.id, platform: "place", reviewType: "visitor", storeName: "미도인 역삼점", totalQty: 40, unitPrice: "9000", totalAmount: "360000", startDate: daysFromNow(-40), endDate: daysFromNow(-10), status: "completed" },
  // 쇼핑
  { userId: u2.id, platform: "naver_shopping", reviewType: "product_provided", storeName: "사운드랩 프로 이어폰", keyword: "무선 이어폰", totalQty: 25, unitPrice: "18000", totalAmount: "450000", status: "requested", requestNote: "제품은 저희가 직접 발송합니다." },
  { userId: u6.id, platform: "naver_shopping", reviewType: "product_not_provided", storeName: "리틀우드 원목책상", keyword: "유아 원목 책상", totalQty: 15, unitPrice: "32000", totalAmount: "480000", status: "paid" },
  { userId: u3.id, platform: "coupang", reviewType: "product_provided", storeName: "아웃도어랩 캠핑체어", keyword: "캠핑 의자", totalQty: 30, unitPrice: "16000", totalAmount: "480000", startDate: daysFromNow(-8), endDate: daysFromNow(22), status: "running", setting: { guide: "실사용 사진 필수", mission: "별점 5점 / 사진 3장", provideDetail: "캠핑체어 1개 (7만원 상당)" } },
  { userId: u4.id, platform: "coupang", reviewType: "product_not_provided", storeName: "홈트레이닝 매트", totalQty: 20, unitPrice: "29000", totalAmount: "580000", status: "recruiting" },
]).returning();

// ── 리뷰 진행현황 (블로그 작성 / 영수증) ──
const settingCampaign = reviewRows[2];   // 스위트랩 영수증
const runningCampaign = reviewRows[3];   // 요가스튜디오 블로그 체험단
const coupangCampaign = reviewRows[7];   // 쿠팡 제품제공

await db.insert(reviewTasks).values([
  { reviewCampaignId: settingCampaign.id, reviewerName: "박리뷰", reviewerContact: "010-1234-5678", status: "approved", receiptUrl: "https://example.com/receipt/1.jpg", scheduledDate: daysFromNow(-3), completedAt: new Date() },
  { reviewCampaignId: settingCampaign.id, reviewerName: "김방문", reviewerContact: "010-2345-6789", status: "submitted", receiptUrl: "https://example.com/receipt/2.jpg", scheduledDate: daysFromNow(-1) },
  { reviewCampaignId: settingCampaign.id, reviewerName: "이체험", reviewerContact: "010-3456-7890", status: "assigned", scheduledDate: daysFromNow(2) },
  { reviewCampaignId: settingCampaign.id, status: "waiting" },

  { reviewCampaignId: runningCampaign.id, reviewerName: "한블로거", reviewerContact: "010-4567-8901", status: "approved", postUrl: "https://blog.naver.com/sample/1", scheduledDate: daysFromNow(-8), completedAt: new Date() },
  { reviewCampaignId: runningCampaign.id, reviewerName: "정포스팅", reviewerContact: "010-5678-9012", status: "approved", postUrl: "https://blog.naver.com/sample/2", scheduledDate: daysFromNow(-5), completedAt: new Date() },
  { reviewCampaignId: runningCampaign.id, reviewerName: "최작가", reviewerContact: "010-6789-0123", status: "writing", scheduledDate: daysFromNow(3) },
  { reviewCampaignId: runningCampaign.id, reviewerName: "윤리뷰", reviewerContact: "010-7890-1234", status: "rejected", postUrl: "https://blog.naver.com/sample/4", memo: "가이드 미준수 — 재작성 요청" },

  { reviewCampaignId: coupangCampaign.id, reviewerName: "강구매", status: "approved", postUrl: "https://coupang.com/review/1", completedAt: new Date() },
  { reviewCampaignId: coupangCampaign.id, reviewerName: "조사용", status: "writing", scheduledDate: daysFromNow(4) },
]);

// 승인 건수를 캠페인 완료 수량에 반영
for (const c of [settingCampaign, runningCampaign, coupangCampaign]) {
  const [row] = await db
    .select({ done: (await import("drizzle-orm")).sql<number>`count(*) filter (where status = 'approved')::int` })
    .from(reviewTasks)
    .where(eq(reviewTasks.reviewCampaignId, c.id));
  await db.update(reviewCampaigns).set({ completedQty: row?.done ?? 0 }).where(eq(reviewCampaigns.id, c.id));
}

// ── 연장 신청 ──
await db.insert(campaignExtensions).values([
  ...(campaignRows[0] ? [{ targetType: "campaign" as const, targetId: campaignRows[0].id, userId: campaignRows[0].userId, addDays: 30, addQty: 300, amount: "450000", status: "requested" as const, memo: "성과가 좋아 연장 희망합니다." }] : []),
  ...(campaignRows[1] ? [{ targetType: "campaign" as const, targetId: campaignRows[1].id, userId: campaignRows[1].userId, addDays: 15, addQty: 150, amount: "225000", status: "requested" as const }] : []),
  ...(campaignRows[2] ? [{ targetType: "campaign" as const, targetId: campaignRows[2].id, userId: campaignRows[2].userId, addDays: 30, addQty: 300, amount: "450000", status: "approved" as const, processedAt: new Date() }] : []),
  { targetType: "guaranteed", targetId: guaranteedRows[3].id, userId: guaranteedRows[3].userId, addDays: 30, addQty: 0, amount: "600000", status: "requested", memo: "보장 순위 유지 위해 연장 요청" },
  { targetType: "guaranteed", targetId: guaranteedRows[4].id, userId: guaranteedRows[4].userId, addDays: 30, addQty: 0, amount: "1440000", status: "approved", processedAt: new Date() },
  { targetType: "review", targetId: reviewRows[3].id, userId: reviewRows[3].userId, addDays: 14, addQty: 5, amount: "225000", status: "requested" },
  { targetType: "review", targetId: reviewRows[7].id, userId: reviewRows[7].userId, addDays: 10, addQty: 10, amount: "160000", status: "rejected", processedAt: new Date() },
]);

// ── 서비스 신청내역 (퍼포먼스 / 바이럴 / 콘텐츠) ──
await db.insert(serviceRequests).values([
  { userId: u1.id, category: "performance", serviceKey: "meta_ads", serviceName: "메타 광고", inputs: { 업종: "요식업", "월 예산": "300만원", 목표: "매장 방문 증대" }, status: "requested", contact: "010-1111-2222" },
  { userId: u2.id, category: "performance", serviceKey: "naver_cpc", serviceName: "네이버 CPC", inputs: { 상품: "무선 이어폰", "월 예산": "500만원", 목표: "구매 전환" }, status: "reviewing", contact: "010-2222-3333", quotedAmount: "0" },
  { userId: u3.id, category: "performance", serviceKey: "naver_cpc_refund", serviceName: "네이버 CPC 환급형", inputs: { 상품: "캠핑용품", "희망 환급률": "15%" }, status: "quoted", quotedAmount: "3000000", contact: "010-3333-4444", adminMemo: "견적서 발송 완료. 3일 내 회신 예정." },
  { userId: u4.id, category: "viral", serviceKey: "cafe", serviceName: "카페 바이럴", inputs: { 카테고리: "육아", 건수: "50건", 키워드: "유아 책상 추천" }, status: "in_progress", quotedAmount: "1500000", contact: "010-4444-5555" },
  { userId: u5.id, category: "viral", serviceKey: "board", serviceName: "커뮤니티 게시판", inputs: { 커뮤니티: "디시/뽐뿌", 건수: "30건" }, status: "requested", contact: "010-5555-6666" },
  { userId: u6.id, category: "content", serviceKey: "video", serviceName: "영상 제작", inputs: { 유형: "숏폼 3편", 컨셉: "제품 언박싱", 납기: "3주" }, status: "requested", contact: "010-6666-7777" },
  { userId: u1.id, category: "content", serviceKey: "detail", serviceName: "상세페이지", inputs: { 상품수: "2개", 스타일: "미니멀" }, status: "in_progress", quotedAmount: "800000", contact: "010-1111-2222" },
  { userId: u2.id, category: "content", serviceKey: "branding", serviceName: "브랜딩", inputs: { 범위: "로고 + 브랜드 가이드", 업종: "전자기기" }, status: "completed", quotedAmount: "4500000", contact: "010-2222-3333", adminMemo: "최종 산출물 전달 완료." },
  { userId: u3.id, category: "content", serviceKey: "homepage", serviceName: "홈페이지", inputs: { 페이지수: "8페이지", 반응형: "필요" }, status: "canceled", quotedAmount: "6000000" },
]);

console.log("샘플 데이터 삽입 완료");
process.exit(0);
