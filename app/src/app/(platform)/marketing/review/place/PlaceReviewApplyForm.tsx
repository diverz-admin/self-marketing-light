"use client";

import React, { useEffect, useState } from "react";
import PageHeader from "@/components/marketing/PageHeader";
import ChipInput from "@/components/marketing/ChipInput";
import { useCart } from "@/components/marketing/CartContext";
import { CartAddedModal, MobileCartBar } from "@/components/marketing/CartAddPanel";
import { CONSULT_HREF } from "@/components/marketing/landing";
import { toast } from "@/components/ui/toast";
import { lookupPlaceName } from "../../actions";
import type { ReviewProductOption } from "@/lib/review-products";

/**
 * 네이버 플레이스 리뷰 신청 — 개발본(rv_place_apply)과 같은 흐름.
 *   1 유형 선택(블로그 배포 · 영수증 리뷰) → 블로그 배포만 셀프 신청, 영수증 리뷰는 상담
 *   2 스케줄 · 3 필수 정보 · 4 업체 정보 · 5 크롤링/사진 · 6 장바구니 담기
 * 주문·결제는 장바구니에서 한다.
 */

type ReviewType = "blog" | "receipt";
type Form = {
  type: ReviewType;
  productId: string;
  start: string;
  days: number;
  daily: number;
  url: string;
  campName: string;
  postType: "후기성" | "정보성";
  mainKeywords: string[];
  hashtags: string[];
  bizInfo: string;
  imgMode: "CRAWL" | "ATTACH";
  imgUrl: string;
  crawlRequest: string;
  agTerms: boolean;
  agFtc: boolean;
};

const MAX_DAYS = 30;
const DEFAULT_MAX_DAILY = 100;
const MAX_KEYWORDS = 5;
const MAX_HASHTAGS = 10;
const DRAFT_KEY = "rv-place-apply";

const ICON = {
  blog: { gradient: "linear-gradient(135deg,#2452EB,#6366F1)", d: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" },
  receipt: { gradient: "linear-gradient(135deg,#10B981,#059669)", d: "M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" },
};

const TYPE_LABEL: Record<ReviewType, { label: string; desc: string }> = {
  blog: { label: "블로그 배포", desc: "블로거가 방문·이용 후 블로그에 리뷰 포스팅을 발행합니다." },
  receipt: { label: "영수증 리뷰", desc: "실방문 영수증 인증으로 플레이스 리뷰를 남깁니다." },
};

/* 필수 동의 전문 — 개발본 문구 그대로 */
const POLICY_TEXT: Record<"terms" | "ftc", { title: string; body: string }> = {
  terms: {
    title: "리뷰 캠페인 필수 동의 사항",
    body: `1. 캠페인 진행 방식
회원이 신청한 리뷰 캠페인은 회사가 모집한 리뷰어가 직접 방문·구매·체험한 뒤 리뷰를 작성하는 방식으로 진행됩니다. 리뷰의 내용과 표현은 리뷰어의 실제 경험에 따르며, 회사와 회원은 특정 평점이나 문구를 강요할 수 없습니다.

2. 결과의 보장 범위
회사는 신청한 발행 일수·일 발행량에 해당하는 리뷰 작성을 목표로 진행하며, 플랫폼(네이버·쿠팡 등)의 정책 변경, 리뷰 미노출·삭제 등 회사의 통제를 벗어난 사유로 인한 결과는 보장하지 않습니다.

3. 취소·환불
캠페인 시작 전에는 취소가 가능하며, 이미 진행된 분량은 환불 대상에서 제외됩니다. 세부 사항은 서비스 환불정책을 따릅니다.

4. 제공 정보의 정확성
회원이 입력한 링크·키워드·업체 정보가 사실과 다르거나 제3자의 권리를 침해하는 경우, 그로 인한 책임은 회원에게 있으며 회사는 캠페인을 중단할 수 있습니다.

5. 금지되는 요청
허위·과장 표현, 경쟁사 비방, 의료·금융 등 법령상 광고가 제한되는 표현을 리뷰에 포함하도록 요청할 수 없습니다.

본 동의는 캠페인 신청 시점에 적용됩니다.`,
  },
  ftc: {
    title: "공정위 문구 포함 안내",
    body: `1. 무엇에 동의하는 것인가요
본 캠페인으로 작성되는 모든 리뷰에는 「추천·보증 등에 관한 표시·광고 심사지침」(공정거래위원회)에 따른 경제적 이해관계 표시 문구가 포함됩니다. 회원은 이 문구가 리뷰에 노출되는 것에 동의합니다.

2. 표시 문구 예시
"본 후기는 000으로부터 제품(또는 서비스)을 제공받아 작성되었습니다."
"소정의 원고료를 지급받아 작성한 후기입니다."

3. 표시 위치
문구는 본문 첫 부분 또는 끝부분 등 소비자가 쉽게 인식할 수 있는 위치에, 본문과 같은 크기·색으로 표기합니다. 더보기·댓글·해시태그 뒤에 숨기지 않습니다.

4. 삭제 요청 불가
표시 문구는 법령상 의무 사항이므로 회원의 요청으로 삭제하거나 눈에 띄지 않게 처리할 수 없습니다.

5. 위반 시 책임
회원이 문구 제외를 요구하여 발생하는 행정처분·과징금 등 불이익은 회원이 부담합니다.

본 안내는 공정거래위원회 심사지침을 요약한 것입니다.`,
  },
};

const inputCls =
  "w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-[14px] font-semibold text-brand-dark placeholder:font-medium placeholder:text-brand-muted focus:outline-none focus:border-brand-primary disabled:bg-brand-lighter";

function addDays(ymd: string, n: number) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}
function daysBetween(a: string, b: string) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000) + 1;
}

