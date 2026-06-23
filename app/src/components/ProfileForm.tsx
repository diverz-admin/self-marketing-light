"use client";

import React, { useState, useTransition } from "react";

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

const inputClass = "w-full px-4 py-3 border border-brand-border rounded-xl bg-brand-lighter text-brand-dark placeholder-brand-muted focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-sm";
const labelClass = "block text-sm font-semibold text-brand-dark mb-2";

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      await new Promise((r) => setTimeout(r, 400));
      setMessage({ type: "success", text: "프로필이 업데이트되었습니다." });
      setTimeout(() => setMessage(null), 3000);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {message && (
        <div className={`p-3.5 text-sm rounded-xl border ${message.type === "success" ? "bg-brand-success-bg text-brand-success border-green-100" : "bg-brand-error-bg text-brand-error border-red-100"}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white border border-brand-border rounded-2xl p-6 space-y-5">
        <h3 className="text-sm font-bold text-brand-dark border-b border-brand-border pb-3">기본 소개</h3>
        <div>
          <label className={labelClass}>한 줄 슬로건 / 타이틀</label>
          <input type="text" name="title" defaultValue={initialProfile?.title || ""} placeholder="예: 고객 가치를 최우선으로 생각하는 풀스택 개발자" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>상세 자기소개 (Markdown 지원)</label>
          <textarea name="bio" rows={6} defaultValue={initialProfile?.bio || ""} placeholder="경력 성과, 가치관 등을 상세히 적어보세요." className={`${inputClass} font-sans`} />
        </div>
      </div>

      <div className="bg-white border border-brand-border rounded-2xl p-6 space-y-5">
        <h3 className="text-sm font-bold text-brand-dark border-b border-brand-border pb-3">소셜 채널 & 연락처</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>연락 이메일</label>
            <input type="email" name="contactEmail" defaultValue={initialProfile?.contactEmail || ""} placeholder="contact@yourdomain.com" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>기술 블로그 URL</label>
            <input type="url" name="blogUrl" defaultValue={initialProfile?.blogUrl || ""} placeholder="https://velog.io/@username" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>GitHub URL</label>
            <input type="url" name="githubUrl" defaultValue={initialProfile?.githubUrl || ""} placeholder="https://github.com/username" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>LinkedIn URL</label>
            <input type="url" name="linkedinUrl" defaultValue={initialProfile?.linkedinUrl || ""} placeholder="https://linkedin.com/in/username" className={inputClass} />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={isPending} className="px-5 py-2.5 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-brand-primary-hover active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer">
          {isPending ? "저장 중..." : "저장하기"}
        </button>
      </div>
    </form>
  );
}
