/**
 * 점으로 쌓은 알 — 브랜드 마크를 점 격자로 세우는 그리기 코어.
 *
 * 레퍼런스(pintel)의 히어로는 격자 점으로 채운 정육면체였다. 문법(정규 격자 ·
 * 파란 점 · 안쪽이 비쳐 보이는 반투명)은 그대로 두고, 형태만 우리 로고인 알로
 * 바꿨다. 앞면에는 로고의 상승 화살표를 흰 점으로 얹어 마크가 읽히게 했다.
 *
 * 한 바퀴 돌리면 화살표가 뒤로 사라진다.
 *
 * 어디에·얼마나 크게·얼마나 돌려서 그릴지는 쓰는 쪽이 정한다. 여기서는 점을
 * 만들고 한 프레임을 찍는 일만 한다 (지금은 커서 — EggCursor 가 쓴다).
 */

import { EGG_ARROW_ROWS, EGG_ASPECT, EGG_PROFILE } from "./egg-mark-data";

/* ── 알 실루엣 ───────────────────────────────────────
   수식으로 대충 그리지 않는다. 브랜드 마크(blue-egg-mark.png)에서 뽑아낸
   실제 실루엣을 회전시켜 쓴다. v = +1(꼭지) ~ -1(바닥). */
function eggRadius(v: number) {
  if (v >= 1 || v <= -1) return 0;
  const t = ((1 - v) / 2) * (EGG_PROFILE.length - 1);
  const i = Math.floor(t);
  const a = EGG_PROFILE[i];
  const b = EGG_PROFILE[Math.min(i + 1, EGG_PROFILE.length - 1)];
  return a + (b - a) * (t - i);
}

/** 제자리 회전 속도(라디안/ms) — 한 바퀴에 약 28초 */
export const SPIN_SPEED = 0.00022;

const HALF_W = EGG_ASPECT; // 반폭 — 마크의 가로세로 비 그대로
const HALF_H = 1.0; // 반높이

type Dot = { x: number; y: number; z: number };

/* ── 껍질 · 속 격자 ─────────────────────────────────── */

/** 정규 격자를 알 모양으로 깎는다. 껍질과 속을 따로 돌려준다. */
function buildLattice(N: number) {
  const shell: Dot[] = [];
  const core: Dot[] = [];
  let n = 0;

  for (let i = 0; i <= N; i++) {
    const x = (-1 + (2 * i) / N) * HALF_W;
    for (let j = 0; j <= N; j++) {
      const y = (-1 + (2 * j) / N) * HALF_H;
      const rv = eggRadius(y / HALF_H);
      if (rv <= 0.0001) continue;

      for (let k = 0; k <= N; k++) {
        const z = (-1 + (2 * k) / N) * HALF_W;
        const rr = Math.sqrt(x * x + z * z) / HALF_W;
        if (rr > rv) continue;

        if (rr / rv > 0.8) {
          shell.push({ x, y, z });
        } else {
          // 속은 솎아 낸다. 다 그리면 껍질이 묻힌다.
          n++;
          if (n % 3 === 0) core.push({ x, y, z });
        }
      }
    }
  }

  return { shell, core };
}

/**
 * 로고 화살표를 알 앞면에 얹은 점으로 바꾼다.
 *
 * 원본 마크에서 화살표는 알을 뚫어 낸 자리다. 그 구멍의 가로 구간을 그대로
 * 받아 촘촘히 채우고, 각 점을 껍질의 z 좌표로 밀어 올린다. 손으로 그린 꺾은선
 * 대신 실제 마크 모양이 그대로 나온다.
 */
function buildArrow(U_STEP: number, ROW_STEP: number): Dot[] {
  const SHRINK = 0.78; // 실루엣 가장자리까지 감기면 마크가 뭉개진다
  const V_SHIFT = -0.07; // 원근으로 아래가 벌어져 마크가 위로 떠 보인다
  const BULGE = 0.7; // 껍질을 그대로 타면 휘어서 안 읽힌다. 납작하게 눕힌다
  const out: Dot[] = [];

  for (let i = 0; i < EGG_ARROW_ROWS.length; i += ROW_STEP) {
    const [v0, runs] = EGG_ARROW_ROWS[i];
    const v = v0 * SHRINK + V_SHIFT;
    const rad = eggRadius(v) * HALF_W;
    if (rad <= 0) continue;

    for (const [u0, u1] of runs) {
      const n = Math.max(Math.round((u1 - u0) / U_STEP), 1);
      for (let k = 0; k <= n; k++) {
        const x = (u0 + ((u1 - u0) * k) / n) * SHRINK * HALF_W;
        if (Math.abs(x) >= rad * 0.985) continue; // 실루엣 밖
        out.push({
          x,
          y: v * HALF_H,
          z: Math.sqrt(rad * rad - x * x) * BULGE + rad * (1 - BULGE) * 0.35,
        });
      }
    }
  }

  return out;
}

/* ── 그리기 ─────────────────────────────────────────── */

/** 한 프레임을 어디에·얼마나 크게·얼마나 돌려서 찍을지 */
export type EggPaint = {
  /** 캔버스 좌표계에서의 중심 */
  cx: number;
  cy: number;
  /** 반높이(모델 1.0)를 몇 px 로 볼지 */
  scale: number;
  /** 세로축 회전(라디안) — 한 바퀴 돌면 화살표가 뒤로 넘어갔다 돌아온다 */
  yaw: number;
  /** 가로축 기울기(라디안) */
  pitch: number;
  /** 0 ~ 1 */
  alpha: number;
};

