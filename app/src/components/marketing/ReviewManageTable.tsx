"use client";

import Link from "next/link";
import { useItemGroups, groupItems } from "@/lib/item-groups";
import { ItemGroupBar, ItemGroupHeaderRow, ItemGroupPicker } from "@/components/marketing/ItemGroupBar";
import { usePathname } from "next/navigation";
import {
  StatusFilterCards, PeriodFilter, usePeriodFilter, ManageListHeader,
  StatusDot, NameChip, type StatusKey,
} from "@/components/marketing/manage-ui";
import { Fragment, useState } from "react";

export type Applicant = {
  name: string;
  blogUrl: string;
  submittedAt: string;
  reviewStatus: "제출완료" | "검토중" | "승인" | "반려";
};

export type PostUrl = {
  name: string;
  url: string;
  writtenAt: string;
};

export type Campaign = {
  id: string;
  campaignName: string;
  keyword: string;
  totalCount: number;
  doneCount: number;
  status: string;
  startDate: string;
  endDate: string;
  requestDate?: string;
  amount: number;
  type: string;
  channel?: string;
  productType?: "제품제공" | "제품미제공";
  postingUrl: string;
  hashtags: string[];
  applicants: Applicant[];
  postUrls?: PostUrl[];
};

const REVIEW_STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  "제출완료": { bg: "bg-blue-50",  text: "text-blue-600"  },
  "검토중":   { bg: "bg-amber-50", text: "text-amber-600" },
  "승인":     { bg: "bg-green-50", text: "text-green-600" },
  "반려":     { bg: "bg-red-50",   text: "text-red-500"   },
};

/** 리뷰·체험단만 쓰는 상태 묶음 — 일시정지가 들어간다 */
const REVIEW_STATUS_KEYS: StatusKey[] = ["all", "pending", "running", "done", "paused"];
/** 카드는 개발본과 같이 셋만 둔다 (일시정지는 알약에만) */
const REVIEW_CARD_KEYS: StatusKey[] = ["all", "running", "pending"];
/* 카드는 "전체 캠페인", 알약은 그냥 "전체" — 알약 줄에서는 긴 이름이 자리만 먹는다 */
const REVIEW_CARD_LABELS = { all: "전체 캠페인", pending: "대기중" };
const REVIEW_LABELS = { pending: "대기중" };

const DEFAULT_TABS = [
  { label: "블로그배포", href: "/marketing/review/place/manage" },
  { label: "영수증리뷰", href: "/marketing/review/place/manage/receipt" },
];

type AccordionDetailProps = {
  campaign: Campaign;
  applicantSectionLabel?: string;
  applicantDateLabel?: string;
  showReviewStatus?: boolean;
  showApplicants?: boolean;
  showPostUrls?: boolean;
  onEdit?: (campaign: Campaign) => void;
};

