// 통합순위관리 멤버십을 "결제된 것처럼" 켜 두는 화면 확인용 시드.
// 결제 원장(credits)은 건드리지 않는다 — 보유 포인트를 깎으면 잔액이 음수로 보인다.
//
// 실행:  npx tsx --env-file=.env.local scripts/seed-rank-membership.mts [email] [--off]
//   --off  이 회원의 멤버십을 만료(expired) 처리해 원래(미가입) 화면으로 되돌린다
import { db } from "../src/db/index.js";
import { rankMemberships, users } from "../src/db/schema.js";
import { desc, eq } from "drizzle-orm";
import { MEMBERSHIP_MONTHLY_FEE, MEMBERSHIP_MONTHS, nextExpiry } from "../src/lib/rank-membership.js";

const args = process.argv.slice(2);
const off = args.includes("--off");
const email = args.find((a) => !a.startsWith("--")) ?? "eggcorp2024@gmail.com";

const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());

const [user] = await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.email, email)).limit(1);
if (!user) {
  console.error(`❌ ${email} 회원을 찾을 수 없습니다.`);
  process.exit(1);
}

const [current] = await db
  .select()
  .from(rankMemberships)
  .where(eq(rankMemberships.userId, user.id))
  .orderBy(desc(rankMemberships.createdAt))
  .limit(1);

if (off) {
  if (!current) {
    console.log(`ℹ️  ${email} 는 멤버십 기록이 없습니다 — 이미 미가입 상태입니다.`);
    process.exit(0);
  }
  await db
    .update(rankMemberships)
    .set({ status: "expired", endDate: today, canceledAt: new Date(), updatedAt: new Date() })
    .where(eq(rankMemberships.id, current.id));
  console.log(`✅ ${email} 멤버십을 만료 처리했습니다 — 미가입 화면으로 돌아갑니다.`);
  process.exit(0);
}

const endDate = nextExpiry(today);

if (current) {
  await db
    .update(rankMemberships)
    .set({
      status: "active",
      paidAt: today,
      startDate: today,
      endDate,
      monthlyFee: String(MEMBERSHIP_MONTHLY_FEE),
      memo: "화면 확인용 시드",
      canceledAt: null,
      updatedAt: new Date(),
    })
    .where(eq(rankMemberships.id, current.id));
} else {
  await db.insert(rankMemberships).values({
    userId: user.id,
    status: "active",
    paidAt: today,
    startDate: today,
    endDate,
    monthlyFee: String(MEMBERSHIP_MONTHLY_FEE),
    memo: "화면 확인용 시드",
  });
}

console.log(`✅ ${user.name}(${email}) 멤버십 이용중 — ${today} ~ ${endDate} (${MEMBERSHIP_MONTHS}개월 · 월 ₩${MEMBERSHIP_MONTHLY_FEE.toLocaleString("ko-KR")})`);
console.log("   되돌리기: npx tsx --env-file=.env.local scripts/seed-rank-membership.mts --off");
process.exit(0);
