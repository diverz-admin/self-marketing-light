"use client";

import React, { useState } from "react";
import PageHeader from "@/components/marketing/PageHeader";

/* ── 문의 채널 ── */
const CHANNELS = [
  {
    label: "카카오톡 상담",
    value: "@blueegg",
    desc: "평일 09:00 – 18:00 실시간 상담",
    grad: "linear-gradient(135deg,#FEE500,#F5C000)",
    iconColor: "#3C1E1E",
    icon: "M12 3C6.477 3 2 6.463 2 10.735c0 2.746 1.86 5.155 4.657 6.52-.205.7-.74 2.53-.847 2.922-.132.486.178.48.375.35.155-.104 2.466-1.674 3.466-2.353.44.062.89.095 1.349.095 5.523 0 10-3.463 10-7.734C21 6.463 17.523 3 12 3z",
  },
  {
    label: "전화 상담",
    value: "1600-0000",
    desc: "평일 09:00 – 18:00 (점심 12:00 – 13:00)",
    grad: "linear-gradient(135deg,#2E6BE0,#1D4ED8)",
    iconColor: "#FFFFFF",
    icon: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z",
  },
  {
    label: "이메일 문의",
    value: "help@blueegg.biz",
    desc: "24시간 접수 · 영업일 기준 1일 내 회신",
    grad: "linear-gradient(135deg,#0D3473,#111D37)",
    iconColor: "#FFFFFF",
    icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",
  },
];

const CATEGORIES = ["서비스 이용", "결제·포인트", "캠페인 문의", "제휴 문의", "기타"];

export default function SupportPage() {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const canSubmit = title.trim() && content.trim() && email.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 700));
    setSending(false);
    setDone(true);
  };

  return (
    <div className="w-full space-y-6">
      {/* 헤더 */}
      <PageHeader
        title="고객지원"
        subtitle="궁금한 점이나 도움이 필요하시면 편한 방법으로 문의해 주세요."
        iconPath={"M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"}
      />

      {/* 문의 채널 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CHANNELS.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-brand-border p-5 flex flex-col gap-3">
            <span className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: c.grad }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={c.iconColor} strokeWidth={1.9}>
                <path strokeLinecap="round" strokeLinejoin="round" d={c.icon} />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-brand-muted">{c.label}</p>
              <p className="text-[19px] font-extrabold text-brand-dark leading-tight mt-0.5 truncate">{c.value}</p>
              <p className="text-[12.5px] text-brand-sub mt-1 leading-snug">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 1:1 문의 폼 */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
        <div className="px-6 md:px-8 py-5 border-b border-brand-border">
          <h2 className="text-[18px] font-extrabold text-brand-dark">1:1 문의 남기기</h2>
          <p className="text-[14px] text-brand-sub mt-0.5">접수해 주시면 영업일 기준 1일 이내에 답변드립니다.</p>
        </div>

        {done ? (
          <div className="px-6 py-16 flex flex-col items-center text-center gap-3">
            <div className="h-14 w-14 rounded-full bg-green-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-[19px] font-extrabold text-brand-dark">문의가 접수되었습니다</p>
            <p className="text-[15px] text-brand-sub">입력하신 이메일로 답변을 보내드리겠습니다.</p>
            <button
              onClick={() => { setDone(false); setTitle(""); setContent(""); setEmail(""); setCategory(CATEGORIES[0]); }}
              className="mt-2 px-5 py-2.5 rounded-xl text-[15px] font-bold border border-brand-border bg-white text-brand-text hover:bg-brand-lighter transition-colors"
            >
              새 문의 작성
            </button>
          </div>
        ) : (
          <div className="px-6 md:px-8 py-6 space-y-5">
            {/* 문의 유형 */}
            <div>
              <label className="block text-[14px] font-bold text-brand-dark mb-2">문의 유형</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl text-[13px] font-bold border transition-all ${
                      category === cat
                        ? "bg-brand-primary text-white border-brand-primary"
                        : "bg-white text-brand-sub border-brand-border hover:bg-brand-lighter"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-[14px] font-bold text-brand-dark mb-2">답변받을 이메일 <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-[46px] px-4 border border-brand-border rounded-xl text-[15px] text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
              />
            </div>

            {/* 제목 */}
            <div>
              <label className="block text-[14px] font-bold text-brand-dark mb-2">제목 <span className="text-red-500">*</span></label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="문의 제목을 입력해주세요"
                className="w-full h-[46px] px-4 border border-brand-border rounded-xl text-[15px] text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
              />
            </div>

            {/* 내용 */}
            <div>
              <label className="block text-[14px] font-bold text-brand-dark mb-2">문의 내용 <span className="text-red-500">*</span></label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                placeholder="문의하실 내용을 자세히 작성해주세요."
                className="w-full px-4 py-3 border border-brand-border rounded-xl text-[15px] leading-relaxed text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || sending}
              className="w-full py-3.5 rounded-xl text-[16px] font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg,#1B3160,#2E6BE0)" }}
            >
              {sending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  접수 중...
                </>
              ) : "문의 접수하기"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
