import type { Metadata, Viewport } from "next";
import { Freckle_Face, Nunito, Sour_Gummy } from "next/font/google";
import "./globals.css";

const display = Sour_Gummy({
  subsets: ["latin"],
  variable: "--font-sour-gummy",
});

const body = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

const title = Freckle_Face({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-freckle",
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
      className={`${display.variable} ${body.variable} ${title.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
