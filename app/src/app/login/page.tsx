"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { login } from "@/app/auth/actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-brand-light py-12 px-4 sm:px-6 lg:px-8">
      {/* Background blobs */}
      <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] rounded-full bg-indigo-400/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[700px] h-[700px] rounded-full bg-violet-400/20 blur-[160px] pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Brand Logo & Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
              M
            </span>
            <span className="font-display font-black text-2xl tracking-tight bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              SelfMarketing
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-brand-dark tracking-tight">
            내 브랜딩 공간에 로그인
          </h2>
          <p className="mt-2 text-sm text-brand-dark/60">
            당신의 가치를 증명하는 포트폴리오를 관리하세요
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white/70 backdrop-blur-md border border-white/60 shadow-2xl rounded-3xl p-8 sm:p-10 transition-all duration-300">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl animate-headShake">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-brand-dark/70 mb-2"
                >
                  이메일 주소
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@example.com"
                  className="appearance-none block w-full px-4 py-3 border border-brand-border rounded-2xl bg-white/50 text-brand-dark placeholder-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-350 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-brand-dark/70 mb-2"
                >
                  비밀번호
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="appearance-none block w-full px-4 py-3 border border-brand-border rounded-2xl bg-white/50 text-brand-dark placeholder-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-350 text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isPending}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-gradient-to-r from-brand-primary to-brand-secondary hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 cursor-pointer"
              >
                {isPending ? "로그인 중..." : "로그인"}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-brand-border text-center">
            <p className="text-xs text-brand-dark/60">
              아직 계정이 없으신가요?{" "}
              <Link
                href="/signup"
                className="font-bold text-brand-primary hover:text-brand-secondary transition-colors duration-200"
              >
                회원가입하기
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
