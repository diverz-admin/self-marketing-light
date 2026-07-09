"use client";

import ReviewManageTable, { Campaign } from "@/components/marketing/ReviewManageTable";
import PageHeader from "@/components/marketing/PageHeader";

const CAMPAIGNS: Campaign[] = [
  {
    id: "e1", campaignName: "판교 한식뷔페", keyword: "판교 뷔페",
    totalCount: 15, doneCount: 9, status: "running",
    startDate: "2026-06-10", endDate: "2026-06-25", amount: 30000,
    type: "스탠다드", postingUrl: "https://place.naver.com/restaurant/55667788",
    hashtags: ["#판교뷔페", "#한식", "#판교맛집"],
    applicants: [],
    postUrls: [
      { name: "윤체험", url: "https://blog.naver.com/exp1/223061100011", writtenAt: "2026-06-11" },
      { name: "임리뷰", url: "https://blog.naver.com/exp2/223061200022", writtenAt: "2026-06-12" },
    ],
  },
  {
    id: "e2", campaignName: "이태원 타코맛집", keyword: "이태원 타코",
    totalCount: 8, doneCount: 3, status: "paused",
    startDate: "2026-06-08", endDate: "2026-06-22", amount: 16000,
    type: "베이직", postingUrl: "https://place.naver.com/restaurant/99887766",
    hashtags: ["#이태원타코", "#멕시칸", "#이태원맛집"],
    applicants: [],
    postUrls: [
      { name: "조타코", url: "https://blog.naver.com/taco1/223060900033", writtenAt: "2026-06-09" },
    ],
  },
  {
    id: "e3", campaignName: "건대 디저트 카페", keyword: "건대 카페",
    totalCount: 12, doneCount: 12, status: "done",
    startDate: "2026-05-05", endDate: "2026-05-25", amount: 24000,
    type: "프리미엄", postingUrl: "https://place.naver.com/cafe/22334455",
    hashtags: ["#건대카페", "#디저트", "#건대맛집"],
    applicants: [],
    postUrls: [
      { name: "서카페", url: "https://blog.naver.com/cafe10/222505100044", writtenAt: "2026-05-06" },
      { name: "문리뷰", url: "https://blog.naver.com/cafe11/222505200055", writtenAt: "2026-05-07" },
    ],
  },
];

export default function BlogExperienceManagePage() {
  return (
    <div className="w-full space-y-5">
      <PageHeader
        title="네이버 플레이스 리뷰 관리"
        subtitle="신청한 리뷰 캠페인을 확인하고 관리하세요."
        iconPath="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
      <ReviewManageTable
        campaigns={CAMPAIGNS}
        breadcrumbLabel="블로그리뷰(체험단)"
        createHref="/marketing/review/place/blog-experience"
        showApplicants={false}
        showPostUrls={true}
      />
    </div>
  );
}
