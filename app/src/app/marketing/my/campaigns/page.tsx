"use client";

import Link from "next/link";
import { Fragment, useState } from "react";

type RankPoint = { date: string; rank: number };

type ReviewItem = {
  author: string;
  channel: string;
  status: "발행완료" | "작성중" | "선정";
  date: string;
  excerpt: string;
};
type ReviewDetail = {
  applicants: number;
  selected: number;
  published: number;
  reviews: ReviewItem[];
};

type Campaign = {
  id: string;
  platform: "네이버 플레이스" | "네이버 쇼핑" | "쿠팡";
  category: "리워드" | "리뷰";
  subType: string;
  campaignName: string;
  keyword: string;
  totalCount: number;
  doneCount: number;
  startDate: string;
  endDate: string;
  status: "running" | "pending" | "paused" | "done";
  manageHref: string;
  rank?: number;
  rankChange?: number;
  rankHistory?: RankPoint[];
  reviewDetail?: ReviewDetail;
};

const CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    platform: "네이버 플레이스",
    category: "리워드",
    subType: "방문 리워드",
    campaignName: "홍대 카페 방문 이벤트",
    keyword: "홍대카페",
    totalCount: 50, doneCount: 34,
    startDate: "2026-06-01", endDate: "2026-06-30",
    status: "running",
    manageHref: "/marketing/reward/place/manage",
    rank: 5, rankChange: 3,
    rankHistory: [
      { date: "6/01", rank: 18 }, { date: "6/03", rank: 15 },
      { date: "6/07", rank: 12 }, { date: "6/10", rank: 9 },
      { date: "6/13", rank: 7 },  { date: "6/16", rank: 6 },
      { date: "6/19", rank: 5 },
    ],
  },
  {
    id: "2",
    platform: "네이버 쇼핑",
    category: "리워드",
    subType: "구매 리워드",
    campaignName: "여름 신상 구매 리워드",
    keyword: "여름원피스추천",
    totalCount: 100, doneCount: 62,
    startDate: "2026-06-05", endDate: "2026-07-05",
    status: "running",
    manageHref: "/marketing/reward/shopping/manage",
    rank: 12, rankChange: -2,
    rankHistory: [
      { date: "6/05", rank: 8 },  { date: "6/07", rank: 9 },
      { date: "6/09", rank: 11 }, { date: "6/12", rank: 10 },
      { date: "6/14", rank: 13 }, { date: "6/17", rank: 14 },
      { date: "6/19", rank: 12 },
    ],
  },
  {
    id: "3",
    platform: "쿠팡",
    category: "리워드",
    subType: "구매 리워드",
    campaignName: "프로틴 파우더 구매 리워드",
    keyword: "단백질보충제추천",
    totalCount: 30, doneCount: 10,
    startDate: "2026-06-10", endDate: "2026-07-10",
    status: "paused",
    manageHref: "/marketing/reward/coupang/manage",
    rank: 8, rankChange: 0,
    rankHistory: [
      { date: "6/10", rank: 14 }, { date: "6/12", rank: 12 },
      { date: "6/14", rank: 10 }, { date: "6/16", rank: 9 },
      { date: "6/18", rank: 8 },  { date: "6/20", rank: 8 },
      { date: "6/22", rank: 8 },
    ],
  },
  {
    id: "4",
    platform: "네이버 플레이스",
    category: "리뷰",
    subType: "블로그리뷰(기자단)",
    campaignName: "강남 맛집 기자단 모집",
    keyword: "강남맛집추천",
    totalCount: 20, doneCount: 15,
    startDate: "2026-06-03", endDate: "2026-06-25",
    status: "running",
    manageHref: "/marketing/review/place/manage",
    reviewDetail: {
      applicants: 47, selected: 20, published: 15,
      reviews: [
        { author: "미식가J", channel: "네이버 블로그", status: "발행완료", date: "2026-06-18", excerpt: "강남에서 이런 분위기 좋은 맛집을 찾다니… 시그니처 메뉴는 꼭 드셔보세요. 재방문 의사 100%입니다." },
        { author: "맛집헌터 소라", channel: "네이버 블로그", status: "발행완료", date: "2026-06-15", excerpt: "웨이팅 있을 만한 이유가 있네요. 플레이팅도 예쁘고 직원분들도 친절하셨어요." },
        { author: "푸디라이프", channel: "네이버 블로그", status: "작성중", date: "-", excerpt: "방문 완료, 포스팅 작성 중입니다." },
      ],
    },
  },
  {
    id: "5",
    platform: "네이버 쇼핑",
    category: "리뷰",
    subType: "상품 체험단",
    campaignName: "콜라겐 크림 체험단",
    keyword: "콜라겐크림추천",
    totalCount: 30, doneCount: 18,
    startDate: "2026-06-10", endDate: "2026-07-05",
    status: "running",
    manageHref: "/marketing/review/shopping/manage/product-experience",
    reviewDetail: {
      applicants: 128, selected: 30, published: 18,
      reviews: [
        { author: "뷰티리뷰어 하늘", channel: "네이버 블로그", status: "발행완료", date: "2026-06-20", excerpt: "발림성이 정말 좋고 흡수도 빨라요. 2주 써보니 피부결이 확실히 매끈해진 느낌입니다." },
        { author: "코덕코덕", channel: "인스타그램", status: "발행완료", date: "2026-06-19", excerpt: "촉촉함이 오래가서 만족스러워요. 향도 은은해서 데일리로 쓰기 좋습니다. 재구매 의사 있어요." },
        { author: "슬로우뷰티", channel: "네이버 블로그", status: "선정", date: "-", excerpt: "선정 완료, 상품 배송 대기 중입니다." },
      ],
    },
  },
  {
    id: "6",
    platform: "쿠팡",
    category: "리뷰",
    subType: "상품 체험단",
    campaignName: "쿠팡 건강기능식품 체험단",
    keyword: "건강기능식품추천",
    totalCount: 30, doneCount: 0,
    startDate: "2026-07-01", endDate: "2026-07-30",
    status: "pending",
    manageHref: "/marketing/review/shopping/manage/product-experience",
    reviewDetail: {
      applicants: 0, selected: 0, published: 0,
      reviews: [],
    },
  },
  {
    id: "7",
    platform: "네이버 플레이스",
    category: "리워드",
    subType: "방문 리워드",
    campaignName: "성수 디저트 카페 방문 이벤트",
    keyword: "성수동카페",
    totalCount: 40, doneCount: 40,
    startDate: "2026-05-01", endDate: "2026-05-30",
    status: "done",
    manageHref: "/marketing/reward/place/manage",
    rank: 2, rankChange: 4,
    rankHistory: [
      { date: "5/01", rank: 16 }, { date: "5/05", rank: 12 },
      { date: "5/10", rank: 9 },  { date: "5/14", rank: 6 },
      { date: "5/19", rank: 4 },  { date: "5/24", rank: 3 },
      { date: "5/30", rank: 2 },
    ],
  },
  {
    id: "8",
    platform: "네이버 쇼핑",
    category: "리뷰",
    subType: "상품 체험단",
    campaignName: "봄 신상 원피스 체험단",
    keyword: "봄원피스추천",
    totalCount: 25, doneCount: 25,
    startDate: "2026-05-08", endDate: "2026-06-05",
    status: "done",
    manageHref: "/marketing/review/shopping/manage/product-experience",
    reviewDetail: {
      applicants: 42, selected: 25, published: 25,
      reviews: [
        { author: "데일리룩지현", channel: "네이버 블로그", status: "발행완료", date: "2026-06-01", excerpt: "핏이 정말 예쁘고 소재도 좋아요. 봄에 데일리로 입기 딱입니다. 색감도 화면 그대로예요." },
        { author: "코디의정석",   channel: "인스타그램",   status: "발행완료", date: "2026-05-30", excerpt: "허리 라인이 잘 잡혀서 스타일리시해요. 재구매 의사 있습니다!" },
      ],
    },
  },
];

