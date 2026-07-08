import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "古诗源",
  description: "回到原点的古诗阅读",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
