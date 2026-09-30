# -*- coding: utf-8 -*-
"""토스 디자인 시스템(TDS) 팔레트 + OKLCH 변환/스냅 유틸.

스펙 출처: design.md (토스, slug: toss). 색 토큰은 OKLCH로 기술되어 있어
sRGB로 변환해 쓴다. 단 blue-500만은 스펙이 공식 hex(#3182F6)를 명시하므로
그 값을 그대로 쓴다 — 스펙의 OKLCH 표기는 반올림값이라 #2887ee로 떨어진다.
"""
import math

# ── OKLCH ↔ sRGB ────────────────────────────────────────────────────────────
def oklch_to_srgb(L, C, H):
    h = math.radians(H); a = C * math.cos(h); b = C * math.sin(h)
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    l, m, s = l_ ** 3, m_ ** 3, s_ ** 3
    r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    def enc(x):
        x = max(0.0, min(1.0, x))
        v = 12.92 * x if x <= 0.0031308 else 1.055 * (x ** (1 / 2.4)) - 0.055
        return int(round(max(0.0, min(1.0, v)) * 255))
    return (enc(r), enc(g), enc(bl))

def srgb_to_oklch(r, g, b):
    def lin(c):
        c /= 255.0
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = lin(r), lin(g), lin(b)
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l, m, s = l ** (1 / 3), m ** (1 / 3), s ** (1 / 3)
    L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s
    A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s
    B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
    return L, math.hypot(A, B), math.degrees(math.atan2(B, A)) % 360

def hexs(t):  return '#%02x%02x%02x' % t
def rgbs(t):  return '%d %d %d' % t

# ── TDS base 팔레트 (design.md `colors:` 블록 그대로) ────────────────────────
_OKLCH = {
    'blue-600': (0.522, 0.176, 257), 'blue-700': (0.476, 0.174, 259), 'blue-50': (0.965, 0.020, 250),
    'grey-900': (0.234, 0.030, 254), 'grey-800': (0.342, 0.030, 253), 'grey-700': (0.452, 0.028, 253),
    'grey-600': (0.555, 0.022, 253), 'grey-500': (0.652, 0.020, 252), 'grey-400': (0.752, 0.016, 251),
    'grey-300': (0.840, 0.012, 248), 'grey-200': (0.913, 0.008, 247), 'grey-150': (0.918, 0.007, 247),
    'grey-100': (0.957, 0.005, 247), 'grey-50': (0.978, 0.003, 247),
    'yellow-500': (0.853, 0.156, 86), 'yellow-400': (0.893, 0.123, 85), 'yellow-300': (0.901, 0.124, 84),
    'orange-500': (0.748, 0.183, 56), 'orange-400': (0.828, 0.108, 52), 'orange-300': (0.870, 0.078, 51),
    'red-500': (0.628, 0.218, 22), 'red-600': (0.626, 0.216, 22), 'green-500': (0.493, 0.143, 154),
    'navy-900': (0.155, 0.060, 261), 'brown-900': (0.359, 0.083, 39), 'brown-700': (0.444, 0.062, 30),
}
T = {k: oklch_to_srgb(*v) for k, v in _OKLCH.items()}
T['blue-500'] = (49, 130, 246)   # 스펙 명시 공식 hex #3182F6 [src:6]
T['white']    = (255, 255, 255)

def over_white(rgb, a):
    return tuple(int(round(c * a + 255 * (1 - a))) for c in rgb)

# 알파 토큰의 흰 배경 합성 등가 (--*-rgb 변수는 solid 채널만 받는다)
T['fg-tertiary']   = over_white(T['navy-900'], 0.58)
T['fg-quaternary'] = over_white(T['navy-900'], 0.28)

# ── 스냅 규칙 ───────────────────────────────────────────────────────────────
# 토스 시맨틱 hue. 임의 색은 이 hue 중 가장 가까운 쪽으로 먼저 끌어온 뒤
# 명도 단계에 맞는 토큰으로 떨어뜨린다.
HUES = {'blue': 254.0, 'green': 154.0, 'red': 22.0, 'orange': 56.0, 'yellow': 86.0}
GREYS = ['grey-900', 'grey-800', 'grey-700', 'grey-600', 'grey-500',
         'grey-400', 'grey-300', 'grey-200', 'grey-100', 'grey-50', 'white']

