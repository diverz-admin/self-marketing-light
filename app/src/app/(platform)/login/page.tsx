"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { login } from "@/app/(platform)/auth/actions";
import Logo from "@/components/Logo";
import AuthBanner, { AuthBannerCompact } from "@/components/AuthBanner";

const inputCls =
  "w-full px-3.5 py-2.5 border border-brand-border rounded-lg bg-brand-lighter text-brand-dark placeholder-brand-muted text-[14px] focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 transition-all";
const labelCls = "block text-[13px] font-semibold text-brand-dark mb-1";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="min-h-screen bg-white lg:h-screen lg:flex lg:overflow-hidden lg:p-4">
      <AuthBanner />

      {/* ── 우측 폼 ── */}
      <div className="flex-1 overflow-y-auto px-5 py-10 lg:flex lg:items-center lg:px-12 lg:py-12">
        <div className="mx-auto w-full max-w-[400px]">
          {/* 모바일 전용 상단 배너 — lg 이상에서는 좌측 AuthBanner 가 같은 역할을 한다 */}
          <AuthBannerCompact className="lg:hidden mb-7" />

          {/* 데스크톱 로고 — 모바일은 위 배너가 대신한다 */}
          <Link href="/marketing" className="mb-7 hidden lg:flex lg:justify-start">
            <Logo size="h-9" />
          </Link>

          <h1 className="text-[26px] font-extrabold tracking-tight text-brand-dark">로그인</h1>
          <p className="mt-1 text-[13.5px] text-brand-sub">
            계정이 없으신가요?{" "}
            <Link href="/signup" className="font-bold text-brand-primary hover:underline">
              회원가입
            </Link>
          </p>

          <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg border border-red-100 bg-brand-error-bg p-3.5 text-[13.5px] text-brand-error">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className={labelCls}>이메일</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="name@example.com"
                className={inputCls}
              />
            </div>

            <div>
              <label htmlFor="password" className={labelCls}>비밀번호</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="비밀번호를 입력하세요"
                className={inputCls}
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full cursor-pointer rounded-lg bg-brand-primary py-3 text-[15px] font-bold text-white transition-all hover:bg-brand-primary-hover active:scale-[0.99] disabled:opacity-50"
            >
              {isPending ? "로그인 중..." : "로그인"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
