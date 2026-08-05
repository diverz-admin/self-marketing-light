import { viewerId } from "@/lib/viewer";
import { loadAdminCartItems } from "@/lib/admin-cart-items";
import CartClient from "./CartClient";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  // 관리자가 상담 후 담아준 건은 서버에 있다 (고객이 담은 리워드는 브라우저에만 있다)
  const userId = await viewerId();
  const adminItems = await loadAdminCartItems(userId);

  return <CartClient adminItems={adminItems} />;
}
