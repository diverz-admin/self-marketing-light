import { viewerId } from "@/lib/viewer";
import { todayKST } from "@/lib/admin-format";
import { loadMyRewardCampaigns } from "@/lib/my-reward-campaigns";
import PlaceManageView from "./PlaceManageView";

export const dynamic = "force-dynamic";

export default async function PlaceManagePage() {
  const userId = await viewerId();

  const { items, rankHistory } = await loadMyRewardCampaigns(userId, "place");

  return <PlaceManageView campaigns={items} rankHistory={rankHistory} today={todayKST()} />;
}
