import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { users, profiles, projects, posts } from "@/db/schema";
import { eq, and, desc, like } from "drizzle-orm";

interface PublicProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

// 간단한 마크다운 파서 헬퍼
function renderMarkdown(text: string | null) {
  if (!text) return null;
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks
  html = html.replace(/```([\s\S]+?)```/g, '<pre class="bg-slate-900 text-slate-100 p-4 rounded-2xl my-4 overflow-x-auto text-xs font-mono">$1</pre>');
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-indigo-600">$1</code>');
  // Headings
  html = html.replace(/^### (.*$)/gim, '<h4 class="text-base font-bold text-slate-800 mt-4 mb-2">$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 class="text-lg font-bold text-slate-800 mt-6 mb-3">$1</h3>');
  html = html.replace(/^# (.*$)/gim, '<h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">$1</h2>');
  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-brand-primary hover:underline font-semibold">$1</a>');
  // Line breaks
  html = html.replace(/\n/g, "<br />");

  return <div dangerouslySetInnerHTML={{ __html: html }} className="text-slate-600 leading-relaxed text-sm space-y-2" />;
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const resolvedParams = await params;
  const username = resolvedParams.username;

  // 1. 유저 조회 (이메일 앞부분이 일치하는 첫 번째 유저 찾기)
  const matchedUsers = await db
    .select()
    .from(users)
    .where(like(users.email, `${username}@%`))
    .limit(1);

  const user = matchedUsers[0];
  if (!user) {
    notFound();
  }

  // 2. 프로필 카드 조회
  const matchedProfiles = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);
  const profile = matchedProfiles[0] || null;

  // 3. 프로젝트 조회
  const allProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, user.id))
    .orderBy(desc(projects.isFeatured), desc(projects.createdAt));

  // 4. 블로그 포스트 조회 (발행 완료된 상태만)
  const publishedPosts = await db
    .select()
    .from(posts)
    .where(and(eq(posts.userId, user.id), eq(posts.status, "published")))
    .orderBy(desc(posts.createdAt));

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-brand-light selection:bg-indigo-500 selection:text-white">
      {/* Background glowing blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-400/10 blur-[150px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/60 backdrop-blur-md transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <span className="font-display font-extrabold text-lg tracking-tight text-slate-800">
              {user.name}
            </span>
          </div>
          
          <nav className="flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#about" className="hover:text-brand-primary transition-colors">소개</a>
            <a href="#projects" className="hover:text-brand-primary transition-colors">프로젝트</a>
            {publishedPosts.length > 0 && (
              <a href="#blog" className="hover:text-brand-primary transition-colors">블로그</a>
            )}
          </nav>
        </div>
      </header>

      {/* Content Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 md:py-20 flex flex-col gap-20 relative z-10">
        
        {/* Profile Card Section */}
        <section id="about" className="bg-white/70 backdrop-blur-md border border-white/60 shadow-xl rounded-3xl p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-brand-primary text-[11px] font-bold">
              💼 BRAND PROFILE CARD
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-black text-slate-800 leading-tight">
              {profile?.title || `안녕하세요, ${user.name}입니다.`}
            </h1>
            <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
              {profile?.bio || "소개글이 아직 작성되지 않았습니다."}
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              {profile?.contactEmail && (
                <a
                  href={`mailto:${profile.contactEmail}`}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-primary font-semibold transition-colors"
                >
                  ✉️ {profile.contactEmail}
                </a>
              )}
              {profile?.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-primary font-semibold transition-colors"
                >
                  🐙 GitHub
                </a>
              )}
              {profile?.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-primary font-semibold transition-colors"
                >
                  🔗 LinkedIn
                </a>
              )}
              {profile?.blogUrl && (
                <a
                  href={profile.blogUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-primary font-semibold transition-colors"
                >
                  📝 외부 블로그
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Portfolio Showcase Section */}
        <section id="projects" className="space-y-6">
          <div className="border-l-4 border-brand-primary pl-4">
            <h2 className="text-2xl font-display font-extrabold text-slate-800">Portfolio Showcase</h2>
            <p className="text-xs text-slate-500 mt-1">지금까지 제작해온 주요 결과물과 기여도입니다.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {allProjects.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white border border-slate-100 rounded-3xl text-slate-400 text-sm">
                전시 중인 프로젝트가 아직 없습니다.
              </div>
            ) : (
              allProjects.map(project => (
                <div
                  key={project.id}
                  className="group bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {project.imageUrl ? (
                    <div className="h-44 w-full relative overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="h-44 w-full bg-gradient-to-br from-indigo-500/80 to-purple-600/80 relative flex items-center justify-center text-white">
                      <span className="text-xl font-bold">🚀 {project.title}</span>
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {project.isFeatured && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                            ⭐ 대표작
                          </span>
                        )}
                        {project.tags && project.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-brand-primary"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">{project.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        {project.description}
                      </p>
                      {project.content && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          {renderMarkdown(project.content)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-100">
                      {project.projectUrl && (
                        <a
                          href={project.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-brand-primary hover:text-brand-secondary transition-colors"
                        >
                          🌐 Live Demo &rarr;
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-slate-600 hover:text-brand-primary transition-colors"
                        >
                          🐙 Source Code
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Blog Posts Section */}
        {publishedPosts.length > 0 && (
          <section id="blog" className="space-y-6">
            <div className="border-l-4 border-brand-secondary pl-4">
              <h2 className="text-2xl font-display font-extrabold text-slate-800">Branding Blog</h2>
              <p className="text-xs text-slate-500 mt-1">업무에서 배운 인사이트와 정교한 아티클을 공유합니다.</p>
            </div>

            <div className="space-y-4">
              {publishedPosts.map(post => (
                <a
                  key={post.id}
                  href={`/${username}/posts/${post.slug}`}
                  className="block p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {post.tags && post.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-base font-bold text-slate-800 hover:text-brand-secondary transition-colors mb-1">
                    {post.title}
                  </h3>
                  <div className="flex items-center justify-between text-[12px] text-slate-400">
                    <span>작성일: {new Date(post.createdAt).toLocaleDateString()}</span>
                    <span className="font-bold text-brand-primary">읽기 &rarr;</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 py-8 bg-white mt-20 relative z-10 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} {user.name}. Self Branding Page. Powered by BLUE EGG.
      </footer>
    </div>
  );
}
