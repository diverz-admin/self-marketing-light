"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useState } from "react";

// ── User summary card ─────────────────────────────────────────
const USER = { name: "사용자", grade: "Bronze", point: 0, activeAdCount: 0 };

function UserCard() {
  return (
    <div className="mx-1 my-1.5 rounded-2xl bg-white border border-[#E5E8EB] p-4"
      style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
      {/* 상단: 아바타 + 이름 + 등급 */}
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full flex items-center justify-center text-white font-bold text-[16px] shrink-0"
          style={{ background: "linear-gradient(135deg,#0341C7,#6366F1)" }}>
          {USER.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-[#191F28] leading-tight truncate">{USER.name} 님</p>
          <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
            {USER.grade}
          </span>
        </div>
      </div>

      <div className="h-px bg-[#F2F4F6] my-3" />

      {/* 사용 가능 포인트 */}
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] text-[#8B95A1]">사용 가능 포인트</span>
        <span className="text-[14px] font-extrabold text-[#191F28]">
          {USER.point.toLocaleString()} <span className="text-[11px] font-bold text-[#8B95A1]">P</span>
        </span>
      </div>

      <div className="h-px bg-[#F2F4F6] my-3" />

      {/* 진행 중인 광고 */}
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] text-[#8B95A1]">진행 중인 광고</span>
        <span className="text-[14px] font-extrabold text-[#0341C7]">
          {USER.activeAdCount} <span className="text-[11px] font-bold text-[#8B95A1]">개</span>
        </span>
      </div>

      {/* 충전 버튼 */}
      <Link href="/marketing/my/charge"
        className="mt-4 flex items-center justify-center w-full py-2.5 rounded-xl bg-[#0341C7] text-white text-[13px] font-bold hover:bg-[#0235A8] transition-colors">
        포인트 충전하기
      </Link>
    </div>
  );
}

// ── Icon system ──────────────────────────────────────────────
type NavIcon =
  | { kind: "svg"; d: string }
  | { kind: "letter"; ch: string; bg: string }
  | { kind: "sqsvg"; d: string; bg: string }
  | { kind: "meta" };

function NavIconEl({ icon, active }: { icon: NavIcon; active?: boolean }) {
  if (icon.kind === "svg") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        style={{ color: active ? "white" : "#6B7684", flexShrink: 0 }}
        stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
        <path d={icon.d} />
      </svg>
    );
  }
  if (icon.kind === "letter") {
    return (
      <span className="h-[30px] w-[30px] rounded-[9px] flex items-center justify-center shrink-0 text-white font-black select-none"
        style={{ background: icon.bg, fontSize: 15, lineHeight: 1, boxShadow: `0 2px 6px ${icon.bg}55` }}>
        {icon.ch}
      </span>
    );
  }
  if (icon.kind === "sqsvg") {
    return (
      <span className="h-[30px] w-[30px] rounded-[9px] flex items-center justify-center shrink-0"
        style={{ background: icon.bg, boxShadow: `0 2px 6px ${icon.bg}55` }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d={icon.d} />
        </svg>
      </span>
    );
  }
  // META infinity
  return (
    <span className="h-[30px] w-[30px] flex items-center justify-center shrink-0">
      <svg width="24" height="14" viewBox="0 0 24 14" fill="none">
        <path
          d="M1.5 7C1.5 4.2 3.2 2 5.5 2C7.8 2 9.2 3.7 10.5 6.2C11.8 8.7 13.2 10.5 15.5 10.5C17.8 10.5 19.5 8.3 19.5 5.5M19.5 5.5C19.5 2.7 17.8 0.5 15.5 0.5C13.2 0.5 11.8 2.3 10.5 4.8M22.5 5.5C22.5 8.3 20.8 10.5 18.5 10.5"
          stroke="#1877F2" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

// ── Nav data ─────────────────────────────────────────────────
const BAG = "M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z";
const STAR = "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z";

type SubItem = { label: string; href: string };
interface NavItem {
  label: string;
  href: string;
  icon: NavIcon;
  free?: boolean;
  children?: SubItem[];
}
interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "",
    items: [
      {
        label: "마이 캠페인 현황",
        href: "/marketing/my/campaigns",
        icon: { kind: "svg", d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
      },
      {
        label: "홈",
        href: "/marketing",
        icon: { kind: "svg", d: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
      },
      {
        label: "공지사항",
        href: "/marketing/notices",
        icon: { kind: "svg", d: "M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" },
      },
      {
        label: "커뮤니티",
        href: "/marketing/community",
        icon: { kind: "svg", d: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" },
        children: [
          { label: "게시판", href: "/marketing/community/board" },
          { label: "오픈채팅", href: "/marketing/community/chatroom" },
        ],
      },
    ],
  },
  {
    title: "통합순위관리",
    items: [
      {
        label: "통합순위관리",
        href: "/marketing/rank",
        icon: { kind: "svg", d: "M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" },
        free: true,
        children: [
          { label: "네이버 플레이스", href: "/marketing/rank/place" },
          { label: "네이버 쇼핑", href: "/marketing/rank/shopping" },
        ],
      },
    ],
  },
  {
    title: "리워드 마케팅",
    items: [
      {
        label: "네이버 플레이스 리워드",
        href: "/marketing/reward/place",
        icon: { kind: "letter", ch: "N", bg: "#03C75A" },
        children: [
          { label: "[상위노출] 캠페인 신청", href: "/marketing/reward/place" },
          { label: "[상위노출] 캠페인 관리", href: "/marketing/reward/place/manage" },
          { label: "[보장형] 캠페인 신청", href: "/marketing/reward/place/guaranteed" },
          { label: "[보장형] 캠페인 관리", href: "/marketing/reward/place/guaranteed/manage" },
        ],
      },
      {
        label: "네이버 쇼핑 리워드",
        href: "/marketing/reward/shopping",
        icon: { kind: "sqsvg", d: BAG, bg: "#8B5CF6" },
        children: [
          { label: "[상위노출] 캠페인 신청", href: "/marketing/reward/shopping" },
          { label: "[상위노출] 캠페인 관리", href: "/marketing/reward/shopping/manage" },
        ],
      },
    ],
  },
  {
    title: "리뷰·체험단",
    items: [
      {
        label: "네이버 플레이스 리뷰",
        href: "/marketing/review/place",
        icon: { kind: "sqsvg", d: STAR, bg: "#F59E0B" },
        children: [
          { label: "캠페인 신청", href: "/marketing/review/place" },
          { label: "캠페인 관리", href: "/marketing/review/place/manage" },
        ],
      },
      {
        label: "쇼핑 리뷰",
        href: "/marketing/review/shopping",
        icon: { kind: "sqsvg", d: BAG, bg: "#8B5CF6" },
        children: [
          { label: "캠페인 신청", href: "/marketing/review/shopping" },
          { label: "캠페인 관리", href: "/marketing/review/shopping/manage" },
        ],
      },
    ],
  },
  {
    title: "퍼포먼스 마케팅",
    items: [
      {
        label: "네이버",
        href: "/marketing/ads/naver-cpc",
        icon: { kind: "letter", ch: "N", bg: "#03C75A" },
        children: [
          { label: "네이버 SA광고 최적화", href: "/marketing/ads/naver-cpc" },
          { label: "네이버 광고비 환급받기", href: "/marketing/ads/naver-cpc-refund" },
        ],
      },
    ],
  },
  {
    title: "바이럴·커뮤니티",
    items: [
      {
        label: "네이버 카페 침투",
        href: "/marketing/community/cafe",
        icon: { kind: "letter", ch: "N", bg: "#03C75A" },
      },
    ],
  },
  {
    title: "콘텐츠",
    items: [
      {
        label: "고퀄리티 이미지 제작",
        href: "/marketing/content/image",
        icon: { kind: "sqsvg", d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", bg: "#DB2777" },
      },
      {
        label: "Total 브랜딩",
        href: "/marketing/content/branding",
        icon: { kind: "letter", ch: "T", bg: "#7C3AED" },
      },
      {
        label: "홈페이지",
        href: "/marketing/content/homepage",
        icon: { kind: "sqsvg", d: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", bg: "#1E40AF" },
      },
      {
        label: "상세페이지",
        href: "/marketing/content/detail",
        icon: { kind: "sqsvg", d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", bg: "#0D9488" },
      },
      {
        label: "영상 제작",
        href: "/marketing/content/video",
        icon: { kind: "sqsvg", d: "M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", bg: "#DC2626" },
      },
    ],
  },
];

// ── Chevron ───────────────────────────────────────────────────
function ChevronRight({ active }: { active: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      style={{ color: active ? "rgba(255,255,255,0.7)" : "#C4C9D4", flexShrink: 0 }}
      stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}
function ChevronDown({ open, anyActive }: { open: boolean; anyActive: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      style={{ color: anyActive ? "#0341C7" : "#C4C9D4", flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
      stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ── Accordion item ────────────────────────────────────────────
function AccordionItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const children = item.children!;
  const anyActive = children.some(c => pathname === c.href || pathname.startsWith(c.href + "/"));
  const [open, setOpen] = useState(anyActive);

  return (
    <div>
      <button onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center gap-2.5 px-3 py-[10px] rounded-xl transition-all text-left ${
          anyActive ? "bg-[#EEF2FF] text-[#0341C7]" : "text-[#333D4B] hover:bg-[#F5F6F8]"
        }`}>
        <NavIconEl icon={item.icon} />
        <span className="flex-1 text-[13.5px] font-semibold truncate">{item.label}</span>
        <ChevronDown open={open} anyActive={anyActive} />
      </button>

      {open && (
        <div className="mt-0.5 ml-[50px] mr-2 mb-1 space-y-0.5 border-l-2 border-[#E5E8EB] pl-3">
          {children.map(sub => {
            const active = pathname === sub.href;
            return (
              <Link key={sub.href} href={sub.href}
                className={`flex items-center gap-2 px-2.5 py-[7px] rounded-lg text-[12px] font-medium transition-all ${
                  active ? "bg-[#0341C7] text-white font-semibold" : "text-[#6B7684] hover:bg-[#F2F4F6] hover:text-[#333D4B]"
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? "bg-white" : "bg-[#D1D6DB]"}`} />
                {sub.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Leaf item ─────────────────────────────────────────────────
function LeafItem({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link href={item.href}
      className={`flex items-center gap-2.5 px-3 py-[10px] rounded-xl transition-all ${
        active ? "bg-[#0341C7] text-white" : "text-[#333D4B] hover:bg-[#F5F6F8]"
      }`}>
      <NavIconEl icon={item.icon} active={active} />
      <span className="flex-1 text-[13.5px] font-semibold truncate">{item.label}</span>
      {item.free && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
          active ? "bg-white/20 text-white" : "bg-[#EEF2FF] text-[#0341C7]"
        }`}>무료</span>
      )}
      <ChevronRight active={active} />
    </Link>
  );
}

// ── Group title ───────────────────────────────────────────────
function GroupTitle({ title }: { title: string }) {
  if (!title) return null;
  return (
    <div className="flex items-center gap-2 px-3 pt-4 pb-1.5">
      <span className="h-[3px] w-[3px] rounded-full bg-[#0341C7] shrink-0 opacity-70" />
      <p className="text-[11.5px] font-bold text-[#4E5968] tracking-tight">{title}</p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 scrollbar-none">
      {NAV_GROUPS.map((group, gi) => (
        <div key={gi}>
          {gi > 0 && <div className="h-px bg-[#EBEEF2] mx-1 my-2" />}
          <GroupTitle title={group.title} />
          {group.items.map(item => (
            <Fragment key={item.href}>
              {item.children ? (
                <AccordionItem item={item} pathname={pathname} />
              ) : (
                <LeafItem item={item}
                  active={item.href === "/marketing" ? pathname === "/marketing" : pathname === item.href || pathname.startsWith(item.href + "/")} />
              )}
              {item.href === "/marketing/my/campaigns" && <UserCard />}
            </Fragment>
          ))}
        </div>
      ))}
    </nav>
  );
}
