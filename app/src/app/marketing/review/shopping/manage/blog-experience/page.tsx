"use client";

import ReviewManageTable, { Campaign } from "@/components/marketing/ReviewManageTable";

const TABS = [
  { label: "블로그리뷰(기자단)", href: "/marketing/review/shopping/manage" },
  { label: "블로그리뷰(체험단)", href: "/marketing/review/shopping/manage/blog-experience" },
  { label: "상품 체험단",         href: "/marketing/review/shopping/manage/product-experience" },
];

const CAMPAIGNS: Campaign[] = [
  {
    id: "se1",
    campaignName: "프로틴 바 체험단 캠페인",
    keyword: "프로틴바추천",
    totalCount: 20, doneCount: 12, status: "running",
    startDate: "2026-06-12", endDate: "2026-07-05", amount: 30000,
    type: "블로그리뷰(체험단)",
    postingUrl: "https://smartstore.naver.com/shop/products/55667788",
    hashtags: ["#프로틴바", "#단백질바", "#다이어트간식"],
    applicants: [],
    postUrls: [
      { name: "윤헬스",    url: "https://blog.naver.com/health1/223101112233", writtenAt: "2026-06-13" },
      { name: "임다이어트", url: "https://blog.naver.com/diet1/223101223344",  writtenAt: "2026-06-14" },
    ],
  },
  {
    id: "se2",
    campaignName: "수면 영양제 체험 리뷰",
    keyword: "수면영양제추천",
    totalCount: 12, doneCount: 0, status: "pending",
    startDate: "2026-07-01", endDate: "2026-07-20", amount: 18000,
    type: "블로그리뷰(체험단)",
    postingUrl: "https://smartstore.naver.com/shop/products/99887766",
    hashtags: ["#수면영양제", "#멜라토닌", "#숙면"],
    applicants: [],
    postUrls: [],
  },
  {
    id: "se3",
    campaignName: "탈모 샴푸 체험단",
    keyword: "탈모샴푸추천",
    totalCount: 25, doneCount: 10, status: "paused",
    startDate: "2026-06-08", endDate: "2026-06-28", amount: 37500,
    type: "블로그리뷰(체험단)",
    postingUrl: "https://smartstore.naver.com/shop/products/33445566",
    hashtags: ["#탈모샴푸", "#두피케어", "#샴푸추천"],
    applicants: [],
    postUrls: [
      { name: "정두피", url: "https://blog.naver.com/scalp2/223061112233", writtenAt: "2026-06-09" },
    ],
  },
  {
    id: "se4",
    campaignName: "유아 놀이매트 체험단",
    keyword: "놀이매트추천",
    totalCount: 8, doneCount: 8, status: "done",
    startDate: "2026-05-10", endDate: "2026-05-31", amount: 12000,
    type: "블로그리뷰(체험단)",
    postingUrl: "https://smartstore.naver.com/shop/products/77889900",
    hashtags: ["#놀이매트", "#유아매트", "#아기용품"],
    applicants: [],
    postUrls: [
      { name: "송맘",  url: "https://blog.naver.com/mom1/222501112233",  writtenAt: "2026-05-11" },
      { name: "유육아", url: "https://blog.naver.com/baby1/222501223344", writtenAt: "2026-05-12" },
    ],
  },
];

export default function ShoppingReviewExperienceManagePage() {
  return (
    <ReviewManageTable
      campaigns={CAMPAIGNS}
      breadcrumbLabel="블로그리뷰(체험단)"
      breadcrumbPlatform="네이버 쇼핑"
      createHref="/marketing/review/shopping/blog-experience"
      tabs={TABS}
      showApplicants={false}
      showPostUrls={true}
    />
  );
}
