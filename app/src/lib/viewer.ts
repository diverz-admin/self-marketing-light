import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";
import { LOGIN_DISABLED } from "./auth-mode";

/** 어떤 데이터에도 걸리지 않는 빈 id — 조회는 되지만 결과가 비어 있다 */
const NO_USER = "00000000-0000-0000-0000-000000000000";

/**
 * 고객 화면이 "내 것"으로 보여줄 회원 id.
 *
 * 로그인한 방문자는 자기 데이터를, 로그인이 걷힌 상태(LOGIN_DISABLED)의
 * 미로그인 방문자는 가장 먼저 만들어진 회원을 데모로 본다.
 * 로그인을 다시 켜면 예전처럼 /login 으로 보낸다.
 */
export async function viewerId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return user.id;

  if (!LOGIN_DISABLED) redirect("/login");

  const rows = await db.select({ id: users.id }).from(users).orderBy(asc(users.createdAt)).limit(1);
  return rows[0]?.id ?? NO_USER;
}
