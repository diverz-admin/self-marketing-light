# -*- coding: utf-8 -*-
"""BlueEgg Light 팔레트 + OKLCH 변환/스냅 유틸.

출처: https://self-marketing-light.vercel.app/marketing 의 런타임 스타일시트
(`_next/static/chunks/*.css` 끝의 `:root` 블록)에서 그대로 읽어온 값이다.
토스 스펙과 달리 이쪽은 hex 로 기술돼 있어 변환 없이 쓴다.

스냅(임의 색 → 팔레트 토큰)만 OKLab 위에서 계산한다.
"""
import math

from toss_palette import oklch_to_srgb, srgb_to_oklch, hexs, rgbs  # noqa: F401  변환기는 공용


def _px(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


# ── 레퍼런스 :root 토큰 (실측값 그대로) ─────────────────────────────────────
_HEX = {
    # navy — 브랜드 사다리
    'navy-900':      '#111d37',   # --navy-900 / --brand-dark / --text-strong
    'navy-800':      '#0d2148',   # --navy-800 / --brand-primary-hover
    'navy-700':      '#0d3473',   # --navy-700 / --brand-primary  ← 주 브랜드색
    'navy-600':      '#16345c',   # --navy-600 / --progress-fg
    'navy-500':      '#1d2f5f',   # --navy-500
    'navy-100':      '#e8ecf8',   # --navy-100 / --progress-bg

    # 중성 — 전부 cool-navy 로 기운 중성색이다 (순수 무채색이 아니다)
    'text-strong':   '#111d37',   # --text-strong
    'text-body':     '#2b3648',   # --text-body / --brand-text
    'text-sub':      '#5b6472',   # --text-sub / --brand-sub
    'done-fg':       '#6b7482',   # --done-fg
    'text-muted':    '#99a0ac',   # --text-muted
    'border-strong': '#d2d8e2',   # --border-strong
    'border':        '#e2e6ed',   # --border / --brand-border
    'bg-base':       '#edeff2',   # --bg-base  ← 캔버스
    'done-bg':       '#eef0f2',   # --done-bg
    'surface-alt':   '#f5f6f8',   # --surface-alt / --brand-light
    'white':         '#ffffff',   # --surface

    # accent / semantic
    'accent-blue':   '#0187e6',   # --accent-blue / --info-fg
    'accent-cyan':   '#22c7e0',   # --accent-cyan
    'accent-amber':  '#eda13f',   # --accent-amber
    'info-bg':       '#d4eeff',   # --info-bg
    'success-fg':    '#1e9e54',   # --success-fg
    'success-bg':    '#dff5e6',   # --success-bg
    'danger-fg':     '#e5484d',   # --danger-fg
    'danger-bg':     '#ffe3e8',   # --danger-bg
}

T = {k: _px(v) for k, v in _HEX.items()}

# ── 파생 토큰 ───────────────────────────────────────────────────────────────
# 레퍼런스가 공개하지 않은 중간 단계. base hue 를 유지한 채 명도만 옮긴다.
# (토스 리테마에서 wash/line step 을 만든 것과 같은 방식이다.)
T['n-400']       = oklch_to_srgb(0.790, 0.016, 261)   # text-muted ↔ border-strong 사이 공백
T['navy-50']     = oklch_to_srgb(0.968, 0.010, 266)   # navy-100 보다 옅은 대면적 브랜드 배경
T['navy-200']    = oklch_to_srgb(0.895, 0.030, 264)   # navy wash 보더
T['blue-mid']    = oklch_to_srgb(0.800, 0.100, 250)   # 차트 보조 막대 등
T['blue-line']   = oklch_to_srgb(0.880, 0.060, 240)   # info wash 보더
T['green-ink']   = oklch_to_srgb(0.430, 0.120, 152)   # 어두운 표면의 green
T['green-line']  = oklch_to_srgb(0.895, 0.060, 155)
T['amber-ink']   = oklch_to_srgb(0.550, 0.128, 69)    # 앰버는 밝아서 텍스트로 못 쓴다
T['amber-bg']    = oklch_to_srgb(0.955, 0.045, 75)
T['amber-line']  = oklch_to_srgb(0.895, 0.075, 72)
T['cyan-ink']    = oklch_to_srgb(0.560, 0.105, 211)
T['cyan-bg']     = oklch_to_srgb(0.955, 0.035, 205)
T['red-line']    = oklch_to_srgb(0.890, 0.065, 18)


def value(name):
    return T[name]


# ── 스냅 규칙 ───────────────────────────────────────────────────────────────
# 이 팔레트의 시맨틱 hue. 임의 색은 가장 가까운 hue 로 먼저 끌어온 뒤
# 명도 단계에 맞는 토큰으로 떨어뜨린다.
HUES = {'blue': 254.0, 'cyan': 211.0, 'green': 152.0, 'amber': 69.0, 'red': 23.0}

# 중성 사다리 (어두운 쪽 → 밝은 쪽)
NEUTRALS = ['text-strong', 'text-body', 'text-sub', 'done-fg', 'text-muted',
            'n-400', 'border-strong', 'border', 'bg-base', 'surface-alt', 'white']

# 이 팔레트의 회색은 순수 무채색이 아니라 navy 로 기운 중성색이다
# (text-strong 자체가 C=.053). 단순 채도 컷으로는 회색과 옅은 파랑이 안 갈린다.
# navy hue 대역 안이면 채도를 넉넉히 허용하고, 대역 밖이면 빡빡하게 잡는다.
GREY_HUE = (245.0, 285.0)
GREY_C_IN = 0.058     # 대역 안에서 회색으로 볼 최대 채도 (navy-700 은 .117 이라 안 걸린다)
GREY_C_OUT = 0.014    # 대역 밖


def _hue_dist(a, b):
    d = abs(a - b) % 360
    return min(d, 360 - d)


def nearest_hue(H):
    return min(HUES, key=lambda k: _hue_dist(H, HUES[k]))


def snap_neutral(L):
    return min(NEUTRALS, key=lambda k: abs(srgb_to_oklch(*T[k])[0] - L))


def is_neutral(L, C, H):
    if C < GREY_C_OUT:
        return True
    return GREY_HUE[0] <= H <= GREY_HUE[1] and C < GREY_C_IN


def _blue_step(L):
    """파랑 계열의 명도 단계. 이 디자인의 chrome 은 navy 사다리로 간다."""
    if L < 0.290: return 'navy-900'
    if L < 0.330: return 'navy-800'
    if L < 0.600: return 'navy-700'     # 주 브랜드색 — 목업의 #2e6be0(L .556)이 여기로 온다
    if L < 0.720: return 'accent-blue'  # 링크·info 강조 (#0187e6 L .613)
    if L < 0.860: return 'blue-mid'
    if L < 0.925: return 'info-bg'
    return 'navy-100'


def snap(rgb, role='fill'):
    """임의 sRGB → 팔레트 토큰명. role: fill | text | line."""
    L, C, H = srgb_to_oklch(*rgb)

    if role == 'text':
        # 어두운 표면 위 옅은 텍스트(어드민 헤더의 #cdd9f2 등)는 중성 사다리로.
        if L >= 0.72 and C < 0.09:
            return snap_neutral(L)
        if is_neutral(L, C, H):
            # 밝은 표면 위 본문은 읽혀야 한다 — 최소 대비 단계 아래로 못 내려간다.
            return snap_neutral(min(L, 0.56))
        fam = nearest_hue(H)
        if fam == 'amber': return 'amber-ink'
        if fam == 'cyan':  return 'cyan-ink'
        if fam == 'green': return 'success-fg' if L >= 0.50 else 'green-ink'
        if fam == 'red':   return 'danger-fg'
        return _blue_step(min(L, 0.70))     # 밝은 파랑 텍스트는 accent-blue 까지만

    if is_neutral(L, C, H):
        return snap_neutral(L)

    fam = nearest_hue(H)
    if fam == 'blue':
        return _blue_step(L)
    if L < 0.40:
        # 어두운 유채색 표면. 이 디자인의 유일한 dark surface 는 navy 다.
        return 'green-ink' if fam == 'green' else 'navy-900'
    if fam == 'green':
        if L >= 0.925: return 'success-bg'
        if L >= 0.860: return 'green-line'
        return 'success-fg'
    if fam == 'red':
        if L >= 0.925: return 'danger-bg'
        if L >= 0.860: return 'red-line'
        return 'danger-fg'
    if fam == 'amber':
        if L >= 0.925: return 'amber-bg'
        if L >= 0.860: return 'amber-line'
        return 'accent-amber'
    # cyan
    if L >= 0.925: return 'cyan-bg'
    if L >= 0.860: return 'cyan-bg'
    return 'accent-cyan'


def snap_rgb(rgb, role='fill'):
    return value(snap(rgb, role))
