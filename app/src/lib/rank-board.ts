import { and, asc, desc, eq, gte, inArray } from "drizzle-orm";
import { db } from "@/db";
import { rankKeywords, rankSnapshots } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";
import { viewerId } from "./viewer";

export type RankPlatformKey = "place" | "shopping" | "coupang";

/**
 * 순위 한 점 — 날짜(YYYY-MM-DD) + 순위(순위권 밖이면 null).
 * visit·blog 는 그날 측정한 방문자리뷰·블로그리뷰 누적 수 (측정하지 않았으면 비움)
 */
export type RankPoint = { date: string; rank: number | null; visit?: number; blog?: number };

export type RankBoardItem = {
  id: string;
  platform: RankPlatformKey;
  keyword: string;
  /** 업체명·상품명 — 아직 못 불러왔으면 null ("확인 중") */
  name: string | null;
  url: string | null;
  /** 링크에서 뽑은 플레이스 ID·상품번호 */
  targetId: string | null;
  registeredAt: string;
  /** 오래된 → 최근 순. 최대 60일 */
  history: RankPoint[];
};

export type RankBoardData = {
  items: RankBoardItem[];
  /** 로그인 전 체험 — 예시 데이터를 보여주는 중 */
  demo: boolean;
};

const ymd = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(d);

/** 링크에서 숫자 ID 를 뽑는다 — 플레이스 /place/123, 스마트스토어 /products/123, 쿠팡 /products/123 */
export function extractTargetId(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(/(?:place|restaurant|hairshop|hospital|products|vp\/products)\/(\d{5,})/) ?? url.match(/(\d{6,})/);
  return m ? m[1] : null;
}

/**
 * 통합순위관리 목록 — 활성 키워드와 최근 60일 순위 이력.
 *
 * 로그인하지 않은 체험 방문자에게는 개발본과 같이 예시 데이터를 보여준다.
 * 로그인한 회원은 등록한 것이 없으면 빈 목록 그대로다.
 */
export async function loadRankBoard(): Promise<RankBoardData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const uid = user?.id ?? (await viewerId());
  const rows = await db
    .select()
    .from(rankKeywords)
    .where(and(eq(rankKeywords.userId, uid), eq(rankKeywords.isActive, true)))
    .orderBy(desc(rankKeywords.createdAt));

  if (rows.length === 0 && !user) return { items: demoItems(), demo: true };

  const since = new Date();
  since.setDate(since.getDate() - 60);
  const snaps = rows.length
    ? await db
        .select()
        .from(rankSnapshots)
        .where(and(inArray(rankSnapshots.keywordId, rows.map((r) => r.id)), gte(rankSnapshots.snapshotDate, ymd(since))))
        .orderBy(asc(rankSnapshots.snapshotDate))
    : [];

  const byKeyword = new Map<string, RankPoint[]>();
  for (const s of snaps) {
    const list = byKeyword.get(s.keywordId) ?? [];
    list.push({ date: s.snapshotDate, rank: s.rank });
    byKeyword.set(s.keywordId, list);
  }

  return {
    demo: !user,
    items: rows.map((r) => {
      let history = byKeyword.get(r.id) ?? [];
      // 스냅샷이 없고 현재 순위만 있으면 그 한 점이라도 그린다
      if (history.length === 0 && r.lastCheckedAt) {
        history = [
          ...(r.previousRank != null ? [{ date: "", rank: r.previousRank }] : []),
          { date: ymd(r.lastCheckedAt), rank: r.currentRank },
        ];
      }
      return {
        id: r.id,
        platform: r.platform,
        keyword: r.keyword,
        name: r.targetName,
        url: r.targetUrl,
        targetId: extractTargetId(r.targetUrl),
        registeredAt: ymd(r.createdAt),
        history,
      };
    }),
  };
}

/* ── 체험용 예시 데이터 — 오늘 기준으로 날짜를 만들어 늘 "최근"으로 보이게 한다 ── */
function series(seed: number[], visit0: number, blog0: number, days = 60): RankPoint[] {
  const out: RankPoint[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const base = seed[i % seed.length];
    // 리뷰 수는 날마다 조금씩 쌓인다 — 오늘이 가장 많다
    out.push({ date: ymd(d), rank: base, visit: visit0 - i * 2 + (i % 3), blog: blog0 - Math.floor(i / 4) });
  }
  return out;
}

function demoItems(): RankBoardItem[] {
  const mk = (
    id: string, platform: RankPlatformKey, name: string | null, keyword: string,
    targetId: string, registeredAt: string, seed: number[], visit = 276, blog = 26,
  ): RankBoardItem => ({
    id, platform, name, keyword, targetId, registeredAt,
    url: platform === "place" ? `https://m.place.naver.com/restaurant/${targetId}` : `https://smartstore.naver.com/demo/products/${targetId}`,
    history: series(seed, visit, blog),
  });
  return [
    mk("demo-1", "place", "강남 한우담 본점", "강남 소고기 맛집", "1000000005", "2026-06-28", [25, 23, 24, 26, 24, 25, 26, 28, 30, 33, 35, 38, 40], 276, 26),
    mk("demo-2", "place", "연남 베이글하우스", "연남동 베이글", "1000000011", "2026-07-29", [60, 61, 58, 63, 66, 64, 70], 1297, 921),
    mk("demo-3", "place", "망원 수제버거공방", "망원동 수제버거", "1000000019", "2026-08-14", [8, 9, 12, 10, 8, 11, 9], 512, 148),
    mk("demo-4", "place", null, "판교 필라테스", "1000000027", "2026-09-16", [46, 44, 47, 45, 48, 44, 46], 88, 12),
    mk("demo-5", "shopping", "데일리 텀블러 500ml", "보온 텀블러", "89444374972", "2026-08-02", [14, 15, 17, 16, 19, 18, 21]),
    mk("demo-6", "shopping", "무선이어폰 P3", "무선이어폰 노이즈캔슬링", "88123456789", "2026-09-01", [37, 34, 41, 41, 30, 27, 32]),
  ];
}
