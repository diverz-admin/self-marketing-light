"use client";

import { useMemo, useState, useTransition } from "react";
import { Card, Badge, Button, Notice } from "@/components/admin/ui";
import { formatNumber, reviewTypeLabel, REVIEW_PRODUCT_CHANNELS } from "@/lib/admin-format";
import { saveReviewPrice } from "../../actions";

/**
 * 리뷰 상품등록 — 채널 × 리뷰 유형 조합마다 "건별 가격" 한 줄.
 * 리뷰는 원고 조건이 유형으로 이미 정해져 있어 관리자가 정할 값이 가격뿐이라 목록을 고정한다.
 *   · 네이버 플레이스 : 블로그 배포 / 영수증 리뷰
 *   · 네이버 쇼핑     : 제품 제공 / 제품 미제공
 *   · 쿠팡            : 제품 제공 / 제품 미제공
 * 플랫폼이 곧 묶음이라 표 대신 플랫폼 카드로 나눠 한눈에 비교되게 한다.
 */
export type ReviewPriceRow = {
  channel: string;
  reviewType: string;
  /** null 이면 아직 상품이 없는 줄 — 저장하면 새로 만든다 */
  productId: string | null;
  title: string;
  unitPrice: number;
  isActive: boolean;
};

type Draft = { price: string; isActive: boolean };

const keyOf = (r: { channel: string; reviewType: string }) => `${r.channel}:${r.reviewType}`;

/** 플랫폼 카드 머리말 색 — 고객 화면의 채널 색과 맞춘다 */
const CHANNEL_ACCENT: Record<string, string> = {
  place: "#0D3473",
  shopping: "#059669",
  coupang: "#EF4444",
};

export function ReviewProductsClient({ rows }: { rows: ReviewPriceRow[] }) {
  const [draft, setDraft] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(
      rows.map((r) => [keyOf(r), { price: r.unitPrice ? String(r.unitPrice) : "", isActive: r.isActive }]),
    ),
  );
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  const set = (key: string, patch: Partial<Draft>) =>
    setDraft((d) => ({ ...d, [key]: { ...d[key], ...patch } }));

  // 저장하지 않은 줄만 모아 둔다 — 저장 버튼과 안내에 함께 쓴다
  const changed = useMemo(
    () =>
      rows.filter((r) => {
        const d = draft[keyOf(r)];
        return d && (Number(d.price || 0) !== r.unitPrice || d.isActive !== r.isActive);
      }),
    [rows, draft],
  );

  const byChannel = REVIEW_PRODUCT_CHANNELS.map((c) => ({
    ...c,
    items: rows.filter((r) => r.channel === c.key),
  })).filter((c) => c.items.length > 0);

  const saveAll = () => {
    setMsg(null);
    startTransition(async () => {
      for (const r of changed) {
        const d = draft[keyOf(r)];
        const res = await saveReviewPrice({
          productId: r.productId ?? undefined,
          channel: r.channel,
          reviewType: r.reviewType,
          unitPrice: d.price || "0",
          isActive: d.isActive,
        });
        if ("error" in res) {
          setMsg({ text: res.error, ok: false });
          return;
        }
      }
      setMsg({ text: `${changed.length}건 저장되었습니다.`, ok: true });
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {byChannel.map((c) => {
          const accent = CHANNEL_ACCENT[c.key] ?? "#0D3473";
          const onSale = c.items.filter((r) => draft[keyOf(r)]?.isActive).length;
          return (
            <Card key={c.key} className="overflow-hidden p-0">
              <div className="flex items-center justify-between gap-2 px-5 py-3.5 border-b border-brand-border">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: accent }} />
                  <p className="text-[15px] font-bold text-brand-dark truncate">{c.label}</p>
                </div>
                <Badge tone={onSale > 0 ? "green" : "gray"}>
                  판매중 {onSale}/{c.items.length}
                </Badge>
              </div>

              <div className="divide-y divide-brand-border">
                {c.items.map((r) => {
                  const key = keyOf(r);
                  const d = draft[key] ?? { price: "", isActive: false };
                  const amount = Number(d.price || 0);
                  const isDirty =
                    amount !== r.unitPrice || d.isActive !== r.isActive;
                  return (
                    <div key={key} className="px-5 py-4">
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className="text-[14px] font-semibold text-brand-dark truncate">
                            {reviewTypeLabel[r.reviewType] ?? r.reviewType}
                          </p>
                          {isDirty && (
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" title="저장 전 변경" />
                          )}
                        </div>

                        {/* 판매 여부 — 라벨을 붙여 토글만 덩그러니 놓이지 않게 한다 */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={d.isActive}
                          onClick={() => set(key, { isActive: !d.isActive })}
                          className="flex items-center gap-1.5 shrink-0 group"
                        >
                          <span
                            className={`text-[12px] font-bold transition-colors ${
                              d.isActive ? "text-green-600" : "text-brand-muted"
                            }`}
                          >
                            {d.isActive ? "판매중" : "중지"}
                          </span>
                          <span
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              d.isActive ? "bg-green-500" : "bg-brand-border"
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                d.isActive ? "translate-x-[18px]" : "translate-x-[3px]"
                              }`}
                            />
                          </span>
                        </button>
                      </div>

                      {/* 건별 가격 — 숫자에 시선이 가도록 크게, 단위는 입력 안에 붙인다 */}
                      <div
                        className={`flex items-center rounded-xl border bg-white transition-colors focus-within:border-brand-primary ${
                          isDirty ? "border-amber-300" : "border-brand-border"
                        }`}
                      >
                        <span className="pl-3 text-[15px] font-bold text-brand-muted select-none">₩</span>
                        <input
                          value={d.price}
                          onChange={(e) => set(key, { price: e.target.value.replace(/[^\d]/g, "") })}
                          inputMode="numeric"
                          placeholder="0"
                          aria-label={`${c.label} ${reviewTypeLabel[r.reviewType] ?? r.reviewType} 건별 가격`}
                          className="w-full min-w-0 bg-transparent px-2 py-2.5 text-right text-[18px] font-extrabold tabular-nums text-brand-dark focus:outline-none"
                        />
                        <span className="pr-3 text-[12.5px] text-brand-muted whitespace-nowrap select-none">원 / 건</span>
                      </div>
                      <p className="mt-1 text-right text-[12px] text-brand-muted tabular-nums">
                        {amount > 0 ? `${formatNumber(amount)}원` : "가격 미등록"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {msg && <Notice ok={msg.ok}>{msg.text}</Notice>}

      {/* 저장은 한 곳에서 — 줄마다 버튼을 두면 표가 버튼으로 뒤덮인다 */}
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-brand-sub">
          {changed.length > 0 ? (
            <>
              저장하지 않은 변경 <span className="font-bold text-brand-dark">{changed.length}</span>건
            </>
          ) : (
            "판매중으로 둔 유형만 고객 신청 화면에 노출됩니다."
          )}
        </p>
        <Button onClick={saveAll} disabled={pending || changed.length === 0}>
          {pending ? "저장 중..." : "변경사항 저장"}
        </Button>
      </Card>
    </div>
  );
}
