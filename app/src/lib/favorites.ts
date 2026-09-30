"use client";

import { useEffect, useState } from "react";

/** 사이드바에서 ★ 로 담아 둔 바로가기 */
export type Favorite = { label: string; href: string };

const KEY = "blueegg:favorites";
/** 같은 탭 안의 다른 컴포넌트에 알리는 이벤트 (storage 이벤트는 다른 탭에서만 온다) */
const EVENT = "blueegg:favorites-change";

/**
 * localStorage 기반이라 **브라우저별로 따로 남는다.** 기기 간 동기화가 필요해지면
 * 이 파일의 read/write 만 서버 액션으로 바꾸면 되도록 접근을 여기로 모아 둔다.
 */
export function readFavorites(): Favorite[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (f): f is Favorite =>
        !!f && typeof f === "object" &&
        typeof (f as Favorite).label === "string" &&
        typeof (f as Favorite).href === "string",
    );
  } catch {
    // 시크릿 모드·저장 차단 등에서 접근 자체가 throw 한다 — 즐겨찾기는 부가기능이라 조용히 빈 값
    return [];
  }
}

function write(list: Favorite[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* 저장 실패해도 화면은 계속 동작한다 */
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function isFavorite(list: Favorite[], href: string) {
  return list.some((f) => f.href === href);
}

/** 개발본과 같이 8개까지만 담는다 — 대시보드 바로가기 한 줄에 들어가는 수 */
export const FAVORITE_LIMIT = 8;

/**
 * 있으면 빼고 없으면 넣는다. 최신 항목이 앞으로 온다.
 * 이미 가득 찼으면 넣지 않고 "full" 을 돌려준다 — 안내는 부른 쪽이 띄운다.
 */
export function toggleFavorite(fav: Favorite): "added" | "removed" | "full" {
  const cur = readFavorites();
  if (isFavorite(cur, fav.href)) {
    write(cur.filter((f) => f.href !== fav.href));
    return "removed";
  }
  if (cur.length >= FAVORITE_LIMIT) return "full";
  write([fav, ...cur]);
  return "added";
}

/**
 * 즐겨찾기 구독 훅.
 *
 * ⚠️ 초기값을 빈 배열로 두고 마운트 뒤에 읽는다. 서버 렌더에는 localStorage 가 없어서
 *    첫 렌더에서 읽으면 hydration 불일치가 난다.
 */
export function useFavorites(): Favorite[] {
  const [list, setList] = useState<Favorite[]>([]);
  useEffect(() => {
    const sync = () => setList(readFavorites());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);   // 다른 탭에서 바뀐 경우
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return list;
}
