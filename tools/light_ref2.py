# -*- coding: utf-8 -*-
"""두 번째 디자인 레퍼런스(NEEDS 섹션 시안)의 시각 언어를 입힌다.

시안: 왼쪽 밝은 면(고스트 숫자 + 제목) / 오른쪽 네이비 그라디언트 면(제목 + 설명),
이음새에 하늘색 원형 화살표. 지면은 흰색, 카드는 1px 헤어라인 + 라운드 12.

색은 시안 이미지에서 **직접 샘플링**했다(추측 아님).

  지면            #ffffff
  카드 헤어라인    #e1e4e8
  네이비 면       linear-gradient(135deg,#324371 0%,#1a274a 100%)
                  (실측 모서리 TL #324371 / TR #212f55 / BL #2b3b66 / BR #1a274a)
  네이비 위 제목   #ffffff
  네이비 위 본문   rgba(255,255,255,.66)   (실측 #b5bac8 를 배경에 역산)
  고스트 숫자      #d3d5d7
  헤딩·카드 제목   #0d1522
  설명 줄         #3e444e
  아이브로우      #4384ca
  원형 화살표      배경 #a3cffd / 화살표 #0d1522
  라운드          12px  (모서리 호 실측 31→43px)
  카드 간격        20px

적용 범위 — 대시보드 + 랜딩 화면. 어드민·캠페인 관리 등 업무 화면은 건드리지 않는다.

⚠️ 랜딩 화면은 서비스마다 자기 강조색을 갖는다(홈페이지 스카이 / 브랜딩 인디고 /
   이미지 핑크 / 영상 오렌지 …). 그 색까지 네이비로 통일하면 7개 서비스가 한 덩어리로
   뭉개진다. **서비스 강조색은 그대로 두고** 지면·면·헤어라인·라운드만 시안으로 옮겼다.
"""
import re

# ── 실측 토큰 ───────────────────────────────────────────────────────────────
BG        = '#ffffff'
HAIRLINE  = '#e1e4e8'
PANEL     = 'linear-gradient(135deg,#324371 0%,#1a274a 100%)'
GHOST     = '#d3d5d7'
HEADING   = '#0d1522'
SUB       = '#3e444e'
EYEBROW   = '#4384ca'
ARROW_BG  = '#a3cffd'
ARROW_FG  = '#0d1522'
RADIUS    = 12

# 시안 언어를 입힐 화면. 대시보드 + 랜딩(추가 서비스) 화면들이다.
SCOPE = [
    'platform/',              # 대시보드
    'platform/content',       # 추가 서비스 인덱스
    'platform/content_home',  # 홈페이지 제작
    'platform/content_branding',
    'platform/content_detail',
    'platform/content_video',
    'platform/perf',          # 네이버 SA광고 최적화
    'platform/ad_refund',     # 광고비 환급
    'platform/cafe',          # 네이버 카페 침투
]

ARROW_SVG = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6">'
             '<path stroke-linecap="round" stroke-linejoin="round" d="M4 12h15m0 0l-6-6m6 6l-6 6">'
             '</path></svg>')


def mark(body):
    """대상 화면의 `<main>` 에 `be-ref2` 클래스를 붙인다. 스타일 스코프 후크다.

    탭·행 변형 템플릿도 같은 data-screen 을 쓰므로 함께 걸린다 — 그래야 탭을 눌러
    본문이 갈아 끼워져도 시각 언어가 유지된다.
    """
    n = [0]
    out, i = [], 0
    for m in re.finditer(r'<template data-screen="([^"]+)"[^>]*>', body):
        out.append(body[i:m.end()])
        i = m.end()
        if m.group(1) not in SCOPE:
            continue
        mm = re.compile(r'\s*<main\b[^>]*?class="').match(body, i)
        if not mm:
            continue
        out.append(body[i:mm.end()] + 'be-ref2 ')
        i = mm.end()
        n[0] += 1
    out.append(body[i:])
    return ''.join(out), n[0]


# ── 시안의 분할 카드 ────────────────────────────────────────────────────────
# content_home 의 「5단계 제작 프로세스」는 번호 + 제목 + 설명 구조라 시안 카드에
# 그대로 얹힌다. 왼쪽 = 고스트 숫자 + 제목, 오른쪽 = 네이비 면 + 설명.
_HEAD = re.compile(
    r'<div class="mb-4 rounded-lg px-8 py-\[34px\]"[^>]*>'
    r'<div class="mb-\[10px\] text-xs font-extrabold uppercase tracking-\[\.14em\][^"]*">([^<]+)</div>'
    r'<h3 class="mb-6 text-\[25px\] font-extrabold text-white">([^<]+)</h3>'
    r'<div class="grid grid-cols-5 gap-4 max-\[820px\]:grid-cols-1">')

_STEP = re.compile(
    r'<div class="rounded-lg border border-white/10 bg-white/5 p-\[18px\]">'
    r'<div class="mb-\[14px\] grid h-10 w-10[^"]*"[^>]*>(\d+)</div>'
    r'<div class="mb-\[6px\] text-\[15px\] font-bold leading-\[1\.3\] text-white">(.*?)</div>'
    r'<div class="text-\[13px\] leading-\[1\.6\] text-white/50">(.*?)</div></div>', re.S)

_TAIL = '</div></div>'


