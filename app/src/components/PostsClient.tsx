"use client";

import React, { useState } from "react";

type MockPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  tags: string[];
  createdAt: Date;
};

const inputClass = "w-full px-4 py-3 border border-brand-border rounded-xl bg-brand-lighter text-brand-dark placeholder-brand-muted focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-sm";
const labelClass = "block text-sm font-semibold text-brand-dark mb-2";

export default function PostsClient({ initialPosts }: { initialPosts: MockPost[] }) {
  const [postsList, setPostsList] = useState<MockPost[]>(initialPosts);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<MockPost> | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSlugManual, setIsSlugManual] = useState(false);

  const handleNew = () => {
    setCurrentPost({ title: "", slug: "", content: "", status: "draft", tags: [] });
    setIsEditing(true);
    setIsSlugManual(false);
    setError(null);
  };

  const handleEdit = (post: MockPost) => {
    setCurrentPost(post);
    setIsEditing(true);
    setIsSlugManual(true);
    setError(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("이 포스트를 삭제하시겠습니까?")) return;
    setPostsList((prev) => prev.filter((p) => p.id !== id));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSlugManual || currentPost?.id) return;
    const v = e.target.value;
    const slug = v.trim().toLowerCase().replace(/[^a-zA-Z0-9가-힣\s]/g, "").replace(/\s+/g, "-");
    setCurrentPost((prev) => prev ? { ...prev, title: v, slug } : prev);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!currentPost?.title || !currentPost?.slug) { setError("제목과 슬러그는 필수입니다."); return; }
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const tags = (formData.get("tags") as string)?.split(",").map((t) => t.trim()).filter(Boolean) || [];
    await new Promise((r) => setTimeout(r, 300));
    const saved: MockPost = {
      id: currentPost.id || Date.now().toString(),
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      content: formData.get("content") as string,
      status: formData.get("status") as string,
      tags,
      createdAt: currentPost.createdAt || new Date(),
    };
    if (currentPost.id) {
      setPostsList((prev) => prev.map((p) => (p.id === currentPost.id ? saved : p)));
    } else {
      setPostsList((prev) => [saved, ...prev]);
    }
    setIsPending(false);
    setIsEditing(false);
    setCurrentPost(null);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-dark">블로그 관리</h1>
          <p className="text-sm text-brand-sub mt-1">전문 배움과 업무 인사이트를 아카이빙하세요.</p>
        </div>
        {!isEditing && (
          <button onClick={handleNew} className="px-4 py-2.5 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-brand-primary-hover transition-colors cursor-pointer">+ 새 포스트</button>
        )}
      </div>

      {isEditing && currentPost && (
        <div className="bg-white border border-brand-border rounded-2xl p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-brand-border pb-3">
            <h3 className="text-sm font-bold text-brand-dark">{currentPost.id ? "글 수정하기" : "새 포스트 작성"}</h3>
            <button onClick={() => setIsEditing(false)} className="text-xs font-semibold text-brand-sub hover:text-brand-text transition-colors">닫기</button>
          </div>
          {error && <div className="p-3.5 text-sm text-brand-error bg-brand-error-bg border border-red-100 rounded-xl">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className={labelClass}>포스트 제목 *</label>
                <input type="text" name="title" defaultValue={currentPost.title || ""} onChange={handleTitleChange} placeholder="예: Next.js 16 App Router 딥다이브" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>슬러그(경로명) *<span className="text-[12px] text-brand-primary ml-1.5 font-normal">URL로 사용됩니다</span></label>
                <input type="text" name="slug" value={currentPost.slug || ""} onChange={(e) => { setIsSlugManual(true); setCurrentPost((prev) => prev ? { ...prev, slug: e.target.value } : prev); }} placeholder="nextjs-16-deep-dive" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>태그 (쉼표 구분)</label>
                <input type="text" name="tags" defaultValue={currentPost.tags?.join(", ") || ""} placeholder="개발, Next.js, SSR" className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>글 내용 (Markdown) *</label>
                <textarea name="content" rows={12} defaultValue={currentPost.content || ""} placeholder={"# 소개\n마크다운 형식으로 작성하세요."} required className={`${inputClass} font-mono`} />
              </div>
              <div>
                <label className={labelClass}>발행 상태</label>
                <select name="status" defaultValue={currentPost.status || "draft"} className={inputClass}>
                  <option value="draft">임시저장</option>
                  <option value="published">발행</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-brand-border">
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2.5 bg-brand-light text-brand-text text-sm font-semibold rounded-xl hover:bg-brand-border transition-colors cursor-pointer">취소</button>
              <button type="submit" disabled={isPending} className="px-4 py-2.5 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-brand-primary-hover disabled:opacity-50 transition-colors cursor-pointer">{isPending ? "저장 중..." : "저장하기"}</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {postsList.length === 0 ? (
          <div className="py-14 text-center bg-white border border-brand-border rounded-2xl text-sm text-brand-sub">등록된 포스트가 없습니다. 첫 포스팅을 작성해 보세요.</div>
        ) : (
          postsList.map((post) => (
            <div key={post.id} className="bg-white border border-brand-border rounded-2xl p-5 hover:border-brand-primary/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`text-[12px] font-semibold px-2 py-0.5 rounded border ${post.status === "published" ? "bg-brand-success-bg text-brand-success border-green-100" : "bg-brand-light text-brand-sub border-brand-border"}`}>{post.status === "published" ? "발행됨" : "임시저장"}</span>
                  {post.tags?.slice(0, 3).map((tag, idx) => (<span key={idx} className="text-[12px] font-medium px-2 py-0.5 rounded bg-brand-light text-brand-sub">#{tag}</span>))}
                </div>
                <h3 className="text-sm font-bold text-brand-dark mb-0.5">{post.title}</h3>
                <p className="text-xs text-brand-sub">/{post.slug} · {new Date(post.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-1.5 self-end md:self-center shrink-0">
                <button onClick={() => handleEdit(post)} className="px-3 py-1.5 bg-brand-light hover:bg-blue-50 hover:text-brand-primary text-brand-sub rounded-lg text-xs font-semibold transition-colors cursor-pointer">수정</button>
                <button onClick={() => handleDelete(post.id)} className="px-3 py-1.5 bg-brand-light hover:bg-red-50 hover:text-brand-error text-brand-sub rounded-lg text-xs font-semibold transition-colors cursor-pointer">삭제</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
