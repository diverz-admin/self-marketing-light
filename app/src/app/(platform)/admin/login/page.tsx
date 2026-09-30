"use client";

import React, { Suspense, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { adminLogin } from "./actions";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const params = useSearchParams();
  const forbidden = params.get("error") === "forbidden";
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await adminLogin(formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ background: "linear-gradient(135deg,#0B1637 0%,#152C9E 50%,#111D37 100%)" }}>
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-[18px] font-black text-white">B</span>
            <div className="leading-tight">
              <p className="text-[18px] font-extrabold text-white">BLUE EGG</p>
              <p className="text-[12px] text-white/55">관리자 콘솔</p>
            </div>
          </div>
          <h1 className="text-[24px] font-extrabold text-white tracking-tight">내부 직원 로그인</h1>
          <p className="text-[14px] text-white/60 mt-1">권한이 있는 직원만 접근할 수 있습니다</p>
        </div>

        <div className="bg-white rounded-2xl p-7 shadow-xl">
          <form className="space-y-3.5" onSubmit={handleSubmit}>
            {forbidden && !error && (
              <div className="p-3.5 text-[13.5px] text-brand-error bg-brand-error-bg rounded-xl border border-red-100">
                관리자 권한이 없어 접근이 제한되었습니다.
              </div>
            )}
            {error && (
              <div className="p-3.5 text-[13.5px] text-brand-error bg-brand-error-bg rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-[13.5px] font-semibold text-brand-dark mb-1.5">직원 이메일</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="staff@blueegg.com"
                className="w-full px-4 py-3 border border-brand-border rounded-xl bg-brand-lighter text-brand-dark placeholder-brand-muted focus:outline-none focus:bg-white focus:border-brand-primary transition-all text-[15px]"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[13.5px] font-semibold text-brand-dark mb-1.5">비밀번호</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-3 border border-brand-border rounded-xl bg-brand-lighter text-brand-dark placeholder-brand-muted focus:outline-none focus:bg-white focus:border-brand-primary transition-all text-[15px]"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 rounded-xl text-[15px] font-bold text-white bg-brand-primary hover:bg-brand-primary-hover active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer mt-1"
            >
              {isPending ? "로그인 중..." : "관리자 로그인"}
            </button>
          </form>
        </div>

        <p className="text-center text-[12.5px] text-white/45 mt-6">
          계정 발급이 필요하면 시스템 관리자에게 문의하세요.
        </p>
      </div>
    </div>
  );
}
