import type { Metadata } from "next";
import { Inter, Kanit } from "next/font/google"; 
import "./globals.css";
import MinimalNavbar from "./components/Navbar"; 

// 1. Setup Fonts
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["thai", "latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

// 2. SEO Metadata
export const metadata: Metadata = {
  title: "WasteBid - เปลี่ยนขยะเป็นทุน",
  description: "แพลตฟอร์มประมูลวัสดุรีไซเคิลและขยะเพื่ออนาคตที่ยั่งยืน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${inter.variable} ${kanit.variable} h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col font-kanit antialiased text-[var(--foreground)] selection:bg-[color-mix(in_srgb,var(--wb-sage)_28%,transparent)] selection:text-[var(--wb-forest)] bg-[var(--background)]">
        <MinimalNavbar />

        <main className="flex-grow w-full max-w-[1440px] mx-auto transition-opacity duration-700 pt-24 sm:pt-28">
          {children}
        </main>

      </body>
    </html>
  );
}

