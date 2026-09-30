"use client";

/**
 * 캠페인 그룹(폴더형) — 목록 화면이 공유하는 묶어보기 기능.
 *
 * [SPEC:rank-group] 폴더형이다. 항목 하나는 그룹 하나에만 속한다.
 * 태그형(여러 그룹에 걸침)으로 하면 "이 그룹에서 빼면 어디로 가나"가 매번
 * 모호해지고 합계·분포 숫자가 중복 집계된다.
 *
 * ── 저장 위치 ──
 * 브라우저 localStorage 다. 통합순위관리의 원래 구현은 useState 라 새로고침하면
 * 그룹이 사라졌는데, 그대로 다른 화면에 퍼뜨리면 "만들어 놨는데 없어졌다"가
 * 네 곳에서 난다. 서버에 두는 것이 옳지만 스키마·API 가 필요하므로, 우선
 * 브라우저에 남겨 새로고침을 견디게 한다.
 *
 * 그래서 생기는 한계를 분명히 해 둔다:
 *   · 기기·브라우저마다 따로 남는다 (다른 PC 에서 보면 그룹이 없다)
 *   · 방문자 기록을 지우면 사라진다
 * 서버 저장으로 옮길 때 이 파일의 read/write 두 지점만 바꾸면 된다.
 */

import { useCallback, useMemo, useSyncExternalStore } from "react";

export type ItemGroup = { id: number; name: string };

/** 화면마다 다른 보관함을 쓴다 — 플레이스 그룹이 쇼핑 목록에 나오면 안 된다 */
export type GroupScope = string;

type Stored = {
  groups: ItemGroup[];
  /** 항목 id → 그룹 id (없으면 미분류) */
  assign: Record<string, number>;
  seq: number;
};

const EMPTY: Stored = { groups: [], assign: {}, seq: 1 };

function storageKey(scope: GroupScope) {
  return `blueegg.item-groups.${scope}`;
}

function read(scope: GroupScope): Stored {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(storageKey(scope));
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Stored>;
    return {
      groups: Array.isArray(parsed.groups) ? parsed.groups : [],
      assign: parsed.assign && typeof parsed.assign === "object" ? parsed.assign : {},
      seq: typeof parsed.seq === "number" ? parsed.seq : 1,
    };
  } catch {
    // 저장된 값이 깨졌으면 없는 것으로 본다 — 그룹 때문에 목록이 안 뜨면 안 된다
    return EMPTY;
  }
}

function write(scope: GroupScope, value: Stored) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(scope), JSON.stringify(value));
  } catch {
    // 용량 초과·프라이빗 모드 — 저장만 실패하고 화면은 그대로 동작한다
  }
}

/*
 * 외부 저장소(localStorage)를 React 에 잇는다.
 *
 * 마운트 후 effect 로 읽어 setState 하면 렌더가 한 번 더 돌고, 린트도 막는다
 * (react-hooks/set-state-in-effect). useSyncExternalStore 가 이런 값을 위한
 * 정식 경로다. 스냅샷은 같은 참조를 돌려줘야 하므로 스코프별로 캐시한다 —
 * 매번 JSON.parse 하면 새 객체라 무한 렌더가 된다.
 */
const cache = new Map<GroupScope, Stored>();
const listeners = new Map<GroupScope, Set<() => void>>();

function snapshot(scope: GroupScope): Stored {
  let v = cache.get(scope);
  if (!v) {
    v = read(scope);
    cache.set(scope, v);
  }
  return v;
}

function publish(scope: GroupScope, next: Stored) {
  cache.set(scope, next);
  write(scope, next);
  listeners.get(scope)?.forEach((fn) => fn());
}

function subscribe(scope: GroupScope) {
  return (onChange: () => void) => {
    let set = listeners.get(scope);
    if (!set) {
      set = new Set();
      listeners.set(scope, set);
    }
    set.add(onChange);
    return () => { set!.delete(onChange); };
  };
}

