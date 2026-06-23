"use client";

import ReviewManageTable, { Campaign } from "@/components/marketing/ReviewManageTable";

const TABS = [
  { label: "블로그리뷰(기자단)", href: "/marketing/review/shopping/manage" },
  { label: "블로그리뷰(체험단)", href: "/marketing/review/shopping/manage/blog-experience" },
  { label: "상품 체험단",         href: "/marketing/review/shopping/manage/product-experience" },
];

const CAMPAIGNS: Campaign[] = [
  {
    id: "pe1",
    campaignName: "콜라겐 크림 체험단",
    keyword: "콜라겐크림추천",
    totalCount: 30, doneCount: 18, status: "running",
    startDate: "2026-06-10", endDate: "2026-07-05", amount: 45000,
    type: "상품 체험단",
    productType: "제품제공",
    postingUrl: "https://smartstore.naver.com/shop/products/33445566",
    hashtags: ["#콜라겐크림", "#안티에이징", "#스킨케어"],
    applicants: [
      { name: "김피부",   blogUrl: "https://blog.naver.com/skin10",  submittedAt: "2026-06-11", reviewStatus: "승인"    },
      { name: "이미용",   blogUrl: "https://blog.naver.com/beauty10", submittedAt: "2026-06-12", reviewStatus: "검토중"  },
      { name: "박뷰티",   blogUrl: "https://blog.naver.com/beauty11", submittedAt: "2026-06-14", reviewStatus: "제출완료" },
    ],
  },
  {
    id: "pe2",
    campaignName: "유아 이유식 체험단",
    keyword: "이유식추천",
    totalCount: 20, doneCount: 0, status: "pending",
    startDate: "2026-07-01", endDate: "2026-07-20", amount: 30000,
    type: "상품 체험단",
    productType: "제품미제공",
    postingUrl: "https://smartstore.naver.com/shop/products/77889900",
    hashtags: ["#이유식", "#유아식품", "#아기이유식"],
    applicants: [],
  },
  {
    id: "pe3",
    campaignName: "홈트레이닝 밴드 체험단",
    keyword: "저항밴드추천",
    totalCount: 15, doneCount: 5, status: "paused",
    startDate: "2026-06-05", endDate: "2026-06-25", amount: 22500,
    type: "상품 체험단",
    productType: "제품제공",
    postingUrl: "https://smartstore.naver.com/shop/products/44556677",
    hashtags: ["#저항밴드", "#홈트레이닝", "#운동용품"],
    applicants: [
      { name: "정헬스",   blogUrl: "https://blog.naver.com/health10", submittedAt: "2026-06-06", reviewStatus: "승인" },
    ],
  },
  {
    id: "pe4",
    campaignName: "반려동물 간식 체험단",
    keyword: "강아지간식추천",
    totalCount: 25, doneCount: 25, status: "done",
    startDate: "2026-05-01", endDate: "2026-05-28", amount: 37500,
    type: "상품 체험단",
    productType: "제품미제공",
    postingUrl: "https://smartstore.naver.com/shop/products/99001122",
    hashtags: ["#강아지간식", "#반려동물용품", "#펫푸드"],
    applicants: [
      { name: "윤펫",     blogUrl: "https://blog.naver.com/pet1",    submittedAt: "2026-05-02", reviewStatus: "승인" },
      { name: "강댕댕",   blogUrl: "https://blog.naver.com/dog1",    submittedAt: "2026-05-03", reviewStatus: "승인" },
    ],
  },
];

export default function ProductExperienceManagePage() {
  return (
    <ReviewManageTable
      campaigns={CAMPAIGNS}
      breadcrumbLabel="상품 체험단"
      breadcrumbPlatform="네이버 쇼핑"
      createHref="/marketing/review/shopping/product-experience"
      tabs={TABS}
      showApplicants={false}
    />
  );
}
