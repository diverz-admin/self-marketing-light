"use client";

import ReviewManageTable, { Campaign } from "@/components/marketing/ReviewManageTable";

const CAMPAIGNS: Campaign[] = [
  {
    id: "rc1", campaignName: "대박갈비 일산동구청점", keyword: "일산 갈비맛집",
    totalCount: 30, doneCount: 18, status: "running",
    startDate: "2026-06-14", endDate: "2026-06-30", amount: 45000,
    type: "스탠다드", postingUrl: "https://place.naver.com/restaurant/12345678",
    hashtags: ["#일산맛집", "#갈비", "#영수증리뷰"],
    applicants: [],
  },
  {
    id: "rc2", campaignName: "성수 감성 브런치", keyword: "성수 브런치",
    totalCount: 20, doneCount: 0, status: "pending",
    startDate: "2026-06-24", endDate: "2026-07-08", amount: 30000,
    type: "프리미엄", postingUrl: "https://place.naver.com/restaurant/23456789",
    hashtags: ["#성수브런치", "#성수맛집", "#영수증인증"],
    applicants: [],
  },
  {
    id: "rc3", campaignName: "부산 밀면 본점", keyword: "부산 밀면",
    totalCount: 40, doneCount: 26, status: "running",
    startDate: "2026-06-05", endDate: "2026-06-28", amount: 60000,
    type: "베이직", postingUrl: "https://place.naver.com/restaurant/34567890",
    hashtags: ["#부산맛집", "#밀면", "#실구매리뷰"],
    applicants: [],
  },
  {
    id: "rc4", campaignName: "홍대 브런치카페", keyword: "홍대 브런치",
    totalCount: 25, doneCount: 25, status: "done",
    startDate: "2026-05-01", endDate: "2026-05-31", amount: 37500,
    type: "스탠다드", postingUrl: "https://place.naver.com/cafe/11223344",
    hashtags: ["#홍대카페", "#브런치", "#영수증리뷰"],
    applicants: [],
  },
];

export default function ReceiptManagePage() {
  return (
    <ReviewManageTable
      campaigns={CAMPAIGNS}
      breadcrumbLabel="영수증리뷰"
      createHref="/marketing/review/place/receipt"
      showApplicants={false}
    />
  );
}
