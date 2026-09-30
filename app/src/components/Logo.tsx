import React from "react";
import Image from "next/image";

/*
 * BLUE EGG 브랜드 로고 — 실제 브랜드 자산(PNG) 기반.
 *   /blue-egg-logo.png     전체 락업 (에그 + BLUE EGG biz)   659x280
 *   /blue-egg-mark.png     에그 마크 단독                     209x280
 *   /blue-egg-wordmark.png 워드마크 단독 (BLUE EGG biz)       402x257
 *
 * 어두운 배경 위에서는 onDark 로 워드마크를 흰색으로 반전시킨다.
 * (락업/워드마크의 기본 글자색이 진한 네이비라 어두운 배경에서 묻힘)
 */

const INVERT = "brightness-0 invert";

/* ── 에그 마크 ── */
export function BlueEggMark({ className }: { className?: string }) {
  return (
    <Image
      src="/blue-egg-mark.png"
      alt=""
      width={209}
      height={280}
      priority
      className={className}
    />
  );
}

/* ── 워드마크 (BLUE EGG biz) ── */
export function BlueEggText({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <Image
      src="/blue-egg-wordmark.png"
      alt="BLUE EGG biz"
      width={402}
      height={257}
      priority
      className={`${className || ""} ${onDark ? INVERT : ""}`}
    />
  );
}

/* ── 전체 로고 (에그 + 워드마크 락업) ── */
export default function Logo({
  className,
  /** 로고 높이 Tailwind 클래스. 예: "h-8", "h-12" */
  size = "h-8",
  /** 어두운 배경 위에 올릴 때 흰색으로 반전 */
  onDark = false,
}: {
  className?: string;
  size?: string;
  onDark?: boolean;
}) {
  return (
    <Image
      src="/blue-egg-logo.png"
      alt="BLUE EGG biz"
      width={659}
      height={280}
      priority
      className={`${size} w-auto ${onDark ? INVERT : ""} ${className || ""}`}
    />
  );
}
