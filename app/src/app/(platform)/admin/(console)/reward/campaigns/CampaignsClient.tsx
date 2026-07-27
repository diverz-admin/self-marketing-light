"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import {
  Card, Badge, TableShell, Th, Td, EmptyState, Tabs, SearchInput,
  Button, Modal, ModalFooter, Field, Input, Notice,
} from "@/components/admin/ui";
import { ExtensionsPanel, type ExtensionRow } from "@/components/admin/ExtensionsPanel";
import { RankTrendPanel } from "@/components/admin/RankTrend";
import { PeriodPicker } from "@/components/admin/PeriodPicker";
import type { PeriodParams } from "@/lib/period-filter";
import { exportToExcel } from "@/lib/excel-export";
import {
  formatKRW, formatNumber, formatDate, byStagePriority, campaignStatusMeta, campaignStageMeta,
  CAMPAIGN_STAGES, rankDelta, type BadgeTone,
} from "@/lib/admin-format";
import { setCampaignStatus, updateCampaignSetting } from "../../actions";

/**
 * 고객 화면(/marketing/reward/place/manage, /marketing/reward/shopping/manage)과
 * 같은 구성으로 맞춘 관리 화면이다.
 *   요약 배너 → 플랫폼/상태 필터(+완료 연·월 조회) → 대상·키워드·순위·기간·금액 테이블
 * 여기에 어드민에만 필요한 광고주·승인/셋팅 처리를 더했다.
 */
export type AdminCampaignRow = {
  id: string;
  status: string;
  /** submitted | setting_done | running | completed — 서버가 오늘 날짜 기준으로 계산해 넘긴다 */
  stage: string;
  /** place | shopping — 상품 카테고리·채널·유형에서 서버가 계산해 넘긴다 */
  platform: string;
  targetName: string;
  targetUrl: string | null;
  keyword: string;
  region: string;
  totalQty: number;
  dailyQty: number | null;
  delivered: number;
  currentRank: number | null;
  previousRank: number | null;
  startDate: string;
  endDate: string;
  /** 셋팅 전이라 신청일·수량으로 만든 임시 기간인지 */
  periodProvisional: boolean;
  quotedAmount: number;
  paidAmount: number;
  createdAt: string;
  /** 가입 시 등록한 회사명 (없으면 사업장명·가입자명) */
  advertiser: string;
  userName: string;
  userEmail: string;
  /** 담당 관리자 */
  assignedAdminId: string | null;
  assignedAdminName: string;
  /** 키워드 순위 이력 (오래된 순) */
  rankHistory: { date: string; rank: number }[];
  /** 신청 화면에서 고른 상품 */
  productTitle: string;
};

// 신청접수 → 셋팅완료 → 구동중 → 완료 프로세스를 그대로 필터로 쓴다
const STAGE_FILTERS = [{ key: "all", label: "전체" }, ...CAMPAIGN_STAGES.map((s) => ({ key: s.key, label: s.label }))];

/**
 * 관리자가 누르는 동작은 "셋팅 완료" 하나뿐이다.
 * 이 버튼으로 일 작업량·기간을 확정하면, 이후 구동중·완료는 기간에 맞춰 자동으로 넘어간다.
 */
const SETTING_STAGES = ["submitted", "setting_done"];

/**
 * 플랫폼별로 고객 화면이 쓰는 컬럼 이름이 다르다.
 *  플레이스: 플레이스명 / 플레이스 링크 / 일 작업량 / 주문금액
 *  쇼핑    : 상품명   / 상품 링크     / 일 유입량 / 총 비용
 */
const PLATFORM_LABEL: Record<string, string> = { place: "플레이스", shopping: "쇼핑", coupang: "쿠팡" };

const COLUMN_LABEL: Record<string, { target: string; link: string; qty: string; amount: string }> = {
  place: { target: "플레이스명", link: "플레이스 링크", qty: "일 작업량", amount: "주문금액" },
  shopping: { target: "상품명", link: "상품 링크", qty: "일 유입량", amount: "총 비용" },
  coupang: { target: "상품명", link: "상품 링크", qty: "일 유입량", amount: "총 비용" },
};

