import type { Metadata } from "next";
import { Lexend_Deca, Caveat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const lexend = Lexend_Deca({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-lexend-deca" });
const caveat = Caveat({ subsets: ["latin"], weight: ["600"], variable: "--font-caveat-hand" });

export const metadata: Metadata = {
  title: "Anyvendor — Find Top Event Professionals",
  description:
    "Event directory for Essex, London, Hertfordshire and beyond. Unforgettable events begin with unstoppable vendors. Testing preview.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${lexend.variable} ${caveat.variable}`}>
      <body className="bg-white text-gray-900 min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
