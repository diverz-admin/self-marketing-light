"use client";

import React, { useMemo, useState, useTransition } from "react";
import {
  Card, TableShell, Th, Td, EmptyState, Badge, Tabs, SearchInput,
  Button, Modal, ModalFooter, Field, Input, Select, Textarea, Notice,
} from "@/components/admin/ui";
import {
  formatKRW, formatNumber, reviewTypeLabel, productCategoryMeta,
  REVIEW_PRODUCT_CHANNELS, REVIEW_TYPES_BY_CHANNEL, reviewProductDefaults,
} from "@/lib/admin-format";
import { upsertProduct, toggleProductActive, deleteProduct, type ProductInput } from "../../actions";

/**
 * 리뷰/체험단 상품등록 — 고객 신청 화면(/marketing/review/place/blog-reporter 등)에
 * 고정으로 노출되는 값만 다룬다.
 *  · 유형 카드   : 카드 제목 + 카드 설명
 *  · 소개 블록   : 소개 문단
 *  · 스케줄 제약 : 발행 일수 / 일발행량 입력 가능 범위
 *  · 금액        : 건당 차감 금액
 * 캠페인명·키워드·해시태그처럼 고객이 매번 입력하는 값은 상품이 아니라 캠페인에 속한다.
 */
export type AdminReviewProductRow = {
  id: string;
  productType: string;
  category: string | null;
  title: string;
  description: string;
  unit: string;
  unitPrice: number;
  minQty: number;
  maxQty: number | null;
  minRunDays: number | null;
  estDurationDays: number | null;
  channel: string | null;
  subtitle: string | null;
  tier: string | null;
  reviewType: string | null;
  blogGrade: string | null;
  isActive: boolean;
  campaignCount: number;
  // 폼에 노출하지 않지만 저장 시 보존해야 하는 값들
  thumbnailUrl: string | null;
  thumbnailPath: string | null;
  isSale: boolean;
  isRecommended: boolean;
  originalPrice: number | null;
  saleTag: string | null;
  reviewChars: number | null;
  reviewImages: number | null;
  deliveryTiming: string | null;
};

const STATUS_TABS = [
  { key: "all", label: "전체" },
  { key: "active", label: "판매중" },
  { key: "inactive", label: "판매중지" },
];

const CHANNEL_LABEL: Record<string, string> = Object.fromEntries(
  REVIEW_PRODUCT_CHANNELS.map((c) => [c.key, c.label]),
);

