// seed-admin-sample.mts 로 넣은 샘플 데이터를 되돌린다.
// 어드민 신규 테이블만 비우며, 기존 users/campaigns/orders/products 등은 건드리지 않는다.
import { db } from "../src/db/index.js";
import {
  memberProfiles,
  pointCharges, coupons, couponRedemptions, notices, boardPosts,
  rankKeywords, pricingRules, guaranteedCampaigns, campaignExtensions,
  reviewCampaigns, reviewTasks, serviceRequests,
} from "../src/db/schema.js";

// FK 의존 순서대로 삭제
await db.delete(reviewTasks);
await db.delete(reviewCampaigns);
await db.delete(couponRedemptions);
await db.delete(coupons);
await db.delete(campaignExtensions);
await db.delete(guaranteedCampaigns);
await db.delete(pointCharges);
await db.delete(rankKeywords);
await db.delete(pricingRules);
await db.delete(notices);
await db.delete(boardPosts);
await db.delete(serviceRequests);
await db.delete(memberProfiles);

console.log("샘플 데이터 삭제 완료");
process.exit(0);
