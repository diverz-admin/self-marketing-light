"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/marketing/PageHeader";
import { toast } from "@/components/ui/toast";
import { requestPointCharge } from "../../actions";
import { pointChargeStatusMeta } from "@/lib/admin-format";
import { POLICY, chargeAmountWithVat } from "@/lib/policy";
import type { PointChargeRow, PointEntryRow } from "@/lib/points";

type Tab = "transfer" | "card";
type HistoryTab = "charge" | "order";

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

/* 입금 계좌 — 화면 표시와 복사 버튼이 같은 값을 봐야 해서 한 곳에 둔다 */
const DEPOSIT_ACCOUNT = {
  bank: "신한은행",
  number: "140-016-569865",
  holder: "(주)다이버즈",
} as const;

const QUICK_POINTS = [10_000, 30_000, 50_000, 100_000];

const CHARGE_STEPS = [
  { title: "충전 요청", desc: "금액·입금자명 입력 후 요청" },
  { title: "계좌 입금", desc: "위 안내 계좌로 이체" },
  { title: "입금 확인", desc: "관리자가 입금 확인·승인" },
  { title: "충전 완료", desc: "포인트 지급" },
] as const;

const HISTORY_TABS: [HistoryTab, string][] = [
  ["charge", "충전 내역"],
  ["order", "주문 내역"],
];

const PERIODS = [
  { key: "1m", label: "1개월", months: 1 },
  { key: "3m", label: "3개월", months: 3 },
  { key: "6m", label: "6개월", months: 6 },
  { key: "all", label: "전체", months: 0 },
] as const;
type PeriodKey = (typeof PERIODS)[number]["key"];

const TONE_CLASS: Record<string, string> = {
  amber: "text-amber-600",
  green: "text-brand-success",
  red: "text-brand-error",
  gray: "text-brand-muted",
};

const BIZ_RE = /^\d{3}-\d{2}-\d{5}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 충전 내역 탭은 충전 신청 행과 조정·회수 원장 줄을 시각순으로 섞어 보여 준다 */
type ChargeListRow =
  | { kind: "charge"; key: string; at: string; item: PointChargeRow }
  | { kind: "entry"; key: string; at: string; entry: PointEntryRow };

function fmtDate(iso: string) {
  return iso.slice(0, 10).replaceAll("-", ".");
}

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** 보안 컨텍스트가 아니면 clipboard API 가 없으므로 textarea 복사로 한 번 더 시도한다 */
function copyText(text: string) {
  const ok = () => toast.success("계좌번호가 복사되었습니다");
  const fail = () => toast.error("복사하지 못했습니다", "길게 눌러 복사해 주세요");
  const fallback = () => {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.top = "-9999px";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    let done = false;
    try {
      done = document.execCommand("copy");
    } catch {}
    document.body.removeChild(el);
    if (done) ok();
    else fail();
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(ok).catch(fallback);
  } else {
    fallback();
  }
}

/** 잘못 입력한 칸으로 커서를 옮기고 안내를 띄운다 */
function focusError(message: string, id: string) {
  toast.error(message);
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.focus({ preventScroll: true });
  }
}

