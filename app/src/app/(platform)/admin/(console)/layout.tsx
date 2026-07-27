import React from "react";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminSidebar, AdminMobileNav } from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen flex bg-[#EDEFF2]">
      <AdminSidebar adminName={admin.name} />
      <div className="flex-1 min-w-0 flex flex-col">
        <AdminMobileNav />
        <main className="flex-1 p-4 md:p-8 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
