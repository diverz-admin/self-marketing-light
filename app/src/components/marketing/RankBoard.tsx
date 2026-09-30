"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/marketing/PageHeader";
import { NaverPlacePin, NaverShoppingTile, CoupangBurst } from "@/components/ui/channel-logos";
import { toast } from "@/components/ui/toast";
import { useItemGroups } from "@/lib/item-groups";
import { addRankKeyword, removeRankKeyword, requestRankRefresh } from "@/app/(platform)/marketing/actions";
import type { RankBoardData, RankBoardItem, RankPlatformKey, RankPoint } from "@/lib/rank-board";

/* ── 채널 ─────────────────────────────────────────────────── */
const PLATFORMS: {
  key: RankPlatformKey;
  label: string;
  Logo: (p: { size?: number }) => React.ReactElement;
  linkLabel: string;
  idLabel: string;
  linkPlaceholder: string;
  keywordPlaceholder: string;
}[] = [
  {
    key: "place", label: "네이버 플레이스", Logo: NaverPlacePin,
    linkLabel: "플레이스 링크", idLabel: "플레이스 ID",
    linkPlaceholder: "https://m.place.naver.com/restaurant/1234567",
    keywordPlaceholder: "예: 마포 맛집",
  },
  {
    key: "shopping", label: "네이버 쇼핑", Logo: NaverShoppingTile,
    linkLabel: "상품 링크", idLabel: "상품번호",
    linkPlaceholder: "https://smartstore.naver.com/…/products/1234567890",
    keywordPlaceholder: "예: 보온 텀블러",
  },
  {
    key: "coupang", label: "쿠팡", Logo: CoupangBurst,
    linkLabel: "상품 링크", idLabel: "상품번호",
    linkPlaceholder: "https://www.coupang.com/vp/products/1234567890",
    keywordPlaceholder: "예: 캠핑 의자",
  },
];
const platformMeta = (k: RankPlatformKey) => PLATFORMS.find((p) => p.key === k)!;

/* ── 순위 분포 구간 ─────────────────────────────────────────── */
const BUCKETS: { key: string; label: string; test: (r: number | null) => boolean }[] = [
  { key: "1-10", label: "1~10위", test: (r) => r != null && r <= 10 },
  { key: "11-20", label: "11~20위", test: (r) => r != null && r >= 11 && r <= 20 },
  { key: "21-50", label: "21~50위", test: (r) => r != null && r >= 21 && r <= 50 },
  { key: "51-100", label: "51~100위", test: (r) => r != null && r >= 51 && r <= 100 },
  { key: "101-200", label: "101~200위", test: (r) => r != null && r >= 101 && r <= 200 },
  { key: "201-300", label: "201~300위", test: (r) => r != null && r >= 201 && r <= 300 },
  { key: "out", label: "순위밖", test: (r) => r == null },
];

/* ── 순위 계산 ─────────────────────────────────────────────── */
const measured = (it: RankBoardItem) => it.history.filter((p) => p.date);
const latest = (it: RankBoardItem): RankPoint | null => it.history[it.history.length - 1] ?? null;
const latestRank = (it: RankBoardItem) => latest(it)?.rank ?? null;
const firstRank = (it: RankBoardItem) => it.history.find((p) => p.rank != null)?.rank ?? null;
/** 전일 대비 — 양수면 순위가 올랐다(숫자가 작아졌다) */
function dayDiff(it: RankBoardItem): number | null {
  const h = it.history;
  if (h.length < 2) return null;
  const a = h[h.length - 2].rank;
  const b = h[h.length - 1].rank;
  if (a == null || b == null) return null;
  return a - b;
}

function DiffBadge({ diff }: { diff: number | null }) {
  if (diff == null || diff === 0) {
    return <span className="text-[12px] font-bold text-brand-muted">–</span>;
  }
  const up = diff > 0;
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-px text-[12px] font-extrabold tabular-nums"
      style={{ background: up ? "var(--success-bg)" : "var(--danger-bg)", color: up ? "var(--success-fg)" : "var(--danger-fg)" }}
    >
      {up ? "▲" : "▼"} {Math.abs(diff)}
    </span>
  );
}

/** 목록용 7일 모양 — 숫자 대신 오르내림만 */
function Sparkline({ points }: { points: RankPoint[] }) {
  const ranks = points.slice(-7).map((p) => p.rank);
  const vals = ranks.filter((r): r is number => r != null);
  if (vals.length < 2) return <span className="w-[84px] text-[12px] text-brand-muted">측정 대기</span>;
  const W = 84, H = 26, pad = 3;
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = Math.max(1, max - min);
  const step = (W - pad * 2) / Math.max(1, ranks.length - 1);
  // 순위는 작을수록 위 — y 를 뒤집지 않고 그대로 두면 1위가 맨 위에 온다
  const pts = ranks
    .map((r, i) => (r == null ? null : [pad + i * step, pad + ((r - min) / span) * (H - pad * 2)] as const))
    .filter((p): p is readonly [number, number] => p != null);
  const last = pts[pts.length - 1];
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="shrink-0" aria-hidden>
      <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="var(--point-500)" strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r={2.6} fill="var(--point-500)" />
    </svg>
  );
}

