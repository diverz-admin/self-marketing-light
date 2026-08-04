"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import {
  Card, TableShell, Th, Td, EmptyState, Badge, Tabs, SearchInput,
  Button, Modal, ModalFooter, Field, Input, Textarea, Notice,
} from "@/components/admin/ui";
import { ExtensionsPanel, type ExtensionRow } from "@/components/admin/ExtensionsPanel";
import { TargetLink } from "@/components/admin/RankTrend";
import { PeriodPicker } from "@/components/admin/PeriodPicker";
import type { PeriodParams } from "@/lib/period-filter";
import { exportToExcel } from "@/lib/excel-export";
import {
  formatKRW, formatDate, formatNumber, byStagePriority,
  reviewStageMeta, REVIEW_STAGES, reviewTypeLabel,
} from "@/lib/admin-format";
import { placeReviewDetails, placeReviewSchedule } from "@/lib/place-review-setting";
import type { ReviewCampaignRow } from "@/components/admin/ReviewCampaignsClient";
import { setReviewCampaignStatus, upsertReviewCampaign, type ReviewCampaignInput } from "../../actions";

/**
 * 플레이스 리뷰 관리 — 고객 신청 화면(/marketing/review/place/*)과 짝을 이룬다.
 *
 * 플레이스 리뷰는 유형이 둘뿐이고 유형마다 고객이 채우는 항목이 다르다.
 *   · 블로그배포 : 포스팅 유형 · 해시태그 · 업체 정보 · 이미지 전달 방식
 *   · 영수증리뷰 : 영수증 첨부 여부 · 사업자번호 · 강조 내용
 * 그래서 목록은 유형으로 나누고, 신청 내용은 행을 펼쳐 유형에 맞게 보여준다.
 * 금액(건별 단가)은 "리뷰 상품등록"에서 정하므로 이 화면에서는 다루지 않는다.
 */
const PLACE_TYPES = [
  { key: "all", label: "전체" },
  { key: "blog_distribute", label: "블로그배포" },
  { key: "receipt", label: "영수증리뷰" },
];

const STAGE_FILTERS = [{ key: "all", label: "전체" }, ...REVIEW_STAGES.map((s) => ({ key: s.key, label: s.label }))];

const TYPE_TONE: Record<string, "blue" | "green"> = {
  blog_distribute: "blue",
  receipt: "green",
};

