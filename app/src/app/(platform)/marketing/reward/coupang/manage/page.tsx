import { viewerId } from "@/lib/viewer";
import { todayKST } from "@/lib/admin-format";
import { loadMyRewardCampaigns } from "@/lib/my-reward-campaigns";
import RewardManageView from "@/components/marketing/RewardManageView";

export const dynamic = "force-dynamic";

export default async function CoupangManagePage() {
  const userId = await viewerId();

  const { items, rankHistory } = await loadMyRewardCampaigns(userId, "coupang");

  return (
    <RewardManageView
      campaigns={items}
      groupScope="reward-coupang"
      rankHistory={rankHistory}
      today={todayKST()}
      title="쿠팡 상위노출 캠페인 관리"
      createHref="/marketing/reward/coupang"
    />
  );
}
