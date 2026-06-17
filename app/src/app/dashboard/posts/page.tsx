import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import PostsClient from "@/components/PostsClient";

export default async function DashboardPostsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 데이터베이스에서 해당 유저의 포스트 리스트 조회
  let userPosts: any[] = [];
  try {
    userPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.userId, user.id))
      .orderBy(desc(posts.createdAt));
  } catch (err) {
    console.error("Failed to fetch posts in dashboard:", err);
  }

  return (
    <div className="animate-fadeIn">
      <PostsClient initialPosts={userPosts} />
    </div>
  );
}
