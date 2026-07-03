import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BLUE EGG",
  description: "광고대행사 없이 직접 마케팅을 실행하는 셀프 마케팅 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col bg-white text-brand-text">
        {children}
      </body>
    </html>
  );
}
