"use client";

import { useState, useTransition } from "react";
import { Card, Badge, TableShell, Th, Td, EmptyState } from "@/components/admin/ui";
import { formatKRW, productTypeLabel, productUnitLabel } from "@/lib/admin-format";
import { toggleProductActive } from "../actions";

export type AdminProductRow = {
  id: string;
  productType: string;
  title: string;
  description: string;
  unit: string;
  unitPrice: number;
  minQty: number;
  maxQty: number | null;
  estDurationDays: number | null;
  isActive: boolean;
  campaignCount: number;
};

export function ProductsClient({ rows }: { rows: AdminProductRow[] }) {
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [state, setState] = useState<Record<string, boolean>>(() => Object.fromEntries(rows.map((r) => [r.id, r.isActive])));

  const toggle = (id: string) => {
    const next = !state[id];
    setBusyId(id);
    setState((s) => ({ ...s, [id]: next }));
    startTransition(async () => {
      const res = await toggleProductActive(id, next);
      if ("error" in res) setState((s) => ({ ...s, [id]: !next })); // 롤백
      setBusyId(null);
    });
  };

  if (!rows.length) return <Card><EmptyState message="등록된 상품이 없습니다." /></Card>;

  return (
    <Card>
      <TableShell
        head={
          <>
            <Th>상품</Th>
            <Th>유형</Th>
            <Th className="text-right">단가</Th>
            <Th className="text-center">수량 범위</Th>
            <Th className="text-center">캠페인</Th>
            <Th className="text-center">판매</Th>
          </>
        }
      >
        {rows.map((p) => {
          const active = state[p.id];
          return (
            <tr key={p.id} className="hover:bg-brand-light/50 transition-colors align-top">
              <Td>
                <div className="font-semibold text-brand-dark">{p.title}</div>
                <div className="text-[12.5px] text-brand-muted line-clamp-1 max-w-[280px]">{p.description || "-"}</div>
              </Td>
              <Td>
                <Badge tone="blue">{productTypeLabel[p.productType] ?? p.productType}</Badge>
                <div className="text-[11.5px] text-brand-muted mt-1">{productUnitLabel[p.unit] ?? p.unit}</div>
              </Td>
              <Td className="text-right tabular-nums font-semibold text-brand-dark">{formatKRW(p.unitPrice)}</Td>
              <Td className="text-center text-brand-sub tabular-nums">
                {p.minQty} ~ {p.maxQty ?? "∞"}
                {p.estDurationDays ? <div className="text-[11.5px] text-brand-muted">{p.estDurationDays}일</div> : null}
              </Td>
              <Td className="text-center tabular-nums">{p.campaignCount}</Td>
              <Td className="text-center">
                <button
                  onClick={() => toggle(p.id)}
                  disabled={pending && busyId === p.id}
                  role="switch"
                  aria-checked={active}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${active ? "bg-brand-success" : "bg-brand-border-strong"}`}
                >
                  <span className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white transition-transform ${active ? "translate-x-5.5" : "translate-x-1"}`} />
                </button>
                <div className={`text-[11px] mt-1 font-semibold ${active ? "text-brand-success" : "text-brand-muted"}`}>{active ? "판매중" : "중지"}</div>
              </Td>
            </tr>
          );
        })}
      </TableShell>
    </Card>
  );
}