const STATUS_CONFIG = {
  running: { label: "진행중",   bg: "bg-green-50",  text: "text-green-600" },
  pending: { label: "대기중",   bg: "bg-amber-50",  text: "text-amber-600" },
  paused:  { label: "일시정지", bg: "bg-gray-100",  text: "text-gray-500"  },
  done:    { label: "완료",     bg: "bg-blue-50",   text: "text-blue-500"  },
};
const PLATFORM_CONFIG = {
  "네이버 플레이스": { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-100",  line: "#10B981" },
  "네이버 쇼핑":     { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-100",   line: "#3B82F6" },
  "쿠팡":           { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-100", line: "#F97316" },
};
const CATEGORY_CONFIG = {
  "리워드": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-100" },
  "리뷰":   { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100" },
};
const REVIEW_STATUS_CONFIG: Record<ReviewItem["status"], { bg: string; text: string }> = {
  "발행완료": { bg: "bg-green-50", text: "text-green-600" },
  "작성중":   { bg: "bg-amber-50", text: "text-amber-600" },
  "선정":     { bg: "bg-blue-50",  text: "text-blue-600"  },
};

const FILTER_TABS = ["전체", "리워드", "리뷰"] as const;
type FilterTab = typeof FILTER_TABS[number];

const PLATFORM_TABS = ["전체", "네이버 플레이스", "네이버 쇼핑", "쿠팡"] as const;
type PlatformTab = typeof PLATFORM_TABS[number];

const STATUS_TABS = ["전체", "진행중", "대기중", "완료"] as const;
type StatusTab = typeof STATUS_TABS[number];
const STATUS_MAP: Record<Exclude<StatusTab, "전체">, Campaign["status"]> = {
  "진행중": "running", "대기중": "pending", "완료": "done",
};

/* ── 순위 미니 차트 (Y축 반전: 숫자 작을수록 위) ── */
/* ── 순위 추이 상세 (좌: 요약 / 우: 기간탭 + 날짜별 순위 + 큰 차트) ── */
function RankTrendDetail({ title, keyword, history }: { title: string; keyword: string; history: RankPoint[] }) {
  const [period, setPeriod] = useState<"7일" | "30일" | "전체">("7일");
  const sliceN = period === "7일" ? 7 : period === "30일" ? 30 : history.length;
  const data = history.slice(-sliceN);
  const n = data.length;

  const firstRank = data[0].rank;
  const currentRank = data[n - 1].rank;
  const diff = firstRank - currentRank; // + 상승

  const NAVY = "#0D3473";
  const W = 900, H = 320, pL = 44, pR = 20;
  const cT = 84, cB = 292;                    // 차트 플롯 영역(세로)
  const cH = cB - cT, iW = W - pL - pR;
  const ranks = data.map((d) => d.rank);
  const yMax = Math.max(10, ...ranks);
  const step = n > 1 ? iW / (n - 1) : 0;
  const x = (i: number) => pL + i * step;
  const yv = (r: number) => cT + ((r - 1) / (yMax - 1)) * cH;
  const pts = data.map((d, i) => ({ x: x(i), y: yv(d.rank), ...d }));
  const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${pts[0].x},${cB} ${line} ${pts[n - 1].x},${cB}`;
  const yTicks = [0, 1, 2, 3].map((k) => {
    const f = k / 3;
    return { y: cT + f * cH, label: Math.round(1 + f * (yMax - 1)) };
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* 좌측 요약 */}
      <div className="lg:w-52 shrink-0 flex flex-col justify-between gap-8">
        <div>
          <p className="text-[16px] font-extrabold text-brand-dark leading-snug">{title}</p>
          <div className="flex items-center gap-1 mt-1.5 text-[13px] text-brand-muted">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" /></svg>
            <span className="truncate">{keyword}</span>
          </div>
        </div>
        <div>
          <div className="flex items-end gap-3">
            <div>
              <p className="text-[12px] text-brand-muted mb-1">최초 순위</p>
              <p className="text-[22px] font-extrabold text-brand-muted leading-none">{firstRank}<span className="text-[12px] font-bold ml-0.5">위</span></p>
            </div>
            <svg className="w-4 h-4 text-brand-muted mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            <div>
              <p className="text-[12px] text-brand-muted mb-1">현재 순위</p>
              <p className="text-[28px] font-extrabold leading-none" style={{ color: NAVY }}>{currentRank}<span className="text-[13px] font-bold ml-0.5">위</span></p>
            </div>
          </div>
          {diff !== 0 && (
            <p className={`mt-2 text-[13px] font-bold ${diff > 0 ? "text-[#2E6BE0]" : "text-red-500"}`}>
              {diff > 0 ? "↑" : "↓"} {Math.abs(diff)}단계
            </p>
          )}
        </div>
      </div>

      {/* 우측 차트 */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-end gap-1 mb-3">
          {(["7일", "30일", "전체"] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg text-[13px] font-bold transition-all ${period === p ? "bg-brand-dark text-white" : "bg-brand-lighter text-brand-sub hover:bg-brand-border"}`}>
              {p}
            </button>
          ))}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <defs>
            <linearGradient id="rankTrendArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={NAVY} stopOpacity="0.13" />
              <stop offset="100%" stopColor={NAVY} stopOpacity="0.01" />
            </linearGradient>
          </defs>
          {/* 날짜·순위 헤더 밴드 */}
          <rect x={pL - 14} y={6} width={iW + 28} height={48} rx={10} fill="#F5F6F8" />
          {data.map((d, i) => (
            <g key={i}>
              <text x={x(i)} y={27} textAnchor="middle" fontSize={13} fill="#8A94A6">{d.date}</text>
              <text x={x(i)} y={47} textAnchor="middle" fontSize={16} fontWeight={800} fill="#111D37">{d.rank}위</text>
            </g>
          ))}
          {/* Y 격자선 + 레이블 */}
          {yTicks.map((t, i) => (
            <g key={i}>
              <line x1={pL} y1={t.y} x2={W - pR} y2={t.y} stroke="#EEF1F6" strokeWidth={1} />
              <text x={pL - 10} y={t.y + 4} textAnchor="end" fontSize={12} fill="#B0B7C3">{t.label}위</text>
            </g>
          ))}
          <polygon points={area} fill="url(#rankTrendArea)" />
          <polyline points={line} fill="none" stroke={NAVY} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={5} fill="white" stroke={NAVY} strokeWidth={2.5} />
          ))}
          {/* 하단 날짜 축 */}
          {data.map((d, i) => (
            <text key={`bd${i}`} x={x(i)} y={H - 6} textAnchor="middle" fontSize={11} fill="#C4C9D4">{d.date}</text>
          ))}
        </svg>
      </div>
    </div>
  );
}