def _hue_dist(a, b):
    d = abs(a - b) % 360
    return min(d, 360 - d)

def nearest_hue(H):
    return min(HUES, key=lambda k: _hue_dist(H, HUES[k]))

def snap_neutral(L):
    return min(GREYS, key=lambda k: abs(srgb_to_oklch(*T[k])[0] - L))

# TDS 의 회색은 순수 무채색이 아니라 cool-blue 로 살짝 기운 중성색이다
# (grey-900 자체가 C=.030). 그래서 단순 채도 컷으로는 회색과 옅은 색조를 못 가른다.
# 회색 hue 대역 안에 있으면 채도를 넉넉히 허용하고, 대역 밖이면 빡빡하게 잡는다.
GREY_HUE = (235.0, 275.0)

def is_neutral(L, C):
    return C < 0.012

def is_neutral_h(L, C, H):
    if C < 0.012:
        return True
    return GREY_HUE[0] <= H <= GREY_HUE[1] and C < 0.045

def snap(rgb, role='fill'):
    """임의 sRGB → 토스 토큰명. role: fill | text | line."""
    L, C, H = srgb_to_oklch(*rgb)
    if role == 'text':
        # 어두운 표면 위 옅은 텍스트(어드민 헤더의 #cdd9f2 등)는 무채색 사다리로 보낸다.
        if L >= 0.65 and C < 0.09:
            return snap_neutral(L)
        # 밝은 표면 위 텍스트는 반드시 읽혀야 한다 — 노랑/주황은 토스가 텍스트 색으로
        # 쓰지 않으므로(일러스트 전용) 같은 hue의 어두운 파생 step으로 내린다.
        if not is_neutral_h(L, C, H):
            fam = nearest_hue(H)
            if fam in ('yellow', 'orange'):
                return 'warm-ink'
        else:
            return snap_neutral(min(L, 0.56))
    if is_neutral_h(L, C, H):           # 중성색 → grey ladder
        return snap_neutral(L)
    fam = nearest_hue(H)
    if L < 0.40:                        # 어두운 유채색 표면 → 토스의 유일한 dark surface
        return 'blue-700' if fam == 'blue' and L >= 0.42 else 'grey-900'
    if fam == 'blue':
        if L >= 0.94: return 'blue-50'
        if L >= 0.86: return 'blue-50'
        if L < 0.56:  return 'blue-600'
        return 'blue-500'
    if L >= 0.94:  return fam + '-wash'      # 파생 wash (스펙 미공개 구간)
    if L >= 0.865: return fam + '-line'      # 파생 wash 보더
    if fam == 'yellow':
        # TDS 는 노랑을 일러스트 전용으로 둔다. 흰 텍스트를 얹는 채워진 배지에는
        # 쓸 수 없으므로 시맨틱 warning fill(orange-500)로 보낸다.
        return 'orange-500' if role == 'fill' else 'yellow-500'
    return {'green': 'green-500', 'red': 'red-500', 'orange': 'orange-500'}[fam]

def derived(name):
    """`<fam>-wash` / `<fam>-line` 파생 토큰의 실제 값.

    스펙 Known Gaps: hue별 washed step(blue-100~400, red-50~400 등)은 공개되지
    않았다. 스펙이 제시한 red badge 추정치 oklch(0.940 0.040 18)의 방식을 그대로
    따라 base hue에서 lightness만 끌어올린다.
    """
    if name == 'warm-ink':
        return oklch_to_srgb(0.500, 0.130, 56)   # 노랑/주황 계열의 텍스트 안전 step
    fam, kind = name.rsplit('-', 1)
    h = HUES[fam]
    return oklch_to_srgb(0.955, 0.038, h) if kind == 'wash' else oklch_to_srgb(0.900, 0.058, h)

def value(name):
    return T[name] if name in T else derived(name)

def snap_rgb(rgb, role='fill'):
    return value(snap(rgb, role))
