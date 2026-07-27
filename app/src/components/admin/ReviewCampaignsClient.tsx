"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import {
  Card, TableShell, Th, Td, EmptyState, Badge, Tabs, SearchInput, SectionHeader,
  Button, Modal, ModalFooter, Field, Input, Select, Textarea, Notice,
} from "@/components/admin/ui";
import { ExtensionsPanel, type ExtensionRow } from "@/components/admin/ExtensionsPanel";
import { PricingPanel, type PricingRuleRow } from "@/components/admin/PricingPanel";
import {
  formatKRW, formatDate, formatNumber, byStagePriority, reviewPlatformMeta,
  reviewStageMeta, REVIEW_STAGES, reviewTypeLabel, reviewTaskStatusMeta, REVIEW_TYPES_BY_PLATFORM,
} from "@/lib/admin-format";
import { TargetLink } from "@/components/admin/RankTrend";
import { PeriodPicker } from "@/components/admin/PeriodPicker";
import type { PeriodParams } from "@/lib/period-filter";
import { exportToExcel } from "@/lib/excel-export";
import {
  setReviewCampaignStatus, upsertReviewCampaign, deleteReviewCampaign,
  upsertReviewTask, deleteReviewTask,
  type ReviewCampaignInput, type ReviewTaskInput,
} from "@/app/(platform)/admin/(console)/actions";

export type ReviewCampaignRow = {
  id: string;
  userId: string;
  /** 가입 시 등록한 회사명 */
  advertiser: string;
  /** 셋팅을 처리한 관리자 */
  assignedAdminName: string;
  /** submitted | setting_done | running | completed | canceled */
  stage: string;
  /** 셋팅 전이라 신청일·건수로 만든 임시 기간인지 */
  periodProvisional: boolean;
  userName: string;
  userEmail: string;
  platform: string;
  reviewType: string;
  storeName: string;
  targetUrl: string | null;
  keyword: string | null;
  totalQty: number;
  completedQty: number;
  unitPrice: number;
  totalAmount: number;
  startDate: string | null;
  endDate: string | null;
  status: string;
  guide: string;
  mission: string;
  provideDetail: string;
  requestNote: string | null;
  adminMemo: string | null;
  createdAt: string;
};

export type ReviewTaskRow = {
  id: string;
  reviewCampaignId: string;
  reviewerName: string | null;
  reviewerContact: string | null;
  status: string;
  postUrl: string | null;
  receiptUrl: string | null;
  scheduledDate: string | null;
  memo: string | null;
};

export type UserOption = { id: string; name: string; email: string };

// 신청접수 → 셋팅완료 → 진행중 → 리뷰완료 (상위노출·보장형과 같은 프로세스)
const STAGE_FILTERS = [{ key: "all", label: "전체" }, ...REVIEW_STAGES.map((s) => ({ key: s.key, label: s.label }))];

/** 셋팅 모달을 열 수 있는 단계 — "셋팅 완료" 하나로 처리한다 */
const SETTING_STAGES = ["submitted", "setting_done"];

/**
 * 기획서: 리뷰 캠페인 신청 확인 → 결제 후 셋팅 → 진행현황(블로그 작성/영수증) 관리.
 * 플레이스/쇼핑 두 페이지가 동일 구조라 플랫폼만 달리해 재사용한다.
 */
