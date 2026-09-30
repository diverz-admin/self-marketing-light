# -*- coding: utf-8 -*-
"""플랫폼 대시보드(`#/platform/`)를 레퍼런스 레이아웃으로 다시 짠다.

레퍼런스: https://self-marketing-light.vercel.app/marketing

리테마(색·라운드·그림자)는 토큰 레이어만 갈아끼우면 됐지만 **레이아웃은 마크업 문제**라
화면 한 벌을 새로 짠다. 원본 목업 화면에서 데이터를 뽑아 레퍼런스 구조에 다시 담는 방식이라,
목업을 다시 수집해도 공지·캠페인·주문 내용이 자동으로 따라온다. 지어낸 데이터는 없다.

레퍼런스 구조
    main
      ├ 본문 칼럼 (flex-1, px 40 / pt 40, 세로 gap 24)
      │   ├ 인사말
      │   ├ section  2열 gap 20 — [공지사항]        [다크 히어로]
      │   └ section  2열 gap 20 — [운영중인 캠페인]  [순위 추적]
      └ 우측 레일 320px (border-left, bg canvas)
          └ [포인트]  [즐겨찾기]  [실시간 주문 현황]

원본 목업의 블록이 어디로 갔는지
    인사말             → 그대로 (레퍼런스도 본문 첫 줄에 둔다)
    KPI 4장            → 보유 포인트는 레일 첫 카드로, 나머지 3개는 히어로 하단 스탯 타일로
    즐겨찾기           → 레일 두 번째 카드
    배너 캐러셀 3장    → 다크 히어로 (레퍼런스의 고객 인터뷰 카드 자리 · 도트로 전환)
    새소식 7건         → 공지사항 카드
    운영중인 캠페인 5건 → 그대로
    순위 추적          → 그대로
    실시간 주문 5건     → 레일 세 번째 카드

⚠️ 이 마크업은 목업의 컴파일된 Tailwind 클래스를 쓰지 않는다. 목업 CSS 에 없는 유틸리티는
   아무 일도 하지 않기 때문이다. 대신 `be-*` 클래스를 쓰고 HOME_CSS 로 직접 정의한다.
   색은 리테마 토큰(`--brand-rgb` 등)을 타므로 팔레트를 바꾸면 이 화면도 같이 바뀐다.
"""
import re

from light_icons import ICONS


# ── 1. 원본 화면에서 데이터 뽑기 ────────────────────────────────────────────
def _txt(x):
    return re.sub(r'<[^>]+>', '', x).strip()


def extract(html):
    """`<template data-screen="platform/">` 안쪽을 구조화한다."""
    d = {}

    d['kpi'] = [dict(label=m.group(1), value=m.group(2), unit=m.group(3), action=m.group(4))
                for m in re.finditer(
                    r'<div class="mb-\[7px\] text-\[12px\] font-bold text-muted">([^<]+)</div>'
                    r'<div class="text-\[23px\][^"]*">([0-9,]+)<small[^>]*>([^<]+)</small></div>'
                    r'(?:<button[^>]*>([^<]+)</button>)?', html)]

    d['banner'] = [dict(title=m.group(1), sub=m.group(2), cta=m.group(3))
                   for m in re.finditer(
                       r'<h3 class="text-xl font-extrabold[^"]*">([^<]+)</h3>'
                       r'<p class="mt-2 text-\[13\.5px\][^"]*">([^<]+)</p>'
                       r'<button[^>]*>([^<]+)</button>', html)]

    d['notice'] = [dict(badge=m.group(1), title=_txt(m.group(2)), date=m.group(3))
                   for m in re.finditer(
                       r'<span class="flex-shrink-0 rounded-\[4px\][^"]*">([^<]+)</span>'
                       r'<span class="min-w-0 flex-1 truncate">(.*?)</span>'
                       r'<span class="flex-shrink-0 text-\[11px\] tabular-nums text-faint">([^<]+)</span>', html)]

    tile = r'bg-\[linear-gradient\(140deg,(#[0-9a-f]{6}),(#[0-9a-f]{6})\)\]">([^<]+)</div>'

    d['campaign'] = [dict(c1=m.group(1), c2=m.group(2), tile=m.group(3),
                          title=_txt(m.group(4)), meta=_txt(m.group(5)), status=m.group(6))
                     for m in re.finditer(
                         tile + r'<div class="min-w-0 flex-1">'
                         r'<div class="truncate text-\[13px\] font-bold">(.*?)</div>'
                         r'<div class="truncate text-\[11px\] text-muted">(.*?)</div></div>'
                         r'.*?text-good"><span[^>]*></span>([^<]+)</span>', html)]

    d['order'] = [dict(c1=m.group(1), c2=m.group(2), tile=m.group(3), user=m.group(4),
                       svc=m.group(5), qty=m.group(6), ago=m.group(7))
                  for m in re.finditer(
                      tile + r'<div class="min-w-0 flex-1">'
                      r'<div class="text-\[13px\] leading-\[1\.45\] text-ink-2">'
                      r'<b[^>]*>([^<]+)</b> 님이 <span[^>]*>([^<]+)</span></div>'
                      r'<div class="mt-\[2px\] text-\[11\.5px\] font-semibold text-muted">([^<]+)</div></div>'
                      r'<span[^>]*>([^<]+)</span>', html)]

    def one(pat, default=''):
        m = re.search(pat, html)
        return m.group(1) if m else default

    d['rank_option'] = one(r'<option value="0">([^<]+)</option>')
    d['rank_empty'] = one(r'<div class="grid min-h-\[150px\] place-items-center text-\[13px\] text-muted">([^<]+)</div>')
    d['fav_empty'] = _txt(one(r'<div class="mb-\[22px\] rounded-md border border-dashed[^"]*">(.*?)</div>'))
    d['user'] = one(r'<b class="font-extrabold">([^<]+)</b>님, ')
    d['greet'] = one(r'<b class="font-extrabold">[^<]+</b>(님,[^<]+)</div>')
    return d


