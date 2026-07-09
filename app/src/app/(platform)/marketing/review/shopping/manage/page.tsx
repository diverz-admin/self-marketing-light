"use client";

import ReviewManageTable, { Campaign } from "@/components/marketing/ReviewManageTable";
import PageHeader from "@/components/marketing/PageHeader";

const TABS = [
  { label: "상품 체험단", href: "/marketing/review/shopping/manage/product-experience" },
];

const CAMPAIGNS: Campaign[] = [
  {
    id: "sr1",
    campaignName: "어성초 샴푸 기자단 캠페인",
    keyword: "약산성샴푸추천",
    totalCount: 15, doneCount: 9, status: "running",
    startDate: "2026-06-10", endDate: "2026-06-30", amount: 22500,
    type: "블로그리뷰(기자단)",
    channel: "네이버 쇼핑",
    productType: "제품제공",
    postingUrl: "https://smartstore.naver.com/shop/products/12345678",
    hashtags: ["#약산성샴푸", "#어성초샴푸", "#샴푸추천"],
    applicants: [],
    postUrls: [
      { name: "김뷰티", url: "https://blog.naver.com/beauty1/223001112345", writtenAt: "2026-06-11" },
      { name: "이헤어", url: "https://blog.naver.com/hair1/223001256789",   writtenAt: "2026-06-12" },
      { name: "박두피", url: "https://blog.naver.com/scalp1/223001334567",  writtenAt: "2026-06-14" },
    ],
  },
  {
    id: "cr1",
    campaignName: "쿠팡 단백질보충제 기자단",
    keyword: "단백질보충제추천",
    totalCount: 20, doneCount: 11, status: "running",
    startDate: "2026-06-12", endDate: "2026-07-02", amount: 30000,
    type: "블로그리뷰(기자단)",
    channel: "쿠팡",
    productType: "제품미제공",
    postingUrl: "https://www.coupang.com/vp/products/24681012",
    hashtags: ["#단백질보충제", "#프로틴", "#헬스보충제"],
    applicants: [],
    postUrls: [
      { name: "김헬스", url: "https://blog.naver.com/fit1/223101112345", writtenAt: "2026-06-13" },
      { name: "이프로틴", url: "https://blog.naver.com/protein1/223101256789", writtenAt: "2026-06-15" },
    ],
  },
  {
    id: "sr2",
    campaignName: "비타민C 세럼 기자단 리뷰",
    keyword: "비타민C세럼추천",
    totalCount: 10, doneCount: 0, status: "pending",
    startDate: "2026-06-28", endDate: "2026-07-15", amount: 15000,
    type: "블로그리뷰(기자단)",
    channel: "네이버 쇼핑",
    productType: "제품미제공",
    postingUrl: "https://smartstore.naver.com/shop/products/87654321",
    hashtags: ["#비타민C세럼", "#미백세럼", "#스킨케어"],
    applicants: [],
    postUrls: [],
  },
  {
    id: "sr3",
    campaignName: "무선 청소기 기자단 캠페인",
    keyword: "무선청소기추천",
    totalCount: 8, doneCount: 8, status: "done",
    startDate: "2026-05-05", endDate: "2026-05-25", amount: 12000,
    type: "블로그리뷰(기자단)",
    channel: "네이버 쇼핑",
    productType: "제품제공",
    postingUrl: "https://smartstore.naver.com/shop/products/11223344",
    hashtags: ["#무선청소기", "#핸디청소기", "#청소기추천"],
    applicants: [],
    postUrls: [
      { name: "박청소", url: "https://blog.naver.com/clean1/222901112233",  writtenAt: "2026-05-06" },
      { name: "최리뷰", url: "https://blog.naver.com/review1/222901223344", writtenAt: "2026-05-07" },
    ],
  },
];

export default function ShoppingReviewReporterManagePage() {
  return (
    <div className="w-full space-y-5">
      <PageHeader
        title="네이버 쇼핑 리뷰 관리"
        subtitle="신청한 리뷰 캠페인을 확인하고 관리하세요."
        iconPath={"M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"}
      />
      <ReviewManageTable
        campaigns={CAMPAIGNS}
        breadcrumbLabel="블로그리뷰(기자단)"
        breadcrumbPlatform="쇼핑 리뷰"
        createHref="/marketing/review/shopping/blog-reporter"
        tabs={TABS}
        showApplicants={false}
        showPostUrls={true}
        showChannel={true}
      />
    </div>
  );
}
