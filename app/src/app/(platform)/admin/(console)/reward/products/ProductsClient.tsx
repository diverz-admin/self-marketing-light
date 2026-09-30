"use client";

import React, { useMemo, useState, useTransition } from "react";
import {
  Card, TableShell, Th, Td, EmptyState, Badge, Tabs, SearchInput,
  Button, Modal, ModalFooter, Field, Input, Select, Textarea, Notice,
} from "@/components/admin/ui";
import {
  formatKRW, formatNumber, productTypeLabel, productUnitLabel,
  PRODUCT_CATEGORIES, productCategoryMeta, productCategoryDefaults,
  tiersFor, efficiencyGrade,
} from "@/lib/admin-format";
import { ThumbnailUploader } from "@/components/admin/ThumbnailUploader";
import { upsertProduct, toggleProductActive, deleteProduct, type ProductInput } from "../../actions";

/** 판매가 대비 마진율 (%) — 판매가가 0이면 계산하지 않는다 */
function marginRate(unitPrice: number, costPrice: number) {
  if (!unitPrice) return 0;
  return Math.round(((unitPrice - costPrice) / unitPrice) * 100);
}

export type AdminProductRow = {
  id: string;
  productType: string;
  category: string | null;
  title: string;
  description: string;
  unit: string;
  unitPrice: number;
  /** 매입 원가 — 관리자만 본다 */
  costPrice: number | null;
  minQty: number;
  maxQty: number | null;
  estDurationDays: number | null;
  channel: string | null;
  efficiency: number | null;
  avgRankUpRate: number | null;
  subscriptionInfo: string | null;
  tier: string | null;
  subtitle: string | null;
  thumbnailUrl: string | null;
  thumbnailPath: string | null;
  badgeInitial: string | null;
  badgeColor: string | null;
  isSale: boolean;
  isRecommended: boolean;
  rankUpUserRate: number | null;
  rankBefore: number | null;
  rankAfter: number | null;
  orderCutoffTime: string | null;
  sameDayStart: boolean;
  minRunDays: number | null;
  isActive: boolean;
  campaignCount: number;
};

const STATUS_TABS = [
  { key: "all", label: "전체" },
  { key: "active", label: "판매중" },
  { key: "inactive", label: "판매중지" },
];

// 이 화면은 리워드마케팅 상품만 다룬다 (리뷰/체험단은 /admin/review/products)
const REWARD_CATEGORIES = PRODUCT_CATEGORIES.filter((c) => c.group === "리워드마케팅");

// 트래픽·액션 계열만 — 리뷰 계열 유형은 리뷰/체험단 상품등록에서 다룬다
const REWARD_PRODUCT_TYPES = ["place_traffic", "store_traffic", "store_action", "rank_tracking"];

// 리워드는 일 방문당/구독 단위로만 판매한다
const REWARD_UNITS = ["per_visit_day", "subscription"];

const CHANNEL_LABEL: Record<string, string> = {
  place: "플레이스",
  shopping: "네이버쇼핑",
  coupang: "쿠팡",
};

