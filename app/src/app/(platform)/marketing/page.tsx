import { loadDashboardNotices } from "@/lib/dashboard-notices";
import DashboardView from "./DashboardView";

export const dynamic = "force-dynamic";

export default async function MarketingDashboardPage() {
  // 공지 위젯도 어드민 "공지사항"에 발행된 글을 그대로 보여준다
  const notices = await loadDashboardNotices();

  return <DashboardView notices={notices} />;
}
