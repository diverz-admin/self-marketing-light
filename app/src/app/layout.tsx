import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";

const SHARE_TITLE = "블루에그 | 바이럴 마케팅 솔루션";
const DESCRIPTION = "블로그·카페·리뷰·커뮤니티 바이럴을 한곳에서 실행하고 성과를 확인하는 바이럴 마케팅 솔루션";

export const metadata: Metadata = {
  title: "BLUE EGG",
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "블루에그",
    title: SHARE_TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "블루에그 — 바이럴 마케팅 솔루션" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-white text-brand-text">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
