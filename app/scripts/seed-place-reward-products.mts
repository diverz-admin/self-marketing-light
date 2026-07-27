// 네이버 플레이스 리워드 상품 — 사용자 상품 선택 화면과 동일하게 구성.
import { db } from "../src/db/index.js";
import { products } from "../src/db/schema.js";
import { and, eq, sql } from "drizzle-orm";

type Row = {
  title: string;
  subtitle: string;
  tier: "공통" | "맞집" | "일반";
  initial: string;
  color: string;
  price: string;
  efficiency: string;   // 막대 길이 = 효율(%)
  sale?: boolean;
  recommended?: boolean;
  rankUpUserRate?: string;
  rankBefore?: number;
  rankAfter?: number;
  cutoff?: string;
  sameDay?: boolean;
  minRunDays?: number;
};

const ROWS: Row[] = [
  // 공통
  { title: "울스타", subtitle: "1일 단위 구독", tier: "공통", initial: "O", color: "#E8590C", price: "80", efficiency: "65", sale: true,
    rankUpUserRate: "61", rankBefore: 15, rankAfter: 6, cutoff: "13:30", sameDay: true, minRunDays: 1 },
  { title: "버즈빌", subtitle: "+150여 채널", tier: "공통", initial: "B", color: "#E5484D", price: "120", efficiency: "80",
    rankUpUserRate: "73", rankBefore: 18, rankAfter: 3, cutoff: "13:30", sameDay: true, minRunDays: 3 },
  { title: "nbt", subtitle: "+200여 채널", tier: "공통", initial: "N", color: "#111D37", price: "110", efficiency: "75",
    rankUpUserRate: "68", rankBefore: 16, rankAfter: 5, cutoff: "13:30", sameDay: true, minRunDays: 3 },

  // 맞집
  { title: "세븐", subtitle: "상세 안내 필독", tier: "맞집", initial: "7", color: "#E8590C", price: "100", efficiency: "42", recommended: true,
    rankUpUserRate: "48", rankBefore: 20, rankAfter: 11, cutoff: "14:00", minRunDays: 5 },
  { title: "앤드류", subtitle: "신규 참메루쓰", tier: "맞집", initial: "엔", color: "#0D3473", price: "95", efficiency: "62",
    rankUpUserRate: "57", rankBefore: 17, rankAfter: 8, cutoff: "14:00", minRunDays: 5 },
  { title: "감귤", subtitle: "맞집 최적화", tier: "맞집", initial: "감", color: "#EDA13F", price: "85", efficiency: "56",
    rankUpUserRate: "54", rankBefore: 19, rankAfter: 9, cutoff: "14:00", minRunDays: 5 },
  { title: "프리마", subtitle: "IP 디타겟팅", tier: "맞집", initial: "P", color: "#5B3FB0", price: "130", efficiency: "86", sale: true, recommended: true,
    rankUpUserRate: "79", rankBefore: 22, rankAfter: 2, cutoff: "13:30", sameDay: true, minRunDays: 3 },
  { title: "골든", subtitle: "신로직 세팅", tier: "맞집", initial: "G", color: "#E8590C", price: "115", efficiency: "68", recommended: true,
    rankUpUserRate: "64", rankBefore: 14, rankAfter: 6, cutoff: "14:00", minRunDays: 4 },

  // 일반
  { title: "원람X", subtitle: "• 11타입 액션", tier: "일반", initial: "X", color: "#111D37", price: "70", efficiency: "34", recommended: true,
    rankUpUserRate: "39", rankBefore: 24, rankAfter: 15, cutoff: "15:00", minRunDays: 7 },
  { title: "골렌", subtitle: "N2장 최적화", tier: "일반", initial: "G", color: "#1E9E54", price: "75", efficiency: "38", recommended: true,
    rankUpUserRate: "42", rankBefore: 21, rankAfter: 13, cutoff: "15:00", minRunDays: 7 },
];

for (const r of ROWS) {
  const values = {
    category: "reward_place" as const,
    productType: "place_traffic" as const,
    unit: "per_visit_day" as const,
    channel: "place",
    title: r.title,
    subtitle: r.subtitle,
    tier: r.tier,
    badgeInitial: r.initial,
    badgeColor: r.color,
    unitPrice: r.price,
    efficiency: r.efficiency,
    isSale: r.sale ?? false,
    isRecommended: r.recommended ?? false,
    rankUpUserRate: r.rankUpUserRate ?? null,
    rankBefore: r.rankBefore ?? null,
    rankAfter: r.rankAfter ?? null,
    orderCutoffTime: r.cutoff ?? null,
    sameDayStart: r.sameDay ?? false,
    minRunDays: r.minRunDays ?? null,
  };

  const found = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.title, r.title), eq(products.category, "reward_place")))
    .limit(1);

  if (found.length) {
    await db.update(products).set({ ...values, updatedAt: new Date() }).where(eq(products.id, found[0].id));
  } else {
    await db.insert(products).values({ ...values, formSchema: {} });
  }
}

const out = await db.execute<{ tier: string; title: string; price: string; eff: string }>(sql`
  select tier, title, unit_price::text as price, efficiency::text as eff
  from ${products} where category = 'reward_place' order by tier, unit_price desc
`);
console.log("네이버 플레이스 리워드 상품:");
for (const x of out) console.log(`  ${String(x.tier ?? "-").padEnd(4)} ${x.title.padEnd(8)} ${x.price}원  효율 ${x.eff}%`);
process.exit(0);
