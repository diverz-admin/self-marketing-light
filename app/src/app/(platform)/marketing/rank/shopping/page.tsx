import { redirect } from "next/navigation";

/* 개발본은 통합순위관리를 한 화면(채널 탭)으로 둔다 — 예전 채널별 주소는 탭으로 보낸다 */
export default function Page() {
  redirect("/marketing/rank?p=shopping");
}
