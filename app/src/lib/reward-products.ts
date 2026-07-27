import { db } from "@/db";
import { products } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { TIER_COLOR, tiersFor } from "@/lib/admin-format";

/** 고객 신청 화면의 상품 카드 — 각 신청 폼의 RewardProduct 와 같은 모양 */
export type RewardCardProduct = {
  id: string;
  name: string;
  desc: string;
  sale: boolean;
  recommended: boolean;
  bg: string;
  initial: string;
  price: number;
  efficiency: number;
  riseRate: number;
  trend: number[];
};

export type RewardCardGroup = { category: string; color: string; items: RewardCardProduct[] };

type RewardCategory = "reward_place" | "reward_shopping" | "reward_coupang";

/**
 * 상승 전/후 순위만 저장하므로, 카드의 추이 그래프는 두 값 사이를 이어 만든다.
 * (실제 일자별 이력이 쌓이면 rank_snapshots 로 대체할 수 있다)
 */
function trendBetween(before: number | null, after: number | null): number[] {
  if (before == null || after == null) return [];
  const steps = 6;
  return Array.from({ length: steps }, (_, i) =>
    Math.max(1, Math.round(before + ((after - before) * i) / (steps - 1))),
  );
}

/**
 * 어드민 "리워드 상품등록"에 등록된 판매중 상품을 카드 묶음별로 내려준다.
 * 묶음을 고르지 않은 상품은 화면에서 빠지지 않도록 첫 묶음으로 보낸다.
 */
export async function loadRewardProductGroups(category: RewardCategory): Promise<RewardCardGroup[]> {
  const rows = await db
    .select({
      id: products.id,
      title: products.title,
      subtitle: products.subtitle,
      tier: products.tier,
      badgeInitial: products.badgeInitial,
      badgeColor: products.badgeColor,
      unitPrice: products.unitPrice,
      efficiency: products.efficiency,
      rankUpUserRate: products.rankUpUserRate,
      rankBefore: products.rankBefore,
      rankAfter: products.rankAfter,
      isSale: products.isSale,
      isRecommended: products.isRecommended,
    })
    .from(products)
    .where(and(eq(products.category, category), eq(products.isActive, true)))
    .orderBy(desc(products.unitPrice));

  const tiers = tiersFor(category);
  const fallbackTier = tiers[0];

  const items = rows.map((p) => ({
    tier: p.tier && tiers.includes(p.tier) ? p.tier : fallbackTier,
    card: {
      id: p.id,
      name: p.title,
      desc: p.subtitle ?? "",
      sale: p.isSale,
      recommended: p.isRecommended,
      bg: p.badgeColor ?? "#0D3473",
      initial: p.badgeInitial ?? p.title.slice(0, 1),
      price: Number(p.unitPrice),
      efficiency: p.efficiency != null ? Number(p.efficiency) : 0,
      riseRate: p.rankUpUserRate != null ? Number(p.rankUpUserRate) : 0,
      trend: trendBetween(p.rankBefore, p.rankAfter),
    } satisfies RewardCardProduct,
  }));

  return tiers
    .map((tier) => ({
      category: tier,
      color: TIER_COLOR[tier] ?? "#0D3473",
      items: items.filter((i) => i.tier === tier).map((i) => i.card),
    }))
    .filter((g) => g.items.length > 0);
}
