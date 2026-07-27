"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { BOOTSTRAP_ADMIN_EMAILS } from "@/lib/admin-auth";

export async function adminLogin(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해주세요." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  // 관리자 권한 확인 (부트스트랩 이메일은 통과 → 게이트에서 자동 승격)
  const isBootstrap = BOOTSTRAP_ADMIN_EMAILS.includes(email);
  if (!isBootstrap) {
    const rows = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, data.user.id))
      .limit(1);

    if (rows[0]?.role !== "admin") {
      await supabase.auth.signOut();
      return { error: "관리자 권한이 없는 계정입니다." };
    }
  }

  redirect("/admin");
}
