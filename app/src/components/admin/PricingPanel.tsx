"use client";

import { useState, useTransition } from "react";
import {
  Card, SectionHeader, TableShell, Th, Td, EmptyState, Badge,
  Button, Modal, ModalFooter, Field, Input, Notice,
} from "@/components/admin/ui";
import { formatKRW } from "@/lib/admin-format";
import { upsertPricingRule, deletePricingRule, type PricingRuleInput } from "@/app/(platform)/admin/(console)/actions";

export type PricingRuleRow = {
  id: string;
  category: string;
  key: string;
  label: string;
  unitPrice: number;
  unit: string;
  isActive: boolean;
  sortOrder: number;
};

/**
 * 기획서 전반의 "금액 설정 필요" 항목을 다루는 공용 패널.
 * category 단위로 항목을 등록/수정하고, presets로 기본 항목을 빠르게 채운다.
 */
export function PricingPanel({
  title,
  description,
  category,
  rows,
  presets = [],
}: {
  title: string;
  description?: string;
  category: string;
  rows: PricingRuleRow[];
  presets?: { key: string; label: string; unit?: string }[];
}) {
  const [editing, setEditing] = useState<PricingRuleRow | "new" | null>(null);
  const [preset, setPreset] = useState<{ key: string; label: string; unit?: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  const existingKeys = new Set(rows.map((r) => r.key));
  const missingPresets = presets.filter((p) => !existingKeys.has(p.key));

  const remove = (row: PricingRuleRow) => {
    startTransition(async () => {
      const res = await deletePricingRule(row.id);
      if ("error" in res) setMsg({ id: row.id, text: res.error, ok: false });
    });
  };

  return (
    <Card>
      <SectionHeader
        title={title}
        right={
          <Button size="sm" onClick={() => { setPreset(null); setEditing("new"); }}>
            항목 추가
          </Button>
        }
      />

      {description && <p className="px-5 pt-4 text-[13px] text-brand-sub">{description}</p>}

      {missingPresets.length > 0 && (
        <div className="px-5 pt-4 flex flex-wrap gap-2">
          {missingPresets.map((p) => (
            <button
              key={p.key}
              onClick={() => { setPreset(p); setEditing("new"); }}
              className="px-3 py-1.5 rounded-lg border border-dashed border-brand-border-strong text-[13px] font-medium text-brand-sub hover:border-brand-primary hover:text-brand-primary transition-colors"
            >
              + {p.label}
            </button>
          ))}
        </div>
      )}

      <div className="pt-4">
        {rows.length ? (
          <TableShell
            head={
              <>
                <Th>항목</Th>
                <Th className="text-right">금액</Th>
                <Th>단위</Th>
                <Th>상태</Th>
                <Th className="text-right">관리</Th>
              </>
            }
          >
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-brand-light/50 transition-colors">
                <Td>
                  <div className="font-semibold text-brand-dark">{r.label}</div>
                  <div className="text-[12px] text-brand-muted font-mono">{r.key}</div>
                  {msg?.id === r.id && <Notice ok={msg.ok}>{msg.text}</Notice>}
                </Td>
                <Td className="text-right tabular-nums font-semibold text-brand-dark">{formatKRW(r.unitPrice)}</Td>
                <Td className="text-brand-sub">{r.unit}당</Td>
                <Td>
                  <Badge tone={r.isActive ? "green" : "gray"}>{r.isActive ? "적용중" : "미적용"}</Badge>
                </Td>
                <Td className="text-right">
                  <div className="flex gap-1.5 justify-end">
                    <Button size="sm" variant="secondary" onClick={() => { setPreset(null); setEditing(r); }}>
                      수정
                    </Button>
                    <Button size="sm" variant="danger" disabled={pending} onClick={() => remove(r)}>
                      삭제
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </TableShell>
        ) : (
          <EmptyState message="설정된 금액 항목이 없습니다. 위 버튼으로 추가하세요." />
        )}
      </div>

      {editing && (
        <PricingModal
          category={category}
          rule={editing === "new" ? null : editing}
          preset={preset}
          onClose={() => { setEditing(null); setPreset(null); }}
        />
      )}
    </Card>
  );
}

function PricingModal({
  category,
  rule,
  preset,
  onClose,
}: {
  category: string;
  rule: PricingRuleRow | null;
  preset: { key: string; label: string; unit?: string } | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState<PricingRuleInput>({
    id: rule?.id,
    category,
    key: rule?.key ?? preset?.key ?? "",
    label: rule?.label ?? preset?.label ?? "",
    unitPrice: rule ? String(rule.unitPrice) : "",
    unit: rule?.unit ?? preset?.unit ?? "건",
    sortOrder: rule?.sortOrder ?? 0,
    isActive: rule?.isActive ?? true,
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof PricingRuleInput>(key: K, value: PricingRuleInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await upsertPricingRule(form);
      if ("error" in res) setError(res.error);
      else onClose();
    });
  };

  return (
    <Modal
      title={rule ? "금액 수정" : "금액 항목 추가"}
      onClose={onClose}
      footer={<ModalFooter onClose={onClose} onSubmit={submit} pending={pending} />}
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="항목명">
          <Input value={form.label} onChange={(e) => set("label", e.target.value)} placeholder="예: 블로그 배포" />
        </Field>
        <Field label="항목 키" hint="영문 소문자·언더스코어">
          <Input value={form.key} onChange={(e) => set("key", e.target.value)} placeholder="blog_distribute" disabled={!!rule} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="금액 (원)">
          <Input value={form.unitPrice} onChange={(e) => set("unitPrice", e.target.value)} inputMode="numeric" placeholder="30000" />
        </Field>
        <Field label="단위">
          <Input value={form.unit} onChange={(e) => set("unit", e.target.value)} placeholder="건 / 월 / 일" />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-[14px] text-brand-dark cursor-pointer">
        <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 accent-[#0D3473]" />
        적용 상태로 저장
      </label>

      {error && <Notice ok={false}>{error}</Notice>}
    </Modal>
  );
}
