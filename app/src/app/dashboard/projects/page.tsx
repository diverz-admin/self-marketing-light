import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import ProjectsClient from "@/components/ProjectsClient";

export default async function DashboardProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 데이터베이스에서 해당 유저의 프로젝트 리스트 조회
  let userProjects: any[] = [];
  try {
    userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, user.id))
      .orderBy(desc(projects.createdAt));
  } catch (err) {
    console.error("Failed to fetch projects in dashboard:", err);
  }

  return (
    <div className="animate-fadeIn">
      <ProjectsClient initialProjects={userProjects} />
    </div>
  );
}
