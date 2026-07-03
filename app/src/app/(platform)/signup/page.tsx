"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { signup } from "@/app/(platform)/auth/actions";
import Logo from "@/components/Logo";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await signup(formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-5">
      <div className="w-full max-w-[360px]">
        {/* Logo */}
        <Link href="/marketing" className="flex justify-center mb-10">
          <Logo markClassName="h-9 w-auto" textClassName="h-5.5 w-auto" textColor="text-brand-dark" />
        </Link>

        <h1 className="text-[29px] font-extrabold text-brand-dark mb-1 tracking-tight">계정 만들기</h1>
        <p className="text-[16px] text-brand-sub mb-8">광고대행사 없이 직접 마케팅을 시작하세요</p>

        <form className="space-y-3" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 text-[16px] text-brand-error bg-brand-error-bg rounded-2xl border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-[16px] font-semibold text-brand-dark mb-2">
              이름
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="홍길동"
              className="w-full px-4 py-[15px] border border-brand-border rounded-2xl bg-brand-lighter text-brand-dark placeholder-brand-muted focus:outline-none focus:bg-white focus:border-brand-primary transition-all text-[17px]"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-[16px] font-semibold text-brand-dark mb-2">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="name@example.com"
              className="w-full px-4 py-[15px] border border-brand-border rounded-2xl bg-brand-lighter text-brand-dark placeholder-brand-muted focus:outline-none focus:bg-white focus:border-brand-primary transition-all text-[17px]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[16px] font-semibold text-brand-dark mb-2">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="6자 이상"
              className="w-full px-4 py-[15px] border border-brand-border rounded-2xl bg-brand-lighter text-brand-dark placeholder-brand-muted focus:outline-none focus:bg-white focus:border-brand-primary transition-all text-[17px]"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-[17px] rounded-2xl text-[17px] font-bold text-white bg-brand-primary hover:bg-brand-primary-hover active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer mt-1"
          >
            {isPending ? "계정 생성 중..." : "가입하기"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-brand-border text-center">
          <p className="text-[16px] text-brand-sub">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="font-semibold text-brand-primary hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
