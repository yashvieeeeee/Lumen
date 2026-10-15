import type { Metadata, Viewport } from "next";
import "./globals.css";
import Motion from "./motion";
import DetailsMotion from "./details-motion";

export const metadata: Metadata = {
  title: "Lumen · A little space to reflect",
  description:
    "A thoughtful space to write, reflect and revisit your words, with privacy choices in your hands.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f2f5f7",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Motion />
        <DetailsMotion />
        {children}
      </body>
    </html>
  );
}
