import type { Metadata, Viewport } from "next";
import { Lilita_One, Nunito, VT323 } from "next/font/google";
import "./globals.css";

const display = Lilita_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-lilita",
});

const body = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

const pixel = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
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
      className={`${display.variable} ${body.variable} ${pixel.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
