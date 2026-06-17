"use client";

import React, { useState, useTransition } from "react";
import { savePost, deletePost } from "@/app/dashboard/actions";
import { Post } from "@/db/schema";

interface PostsClientProps {
  initialPosts: Post[];
}

export default function PostsClient({ initialPosts }: PostsClientProps) {
  const [postsList, setPostsList] = useState<Post[]>(initialPosts);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<Post> | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isSlugManual, setIsSlugManual] = useState(false);

  // 새 글 등록 폼 열기
  const handleNewPost = () => {
    setCurrentPost({
      title: "",
      slug: "",
      content: "",
      status: "draft",
      tags: [],
    });
    setIsEditing(true);
    setIsSlugManual(false);
    setError(null);
  };

  // 기존 글 수정 폼 열기
  const handleEditPost = (post: Post) => {
    setCurrentPost(post);
    setIsEditing(true);
    setIsSlugManual(true);
    setError(null);
  };

  // 제목 입력 시 슬러그 자동 완성
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSlugManual || currentPost?.id) return;
    const titleVal = e.target.value;
    const generatedSlug = titleVal
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9가-힣\s]/g, "") // 특수 문자 제거
      .replace(/\s+/g, "-"); // 공백은 하이픈으로 대체

    setCurrentPost(prev => prev ? { ...prev, title: titleVal, slug: generatedSlug } : prev);
  };

  // 삭제 처리
  const handleDelete = async (id: string) => {
    if (!confirm("정말 이 포스트를 삭제하시겠습니까?")) return;

    startTransition(async () => {
      const result = await deletePost(id);
      if (result.success) {
        setPostsList(prev => prev.filter(p => p.id !== id));
      } else if (result.error) {
        alert(result.error);
      }
    });
  };

  // 저장 처리
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!currentPost?.title || !currentPost?.slug) {
      setError("제목과 슬러그(경로명)는 필수입니다.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const tagsString = formData.get("tags") as string;
    const tagsArray = tagsString
      ? tagsString
          .split(",")
          .map(t => t.trim())
          .filter(Boolean)
      : [];

    const postData = {
      id: currentPost.id,
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      content: formData.get("content") as string,
      status: formData.get("status") as string,
      tags: tagsArray,
    };

    startTransition(async () => {
      const result = await savePost(postData);
      if (result.success) {
        window.location.reload();
      } else if (result.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-800">✍️ 블로그 관리</h1>
          <p className="text-sm text-slate-500 mt-1">자신의 전문 배움과 업무 인사이트를 아카이빙하세요.</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleNewPost}
            className="px-5 py-3 bg-brand-primary text-white font-bold rounded-2xl hover:bg-brand-secondary hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] transition-all duration-200 text-sm cursor-pointer"
          >
            + 새 포스트 작성
          </button>
        )}
      </div>

      {/* Editing Form */}
      {isEditing && currentPost && (
        <div className="bg-white border border-slate-100 shadow-xl rounded-3xl p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-800">
              {currentPost.id ? "글 수정하기" : "새 포스트 작성"}
            </h3>
            <button
              onClick={() => setIsEditing(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors text-sm font-semibold"
            >
              닫기
            </button>
          </div>

          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-2">포스트 제목 *</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={currentPost.title || ""}
                  onChange={handleTitleChange}
                  placeholder="예: Next.js 16 App Router에서 Supabase SSR 인증 구현하기"
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">
                  슬러그(경로명) *
                  <span className="text-[10px] text-indigo-500 ml-2">URL 주소로 사용됩니다. (영문/숫자/한글/하이픈)</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={currentPost.slug || ""}
                  onChange={e => {
                    setIsSlugManual(true);
                    setCurrentPost(prev => prev ? { ...prev, slug: e.target.value } : prev);
                  }}
                  placeholder="nextjs-16-supabase-ssr"
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">태그 (쉼표로 구분)</label>
                <input
                  type="text"
                  name="tags"
                  defaultValue={currentPost.tags?.join(", ") || ""}
                  placeholder="개발, Next.js, SSR"
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-2">글 내용 (Markdown 편집기) *</label>
                <textarea
                  name="content"
                  rows={12}
                  defaultValue={currentPost.content || ""}
                  onChange={e => setCurrentPost(prev => prev ? { ...prev, content: e.target.value } : prev)}
                  placeholder="# 소개&#10;여기에 마크다운 형식으로 풍부한 포스트 내용을 작성해 보세요. 코드 스니펫이나 테이블도 지원합니다."
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">발행 상태</label>
                <select
                  name="status"
                  defaultValue={currentPost.status || "draft"}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200 text-sm"
                >
                  <option value="draft">임시저장 (Draft)</option>
                  <option value="published">발행 (Published)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition-all cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 bg-brand-primary text-white font-bold rounded-2xl hover:bg-brand-secondary hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 text-sm cursor-pointer"
              >
                {isPending ? "저장 중..." : "글 저장하기"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {postsList.length === 0 ? (
          <div className="py-16 text-center bg-white border border-slate-100 rounded-3xl text-slate-400 text-sm">
            등록된 포스트가 없습니다. 나만의 멋진 기술 아티클을 첫 포스팅해 보세요!
          </div>
        ) : (
          postsList.map(post => (
            <div
              key={post.id}
              className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 hover:shadow-md hover:border-slate-200 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      post.status === "published"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-slate-50 text-slate-500 border-slate-100"
                    }`}
                  >
                    {post.status === "published" ? "발행됨" : "임시저장"}
                  </span>
                  {post.tags && post.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">{post.title}</h3>
                <p className="text-xs text-slate-400">
                  URL 슬러그: <span className="font-mono text-slate-500">/{post.slug}</span> | 작성일: {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => handleEditPost(post)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-brand-primary text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
