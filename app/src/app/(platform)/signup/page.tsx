"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { signup } from "@/app/(platform)/auth/actions";
import Logo from "@/components/Logo";
import AuthBanner, { AuthBannerCompact } from "@/components/AuthBanner";

const inputCls =
  "w-full px-3.5 py-2.5 border border-brand-border rounded-lg bg-brand-lighter text-brand-dark placeholder-brand-muted text-[14px] focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 transition-all";
const labelCls = "block text-[13px] font-semibold text-brand-dark mb-1";
const helpCls = "mt-1 text-[11.5px] text-brand-muted";
const sectionCls = "text-[11.5px] font-bold uppercase tracking-[.08em] text-brand-muted";
const req = <span className="text-brand-error">*</span>;

function formatPhone(v: string) {
  const d = v.replace(/[^0-9]/g, "").slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}
function formatBiz(v: string) {
  const d = v.replace(/[^0-9]/g, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
}

// 데모: 이미 사용 중인 아이디 (실제로는 서버 조회)
const TAKEN_IDS = ["admin", "test", "bluegg", "user", "master"];

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [phone, setPhone] = useState("");
  const [biz, setBiz] = useState("");
  const [username, setUsername] = useState("");
  const [checkState, setCheckState] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [bizFileName, setBizFileName] = useState<string | null>(null);

  const handleCheckUsername = async () => {
    const v = username.trim();
    if (v.length < 4) {
      setError("아이디는 4자 이상 입력해 주세요.");
      setCheckState("idle");
      return;
    }
    setError(null);
    setCheckState("checking");
    await new Promise((r) => setTimeout(r, 600));
    setCheckState(TAKEN_IDS.includes(v.toLowerCase()) ? "taken" : "available");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    if (checkState !== "available") {
      setError("아이디 중복확인을 완료해 주세요.");
      return;
    }
    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("passwordConfirm") as string;
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!formData.get("agree")) {
      setError("이용약관 및 개인정보 처리방침에 동의해 주세요.");
      return;
    }
    startTransition(async () => {
      const result = await signup(formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="min-h-screen bg-white lg:h-screen lg:flex lg:overflow-hidden lg:p-4">
      <AuthBanner />

      {/* ── 우측 폼 ── */}
      <div className="flex-1 overflow-y-auto px-5 py-10 lg:px-12 lg:py-12">
        <div className="mx-auto w-full max-w-[440px]">
          {/* 모바일 전용 상단 배너 — lg 이상에서는 좌측 AuthBanner 가 같은 역할을 한다 */}
          <AuthBannerCompact className="lg:hidden mb-7" />

          {/* 데스크톱 로고 — 모바일은 위 배너가 대신한다 */}
          <Link href="/marketing" className="mb-7 hidden lg:flex lg:justify-start">
            <Logo size="h-9" />
          </Link>

          <h1 className="text-[26px] font-extrabold tracking-tight text-brand-dark">계정 만들기</h1>
          <p className="mt-1 text-[13.5px] text-brand-sub">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="font-bold text-brand-primary hover:underline">
              로그인
            </Link>
          </p>

          <form className="mt-7 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg border border-red-100 bg-brand-error-bg p-3.5 text-[13.5px] text-brand-error">
                {error}
              </div>
            )}

            {/* ── 계정 정보 ── */}
            <section className="space-y-3.5">
              <p className={sectionCls}>계정 정보</p>

              <div>
                <label htmlFor="username" className={labelCls}>아이디 {req}</label>
                <div className="flex gap-2">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setCheckState("idle"); }}
                    placeholder="영문/숫자 4자 이상"
                    className={`${inputCls} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={handleCheckUsername}
                    disabled={checkState === "checking" || !username.trim()}
                    className="shrink-0 whitespace-nowrap rounded-lg border border-brand-primary px-3.5 text-[13px] font-bold text-brand-primary transition-colors hover:bg-brand-primary/5 disabled:opacity-40 cursor-pointer"
                  >
                    {checkState === "checking" ? "확인 중..." : "중복확인"}
                  </button>
                </div>
                {checkState === "available" && (
                  <p className="mt-1 flex items-center gap-1 text-[11.5px] font-semibold text-brand-success">
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    사용 가능한 아이디입니다.
                  </p>
                )}
                {checkState === "taken" && (
                  <p className="mt-1 flex items-center gap-1 text-[11.5px] font-semibold text-brand-error">
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    이미 사용 중인 아이디입니다.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="password" className={labelCls}>비밀번호 {req}</label>
                  <input id="password" name="password" type="password" required placeholder="6자 이상" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="passwordConfirm" className={labelCls}>비밀번호 확인 {req}</label>
                  <input id="passwordConfirm" name="passwordConfirm" type="password" required placeholder="비밀번호 재입력" className={inputCls} />
                </div>
              </div>
              <p className={helpCls}>6자 이상 입력해 주세요.</p>
            </section>

            {/* ── 담당자 정보 ── */}
            <section className="space-y-3.5">
              <p className={sectionCls}>담당자 정보</p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className={labelCls}>이름 {req}</label>
                  <input id="name" name="name" type="text" required placeholder="홍길동" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="phone" className={labelCls}>연락처</label>
                  <input id="phone" name="phone" type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="010-0000-0000" className={inputCls} />
                </div>
              </div>

              <div>
                <label htmlFor="email" className={labelCls}>이메일 {req}</label>
                <input id="email" name="email" type="email" autoComplete="email" required placeholder="name@example.com" className={inputCls} />
                <p className={helpCls}>세금계산서·정산 안내가 이 이메일로 발송됩니다.</p>
              </div>
            </section>

            {/* ── 조직 정보 ── */}
            <section className="space-y-3.5">
              <p className={sectionCls}>조직 정보</p>

              <div>
                <label htmlFor="orgName" className={labelCls}>조직명 (회사명) {req}</label>
                <input id="orgName" name="orgName" type="text" required placeholder="주식회사 블루에그" className={inputCls} />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="orgType" className={labelCls}>조직 유형 {req}</label>
                  <div className="relative">
                    <select id="orgType" name="orgType" required defaultValue="대행사" className={`${inputCls} cursor-pointer appearance-none pr-9`}>
                      <option value="대행사">대행사</option>
                      <option value="광고주(직접)">광고주(직접)</option>
                      <option value="개인사업자">개인사업자</option>
                      <option value="법인사업자">법인사업자</option>
                      <option value="기타">기타</option>
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <label htmlFor="bizNumber" className={labelCls}>사업자등록번호</label>
                  <input id="bizNumber" name="bizNumber" type="text" inputMode="numeric" value={biz} onChange={(e) => setBiz(formatBiz(e.target.value))} placeholder="000-00-00000" className={inputCls} />
                </div>
              </div>
              <p className={`${helpCls} flex items-start gap-1`}>
                <svg className="mt-[1px] h-3.5 w-3.5 shrink-0 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                세금계산서 발행을 위해 사업자등록번호를 정확히 입력해 주세요. (미보유 시 비워두셔도 됩니다.)
              </p>

              {/* 업태 / 업종 */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="bizCondition" className={labelCls}>업태</label>
                  <input id="bizCondition" name="bizCondition" type="text" placeholder="예) 서비스업, 도소매업" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="bizCategory" className={labelCls}>업종 (종목)</label>
                  <input id="bizCategory" name="bizCategory" type="text" placeholder="예) 광고대행업, 전자상거래" className={inputCls} />
                </div>
              </div>

              {/* 사업자등록증 첨부 */}
              <div>
                <label className={labelCls}>사업자등록증 첨부</label>
                <input
                  id="bizFile"
                  name="bizFile"
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setBizFileName(e.target.files?.[0]?.name ?? null)}
                />
                {!bizFileName ? (
                  <label
                    htmlFor="bizFile"
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-brand-border bg-brand-lighter px-3.5 py-3 transition-all hover:border-brand-primary hover:bg-white"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-brand-border bg-white">
                      <svg className="h-4 w-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-semibold text-brand-dark">파일 선택</p>
                      <p className="text-[11.5px] text-brand-muted">JPG, PNG, PDF · 최대 10MB</p>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center gap-3 rounded-lg border border-brand-border bg-brand-lighter px-3.5 py-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-brand-border bg-white">
                      <svg className="h-4 w-4 text-brand-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                    <p className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-brand-dark">{bizFileName}</p>
                    <label htmlFor="bizFile" className="shrink-0 cursor-pointer text-[12.5px] font-semibold text-brand-primary hover:underline">변경</label>
                    <button
                      type="button"
                      onClick={() => {
                        setBizFileName(null);
                        const input = document.getElementById("bizFile") as HTMLInputElement | null;
                        if (input) input.value = "";
                      }}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-brand-muted transition-colors hover:bg-red-50 hover:text-brand-error cursor-pointer"
                      aria-label="첨부 삭제"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                )}
                <p className={helpCls}>사업자 인증 시 세금계산서 발행·정산이 원활합니다.</p>
              </div>
            </section>

            {/* ── 약관 동의 ── */}
            <label className="flex cursor-pointer select-none items-start gap-2.5">
              <input type="checkbox" name="agree" className="mt-0.5 h-4 w-4 shrink-0 rounded accent-brand-primary" />
              <span className="text-[12.5px] leading-relaxed text-brand-sub">
                <Link href="/terms" className="font-semibold text-brand-primary hover:underline">이용약관</Link> 및{" "}
                <Link href="/privacy" className="font-semibold text-brand-primary hover:underline">개인정보 처리방침</Link>에 동의합니다.
              </span>
            </label>

            <button
              type="submit"
              disabled={isPending}
              className="w-full cursor-pointer rounded-lg bg-brand-primary py-3 text-[15px] font-bold text-white transition-all hover:bg-brand-primary-hover active:scale-[0.99] disabled:opacity-50"
            >
              {isPending ? "계정 생성 중..." : "가입하기"}
            </button>
          </form>
        </div>
    </div>
    </div>
  );
}
