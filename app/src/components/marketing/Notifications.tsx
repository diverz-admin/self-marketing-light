"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import { CATEGORY_LABEL, type AppNotification, type NotificationCategory } from "@/lib/notification-types";
import { useDropdown } from "./useDropdown";

/* ── 읽음·삭제 상태 — 브라우저에 남긴다 ─────────────────────── */
const KEY = "be.notifications";
type Stored = { read: string[]; removed: string[] };
const EMPTY: Stored = { read: [], removed: [] };
let cache: Stored | null = null;
const listeners = new Set<() => void>();

function snapshot(): Stored {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? (JSON.parse(raw) as Partial<Stored>) : {};
    cache = { read: Array.isArray(v.read) ? v.read : [], removed: Array.isArray(v.removed) ? v.removed : [] };
  } catch {
    cache = EMPTY;
  }
  return cache;
}
function publish(next: Stored) {
  // 오래된 id 가 끝없이 쌓이지 않게 최근 500개만 남긴다
  cache = { read: next.read.slice(-500), removed: next.removed.slice(-500) };
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* 저장 실패 — 이번 화면에서만 반영 */
  }
  listeners.forEach((fn) => fn());
}
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
};

function useNotificationState(all: AppNotification[]) {
  const st = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  const removed = useMemo(() => new Set(st.removed), [st.removed]);
  const read = useMemo(() => new Set(st.read), [st.read]);
  const list = all.filter((n) => !removed.has(n.id));
  return {
    list,
    isRead: (id: string) => read.has(id),
    unread: list.filter((n) => !read.has(n.id)),
    markRead: (ids: string[]) => publish({ ...snapshot(), read: [...snapshot().read, ...ids.filter((i) => !read.has(i))] }),
    remove: (ids: string[]) => publish({ ...snapshot(), removed: [...snapshot().removed, ...ids] }),
  };
}

/* ── 표시 ─────────────────────────────────────────────────── */
export function timeAgo(iso: string) {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}초 전`;
  if (s < 3600) return `${Math.floor(s / 60)}분 전`;
  if (s < 86400) return `${Math.floor(s / 3600)}시간 전`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}일 전`;
  return iso.slice(0, 10);
}

