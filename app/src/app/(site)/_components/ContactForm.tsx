"use client";

import React, { useState } from "react";
import Link from "next/link";

const TYPES = [
  "유입·리뷰·순위 마케팅",
  "콘텐츠·디자인·홈페이지 제작",
];

const BUDGETS = [
  "월 100만원 미만",
  "월 100 ~ 300만원",
  "월 300 ~ 500만원",
  "월 500만원 이상",
];

const CONTACT_EMAIL = "help@blueegg.example"; // TODO: 실제 문의 수신 이메일로 교체

export default function ContactForm() {
  const [types, setTypes] = useState<string[]>([]);
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [budget, setBudget] = useState("");
  const [agree, setAgree] = useState(false);

  const toggleType = (t: string) =>
    setTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      alert("개인정보 수집에 동의해주세요.");
      return;
    }
    if (!name || !phone) {
      alert("성함과 연락처를 입력해주세요.");
      return;
    }
    const body = [
      `문의유형: ${types.join(", ") || "-"}`,
      `업체명: ${company || "-"}`,
      `성함: ${name}`,
      `연락처: ${phone}`,
      `예산: ${budget || "-"}`,
    ].join("\n");
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      "[블루에그] 간편 문의"
    )}&body=${encodeURIComponent(body)}`;
  };

  const rowClass =
    "grid grid-cols-[80px_1fr] md:grid-cols-[96px_1fr] items-center gap-4 border-b border-white/15 py-5";
  const labelClass = "text-sm font-bold text-white";
  const inputClass =
    "bg-transparent text-white placeholder-white/40 text-sm outline-none w-full";

  return (
    <form onSubmit={onSubmit} className="w-full">
      {/* 문의유형 */}
      <div className="grid grid-cols-[80px_1fr] md:grid-cols-[96px_1fr] gap-4 border-b border-white/15 py-5">
        <span className={labelClass}>문의유형</span>
        <div className="flex flex-col gap-3">
          {TYPES.map((t) => (
            <label
              key={t}
              className="flex items-center gap-2.5 text-sm text-white cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={types.includes(t)}
                onChange={() => toggleType(t)}
                className="h-4 w-4 accent-electric"
              />
              {t}
            </label>
          ))}
        </div>
      </div>

      {/* 업체명 */}
      <div className={rowClass}>
        <label htmlFor="cf-company" className={labelClass}>업체명</label>
        <input
          id="cf-company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="업체명을 입력해주세요."
          className={inputClass}
        />
      </div>

      {/* 성함 */}
      <div className={rowClass}>
        <label htmlFor="cf-name" className={labelClass}>성함</label>
        <input
          id="cf-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="성함을 입력해주세요."
          className={inputClass}
        />
      </div>

      {/* 연락처 */}
      <div className={rowClass}>
        <label htmlFor="cf-phone" className={labelClass}>연락처</label>
        <input
          id="cf-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="연락처를 입력해주세요."
          className={inputClass}
        />
      </div>

      {/* 예산 */}
      <div className={rowClass}>
        <label htmlFor="cf-budget" className={labelClass}>예산</label>
        <select
          id="cf-budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className={`${inputClass} cursor-pointer [&>option]:text-black ${
            budget ? "text-white" : "text-white/40"
          }`}
        >
          <option value="">마케팅 월 집행 예산을 선택해주세요</option>
          {BUDGETS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* 동의 */}
      <div className="flex items-center justify-between py-6">
        <label className="flex items-center gap-2.5 text-sm text-white cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="h-4 w-4 accent-electric"
          />
          개인정보 수집에 동의합니다.
        </label>
        <Link
          href="/#about"
          className="text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          자세히보기
        </Link>
      </div>

      <button
        type="submit"
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
        style={{ background: "var(--gradient-point-wide)" }}
      >
        간편 문의하기 <span aria-hidden>→</span>
      </button>
    </form>
  );
}
