"use client";

import ReviewManageTable, { Campaign } from "@/components/marketing/ReviewManageTable";

const CAMPAIGNS: Campaign[] = [
  {
    id: "rv1", campaignName: "청담 파인다이닝", keyword: "청담 파인다이닝",
    totalCount: 5, doneCount: 2, status: "running",
    startDate: "2026-06-18", endDate: "2026-07-01", amount: 5000,
    type: "예약자리뷰", postingUrl: "https://place.naver.com/restaurant/44556677",
    hashtags: ["#청담파인다이닝", "#청담레스토랑", "#파인다이닝"],
    applicants: [
      { name: "채다이닝",  blogUrl: "https://blog.naver.com/dining1", submittedAt: "2026-06-19", reviewStatus: "승인" },
      { name: "엄예약",    blogUrl: "https://blog.naver.com/dining2", submittedAt: "2026-06-20", reviewStatus: "검토중" },
    ],
  },
  {
    id: "rv2", campaignName: "용산 이자카야", keyword: "용산 이자카야",
    totalCount: 12, doneCount: 12, status: "done",
    startDate: "2026-05-15", endDate: "2026-06-15", amount: 12000,
    type: "예약자리뷰", postingUrl: "https://place.naver.com/restaurant/88990011",
    hashtags: ["#용산이자카야", "#일본술집", "#용산맛집"],
    applicants: [
      { name: "변이자",    blogUrl: "https://blog.naver.com/izak1", submittedAt: "2026-05-16", reviewStatus: "승인" },
    ],
  },
  {
    id: "rv3", campaignName: "마포 퓨전 레스토랑", keyword: "마포 레스토랑",
    totalCount: 8, doneCount: 0, status: "pending",
    startDate: "2026-06-28", endDate: "2026-07-15", amount: 8000,
    type: "예약자리뷰", postingUrl: "https://place.naver.com/restaurant/55443322",
    hashtags: ["#마포레스토랑", "#퓨전", "#마포맛집"],
    applicants: [],
  },
];

export default function ReservationManagePage() {
  return (
    <ReviewManageTable
      campaigns={CAMPAIGNS}
      breadcrumbLabel="예약자리뷰"
      createHref="/marketing/review/place/reservation"
      showApplicants={false}
    />
  );
}
