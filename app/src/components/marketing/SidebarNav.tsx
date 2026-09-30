"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useState } from "react";
import { FAVORITE_LIMIT, isFavorite, toggleFavorite, useFavorites, type Favorite } from "@/lib/favorites";
import { toast } from "@/components/ui/toast";
import { NaverPlacePin, NaverShoppingTile, CoupangBurst, NaverCafeCup } from "@/components/ui/channel-logos";
import { BRAND_LOGOS, NAV_GROUPS, type NavIcon, type NavItem } from "@/lib/nav-menu";

/* 현재 페이지 표시 — 딥네이비 그라디언트.
   연한 파랑(#E7ECFF) 한 겹은 흰 레일 위에서 "눌린 티"가 거의 나지 않았다.
   ⚠️ 네이비를 쓰는 건 "지금 보고 있는 페이지" 하나뿐이다. 아코디언 헤더까지
      칠하면 열린 그룹 전체가 네이비 덩어리로 뭉쳐 선택 위치를 잃는다. */
const ACTIVE_BG = "linear-gradient(135deg,#2452EB 0%,#152C9E 55%,#111D37 100%)";
const ACTIVE_SHADOW = "0 4px 12px rgba(17,29,55,0.26)";

/*
 * 채널 색을 그대로 쓰는 네비 아이콘.
 *
 * 한동안 꺼 두었다(시안이 텍스트 전용 레일이었다). 메뉴가 20개를 넘기면서
 * 글자만으로는 훑기 어려워져 다시 켠다 — 네이버 초록·쿠팡 빨강처럼 채널 색이
 * 그대로 들어가면 "어느 채널 메뉴인지"가 읽기 전에 잡힌다.
 */
