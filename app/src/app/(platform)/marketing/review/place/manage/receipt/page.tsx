"use client";

import ReviewManageTable, { Campaign } from "@/components/marketing/ReviewManageTable";
import PageHeader from "@/components/marketing/PageHeader";

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
    <div className="w-full space-y-5">
      <PageHeader
        title="네이버 플레이스 리뷰 관리"
        subtitle="신청한 리뷰 캠페인을 확인하고 관리하세요."
        iconPath="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
      <ReviewManageTable
        campaigns={CAMPAIGNS}
        breadcrumbLabel="영수증리뷰"
        createHref="/marketing/review/place/receipt"
        showApplicants={false}
      />
    </div>
  );
}
