# -*- coding: utf-8 -*-
"""blueegg-live-share.html 에 BlueEgg Light 디자인을 입힌다.

레퍼런스: https://self-marketing-light.vercel.app/marketing
원본은 건드리지 않고 blueegg-live-share.light.html 로 출력한다.

토스 리테마(tools/toss_retheme.py)와 같은 골격이지만 규율이 다르다.

  같은 것
    · :root 토큰 레이어만 갈아끼우면 103개 화면이 동시에 바뀐다
    · 토큰 밖에 색을 직접 박은 규칙은 OKLab 최근접 스냅으로 오버라이드
    · 원본 CSS 는 그대로 두고 </head> 직전에 <style id="light-theme"> 한 벌을 덧붙인다

  다른 것
    · 그라디언트를 평탄화하지 않는다. 레퍼런스는 --gradient-brand 를 chrome 에
      실제로 쓴다. 스톱을 각각 스냅하고, 전부 navy 사다리에 떨어지면 통째로
      var(--gradient-brand) 로 바꾼다.
    · 아이콘의 stroke 색 주입을 걷어내지 않는다. 레퍼런스는 레일 아이콘의
      서비스별 색(플레이스 그린, 쿠팡 레드, 네이버 그린)을 그대로 유지한다.
    · 타입 스케일을 올리지 않는다. 레퍼런스도 같은 밀도의 데스크탑 대시보드다.
      자간만 레퍼런스 규칙(본문 -.01em / 헤딩 -.03em)으로 맞춘다.

건드리지 않는 것
  · platform/cafe 화면의 svcCafe 팔레트 — 제3자 사이트(네이버 카페)를 흉내 내는 표면이다.
  · 네이버(#03C75A)·쿠팡(#C1122F) 브랜드 마크 — 그 브랜드의 식별색이다.
"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import light_home
import light_ref2
from light_palette import T, value, snap, hexs, rgbs, srgb_to_oklch

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, 'blueegg-live-share.html')
DST  = os.path.join(ROOT, 'blueegg-live-share.light.html')

V = lambda n: value(n)
H = lambda n: hexs(value(n))
R = lambda n: rgbs(value(n))

# ── 1. :root 토큰 매핑 ──────────────────────────────────────────────────────
# 왼쪽은 목업의 기존 변수, 오른쪽은 레퍼런스의 semantic alias 가 가리키는 토큰.
TOKENS = [
    ('--bg-rgb',          'bg-base',       '--bg-base 캔버스'),
    ('--surface-rgb',     'white',         '--surface'),
    ('--surface-2-rgb',   'surface-alt',   '--surface-alt / --brand-light'),
    ('--line-rgb',        'border',        '--border / --brand-border'),
    ('--line-2-rgb',      'border-strong', '--border-strong'),
    ('--ink-rgb',         'text-strong',   '--text-strong'),
    ('--ink-2-rgb',       'text-body',     '--text-body / --brand-text'),
    ('--muted-rgb',       'text-sub',      '--text-sub / --brand-sub'),
    ('--faint-rgb',       'text-muted',    '--text-muted'),
    ('--brand-rgb',       'navy-700',      '--brand-primary — 이 디자인의 주 브랜드색'),
    ('--brand-ink-rgb',   'navy-800',      '--brand-primary-hover'),
    ('--brand-soft-rgb',  'navy-50',       '파생 — navy-100 보다 옅은 대면적 배경'),
    ('--brand-soft2-rgb', 'navy-100',      '--navy-100 / --progress-bg — 배지·선택 상태'),
    ('--brand-strong-rgb','navy-900',      '--navy-900 / --brand-dark'),
    ('--teal-rgb',        'accent-cyan',   '--accent-cyan'),
    ('--good-rgb',        'success-fg',    '--success-fg'),
    ('--warn-rgb',        'accent-amber',  '--accent-amber'),
    ('--bad-rgb',         'danger-fg',     '--danger-fg'),
    ('--badge-cart-rgb',  'navy-700',      '--brand-primary (원본도 브랜드색과 같은 값이었다)'),
]

# 레퍼런스가 chrome 에 실제로 쓰는 그라디언트 3종 (실측값 그대로)
GRADIENTS = [
    ('--gradient-brand',     'linear-gradient(135deg,#0e2e66 0%,#102a5a 45%,#111d37 100%)'),
    ('--gradient-brand-2',   'linear-gradient(135deg,#0d3473 0%,#111d37 100%)'),
    ('--gradient-highlight', 'radial-gradient(120% 120% at 85% 15%,#ffffff1a,transparent 55%)'),
]

# ── 2. 사다리 ───────────────────────────────────────────────────────────────
# 레퍼런스 radius ladder: sm 8 / md 12 / lg 16 / xl 20 / full 999.
# 목업의 10/14/18/22 를 그 위에 얹는다 — 입력·버튼은 md, 카드는 lg, 시트는 xl.
RADIUS = [('.rounded-sm', 12, '--radius-md — 입력·버튼'),
          ('.rounded-md', 16, '--radius-lg — 카드'),
          ('.rounded-lg', 20, '--radius-xl — 시트·배너'),
          ('.rounded-xl', 20, '--radius-xl — 큰 카드·섹션')]

# 그림자는 전부 navy-900 베이스 저알파다 (--shadow-sm/md/lg/navy).
SHADOW = [
    ('.shadow-pop',   '0 1px 2px #111d370f',   '--shadow-sm'),
    ('.shadow-sh-md', '0 4px 16px #111d3714',  '--shadow-md'),
    ('.shadow-sh-lg', '0 12px 32px #111d371f', '--shadow-lg'),
    ('.shadow-float', '0 12px 32px #111d371f', '--shadow-lg — floating'),
]

# 굵기: 레퍼런스는 500/600/700 세 단을 쓴다. 목업의 800 만 700 으로 접는다.
WEIGHT = [('.font-black', 700), ('.font-extrabold', 700)]


def tracking(px):
    """레퍼런스 규칙: 본문 -.01em, 헤딩(h1~h6) -.03em.
    목업은 헤딩 태그 대신 크기로 위계를 세우므로 크기 구간으로 옮긴다."""
    if px >= 19: return '-.03em'
    if px >= 15: return '-.02em'
    return '-.01em'


# ── 3. 색 치환 ──────────────────────────────────────────────────────────────
HEX  = re.compile(r'#([0-9a-fA-F]{3,8})\b')
FUNC = re.compile(r'rgba?\(\s*([0-9.]+)\s*[, ]\s*([0-9.]+)\s*[, ]\s*([0-9.]+)'
                  r'\s*(?:[,/]\s*((?:var\([^()]*\)|[^()])*?)\s*)?\)')

# 제3자 브랜드 마크. 팔레트로 옮기면 무엇을 가리키는 항목인지가 사라진다.
KEEP_BRAND = {(3, 199, 90), (193, 18, 47)}     # 네이버 #03C75A · 쿠팡 #C1122F

NAVY_STEPS = {'navy-900', 'navy-800', 'navy-700', 'navy-600', 'navy-500'}


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
    if prop in ('color', 'fill'): return 'text'
    if 'border' in prop or prop in ('stroke', 'outline-color'): return 'line'
    return 'fill'


def snap_name(rgb, role):
    """스냅 결과 토큰명. 그대로 둬야 하는 색은 None."""
    if rgb in ((255, 255, 255), (0, 0, 0)): return None   # 알파 오버레이 — 스냅할 hue 가 없다
    if rgb in KEEP_BRAND: return None
    return snap(rgb, role)


def convert_color(rgb, alpha, role):
    n = snap_name(rgb, role)
    return emit(rgb if n is None else V(n), alpha)


def _parse_func(m):
    rgb = tuple(int(float(m.group(i))) for i in (1, 2, 3))
    a = m.group(4)
    if a is not None:
        a = a.strip()
        if re.fullmatch(r'[0-9.]+%?', a):
            a = float(a[:-1]) / 100 if a.endswith('%') else float(a)
    return rgb, a


def recolor(val, prop):
    role = role_of(prop)
    def h(m):
        rgb, a = parse_hex(m.group(1))
        return m.group(0) if rgb is None else convert_color(rgb, a, role)
    def f(m):
        rgb, a = _parse_func(m)
        return convert_color(rgb, a, role)
    return FUNC.sub(f, HEX.sub(h, val))


# data: URI 안의 색은 퍼센트 인코딩(%23rrggbb)이라 위 정규식에 안 걸린다.
# select 화살표 아이콘 170개가 여기에 옛 회색(#8a90a2)을 물고 있다.
DATA_HEX = re.compile(r'%23([0-9a-fA-F]{6})\b')


def recolor_data_uri(val):
    def one(m):
        rgb, _ = parse_hex(m.group(1))
        n = snap_name(rgb, 'line')          # 아이콘 stroke 이므로 line 역할
        return m.group(0) if n is None else '%%23%s' % hexs(V(n))[1:]
    return DATA_HEX.sub(one, val)


GRAD = re.compile(r'(linear|radial|conic)-gradient\((?:[^()]|\([^()]*\))*\)')


def regrade(val, prop):
    """그라디언트를 평탄화하지 않고 스톱만 스냅한다.

    레퍼런스는 chrome 에 그라디언트를 쓴다 — 다만 쓰는 그라디언트는 navy 계열
    하나뿐이다. 그래서 스톱이 전부 navy 사다리로 떨어지면 통째로
    var(--gradient-brand) 로 바꿔 브랜드 그라디언트 하나로 수렴시킨다.
    """
    def one(m):
        g = m.group(0)
        names = []
        for cm in HEX.finditer(g):
            rgb, a = parse_hex(cm.group(1))
            if rgb: names.append(snap_name(rgb, 'fill'))
        for cm in FUNC.finditer(g):
            rgb, a = _parse_func(cm)
            names.append(snap_name(rgb, 'fill'))
        solid = [n for n in names if n is not None]
        if solid and all(n in NAVY_STEPS for n in solid):
            return 'var(--gradient-brand)'
        return recolor(g, prop)
    return GRAD.sub(one, val)


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
    """변수를 안 쓰고 색을 직접 박은 규칙만 골라 레퍼런스 팔레트로 재작성한다."""
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
            if 'gradient(' in val:
                out = regrade(val, prop); n_grad += 1
            else:
                out = recolor(val, prop)
            if out == val: continue
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
def build_theme(css, sizes):
    L = []
    add = L.append
    add('/* ' + '=' * 74)
    add('   BLUEEGG LIGHT 리테마 — tools/light_retheme.py 가 생성. 직접 고치지 말 것.')
    add('   출처: https://self-marketing-light.vercel.app/marketing 런타임 스타일시트.')
    add('   ' + '=' * 74 + ' */')

    add('\n/* ── 1. base 토큰 ─────────────────────────────────────────────── */')
    add(':root{')
    for var, tok, note in TOKENS:
        add('  %-20s %-15s /* %-13s %s */' % (var + ':', R(tok) + ';', tok, note))
    add('  --focus: 0 0 0 3px rgb(%s / .18);   /* focus 링은 brand-primary */' % R('navy-700'))
    add('}')

    add('\n/* ── 2. chrome 그라디언트 — 레퍼런스가 쓰는 3종이 전부다 ────────── */')
    add(':root{%s}' % ';'.join('%s:%s' % g for g in GRADIENTS))

    add('\n/* ── 3. 서비스 태그 — 앰버는 밝아서 텍스트로 못 쓴다. 어두운 파생 step ── */')
    add(':root{--svc-tag-fg:%s;--svc-tag-bg:%s;--svc-tag-line:%s}'
        % (H('amber-ink'), H('amber-bg'), H('amber-line')))

    add('\n/* ── 4. radius ladder — 8/12/16/20/999 ───────────────────────── */')
    for cls, px, note in RADIUS:
        add('%-14s{border-radius:%dpx}   /* %s */' % (cls, px, note))

    add('\n/* ── 5. elevation — navy-900 베이스 저알파 4단 ─────────────────── */')
    for cls, val, note in SHADOW:
        add('%-14s{--tw-shadow:%s;box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),'
            'var(--tw-ring-shadow,0 0 #0000),%s}  /* %s */' % (cls, val, val, note))
    add('/* 카드 hover — 레퍼런스 .card-hover 규격 */')
    add('.hover\\:shadow-float:hover{border-color:%s;box-shadow:0 4px 16px #111d371a}' % H('border-strong'))

    add('\n/* ── 6. weight ramp — 레퍼런스는 500/600/700 세 단만 쓴다 ──────── */')
    for cls, w in WEIGHT:
        add('%-16s{font-weight:%d}' % (cls, w))

    add('\n/* ── 7. tracking — 본문 -.01em / 헤딩 -.03em ───────────────────── */')
    add('body{letter-spacing:-.01em}')
    add('h1,h2,h3,h4,h5,h6{letter-spacing:-.03em;word-break:keep-all}')
    buckets = {}
    for s in sizes: buckets.setdefault(tracking(s), []).append(s)
    for tr, ss in sorted(buckets.items()):
        selg = ','.join('[class*="text-[%gpx]"]' % s for s in sorted(ss, reverse=True))
        add('%s{letter-spacing:%s}' % (selg, tr))
    add('.text-2xl,.text-xl,.text-lg{letter-spacing:-.03em}')
    add('.text-base,.text-sm{letter-spacing:-.02em}')

    add('\n/* ── 8. 모션 — 레퍼런스 .card-hover 는 200ms 3속성뿐이다 ────────── */')
    add('.transition,.transition-all,.transition-colors,.transition-opacity,'
        '.transition-transform,.transition-shadow{transition-duration:200ms}')

    add('\n/* ── 9. focus — 2px brand-primary 아웃라인, offset 2px ─────────── */')
    add(':focus-visible{outline:2px solid %s;outline-offset:2px;border-radius:6px}' % H('navy-700'))
    add('button:focus-visible,a:focus-visible{border-radius:8px}')
    add('input:focus,textarea:focus,select:focus{outline:none;background-color:#fff;'
        'border-color:%s;box-shadow:0 0 0 3px rgb(%s / .18)}' % (H('navy-700'), R('navy-700')))

    add('\n/* ── 10. 선택 영역 · 스크롤바 · select 화살표 (레퍼런스 실측) ────── */')
    add('::selection{background:#bfd0ec;color:%s}' % H('navy-900'))
    add('::-webkit-scrollbar{width:4px;height:4px}')
    add('::-webkit-scrollbar-track{background:0 0}')
    add('::-webkit-scrollbar-thumb{background:#d1d6db;border-radius:4px}')
    add('::-webkit-scrollbar-thumb:hover{background:#b0b8c1}')

    add('\n/* ── 11. 차트 — 축선은 헤어라인, 막대 상단 라운드 ───────────────── */')
    add('svg .stroke-line{stroke:%s}' % H('border'))
    add('svg rect.fill-primary{rx:4px}')
    add('svg rect.fill-primary[opacity="0.08"]{display:none}')

    add("""
