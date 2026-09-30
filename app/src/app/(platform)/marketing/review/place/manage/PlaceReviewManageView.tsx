"use client";

import React, { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PeriodFilter, usePeriodFilter, NameChip, StatusFilterCards, ManageListHeader, type StatusKey } from "@/components/marketing/manage-ui";
import ChipInput from "@/components/marketing/ChipInput";
import { toast } from "@/components/ui/toast";
import { requestReviewCampaignChange, requestReviewPostChange, withdrawReviewPostChange } from "../../../actions";
import type { PlaceReviewPost, PlaceReviewRow, ReviewStatus } from "@/lib/place-review-types";

/**
 * 네이버 플레이스 리뷰 관리 — 개발본(rv_place_manage)과 같은 흐름.
 * KPI(전체·진행중·대기중) · 유형 탭(블로그배포·영수증리뷰) · 기간(신청일) · 상태 칩 · 표 · 행 상세(진행 현황·등록 정보·등록된 블로그)
 * 수정 요청은 캠페인 단위·글 단위 두 가지다.
 */

type TypeKey = "blog_distribute" | "receipt";
const TYPE_LABEL: Record<TypeKey, string> = { blog_distribute: "블로그배포", receipt: "영수증리뷰" };
const STATUS: Record<ReviewStatus, { label: string; bg: string; fg: string }> = {
  pending: { label: "대기중", bg: "#FFF4DE", fg: "#C58A0B" },
  running: { label: "진행중", bg: "#E3F6EA", fg: "#1E9E54" },
  done: { label: "완료", bg: "#E7ECFF", fg: "#2452EB" },
  paused: { label: "일시정지", bg: "#FFE3E8", fg: "#E5484D" },
};
const STATUS_KEYS: ("all" | ReviewStatus)[] = ["all", "pending", "running", "done", "paused"];

const mmdd = (d: string) => d.slice(5).replace("-", ".");
const dot = (d: string) => d.replaceAll("-", ".");
const inputCls =
  "w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-[14px] font-semibold text-brand-dark placeholder:font-medium placeholder:text-brand-muted focus:outline-none focus:border-brand-primary";

function Pill({ status }: { status: ReviewStatus }) {
  const s = STATUS[status];
  return (
    <span className="inline-flex items-center rounded-md px-2.5 py-1 text-[12.5px] font-bold whitespace-nowrap" style={{ background: s.bg, color: s.fg }}>
      {s.label}
    </span>
  );
}

