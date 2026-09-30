import "server-only";
import { db } from "@/db";
import { rankKeywords, rankMemberships } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";
import { loadPointBalance } from "@/lib/points";
import {
  FREE_KEYWORD_LIMIT, MEMBERSHIP_MONTHLY_FEE, daysUntilExpiry, isMembershipLive,
} from "@/lib/rank-membership";

export type RankMembershipState = {
  live: boolean;
  endDate: string | null;
  daysLeft: number | null;
  fee: number;
  balance: number;
  keywordCount: number;
  freeLimit: number;
};

/**
 * 통합순위관리 멤버십 현황 — 상단 배너와 목록 잠금이 **같은 판정**을 쓰도록 한곳에서 읽는다.
 * 로그인 전이면 null (배너를 그리지 않고, 목록은 잠그지 않는다).
 */
export async function loadRankMembershipState(): Promise<RankMembershipState | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());

  const [memberships, keywordRows, balance] = await Promise.all([
    db
      .select()
      .from(rankMemberships)
      .where(eq(rankMemberships.userId, user.id))
      .orderBy(desc(rankMemberships.createdAt))
      .limit(1),
    db
      .select({ id: rankKeywords.id })
      .from(rankKeywords)
      .where(and(eq(rankKeywords.userId, user.id), eq(rankKeywords.isActive, true))),
    loadPointBalance(user.id),
  ]);

  const current = memberships[0] ?? null;
  const live = isMembershipLive(current, today);

  return {
    live,
    endDate: live ? current?.endDate ?? null : null,
    daysLeft: live ? daysUntilExpiry(current?.endDate ?? null, today) : null,
    fee: MEMBERSHIP_MONTHLY_FEE,
    balance,
    keywordCount: keywordRows.length,
    freeLimit: FREE_KEYWORD_LIMIT,
  };
}
