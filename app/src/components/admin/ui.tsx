import React from "react";
import { toneClass, type BadgeTone } from "@/lib/admin-format";

// ── Badge ──
export function Badge({ tone = "gray", children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold whitespace-nowrap ${toneClass[tone]}`}>
      {children}
    </span>
  );
}

// ── Page title ──
export function PageTitle({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-[22px] md:text-[26px] font-extrabold text-brand-dark tracking-tight">{title}</h1>
        {description && <p className="text-[14px] text-brand-sub mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Card container ──
export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-white rounded-2xl border border-brand-border ${className}`}>{children}</div>
  );
}

// ── Stat card ──
export function StatCard({
  label,
  value,
  sub,
  tone = "blue",
  icon,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: BadgeTone;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-brand-border p-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-brand-sub">{label}</p>
        {icon && (
          <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${toneClass[tone]}`}>{icon}</span>
        )}
      </div>
      {/* 큰 단독 숫자는 비례 폰트 — tabular-nums는 표·축처럼 세로 정렬이 필요한 곳에만 */}
      <p className="text-[26px] md:text-[28px] font-extrabold text-brand-dark mt-2.5 tracking-tight">{value}</p>
      {sub && <p className="text-[12.5px] text-brand-muted mt-1">{sub}</p>}
    </div>
  );
}

// ── Section header (for cards/tables) ──
export function SectionHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
      <h2 className="text-[15px] font-bold text-brand-dark">{title}</h2>
      {right}
    </div>
  );
}

// ── Empty state ──
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-16 text-center">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-light flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="text-[14px] text-brand-sub">{message}</p>
    </div>
  );
}

// ── Table shell ──
export function TableShell({ head, children }: { head: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-brand-border bg-brand-light/60">{head}</tr>
        </thead>
        <tbody className="divide-y divide-brand-border">{children}</tbody>
      </table>
    </div>
  );
}

export function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-[12px] font-semibold text-brand-sub uppercase tracking-wide whitespace-nowrap ${className}`}>
      {children}
    </th>
  );
}

export function Td({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3.5 text-[13.5px] text-brand-text align-middle ${className}`}>{children}</td>;
}

// ── Form controls ──

const controlBase =
  "w-full px-3.5 py-2.5 bg-white border border-brand-border rounded-xl text-[14px] text-brand-dark placeholder-brand-muted focus:outline-none focus:border-brand-primary disabled:bg-brand-light disabled:opacity-60";

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-[13px] font-semibold text-brand-dark mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[12px] text-brand-muted mt-1">{hint}</p>}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input {...rest} className={`${controlBase} ${className}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return <textarea {...rest} className={`${controlBase} min-h-[120px] leading-relaxed ${className}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", ...rest } = props;
  return <select {...rest} className={`${controlBase} cursor-pointer ${className}`} />;
}

/** 테이블 셀 안에서 쓰는 소형 상태 변경 셀렉트 */
export function InlineSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", ...rest } = props;
  return (
    <select
      {...rest}
      className={`pl-2.5 pr-7 py-1.5 rounded-lg border border-brand-border bg-white text-[13px] font-medium text-brand-dark focus:outline-none focus:border-brand-primary cursor-pointer disabled:opacity-50 ${className}`}
    />
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const buttonVariant: Record<ButtonVariant, string> = {
  primary: "bg-brand-primary text-white hover:bg-brand-primary-hover",
  secondary: "bg-brand-light text-brand-primary hover:bg-brand-primary-50",
  ghost: "border border-brand-border text-brand-sub hover:bg-brand-light",
  danger: "bg-brand-error-bg text-brand-error hover:bg-[#FFD3DA]",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "px-3 py-1.5 text-[13px]" : "px-4 py-2.5 text-[14px]";
  return (
    <button
      {...rest}
      className={`rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${sizeClass} ${buttonVariant[variant]} ${className}`}
    />
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  className = "",
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "placeholder" | "className">) {
  return (
    <div className={`relative ${className}`}>
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${controlBase} pl-9`}
      />
    </div>
  );
}

/** 세그먼트 탭 (필터용) */
export function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { key: string; label: string; count?: number }[];
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex gap-1.5 bg-white border border-brand-border rounded-xl p-1 w-fit overflow-x-auto no-scrollbar">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold whitespace-nowrap transition-all ${
            value === t.key ? "bg-brand-primary text-white" : "text-brand-sub hover:bg-brand-light"
          }`}
        >
          {t.label}
          {t.count != null && <span className="ml-1.5 opacity-70 tabular-nums">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

/** 중앙 모달 — 배경 클릭 시 닫힘 */
export function Modal({
  title,
  description,
  onClose,
  children,
  footer,
  width = "max-w-[520px]",
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl w-full ${width} max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4 border-b border-brand-border">
          <h3 className="text-[17px] font-bold text-brand-dark">{title}</h3>
          {description && <p className="text-[13px] text-brand-sub mt-0.5">{description}</p>}
        </div>
        <div className="px-6 py-5 overflow-y-auto space-y-4">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-brand-border flex gap-2">{footer}</div>}
      </div>
    </div>
  );
}

/** 저장/취소 푸터 */
export function ModalFooter({
  onClose,
  onSubmit,
  pending,
  submitLabel = "저장",
}: {
  onClose: () => void;
  onSubmit: () => void;
  pending: boolean;
  submitLabel?: string;
}) {
  return (
    <>
      <Button variant="ghost" className="flex-1" onClick={onClose}>
        취소
      </Button>
      <Button className="flex-1" onClick={onSubmit} disabled={pending}>
        {pending ? "처리 중..." : submitLabel}
      </Button>
    </>
  );
}

/** 액션 결과 알림 (성공/실패) */
export function Notice({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <p className={`text-[13px] ${ok ? "text-brand-success" : "text-brand-error"}`}>{children}</p>
  );
}
