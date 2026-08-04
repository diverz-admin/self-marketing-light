import { viewerId } from "@/lib/viewer";
import { loadMyPointCharges, loadPointBalance } from "@/lib/points";
import ChargeForm from "./ChargeForm";

export const dynamic = "force-dynamic";

export default async function ChargePage() {
  const userId = await viewerId();

  const [balance, history] = await Promise.all([
    loadPointBalance(userId),
    loadMyPointCharges(userId),
  ]);

  return <ChargeForm balance={balance} history={history} />;
}
