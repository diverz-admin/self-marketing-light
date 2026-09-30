# -*- coding: utf-8 -*-
"""blueegg-live-share.html 에 토스 디자인 시스템(TDS)을 입힌다.

원본은 건드리지 않고 blueegg-live-share.toss.html 로 출력한다.

하는 일
  1. :root 색 토큰을 TDS 팔레트로 교체 (목업 전체가 이 변수를 타고 돈다)
  2. 라운드/그림자/두께/자간을 TDS 사다리로 교체
  3. 변수를 안 쓰고 색을 직접 박은 CSS 규칙 전부를 OKLab 최근접 스냅으로 오버라이드
  4. 그라디언트를 평탄화 (TDS: chrome 에 그라디언트 금지, 문서화된 3가지 예외만 허용)
  5. 인라인 style 의 그라디언트 194개를 flat fill 로 치환
  6. pressed/disabled/focus/모션/차트를 TDS 규칙으로 정렬

건드리지 않는 것
  - platform/cafe 화면의 svcCafe 팔레트 — 제3자 사이트를 흉내 내는 표면이다.
    TDS 자체가 "미니앱은 토스와 혼동되어선 안 된다"고 브랜드 분리를 요구한다.
"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from toss_palette import T, value, snap, hexs, rgbs, oklch_to_srgb, srgb_to_oklch

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, 'blueegg-live-share.html')
DST  = os.path.join(ROOT, 'blueegg-live-share.toss.html')

V = lambda n: value(n)
H = lambda n: hexs(value(n))
R = lambda n: rgbs(value(n))

# ── 1. :root 토큰 매핑 ──────────────────────────────────────────────────────
# 왼쪽은 목업의 기존 변수, 오른쪽은 TDS semantic alias 가 가리키는 base 토큰.
TOKENS = [
    ('--bg-rgb',          'grey-50',       'tds-bg 캔버스'),
    ('--surface-rgb',     'white',         'tds-bg-primary / elevated'),
    ('--surface-2-rgb',   'grey-100',      'tds-bg-secondary (fill-secondary)'),
    ('--line-rgb',        'grey-200',      'tds-line-default (border-secondary)'),
    ('--line-2-rgb',      'grey-300',      'tds-line 한 단계 강한 헤어라인'),
    ('--ink-rgb',         'grey-900',      'tds-fg-primary (text-primary)'),
    ('--ink-2-rgb',       'grey-700',      'tds-fg-secondary (text-secondary)'),
    ('--muted-rgb',       'fg-tertiary',   'tds-fg-tertiary — navy-900 @58% 를 흰 배경에 합성'),
    ('--faint-rgb',       'fg-quaternary', 'tds-fg-quaternary — navy-900 @28% 합성 (placeholder)'),
    ('--brand-rgb',       'blue-500',      'fill-brand / text-brand — 공식 hex #3182F6'),
    ('--brand-ink-rgb',   'blue-600',      'pressed-blue 단계'),
    ('--brand-soft-rgb',  'blue-50',       'tds-bg-brand-weak'),
    ('--brand-soft2-rgb', 'blue-100*',     '파생 — blue-100 은 TDS 미공개 구간'),
    ('--brand-strong-rgb','blue-700',      'pressed gradient stop'),
    ('--teal-rgb',        'blue-500',      'TDS 에 teal 없음 → 단일 강조색 규율에 따라 브랜드로 통합'),
    ('--good-rgb',        'green-500',     'fg-success'),
    ('--warn-rgb',        'orange-500',    '시맨틱 warning'),
    ('--bad-rgb',         'red-500',       'fill-danger / text-danger'),
    ('--badge-cart-rgb',  'blue-500',      'fill-brand'),
]
BLUE100 = oklch_to_srgb(0.925, 0.052, 252)   # blue-50 ↔ blue-500 사이 파생 step

def token_value(name):
    return BLUE100 if name == 'blue-100*' else V(name)

# ── 2. TDS 사다리 ───────────────────────────────────────────────────────────
# 목업 라운드(10/14/18/22) → TDS radius ladder 한 칸씩 위로.
RADIUS = [('.rounded-sm', 12, 'radius-m — 입력·작은 버튼'),
          ('.rounded-md', 16, 'radius-xl — 카드'),
          ('.rounded-lg', 20, 'radius-2xl — 시트·다이얼로그'),
          ('.rounded-xl', 24, 'radius-3xl — 큰 카드·섹션')]

NAVY = V('navy-900')
def sh(*parts):
    return ','.join(' '.join(p) for p in parts)
def na(a):
    return 'rgb(%d %d %d / %.2f)' % (NAVY[0], NAVY[1], NAVY[2], a)

SHADOW = [
    ('.shadow-pop',   '0 1px 2px %s,0 1px 1px %s' % (na(.04), na(.04)),            'shadow-1 · menu'),
    ('.shadow-sh-md', '0 4px 12px %s,0 1px 2px %s' % (na(.06), na(.04)),           'shadow-2 · tooltip'),
    ('.shadow-sh-lg', '0 12px 32px %s,0 2px 6px %s' % (na(.10), na(.06)),          'shadow-3 · dialog'),
    ('.shadow-float', '0 12px 32px %s,0 2px 6px %s' % (na(.10), na(.06)),          'shadow-3 · floating'),
]

# 굵기: 목업 400/500/600/700/800 → TDS 램프 400/500/600/700 로 접는다.
WEIGHT = [('.font-black', 700), ('.font-extrabold', 700), ('.font-bold', 600), ('.font-semibold', 500)]


# 타입 스케일 — 목업의 34가지 크기를 TDS type ramp 위로 한 단씩 올린다.
# 목업은 밀집 데스크탑 대시보드라 11.5px 가 3,063회 쓰일 만큼 작았다.
# 작은 글씨일수록 많이 키우고(9px → 11px, +22%), 본문은 +13~15%,
# 22px 이상은 이미 충분히 크고 스탯 카드 레이아웃 위험이 커서 그대로 둔다.
# 반드시 단조 비감소여야 한다 — 어느 크기도 작아지면 안 된다.
_RAMP = [
    (9,    11),   # caption-s
    (10.5, 12),   # caption
    (12,   13),   # body-3 / label-s
    (13.5, 15),   # body-2 / label-m
    (15,   17),   # body-1 / label-l
    (17,   18),   # title-1
    (19,   20),   # h4
    (20,   22),   # h3
    (23,   24),   # h2
]

def type_scale(px):
    for hi, out in _RAMP:
        if px <= hi:
            return out
    return px     # 24px 이상은 유지

# 이름 사이즈는 line-height 를 함께 들고 있어 같은 비율로 옮긴다.
NAMED = {'xs': (12, 16), 'sm': (14, 20), 'base': (16, 24),
         'lg': (18, 28), 'xl': (20, 28), '2xl': (24, 32)}

# 자간: TDS type ramp 의 letterSpacing 을 크기 구간으로 옮긴 것.
def tracking(px):
    if px >= 28: return '-.02em'
    if px >= 22: return '-.02em'
    if px >= 19: return '-.015em'
    if px >= 17: return '-.01em'
    if px >= 14: return '-.005em'
    return '0em'

# ── 3. 색 치환 ──────────────────────────────────────────────────────────────
HEX  = re.compile(r'#([0-9a-fA-F]{3,8})\b')
# 알파 자리에는 숫자뿐 아니라 var(--tw-bg-opacity, 1) 같은 식도 온다.
FUNC = re.compile(r'rgba?\(\s*([0-9.]+)\s*[, ]\s*([0-9.]+)\s*[, ]\s*([0-9.]+)'
                  r'\s*(?:[,/]\s*((?:var\([^()]*\)|[^()])*?)\s*)?\)')

def parse_hex(s):
    if len(s) == 3:  return tuple(int(c * 2, 16) for c in s), None
    if len(s) == 4:  return tuple(int(c * 2, 16) for c in s[:3]), int(s[3] * 2, 16) / 255.0
    if len(s) == 6:  return tuple(int(s[i:i+2], 16) for i in (0, 2, 4)), None
    if len(s) == 8:  return tuple(int(s[i:i+2], 16) for i in (0, 2, 4)), int(s[6:8], 16) / 255.0
    return None, None

def emit(rgb, alpha):
    """alpha 는 float 이거나, var(--tw-bg-opacity, 1) 같은 CSS 식 문자열이다."""
    if alpha is None: return hexs(rgb)
    a = ('%.3f' % alpha).rstrip('0').rstrip('.') if isinstance(alpha, float) else alpha
    return 'rgb(%d %d %d / %s)' % (rgb[0], rgb[1], rgb[2], a)

def role_of(prop):
    if prop == 'color' or prop == 'fill': return 'text'
    if 'border' in prop or prop == 'stroke' or prop == 'outline-color': return 'line'
    return 'fill'

def convert_color(rgb, alpha, role):
    # 순수 무채색(흰/검)은 그대로 둔다 — 알파 오버레이 용도라 스냅할 hue 가 없다.
    if rgb in ((255, 255, 255), (0, 0, 0)): return emit(rgb, alpha)
    return emit(V(snap(rgb, role)), alpha)

def recolor(val, prop):
    role = role_of(prop)
    def h(m):
        rgb, a = parse_hex(m.group(1))
        return m.group(0) if rgb is None else convert_color(rgb, a, role)
    def f(m):
        rgb = tuple(int(float(m.group(i))) for i in (1, 2, 3))
        a = m.group(4)
        if a is not None:
            a = a.strip()
            if re.fullmatch(r'[0-9.]+%?', a):
                a = float(a[:-1]) / 100 if a.endswith('%') else float(a)
        return convert_color(rgb, a, role)
    return FUNC.sub(f, HEX.sub(h, val))

GRAD = re.compile(r'(linear|radial|conic)-gradient\((?:[^()]|\([^()]*\))*\)')

def flatten_gradient(val, prop):
    """TDS 는 chrome 에 그라디언트를 쓰지 않는다. 첫 색 스톱을 대표색으로 잡아
    평탄화하고, 스냅한 토큰의 단색으로 되돌린다."""
    def one(m):
        g = m.group(0)
        cols = []
        for cm in HEX.finditer(g):
            rgb, a = parse_hex(cm.group(1))
            if rgb: cols.append((rgb, a))
        for cm in FUNC.finditer(g):
            rgb = tuple(int(float(cm.group(i))) for i in (1, 2, 3))
            a = cm.group(4)
            if a is not None:
                a = a.strip()
                a = (float(a[:-1]) / 100 if a.endswith('%')
                     else float(a)) if re.fullmatch(r'[0-9.]+%?', a) else None
            cols.append((rgb, a))
        if not cols: return g
        opaque = [c for c in cols if c[1] is None or (isinstance(c[1], float) and c[1] > .9)]
        rgb, a = (opaque[0] if opaque else cols[0])
        if rgb in ((0, 0, 0), (255, 255, 255)):
            # 검정/흰색 알파 스크림 → 가장 진한 스톱의 단일 오버레이로 평탄화
            a = max((c[1] if isinstance(c[1], float) else 1.0) for c in cols)
            return emit(rgb, a)
        return convert_color(rgb, a, role_of(prop))
    m = GRAD.search(val)
    if not m: return val
    # 다중 레이어 배경은 첫 레이어만 남긴다 — 평탄화 결과를 콤마로 이어붙이면 무효 CSS 다.
    return one(m)

# ── 4. CSS 워커: @media 컨텍스트를 유지하며 규칙을 훑는다 ────────────────────
def walk_rules(css):
    out, stack, i, n = [], [], 0, len(css)
    buf = ''
    while i < n:
        c = css[i]
        if c == '{':
            head = buf.strip(); buf = ''
            if head.startswith('@'):
                stack.append(head); i += 1; continue
            depth, j = 1, i + 1
            while j < n and depth:
                if css[j] == '{': depth += 1
                elif css[j] == '}': depth -= 1
                j += 1
            out.append((tuple(stack), head, css[i+1:j-1])); i = j; continue
        if c == '}':
            if stack: stack.pop()
            buf = ''; i += 1; continue
        buf += c; i += 1
    return out

PROPS = ('background-image', 'background-color', 'background', 'border-color',
         'border-top-color', 'border-bottom-color', 'border-left-color',
         'border-right-color', 'color', 'fill', 'stroke', 'outline-color',
         'box-shadow', '--tw-shadow', '--tw-ring-color', '--tw-gradient-from',
         '--tw-gradient-to', '--tw-gradient-via', '--tw-gradient-stops')

def build_overrides(css):
    """변수를 안 쓰고 색을 직접 박은 규칙만 골라 TDS 값으로 재작성한다."""
    lines, seen, n_grad, n_col = [], set(), 0, 0
    for media, sel, decl in walk_rules(css):
        if 'svcCafe' in sel:            # 제3자 사이트 흉내 표면은 그대로 둔다
            continue
        if not sel.startswith('.') and not sel.startswith('#'):
            continue
        new = []
        for m in re.finditer(r'([-a-zA-Z]+)\s*:\s*([^;]+)', decl):
            prop, val = m.group(1), m.group(2).strip()
            if prop not in PROPS: continue
            if re.search(r'rgba?\(\s*var\(--', val): continue   # 색 자체가 변수면 이미 토큰을 탄다
            if not re.search(r'#[0-9a-fA-F]{3,8}|rgba?\(', val): continue
            out, was_grad = val, False
            if 'gradient(' in out:
                out = flatten_gradient(out, prop); was_grad = True; n_grad += 1
            out = recolor(out, prop)
            if out == val: continue
            if was_grad and prop == 'background-image':
                # background-image 는 색을 받지 못한다. 평탄화 결과는 배경색으로 옮긴다.
                new.append('background-image:none'); new.append('background-color:%s' % out)
            else:
                new.append('%s:%s' % (prop, out))
            n_col += 1
        if not new: continue
        key = (media, sel)
        if key in seen: continue
        seen.add(key)
        rule = '%s{%s}' % (sel, ';'.join(new))
        for mq in reversed(media): rule = '%s{%s}' % (mq, rule)
        lines.append(rule)
    return lines, n_grad, n_col

# ── 5. 테마 블록 조립 ───────────────────────────────────────────────────────
def build_theme(css, sizes, variants):
    L = []
    add = L.append
    add('/* ' + '=' * 74)
    add('   TOSS DESIGN SYSTEM 리테마 — tools/toss_retheme.py 가 생성. 직접 고치지 말 것.')
    add('   출처: design.md (토스 / TDS). 색은 OKLCH → sRGB 변환값이며,')
    add('   blue-500 만 스펙이 공식 hex 로 명시한 #3182F6 을 그대로 쓴다.')
    add('   ' + '=' * 74 + ' */')

    add('\n/* ── 1. base 토큰 ─────────────────────────────────────────────── */')
    add(':root{')
    for var, tok, note in TOKENS:
        add('  %-20s %-15s /* %-13s %s */' % (var + ':', (R(tok) if tok != 'blue-100*' else rgbs(BLUE100)) + ';', tok, note))
    b = V('blue-500')
    add('  --focus: 0 0 0 3px rgb(%d %d %d / .22);  /* focus 링은 blue-500 */' % b)
    add('}')

    add('\n/* ── 2. 서비스 태그: TDS 는 노랑을 일러스트 전용으로 두므로 텍스트는 어두운 warm step ── */')
    add(':root{--svc-tag-fg:%s;--svc-tag-bg:%s;--svc-tag-line:%s}'
        % (H('warm-ink'), H('yellow-wash'), H('yellow-line')))

    add('\n/* ── 3. radius ladder ────────────────────────────────────────── */')
    for cls, px, note in RADIUS:
        add('%-14s{border-radius:%dpx}   /* %s */' % (cls, px, note))

    add('\n/* ── 4. elevation — navy-900 베이스 저알파, floating 표면에만 ──── */')
    for cls, val, note in SHADOW:
        add('%-14s{--tw-shadow:%s;box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),%s}  /* %s */' % (cls, val, val, note))

    add('\n/* ── 5. weight ramp — TDS 는 400/500/600/700 네 단만 쓴다 ──────── */')
    for cls, w in WEIGHT:
        add('%-16s{font-weight:%d}' % (cls, w))

    add('\n/* ── 6. 타입 스케일 — TDS ramp 로 한 단씩 상향 ─────────────────── */')
    for px in sizes:
        out = type_scale(px)
        if out == px: continue
        lbl = '%g' % px
        # 변형(max-[700px]:text-[19px] 등)은 부분일치에 함께 걸리므로 제외하고,
        # 아래에서 자기 미디어쿼리 안에 따로 낸다.
        add('[class*="text-[%spx]"]:not([class*=":text-[%spx]"]){font-size:%dpx}' % (lbl, lbl, out))
    for bp, px in sorted(variants):
        out = type_scale(px)
        if out == px: continue
        add('@media(max-width:%dpx){[class*="max-[%dpx]:text-[%gpx]"]{font-size:%dpx}}' % (bp, bp, px, out))
    # 300x360 장식 스테이지(브랜딩·상세페이지·영상 화면의 목업 그림) 안의 글자는
    # UI 텍스트가 아니라 그림의 일부다. 키우면 고정 높이 카드에서 잘린다
    # (명함 목업이 88px 안에서 101px 이 됐다). 원래 크기로 되돌린다.
    add('/* 장식용 목업 스테이지 내부는 그림이므로 확대 대상에서 뺀다 */')
    for px in sizes:
        if type_scale(px) == px: continue
        lbl = '%g' % px
        add('[class*="h-[360px]"][class*="w-[300px]"] [class*="text-[%spx]"]{font-size:%spx}' % (lbl, lbl))
    add('/* 이름 사이즈는 line-height 를 함께 들고 있어 같은 비율로 옮긴다 */')
    for n, (fs, lh) in NAMED.items():
        out = type_scale(fs)
        if out == fs: continue
        add('.text-%s{font-size:%dpx;line-height:%dpx}' % (n, out, round(lh * out / fs)))

    add('\n/* ── 7. tracking — TDS type ramp 의 letterSpacing 을 크기 구간으로 ── */')
    buckets = {}
    for s in sizes: buckets.setdefault(tracking(type_scale(s)), []).append(s)
    for tr, ss in sorted(buckets.items()):
        selg = ','.join('[class*="text-[%spx]"]' % (('%g' % s)) for s in sorted(ss, reverse=True))
        add('%s{letter-spacing:%s}' % (selg, tr))

    add('\n/* ── 8. 모션 — 5개 토큰 안에서만. 바운스·320ms 초과 fade 없음 ──── */')
    add('*,:before,:after{transition-timing-function:cubic-bezier(.22,.61,.36,1)}')
    add('.transition,.transition-all,.transition-colors,.transition-opacity,.transition-transform,.transition-shadow{transition-duration:200ms}')

    add('\n/* ── 9. pressed / disabled — TDS 는 그림자가 아니라 오버레이다 ──── */')
    add('button,[role="button"],a[href]{-webkit-tap-highlight-color:transparent}')
    add('button:not(:disabled):active,[role="button"]:not([aria-disabled="true"]):active{position:relative}')
    add('button:not(:disabled):active::after,[role="button"]:not([aria-disabled="true"]):active::after{'
        'content:"";position:absolute;inset:0;border-radius:inherit;background:rgb(0 0 0 / .26);pointer-events:none}')
    add('button:disabled,[aria-disabled="true"],[disabled]{opacity:.30}   /* 부분 회색 처리하지 않는다 */')

    add('\n/* ── 10. focus — 흰 배경 + 1.5px blue-500 보더 ─────────────────── */')
    add('input:focus,textarea:focus,select:focus{outline:none;background-color:#fff;'
        'border-color:rgb(%d %d %d);box-shadow:0 0 0 .5px rgb(%d %d %d)}' % (b + b))

    add('\n/* ── 11. 보더 — 1px 헤어라인이 기본. 2px 장식·컬러 left-rail 금지 ── */')
    add('.border-2{border-width:1px}')
    add('.border-l-2,.border-l-4,[class*="border-l-[3px]"]{border-left-width:1px}')
    add('/* 컬러 left-rail accent — TDS Don\'t 에 명시된 장식이라 걷어낸다. */')
    add('[class*="before:w-1"][class*="before:left-0"]::before{display:none}')
    add('[class*="before:w-1"][class*="before:left-0"]{padding-left:0}')
    add('span.absolute.left-0.w-1[class*="inset-y"]{display:none}')
    add('[class*="pl-[13px]"]:has(>span.absolute.left-0.w-1){padding-left:0}')

    add('\n/* ── 12. 차트 — 축선을 두지 않고, 기본 막대는 grey-200, 강조만 파랑 ── */')
    add('svg .stroke-line{stroke:transparent}')
    add('svg rect.fill-primary{rx:6px}')
    # opacity .08 막대는 값이 0인 날의 잔여 사각형이다(높이 190px 가 축 아래로 잘린다).
    # 원본에선 거의 투명해 보이지 않았다 — 색을 주면 날짜 라벨 뒤에 회색 덩어리가 생긴다.
    add('svg rect.fill-primary[opacity="0.08"]{display:none}')
    add('svg rect.fill-primary[opacity="0.92"]{opacity:1}')

    add("""
