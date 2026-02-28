import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "크로스핏 커뮤니티",
    template: "%s | 크로스핏 커뮤니티",
  },
  description: "크로스핏 운동을 함께하는 커뮤니티. WOD 기록, 개인 PR 관리, 정보 공유.",
  openGraph: {
    type: "website",
    siteName: "크로스핏 커뮤니티",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
