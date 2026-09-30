import { viewerId } from "@/lib/viewer";
import { todayKST } from "@/lib/admin-format";
import { loadMyCampaigns } from "@/lib/my-campaigns";
import MyCampaignsView from "./MyCampaignsView";

export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function MyCampaignsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const [userId, sp] = await Promise.all([viewerId(), searchParams]);
  const campaigns = await loadMyCampaigns(userId);

  return (
    <MyCampaignsView
      campaigns={campaigns}
      today={todayKST()}
      initial={{
        plat: one(sp.plat),
        kind: one(sp.kind),
        status: one(sp.status),
        period: one(sp.period),
        from: one(sp.from),
        to: one(sp.to),
      }}
    />
  );
}