export function ProductsClient({ rows }: { rows: AdminProductRow[] }) {
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<AdminProductRow | "new" | null>(null);
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

  const categoryCounts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length, none: 0 };
    for (const r of rows) {
      const key = r.category ?? "none";
      c[key] = (c[key] ?? 0) + 1;
    }
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (status === "active" && !r.isActive) return false;
      if (status === "inactive" && r.isActive) return false;
      if (category !== "all" && (r.category ?? "none") !== category) return false;
      return !q || r.title.toLowerCase().includes(q);
    });
  }, [rows, status, category, query]);

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

      {/* 카테고리 — 그룹을 행으로 분리해 라벨과 칩이 섞이지 않게 한다 */}
      <div className="bg-white rounded-2xl border border-brand-border divide-y divide-brand-border mb-4">
        <CategoryRow label="전체">
          <CategoryChip
            label="전체 상품"
            count={categoryCounts.all}
            active={category === "all"}
            onClick={() => setCategory("all")}
          />
        </CategoryRow>

        <CategoryRow label="리워드마케팅">
          {REWARD_CATEGORIES.map((c) => (
            <CategoryChip
              key={c.key}
              label={c.label}
              count={categoryCounts[c.key] ?? 0}
              active={category === c.key}
              onClick={() => setCategory(c.key)}
            />
          ))}
        </CategoryRow>

        {categoryCounts.none > 0 && (
          <CategoryRow label="기타">
            <CategoryChip
              label="미분류"
              count={categoryCounts.none}
              active={category === "none"}
              onClick={() => setCategory("none")}
            />
          </CategoryRow>
        )}
      </div>

      <Card>
        {filtered.length ? (
          <TableShell
            head={
              <>
                <Th>상품</Th>
                <Th>카테고리</Th>
                <Th>유형 / 채널</Th>
                <Th className="text-right">금액</Th>
                <Th className="text-center">효율</Th>
                <Th className="text-center">순위 상승</Th>
                <Th>묶음 · 구동</Th>
                <Th className="text-center">캠페인</Th>
                <Th>상태</Th>
                <Th className="text-right">관리</Th>
              </>
            }
          >
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-brand-light/50 transition-colors">
                <Td>
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-lg shrink-0 overflow-hidden border border-brand-border bg-brand-light flex items-center justify-center">
                      {p.thumbnailUrl ? (
                        // 사용자 업로드 이미지 — next/image 최적화 대상이 아니다
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[13px] font-black text-brand-muted">
                          {p.badgeInitial ?? p.title.slice(0, 1)}
                        </span>
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-brand-dark">{p.title}</span>
                        {p.isSale && <Badge tone="red">SALE</Badge>}
                        {p.isRecommended && <span title="추천 상품">👍</span>}
                      </div>
                      <div className="text-[12.5px] text-brand-muted line-clamp-1 max-w-[220px]">
                        {p.subtitle || p.description}
                      </div>
                    </div>
                  </div>
                  {msg?.id === p.id && <Notice ok={msg.ok}>{msg.text}</Notice>}
                </Td>
                <Td>
                  {p.category ? (
                    <Badge tone={productCategoryMeta[p.category].tone}>
                      {productCategoryMeta[p.category].label}
                    </Badge>
                  ) : (
                    <span className="text-[12.5px] text-brand-muted">미분류</span>
                  )}
                </Td>
                <Td>
                  <div className="text-brand-text">{productTypeLabel[p.productType] ?? p.productType}</div>
                  {p.channel && <div className="text-[12px] text-brand-muted">{CHANNEL_LABEL[p.channel] ?? p.channel}</div>}
                </Td>
                <Td className="text-right tabular-nums">
                  <div className="font-semibold text-brand-dark">{formatKRW(p.unitPrice)}</div>
                  <div className="text-[12px] text-brand-muted">{productUnitLabel[p.unit] ?? p.unit}</div>
                  {/* 원가는 관리자만 보는 값이라 판매가 아래 작게 붙인다 */}
                  {p.costPrice != null && (
                    <div className="text-[12px] text-brand-muted">
                      원가 {formatKRW(p.costPrice)}
                      <span className={marginRate(p.unitPrice, p.costPrice) < 0 ? "text-red-500 ml-1" : "text-brand-sub ml-1"}>
                        ({marginRate(p.unitPrice, p.costPrice)}%)
                      </span>
                    </div>
                  )}
                </Td>
                <Td className="text-center">
                  {p.efficiency != null ? (
                    <>
                      <div className="tabular-nums font-semibold text-brand-dark">{p.efficiency}%</div>
                      <Badge tone={efficiencyGrade(p.efficiency).tone}>{efficiencyGrade(p.efficiency).label}</Badge>
                    </>
                  ) : (
                    <span className="text-brand-muted">-</span>
                  )}
                </Td>
                {/* 고객 카드에 노출되는 값 그대로 — 경험률 % 와 상승 추이 */}
                <Td className="text-center tabular-nums text-brand-text">
                  {p.rankUpUserRate != null ? (
                    <div className="font-semibold text-brand-dark">{p.rankUpUserRate}%</div>
                  ) : (
                    <span className="text-brand-muted">-</span>
                  )}
                  {p.rankBefore != null && p.rankAfter != null && (
                    <div className="text-[12px] text-brand-muted">
                      {p.rankBefore}위 → {p.rankAfter}위
                    </div>
                  )}
                </Td>
                <Td className="text-[12.5px] max-w-[190px]">
                  {p.tier && <div className="font-semibold text-brand-text">{p.tier}</div>}
                  <div className="text-brand-sub">
                    {[
                      p.orderCutoffTime ? `마감 ${p.orderCutoffTime}` : null,
                      p.sameDayStart ? "당일구동" : null,
                      p.minRunDays ? `최소 ${p.minRunDays}일` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || p.subscriptionInfo || "-"}
                  </div>
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
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={pending || p.campaignCount > 0}
                      title={p.campaignCount > 0 ? "연결된 캠페인이 있어 삭제할 수 없습니다" : undefined}
                      onClick={() => act(p.id, () => deleteProduct(p.id))}
                    >
                      삭제
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </TableShell>
        ) : (
          <EmptyState message="등록된 상품이 없습니다." />
        )}
      </Card>

      {editing && <ProductModal product={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

/** 그룹 라벨 + 칩 묶음을 한 행으로 */
function CategoryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span className="w-[92px] shrink-0 pt-1.5 text-[12.5px] font-bold text-brand-muted">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function CategoryChip({
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

function ProductModal({ product, onClose }: { product: AdminProductRow | null; onClose: () => void }) {
  const [form, setForm] = useState<ProductInput>({
    id: product?.id,
    category: product?.category ?? "",
    productType: product?.productType ?? "place_traffic",
    title: product?.title ?? "",
    description: product?.description ?? "",
    unit: product?.unit ?? "per_visit_day",
    unitPrice: product ? String(product.unitPrice) : "",
    costPrice: product?.costPrice != null ? String(product.costPrice) : "",
    minQty: product ? String(product.minQty) : "1",
    maxQty: product?.maxQty != null ? String(product.maxQty) : "",
    channel: product?.channel ?? "",
    efficiency: product?.efficiency != null ? String(product.efficiency) : "",
    subscriptionInfo: product?.subscriptionInfo ?? "",
    tier: product?.tier ?? "",
    subtitle: product?.subtitle ?? "",
    thumbnailUrl: product?.thumbnailUrl ?? null,
    thumbnailPath: product?.thumbnailPath ?? null,
    isSale: product?.isSale ?? false,
    isRecommended: product?.isRecommended ?? false,
    rankUpUserRate: product?.rankUpUserRate != null ? String(product.rankUpUserRate) : "",
    rankBefore: product?.rankBefore != null ? String(product.rankBefore) : "",
    rankAfter: product?.rankAfter != null ? String(product.rankAfter) : "",
    orderCutoffTime: product?.orderCutoffTime ?? "",
    sameDayStart: product?.sameDayStart ?? false,
    minRunDays: product?.minRunDays != null ? String(product.minRunDays) : "",
    isActive: product?.isActive ?? true,
    // ── 폼에서 입력받지 않는 값 ──
    // 저장은 전체 필드를 덮어쓰기 때문에, 그대로 실어 보내지 않으면 기존 값이 지워진다.
    estDurationDays: product?.estDurationDays != null ? String(product.estDurationDays) : "",
    avgRankUpRate: product?.avgRankUpRate != null ? String(product.avgRankUpRate) : "",
    badgeInitial: product?.badgeInitial ?? "",
    badgeColor: product?.badgeColor ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  /** 카테고리를 고르면 그에 맞는 상품 유형·채널을 함께 채운다 (이후 개별 수정 가능) */
  const setCategory = (category: string) => {
    const defaults = productCategoryDefaults(category);
    setForm((f) => (defaults ? { ...f, category, ...defaults } : { ...f, category }));
  };

  // 현재 값이 카테고리 기본값 그대로인지 — 힌트 문구 노출 여부만 결정한다
  const categoryDefaults = productCategoryDefaults(form.category);
  const autoFilled =
    !!categoryDefaults &&
    categoryDefaults.productType === form.productType &&
    categoryDefaults.channel === form.channel;

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await upsertProduct(form);
      if ("error" in res) setError(res.error);
      else onClose();
    });
  };

  return (
    <Modal
      title={product ? "상품 수정" : "상품 등록"}
      description="상품명 · 금액 · 효율 · 평균 상승률 · 구독 정보"
      onClose={onClose}
      width="max-w-[640px]"
      footer={<ModalFooter onClose={onClose} onSubmit={submit} pending={pending} />}
    >
      <Field label="카테고리" hint="상품등록 목록에서 이 카테고리로 묶이며, 상품 유형·채널이 자동 선택됩니다">
        <Select value={form.category ?? ""} onChange={(e) => setCategory(e.target.value)}>
          <option value="">미분류</option>
          {REWARD_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.fullLabel}
            </option>
          ))}
        </Select>
      </Field>

      {/* 고객 신청 화면은 카테고리로 상품을 찾는다 — 미분류로 두면 등록해도 노출되지 않는다 */}
      {!form.category && (
        <p className="-mt-2 mb-3 px-3 py-2 rounded-lg bg-[#FCEFD9] text-[12px] font-semibold text-[#B5751B]">
          미분류 상품은 고객 신청 화면에 노출되지 않습니다. 판매하려면 카테고리를 선택하세요.
        </p>
      )}

      <Field label="상품명">
        <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="플레이스 트래픽 리워드" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="상품 유형" hint={autoFilled ? "카테고리 기준 자동 선택 · 수정 가능" : undefined}>
          <Select value={form.productType} onChange={(e) => set("productType", e.target.value)}>
            {REWARD_PRODUCT_TYPES.map((key) => (
              <option key={key} value={key}>
                {productTypeLabel[key]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="채널" hint={autoFilled ? "카테고리 기준 자동 선택 · 수정 가능" : undefined}>
          <Select value={form.channel} onChange={(e) => set("channel", e.target.value)}>
            <option value="">선택 안 함</option>
            <option value="place">플레이스</option>
            <option value="shopping">네이버쇼핑</option>
            <option value="coupang">쿠팡</option>
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="판매가 (원)">
          <Input value={form.unitPrice} onChange={(e) => set("unitPrice", e.target.value)} inputMode="numeric" placeholder="1500" />
        </Field>
        {/* 고객 화면에는 노출하지 않는 매입가 — 마진을 바로 확인할 수 있게 옆에 둔다 */}
        <Field
          label="원가 (원)"
          hint={
            form.costPrice && form.unitPrice
              ? `마진 ${marginRate(Number(form.unitPrice || 0), Number(form.costPrice || 0))}%`
              : "선택 · 관리자만 봅니다"
          }
        >
          <Input value={form.costPrice} onChange={(e) => set("costPrice", e.target.value)} inputMode="numeric" placeholder="1000" />
        </Field>
        <Field label="판매 단위">
          <Select value={form.unit} onChange={(e) => set("unit", e.target.value)}>
            {REWARD_UNITS.map((key) => (
              <option key={key} value={key}>
                {productUnitLabel[key]}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="효율 (%)" hint="상품 카드의 효율 막대에 그대로 쓰입니다 (78 이상 높음 · 50 이상 보통)">
        <Input value={form.efficiency} onChange={(e) => set("efficiency", e.target.value)} inputMode="decimal" placeholder="85" />
      </Field>

      {/* 구독 정보는 판매 단위가 구독일 때만 의미가 있다 (기존 값이 있으면 편집할 수 있게 계속 노출) */}
      {(form.unit === "subscription" || !!form.subscriptionInfo) && (
        <Field label="구독 정보" hint="구독 상품의 결제 주기 안내">
          <Input value={form.subscriptionInfo} onChange={(e) => set("subscriptionInfo", e.target.value)} placeholder="월 구독 / 30일 자동 연장" />
        </Field>
      )}

      <div className="pt-4 mt-2 border-t border-brand-border">
        <p className="text-[13px] font-bold text-brand-dark mb-1">상품 카드 표시</p>
        <p className="text-[12px] text-brand-muted mb-3">고객이 캠페인 신청 시 보는 상품 선택 카드에 그대로 노출됩니다.</p>

        <div className="grid grid-cols-2 gap-3">
          {/* 묶음 이름은 채널마다 다르다 (쿠팡은 쿠팡 전용·로켓배송) */}
          <Field label="카드 묶음" hint="비워두면 첫 묶음으로 노출됩니다">
            <Select value={form.tier} onChange={(e) => set("tier", e.target.value)}>
              <option value="">묶음 없음</option>
              {tiersFor(form.category).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="부제" hint="카드 상품명 아래 한 줄">
            <Input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="+150여 채널" />
          </Field>
        </div>

        <Field label="썸네일" className="mt-3" hint="상품 카드에 표시되는 대표 이미지">
          <ThumbnailUploader
            url={form.thumbnailUrl ?? null}
            fallbackText={form.title}
            onChange={({ url, path }) =>
              setForm((f) => ({ ...f, thumbnailUrl: url, thumbnailPath: path }))
            }
          />
        </Field>

        <div className="flex gap-5 mt-3">
          <label className="flex items-center gap-2 text-[14px] text-brand-dark cursor-pointer">
            <input type="checkbox" checked={form.isSale} onChange={(e) => set("isSale", e.target.checked)} className="w-4 h-4 accent-[#2452EB]" />
            SALE 표시
          </label>
          <label className="flex items-center gap-2 text-[14px] text-brand-dark cursor-pointer">
            <input type="checkbox" checked={form.isRecommended} onChange={(e) => set("isRecommended", e.target.checked)} className="w-4 h-4 accent-[#2452EB]" />
            추천 상품 (👍)
          </label>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-3">
          <Field label="순위 상승 경험률 (%)" hint="카드 문구: 고객의 N%가 상승 경험">
            <Input value={form.rankUpUserRate} onChange={(e) => set("rankUpUserRate", e.target.value)} inputMode="decimal" placeholder="73" />
          </Field>
          <Field label="상승 전 순위">
            <Input value={form.rankBefore} onChange={(e) => set("rankBefore", e.target.value)} inputMode="numeric" placeholder="18" />
          </Field>
          <Field label="상승 후 순위">
            <Input value={form.rankAfter} onChange={(e) => set("rankAfter", e.target.value)} inputMode="numeric" placeholder="3" />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-3">
          <Field label="당일 접수 마감">
            <Input value={form.orderCutoffTime} onChange={(e) => set("orderCutoffTime", e.target.value)} placeholder="13:30" />
          </Field>
          <Field label="최소 구동 기간 (일)">
            <Input value={form.minRunDays} onChange={(e) => set("minRunDays", e.target.value)} inputMode="numeric" placeholder="3" />
          </Field>
          <div className="flex items-end pb-2.5">
            <label className="flex items-center gap-2 text-[14px] text-brand-dark cursor-pointer">
              <input type="checkbox" checked={form.sameDayStart} onChange={(e) => set("sameDayStart", e.target.checked)} className="w-4 h-4 accent-[#2452EB]" />
              당일 구동 가능
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="최소 수량">
          <Input value={form.minQty} onChange={(e) => set("minQty", e.target.value)} inputMode="numeric" />
        </Field>
        <Field label="최대 수량">
          <Input value={form.maxQty} onChange={(e) => set("maxQty", e.target.value)} inputMode="numeric" placeholder="제한 없음" />
        </Field>
      </div>

      <Field label="설명" hint="어드민 내부용 상세 설명 — 고객 카드에는 위의 부제가 표시됩니다">
        <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} className="min-h-[80px]" />
      </Field>

      <label className="flex items-center gap-2 text-[14px] text-brand-dark cursor-pointer">
        <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 accent-[#2452EB]" />
        판매중 상태로 저장
      </label>

      {error && <Notice ok={false}>{error}</Notice>}
    </Modal>
  );
}