/* ── 작은 부품 ── */
function Step({ n, title }: { n: number; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span className="h-7 w-7 rounded-full bg-brand-primary text-white text-[13px] font-extrabold flex items-center justify-center shrink-0">{n}</span>
      <h2 className="text-[18px] font-extrabold text-brand-dark">{title}</h2>
    </div>
  );
}
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  // 상자 대신 선으로 구획한다 — 캠페인 관리 화면과 같은 짜임
  return <section className={`border-t border-brand-border pt-5 ${className}`}>{children}</section>;
}
function Field({ label, required, htmlFor, hint, children }: { label: string; required?: boolean; htmlFor?: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-bold text-brand-dark">
        {label} {required && <span className="text-brand-error">*</span>}
      </label>
      {children}
      {hint && <div className="mt-1.5 text-[12px] text-brand-muted">{hint}</div>}
    </div>
  );
}
function Stepper({ id, value, min, max, onChange }: { id: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, v || min)));
  return (
    <div className="flex h-[42px] items-center rounded-xl border border-brand-border bg-white">
      <button type="button" aria-label="줄이기" onClick={() => set(value - 1)} className="h-full w-10 text-[18px] text-brand-sub hover:text-brand-primary">−</button>
      <input
        id={id}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(Number(e.target.value.replace(/[^0-9]/g, "")) || 0)}
        onBlur={() => set(value)}
        className="h-full min-w-0 flex-1 bg-transparent text-center text-[15px] font-bold text-brand-dark tabular-nums focus:outline-none"
      />
      <button type="button" aria-label="늘리기" onClick={() => set(value + 1)} className="h-full w-10 text-[18px] text-brand-sub hover:text-brand-primary">+</button>
    </div>
  );
}

function TypeCard({
  type, selected, onSelect, products, productId, onPick,
}: {
  type: ReviewType;
  selected: boolean;
  onSelect: () => void;
  products?: ReviewProductOption[];
  productId?: string;
  onPick?: (id: string) => void;
}) {
  const t = TYPE_LABEL[type];
  const cur = products?.find((p) => p.id === productId) ?? products?.[0];
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`cursor-pointer rounded-2xl border-2 bg-white px-5 py-4 transition-all ${
        selected ? "border-brand-primary ring-4 ring-brand-primary/10" : "border-brand-border hover:border-brand-primary/40"
      }`}
    >
      <div className="flex items-start gap-3.5">
        <span className="h-11 w-11 shrink-0 rounded-xl flex items-center justify-center transition-opacity" style={{ background: ICON[type].gradient, opacity: selected ? 1 : 0.45 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d={ICON[type].d} />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-[16px] font-extrabold ${selected ? "text-brand-primary" : "text-brand-dark"}`}>{t.label}</p>
          <p className="mt-0.5 text-[13px] leading-snug text-brand-sub">{t.desc}</p>
        </div>
        <span className={`h-5 w-5 shrink-0 rounded-full bg-brand-primary flex items-center justify-center ${selected ? "" : "invisible"}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} className="h-3 w-3 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </span>
      </div>
      <div className="mt-2.5 flex min-h-[38px] items-center">
        {type === "receipt" ? (
          <span className="text-[13px] font-bold text-brand-primary">상담으로 진행</span>
        ) : !products || products.length === 0 ? (
          <span className="text-[12.5px] font-semibold text-brand-error">판매 중지</span>
        ) : selected && products.length > 1 && onPick ? (
          <select
            aria-label="상품"
            value={cur?.id}
            onChange={(e) => onPick(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-[13px] font-extrabold text-brand-primary focus:outline-none focus:border-brand-primary"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} · {p.unitPrice.toLocaleString()}P / 1건
              </option>
            ))}
          </select>
        ) : cur ? (
          <span>
            <b className="text-[17px] font-extrabold text-brand-primary tabular-nums">{cur.unitPrice.toLocaleString()}</b>
            <small className="ml-0.5 text-[12px] font-semibold text-brand-muted">P / 1건</small>
          </span>
        ) : null}
      </div>
    </div>
  );
}

