"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

function IconBadge({ d, grad }: { d: string; grad: string }) {
  return (
    <span
      className="h-[26px] w-[26px] rounded-[8px] flex items-center justify-center shrink-0"
      style={{ background: grad }}
    >
      <svg className="w-[13px] h-[13px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.1}>
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
      </svg>
    </span>
  );
}

type SubItem = { label: string; href: string };

interface NavItem {
  label: string;
  href: string;
  grad: string;
  icon: string;
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
        label: "공지사항",
        href: "/marketing/notices",
        grad: "linear-gradient(135deg,#3182F6,#1B64DA)",
        icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
      },
      {
        label: "커뮤니티",
        href: "/marketing/community",
        grad: "linear-gradient(135deg,#1B1F3B,#3B2094)",
        icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
        children: [
          { label: "게시판", href: "/marketing/community/board" },
          { label: "오픈채팅", href: "/marketing/community/openchat" },
          { label: "채팅방 관리", href: "/marketing/community/chatroom" },
        ],
      },
      {
        label: "마이 캠페인 현황",
        href: "/marketing/my/campaigns",
        grad: "linear-gradient(135deg,#8B5CF6,#6D28D9)",
        icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
      },
    ],
  },
  {
    title: "통합순위관리",
    items: [
      {
        label: "통합순위관리",
        href: "/marketing/rank",
        grad: "linear-gradient(135deg,#00B493,#0096A0)",
        icon: "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941",
        free: true,
      },
    ],
  },
  {
    title: "A. 리워드 마케팅",
    items: [
      {
        label: "네이버 플레이스 리워드",
        href: "/marketing/reward/place",
        grad: "linear-gradient(135deg,#10B981,#059669)",
        icon: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
        children: [
          { label: "[상위노출] 캠페인 생성", href: "/marketing/reward/place" },
          { label: "[상위노출 보장형] 캠페인 생성", href: "/marketing/reward/place/guaranteed" },
          { label: "[상위노출] 캠페인 관리", href: "/marketing/reward/place/manage" },
        ],
      },
      {
        label: "네이버 쇼핑 리워드",
        href: "/marketing/reward/shopping",
        grad: "linear-gradient(135deg,#3B82F6,#6366F1)",
        icon: "M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z",
        children: [
          { label: "[상위노출] 캠페인 생성", href: "/marketing/reward/shopping" },
          { label: "[상위노출] 캠페인 관리", href: "/marketing/reward/shopping/manage" },
        ],
      },
      {
        label: "쿠팡 리워드",
        href: "/marketing/reward/coupang",
        grad: "linear-gradient(135deg,#F97316,#EA580C)",
        icon: "M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9",
        children: [
          { label: "[상위노출] 캠페인 생성", href: "/marketing/reward/coupang" },
          { label: "[상위노출] 캠페인 관리", href: "/marketing/reward/coupang/manage" },
        ],
      },
    ],
  },
  {
    title: "B. 리뷰·체험단",
    items: [
      {
        label: "네이버 플레이스 리뷰",
        href: "/marketing/review/place",
        grad: "linear-gradient(135deg,#F59E0B,#D97706)",
        icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
        children: [
          { label: "캠페인 생성", href: "/marketing/review/place" },
          { label: "캠페인 관리", href: "/marketing/review/place/manage" },
        ],
      },
      {
        label: "네이버 쇼핑 체험단",
        href: "/marketing/review/shopping",
        grad: "linear-gradient(135deg,#EC4899,#BE185D)",
        icon: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z",
        children: [
          { label: "캠페인 생성", href: "/marketing/review/shopping" },
          { label: "캠페인 관리", href: "/marketing/review/shopping/manage" },
        ],
      },
      {
        label: "쿠팡 체험단",
        href: "/marketing/review/coupang",
        grad: "linear-gradient(135deg,#F97316,#EA580C)",
        icon: "M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9",
        children: [
          { label: "캠페인 생성", href: "/marketing/review/coupang" },
          { label: "캠페인 관리", href: "/marketing/review/coupang/manage" },
        ],
      },
    ],
  },
  {
    title: "C. 퍼포먼스 마케팅",
    items: [
      {
        label: "네이버",
        href: "/marketing/ads/naver-cpc",
        grad: "linear-gradient(135deg,#03C75A,#02A64E)",
        icon: "M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5",
        children: [
          { label: "네이버 SA광고",      href: "/marketing/ads/naver-cpc" },
          { label: "네이버 SA 최적화/환급", href: "/marketing/ads/naver-cpc-refund" },
        ],
      },
      {
        label: "META",
        href: "/marketing/ads/meta",
        grad: "linear-gradient(135deg,#1877F2,#0C5FD4)",
        icon: "M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z",
        children: [
          { label: "META 퍼포먼스 대행", href: "/marketing/ads/meta" },
        ],
      },
    ],
  },
  {
    title: "D. 바이럴·커뮤니티",
    items: [
      {
        label: "네이버 카페 침투",
        href: "/marketing/community/cafe",
        grad: "linear-gradient(135deg,#03C75A,#028A3F)",
        icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
      },
    ],
  },
  {
    title: "E. 콘텐츠",
    items: [
      {
        label: "Total 브랜딩",
        href: "/marketing/content/branding",
        grad: "linear-gradient(135deg,#6366F1,#4F46E5)",
        icon: "M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42",
      },
      {
        label: "홈페이지",
        href: "/marketing/content/homepage",
        grad: "linear-gradient(135deg,#0EA5E9,#0284C7)",
        icon: "M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z",
      },
      {
        label: "상세페이지",
        href: "/marketing/content/detail",
        grad: "linear-gradient(135deg,#14B8A6,#0F9488)",
        icon: "M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5",
      },
      {
        label: "10초 이미지 제작",
        href: "/marketing/content/image",
        grad: "linear-gradient(135deg,#EC4899,#BE185D)",
        icon: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z",
      },
      {
        label: "영상 제작",
        href: "/marketing/content/video",
        grad: "linear-gradient(135deg,#F97316,#DC2626)",
        icon: "M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z",
      },
    ],
  },
];

