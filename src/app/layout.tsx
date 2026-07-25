import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FoodTour Generator",
    template: "%s | FoodTour Generator"
  },
  description: "Plan local Vietnamese food tours with budget, timing and map-aware recommendations.",
  applicationName: "FoodTour Generator",
  keywords: ["Vietnam food tour", "travel food planner", "Next.js", "Prisma"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
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
