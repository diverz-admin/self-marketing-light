import RankBoard from "@/components/marketing/RankBoard";
import { loadRankBoard, type RankPlatformKey } from "@/lib/rank-board";

/** 통합순위관리 화면 — 채널 탭·분포·순위 목록을 한 페이지에 둔다 */
export async function RankSection({ initialPlatform }: { initialPlatform?: RankPlatformKey }) {
  const data = await loadRankBoard();
  return <RankBoard data={data} initialPlatform={initialPlatform} />;
}
