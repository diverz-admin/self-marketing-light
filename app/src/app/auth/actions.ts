"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해주세요." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/marketing");
}

export async function signup(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "모든 필드를 입력해주세요." };
  }

  const supabase = await createClient();

  // 1. Supabase Auth 회원가입
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: name,
      },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  const authUser = authData.user;
  if (!authUser) {
    return { error: "회원가입 중 오류가 발생했습니다. 다시 시도해 주세요." };
  }

  try {
    // 2. Drizzle DB에 사용자 생성 (ID는 Supabase Auth ID와 일치시킴)
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length === 0) {
      await db.insert(users).values({ id: authUser.id, name, email });
    }
  } catch (dbError) {
    console.error("Database user creation failed:", dbError);
    return { error: "데이터베이스 동기화 중 오류가 발생했습니다." };
  }

  redirect("/marketing");
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
