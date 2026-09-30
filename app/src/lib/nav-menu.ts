/**
 * 고객 화면 메뉴 트리 — 사이드바·헤더 메뉴 검색·모바일 메뉴가 함께 쓴다.
 * 메뉴를 고칠 때는 여기 한 곳만 바꾼다.
 */

// ── Icon system ──────────────────────────────────────────────
export type NavIcon =
  | { kind: "svg"; d: string }
  | { kind: "letter"; ch: string; bg: string }
  | { kind: "sqsvg"; d: string; bg: string }
  | { kind: "brand"; brand: BrandKey }
  | { kind: "meta" };

// 실제 플랫폼/서비스 심볼 (컬러 타일 + 화이트 로고)
export type BrandKey = "naver" | "naver-place" | "naver-shopping" | "naver-cafe" | "coupang" | "google" | "instagram" | "youtube";
export const BRAND_LOGOS: Record<BrandKey, { bg: string; viewBox: string; path: string; size: number; mode: "fill" | "stroke" }> = {
  naver:            { bg: "#03C75A", viewBox: "0 0 24 24", size: 14, mode: "fill",   path: "M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727z" },
  "naver-place":    { bg: "#03C75A", viewBox: "0 0 24 24", size: 17, mode: "stroke", path: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" },
  "naver-shopping": { bg: "#03C75A", viewBox: "0 0 24 24", size: 16, mode: "stroke", path: "M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" },
  "naver-cafe":     { bg: "#03C75A", viewBox: "0 0 24 24", size: 17, mode: "stroke", path: "M4.5 9.75h13.5v6a4.5 4.5 0 01-4.5 4.5H9a4.5 4.5 0 01-4.5-4.5v-6zM18 10.5h1.5a2.25 2.25 0 010 4.5H18M8 4.75v2M11.5 4.75v2M15 4.75v2" },
  coupang:   { bg: "#AE0000", viewBox: "0 0 24 24", size: 16, mode: "fill", path: "M6 8a6 6 0 1112 0v1h1.5A1.5 1.5 0 0121 10.5v9A1.5 1.5 0 0119.5 21h-15A1.5 1.5 0 013 19.5v-9A1.5 1.5 0 014.5 9H6V8zm2 1h8V8a4 4 0 10-8 0v1z" },
  google:    { bg: "#FFFFFF", viewBox: "0 0 24 24", size: 16, mode: "fill", path: "M21.35 11.1h-9.17v2.98h5.27c-.23 1.4-1.64 4.1-5.27 4.1-3.17 0-5.76-2.62-5.76-5.85s2.59-5.85 5.76-5.85c1.8 0 3.01.77 3.7 1.43l2.52-2.43C16.46 3.6 14.46 2.7 12.18 2.7 7.03 2.7 2.85 6.88 2.85 12.03s4.18 9.33 9.33 9.33c5.39 0 8.96-3.79 8.96-9.12 0-.61-.07-1.08-.16-1.54z" },
  instagram: { bg: "#E1306C", viewBox: "0 0 24 24", size: 15, mode: "fill", path: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.12 1.38A5.86 5.86 0 00.63 4.14c-.3.76-.5 1.64-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.12.66.66 1.33 1.07 2.12 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.86 5.86 0 002.12-1.38 5.86 5.86 0 001.38-2.12c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.86 5.86 0 00-1.38-2.12A5.86 5.86 0 0019.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 105.84 12 6.16 6.16 0 0012 5.84zm0 10.16A4 4 0 118 12a4 4 0 014 4zm6.41-10.4a1.44 1.44 0 11-1.44-1.44 1.44 1.44 0 011.44 1.44z" },
  youtube:   { bg: "#FF0000", viewBox: "0 0 24 24", size: 16, mode: "fill", path: "M9.6 8.15 16 12l-6.4 3.85z" },
};

// ── Nav data ─────────────────────────────────────────────────
export type SubItem = { label: string; href: string };
export interface NavItem {
  label: string;
  href: string;
  icon: NavIcon;
  free?: boolean;
  children?: SubItem[];
  /** 메뉴 검색에서 이 말로도 찾게 한다 (예: 플레이스 리뷰 ← "영수증") */
  searchAliases?: string[];
}
export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "",
    items: [
      {
        label: "마이 캠페인 현황",
        href: "/marketing/my/campaigns",
        icon: { kind: "svg", d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
      },
      {
        label: "서비스 신청내역",
        href: "/marketing/my/service-inquiries",
        icon: { kind: "svg", d: "M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" },
      },
      {
        label: "커뮤니티",
        href: "#community",
        icon: { kind: "svg", d: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" },
        children: [
          { label: "공지사항", href: "/marketing/notices" },
          { label: "지식공유", href: "/marketing/community/board" },
        ],
      },
    ],
  },
  {
    title: "편의 기능",
    items: [
      {
        label: "통합순위관리",
        href: "/marketing/rank",
        icon: { kind: "svg", d: "M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" },
      },
    ],
  },
  {
    title: "리워드 마케팅",
    items: [
      {
        label: "네이버 플레이스 리워드",
        href: "/marketing/reward/place",
        icon: { kind: "brand", brand: "naver-place" },
        children: [
          { label: "[상위노출] 캠페인 신청", href: "/marketing/reward/place" },
          { label: "[상위노출] 캠페인 관리", href: "/marketing/reward/place/manage" },
          { label: "[보장형] 캠페인 신청", href: "/marketing/reward/place/guaranteed" },
          { label: "[보장형] 캠페인 관리", href: "/marketing/reward/place/guaranteed/manage" },
        ],
      },
      {
        label: "네이버 쇼핑 리워드",
        href: "/marketing/reward/shopping",
        icon: { kind: "brand", brand: "naver-shopping" },
        children: [
          { label: "[상위노출] 캠페인 신청", href: "/marketing/reward/shopping" },
          { label: "[상위노출] 캠페인 관리", href: "/marketing/reward/shopping/manage" },
        ],
      },
      {
        label: "쿠팡 리워드",
        href: "/marketing/reward/coupang",
        icon: { kind: "brand", brand: "coupang" },
        children: [
          { label: "[상위노출] 캠페인 신청", href: "/marketing/reward/coupang" },
          { label: "[상위노출] 캠페인 관리", href: "/marketing/reward/coupang/manage" },
        ],
      },
    ],
  },
  {
    title: "리뷰·체험단",
    items: [
      {
        label: "네이버 플레이스 리뷰",
        href: "/marketing/review/place",
        searchAliases: ["블로그", "영수증", "블로그리뷰", "영수증리뷰", "리뷰어"],
        icon: { kind: "brand", brand: "naver-place" },
        children: [
          { label: "캠페인 신청", href: "/marketing/review/place" },
          { label: "캠페인 관리", href: "/marketing/review/place/manage" },
        ],
      },
      {
        label: "쇼핑 리뷰",
        href: "/marketing/review/shopping",
        icon: { kind: "brand", brand: "naver-shopping" },
      },
    ],
  },
  {
    /*
     * 개발본은 이 셋(광고·카페·콘텐츠)을 「추가 서비스」 한 묶음으로 둔다.
     * 그룹마다 항목이 1~5개라 제목 세 줄이 항목 수보다 눈에 띄었고,
     * 사용자가 찾는 기준도 "채널"이 아니라 "리워드 말고 그 밖의 것"이다.
     * 광고 2종도 접힘 없이 펼쳐 둔다 — 두 줄을 감추려 화살표를 달 이유가 없다.
     */
    title: "추가 서비스",
    items: [
      {
        label: "네이버 SA광고 최적화",
        href: "/marketing/ads/naver-cpc",
        icon: { kind: "brand", brand: "naver" },
      },
      {
        label: "네이버 광고비 환급받기",
        href: "/marketing/ads/naver-cpc-refund",
        icon: { kind: "brand", brand: "naver" },
      },
      {
        label: "네이버 카페 침투",
        href: "/marketing/community/cafe",
        icon: { kind: "brand", brand: "naver-cafe" },
      },
      {
        label: "고퀄리티 이미지 제작",
        href: "/marketing/content/image",
        icon: { kind: "sqsvg", d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", bg: "#DB2777" },
      },
      {
        label: "Total 브랜딩",
        href: "/marketing/content/branding",
        icon: { kind: "letter", ch: "T", bg: "#7C3AED" },
      },
      {
        label: "홈페이지 제작",
        href: "/marketing/content/homepage",
        icon: { kind: "sqsvg", d: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", bg: "#1E40AF" },
      },
      {
        label: "상세페이지 제작",
        href: "/marketing/content/detail",
        icon: { kind: "sqsvg", d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", bg: "#0D9488" },
      },
      {
        label: "영상 제작",
        href: "/marketing/content/video",
        icon: { kind: "sqsvg", d: "M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", bg: "#DC2626" },
      },
    ],
  },
];


/** 헤더 메뉴 검색이 훑는 항목 — 잎 메뉴 전부 + 메뉴 밖 바로가기 */
export type SearchEntry = { label: string; href: string; category: string; icon: NavIcon; aliases: string[] };

export function searchEntries(): SearchEntry[] {
  const out: SearchEntry[] = [];
  for (const g of NAV_GROUPS) {
    for (const item of g.items) {
      const category = g.title || "";
      if (item.children) {
        for (const c of item.children) {
          out.push({ label: c.label, href: c.href, category: item.label, icon: item.icon, aliases: [item.label, ...(item.searchAliases ?? [])] });
        }
      } else {
        out.push({ label: item.label, href: item.href, category, icon: item.icon, aliases: item.searchAliases ?? [] });
      }
    }
  }
  out.push({
    label: "포인트 충전", href: "/marketing/my/charge", category: "기타", aliases: ["충전", "포인트"],
    icon: { kind: "svg", d: "M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" },
  });
  return out;
}
