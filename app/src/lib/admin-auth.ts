import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, type User } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

/**
 * 부트스트랩 관리자 이메일.
 * 이 이메일로 로그인하면 public.users 행이 없거나 role이 admin이 아니어도
 * 자동으로 admin 권한이 부여됩니다. (최초 관리자 지정용)
 */
export const BOOTSTRAP_ADMIN_EMAILS = ["eggcorp2024@gmail.com"];

/**
 * 내부 공유용 인증 우회.
 * ADMIN_AUTH_BYPASS=1 이면 로그인 없이 어드민에 들어갈 수 있다.
 * 프리뷰에서 내부 직원이 계정 없이 화면을 확인하기 위한 임시 장치이며,
 * VERCEL_ENV가 production이면 플래그가 켜져 있어도 절대 우회하지 않는다.
 */
function isAuthBypassEnabled() {
  return process.env.ADMIN_AUTH_BYPASS === "1" && process.env.VERCEL_ENV !== "production";
}

const BYPASS_ADMIN: User = {
  id: "00000000-0000-0000-0000-000000000000",
  name: "미리보기 관리자",
  email: "preview@local",
  role: "admin",
  creditBalance: "0",
  createdAt: new Date(0),
  updatedAt: new Date(0),
};

/**
 * 어드민 전용 서버 가드.
 * - 미로그인 → /login
 * - admin 아님 → /marketing
 * - 부트스트랩 이메일 → 자동 승격
 * 어드민 레이아웃/서버 액션 진입점에서 호출한다.
 */
export async function requireAdmin(): Promise<User> {
  if (isAuthBypassEnabled()) {
    return BYPASS_ADMIN;
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/admin/login");
  }

  const email = authUser.email ?? "";
  const isBootstrap = BOOTSTRAP_ADMIN_EMAILS.includes(email);

  const rows = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
  let dbUser = rows[0];

  if (!dbUser && isBootstrap) {
    const name =
      (authUser.user_metadata?.display_name as string | undefined) ||
      (authUser.user_metadata?.name as string | undefined) ||
      email.split("@")[0];
    const inserted = await db
      .insert(users)
      .values({ id: authUser.id, name, email, role: "admin" })
      .returning();
    dbUser = inserted[0];
  } else if (dbUser && isBootstrap && dbUser.role !== "admin") {
    const updated = await db
      .update(users)
      .set({ role: "admin", updatedAt: new Date() })
      .where(eq(users.id, authUser.id))
      .returning();
    dbUser = updated[0];
  }

  if (!dbUser || dbUser.role !== "admin") {
    redirect("/admin/login?error=forbidden");
  }

  return dbUser;
}