REQUIRED = {'kpi': 4, 'banner': 3, 'notice': 1, 'campaign': 1, 'order': 1}


def check(d):
    """수집본이 바뀌어 셀렉터가 어긋나면 조용히 빈 화면이 나가므로 여기서 막는다."""
    bad = ['%s %d개(최소 %d)' % (k, len(d.get(k) or []), n)
           for k, n in REQUIRED.items() if len(d.get(k) or []) < n]
    if bad:
        raise SystemExit('platform/ 홈 데이터 추출 실패 — ' + ', '.join(bad))


# 목업에 없는 값. 시안이 이 두 줄을 명시하고 있어 그대로 옮긴다.
# 값을 만들어 낸 자리이므로 여기 모아 둔다 — 실데이터가 생기면 여기만 바꾸면 된다.
TIER = 'Bronze'
EXPIRING = ('만료 예정 광고', '0', '개')

# 원본 레일의 홈은 라벨 없는 아이콘 버튼 하나였다(맨 윗줄, 햄버거 옆).
# 시안은 아이콘 + 「홈」 + 오른쪽 셰브런을 가진 정식 행이고 그 행이 선택 상태를 받는다.
HOME_ROW = (
    '<a class="be-navhome" href="/platform">'
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">'
    '<path stroke-linecap="round" stroke-linejoin="round" '
    'd="M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0L22.28 12M4.5 9.75v10.125c0 .621.504 1.125 '
    '1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 '
    '1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75"></path></svg>'
    '<span>홈</span>%s</a>' % ICONS['arrow_sm'])

# 태그 스캐너 — collapse_channel_groups 가 중첩 깊이를 세는 데 쓴다.
_TAG = re.compile(r'<(/?)([a-zA-Z][\w-]*)([^>]*)>')
_VOID = {'br', 'hr', 'img', 'input', 'meta', 'link', 'path', 'circle', 'ellipse',
         'rect', 'line', 'polygon', 'polyline', 'stop', 'use', 'source'}


# ── 2. 조각 ────────────────────────────────────────────────────────────────
def _head(icon, title, sub, more, href='#'):
    return (
        '<div class="be-card__head">'
        '<div class="be-card__id"><span class="be-tile">%s</span>'
        '<div><p class="be-card__title">%s</p><p class="be-card__sub">%s</p></div></div>'
        '<a class="be-card__more" href="%s">%s%s</a></div>'
        % (ICONS[icon], title, sub, href, more, ICONS['arrow_sm']))


def _notice_card(d):
    rows = ''.join(
        '<a class="be-nrow" href="/platform/notice">'
        '<span class="be-nrow__badge">%s</span>'
        '<p class="be-nrow__title">%s</p>'
        '<span class="be-nrow__date">%s</span></a>' % (n['badge'], n['title'], n['date'])
        for n in d['notice'])
    return ('<div class="be-card">%s<div class="be-card__body be-card__body--tight">%s</div></div>'
            % (_head('bell', '공지사항', 'BlueEgg 새소식', '더보기', '/platform/notice'), rows))


def _campaign_card(d):
    rows = ''
    for c in d['campaign']:
        # 목업 메타는 "네이버 쇼핑 · 키우라 아이비에기 · 09.03~09.08" 한 줄이다.
        # 레퍼런스는 채널 배지 / 제목 / 기간 세 자리로 나눠 쓰므로 그렇게 쪼갠다.
        parts = [p.strip() for p in c['meta'].split('·')]
        channel = parts[0] if parts else ''
        keyword = parts[1] if len(parts) > 2 else ''
        period = parts[-1] if len(parts) > 1 else ''
        rows += (
            '<div class="be-crow" role="button" tabindex="0">'
            '<span class="be-avatar" style="background:linear-gradient(140deg,%s,%s)">%s</span>'
            '<div class="be-crow__main">'
            '<div class="be-crow__tags">'
            '<span class="be-badge be-badge--good">%s</span>'
            '<span class="be-badge be-badge--brand">%s</span></div>'
            '<p class="be-crow__title">%s</p>'
            '<div class="be-crow__meta"><span class="be-crow__period">%s</span></div></div>'
            '<div class="be-crow__side"><p class="be-crow__kw">%s</p></div></div>'
            % (c['c1'], c['c2'], c['tile'], c['status'], channel, c['title'], period, keyword))
    return ('<div class="be-card">%s<div class="be-card__body">%s</div></div>'
            % (_head('clipboard', '현재 운영중인 캠페인', '진행 중인 캠페인 현황',
                     '전체보기', '/platform/campaigns'), rows))