export function PlaceReviewClient({
  rows,
  extensions,
  years,
  period,
}: {
  rows: ReviewCampaignRow[];
  extensions: ExtensionRow[];
  /** 완료 데이터가 있는 연도 (서버 집계) */
  years: number[];
  /** URL 로 전달된 연/월/일 조회 조건 */
  period: PeriodParams;
}) {
  const [view, setView] = useState("campaigns");
  // 화면을 열면 처리해야 할 신청접수부터 보이게 한다
  const [stage, setStage] = useState("submitted");
  const [type, setType] = useState("all");
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [settingTarget, setSettingTarget] = useState<ReviewCampaignRow | null>(null);

  const byType = useMemo(() => (type === "all" ? rows : rows.filter((r) => r.reviewType === type)), [rows, type]);

  const stageCount = (key: string) => (key === "all" ? byType.length : byType.filter((r) => r.stage === key).length);
  const typeCount = (key: string) => (key === "all" ? rows.length : rows.filter((r) => r.reviewType === key).length);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return byType
      .filter((r) => {
        if (stage !== "all" && r.stage !== stage) return false;
        if (!q) return true;
        return (
          r.advertiser.toLowerCase().includes(q) ||
          r.userName.toLowerCase().includes(q) ||
          r.storeName.toLowerCase().includes(q) ||
          (r.keyword ?? "").toLowerCase().includes(q)
        );
      })
      // 손이 필요한 신청접수 건이 항상 목록 맨 위로 온다
      .sort(byStagePriority);
  }, [byType, stage, query]);

  const pendingExtensions = extensions.filter((e) => e.status === "requested").length;

  /** 신청 내용까지 담아 내려받는다 — 셋팅 담당자가 이 파일만 보고 작업할 수 있게 */
  const exportRows = () => {
    exportToExcel({
      fileName: "플레이스리뷰_신청내역",
      rows: filtered.map((r) => {
        const s = placeReviewSchedule(r.setting);
        const detail = placeReviewDetails(r.reviewType, r.setting);
        const pick = (label: string) => {
          const f = detail.find((d) => d.label === label);
          if (!f) return "";
          return f.kind === "tags" ? (f.tags ?? []).join(" ") : f.value;
        };
        return {
          신청일: formatDate(r.createdAt),
          광고주: r.advertiser,
          담당자: r.assignedAdminName || "미지정",
          유형: reviewTypeLabel[r.reviewType] ?? r.reviewType,
          캠페인명: r.storeName,
          플레이스링크: r.targetUrl ?? "",
          메인키워드: r.keyword ?? "",
          발행일수: s.issueDays || "",
          일발행량: s.dailyVolume || "",
          총건수: r.totalQty,
          포스팅유형: pick("포스팅 유형"),
          해시태그: pick("해시태그"),
          업체정보: pick("업체 정보"),
          이미지: pick("이미지"),
          이미지링크: pick("이미지 링크"),
          영수증첨부: pick("영수증 첨부"),
          사업자번호: pick("사업자번호"),
          강조내용: pick("강조 내용"),
          시작일: r.startDate ?? "",
          종료일: r.endDate ?? "",
          금액: r.totalAmount,
          단계: reviewStageMeta[r.stage]?.label ?? r.status,
        };
      }),
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <Tabs
          tabs={[
            { key: "campaigns", label: "신청·관리", count: rows.length },
            { key: "extensions", label: "연장 신청", count: pendingExtensions },
          ]}
          value={view}
          onChange={setView}
        />
        {view === "campaigns" && (
          <div className="md:ml-auto flex gap-2">
            {filtered.length > 0 && (
              <Button variant="secondary" onClick={exportRows}>
                엑셀 내보내기
              </Button>
            )}
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="광고주 · 캠페인명 · 키워드 검색"
              className="md:w-64"
            />
          </div>
        )}
      </div>

      {view === "extensions" ? (
        <ExtensionsPanel rows={extensions} title="플레이스 리뷰 연장 신청" />
      ) : (
        <Card className="overflow-hidden p-0">
          {/* 유형 → 단계 순서로 좁힌다 (플레이스 리뷰는 유형이 둘뿐이라 유형이 먼저다) */}
          <div className="flex items-center gap-2 px-5 pt-4 flex-wrap">
            {PLACE_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => setType(t.key)}
                className={`px-3 py-1.5 rounded-xl text-[13px] font-bold transition-all ${
                  type === t.key ? "bg-brand-dark text-white" : "bg-brand-light text-brand-sub hover:bg-brand-border"
                }`}
              >
                {t.label}
                <span className="ml-1.5 tabular-nums opacity-70">{typeCount(t.key)}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 px-5 py-4 border-b border-brand-border flex-wrap">
            {STAGE_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setStage(f.key)}
                className={`px-3 py-1.5 rounded-xl text-[13px] font-bold transition-all ${
                  stage === f.key
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
                    <Th>캠페인명</Th>
                    <Th>유형</Th>
                    <Th>메인 키워드</Th>
                    <Th className="text-center">발행 / 건수</Th>
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
                  const isOpen = expandedId === r.id;
                  const s = placeReviewSchedule(r.setting);
                  return (
                    <Fragment key={r.id}>
                      <tr className="hover:bg-brand-light/50 transition-colors align-top">
                        <Td className="align-middle">
                          <button
                            aria-label={isOpen ? "접기" : "신청 내용 보기"}
                            onClick={() => setExpandedId(isOpen ? null : r.id)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-brand-muted hover:bg-brand-light transition-colors"
                          >
                            <svg
                              className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-90" : ""}`}
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
                          <div className="text-[12px] text-brand-muted">{formatDate(r.createdAt)} 신청</div>
                        </Td>
                        <Td>
                          <div className="text-brand-dark font-medium">{r.storeName}</div>
                          {r.targetUrl && <TargetLink url={r.targetUrl} label="플레이스 링크" />}
                        </Td>
                        <Td>
                          <Badge tone={TYPE_TONE[r.reviewType] ?? "gray"}>
                            {reviewTypeLabel[r.reviewType] ?? r.reviewType}
                          </Badge>
                        </Td>
                        <Td className="text-[13px] text-brand-text">{r.keyword || "-"}</Td>
                        <Td className="text-center whitespace-nowrap">
                          <div className="text-[13px] text-brand-dark tabular-nums">
                            {s.issueDays > 0 ? `${s.issueDays}일 × ${formatNumber(s.dailyVolume)}건` : "-"}
                          </div>
                          <div className="text-[12px] text-brand-muted tabular-nums">
                            총 {formatNumber(r.totalQty)}건
                          </div>
                        </Td>
                        <Td className="text-[12.5px] whitespace-nowrap">
                          <div className={r.periodProvisional ? "text-brand-muted" : "text-brand-sub"}>
                            {r.startDate ? formatDate(r.startDate) : "-"}
                            <br />~ {r.endDate ? formatDate(r.endDate) : "-"}
                          </div>
                          {r.periodProvisional && <span className="text-[11px] text-brand-muted">임시</span>}
                        </Td>
                        <Td className="text-right tabular-nums font-semibold text-brand-dark">
                          {formatKRW(r.totalAmount)}
                        </Td>
                        <Td>
                          <Badge tone={meta.tone}>{meta.label}</Badge>
                        </Td>
                        {/* 셋팅은 관리자 몫이라 단계와 상관없이 언제든 열 수 있다 */}
                        <Td className="text-center">
                          <Button
                            size="sm"
                            variant={r.stage === "submitted" ? "primary" : "secondary"}
                            onClick={() => setSettingTarget(r)}
                          >
                            {r.stage === "submitted" ? "셋팅하기" : "셋팅 수정"}
                          </Button>
                        </Td>
                        <Td className="text-[13px]">
                          {r.assignedAdminName ? (
                            <span className="text-brand-text">{r.assignedAdminName}</span>
                          ) : (
                            <span className="text-brand-muted">미지정</span>
                          )}
                        </Td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <td colSpan={11} className="p-0 bg-brand-light/40 border-t border-brand-border">
                            <RequestDetail row={r} />
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
            <EmptyState message="해당 조건의 플레이스 리뷰 신청이 없습니다." />
          )}
        </Card>
      )}

      {settingTarget && (
        <PlaceReviewSettingModal row={settingTarget} onClose={() => setSettingTarget(null)} />
      )}
    </div>
  );
}

