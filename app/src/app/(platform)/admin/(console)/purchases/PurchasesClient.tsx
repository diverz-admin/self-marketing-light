"use client";

import { Fragment, useCallback, useMemo, useState, useTransition } from "react";
import {
  Card, TableShell, Th, Td, EmptyState, Badge, SearchInput, StatCard, Tabs, InlineSelect,
  Button, Modal, ModalFooter, Field, Input, Select, Textarea, Notice,
} from "@/components/admin/ui";
import { formatKRW, formatNumber, formatDate, reviewTypeLabel } from "@/lib/admin-format";
import { exportToExcel } from "@/lib/excel-export";
import {
  PURCHASE_SOURCES, purchaseSourceLabel, sourceBadgeLabel, matchesTab, type PurchaseTarget,
} from "@/lib/purchase-source";
import {
  upsertPurchaseOrder, deletePurchaseOrder, completePurchaseOrder,
  type PurchaseOrderInput,
} from "../actions";

/**
 * 발주 관리 — 신청 건 한 줄에 발주(매입)를 붙인다.
 *
 * 신청 화면이 상품마다 달라 데이터 모양도 다르므로, 목록은 공통 항목만 보여주고
 * 상품별 값은 탭으로 나눠 확인한다. 한 건을 여러 업체에 나눠 발주할 수 있다.
 */
export type PurchaseLine = PurchaseTarget & {
  purchases: {
    id: string;
    vendorName: string;
    vendorContact: string | null;
    title: string;
    quantity: number;
    purchaseAmount: number;
    status: string;
    settleStatus: string;
    orderedAt: string | null;
    settledAt: string | null;
    memo: string | null;
    adminName: string;
  }[];
};

const STATUS_META: Record<string, { label: string; tone: "gray" | "blue" | "amber" | "green" | "red" }> = {
  draft: { label: "발주 전", tone: "gray" },
  ordered: { label: "발주 완료", tone: "blue" },
  running: { label: "작업중", tone: "amber" },
  done: { label: "작업 완료", tone: "green" },
  canceled: { label: "취소", tone: "red" },
};

const SETTLE_META: Record<string, { label: string; tone: "amber" | "blue" | "green" }> = {
  unpaid: { label: "미지급", tone: "amber" },
  scheduled: { label: "지급 예정", tone: "blue" },
  paid: { label: "지급 완료", tone: "green" },
};

/**
 * 탭마다 보여줄 컬럼.
 *
 * 상품별로 발주에 필요한 값이 달라서 목록도 그에 맞춘다.
 * 여기에 없는 탭은 아래 기본 컬럼(관리용 전 항목)을 쓴다.
 * 펼치기·발주·처리 칸은 화면 동작에 필요해 항상 붙는다.
 */
type ColumnKey =
  | "createdAt" | "advertiser" | "source" | "product"
  | "target" | "storeName" | "keyword" | "link" | "quantity" | "period"
  | "image" | "receipt" | "reviewType" | "photoReview"
  | "sale" | "purchase" | "margin";

const TAB_COLUMNS: Record<string, ColumnKey[]> = {
  // 보장형도 플레이스를 올리는 건이라 상위노출과 같은 항목으로 본다
  reward_place: ["advertiser", "link", "keyword", "product", "period"],
  guaranteed: ["advertiser", "link", "keyword", "product", "period"],
  reward_shopping: ["advertiser", "link", "keyword", "product", "period"],
  reward_coupang: ["advertiser", "link", "keyword", "product", "period"],
  review_place_blog: ["advertiser", "storeName", "link", "keyword", "quantity", "period", "image"],
  review_place_receipt: ["advertiser", "storeName", "link", "keyword", "quantity", "period", "receipt"],
  review_shopping: ["advertiser", "storeName", "link", "keyword", "reviewType", "quantity", "photoReview"],
  review_coupang: ["advertiser", "storeName", "link", "keyword", "reviewType", "quantity", "photoReview"],
};

/** 링크가 가리키는 대상이 탭마다 다르다 */
const LINK_LABEL: Record<string, string> = {
  reward_place: "플레이스 링크",
  guaranteed: "플레이스 링크",
  review_place_blog: "플레이스 링크",
  review_place_receipt: "플레이스 링크",
  reward_shopping: "상품 링크",
  reward_coupang: "상품 링크",
  review_shopping: "상품 링크",
  review_coupang: "상품 링크",
};

/** 전체 탭 — 관리용이라 손익까지 본다 */
const DEFAULT_COLUMNS: ColumnKey[] = [
  "createdAt", "advertiser", "source", "product", "target", "quantity", "sale", "purchase", "margin",
];

