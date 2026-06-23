"use client";

import { useState } from "react";
import Link from "next/link";

type Tab = "transfer" | "card";

const MOCK_HISTORY = [
  { id: 1, date: "2026.06.20", points: 50000, amount: 55000, status: "완료" },
  { id: 2, date: "2026.06.15", points: 30000, amount: 33000, status: "완료" },
  { id: 3, date: "2026.06.10", points: 100000, amount: 110000, status: "완료" },
  { id: 4, date: "2026.06.03", points: 10000, amount: 11000, status: "완료" },
  { id: 5, date: "2026.05.28", points: 50000, amount: 55000, status: "완료" },
];

const TOTAL_CHARGED = MOCK_HISTORY.reduce((s, h) => s + h.points, 0);
const CURRENT_BALANCE = 87300;

export default function ChargePage() {
  const [tab, setTab] = useState<Tab>("transfer");
  const [name, setName] = useState("");
  const [points, setPoints] = useState("");

  const pointNum = parseInt(points.replace(/,/g, ""), 10) || 0;
  const totalAmount = Math.floor(pointNum * 1.1);

  function handlePointsChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    const num = parseInt(raw, 10);
    setPoints(raw === "" ? "" : num.toLocaleString());
  }

  return (
    <div className="w-full flex gap-6 items-start py-8">

      {/* 메인 콘텐츠 */}
      <div className="flex-1 min-w-0 space-y-4">

        {/* 브레드크럼 */}
        <nav className="flex items-center gap-1.5 text-[13px] text-brand-sub">
          <Link href="/marketing" className="hover:text-brand-text">대시보드</Link>
          <span>›</span>
          <span className="text-brand-text font-medium">포인트 충전</span>
        </nav>

        {/* 탭 */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab("transfer")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-bold transition-all"
            style={
              tab === "transfer"
                ? { background: "#191F28", color: "#fff" }
                : { background: "#fff", color: "#6B7684", border: "1px solid #E5E8EB" }
            }
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l9-3 9 3M3 6v13a1 1 0 001 1h16a1 1 0 001-1V6M3 6h18M9 12h6M9 16h6" />
            </svg>
            계좌 이체
          </button>
          <button
            onClick={() => setTab("card")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-bold transition-all"
            style={
              tab === "card"
                ? { background: "#191F28", color: "#fff" }
                : { background: "#fff", color: "#6B7684", border: "1px solid #E5E8EB" }
            }
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
            카드 결제
          </button>
        </div>

        {/* 탭 콘텐츠 */}
        {tab === "transfer" ? (
          <div className="bg-white rounded-2xl border border-brand-border">
            <div className="px-6 pt-6 pb-8 space-y-5">

              {/* 섹션 타이틀 */}
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l9-3 9 3M3 6v13a1 1 0 001 1h16a1 1 0 001-1V6M3 6h18M9 12h6M9 16h6" />
                </svg>
                <span className="text-[16px] font-extrabold text-brand-dark">계좌 이체</span>
              </div>

              {/* 입금자 성명 */}
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="입금자 성명 입력"
                className="w-full px-4 py-3.5 rounded-xl border border-brand-border text-[14px] text-brand-dark placeholder:text-brand-muted focus:outline-none focus:border-brand-primary transition-colors"
              />

              {/* 요청 포인트 */}
              <input
                type="text"
                inputMode="numeric"
                value={points}
                onChange={handlePointsChange}
                placeholder="요청 포인트 입력"
                className="w-full px-4 py-3.5 rounded-xl border border-brand-border text-[14px] text-brand-dark placeholder:text-brand-muted focus:outline-none focus:border-brand-primary transition-colors"
              />

              {/* 빠른 선택 */}
              <div className="flex gap-2 flex-wrap">
                {[10000, 30000, 50000, 100000].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPoints(p.toLocaleString())}
                    className="px-3 py-1.5 rounded-lg border border-brand-border text-[12px] font-bold text-brand-sub hover:border-brand-primary hover:text-brand-primary transition-colors"
                  >
                    +{p.toLocaleString()}P
                  </button>
                ))}
              </div>

              {/* 충족 금액 */}
              <p className="text-[14px] text-brand-dark">
                충족 금액 :{" "}
                <span className="font-extrabold text-brand-dark text-[16px]">
                  {totalAmount.toLocaleString()}
                </span>
                원{" "}
                <span className="text-[13px] font-semibold" style={{ color: "#E53935" }}>
                  부가세 10% 포함
                </span>
              </p>

              {/* 계좌 정보 */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-lighter border border-brand-border">
                <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                  <span className="text-white text-[10px] font-extrabold">신한</span>
                </div>
                <p className="text-[14px] text-brand-dark flex-1 min-w-0">
                  신한은행{" "}
                  <span className="font-extrabold underline underline-offset-2">140-015-056200</span>{" "}
                  (주)다이버즈
                </p>
                <button
                  onClick={() => navigator.clipboard?.writeText("140-015-056200")}
                  className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold text-brand-primary bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  복사
                </button>
              </div>

              {/* 충전 요청 버튼 */}
              <button
                disabled={!name.trim() || pointNum < 10000}
                className="w-full py-4 rounded-xl text-[15px] font-extrabold text-white transition-opacity disabled:opacity-40"
                style={{ background: "#191F28" }}
              >
                포인트 충전 요청
              </button>

              {/* 주의사항 */}
              <div className="rounded-2xl p-5 space-y-4" style={{ background: "#F5F3FF", border: "1px solid #EDE9FE" }}>

                <div className="space-y-2">
                  <span className="inline-block text-[11px] font-extrabold px-2.5 py-1 rounded-full" style={{ background: "#EDE9FE", color: "#7C3AED" }}>
                    주의 사항
                  </span>
                  <ul className="space-y-1.5 pl-1">
                    <li className="text-[13px] text-brand-dark">
                      - 최소 충전 포인트 : <span className="font-extrabold">10,000</span>
                    </li>
                    <li className="text-[13px] text-brand-sub">
                      - 세금계산서 발행 정보는 상담 채널로 전달주세요.
                    </li>
                  </ul>
                </div>

                <div className="h-px" style={{ background: "#DDD6FE" }} />

                <div className="space-y-2">
                  <span className="inline-block text-[11px] font-extrabold px-2.5 py-1 rounded-full" style={{ background: "#FEE2E2", color: "#DC2626" }}>
                    충전이 안돼요
                  </span>
                  <ul className="space-y-1.5 pl-1">
                    <li className="text-[13px] text-brand-dark font-semibold">
                      - 입금자명을 정확하게 입력해주셔야 자동 충전 됩니다.
                    </li>
                    <li className="text-[13px] text-brand-dark font-semibold">
                      - 포인트 충전 요청 후 → 계좌 이체
                    </li>
                  </ul>
                </div>

              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-brand-border p-10 text-center">
            <div className="h-14 w-14 rounded-2xl bg-brand-lighter flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <p className="text-[16px] font-extrabold text-brand-dark mb-1">카드 결제 준비 중</p>
            <p className="text-[13px] text-brand-sub">현재 계좌 이체만 지원됩니다. 카드 결제는 곧 오픈 예정입니다.</p>
          </div>
        )}

      </div>

      {/* 우측 패널 - 결제 내역 */}
      <div className="hidden lg:block w-64 xl:w-72 shrink-0 sticky" style={{ top: "92px" }}>
        <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">

          {/* 잔액 헤더 */}
          <div className="px-5 pt-5 pb-4" style={{ background: "linear-gradient(135deg,#191F28,#2D3748)" }}>
            <p className="text-[11px] font-bold text-white/60 mb-1">현재 포인트 잔액</p>
            <p className="text-[26px] font-extrabold text-white leading-tight">
              {CURRENT_BALANCE.toLocaleString()}
              <span className="text-[15px] font-bold text-white/70 ml-1">P</span>
            </p>
            <p className="text-[11px] text-white/50 mt-1">
              누적 충전 {TOTAL_CHARGED.toLocaleString()}P
            </p>
          </div>

          {/* 결제 내역 타이틀 */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <span className="text-[13px] font-extrabold text-brand-dark">결제 내역</span>
            <span className="text-[11px] text-brand-sub">최근 5건</span>
          </div>

          {/* 내역 리스트 */}
          <div className="px-3 pb-3 space-y-0.5">
            {MOCK_HISTORY.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-brand-lighter transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-brand-dark">
                    +{h.points.toLocaleString()}P
                  </p>
                  <p className="text-[11px] text-brand-sub">{h.date}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-[12px] font-semibold text-brand-dark">
                    {h.amount.toLocaleString()}원
                  </p>
                  <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-0.5" style={{ background: "#DCFCE7", color: "#16A34A" }}>
                    {h.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 전체 내역 보기 */}
          <div className="px-4 pb-4 pt-2">
            <div className="h-px bg-brand-border mb-3" />
            <button className="w-full py-2.5 rounded-xl border border-brand-border text-[12px] font-bold text-brand-sub hover:border-brand-primary hover:text-brand-primary transition-colors">
              전체 내역 보기
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
