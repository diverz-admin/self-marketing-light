import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { loadMyPointCharges, loadPointBalance } from "@/lib/points";
import ChargeForm from "./ChargeForm";

export const dynamic = "force-dynamic";

export default async function ChargePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [balance, history] = await Promise.all([
    loadPointBalance(user.id),
    loadMyPointCharges(user.id),
  ]);

  return <ChargeForm balance={balance} history={history} />;
}
