import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Self Marketing Platform",
  description: "나만의 브랜딩, 경력 관리 및 프로젝트 홍보 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${montserrat.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-brand-light text-brand-dark">
        {children}
      </body>
    </html>
  );
}
