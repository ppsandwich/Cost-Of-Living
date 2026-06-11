import type { Metadata, Viewport } from "next";
import { Nunito, Sour_Gummy } from "next/font/google";
import "./globals.css";

const display = Sour_Gummy({
  subsets: ["latin"],
  variable: "--font-sour-gummy",
});

const body = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Cost of Living",
  description:
    "A satirical supermarket survival game. Feed someone on a budget that keeps getting worse.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