export function ReviewCampaignsClient({
  platforms,
  pricingCategory,
  pricingTitle,
  pricingDescription,
  pricingPresets,
  rows,
  tasks,
  users,
  extensions,
  rules,
  years,
  period,
}: {
  platforms: string[];
  pricingCategory: string;
  pricingTitle: string;
  pricingDescription: string;
  pricingPresets: { key: string; label: string; unit?: string }[];
  rows: ReviewCampaignRow[];
  tasks: ReviewTaskRow[];
  users: UserOption[];
  extensions: ExtensionRow[];
  rules: PricingRuleRow[];
  /** 완료 데이터가 있는 연도 (서버 집계) */
  years: number[];
  /** URL 로 전달된 연/월/일 조회 조건 */
  period: PeriodParams;
}) {
  const [view, setView] = useState("campaigns");
  // 화면을 열면 처리해야 할 신청접수부터 보이게 한다
  const [filter, setFilter] = useState("submitted");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<ReviewCampaignRow | "new" | null>(null);
  const [progressTarget, setProgressTarget] = useState<ReviewCampaignRow | null>(null);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  const stageCount = (key: string) => (key === "all" ? rows.length : rows.filter((r) => r.stage === key).length);

  const pendingExtensions = extensions.filter((e) => e.status === "requested").length;

  const tasksByCampaign = useMemo(() => {
    const map: Record<string, ReviewTaskRow[]> = {};
    for (const t of tasks) (map[t.reviewCampaignId] ??= []).push(t);
    return map;
  }, [tasks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "all" && r.stage !== filter) return false;
      if (!q) return true;
      return (
        r.advertiser.toLowerCase().includes(q) ||
        r.storeName.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        (r.keyword ?? "").toLowerCase().includes(q)
      );
    })
      // 손이 필요한 신청접수 건이 항상 목록 맨 위로 온다
      .sort(byStagePriority);
  }, [rows, filter, query]);

  /** 신청접수 건을 엑셀로 — 화면에 보이는 컬럼 그대로 떨어뜨린다 */
  const exportSubmitted = () => {
    exportToExcel({
      fileName: `${platforms.includes("place") ? "플레이스" : "쇼핑"}리뷰_신청접수`,
      rows: filtered.map((r) => ({
        신청일: formatDate(r.createdAt),
        광고주: r.advertiser,
        담당자: r.assignedAdminName || "미지정",
        플랫폼: reviewPlatformMeta[r.platform]?.label ?? r.platform,
        "업체/상품": r.storeName,
        링크: r.targetUrl ?? "",
        키워드: r.keyword ?? "",
        "리뷰 유형": reviewTypeLabel[r.reviewType] ?? r.reviewType,
        건수: r.totalQty,
        완료: r.completedQty,
        단가: r.unitPrice,
        금액: r.totalAmount,
        시작일: r.startDate ?? "",
        종료일: r.endDate ?? "",
        요청사항: r.requestNote ?? "",
        단계: reviewStageMeta[r.stage]?.label ?? r.status,
      })),
    });
  };

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
          tabs={[
            { key: "campaigns", label: "신청·관리", count: rows.length },
            { key: "extensions", label: "연장 신청", count: pendingExtensions },
            { key: "pricing", label: "금액 설정", count: rules.length },
          ]}
          value={view}
          onChange={setView}
        />
        {view === "campaigns" && (
          <div className="md:ml-auto flex gap-2">
            {/* 신청접수 건은 배정·정산 자료로 자주 내려받는다 */}
            {filter === "submitted" && filtered.length > 0 && (
              <Button variant="secondary" onClick={exportSubmitted}>
                엑셀 내보내기
              </Button>
            )}
            <SearchInput value={query} onChange={setQuery} placeholder="업체 · 회원 · 키워드 검색" className="md:w-64" />
            <Button onClick={() => setEditing("new")}>캠페인 등록</Button>
          </div>
        )}
      </div>

      {view === "extensions" ? (
        <ExtensionsPanel rows={extensions} title="리뷰 캠페인 연장 신청" />
      ) : view === "pricing" ? (
        <PricingPanel
          title={pricingTitle}
          description={pricingDescription}
          category={pricingCategory}
          rows={rules}
          presets={pricingPresets}
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-brand-border flex-wrap">
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

          {/* 리뷰완료 연/월/일 조회 — 서버에서 종료일 기준으로 걸러 온다 */}
          <PeriodPicker years={years} value={period} count={filtered.length} label="리뷰완료 조회" />

          {filtered.length ? (
            <>
              <TableShell
                head={
                  <>
                    <Th className="w-8" />
                    <Th>광고주</Th>
                    <Th>업체 / 상품</Th>
                    <Th>유형</Th>
                    <Th className="text-center">진행</Th>
                    <Th>기간</Th>
                    <Th className="text-right">금액</Th>
                    <Th>단계</Th>
                    <Th className="text-center">처리</Th>
                    <Th>담당자</Th>
                  </>
                }
              >
                {filtered.map((r) => {
                  const meta = reviewStageMeta[r.stage] ?? { label: r.status, tone: "gray" as const };
                  const pMeta = reviewPlatformMeta[r.platform] ?? { label: r.platform, tone: "gray" as const };
                  const pct = r.totalQty > 0 ? Math.min(100, Math.round((r.completedQty / r.totalQty) * 100)) : 0;
                  const rowTasks = tasksByCampaign[r.id] ?? [];
                  return (
                    <Fragment key={r.id}>
                    <tr className="hover:bg-brand-light/50 transition-colors align-top">
                      <Td className="align-middle">
                        <button
                          aria-label={expandedId === r.id ? "접기" : "진행현황 보기"}
                          onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-brand-muted hover:bg-brand-light transition-colors"
                        >
                          <svg
                            className={`w-3.5 h-3.5 transition-transform ${expandedId === r.id ? "rotate-90" : ""}`}
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
                        <div className="font-semibold text-brand-dark">{r.advertiser}</div>
                        {msg?.id === r.id && <Notice ok={msg.ok}>{msg.text}</Notice>}
                      </Td>
                      <Td>
                        <div className="text-brand-dark font-medium">{r.storeName}</div>
                        <div className="text-[12.5px] text-brand-muted">{r.keyword ? `“${r.keyword}”` : ""}</div>
                      </Td>
                      <Td>
                        <Badge tone={pMeta.tone}>{pMeta.label}</Badge>
                        <div className="text-[12.5px] text-brand-sub mt-1">
                          {reviewTypeLabel[r.reviewType] ?? r.reviewType}
                        </div>
                      </Td>
                      <Td className="text-center min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-brand-border overflow-hidden min-w-[60px]">
                            <div className="h-full rounded-full bg-brand-primary" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[12px] text-brand-sub tabular-nums whitespace-nowrap">
                            {r.completedQty}/{r.totalQty}
                          </span>
                        </div>
                      </Td>
                      <Td className="text-[12.5px] whitespace-nowrap">
                        <div className={r.periodProvisional ? "text-brand-muted" : "text-brand-sub"}>
                          {formatDate(r.startDate)}
                          <br />~ {formatDate(r.endDate)}
                        </div>
                        {r.periodProvisional && <span className="text-[11px] text-brand-muted">임시</span>}
                      </Td>
                      <Td className="text-right tabular-nums">
                        <div className="font-semibold text-brand-dark">{formatKRW(r.totalAmount)}</div>
                        <div className="text-[11.5px] text-brand-muted">단가 {formatKRW(r.unitPrice)}</div>
                      </Td>
                      <Td>
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      </Td>
                      <Td className="text-center">
                        {SETTING_STAGES.includes(r.stage) && (
                          <Button size="sm" onClick={() => setEditing(r)}>
                            셋팅 완료
                          </Button>
                        )}
                      </Td>
                      {/* 담당자 = 셋팅을 처리한 관리자 (처리 시 자동으로 기록된다) */}
                      <Td className="text-[13px]">
                        {r.assignedAdminName ? (
                          <span className="text-brand-text">{r.assignedAdminName}</span>
                        ) : (
                          <span className="text-brand-muted">미지정</span>
                        )}
                      </Td>
                    </tr>
                    {expandedId === r.id && (
                      <tr>
                        <td colSpan={10} className="p-0 bg-brand-light/40 border-t border-brand-border">
                          <ReviewDetailPanel
                            row={r}
                            tasks={rowTasks}
                            onManage={() => setProgressTarget(r)}
                            onEdit={() => setEditing(r)}
                            onDelete={() => act(r.id, () => deleteReviewCampaign(r.id))}
                            disabled={pending}
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
            <EmptyState message="해당 조건의 리뷰 캠페인이 없습니다." />
          )}
        </Card>
      )}

      {editing && (
        <ReviewCampaignModal
          campaign={editing === "new" ? null : editing}
          platforms={platforms}
          users={users}
          onClose={() => setEditing(null)}
        />
      )}
      {progressTarget && (
        <ProgressModal
          campaign={progressTarget}
          tasks={tasksByCampaign[progressTarget.id] ?? []}
          onClose={() => setProgressTarget(null)}
        />
      )}
    </div>
  );
}

/**
 * 행을 펼쳤을 때 보이는 상세 — 대상 링크·요청사항·리뷰 진행현황을 한눈에 본다.
 * 목록은 좁게 두고 자세한 값은 여기로 내렸다.
 */
function ReviewDetailPanel({
  row,
  tasks,
  onManage,
  onEdit,
  onDelete,
  disabled,
}: {
  row: ReviewCampaignRow;
  tasks: ReviewTaskRow[];
  onManage: () => void;
  onEdit: () => void;
  onDelete: () => void;
  disabled: boolean;
}) {
  const done = tasks.filter((t) => t.status === "approved").length;

  return (
    <div className="px-6 py-5 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-1.5">
          <TargetLink label="대상 링크" url={row.targetUrl} />
          {row.requestNote && <p className="text-[12.5px] text-amber-700">고객 요청: {row.requestNote}</p>}
          {row.adminMemo && <p className="text-[12.5px] text-brand-muted">관리 메모: {row.adminMemo}</p>}
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" variant="secondary" onClick={onEdit}>
            셋팅 수정
          </Button>
          <Button size="sm" variant="secondary" onClick={onManage}>
            진행현황 관리
          </Button>
          <Button size="sm" variant="danger" disabled={disabled} onClick={onDelete}>
            삭제
          </Button>
        </div>
      </div>

      {(row.guide || row.mission || row.provideDetail) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: "가이드", value: row.guide },
            { label: "미션", value: row.mission },
            { label: "제공 내역", value: row.provideDetail },
          ]
            .filter((x) => x.value)
            .map((x) => (
              <div key={x.label} className="rounded-xl bg-white border border-brand-border p-3">
                <p className="text-[11.5px] font-bold text-brand-muted mb-1">{x.label}</p>
                <p className="text-[12.5px] text-brand-text whitespace-pre-wrap">{x.value}</p>
              </div>
            ))}
        </div>
      )}

      <div>
        <p className="text-[13px] font-bold text-brand-dark mb-2">
          리뷰 진행현황{" "}
          <span className="text-brand-muted font-medium">
            승인 {formatNumber(done)} / 등록 {formatNumber(tasks.length)}건
          </span>
        </p>
        {tasks.length ? (
          <div className="rounded-xl border border-brand-border bg-white divide-y divide-brand-border">
            {tasks.slice(0, 6).map((t) => {
              const tMeta = reviewTaskStatusMeta[t.status] ?? { label: t.status, tone: "gray" as const };
              return (
                <div key={t.id} className="flex items-center gap-3 px-3.5 py-2.5 text-[12.5px]">
                  <span className="font-semibold text-brand-dark min-w-[90px]">{t.reviewerName || "미배정"}</span>
                  <Badge tone={tMeta.tone}>{tMeta.label}</Badge>
                  <span className="text-brand-muted">{t.scheduledDate ? formatDate(t.scheduledDate) : ""}</span>
                  {t.postUrl && (
                    <a href={t.postUrl} target="_blank" rel="noreferrer" className="text-brand-primary underline ml-auto">
                      포스팅
                    </a>
                  )}
                </div>
              );
            })}
            {tasks.length > 6 && (
              <p className="px-3.5 py-2 text-[12px] text-brand-muted">
                외 {tasks.length - 6}건 — 진행현황 관리에서 전체를 봅니다
              </p>
            )}
          </div>
        ) : (
          <p className="text-[12.5px] text-brand-muted">아직 등록된 리뷰어가 없습니다.</p>
        )}
      </div>
    </div>
  );
}

