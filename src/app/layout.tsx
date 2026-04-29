import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDS — Plan · Do · See",
  description: "Daily Plan-Do-See diary",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
