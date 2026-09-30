import React from "react";
import Link from "next/link";
import Image from "next/image";
import { eq } from "drizzle-orm";
import ContentArea from "@/components/marketing/ContentArea";
import MobileBottomNav from "@/components/marketing/MobileBottomNav";
import MobileMenu from "@/components/marketing/MobileMenu";
import { MobileMenuProvider } from "@/components/marketing/MobileMenuContext";
import { CartProvider } from "@/components/marketing/CartContext";
import { HeaderBalance, HeaderCartButton } from "@/components/marketing/HeaderCart";
import HeaderUserMenu from "@/components/marketing/HeaderUserMenu";
import SidebarShell from "@/components/marketing/SidebarShell";
import MenuSearch from "@/components/marketing/MenuSearch";
import ThemeToggle, { THEME_BOOT_SCRIPT } from "@/components/marketing/ThemeToggle";
import { NotificationBell } from "@/components/marketing/Notifications";
import ScrollTopButton from "@/components/marketing/ScrollTopButton";
import { createClient } from "@/utils/supabase/server";
import { loadPointBalance } from "@/lib/points";
import { demoNotifications, loadNotifications } from "@/lib/notifications";
import { db } from "@/db";
import { users } from "@/db/schema";

/** 체험 중일 때 보여줄 예시 잔액 — 개발본과 같은 값 */
const DEMO_BALANCE = 386_000;

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인하지 않았으면 체험 모드 — 화면은 모두 예시 데이터다
  const trial = !user;

  // 헤더 포인트는 크레딧 원장 합계 — 관리자가 충전을 승인하면 바로 반영된다
  const [balance, notifications, role] = user
    ? await Promise.all([
        loadPointBalance(user.id),
        loadNotifications(user.id).catch(() => []),
        db.select({ role: users.role }).from(users).where(eq(users.id, user.id)).limit(1).then((r) => r[0]?.role ?? null),
      ])
    : [DEMO_BALANCE, demoNotifications(), null];
  const displayName =
    (user?.user_metadata?.name as string | undefined) || user?.email?.split("@")[0] || "사용자";

  return (
    <CartProvider initialBalance={balance}>
    <MobileMenuProvider>
    {/* 저장된 테마를 첫 페인트 전에 칠한다 — 다크 모드에서 흰 화면이 번쩍이지 않게 */}
    <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
    <div className="h-screen flex" style={{ background: "var(--canvas, #F2F3F4)" }}>

      <SidebarShell isAdmin={role === "admin"} />

      {/* ── Right: Header + Content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="sticky top-0 z-50 h-[72px] bg-white flex items-center gap-2.5 md:gap-3 px-4 md:px-6 shrink-0">
          {/* 모바일 전용 햄버거 메뉴 (좌측 슬라이드 드로어) */}
          <MobileMenu />

          {/* 모바일 전용 로고 */}
          <Link href="/marketing" className="md:hidden shrink-0">
            <Image src="/blue-egg-logo.png" alt="BLUE EGG biz" width={659} height={280} priority className="be-logo h-12 w-auto" />
          </Link>

          {trial && (
            <span className="hidden md:inline-flex shrink-0 rounded-full bg-brand-primary-50 px-2.5 py-1 text-[12px] font-bold text-brand-primary">체험 중</span>
          )}

          <MenuSearch />

          {/* 우측 그룹을 오른쪽 끝으로 밀어주는 스페이서 (모바일 포함) */}
          <div className="flex-1" />

          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <HeaderBalance />
            <HeaderCartButton />
            {user ? (
              <HeaderUserMenu displayName={displayName} />
            ) : (
              <Link href="/login" className="h-9 inline-flex items-center rounded-xl bg-brand-primary px-3.5 text-[13.5px] font-bold text-white hover:bg-brand-primary-hover">
                로그인
              </Link>
            )}
            <div className="hidden md:block">
              <NotificationBell items={notifications} />
            </div>
          </div>
        </header>

        {/* Content (대시보드=우측 레일 / 그 외=하단 배너) */}
        <ContentArea>{children}</ContentArea>
      </div>

      {/* 모바일 전용 하단 탭바 */}
      <MobileBottomNav />
      <ScrollTopButton />
    </div>
    </MobileMenuProvider>
    </CartProvider>
  );
}