/** 부드러운 곡선 — 점 사이를 Catmull-Rom 으로 잇는다 */
function smoothPath(pts: [number, number][]) {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/** 상세 패널 순위 추이 — 선택 기간의 곡선 그래프 (순위 밖인 날은 바닥에 붙인다) */
function TrendChart({ points }: { points: RankPoint[] }) {
  const data = points.filter((p) => p.date);
  const vals = data.map((p) => p.rank).filter((r): r is number => r != null);
  if (vals.length === 0) {
    return <p className="py-10 text-center text-[13px] text-brand-muted">아직 측정된 순위가 없습니다.</p>;
  }
  const W = 1100, H = 240, padX = 16, padT = 30, padB = 12;
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = Math.max(1, max - min);
  const bottom = H - padB;
  // 순위 밖은 바닥선, 측정값은 바닥에서 한 칸 띄워 둔다 — 밖과 최하위가 겹치지 않게
  const plotB = data.some((p) => p.rank == null) ? bottom - 44 : bottom;
  const step = data.length > 1 ? (W - padX * 2) / (data.length - 1) : 0;
  const xy: [number, number][] = data.map((p, i) => [
    data.length > 1 ? padX + i * step : W / 2,
    p.rank == null ? bottom : padT + ((p.rank - min) / span) * (plotB - padT),
  ]);
  const line = smoothPath(xy);
  const last = xy[xy.length - 1];
  const labelEvery = Math.max(1, Math.ceil(data.length / 7));
  const dateEvery = data.length > 31 ? 2 : 1;
  const labeled = (i: number) => data[i].rank != null && ((data.length - 1 - i) % labelEvery === 0);
  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full h-auto" role="img" aria-label="순위 추이 그래프">
      <defs>
        <linearGradient id="rank-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--point-500)" stopOpacity={0.16} />
          <stop offset="100%" stopColor="var(--point-500)" stopOpacity={0} />
        </linearGradient>
      </defs>
      {[0, 1 / 3, 2 / 3, 1].map((t) => (
        <line key={t} x1={0} x2={W} y1={padT + t * (bottom - padT)} y2={padT + t * (bottom - padT)} stroke="var(--border)" strokeDasharray="3 5" />
      ))}
      {line && (
        <>
          <path d={`${line} L${last[0]},${bottom} L${xy[0][0]},${bottom} Z`} fill="url(#rank-fill)" />
          <path d={line} fill="none" stroke="var(--point-500)" strokeWidth={2.4} strokeLinecap="round" />
        </>
      )}
      <line x1={last[0]} x2={last[0]} y1={last[1]} y2={bottom} stroke="var(--point-500)" strokeOpacity={0.6} strokeDasharray="3 4" />
      {xy.map(([x, y], i) =>
        labeled(i) ? (
          <g key={i}>
            <circle cx={x} cy={y} r={4} fill="var(--surface, #fff)" stroke="var(--point-500)" strokeWidth={2} />
            <text x={x} y={y - 9} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--text-strong)">
              {data[i].rank}위
            </text>
          </g>
        ) : null,
      )}
      {xy.map(([x], i) =>
        i % dateEvery === 0 || i === xy.length - 1 ? (
          <text key={`l${i}`} x={x} y={H + 16} textAnchor="middle" fontSize={11} fill="var(--text-muted)">
            {data[i].date.slice(5).replace("-", "/")}
          </text>
        ) : null,
      )}
    </svg>
  );
}

