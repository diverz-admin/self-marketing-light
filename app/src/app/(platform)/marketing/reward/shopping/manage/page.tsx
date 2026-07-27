import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { todayKST } from "@/lib/admin-format";
import { loadMyRewardCampaigns } from "@/lib/my-reward-campaigns";
import RewardManageView from "@/components/marketing/RewardManageView";

export const dynamic = "force-dynamic";

export default async function ShoppingManagePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { items, rankHistory } = await loadMyRewardCampaigns(user.id, "shopping");

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