/** 상품 탭 — 업체에 넘길 데이터라 매출·매입·마진은 감춘다 */
const PRODUCT_TAB_COLUMNS: ColumnKey[] = ["createdAt", "advertiser", "product", "target", "quantity", "period"];

const COLUMN_HEAD: Record<ColumnKey, { label: string; className?: string }> = {
  createdAt: { label: "신청일" },
  advertiser: { label: "광고주" },
  source: { label: "구분" },
  product: { label: "상품" },
  target: { label: "대상 · 키워드" },
  storeName: { label: "상호명" },
  keyword: { label: "키워드" },
  link: { label: "플레이스 링크" },
  quantity: { label: "수량", className: "text-center" },
  period: { label: "기간" },
  image: { label: "포스팅 이미지" },
  receipt: { label: "영수증 첨부" },
  reviewType: { label: "유형" },
  photoReview: { label: "포토리뷰" },
  sale: { label: "매출", className: "text-right" },
  purchase: { label: "매입", className: "text-right" },
  margin: { label: "마진", className: "text-right" },
};

/** 작업 기간 — 엑셀에는 한 칸에 넣는다 */
function periodText(l: { startDate: string | null; endDate: string | null }) {
  if (!l.startDate && !l.endDate) return "";
  return `${l.startDate ?? ""} ~ ${l.endDate ?? ""}`;
}

/**
 * 상품 탭별 발주용 엑셀 컬럼.
 *
 * 업체에 넘기는 파일이라 상품마다 필요한 항목만 담는다.
 * 여기에 없는 상품은 아래 기본 컬럼(관리용 전체 항목)으로 떨어진다.
 */
const placeExportRow = (l: PurchaseLine) => ({
  "플레이스링크": l.targetUrl ?? "",
  "순위 상승 키워드": l.keyword,
  "상품": l.productName,
  "작업 기간": periodText(l),
  "일 작업량": l.dailyQty ?? "",
});

const shoppingExportRow = (l: PurchaseLine) => ({
  "상품링크": l.targetUrl ?? "",
  "순위 상승 키워드": l.keyword,
  "상품": l.productName,
  "기간": periodText(l),
  "일 작업량": l.dailyQty ?? "",
});

/** setting 값 꺼내기 — 없으면 빈칸 */
const sv = (l: PurchaseLine, key: string) => {
  const v = l.setting[key];
  if (v == null) return "";
  if (Array.isArray(v)) return v.join(" ");
  if (typeof v === "boolean") return v ? "Y" : "N";
  return String(v);
};

/** 쇼핑 리뷰 — 네이버 쇼핑·쿠팡이 같은 폼이라 항목도 같다 */
const shoppingReviewExportRow = (l: PurchaseLine) => ({
  "캠페인명": l.targetName,
  "상품 링크": l.targetUrl ?? "",
  "채널": sv(l, "channel"),
  "리뷰 유형": l.reviewType ? (reviewTypeLabel[l.reviewType] ?? l.reviewType) : "",
  "제목 유형": sv(l, "titleType"),
  "메인 키워드": l.keyword,
  "포토리뷰": l.setting.photoReview === true ? "사용" : "미사용",
  "포스팅 이미지 (구글 드라이브링크)": sv(l, "postingUrl"),
  "작성 가이드": l.requestNote ?? "",
  "일 작업량": sv(l, "dailyCount"),
  "총 수량": l.quantity,
});