def split_cards(body):
    """번호 스텝 그리드를 시안의 분할 카드로 바꾼다.

    카드가 몇 장인지 모르므로 헤더를 찾은 뒤 스텝 카드를 **연속으로** 물어 나간다.
    (`(.*?)</div></div>` 로 한 번에 잡으려 하면 첫 카드에서 끊긴다 — 카드 안에도
    닫는 div 가 연달아 나오기 때문이다.)
    """
    out, i, n = [], 0, 0
    while True:
        h = _HEAD.search(body, i)
        if not h:
            break
        steps, p = [], h.end()
        while True:
            sm = _STEP.match(body, p)
            if not sm:
                break
            steps.append(sm.groups())
            p = sm.end()
        if len(steps) < 2 or not body.startswith(_TAIL, p):
            out.append(body[i:h.end()]); i = h.end(); continue
        cards = ''.join(
            '<div class="be-split">'
            '<div class="be-split__l"><span class="be-split__n">%s</span>'
            '<p class="be-split__t">%s</p></div>'
            '<span class="be-split__go">%s</span>'
            '<div class="be-split__r"><p class="be-split__d">%s</p></div></div>'
            % (num, title, ARROW_SVG, desc) for num, title, desc in steps)
        out.append(body[i:h.start()])
        out.append('<section class="be-needs">'
                   '<p class="be-needs__eyebrow">%s</p>'
                   '<h3 class="be-needs__h">%s</h3>'
                   '<div class="be-needs__grid">%s</div></section>'
                   % (h.group(1), h.group(2), cards))
        i = p + len(_TAIL)
        n += 1
    out.append(body[i:])
    return ''.join(out), n


# ── 스타일 ──────────────────────────────────────────────────────────────────
CSS = """
/* ── 두 번째 레퍼런스(NEEDS 시안)의 시각 언어 ─────────────────────
   tools/light_ref2.py 가 생성. 값은 시안 이미지에서 직접 샘플링했다.
   `.be-ref2` 는 대시보드 + 랜딩 화면의 <main> 에만 붙는다 —
   어드민·캠페인 관리 등 업무 화면은 이 규칙을 안 탄다.
   ---------------------------------------------------------------- */

/* 지면은 회색 캔버스가 아니라 흰색이다 */
.be-ref2{background:%(BG)s}
.be-ref2 .bg-canvas{background-color:%(BG)s}

/* 카드 — 라운드 12 / 1px 헤어라인. 시안 모서리 호 실측 12px. */
.be-ref2 .rounded-md,.be-ref2 .rounded-lg,.be-ref2 .rounded-xl,
.be-ref2 .be-card,.be-ref2 .be-hero,.be-ref2 .be-pcard{border-radius:%(RADIUS)dpx}
.be-ref2 .rounded-sm{border-radius:8px}
.be-ref2 .border-line,.be-ref2 .be-card,.be-ref2 .be-pcard{border-color:%(HAIRLINE)s}

/* 네이비 면 — 리테마가 chrome 그라디언트를 전부 이 변수로 수렴시켜 뒀다.
   변수 하나만 갈아끼우면 이 화면들의 네이비 면이 전부 시안 값이 된다. */
.be-ref2{--gradient-brand:%(PANEL)s}

/* 헤딩 — 시안은 브랜드 네이비가 아니라 거의 검정에 가까운 잉크다 */
.be-ref2 .be-card__title,.be-ref2 .be-greet__t,.be-ref2 .be-needs__h{color:%(HEADING)s}

/* ── 분할 카드 ───────────────────────────────────────────────── */
.be-needs{margin:0 0 16px;padding:34px 32px;border:1px solid %(HAIRLINE)s;
  border-radius:%(RADIUS)dpx;background:%(BG)s}
.be-needs__eyebrow{margin:0 0 14px;font-size:12px;font-weight:800;letter-spacing:.14em;
  text-transform:uppercase;color:%(EYEBROW)s}
.be-needs__h{margin:0 0 26px;font-size:25px;font-weight:800;letter-spacing:-.03em;
  color:%(HEADING)s}
.be-needs__grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
@media(max-width:900px){.be-needs__grid{grid-template-columns:1fr}
  .be-needs{padding:24px 20px}}

.be-split{position:relative;display:grid;grid-template-columns:43fr 57fr;min-height:152px;
  border:1px solid %(HAIRLINE)s;border-radius:%(RADIUS)dpx;background:%(BG)s;overflow:hidden}
.be-split__l{display:flex;flex-direction:column;justify-content:center;gap:22px;
  padding:24px 28px}
.be-split__n{font-size:30px;font-weight:800;line-height:1;letter-spacing:-.02em;color:%(GHOST)s;
  font-variant-numeric:tabular-nums}
.be-split__t{margin:0;font-size:16px;font-weight:800;letter-spacing:-.02em;color:%(HEADING)s;
  word-break:keep-all}
.be-split__r{display:flex;flex-direction:column;justify-content:center;padding:24px 28px;
  background:%(PANEL)s}
.be-split__d{margin:0;font-size:13.5px;line-height:1.7;color:rgba(255,255,255,.66);
  word-break:keep-all}

/* 이음새에 걸치는 하늘색 원형 화살표 */
.be-split__go{position:absolute;left:43%%;top:50%%;transform:translate(-50%%,-50%%);z-index:1;
  display:grid;place-items:center;width:38px;height:38px;border-radius:999px;
  background:%(ARROW_BG)s;color:%(ARROW_FG)s}
.be-split__go svg{width:17px;height:17px}
@media(max-width:640px){
  .be-split{grid-template-columns:1fr}
  .be-split__go{left:auto;right:20px;top:auto;bottom:calc(50%% - 19px)}}
""" % dict(BG=BG, HAIRLINE=HAIRLINE, PANEL=PANEL, GHOST=GHOST, HEADING=HEADING,
           EYEBROW=EYEBROW, ARROW_BG=ARROW_BG, ARROW_FG=ARROW_FG, RADIUS=RADIUS)
