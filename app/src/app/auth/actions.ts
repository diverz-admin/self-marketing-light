"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, profiles } from "@/db/schema";
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

  redirect("/dashboard");
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
      // 신규 유저 등록
      const [newUser] = await db
        .insert(users)
        .values({
          id: authUser.id,
          name,
          email,
        })
        .returning();

      // 기본 프로필 카드 자동 생성
      await db.insert(profiles).values({
        userId: newUser.id,
        title: `안녕하세요, ${name}입니다!`,
        bio: "여기에 자신을 소개하는 멋진 소개글을 작성해 보세요.",
        contactEmail: email,
      });
    }
  } catch (dbError) {
    console.error("Database user creation failed:", dbError);
    // Supabase Auth 회원가입은 되었으나 로컬 DB 동기화 실패 시 대응
    return { error: "데이터베이스 동기화 중 오류가 발생했습니다." };
  }

  redirect("/dashboard");
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
