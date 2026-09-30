import { viewerId } from "@/lib/viewer";
import { loadAdminCartItems } from "@/lib/admin-cart-items";
import { loadHolidayCalendar } from "@/lib/holidays";
import CartClient from "./CartClient";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  // 관리자가 상담 후 담아준 건은 서버에 있다 (고객이 담은 리워드는 브라우저에만 있다)
  const userId = await viewerId();
  // CS-03 예상 집행일(PU-02)은 브라우저에서 계산하므로 공휴일을 내려보낸다
  const [adminItems, holidayCal] = await Promise.all([
    loadAdminCartItems(userId),
    loadHolidayCalendar(),
  ]);

  return <CartClient adminItems={adminItems} holidays={holidayCal.dates} />;
}