/** 고객이 신청 폼에 채운 값 — 유형에 따라 항목이 달라진다 */
function RequestDetail({ row }: { row: ReviewCampaignRow }) {
  const fields = placeReviewDetails(row.reviewType, row.setting);
  const schedule = placeReviewSchedule(row.setting);

  return (
    <div className="px-5 py-4 space-y-3">
      <div className="flex items-center gap-2">
        <p className="text-[13px] font-bold text-brand-dark">신청 내용</p>
        <Badge tone={TYPE_TONE[row.reviewType] ?? "gray"}>
          {reviewTypeLabel[row.reviewType] ?? row.reviewType}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        <DetailItem label="발행 스케줄">
          <span className="text-[13px] text-brand-dark tabular-nums">
            {schedule.issueDays > 0
              ? `${schedule.issueDays}일 × ${formatNumber(schedule.dailyVolume)}건 = 총 ${formatNumber(schedule.total)}건`
              : "미입력"}
          </span>
        </DetailItem>

        {fields.map((f) => (
          <DetailItem key={f.label} label={f.label} wide={f.kind === "long"}>
            {f.kind === "tags" ? (
              <div className="flex flex-wrap gap-1.5">
                {(f.tags ?? []).map((t, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full bg-brand-primary-50 text-brand-primary text-[12px] font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : f.kind === "link" ? (
              <a
                href={f.value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-brand-primary hover:underline break-all"
              >
                {f.value}
              </a>
            ) : f.kind === "long" ? (
              <p className="text-[13px] text-brand-text whitespace-pre-wrap leading-relaxed">{f.value}</p>
            ) : (
              <span className="text-[13px] text-brand-dark">{f.value}</span>
            )}
          </DetailItem>
        ))}

        {row.adminMemo && (
          <DetailItem label="관리 메모" wide>
            <p className="text-[13px] text-brand-text whitespace-pre-wrap leading-relaxed">{row.adminMemo}</p>
          </DetailItem>
        )}
      </div>
    </div>
  );
}

function DetailItem({
  label,
  wide = false,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={wide ? "md:col-span-2" : undefined}>
      <p className="text-[12px] font-bold text-brand-muted mb-1">{label}</p>
      {children}
    </div>
  );
}

/**
 * 셋팅 — 고객 신청 내용은 그대로 두고, 관리자가 정하는 값만 고친다.
 * 저장하면 시작일에 맞춰 자동으로 진행중이 된다.
 */
function PlaceReviewSettingModal({ row, onClose }: { row: ReviewCampaignRow; onClose: () => void }) {
  const [form, setForm] = useState<ReviewCampaignInput>({
    id: row.id,
    userId: row.userId,
    platform: row.platform,
    reviewType: row.reviewType,
    storeName: row.storeName,
    targetUrl: row.targetUrl ?? "",
    keyword: row.keyword ?? "",
    totalQty: String(row.totalQty),
    unitPrice: String(row.unitPrice),
    startDate: row.startDate ?? "",
    endDate: row.endDate ?? "",
    requestNote: row.requestNote ?? "",
    adminMemo: row.adminMemo ?? "",
    guide: row.guide,
    mission: row.mission,
    provideDetail: row.provideDetail,
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof ReviewCampaignInput>(key: K, value: ReviewCampaignInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const estimate = Number(form.unitPrice || 0) * Number(form.totalQty || 0);

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await upsertReviewCampaign(form);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      // 셋팅을 확정하면 셋팅완료로 넘어간다 (이후 진행중·리뷰완료는 기간에 맞춰 자동)
      const moved = await setReviewCampaignStatus(row.id, "setting");
      if ("error" in moved) {
        setError(moved.error);
        return;
      }
      onClose();
    });
  };

  return (
    <Modal
      title="플레이스 리뷰 셋팅"
      description={`${row.advertiser} · ${row.storeName} — 저장하면 시작일에 맞춰 자동으로 진행됩니다`}
      onClose={onClose}
      width="max-w-[680px]"
      footer={<ModalFooter onClose={onClose} onSubmit={submit} pending={pending} />}
    >
      {/* 고객이 채운 값은 여기서 고치지 않는다 — 확인용으로만 붙여 둔다 */}
      <div className="rounded-xl border border-brand-border bg-brand-light/60 p-4">
        <p className="text-[12px] font-bold text-brand-muted mb-2">신청 내용 (고객 입력)</p>
        <RequestSummary row={row} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="캠페인명">
          <Input value={form.storeName} onChange={(e) => set("storeName", e.target.value)} />
        </Field>
        <Field label="메인 키워드">
          <Input value={form.keyword} onChange={(e) => set("keyword", e.target.value)} />
        </Field>
      </div>

      <Field label="플레이스 링크">
        <Input value={form.targetUrl} onChange={(e) => set("targetUrl", e.target.value)} placeholder="https://" />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="총 건수">
          <Input value={form.totalQty} onChange={(e) => set("totalQty", e.target.value)} inputMode="numeric" />
        </Field>
        <Field label="건당 단가 (원)" hint="리뷰 상품등록의 가격이 기본값">
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

      <Field label="관리 메모">
        <Textarea value={form.adminMemo} onChange={(e) => set("adminMemo", e.target.value)} className="min-h-[80px]" />
      </Field>

      {error && <Notice ok={false}>{error}</Notice>}
    </Modal>
  );
}

/** 모달 안에서 한 줄로 훑는 신청 내용 */
function RequestSummary({ row }: { row: ReviewCampaignRow }) {
  const schedule = placeReviewSchedule(row.setting);
  const fields = placeReviewDetails(row.reviewType, row.setting);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-[13px]">
        <Badge tone={TYPE_TONE[row.reviewType] ?? "gray"}>
          {reviewTypeLabel[row.reviewType] ?? row.reviewType}
        </Badge>
        <span className="text-brand-text tabular-nums">
          {schedule.issueDays > 0
            ? `${schedule.issueDays}일 × ${formatNumber(schedule.dailyVolume)}건`
            : "스케줄 미입력"}
        </span>
      </div>
      {fields.map((f) => (
        <div key={f.label} className="flex gap-2 text-[13px]">
          <span className="shrink-0 w-[76px] text-brand-muted">{f.label}</span>
          <span className="min-w-0 text-brand-text whitespace-pre-wrap break-words">
            {f.kind === "tags" ? (f.tags ?? []).join(" ") : f.value}
          </span>
        </div>
      ))}
    </div>
  );
}