function Modal({ title, onClose, children, width = "max-w-[560px]" }: { title: string; onClose: () => void; children: React.ReactNode; width?: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/45 px-4" onMouseDown={onClose}>
      <div role="dialog" aria-modal aria-label={title} className={`animate-be-fade flex max-h-[88vh] w-full ${width} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-brand-border px-5 py-3.5">
          <p className="text-[16px] font-extrabold text-brand-dark">{title}</p>
          <button type="button" aria-label="닫기" onClick={onClose} className="h-8 w-8 rounded-lg text-brand-muted hover:bg-brand-lighter">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── 캠페인 수정 요청 ── */
function CampaignChangeModal({ row, onClose }: { row: PlaceReviewRow; onClose: () => void }) {
  const router = useRouter();
  const init = {
    name: row.name,
    mainKeywords: row.mainKeywords,
    bizInfo: row.bizInfo,
    hashtags: row.hashtags,
    imageMode: row.imageMode,
    imageDriveUrl: row.imageDriveUrl,
    crawlRequest: row.crawlRequest,
  };
  const [v, setV] = useState(init);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  const changes: Record<string, unknown> = {};
  (Object.keys(init) as (keyof typeof init)[]).forEach((k) => {
    if (JSON.stringify(init[k]) !== JSON.stringify(v[k])) changes[k] = v[k];
  });
  const dirty = Object.keys(changes).length > 0 || reason.trim() !== "";
  const tryClose = () => (dirty ? setConfirmClose(true) : onClose());

  const submit = async () => {
    if (!v.mainKeywords.length) return toast.error("메인 키워드는 최소 한 개가 필요합니다");
    if (v.imageMode === "ATTACH" && !v.imageDriveUrl.trim()) return toast.error("사진 첨부를 고르면 구글드라이브 링크가 필요합니다");
    if (!Object.keys(changes).length) return toast.info("변경된 내용이 없습니다");
    setBusy(true);
    const res = await requestReviewCampaignChange(row.id, changes, reason);
    setBusy(false);
    if ("error" in res) return toast.error(res.error ?? "수정 요청에 실패했습니다");
    toast.success("수정을 요청했습니다", "담당자가 확인 후 반영/반려 결과를 알림으로 보내드려요.");
    onClose();
    router.refresh();
  };

  return (
    <Modal title="캠페인 수정 요청" onClose={tryClose}>
      <div className="overflow-y-auto px-5 py-4 space-y-4">
        <p className="rounded-xl bg-brand-lighter px-3.5 py-2.5 text-[12.5px] leading-relaxed text-brand-sub">
          발행일수·일발행량·시작일은 결제 금액과 얽혀 있어 이 요청으로 바꿀 수 없습니다. 담당자가 검토 후 반영하거나 반려합니다.
        </p>
        <div>
          <label className="mb-1.5 block text-[13px] font-bold text-brand-dark">캠페인명</label>
          <input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-bold text-brand-dark">메인 키워드</label>
          <ChipInput
            values={v.mainKeywords}
            onChange={(k) => setV({ ...v, mainKeywords: k })}
            max={5}
            markFirst
            placeholder="예: 성수 브런치 (Enter로 추가, 최대 5개)"
            limitMessage="메인 키워드는 최대 5개까지 입력할 수 있습니다"
          />
          <p className="mt-1.5 text-[12px] text-brand-muted">첫 번째가 <b className="font-bold">대표 키워드</b>입니다. 최소 1개, 최대 5개까지 넣을 수 있습니다.</p>
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-bold text-brand-dark">업체 정보</label>
          <textarea rows={3} maxLength={500} value={v.bizInfo} onChange={(e) => setV({ ...v, bizInfo: e.target.value })} className={`${inputCls} resize-y`} />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-bold text-brand-dark">해시태그 키워드</label>
          <ChipInput
            values={v.hashtags}
            onChange={(k) => setV({ ...v, hashtags: k })}
            max={10}
            stripSpaces
            placeholder="예: 성수맛집 (Enter로 추가, 최대 10개)"
            limitMessage="해시태그는 최대 10개까지 입력할 수 있습니다"
          />
          <p className="mt-1.5 text-[12px] text-brand-muted">모두 지우고 요청하면 해시태그가 전부 삭제됩니다.</p>
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-bold text-brand-dark">이미지 출처</label>
          <div className="grid grid-cols-2 rounded-xl bg-brand-lighter p-1">
            {([["CRAWL", "크롤링요청"], ["ATTACH", "사진첨부"]] as const).map(([k, l]) => (
              <button
                key={k}
                type="button"
                onClick={() => setV({ ...v, imageMode: k, imageDriveUrl: k === "CRAWL" ? "" : v.imageDriveUrl, crawlRequest: k === "ATTACH" ? "" : v.crawlRequest })}
                className={`rounded-lg py-2 text-[13px] font-bold ${v.imageMode === k ? "bg-white text-brand-dark shadow-sm" : "text-brand-sub"}`}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="mt-2">
            {v.imageMode === "ATTACH" ? (
              <input value={v.imageDriveUrl} onChange={(e) => setV({ ...v, imageDriveUrl: e.target.value })} placeholder="이미지 구글드라이브 링크" className={inputCls} />
            ) : (
              <input value={v.crawlRequest} onChange={(e) => setV({ ...v, crawlRequest: e.target.value })} placeholder="참고할 주소나 요청 사항 (선택)" className={inputCls} />
            )}
          </div>
          <p className="mt-1.5 text-[12px] text-brand-muted">출처를 바꾸면 반대쪽에 적어 둔 내용은 지워집니다.</p>
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-bold text-brand-dark">요청 사유 (선택)</label>
          <textarea rows={2} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} className={`${inputCls} resize-y`} />
          <p className="mt-1 text-right text-[12px] text-brand-muted tabular-nums">{reason.length}/300</p>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-brand-border px-5 py-3.5">
        <button type="button" onClick={tryClose} className="rounded-xl border border-brand-border px-4 py-2.5 text-[14px] font-semibold text-brand-sub">취소</button>
        <button type="button" onClick={submit} disabled={busy} className="rounded-xl bg-brand-primary px-5 py-2.5 text-[14px] font-bold text-white disabled:opacity-60">
          {busy ? "요청 중…" : "수정 요청"}
        </button>
      </div>

      {confirmClose && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 px-4" onMouseDown={() => setConfirmClose(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
            <p className="text-[15.5px] font-extrabold text-brand-dark">작성 중인 내용이 있습니다</p>
            <p className="mt-1.5 text-[13.5px] text-brand-sub">지금 닫으면 입력한 수정 요청이 사라집니다.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmClose(false)} className="rounded-xl border border-brand-border px-4 py-2 text-[13.5px] font-semibold text-brand-sub">계속 작성</button>
              <button type="button" onClick={onClose} className="rounded-xl bg-brand-error px-4 py-2 text-[13.5px] font-bold text-white">닫기</button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ── 글 1건 수정 요청 ── */
function PostChangeModal({ row, post, onClose }: { row: PlaceReviewRow; post: PlaceReviewPost; onClose: () => void }) {
  const router = useRouter();
  const noun = row.type === "receipt" ? "리뷰" : "블로그";
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!text.trim()) return toast.error("수정 요청 내용을 입력해 주세요");
    setBusy(true);
    const res = await requestReviewPostChange(row.id, post.id, text);
    setBusy(false);
    if ("error" in res) return toast.error(res.error ?? "수정 요청을 접수하지 못했습니다");
    toast.success("수정 요청을 접수했습니다");
    onClose();
    router.refresh();
  };
  return (
    <Modal title={`${noun} 수정 요청`} onClose={onClose} width="max-w-[520px]">
      <div className="px-5 py-4 space-y-3.5">
        <dl className="rounded-xl border border-brand-border px-4 py-3 space-y-1.5 text-[13px]">
          <div className="flex gap-3"><dt className="w-12 text-brand-muted">대상</dt><dd className="min-w-0 truncate font-semibold text-brand-primary">{post.url}</dd></div>
          <div className="flex gap-3"><dt className="w-12 text-brand-muted">작성일</dt><dd className="font-semibold text-brand-dark tabular-nums">{dot(post.date)}</dd></div>
          <div className="flex gap-3"><dt className="w-12 text-brand-muted">작성자</dt><dd className="font-semibold text-brand-dark">{post.reviewer}</dd></div>
        </dl>
        <div>
          <label className="mb-1.5 block text-[13px] font-bold text-brand-dark">수정 요청 내용</label>
          <textarea
            autoFocus
            rows={4}
            maxLength={1000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="예: 사진 3번째 컷을 매장 외관으로 바꿔 주세요 / 메뉴명이 잘못 표기됐습니다"
            className={`${inputCls} resize-y`}
          />
          <p className="mt-1.5 text-[12px] text-brand-muted">
            이 {noun}를 어떻게 고쳐야 하는지 적어 주세요. <b className="font-bold">1건당 대기 중인 요청은 1개</b>입니다. 접수 후 내용을 바꾸려면 먼저 철회해 주세요. 반영 결과는 알림으로 알려드립니다.
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-brand-border px-5 py-3.5">
        <button type="button" onClick={onClose} className="rounded-xl border border-brand-border px-4 py-2.5 text-[14px] font-semibold text-brand-sub">취소</button>
        <button type="button" onClick={submit} disabled={busy} className="rounded-xl bg-brand-primary px-5 py-2.5 text-[14px] font-bold text-white disabled:opacity-60">
          {busy ? "접수 중…" : "수정 요청"}
        </button>
      </div>
    </Modal>
  );
}

/* ── 행 상세 ── */
function Detail({ row, onCampaignChange, onPostChange }: { row: PlaceReviewRow; onCampaignChange: () => void; onPostChange: (p: PlaceReviewPost) => void }) {
  const router = useRouter();
  const [more, setMore] = useState(false);
  const shown = more ? row.posts : row.posts.slice(0, 5);
  const noun = row.type === "receipt" ? "리뷰" : "블로그";
  const cr = row.changeRequest;
  const info: [string, React.ReactNode][] = [
    ["등록 URL", row.url ? <a href={row.url} target="_blank" rel="noreferrer" className="text-brand-primary hover:underline break-all">{row.url}</a> : "—"],
    ["발행 일수", `${row.days}일`],
    ["총 작업량", <>{row.total.toLocaleString()}건 <span className="text-[12px] font-medium text-brand-muted">(일 {row.daily}건 × {row.days}일)</span></>],
    ["캠페인 요청일", dot(row.requestedAt)],
    ["포스팅 유형", row.postType || "—"],
    ["메인 키워드", row.mainKeywords.length ? (
      <span className="flex flex-wrap gap-1">
        {row.mainKeywords.map((k, i) => (
          <span key={k} className={`rounded-md px-1.5 py-0.5 text-[12px] font-bold ${i === 0 ? "bg-brand-primary text-white" : "bg-brand-primary-50 text-brand-primary"}`}>{k}</span>
        ))}
      </span>
    ) : "—"],
    ["해시태그", row.hashtags.length ? <span className="font-semibold text-brand-primary">{row.hashtags.map((h) => `#${h}`).join(" ")}</span> : "—"],
    ["업체 정보", row.bizInfo ? <span className="whitespace-pre-line font-medium text-brand-text">{row.bizInfo}</span> : "—"],
  ];

  const withdraw = async (p: PlaceReviewPost) => {
    const res = await withdrawReviewPostChange(row.id, p.id);
    if ("error" in res) return toast.error(res.error);
    toast.success("수정 요청을 철회했습니다");
    router.refresh();
  };

  return (
    <div className="bg-brand-lighter/60 px-5 py-5 space-y-5">
      {cr && (
        <p
          className="rounded-xl border px-4 py-3 text-[13px] font-semibold"
          style={
            cr.status === "pending"
              ? { background: "#FFF4DE", borderColor: "#F5D9A0", color: "#8A5A00" }
              : cr.status === "applied"
                ? { background: "#E3F6EA", borderColor: "#B7E4C7", color: "#1E7A45" }
                : { background: "#FFE3E8", borderColor: "#F5B8C2", color: "#B42335" }
          }
        >
          {cr.status === "pending"
            ? `수정 요청이 처리 대기중입니다. 담당자가 확인 후 반영/반려 결과를 알림으로 보내드려요. (요청 ${cr.requestedAt})`
            : cr.status === "applied"
              ? "수정 요청이 반영되었습니다. 변경된 내용은 아래 캠페인 등록 정보에서 확인하실 수 있어요."
              : "수정 요청이 반려되었습니다. 내용을 보완해 다시 요청하시거나 상담으로 문의해 주세요."}
        </p>
      )}

      {/* 진행 현황 — 총 작업량·등록 완료·잔여 */}
      <div className="rounded-2xl border border-brand-border bg-white px-5 py-4">
        <p className="text-[14px] font-extrabold text-brand-dark">진행 현황</p>
        <div className="mt-3.5 grid grid-cols-3 divide-x divide-[color:var(--border)]">
          {[
            { l: "총 작업량", v: row.total, c: "text-brand-dark" },
            { l: "등록 완료", v: row.registered, c: "text-[#1E9E54]" },
            { l: "잔여", v: Math.max(0, row.total - row.registered), c: "text-[#C58A0B]" },
          ].map((t) => (
            <div key={t.l} className="px-3 text-center first:pl-0 last:pr-0">
              <p className="text-[12px] text-brand-sub">{t.l}</p>
              <p className={`mt-0.5 text-[18px] font-extrabold tabular-nums ${t.c}`}>{t.v.toLocaleString()}<span className="ml-0.5 text-[13px] font-bold">건</span></p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[14px] font-extrabold text-brand-dark">캠페인 등록 정보</p>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-px overflow-hidden rounded-2xl border border-brand-border bg-[color:var(--border)]">
          {info.map(([k, v], i) => (
            <div key={k} className={`bg-white px-4 py-3 ${i === 0 || k === "업체 정보" ? "md:col-span-2" : ""}`}>
              <dt className="text-[12px] text-brand-sub">{k}</dt>
              <dd className="mt-0.5 text-[13.5px] font-bold text-brand-dark break-keep">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-2 text-[14px] font-extrabold text-brand-dark">
          등록된 {noun}
          <span className="rounded-md bg-brand-primary-50 px-2 py-0.5 text-[12px] font-bold text-brand-primary tabular-nums">
            {row.registered}건 <span className="font-medium text-brand-sub">/ 총 {row.total}건</span>
          </span>
        </p>
        {row.posts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-brand-border bg-white px-4 py-8 text-center text-[13px] text-brand-sub">아직 등록된 {noun}가 없습니다.</p>
        ) : (
          <>
            <ul className="rounded-2xl border border-brand-border bg-white divide-y divide-[color:var(--border)]">
              {shown.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-[13px]">
                  <span className="w-[76px] shrink-0 text-brand-sub tabular-nums">{dot(p.date)}</span>
                  <a href={p.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate font-semibold text-brand-primary hover:underline">{p.url}</a>
                  <span className="flex shrink-0 items-center gap-1.5 text-brand-sub">
                    <span className="h-5 w-5 rounded-full bg-brand-lighter text-[10px] font-bold text-brand-sub flex items-center justify-center">{p.reviewer.charAt(0)}</span>
                    {p.reviewer}
                  </span>
                  <a href={p.url} target="_blank" rel="noreferrer" className="shrink-0 rounded-md bg-brand-primary-50 px-2 py-1 text-[12px] font-bold text-brand-primary">열기 ↗</a>
                  {p.request?.status === "done" && (
                    <span className="shrink-0 rounded-md border border-[#B7E4C7] bg-[#E3F6EA] px-2 py-1 text-[12px] font-bold text-[#1E7A45]">{p.request.at.slice(0, 10).replaceAll("-", ".")} 수정완료</span>
                  )}
                  {p.request?.status === "pending" ? (
                    <span className="flex shrink-0 items-center gap-1.5">
                      <span className="rounded-md bg-[#FFF4DE] px-2 py-1 text-[12px] font-bold text-[#8A5A00]">⏳ 수정 요청 중</span>
                      <button type="button" onClick={() => withdraw(p)} className="rounded-md border border-brand-border bg-white px-2 py-1 text-[12px] font-semibold text-brand-sub hover:text-brand-error">철회</button>
                    </span>
                  ) : (
                    <button type="button" onClick={() => onPostChange(p)} className="shrink-0 rounded-md border border-brand-border bg-white px-2 py-1 text-[12px] font-semibold text-brand-dark hover:bg-brand-lighter">수정 요청</button>
                  )}
                </li>
              ))}
            </ul>
            {row.posts.length > 5 && (
              <button type="button" onClick={() => setMore(!more)} className="mt-2 w-full rounded-xl border border-brand-border bg-white py-2.5 text-[13px] font-bold text-brand-dark hover:bg-brand-lighter">
                {more ? "접기" : <>더보기 +{row.posts.length - 5}건 <span className="font-medium text-brand-muted">남은 {row.total - Math.min(5, row.posts.length)}건</span></>}
              </button>
            )}
          </>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onCampaignChange}
          disabled={cr?.status === "pending"}
          className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-brand-primary-50 px-3.5 py-2 text-[13px] font-bold text-brand-primary disabled:opacity-50"
          title={cr?.status === "pending" ? "처리 대기 중인 수정 요청이 있습니다" : undefined}
        >
          ✎ 캠페인 수정 요청
        </button>
      </div>
    </div>
  );
}

/* ── 페이지 ── */
export default function PlaceReviewManageView({ rows, today, initialType }: { rows: PlaceReviewRow[]; today: string; initialType: TypeKey }) {
  const [type, setType] = useState<TypeKey>(initialType);
  const [status, setStatus] = useState<"all" | ReviewStatus>("all");
  const [open, setOpen] = useState<string | null>(null);
  const [changeRow, setChangeRow] = useState<PlaceReviewRow | null>(null);
  const [postTarget, setPostTarget] = useState<{ row: PlaceReviewRow; post: PlaceReviewPost } | null>(null);
  const period = usePeriodFilter(today, "3m");

  const inPeriod = rows.filter((r) => period.contains(r.requestedAt));
  const count = (s?: ReviewStatus) => inPeriod.filter((r) => !s || r.status === s).length;
  const ofType = inPeriod.filter((r) => r.type === type);
  const shown = ofType.filter((r) => status === "all" || r.status === status);
  const noun = type === "receipt" ? "리뷰" : "블로그";


  return (
    <div className="space-y-5">
      {/* KPI — 상위노출 캠페인 관리와 같은 카드. 누르면 아래 상태 필터가 같이 바뀐다 */}
      <StatusFilterCards
        counts={{ all: count(), running: count("running"), pending: count("pending") }}
        value={status}
        onChange={(k) => setStatus(k as "all" | ReviewStatus)}
        keys={["all", "running", "pending"] as StatusKey[]}
        labels={{ all: "전체 캠페인", pending: "대기중" }}
      />

      {/* 유형 탭 — 밑줄형, 유형별 건수 */}
      <div className="flex gap-6 border-b border-brand-border">
        {(Object.keys(TYPE_LABEL) as TypeKey[]).map((t) => {
          const on = type === t;
          const n = inPeriod.filter((r) => r.type === t).length;
          return (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setOpen(null);
              }}
              aria-pressed={on}
              className={`-mb-px flex items-center gap-1.5 border-b-2 pb-2.5 pt-1 text-[15px] font-extrabold transition-colors ${on ? "border-brand-primary text-brand-primary" : "border-transparent text-brand-muted hover:text-brand-dark"}`}
            >
              {TYPE_LABEL[t]}
              <span className={`rounded-full px-1.5 py-px text-[11.5px] font-bold tabular-nums ${on ? "bg-brand-primary-50 text-brand-primary" : "bg-brand-lighter text-brand-muted"}`}>{n}</span>
            </button>
          );
        })}
      </div>

      <PeriodFilter period={period} basisLabel="신청일" />

      {/* 목록 — 상자 없이 선으로 구획 */}
      <section className="pt-3">
        <ManageListHeader
          title={`${TYPE_LABEL[type]} 캠페인`}
          count={shown.length}
          counts={{
            all: ofType.length,
            pending: ofType.filter((r) => r.status === "pending").length,
            running: ofType.filter((r) => r.status === "running").length,
            done: ofType.filter((r) => r.status === "done").length,
            paused: ofType.filter((r) => r.status === "paused").length,
          }}
          value={status}
          onChange={(k) => setStatus(k as "all" | ReviewStatus)}
          keys={STATUS_KEYS as StatusKey[]}
          labels={{ pending: "대기중" }}
          className="pb-4"
          action={
            <Link
              href={type === "receipt" ? "/marketing/review/place?type=receipt" : "/marketing/review/place"}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 h-10 text-[14px] font-bold text-white"
              style={{ background: "var(--gradient-point)", boxShadow: "var(--shadow-point)" }}
            >
              + 새 캠페인 신청
            </Link>
          }
        />

        <div className="overflow-x-auto border-t border-brand-border">
          <table className="w-full min-w-[1080px] text-left">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="w-10" />
                {["캠페인명", "유형", "키워드", "발행 일수", "모집 인원", "등록 현황", "캠페인 요청일", "상태", "관리"].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-[12px] font-semibold text-brand-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-[15px] text-brand-muted">조건에 맞는 캠페인이 없습니다</td>
                </tr>
              ) : (
                shown.map((r) => {
                  const isOpen = open === r.id;
                  return (
                    <Fragment key={r.id}>
                      <tr
                        onClick={() => setOpen(isOpen ? null : r.id)}
                        className={`cursor-pointer border-b border-brand-border transition-colors ${isOpen ? "" : "hover:bg-brand-lighter/50"}`}
                      >
                        <td className="pl-4 py-3.5">
                          <span className={`inline-block text-[10px] text-brand-primary transition-transform ${isOpen ? "rotate-90" : ""}`}>▶</span>
                        </td>
                        <td className="px-3 py-3.5">
                          <span className="flex items-center gap-2.5">
                            <NameChip name={r.name} size={30} />
                            <span className="text-[14.5px] font-bold text-brand-dark truncate max-w-[220px]">{r.name}</span>
                            {r.url && (
                              <a href={r.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} aria-label="링크 새 창으로 열기" className="text-[13px] font-bold text-brand-primary hover:opacity-70">↗</a>
                            )}
                          </span>
                        </td>
                        <td className="px-3 py-3.5">
                          <span className="rounded-md bg-brand-primary-50 px-2 py-0.5 text-[12px] font-bold text-brand-primary whitespace-nowrap">{TYPE_LABEL[r.type]}</span>
                        </td>
                        <td className="px-3 py-3.5">
                          {r.mainKeywords[0] ? (
                            <span className="rounded-md bg-brand-lighter px-2 py-0.5 text-[12.5px] font-semibold text-brand-text whitespace-nowrap">{r.mainKeywords[0]}</span>
                          ) : "—"}
                        </td>
                        <td className="px-3 py-3.5 text-[13.5px] text-brand-text whitespace-nowrap">{r.days}일</td>
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          <p className="text-[14px] font-extrabold text-brand-dark">일 {r.daily}건</p>
                          <p className="text-[11.5px] text-brand-muted">총 {r.total}건</p>
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          <span className="flex items-center gap-2">
                            <span className="h-[6px] w-[56px] rounded-full bg-brand-lighter overflow-hidden">
                              <span className="block h-full rounded-full" style={{ width: `${r.total ? Math.min(100, (r.registered / r.total) * 100) : 0}%`, background: r.registered >= r.total && r.total > 0 ? "#2452EB" : "#4F7DF3" }} />
                            </span>
                            <span className="text-[13px] font-bold text-brand-dark tabular-nums">{r.registered}<span className="text-brand-muted font-semibold">/{r.total}건</span></span>
                          </span>
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          <p className="text-[13px] text-brand-sub tabular-nums">{mmdd(r.requestedAt)}</p>
                          <p className="text-[11.5px] text-brand-muted">{STATUS[r.status].label}</p>
                        </td>
                        <td className="px-3 py-3.5"><Pill status={r.status} /></td>
                        <td className="px-3 py-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <Link
                            href={r.type === "receipt" ? "/marketing/review/place?type=receipt" : "/marketing/review/place"}
                            className="inline-flex items-center rounded-lg border border-brand-border bg-brand-primary-50 px-3 py-1.5 text-[12.5px] font-bold text-brand-primary hover:opacity-80"
                          >
                            {r.status === "done" ? "재신청" : "연장하기"}
                          </Link>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="border-b border-brand-border">
                          <td colSpan={10} className="p-0">
                            <Detail row={r} onCampaignChange={() => setChangeRow(r)} onPostChange={(p) => setPostTarget({ row: r, post: p })} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <p className="py-3 text-[13px] text-brand-muted">
          총 <b className="font-bold text-brand-dark">{shown.length}</b>건 · 등록된 {noun}는 행을 눌러 확인하세요
        </p>
      </section>

      {changeRow && <CampaignChangeModal row={changeRow} onClose={() => setChangeRow(null)} />}
      {postTarget && <PostChangeModal row={postTarget.row} post={postTarget.post} onClose={() => setPostTarget(null)} />}
    </div>
  );
}
