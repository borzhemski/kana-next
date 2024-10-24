import type { Metadata } from "next";

import { cn } from "@/utils/cn";

import "./globals.css";

import { Nunito } from "next/font/google";

export const metadata: Metadata = {
  description: "Train Hiragana and Katakana",
  title: "KanaNext",
};
const nunito = Nunito({ display: "swap", preload: false });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body
        className={cn(
          nunito.className,
          "antialiased bg-background-100 selection:bg-[#42b4ff4d] text-[#C7CAD1]"
        )}
      >
        {children}
      </body>
    </html>
  );
}