/* ── 13. 좌측 네비게이션 ─────────────────────────────────────────
   원본 문제: (a) 런타임이 활성 링크에 aria-current="page" 를 붙이는데 받는
   스타일이 없어 선택 상태가 사실상 안 보였다. (b) 행 좌측 패딩이 0이라 hover
   배경이 아이콘에 붙어 있었다. (c) 어드민 26개 행 전부가 쓰이지 않는 18px 슬롯을
   달고 있어 라벨이 잘렸다. (d) 플랫폼 트리에서 자식 행이 부모 아이콘보다 왼쪽에
   놓여 위계가 뒤집혀 있었다.
   셀렉터는 aside[class*="min-[901px]:w-60"] 안으로만 한정하고, 원본 클래스보다 한 단 높은 특정도로 덮는다.
   ------------------------------------------------------------------- */

/* 레일 여백 — 행 자체가 좌우 패딩을 갖게 되므로 레일 패딩은 줄인다 */
aside[class*="min-[901px]:w-60"]{padding:12px 10px;gap:1px}

/* 행 공통. 높이 34px 는 TDS 버튼 S(32)~M(40) 사이, 라운드 10px 은 S 버튼 값이다. */
aside[class*="min-[901px]:w-60"] a[href^="/"],
aside[class*="min-[901px]:w-60"] button[class*="w-full"]{padding:8px 10px;border-radius:10px;min-height:34px}

