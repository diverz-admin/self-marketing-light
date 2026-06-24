"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
  amount: number;
  type: string;
  productType?: "제품제공" | "제품미제공";
  postingUrl: string;
  hashtags: string[];
  applicants: Applicant[];
  postUrls?: PostUrl[];
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  running: { label: "진행중",   bg: "bg-green-50", text: "text-green-600" },
  pending: { label: "대기중",   bg: "bg-amber-50", text: "text-amber-600" },
  paused:  { label: "일시정지", bg: "bg-gray-100", text: "text-gray-500" },
  done:    { label: "완료",     bg: "bg-blue-50",  text: "text-blue-500" },
};

const REVIEW_STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  "제출완료": { bg: "bg-blue-50",  text: "text-blue-600"  },
  "검토중":   { bg: "bg-amber-50", text: "text-amber-600" },
  "승인":     { bg: "bg-green-50", text: "text-green-600" },
  "반려":     { bg: "bg-red-50",   text: "text-red-500"   },
};

const DEFAULT_TABS = [
  { label: "블로그배포", href: "/marketing/review/place/manage" },
  { label: "영수증리뷰", href: "/marketing/review/place/manage/receipt" },
];

const FILTER_OPTIONS = ["진행중", "대기중", "일시정지", "완료", "전체"];
const STATUS_KEY: Record<string, string> = {
  "전체": "all", "진행중": "running", "대기중": "pending", "일시정지": "paused", "완료": "done",
};

type AccordionDetailProps = {
  campaign: Campaign;
  applicantSectionLabel?: string;
  applicantDateLabel?: string;
  showReviewStatus?: boolean;
  showApplicants?: boolean;
  showPostUrls?: boolean;
};

function AccordionDetail({
  campaign,
  applicantSectionLabel = "신청자 목록",
  applicantDateLabel = "제출일",
  showReviewStatus = true,
  showApplicants = true,
  showPostUrls = false,
}: AccordionDetailProps) {
  const pct = campaign.totalCount === 0 ? 0 : Math.round((campaign.doneCount / campaign.totalCount) * 100);
  const infoItems = [
    { label: "캠페인 유형",   value: campaign.type },
    ...(campaign.productType ? [{ label: "제품 제공 여부", value: campaign.productType }] : []),
    { label: "등록 URL",      value: campaign.postingUrl, link: true },
    { label: "해시태그",      value: campaign.hashtags.join("  ") },
    { label: "모집 기간",     value: `${campaign.startDate} ~ ${campaign.endDate}` },
    { label: "결제 금액",     value: `${campaign.amount.toLocaleString()}원` },
  ];

  return (
    <div className="bg-brand-lighter border-t border-brand-border px-5 py-5 space-y-5">
      {/* 진행 현황 */}
      <div>
        <p className="text-[11px] font-bold text-brand-muted uppercase tracking-wide mb-3">진행 현황</p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "모집 인원", value: `${campaign.totalCount}명`,                         color: "text-brand-dark"    },
            { label: "완료",      value: `${campaign.doneCount}명`,                          color: "text-green-600"     },
            { label: "진행률",    value: `${pct}%`,                                          color: "text-brand-primary" },
            { label: "잔여",      value: `${campaign.totalCount - campaign.doneCount}명`,    color: "text-amber-600"     },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-brand-border p-3 text-center">
              <p className="text-[11px] text-brand-muted mb-1">{s.label}</p>
              <p className={`text-[17px] font-extrabold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-2 bg-brand-border rounded-full overflow-hidden">
            <div className="h-full bg-brand-primary rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[11px] font-bold text-brand-primary shrink-0">{pct}%</span>
        </div>
      </div>

      {/* 캠페인 정보 */}
      <div>
        <p className="text-[11px] font-bold text-brand-muted uppercase tracking-wide mb-3">캠페인 정보</p>
        <div className="bg-white rounded-xl border border-brand-border divide-y divide-brand-border">
          {infoItems.map((item) => (
            <div key={item.label} className="flex items-center px-4 py-2.5 gap-4">
              <span className="text-[12px] text-brand-muted w-24 shrink-0">{item.label}</span>
              {item.link ? (
                <a href={item.value} target="_blank" rel="noreferrer"
                  className="text-[12px] text-brand-primary underline underline-offset-2 truncate hover:opacity-75 transition-opacity">
                  {item.value}
                </a>
              ) : (
                <span className="text-[12px] text-brand-dark">{item.value}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 블로그 작성 URL */}
      {showPostUrls && (
        <div>
          <p className="text-[11px] font-bold text-brand-muted uppercase tracking-wide mb-3">
            블로그 작성 URL <span className="text-brand-primary font-extrabold ml-1">{campaign.postUrls?.length ?? 0}</span>
          </p>
          {!campaign.postUrls || campaign.postUrls.length === 0 ? (
            <div className="bg-white rounded-xl border border-brand-border py-8 text-center text-[13px] text-brand-muted">
              아직 제출된 URL이 없습니다.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-brand-lighter border-b border-brand-border">
                    {["블로거명", "작성 URL", "작성일"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-[11px] font-bold text-brand-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {campaign.postUrls.map((p, i) => (
                    <tr key={i} className="hover:bg-brand-lighter/60 transition-colors">
                      <td className="px-4 py-2.5 text-[12px] font-semibold text-brand-dark whitespace-nowrap">{p.name}</td>
                      <td className="px-4 py-2.5">
                        <a href={p.url} target="_blank" rel="noreferrer"
                          className="text-[12px] text-brand-primary underline underline-offset-2 break-all hover:opacity-75 transition-opacity">
                          {p.url}
                        </a>
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-brand-sub whitespace-nowrap">{p.writtenAt}</td>
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
        <p className="text-[11px] font-bold text-brand-muted uppercase tracking-wide mb-3">
          {applicantSectionLabel} <span className="text-brand-primary font-extrabold ml-1">{campaign.applicants.length}</span>
        </p>
        {campaign.applicants.length === 0 ? (
          <div className="bg-white rounded-xl border border-brand-border py-8 text-center text-[13px] text-brand-muted">
            아직 데이터가 없습니다.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-brand-lighter border-b border-brand-border">
                  {["블로거명", "블로그 URL", applicantDateLabel, ...(showReviewStatus ? ["리뷰 상태"] : [])].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-[11px] font-bold text-brand-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {campaign.applicants.map((ap, i) => {
                  const rs = REVIEW_STATUS_CONFIG[ap.reviewStatus];
                  return (
                    <tr key={i} className="hover:bg-brand-lighter/60 transition-colors">
                      <td className="px-4 py-2.5 text-[12px] font-semibold text-brand-dark">{ap.name}</td>
                      <td className="px-4 py-2.5">
                        <a href={ap.blogUrl} target="_blank" rel="noreferrer"
                          className="text-[12px] text-brand-primary underline underline-offset-2 truncate max-w-[200px] block hover:opacity-75">
                          {ap.blogUrl}
                        </a>
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-brand-sub whitespace-nowrap">{ap.submittedAt}</td>
                      {showReviewStatus && (
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold ${rs.bg} ${rs.text}`}>
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
    </div>
  );
}

