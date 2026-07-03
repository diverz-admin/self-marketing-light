"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 오른쪽 고정(fixed) CTA 패널을 콘텐츠 컬럼 우측(=자리 확보용 스페이서 위치)에 맞춰
 * 배치하기 위한 훅. 스페이서에 railRef를 달고, 패널 style에 { left: railLeft } 를 준다.
 * (fixed + right-8 로 뷰포트 끝에 붙어 콘텐츠와 벌어지는 문제를 방지)
 */
export function useRailLeft() {
  const railRef = useRef<HTMLDivElement>(null);
  const [railLeft, setRailLeft] = useState<number>();

  useEffect(() => {
    const update = () => {
      if (railRef.current) setRailLeft(railRef.current.getBoundingClientRect().left);
    };
    update();
    window.addEventListener("resize", update);
    const ro = new ResizeObserver(update);
    if (railRef.current) ro.observe(railRef.current);
    return () => {
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, []);

  return { railRef, railLeft };
}
