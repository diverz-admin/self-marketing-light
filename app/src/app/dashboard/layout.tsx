import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { signout } from "@/app/auth/actions";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 데이터베이스에서 실제 유저 이름 조회
  let dbUser = null;
  try {
    const fetchedUsers = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);
    dbUser = fetchedUsers[0] || null;
  } catch (err) {
    console.error("Failed to fetch user in layout:", err);
  }

  const userName = dbUser?.name || user.user_metadata?.display_name || "사용자";
  const userEmail = user.email || "";
  const usernameSlug = userEmail.split("@")[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-brand-dark text-white flex flex-col justify-between p-6 md:sticky md:top-0 md:h-screen z-20">
        <div className="space-y-8">
          {/* Logo / Header */}
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold text-lg">
              M
            </span>
            <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              SelfMarketing
            </span>
          </div>

          {/* User Profile Summary */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1">
            <p className="text-xs text-slate-400 font-semibold">Creator</p>
            <p className="text-sm font-bold text-white truncate">{userName}</p>
            <p className="text-[11px] text-slate-400 truncate">{userEmail}</p>
          </div>

          {/* Menu Items */}
          <nav className="flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 text-sm font-semibold text-slate-200 hover:text-white"
            >
              👤 프로필 설정
            </Link>
            <Link
              href="/dashboard/projects"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 text-sm font-semibold text-slate-200 hover:text-white"
            >
              🚀 포트폴리오 관리
            </Link>
            <Link
              href="/dashboard/posts"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 text-sm font-semibold text-slate-200 hover:text-white"
            >
              ✍️ 블로그 관리
            </Link>
            <a
              href={`/${usernameSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-indigo-200 transition-all duration-200 text-sm font-semibold border border-indigo-500/20"
            >
              ✨ 내 페이지 바로가기 &rarr;
            </a>
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <form action={signout}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-200 border border-white/5 hover:border-rose-500/30 text-sm font-bold transition-all duration-200 cursor-pointer"
            >
              로그아웃
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto max-w-5xl">
        {children}
      </main>
    </div>
  );
}
