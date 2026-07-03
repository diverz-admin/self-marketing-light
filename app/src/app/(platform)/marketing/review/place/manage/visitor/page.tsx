"use client";

import ReviewManageTable, { Campaign } from "@/components/marketing/ReviewManageTable";

const CAMPAIGNS: Campaign[] = [
  {
    id: "v1", campaignName: "성수 카페 힐링", keyword: "성수동 카페",
    totalCount: 30, doneCount: 18, status: "running",
    startDate: "2026-06-12", endDate: "2026-07-12", amount: 30000,
    type: "방문자리뷰", postingUrl: "https://place.naver.com/cafe/33445566",
    hashtags: ["#성수카페", "#힐링카페", "#성수동"],
    applicants: [
      { name: "송카페",    blogUrl: "https://blog.naver.com/cafe1", submittedAt: "2026-06-13", reviewStatus: "승인" },
      { name: "유힐링",    blogUrl: "https://blog.naver.com/cafe2", submittedAt: "2026-06-14", reviewStatus: "검토중" },
      { name: "노성수",    blogUrl: "https://blog.naver.com/cafe3", submittedAt: "2026-06-15", reviewStatus: "제출완료" },
    ],
  },
  {
    id: "v2", campaignName: "잠실 디저트 가게", keyword: "잠실 디저트",
    totalCount: 10, doneCount: 0, status: "pending",
    startDate: "2026-06-25", endDate: "2026-07-10", amount: 10000,
    type: "방문자리뷰", postingUrl: "https://place.naver.com/bakery/77889900",
    hashtags: ["#잠실디저트", "#디저트", "#잠실맛집"],
    applicants: [],
  },
  {
    id: "v3", campaignName: "여의도 점심 한식당", keyword: "여의도 한식",
    totalCount: 25, doneCount: 25, status: "done",
    startDate: "2026-05-10", endDate: "2026-06-10", amount: 25000,
    type: "방문자리뷰", postingUrl: "https://place.naver.com/restaurant/11223366",
    hashtags: ["#여의도한식", "#직장인점심", "#여의도맛집"],
    applicants: [
      { name: "권한식",    blogUrl: "https://blog.naver.com/food1", submittedAt: "2026-05-11", reviewStatus: "승인" },
      { name: "황점심",    blogUrl: "https://blog.naver.com/food2", submittedAt: "2026-05-12", reviewStatus: "승인" },
    ],
  },
];

export default function VisitorManagePage() {
  return (
    <ReviewManageTable
      campaigns={CAMPAIGNS}
      breadcrumbLabel="방문자리뷰"
      createHref="/marketing/review/place/visitor"
      showApplicants={false}
    />
  );
}