function AccordionItem({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const children = item.children!;
  const anyChildActive = children.some((c) => pathname === c.href);
  const [open, setOpen] = useState(anyChildActive);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-[calc(100%-16px)] mx-2 flex items-center gap-2.5 px-2.5 py-[8px] rounded-xl text-white font-semibold hover:bg-white/10 transition-all ${
          anyChildActive ? "bg-white/10" : ""
        }`}
      >
        <span style={{ opacity: anyChildActive ? 1 : 0.75 }}>
          <IconBadge d={item.icon} grad={item.grad} />
        </span>
        <span className="flex-1 truncate text-[13px] text-left">{item.label}</span>
        <svg
          className={`w-3 h-3 text-white/50 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="mt-0.5 mb-1 ml-[42px] mr-2 space-y-0.5">
          {children.map((sub) => {
            const active = pathname === sub.href;
            return active ? (
              <Link
                key={sub.href}
                href={sub.href}
                className="flex items-center gap-2 pl-3 pr-2 py-[7px] -mr-2 rounded-l-xl bg-white font-bold text-[#191F28] text-[12px]"
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.grad.includes("#") ? item.grad.split(",")[1]?.trim().replace(")", "") ?? "#3182F6" : "#3182F6" }} />
                {sub.label}
              </Link>
            ) : (
              <Link
                key={sub.href}
                href={sub.href}
                className="flex items-center gap-2 pl-3 pr-2 py-[7px] rounded-xl text-white/65 hover:text-white hover:bg-white/10 text-[12px] font-medium transition-all"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 shrink-0" />
                {sub.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LeafItem({ item, active }: { item: NavItem; active: boolean }) {
  if (active) {
    return (
      <Link
        href={item.href}
        className="flex items-center gap-2.5 ml-2 mr-0 pl-2.5 pr-3 py-[9px] rounded-l-2xl bg-white font-bold text-[#191F28] transition-all"
      >
        <IconBadge d={item.icon} grad={item.grad} />
        <span className="flex-1 truncate text-[13px]">{item.label}</span>
        {item.free && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#00B493]/20 text-[#00B493] shrink-0">무료</span>
        )}
      </Link>
    );
  }
  return (
    <Link
      href={item.href}
      className="flex items-center gap-2.5 mx-2 px-2.5 py-[8px] rounded-xl text-white font-semibold hover:bg-white/10 transition-all"
    >
      <span style={{ opacity: 0.75 }}>
        <IconBadge d={item.icon} grad={item.grad} />
      </span>
      <span className="flex-1 truncate text-[13px]">{item.label}</span>
      {item.free && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#00B493]/25 text-[#00B493] shrink-0">무료</span>
      )}
    </Link>
  );
}

const SECTION_ACCENT: Record<string, string> = {
  A: "#10B981",
  B: "#F59E0B",
  C: "#60A5FA",
  D: "#84CC16",
  E: "#A855F7",
};

function GroupTitle({ title }: { title: string }) {
  const match = title.match(/^([A-E])\.\s+(.+)$/);
  if (match) {
    const [, letter, rest] = match;
    return (
      <div
        className="mx-2 mt-4 mb-1.5 rounded-[13px] overflow-hidden flex items-stretch"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.11)",
        }}
      >
        <span
          className="w-[3.5px] shrink-0"
          style={{ background: SECTION_ACCENT[letter] }}
        />
        <div className="px-3 py-2.5">
          <p className="text-[13px] font-extrabold text-white leading-tight tracking-tight">
            {rest}
          </p>
        </div>
      </div>
    );
  }
  if (!title) return null;
  return (
    <p className="px-4 pb-1 pt-0.5 text-[10px] font-semibold text-white/40 uppercase tracking-widest">
      {title}
    </p>
  );
}

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto py-2 scrollbar-none">
      {NAV_GROUPS.map((group, gi) => (
        <div key={gi}>
          {gi > 0 && <div className="mx-4 my-2 h-px bg-white/15" />}
          <GroupTitle title={group.title} />
          {group.items.map((item) =>
            item.children ? (
              <AccordionItem key={item.href} item={item} pathname={pathname} />
            ) : (
              <LeafItem key={item.href} item={item} active={pathname === item.href} />
            )
          )}
        </div>
      ))}
    </nav>
  );
}
