import { loadRewardProductGroups } from "@/lib/reward-products";
import CoupangCampaignForm from "./CoupangCampaignForm";

export const dynamic = "force-dynamic";

export default async function CoupangCampaignPage() {
  // 어드민 "리워드 상품등록"(category=reward_coupang)에 등록된 판매중 상품만 노출한다
  const groups = await loadRewardProductGroups("reward_coupang");

  return <CoupangCampaignForm groups={groups} />;
}
