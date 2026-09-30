import { loadDashboardNotices } from "@/lib/dashboard-notices";
import { loadPointBalance } from "@/lib/points";
import { loadRecentOrders } from "@/lib/recent-orders";
import { loadDashboardCampaigns, type DashboardCampaign } from "@/lib/dashboard-campaigns";
import { loadRankBoard } from "@/lib/rank-board";
import { createClient } from "@/utils/supabase/server";
import DashboardView from "./DashboardView";

export const dynamic = "force-dynamic";

/* 체험(로그인 전) 예시 — 개발본 체험 화면과 같은 값 */
const DEMO_BALANCE = 386_000;
function demoCampaigns(): DashboardCampaign[] {
  const d = (off: number) => {
    const t = new Date();
    t.setDate(t.getDate() + off);
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(t);
  };
  const row = (id: string, targetName: string, channel: string, keyword: string, s: number, e: number, qty: number): DashboardCampaign => ({
    id, targetName, channel, keyword, productTitle: "", statusLabel: "진행중", statusKind: "running", startDate: d(s), endDate: d(e), qty,
  });
  return [
    row("demo-1", "강남 한우담 본점", "네이버 플레이스", "강남 소고기 맛집", -12, 18, 100),
    row("demo-2", "올데이 무선이어폰 P3", "네이버 쇼핑", "무선이어폰 노이즈캔슬링", -5, 25, 300),
    row("demo-3", "연남 베이글하우스", "네이버 플레이스", "연남동 베이글", -3, 27, 80),
    row("demo-4", "데일리 텀블러 500ml", "쿠팡", "보온 텀블러", -20, 10, 150),
  ];
}

export default async function MarketingDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [notices, recentOrders, rank] = await Promise.all([
    // 공지 위젯도 어드민 "공지사항"에 발행된 글을 그대로 보여준다
    loadDashboardNotices(),
    // "실시간 주문 현황" — 최근 접수 캠페인 피드
    loadRecentOrders(),
    // "내 캠페인 순위 추적하기" — 통합순위관리와 같은 목록 (체험이면 예시)
    loadRankBoard(),
  ]);

  const balance = user ? await loadPointBalance(user.id) : DEMO_BALANCE;
  const displayName = (user?.user_metadata?.name as string | undefined) || user?.email?.split("@")[0] || null;

  // "현재 운영중인 캠페인" — 본인 캠페인. 상품·키워드·채널을 함께 내려보낸다.
  const campaignData = user
    ? await loadDashboardCampaigns(user.id, 5)
    : { items: demoCampaigns(), counts: { running: 6, done: 2, total: 9 } };

  return (
    <DashboardView
      notices={notices}
      userName={displayName}
      balance={balance}
      recentOrders={recentOrders}
      myCampaigns={campaignData.items}
      campaignCounts={campaignData.counts}
      rankItems={rank.items}
    />
  );
}
