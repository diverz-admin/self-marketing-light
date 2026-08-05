import RankManagement from "@/components/marketing/RankManagement";
import { RankMembershipBar } from "@/components/marketing/RankMembershipBar";

// 멤버십 현황은 로그인 상태를 봐야 해서 서버에서 그린다
export const dynamic = "force-dynamic";

export default function RankPage() {
  return (
    <div className="min-h-full bg-white">
      <RankMembershipBar />
      <RankManagement />
    </div>
  );
}