export default function MyCampaignsPage() {
  const [tab, setTab] = useState<FilterTab>("전체");
  const [platformTab, setPlatformTab] = useState<PlatformTab>("전체");
  const [statusTab, setStatusTab] = useState<StatusTab>("전체");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = CAMPAIGNS.filter((c) =>
    (platformTab === "전체" || c.platform === platformTab) &&
    (tab === "전체" || c.category === tab) &&
    (statusTab === "전체" || c.status === STATUS_MAP[statusTab])
  );
  const runningReward = CAMPAIGNS.filter((c) => c.category === "리워드" && c.status === "running").length;
  const runningReview = CAMPAIGNS.filter((c) => c.category === "리뷰"   && c.status === "running").length;
  const doneReward    = CAMPAIGNS.filter((c) => c.category === "리워드" && c.status === "done").length;
  const doneReview    = CAMPAIGNS.filter((c) => c.category === "리뷰"   && c.status === "done").length;
  const totalRunning  = CAMPAIGNS.filter((c) => c.status === "running").length;
  const totalDone     = CAMPAIGNS.filter((c) => c.status === "done").length;
  const totalReward   = CAMPAIGNS.filter((c) => c.category === "리워드").length;
  const totalReview   = CAMPAIGNS.filter((c) => c.category === "리뷰").length;

  // 우리가 제공하는 전체 서비스 그룹 현황 (리워드·리뷰는 실데이터, 광고·바이럴은 운영 현황)
  const SERVICE_GROUPS = [
    { name: "리워드 마케팅",   desc: "플레이스·쇼핑·쿠팡 상위노출",   running: runningReward, done: doneReward, total: totalReward, href: "/marketing/reward/place/manage",
      grad: "linear-gradient(135deg,#1B3160,#2E6BE0)",
      icon: "M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" },
    { name: "리뷰 마케팅",     desc: "블로그·체험단·영수증 리뷰",     running: runningReview, done: doneReview, total: totalReview, href: "/marketing/review/place/manage",
      grad: "linear-gradient(135deg,#2E6BE0,#1D4ED8)",
      icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" },
    { name: "퍼포먼스 광고",   desc: "네이버 SA·메타 광고 운영",      running: 2, done: 5, total: 8, href: "/marketing/ads/naver-cpc",
      grad: "linear-gradient(135deg,#0D3473,#0D2148)",
      icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" },
    { name: "바이럴·커뮤니티", desc: "네이버 카페 침투 마케팅",        running: 1, done: 2, total: 3, href: "/marketing/community/cafe",
      grad: "linear-gradient(135deg,#3B6FE0,#2E6BE0)",
      icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" },
  ];

  return (
    <div className="w-full space-y-5">

      {/* 브레드크럼 */}
      <nav className="flex items-center gap-1.5 text-[15px] text-brand-sub">
        <Link href="/marketing" className="hover:text-brand-text">대시보드</Link>
        <span>›</span>
        <span className="text-brand-text font-medium">마이 캠페인 현황</span>
      </nav>

      {/* 타이틀 */}
      <div>
        <h1 className="text-[25px] font-extrabold text-brand-dark">마이 캠페인 현황</h1>
        <p className="text-[15px] text-brand-sub mt-0.5">리워드, 리뷰, 광고, 바이럴 등 이용 중인 모든 서비스를 한눈에 확인하세요.</p>
      </div>

      {/* 서비스별 현황 */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-[17px] font-extrabold text-brand-dark">서비스별 현황</h2>
          <span className="text-[13px] text-brand-sub">진행중 <strong className="text-brand-dark font-extrabold">{totalRunning + 3}</strong> · 완료 <strong className="text-brand-dark font-extrabold">{totalDone + 7}</strong></span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SERVICE_GROUPS.map((s) => (
            <Link key={s.name} href={s.href}
              className="group bg-white rounded-2xl border border-brand-border p-5 transition-all hover:border-[#2E6BE0]/40 hover:shadow-[0_10px_28px_rgba(13,52,115,0.10)] hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-4">
                <span className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.grad }}>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                  </svg>
                </span>
                <svg className="w-4 h-4 text-brand-muted transition-all group-hover:text-[#2E6BE0] group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
              <p className="text-[15px] font-extrabold text-brand-dark leading-tight">{s.name}</p>
              <p className="text-[12px] text-brand-muted mt-0.5 mb-4 truncate">{s.desc}</p>
              <div className="flex items-stretch gap-3">
                <div className="flex-1">
                  <p className="text-[24px] font-extrabold text-brand-dark leading-none tabular-nums">{s.running}</p>
                  <p className="text-[11px] text-brand-muted mt-1.5">진행중</p>
                </div>
                <div className="w-px bg-brand-border" />
                <div className="flex-1">
                  <p className="text-[24px] font-extrabold leading-none tabular-nums" style={{ color: "#2E6BE0" }}>{s.done}</p>
                  <p className="text-[11px] text-brand-muted mt-1.5">완료</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 캠페인 상세 */}
      <div className="flex items-baseline justify-between pt-1">
        <h2 className="text-[17px] font-extrabold text-brand-dark">캠페인 상세</h2>
        <span className="text-[13px] text-brand-muted">진행중·완료 등 상태별로 리워드·리뷰 캠페인을 확인하세요.</span>
      </div>

      {/* 캠페인 테이블 */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">

        {/* 필터 (플랫폼 / 유형 / 상태) */}
        <div className="px-5 py-4 border-b border-brand-border space-y-2.5">
          {/* 플랫폼 */}
          <div className="flex items-center flex-wrap gap-1.5 gap-y-2">
            <span className="text-[12px] font-bold text-brand-muted w-[52px] shrink-0">플랫폼</span>
            {PLATFORM_TABS.map((p) => {
              const active = platformTab === p;
              return (
                <button key={p} onClick={() => { setPlatformTab(p); setExpandedId(null); }}
                  className={`px-3.5 py-1.5 rounded-xl text-[13px] font-bold transition-all ${
                    active ? "bg-brand-dark text-white" : "bg-brand-lighter text-brand-sub hover:bg-brand-border"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
          {/* 유형 */}
          <div className="flex items-center flex-wrap gap-1.5 gap-y-2">
            <span className="text-[12px] font-bold text-brand-muted w-[52px] shrink-0">유형</span>
            {FILTER_TABS.map((t) => (
              <button key={t} onClick={() => { setTab(t); setExpandedId(null); }}
                className={`px-3.5 py-1.5 rounded-xl text-[13px] font-bold transition-all ${
                  tab === t ? "bg-brand-primary text-white" : "bg-brand-lighter text-brand-sub hover:bg-brand-border"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {/* 상태 */}
          <div className="flex items-center flex-wrap gap-1.5 gap-y-2">
            <span className="text-[12px] font-bold text-brand-muted w-[52px] shrink-0">상태</span>
            {STATUS_TABS.map((sTab) => (
              <button key={sTab} onClick={() => { setStatusTab(sTab); setExpandedId(null); }}
                className={`px-3.5 py-1.5 rounded-xl text-[13px] font-bold transition-all ${
                  statusTab === sTab ? "bg-[#2E6BE0] text-white" : "bg-brand-lighter text-brand-sub hover:bg-brand-border"
                }`}
              >
                {sTab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-brand-border bg-brand-lighter">
                <th className="w-8" />
                {["플랫폼", "유형", "캠페인명 / 서브타입", "키워드", "키워드 순위", "진행률", "기간", "상태", "바로가기"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[12px] font-bold text-brand-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-[16px] text-brand-muted">
                    진행 중인 캠페인이 없습니다.
                  </td>
                </tr>
              ) : filtered.map((c) => {
                const st      = STATUS_CONFIG[c.status];
                const plt     = PLATFORM_CONFIG[c.platform];
                const cat     = CATEGORY_CONFIG[c.category];
                const pct     = c.totalCount === 0 ? 0 : Math.round((c.doneCount / c.totalCount) * 100);
                const rankUp  = c.rankChange !== undefined && c.rankChange > 0;
                const rankDown= c.rankChange !== undefined && c.rankChange < 0;
                const isOpen  = expandedId === c.id;
                const canExpand = (c.category === "리워드" && !!c.rankHistory) || (c.category === "리뷰" && !!c.reviewDetail);

                return (
                  <Fragment key={c.id}>
                    <tr
                      onClick={() => canExpand && setExpandedId(isOpen ? null : c.id)}
                      className={`border-b border-brand-border transition-colors ${canExpand ? "cursor-pointer" : ""} ${isOpen ? "bg-brand-lighter/60" : "hover:bg-brand-lighter/40"}`}
                    >
                      {/* 확장 화살표 */}
                      <td className="pl-3 py-3.5">
                        {canExpand && (
                          <svg className={`w-3.5 h-3.5 text-brand-muted transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </td>
                      {/* 플랫폼 */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[12px] font-bold border ${plt.bg} ${plt.text} ${plt.border}`}>
                          {c.platform}
                        </span>
                      </td>
                      {/* 유형 */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[12px] font-bold border ${cat.bg} ${cat.text} ${cat.border}`}>
                          {c.category}
                        </span>
                      </td>
                      {/* 캠페인명 */}
                      <td className="px-4 py-3.5">
                        <p className="text-[15px] font-semibold text-brand-dark truncate max-w-[180px]">{c.campaignName}</p>
                        <p className="text-[12px] text-brand-muted mt-0.5">{c.subType}</p>
                      </td>
                      {/* 키워드 */}
                      <td className="px-4 py-3.5">
                        <span className="text-[13px] text-brand-sub">{c.keyword}</span>
                      </td>
                      {/* 키워드 순위 */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {c.rank !== undefined ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[17px] font-extrabold text-brand-dark">{c.rank}위</span>
                            {rankUp && (
                              <span className="flex items-center gap-0.5 text-[12px] font-bold text-green-600">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                                </svg>
                                {c.rankChange}
                              </span>
                            )}
                            {rankDown && (
                              <span className="flex items-center gap-0.5 text-[12px] font-bold text-red-500">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                                {Math.abs(c.rankChange!)}
                              </span>
                            )}
                            {c.rankChange === 0 && <span className="text-[12px] text-brand-muted">–</span>}
                          </div>
                        ) : (
                          <span className="text-[13px] text-brand-muted">-</span>
                        )}
                      </td>
                      {/* 진행률 */}
                      <td className="px-4 py-3.5 min-w-[110px]">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-[12px] text-brand-muted">{c.doneCount}/{c.totalCount}</span>
                            <span className="text-[12px] font-bold text-brand-primary">{pct}%</span>
                          </div>
                          <div className="h-1.5 bg-brand-border rounded-full overflow-hidden w-24">
                            <div className="h-full bg-brand-primary rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </td>
                      {/* 기간 */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-[13px] text-brand-sub">{c.startDate}</span>
                        <span className="text-brand-muted mx-1">~</span>
                        <span className="text-[13px] text-brand-sub">{c.endDate}</span>
                      </td>
                      {/* 상태 */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-bold ${st.bg} ${st.text}`}>
                          {st.label}
                        </span>
                      </td>
                      {/* 바로가기 */}
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <Link href={c.manageHref}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-bold bg-brand-lighter text-brand-sub hover:bg-brand-border transition-colors"
                        >
                          관리
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </td>
                    </tr>

                    {/* 순위 그래프 아코디언 */}
                    {isOpen && c.rankHistory && (
                      <tr className="border-b border-brand-border">
                        <td colSpan={10} className="p-0">
                          <div className="bg-brand-lighter/50 border-t border-brand-border px-6 py-6">
                            <div className="bg-white rounded-xl border border-brand-border p-6">
                              <RankTrendDetail title={c.campaignName} keyword={c.keyword} history={c.rankHistory} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* 리뷰 상세 아코디언 */}
                    {isOpen && c.reviewDetail && (
                      <tr className="border-b border-brand-border">
                        <td colSpan={10} className="p-0">
                          <div className="bg-brand-lighter/50 border-t border-brand-border px-6 py-5">
                            <div className="flex items-center gap-2 mb-4">
                              <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                              </svg>
                              <p className="text-[15px] font-bold text-brand-dark">리뷰 진행 현황</p>
                              <span className={`text-[12px] font-bold px-2 py-0.5 rounded-md border ${cat.bg} ${cat.text} ${cat.border}`}>
                                {c.subType}
                              </span>
                            </div>

                            {/* 진행 통계 */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                              {[
                                { label: "신청자", value: c.reviewDetail.applicants, suffix: "명" },
                                { label: "선정 인원", value: c.reviewDetail.selected, suffix: "명" },
                                { label: "리뷰 발행", value: c.reviewDetail.published, suffix: "건" },
                              ].map((s) => (
                                <div key={s.label} className="bg-white rounded-xl border border-brand-border px-4 py-3">
                                  <p className="text-[12px] text-brand-muted mb-1">{s.label}</p>
                                  <p className="text-[20px] font-extrabold text-brand-dark leading-none tabular-nums">
                                    {s.value.toLocaleString()}<span className="text-[13px] font-medium text-brand-muted ml-0.5">{s.suffix}</span>
                                  </p>
                                </div>
                              ))}
                            </div>

                            {/* 리뷰 목록 */}
                            <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
                              {c.reviewDetail.reviews.length === 0 ? (
                                <div className="px-4 py-8 text-center text-[14px] text-brand-muted">
                                  아직 접수된 리뷰가 없습니다. 모집 시작 후 순차적으로 표시됩니다.
                                </div>
                              ) : (
                                c.reviewDetail.reviews.map((r, ri) => {
                                  const rs = REVIEW_STATUS_CONFIG[r.status];
                                  return (
                                    <div key={ri} className={`flex items-start gap-3 px-4 py-3 ${ri > 0 ? "border-t border-brand-border" : ""}`}>
                                      <span className="h-8 w-8 rounded-full bg-brand-lighter flex items-center justify-center text-[13px] font-bold text-brand-sub shrink-0">
                                        {r.author.charAt(0)}
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="text-[14px] font-bold text-brand-dark">{r.author}</span>
                                          <span className="text-[12px] text-brand-muted">{r.channel}</span>
                                          <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${rs.bg} ${rs.text}`}>{r.status}</span>
                                        </div>
                                        <p className="text-[13px] text-brand-sub mt-1 leading-relaxed break-keep">{r.excerpt}</p>
                                      </div>
                                      {r.date !== "-" && (
                                        <span className="text-[12px] text-brand-muted shrink-0 whitespace-nowrap">{r.date}</span>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-brand-border">
          <p className="text-[13px] text-brand-muted">총 <span className="font-bold text-brand-dark">{filtered.length}</span>건</p>
        </div>
      </div>

    </div>
  );
}