const DEPTH = 3.4; // 카메라 거리

/**
 * 점을 만들어 두고 프레임마다 찍어 주는 그리기 도구를 만든다.
 *
 * 점이 수천 개다. 점마다 좌표 객체를 만들고 rgba 문자열을 새로 지어 fillStyle 에
 * 넣으면, 한 프레임에 객체·문자열이 수천 개씩 생겨 움직임이 끊긴다. 그래서
 *  (1) 좌표·크기는 미리 잡아 둔 타입 배열에 바로 쓰고,
 *  (2) 투명도를 단계로 묶어 같은 색끼리 몰아 찍는다.
 * fillStyle 대입이 "점당 한 번"에서 "단계당 한 번"으로 줄어든다.
 */
export function createEggPainter(
  options: {
    /** 격자 축당 칸 수 — 작게 그릴수록 낮춰도 된다 (기본 27) */
    density?: number;
    /** 화살표 행 간격 — 클수록 성글다 (기본 2) */
    arrowRowStep?: number;
    /** 화살표 가로 채움 간격 (기본 0.018) */
    arrowGap?: number;
  } = {},
) {
  const { shell, core } = buildLattice(options.density ?? 27);
  const arrow = buildArrow(options.arrowGap ?? 0.018, options.arrowRowStep ?? 2);

  type Buf = { x: Float32Array; y: Float32Array; s: Float32Array; b: Uint8Array; n: number };
  const makeBuf = (n: number): Buf => ({
    x: new Float32Array(n),
    y: new Float32Array(n),
    s: new Float32Array(n),
    b: new Uint8Array(n),
    n: 0,
  });
  const bufCore = makeBuf(core.length);
  const bufShell = makeBuf(shell.length);
  const bufArrow = makeBuf(arrow.length);

  /** 깊이를 몇 단계로 나눌지 — 12단계면 눈으로는 이전과 구분되지 않는다 */
  const LEVELS = 12;
  const palette = (make: (depth: number) => string) =>
    Array.from({ length: LEVELS }, (_, k) => make((k + 0.5) / LEVELS));
  const CORE_FILL = palette((d) => `rgba(44,150,255,${(0.1 + d * 0.24).toFixed(3)})`);
  const SHELL_FILL = palette(
    (d) => `rgba(${d > 0.62 ? "128,206,255" : "40,146,255"},${(0.3 + d * 0.62).toFixed(3)})`,
  );
  const ARROW_FILL = palette((d) => `rgba(255,255,255,${(0.78 + d * 0.22).toFixed(3)})`);

  return {
    /** 점 개수 — 얼마나 무거운지 확인할 때 쓴다 */
    dots: shell.length + core.length + arrow.length,

    paint(ctx: CanvasRenderingContext2D, o: EggPaint) {
      const cosY = Math.cos(o.yaw);
      const sinY = Math.sin(o.yaw);
      const cosX = Math.cos(o.pitch);
      const sinX = Math.sin(o.pitch);

      /** 점들을 화면 좌표·크기·깊이 단계로 풀어 버퍼에 담는다 (객체를 만들지 않는다) */
      const projectInto = (
        dots: Dot[],
        buf: Buf,
        sizeMul: number,
        sizeBase: number,
        sizeDepth: number,
        frontOnly: boolean,
      ) => {
        let n = 0;
        for (let i = 0; i < dots.length; i++) {
          const d = dots[i];
          const x1 = d.x * cosY + d.z * sinY;
          const z1 = -d.x * sinY + d.z * cosY;
          const y2 = d.y * cosX - z1 * sinX;
          const z2 = d.y * sinX + z1 * cosX;
          if (frontOnly && z2 <= 0) continue; // 뒤로 돌아간 조각
          const persp = DEPTH / (DEPTH - z2);
          let depth = (z2 / (HALF_W * 1.45) + 1) / 2; // 0(뒤) ~ 1(앞)
          if (depth < 0) depth = 0;
          else if (depth > 1) depth = 1;

          buf.x[n] = o.cx + x1 * o.scale * persp;
          buf.y[n] = o.cy - y2 * o.scale * persp;
          buf.s[n] = sizeMul * persp * (sizeBase + depth * sizeDepth);
          let level = (depth * LEVELS) | 0;
          if (level >= LEVELS) level = LEVELS - 1;
          buf.b[n] = level;
          n++;
        }
        buf.n = n;
      };

      /** 같은 단계끼리 몰아 찍는다 */
      const paintBuf = (buf: Buf, fills: string[]) => {
        for (let k = 0; k < fills.length; k++) {
          let set = false;
          for (let i = 0; i < buf.n; i++) {
            if (buf.b[i] !== k) continue;
            if (!set) {
              ctx.fillStyle = fills[k];
              set = true;
            }
            const size = buf.s[i];
            ctx.fillRect(buf.x[i] - size / 2, buf.y[i] - size / 2, size, size);
          }
        }
      };

      ctx.globalAlpha = o.alpha;

      // 속 격자 — 껍질 너머로 희미하게 비친다
      projectInto(core, bufCore, 1.4, 0.55, 0.6, false);
      paintBuf(bufCore, CORE_FILL);

      // 껍질
      projectInto(shell, bufShell, 1.5, 0.55, 0.65, false);
      paintBuf(bufShell, SHELL_FILL);

      // 화살표 — 껍질 위에 얹는다
      projectInto(arrow, bufArrow, 1.9, 1, 0, true);
      paintBuf(bufArrow, ARROW_FILL);

      ctx.globalAlpha = 1;
    },
  };
}