const EXPORT_COLUMNS: Record<string, (l: PurchaseLine) => Record<string, string | number>> = {
  reward_place: placeExportRow,
  guaranteed: placeExportRow,
  // 쿠팡도 상품을 올리는 건이라 쇼핑 상위노출과 같은 항목을 쓴다
  reward_shopping: shoppingExportRow,
  reward_coupang: shoppingExportRow,
  // 블로그배포는 블로거가 글을 쓰는 데 필요한 값이 다 있어야 한다 (신청 폼 항목 전부)
  review_place_blog: (l) => ({
    "캠페인명": l.targetName,
    "플레이스 링크": l.targetUrl ?? "",
    "포스팅 유형": sv(l, "postingType"),
    "메인 키워드": l.keyword,
    "해시태그": sv(l, "hashtags"),
    "업체 정보": sv(l, "businessInfo"),
    "발행 시작일": l.startDate ?? "",
    "발행 일수": sv(l, "issueDays"),
    "일 발행량": sv(l, "dailyVolume"),
    "총 발행량": l.quantity,
    // 이미지 등록 — 직접 전달을 켠 건만 드라이브 링크가 있다
    "포스팅 이미지 직접 전달": l.setting.useCustomImage === true ? "사용" : "미사용",
    "포스팅 이미지 (구글 드라이브링크)": sv(l, "postingUrl"),
  }),
  // 영수증리뷰 — 신청 폼 항목 전부. 미첨부는 작업으로 진행돼 사업자번호가 필요하다
  review_place_receipt: (l) => ({
    "캠페인명": l.targetName,
    "플레이스 링크": l.targetUrl ?? "",
    "메인 키워드": l.keyword,
    "영수증 첨부": l.setting.receiptAttached === false ? "미첨부" : "첨부",
    "사업자번호": sv(l, "bizNumber"),
    "강조 내용": sv(l, "emphasis"),
    "발행 시작일": l.startDate ?? "",
    "발행 일수": sv(l, "issueDays"),
    "일 발행량": sv(l, "dailyVolume"),
    "총 발행량": l.quantity,
  }),
  review_shopping: shoppingReviewExportRow,
  review_coupang: shoppingReviewExportRow,
};

/** 전체 탭 · 아직 지정하지 않은 상품 — 관리용으로 전 항목을 담는다 */
function defaultExportRow(l: PurchaseLine): Record<string, string | number> {
  const live = l.purchases.filter((p) => p.status !== "canceled");
  const purchaseTotal = live.reduce((s, p) => s + p.purchaseAmount, 0);
  return {
    신청일: l.createdAt.slice(0, 10),
    광고주: l.advertiser,
    구분: purchaseSourceLabel[l.sourceType] ?? l.sourceType,
    상품: l.productName,
    대상: l.targetName,
    링크: l.targetUrl ?? "",
    키워드: l.keyword,
    수량: l.quantity,
    일작업량: l.dailyQty ?? "",
    작업기간: periodText(l),
    매출: l.saleAmount,
    매입: purchaseTotal,
    마진: l.saleAmount - purchaseTotal,
    발주처: l.purchases.map((p) => p.vendorName).join(", "),
    발주상태: l.purchases.map((p) => STATUS_META[p.status]?.label ?? p.status).join(", "),
    정산: l.purchases.map((p) => SETTLE_META[p.settleStatus]?.label ?? p.settleStatus).join(", "),
  };
}

/** 그 건의 발주일 — 여러 업체에 나눠 발주했으면 가장 늦은 날을 기준으로 본다 */
function orderedDateOf(line: { purchases: { orderedAt: string | null }[] }): string | null {
  const dates = line.purchases.map((p) => p.orderedAt).filter(Boolean) as string[];
  if (!dates.length) return null;
  return dates.sort()[dates.length - 1];
}

/** 발주가 걸렸는지로 거르는 필터 — 오늘 처리할 것을 먼저 본다 */
const PROGRESS_FILTERS = [
  { key: "all", label: "전체" },
  { key: "todo", label: "발주 필요" },
  { key: "done", label: "발주 완료" },
];

