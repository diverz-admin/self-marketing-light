import { PageTitle } from "@/components/admin/ui";
import { parsePeriod } from "@/lib/period-filter";
import { loadCampaignData } from "../loadCampaigns";
import { CampaignsClient } from "../CampaignsClient";

export const dynamic = "force-dynamic";

export default async function AdminPlaceCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const period = parsePeriod(await searchParams);
  const { data, extensions, years } = await loadCampaignData("place", period);

  return (
    <div>
      <PageTitle
        title="플레이스 상위노출 관리"
        description="네이버 플레이스 상위노출 캠페인을 셋팅하고 구동합니다. 연장 신청도 여기서 처리합니다."
      />
      <CampaignsClient platform="place" rows={data} extensions={extensions} years={years} period={period} />
    </div>
  );
}
