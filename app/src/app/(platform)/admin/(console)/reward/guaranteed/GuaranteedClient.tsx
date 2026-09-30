"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import {
  Card, TableShell, Th, Td, EmptyState, Badge, Tabs, SearchInput,
  Button, Modal, ModalFooter, Field, Input, Select, Textarea, Notice,
} from "@/components/admin/ui";
import { ExtensionsPanel, type ExtensionRow } from "@/components/admin/ExtensionsPanel";
import { PricingPanel, type PricingRuleRow } from "@/components/admin/PricingPanel";
import { RankTrendPanel, type RankPoint } from "@/components/admin/RankTrend";
import { PeriodPicker } from "@/components/admin/PeriodPicker";
import type { PeriodParams } from "@/lib/period-filter";
import { exportToExcel } from "@/lib/excel-export";
import {
  formatKRW, formatDate, byStagePriority, guaranteedStageMeta, GUARANTEED_STAGES, rankPlatformMeta,
} from "@/lib/admin-format";
import {
  upsertGuaranteedCampaign, deleteGuaranteedCampaign, setGuaranteedStatus,
  type GuaranteedCampaignInput,
} from "../../actions";

/**
 * 보장형 캠페인 관리 — 상위노출 관리와 같은 구성으로 맞췄다.
 *   단계 필터 → 대상·순위·보장 카운트·기간 테이블 → 아코디언(링크 + 보장 카운트 + 순위 추이)
 * 보장형은 고객이 직접 셋팅하지 않고 관리자가 캠페인을 만들어 준다.
 * 입력 항목은 고객 화면(/marketing/reward/place/guaranteed/manage)의 컬럼과 1:1로 맞춘다.
 */
export type UserOption = { id: string; name: string; email: string };

export type GuaranteedRow = {
  id: string;
  /** 캠페인이 붙어 있는 광고주 계정 */
  userId: string;
  /** 가입 시 등록한 회사명 */
  advertiser: string;
  userName: string;
  userEmail: string;
  assignedAdminName: string;
  platform: string;
  keyword: string;
  targetName: string;
  targetUrl: string | null;
  /** 상품 종류 (버즈빌·골든 등) */
  product: string;
  /** 일 작업량 */
  dailyQty: number;
  targetRank: number;
  guaranteedDays: number;
  achievedDays: number;
  /** 보장 순위에 처음 진입해 카운트가 시작된 날 */
  countStartDate: string | null;
  currentRank: number | null;
  rankHistory: RankPoint[];
  startDate: string;
  endDate: string;
  periodProvisional: boolean;
  /** submitted | setting_done | running | completed | canceled */
  stage: string;
  amount: number;
  status: string;
  memo: string | null;
  createdAt: string;
};

const STAGE_FILTERS = [{ key: "all", label: "전체" }, ...GUARANTEED_STAGES.map((s) => ({ key: s.key, label: s.label }))];

/** 보장형에서 다루는 플랫폼 — 순위추적과 같은 값을 쓴다 */
const PLATFORMS = ["place", "shopping", "coupang"];

