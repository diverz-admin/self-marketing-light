"use client";

import ReviewManageTable, { Campaign } from "@/components/marketing/ReviewManageTable";

const CAMPAIGNS: Campaign[] = [
  {
    id: "r1", campaignName: "대박갈비 일산동구청점", keyword: "일산 갈비맛집",
    totalCount: 10, doneCount: 6, status: "running",
    startDate: "2026-06-15", endDate: "2026-06-30", amount: 15000,
    type: "스탠다드", postingUrl: "https://place.naver.com/restaurant/12345678",
    hashtags: ["#일산맛집", "#갈비", "#동구청맛집"],
    applicants: [],
    postUrls: [
      { name: "김블로거", url: "https://blog.naver.com/blogger1/223061100001", writtenAt: "2026-06-16" },
      { name: "이리뷰어", url: "https://blog.naver.com/blogger2/223061200002", writtenAt: "2026-06-17" },
      { name: "박작가",   url: "https://blog.naver.com/blogger3/223061300003", writtenAt: "2026-06-18" },
    ],
  },
  {
    id: "r2", campaignName: "스시오마카세 강남점", keyword: "강남 오마카세",
    totalCount: 5, doneCount: 0, status: "pending",
    startDate: "2026-06-22", endDate: "2026-07-05", amount: 10000,
    type: "프리미엄", postingUrl: "https://place.naver.com/restaurant/87654321",
    hashtags: ["#강남오마카세", "#스시", "#강남맛집"],
    applicants: [],
    postUrls: [],
  },
  {
    id: "r3", campaignName: "홍대 브런치카페", keyword: "홍대 브런치",
    totalCount: 20, doneCount: 20, status: "done",
    startDate: "2026-05-01", endDate: "2026-05-31", amount: 46000,
    type: "베이직", postingUrl: "https://place.naver.com/cafe/11223344",
    hashtags: ["#홍대카페", "#브런치", "#홍대맛집"],
    applicants: [],
    postUrls: [
      { name: "정푸디", url: "https://blog.naver.com/foodie1/222501100001", writtenAt: "2026-05-03" },
      { name: "한리뷰", url: "https://blog.naver.com/foodie2/222501200002", writtenAt: "2026-05-04" },
      { name: "강카페", url: "https://blog.naver.com/foodie3/222501300003", writtenAt: "2026-05-05" },
    ],
  },
];

export default function BlogReporterManagePage() {
  return (
    <ReviewManageTable
      campaigns={CAMPAIGNS}
      breadcrumbLabel="블로그리뷰(기자단)"
      createHref="/marketing/review/place/blog-reporter"
      showApplicants={false}
      showPostUrls={true}
    />
  );
}