export function ReviewProductsClient({ rows }: { rows: AdminReviewProductRow[] }) {
  const [status, setStatus] = useState("all");
  const [channel, setChannel] = useState("all");
  const [reviewType, setReviewType] = useState("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<AdminReviewProductRow | "new" | null>(null);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  const counts = useMemo(
    () => ({
      all: rows.length,
      active: rows.filter((r) => r.isActive).length,
      inactive: rows.filter((r) => !r.isActive).length,
    }),
    [rows],
  );

  const channelCounts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const r of rows) {
      const key = r.channel ?? "none";
      c[key] = (c[key] ?? 0) + 1;
    }
    return c;
  }, [rows]);

  // 리뷰 유형 칩은 선택한 플랫폼에서 실제로 열려 있는 유형만 보여준다
  const typeChips = useMemo(() => {
    const keys =
      channel === "all" ? Object.values(REVIEW_TYPES_BY_CHANNEL).flat() : REVIEW_TYPES_BY_CHANNEL[channel] ?? [];
    const seen = new Set<string>();
    return keys.filter((k) => (seen.has(k) ? false : seen.add(k)));
  }, [channel]);

  const typeCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of rows) {
      if (channel !== "all" && r.channel !== channel) continue;
      if (r.reviewType) c[r.reviewType] = (c[r.reviewType] ?? 0) + 1;
    }
    return c;
  }, [rows, channel]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (status === "active" && !r.isActive) return false;
      if (status === "inactive" && r.isActive) return false;
      if (channel !== "all" && r.channel !== channel) return false;
      if (reviewType !== "all" && r.reviewType !== reviewType) return false;
      return !q || r.title.toLowerCase().includes(q);
    });
  }, [rows, status, channel, reviewType, query]);

  const act = (id: string, fn: () => Promise<{ success: true } | { error: string }>) => {
    startTransition(async () => {
      const res = await fn();
      setMsg({ id, text: "error" in res ? res.error : "변경됨", ok: !("error" in res) });
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <Tabs
          tabs={STATUS_TABS.map((t) => ({ ...t, count: counts[t.key as keyof typeof counts] }))}
          value={status}
          onChange={setStatus}
        />
        <div className="md:ml-auto flex gap-2">
          <SearchInput value={query} onChange={setQuery} placeholder="상품명 검색" className="md:w-64" />
          <Button onClick={() => setEditing("new")}>상품 등록</Button>
        </div>
      </div>

      {/* 플랫폼 → 리뷰 유형 순으로 좁혀 본다 */}
      <div className="bg-white rounded-2xl border border-brand-border divide-y divide-brand-border mb-4">
        <FilterRow label="플랫폼">
          <FilterChip
            label="전체"
            count={channelCounts.all}
            active={channel === "all"}
            onClick={() => {
              setChannel("all");
              setReviewType("all");
            }}
          />
          {REVIEW_PRODUCT_CHANNELS.map((c) => (
            <FilterChip
              key={c.key}
              label={c.label}
              count={channelCounts[c.key] ?? 0}
              active={channel === c.key}
              onClick={() => {
                setChannel(c.key);
                setReviewType("all");
              }}
            />
          ))}
        </FilterRow>

        <FilterRow label="리뷰 유형">
          <FilterChip
            label="전체"
            count={typeChips.reduce((sum, k) => sum + (typeCounts[k] ?? 0), 0)}
            active={reviewType === "all"}
            onClick={() => setReviewType("all")}
          />
          {typeChips.map((k) => (
            <FilterChip
              key={k}
              label={reviewTypeLabel[k] ?? k}
              count={typeCounts[k] ?? 0}
              active={reviewType === k}
              onClick={() => setReviewType(k)}
            />
          ))}
        </FilterRow>
      </div>

      <Card>
        {filtered.length ? (
          <TableShell
            head={
              <>
                <Th>상품</Th>
                <Th>플랫폼 / 리뷰 유형</Th>
                <Th className="text-right">건당 금액</Th>
                <Th className="text-center">발행 일수</Th>
                <Th className="text-center">일발행량</Th>
                <Th className="text-center">캠페인</Th>
                <Th>상태</Th>
                <Th className="text-right">관리</Th>
              </>
            }
          >
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-brand-light/50 transition-colors">
                <Td>
                  <div className="font-semibold text-brand-dark">{p.title}</div>
                  <div className="text-[12.5px] text-brand-muted line-clamp-1 max-w-[260px]">
                    {p.subtitle || p.description}
                  </div>
                  {msg?.id === p.id && <Notice ok={msg.ok}>{msg.text}</Notice>}
                </Td>
                <Td>
                  <div className="text-brand-text">{p.channel ? CHANNEL_LABEL[p.channel] ?? p.channel : "-"}</div>
                  {p.reviewType && (
                    <Badge tone={p.category ? productCategoryMeta[p.category].tone : "gray"}>
                      {reviewTypeLabel[p.reviewType] ?? p.reviewType}
                    </Badge>
                  )}
                </Td>
                <Td className="text-right tabular-nums font-semibold text-brand-dark">{formatKRW(p.unitPrice)}</Td>
                <Td className="text-center text-[12.5px] tabular-nums text-brand-sub">
                  {rangeLabel(p.minRunDays ?? 1, p.estDurationDays, "일")}
                </Td>
                <Td className="text-center text-[12.5px] tabular-nums text-brand-sub">
                  {rangeLabel(p.minQty, p.maxQty, "건")}
                </Td>
                <Td className="text-center tabular-nums text-brand-sub">{formatNumber(p.campaignCount)}</Td>
                <Td>
                  <Badge tone={p.isActive ? "green" : "gray"}>{p.isActive ? "판매중" : "중지"}</Badge>
                </Td>
                <Td className="text-right">
                  <div className="flex gap-1.5 justify-end">
                    <Button size="sm" variant="secondary" onClick={() => setEditing(p)}>
                      수정
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      onClick={() => act(p.id, () => toggleProductActive(p.id, !p.isActive))}
                    >
                      {p.isActive ? "중지" : "판매"}
                    </Button>
                    <Button size="sm" variant="danger" disabled={pending} onClick={() => act(p.id, () => deleteProduct(p.id))}>
                      삭제
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </TableShell>
        ) : (
          <EmptyState message="등록된 리뷰 상품이 없습니다." />
        )}
      </Card>

      {editing && (
        <ReviewProductModal product={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

/** "1 ~ 7일" / "1일 이상" 형태로 범위를 표시한다 */
function rangeLabel(min: number | null, max: number | null, unit: string) {
  if (min == null && max == null) return "-";
  if (max == null) return `${min ?? 1}${unit} 이상`;
  return `${min ?? 1} ~ ${max}${unit}`;
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span className="w-[92px] shrink-0 pt-1.5 text-[12.5px] font-bold text-brand-muted">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`px-3.5 py-2 rounded-xl text-[13.5px] font-semibold whitespace-nowrap transition-all ${
        active
          ? "bg-brand-primary text-white"
          : "bg-brand-light text-brand-text hover:bg-brand-primary-50 hover:text-brand-primary"
      }`}
    >
      {label}
      <span
        className={`ml-2 px-1.5 py-0.5 rounded-md text-[11.5px] tabular-nums ${
          active ? "bg-white/20 text-white" : "bg-white text-brand-muted"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function ReviewProductModal({
  product,
  onClose,
}: {
  product: AdminReviewProductRow | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ProductInput>(() => {
    const channel = product?.channel ?? "place";
    const reviewType = product?.reviewType ?? REVIEW_TYPES_BY_CHANNEL[channel]?.[0] ?? "blog_distribute";
    // 신규 등록도 처음부터 카테고리·상품 유형이 채워져 있어야 "미분류"로 저장되지 않는다
    const derived = reviewProductDefaults(channel, reviewType);
    return {
      id: product?.id,
      category: product?.category ?? derived.category,
      productType: product?.productType ?? derived.productType,
      unit: "per_item", // 리뷰 상품은 언제나 건당 판매
      channel,
      reviewType,
      title: product?.title ?? "",
      subtitle: product?.subtitle ?? "",
      description: product?.description ?? "",
      unitPrice: product ? String(product.unitPrice) : "",
      minRunDays: product?.minRunDays != null ? String(product.minRunDays) : "1",
      estDurationDays: product?.estDurationDays != null ? String(product.estDurationDays) : "7",
      minQty: product ? String(product.minQty) : "1",
      maxQty: product?.maxQty != null ? String(product.maxQty) : "",
      isActive: product?.isActive ?? true,
      // 폼에 없는 값 — 저장이 전체 필드를 덮어쓰므로 그대로 실어 보내 보존한다
      tier: product?.tier ?? "",
      blogGrade: product?.blogGrade ?? "",
      thumbnailUrl: product?.thumbnailUrl ?? null,
      thumbnailPath: product?.thumbnailPath ?? null,
      isSale: product?.isSale ?? false,
      isRecommended: product?.isRecommended ?? false,
      originalPrice: product?.originalPrice != null ? String(product.originalPrice) : "",
      saleTag: product?.saleTag ?? "",
      reviewChars: product?.reviewChars != null ? String(product.reviewChars) : "",
      reviewImages: product?.reviewImages != null ? String(product.reviewImages) : "",
      deliveryTiming: product?.deliveryTiming ?? "",
    };
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const availableTypes = REVIEW_TYPES_BY_CHANNEL[form.channel ?? "place"] ?? [];

  /** 플랫폼을 바꾸면 그 플랫폼에 없는 리뷰 유형은 첫 번째 유형으로 되돌린다 */
  const setChannel = (channel: string) => {
    const types = REVIEW_TYPES_BY_CHANNEL[channel] ?? [];
    const nextType = types.includes(form.reviewType ?? "") ? form.reviewType! : types[0] ?? "";
    setForm((f) => ({ ...f, channel, reviewType: nextType, ...reviewProductDefaults(channel, nextType) }));
  };

  const setReviewType = (reviewType: string) =>
    setForm((f) => ({ ...f, reviewType, ...reviewProductDefaults(f.channel ?? "place", reviewType) }));

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await upsertProduct(form);
      if ("error" in res) setError(res.error);
      else onClose();
    });
  };

  const categoryLabel = form.category ? productCategoryMeta[form.category]?.fullLabel : null;

  return (
    <Modal
      title={product ? "리뷰 상품 수정" : "리뷰 상품 등록"}
      description="고객 신청 화면에 고정으로 노출되는 값을 설정합니다"
      onClose={onClose}
      width="max-w-[640px]"
      footer={<ModalFooter onClose={onClose} onSubmit={submit} pending={pending} />}
    >
      {/* ── 유형 카드 (신청 화면 최상단 "유형 선택") ── */}
      <SectionTitle title="유형 선택 카드" desc="신청 화면 맨 위에서 고르는 카드에 그대로 들어갑니다." />

      <div className="grid grid-cols-2 gap-3">
        <Field label="플랫폼">
          <Select value={form.channel} onChange={(e) => setChannel(e.target.value)}>
            {REVIEW_PRODUCT_CHANNELS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="리뷰 유형" hint={categoryLabel ? `카테고리: ${categoryLabel}` : "카테고리 미분류로 저장됩니다"}>
          <Select value={form.reviewType} onChange={(e) => setReviewType(e.target.value)}>
            {availableTypes.map((k) => (
              <option key={k} value={k}>
                {reviewTypeLabel[k] ?? k}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="카드 제목" className="mt-3">
        <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="블로그배포" />
      </Field>

      <Field label="카드 설명" className="mt-3" hint="카드 제목 아래 한 줄">
        <Input
          value={form.subtitle}
          onChange={(e) => set("subtitle", e.target.value)}
          placeholder="전문 블로거가 방문 리뷰 콘텐츠를 배포합니다."
        />
      </Field>

      {/* ── 소개 블록 ── */}
      <div className="pt-4 mt-4 border-t border-brand-border">
        <SectionTitle title="상품 소개" desc="카드 아래 소개 영역에 표시됩니다." />

        <Field label="소개 문단">
          <Textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="min-h-[80px]"
            placeholder="전문 블로거 네트워크를 통해 플레이스 방문 리뷰 콘텐츠를 배포하는 캠페인입니다."
          />
        </Field>
      </div>

      {/* ── 금액 · 스케줄 제약 ── */}
      <div className="pt-4 mt-4 border-t border-brand-border">
        <SectionTitle
          title="금액 · 스케줄 제한"
          desc="고객이 스케줄 설정에서 입력할 수 있는 범위입니다. 결제 금액 = 건당 금액 × 발행 일수 × 일발행량."
        />

        <Field label="건당 금액 (원)" hint="리뷰 1건당 차감 금액">
          <Input value={form.unitPrice} onChange={(e) => set("unitPrice", e.target.value)} inputMode="numeric" placeholder="1500" />
        </Field>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <Field label="발행 일수 최소" hint="신청 화면 최솟값">
            <Input value={form.minRunDays} onChange={(e) => set("minRunDays", e.target.value)} inputMode="numeric" placeholder="1" />
          </Field>
          <Field label="발행 일수 최대" hint="신청 화면 최댓값 (현재 7일)">
            <Input value={form.estDurationDays} onChange={(e) => set("estDurationDays", e.target.value)} inputMode="numeric" placeholder="7" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <Field label="일발행량 최소">
            <Input value={form.minQty} onChange={(e) => set("minQty", e.target.value)} inputMode="numeric" placeholder="1" />
          </Field>
          <Field label="일발행량 최대" hint="비우면 제한 없음">
            <Input value={form.maxQty} onChange={(e) => set("maxQty", e.target.value)} inputMode="numeric" placeholder="제한 없음" />
          </Field>
        </div>
      </div>

      <label className="flex items-center gap-2 text-[14px] text-brand-dark cursor-pointer mt-4">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => set("isActive", e.target.checked)}
          className="w-4 h-4 accent-[#0D3473]"
        />
        판매중 상태로 저장 (신청 화면에 노출)
      </label>

      {error && <Notice ok={false}>{error}</Notice>}
    </Modal>
  );
}

function SectionTitle({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-3">
      <p className="text-[13px] font-bold text-brand-dark mb-1">{title}</p>
      <p className="text-[12px] text-brand-muted">{desc}</p>
    </div>
  );
}