def _rank_card(d):
    return (
        '<div class="be-card be-card--pad">'
        '<div class="be-card__head be-card__head--flat">'
        '<div class="be-card__id"><span class="be-tile">%s</span>'
        '<div><p class="be-card__title">내 캠페인 순위 추적하기</p>'
        '<p class="be-card__sub">채널별 순위 변동 확인</p></div></div>'
        '<a class="be-card__more be-card__more--brand" href="/platform/rank">등록하기%s</a></div>'
        '<div class="be-tabs">'
        '<button type="button" class="be-tab is-on">네이버 플레이스</button>'
        '<button type="button" class="be-tab">네이버 쇼핑</button>'
        '<span class="be-rank">-<small>위</small></span></div>'
        '<select class="be-select"><option>%s</option></select>'
        '<div class="be-chart be-chart--empty">%s</div></div>'
        % (ICONS['chart'], ICONS['edit'], d['rank_option'], d['rank_empty']))


def _hero(d):
    """레퍼런스의 다크 히어로. 목업 배너 3장이 여기 들어가고, 도트로 전환한다."""
    stats = ''.join(
        '<div class="be-stat"><span class="be-stat__v">%s%s</span>'
        '<span class="be-stat__k">%s</span></div>' % (k['value'], k['unit'], k['label'])
        for k in d['kpi'][1:4])
    slides = ''.join(
        '<div class="be-hero__slide%s" data-i="%d">'
        '<p class="be-hero__title">%s</p>'
        '<p class="be-hero__sub">%s</p>'
        '<span class="be-hero__cta">%s%s</span></div>'
        % (' is-on' if i == 0 else '', i, b['title'], b['sub'], b['cta'], ICONS['arrow'])
        for i, b in enumerate(d['banner']))
    dots = ''.join(
        '<button type="button" class="be-dot%s" data-i="%d" aria-label="배너 %d번으로 이동"></button>'
        % (' is-on' if i == 0 else '', i, i + 1) for i in range(len(d['banner'])))
    return (
        '<div class="be-hero" data-be-hero>'
        '<div class="be-hero__top"><span class="be-hero__eyebrow">이벤트 · 소식</span>'
        '<a class="be-hero__more" href="/platform/notice">공지 더보기%s</a></div>'
        '<div class="be-hero__mid">%s<div class="be-hero__slides">%s</div>'
        '<div class="be-hero__dots">%s</div></div>'
        '<div class="be-hero__stats">%s</div></div>'
        % (ICONS['arrow_sm'], ICONS['quote'], slides, dots, stats))


def profile_card(d):
    """사이드바 최상단의 네이비 프로필 카드 — 레퍼런스 레일의 서명 같은 요소다.

    「사용 가능 포인트」는 목업의 보유 포인트 KPI 를 그대로 쓴다.
    티어 배지와 「만료 예정 광고」는 목업에 데이터가 없어 시안 값을 옮겼다(위 TIER/EXPIRING).
    「My SNS 대시보드」는 목업에 대응 라우트가 없어 링크를 걸지 않았다.
    """
    point = d['kpi'][0]
    return (
        '<div class="be-prof">'
        '<div class="be-prof__top"><span class="be-prof__av">%s</span>'
        '<div class="be-prof__who"><p class="be-prof__name">%s <small>님</small></p>'
        '<span class="be-prof__tier">%s</span></div></div>'
        '<div class="be-prof__row"><span>사용 가능 포인트</span>'
        '<b>%s<small>%s</small></b></div>'
        '<div class="be-prof__row"><span>%s</span><b>%s<small>%s</small></b></div>'
        '<a class="be-prof__cta" href="/platform/charge">포인트 충전하기</a>'
        '<div class="be-prof__links">'
        '<a class="be-prof__link" href="/platform/campaigns">마이 캠페인 현황%s</a>'
        '<span class="be-prof__link is-off">My SNS 대시보드%s</span>'
        '</div></div>'
        % (d['user'][:1], d['user'], TIER, point['value'], point['unit'],
           EXPIRING[0], EXPIRING[1], EXPIRING[2], ICONS['arrow_sm'], ICONS['arrow_sm']))