function ReviewCampaignModal({
  campaign,
  platforms,
  users,
  onClose,
}: {
  campaign: ReviewCampaignRow | null;
  platforms: string[];
  users: UserOption[];
  onClose: () => void;
}) {
  const initialPlatform = campaign?.platform ?? platforms[0];
  const [form, setForm] = useState<ReviewCampaignInput>({
    id: campaign?.id,
    userId: campaign?.userId ?? "",
    platform: initialPlatform,
    reviewType: campaign?.reviewType ?? (REVIEW_TYPES_BY_PLATFORM[initialPlatform]?.[0] ?? "blog_distribute"),
    storeName: campaign?.storeName ?? "",
    targetUrl: campaign?.targetUrl ?? "",
    keyword: campaign?.keyword ?? "",
    totalQty: campaign ? String(campaign.totalQty) : "",
    unitPrice: campaign ? String(campaign.unitPrice) : "",
    startDate: campaign?.startDate ?? "",
    endDate: campaign?.endDate ?? "",
    requestNote: campaign?.requestNote ?? "",
    adminMemo: campaign?.adminMemo ?? "",
    guide: campaign?.guide ?? "",
    mission: campaign?.mission ?? "",
    provideDetail: campaign?.provideDetail ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof ReviewCampaignInput>(key: K, value: ReviewCampaignInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // 플랫폼 변경 시 해당 플랫폼에서 지원하지 않는 리뷰 유형은 첫 항목으로 되돌린다
  const changePlatform = (platform: string) => {
    const allowed = REVIEW_TYPES_BY_PLATFORM[platform] ?? [];
    setForm((f) => ({
      ...f,
      platform,
      reviewType: allowed.includes(f.reviewType) ? f.reviewType : (allowed[0] ?? f.reviewType),
    }));
  };

  const allowedTypes = REVIEW_TYPES_BY_PLATFORM[form.platform] ?? [];
  const estimate = Number(form.unitPrice || 0) * Number(form.totalQty || 0);

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await upsertReviewCampaign(form);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      // 셋팅을 확정하면 셋팅완료 단계로 넘어간다 (이후 진행중·리뷰완료는 기간에 맞춰 자동)
      if (campaign) {
        const moved = await setReviewCampaignStatus(campaign.id, "setting");
        if ("error" in moved) {
          setError(moved.error);
          return;
        }
      }
      onClose();
    });
  };

  return (
    <Modal
      title={campaign ? "셋팅 완료" : "리뷰 캠페인 등록"}
      description="진행 조건을 확정합니다. 저장하면 시작일에 맞춰 자동으로 진행중이 됩니다."
      onClose={onClose}
      width="max-w-[680px]"
      footer={<ModalFooter onClose={onClose} onSubmit={submit} pending={pending} />}
    >
      {!campaign && (
        <Field label="회원">
          <Select value={form.userId} onChange={(e) => set("userId", e.target.value)}>
            <option value="">회원을 선택하세요</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </Select>
        </Field>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="플랫폼">
          <Select value={form.platform} onChange={(e) => changePlatform(e.target.value)}>
            {platforms.map((p) => (
              <option key={p} value={p}>
                {reviewPlatformMeta[p]?.label ?? p}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="리뷰 유형">
          <Select value={form.reviewType} onChange={(e) => set("reviewType", e.target.value)}>
            {allowedTypes.map((t) => (
              <option key={t} value={t}>
                {reviewTypeLabel[t] ?? t}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="업체명 / 상품명">
          <Input value={form.storeName} onChange={(e) => set("storeName", e.target.value)} />
        </Field>
        <Field label="키워드">
          <Input value={form.keyword} onChange={(e) => set("keyword", e.target.value)} />
        </Field>
      </div>

      <Field label="대상 URL">
        <Input value={form.targetUrl} onChange={(e) => set("targetUrl", e.target.value)} placeholder="https://" />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="수량">
          <Input value={form.totalQty} onChange={(e) => set("totalQty", e.target.value)} inputMode="numeric" />
        </Field>
        <Field label="단가 (원)">
          <Input value={form.unitPrice} onChange={(e) => set("unitPrice", e.target.value)} inputMode="numeric" />
        </Field>
        <Field label="총 금액">
          <Input value={formatKRW(estimate)} readOnly disabled />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="시작일">
          <Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
        </Field>
        <Field label="종료일">
          <Input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
        </Field>
      </div>

      <Field label="리뷰 가이드">
        <Textarea value={form.guide} onChange={(e) => set("guide", e.target.value)} className="min-h-[80px]" />
      </Field>

      <Field label="미션 내용">
        <Textarea value={form.mission} onChange={(e) => set("mission", e.target.value)} className="min-h-[80px]" />
      </Field>

      <Field label="제공 내역" hint="제품 제공형일 경우 제공 품목/금액">
        <Input value={form.provideDetail} onChange={(e) => set("provideDetail", e.target.value)} />
      </Field>

      <Field label="고객 요청사항 / 수정사항">
        <Textarea value={form.requestNote} onChange={(e) => set("requestNote", e.target.value)} className="min-h-[70px]" />
      </Field>

      <Field label="관리 메모">
        <Textarea value={form.adminMemo} onChange={(e) => set("adminMemo", e.target.value)} className="min-h-[70px]" />
      </Field>

      {error && <Notice ok={false}>{error}</Notice>}
    </Modal>
  );
}

/** 기획서: 블로그 작성 및 영수증 진행현황 셋팅 페이지 */
function ProgressModal({
  campaign,
  tasks,
  onClose,
}: {
  campaign: ReviewCampaignRow;
  tasks: ReviewTaskRow[];
  onClose: () => void;
}) {
  const [editing, setEditing] = useState<ReviewTaskRow | "new" | null>(null);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  const remove = (task: ReviewTaskRow) => {
    startTransition(async () => {
      const res = await deleteReviewTask(task.id, campaign.id);
      if ("error" in res) setMsg({ id: task.id, text: res.error, ok: false });
    });
  };

  return (
    <Modal
      title="진행현황 관리"
      description={`${campaign.storeName} · 승인 ${campaign.completedQty}/${campaign.totalQty}건`}
      onClose={onClose}
      width="max-w-[860px]"
      footer={
        <Button variant="ghost" className="flex-1" onClick={onClose}>
          닫기
        </Button>
      }
    >
      <Card>
        <SectionHeader
          title="리뷰 진행 건"
          right={
            <Button size="sm" onClick={() => setEditing("new")}>
              건 추가
            </Button>
          }
        />
        {tasks.length ? (
          <TableShell
            head={
              <>
                <Th>리뷰어</Th>
                <Th>상태</Th>
                <Th>예정일</Th>
                <Th>제출 링크</Th>
                <Th className="text-right">관리</Th>
              </>
            }
          >
            {tasks.map((t) => {
              const meta = reviewTaskStatusMeta[t.status] ?? { label: t.status, tone: "gray" as const };
              return (
                <tr key={t.id} className="hover:bg-brand-light/50 transition-colors">
                  <Td>
                    <div className="font-semibold text-brand-dark">{t.reviewerName || "미배정"}</div>
                    {t.reviewerContact && <div className="text-[12px] text-brand-muted">{t.reviewerContact}</div>}
                    {msg?.id === t.id && <Notice ok={msg.ok}>{msg.text}</Notice>}
                  </Td>
                  <Td>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </Td>
                  <Td className="text-brand-sub whitespace-nowrap">{formatDate(t.scheduledDate)}</Td>
                  <Td className="text-[12.5px]">
                    {t.postUrl && (
                      <a href={t.postUrl} target="_blank" rel="noreferrer" className="text-brand-primary underline block truncate max-w-[200px]">
                        블로그 글
                      </a>
                    )}
                    {t.receiptUrl && (
                      <a href={t.receiptUrl} target="_blank" rel="noreferrer" className="text-brand-primary underline block truncate max-w-[200px]">
                        영수증
                      </a>
                    )}
                    {!t.postUrl && !t.receiptUrl && <span className="text-brand-muted">-</span>}
                  </Td>
                  <Td className="text-right">
                    <div className="flex gap-1.5 justify-end">
                      <Button size="sm" variant="secondary" onClick={() => setEditing(t)}>
                        수정
                      </Button>
                      <Button size="sm" variant="danger" disabled={pending} onClick={() => remove(t)}>
                        삭제
                      </Button>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </TableShell>
        ) : (
          <EmptyState message="등록된 진행 건이 없습니다." />
        )}
      </Card>

      {editing && (
        <TaskModal
          campaignId={campaign.id}
          task={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </Modal>
  );
}

function TaskModal({
  campaignId,
  task,
  onClose,
}: {
  campaignId: string;
  task: ReviewTaskRow | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ReviewTaskInput>({
    id: task?.id,
    reviewCampaignId: campaignId,
    reviewerName: task?.reviewerName ?? "",
    reviewerContact: task?.reviewerContact ?? "",
    status: task?.status ?? "waiting",
    postUrl: task?.postUrl ?? "",
    receiptUrl: task?.receiptUrl ?? "",
    scheduledDate: task?.scheduledDate ?? "",
    memo: task?.memo ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof ReviewTaskInput>(key: K, value: ReviewTaskInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await upsertReviewTask(form);
      if ("error" in res) setError(res.error);
      else onClose();
    });
  };

  return (
    <Modal
      title={task ? "진행 건 수정" : "진행 건 추가"}
      onClose={onClose}
      footer={<ModalFooter onClose={onClose} onSubmit={submit} pending={pending} />}
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="리뷰어명">
          <Input value={form.reviewerName} onChange={(e) => set("reviewerName", e.target.value)} />
        </Field>
        <Field label="연락처">
          <Input value={form.reviewerContact} onChange={(e) => set("reviewerContact", e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="진행 상태">
          <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
            {Object.entries(reviewTaskStatusMeta).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="예정일">
          <Input type="date" value={form.scheduledDate} onChange={(e) => set("scheduledDate", e.target.value)} />
        </Field>
      </div>

      <Field label="블로그 작성 URL">
        <Input value={form.postUrl} onChange={(e) => set("postUrl", e.target.value)} placeholder="https://blog.naver.com/..." />
      </Field>

      <Field label="영수증 이미지 URL">
        <Input value={form.receiptUrl} onChange={(e) => set("receiptUrl", e.target.value)} placeholder="https://" />
      </Field>

      <Field label="메모">
        <Textarea value={form.memo} onChange={(e) => set("memo", e.target.value)} className="min-h-[70px]" />
      </Field>

      {error && <Notice ok={false}>{error}</Notice>}
    </Modal>
  );
}