export function NavIconEl({ icon, active, onDark }: { icon: NavIcon; active?: boolean; onDark?: boolean }) {
  if (icon.kind === "svg") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        style={{ color: onDark ? "#FFFFFF" : active ? "#2452EB" : "#5B6472", flexShrink: 0 }}
        stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
        <path d={icon.d} />
      </svg>
    );
  }
  if (icon.kind === "letter") {
    return (
      <span className="h-[22px] w-[22px] flex items-center justify-center shrink-0 font-black select-none"
        style={{ color: onDark ? "#FFFFFF" : icon.bg, fontSize: 16, lineHeight: 1 }}>
        {icon.ch}
      </span>
    );
  }
  if (icon.kind === "sqsvg") {
    return (
      <span className="h-[22px] w-[22px] flex items-center justify-center shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke={onDark ? "#FFFFFF" : icon.bg} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
          <path d={icon.d} />
        </svg>
      </span>
    );
  }
  // 네이버 플레이스는 단색 아웃라인 대신 실제 핀 심볼을 쓴다.
  // 그라디언트가 필요해 generic brand 렌더러(단색 path)로는 표현되지 않는다.
  if (icon.kind === "brand" && icon.brand === "naver-place") {
    return <NaverPlacePin />;
  }
  if (icon.kind === "brand" && icon.brand === "naver-shopping") {
    return <NaverShoppingTile />;
  }
  if (icon.kind === "brand" && icon.brand === "coupang") {
    return <CoupangBurst />;
  }
  if (icon.kind === "brand" && icon.brand === "naver-cafe") {
    return <NaverCafeCup />;
  }

  if (icon.kind === "brand") {
    const b = BRAND_LOGOS[icon.brand];
    const isStroke = b.mode === "stroke";
    const glyphColor = icon.brand === "google" ? "#4285F4" : b.bg;
    return (
      <span className="h-[22px] w-[22px] flex items-center justify-center shrink-0">
        <svg width={b.size + 2} height={b.size + 2} viewBox={b.viewBox} aria-hidden
          fill={isStroke ? "none" : glyphColor}
          stroke={isStroke ? glyphColor : "none"} strokeWidth={isStroke ? 2 : undefined}
          strokeLinecap="round" strokeLinejoin="round">
          <path d={b.path} />
        </svg>
      </span>
    );
  }
  // META infinity
  return (
    <span className="h-[22px] w-[22px] flex items-center justify-center shrink-0">
      <svg width="22" height="13" viewBox="0 0 24 14" fill="none">
        <path
          d="M1.5 7C1.5 4.2 3.2 2 5.5 2C7.8 2 9.2 3.7 10.5 6.2C11.8 8.7 13.2 10.5 15.5 10.5C17.8 10.5 19.5 8.3 19.5 5.5M19.5 5.5C19.5 2.7 17.8 0.5 15.5 0.5C13.2 0.5 11.8 2.3 10.5 4.8M22.5 5.5C22.5 8.3 20.8 10.5 18.5 10.5"
          stroke="#1877F2" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

// ── Chevron ───────────────────────────────────────────────────
function ChevronRight({ active }: { active: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      style={{ color: active ? "rgba(255,255,255,0.75)" : "#C4C9D4", flexShrink: 0 }}
      stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}
function ChevronDown({ open, anyActive }: { open: boolean; anyActive: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      style={{ color: anyActive ? "#152C9E" : "#C4C9D4", flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
      stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ── Accordion item ────────────────────────────────────────────
function AccordionItem({ item, pathname, open, onToggle, favorites }: { item: NavItem; pathname: string; open: boolean; onToggle: () => void; favorites: Favorite[] }) {
  const children = item.children!;
  const anyActive = children.some(c => pathname === c.href || pathname.startsWith(c.href + "/"));

  return (
    <div>
      <button onClick={onToggle} aria-expanded={open}
        className={`w-full flex items-center gap-2.5 px-3 py-[9px] rounded-lg transition-colors text-left ${
          anyActive ? "bg-[#E7ECFF] text-[#152C9E]" : "text-[#4E5560] hover:bg-[#E2E6EC]"
        }`}>
        <NavIconEl icon={item.icon} active={anyActive} />
        <span className="flex-1 text-[14px] font-medium truncate">{item.label}</span>
        {open ? <ChevronDown open anyActive={anyActive} /> : <ChevronRight active={false} />}
      </button>

      {open && (
        <div className="mt-0.5 ml-3 mr-2 mb-1 space-y-0.5 border-l border-[#E0E4EA] pl-3">
          {children.map(sub => {
            const active = pathname === sub.href;
            return (
              <Link key={sub.href} href={sub.href}
                className={`flex items-center gap-2 px-2.5 py-[7px] rounded-lg text-[13.5px] transition-colors ${
                  active ? "text-white font-semibold" : "text-[#6B7280] hover:bg-[#E2E6EC] hover:text-[#2D3137]"
                }`}
                style={active ? { background: ACTIVE_BG, boxShadow: ACTIVE_SHADOW } : undefined}>
                {/* 하위 항목엔 아이콘 자산이 없다 — 부모 계열 색 점으로 소속을 잇는다 */}
                <span className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: active ? "#FFFFFF" : "#D5D8DE" }} />
                <span className="flex-1 truncate">{sub.label}</span>
                <StarToggle label={sub.label} href={sub.href} on={isFavorite(favorites, sub.href)} onDark={active} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── 즐겨찾기 ★ 토글 ───────────────────────────────────────────
function StarToggle({ label, href, on, onDark }: { label: string; href: string; on: boolean; onDark?: boolean }) {
  return (
    <button
      type="button"
      title={on ? "즐겨찾기 해제" : "즐겨찾기 추가"}
      aria-label={on ? `${label} 즐겨찾기 해제` : `${label} 즐겨찾기 추가`}
      aria-pressed={on}
      onClick={(e) => {
        // 링크 위에 얹힌 버튼이라 행 이동을 막는다
        e.preventDefault();
        e.stopPropagation();
        if (toggleFavorite({ label, href }) === "full") {
          toast.info(`즐겨찾기는 최대 ${FAVORITE_LIMIT}개까지 추가할 수 있어요`);
        }
      }}
      className={`shrink-0 p-0.5 rounded transition-colors ${
        onDark
          ? (on ? "text-[#FFCF5C]" : "text-white/40 hover:text-white/80")
          : (on ? "text-[#F5B72A]" : "text-[#D5D8DE] hover:text-[#9AA1AC]")
      }`}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill={on ? "currentColor" : "none"}
        stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round">
        <path d="M11.48 3.5a.56.56 0 011.04 0l2.13 4.31 4.76.69c.46.07.64.63.31.95l-3.44 3.36.81 4.74c.08.46-.4.81-.81.59L12 15.9l-4.26 2.24c-.41.22-.89-.13-.81-.59l.81-4.74-3.44-3.36a.56.56 0 01.31-.95l4.76-.69 2.11-4.31z" />
      </svg>
    </button>
  );
}

// ── Leaf item ─────────────────────────────────────────────────
function LeafItem({ item, active, faved }: { item: NavItem; active: boolean; faved: boolean }) {
  return (
    <Link href={item.href}
      className={`flex items-center gap-2.5 px-3 py-[9px] rounded-lg transition-colors ${
        active ? "text-white font-semibold" : "text-[#4E5560] hover:bg-[#E2E6EC]"
      }`}
      style={active ? { background: ACTIVE_BG, boxShadow: ACTIVE_SHADOW } : undefined}>
      <NavIconEl icon={item.icon} active={active} onDark={active} />
      <span className="flex-1 text-[14px] font-medium truncate">{item.label}</span>
      <StarToggle label={item.label} href={item.href} on={faved} onDark={active} />
    </Link>
  );
}

// ── 접힌 레일 — 아이콘만 두고, 올리면 옆으로 메뉴가 뜬다 ─────────
function RailItem({ item, pathname }: { item: NavItem; pathname: string }) {
  // 레일은 세로 스크롤 영역 안이라 absolute 로 띄우면 잘린다 — 화면 좌표(fixed)로 띄운다
  const [hover, setHover] = useState<{ top: number; left: number } | null>(null);
  const active = item.children
    ? item.children.some(c => pathname === c.href || pathname.startsWith(c.href + "/"))
    : pathname === item.href || pathname.startsWith(item.href + "/");
  const cls = `h-10 w-10 mx-auto flex items-center justify-center rounded-lg transition-colors ${
    active ? "" : "hover:bg-[#E2E6EC]"
  }`;
  const style = active ? { background: ACTIVE_BG, boxShadow: ACTIVE_SHADOW } : undefined;
  return (
    <div
      className="relative"
      onMouseEnter={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setHover({ top: r.top, left: r.right });
      }}
      onMouseLeave={() => setHover(null)}
    >
      {item.children ? (
        <button type="button" aria-label={item.label} className={cls} style={style}>
          <NavIconEl icon={item.icon} active={active} onDark={active} />
        </button>
      ) : (
        <Link href={item.href} aria-label={item.label} className={cls} style={style}>
          <NavIconEl icon={item.icon} active={active} onDark={active} />
        </Link>
      )}
      {hover && (
        <div className="fixed z-[60] pl-2" style={{ top: hover.top, left: hover.left }}>
          <div className="animate-be-fade min-w-[200px] rounded-xl border border-brand-border bg-white p-1.5 shadow-[0_16px_40px_-12px_rgba(17,29,55,.24)]">
            <p className="px-2.5 pt-1.5 pb-1 text-[12.5px] font-bold text-brand-dark">{item.label}</p>
            {item.children ? (
              item.children.map(c => (
                <Link key={c.href} href={c.href}
                  className={`block px-2.5 py-2 rounded-lg text-[13.5px] ${pathname === c.href ? "bg-[#E7ECFF] text-[#152C9E] font-semibold" : "text-brand-text hover:bg-brand-lighter"}`}>
                  {c.label}
                </Link>
              ))
            ) : (
              <Link href={item.href} className="block px-2.5 py-2 rounded-lg text-[13.5px] text-brand-text hover:bg-brand-lighter">바로가기</Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Group title ───────────────────────────────────────────────
/** 그룹별 계열 색 — 레일을 위에서 아래로 훑을 때 구획이 잡힌다 */
const GROUP_ACCENT: Record<string, string> = {
  "편의 기능": "#2452EB",
  "리워드 마케팅": "#03C75A",
  "리뷰·체험단": "#F5B72A",
  "추가 서비스": "#7C5CE0",
};

function GroupTitle({ title }: { title: string }) {
  const accent = GROUP_ACCENT[title] ?? "#D5D8DE";
  if (!title) return null;
  return (
    <div className="px-3 pt-5 pb-1.5 flex items-center gap-2">
      <span className="w-[3px] h-[11px] rounded-full shrink-0" style={{ background: accent }} />
      <p className="text-[12px] font-semibold text-[#8A90A0] tracking-tight">{title}</p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
function activeAccordionKey(pathname: string): string | null {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (item.children?.some(c => pathname === c.href || pathname.startsWith(c.href + "/"))) {
        return item.href;
      }
    }
  }
  return null;
}

export default function SidebarNav({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  // 한 번에 하나의 아코디언만 열림 (다른 메뉴는 자동으로 닫힘)
  const [openKey, setOpenKey] = useState<string | null>(() => activeAccordionKey(pathname));
  // 다른 화면으로 옮기면 그 화면이 든 묶음을 자동으로 편다
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    const k = activeAccordionKey(pathname);
    if (k) setOpenKey(k);
  }
  const favorites = useFavorites();

  if (collapsed) {
    return (
      <nav className="flex-1 overflow-y-auto overflow-x-visible py-2 px-2 space-y-1 scrollbar-none">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className="space-y-1">
            {gi > 0 && <div className="h-px bg-[#E0E4EA] mx-1 my-2" />}
            {group.items.map(item => <RailItem key={item.href} item={item} pathname={pathname} />)}
          </div>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 scrollbar-none">
      {NAV_GROUPS.map((group, gi) => (
        <div key={gi}>
          {gi > 0 && <div className="h-px bg-[#E0E4EA] mx-1 my-2" />}
          <GroupTitle title={group.title} />
          {group.items.map(item => {
            return (
              <Fragment key={item.href}>
                {item.children ? (
                  <AccordionItem
                    item={item}
                    pathname={pathname}
                    open={openKey === item.href}
                    favorites={favorites}
                    onToggle={() => setOpenKey(prev => (prev === item.href ? null : item.href))}
                  />
                ) : (
                  <LeafItem item={item}
                    faved={isFavorite(favorites, item.href)}
                    active={pathname === item.href || pathname.startsWith(item.href + "/")} />
                )}
              </Fragment>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
