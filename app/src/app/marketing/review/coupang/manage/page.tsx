"use client";

import ReviewManageTable, { Campaign } from "@/components/marketing/ReviewManageTable";

const TABS = [
  { label: "상품 체험단", href: "/marketing/review/coupang/manage" },
];

const CAMPAIGNS: Campaign[] = [
  {
    id: "cp1",
    campaignName: "쿠팡 건강기능식품 체험단",
    keyword: "건강기능식품추천",
    totalCount: 30, doneCount: 20, status: "running",
    startDate: "2026-06-10", endDate: "2026-07-05", amount: 45000,
    type: "상품 체험단",
    productType: "제품제공",
    postingUrl: "https://www.coupang.com/vp/products/11223344",
    hashtags: ["#건강기능식품", "#비타민", "#영양제"],
    applicants: [
      { name: "김건강", blogUrl: "https://blog.naver.com/health1", submittedAt: "2026-06-11", reviewStatus: "승인" },
      { name: "이웰빙", blogUrl: "https://blog.naver.com/well1",   submittedAt: "2026-06-13", reviewStatus: "검토중" },
    ],
  },
  {
    id: "cp2",
    campaignName: "쿠팡 주방용품 체험단",
    keyword: "주방용품추천",
    totalCount: 20, doneCount: 0, status: "pending",
    startDate: "2026-07-01", endDate: "2026-07-20", amount: 30000,
    type: "상품 체험단",
    productType: "제품제공",
    postingUrl: "https://www.coupang.com/vp/products/55667788",
    hashtags: ["#주방용품", "#쿡웨어", "#조리도구"],
    applicants: [],
  },
  {
    id: "cp3",
    campaignName: "쿠팡 패션 아이템 리뷰",
    keyword: "패션아이템추천",
    totalCount: 15, doneCount: 6, status: "paused",
    startDate: "2026-06-05", endDate: "2026-06-25", amount: 22500,
    type: "상품 체험단",
    productType: "제품미제공",
    postingUrl: "https://www.coupang.com/vp/products/99001122",
    hashtags: ["#패션", "#데일리룩", "#옷추천"],
    applicants: [
      { name: "박패션", blogUrl: "https://blog.naver.com/style1", submittedAt: "2026-06-06", reviewStatus: "승인" },
    ],
  },
  {
    id: "cp4",
    campaignName: "쿠팡 생활용품 체험단",
    keyword: "생활용품추천",
    totalCount: 25, doneCount: 25, status: "done",
    startDate: "2026-05-01", endDate: "2026-05-28", amount: 37500,
    type: "상품 체험단",
    productType: "제품미제공",
    postingUrl: "https://www.coupang.com/vp/products/33445566",
    hashtags: ["#생활용품", "#홈리빙", "#인테리어"],
    applicants: [
      { name: "윤홈", blogUrl: "https://blog.naver.com/home1", submittedAt: "2026-05-02", reviewStatus: "승인" },
      { name: "강인테리어", blogUrl: "https://blog.naver.com/interior1", submittedAt: "2026-05-03", reviewStatus: "승인" },
    ],
  },
];

export default function CoupangProductExperienceManagePage() {
  return (
    <ReviewManageTable
      campaigns={CAMPAIGNS}
      breadcrumbLabel="상품 체험단"
      breadcrumbPlatform="쿠팡"
      createHref="/marketing/review/coupang"
      tabs={TABS}
      showApplicants={false}
    />
  );
}