export function GuaranteedClient({
  rows,
  extensions,
  rules,
  presets,
  users,
  productTitles,
  years,
  period,
}: {
  rows: GuaranteedRow[];
  extensions: ExtensionRow[];
  rules: PricingRuleRow[];
  presets: { key: string; label: string; unit?: string }[];
  /** 캠페인을 붙일 광고주 목록 */
  users: UserOption[];
  /** 플랫폼별 상품 이름 (상품 종류 자동완성) */
  productTitles: Record<string, string[]>;
  /** 완료 데이터가 있는 연도 (서버 집계) */
  years: number[];
  /** URL 로 전달된 연/월/일 조회 조건 */
  period: PeriodParams;
}) {
  const [view, setView] = useState("campaigns");
  // 화면을 열면 처리해야 할 신청접수부터 보이게 한다
  const [filter, setFilter] = useState("submitted");
  const [query, setQuery] = useState("");
  /** "new" 면 신규 등록, 행이면 셋팅 수정 */
  const [editing, setEditing] = useState<GuaranteedRow | "new" | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const stageCount = (key: string) => (key === "all" ? rows.length : rows.filter((r) => r.stage === key).length);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "all" && r.stage !== filter) return false;
      if (!q) return true;
      return (
        r.advertiser.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        r.targetName.toLowerCase().includes(q) ||
        r.keyword.toLowerCase().includes(q)
      );
    })
      // 손이 필요한 신청접수 건이 항상 목록 맨 위로 온다
      .sort(byStagePriority);
  }, [rows, filter, query]);

  const pendingExtensions = extensions.filter((e) => e.status === "requested").length;

  /** 신청접수 건을 엑셀로 — 화면에 보이는 컬럼 그대로 떨어뜨린다 */
  const exportSubmitted = () => {
    exportToExcel({
      fileName: "보장형_신청접수",
      rows: filtered.map((g) => ({
        신청일: formatDate(g.createdAt),
        광고주: g.advertiser,
        담당자: g.assignedAdminName || "미지정",
        플랫폼: rankPlatformMeta[g.platform]?.label ?? g.platform,
        업체명: g.targetName,
        링크: g.targetUrl ?? "",
        키워드: g.keyword,
        상품: g.product,
        일작업량: g.dailyQty,
        보장순위: g.targetRank,
        현재순위: g.currentRank ?? "",
        보장일수: g.guaranteedDays,
        달성일수: g.achievedDays,
        시작일: g.startDate,
        종료일: g.endDate,
        금액: g.amount,
        단계: guaranteedStageMeta[g.stage]?.label ?? g.status,
      })),
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <Tabs
          tabs={[
            { key: "campaigns", label: "캠페인", count: rows.length },
            { key: "extensions", label: "연장 신청", count: pendingExtensions },
            { key: "pricing", label: "금액 설정", count: rules.length },
          ]}
          value={view}
          onChange={setView}
        />
      </div>

      {view === "extensions" ? (
        <ExtensionsPanel rows={extensions} title="보장형 캠페인 연장 신청" />
      ) : view === "pricing" ? (
        <PricingPanel
          title="보장형 금액 설정"
          description="보장 순위·기간별 판매 금액을 정의합니다."
          category="guaranteed"
          rows={rules}
          presets={presets}
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-brand-border flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {STAGE_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-xl text-[13px] font-bold transition-all ${
                    filter === f.key
                      ? "bg-brand-primary text-white"
                      : "bg-brand-light text-brand-sub hover:bg-brand-border"
                  }`}
                >
                  {f.label}
                  <span className="ml-1.5 tabular-nums opacity-70">{stageCount(f.key)}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {/* 신청접수 건은 배정·정산 자료로 자주 내려받는다 */}
              {filter === "submitted" && filtered.length > 0 && (
                <Button size="sm" variant="secondary" onClick={exportSubmitted}>
                  엑셀 내보내기
                </Button>
              )}
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="광고주 · 업체 · 키워드 검색"
                className="w-full sm:w-64"
              />
              {/* 보장형은 고객이 신청하지 않는 건도 있어 관리자가 직접 만든다 */}
              <Button size="sm" onClick={() => setEditing("new")}>캠페인 등록</Button>
            </div>
          </div>

          {/* 보장완료 연/월/일 조회 — 서버에서 종료일 기준으로 걸러 온다 */}
          <PeriodPicker years={years} value={period} count={filtered.length} label="보장완료 조회" />

          {filtered.length ? (
            <>
              <TableShell
                head={
                  <>
                    <Th className="w-8" />
                    <Th>광고주</Th>
                    <Th>업체명</Th>
                    <Th>키워드</Th>
                    <Th>상품 / 일 작업량</Th>
                    <Th className="text-center">보장 / 현재 순위</Th>
                    <Th className="text-center">보장 카운트</Th>
                    <Th>카운트 시작일</Th>
                    <Th>기간</Th>
                    <Th className="text-right">금액</Th>
                    <Th>단계</Th>
                    <Th className="text-center">처리</Th>
                    <Th>담당자</Th>
                  </>
                }
              >
                {filtered.map((g) => {
                  const meta = guaranteedStageMeta[g.stage] ?? { label: g.status, tone: "gray" as const };
                  const pMeta = rankPlatformMeta[g.platform] ?? { label: g.platform, tone: "gray" as const };
                  const pct =
                    g.guaranteedDays > 0 ? Math.min(100, Math.round((g.achievedDays / g.guaranteedDays) * 100)) : 0;
                  const achieved = g.currentRank != null && g.currentRank <= g.targetRank;
                  return (
                    <Fragment key={g.id}>
                      <tr className="hover:bg-brand-light/50 transition-colors align-top">
                        <Td className="align-middle">
                          <button
                            aria-label={expandedId === g.id ? "접기" : "보장 현황 보기"}
                            onClick={() => setExpandedId(expandedId === g.id ? null : g.id)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-brand-muted hover:bg-brand-light transition-colors"
                          >
                            <svg
                              className={`w-3.5 h-3.5 transition-transform ${expandedId === g.id ? "rotate-90" : ""}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2.5}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </Td>
                        <Td>
                          <div className="font-semibold text-brand-dark">{g.advertiser}</div>
                        </Td>
                        <Td>
                          <div className="text-brand-dark font-medium">{g.targetName}</div>
                          <Badge tone={pMeta.tone}>{pMeta.label}</Badge>
                        </Td>
                        <Td className="text-[13px] text-brand-text">{g.keyword}</Td>
                        <Td className="text-[13px] whitespace-nowrap">
                          <div className="text-brand-text">{g.product || <span className="text-brand-muted">미지정</span>}</div>
                          <div className="text-[12px] text-brand-muted tabular-nums">
                            {g.dailyQty > 0 ? `${g.dailyQty.toLocaleString()}건/일` : "-"}
                          </div>
                        </Td>
                        <Td className="text-center tabular-nums">
                          <div className="font-semibold text-brand-dark">{g.targetRank}위 보장</div>
                          <div className="text-[12px]">
                            현재{" "}
                            <span className={achieved ? "text-green-600 font-semibold" : "text-brand-muted"}>
                              {g.currentRank != null ? `${g.currentRank}위` : "-"}
                            </span>
                          </div>
                        </Td>
                        <Td className="text-center min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-brand-border overflow-hidden min-w-[56px]">
                              <div className="h-full rounded-full bg-brand-primary" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[12px] text-brand-sub tabular-nums whitespace-nowrap">
                              {g.achievedDays}/{g.guaranteedDays}
                            </span>
                          </div>
                        </Td>
                        <Td className="text-[12.5px] text-brand-sub whitespace-nowrap">
                          {g.countStartDate ? (
                            formatDate(g.countStartDate)
                          ) : (
                            <span className="text-brand-muted">미시작</span>
                          )}
                        </Td>
                        <Td className="text-[12.5px] whitespace-nowrap">
                          <div className={g.periodProvisional ? "text-brand-muted" : "text-brand-sub"}>
                            {formatDate(g.startDate)}
                            <br />~ {formatDate(g.endDate)}
                          </div>
                          {g.periodProvisional && <span className="text-[11px] text-brand-muted">임시</span>}
                        </Td>
                        <Td className="text-right tabular-nums font-semibold text-brand-dark">{formatKRW(g.amount)}</Td>
                        <Td>
                          <Badge tone={meta.tone}>{meta.label}</Badge>
                        </Td>
                        {/* 셋팅은 관리자 몫이라 단계와 상관없이 언제든 열 수 있다 */}
                        <Td className="text-center">
                          <Button
                            size="sm"
                            variant={g.stage === "submitted" ? "primary" : "secondary"}
                            onClick={() => setEditing(g)}
                          >
                            {g.stage === "submitted" ? "셋팅하기" : "셋팅 수정"}
                          </Button>
                        </Td>
                        {/* 담당자 = 셋팅을 처리한 관리자 (처리 시 자동으로 기록된다) */}
                        <Td className="text-[13px]">
                          {g.assignedAdminName ? (
                            <span className="text-brand-text">{g.assignedAdminName}</span>
                          ) : (
                            <span className="text-brand-muted">미지정</span>
                          )}
                        </Td>
                      </tr>
                      {expandedId === g.id && (
                        <tr>
                          <td colSpan={13} className="p-0 bg-brand-light/40 border-t border-brand-border">
                            <RankTrendPanel
                              targetName={g.targetName}
                              keyword={g.keyword}
                              targetUrl={g.targetUrl}
                              linkLabel="플레이스 링크"
                              history={g.rankHistory}
                              aside={<GuaranteeCount row={g} />}
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </TableShell>
              <div className="px-5 py-3 border-t border-brand-border text-[12.5px] text-brand-muted">
                총 <span className="font-bold text-brand-dark">{filtered.length}</span>건
              </div>
            </>
          ) : (
            <EmptyState message="해당 조건의 보장형 캠페인이 없습니다." />
          )}
        </Card>
      )}

      {editing && (
        <GuaranteedSettingModal
          row={editing === "new" ? null : editing}
          users={users}
          productTitles={productTitles}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

/** 고객 화면의 "보장 카운트" 카드 — 보장 순위 유지 일수만 카운트한다 */
function GuaranteeCount({ row }: { row: GuaranteedRow }) {
  const counted = row.achievedDays;
  const paused = row.rankHistory.length ? row.rankHistory.length - counted : 0;
  const remain = Math.max(0, row.guaranteedDays - counted);
  const pct = row.guaranteedDays > 0 ? Math.min(100, Math.round((counted / row.guaranteedDays) * 100)) : 0;

  return (
    <div className="p-3 rounded-xl bg-brand-primary-50 border border-[#BFCCFA]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[12px] font-extrabold text-brand-primary">보장 카운트</span>
        <span className="text-[13px] font-extrabold text-brand-primary tabular-nums">
          {counted}
          <span className="text-[11px] font-medium"> / {row.guaranteedDays}</span>
        </span>
      </div>
      <div className="h-2 bg-white rounded-full overflow-hidden mb-1.5">
        <div className="h-full bg-brand-primary rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10.5px] text-brand-primary">1~{row.targetRank}순위 유지 일수만 카운트</p>
      <div className="flex items-center gap-2 mt-1.5 text-[11px] font-medium">
        <span className="flex items-center gap-1 text-brand-primary">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-primary" />
          카운트 {counted}일
        </span>
        <span className="flex items-center gap-1 text-brand-muted">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-border" />
          정지 {paused}일
        </span>
      </div>
      <p className="text-[11px] text-brand-muted mt-1">잔여 {remain}일</p>
    </div>
  );
}

/** 시작일 + n일 → "YYYY-MM-DD" (보장 일수로 종료일을 자동 계산할 때 쓴다) */
function addDays(dateStr: string, days: number) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return "";
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + Math.max(1, days) - 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

/**
 * 보장형 캠페인 등록 · 셋팅.
 * 보장형은 고객이 셋팅하지 않으므로 관리자가 여기서 캠페인을 만들고 조건을 확정한다.
 * 입력 항목은 고객 화면(보장형 캠페인 관리)의 컬럼과 같은 순서로 둔다.
 */
function GuaranteedSettingModal({
  row,
  users,
  productTitles,
  onClose,
}: {
  /** null 이면 신규 등록 */
  row: GuaranteedRow | null;
  users: UserOption[];
  productTitles: Record<string, string[]>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<GuaranteedCampaignInput>({
    id: row?.id,
    userId: row?.userId ?? "",
    platform: row?.platform ?? "place",
    targetName: row && row.targetName !== "-" ? row.targetName : "",
    targetUrl: row?.targetUrl ?? "",
    keyword: row?.keyword ?? "",
    product: row?.product ?? "",
    dailyQty: row && row.dailyQty > 0 ? String(row.dailyQty) : "",
    targetRank: String(row?.targetRank ?? 5),
    guaranteedDays: String(row?.guaranteedDays ?? 25),
    achievedDays: String(row?.achievedDays ?? 0),
    currentRank: row?.currentRank != null ? String(row.currentRank) : "",
    // 기간은 임시값이라도 항상 채워져 오므로 그대로 기본값으로 쓴다
    startDate: row?.startDate ?? "",
    endDate: row?.endDate ?? "",
    amount: String(row?.amount ?? 0),
    memo: row?.memo ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = <K extends keyof GuaranteedCampaignInput>(key: K, value: GuaranteedCampaignInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  /** 시작일·보장 일수를 바꾸면 종료일을 다시 계산해 준다 (이후 직접 수정 가능) */
  const setPeriodDriver = (key: "startDate" | "guaranteedDays", value: string) =>
    setForm((f) => {
      const next = { ...f, [key]: value };
      const days = Number(next.guaranteedDays || 0);
      if (next.startDate && days > 0) next.endDate = addDays(next.startDate, days);
      return next;
    });

  const titles = productTitles[form.platform ?? "place"] ?? [];

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await upsertGuaranteedCampaign(form);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      // 기존 건은 셋팅을 확정하면 셋팅완료로 넘긴다 (이후 구동중·보장완료는 기간에 맞춰 자동)
      if (row) {
        const moved = await setGuaranteedStatus(row.id, "setting");
        if ("error" in moved) {
          setError(moved.error);
          return;
        }
      }
      onClose();
    });
  };

  const remove = () => {
    if (!row) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteGuaranteedCampaign(row.id);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      onClose();
    });
  };

  return (
    <Modal
      title={row ? "보장형 캠페인 셋팅" : "보장형 캠페인 등록"}
      description={
        row
          ? `${row.advertiser} · ${row.targetName} — 저장하면 시작일에 맞춰 자동으로 구동됩니다`
          : "보장형은 고객이 셋팅하지 않습니다. 회원을 고르고 캠페인을 만들어 주세요."
      }
      onClose={onClose}
      width="max-w-[680px]"
      footer={<ModalFooter onClose={onClose} onSubmit={submit} pending={pending} submitLabel={row ? "저장" : "등록"} />}
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="회원" hint={row ? "등록 후에는 광고주를 바꿀 수 없습니다" : undefined}>
          {row ? (
            <Input value={`${row.userName} (${row.userEmail})`} readOnly disabled />
          ) : (
            <Select value={form.userId} onChange={(e) => set("userId", e.target.value)}>
              <option value="">회원을 선택하세요</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="플랫폼">
          <Select value={form.platform} onChange={(e) => set("platform", e.target.value)}>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {rankPlatformMeta[p]?.label ?? p}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="업체명" hint="고객 화면의 플레이스명">
          <Input value={form.targetName} onChange={(e) => set("targetName", e.target.value)} />
        </Field>
        <Field label="키워드">
          <Input value={form.keyword} onChange={(e) => set("keyword", e.target.value)} />
        </Field>
      </div>

      <Field label="플레이스 링크">
        <Input value={form.targetUrl} onChange={(e) => set("targetUrl", e.target.value)} placeholder="https://" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="상품 종류" hint="리워드 상품등록에 올라온 이름">
          <Input
            value={form.product}
            onChange={(e) => set("product", e.target.value)}
            list="guaranteed-product-titles"
            placeholder="버즈빌"
          />
          <datalist id="guaranteed-product-titles">
            {titles.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </Field>
        <Field label="일 작업량 (건/일)">
          <Input value={form.dailyQty} onChange={(e) => set("dailyQty", e.target.value)} inputMode="numeric" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="보장 순위" hint="이 순위 안에 있는 날만 카운트합니다">
          <Input value={form.targetRank} onChange={(e) => set("targetRank", e.target.value)} inputMode="numeric" />
        </Field>
        <Field label="현재 순위">
          <Input value={form.currentRank} onChange={(e) => set("currentRank", e.target.value)} inputMode="numeric" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="보장 일수">
          <Input
            value={form.guaranteedDays}
            onChange={(e) => setPeriodDriver("guaranteedDays", e.target.value)}
            inputMode="numeric"
          />
        </Field>
        <Field label="달성 일수" hint="순위 이력이 쌓이면 자동 계산됩니다">
          <Input value={form.achievedDays} onChange={(e) => set("achievedDays", e.target.value)} inputMode="numeric" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="시작일">
          <Input
            type="date"
            value={form.startDate}
            onChange={(e) => setPeriodDriver("startDate", e.target.value)}
          />
        </Field>
        <Field label="종료일" hint="시작일·보장 일수로 자동 계산됩니다">
          <Input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
        </Field>
      </div>

      <Field label="금액 (원)">
        <Input value={form.amount} onChange={(e) => set("amount", e.target.value)} inputMode="numeric" />
      </Field>

      <Field label="관리 메모">
        <Textarea value={form.memo} onChange={(e) => set("memo", e.target.value)} className="min-h-[80px]" />
      </Field>

      {error && <Notice ok={false}>{error}</Notice>}

      {row && (
        <div className="pt-1 border-t border-brand-border mt-1">
          {confirmDelete ? (
            <div className="flex items-center justify-between gap-3 pt-3">
              <span className="text-[13px] text-brand-sub">이 캠페인을 삭제할까요? 되돌릴 수 없습니다.</span>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                  취소
                </Button>
                <Button size="sm" variant="danger" disabled={pending} onClick={remove}>
                  삭제
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="mt-3 text-[13px] font-semibold text-red-500 hover:underline"
            >
              캠페인 삭제
            </button>
          )}
        </div>
      )}
    </Modal>
  );
}
