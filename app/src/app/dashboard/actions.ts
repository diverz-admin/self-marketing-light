"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { profiles, projects, posts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// 유저 인증 헬퍼
async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("인증되지 않은 사용자입니다.");
  }
  return user;
}

// 1. 프로필 업데이트
export async function updateProfile(formData: FormData) {
  try {
    const user = await getAuthUser();
    const title = formData.get("title") as string;
    const bio = formData.get("bio") as string;
    const contactEmail = formData.get("contactEmail") as string;
    const blogUrl = formData.get("blogUrl") as string;
    const githubUrl = formData.get("githubUrl") as string;
    const linkedinUrl = formData.get("linkedinUrl") as string;

    const existing = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(profiles)
        .set({ title, bio, contactEmail, blogUrl, githubUrl, linkedinUrl, updatedAt: new Date() })
        .where(eq(profiles.userId, user.id));
    } else {
      await db
        .insert(profiles)
        .values({ userId: user.id, title, bio, contactEmail, blogUrl, githubUrl, linkedinUrl });
    }

    revalidatePath("/dashboard");
    revalidatePath(`/${user.email?.split("@")[0]}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "프로필 저장 중 오류가 발생했습니다." };
  }
}

// 2. 프로젝트 저장 (생성 / 수정)
export async function saveProject(data: {
  id?: string;
  title: string;
  description: string;
  content: string;
  projectUrl: string;
  githubUrl: string;
  imageUrl: string;
  tags: string[];
  isFeatured: boolean;
}) {
  try {
    const user = await getAuthUser();

    if (data.id) {
      // 수정
      await db
        .update(projects)
        .set({
          title: data.title,
          description: data.description,
          content: data.content,
          projectUrl: data.projectUrl,
          githubUrl: data.githubUrl,
          imageUrl: data.imageUrl,
          tags: data.tags,
          isFeatured: data.isFeatured,
          updatedAt: new Date(),
        })
        .where(and(eq(projects.id, data.id), eq(projects.userId, user.id)));
    } else {
      // 생성
      await db.insert(projects).values({
        userId: user.id,
        title: data.title,
        description: data.description,
        content: data.content,
        projectUrl: data.projectUrl,
        githubUrl: data.githubUrl,
        imageUrl: data.imageUrl,
        tags: data.tags,
        isFeatured: data.isFeatured,
      });
    }

    revalidatePath("/dashboard/projects");
    revalidatePath(`/${user.email?.split("@")[0]}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "프로젝트 저장 중 오류가 발생했습니다." };
  }
}

// 3. 프로젝트 삭제
export async function deleteProject(id: string) {
  try {
    const user = await getAuthUser();
    await db
      .delete(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, user.id)));

    revalidatePath("/dashboard/projects");
    revalidatePath(`/${user.email?.split("@")[0]}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "프로젝트 삭제 중 오류가 발생했습니다." };
  }
}

// 4. 블로그 포스트 저장 (생성 / 수정)
export async function savePost(data: {
  id?: string;
  title: string;
  slug: string;
  content: string;
  status: string; // draft | published
  tags: string[];
}) {
  try {
    const user = await getAuthUser();

    // 슬러그 고유성 확인 (새 포스트 작성 시 혹은 슬러그 변경 시)
    // 간단히 공백을 하이픈으로 대체하고 소문자 변환
    const cleanSlug = data.slug.trim().toLowerCase().replace(/\s+/g, "-");

    if (data.id) {
      // 수정
      await db
        .update(posts)
        .set({
          title: data.title,
          slug: cleanSlug,
          content: data.content,
          status: data.status,
          tags: data.tags,
          updatedAt: new Date(),
        })
        .where(and(eq(posts.id, data.id), eq(posts.userId, user.id)));
    } else {
      // 생성
      await db.insert(posts).values({
        userId: user.id,
        title: data.title,
        slug: cleanSlug,
        content: data.content,
        status: data.status,
        tags: data.tags,
      });
    }

    revalidatePath("/dashboard/posts");
    revalidatePath(`/${user.email?.split("@")[0]}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "블로그 포스트 저장 중 오류가 발생했습니다." };
  }
}

// 5. 블로그 포스트 삭제
export async function deletePost(id: string) {
  try {
    const user = await getAuthUser();
    await db
      .delete(posts)
      .where(and(eq(posts.id, id), eq(posts.userId, user.id)));

    revalidatePath("/dashboard/posts");
    revalidatePath(`/${user.email?.split("@")[0]}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "포스트 삭제 중 오류가 발생했습니다." };
  }
}
