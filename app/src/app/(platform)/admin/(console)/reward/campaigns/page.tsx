import { redirect } from "next/navigation";

// 상위노출 관리는 플랫폼별 화면으로 나뉘어 있다 — 기존 링크는 플레이스로 보낸다
export default function AdminCampaignsPage() {
  redirect("/admin/reward/campaigns/place");
}