const TONE: Record<AppNotification["tone"], { icon: string; bg: string; fg: string }> = {
  ok: { icon: "M4.5 12.75l6 6 9-13.5", bg: "var(--success-bg)", fg: "var(--success-fg)" },
  fail: { icon: "M6 18L18 6M6 6l12 12", bg: "var(--danger-bg)", fg: "var(--danger-fg)" },
  wait: { icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z", bg: "#FCEFD9", fg: "#C58A0B" },
  info: { icon: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z", bg: "var(--progress-bg)", fg: "var(--progress-fg)" },
};

function ToneIcon({ tone }: { tone: AppNotification["tone"] }) {
  const t = TONE[tone];
  return (
    <span className="h-8 w-8 rounded-full flex items-center justify-center shrink-0" style={{ background: t.bg, color: t.fg }}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
        <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
      </svg>
    </span>
  );
}

/* ── 헤더 종 ─────────────────────────────────────────────── */
export function NotificationBell({ items }: { items: AppNotification[] }) {
  const router = useRouter();
  const { open, setOpen, ref } = useDropdown();
  const st = useNotificationState(items);
  const n = st.unread.length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={`알림 ${n}건`}
        aria-expanded={open}
        className="relative h-9 w-9 rounded-xl bg-brand-lighter border border-brand-border flex items-center justify-center hover:border-brand-border-strong transition-colors"
      >
        <svg className="w-4 h-4 text-brand-sub" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {n > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-error text-white text-[10px] font-extrabold flex items-center justify-center tabular-nums border-2 border-white">
            {n > 99 ? "99+" : n}
          </span>
        )}
      </button>

      {open && (
        <div className="animate-be-fade absolute right-0 top-[calc(100%+8px)] z-50 w-[340px] rounded-xl border border-brand-border bg-white shadow-[0_16px_40px_-12px_rgba(17,29,55,.24)]">
          <p className="px-4 pt-3.5 pb-2.5 text-[14px] font-extrabold text-brand-dark border-b border-brand-border">알림</p>
          {n === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-brand-sub">새로운 알림이 없습니다</p>
          ) : (
            <ul>
              {st.unread.slice(0, 4).map((it) => (
                <li key={it.id} className="group flex items-start gap-2.5 px-4 py-3 border-b border-brand-border hover:bg-brand-lighter">
                  <button
                    type="button"
                    onClick={() => {
                      st.markRead([it.id]);
                      setOpen(false);
                      router.push(it.href);
                    }}
                    className="flex min-w-0 flex-1 items-start gap-2.5 text-left"
                  >
                    <ToneIcon tone={it.tone} />
                    <span className="min-w-0">
                      <span className="block text-[13.5px] font-bold text-brand-dark truncate">{it.title}</span>
                      <span className="block text-[12px] text-brand-sub truncate">
                        {it.body} · {timeAgo(it.at)}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label="알림 삭제"
                    onClick={() => st.remove([it.id])}
                    className="h-6 w-6 rounded-full flex items-center justify-center text-brand-muted hover:text-brand-error"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/marketing/alerts"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-center text-[13px] font-bold text-brand-primary hover:bg-brand-lighter rounded-b-xl"
          >
            알림 전체보기
          </Link>
        </div>
      )}
    </div>
  );
}

/* ── 알림함 화면 ─────────────────────────────────────────── */
type ReadFilter = "all" | "unread" | "read";

export function AlertsView({ items }: { items: AppNotification[] }) {
  const router = useRouter();
  const st = useNotificationState(items);
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [cat, setCat] = useState<NotificationCategory | "all">("all");

  const byRead = st.list.filter((n) => (readFilter === "all" ? true : readFilter === "unread" ? !st.isRead(n.id) : st.isRead(n.id)));
  const shown = cat === "all" ? byRead : byRead.filter((n) => n.category === cat);
  const cats = Object.keys(CATEGORY_LABEL) as NotificationCategory[];

  const empty =
    cat !== "all" ? "선택한 종류의 알림이 없습니다" : readFilter === "read" ? "읽은 알림이 없습니다" : readFilter === "unread" ? "안 읽은 알림이 없습니다" : "알림이 없습니다";

  return (
    <div className="max-w-[960px] mx-auto">
      <h1 className="text-[24px] font-extrabold text-brand-dark tracking-tight">알림</h1>
      <p className="mt-1 text-[15px] text-brand-sub">리워드·리뷰 캠페인 상태 변경, 포인트 충전 승인 등 알림을 확인하세요.</p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-xl border border-brand-border bg-brand-lighter p-1">
          {([["all", "전체"], ["unread", "안 읽음"], ["read", "읽음"]] as const).map(([k, l]) => (
            <button
              key={k}
              type="button"
              onClick={() => setReadFilter(k)}
              aria-pressed={readFilter === k}
              className={`rounded-lg px-3.5 py-1.5 text-[13px] font-bold ${readFilter === k ? "bg-white text-brand-dark shadow-sm" : "text-brand-sub"}`}
            >
              {l}
            </button>
          ))}
        </div>
        <span className="mx-1 h-5 w-px bg-brand-border" />
        {(["all", ...cats] as const).map((k) => {
          const count = k === "all" ? byRead.length : byRead.filter((n) => n.category === k).length;
          const on = cat === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setCat(k)}
              aria-pressed={on}
              className={`rounded-full border px-3 py-1.5 text-[13px] font-semibold ${on ? "border-brand-primary bg-brand-primary-50 text-brand-primary" : "border-brand-border bg-white text-brand-sub hover:border-brand-border-strong"}`}
            >
              {k === "all" ? "전체" : CATEGORY_LABEL[k]} <span className="tabular-nums">{count}</span>
            </button>
          );
        })}
      </div>

      <section className="mt-4 rounded-2xl border border-brand-border bg-white">
        <header className="flex items-center gap-2 px-5 py-3.5 border-b border-brand-border">
          <p className="text-[15px] font-extrabold text-brand-dark">
            전체 알림 · <span className="text-brand-primary tabular-nums">{shown.length}</span>건
          </p>
          <span className="flex-1" />
          <button type="button" onClick={() => st.markRead(shown.map((n) => n.id))} disabled={shown.length === 0} className="rounded-lg border border-brand-border px-3 py-1.5 text-[12.5px] font-bold text-brand-dark hover:bg-brand-lighter disabled:opacity-40">
            모두 읽음
          </button>
          <button type="button" onClick={() => st.remove(shown.map((n) => n.id))} disabled={shown.length === 0} className="rounded-lg border border-brand-border px-3 py-1.5 text-[12.5px] font-bold text-brand-sub hover:text-brand-error disabled:opacity-40">
            모두 삭제
          </button>
        </header>

        {shown.length === 0 ? (
          <p className="px-5 py-16 text-center text-[14px] text-brand-sub">{empty}</p>
        ) : (
          <ul>
            {shown.map((it) => {
              const read = st.isRead(it.id);
              return (
                <li key={it.id} className="flex items-start gap-3 px-5 py-4 border-b border-brand-border last:border-b-0 hover:bg-brand-lighter">
                  <button
                    type="button"
                    onClick={() => {
                      st.markRead([it.id]);
                      router.push(it.href);
                    }}
                    className="flex min-w-0 flex-1 items-start gap-3 text-left"
                  >
                    <ToneIcon tone={it.tone} />
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        {!read && <span className="h-1.5 w-1.5 rounded-full bg-brand-primary shrink-0" aria-label="안 읽음" />}
                        <span className={`text-[14.5px] truncate ${read ? "font-semibold text-brand-sub" : "font-bold text-brand-dark"}`}>{it.title}</span>
                        <span className="shrink-0 rounded-md bg-brand-lighter px-1.5 py-px text-[11px] font-semibold text-brand-sub">{CATEGORY_LABEL[it.category]}</span>
                      </span>
                      <span className="mt-0.5 block text-[13px] text-brand-sub truncate">{it.body}</span>
                      <span className="mt-0.5 block text-[12px] text-brand-muted">{timeAgo(it.at)}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label="알림 삭제"
                    onClick={() => st.remove([it.id])}
                    className="h-7 w-7 rounded-full flex items-center justify-center text-brand-muted hover:bg-white hover:text-brand-error"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                      <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
