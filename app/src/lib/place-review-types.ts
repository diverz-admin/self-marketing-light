/** 플레이스 리뷰 관리 화면 타입 — 클라이언트도 읽으므로 DB 코드와 떼어 둔다 */
export type ReviewStatus = "pending" | "running" | "done" | "paused";

export type ReviewChangeRequest = {
  status: "pending" | "applied" | "rejected";
  requestedAt: string;
  reason?: string;
  changes: Record<string, unknown>;
};

export type PlaceReviewPost = {
  id: string;
  date: string;
  url: string;
  reviewer: string;
  /** 이 글에 대한 수정 요청 (1건당 대기 중인 요청은 1개) */
  request: { status: "pending" | "done" | "rejected"; text: string; at: string } | null;
};

export type PlaceReviewRow = {
  id: string;
  name: string;
  type: "blog_distribute" | "receipt";
  url: string;
  mainKeywords: string[];
  hashtags: string[];
  bizInfo: string;
  postType: string;
  imageMode: "CRAWL" | "ATTACH";
  imageDriveUrl: string;
  crawlRequest: string;
  days: number;
  daily: number;
  total: number;
  registered: number;
  requestedAt: string;
  status: ReviewStatus;
  posts: PlaceReviewPost[];
  changeRequest: ReviewChangeRequest | null;
};