/* 쓰이지 않는 선행 슬롯을 걷어낸다 — 어드민은 라벨 폭 26px 을 되찾고,
   플랫폼은 부모 행이 자식보다 왼쪽에 놓여 위계가 바로 선다. */
aside[class*="min-[901px]:w-60"] span[class="w-[18px] shrink-0"]{display:none}

/* 아이콘을 TDS 사다리(16/20/24)에 올리고 stroke 를 1.5 로 */
aside[class*="min-[901px]:w-60"] svg[class*="h-[15px]"]{height:16px;width:16px}
aside[class*="min-[901px]:w-60"] a svg:not([stroke^="#"]),aside[class*="min-[901px]:w-60"] button svg:not([stroke^="#"]){stroke-width:1.5}

/* hover 는 중립으로 통일한다 — 어드민은 회색, 플랫폼은 브랜드색이라 서로 달랐다.
   TDS 는 화면당 강조색을 하나로 두므로 브랜드색은 선택 상태에만 남긴다. */
aside[class*="min-[901px]:w-60"] a[href^="/"]:hover,
aside[class*="min-[901px]:w-60"] button[class*="w-full"]:hover{background-color:rgb(var(--surface-2-rgb));color:rgb(var(--ink-rgb))}

/* 선택 상태 — TDS chip 의 brand 변형(bg-brand-weak + text-brand)을 그대로 쓴다.
   아이콘은 currentColor 를 상속하므로 함께 파랗게 된다. */
