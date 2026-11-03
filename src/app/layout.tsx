import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

// Self-hosted (SIL Open Font License, see src/app/fonts/OFL-*.txt) so builds never depend on fetching Google Fonts.
const lexend = localFont({ src: "./fonts/LexendDeca.ttf", weight: "300 700", display: "swap", variable: "--font-lexend-deca" });
const caveat = localFont({ src: "./fonts/Caveat.ttf", weight: "400 700", display: "swap", variable: "--font-caveat-hand" });

export const metadata: Metadata = {
  title: "Anyvendor — Find Top Event Professionals",
  description:
    "Event directory for Essex, London, Hertfordshire and beyond. Unforgettable events begin with unstoppable vendors. Testing preview.",
  robots: { index: false, follow: false },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Anyvendor", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#212235" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${lexend.variable} ${caveat.variable}`}>
      <body className="bg-white text-gray-900 min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
