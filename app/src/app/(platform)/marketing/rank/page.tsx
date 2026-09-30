import { RankSection } from "@/components/marketing/RankSection";
import type { RankPlatformKey } from "@/lib/rank-board";

export const dynamic = "force-dynamic";

const KEYS: RankPlatformKey[] = ["place", "shopping", "coupang"];

export default async function RankPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p } = await searchParams;
  const initial = KEYS.includes(p as RankPlatformKey) ? (p as RankPlatformKey) : "place";
  return <RankSection initialPlatform={initial} />;
}
