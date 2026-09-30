import { redirect } from "next/navigation";

/* 영수증 리뷰는 상담으로 진행한다 — 신청 화면의 영수증 리뷰 탭으로 보낸다 */
export default function Page() {
  redirect("/marketing/review/place?type=receipt");
}
