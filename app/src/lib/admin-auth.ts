import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, type User } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { LOGIN_DISABLED } from "./auth-mode";

/**
 * 부트스트랩 관리자 이메일.
 * 이 이메일로 로그인하면 public.users 행이 없거나 role이 admin이 아니어도
 * 자동으로 admin 권한이 부여됩니다. (최초 관리자 지정용)
 */
export const BOOTSTRAP_ADMIN_EMAILS = ["eggcorp2024@gmail.com"];

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
 * 로그인이 걷힌 상태에서 콘솔을 쓰는 관리자.
 *
 * 담당자(assignedAdminId)는 users 를 참조하는 외래키라 실재하지 않는 id 를 쓰면
 * 셋팅 저장이 실패한다. 그래서 DB 의 admin 계정을 하나 빌려 쓰고,
 * 없을 때만 화면 표시용 더미로 떨어진다.
 */
async function bypassAdmin(): Promise<User> {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.role, "admin"))
    .orderBy(asc(users.createdAt))
    .limit(1);
  return rows[0] ?? BYPASS_ADMIN;
}

/**
 * 어드민 전용 서버 가드.
 * - 미로그인 → /login
 * - admin 아님 → /marketing
 * - 부트스트랩 이메일 → 자동 승격
 * 어드민 레이아웃/서버 액션 진입점에서 호출한다.
 */
export async function requireAdmin(): Promise<User> {
  // 로그인을 걷어 둔 동안에는 누구나 콘솔에 들어온다 (REQUIRE_LOGIN=1 로 되돌린다)
  if (LOGIN_DISABLED) {
    return bypassAdmin();
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
