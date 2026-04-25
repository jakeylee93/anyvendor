import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AnyVendor — Find Event Suppliers & Services",
  description: "Discover and book the best event vendors, suppliers, and services for your next event. From bars to DJs, caterers to photographers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#faf8f5] text-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