/* ── 12. 좌측 네비게이션 ─────────────────────────────────────────
   레퍼런스 레일의 규격을 그대로 옮긴다.
     · 행 높이 38px / 라운드 10px / 좌우 패딩 12px
     · 선택 상태 = navy-100 배경 + brand-primary 텍스트 + 3px 좌측 바
       (원본은 활성 링크에 aria-current="page" 를 붙이는데 받는 스타일이 없었다)
     · 그룹 라벨 = 11px, 자간 0, 위에 헤어라인 구분선
   아이콘의 서비스별 색은 그대로 둔다 — 레퍼런스도 플레이스 그린·쿠팡 레드·
   네이버 그린을 레일에서 유지한다.
   셀렉터는 aside[class*="min-[901px]:w-60"] 안으로만 한정한다.
   ------------------------------------------------------------------- */

aside[class*="min-[901px]:w-60"]{padding:12px 10px;gap:2px;background-color:#fff}

/* 레일 폭 — 레퍼런스 `--sidebar-w: 260px`. 목업은 w-60(240px)이라 20px 좁았다.
   모바일 드로어(264px / max-w 84vw)는 그대로 두려고 데스크탑 브레이크포인트 안에만 건다. */
@media(min-width:901px){aside[class*="min-[901px]:w-60"]{width:260px}}

aside[class*="min-[901px]:w-60"] a[href^="/"],
aside[class*="min-[901px]:w-60"] button[class*="w-full"]{padding:9px 12px;border-radius:10px;min-height:38px}

/* 쓰이지 않는 선행 슬롯을 걷어낸다 — 라벨 폭 26px 을 되찾고 위계가 바로 선다 */
aside[class*="min-[901px]:w-60"] span[class="w-[18px] shrink-0"]{display:none}

aside[class*="min-[901px]:w-60"] svg[class*="h-[15px]"]{height:17px;width:17px}

/* hover 는 중립 표면색으로 통일한다 (어드민은 회색, 플랫폼은 브랜드색이라 서로 달랐다) */
aside[class*="min-[901px]:w-60"] a[href^="/"]:hover,
aside[class*="min-[901px]:w-60"] button[class*="w-full"]:hover{
  background-color:rgb(var(--surface-2-rgb));color:rgb(var(--ink-rgb))}

/* 선택 상태 */
aside[class*="min-[901px]:w-60"] a[aria-current="page"],
aside[class*="min-[901px]:w-60"] a[aria-current="page"]:hover{
  background-color:rgb(var(--brand-soft2-rgb));color:rgb(var(--brand-rgb));font-weight:700;
  box-shadow:inset 3px 0 0 rgb(var(--brand-rgb))}

aside[class*="min-[901px]:w-60"] button[class*="w-full"]{font-weight:600;color:rgb(var(--ink-rgb))}

/* 그룹 라벨 — 레퍼런스는 넓은 자간 마이크로 캡스를 쓰지 않는다 */
aside[class*="min-[901px]:w-60"] [class*="tracking-[.07em]"]{
  font-size:11px;font-weight:700;letter-spacing:0;color:rgb(var(--faint-rgb));
  margin:16px 0 4px;padding:14px 12px 0;border-top:1px solid rgb(var(--line-rgb))}

aside[class*="min-[901px]:w-60"] [class*="ml-[13px]"][class*="border-l"]{
  border-left-color:rgb(var(--line-rgb))}

/* 즐겨찾기 별 — 레퍼런스의 티어 배지와 같은 앰버 */
aside[class*="min-[901px]:w-60"] button[aria-pressed]:hover{
  color:rgb(var(--warn-rgb));background-color:rgb(var(--surface-2-rgb))}
aside[class*="min-[901px]:w-60"] button[aria-pressed="true"]{color:rgb(var(--warn-rgb))}
""")

    add('\n/* ── 13. 색을 직접 박은 규칙 오버라이드 (자동 생성) ─────────────── */')
    ov, ng, nc = build_overrides(css)
    L.extend(ov)
    return '\n'.join(L), len(ov), ng, nc


NAV_FIX = """
<script id="light-nav-fix">
/* ---------------------------------------------------------------------------
   셸의 내비게이션 버튼 배선. (tools/toss_retheme.py 와 같은 스크립트다.)

   목업 런타임은 `a[href^="/"]` 클릭만 가로채 해시로 옮긴다. 홈·어드민 이동
   컨트롤은 실제 앱에서 <button> + onClick 이라 링크 가로채기에 걸리지 않아
   원본 목업에서는 눌러도 아무 일이 없었다.

   #root 는 해시가 바뀔 때마다 innerHTML 째로 다시 그려져 직접 건 리스너가
   날아간다. 그래서 document 에 위임(delegation)으로 건다.
   --------------------------------------------------------------------------- */
(function () {
  var ROUTES = {
    '어드민 홈': '#/admin/',
    '어드민 페이지로 이동': '#/admin/',
    '홈(런처)으로': '#/platform/',
    '홈으로': '#/platform/',
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

    theme, n_rules, n_grad, n_col = build_theme(css, sizes)

    # 인라인 style 의 색 (인라인은 스타일시트로 못 이긴다)
    n_inline = [0]
    def fix_inline(m):
        val = m.group(0)
        if 'svcCafe' in val: return val
        def one(d):
            prop, v = d.group(1), d.group(2)
            out = (regrade if 'gradient(' in v else recolor)(v, prop)
            out = recolor_data_uri(out)
            if out != v: n_inline[0] += 1
            return '%s:%s' % (prop, out)
        return re.sub(r'(background|background-color|background-image|color|border-color|'
                      r'border-top-color|border-bottom-color|border-left-color|border-right-color|'
                      r'fill|stroke)\s*:\s*([^;"]+)', one, val)

    new_body = re.sub(r'style="[^"]*"', fix_inline, body)

    # SVG 프레젠테이션 속성(stroke="#…" / fill="#…")에 박힌 색.
    # CSS 도 인라인 style 도 아니라 리테마를 안 타고 남던 자리다 — 토스 리테마는
    # 레일만 처리하고 본문 214개를 남겼다. 이쪽은 아이콘 색을 currentColor 로
    # 강제하지 않으므로(레퍼런스가 서비스별 색을 유지한다) 팔레트로 스냅한다.
    n_attr = [0]
    def fix_attr(m):
        attr, hx = m.group(1), m.group(2)
        rgb, _ = parse_hex(hx.lstrip('#'))
        if rgb is None: return m.group(0)
        n = snap_name(rgb, 'text' if attr == 'fill' else 'line')
        if n is None: return m.group(0)
        n_attr[0] += 1
        return '%s="%s"' % (attr, hexs(V(n)))

    # svcCafe 화면은 통째로 건너뛴다.
    cafe = re.search(r'<template[^>]*data-screen="platform/cafe".*?</template>', new_body, re.S)
    span = cafe.span() if cafe else None
    def fix_attrs_outside_cafe(text):
        if span is None:
            return re.sub(r'\b(stroke|fill)="(#[0-9a-fA-F]{3,8})"', fix_attr, text)
        a, b = span
        return (re.sub(r'\b(stroke|fill)="(#[0-9a-fA-F]{3,8})"', fix_attr, text[:a])
                + text[a:b]
                + re.sub(r'\b(stroke|fill)="(#[0-9a-fA-F]{3,8})"', fix_attr, text[b:]))
    new_body = fix_attrs_outside_cafe(new_body)

    # 대시보드(`platform/`)는 색이 아니라 레이아웃을 바꾸는 자리라 화면 한 벌을 새로 짠다.
    # 위의 리컬러 패스가 **끝난 뒤에** 넣는다 — 레퍼런스 자산의 색을 스냅으로 뭉개면 안 된다.
    m = re.search(r'(<template data-screen="platform/">)(.*?)(</template>)', new_body, re.S)
    if not m:
        raise SystemExit('platform/ 화면 템플릿을 찾지 못했다')
    data = light_home.extract(m.group(2))
    new_body = new_body[:m.start(2)] + light_home.build(data) + new_body[m.end(2):]

    # 사이드바 프로필 카드는 셸에 들어간다 — 레퍼런스도 레일 전역 요소다.
    sm = re.search(r'(<template data-shell="platform">)(.*?)(</template>)', new_body, re.S)
    if not sm:
        raise SystemExit('platform 셸 템플릿을 찾지 못했다')
    shell, n_collapse = light_home.inject_sidebar(sm.group(2), data)
    new_body = new_body[:sm.start(2)] + shell + new_body[sm.end(2):]

    # 두 번째 레퍼런스(NEEDS 시안)의 시각 언어 — 대시보드 + 랜딩 화면에만 건다.
    new_body, n_split = light_ref2.split_cards(new_body)
    new_body, n_ref2 = light_ref2.mark(new_body)

    theme += '\n' + light_home.HOME_CSS + '\n' + light_ref2.CSS

    block = '\n<style id="light-theme">\n%s\n</style>\n' % theme
    head = html[:html.index('</head>')]
    out = head + block + '</head>\n' + new_body.replace(
        '</body>', NAV_FIX + light_home.HOME_JS + '</body>')
    out = out.replace('<title>BLUE EGG — 최종 목업 (운영 실측)</title>',
                      '<title>BLUE EGG — Light 디자인 적용본</title>')
    open(DST, 'w', encoding='utf-8').write(out)

    print('생성: %s  (%.1f MB)' % (os.path.basename(DST), os.path.getsize(DST) / 1e6))
    print('  :root 토큰 재정의       %d개' % len(TOKENS))
    print('  자동 오버라이드 규칙     %d개  (색 선언 %d건, 그라디언트 %d건 리컬러)'
          % (n_rules, n_col, n_grad))
    print('  인라인 style 색 선언     %d건' % n_inline[0])
    print('  SVG stroke/fill 속성     %d건  (네이버·쿠팡 브랜드 마크는 유지)' % n_attr[0])
    print('  대시보드 재작성          공지 %d · 캠페인 %d · 배너 %d · 주문 %d건'
          % (len(data['notice']), len(data['campaign']), len(data['banner']), len(data['order'])))
    print('  사이드바 프로필·홈 행     주입 · 채널 그룹 %d개 접음' % n_collapse)
    print('  NEEDS 시안 언어          화면 %d개 · 분할 카드 섹션 %d개' % (n_ref2, n_split))


if __name__ == '__main__':
    main()
