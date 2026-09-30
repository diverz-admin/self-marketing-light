import { redirect } from "next/navigation";

/* 개발본은 블로그배포·영수증리뷰를 한 관리 화면의 탭으로 본다 */
export default function Page() {
  redirect("/marketing/review/place/manage?type=receipt");
}