type TabItem = { label: string; href: string };

type Props = {
  campaigns: Campaign[];
  breadcrumbLabel: string;
  breadcrumbPlatform?: string;
  createHref: string;
  tabs?: TabItem[];
  applicantSectionLabel?: string;
  applicantDateLabel?: string;
  showReviewStatus?: boolean;
  showApplicants?: boolean;
  showPostUrls?: boolean;
};

export default function ReviewManageTable({
  campaigns,
  breadcrumbLabel,
  breadcrumbPlatform = "네이버 플레이스",
  createHref,
  tabs = DEFAULT_TABS,
  applicantSectionLabel = "신청자 목록",
  applicantDateLabel = "제출일",
  showReviewStatus = true,
  showApplicants = true,
  showPostUrls = false,
}: Props) {
  const pathname = usePathname();
  const [filter, setFilter] = useState("진행중");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = campaigns.filter((c) => {
    const statusMatch = filter === "전체" || c.status === STATUS_KEY[filter];
    const searchMatch = !search || c.campaignName.includes(search) || c.keyword.includes(search);
    return statusMatch && searchMatch;
  });

  const running = campaigns.filter((c) => c.status === "running").length;
  const pending = campaigns.filter((c) => c.status === "pending").length;

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full space-y-5">
      {/* 브레드크럼 */}
      <nav className="flex items-center gap-1.5 text-[13px] text-brand-sub">
        <Link href="/marketing" className="hover:text-brand-text">대시보드</Link>
        <span>›</span>
        <span className="text-brand-muted">{breadcrumbPlatform}</span>
        <span>›</span>
        <span className="text-brand-text font-medium">[리뷰] 캠페인 관리 · {breadcrumbLabel}</span>
      </nav>

      {/* 탭 */}
      <div className="bg-white rounded-2xl border border-brand-border px-2 py-2 flex items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${
                isActive ? "bg-brand-primary text-white shadow-sm" : "text-brand-sub hover:bg-brand-lighter hover:text-brand-dark"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "전체 캠페인", value: campaigns.length, color: "text-brand-dark",  grad: "linear-gradient(135deg,#10B981,#059669)", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
          { label: "진행중",     value: running,           color: "text-green-600",   grad: "linear-gradient(135deg,#3B82F6,#6366F1)", icon: "M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" },
          { label: "대기중",     value: pending,           color: "text-amber-600",   grad: "linear-gradient(135deg,#F59E0B,#D97706)", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-brand-border p-4 flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: stat.grad }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
              </svg>
            </span>
            <div>
              <p className="text-[12px] text-brand-sub">{stat.label}</p>
              <p className={`text-[22px] font-extrabold leading-tight ${stat.color}`}>
                {stat.value}<span className="text-[13px] font-medium text-brand-muted ml-1">건</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-brand-border flex-wrap">
          <div className="flex items-center gap-2">
            {FILTER_OPTIONS.map((opt) => (
              <button key={opt} onClick={() => { setFilter(opt); setExpandedId(null); }}
                className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
                  filter === opt ? "bg-brand-primary text-white" : "bg-brand-lighter text-brand-sub hover:bg-brand-border"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="캠페인명, 키워드 검색"
                className="pl-8 pr-3 py-1.5 border border-brand-border rounded-xl text-[12px] text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all w-48"
              />
            </div>
            <Link href={createHref}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-bold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              캠페인 생성
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-brand-border bg-brand-lighter">
                <th className="w-10" />
                {["캠페인명", "키워드", "모집 인원", "진행률", "기간", "결제 금액", "상태", "관리"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[11px] font-bold text-brand-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-[14px] text-brand-muted">
                    조건에 맞는 캠페인이 없습니다.
                  </td>
                </tr>
              ) : filtered.map((c) => {
                const st = STATUS_CONFIG[c.status];
                const isOpen = expandedId === c.id;
                const pct = c.totalCount === 0 ? 0 : Math.round((c.doneCount / c.totalCount) * 100);
                return (
                  <>
                    <tr
                      key={c.id}
                      onClick={() => toggleExpand(c.id)}
                      className={`border-b border-brand-border cursor-pointer transition-colors ${isOpen ? "bg-brand-lighter/60" : "hover:bg-brand-lighter/40"}`}
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
                        <p className="text-[13px] font-semibold text-brand-dark truncate max-w-[160px]">{c.campaignName}</p>
                        {c.productType && (
                          <span className={`inline-flex mt-1 items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                            c.productType === "제품제공" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"
                          }`}>{c.productType}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[12px] text-brand-sub">{c.keyword}</span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-[13px] font-bold text-brand-dark">{c.totalCount.toLocaleString()}</span>
                        <span className="text-[11px] text-brand-muted ml-0.5">명</span>
                      </td>
                      <td className="px-4 py-3.5 min-w-[100px]">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-[11px] text-brand-muted">{c.doneCount}/{c.totalCount}</span>
                            <span className="text-[11px] font-bold text-brand-primary">{pct}%</span>
                          </div>
                          <div className="h-1.5 bg-brand-border rounded-full overflow-hidden w-24">
                            <div className="h-full bg-brand-primary rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-[11.5px] text-brand-sub">{c.startDate}</span>
                        <span className="text-brand-muted mx-1">~</span>
                        <span className="text-[11.5px] text-brand-sub">{c.endDate}</span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-[13px] font-extrabold text-brand-dark">{c.amount.toLocaleString()}</span>
                        <span className="text-[11px] text-brand-muted ml-0.5">원</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${st.bg} ${st.text}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          {c.status === "running" && (
                            <button className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors">일시정지</button>
                          )}
                          {c.status === "paused" && (
                            <button className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-green-50 text-green-600 hover:bg-green-100 transition-colors">재시작</button>
                          )}
                          {c.status !== "done" && (
                            <button className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-colors">중단</button>
                          )}
                          {c.status === "done" && <span className="text-[11px] text-brand-muted">-</span>}
                        </div>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr key={`${c.id}-detail`} className="border-b border-brand-border">
                        <td colSpan={9} className="p-0">
                          <AccordionDetail
                            campaign={c}
                            applicantSectionLabel={applicantSectionLabel}
                            applicantDateLabel={applicantDateLabel}
                            showReviewStatus={showReviewStatus}
                            showApplicants={showApplicants}
                            showPostUrls={showPostUrls}
                          />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-brand-border">
          <p className="text-[12px] text-brand-muted">총 <span className="font-bold text-brand-dark">{filtered.length}</span>건</p>
        </div>
      </div>
    </div>
  );
}