/** 한 화면의 그룹 상태 */
export function useItemGroups(scope: GroupScope) {
  const state = useSyncExternalStore(
    useMemo(() => subscribe(scope), [scope]),
    () => snapshot(scope),
    // 서버에서는 저장소가 없다 — 빈 값으로 그려 하이드레이션을 맞춘다
    () => EMPTY,
  );

  /*
   * 변경은 언제나 "지금 저장된 값"에서 출발한다.
   *
   * 클로저에 잡힌 값을 읽어 쓰면, 한 틱에 두 번 부를 때(편성 모달이 "이 그룹에
   * 추가"와 "미분류로 빼기"를 잇달아 호출한다) 두 번째가 첫 번째를 덮어써
   * 한쪽이 사라진다.
   */
  const mutate = useCallback(
    (fn: (prev: Stored) => Stored) => publish(scope, fn(snapshot(scope))),
    [scope],
  );

  /** 새 그룹을 만들고 그 id 를 돌려준다 — 만든 자리에서 바로 고를 수 있게 */
  const addGroup = useCallback(
    (name: string): number | null => {
      const trimmed = name.trim();
      if (!trimmed) return null;
      const id = snapshot(scope).seq;
      mutate((prev) => ({
        ...prev,
        groups: [...prev.groups, { id: prev.seq, name: trimmed }],
        seq: prev.seq + 1,
      }));
      return id;
    },
    [mutate, scope],
  );

  const renameGroup = useCallback(
    (id: number, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      mutate((prev) => ({
        ...prev,
        groups: prev.groups.map((g) => (g.id === id ? { ...g, name: trimmed } : g)),
      }));
    },
    [mutate],
  );

  /** 그룹만 지운다 — 소속 항목은 지우지 않고 미분류로 돌린다 */
  const removeGroup = useCallback(
    (id: number) => {
      mutate((prev) => {
        const assign = { ...prev.assign };
        for (const [itemId, gid] of Object.entries(assign)) {
          if (gid === id) delete assign[itemId];
        }
        return { ...prev, groups: prev.groups.filter((g) => g.id !== id), assign };
      });
    },
    [mutate],
  );

  /** gid 가 null 이면 미분류로 되돌린다 */
  const assignMany = useCallback(
    (itemIds: string[], gid: number | null) => {
      if (itemIds.length === 0) return;
      mutate((prev) => {
        const assign = { ...prev.assign };
        for (const id of itemIds) {
          if (gid === null) delete assign[id];
          else assign[id] = gid;
        }
        return { ...prev, assign };
      });
    },
    [mutate],
  );

  const assignItem = useCallback(
    (itemId: string, gid: number | null) => assignMany([itemId], gid),
    [assignMany],
  );

  /** 그룹 순서 바꾸기 — 드래그로 놓은 자리(toIndex)로 옮긴다 */
  const moveGroup = useCallback(
    (id: number, toIndex: number) => {
      mutate((prev) => {
        const from = prev.groups.findIndex((g) => g.id === id);
        if (from < 0) return prev;
        const groups = [...prev.groups];
        const [g] = groups.splice(from, 1);
        groups.splice(Math.max(0, Math.min(toIndex, groups.length)), 0, g);
        return { ...prev, groups };
      });
    },
    [mutate],
  );

  const groupIdOf = useCallback((itemId: string) => state.assign[itemId] ?? null, [state.assign]);

  return {
    groups: state.groups,
    assign: state.assign,
    groupIdOf,
    addGroup,
    renameGroup,
    removeGroup,
    moveGroup,
    assignItem,
    assignMany,
  };
}

/**
 * 목록을 그룹 단위로 나눈다.
 *
 * ⚠️ 빈 그룹도 남긴다 — 방금 만든 그룹이 화면에서 사라지면 「편성」에 닿을 방법이 없다.
 * ⚠️ 미분류는 항상 맨 마지막.
 */
export function groupItems<T>(
  items: T[],
  idOf: (item: T) => string,
  groups: ItemGroup[],
  assign: Record<string, number>,
): { gid: number | null; name: string | null; items: T[]; empty: boolean }[] {
  const out = groups.map((g) => ({
    gid: g.id as number | null,
    name: g.name as string | null,
    items: [] as T[],
    empty: false,
  }));
  const none = { gid: null as number | null, name: null as string | null, items: [] as T[], empty: false };

  for (const it of items) {
    const gid = assign[idOf(it)] ?? null;
    const bucket = gid !== null ? out.find((o) => o.gid === gid) : undefined;
    (bucket ?? none).items.push(it);
  }

  for (const o of out) o.empty = o.items.length === 0;

  // 미분류는 담긴 게 있을 때만 (그룹을 하나도 안 만들었으면 머리글 없이 목록만 보인다)
  return groups.length === 0 ? [{ ...none, empty: false }] : [...out, ...(none.items.length ? [none] : [])];
}

export function useMemoGroupItems<T>(
  items: T[],
  idOf: (item: T) => string,
  groups: ItemGroup[],
  assign: Record<string, number>,
) {
  return useMemo(() => groupItems(items, idOf, groups, assign), [items, idOf, groups, assign]);
}
