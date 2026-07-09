"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { signup } from "@/app/(platform)/auth/actions";
import Logo, { BlueEggMark, BlueEggText } from "@/components/Logo";

const inputCls =
  "w-full px-4 py-3 border border-brand-border rounded-xl bg-brand-lighter text-brand-dark placeholder-brand-muted text-[15px] focus:outline-none focus:bg-white focus:border-brand-primary transition-all";
const labelCls = "block text-[14px] font-semibold text-brand-dark mb-1.5";
const req = <span className="text-red-500">*</span>;

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
    <div className="min-h-screen flex bg-white">
      {/* ── 좌측 브랜디드 배너 ── */}
      <aside
        className="hidden lg:flex flex-col justify-between w-[62%] max-w-[920px] shrink-0 relative overflow-hidden px-20 py-12 text-white"
        style={{ background: "linear-gradient(160deg,#2E52C9 0%,#152C86 46%,#0A1547 100%)" }}
      >
        {/* 데코 블롭 */}
        <div className="pointer-events-none absolute -top-24 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute bottom-[-10%] left-[-8%] h-72 w-72 rounded-full bg-[#4C7BE3]/25 blur-3xl" aria-hidden />

        {/* 상단: 로고 */}
        <div className="relative">
          <Link href="/marketing" className="inline-flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/95 shadow-lg">
              <BlueEggMark className="h-8 w-auto" />
            </span>
            <BlueEggText className="h-6 w-auto text-white" />
          </Link>
        </div>

        {/* 중앙: 헤드라인 + 밸류 프롭 */}
        <div className="relative">
          <p className="text-[15px] font-bold tracking-wide text-white/80">올인원 마케팅 플랫폼</p>
          <h2 className="mt-5 text-[46px] font-extrabold leading-[1.22] tracking-tight">
            복잡한 마케팅,<br />
            한 곳에서 간편하게
          </h2>
          <p className="mt-5 text-[18px] leading-relaxed text-white/70 max-w-[540px]">
            리뷰·순위·광고·리워드까지 하나로.
            광고주도 대행사도, BLUE EGG biz에서 여러 채널의 캠페인을 더 쉽고 편하게 관리하세요.
          </p>

          <ul className="mt-9 space-y-4">
            {[
              { t: "여러 채널·브랜드 한 번에 관리", d: "플레이스·쇼핑 캠페인을 한 대시보드에서" },
              { t: "실시간 성과를 한눈에", d: "진행률·전환을 투명하게 확인" },
              { t: "정산·세금계산서 자동화", d: "증빙까지 손 안 대고 처리" },
            ].map((f) => (
              <li key={f.t} className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#6BE3B4]/20 ring-1 ring-inset ring-[#6BE3B4]/40">
                  <svg className="h-3.5 w-3.5 text-[#6BE3B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div>
                  <p className="text-[17px] font-bold text-white">{f.t}</p>
                  <p className="text-[14.5px] text-white/55">{f.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* 하단: 신뢰 지표 */}
        <div className="relative flex items-center gap-9 border-t border-white/12 pt-7">
          {[
            { v: "12,000+", l: "누적 캠페인" },
            { v: "4.9/5", l: "고객 만족도" },
            { v: "24h", l: "평균 응대" },
          ].map((s) => (
            <div key={s.l}>
              <p className="text-[24px] font-extrabold leading-none tabular-nums">{s.v}</p>
              <p className="mt-1.5 text-[13.5px] text-white/55">{s.l}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* ── 우측 폼 ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 overflow-y-auto">
      <div className="w-full max-w-[460px]">
        {/* Logo (모바일 전용 — 좌측 배너 숨김 시) */}
        <Link href="/marketing" className="flex justify-center mb-8 lg:hidden">
          <Logo markClassName="h-9 w-auto" textClassName="h-5.5 w-auto" textColor="text-brand-dark" />
        </Link>

        <h1 className="text-[28px] font-extrabold text-brand-dark mb-1 tracking-tight">계정 만들기</h1>
        <p className="text-[15px] text-brand-sub mb-7">여러 채널의 마케팅을 한 곳에서 편하게 관리하세요</p>

        <form className="space-y-7" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 text-[15px] text-brand-error bg-brand-error-bg rounded-2xl border border-red-100">
              {error}
            </div>
          )}

          {/* ── 계정 정보 ── */}
          <section className="space-y-4">
            <p className="text-[13px] font-bold text-brand-muted tracking-wide">계정 정보</p>

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
                  className="shrink-0 px-4 rounded-xl border border-brand-primary text-brand-primary font-bold text-[14px] hover:bg-brand-primary/5 transition-colors disabled:opacity-40 whitespace-nowrap"
                >
                  {checkState === "checking" ? "확인 중..." : "중복확인"}
                </button>
              </div>
              {checkState === "available" && (
                <p className="mt-1.5 text-[12px] font-semibold text-green-600 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  사용 가능한 아이디입니다.
                </p>
              )}
              {checkState === "taken" && (
                <p className="mt-1.5 text-[12px] font-semibold text-red-500 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  이미 사용 중인 아이디입니다.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="password" className={labelCls}>비밀번호 {req}</label>
                <input id="password" name="password" type="password" required placeholder="6자 이상" className={inputCls} />
              </div>
              <div>
                <label htmlFor="passwordConfirm" className={labelCls}>비밀번호 확인 {req}</label>
                <input id="passwordConfirm" name="passwordConfirm" type="password" required placeholder="비밀번호 재입력" className={inputCls} />
              </div>
            </div>
          </section>

          {/* ── 담당자 정보 ── */}
          <section className="space-y-4">
            <p className="text-[13px] font-bold text-brand-muted tracking-wide">담당자 정보</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <p className="mt-1 text-[12px] text-brand-muted">세금계산서·정산 안내가 이 이메일로 발송됩니다.</p>
            </div>
          </section>

          {/* ── 조직 정보 ── */}
          <section className="space-y-4">
            <p className="text-[13px] font-bold text-brand-muted tracking-wide">조직 정보</p>

            <div>
              <label htmlFor="orgName" className={labelCls}>조직명 (회사명) {req}</label>
              <input id="orgName" name="orgName" type="text" required placeholder="주식회사 블루에그" className={inputCls} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="orgType" className={labelCls}>조직 유형 {req}</label>
                <div className="relative">
                  <select id="orgType" name="orgType" required defaultValue="대행사" className={`${inputCls} appearance-none pr-9 cursor-pointer`}>
                    <option value="대행사">대행사</option>
                    <option value="광고주(직접)">광고주(직접)</option>
                    <option value="개인사업자">개인사업자</option>
                    <option value="법인사업자">법인사업자</option>
                    <option value="기타">기타</option>
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div>
                <label htmlFor="bizNumber" className={labelCls}>사업자등록번호</label>
                <input id="bizNumber" name="bizNumber" type="text" inputMode="numeric" value={biz} onChange={(e) => setBiz(formatBiz(e.target.value))} placeholder="000-00-00000" className={inputCls} />
              </div>
            </div>
            <p className="text-[12px] text-brand-muted -mt-1 flex items-start gap-1">
              <svg className="w-3.5 h-3.5 shrink-0 mt-[1px] text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              세금계산서 발행을 위해 사업자등록번호를 정확히 입력해 주세요. (미보유 시 비워두셔도 됩니다.)
            </p>

            {/* 업태 / 업종 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  className="flex items-center gap-3 px-4 py-3.5 border border-dashed border-brand-border rounded-xl bg-brand-lighter hover:border-brand-primary hover:bg-white transition-all cursor-pointer"
                >
                  <span className="h-9 w-9 rounded-lg bg-white border border-brand-border flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-brand-dark">파일 선택</p>
                    <p className="text-[12px] text-brand-muted">JPG, PNG, PDF · 최대 10MB</p>
                  </div>
                </label>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 border border-brand-border rounded-xl bg-brand-lighter">
                  <span className="h-9 w-9 rounded-lg bg-white border border-brand-border flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <p className="text-[14px] font-semibold text-brand-dark truncate flex-1 min-w-0">{bizFileName}</p>
                  <label htmlFor="bizFile" className="shrink-0 text-[13px] font-semibold text-brand-primary hover:underline cursor-pointer">변경</label>
                  <button
                    type="button"
                    onClick={() => {
                      setBizFileName(null);
                      const input = document.getElementById("bizFile") as HTMLInputElement | null;
                      if (input) input.value = "";
                    }}
                    className="shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-brand-muted hover:bg-red-50 hover:text-red-500 transition-colors"
                    aria-label="첨부 삭제"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              )}
              <p className="mt-1.5 text-[12px] text-brand-muted">사업자 인증 시 세금계산서 발행·정산이 원활합니다.</p>
            </div>
          </section>

          {/* ── 약관 동의 ── */}
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input type="checkbox" name="agree" className="mt-0.5 h-4.5 w-4.5 rounded accent-brand-primary shrink-0" />
            <span className="text-[13px] text-brand-sub leading-relaxed">
              <Link href="/terms" className="font-semibold text-brand-primary hover:underline">이용약관</Link> 및{" "}
              <Link href="/privacy" className="font-semibold text-brand-primary hover:underline">개인정보 처리방침</Link>에 동의합니다.
            </span>
          </label>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-4 rounded-2xl text-[16px] font-bold text-white bg-brand-primary hover:bg-brand-primary-hover active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "계정 생성 중..." : "가입하기"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-brand-border text-center">
          <p className="text-[15px] text-brand-sub">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="font-semibold text-brand-primary hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
