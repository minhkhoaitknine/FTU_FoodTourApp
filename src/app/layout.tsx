import type { Metadata } from "next";
import { BackgroundMusicPlayer } from "@/components/music/background-music-player";
import "leaflet/dist/leaflet.css";
import "./globals.css";

function getMetadataBase() {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!rawUrl) return new URL("http://localhost:3000");

  const normalizedUrl = /^https?:\/\//i.test(rawUrl)
    ? rawUrl
    : `https://${rawUrl.replace(/^\/+/, "")}`;

  try {
    return new URL(normalizedUrl);
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  title: {
    default: "Tastetrail",
    template: "%s | Tastetrail"
  },
  description: "Plan local Vietnamese food tours with budget, timing and map-aware recommendations.",
  applicationName: "Tastetrail",
  icons: {
    icon: "/images/brand/tastetrail-logo.png",
    apple: "/images/brand/tastetrail-logo.png"
  },
  keywords: ["Vietnam food tour", "travel food planner", "Next.js", "Prisma"],
  metadataBase: getMetadataBase()
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth" lang="vi" suppressHydrationWarning>
      <body>
        {children}
        <BackgroundMusicPlayer />
      </body>
    </html>
  );
}
