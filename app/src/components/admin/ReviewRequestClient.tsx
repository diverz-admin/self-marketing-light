"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import {
  Card, TableShell, Th, Td, EmptyState, Badge, Tabs, SearchInput, InlineSelect, StatCard,
  Button, Modal, ModalFooter, Field, Input, Textarea, Notice,
} from "@/components/admin/ui";
import { ExtensionsPanel, type ExtensionRow } from "@/components/admin/ExtensionsPanel";
import { TargetLink } from "@/components/admin/RankTrend";
import { PeriodPicker } from "@/components/admin/PeriodPicker";
import type { PeriodParams } from "@/lib/period-filter";
import { exportToExcel } from "@/lib/excel-export";
import {
  formatKRW, formatDate, formatNumber, byStagePriority,
  reviewStageMeta, REVIEW_STAGES, reviewTypeLabel, reviewTaskStatusMeta, reviewPlatformMeta,
} from "@/lib/admin-format";
import { reviewRequestDetails, reviewScheduleText, reviewScheduleDetail } from "@/lib/review-request-setting";
import type { ReviewCampaignRow, ReviewTaskRow } from "@/components/admin/ReviewCampaignsClient";
import {
  setReviewCampaignStatus, upsertReviewCampaign, upsertReviewTask, deleteReviewTask,
  type ReviewCampaignInput,
} from "@/app/(platform)/admin/(console)/actions";

/**
 * 플레이스 리뷰 관리 — 고객 신청 화면(/marketing/review/place/*)과 짝을 이룬다.
 *
 * 플레이스 리뷰는 유형이 둘뿐이고 유형마다 고객이 채우는 항목이 다르다.
 *   · 블로그배포 : 포스팅 유형 · 해시태그 · 업체 정보 · 이미지 전달 방식
 *   · 영수증리뷰 : 영수증 첨부 여부 · 사업자번호 · 강조 내용
 * 그래서 목록은 유형으로 나누고, 신청 내용은 행을 펼쳐 유형에 맞게 보여준다.
 * 금액(건별 단가)은 "리뷰 상품등록"에서 정하므로 이 화면에서는 다루지 않는다.
 */
export type ReviewRequestConfig = {
  /** 화면 이름 — 빈 목록 문구·연장 탭 제목에 쓴다 */
  label: string;
  /** 엑셀 파일명 */
  fileName: string;
  /** 유형 칩 ("전체"는 자동으로 앞에 붙는다) */
  types: { key: string; label: string }[];
  /** 대상 링크 라벨 — "플레이스 링크" | "상품 링크" */
  linkLabel: string;
  /** 채널이 둘 이상인 화면(쇼핑)은 채널 열을 함께 보여준다 */
  showChannel?: boolean;
};

const STAGE_FILTERS = [{ key: "all", label: "전체" }, ...REVIEW_STAGES.map((s) => ({ key: s.key, label: s.label }))];

const TYPE_TONE: Record<string, "blue" | "green" | "purple" | "amber"> = {
  blog_distribute: "blue",
  receipt: "green",
  product_provided: "purple",
  product_not_provided: "amber",
};

/** 유형마다 URL 이 가리키는 대상이 다르다 */
const URL_LABEL: Record<string, string> = {
  blog_distribute: "블로그 작성 URL",
  receipt: "리뷰 URL",
  product_provided: "리뷰 URL",
  product_not_provided: "리뷰 URL",
};

/** 작성 URL 이 들어오면 승인으로 올려 완료 건수에 반영한다 */
const TASK_STATUSES = ["waiting", "assigned", "writing", "submitted", "approved", "rejected"];

