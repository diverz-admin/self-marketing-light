import { viewerId } from "@/lib/viewer";
import { loadMyPointCharges, loadMyPointEntries, loadPointBalance } from "@/lib/points";
import ChargeForm from "./ChargeForm";

export const dynamic = "force-dynamic";

export default async function ChargePage({
  searchParams,
}: {
  searchParams: Promise<{ amount?: string }>;
}) {
  const userId = await viewerId();
  // 결제 화면에서 "부족한 포인트 충전하기"로 넘어오면 ?amount= 로 금액을 채워 둔다
  const { amount } = await searchParams;
  const initialAmount = Number(amount?.replace(/[^0-9]/g, "")) || 0;

  const [balance, history, entries] = await Promise.all([
    loadPointBalance(userId),
    loadMyPointCharges(userId),
    loadMyPointEntries(userId),
  ]);

  return <ChargeForm balance={balance} history={history} entries={entries} initialAmount={initialAmount} />;
}
