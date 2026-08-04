import { viewerId } from "@/lib/viewer";
import { todayKST } from "@/lib/admin-format";
import { loadMyRewardCampaigns } from "@/lib/my-reward-campaigns";
import RewardManageView from "@/components/marketing/RewardManageView";

export const dynamic = "force-dynamic";

export default async function ShoppingManagePage() {
  const userId = await viewerId();

  const { items, rankHistory } = await loadMyRewardCampaigns(userId, "shopping");

  return (
    <RewardManageView
      campaigns={items}
      rankHistory={rankHistory}
      today={todayKST()}
      title="네이버 쇼핑 상위노출 캠페인 관리"
      createHref="/marketing/reward/shopping"
    />
  );
}
