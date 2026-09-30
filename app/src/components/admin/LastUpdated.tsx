"use client";

import * as React from "react";
import { Num } from "@/components/ui/metrics";

/**
 * 갱신 시각 — 운영 콘솔이면 "지금 보는 값이 언제 것인지"가 항상 있어야 한다.
 *
 * 서버에서 시각을 찍으면 하이드레이션 때 브라우저 시각과 어긋나므로,
 * 마운트 후 브라우저에서 채운다. 그 전에는 자리만 잡아 둔다(레이아웃이 안 튄다).
 */
export function LastUpdated() {
  const [at, setAt] = React.useState<string | null>(null);

  React.useEffect(() => {
    const stamp = () =>
      setAt(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Seoul",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    stamp();
    const t = setInterval(stamp, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <span className="inline-flex items-center gap-1.5 text-[11.5px] text-brand-muted">
      <span className="relative flex w-1.5 h-1.5">
        <span className="absolute inline-flex w-full h-full rounded-full bg-brand-success opacity-60 animate-ping" />
        <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-brand-success" />
      </span>
      <Num>{at ?? "--:--:--"}</Num>
      <span>KST</span>
    </span>
  );
}