/* ── 공통 모달 ─────────────────────────────────────────────── */
function Modal({ title, children, onClose, width = "max-w-md" }: { title: string; children: React.ReactNode; onClose: () => void; width?: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/35 backdrop-blur-[2px] px-4" onMouseDown={onClose}>
      <div role="dialog" aria-modal aria-label={title} className={`animate-be-fade w-full ${width} rounded-2xl bg-white p-6 shadow-2xl`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[17px] font-extrabold text-brand-dark">{title}</p>
          <button type="button" onClick={onClose} aria-label="닫기" className="h-7 w-7 rounded-full hover:bg-brand-lighter flex items-center justify-center">
            <svg className="w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-brand-lighter text-[14.5px] text-brand-dark placeholder:text-brand-muted focus:outline-none focus:border-brand-primary focus:bg-white transition-colors";

/* ── 메인 ─────────────────────────────────────────────────── */
export default function RankBoard({ data, initialPlatform = "place" }: { data: RankBoardData; initialPlatform?: RankPlatformKey }) {
  const router = useRouter();
  const [items, setItems] = useState<RankBoardItem[]>(data.items);
  // 서버에서 새 목록이 오면(router.refresh) 그걸로 갈아 끼운다
  const [source, setSource] = useState(data.items);
  if (source !== data.items) {
    setSource(data.items);
    setItems(data.items);
  }

  const [platform, setPlatform] = useState<RankPlatformKey>(initialPlatform);
  const [bucket, setBucket] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [range, setRange] = useState<7 | 30 | 60>(7);
  const [refreshing, setRefreshing] = useState<Record<string, "pending" | "done">>({});

  const [addOpen, setAddOpen] = useState(false);
  // 추가 패널은 버튼 오른쪽 끝에서 시작한다 — 버튼 폭은 글꼴에 따라 달라 열 때 잰다
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const [addLeft, setAddLeft] = useState(0);
  useLayoutEffect(() => {
    if (!addOpen) return;
    const measure = () => {
      const b = addBtnRef.current;
      if (b) setAddLeft(b.offsetLeft + b.offsetWidth + 12);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [addOpen]);
  const [confirmDel, setConfirmDel] = useState<RankBoardItem | null>(null);
  const [groupAdding, setGroupAdding] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [renaming, setRenaming] = useState<{ id: number; name: string } | null>(null);
  const [assigning, setAssigning] = useState<number | null>(null);
  const [delGroup, setDelGroup] = useState<number | null>(null);
  const [drag, setDrag] = useState<{ kind: "item"; id: string } | { kind: "group"; id: number } | null>(null);
  const [dropOn, setDropOn] = useState<number | "none" | null>(null);

  const groups = useItemGroups(`rank.${platform}`);
  const meta = platformMeta(platform);

  const counts = useMemo(() => {
    const c: Record<RankPlatformKey, number> = { place: 0, shopping: 0, coupang: 0 };
    for (const it of items) c[it.platform]++;
    return c;
  }, [items]);

  const inPlatform = items.filter((it) => it.platform === platform);
  const q = search.trim().toLowerCase();
  const searched = q
    ? inPlatform.filter((it) => (it.name ?? "").toLowerCase().includes(q) || it.keyword.toLowerCase().includes(q))
    : inPlatform;
  const dist = BUCKETS.map((b) => inPlatform.filter((it) => b.test(latestRank(it))).length);
  const shown = bucket ? searched.filter((it) => BUCKETS.find((b) => b.key === bucket)!.test(latestRank(it))) : searched;

  /* 그룹별로 묶기 — 그룹이 하나도 없으면 헤더 없이 한 덩어리 */
  const sections: { gid: number | null; name: string; rows: RankBoardItem[] }[] =
    groups.groups.length === 0
      ? [{ gid: null, name: "", rows: shown }]
      : [
          ...groups.groups.map((g) => ({ gid: g.id as number | null, name: g.name, rows: shown.filter((it) => groups.groupIdOf(it.id) === g.id) })),
          { gid: null, name: "미분류", rows: shown.filter((it) => groups.groupIdOf(it.id) == null) },
        ];

  /* ── 동작 ── */
  const doRefresh = async (it: RankBoardItem) => {
    if (refreshing[it.id]) return;
    setRefreshing((m) => ({ ...m, [it.id]: "pending" }));
    if (!data.demo) {
      const res = await requestRankRefresh(it.id);
      if ("error" in res) {
        setRefreshing((m) => {
          const n = { ...m };
          delete n[it.id];
          return n;
        });
        toast.error(res.error);
        return;
      }
    }
    setRefreshing((m) => ({ ...m, [it.id]: "done" }));
    toast.success("재측정을 요청했습니다", "다음 측정에서 이 키워드의 순위가 갱신됩니다.");
  };

  const doDelete = async (it: RankBoardItem) => {
    if (!data.demo) {
      const res = await removeRankKeyword(it.id);
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
    }
    groups.assignItem(it.id, null);
    setItems((list) => list.filter((x) => x.id !== it.id));
    setConfirmDel(null);
    toast.success("순위 추적을 중단했습니다");
    if (!data.demo) router.refresh();
  };

  const onAdded = (created: RankBoardItem, gid: number | null) => {
    setItems((list) => [created, ...list]);
    if (gid != null) groups.assignItem(created.id, gid);
    setAddOpen(false);
    toast.success("순위 추적을 추가했습니다", "오늘부터 순위가 기록됩니다.");
    if (!data.demo) router.refresh();
  };

  const onDropToGroup = (gid: number | null) => {
    if (drag?.kind === "item") groups.assignItem(drag.id, gid);
    if (drag?.kind === "group" && gid != null) {
      const to = groups.groups.findIndex((g) => g.id === gid);
      groups.moveGroup(drag.id, to);
    }
    setDrag(null);
    setDropOn(null);
  };

  const totalKeywords = inPlatform.length;

  return (
    <div>
      <PageHeader
        title="통합순위관리"
        subtitle="네이버 플레이스·쇼핑, 쿠팡 키워드 순위를 한 페이지에서 추적하세요."
        iconPath="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
        className="mb-6"
      />

      {/* 채널 탭 카드 */}
      <div className="grid grid-cols-3 gap-2.5 md:gap-3">
        {PLATFORMS.map((p) => {
          const on = p.key === platform;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => {
                setPlatform(p.key);
                setBucket(null);
                setExpanded(null);
              }}
              aria-pressed={on}
              className={`flex items-center gap-3 rounded-2xl border bg-white px-4 py-3.5 text-left transition-colors ${
                on ? "border-brand-primary shadow-[0_0_0_1px_var(--point-500)]" : "border-brand-border hover:border-brand-border-strong"
              }`}
            >
              <p.Logo size={24} />
              <span className="min-w-0">
                <span className={`block text-[13px] font-semibold truncate ${on ? "text-brand-primary" : "text-brand-sub"}`}>{p.label}</span>
                <span className="block text-[20px] font-extrabold text-brand-dark tabular-nums leading-tight">{counts[p.key]}</span>
              </span>
            </button>
          );
        })}
      </div>

      {platform === "coupang" ? (
        <div className="mt-5 rounded-2xl border border-brand-border bg-white px-6 py-16 text-center">
          <CoupangBurst size={36} />
          <p className="mt-3 text-[17px] font-extrabold text-brand-dark">쿠팡 순위관리 준비중</p>
          <p className="mt-1 text-[14px] text-brand-sub">쿠팡 키워드 순위 추적은 곧 열립니다.</p>
        </div>
      ) : (
        <>
          {/* 순위 분포 */}
          <p className="mt-4 mb-2 text-[13px] font-semibold text-brand-dark">
            {totalKeywords}개 키워드 추적 중 · 순위 분포{" "}
            <span className="font-normal text-brand-muted">(최근 순위 기준 · 구간을 눌러 필터)</span>
            {bucket && (
              <button type="button" onClick={() => setBucket(null)} className="ml-2 text-[12px] font-bold text-brand-primary hover:underline">
                필터 해제
              </button>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {BUCKETS.map((b, i) => {
              const on = bucket === b.key;
              return (
                <button
                  key={b.key}
                  type="button"
                  onClick={() => setBucket(on ? null : b.key)}
                  aria-pressed={on}
                  className={`min-w-[84px] rounded-xl border px-3 py-2 text-left transition-colors ${
                    on ? "border-brand-primary bg-brand-primary-50" : "border-brand-border bg-white hover:border-brand-border-strong"
                  }`}
                >
                  <span className="block text-[11.5px] text-brand-sub">{b.label}</span>
                  <span className={`block text-[15px] font-extrabold tabular-nums ${dist[i] > 0 ? "text-brand-primary" : "text-brand-dark"}`}>
                    {dist[i]}개
                  </span>
                </button>
              );
            })}
          </div>

          {/* 순위 목록 */}
          {/* 목록 — 카드 테두리 없이 본문에 바로 얹는다(캠페인 관리 화면과 같은 짜임) */}
          <section className="mt-8">
            <header>
              <div className="flex flex-wrap items-center gap-2.5">
                <meta.Logo size={22} />
                <h2 className="text-[20px] font-extrabold text-brand-dark">
                  {meta.label} 순위 목록 <span className="font-bold text-brand-muted">· {shown.length}개</span>
                </h2>
                <span className="hidden lg:inline text-[12.5px] text-brand-muted">행을 클릭하면 순위 추이 그래프와 상세가 열립니다</span>
              </div>
              <div className="relative mt-4 flex flex-wrap items-center gap-2.5">
                <label className="flex items-center gap-2 rounded-xl border border-brand-border bg-white px-3.5 h-11 w-full sm:w-[260px] focus-within:border-brand-primary">
                  <svg className="w-4 h-4 text-brand-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="업체명·키워드 검색"
                    className="min-w-0 flex-1 bg-transparent text-[14px] text-brand-dark placeholder:text-brand-muted focus:outline-none"
                  />
                </label>
                {/* 버튼 오른쪽으로 떠서 본문 오른쪽 끝까지 열린다 — 목록을 밀어내지 않는다 */}
                <button
                  type="button"
                  ref={addBtnRef}
                  onClick={() => setAddOpen((v) => !v)}
                  aria-expanded={addOpen}
                  className="inline-flex items-center gap-1.5 rounded-xl px-5 h-11 text-[14.5px] font-bold text-white"
                  style={{ background: "var(--gradient-point)", boxShadow: "var(--shadow-point)" }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.6}>
                    <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                  </svg>
                  순위 추적 추가
                </button>
                {addOpen && (
                  <div
                    className="absolute z-40 top-[calc(100%+10px)] left-0 right-0 md:top-0 md:left-[var(--add-left)]"
                    style={{ ["--add-left" as string]: `${addLeft}px` }}
                  >
                    <AddPanel
                      key={platform}
                      platform={platform}
                      demo={data.demo}
                      groupList={groups.groups}
                      onAddGroup={groups.addGroup}
                      onClose={() => setAddOpen(false)}
                      onAdded={onAdded}
                    />
                  </div>
                )}
              </div>
            </header>

            {/* 그룹 요약 + 만들기 */}
            <div className="mt-5 flex flex-wrap items-center justify-end gap-3 py-3 border-y border-brand-border">
              <span className="whitespace-nowrap text-[13px] font-bold text-brand-dark">
                {groups.groups.length}개 그룹 · {totalKeywords}개 키워드
              </span>
              {groupAdding ? (
                <form
                  className="flex min-w-0 items-center gap-1.5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!groupName.trim()) return;
                    groups.addGroup(groupName);
                    setGroupName("");
                    setGroupAdding(false);
                  }}
                >
                  <input autoFocus value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="새 그룹 이름 (예: 강남점)" className={`${inputCls} !py-1.5 !text-[13px] w-[180px] min-w-0 shrink`} />
                  <button type="submit" className="shrink-0 whitespace-nowrap rounded-lg bg-brand-primary px-3 py-1.5 text-[13px] font-bold text-white">추가</button>
                  <button type="button" onClick={() => setGroupAdding(false)} className="shrink-0 whitespace-nowrap rounded-lg border border-brand-border px-3 py-1.5 text-[13px] font-semibold text-brand-sub">취소</button>
                </form>
              ) : (
                <button type="button" onClick={() => setGroupAdding(true)} className="shrink-0 whitespace-nowrap rounded-lg border border-brand-border bg-white px-3 py-1.5 text-[13px] font-bold text-brand-dark hover:bg-brand-lighter">
                  + 그룹 만들기
                </button>
              )}
            </div>

            {/* 표 — 모바일은 가로 스크롤. 상세 패널이 표 폭(860px)을 따라가지 않게 컨테이너 폭을 잰다 */}
            <div className="overflow-x-auto @container">
              <div className="min-w-[860px]">
                <div className="grid grid-cols-[44px_minmax(200px,1.3fr)_minmax(140px,1fr)_minmax(220px,1.4fr)_110px_150px] items-center px-2 py-2.5 text-[12.5px] font-semibold text-brand-sub border-b border-brand-border">
                  <span />
                  <span>업체명</span>
                  <span>메인 키워드</span>
                  <span>순위 (최근순)</span>
                  <span>등록일</span>
                  <span className="text-center">관리</span>
                </div>

                {inPlatform.length === 0 ? (
                  <div className="px-6 py-14 text-center">
                    <p className="text-[15px] font-bold text-brand-dark">추적 중인 키워드가 없습니다</p>
                    <p className="mt-1 text-[13px] text-brand-sub">「순위 추적 추가」로 키워드와 링크를 넣으면 오늘부터 순위가 기록됩니다.</p>
                  </div>
                ) : shown.length === 0 ? (
                  <p className="px-6 py-12 text-center text-[13.5px] text-brand-sub">조건에 맞는 키워드가 없습니다.</p>
                ) : (
                  sections.map((sec) => (
                    <div key={sec.gid ?? "none"}>
                      {sec.name && (
                        <div
                          draggable={sec.gid != null}
                          onDragStart={() => sec.gid != null && setDrag({ kind: "group", id: sec.gid })}
                          onDragEnd={() => {
                            setDrag(null);
                            setDropOn(null);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDropOn(sec.gid ?? "none");
                          }}
                          onDragLeave={() => setDropOn(null)}
                          onDrop={() => onDropToGroup(sec.gid)}
                          className={`flex items-center gap-2 px-3 py-2 border-b border-brand-border transition-colors ${
                            dropOn === (sec.gid ?? "none") ? "bg-brand-primary-50" : "bg-brand-base"
                          }`}
                        >
                          {sec.gid != null && (
                            <span className="cursor-grab text-brand-muted select-none" title="끌어서 그룹 순서 바꾸기">⠿</span>
                          )}
                          <span className="text-[13.5px] font-extrabold text-brand-dark">{sec.name}</span>
                          <span className="text-[12px] text-brand-sub">· 키워드 {sec.rows.length}개</span>
                          {drag?.kind === "item" && <span className="text-[12px] font-bold text-brand-primary">여기에 놓기</span>}
                          <span className="flex-1" />
                          {sec.gid != null && (
                            <span className="flex items-center gap-1">
                              <button type="button" onClick={() => setAssigning(sec.gid)} className="rounded-md border border-brand-border bg-white px-2 py-0.5 text-[12px] font-semibold text-brand-dark hover:bg-brand-lighter">편성</button>
                              <button type="button" onClick={() => setRenaming({ id: sec.gid!, name: sec.name })} className="rounded-md border border-brand-border bg-white px-2 py-0.5 text-[12px] font-semibold text-brand-dark hover:bg-brand-lighter">이름</button>
                              <button type="button" onClick={() => setDelGroup(sec.gid)} className="rounded-md border border-brand-border bg-white px-2 py-0.5 text-[12px] font-semibold text-brand-error hover:bg-brand-error-bg">삭제</button>
                            </span>
                          )}
                        </div>
                      )}

                      {sec.rows.map((it) => {
                        const open = expanded === it.id;
                        const r = latestRank(it);
                        return (
                          <div key={it.id} className="border-b border-brand-border last:border-b-0">
                            <div
                              role="button"
                              tabIndex={0}
                              draggable
                              onDragStart={() => setDrag({ kind: "item", id: it.id })}
                              onDragEnd={() => {
                                setDrag(null);
                                setDropOn(null);
                              }}
                              onClick={() => setExpanded(open ? null : it.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setExpanded(open ? null : it.id);
                                }
                              }}
                              className={`grid grid-cols-[44px_minmax(200px,1.3fr)_minmax(140px,1fr)_minmax(220px,1.4fr)_110px_150px] items-center px-2 py-3 cursor-pointer transition-colors ${
                                open ? "bg-brand-primary-50 shadow-[inset_0_-2px_0_var(--point-500)]" : "hover:bg-brand-lighter"
                              }`}
                            >
                              <span className={`text-center text-[11px] text-brand-sub transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
                              <span className="flex items-center gap-2.5 min-w-0">
                                <span className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-[12px] font-bold text-white" style={{ background: "var(--gradient-point)" }}>
                                  {(it.name ?? it.keyword).charAt(0)}
                                </span>
                                <span className="min-w-0">
                                  <span className="block text-[14px] font-bold text-brand-dark truncate">{it.name ?? it.keyword}</span>
                                  {!it.name && <span className="block text-[11.5px] font-semibold text-brand-warning">확인 중</span>}
                                </span>
                              </span>
                              <span className="text-[13.5px] text-brand-text truncate pr-2">{it.keyword}</span>
                              <span className="flex items-center gap-2 min-w-0">
                                {measured(it).length === 0 ? (
                                  <span className="text-[13px] font-semibold text-brand-muted">측정 대기</span>
                                ) : (
                                  <>
                                    <span className={`text-[16px] font-extrabold tabular-nums ${r != null && r <= 10 ? "text-brand-primary" : "text-brand-dark"}`}>
                                      {r != null ? `${r}위` : "순위밖"}
                                    </span>
                                    <DiffBadge diff={dayDiff(it)} />
                                    <Sparkline points={it.history} />
                                    <span className="text-[11.5px] text-brand-muted">7일</span>
                                  </>
                                )}
                              </span>
                              <span className="text-[13px] text-brand-sub tabular-nums">{it.registeredAt}</span>
                              <span className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => doRefresh(it)}
                                  disabled={!!refreshing[it.id]}
                                  title="이 키워드만 다시 측정"
                                  className="rounded-lg bg-brand-primary-50 px-2.5 py-1 text-[12.5px] font-bold text-brand-primary disabled:opacity-60"
                                >
                                  {refreshing[it.id] ? "요청됨" : "새로고침"}
                                </button>
                                <button type="button" onClick={() => setConfirmDel(it)} className="rounded-lg border border-brand-border bg-white px-2.5 py-1 text-[12.5px] font-semibold text-brand-sub hover:text-brand-error">
                                  삭제
                                </button>
                              </span>
                            </div>

                            {open && <DetailPanel item={it} range={range} onRange={setRange} />}
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <p className="mt-3 text-[12.5px] text-brand-muted">
            캠페인으로 집행 중인 순위는{" "}
            <Link href="/marketing/my/campaigns" className="font-semibold text-brand-primary hover:underline">
              캠페인 관리 화면
            </Link>
            에서 볼 수 있습니다.
          </p>
        </>
      )}

      {confirmDel && (
        <DeleteConfirm item={confirmDel} onClose={() => setConfirmDel(null)} onConfirm={() => doDelete(confirmDel)} />
      )}

      {renaming && (
        <Modal title="그룹 이름 변경" onClose={() => setRenaming(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              groups.renameGroup(renaming.id, renaming.name);
              setRenaming(null);
            }}
          >
            <input autoFocus value={renaming.name} onChange={(e) => setRenaming({ ...renaming, name: e.target.value })} className={inputCls} />
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setRenaming(null)} className="rounded-xl border border-brand-border px-4 py-2.5 text-[14px] font-semibold text-brand-sub">취소</button>
              <button type="submit" disabled={!renaming.name.trim()} className="rounded-xl bg-brand-primary px-4 py-2.5 text-[14px] font-bold text-white disabled:opacity-50">저장</button>
            </div>
          </form>
        </Modal>
      )}

      {delGroup != null && (
        <Modal title="그룹을 삭제할까요?" onClose={() => setDelGroup(null)}>
          <p className="text-[14px] text-brand-sub leading-relaxed">그룹만 지워지고, 안에 있던 키워드는 「미분류」로 옮겨집니다.</p>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setDelGroup(null)} className="rounded-xl border border-brand-border px-4 py-2.5 text-[14px] font-semibold text-brand-sub">취소</button>
            <button
              type="button"
              onClick={() => {
                groups.removeGroup(delGroup);
                setDelGroup(null);
              }}
              className="rounded-xl bg-brand-error px-4 py-2.5 text-[14px] font-bold text-white"
            >
              그룹 삭제
            </button>
          </div>
        </Modal>
      )}

      {assigning != null && (
        <AssignModal
          groupName={groups.groups.find((g) => g.id === assigning)?.name ?? ""}
          items={inPlatform}
          groupNameOf={(id) => {
            const gid = groups.groupIdOf(id);
            return gid == null ? null : groups.groups.find((g) => g.id === gid)?.name ?? null;
          }}
          isIn={(id) => groups.groupIdOf(id) === assigning}
          onSave={(inIds, outIds) => {
            groups.assignMany(inIds, assigning);
            groups.assignMany(outIds, null);
            setAssigning(null);
          }}
          onClose={() => setAssigning(null)}
        />
      )}
    </div>
  );
}

/* ── 상세 패널 ─────────────────────────────────────────────── */
function DetailPanel({ item, range, onRange }: { item: RankBoardItem; range: 7 | 30 | 60; onRange: (r: 7 | 30 | 60) => void }) {
  const meta = platformMeta(item.platform);
  const history = measured(item);
  const pts = history.slice(-range);
  // 날짜 띠는 기간과 관계없이 쌓인 기록 전체 — 최근이 왼쪽
  const recent = [...history].reverse();
  const recent7 = recent.slice(0, 7);
  const lastVisit = recent7.find((p) => p.visit != null)?.visit ?? null;
  const lastBlog = recent7.find((p) => p.blog != null)?.blog ?? null;
  const r = latestRank(item);
  const f = firstRank(item);
  const tiles = [
    { label: "등록일", value: item.registeredAt },
    { label: "최초 순위", value: f != null ? `${f}위` : "—" },
    { label: "최근 순위", value: r != null ? `${r}위` : measured(item).length ? "순위밖" : "—" },
    { label: "전일 대비", node: <DiffBadge diff={dayDiff(item)} /> },
    // 방문자·블로그 리뷰 수는 네이버 플레이스에만 있다
    ...(item.platform === "place"
      ? [
          { label: "방문자리뷰", value: lastVisit != null ? lastVisit.toLocaleString() : "—" },
          { label: "블로그리뷰", value: lastBlog != null ? lastBlog.toLocaleString() : "—" },
        ]
      : []),
  ];

  return (
    <div className="sticky left-0 w-[100cqw] md:static md:w-auto border-t border-brand-border bg-white px-4 md:px-5 py-5">
      <div className="flex items-center gap-3">
        <span className="h-10 w-10 rounded-xl flex items-center justify-center text-[14px] font-bold text-white shrink-0" style={{ background: "var(--gradient-point)" }}>
          {(item.name ?? item.keyword).charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="text-[16px] font-extrabold text-brand-dark truncate">{item.keyword}</p>
          <p className="text-[12px] text-brand-sub">
            {meta.idLabel} {item.targetId ?? "—"}
          </p>
        </div>
        <span className="flex-1" />
        {item.url && (
          <a href={item.url} target="_blank" rel="noreferrer" className="rounded-lg bg-brand-primary-50 px-3 py-1.5 text-[12.5px] font-bold text-brand-primary hover:underline">
            {meta.linkLabel} ↗
          </a>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-1.5 md:gap-2">
        {tiles.map((t) => (
          <div key={t.label} className="min-w-0 rounded-lg md:rounded-xl border border-brand-border px-2 py-1.5 md:px-3 md:py-2.5">
            <p className="truncate text-[10.5px] md:text-[11.5px] text-brand-sub">{t.label}</p>
            <div className="mt-0.5 truncate text-[12.5px] md:text-[14px] font-extrabold text-brand-dark tabular-nums">{t.node ?? t.value}</div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11.5px] text-brand-muted">
        · 표시된 값은 <b className="font-semibold text-brand-sub">마지막으로 측정된 순위</b>입니다(오늘 측정 전일 수 있습니다).
      </p>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-[14px] font-bold text-brand-dark">순위 추이</p>
        <div className="flex items-center gap-1">
          {([7, 30, 60] as const).map((d, i, all) => {
            // 앞 단계보다 쌓인 기록이 없으면 더 긴 기간은 보여줄 게 같다 — 막아 둔다
            const disabled = i > 0 && history.length <= all[i - 1];
            return (
              <button
                key={d}
                type="button"
                onClick={() => onRange(d)}
                disabled={disabled}
                aria-pressed={range === d}
                className={`rounded-lg px-2.5 py-1 text-[12px] font-bold transition-colors ${
                  range === d ? "bg-brand-dark text-white" : "bg-brand-lighter text-brand-sub hover:bg-brand-border/60"
                } disabled:bg-brand-lighter/60 disabled:text-brand-muted/50 disabled:cursor-not-allowed`}
              >
                {d}일
              </button>
            );
          })}
        </div>
      </div>

      {recent.length > 0 && (
        <div className="mt-3 flex overflow-x-auto scrollbar-none">
          {recent.map((p, i) => (
            <div key={p.date} className={`flex-1 min-w-[58px] px-2 py-0.5 text-center ${i > 0 ? "border-l border-brand-border" : ""}`}>
              <p className="text-[11px] text-brand-muted tabular-nums">{p.date.slice(5).replace("-", "/")}</p>
              <p className={`mt-0.5 text-[15px] leading-tight font-extrabold tabular-nums ${i === 0 ? "text-brand-primary" : "text-brand-dark"}`}>
                {p.rank != null ? `${p.rank}위` : "밖"}
              </p>
              <p className="mt-0.5 text-[11px] text-brand-muted tabular-nums">방 {p.visit != null ? p.visit.toLocaleString() : "—"}</p>
              <p className="text-[11px] text-brand-muted tabular-nums">블 {p.blog != null ? p.blog.toLocaleString() : "—"}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <TrendChart points={pts} />
      </div>
    </div>
  );
}

/* ── 순위 추적 추가 — 채널 탭 아래에 펼쳐지는 입력 패널(개발본과 같은 자리·항목) ── */
const ADD_FIELD: Record<"place" | "shopping", { icon: string; idLabel: string; ph: string; note: string; url: (id: string) => string }> = {
  place: {
    icon: "🗺️", idLabel: "플레이스 ID", ph: "예: 18709548",
    note: "네이버 플레이스 순위는 300위까지 조회할 수 있어요.",
    url: (id) => `https://m.place.naver.com/place/${id}`,
  },
  shopping: {
    icon: "🛍️", idLabel: "상품번호(mid값)", ph: "예: 88012345",
    note: "네이버 쇼핑 순위는 300위까지 조회할 수 있어요.",
    url: (id) => `https://search.shopping.naver.com/catalog/${id}`,
  },
};

function AddPanel({
  platform, demo, groupList, onAddGroup, onClose, onAdded,
}: {
  platform: "place" | "shopping";
  demo: boolean;
  groupList: { id: number; name: string }[];
  onAddGroup: (name: string) => number | null;
  onClose: () => void;
  onAdded: (it: RankBoardItem, gid: number | null) => void;
}) {
  const meta = platformMeta(platform);
  const f = ADD_FIELD[platform];
  const [pid, setPid] = useState("");
  const [keyword, setKeyword] = useState("");
  const [gid, setGid] = useState<string>("");
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [newGroup, setNewGroup] = useState("");
  const [saving, setSaving] = useState(false);

  const fieldCls =
    "w-full rounded-xl border border-brand-border bg-white px-3.5 py-3 text-[14px] font-semibold text-brand-dark placeholder:font-medium placeholder:text-brand-muted focus:outline-none focus:border-brand-primary";

  const createGroup = () => {
    const name = newGroup.trim();
    if (!name) return;
    const id = onAddGroup(name);
    if (id != null) setGid(String(id));
    setNewGroup("");
    setNewGroupOpen(false);
  };

  const submit = async () => {
    const id = pid.trim();
    if (!/^\d{5,}$/.test(id)) return toast.error(`${f.idLabel}를 숫자로 입력해 주세요`);
    if (!keyword.trim()) return toast.error("키워드를 입력해 주세요");
    setSaving(true);
    const url = f.url(id);
    const base: RankBoardItem = {
      id: `local-${Date.now()}`,
      platform,
      keyword: keyword.trim(),
      name: null,
      url,
      targetId: id,
      registeredAt: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date()),
      history: [],
    };
    if (demo) {
      setSaving(false);
      onAdded(base, gid ? Number(gid) : null);
      return;
    }
    const res = await addRankKeyword({ platform, keyword: keyword.trim(), targetName: "", targetUrl: url });
    setSaving(false);
    if ("error" in res) return toast.error(res.error);
    onAdded({ ...base, id: res.id }, gid ? Number(gid) : null);
  };

  return (
    <div className="animate-be-fade rounded-2xl border border-brand-primary bg-white px-5 py-4 shadow-[0_20px_48px_-16px_rgba(17,29,55,.3)]">
      <p className="text-[15px] font-extrabold text-brand-dark">
        <span className="mr-1.5">{f.icon}</span>{meta.label} 순위 추적 추가
      </p>
      <p className="mt-1 text-[12.5px] text-brand-sub">{f.note} 추가 시 당일 순위부터 확인 가능하며 데이터가 축적됩니다.</p>

      {/* 플레이스 ID · 키워드 · 그룹을 한 줄에 둔다 */}
      <div className="mt-3.5 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-start">
        <div>
          <label htmlFor="rank-add-pid" className="block text-[12.5px] font-bold text-brand-dark mb-1.5">
            {f.idLabel} <span className="text-brand-error">*</span>
          </label>
          <input id="rank-add-pid" autoFocus value={pid} onChange={(e) => setPid(e.target.value.replace(/[^0-9]/g, ""))} placeholder={f.ph} inputMode="numeric" className={fieldCls} />
        </div>
        <div>
          <label htmlFor="rank-add-kw" className="block text-[12.5px] font-bold text-brand-dark mb-1.5">
            키워드 <span className="text-brand-error">*</span>
          </label>
          <input
            id="rank-add-kw"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="예: 마포 맛집"
            className={fieldCls}
          />
        </div>
        <div>
          <span className="block text-[12.5px] font-bold text-brand-dark mb-1.5">
            그룹 <span className="font-medium text-brand-muted">· 나중에 드래그로 옮길 수 있습니다</span>
          </span>
          <div className="flex items-center gap-2">
            {newGroupOpen ? (
              <>
                <input
                  autoFocus
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      createGroup();
                    }
                  }}
                  placeholder="새 그룹 이름 (예: 강남점)"
                  maxLength={20}
                  className="w-[190px] rounded-xl border border-brand-border bg-white px-3 py-3 text-[13.5px] font-semibold text-brand-dark focus:outline-none focus:border-brand-primary"
                />
                <button type="button" onClick={createGroup} className="shrink-0 rounded-xl border border-brand-primary px-3.5 py-3 text-[13px] font-bold text-brand-primary hover:bg-brand-primary-50">만들기</button>
                <button type="button" onClick={() => { setNewGroupOpen(false); setNewGroup(""); }} className="shrink-0 rounded-xl border border-brand-border px-3.5 py-3 text-[13px] font-semibold text-brand-sub">취소</button>
              </>
            ) : (
              <>
                <select value={gid} onChange={(e) => setGid(e.target.value)} className="w-[190px] rounded-xl border border-brand-border bg-white px-3 py-3 text-[13.5px] font-semibold text-brand-dark focus:outline-none focus:border-brand-primary">
                  <option value="">미분류</option>
                  {groupList.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                <button type="button" onClick={() => setNewGroupOpen(true)} className="shrink-0 rounded-xl border border-brand-primary px-3.5 py-3 text-[13px] font-bold text-brand-primary hover:bg-brand-primary-50">
                  + 새 그룹
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <button type="button" onClick={onClose} className="rounded-xl border border-brand-border bg-white py-3 text-[14px] font-bold text-brand-dark hover:bg-brand-lighter">
          취소
        </button>
        <button type="button" onClick={submit} disabled={saving} className="rounded-xl bg-brand-primary py-3 text-[14px] font-bold text-white hover:bg-brand-primary-hover disabled:opacity-60">
          {saving ? "추가 중…" : "순위 검색 추가"}
        </button>
      </div>
    </div>
  );
}

/* ── 추적 중단 확인 — 업체명을 입력해야 지운다 ─────────────── */
function DeleteConfirm({ item, onClose, onConfirm }: { item: RankBoardItem; onClose: () => void; onConfirm: () => void }) {
  const target = item.name ?? item.keyword;
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Modal title="추적을 중단할까요?" onClose={onClose}>
      <p className="text-[14px] text-brand-sub leading-relaxed">
        지금까지 쌓인 순위 기록도 함께 사라집니다. 되돌릴 수 없어요.
      </p>
      <label className="mt-4 block text-[13px] text-brand-sub">
        계속하려면 <b className="font-bold text-brand-dark">{target}</b>를 입력하세요
      </label>
      <input autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={target} className={`${inputCls} mt-1.5`} />
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-xl border border-brand-border px-4 py-2.5 text-[14px] font-semibold text-brand-sub">취소</button>
        <button
          type="button"
          disabled={typed.trim() !== target || busy}
          onClick={async () => {
            setBusy(true);
            await onConfirm();
            setBusy(false);
          }}
          className="rounded-xl bg-brand-error px-4 py-2.5 text-[14px] font-bold text-white disabled:opacity-40"
        >
          추적 중단
        </button>
      </div>
    </Modal>
  );
}

/* ── 편성 — 이 그룹에 넣을 키워드 고르기 ────────────────────── */
function AssignModal({
  groupName, items, groupNameOf, isIn, onSave, onClose,
}: {
  groupName: string;
  items: RankBoardItem[];
  groupNameOf: (id: string) => string | null;
  isIn: (id: string) => boolean;
  onSave: (inIds: string[], outIds: string[]) => void;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<Set<string>>(() => new Set(items.filter((it) => isIn(it.id)).map((it) => it.id)));
  const [q, setQ] = useState("");
  const list = items.filter((it) => {
    const s = q.trim().toLowerCase();
    return !s || (it.name ?? "").toLowerCase().includes(s) || it.keyword.toLowerCase().includes(s);
  });
  const moving = [...picked].filter((id) => !isIn(id) && groupNameOf(id)).length;
  return (
    <Modal title={`「${groupName}」 편성`} onClose={onClose} width="max-w-lg">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="캠페인명·키워드로 찾기" className={inputCls} />
      <ul className="mt-3 max-h-[320px] overflow-y-auto divide-y divide-[color:var(--border)] rounded-xl border border-brand-border">
        {list.map((it) => {
          const on = picked.has(it.id);
          const other = !isIn(it.id) ? groupNameOf(it.id) : null;
          return (
            <li key={it.id}>
              <label className="flex items-center gap-3 px-3.5 py-2.5 cursor-pointer hover:bg-brand-lighter">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() =>
                    setPicked((s) => {
                      const n = new Set(s);
                      if (n.has(it.id)) n.delete(it.id);
                      else n.add(it.id);
                      return n;
                    })
                  }
                  className="h-4 w-4 accent-[color:var(--point-500)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-bold text-brand-dark truncate">{it.name ?? it.keyword}</span>
                  <span className="block text-[12px] text-brand-sub truncate">{it.keyword}</span>
                </span>
                {other && <span className="text-[11.5px] text-brand-muted shrink-0">현재 {other}</span>}
              </label>
            </li>
          );
        })}
        {list.length === 0 && <li className="px-4 py-8 text-center text-[13px] text-brand-sub">찾는 키워드가 없습니다.</li>}
      </ul>
      {moving > 0 && <p className="mt-2 text-[12px] text-brand-warning">다른 그룹에 있던 {moving}개는 이 그룹으로 옮겨집니다.</p>}
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-xl border border-brand-border px-4 py-2.5 text-[14px] font-semibold text-brand-sub">취소</button>
        <button
          type="button"
          onClick={() => onSave([...picked], items.filter((it) => isIn(it.id) && !picked.has(it.id)).map((it) => it.id))}
          className="rounded-xl bg-brand-primary px-4 py-2.5 text-[14px] font-bold text-white"
        >
          저장
        </button>
      </div>
    </Modal>
  );
}