export default function ChargeForm({
  balance,
  history,
  entries,
  initialAmount,
}: {
  balance: number;
  history: PointChargeRow[];
  entries: PointEntryRow[];
  initialAmount: number;
}) {
  const { minCharge, chargeUnit, vatRate } = POLICY.point;

  // 승인된 충전만 누적으로 센다 (신청·반려 건은 제외)
  const totalCharged = history
    .filter((h) => h.status === "approved")
    .reduce((sum, h) => sum + h.amount + h.bonusAmount, 0);

  const orderEntries = useMemo(() => entries.filter((e) => e.group === "order"), [entries]);
  const totalUsed = orderEntries.reduce((sum, e) => sum - e.delta, 0);

  const chargeRows = useMemo<ChargeListRow[]>(
    () =>
      [
        ...history.map((item) => ({ kind: "charge" as const, key: `c-${item.id}`, at: item.at, item })),
        ...entries
          .filter((e) => e.group === "adjust")
          .map((entry) => ({ kind: "entry" as const, key: `e-${entry.id}`, at: entry.at, entry })),
      ].sort((a, b) => b.at.localeCompare(a.at)),
    [history, entries],
  );

  const [tab, setTab] = useState<Tab>("transfer");
  const [pending, setPending] = useState(false);
  const [name, setName] = useState("");
  // 숫자만 담는다 — 화면에는 천 단위 콤마로 보여 준다
  const [points, setPoints] = useState(() =>
    initialAmount > 0 ? String(Math.ceil(initialAmount / chargeUnit) * chargeUnit) : "",
  );

  // 세금계산서 발행 요청
  const [taxInvoice, setTaxInvoice] = useState(false);
  const [tax, setTax] = useState(emptyTax);

  const [historyTab, setHistoryTab] = useState<HistoryTab>("charge");
  const [modalTab, setModalTab] = useState<HistoryTab | null>(null);

  const pointNum = Number(points) || 0;
  // P-00 실입금액 = 요청 포인트 x (1 + 부가세율)
  const totalAmount = chargeAmountWithVat(pointNum);
  const amountValid = pointNum >= minCharge && pointNum % chargeUnit === 0;

  function addPoints(p: number) {
    setPoints(String(pointNum + p));
  }

  // 단위에 맞지 않는 금액은 입력을 마칠 때 단위로 내림한다
  function roundToUnit() {
    const rounded = Math.floor(pointNum / chargeUnit) * chargeUnit;
    setPoints(rounded ? String(rounded) : "");
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
    toast.success("회원 정보를 불러왔습니다", "주소가 맞는지 확인해 주세요");
  }

  const taxValid =
    !taxInvoice ||
    [tax.bizNumber, tax.companyName, tax.ownerName, tax.address, tax.email].every((v) => v.trim());
  const canSubmit = !!name.trim() && amountValid && taxValid;

  // 신청은 "입금대기"로 접수되고, 관리자가 입금 확인 후 승인해야 포인트가 올라간다
  async function handleCharge() {
    if (!name.trim()) return focusError("입금자 성명을 입력해 주세요", "ch-depositor");
    if (!amountValid) {
      return focusError(
        `최소 ${minCharge.toLocaleString()}P 이상, ${chargeUnit.toLocaleString()}P 단위로 입력해 주세요`,
        "ch-amount",
      );
    }
    if (taxInvoice) {
      const missing = (
        [
          [tax.bizNumber, "사업자등록번호", "ch-tax-biz"],
          [tax.companyName, "상호", "ch-tax-company"],
          [tax.ownerName, "성명", "ch-tax-owner"],
          [tax.address, "주소", "ch-tax-address"],
          [tax.email, "이메일", "ch-tax-email"],
        ] as const
      ).find(([v]) => !v.trim());
      if (missing) return focusError(`${missing[1]}을(를) 입력해 주세요`, missing[2]);
      if (!BIZ_RE.test(tax.bizNumber)) {
        return focusError("사업자등록번호를 000-00-00000 형태로 입력해 주세요", "ch-tax-biz");
      }
      if (!EMAIL_RE.test(tax.email.trim())) {
        return focusError("이메일 형식이 올바르지 않습니다 — 「이름@도메인」 형태로 입력해 주세요", "ch-tax-email");
      }
    }

    setPending(true);
    const res = await requestPointCharge({
      amount: pointNum,
      depositorName: name,
      receiptType: taxInvoice ? "tax_invoice" : "none",
      taxInfo: taxInvoice ? tax : undefined,
    });
    setPending(false);

    if ("error" in res) {
      toast.error(res.error);
      return;
    }
    toast.success("충전 요청이 접수되었습니다", "안내 계좌로 입금해 주세요");
    setName("");
    setPoints("");
    setTaxInvoice(false);
    setTax(emptyTax);
  }

  const recentCount = Math.min(historyTab === "charge" ? chargeRows.length : orderEntries.length, 6);

  const inputClass =
    "w-full px-4 py-3.5 rounded-xl border border-brand-border text-[16px] text-brand-dark placeholder:text-brand-muted focus:outline-none focus:border-brand-primary transition-colors";
  const taxInputClass =
    "w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-lighter text-[15px] text-brand-dark placeholder:text-brand-muted focus:outline-none focus:border-brand-primary focus:bg-white transition-all";

  return (
    <div className="w-full py-8 space-y-6">
      <PageHeader title="포인트 충전" subtitle="포인트를 충전하고 캠페인에 사용하세요." iconPath={"M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"} />
      <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-start">

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
              <div>
                <label htmlFor="ch-depositor" className="block text-[14px] font-bold text-brand-sub mb-1.5">
                  입금자 성명 <span className="text-red-500">*</span>
                </label>
                <input
                  id="ch-depositor"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="입금자 성명을 입력하세요"
                  className={inputClass}
                />
              </div>

              {/* 요청 포인트 */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="ch-amount" className="block text-[14px] font-bold text-brand-sub">
                    요청 포인트 <span className="text-red-500">*</span>
                  </label>
                  {pointNum > 0 && (
                    <button
                      type="button"
                      onClick={() => setPoints("")}
                      className="text-[13px] font-bold text-brand-muted underline underline-offset-2 hover:text-red-500 transition-colors"
                    >
                      초기화
                    </button>
                  )}
                </div>
                <input
                  id="ch-amount"
                  type="text"
                  inputMode="numeric"
                  value={pointNum ? pointNum.toLocaleString() : ""}
                  onChange={(e) => setPoints(e.target.value.replace(/[^0-9]/g, ""))}
                  onBlur={roundToUnit}
                  placeholder="충전할 포인트를 입력하세요"
                  className={inputClass}
                />
                <p
                  className={`mt-1.5 pl-1 text-[13px] font-semibold ${
                    pointNum > 0 && !amountValid ? "text-red-500" : "text-brand-muted"
                  }`}
                >
                  최소 {minCharge.toLocaleString()}P · {chargeUnit.toLocaleString()}P 단위로 입력
                </p>
              </div>

              {/* 빠른 선택 — 누를 때마다 더한다 */}
              <div className="flex gap-2 flex-wrap">
                {QUICK_POINTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => addPoints(p)}
                    className="px-3 py-1.5 rounded-lg border border-brand-border text-[13px] font-bold text-brand-sub hover:border-brand-primary hover:text-brand-primary transition-colors"
                  >
                    +{p.toLocaleString()}P
                  </button>
                ))}
              </div>

              {/* 충족 금액 */}
              <p className="text-[16px] text-brand-dark">
                충족 금액 :{" "}
                <span className="font-extrabold text-brand-dark text-[18px] tabular-nums">
                  {totalAmount.toLocaleString()}
                </span>
                원{" "}
                <span className="text-[15px] font-semibold" style={{ color: "#E53935" }}>
                  부가세 {vatRate * 100}% 포함
                </span>
              </p>

              {/* 계좌 정보 */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-lighter border border-brand-border">
                <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                  <span className="text-white text-[11px] font-extrabold">신한</span>
                </div>
                <p className="text-[16px] text-brand-dark flex-1 min-w-0">
                  {DEPOSIT_ACCOUNT.bank}{" "}
                  <span className="font-extrabold underline underline-offset-2 tabular-nums">{DEPOSIT_ACCOUNT.number}</span>{" "}
                  {DEPOSIT_ACCOUNT.holder}
                </p>
                <button
                  type="button"
                  onClick={() => copyText(DEPOSIT_ACCOUNT.number)}
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
                    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-brand-border" style={{ background: "#EFF4FD" }}>
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
                      <p className="basis-full text-[12.5px] text-brand-sub">
                        오후 5시 이전 충전건은 당일 오후 11시 내 계산서가 발행되며, 오후 5시 이후 충전건은 익일 발행됩니다.
                      </p>
                    </div>

                    {/* 폼 */}
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label htmlFor="ch-tax-biz" className="block text-[13.5px] font-semibold text-brand-dark mb-1.5">사업자등록번호 <span className="text-red-500">*</span></label>
                        <input id="ch-tax-biz" value={tax.bizNumber} onChange={(e) => setTax((p) => ({ ...p, bizNumber: formatBiz(e.target.value) }))} inputMode="numeric" maxLength={12} placeholder="000-00-00000" className={taxInputClass} />
                      </div>
                      <div>
                        <label htmlFor="ch-tax-company" className="block text-[13.5px] font-semibold text-brand-dark mb-1.5">상호 <span className="text-red-500">*</span></label>
                        <input id="ch-tax-company" value={tax.companyName} onChange={(e) => setTax((p) => ({ ...p, companyName: e.target.value }))} placeholder="(주)블루에그" className={taxInputClass} />
                      </div>
                      <div>
                        <label htmlFor="ch-tax-owner" className="block text-[13.5px] font-semibold text-brand-dark mb-1.5">성명 <span className="text-red-500">*</span></label>
                        <input id="ch-tax-owner" value={tax.ownerName} onChange={(e) => setTax((p) => ({ ...p, ownerName: e.target.value }))} placeholder="대표자 성명" className={taxInputClass} />
                      </div>
                      <div>
                        <label htmlFor="ch-tax-zip" className="block text-[13.5px] font-semibold text-brand-dark mb-1.5">우편번호</label>
                        <input id="ch-tax-zip" value={tax.zipCode} onChange={(e) => setTax((p) => ({ ...p, zipCode: e.target.value.replace(/[^0-9]/g, "").slice(0, 5) }))} inputMode="numeric" placeholder="00000" className={taxInputClass} />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="ch-tax-address" className="block text-[13.5px] font-semibold text-brand-dark mb-1.5">주소 <span className="text-red-500">*</span></label>
                        <input id="ch-tax-address" value={tax.address} onChange={(e) => setTax((p) => ({ ...p, address: e.target.value }))} placeholder="사업장 주소" className={taxInputClass} />
                      </div>
                      <div>
                        <label htmlFor="ch-tax-condition" className="block text-[13.5px] font-semibold text-brand-dark mb-1.5">업태</label>
                        <input id="ch-tax-condition" value={tax.bizCondition} onChange={(e) => setTax((p) => ({ ...p, bizCondition: e.target.value }))} placeholder="예) 서비스업" className={taxInputClass} />
                      </div>
                      <div>
                        <label htmlFor="ch-tax-category" className="block text-[13.5px] font-semibold text-brand-dark mb-1.5">업종</label>
                        <input id="ch-tax-category" value={tax.bizCategory} onChange={(e) => setTax((p) => ({ ...p, bizCategory: e.target.value }))} placeholder="예) 광고대행업" className={taxInputClass} />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="ch-tax-email" className="block text-[13.5px] font-semibold text-brand-dark mb-1.5">이메일 <span className="text-red-500">*</span></label>
                        <input id="ch-tax-email" value={tax.email} onChange={(e) => setTax((p) => ({ ...p, email: e.target.value }))} type="email" placeholder="세금계산서 수신 이메일" className={taxInputClass} />
                        <p className="mt-1.5 text-[12px] text-brand-muted">입력하신 이메일로 세금계산서가 발송됩니다.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 충전 요청 버튼 — 빠진 칸은 눌렀을 때 짚어 준다 */}
              <button
                onClick={handleCharge}
                disabled={pending}
                aria-disabled={!canSubmit}
                className={`w-full py-4 rounded-xl text-[17px] font-extrabold text-white transition-opacity disabled:opacity-40 ${
                  canSubmit ? "" : "opacity-40"
                }`}
                style={{ background: "#111D37" }}
              >
                {pending ? "신청 중…" : "포인트 충전 요청"}
              </button>

              {/* 충전 진행 단계 */}
              <ol className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {CHARGE_STEPS.map((s, i) => (
                  <li
                    key={s.title}
                    className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-brand-border"
                    style={{ background: "#F5F7FB" }}
                  >
                    <span className="h-6 w-6 rounded-full bg-brand-primary text-white text-[12px] font-extrabold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[14px] font-extrabold text-brand-dark">{s.title}</p>
                      <p className="text-[12px] text-brand-sub mt-0.5">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>

              {/* 주의사항 — 운영정책(@/lib/policy)에서 가져온다 */}
              <div className="rounded-2xl p-5 space-y-4" style={{ background: "#F5F6F8", border: "1px solid #E2E6ED" }}>

                <div className="space-y-2">
                  <span className="inline-block text-[12px] font-extrabold px-2.5 py-1 rounded-full" style={{ background: "#DCE7FB", color: "#2452EB" }}>
                    충전 안내
                  </span>
                  <ul className="space-y-1.5 pl-1">
                    <li className="text-[15px] text-brand-dark">
                      - 최소 충전 포인트 : <span className="font-extrabold">{minCharge.toLocaleString()}P</span>
                      <span className="text-brand-sub"> ({chargeUnit.toLocaleString()}P 단위)</span>
                    </li>
                    <li className="text-[15px] text-brand-sub">
                      - 실제 입금하실 금액은 <span className="font-semibold text-brand-dark">요청 포인트 &times; {(1 + vatRate).toFixed(1)}</span> (부가세 {vatRate * 100}% 포함)입니다.
                    </li>
                    <li className="text-[15px] text-brand-sub">
                      - 포인트는 선불 예치금이며, 입금이 확인되면 <span className="font-semibold text-brand-dark">충전 건별로 세금계산서를 개별 발행</span>합니다.
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
                      - 입금자명을 정확하게 입력해 주셔야 충전이 처리됩니다.
                    </li>
                    <li className="text-[15px] text-brand-dark font-semibold">
                      - 포인트 충전 요청 후 &rarr; 계좌 이체
                    </li>
                    <li className="text-[15px] text-brand-sub">
                      - 입금이 확인되면 관리자 승인 후 포인트가 지급됩니다. (즉시 충전이 아닙니다)
                    </li>
                    <li className="text-[15px] text-brand-sub">
                      - 과입금·미달입금은 담당자가 연락드려 협의합니다. (CG-02)
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

      {/* 우측 패널 - 잔액 · 내역 (좁은 화면에서는 아래로 내려간다) */}
      <div className="w-full lg:w-[360px] xl:w-[420px] shrink-0 lg:sticky" style={{ top: "92px" }}>
        <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">

          {/* 잔액 헤더 */}
          <div className="px-5 pt-5 pb-4" style={{ background: "linear-gradient(135deg,#2452EB,#152C9E)" }}>
            <p className="text-[12px] font-bold text-white/80 mb-1">현재 포인트 잔액</p>
            <p className="text-[29px] font-extrabold text-white leading-tight tabular-nums">
              {balance.toLocaleString()}
              <span className="text-[17px] font-bold text-white/70 ml-1">P</span>
            </p>
            <p className="text-[12px] text-white/75 mt-1">
              누적 충전 {totalCharged.toLocaleString()}P / 누적 사용 {totalUsed.toLocaleString()}P
            </p>
          </div>

          {/* 내역 탭 */}
          <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
            <HistoryTabs value={historyTab} onChange={setHistoryTab} />
            <span className="text-[12px] text-brand-sub shrink-0">최근 {recentCount}건</span>
          </div>

          {/* 내역 리스트 */}
          <div className="px-3 pb-3 space-y-0.5">
            {historyTab === "charge" ? (
              chargeRows.length === 0 ? (
                <EmptyRow text="충전 내역이 없습니다." />
              ) : (
                chargeRows.slice(0, 6).map((r) => <ChargeRowView key={r.key} row={r} />)
              )
            ) : orderEntries.length === 0 ? (
              <EmptyRow text="포인트 사용 내역이 없습니다." />
            ) : (
              orderEntries.slice(0, 6).map((e) => <OrderRowView key={e.id} entry={e} />)
            )}
          </div>

          {/* 전체 내역 보기 */}
          <div className="px-4 pb-4 pt-2">
            <div className="h-px bg-brand-border mb-3" />
            <button
              type="button"
              onClick={() => setModalTab(historyTab)}
              className="w-full py-2.5 rounded-xl border border-brand-border text-[13px] font-bold text-brand-sub hover:border-brand-primary hover:text-brand-primary transition-colors"
            >
              전체 내역 보기
            </button>
          </div>

        </div>
      </div>

      </div>

      {modalTab && (
        <HistoryModal
          initialTab={modalTab}
          chargeRows={chargeRows}
          orderEntries={orderEntries}
          onClose={() => setModalTab(null)}
        />
      )}
    </div>
  );
}

function HistoryTabs({ value, onChange }: { value: HistoryTab; onChange: (t: HistoryTab) => void }) {
  return (
    <div className="flex gap-1.5">
      {HISTORY_TABS.map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className="px-3 py-1.5 rounded-full text-[13px] font-bold transition-all whitespace-nowrap"
          style={
            value === key
              ? { background: "#2452EB", color: "#fff" }
              : { background: "#fff", color: "#5B6472", border: "1px solid #E2E6ED" }
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <p className="px-3 py-6 text-center text-[13px] text-brand-muted">{text}</p>;
}

function ChargeRowView({ row, large = false }: { row: ChargeListRow; large?: boolean }) {
  const amountSize = large ? "text-[16px]" : "text-[15px]";
  const box = "flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-lighter transition-colors";

  if (row.kind === "entry") {
    const e = row.entry;
    const earn = e.delta > 0;
    return (
      <div className={box}>
        <div className="min-w-0">
          <p className={`${amountSize} font-bold ${earn ? "text-brand-success" : "text-brand-error"}`}>
            {earn ? "+" : "−"}{Math.abs(e.delta).toLocaleString()}P
          </p>
          <p className="text-[12px] text-brand-sub truncate">
            {large ? fmtDateTime(e.at) : fmtDate(e.at)} · {e.reason}
          </p>
        </div>
        <span className="shrink-0 text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-brand-lighter text-brand-sub">완료</span>
      </div>
    );
  }

  const h = row.item;
  const approved = h.status === "approved";
  const meta = pointChargeStatusMeta[h.status];
  return (
    <div className={box}>
      <div className="min-w-0">
        <p className={`${amountSize} font-bold ${approved ? "text-brand-dark" : "text-brand-muted"}`}>
          {approved && "+"}{(h.amount + h.bonusAmount).toLocaleString()}P
          {h.bonusAmount > 0 && (
            <span className="ml-1.5 align-middle text-[10.5px] font-extrabold px-1.5 py-0.5 rounded-md bg-brand-success-bg text-brand-success">
              보너스 +{h.bonusAmount.toLocaleString()}P
            </span>
          )}
        </p>
        <p className="text-[12px] text-brand-sub tabular-nums">
          {large ? fmtDateTime(h.at) : fmtDate(h.at)} · {chargeAmountWithVat(h.amount).toLocaleString()}원
        </p>
      </div>
      <span
        className={`shrink-0 text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-brand-lighter ${
          TONE_CLASS[meta?.tone ?? "gray"] ?? "text-brand-sub"
        }`}
      >
        {meta?.label ?? h.status}
      </span>
    </div>
  );
}

function OrderRowView({ entry: e, large = false }: { entry: PointEntryRow; large?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-lighter transition-colors">
      <div className="min-w-0">
        <p className={`${large ? "text-[16px]" : "text-[15px]"} font-bold text-brand-error`}>
          −{Math.abs(e.delta).toLocaleString()}P
        </p>
        <p className="text-[12px] text-brand-sub truncate">{e.reason}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[12px] text-brand-sub tabular-nums">{large ? fmtDateTime(e.at) : fmtDate(e.at)}</p>
        <p className="text-[12px] text-brand-muted tabular-nums">잔액 {e.balanceAfter.toLocaleString()}P</p>
      </div>
    </div>
  );
}

function HistoryModal({
  initialTab,
  chargeRows,
  orderEntries,
  onClose,
}: {
  initialTab: HistoryTab;
  chargeRows: ChargeListRow[];
  orderEntries: PointEntryRow[];
  onClose: () => void;
}) {
  const [tab, setTab] = useState<HistoryTab>(initialTab);
  const [period, setPeriod] = useState<PeriodKey>("3m");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const since = useMemo(() => {
    const months = PERIODS.find((p) => p.key === period)?.months ?? 0;
    if (!months) return "";
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    return d.toISOString();
  }, [period]);

  const charges = chargeRows.filter((r) => r.at >= since);
  const orders = orderEntries.filter((e) => e.at >= since);
  const isCharge = tab === "charge";
  const count = isCharge ? charges.length : orders.length;

  const chargeTotal = charges.reduce(
    (s, r) => (r.kind === "charge" && r.item.status === "approved" ? s + r.item.amount + r.item.bonusAmount : s),
    0,
  );
  const adjustTotal = charges.reduce((s, r) => (r.kind === "entry" ? s + r.entry.delta : s), 0);
  const usedTotal = orders.reduce((s, e) => s - e.delta, 0);

  return (
    <>
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="fixed inset-0 z-[150] cursor-default"
        style={{ background: "rgba(17,29,55,.5)" }}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed left-1/2 top-1/2 z-[151] flex max-h-[80vh] w-[calc(100vw-32px)] sm:w-[min(640px,calc(100vw-48px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-brand-border bg-white shadow-2xl"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-brand-border px-5 py-4">
          <div className="flex items-center gap-2 text-[17px] font-extrabold text-brand-dark">
            내역 전체보기
            <span className="rounded-full px-2 py-0.5 text-[12px] font-extrabold" style={{ background: "#DCE7FB", color: "#2452EB" }}>
              {count}
            </span>
          </div>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-brand-muted hover:bg-brand-lighter hover:text-brand-dark transition-colors"
          >
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* 탭 · 기간 */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-4">
          <HistoryTabs value={tab} onChange={setTab} />
          <div className="flex gap-1 rounded-lg p-1 bg-brand-lighter">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPeriod(p.key)}
                className={`px-2.5 py-1 rounded-md text-[12.5px] font-bold transition-colors ${
                  period === p.key ? "bg-white text-brand-dark shadow-sm" : "text-brand-sub hover:text-brand-dark"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 합계 */}
        <div className="flex items-center justify-between border-b border-brand-border px-5 py-3">
          <span className="text-[13px] font-bold text-brand-sub">{count}건 · 신청일 기준</span>
          <span className={`text-[14px] font-extrabold ${isCharge ? "text-brand-primary" : "text-brand-dark"}`}>
            {isCharge ? (
              <>
                총 충전 +{chargeTotal.toLocaleString()}P
                {adjustTotal !== 0 && (
                  <span className="ml-1.5 font-bold text-brand-sub">
                    · 조정 {adjustTotal > 0 ? "+" : "−"}{Math.abs(adjustTotal).toLocaleString()}P
                  </span>
                )}
              </>
            ) : (
              <>총 사용 −{usedTotal.toLocaleString()}P</>
            )}
          </span>
        </div>

        {/* 목록 */}
        <div className="overflow-y-auto px-3 py-2 space-y-0.5 [scrollbar-gutter:stable]">
          {isCharge ? (
            charges.length ? (
              charges.map((r) => <ChargeRowView key={r.key} row={r} large />)
            ) : (
              <EmptyRow text="충전 내역이 없습니다." />
            )
          ) : orders.length ? (
            orders.map((e) => <OrderRowView key={e.id} entry={e} large />)
          ) : (
            <EmptyRow text="포인트 사용 내역이 없습니다." />
          )}
        </div>
      </div>
    </>
  );
}
