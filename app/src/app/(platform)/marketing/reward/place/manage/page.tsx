import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { todayKST } from "@/lib/admin-format";
import { loadMyRewardCampaigns } from "@/lib/my-reward-campaigns";
import PlaceManageView from "./PlaceManageView";

export const dynamic = "force-dynamic";

export default async function PlaceManagePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { items, rankHistory } = await loadMyRewardCampaigns(user.id, "place");

  return <PlaceManageView campaigns={items} rankHistory={rankHistory} today={todayKST()} />;
}
