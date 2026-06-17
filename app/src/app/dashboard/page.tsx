import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import ProfileForm from "@/components/ProfileForm";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 데이터베이스에서 해당 유저의 프로필 조회
  let userProfile = null;
  try {
    const fetchedProfiles = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);
    userProfile = fetchedProfiles[0] || null;
  } catch (err) {
    console.error("Failed to fetch profile in dashboard:", err);
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-display font-extrabold text-slate-800">👤 프로필 설정</h1>
        <p className="text-sm text-slate-500 mt-1">
          방문자에게 보여지는 첫인상 카드를 멋지게 관리하세요.
        </p>
      </div>

      <ProfileForm initialProfile={userProfile} />
    </div>
  );
}
