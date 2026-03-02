import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BeatStack - アナログで作曲、スマホで再生。",
  description: "カードを並べてリズムを作る、新感覚ハイブリッド音楽ゲーム。ゲームマーケット2026春 出展予定。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="ja">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