function AccordionDetail({
  campaign,
  applicantSectionLabel = "신청자 목록",
  applicantDateLabel = "제출일",
  showReviewStatus = true,
  showApplicants = true,
  showPostUrls = false,
  onEdit,
}: AccordionDetailProps) {
  const pct = campaign.totalCount === 0 ? 0 : Math.round((campaign.doneCount / campaign.totalCount) * 100);
  const infoItems = [
    { label: "등록 URL",      value: campaign.postingUrl, link: true },
    { label: "캠페인 요청일", value: campaign.requestDate ?? campaign.startDate },
    { label: "결제 금액",     value: `${campaign.amount.toLocaleString()}원` },
  ];

  return (
    <div className="bg-brand-lighter border-t border-brand-border px-5 py-5 space-y-5 sticky left-0 w-[calc(100vw-3rem)] max-w-[calc(100vw-3rem)] md:static md:w-auto md:max-w-none">
      {/* 진행 현황 */}
      <div>
        <p className="text-[12px] font-bold text-brand-muted uppercase tracking-wide mb-3">진행 현황</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3">
          {[
            { label: "모집 인원", value: `${campaign.totalCount}명`,                         color: "text-brand-dark"    },
            { label: "완료",      value: `${campaign.doneCount}명`,                          color: "text-green-600"     },
            { label: "진행률",    value: `${pct}%`,                                          color: "text-brand-primary" },
            { label: "잔여",      value: `${campaign.totalCount - campaign.doneCount}명`,    color: "text-amber-600"     },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-brand-border p-3 text-center">
              <p className="text-[12px] text-brand-muted mb-1">{s.label}</p>
              <p className={`text-[19px] font-extrabold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-2 bg-brand-border rounded-full overflow-hidden">
            <div className="h-full bg-brand-primary rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[12px] font-bold text-brand-primary shrink-0">{pct}%</span>
        </div>
      </div>

      {/* 캠페인 정보 */}
      <div>
        <p className="text-[12px] font-bold text-brand-muted uppercase tracking-wide mb-3">캠페인 정보</p>
        <div className="bg-white rounded-xl border border-brand-border divide-y divide-brand-border">
          {infoItems.map((item) => (
            <div key={item.label} className="flex items-center px-4 py-2.5 gap-4">
              <span className="text-[13px] text-brand-muted w-24 shrink-0">{item.label}</span>
              {item.link ? (
                <a href={item.value} target="_blank" rel="noreferrer"
                  className="text-[13px] text-brand-primary underline underline-offset-2 truncate hover:opacity-75 transition-opacity">
                  {item.value}
                </a>
              ) : (
                <span className="text-[13px] text-brand-dark">{item.value}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 블로그 작성 URL */}
      {showPostUrls && (
        <div>
          <p className="text-[12px] font-bold text-brand-muted uppercase tracking-wide mb-3">
            블로그 작성 URL <span className="text-brand-primary font-extrabold ml-1">{campaign.postUrls?.length ?? 0}</span>
          </p>
          {!campaign.postUrls || campaign.postUrls.length === 0 ? (
            <div className="bg-white rounded-xl border border-brand-border py-8 text-center text-[15px] text-brand-muted">
              아직 제출된 URL이 없습니다.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-brand-lighter border-b border-brand-border">
                    {["블로거명", "작성 URL", "작성일"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-[12px] font-bold text-brand-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {campaign.postUrls.map((p, i) => (
                    <tr key={i} className="hover:bg-brand-lighter/60 transition-colors">
                      <td className="px-4 py-2.5 text-[13px] font-semibold text-brand-dark whitespace-nowrap">{p.name}</td>
                      <td className="px-4 py-2.5">
                        <a href={p.url} target="_blank" rel="noreferrer"
                          className="text-[13px] text-brand-primary underline underline-offset-2 break-all hover:opacity-75 transition-opacity">
                          {p.url}
                        </a>
                      </td>
                      <td className="px-4 py-2.5 text-[13px] text-brand-sub whitespace-nowrap">{p.writtenAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 신청자 목록 / 작성리스트 */}
      {showApplicants && <div>
        <p className="text-[12px] font-bold text-brand-muted uppercase tracking-wide mb-3">
          {applicantSectionLabel} <span className="text-brand-primary font-extrabold ml-1">{campaign.applicants.length}</span>
        </p>
        {campaign.applicants.length === 0 ? (
          <div className="bg-white rounded-xl border border-brand-border py-8 text-center text-[15px] text-brand-muted">
            아직 데이터가 없습니다.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-brand-lighter border-b border-brand-border">
                  {["블로거명", "블로그 URL", applicantDateLabel, ...(showReviewStatus ? ["리뷰 상태"] : [])].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-[12px] font-bold text-brand-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {campaign.applicants.map((ap, i) => {
                  const rs = REVIEW_STATUS_CONFIG[ap.reviewStatus];
                  return (
                    <tr key={i} className="hover:bg-brand-lighter/60 transition-colors">
                      <td className="px-4 py-2.5 text-[13px] font-semibold text-brand-dark">{ap.name}</td>
                      <td className="px-4 py-2.5">
                        <a href={ap.blogUrl} target="_blank" rel="noreferrer"
                          className="text-[13px] text-brand-primary underline underline-offset-2 truncate max-w-[200px] block hover:opacity-75">
                          {ap.blogUrl}
                        </a>
                      </td>
                      <td className="px-4 py-2.5 text-[13px] text-brand-sub whitespace-nowrap">{ap.submittedAt}</td>
                      {showReviewStatus && (
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[12px] font-bold ${rs.bg} ${rs.text}`}>
                            {ap.reviewStatus}
                          </span>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>}

      {/* 캠페인 수정 요청 */}
      {onEdit && (
        <div className="flex justify-end pt-1">
          <button
            onClick={() => onEdit(campaign)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[14px] font-bold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
            </svg>
            수정하기
          </button>
        </div>
      )}
    </div>
  );
}

type TabItem = { label: string; href: string };

type Props = {
  campaigns: Campaign[];
  /** 기간 필터의 기준 날짜 — 서버에서 넘겨 하이드레이션을 맞춘다 */
  today: string;
  createHref: string;
  tabs?: TabItem[];
  applicantSectionLabel?: string;
  applicantDateLabel?: string;
  showReviewStatus?: boolean;
  showApplicants?: boolean;
  showPostUrls?: boolean;
  showChannel?: boolean;
};

export default function ReviewManageTable({
  campaigns,
  today,
  createHref,
  tabs = DEFAULT_TABS,
  applicantSectionLabel = "신청자 목록",
  applicantDateLabel = "제출일",
  showReviewStatus = true,
  showApplicants = true,
  showPostUrls = false,
  showChannel = false,
}: Props) {
  const pathname = usePathname();
  // 그룹 보관함은 화면(경로)마다 나눈다 — 플레이스 리뷰 그룹이 쇼핑 리뷰에 나오면 안 된다
  const grp = useItemGroups(`review${pathname}`);
  const [pickGroupId, setPickGroupId] = useState<number | null>(null);
  const [status, setStatus] = useState<StatusKey>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 수정 요청 모달
  const [editTarget, setEditTarget] = useState<Campaign | null>(null);
  const [editText, setEditText] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editDone, setEditDone] = useState(false);

  const openEdit = (campaign: Campaign) => {
    setEditTarget(campaign);
    setEditText("");
    setEditDone(false);
  };
  const closeEdit = () => {
    setEditTarget(null);
    setEditSubmitting(false);
    setEditDone(false);
  };
  const submitEdit = async () => {
    if (!editText.trim()) return;
    setEditSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setEditSubmitting(false);
    setEditDone(true);
  };

  const period = usePeriodFilter(today, "3m");

  // 표의 "캠페인 요청일" 칸과 같은 값으로 거른다. 거르는 기준과 보이는 날짜가
  // 다르면 3개월 밖 날짜가 목록에 남아 필터가 고장 난 것처럼 보인다.
  const inPeriod = campaigns.filter((c) => period.contains(c.requestDate ?? c.startDate ?? ""));

  const counts = {
    all: inPeriod.length,
    pending: inPeriod.filter((c) => c.status === "pending").length,
    running: inPeriod.filter((c) => c.status === "running").length,
    paused: inPeriod.filter((c) => c.status === "paused").length,
    done: inPeriod.filter((c) => c.status === "done").length,
  };

  const filtered = inPeriod.filter((c) => {
    const statusMatch = status === "all" || c.status === status;
    const searchMatch = !search || c.campaignName.includes(search) || c.keyword.includes(search);
    return statusMatch && searchMatch;
  });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full space-y-5">
      {/* 탭 */}
      <div className="bg-white rounded-2xl border border-brand-border px-2 py-2 flex items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-[15px] font-bold transition-all ${
                isActive ? "bg-brand-primary text-white shadow-sm" : "text-brand-sub hover:bg-brand-lighter hover:text-brand-dark"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* 상태별 건수 — 카드가 곧 필터다 */}
      <StatusFilterCards
        counts={counts}
        value={status}
        onChange={(k) => { setStatus(k); setExpandedId(null); }}
        keys={REVIEW_CARD_KEYS}
        labels={REVIEW_CARD_LABELS}
      />

      <PeriodFilter period={period} basisLabel="신청일" />

      {/* ── 목록 ──
          상자를 두지 않는다. 위 요약 카드만 면을 가지므로 "지금 보는 범위"와
          "목록"이 나뉜다. (리워드 캠페인 관리·통합순위관리와 같은 규칙) */}
      <div className="mt-6 md:mt-8">
        <ManageListHeader
          title={`${tabs.find((t) => t.href === pathname)?.label ?? "내"} 캠페인`}
          count={filtered.length}
          value={status}
          onChange={(k) => { setStatus(k); setExpandedId(null); }}
          keys={REVIEW_STATUS_KEYS}
          labels={REVIEW_LABELS}
          className="px-5 md:px-6 pt-4 pb-3 border-b border-brand-border"
          action={
            <div className="flex items-center gap-2">
              <div className="relative">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="캠페인명, 키워드 검색"
                  className="pl-8 pr-3 py-2 border border-brand-border rounded-lg text-[13px] text-brand-dark bg-white focus:outline-none focus:border-brand-primary transition-all w-44"
                />
              </div>
              <Link href={createHref}
                className="flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-lg text-[13.5px] font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: "var(--gradient-point)", boxShadow: "var(--shadow-point)" }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                새 캠페인 신청
              </Link>
            </div>
          }
        />

        {/* ── 그룹 묶어보기 ── */}
        <ItemGroupBar
          groups={grp.groups}
          onAdd={(name) => grp.addGroup(name)}
          className="px-5 md:px-6 py-3 border-b border-brand-border"
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="w-10" />
                {["캠페인명", ...(showChannel ? ["채널"] : []), "키워드", "모집 인원", "진행률", "캠페인 요청일", "결제 금액", "상태"].map((h) => (
                  <th key={h} className="px-4 pt-3 pb-2 text-[11.5px] font-semibold text-brand-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={showChannel ? 9 : 8} className="px-4 py-16 text-center text-[16px] text-brand-muted">
                    조건에 맞는 캠페인이 없습니다.
                  </td>
                </tr>
              ) : groupItems(filtered, (c) => c.id, grp.groups, grp.assign).flatMap((g) => [
                  ...(grp.groups.length
                    ? [
                        <ItemGroupHeaderRow
                          key={`gh-${g.gid ?? "none"}`}
                          colSpan={showChannel ? 9 : 8}
                          name={g.name}
                          count={g.items.length}
                          onPick={g.gid !== null ? () => setPickGroupId(g.gid!) : undefined}
                          onRename={
                            g.gid !== null
                              ? () => {
                                  const next = window.prompt("그룹 이름", g.name ?? "");
                                  if (next) grp.renameGroup(g.gid!, next);
                                }
                              : undefined
                          }
                          onRemove={g.gid !== null ? () => grp.removeGroup(g.gid!) : undefined}
                        />,
                      ]
                    : []),
                  ...(g.empty && grp.groups.length
                    ? [
                        <tr key={`ge-${g.gid}`}>
                          <td colSpan={showChannel ? 9 : 8} className="px-5 md:px-6 py-4 text-[13px] text-brand-muted">
                            「편성」을 눌러 이 그룹에 넣을 캠페인을 고르세요.
                          </td>
                        </tr>,
                      ]
                    : []),
                  ...g.items.map((c) => {
                const isOpen = expandedId === c.id;
                const pct = c.totalCount === 0 ? 0 : Math.round((c.doneCount / c.totalCount) * 100);
                return (
                  <Fragment key={c.id}>
                    <tr
                      onClick={() => toggleExpand(c.id)}
                      className={`cursor-pointer transition-colors ${isOpen ? "bg-brand-lighter/60" : "hover:bg-brand-lighter/50"}`}
                    >
                      <td className="pl-4 py-3.5">
                        <svg
                          className={`w-4 h-4 text-brand-muted transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-2">
                          <NameChip name={c.campaignName} />
                          <span className="text-[15px] font-semibold text-brand-dark truncate max-w-[160px]">{c.campaignName}</span>
                        </span>
                        {c.productType && (
                          <span className={`inline-flex mt-1 items-center px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
                            c.productType === "제품제공" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"
                          }`}>{c.productType}</span>
                        )}
                      </td>
                      {showChannel && (
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[12px] font-bold ${
                            c.channel === "쿠팡" ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"
                          }`}>{c.channel ?? "네이버 쇼핑"}</span>
                        </td>
                      )}
                      <td className="px-4 py-3.5">
                        <span className="text-[13px] text-brand-sub">{c.keyword}</span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-[15px] font-bold text-brand-dark">{c.totalCount.toLocaleString()}</span>
                        <span className="text-[12px] text-brand-muted ml-0.5">명</span>
                      </td>
                      <td className="px-4 py-3.5 min-w-[100px]">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-[12px] text-brand-muted">{c.doneCount}/{c.totalCount}</span>
                            <span className="text-[12px] font-bold text-brand-primary">{pct}%</span>
                          </div>
                          <div className="h-1.5 bg-brand-border rounded-full overflow-hidden w-24">
                            <div className="h-full bg-brand-primary rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-[13px] text-brand-sub">{c.requestDate ?? c.startDate}</span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-[15px] font-extrabold text-brand-dark">{c.amount.toLocaleString()}</span>
                        <span className="text-[12px] text-brand-muted ml-0.5">원</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusDot status={c.status as "pending" | "running" | "paused" | "done"} labels={REVIEW_LABELS} />
                      </td>
                    </tr>
                    {isOpen && (
                      <tr key={`${c.id}-detail`} className="border-b border-brand-border">
                        <td colSpan={showChannel ? 9 : 8} className="p-0">
                          <AccordionDetail
                            campaign={c}
                            applicantSectionLabel={applicantSectionLabel}
                            applicantDateLabel={applicantDateLabel}
                            showReviewStatus={showReviewStatus}
                            showApplicants={showApplicants}
                            showPostUrls={showPostUrls}
                            onEdit={openEdit}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              }),
                ])}
            </tbody>
          </table>
        </div>

        <div className="px-5 md:px-6 py-3 border-t border-brand-border">
          <p className="text-[13px] text-brand-muted">총 <span className="font-bold text-brand-dark">{filtered.length}</span>건</p>
        </div>
      </div>

      {pickGroupId !== null && (
        <ItemGroupPicker
          groupName={grp.groups.find((g) => g.id === pickGroupId)?.name ?? "그룹"}
          groupId={pickGroupId}
          // 편성은 필터·검색과 무관하게 전체에서 고른다
          items={campaigns}
          idOf={(c) => c.id}
          labelOf={(c) => c.campaignName}
          subLabelOf={(c) => `${c.keyword} · ${c.type}`}
          assign={grp.assign}
          onApply={(add, remove) => {
            grp.assignMany(add, pickGroupId);
            grp.assignMany(remove, null);
          }}
          onClose={() => setPickGroupId(null)}
        />
      )}

      {/* 수정 요청 모달 */}
      {editTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeEdit}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {editDone ? (
              /* 완료 상태 */
              <div className="p-10 text-center">
                <div className="h-14 w-14 rounded-2xl bg-green-50 mx-auto flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-[19px] font-extrabold text-brand-dark mb-1.5">수정 요청 완료</h3>
                <p className="text-[14px] text-brand-sub mb-7">담당자 확인 후 순차적으로 반영됩니다.</p>
                <button
                  onClick={closeEdit}
                  className="px-5 py-2.5 rounded-xl text-[15px] font-bold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors"
                >
                  확인
                </button>
              </div>
            ) : (
              <>
                {/* 헤더 */}
                <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-brand-border">
                  <div>
                    <h3 className="text-[18px] font-extrabold text-brand-dark">캠페인 수정 요청</h3>
                    <p className="text-[13px] text-brand-sub mt-0.5">{editTarget.campaignName}</p>
                  </div>
                  <button onClick={closeEdit} className="text-brand-muted hover:text-brand-dark transition-colors -mt-0.5">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* 본문 */}
                <div className="px-6 py-5 space-y-4">
                  <div className="flex flex-wrap gap-x-6 gap-y-1.5 rounded-xl bg-brand-lighter px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-brand-muted">키워드</span>
                      <span className="text-[13px] font-semibold text-brand-dark">{editTarget.keyword}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-brand-muted">모집 인원</span>
                      <span className="text-[13px] font-semibold text-brand-dark">{editTarget.totalCount}명</span>
                    </div>
                    {editTarget.channel && (
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-brand-muted">채널</span>
                        <span className="text-[13px] font-semibold text-brand-dark">{editTarget.channel}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[14px] font-semibold text-brand-dark mb-1.5">
                      수정 요청 내용 <span className="text-red-500">*</span>
                    </label>
                    {/* 안내 */}
                    <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5 mb-2">
                      <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-[12.5px] leading-relaxed text-amber-800">
                        <b>키워드는 변경할 수 없습니다.</b> 업체 관련 내용(이벤트, 영업시간, 메뉴 안내 등)만 수정 가능합니다.
                      </p>
                    </div>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      maxLength={1000}
                      rows={6}
                      placeholder={"예시)\n- 신규 이벤트 안내 추가 (방문 고객 음료 1잔 무료 등)\n- 영업시간/브레이크타임 변경\n- 대표 메뉴·가격 정보 수정"}
                      className="w-full px-3.5 py-3 border border-brand-border rounded-xl text-[14px] text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all resize-none leading-relaxed"
                    />
                    <p className="text-right text-[12px] text-brand-muted mt-1">{editText.length} / 1000</p>
                  </div>
                </div>

                {/* 푸터 */}
                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-brand-border bg-brand-lighter/40">
                  <button
                    onClick={closeEdit}
                    className="px-4 py-2.5 rounded-xl text-[14px] font-bold bg-white text-brand-text border border-brand-border hover:bg-brand-lighter transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={submitEdit}
                    disabled={!editText.trim() || editSubmitting}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[14px] font-bold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {editSubmitting && (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                    {editSubmitting ? "요청 중..." : "수정 요청"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
