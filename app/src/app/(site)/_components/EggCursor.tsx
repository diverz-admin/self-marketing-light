"use client";

/**
 * 커서 — 마우스 포인터 자리에 점으로 쌓은 알이 따라다닌다.
 *
 * 원래는 화면에 고정해 두고 스크롤을 따라 흐르는 배경 장식이었다. 배경에서는
 * 본문 글자와 겹쳐 읽기를 방해하고 스크롤 내내 전체 화면을 다시 그려야 해서,
 * 작게 줄여 포인터에 붙였다. 마크를 계속 보여 주면서도 그리는 면적은
 * 120px 남짓으로 줄어든다.
 *
 * · 마우스는 튀듯 움직인다. 목표 지점을 한 겹 눌러 따라가게 해서 부드럽게 붙는다.
 * · 누를 수 있는 것(링크·버튼·입력칸) 위에서는 커져서 "여기 눌린다"를 알린다.
 * · 손가락으로 쓰는 기기(pointer: coarse)에는 커서가 없다 — 아예 그리지 않는다.
 */

import { useEffect, useRef } from "react";
import { createEggPainter, SPIN_SPEED } from "@/components/ui/particle-egg";

/** 캔버스 한 변 (CSS px) — 커진 상태의 알이 잘리지 않을 만큼만 잡는다 */
const SIZE = 132;
/** 포인터를 잡을 수 있는 것들 — 이 위에서는 알이 커진다 */
const HOT = "a,button,[role='button'],input,textarea,select,label,summary";

export default function EggCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // 마우스가 없는 기기에서는 기본 커서를 숨기면 안 된다
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(SIZE * dpr);
    canvas.height = Math.round(SIZE * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    /* 작게 그리니 격자를 성글게 잡아도 똑같이 보인다 — 점 6,598개 → 1,600개 남짓 */
    const painter = createEggPainter({ density: 16, arrowRowStep: 3, arrowGap: 0.03 });

    document.documentElement.classList.add("egg-cursor");

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;
    let alpha = 0; // 창 밖으로 나가면 사라진다
    let alphaTo = 0;
    let hover = 0; // 링크 위에서 커진다
    let hoverTo = 0;
    let placed = false; // 첫 움직임에서는 이동 없이 그 자리에 나타난다

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      alphaTo = 1;
      if (!placed) {
        x = targetX;
        y = targetY;
        placed = true;
      }
      const el = e.target as Element | null;
      hoverTo = el?.closest?.(HOT) ? 1 : 0;
    };
    const hide = () => {
      alphaTo = 0;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);

    let raf = 0;
    let last = 0;
    const loop = (time: number) => {
      const dt = Math.min(time - last, 100); // 탭 복귀 직후의 큰 점프는 자른다
      last = time;

      /* 화면 주사율과 무관하게 같은 속도로 따라붙는다 */
      const follow = reduced ? 1 : 1 - Math.exp(-dt / 55);
      x += (targetX - x) * follow;
      y += (targetY - y) * follow;
      alpha += (alphaTo - alpha) * (1 - Math.exp(-dt / 110));
      hover += (hoverTo - hover) * (1 - Math.exp(-dt / 130));

      // 위치는 transform 으로만 옮긴다 — left/top 을 건드리면 매번 레이아웃이 다시 잡힌다
      canvas.style.transform = `translate3d(${x - SIZE / 2}px, ${y - SIZE / 2}px, 0)`;

      ctx.clearRect(0, 0, SIZE, SIZE);
      if (alpha > 0.01) {
        painter.paint(ctx, {
          cx: SIZE / 2,
          cy: SIZE / 2,
          scale: SIZE * 0.23 * (1 + hover * 0.3),
          yaw: reduced ? 0 : time * SPIN_SPEED,
          pitch: -0.11,
          alpha,
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      document.documentElement.classList.remove("egg-cursor");
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed left-0 top-0 z-[60]"
      style={{ width: SIZE, height: SIZE }}
      aria-hidden
    />
  );
}
