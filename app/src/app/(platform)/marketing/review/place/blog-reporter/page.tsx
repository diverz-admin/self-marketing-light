import { redirect } from "next/navigation";

/* 개발본은 블로그 배포·영수증 리뷰를 한 신청 화면에서 고른다 — 예전 주소는 그리로 보낸다 */
export default function Page() {
  redirect("/marketing/review/place");
}