export function CampaignsClient({
  platform,
  rows,
  extensions,
  years,
  period,
}: {
  /** 화면이 고정으로 다루는 플랫폼 — 컬럼 이름이 여기에 맞춰 바뀐다 */
  platform: "place" | "shopping" | "coupang";
  rows: AdminCampaignRow[];
  extensions: ExtensionRow[];
  /** 완료 데이터가 있는 연도 (서버 집계) */
  years: number[];
  /** URL 로 전달된 연/월/일 조회 조건 */
  period: PeriodParams;
}) {
  const [view, setView] = useState("campaigns");
  // 화면을 열면 처리해야 할 신청접수부터 보이게 한다
  const [filter, setFilter] = useState("submitted");
  const [query, setQuery] = useState("");
  const [settingTarget, setSettingTarget] = useState<AdminCampaignRow | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 서버에서 이미 플랫폼별로 걸러 넘겨준다
  const platformRows = rows;

  const stageCount = (key: string) =>
    key === "all" ? platformRows.length : platformRows.filter((r) => r.stage === key).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return platformRows.filter((r) => {
      if (filter !== "all" && r.stage !== filter) return false;
      if (!q) return true;
      return (
        r.advertiser.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        r.targetName.toLowerCase().includes(q) ||
        r.productTitle.toLowerCase().includes(q) ||
        r.keyword.toLowerCase().includes(q)
      );
    })
      // 손이 필요한 신청접수 건이 항상 목록 맨 위로 온다
      .sort(byStagePriority);
  }, [platformRows, filter, query]);

  const col = COLUMN_LABEL[platform];

  /** 신청접수 건을 엑셀로 — 화면에 보이는 컬럼 그대로 떨어뜨린다 */
  const exportSubmitted = () => {
    exportToExcel({
      fileName: `${platform === "place" ? "플레이스" : platform === "shopping" ? "쇼핑" : "쿠팡"}상위노출_신청접수`,
      rows: filtered.map((c) => ({
        신청일: formatDate(c.createdAt),
        광고주: c.advertiser,
        담당자: c.assignedAdminName || "미지정",
        [col.target]: c.targetName,
        [col.link]: c.targetUrl ?? "",
        키워드: c.keyword,
        상품: c.productTitle,
        [col.qty]: c.dailyQty ?? 0,
        시작일: c.startDate,
        종료일: c.endDate,
        [col.amount]: c.quotedAmount,
        단계: campaignStageMeta[c.stage]?.label ?? c.status,
      })),
    });
  };
  const pendingExtensions = extensions.filter((e) => e.status === "requested").length;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <Tabs
          tabs={[
            { key: "campaigns", label: "캠페인", count: rows.length },
            { key: "extensions", label: "연장 신청", count: pendingExtensions },
          ]}
          value={view}
          onChange={setView}
        />
      </div>

      {view === "extensions" ? (
        <ExtensionsPanel
          rows={extensions}
          title={`${PLATFORM_LABEL[platform]} 상위노출 연장 신청`}
          variant="reward"
        />
      ) : (
        <>
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
                  placeholder="광고주 · 대상 · 키워드 검색"
                  className="w-full sm:w-64"
                />
              </div>
            </div>

            {/* 완료 캠페인 연/월/일 조회 — 서버에서 종료일 기준으로 걸러 온다 */}
            <PeriodPicker years={years} value={period} count={filtered.length} label="완료 조회" />

            {filtered.length ? (
              <>
                <TableShell
                  head={
                    <>
                      <Th className="w-8" />
                      <Th>광고주</Th>
                      <Th>{col.target}</Th>
                      <Th>키워드</Th>
                      <Th className="text-center">현재 순위</Th>
                      <Th>상품</Th>
                      <Th className="text-center">{col.qty}</Th>
                      <Th>기간</Th>
                      <Th className="text-right">{col.amount}</Th>
                      <Th>단계</Th>
                      <Th className="text-center">처리</Th>
                      <Th>담당자</Th>
                    </>
                  }
                >
                  {filtered.map((c) => {
                    const stage = c.stage;
                    const meta =
                      campaignStageMeta[stage] ??
                      campaignStatusMeta[c.status] ?? { label: c.status, tone: "gray" as BadgeTone };
                    const pct = c.totalQty > 0 ? Math.min(100, Math.round((c.delivered / c.totalQty) * 100)) : 0;
                    const delta = rankDelta(c.currentRank, c.previousRank);
                    return (
                      <Fragment key={c.id}>
                      <tr className="hover:bg-brand-light/50 transition-colors align-top">
                        <Td className="align-middle">
                          <button
                            aria-label={expandedId === c.id ? "접기" : "순위 추이 보기"}
                            onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-brand-muted hover:bg-brand-light transition-colors"
                          >
                            <svg
                              className={`w-3.5 h-3.5 transition-transform ${expandedId === c.id ? "rotate-90" : ""}`}
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
                          <div className="font-semibold text-brand-dark">{c.advertiser}</div>
                        </Td>
                        <Td>
                          <div className="text-brand-dark font-medium">{c.targetName}</div>
                          {c.region && <div className="text-[12px] text-brand-muted">{c.region}</div>}
                        </Td>
                        <Td className="text-[13px] text-brand-text">{c.keyword || "-"}</Td>
                        <Td className="text-center">
                          {c.currentRank != null ? (
                            <>
                              <div className="tabular-nums font-semibold text-brand-dark">{c.currentRank}위</div>
                              {delta && <Badge tone={delta.tone}>{delta.label}</Badge>}
                            </>
                          ) : (
                            <span className="text-brand-muted">-</span>
                          )}
                        </Td>
                        <Td className="text-[12.5px] text-brand-text max-w-[130px]">{c.productTitle}</Td>
                        <Td className="text-center text-[12.5px] tabular-nums">
                          <div className="text-brand-dark font-semibold">
                            {c.dailyQty != null ? `${formatNumber(c.dailyQty)}건` : "-"}
                          </div>
                          <div className="text-brand-muted">
                            {formatNumber(c.delivered)} / {formatNumber(c.totalQty)} ({pct}%)
                          </div>
                        </Td>
                        <Td className="text-[12.5px] whitespace-nowrap">
                          <div className={c.periodProvisional ? "text-brand-muted" : "text-brand-sub"}>
                            {formatDate(c.startDate)}
                            <br />~ {formatDate(c.endDate)}
                          </div>
                          {c.periodProvisional && <span className="text-[11px] text-brand-muted">임시</span>}
                        </Td>
                        <Td className="text-right">
                          <div className="tabular-nums font-semibold text-brand-dark">{formatKRW(c.quotedAmount)}</div>
                          <div className="text-[11.5px] text-brand-muted">결제 {formatKRW(c.paidAmount)}</div>
                        </Td>
                        <Td>
                          <Badge tone={meta.tone}>{meta.label}</Badge>
                        </Td>
                        <Td className="text-center">
                          {SETTING_STAGES.includes(stage) && (
                            <Button size="sm" onClick={() => setSettingTarget(c)}>
                              셋팅 완료
                            </Button>
                          )}
                        </Td>
                        {/* 담당자 = 셋팅을 처리한 관리자 (처리 시 자동으로 기록된다) */}
                        <Td className="text-[13px]">
                          {c.assignedAdminName ? (
                            <span className="text-brand-text">{c.assignedAdminName}</span>
                          ) : (
                            <span className="text-brand-muted">미지정</span>
                          )}
                        </Td>
                      </tr>
                      {expandedId === c.id && (
                        <tr>
                          <td colSpan={12} className="p-0 bg-brand-light/40 border-t border-brand-border">
                            <RankTrendPanel
                              targetName={c.targetName}
                              keyword={c.keyword}
                              targetUrl={c.targetUrl}
                              linkLabel={col.link}
                              history={c.rankHistory}
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
              <EmptyState message="해당 조건의 캠페인이 없습니다." />
            )}
          </Card>
        </>
      )}

      {settingTarget && <SettingModal campaign={settingTarget} onClose={() => setSettingTarget(null)} />}
    </div>
  );
}

/** 기획서: 고객이 캠페인 등록 시 관리자가 구동해주는 셋팅 페이지 */
function SettingModal({ campaign, onClose }: { campaign: AdminCampaignRow; onClose: () => void }) {
  const [dailyQty, setDailyQty] = useState(campaign.dailyQty != null ? String(campaign.dailyQty) : "");
  const [totalQty, setTotalQty] = useState(String(campaign.totalQty));
  // 기간은 임시값이라도 항상 채워져 오므로 그대로 기본값으로 쓴다
  const [startDate, setStartDate] = useState(campaign.startDate);
  const [endDate, setEndDate] = useState(campaign.endDate);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await updateCampaignSetting(campaign.id, { dailyQty, totalQty, startDate, endDate });
      if ("error" in res) {
        setError(res.error);
        return;
      }
      // 셋팅을 확정하면 셋팅완료 단계로 넘어간다 (이후 구동중·완료는 기간에 맞춰 자동)
      const moved = await setCampaignStatus(campaign.id, "scheduled");
      if ("error" in moved) {
        setError(moved.error);
        return;
      }
      onClose();
    });
  };

  return (
    <Modal
      title="셋팅 완료"
      description={`${campaign.advertiser} · ${campaign.targetName} — 저장하면 시작일에 맞춰 자동으로 구동됩니다`}
      onClose={onClose}
      footer={<ModalFooter onClose={onClose} onSubmit={submit} pending={pending} />}
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="일 작업량">
          <Input value={dailyQty} onChange={(e) => setDailyQty(e.target.value)} inputMode="numeric" placeholder="100" />
        </Field>
        <Field label="총 수량">
          <Input value={totalQty} onChange={(e) => setTotalQty(e.target.value)} inputMode="numeric" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="시작일">
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </Field>
        <Field label="종료일">
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </Field>
      </div>

      {error && <Notice ok={false}>{error}</Notice>}
    </Modal>
  );
}