def collapse_channel_groups(aside):
    """채널 그룹(2단째 하위 패널)을 접힌 상태로 시작시킨다.

    원본 목업은 셸을 **펼친 상태로** 수집해서 리프 20여 개가 모두 펼쳐져 있었다.
    시안은 채널 행만 보이고 그 아래는 접혀 있다.

    ⚠️ CSS 로 숨기면 안 된다. 런타임 토글은 `panel.style.display === 'none'` 로 상태를
       판정하므로(wireNavGroups) 인라인 style 이 없으면 **첫 클릭이 헛돈다.**
       그래서 인라인 `display:none` 을 직접 박고, 화살표의 rotate-90 도 같이 뗀다.

    깊이는 태그를 훑어 센다 — `ml-[13px]` 패널이 다른 패널 안에 들어 있으면 2단째다.
    """
    out, i, stack, n = [], 0, [], 0     # stack 원소는 (태그명, 패널 여부)
    for m in _TAG.finditer(aside):
        out.append(aside[i:m.start()])
        closing, tag, attrs = m.group(1), m.group(2).lower(), m.group(3)
        s = m.group(0)
        if closing:
            # 스택에 없는 닫는 태그는 무시한다. `<path></path>` 처럼 void 로 취급해
            # push 하지 않은 태그가 명시적으로 닫히면, 안 그럴 경우 스택을 통째로 비운다.
            if any(t == tag for t, _ in stack):
                while stack and stack.pop()[0] != tag:
                    pass
        elif tag not in _VOID and not attrs.rstrip().endswith('/'):
            panel = tag == 'div' and 'ml-[13px]' in attrs
            if panel and any(p for _, p in stack):   # 패널 안의 패널 = 채널 그룹
                s = s[:-1] + ' style="display:none">'
                n += 1
            stack.append((tag, panel))
        out.append(s)
        i = m.end()
    out.append(aside[i:])
    html = ''.join(out)
    # 접힌 그룹의 화살표는 펼침 표시(rotate-90)를 달고 있으면 안 된다.
    html = re.sub(r'(class="[^"]*transition-transform[^"]*?) ?rotate-90', r'\1', html)
    return html, n


def inject_sidebar(shell, d):
    """플랫폼 셸의 `<aside>` 에 프로필 카드와 「홈」 행을 끼우고 레일 클래스를 붙인다.

    `be-rail-nav` 는 이 레일에만 걸어야 하는 규칙(그룹 머리를 섹션 라벨로 접는 것)을
    어드민 레일과 갈라 주는 후크다. 어드민은 트리 모양이 달라 같은 규칙을 쓰면 안 된다.
    """
    m = re.search(r'(<aside\b[^>]*?)(")(>)'
                  r'(<div class="mb-\[2px\] flex items-center justify-between.*?</div>)',
                  shell, re.S)
    if not m:
        raise SystemExit('플랫폼 셸의 사이드바 머리를 찾지 못했다')

    end = shell.index('</aside>', m.end())
    body, n = collapse_channel_groups(shell[m.end():end])
    if n == 0:
        raise SystemExit('플랫폼 레일의 채널 그룹을 찾지 못했다')
    return (shell[:m.start()]
            + m.group(1) + ' be-rail-nav' + m.group(2) + m.group(3) + m.group(4)
            + profile_card(d) + HOME_ROW + body
            + shell[end:]), n


def _rail(d):
    """우측 레일 — 즐겨찾기 + 실시간 주문 현황."""
    orders = ''.join(
        '<div class="be-orow">'
        '<span class="be-avatar be-avatar--sm" style="background:linear-gradient(140deg,%s,%s)">%s</span>'
        '<div class="be-orow__main"><p class="be-orow__t"><b>%s</b> 님이 <span>%s</span></p>'
        '<p class="be-orow__s">%s</p></div>'
        '<span class="be-orow__ago">%s</span></div>'
        % (o['c1'], o['c2'], o['tile'], o['user'], o['svc'], o['qty'], o['ago'])
        for o in d['order'])
    return (
        '<aside class="be-rail">'

        '<div class="be-pcard">'
        '<p class="be-pcard__eyebrow">즐겨찾기</p>'
        '<div class="be-empty">%s</div></div>'

        '<div class="be-pcard be-pcard--list">'
        '<div class="be-pcard__row"><p class="be-pcard__eyebrow"><i class="be-live"></i>실시간 주문 현황</p>'
        '<span class="be-pcard__note">최근 %d건</span></div>%s</div>'

        '</aside>'
        % (d['fav_empty'], len(d['order']), orders))


# ── 3. 화면 조립 ────────────────────────────────────────────────────────────
def build(d):
    check(d)
    return (
        '<main class="be-home">'
        '<div class="be-home__col">'
        '<div class="be-greet"><p class="be-greet__t"><b>%s</b>%s</p></div>'
        '<section class="be-grid">%s%s</section>'
        '<section class="be-grid">%s%s</section>'
        '</div>%s</main>'
        % (d['user'], d['greet'],
           _notice_card(d), _hero(d),
           _campaign_card(d), _rank_card(d),
           _rail(d)))


