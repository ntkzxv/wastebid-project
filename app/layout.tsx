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
      <body className="min-h-screen flex flex-col font-kanit bg-white text-[#4A4A43] selection:bg-[#748D83]/10 selection:text-[#3A4A43]">
        
        <MinimalNavbar />

        {/* กูเพิ่ม pt-28 เข้าไปตรงนี้เพื่อให้เนื้อหาไม่มุดใต้ Navbar ครับ */}
        <main className="flex-grow w-full max-w-[1440px] mx-auto transition-opacity duration-700 pt-28">
          {children}
        </main>

      </body>
    </html>
  );
}

