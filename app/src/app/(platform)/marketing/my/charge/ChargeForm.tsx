"use client";

import { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/marketing/PageHeader";
import { requestPointCharge } from "../../actions";
import { pointChargeStatusMeta } from "@/lib/admin-format";
import type { PointChargeRow } from "@/lib/points";

type Tab = "transfer" | "card";

function formatBiz(v: string) {
  const d = v.replace(/[^0-9]/g, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
}

const emptyTax = {
  bizNumber: "", companyName: "", ownerName: "", zipCode: "",
  address: "", bizCondition: "", bizCategory: "", email: "",
};

export default function ChargeForm({ balance, history }: { balance: number; history: PointChargeRow[] }) {
  // 승인된 충전만 누적으로 센다 (신청·반려 건은 제외)
  const totalCharged = history
    .filter((h) => h.status === "approved")
    .reduce((sum, h) => sum + h.amount + h.bonusAmount, 0);

  const [tab, setTab] = useState<Tab>("transfer");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [name, setName] = useState("");
  const [points, setPoints] = useState("");

  // 세금계산서 발행 요청
  const [taxInvoice, setTaxInvoice] = useState(false);
  const [tax, setTax] = useState(emptyTax);

  const pointNum = parseInt(points.replace(/,/g, ""), 10) || 0;
  const totalAmount = Math.floor(pointNum * 1.1);

  function handlePointsChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    const num = parseInt(raw, 10);
    setPoints(raw === "" ? "" : num.toLocaleString());
  }

  function loadMemberInfo() {
    // 데모: 실제로는 회원 프로필에서 조회
    setTax({
      bizNumber: "174-88-03266",
      companyName: "(주)다이버즈",
      ownerName: "전재민",
      zipCode: "10390",
      address: "경기도 고양시 일산동구 백마로 195, 5007호",
      bizCondition: "서비스업",
      bizCategory: "광고대행업",
      email: "eggcorp2024@gmail.com",
    });
  }

  const taxValid =
    !taxInvoice ||
    (tax.bizNumber.trim() && tax.companyName.trim() && tax.ownerName.trim() && tax.address.trim() && tax.email.trim());

  // 신청은 "입금대기"로 접수되고, 관리자가 입금 확인 후 승인해야 포인트가 올라간다
  async function handleCharge() {
    setResult(null);
    setPending(true);
    const res = await requestPointCharge({
      amount: pointNum,
      depositorName: name,
      receiptType: taxInvoice ? "tax_invoice" : "none",
      taxInfo: taxInvoice ? tax : undefined,
    });
    setPending(false);

    if ("error" in res) {
      setResult({ ok: false, text: res.error });
      return;
    }
    setResult({ ok: true, text: "충전 신청이 접수되었습니다. 입금 확인 후 포인트가 적립됩니다." });
    setName("");
    setPoints("");
  }

  return (
    <div className="w-full py-8 space-y-6">
      <PageHeader title="포인트 충전" subtitle="포인트를 충전하고 캠페인에 사용하세요." iconPath={"M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"} />
      <div className="flex gap-6 items-start">

      {/* 메인 콘텐츠 */}
      <div className="flex-1 min-w-0 space-y-4">

        {/* 탭 */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab("transfer")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[16px] font-bold transition-all"
            style={
              tab === "transfer"
                ? { background: "#111D37", color: "#fff" }
                : { background: "#fff", color: "#5B6472", border: "1px solid #E2E6ED" }
            }
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l9-3 9 3M3 6v13a1 1 0 001 1h16a1 1 0 001-1V6M3 6h18M9 12h6M9 16h6" />
            </svg>
            계좌 이체
          </button>
          <button
            onClick={() => setTab("card")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[16px] font-bold transition-all"
            style={
              tab === "card"
                ? { background: "#111D37", color: "#fff" }
                : { background: "#fff", color: "#5B6472", border: "1px solid #E2E6ED" }
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
                <span className="text-[18px] font-extrabold text-brand-dark">계좌 이체</span>
              </div>

              {/* 입금자 성명 */}
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="입금자 성명 입력"
                className="w-full px-4 py-3.5 rounded-xl border border-brand-border text-[16px] text-brand-dark placeholder:text-brand-muted focus:outline-none focus:border-brand-primary transition-colors"
              />

              {/* 요청 포인트 */}
              <input
                type="text"
                inputMode="numeric"
                value={points}
                onChange={handlePointsChange}
                placeholder="요청 포인트 입력"
                className="w-full px-4 py-3.5 rounded-xl border border-brand-border text-[16px] text-brand-dark placeholder:text-brand-muted focus:outline-none focus:border-brand-primary transition-colors"
              />

              {/* 빠른 선택 */}
              <div className="flex gap-2 flex-wrap">
                {[10000, 30000, 50000, 100000].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPoints(p.toLocaleString())}
                    className="px-3 py-1.5 rounded-lg border border-brand-border text-[13px] font-bold text-brand-sub hover:border-brand-primary hover:text-brand-primary transition-colors"
                  >
                    +{p.toLocaleString()}P
                  </button>
                ))}
              </div>

              {/* 충족 금액 */}
              <p className="text-[16px] text-brand-dark">
                충족 금액 :{" "}
                <span className="font-extrabold text-brand-dark text-[18px]">
                  {totalAmount.toLocaleString()}
                </span>
                원{" "}
                <span className="text-[15px] font-semibold" style={{ color: "#E53935" }}>
                  부가세 10% 포함
                </span>
              </p>

              {/* 계좌 정보 */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-lighter border border-brand-border">
                <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                  <span className="text-white text-[11px] font-extrabold">신한</span>
                </div>
                <p className="text-[16px] text-brand-dark flex-1 min-w-0">
                  신한은행{" "}
                  <span className="font-extrabold underline underline-offset-2">140-015-056200</span>{" "}
                  (주)BlueEgg
                </p>
                <button
                  onClick={() => navigator.clipboard?.writeText("140-015-056200")}
                  className="shrink-0 px-2.5 py-1 rounded-lg text-[12px] font-bold text-brand-primary bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  복사
                </button>
              </div>

              {/* 세금계산서 발행 요청 */}
              <div className="space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
                  <input
                    type="checkbox"
                    checked={taxInvoice}
                    onChange={(e) => setTaxInvoice(e.target.checked)}
                    className="h-5 w-5 rounded accent-brand-primary shrink-0"
                  />
                  <span className="text-[16px] font-bold text-brand-dark">세금계산서 발행 요청</span>
                </label>

                {taxInvoice && (
                  <div className="rounded-2xl border border-brand-border overflow-hidden">
                    {/* 헤더 */}
                    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-brand-border" style={{ background: "#EFF4FD" }}>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <span className="text-[15px] font-extrabold text-brand-dark">공급받는자 정보</span>
                      </div>
                      <button
                        type="button"
                        onClick={loadMemberInfo}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold text-brand-primary bg-white border border-brand-primary/40 hover:bg-brand-primary/5 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                        </svg>
                        회원 정보 불러오기
                      </button>
                    </div>

                    {/* 폼 */}
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[13.5px] font-semibold text-brand-dark mb-1.5">사업자등록번호 <span className="text-red-500">*</span></label>
                        <input value={tax.bizNumber} onChange={(e) => setTax((p) => ({ ...p, bizNumber: formatBiz(e.target.value) }))} inputMode="numeric" placeholder="000-00-00000" className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-lighter text-[15px] text-brand-dark placeholder:text-brand-muted focus:outline-none focus:border-brand-primary focus:bg-white transition-all" />
                      </div>
                      <div>
                        <label className="block text-[13.5px] font-semibold text-brand-dark mb-1.5">상호 <span className="text-red-500">*</span></label>
                        <input value={tax.companyName} onChange={(e) => setTax((p) => ({ ...p, companyName: e.target.value }))} placeholder="(주)블루에그" className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-lighter text-[15px] text-brand-dark placeholder:text-brand-muted focus:outline-none focus:border-brand-primary focus:bg-white transition-all" />
                      </div>
                      <div>
                        <label className="block text-[13.5px] font-semibold text-brand-dark mb-1.5">성명 <span className="text-red-500">*</span></label>
                        <input value={tax.ownerName} onChange={(e) => setTax((p) => ({ ...p, ownerName: e.target.value }))} placeholder="대표자 성명" className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-lighter text-[15px] text-brand-dark placeholder:text-brand-muted focus:outline-none focus:border-brand-primary focus:bg-white transition-all" />
                      </div>
                      <div>
                        <label className="block text-[13.5px] font-semibold text-brand-dark mb-1.5">우편번호</label>
                        <input value={tax.zipCode} onChange={(e) => setTax((p) => ({ ...p, zipCode: e.target.value.replace(/[^0-9]/g, "").slice(0, 5) }))} inputMode="numeric" placeholder="00000" className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-lighter text-[15px] text-brand-dark placeholder:text-brand-muted focus:outline-none focus:border-brand-primary focus:bg-white transition-all" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[13.5px] font-semibold text-brand-dark mb-1.5">주소 <span className="text-red-500">*</span></label>
                        <input value={tax.address} onChange={(e) => setTax((p) => ({ ...p, address: e.target.value }))} placeholder="사업장 주소" className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-lighter text-[15px] text-brand-dark placeholder:text-brand-muted focus:outline-none focus:border-brand-primary focus:bg-white transition-all" />
                      </div>
                      <div>
                        <label className="block text-[13.5px] font-semibold text-brand-dark mb-1.5">업태</label>
                        <input value={tax.bizCondition} onChange={(e) => setTax((p) => ({ ...p, bizCondition: e.target.value }))} placeholder="예) 서비스업" className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-lighter text-[15px] text-brand-dark placeholder:text-brand-muted focus:outline-none focus:border-brand-primary focus:bg-white transition-all" />
                      </div>
                      <div>
                        <label className="block text-[13.5px] font-semibold text-brand-dark mb-1.5">업종</label>
                        <input value={tax.bizCategory} onChange={(e) => setTax((p) => ({ ...p, bizCategory: e.target.value }))} placeholder="예) 광고대행업" className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-lighter text-[15px] text-brand-dark placeholder:text-brand-muted focus:outline-none focus:border-brand-primary focus:bg-white transition-all" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[13.5px] font-semibold text-brand-dark mb-1.5">이메일 <span className="text-red-500">*</span></label>
                        <input value={tax.email} onChange={(e) => setTax((p) => ({ ...p, email: e.target.value }))} type="email" placeholder="세금계산서 수신 이메일" className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-lighter text-[15px] text-brand-dark placeholder:text-brand-muted focus:outline-none focus:border-brand-primary focus:bg-white transition-all" />
                        <p className="mt-1.5 text-[12px] text-brand-muted">입력하신 이메일로 세금계산서가 발송됩니다.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {result && (
                <p className={`rounded-xl px-4 py-3 text-[14px] font-semibold ${result.ok ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                  {result.text}
                </p>
              )}

              {/* 충전 요청 버튼 */}
              <button
                onClick={handleCharge}
                disabled={pending || !name.trim() || pointNum < 10000 || !taxValid}
                className="w-full py-4 rounded-xl text-[17px] font-extrabold text-white transition-opacity disabled:opacity-40"
                style={{ background: "#111D37" }}
              >
                {pending ? "신청 중…" : "포인트 충전 요청"}
              </button>

              {/* 주의사항 */}
              <div className="rounded-2xl p-5 space-y-4" style={{ background: "#F5F6F8", border: "1px solid #E2E6ED" }}>

                <div className="space-y-2">
                  <span className="inline-block text-[12px] font-extrabold px-2.5 py-1 rounded-full" style={{ background: "#DCE7FB", color: "#2E6BE0" }}>
                    주의 사항
                  </span>
                  <ul className="space-y-1.5 pl-1">
                    <li className="text-[15px] text-brand-dark">
                      - 최소 충전 포인트 : <span className="font-extrabold">10,000</span>
                    </li>
                    <li className="text-[15px] text-brand-sub">
                      - 세금계산서가 필요하면 위 <span className="font-semibold text-brand-dark">세금계산서 발행 요청</span>에 체크 후 정보를 입력해 주세요.
                    </li>
                  </ul>
                </div>

                <div className="h-px" style={{ background: "#E2E6ED" }} />

                <div className="space-y-2">
                  <span className="inline-block text-[12px] font-extrabold px-2.5 py-1 rounded-full" style={{ background: "#FEE2E2", color: "#DC2626" }}>
                    충전이 안돼요
                  </span>
                  <ul className="space-y-1.5 pl-1">
                    <li className="text-[15px] text-brand-dark font-semibold">
                      - 입금자명을 정확하게 입력해주셔야 자동 충전 됩니다.
                    </li>
                    <li className="text-[15px] text-brand-dark font-semibold">
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
            <p className="text-[18px] font-extrabold text-brand-dark mb-1">카드 결제 준비 중</p>
            <p className="text-[15px] text-brand-sub">현재 계좌 이체만 지원됩니다. 카드 결제는 곧 오픈 예정입니다.</p>
          </div>
        )}

      </div>

      {/* 우측 패널 - 결제 내역 */}
      <div className="hidden lg:block w-64 xl:w-72 shrink-0 sticky" style={{ top: "92px" }}>
        <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">

          {/* 잔액 헤더 */}
          <div className="px-5 pt-5 pb-4" style={{ background: "linear-gradient(135deg,#111D37,#2D3748)" }}>
            <p className="text-[12px] font-bold text-white/60 mb-1">현재 포인트 잔액</p>
            <p className="text-[29px] font-extrabold text-white leading-tight">
              {balance.toLocaleString()}
              <span className="text-[17px] font-bold text-white/70 ml-1">P</span>
            </p>
            <p className="text-[12px] text-white/50 mt-1">
              누적 충전 {totalCharged.toLocaleString()}P
            </p>
          </div>

          {/* 결제 내역 타이틀 */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <span className="text-[15px] font-extrabold text-brand-dark">결제 내역</span>
            <span className="text-[12px] text-brand-sub">최근 5건</span>
          </div>

          {/* 내역 리스트 */}
          <div className="px-3 pb-3 space-y-0.5">
            {history.length === 0 ? (
              <p className="px-3 py-6 text-center text-[13px] text-brand-muted">충전 내역이 없습니다.</p>
            ) : (
              history.slice(0, 5).map((h) => {
                const meta = pointChargeStatusMeta[h.status];
                return (
                  <div
                    key={h.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-brand-lighter transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-[15px] font-bold text-brand-dark">
                        +{(h.amount + h.bonusAmount).toLocaleString()}P
                      </p>
                      <p className="text-[12px] text-brand-sub">{h.date}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-[13px] font-semibold text-brand-dark">
                        {Math.floor(h.amount * 1.1).toLocaleString()}원
                      </p>
                      <span className="inline-block text-[11px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 bg-brand-lighter text-brand-sub">
                        {meta?.label ?? h.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 전체 내역 보기 */}
          <div className="px-4 pb-4 pt-2">
            <div className="h-px bg-brand-border mb-3" />
            <button className="w-full py-2.5 rounded-xl border border-brand-border text-[13px] font-bold text-brand-sub hover:border-brand-primary hover:text-brand-primary transition-colors">
              전체 내역 보기
            </button>
          </div>

        </div>
      </div>

      </div>
    </div>
  );
}
