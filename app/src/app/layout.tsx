import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "BLUE EGG",
  description: "블로그·카페·리뷰·커뮤니티 바이럴을 한곳에서 실행하고 성과를 확인하는 바이럴 마케팅 솔루션",
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
