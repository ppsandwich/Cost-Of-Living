import type { Metadata, Viewport } from "next";
import { Knewave, Nunito, Oleo_Script, Sour_Gummy } from "next/font/google";
import "./globals.css";

const display = Sour_Gummy({
  subsets: ["latin"],
  variable: "--font-sour-gummy",
});

const body = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

const title = Oleo_Script({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-oleo",
});

const accent = Knewave({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-knewave",
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
      className={`${display.variable} ${body.variable} ${title.variable} ${accent.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
