import { db } from "@/db";
import { rankKeywords, rankMemberships } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";
import { loadPointBalance } from "@/lib/points";
import {
  FREE_KEYWORD_LIMIT, MEMBERSHIP_MONTHLY_FEE, daysUntilExpiry, isMembershipLive,
} from "@/lib/rank-membership";
import { RankMembershipPanel } from "./RankMembershipPanel";

/**
 * 통합순위관리 멤버십 현황 — 순위 화면 맨 위에 붙는다.
 *
 * 키워드 1개는 무료이고 2개째부터 멤버십이 필요한데, 그 사실과 결제 수단(포인트)이
 * 화면에 없으면 고객은 왜 더 못 넣는지 알 수 없다. 그래서 순위 목록보다 위에 둔다.
 */
export async function RankMembershipBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

  return (
    <RankMembershipPanel
      live={live}
      endDate={live ? current?.endDate ?? null : null}
      daysLeft={live ? daysUntilExpiry(current?.endDate ?? null, today) : null}
      fee={MEMBERSHIP_MONTHLY_FEE}
      balance={balance}
      keywordCount={keywordRows.length}
      freeLimit={FREE_KEYWORD_LIMIT}
    />
  );
}