# ── 4. 스타일 ───────────────────────────────────────────────────────────────
# 레퍼런스 실측 규격. 색은 리테마 토큰을 타고, 레퍼런스가 명시적으로 쓰는 값
# (히어로 그라디언트, 카드 그림자)만 리터럴로 둔다.
HOME_CSS = """
/* ── 대시보드 레이아웃 — tools/light_home.py 가 짜는 마크업의 스타일 ──────
   목업의 컴파일된 Tailwind 에 없는 유틸리티는 아무 일도 하지 않으므로
   이 화면만 be-* 클래스로 직접 정의한다. 규격은 레퍼런스 실측값이다.
   -------------------------------------------------------------------- */
.be-home{display:flex;min-width:0;flex:1;background:rgb(var(--bg-rgb))}
.be-home__col{display:flex;min-width:0;flex:1;flex-direction:column;gap:24px;padding:40px}
.be-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:stretch;min-width:0}

.be-greet__t{margin:0;font-size:22px;font-weight:700;letter-spacing:-.03em;color:rgb(var(--ink-rgb))}
.be-greet__t b{font-weight:800}

/* 카드 — 레퍼런스: 흰 표면 / 라운드 16 / 1px 헤어라인 / 아주 낮은 그림자 */
.be-card{display:flex;min-width:0;flex-direction:column;overflow:hidden;
  border:1px solid rgb(var(--line-rgb));border-radius:16px;background:rgb(var(--surface-rgb));
  box-shadow:0 1px 3px rgba(17,29,55,.05),0 1px 2px rgba(17,29,55,.03)}
.be-card--pad{padding:24px}
.be-card__head{display:flex;flex-shrink:0;align-items:center;justify-content:space-between;
  gap:12px;padding:16px 24px;border-bottom:1px solid rgb(var(--surface-2-rgb))}
.be-card__head--flat{padding:0 0 16px;border-bottom:0}
.be-card__id{display:flex;min-width:0;align-items:center;gap:12px}
.be-tile{display:inline-flex;flex-shrink:0;align-items:center;justify-content:center;
  width:44px;height:44px;margin-left:-4px}
.be-tile svg{width:44px;height:44px}
.be-card__title{margin:0;font-size:19px;font-weight:700;letter-spacing:-.03em;color:rgb(var(--ink-rgb))}
.be-card__sub{margin:2px 0 0;font-size:13px;color:rgb(var(--faint-rgb))}
.be-card__more{display:inline-flex;flex-shrink:0;align-items:center;gap:4px;
  font-size:13px;font-weight:600;color:rgb(var(--muted-rgb));text-decoration:none;
  transition:color .2s}
.be-card__more:hover{color:rgb(var(--brand-rgb))}
.be-card__more--brand{color:rgb(var(--brand-rgb))}
.be-card__more svg{width:14px;height:14px}
.be-card__body{flex:1;padding:12px 16px;display:flex;flex-direction:column;gap:8px}
.be-card__body--tight{padding:8px}

/* 공지 행 */
.be-nrow{display:flex;align-items:center;gap:10px;padding:10px 16px;border-radius:12px;
  text-decoration:none;transition:background-color .2s}
.be-nrow:hover{background:rgb(var(--surface-2-rgb))}
.be-nrow__badge{flex-shrink:0;padding:2px 8px;border-radius:8px;font-size:11px;font-weight:700;
  background:rgb(var(--brand-soft2-rgb));color:rgb(var(--brand-rgb))}
.be-nrow__title{flex:1;min-width:0;margin:0;font-size:15px;color:rgb(var(--ink-2-rgb));
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:color .2s}
.be-nrow:hover .be-nrow__title{color:rgb(var(--brand-rgb))}
.be-nrow__date{flex-shrink:0;font-size:12px;color:rgb(var(--faint-rgb));font-variant-numeric:tabular-nums}

/* 캠페인 행 */
.be-crow{display:flex;align-items:center;gap:14px;padding:12px;border-radius:12px;
  border:1px solid transparent;cursor:pointer;transition:background-color .2s,border-color .2s}
.be-crow:hover{background:rgb(var(--surface-2-rgb));border-color:rgb(var(--line-rgb))}
.be-avatar{display:flex;flex-shrink:0;align-items:center;justify-content:center;
  width:36px;height:36px;border-radius:999px;color:#fff;font-size:14px;font-weight:700}
.be-avatar--sm{width:32px;height:32px;font-size:12px}
.be-crow__main{flex:1;min-width:0}
.be-crow__tags{display:flex;align-items:center;gap:6px;margin-bottom:4px}
.be-badge{padding:2px 8px;border-radius:8px;font-size:11px;font-weight:700;white-space:nowrap}
.be-badge--good{background:rgb(var(--brand-soft2-rgb));color:rgb(var(--brand-rgb))}
.be-badge--brand{background:rgb(var(--surface-2-rgb));color:rgb(var(--muted-rgb));font-weight:600}
.be-crow__title{margin:0;font-size:15px;font-weight:600;color:rgb(var(--ink-2-rgb));
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:color .2s}
.be-crow:hover .be-crow__title{color:rgb(var(--brand-rgb))}
.be-crow__meta{margin-top:6px}
.be-crow__period{font-size:12px;color:rgb(var(--faint-rgb));font-variant-numeric:tabular-nums}
.be-crow__side{flex-shrink:0;max-width:140px;text-align:right}
.be-crow__kw{margin:0;font-size:13px;font-weight:700;color:rgb(var(--ink-2-rgb));
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* 순위 추적 */
.be-tabs{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:16px}
.be-tab{padding:6px 12px;border:0;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;
  background:rgb(var(--surface-2-rgb));color:rgb(var(--muted-rgb));transition:background-color .2s,color .2s}
.be-tab.is-on{background:rgb(var(--brand-rgb));color:#fff}
.be-rank{margin-left:auto;font-size:22px;font-weight:800;letter-spacing:-.03em;
  color:rgb(var(--ink-rgb));font-variant-numeric:tabular-nums}
.be-rank small{margin-left:2px;font-size:13px;font-weight:400;color:rgb(var(--muted-rgb))}
.be-select{width:100%;margin-bottom:12px;padding:10px 16px;border:1px solid rgb(var(--line-rgb));
  border-radius:12px;background:rgb(var(--surface-rgb));font-size:15px;color:rgb(var(--ink-2-rgb))}
.be-chart{flex:1;border:1px solid rgb(var(--surface-2-rgb));border-radius:16px;background:#fafbfc;
  padding:8px 12px}
.be-chart--empty{display:grid;place-items:center;min-height:150px;padding:24px;text-align:center;
  font-size:13px;color:rgb(var(--muted-rgb))}

/* 다크 히어로 — 레퍼런스 실측 그라디언트 */
.be-hero{position:relative;display:flex;min-width:0;flex-direction:column;justify-content:space-between;
  overflow:hidden;border-radius:16px;padding:24px;
  background:radial-gradient(135% 120% at 74% -8%,#2a4c86 0%,#17335f 42%,#0b1a38 100%);
  box-shadow:0 6px 18px rgba(13,52,115,.18),0 2px 6px rgba(17,29,55,.08)}
.be-hero__top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.be-hero__eyebrow{padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.16);
  font-size:11px;font-weight:800;letter-spacing:.1em;color:#fff}
.be-hero__more{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:700;
  color:rgba(255,255,255,.6);text-decoration:none;transition:color .2s}
.be-hero__more:hover{color:#fff}
.be-hero__more svg{width:12px;height:12px}
.be-hero__mid{margin:16px 0}
.be-hero__mid>svg{width:32px;height:32px;margin-bottom:8px;fill:rgba(255,255,255,.25)}
.be-hero__slide{display:none}
.be-hero__slide.is-on{display:block}
.be-hero__title{margin:0;min-height:76px;font-size:27px;font-weight:800;line-height:1.35;
  letter-spacing:-.02em;color:#fff;word-break:keep-all}
.be-hero__sub{margin:0;font-size:14px;color:rgba(255,255,255,.62)}
.be-hero__cta{display:inline-flex;align-items:center;gap:6px;margin-top:14px;
  font-size:13.5px;font-weight:700;color:rgba(255,255,255,.85)}
.be-hero__cta svg{width:16px;height:16px}
.be-hero__dots{display:flex;align-items:center;gap:6px;margin-top:16px}
.be-dot{height:6px;width:6px;padding:0;border:0;border-radius:999px;cursor:pointer;
  background:rgba(255,255,255,.28);transition:width .2s,background-color .2s}
.be-dot.is-on{width:16px;background:#93b4e8}
.be-hero__stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.be-stat{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;
  padding:14px 4px;border:1px solid rgba(255,255,255,.10);border-radius:16px;
  background:rgba(255,255,255,.06)}
.be-stat__v{font-size:16px;font-weight:800;color:#fff;font-variant-numeric:tabular-nums}
.be-stat__k{font-size:11px;font-weight:600;color:rgba(255,255,255,.5)}

/* 우측 레일 */
.be-rail{display:flex;flex-shrink:0;flex-direction:column;gap:16px;width:320px;padding:20px;
  border-left:1px solid rgb(var(--line-rgb));background:rgb(var(--bg-rgb));overflow-y:auto}
.be-pcard{display:flex;flex-shrink:0;flex-direction:column;border:1px solid rgb(var(--line-rgb));
  border-radius:16px;background:rgb(var(--surface-rgb));padding:24px}
.be-pcard--list{padding:20px}
.be-pcard__row{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:6px}
.be-pcard__eyebrow{display:flex;align-items:center;gap:6px;margin:0 0 6px;font-size:12px;font-weight:700;
  letter-spacing:.06em;color:rgb(var(--faint-rgb))}
.be-pcard__note{font-size:11px;font-weight:600;color:rgb(var(--faint-rgb))}
.be-empty{border:1px dashed rgb(var(--line-2-rgb));border-radius:12px;padding:18px 14px;
  text-align:center;font-size:12.5px;line-height:1.6;color:rgb(var(--muted-rgb))}
.be-live{width:7px;height:7px;border-radius:999px;background:rgb(var(--good-rgb))}
.be-orow{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid rgb(var(--line-rgb))}
.be-orow:first-of-type{border-top:0}
.be-orow__main{min-width:0;flex:1}
.be-orow__t{margin:0;font-size:13px;line-height:1.45;color:rgb(var(--ink-2-rgb))}
.be-orow__t b{font-weight:800;color:rgb(var(--ink-rgb))}
.be-orow__t span{font-weight:700;color:rgb(var(--brand-rgb))}
.be-orow__s{margin:2px 0 0;font-size:11.5px;font-weight:600;color:rgb(var(--muted-rgb))}
.be-orow__ago{flex-shrink:0;white-space:nowrap;font-size:11.5px;font-weight:700;
  color:rgb(var(--faint-rgb));font-variant-numeric:tabular-nums}

/* 사이드바 프로필 카드 — 레퍼런스 레일 최상단의 네이비 카드 */
.be-prof{flex-shrink:0;margin:2px 2px 10px;padding:18px 18px 16px;border-radius:16px;
  background:var(--gradient-brand);color:#fff}
.be-prof__top{display:flex;align-items:center;gap:12px}
.be-prof__av{display:inline-flex;flex-shrink:0;align-items:center;justify-content:center;
  width:44px;height:44px;border-radius:999px;background:#fff;
  color:rgb(var(--brand-rgb));font-size:18px;font-weight:800}
.be-prof__who{min-width:0}
.be-prof__name{margin:0;min-width:0;font-size:16px;font-weight:800;letter-spacing:-.02em;
  overflow:hidden;text-overflow:ellipsis}
.be-prof__name small{font-size:14px;font-weight:500;color:rgba(255,255,255,.72)}
.be-prof__tier{display:inline-block;margin-top:5px;padding:2px 9px;border-radius:999px;
  background:rgb(var(--warn-rgb));color:#4a2c00;font-size:11.5px;font-weight:800;letter-spacing:0}
.be-prof__row{display:flex;align-items:center;justify-content:space-between;gap:8px;
  margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,.14);
  font-size:14px;color:rgba(255,255,255,.66)}
.be-prof__row b{font-size:17px;font-weight:800;color:#fff;font-variant-numeric:tabular-nums}
.be-prof__row b small{margin-left:3px;font-size:12px;font-weight:600;color:rgba(255,255,255,.66)}
.be-prof__cta{display:block;margin-top:16px;padding:12px;border-radius:12px;background:#fff;
  color:rgb(var(--brand-rgb));font-size:15px;font-weight:800;text-align:center;text-decoration:none}
.be-prof__cta:hover{background:rgba(255,255,255,.88)}
.be-prof__links{margin-top:14px;padding-top:6px;border-top:1px solid rgba(255,255,255,.14)}
.be-prof__link{display:flex;align-items:center;justify-content:space-between;gap:8px;
  padding:9px 0;font-size:13px;font-weight:600;color:rgba(255,255,255,.78);text-decoration:none}
.be-prof__link:hover{color:#fff}
/* 리테마 §12 의 레일 행 규칙은 `aside[class*=…] a[href^="/"]` 로 특정도가 (0,2,2) 다.
   클래스만으로는 못 이겨서 `[href]` 를 붙여 (0,3,1) 로 올린다.
   안 그러면 카드 안 링크가 레일 행 패딩(12px)을 먹어 한 칸 밀려 보인다. */
.be-prof a.be-prof__cta[href]{padding:12px;min-height:0}
.be-prof a.be-prof__link[href]{padding:9px 0;min-height:0;border-radius:0}
.be-prof__link.is-off{cursor:default}        /* 대응 라우트가 없어 링크를 걸지 않았다 */
.be-prof__link.is-off:hover{color:rgba(255,255,255,.78)}
.be-prof__link svg{width:14px;height:14px;opacity:.7}

/* ── 레일 네비게이션 — 시안 규격 ─────────────────────────────────────
   원본 레일은 3단 트리였다(그룹 머리 → 채널 → 리프). 시안은 그룹 머리를
   불릿 섹션 라벨로 두고 그 아래 행들을 평평하게 늘어놓는다. 자식이 이미 DOM 에
   있으므로(셸을 펼친 상태로 수집했다) CSS 로 그 모양을 만들 수 있다.
   `be-rail-nav` 로 플랫폼 레일에만 건다 — 어드민은 트리 모양이 다르다.
   ------------------------------------------------------------------ */

/* 「홈」 행 — 원본은 라벨 없는 아이콘 버튼이었다 */
.be-navhome{display:flex;align-items:center;gap:10px;min-height:44px;padding:10px 12px;
  border-radius:10px;font-size:15px;font-weight:600;color:rgb(var(--ink-rgb));text-decoration:none}
.be-navhome>svg{width:19px;height:19px;flex-shrink:0}
.be-navhome>span{flex:1;min-width:0}
.be-navhome svg:last-child{width:15px;height:15px;opacity:.5}
.be-navhome:hover{background:rgb(var(--surface-2-rgb))}
.be-navhome[aria-current="page"]{background:rgb(var(--brand-soft2-rgb));color:rgb(var(--brand-rgb));
  font-weight:700;box-shadow:inset 3px 0 0 rgb(var(--brand-rgb))}
.be-navhome[aria-current="page"] svg:last-child{opacity:1}
/* 새 홈 행이 대신하므로 맨 윗줄의 아이콘 홈 버튼은 걷어낸다(햄버거는 남긴다) */
aside.be-rail-nav>div:first-child button[title="홈으로"]{display:none}

/* 최상위 그룹 머리 → 불릿 섹션 라벨 (누르면 접히는 동작은 그대로 둔다) */
aside.be-rail-nav>div>button[class*="w-full"]{
  min-height:0;margin:16px 0 2px;padding:16px 12px 6px;border-top:1px solid rgb(var(--line-rgb));
  border-radius:0;background:none;font-size:13px;font-weight:700;letter-spacing:0;
  color:rgb(var(--faint-rgb))}
aside.be-rail-nav>div>button[class*="w-full"]:hover{background:none;color:rgb(var(--muted-rgb))}
aside.be-rail-nav>div>button[class*="w-full"]>svg{display:none}
aside.be-rail-nav>div>button[class*="w-full"]>span:not([class*="w-["]):before{
  content:"•";margin-right:6px;color:rgb(var(--line-2-rgb))}
/* 라벨 아래 자식은 평평하게 — 들여쓰기와 트리 가이드를 걷어낸다 */
aside.be-rail-nav>div>div[class*="ml-[13px]"]{margin-left:0;border-left:0;padding-left:0}

/* ── 레일 타이포 — 시안 실측값 ─────────────────────────────────────
   시안 사이드바: 행 15 / 섹션 라벨 13 / 프로필 라벨 14 · 값 16 · 이름 16.
   목업 원본은 행 12, 라벨 11.5 로 한참 작았다. 시안 값으로 올린다.
   3단째 리프(원본에만 있는 단)는 채널 행보다 한 단 아래인 14 로 둔다.
   ------------------------------------------------------------------ */
/* 프로필 카드의 링크는 레일 행이 아니라 카드 내부 요소다 — 이 규칙에서 뺀다. */
aside.be-rail-nav a[href^="/"]:not(.be-prof__cta):not(.be-prof__link),
aside.be-rail-nav button[class*="w-full"],
aside.be-rail-nav>button{font-size:15px;font-weight:600;min-height:44px;padding:10px 12px}
aside.be-rail-nav div[class*="ml-[13px]"] div[class*="ml-[13px]"] a[href^="/"]{font-size:14px}
aside.be-rail-nav svg[class*="h-[15px]"]{height:19px;width:19px}
aside.be-rail-nav [class*="h-[13px]"]{height:15px;width:15px}   /* 셰브런 */
aside.be-rail-nav button[aria-pressed] svg{height:16px;width:16px}  /* 즐겨찾기 별 */

/* 그룹에 속하지 않고 레일 최상위에 홀로 있는 링크(통합순위관리)도 한 섹션으로 띄운다 */
aside.be-rail-nav>a[href^="/"]{margin-top:14px;padding-top:14px;
  border-top:1px solid rgb(var(--line-rgb));border-radius:0}

/* 어드민 이동 버튼 — 시안의 로그아웃 자리에 해당한다 */
aside.be-rail-nav>button{margin-top:18px;padding:12px;border-radius:10px}

/* 좁은 화면 — 레퍼런스도 xl 아래에서 레일을 접고 lg 아래에서 1열로 떨어뜨린다 */
@media(max-width:1279px){.be-rail{display:none}}
@media(max-width:1023px){.be-grid{grid-template-columns:1fr}.be-home__col{padding:24px}}
@media(max-width:700px){.be-home__col{padding:16px;gap:16px}.be-hero__title{font-size:22px;min-height:0}}
"""

# 배너 도트 — 목업 원본 캐러셀은 정지 스냅샷이라 3장 중 1장만 보였다.
HOME_JS = """
<script id="light-home-hero">
/* 다크 히어로의 배너 전환. 원본 목업의 캐러셀은 정지 스냅샷(translateX(0%))이라
   배너 2·3장은 볼 수 없었다. #root 는 해시가 바뀔 때마다 다시 그려지므로
   document 위임으로 건다. */
(function () {
  document.addEventListener('click', function (e) {
    var dot = e.target.closest && e.target.closest('.be-dot')
    if (!dot) return
    var hero = dot.closest('[data-be-hero]')
    if (!hero) return
    var i = dot.getAttribute('data-i')
    ;[].slice.call(hero.querySelectorAll('.be-dot')).forEach(function (d) {
      d.classList.toggle('is-on', d.getAttribute('data-i') === i)
    })
    ;[].slice.call(hero.querySelectorAll('.be-hero__slide')).forEach(function (s) {
      s.classList.toggle('is-on', s.getAttribute('data-i') === i)
    })
  })
})()
</script>
"""
