import { loadRewardProductGroups } from "@/lib/reward-products";
import ShoppingCampaignForm from "./ShoppingCampaignForm";

export const dynamic = "force-dynamic";

export default async function ShoppingCampaignPage() {
  // 어드민 "리워드 상품등록"(category=reward_shopping)에 등록된 판매중 상품만 노출한다
  const groups = await loadRewardProductGroups("reward_shopping");

  return <ShoppingCampaignForm groups={groups} />;
}
