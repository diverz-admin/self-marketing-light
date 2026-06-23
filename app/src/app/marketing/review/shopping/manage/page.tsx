"use client";

import ReviewManageTable, { Campaign } from "@/components/marketing/ReviewManageTable";

const TABS = [
  { label: "블로그리뷰(기자단)", href: "/marketing/review/shopping/manage" },
  { label: "블로그리뷰(체험단)", href: "/marketing/review/shopping/manage/blog-experience" },
  { label: "상품 체험단",         href: "/marketing/review/shopping/manage/product-experience" },
];

const CAMPAIGNS: Campaign[] = [
  {
    id: "sr1",
    campaignName: "어성초 샴푸 기자단 캠페인",
    keyword: "약산성샴푸추천",
    totalCount: 15, doneCount: 9, status: "running",
    startDate: "2026-06-10", endDate: "2026-06-30", amount: 22500,
    type: "블로그리뷰(기자단)",
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
    id: "sr2",
    campaignName: "비타민C 세럼 기자단 리뷰",
    keyword: "비타민C세럼추천",
    totalCount: 10, doneCount: 0, status: "pending",
    startDate: "2026-06-28", endDate: "2026-07-15", amount: 15000,
    type: "블로그리뷰(기자단)",
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
    <ReviewManageTable
      campaigns={CAMPAIGNS}
      breadcrumbLabel="블로그리뷰(기자단)"
      breadcrumbPlatform="네이버 쇼핑"
      createHref="/marketing/review/shopping/blog-reporter"
      tabs={TABS}
      showApplicants={false}
      showPostUrls={true}
    />
  );
}
