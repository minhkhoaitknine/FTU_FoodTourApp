import type { Metadata } from "next";
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
    default: "FoodTour Generator",
    template: "%s | FoodTour Generator"
  },
  description: "Plan local Vietnamese food tours with budget, timing and map-aware recommendations.",
  applicationName: "FoodTour Generator",
  keywords: ["Vietnam food tour", "travel food planner", "Next.js", "Prisma"],
  metadataBase: getMetadataBase()
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
