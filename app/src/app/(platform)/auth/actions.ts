"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, memberProfiles } from "@/db/schema";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { BIZ_DOC_BUCKET } from "@/lib/storage";

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

const str = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === "string" && v.trim() ? v.trim() : null;
};

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

    // 3. 사업자등록증 업로드 (비공개 버킷, <uid>/ 아래에만 쓸 수 있게 정책 설정됨)
    let bizFilePath: string | null = null;
    let bizFileName: string | null = null;
    let bizFileSize: number | null = null;

    const bizFile = formData.get("bizFile");
    if (bizFile instanceof File && bizFile.size > 0) {
      const ext = bizFile.name.includes(".") ? bizFile.name.split(".").pop() : "bin";
      const path = `${authUser.id}/biz-registration.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(BIZ_DOC_BUCKET)
        .upload(path, bizFile, { upsert: true, contentType: bizFile.type || undefined });

      // 업로드 실패로 가입 자체를 막지는 않는다 — 나머지 정보는 저장하고 관리자가 재요청할 수 있게 한다.
      if (uploadError) {
        console.error("사업자등록증 업로드 실패:", uploadError.message);
      } else {
        bizFilePath = path;
        bizFileName = bizFile.name;
        bizFileSize = bizFile.size;
      }
    }

    // 4. 가입 폼의 조직/사업자 정보 저장
    await db
      .insert(memberProfiles)
      .values({
        userId: authUser.id,
        username: str(formData, "username"),
        phone: str(formData, "phone"),
        orgName: str(formData, "orgName"),
        orgType: str(formData, "orgType"),
        bizNumber: str(formData, "bizNumber"),
        bizCondition: str(formData, "bizCondition"),
        bizCategory: str(formData, "bizCategory"),
        bizFilePath,
        bizFileName,
        bizFileSize,
        bizFileUploadedAt: bizFilePath ? new Date() : null,
        agreedAt: formData.get("agree") ? new Date() : null,
      })
      .onConflictDoNothing({ target: memberProfiles.userId });
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
