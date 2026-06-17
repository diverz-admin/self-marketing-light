"use client";

import React, { useState, useTransition } from "react";
import { updateProfile } from "@/app/dashboard/actions";

interface ProfileFormProps {
  initialProfile: {
    title: string | null;
    bio: string | null;
    contactEmail: string | null;
    blogUrl: string | null;
    githubUrl: string | null;
    linkedinUrl: string | null;
  } | null;
}

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.success) {
        setMessage({ type: "success", text: "프로필이 성공적으로 업데이트되었습니다!" });
        // 3초 후 메세지 초기화
        setTimeout(() => setMessage(null), 3000);
      } else if (result.error) {
        setMessage({ type: "error", text: result.error });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`p-4 text-sm rounded-2xl border transition-all duration-300 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : "bg-red-50 text-red-700 border-red-100"
          }`}
        >
          {message.type === "success" ? "✅ " : "⚠️ "}
          {message.text}
        </div>
      )}

      {/* Grid Inputs */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">기본 브랜드 소개</h3>
        
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">한 줄 슬로건 / 타이틀</label>
          <input
            type="text"
            name="title"
            defaultValue={initialProfile?.title || ""}
            placeholder="예: 고객 가치를 최우선으로 생각하는 풀스택 개발자"
            className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">상세 자기소개 (Markdown 지원)</label>
          <textarea
            name="bio"
            rows={6}
            defaultValue={initialProfile?.bio || ""}
            placeholder="자신의 경력 성과, 가치관 등을 상세히 적어보세요."
            className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200 text-sm font-sans"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">소셜 채널 & 연락처</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">연락 이메일</label>
            <input
              type="email"
              name="contactEmail"
              defaultValue={initialProfile?.contactEmail || ""}
              placeholder="contact@yourdomain.com"
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">기술 블로그 URL</label>
            <input
              type="url"
              name="blogUrl"
              defaultValue={initialProfile?.blogUrl || ""}
              placeholder="https://velog.io/@username"
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">GitHub URL</label>
            <input
              type="url"
              name="githubUrl"
              defaultValue={initialProfile?.githubUrl || ""}
              placeholder="https://github.com/username"
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">LinkedIn URL</label>
            <input
              type="url"
              name="linkedinUrl"
              defaultValue={initialProfile?.linkedinUrl || ""}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-3 bg-brand-primary text-white font-bold rounded-2xl hover:bg-brand-secondary hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 text-sm cursor-pointer"
        >
          {isPending ? "저장 중..." : "프로필 변경 저장"}
        </button>
      </div>
    </form>
  );
}