export function PurchasesClient({
  lines,
  couponUsed,
  pointGranted,
}: {
  lines: PurchaseLine[];
  couponUsed: number;
  pointGranted: number;
}) {
  const [source, setSource] = useState("all");
  const [progress, setProgress] = useState("all");
  const [query, setQuery] = useState("");
  // 발주 완료 건은 계속 쌓이므로 연/월/일로 좁혀 본다 (기준 = 발주일)
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [editing, setEditing] = useState<{ line: PurchaseLine; purchaseId?: string } | null>(null);

  const linesOfTab = useCallback(
    (key: string) => {
      if (key === "all") return lines;
      const tab = PURCHASE_SOURCES.find((t) => t.key === key);
      return tab ? lines.filter((l) => matchesTab(tab, l)) : [];
    },
    [lines],
  );

  const bySource = useMemo(() => linesOfTab(source), [linesOfTab, source]);

  const sourceCount = (key: string) => linesOfTab(key).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bySource.filter((l) => {
      if (progress === "todo" && l.purchases.length > 0) return false;
      if (progress === "done" && l.purchases.length === 0) return false;

      // 연/월/일은 발주 완료 목록에만 건다
      if (progress === "done" && (year || month || day)) {
        const d = orderedDateOf(l);
        if (!d) return false;
        if (year && d.slice(0, 4) !== year) return false;
        if (month && d.slice(5, 7) !== month) return false;
        if (day && d.slice(8, 10) !== day) return false;
      }

      if (!q) return true;
      return (
        l.advertiser.toLowerCase().includes(q) ||
        l.targetName.toLowerCase().includes(q) ||
        l.productName.toLowerCase().includes(q) ||
        l.keyword.toLowerCase().includes(q) ||
        l.purchases.some((p) => p.vendorName.toLowerCase().includes(q))
      );
    });
  }, [bySource, progress, query, year, month, day]);

  // 합계는 지금 보고 있는 탭 기준 — 상품별 손익을 따로 볼 수 있어야 한다
  const totalSale = bySource.reduce((s, l) => s + l.saleAmount, 0);
  const totalPurchase = bySource.reduce(
    (s, l) => s + l.purchases.filter((p) => p.status !== "canceled").reduce((a, p) => a + p.purchaseAmount, 0),
    0,
  );
  // 쿠폰·포인트는 전체 기준 값이라 "전체" 탭에서만 순이익에 반영한다
  const isAll = source === "all";
  const netProfit = totalSale - totalPurchase - (isAll ? couponUsed + pointGranted : 0);
  const netPct = totalSale > 0 ? Math.round((netProfit / totalSale) * 100) : 0;
  const todoCount = bySource.filter((l) => l.purchases.length === 0).length;

  // 실제로 발주일이 있는 건에서만 연/월/일 선택지를 뽑는다
  const doneDates = useMemo(
    () => bySource.map(orderedDateOf).filter(Boolean) as string[],
    [bySource],
  );
  const years = useMemo(
    () => [...new Set(doneDates.map((d) => d.slice(0, 4)))].sort((a, b) => b.localeCompare(a)),
    [doneDates],
  );
  const months = useMemo(
    () =>
      [...new Set(doneDates.filter((d) => !year || d.slice(0, 4) === year).map((d) => d.slice(5, 7)))].sort(
        (a, b) => b.localeCompare(a),
      ),
    [doneDates, year],
  );
  const days = useMemo(
    () =>
      [
        ...new Set(
          doneDates
            .filter((d) => (!year || d.slice(0, 4) === year) && (!month || d.slice(5, 7) === month))
            .map((d) => d.slice(8, 10)),
        ),
      ].sort((a, b) => b.localeCompare(a)),
    [doneDates, year, month],
  );

  // 전체 탭은 구분 열이 필요하지만 상품 탭에서는 뻔한 값이라 뺀다
  const columns = TAB_COLUMNS[source] ?? (source === "all" ? DEFAULT_COLUMNS : PRODUCT_TAB_COLUMNS);

  /** 지금 보고 있는 목록을 그대로 엑셀로 — 업체에 넘길 발주 파일 */
  const exportRows = () => {
    const build = EXPORT_COLUMNS[source] ?? defaultExportRow;
    const name = source === "all" ? "전체" : (purchaseSourceLabel[source] ?? source);
    exportToExcel({ fileName: `발주_${name}`, rows: filtered.map(build) });
  };

  /** 탭·필터를 바꾸면 기간 조건은 초기화한다 (안 보이는 조건이 걸려 있으면 헷갈린다) */
  const changeProgress = (key: string) => {
    setProgress(key);
    if (key !== "done") {
      setYear("");
      setMonth("");
      setDay("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="매출" value={formatKRW(totalSale)} sub={isAll ? "전체 신청 금액" : "이 상품 신청 금액"} />
        <StatCard label="원가" value={formatKRW(totalPurchase)} sub="업체 발주 금액" tone="blue" />
        <StatCard
          label="쿠폰 사용"
          value={formatKRW(couponUsed)}
          sub={isAll ? "할인해 준 금액" : "전체 기준"}
          tone="purple"
        />
        <StatCard
          label="포인트 지급액"
          value={formatKRW(pointGranted)}
          sub={isAll ? "충전 보너스로 나간 포인트" : "전체 기준"}
          tone="amber"
        />
        <StatCard
          label="순이익"
          value={formatKRW(netProfit)}
          sub={totalSale > 0 ? `이익률 ${netPct}%` : "매출 없음"}
          tone={netProfit < 0 ? "red" : "green"}
        />
      </div>

      {/* 상품마다 신청 데이터가 다르므로 탭으로 나눠 본다 */}
      <Tabs
        tabs={[
          { key: "all", label: "전체", count: sourceCount("all") },
          ...PURCHASE_SOURCES.map((s) => ({ key: s.key, label: s.label, count: sourceCount(s.key) })),
        ]}
        value={source}
        onChange={setSource}
      />

      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-brand-border flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {PROGRESS_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => changeProgress(f.key)}
                className={`px-3 py-1.5 rounded-xl text-[13px] font-bold transition-all ${
                  progress === f.key
                    ? "bg-brand-primary text-white"
                    : "bg-brand-light text-brand-sub hover:bg-brand-border"
                }`}
              >
                {f.label}
                <span className="ml-1.5 tabular-nums opacity-70">
                  {f.key === "all"
                    ? bySource.length
                    : f.key === "todo"
                      ? todoCount
                      : bySource.length - todoCount}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="광고주 · 대상 · 키워드 · 발주처 검색"
              className="w-full sm:w-72"
            />
            {filtered.length > 0 && (
              <Button variant="secondary" onClick={exportRows}>
                엑셀 내보내기
              </Button>
            )}
          </div>
        </div>

        {/* 발주 완료는 계속 쌓이므로 발주일로 좁혀 본다 */}
        {progress === "done" && (
          <div className="flex items-center gap-2 px-5 py-3 border-b border-brand-border bg-brand-light/60 flex-wrap">
            <span className="text-[13px] font-bold text-brand-dark mr-1">발주일 조회</span>
            <InlineSelect
              value={year}
              aria-label="발주 연도"
              onChange={(e) => {
                setYear(e.target.value);
                setMonth("");
                setDay("");
              }}
            >
              <option value="">전체 연도</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}년
                </option>
              ))}
            </InlineSelect>
            <InlineSelect
              value={month}
              aria-label="발주 월"
              onChange={(e) => {
                setMonth(e.target.value);
                setDay("");
              }}
            >
              <option value="">전체 월</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {Number(m)}월
                </option>
              ))}
            </InlineSelect>
            <InlineSelect value={day} aria-label="발주 일" onChange={(e) => setDay(e.target.value)}>
              <option value="">전체 일</option>
              {days.map((d) => (
                <option key={d} value={d}>
                  {Number(d)}일
                </option>
              ))}
            </InlineSelect>
            <span className="text-[12px] text-brand-muted ml-1 tabular-nums">
              <span className="font-bold text-brand-dark">{filtered.length}</span>건
            </span>
            {(year || month || day) && (
              <button
                onClick={() => {
                  setYear("");
                  setMonth("");
                  setDay("");
                }}
                className="text-[12px] font-semibold text-brand-sub hover:text-brand-primary transition-colors"
              >
                기간 해제
              </button>
            )}
          </div>
        )}

        {filtered.length ? (
          <>
            <TableShell
              head={
                <>
                  {columns.map((c) => (
                    <Th key={c} className={COLUMN_HEAD[c].className}>
                      {c === "link" ? (LINK_LABEL[source] ?? COLUMN_HEAD[c].label) : COLUMN_HEAD[c].label}
                    </Th>
                  ))}
                  <Th>발주 현황</Th>
                  <Th className="text-center">처리</Th>
                </>
              }
            >
              {filtered.map((l) => (
                <LineRow
                  key={l.sourceId}
                  line={l}
                  columns={columns}
                  onEdit={(purchaseId) => setEditing({ line: l, purchaseId })}
                />
              ))}
            </TableShell>
            <div className="px-5 py-3 border-t border-brand-border text-[12.5px] text-brand-muted">
              총 <span className="font-bold text-brand-dark">{filtered.length}</span>건
            </div>
          </>
        ) : (
          <EmptyState message="해당 조건의 신청 건이 없습니다." />
        )}
      </Card>

      {editing && (
        <PurchaseModal
          line={editing.line}
          purchase={editing.line.purchases.find((p) => p.id === editing.purchaseId) ?? null}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function LineRow({
  line,
  columns,
  onEdit,
}: {
  line: PurchaseLine;
  columns: ColumnKey[];
  /** 발주가 있으면 그 건을 수정한다 */
  onEdit: (purchaseId?: string) => void;
}) {
  const live = line.purchases.filter((p) => p.status !== "canceled");
  const purchaseTotal = live.reduce((s, p) => s + p.purchaseAmount, 0);
  const hasPurchase = line.purchases.length > 0;
  const profit = line.saleAmount - purchaseTotal;
  const rate = line.saleAmount > 0 ? Math.round((profit / line.saleAmount) * 100) : null;

  const [completing, startComplete] = useTransition();

  /** 엑셀을 넘겼다는 사실만 한 번에 남긴다 — 발주처·매입가는 수정에서 채운다 */
  const onComplete = () =>
    startComplete(async () => {
      await completePurchaseOrder({
        sourceType: line.sourceType,
        sourceId: line.sourceId,
        title: `${line.productName} · ${line.targetName}`,
        quantity: line.quantity,
      });
    });

  const cell = (key: ColumnKey) => {
    switch (key) {
      case "createdAt":
        return (
          <Td key={key} className="text-[12.5px] text-brand-sub whitespace-nowrap">
            {formatDate(line.createdAt)}
          </Td>
        );
      case "advertiser":
        return (
          <Td key={key} className="font-semibold text-brand-dark">
            {line.advertiser}
          </Td>
        );
      case "source":
        return (
          <Td key={key}>
            <Badge tone="gray">{sourceBadgeLabel(line)}</Badge>
          </Td>
        );
      case "product":
        return (
          <Td key={key} className="text-[13px] text-brand-text">
            {line.productName}
          </Td>
        );
      case "target":
        return (
          <Td key={key}>
            <div className="text-[13px] text-brand-dark">{line.targetName}</div>
            {line.keyword && <div className="text-[12px] text-brand-muted">{line.keyword}</div>}
          </Td>
        );
      case "storeName":
        return (
          <Td key={key} className="text-[13px] text-brand-dark font-medium">
            {line.targetName}
          </Td>
        );
      case "keyword":
        return (
          <Td key={key} className="text-[13px] text-brand-text">
            {line.keyword || <span className="text-brand-muted">-</span>}
          </Td>
        );
      case "link":
        return (
          <Td key={key}>
            {line.targetUrl ? (
              <a
                href={line.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-brand-primary hover:underline break-all"
              >
                {line.targetName}
              </a>
            ) : (
              <span className="text-[13px] text-brand-muted">-</span>
            )}
          </Td>
        );
      case "quantity":
        return (
          <Td key={key} className="text-center tabular-nums">
            {formatNumber(line.quantity)}
            {line.dailyQty != null && (
              <div className="text-[12px] text-brand-muted">일 {formatNumber(line.dailyQty)}</div>
            )}
          </Td>
        );
      case "period":
        return (
          <Td key={key} className="text-[12.5px] text-brand-sub whitespace-nowrap">
            {line.startDate || line.endDate ? (
              <>
                {line.startDate ? formatDate(line.startDate) : "-"}
                <br />~ {line.endDate ? formatDate(line.endDate) : "-"}
              </>
            ) : (
              <span className="text-brand-muted">미정</span>
            )}
          </Td>
        );
      case "image": {
        // 고객이 이미지를 직접 넘기는 건은 발주 전에 드라이브부터 확인해야 한다
        const direct = line.setting.useCustomImage === true;
        const url = typeof line.setting.postingUrl === "string" ? line.setting.postingUrl : "";
        return (
          <Td key={key} className="text-[13px]">
            {direct ? (
              <>
                <Badge tone="blue">직접 전달</Badge>
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 block text-[12px] text-brand-primary hover:underline break-all"
                  >
                    드라이브 링크
                  </a>
                ) : (
                  <div className="mt-0.5 text-[12px] text-red-500">링크 미입력</div>
                )}
              </>
            ) : (
              <span className="text-brand-muted">플레이스 이미지</span>
            )}
          </Td>
        );
      }
      case "receipt": {
        // 미첨부는 작업으로 진행돼 사업자번호가 있어야 발주할 수 있다
        const attached = line.setting.receiptAttached !== false;
        const biz = typeof line.setting.bizNumber === "string" ? line.setting.bizNumber : "";
        return (
          <Td key={key} className="text-[13px]">
            <Badge tone={attached ? "green" : "amber"}>{attached ? "첨부" : "미첨부"}</Badge>
            {!attached && (
              <div className={`mt-0.5 text-[12px] ${biz ? "text-brand-muted" : "text-red-500"}`}>
                {biz || "사업자번호 미입력"}
              </div>
            )}
          </Td>
        );
      }
      case "reviewType":
        return (
          <Td key={key}>
            {line.reviewType ? (
              <Badge tone={line.reviewType === "product_provided" ? "purple" : "amber"}>
                {reviewTypeLabel[line.reviewType] ?? line.reviewType}
              </Badge>
            ) : (
              <span className="text-brand-muted">-</span>
            )}
            {/* 쇼핑 리뷰는 네이버·쿠팡을 한 화면에서 받아 채널을 같이 봐야 한다 */}
            {typeof line.setting.channel === "string" && line.setting.channel && (
              <div className="mt-0.5 text-[12px] text-brand-muted">{line.setting.channel}</div>
            )}
          </Td>
        );
      case "photoReview": {
        const on = line.setting.photoReview === true;
        const url = typeof line.setting.postingUrl === "string" ? line.setting.postingUrl : "";
        return (
          <Td key={key} className="text-[13px]">
            {on ? (
              <>
                <Badge tone="blue">사용</Badge>
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 block text-[12px] text-brand-primary hover:underline break-all"
                  >
                    드라이브 링크
                  </a>
                ) : (
                  <div className="mt-0.5 text-[12px] text-red-500">링크 미입력</div>
                )}
              </>
            ) : (
              <span className="text-brand-muted">미사용</span>
            )}
          </Td>
        );
      }
      case "sale":
        return (
          <Td key={key} className="text-right tabular-nums text-brand-dark">
            {formatKRW(line.saleAmount)}
          </Td>
        );
      case "purchase":
        return (
          <Td key={key} className="text-right tabular-nums text-brand-dark">
            {hasPurchase ? formatKRW(purchaseTotal) : <span className="text-brand-muted">-</span>}
          </Td>
        );
      case "margin":
        return (
          <Td key={key} className="text-right tabular-nums">
            {hasPurchase && rate != null ? (
              <>
                <div className={`font-semibold ${profit < 0 ? "text-red-500" : "text-brand-dark"}`}>
                  {formatKRW(profit)}
                </div>
                <div className={`text-[12px] ${rate < 0 ? "text-red-500" : "text-brand-muted"}`}>{rate}%</div>
              </>
            ) : (
              <span className="text-brand-muted">-</span>
            )}
          </Td>
        );
    }
  };

  return (
    // 발주가 안 걸린 줄은 첫 칸 왼쪽 띠로 눈에 띄게 한다 (칸을 더하지 않아 헤더와 어긋나지 않는다)
    <tr
      className={`hover:bg-brand-light/50 transition-colors align-top ${
        hasPurchase ? "" : "[&>td:first-child]:border-l-[3px] [&>td:first-child]:border-amber-400"
      }`}
    >
      {columns.map(cell)}

      <Td>
        {hasPurchase ? (
          <div className="flex flex-wrap gap-1">
            {line.purchases.map((p) => {
              const m = STATUS_META[p.status] ?? { label: p.status, tone: "gray" as const };
              return (
                <Badge key={p.id} tone={m.tone}>
                  {m.label}
                </Badge>
              );
            })}
          </div>
        ) : (
          <Badge tone="amber">발주 필요</Badge>
        )}
      </Td>

      {/* 엑셀을 뽑아 업체에 넘긴 뒤 한 번 눌러 발주 사실을 남긴다 */}
      <Td className="text-center">
        {hasPurchase ? (
          <Button size="sm" variant="secondary" onClick={() => onEdit(line.purchases[0].id)}>
            수정
          </Button>
        ) : (
          <Button size="sm" disabled={completing} onClick={onComplete}>
            {completing ? "처리 중..." : "발주 등록 완료"}
          </Button>
        )}
      </Td>
    </tr>
  );
}