aside[class*="min-[901px]:w-60"] a[aria-current="page"],
aside[class*="min-[901px]:w-60"] a[aria-current="page"]:hover{background-color:rgb(var(--brand-soft-rgb));color:rgb(var(--brand-rgb));font-weight:600}

/* 그룹 토글은 리프보다 한 단 위 위계로 (굵기 폴딩 뒤 둘 다 500 이 되어 평평해졌다) */
aside[class*="min-[901px]:w-60"] button[class*="w-full"]{font-weight:600;color:rgb(var(--ink-rgb))}

/* 그룹 라벨 — TDS 는 넓은 자간 마이크로 캡스를 쓰지 않는다. caption-s 규격으로. */
aside[class*="min-[901px]:w-60"] [class*="tracking-[.07em]"]{font-size:11px;font-weight:600;letter-spacing:0;color:rgb(var(--muted-rgb));margin:18px 0 4px;padding:0 10px}

/* 중첩 트리 가이드는 line-subtle 로 물린다 */
aside[class*="min-[901px]:w-60"] [class*="ml-[13px]"][class*="border-l"]{border-left-color:rgb(0 0 0 / .08)}

/* 즐겨찾기 별 — 앰버가 스냅으로 탁한 갈색이 되었다. 브랜드색으로 되돌린다. */
aside[class*="min-[901px]:w-60"] button[aria-pressed]:hover{color:rgb(var(--brand-rgb));background-color:rgb(var(--surface-2-rgb))}
aside[class*="min-[901px]:w-60"] button[aria-pressed="true"]{color:rgb(var(--brand-rgb))}
""")

    add('\n/* ── 14. 색을 직접 박은 규칙 오버라이드 (자동 생성) ─────────────── */')
    ov, ng, nc = build_overrides(css)
    L.extend(ov)
    return '\n'.join(L), len(ov), ng, nc


NAV_FIX = """
<script id="toss-nav-fix">
/* ---------------------------------------------------------------------------
   셸의 내비게이션 버튼 배선.

   목업 런타임은 `a[href^="/"]` 클릭만 가로채 해시로 옮긴다. 그런데 홈·어드민
   이동 같은 컨트롤은 실제 앱에서 <button> + onClick 이라 링크 가로채기에 걸리지
   않고, 런타임의 wireNavGroups 도 이들을 명시적으로 건너뛴다. 그래서 원본
   목업에서 홈 버튼은 눌러도 아무 일이 없었다.

   #root 는 해시가 바뀔 때마다 innerHTML 째로 다시 그려져 직접 건 리스너가 날아간다.
   그래서 document 에 위임(delegation)으로 건다.

   배선하지 않은 것과 그 이유
     · 장바구니        — aria-expanded + data-cart-anchor 를 가진 팝오버 트리거다.
                        여는 패널이 수집되지 않아 목적지를 지어낼 수 없다.
     · 알림            — 드롭다운인지 페이지 이동인지 실측으로 갈리지 않는다.
     · 다크 모드       — 이 목업에 다크 테마가 없다.
     · 사이드바 접기/펴기 — 접힌 레일의 DOM 이 수집되지 않았다.
   --------------------------------------------------------------------------- */