function PolicyModal({ k, onClose }: { k: "terms" | "ftc"; onClose: () => void }) {
  const t = POLICY_TEXT[k];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/45 px-4" onMouseDown={onClose}>
      <div role="dialog" aria-modal aria-label={t.title} className="animate-be-fade flex max-h-[80vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-brand-border px-5 py-3.5">
          <p className="text-[15.5px] font-extrabold text-brand-dark">{t.title}</p>
          <button type="button" aria-label="닫기" onClick={onClose} className="h-8 w-8 rounded-lg text-brand-muted hover:bg-brand-lighter">✕</button>
        </div>
        <div className="overflow-y-auto whitespace-pre-line px-5 py-4 text-[13px] leading-[1.75] text-brand-text">{t.body}</div>
      </div>
    </div>
  );
}

/* ── 영수증 리뷰 — 상담 안내 ──
   블로그 배포와 같은 짜임(번호 섹션 + 선 구획)으로 두어 유형을 바꿔도 화면 결이 이어진다 */
const RECEIPT_STEPS = [
  { t: "문의하기", d: "아래 버튼으로 담당자와 연결됩니다. 문의 내용은 관리자에게 접수됩니다.", icon: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" },
  { t: "조건 상담", d: "매장 위치·방문 조건·리뷰 수량을 상담으로 정합니다.", icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" },
  { t: "진행", d: "조건이 확정되면 리뷰어가 방문하고 영수증 인증으로 리뷰를 남깁니다.", icon: "M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" },
];

function ReceiptLanding({ onInquiry }: { onInquiry: () => void }) {
  return (
    <>
      {/* 영수증 리뷰란? — 블로그배포란? 배너와 같은 자리·같은 결 (초록 계열) */}
      <div className="mb-16 rounded-2xl px-6 py-6" style={{ background: "linear-gradient(100deg,#047857 0%,#059669 55%,#10B981 100%)" }}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-8">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg border border-white/15 bg-white/[.12] flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d={ICON.receipt.d} />
                </svg>
              </span>
              <p className="text-[16px] font-extrabold text-white">영수증 리뷰란?</p>
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-bold text-white/85">플레이스 리뷰</span>
            </div>
            <p className="mt-2.5 max-w-[560px] break-keep text-[14px] leading-relaxed text-white/80">
              실제 방문 영수증으로 플레이스 리뷰를 남깁니다. 방문 조건·인증 방식이 매장마다 달라 <b className="font-extrabold text-white">상담으로 맞춰 진행</b>합니다.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 lg:w-[268px]">
            <div className="rounded-lg border border-white/[.14] bg-white/[.1] px-3.5 py-2.5">
              <p className="text-[11px] font-bold text-white/55">인증 방식</p>
              <p className="mt-0.5 text-[13.5px] font-extrabold text-white">실방문 영수증 인증</p>
            </div>
            <div className="flex items-start gap-1.5 rounded-lg border border-white/[.14] bg-white/[.1] px-3.5 py-2.5">
              <span className="text-[12.5px] text-[#FFE08A]">ⓘ</span>
              <p className="text-[12.5px] font-bold leading-snug text-[#FFE08A]">정가 판매 없이 상담으로 금액 결정</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2 진행 방식 */}
      <Step n={2} title="진행 방식" />
      <Card className="mb-16">
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {RECEIPT_STEPS.map((s, i) => (
            <li key={s.t} className="relative rounded-2xl border border-brand-border bg-white px-5 py-5">
              {/* 단계 사이 화살표 */}
              {i < RECEIPT_STEPS.length - 1 && (
                <span aria-hidden className="hidden md:flex absolute -right-[18px] top-1/2 -translate-y-1/2 z-10 h-6 w-6 items-center justify-center rounded-full border border-brand-border bg-white text-[11px] text-brand-muted">
                  →
                </span>
              )}
              <div className="flex items-center gap-2.5">
                <span className="h-9 w-9 rounded-xl bg-[#E3F6EA] text-[#059669] flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                  </svg>
                </span>
                <span className="text-[11.5px] font-extrabold text-[#059669] tabular-nums">STEP {i + 1}</span>
              </div>
              <p className="mt-3 text-[15.5px] font-extrabold text-brand-dark">{s.t}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-brand-sub">{s.d}</p>
            </li>
          ))}
        </ol>
      </Card>

      {/* 3 상담 신청 */}
      <Step n={3} title="상담 신청" />
      <Card>
        <p className="rounded-xl border border-brand-border bg-brand-lighter px-4 py-3 text-[13px] leading-relaxed text-brand-sub">
          영수증 리뷰는 <b className="font-extrabold text-brand-dark">정가 판매를 하지 않습니다</b> — 장바구니에 담는 대신 상담으로 조건과 금액을 정합니다.
        </p>
        <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-[13px] text-brand-sub">
            평일 <b className="font-bold text-brand-dark">10:00 ~ 19:00</b> 응대 · 문의 내용은 관리자에게 접수됩니다
          </p>
          <button type="button" onClick={onInquiry} className="inline-flex items-center gap-2 rounded-xl bg-[#FEE500] px-6 py-3.5 text-[15px] font-extrabold text-[#191600] hover:brightness-95">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 3C6.48 3 2 6.58 2 11c0 2.85 1.86 5.35 4.66 6.76-.2.7-.74 2.6-.85 3-.13.5.18.49.39.36.16-.1 2.6-1.76 3.65-2.48.7.1 1.42.16 2.15.16 5.52 0 10-3.58 10-8S17.52 3 12 3z" />
            </svg>
            카카오톡으로 문의하기
          </button>
        </div>
      </Card>
    </>
  );
}

/* ── 페이지 ── */
export default function PlaceReviewApplyForm({ products, initialType, today }: { products: ReviewProductOption[]; initialType: ReviewType; today: string }) {
  const { balance, items, addItem } = useCart();
  const blank: Form = {
    type: initialType,
    productId: products[0]?.id ?? "",
    start: "",
    days: 3,
    daily: 2,
    url: "",
    campName: "",
    postType: "후기성",
    mainKeywords: [],
    hashtags: [],
    bizInfo: "",
    imgMode: "CRAWL",
    imgUrl: "",
    crawlRequest: "",
    agTerms: false,
    agFtc: false,
  };
  const [f, setF] = useState<Form>(blank);
  const [lookup, setLookup] = useState<{ cls: "" | "ok" | "err"; text: string }>({ cls: "", text: "" });
  const [policy, setPolicy] = useState<"terms" | "ftc" | null>(null);
  const [restored, setRestored] = useState(false);
  const [addedOpen, setAddedOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((s) => ({ ...s, [k]: v }));

  // 작성 중이던 내용 복원 — 약관 동의는 다시 받는다
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw) as Partial<Form>;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 저장소에서 한 번 복원
      setF((s) => ({ ...s, ...d, type: initialType, agTerms: false, agFtc: false }));
      setRestored(true);
    } catch {
      /* 복원 실패는 무시 */
    }
  }, [initialType]);
  useEffect(() => {
    const dirty = f.start || f.url || f.mainKeywords.length || f.hashtags.length || f.bizInfo || f.imgUrl || f.crawlRequest;
    try {
      if (dirty) {
        const { agTerms: _a, agFtc: _b, ...rest } = f;
        void _a;
        void _b;
        localStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
      } else localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* 저장 실패는 무시 */
    }
  }, [f]);

  const product = products.find((p) => p.id === f.productId) ?? products[0];
  const unit = product?.unitPrice ?? 0;
  const maxDaily = product?.maxQty ?? DEFAULT_MAX_DAILY;
  const total = f.days * f.daily;
  const amount = unit * total;
  const minStart = addDays(today, 1);
  const end = f.start ? addDays(f.start, f.days - 1) : "";

  const doLookup = async () => {
    const url = f.url.trim();
    if (!/^https?:\/\//.test(url)) {
      set("campName", "");
      setLookup({ cls: "err", text: "플레이스 링크 주소 형식이 올바르지 않습니다. 주소를 다시 확인해 주세요." });
      return;
    }
    setLookup({ cls: "", text: "업체명을 불러오는 중…" });
    const res = await lookupPlaceName(url);
    if (res.companyName) {
      set("campName", res.companyName);
      setLookup({ cls: "ok", text: `링크에서 캠페인명을 가져왔습니다 · ${res.companyName}` });
    } else {
      set("campName", "");
      setLookup({ cls: "err", text: "reason" in res ? res.reason : "업체명을 불러오지 못했습니다. 링크를 다시 확인해 주세요." });
    }
  };

  const fail = (msg: string, focusId?: string) => {
    toast.error(msg);
    if (focusId) document.getElementById(focusId)?.focus();
  };

  const submit = async () => {
    if (!product) return fail("판매 중지된 유형입니다");
    if (!f.start) return fail("발행 시작일을 선택해 주세요", "rvpStart");
    if (f.days < 1 || f.days > MAX_DAYS) return fail(`발행 일수는 1~${MAX_DAYS}일 사이로 입력해 주세요`, "rvpDays");
    if (!f.daily) return fail("일 발행량을 입력해 주세요", "rvpDaily");
    if (f.daily > maxDaily) return fail(`일 발행량은 최대 ${maxDaily}건까지 가능합니다`, "rvpDaily");
    if (!f.url.trim() || !f.campName.trim()) return fail("플레이스 링크를 입력하고 캠페인명을 가져와 주세요", "rvpUrl");
    if (!f.mainKeywords.length) return fail("메인 키워드를 한 개 이상 입력해 주세요", "rvpKeyword");
    if (f.imgMode === "ATTACH" && f.imgUrl.trim() && !/^https?:\/\//.test(f.imgUrl.trim())) return fail("이미지 링크는 http:// 또는 https:// 로 시작해야 합니다", "rvpImgUrl");
    if (!f.agTerms || !f.agFtc) return fail("필수 동의 사항에 모두 동의해 주세요");

    setPending(true);
    addItem({
      productId: product.id,
      platform: "네이버 플레이스",
      name: `블로그 배포 · ${product.title}`,
      initial: "블",
      bg: "#2452EB",
      textColor: "white",
      target: f.campName.trim(),
      keyword: f.mainKeywords[0],
      dailyQty: f.daily,
      price: unit,
      amount,
      channel: "place",
      days: f.days,
      startDate: f.start,
      url: f.url.trim(),
      kind: "review",
      review: {
        reviewType: "blog_distribute",
        mainKeywords: f.mainKeywords,
        postingType: f.postType,
        hashtags: f.hashtags,
        businessInfo: f.bizInfo.trim(),
        imageMode: f.imgMode,
        imageDriveUrl: f.imgMode === "ATTACH" && f.imgUrl.trim() ? f.imgUrl.trim() : undefined,
        crawlRequest: f.imgMode === "CRAWL" && f.crawlRequest.trim() ? f.crawlRequest.trim() : undefined,
      },
    });
    setPending(false);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* 무시 */
    }
    setRestored(false);
    setAddedOpen(true);
  };

  const inquiry = () => window.open(CONSULT_HREF, "_blank", "noopener");

  const typeCards = (
    <Card className="mb-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TypeCard type="blog" selected={f.type === "blog"} onSelect={() => set("type", "blog")} products={products} productId={f.productId} />
        <TypeCard type="receipt" selected={f.type === "receipt"} onSelect={() => set("type", "receipt")} />
      </div>
    </Card>
  );

  return (
    <div className="w-full pb-28 lg:pb-0">
      <PageHeader
        title="네이버 플레이스 리뷰 신청"
        subtitle="리뷰 유형을 선택하고 캠페인을 신청하세요."
        iconPath={["M15 10.5a3 3 0 11-6 0 3 3 0 016 0z", "M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"]}
        className="mb-5"
      />

      {restored && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-brand-border bg-brand-primary-50 px-3.5 py-2.5 text-[12.5px] font-semibold text-brand-primary">
          <span aria-hidden>↩</span>
          <span className="min-w-0 flex-1">
            작성 중이던 내용을 불러왔습니다. <b className="font-bold">약관 동의는 다시 확인해 주세요.</b>
          </span>
          <button type="button" aria-label="안내 닫기" onClick={() => setRestored(false)} className="px-1.5 font-bold opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {f.type === "receipt" ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-start">
          <div className="min-w-0">
            <Step n={1} title="유형 선택" />
            {typeCards}
            <ReceiptLanding onInquiry={inquiry} />
          </div>
          <aside className="hidden lg:block lg:sticky lg:top-4">
            <Step n={4} title="상담으로 진행" />
            <div className="border-t-2 border-brand-dark pt-4 pb-5 border-b border-b-brand-border">
              <p className="text-[15px] font-extrabold text-brand-dark">영수증 리뷰, 조건부터 맞춰 보세요</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-brand-sub">매장 상황에 맞는 건수·기간·금액을 담당자가 함께 정해 드립니다.</p>
              <dl className="mt-4 space-y-2.5 border-t border-brand-border pt-3.5 text-[13.5px]">
                {[
                  ["채널", "네이버 플레이스"],
                  ["유형", "영수증 리뷰"],
                  ["금액", "상담 후 결정"],
                  ["응대 시간", "평일 10:00 ~ 19:00"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3">
                    <dt className="text-brand-sub">{k}</dt>
                    <dd className="font-bold text-brand-dark">{v}</dd>
                  </div>
                ))}
              </dl>
              <button type="button" onClick={inquiry} className="mt-5 w-full rounded-xl bg-[#FEE500] py-3.5 text-[14.5px] font-extrabold text-[#191600] hover:brightness-95">
                카카오톡으로 문의하기
              </button>
            </div>
          </aside>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-start">
          <div className="min-w-0">
            <Step n={1} title="유형 선택" />
            {typeCards}

            {/* 블로그배포란? */}
            <div className="mb-16 rounded-2xl px-6 py-6" style={{ background: "var(--gradient-point-wide)" }}>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-8">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="h-8 w-8 rounded-lg border border-white/15 bg-white/[.12] flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d={ICON.blog.d} />
                      </svg>
                    </span>
                    <p className="text-[16px] font-extrabold text-white">블로그배포란?</p>
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-bold text-white/85">플레이스 리뷰</span>
                  </div>
                  <p className="mt-2.5 max-w-[560px] break-keep text-[14px] leading-relaxed text-white/75">
                    전문 블로거 네트워크를 통해 플레이스 방문 리뷰 콘텐츠를 배포하는 캠페인입니다. SEO 최적화된 블로그 포스팅으로 검색 노출과 신뢰도를 동시에 높일 수 있습니다.
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2 lg:w-[268px]">
                  <div className="rounded-lg border border-white/[.12] bg-white/[.09] px-3.5 py-2.5">
                    <p className="text-[11px] font-bold text-white/50">배포 등급</p>
                    <p className="mt-0.5 text-[13.5px] font-extrabold text-white">{product?.blogGrade || "준최2~4 일괄 배포"}</p>
                  </div>
                  <div className="flex items-start gap-1.5 rounded-lg border border-white/[.12] bg-white/[.09] px-3.5 py-2.5">
                    <span className="text-[12.5px] text-[#FFCF6B]">ⓘ</span>
                    <p className="text-[12.5px] font-bold leading-snug text-[#FFCF6B]">최적블은 개별 문의 필요</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2 블로그 종류 — 유형 카드 안 드롭다운 대신 여기서 고른다 */}
            <Step n={2} title="블로그 종류" />
            <Card className="mb-16">
              {products.length === 0 ? (
                <p className="text-[13.5px] font-semibold text-brand-error">판매 중인 블로그 상품이 없습니다.</p>
              ) : (
                <div role="radiogroup" aria-label="블로그 종류" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {products.map((p) => {
                    const on = p.id === product?.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => set("productId", p.id)}
                        className={`flex items-center gap-3 rounded-2xl border-2 bg-white px-5 py-4 text-left transition-all ${
                          on ? "border-brand-primary ring-4 ring-brand-primary/10" : "border-brand-border hover:border-brand-primary/40"
                        }`}
                      >
                        <span className={`h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center ${on ? "border-brand-primary" : "border-brand-border-strong"}`}>
                          {on && <span className="h-2.5 w-2.5 rounded-full bg-brand-primary" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block text-[15.5px] font-extrabold ${on ? "text-brand-primary" : "text-brand-dark"}`}>{p.title}</span>
                          {(p.subtitle || p.blogGrade) && (
                            <span className="mt-0.5 block text-[12.5px] text-brand-sub truncate">{p.subtitle || p.blogGrade}</span>
                          )}
                        </span>
                        <span className="shrink-0 text-right">
                          <b className={`text-[17px] font-extrabold tabular-nums ${on ? "text-brand-primary" : "text-brand-dark"}`}>{p.unitPrice.toLocaleString()}</b>
                          <small className="ml-0.5 text-[12px] font-semibold text-brand-muted">P / 1건</small>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>

            <Step n={3} title="스케줄 설정" />
            <Card className="mb-16">
              {/* 1줄: 시작일 · 종료일 / 2줄: 발행 일수 · 일 발행량 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3.5 gap-y-4">
                <Field label="발행 시작일" required htmlFor="rvpStart">
                  <input id="rvpStart" type="date" min={minStart} value={f.start} onChange={(e) => set("start", e.target.value)} className={inputCls} />
                </Field>
                <Field label="발행 종료일" htmlFor="rvpEnd" hint="종료일을 고르면 기간이, 기간을 고치면 종료일이 함께 바뀝니다.">
                  <input
                    id="rvpEnd"
                    type="date"
                    disabled={!f.start}
                    min={f.start || undefined}
                    max={f.start ? addDays(f.start, MAX_DAYS - 1) : undefined}
                    value={end}
                    onChange={(e) => {
                      if (!f.start || !e.target.value) return;
                      set("days", Math.min(MAX_DAYS, Math.max(1, daysBetween(f.start, e.target.value))));
                    }}
                    className={inputCls}
                  />
                </Field>
                <Field label="발행 일수" required htmlFor="rvpDays" hint={`최소 1일 ~ 최대 ${MAX_DAYS}일`}>
                  <Stepper id="rvpDays" value={f.days} min={1} max={MAX_DAYS} onChange={(v) => set("days", v)} />
                </Field>
                <Field label="일 발행량" required htmlFor="rvpDaily" hint="하루에 발행할 리뷰 수입니다.">
                  <Stepper id="rvpDaily" value={f.daily} min={1} max={maxDaily} onChange={(v) => set("daily", v)} />
                </Field>
              </div>
            </Card>

            <Step n={4} title="필수 정보" />
            <Card className="mb-16">
              {/* 1줄: 링크 · 캠페인명 / 2줄: 메인 키워드 · 해시태그 / 3줄: 포스팅 유형 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3.5 gap-y-4">
                <Field label="플레이스 링크" required htmlFor="rvpUrl">
                <div className="flex gap-2">
                  <input
                    id="rvpUrl"
                    value={f.url}
                    onChange={(e) => {
                      setF((s) => ({ ...s, url: e.target.value, campName: "" }));
                      setLookup({ cls: "", text: "" });
                    }}
                    placeholder="플레이스 링크를 넣어주세요"
                    className={`${inputCls} min-w-0 flex-1`}
                  />
                  <button type="button" onClick={doLookup} className="shrink-0 rounded-xl border border-brand-border bg-brand-primary-50 px-4 text-[13.5px] font-extrabold text-brand-primary hover:border-brand-primary">
                    가져오기
                  </button>
                </div>
                {lookup.text && (
                  <p className={`mt-1.5 text-[12px] font-bold ${lookup.cls === "ok" ? "text-brand-success" : lookup.cls === "err" ? "text-brand-error" : "text-brand-sub"}`}>{lookup.text}</p>
                )}
              </Field>
                <Field label="캠페인명" required htmlFor="rvpName">
                <input id="rvpName" value={f.campName} readOnly placeholder="링크에서 '가져오기'를 누르면 자동으로 입력됩니다" className={`${inputCls} bg-brand-lighter cursor-not-allowed`} />
              </Field>
                <Field label="메인 키워드" required htmlFor="rvpKeyword" hint={`첫 번째가 대표 키워드입니다. 최대 ${MAX_KEYWORDS}개까지 넣을 수 있습니다.`}>
                <ChipInput
                  id="rvpKeyword"
                  values={f.mainKeywords}
                  onChange={(v) => set("mainKeywords", v)}
                  max={MAX_KEYWORDS}
                  markFirst
                  placeholder={`예: 성수 브런치 (Enter로 추가, 최대 ${MAX_KEYWORDS}개)`}
                  limitMessage={`메인 키워드는 최대 ${MAX_KEYWORDS}개까지 입력할 수 있습니다`}
                />
              </Field>
                <Field label="해시태그 키워드" htmlFor="rvpHashtag">
                <ChipInput
                  id="rvpHashtag"
                  values={f.hashtags}
                  onChange={(v) => set("hashtags", v)}
                  max={MAX_HASHTAGS}
                  stripSpaces
                  placeholder={`예: 성수맛집 (Enter로 추가, 최대 ${MAX_HASHTAGS}개)`}
                  limitMessage={`해시태그는 최대 ${MAX_HASHTAGS}개까지 입력할 수 있습니다`}
                />
              </Field>
                <Field label="포스팅 유형" required htmlFor="rvpPostType">
                <select id="rvpPostType" value={f.postType} onChange={(e) => set("postType", e.target.value as Form["postType"])} className={inputCls}>
                  <option>후기성</option>
                  <option>정보성</option>
                </select>
              </Field>
              </div>
            </Card>

            <Step n={5} title="업체 정보 및 가이드라인" />
            <Card className="mb-16">
              <Field label="포스팅에 반영할 업체 정보 및 가이드라인" htmlFor="rvpBiz">
                <textarea
                  id="rvpBiz"
                  rows={4}
                  maxLength={500}
                  value={f.bizInfo}
                  onChange={(e) => set("bizInfo", e.target.value)}
                  placeholder="영업시간·대표메뉴·강조할 포인트 등 업체 정보와 포스팅 작성 시 지켜야 할 가이드라인을 입력하세요"
                  className={`${inputCls} resize-y`}
                />
                <p className="mt-1 text-right text-[12px] text-brand-muted tabular-nums">{f.bizInfo.length}/500</p>
              </Field>
            </Card>

            <Step n={6} title="크롤링 요청 또는 사진 첨부 (선택)" />
            <Card className="mb-0">
              <div role="tablist" aria-label="이미지 조달 방식" className="grid grid-cols-2 rounded-xl bg-brand-lighter p-1">
                {([["CRAWL", "크롤링요청"], ["ATTACH", "사진첨부"]] as const).map(([k, l]) => (
                  <button
                    key={k}
                    type="button"
                    role="tab"
                    aria-selected={f.imgMode === k}
                    onClick={() => set("imgMode", k)}
                    className={`rounded-lg py-2 text-[13.5px] font-bold ${f.imgMode === k ? "bg-white text-brand-dark shadow-sm" : "text-brand-sub"}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <div className="mt-3">
                {f.imgMode === "CRAWL" ? (
                  <>
                    <input
                      aria-label="참고할 주소나 요청 사항 (선택)"
                      value={f.crawlRequest}
                      maxLength={2000}
                      onChange={(e) => set("crawlRequest", e.target.value)}
                      placeholder="참고할 주소나 요청 사항 (선택)"
                      className={inputCls}
                    />
                    <p className="mt-1.5 text-[12px] text-brand-muted">플레이스에 등록된 이미지를 저희가 가져다 씁니다. 참고할 주소나 요청 사항이 있으면 적어 주세요.</p>
                  </>
                ) : (
                  <>
                    <input
                      id="rvpImgUrl"
                      value={f.imgUrl}
                      onChange={(e) => set("imgUrl", e.target.value)}
                      placeholder="이미지가 담긴 구글 드라이브 링크를 입력해 주세요"
                      className={inputCls}
                    />
                    <p className="mt-1.5 text-[12px] text-brand-muted">포스팅에 사용할 이미지가 담긴 구글 드라이브 주소(공유 링크)를 입력해 주세요.</p>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* 6 장바구니 담기 */}
          <aside className="lg:sticky lg:top-4">
            <Step n={7} title="장바구니 담기" />
            <div className="border-t-2 border-brand-dark pt-4 pb-5 border-b border-b-brand-border">
              <p className="pb-3 text-[15px] font-extrabold text-brand-dark border-b border-brand-border">주문 요약</p>
              <dl className="py-3 space-y-2.5 text-[13.5px]">
                {[
                  ["채널", "네이버 플레이스"],
                  ["유형", <>블로그 배포 <span className="text-[12px] font-medium text-brand-muted">{product?.title ?? ""}</span></>],
                  ["발행", `${f.days}일 · 일 ${f.daily}건`],
                  ["총 발행", `${total.toLocaleString()}건`],
                  ["건당 단가", product ? `${unit.toLocaleString()}P` : <span className="text-brand-error">판매 중지</span>],
                ].map(([k, v]) => (
                  <div key={String(k)} className="flex items-center justify-between gap-3">
                    <dt className="text-brand-sub">{k}</dt>
                    <dd className="font-bold text-brand-dark tabular-nums text-right">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="border-t border-brand-border pt-3.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-[14px] font-extrabold text-brand-dark">결제 금액</span>
                  <span className="text-[24px] font-extrabold text-brand-primary tabular-nums">{amount.toLocaleString()}P</span>
                </div>
                <p className="mt-1 text-right text-[12px] text-brand-muted tabular-nums">
                  {total.toLocaleString()}건 × {unit.toLocaleString()}P
                </p>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-brand-border py-3 text-[13.5px]">
                <span className="text-brand-sub">보유 포인트</span>
                <b className="font-extrabold text-brand-dark tabular-nums">{balance.toLocaleString()}P</b>
              </div>
              <div className="flex flex-col gap-2.5 border-t border-brand-border py-3">
                {([["agTerms", "terms", "필수 동의 사항에 동의합니다."], ["agFtc", "ftc", "공정위 문구 포함 동의"]] as const).map(([key, pk, label]) => (
                  <label key={key} className="flex cursor-pointer items-start gap-2.5 text-[13px] text-brand-text">
                    <input type="checkbox" checked={f[key]} onChange={() => set(key, !f[key])} className="mt-0.5 h-[17px] w-[17px] shrink-0 accent-[color:var(--point-500)]" />
                    <span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPolicy(pk);
                        }}
                        className="font-bold text-brand-primary underline underline-offset-2"
                      >
                        {label}
                      </button>{" "}
                      <b className="font-extrabold text-brand-error">(필수)</b>
                    </span>
                  </label>
                ))}
              </div>
              <button type="button" onClick={submit} disabled={pending} className="mt-1 w-full rounded-xl bg-brand-primary py-3.5 text-[15px] font-extrabold text-white hover:bg-brand-primary-hover disabled:opacity-60">
                {pending ? "담는 중…" : "장바구니에 담기"}
              </button>
              <p className="mt-3 flex gap-2 rounded-xl bg-brand-lighter px-3.5 py-3 text-[12px] leading-relaxed text-brand-sub">
                <span className="text-brand-muted">ⓘ</span>
                <span>
                  주문·결제는 <b className="font-bold text-brand-dark">장바구니</b>에서 진행됩니다. 여러 캠페인을 담아 한 번에 주문할 수 있어요.
                </span>
              </p>
            </div>
          </aside>
        </div>
      )}

      {policy && <PolicyModal k={policy} onClose={() => setPolicy(null)} />}
      {f.type === "blog" && <MobileCartBar amount={amount} pending={pending} onAdd={submit} />}
      {addedOpen && (
        <CartAddedModal
          label={f.campName || "리뷰"}
          count={items.length}
          onMore={() => {
            setAddedOpen(false);
            setF({ ...blank, type: "blog" });
            setLookup({ cls: "", text: "" });
            document.getElementById("be-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </div>
  );
}
