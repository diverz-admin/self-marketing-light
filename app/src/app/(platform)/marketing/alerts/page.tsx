import { AlertsView } from "@/components/marketing/Notifications";
import { demoNotifications, loadNotifications } from "@/lib/notifications";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const items = user ? await loadNotifications(user.id) : demoNotifications();
  return <AlertsView items={items} />;
}
