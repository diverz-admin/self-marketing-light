import { loadRewardProductGroups } from "@/lib/reward-products";
import PlaceCampaignForm from "./PlaceCampaignForm";
import { todayKST } from "@/lib/admin-format";

export const dynamic = "force-dynamic";

export default async function PlaceCampaignPage() {
  // 어드민 "리워드 상품등록"(category=reward_place)에 등록된 판매중 상품만 노출한다
  const groups = await loadRewardProductGroups("reward_place");

  return <PlaceCampaignForm groups={groups} today={todayKST()} />;
}