(function () {
  var ROUTES = {
    '어드민 홈': '#/admin/',            /* 어드민 헤더 로고 · 사이드바 홈 */
    '어드민 페이지로 이동': '#/admin/',
    '홈(런처)으로': '#/platform/',      /* 플랫폼 헤더 로고 */
    '홈으로': '#/platform/',            /* 플랫폼 사이드바 홈 */
    '클릭하면 포인트 충전': '#/platform/charge'
  }
  var OPEN = 'max-[900px]:translate-x-0'
  var CLOSED = 'max-[900px]:-translate-x-full'

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button[title],button[aria-label]')
    if (!b) return
    var key = b.getAttribute('title') || b.getAttribute('aria-label') || ''

    if (key === '최상단으로') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    var to = ROUTES[key]
    if (!to) return
    e.preventDefault()

    /* 모바일 드로어를 닫는다. 해시가 실제로 바뀌면 재렌더가 알아서 닫지만,
       이미 그 화면에 있으면 hashchange 가 안 나서 열린 채로 남는다. */
    var aside = document.querySelector('aside')
    if (aside) { aside.classList.remove(OPEN); aside.classList.add(CLOSED) }

    if (location.hash === to) window.scrollTo(0, 0)
    else location.hash = to
  })
})()
</script>
"""

# ── 6. 실행 ────────────────────────────────────────────────────────────────
def main():
    html = open(SRC, encoding='utf-8').read()
    s0 = html.index('<style>') + 7
    css = html[s0:html.index('</style>', s0)]
    body = html[html.index('<body>'):]
    sizes = sorted({float(m.group(1)) for m in re.finditer(r'\btext-\[([0-9.]+)px\]', body)})

    variants = {(int(m.group(1)), float(m.group(2)))
                for m in re.finditer(r'max-\[([0-9]+)px\]:text-\[([0-9.]+)px\]', body)}
    theme, n_rules, n_grad, n_col = build_theme(css, sizes, variants)

    # 인라인 style 의 그라디언트를 평탄화 (인라인은 스타일시트로 못 이긴다)
    n_inline = [0]
    def fix_inline(m):
        val = m.group(0)
        if 'svcCafe' in val: return val
        new = GRAD.sub(lambda g: '', val)  # placeholder, 아래에서 실제 치환
        out = re.sub(r'background-image\s*:\s*([^;"]+)',
                     lambda d: 'background-color:' + recolor(flatten_gradient(d.group(1), 'background-color'), 'background-color'),
                     val)
        out = re.sub(r'background\s*:\s*((?:linear|radial|conic)-gradient[^;"]+)',
                     lambda d: 'background:' + recolor(flatten_gradient(d.group(1), 'background'), 'background'),
                     out)
        if out != val: n_inline[0] += 1
        return out
    new_body = re.sub(r'style="[^"]*(?:linear|radial|conic)-gradient[^"]*"', fix_inline, body)

    # 네비게이션 아이콘의 색 주입을 걷어낸다.
    # TDS: "모든 아이콘은 currentColor 를 상속한다 — 외부 컬러 직접 주입은 금지다."
    # 예외는 제3자 브랜드 마크뿐이다 — 네이버(#03C75A)·쿠팡(#C1122F)은 그 브랜드의
    # 식별색이라 토스 팔레트로 옮기면 무엇을 가리키는지가 사라진다.
    KEEP_BRAND = {'#03c75a', '#c1122f'}
    n_icon = [0]
    def strip_icon_color(m):
        rail = m.group(0)
        def one(sm):
            if sm.group(1).lower() in KEEP_BRAND: return sm.group(0)
            n_icon[0] += 1
            return 'stroke="currentColor"'
        return re.sub(r'stroke="(#[0-9A-Fa-f]{3,6})"', one, rail)
    # 레일만 고른다 — 본문에도 <aside> 가 10개 더 있는데 그건 화면 안쪽 사이드 패널이다.
    new_body = re.sub(r'<aside\b[^>]*min-\[901px\]:w-60[^>]*>.*?</aside>',
                      strip_icon_color, new_body, flags=re.S)

    block = '\n<style id="toss-theme">\n%s\n</style>\n' % theme
    head = html[:html.index('</head>')]
    out = head + block + '</head>\n' + new_body.replace('</body>', NAV_FIX + '</body>')
    out = out.replace('<title>BLUE EGG — 최종 목업 (운영 실측)</title>',
                      '<title>BLUE EGG — 토스 디자인 시스템 적용본</title>')
    open(DST, 'w', encoding='utf-8').write(out)

    print('생성: %s  (%.1f MB)' % (os.path.basename(DST), os.path.getsize(DST) / 1e6))
    print('  :root 토큰 재정의     %d개' % len(TOKENS))
    print('  자동 오버라이드 규칙   %d개  (색 선언 %d건, 그라디언트 %d건 평탄화)' % (n_rules, n_col, n_grad))
    print('  인라인 style 그라디언트 %d개 평탄화' % n_inline[0])
    print('  타입 스케일 상향       %d종 (+변형 %d종, 이름 사이즈 %d종)'
          % (len([p for p in sizes if type_scale(p) != p]),
             len([1 for _, p in variants if type_scale(p) != p]),
             len([1 for n, (f, l) in NAMED.items() if type_scale(f) != f])))
    print('  네비 아이콘 색 주입 제거 %d개  (네이버·쿠팡 브랜드 마크는 유지)' % n_icon[0])

if __name__ == '__main__':
    main()