function PurchaseModal({
  line,
  purchase,
  onClose,
}: {
  line: PurchaseLine;
  purchase: PurchaseLine["purchases"][number] | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState<PurchaseOrderInput>({
    id: purchase?.id,
    sourceType: line.sourceType,
    sourceId: line.sourceId,
    vendorName: purchase?.vendorName ?? "",
    vendorContact: purchase?.vendorContact ?? "",
    // 신청 내용을 기본값으로 깔아 준다 — 대부분 그대로 발주한다
    title: purchase?.title ?? `${line.productName} · ${line.targetName}`,
    quantity: String(purchase?.quantity ?? line.quantity),
    purchaseAmount: purchase ? String(purchase.purchaseAmount) : "",
    status: purchase?.status ?? "ordered",
    settleStatus: purchase?.settleStatus ?? "unpaid",
    orderedAt: purchase?.orderedAt ?? "",
    settledAt: purchase?.settledAt ?? "",
    memo: purchase?.memo ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof PurchaseOrderInput>(key: K, value: PurchaseOrderInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // 이미 걸린 다른 발주까지 합쳐야 실제 마진이 나온다
  const others = line.purchases
    .filter((p) => p.id !== purchase?.id && p.status !== "canceled")
    .reduce((s, p) => s + p.purchaseAmount, 0);
  const totalPurchase = others + Number(form.purchaseAmount || 0);
  const profit = line.saleAmount - totalPurchase;
  const rate = line.saleAmount > 0 ? Math.round((profit / line.saleAmount) * 100) : null;

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await upsertPurchaseOrder(form);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      onClose();
    });
  };

  const remove = () => {
    if (!purchase) return;
    setError(null);
    startTransition(async () => {
      const res = await deletePurchaseOrder(purchase.id);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      onClose();
    });
  };

  return (
    <Modal
      title={purchase ? "발주 수정" : "발주 등록"}
      description={`${line.advertiser} · ${line.targetName} — ${purchaseSourceLabel[line.sourceType] ?? line.sourceType}`}
      onClose={onClose}
      width="max-w-[680px]"
      footer={<ModalFooter onClose={onClose} onSubmit={submit} pending={pending} />}
    >
      {/* 신청 내용은 고치지 않는다 — 발주 조건을 정하는 화면이다 */}
      <div className="rounded-xl border border-brand-border bg-brand-light/60 p-4">
        <p className="text-[12px] font-bold text-brand-muted mb-2">신청 내용</p>
        <dl className="space-y-1 text-[13px]">
          <div className="flex gap-2">
            <dt className="w-[64px] shrink-0 text-brand-muted">상품</dt>
            <dd className="text-brand-dark">{line.productName}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-[64px] shrink-0 text-brand-muted">대상</dt>
            <dd className="min-w-0 text-brand-dark break-all">
              {line.targetName}
              {line.keyword && <span className="text-brand-muted"> · {line.keyword}</span>}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-[64px] shrink-0 text-brand-muted">수량 · 매출</dt>
            <dd className="text-brand-dark tabular-nums">
              {formatNumber(line.quantity)} · {formatKRW(line.saleAmount)}
            </dd>
          </div>
          {(line.startDate || line.endDate) && (
            <div className="flex gap-2">
              <dt className="w-[64px] shrink-0 text-brand-muted">기간</dt>
              <dd className="text-brand-dark">
                {line.startDate ? formatDate(line.startDate) : "-"} ~ {line.endDate ? formatDate(line.endDate) : "-"}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="발주처">
          <Input value={form.vendorName} onChange={(e) => set("vendorName", e.target.value)} placeholder="업체명" />
        </Field>
        <Field label="담당자 · 연락처">
          <Input
            value={form.vendorContact}
            onChange={(e) => set("vendorContact", e.target.value)}
            placeholder="담당자 / 010-0000-0000"
          />
        </Field>
      </div>

      <Field label="발주 내용">
        <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="수량">
          <Input value={form.quantity} onChange={(e) => set("quantity", e.target.value)} inputMode="numeric" />
        </Field>
        <Field label="매입가 (원)" hint="업체에 지급할 금액">
          <Input
            value={form.purchaseAmount}
            onChange={(e) => set("purchaseAmount", e.target.value)}
            inputMode="numeric"
            placeholder="0"
          />
        </Field>
        <Field label="마진" hint={others > 0 ? `다른 발주 ${formatKRW(others)} 포함` : `매출 ${formatKRW(line.saleAmount)}`}>
          <Input value={rate == null ? "-" : `${formatKRW(profit)} (${rate}%)`} readOnly disabled />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="발주 상태">
          <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
            {Object.entries(STATUS_META).map(([key, m]) => (
              <option key={key} value={key}>
                {m.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="발주일">
          <Input type="date" value={form.orderedAt} onChange={(e) => set("orderedAt", e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="정산 상태">
          <Select value={form.settleStatus} onChange={(e) => set("settleStatus", e.target.value)}>
            {Object.entries(SETTLE_META).map(([key, m]) => (
              <option key={key} value={key}>
                {m.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="지급일" hint="지급 완료로 두고 비워두면 오늘로 기록됩니다">
          <Input type="date" value={form.settledAt} onChange={(e) => set("settledAt", e.target.value)} />
        </Field>
      </div>

      <Field label="메모">
        <Textarea value={form.memo} onChange={(e) => set("memo", e.target.value)} className="min-h-[72px]" />
      </Field>

      {error && <Notice ok={false}>{error}</Notice>}

      {purchase && (
        <div className="pt-1 border-t border-brand-border mt-1">
          {confirmDelete ? (
            <div className="flex items-center justify-between gap-3 pt-3">
              <span className="text-[13px] text-brand-sub">이 발주를 삭제할까요? 되돌릴 수 없습니다.</span>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                  취소
                </Button>
                <Button size="sm" variant="danger" disabled={pending} onClick={remove}>
                  삭제
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="mt-3 text-[13px] font-semibold text-red-500 hover:underline"
            >
              발주 삭제
            </button>
          )}
        </div>
      )}
    </Modal>
  );
}