/** 오늘 (YYYY-MM-DD) — 새 URL 줄의 작성일 기본값 */
function todayYMD() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function ReviewRequestClient({
  config,
  rows,
  tasks,
  extensions,
  years,
  period,
}: {
  /** 화면마다 다른 부분만 주입한다 (플레이스 / 쇼핑) */
  config: ReviewRequestConfig;
  rows: ReviewCampaignRow[];
  /** 캠페인별 개별 리뷰 건 — 실제 작성 URL 이 여기 쌓인다 */
  tasks: ReviewTaskRow[];
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

  const typeChips = useMemo(
    () => [{ key: "all", label: "전체" }, ...config.types],
    [config.types],
  );

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

  const tasksOf = (campaignId: string) => tasks.filter((t) => t.reviewCampaignId === campaignId);
  const urlCountOf = (campaignId: string) => tasksOf(campaignId).filter((t) => !!t.postUrl).length;

  /** 신청 내용까지 담아 내려받는다 — 셋팅 담당자가 이 파일만 보고 작업할 수 있게 */
  const exportRows = () => {
    exportToExcel({
      fileName: config.fileName,
      rows: filtered.map((r) => {
        const detail = reviewRequestDetails(r.reviewType, r.setting, r.requestNote);
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
          채널: reviewPlatformMeta[r.platform]?.label ?? r.platform,
          캠페인명: r.storeName,
          [config.linkLabel.replace(/ /g, "")]: r.targetUrl ?? "",
          메인키워드: r.keyword ?? "",
          스케줄: reviewScheduleDetail(r.setting) ?? "",
          총건수: r.totalQty,
          "등록URL": tasksOf(r.id).filter((t) => !!t.postUrl).length,
          포스팅유형: pick("포스팅 유형"),
          해시태그: pick("해시태그"),
          업체정보: pick("업체 정보"),
          이미지: pick("이미지"),
          이미지링크: pick("이미지 링크"),
          영수증첨부: pick("영수증 첨부"),
          사업자번호: pick("사업자번호"),
          강조내용: pick("강조 내용"),
          제목유형: pick("제목 유형"),
          포토리뷰: pick("포토리뷰"),
          작성가이드: pick("작성 가이드"),
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
        <ExtensionsPanel rows={extensions} title={`${config.label} 연장 신청`} />
      ) : (
        <>
          {/* 오늘 손이 필요한 양을 먼저 보여준다 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <StatCard label="전체 신청" value={formatNumber(rows.length)} sub={config.types.map((t) => t.label).join(" · ")} />
            <StatCard
              label="처리 필요"
              value={formatNumber(rows.filter((r) => r.stage === "submitted").length)}
              sub="셋팅을 기다리는 신청"
              tone="amber"
            />
            <StatCard
              label="진행중"
              value={formatNumber(rows.filter((r) => r.stage === "running").length)}
              sub="구동 중인 캠페인"
              tone="green"
            />
          </div>

          <Card className="overflow-hidden p-0">
            {/* 유형 → 단계 순서로 좁힌다 (플레이스 리뷰는 유형이 둘뿐이라 유형이 먼저다) */}
            <div className="flex items-center gap-2 px-5 pt-4 flex-wrap">
              <span className="w-9 shrink-0 text-[12px] font-bold text-brand-muted">유형</span>
              {typeChips.map((t) => (
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
              <span className="w-9 shrink-0 text-[12px] font-bold text-brand-muted">단계</span>
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
                    {config.showChannel && <Th>채널</Th>}
                    <Th>캠페인명</Th>
                    <Th>유형</Th>
                    <Th>메인 키워드</Th>
                    <Th className="min-w-[150px]">진행 (작성 URL)</Th>
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
                  return (
                    <Fragment key={r.id}>
                      {/* 셋팅을 기다리는 줄은 왼쪽 띠로 눈에 띄게 한다 */}
                      <tr
                        className={`transition-colors align-top ${
                          isOpen ? "bg-brand-light/60" : "hover:bg-brand-light/50"
                        }`}
                      >
                        <Td className="align-middle relative">
                          {r.stage === "submitted" && (
                            <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-amber-400" aria-hidden />
                          )}
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
                        {config.showChannel && (
                          <Td>
                            <Badge tone={reviewPlatformMeta[r.platform]?.tone ?? "gray"}>
                              {reviewPlatformMeta[r.platform]?.label ?? r.platform}
                            </Badge>
                          </Td>
                        )}
                        <Td>
                          <div className="text-brand-dark font-medium">{r.storeName}</div>
                          {r.targetUrl && <TargetLink url={r.targetUrl} label={config.linkLabel} />}
                        </Td>
                        <Td>
                          <Badge tone={TYPE_TONE[r.reviewType] ?? "gray"}>
                            {reviewTypeLabel[r.reviewType] ?? r.reviewType}
                          </Badge>
                        </Td>
                        <Td className="text-[13px] text-brand-text">{r.keyword || "-"}</Td>
                        {/* 작성 URL 이 얼마나 들어왔는지 — 목록에서 진행도를 바로 읽게 한다 */}
                        <Td className="whitespace-nowrap">
                          <ProgressCell
                            done={urlCountOf(r.id)}
                            total={r.totalQty}
                            schedule={reviewScheduleText(r.setting)}
                          />
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
                          <td
                            colSpan={config.showChannel ? 12 : 11}
                            className="p-0 bg-brand-light/40 border-t border-brand-border"
                          >
                            <RequestDetail row={r} tasks={tasksOf(r.id)} />
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
              <EmptyState message={`해당 조건의 ${config.label} 신청이 없습니다.`} />
            )}
          </Card>
        </>
      )}

      {settingTarget && (
        <ReviewSettingModal row={settingTarget} config={config} onClose={() => setSettingTarget(null)} />
      )}
    </div>
  );
}

/** 작성 URL 등록 진행도 — 숫자와 막대를 함께 둬 한눈에 읽히게 한다 */
function ProgressCell({ done, total, schedule }: { done: number; total: number; schedule: string | null }) {
  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
  const complete = total > 0 && done >= total;

  return (
    <div className="min-w-[130px]">
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-[13px] font-semibold text-brand-dark tabular-nums">
          {formatNumber(done)}
          <span className="text-[12px] font-medium text-brand-muted"> / {formatNumber(total)}건</span>
        </span>
        <span
          className={`text-[11.5px] font-bold tabular-nums ${
            complete ? "text-green-600" : done > 0 ? "text-brand-primary" : "text-brand-muted"
          }`}
        >
          {pct}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-brand-border overflow-hidden">
        <div
          className={`h-full rounded-full ${complete ? "bg-green-500" : "bg-brand-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-[11.5px] text-brand-muted tabular-nums">{schedule ?? "발행 스케줄 미입력"}</p>
    </div>
  );
}

/** 고객이 신청 폼에 채운 값 — 유형에 따라 항목이 달라진다 */
function RequestDetail({ row, tasks }: { row: ReviewCampaignRow; tasks: ReviewTaskRow[] }) {
  const fields = reviewRequestDetails(row.reviewType, row.setting, row.requestNote);
  const schedule = reviewScheduleDetail(row.setting);

  const missing = fields.filter((f) => f.empty).length;

  return (
    <div className="px-5 py-4 space-y-3">
      {/* 읽기 전용 — 고객이 채운 값이라 회색 머리말을 두고, 아래 작성 URL 카드와 무게를 다르게 한다 */}
      <section className="rounded-xl border border-brand-border overflow-hidden">
        <header className="flex items-center gap-2 px-4 py-2.5 bg-brand-light/60 border-b border-brand-border flex-wrap">
          <p className="text-[13px] font-bold text-brand-dark">신청 내용</p>
          <Badge tone={TYPE_TONE[row.reviewType] ?? "gray"}>
            {reviewTypeLabel[row.reviewType] ?? row.reviewType}
          </Badge>
          <span className="text-[12px] text-brand-muted">고객이 신청 화면에서 입력한 값</span>
          {missing > 0 && (
            <span className="ml-auto text-[12px] font-semibold text-amber-600">미입력 {missing}건</span>
          )}
        </header>

        <dl className="divide-y divide-brand-border bg-white">
          <SpecRow label="스케줄" empty={!schedule}>
            <span className="tabular-nums">{schedule ?? "미입력"}</span>
          </SpecRow>

          {fields.map((f) => (
            <SpecRow key={f.label} label={f.label} empty={f.empty}>
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
                  className="text-brand-primary hover:underline break-all"
                >
                  {f.value}
                </a>
              ) : f.kind === "long" ? (
                <p className="whitespace-pre-wrap leading-relaxed">{f.value}</p>
              ) : (
                f.value
              )}
            </SpecRow>
          ))}

          {row.adminMemo && (
            <SpecRow label="관리 메모">
              <p className="whitespace-pre-wrap leading-relaxed">{row.adminMemo}</p>
            </SpecRow>
          )}
        </dl>
      </section>

      <TaskUrlPanel row={row} tasks={tasks} />
    </div>
  );
}

/** 라벨과 값을 나란히 두는 스펙 표 한 줄 — 넓은 화면에서도 짝이 흩어지지 않는다 */
function SpecRow({
  label,
  empty = false,
  children,
}: {
  label: string;
  empty?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start">
      <dt className="w-[104px] shrink-0 self-stretch bg-brand-light/40 px-3 py-2.5 text-[12px] font-bold text-brand-sub">
        {label}
      </dt>
      <dd className={`min-w-0 flex-1 px-3.5 py-2.5 text-[13px] ${empty ? "text-brand-muted" : "text-brand-dark"}`}>
        {children}
      </dd>
    </div>
  );
}

/**
 * 실제 작성 URL 등록.
 * 리뷰 한 건이 review_tasks 한 줄이고, 여기 넣은 URL 이 고객의 리뷰 관리 화면에 그대로 보인다.
 *   · 블로그배포 : 블로그 작성 URL
 *   · 영수증리뷰 : 리뷰 URL + 영수증 이미지 URL
 * 승인으로 두면 캠페인 완료 건수에 반영된다.
 */
function TaskUrlPanel({ row, tasks }: { row: ReviewCampaignRow; tasks: ReviewTaskRow[] }) {
  // 영수증리뷰만 영수증 이미지 URL 을 따로 받는다
  const isReceipt = row.reviewType === "receipt";
  const urlLabel = URL_LABEL[row.reviewType] ?? "작성 URL";
  const [adding, setAdding] = useState(false);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");

  // 작성일이 있는 건에서 연/월 선택지를 뽑는다 (작성일이 없으면 "미입력"으로 따로 모은다)
  const years = useMemo(() => {
    const set = new Set<string>();
    for (const t of tasks) if (t.scheduledDate) set.add(t.scheduledDate.slice(0, 4));
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [tasks]);

  const months = useMemo(() => {
    const set = new Set<string>();
    for (const t of tasks) {
      if (!t.scheduledDate) continue;
      if (year && t.scheduledDate.slice(0, 4) !== year) continue;
      set.add(t.scheduledDate.slice(5, 7));
    }
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [tasks, year]);

  const visible = useMemo(
    () =>
      tasks.filter((t) => {
        if (!year && !month) return true;
        if (!t.scheduledDate) return false;
        if (year && t.scheduledDate.slice(0, 4) !== year) return false;
        if (month && t.scheduledDate.slice(5, 7) !== month) return false;
        return true;
      }),
    [tasks, year, month],
  );

  const registered = tasks.filter((t) => !!t.postUrl).length;
  const filtering = !!year || !!month;

  const pct = row.totalQty > 0 ? Math.min(100, Math.round((registered / row.totalQty) * 100)) : 0;

  return (
    <div className="rounded-xl border border-brand-primary/25 bg-white overflow-hidden">
      {/* 이 카드가 실제로 손을 대는 곳이라 액센트 머리말을 준다 */}
      <div className="h-[3px] bg-brand-primary/70" aria-hidden />
      <div className="p-4">
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[13px] font-bold text-brand-dark">작성 URL</p>
          <span className="text-[12px] text-brand-muted tabular-nums">
            등록 {formatNumber(registered)} / 총 {formatNumber(row.totalQty)}건
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-16 h-1.5 rounded-full bg-brand-border overflow-hidden">
              <span
                className={`block h-full rounded-full ${pct >= 100 ? "bg-green-500" : "bg-brand-primary"}`}
                style={{ width: `${pct}%` }}
              />
            </span>
            <span className="text-[11.5px] font-bold text-brand-sub tabular-nums">{pct}%</span>
          </span>

          {/* 완료 건은 계속 쌓이므로 연/월로 좁혀 본다 */}
          {years.length > 0 && (
            <div className="flex items-center gap-1.5 ml-1">
              <InlineSelect
                value={year}
                aria-label="작성 연도"
                onChange={(e) => {
                  setYear(e.target.value);
                  setMonth("");
                }}
              >
                <option value="">전체 연도</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}년
                  </option>
                ))}
              </InlineSelect>
              <InlineSelect value={month} aria-label="작성 월" onChange={(e) => setMonth(e.target.value)}>
                <option value="">전체 월</option>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {Number(m)}월
                  </option>
                ))}
              </InlineSelect>
              {filtering && (
                <span className="text-[12px] text-brand-sub tabular-nums">
                  {formatNumber(visible.length)}건
                </span>
              )}
            </div>
          )}
        </div>

        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)}>
            URL 추가
          </Button>
        )}
      </div>

      {visible.length === 0 && !adding ? (
        <div className="rounded-lg border border-dashed border-brand-border bg-brand-light/40 px-4 py-7 text-center">
          <svg
            className="mx-auto mb-2 h-6 w-6 text-brand-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          <p className="text-[13px] font-semibold text-brand-dark">
            {filtering ? "해당 기간에 등록된 작성 URL 이 없습니다." : "아직 등록된 작성 URL 이 없습니다."}
          </p>
          <p className="mt-1 text-[12px] text-brand-muted">
            {filtering
              ? "연도·월 조건을 바꿔 보세요."
              : "리뷰가 게시되면 URL 을 등록하세요. 고객의 리뷰 관리 화면에도 함께 보입니다."}
          </p>
          {!filtering && (
            <Button size="sm" className="mt-3" onClick={() => setAdding(true)}>
              첫 URL 등록하기
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((t, i) => (
            <TaskUrlRow
              key={t.id}
              index={i + 1}
              campaignId={row.id}
              task={t}
              isReceipt={isReceipt}
              urlLabel={urlLabel}
            />
          ))}
        </div>
      )}

      {adding && (
        <div className="mt-2">
          <TaskUrlRow
            index={visible.length + 1}
            campaignId={row.id}
            task={null}
            isReceipt={isReceipt}
            urlLabel={urlLabel}
            onDone={() => setAdding(false)}
          />
        </div>
      )}
      </div>
    </div>
  );
}

function TaskUrlRow({
  index,
  campaignId,
  task,
  isReceipt,
  urlLabel,
  onDone,
}: {
  index: number;
  campaignId: string;
  /** null 이면 새로 추가하는 줄 */
  task: ReviewTaskRow | null;
  isReceipt: boolean;
  /** 유형에 맞는 URL 이름 (블로그 작성 URL / 리뷰 URL …) */
  urlLabel: string;
  onDone?: () => void;
}) {
  const [postUrl, setPostUrl] = useState(task?.postUrl ?? "");
  const [receiptUrl, setReceiptUrl] = useState(task?.receiptUrl ?? "");
  // 새 줄은 URL 을 넣는 순간 완료로 보는 게 자연스럽다
  const [status, setStatus] = useState(task?.status ?? "approved");
  const [reviewerName, setReviewerName] = useState(task?.reviewerName ?? "");
  // 작성일이 연/월 조회의 기준이라 새 줄은 오늘로 채워 둔다
  const [writtenDate, setWrittenDate] = useState(task?.scheduledDate ?? (task ? "" : todayYMD()));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty =
    postUrl !== (task?.postUrl ?? "") ||
    receiptUrl !== (task?.receiptUrl ?? "") ||
    status !== (task?.status ?? "approved") ||
    reviewerName !== (task?.reviewerName ?? "") ||
    writtenDate !== (task?.scheduledDate ?? "");

  const save = () => {
    setError(null);
    if (!postUrl.trim() && !receiptUrl.trim()) {
      setError("URL 을 입력하세요.");
      return;
    }
    startTransition(async () => {
      const res = await upsertReviewTask({
        id: task?.id,
        reviewCampaignId: campaignId,
        reviewerName,
        status,
        postUrl,
        receiptUrl,
        scheduledDate: writtenDate,
      });
      if ("error" in res) {
        setError(res.error);
        return;
      }
      onDone?.();
    });
  };

  const remove = () => {
    setError(null);
    startTransition(async () => {
      const res = await deleteReviewTask(task!.id, campaignId);
      if ("error" in res) setError(res.error);
    });
  };

  return (
    <div className="rounded-lg border border-brand-border bg-brand-light/40 p-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-6 shrink-0 text-center text-[12px] font-bold text-brand-muted tabular-nums">{index}</span>

        <input
          value={postUrl}
          onChange={(e) => setPostUrl(e.target.value)}
          placeholder={`${urlLabel} (https://)`}
          aria-label={urlLabel}
          className="min-w-0 flex-1 rounded-lg border border-brand-border bg-white px-2.5 py-1.5 text-[13px] text-brand-dark focus:outline-none focus:border-brand-primary"
        />

        {isReceipt && (
          <input
            value={receiptUrl}
            onChange={(e) => setReceiptUrl(e.target.value)}
            placeholder="영수증 이미지 URL"
            aria-label="영수증 이미지 URL"
            className="min-w-0 flex-1 rounded-lg border border-brand-border bg-white px-2.5 py-1.5 text-[13px] text-brand-dark focus:outline-none focus:border-brand-primary"
          />
        )}

        <input
          type="date"
          value={writtenDate}
          onChange={(e) => setWrittenDate(e.target.value)}
          aria-label="작성일"
          className="w-[132px] shrink-0 rounded-lg border border-brand-border bg-white px-2 py-1.5 text-[13px] text-brand-dark focus:outline-none focus:border-brand-primary"
        />

        <input
          value={reviewerName}
          onChange={(e) => setReviewerName(e.target.value)}
          placeholder="작성자"
          aria-label="작성자"
          className="w-24 shrink-0 rounded-lg border border-brand-border bg-white px-2.5 py-1.5 text-[13px] text-brand-dark focus:outline-none focus:border-brand-primary"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="진행 상태"
          className="w-[86px] shrink-0 rounded-lg border border-brand-border bg-white px-2 py-1.5 text-[13px] text-brand-dark focus:outline-none focus:border-brand-primary"
        >
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {reviewTaskStatusMeta[s]?.label ?? s}
            </option>
          ))}
        </select>

        <Button size="sm" variant={dirty ? "primary" : "secondary"} disabled={pending} onClick={save}>
          {pending ? "저장 중..." : "저장"}
        </Button>

        {task ? (
          <Button size="sm" variant="danger" disabled={pending} onClick={remove}>
            삭제
          </Button>
        ) : (
          <Button size="sm" variant="ghost" disabled={pending} onClick={onDone}>
            취소
          </Button>
        )}
      </div>

      {/* 저장된 URL 은 바로 열어볼 수 있게 링크로도 남긴다 */}
      {task?.postUrl && (
        <a
          href={task.postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 ml-8 inline-block text-[12px] text-brand-primary hover:underline break-all"
        >
          {task.postUrl}
        </a>
      )}

      {error && <p className="mt-1.5 ml-8 text-[12px] font-semibold text-red-500">{error}</p>}
    </div>
  );
}

/**
 * 셋팅 — 고객 신청 내용은 그대로 두고, 관리자가 정하는 값만 고친다.
 * 저장하면 시작일에 맞춰 자동으로 진행중이 된다.
 */
function ReviewSettingModal({
  row,
  config,
  onClose,
}: {
  row: ReviewCampaignRow;
  config: ReviewRequestConfig;
  onClose: () => void;
}) {
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
      title={`${config.label} 셋팅`}
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

      <Field label={config.linkLabel}>
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
  const schedule = reviewScheduleText(row.setting);
  const fields = reviewRequestDetails(row.reviewType, row.setting, row.requestNote);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-[13px]">
        <Badge tone={TYPE_TONE[row.reviewType] ?? "gray"}>
          {reviewTypeLabel[row.reviewType] ?? row.reviewType}
        </Badge>
        <span className="text-brand-text tabular-nums">{schedule ?? "스케줄 미입력"}</span>
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
