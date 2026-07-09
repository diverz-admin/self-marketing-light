import Link from "next/link";
import Logo from "@/components/Logo";
import { PLATFORM_ENTRY } from "@/utils/platform";

const NAV = [
  { label: "작동 방식", href: "/#how" },
  { label: "서비스", href: "/#services" },
  { label: "특징", href: "/#features" },
  { label: "요금", href: "/pricing" },
  { label: "소개", href: "/about" },
  { label: "문의", href: "/contact" },
];

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header — floating pill */}
      <header className="sticky top-0 z-50 w-full px-4 pt-3">
        <div className="max-w-6xl mx-auto rounded-full border border-brand-border/70 bg-white/85 backdrop-blur-md shadow-[0_8px_30px_-12px_rgba(17,29,55,.18)] pl-6 pr-3 h-14 flex items-center justify-between">
          <Link href="/" aria-label="홈으로">
            <Logo
              markClassName="h-7 w-auto"
              textClassName="h-4.5 w-auto"
              textColor="text-brand-dark"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-sub">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-brand-text transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={PLATFORM_ENTRY}
              className="hover:text-brand-text transition-colors"
            >
              로그인
            </a>
          </nav>
          <a
            href={PLATFORM_ENTRY}
            className="px-5 py-2.5 rounded-full text-sm font-bold bg-electric text-white hover:bg-electric-hover transition-colors shadow-[0_6px_18px_-6px_rgba(29,62,255,.6)]"
          >
            무료로 시작하기
          </a>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-brand-border bg-white py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-brand-sub">
          <Logo
            markClassName="h-6 w-auto"
            textClassName="h-4 w-auto"
            textColor="text-brand-sub"
          />
          <nav className="flex items-center gap-5">
            <Link href="/about" className="hover:text-brand-text transition-colors">
              소개
            </Link>
            <Link href="/pricing" className="hover:text-brand-text transition-colors">
              요금
            </Link>
            <Link href="/contact" className="hover:text-brand-text transition-colors">
              문의
            </Link>
          </nav>
          <span>
            &copy; 2026 BLUE EGG. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
