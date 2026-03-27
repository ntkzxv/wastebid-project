"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, LayoutDashboard, Store, Search, Menu, X,
  User as UserIcon, Bell, Leaf, ChevronDown, Wallet // 💳 เพิ่ม Wallet
} from 'lucide-react';
import { supabase } from '@/lib/supabase'; // 🔌 เพิ่ม import supabase

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0); // 💰 เก็บยอดเงิน
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkUser = () => {
      const savedUser = localStorage.getItem('wastebid_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        fetchBalance(parsed.id); // ดึงเงินตอนโหลด
      }
    };
    
    checkUser();
    window.addEventListener('storage', checkUser);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', checkUser);
    };
  }, []);

  // 💰 ฟังก์ชันดึงเงิน
  const fetchBalance = async (uid: any) => {
    const { data } = await supabase.from('wallets').select('balance').eq('user_id', uid).single();
    if (data) setBalance(data.balance);
  };

  if (!mounted) return null;

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-xl py-4' : 'bg-white/90 backdrop-blur-md py-7'
    } border-b border-gray-100`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* --- LEFT: LOGO --- */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-12 h-12 bg-[#3A4A43] rounded-xl flex items-center justify-center text-white shadow-xl shadow-[#3A4A43]/20 transition-transform group-hover:rotate-6">
            <Leaf size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-[#3A4A43] uppercase leading-none tracking-tighter">Waste<span className="text-[#748D83]">Bid</span></span>
          </div>
        </Link>

        {/* --- CENTER: MENU --- */}
        <div className="hidden md:flex items-center gap-10">
          {!user ? (
            <>
              <NavLink href="/" active={pathname === '/'} label="หน้าแรก" />
              <NavLink href="/#services" label="บริการของเรา" />
              <NavLink href="/#contact" label="ติดต่อเรา" />
            </>
          ) : (
            <>
              <NavLink href="/dashboard" active={pathname === '/dashboard'} label="แดชบอร์ด" />
              <NavLink href="/chat" active={pathname.includes('/chat')} label="แชทสนทนา" />
            </>
          )}
        </div>

        {/* --- RIGHT: ACTIONS --- */}
        <div className="flex items-center gap-6">
          {!user ? (
            <Link href="/auth/register">
              <button className="px-8 py-3.5 bg-[#3A4A43] text-white rounded-xl text-[13px] font-black uppercase tracking-widest shadow-xl shadow-[#3A4A43]/20">สมัครสมาชิก</button>
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              
              {/* 💰 [NEW] Wallet Display on Navbar */}
              <Link href="/dashboard/wallet">
                <div className="hidden sm:flex items-center gap-3 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-2xl border border-gray-100 transition-all cursor-pointer group">
                  <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-[#748D83] shadow-sm group-hover:scale-110 transition-transform">
                    <Wallet size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">ยอดเงิน</span>
                    <span className="text-sm font-black text-[#3A4A43]">฿{balance.toLocaleString()}</span>
                  </div>
                </div>
              </Link>

              {/* Notifications */}
              <button className="p-3 text-gray-400 hover:text-[#3A4A43] hover:bg-gray-50 rounded-2xl transition-all relative border border-gray-50">
                <Bell size={22} />
              </button>

              <div className="h-10 w-[1px] bg-gray-200 mx-1 hidden sm:block" />

              {/* Profile Section (Link to Profile) */}
              <Link href="/dashboard/profile" className="flex items-center gap-4 pl-1 group cursor-pointer">
                <div className="hidden lg:flex flex-col text-right">
                  <p className="text-sm font-black text-[#3A4A43] uppercase leading-none group-hover:text-[#748D83] transition-colors">{user.username}</p>
                  <p className="text-[10px] font-bold text-[#748D83] uppercase tracking-widest mt-1.5">{user.role}</p>
                </div>
                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-md transition-transform group-hover:scale-105">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300"><UserIcon size={24} /></div>
                  )}
                </div>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-3 bg-gray-50 rounded-2xl text-[#3A4A43]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
      {/* ... Mobile Menu Code เหมือนเดิม ... */}
    </nav>
  );
}

// NavLink Sub-component เหมือนเดิม
function NavLink({ href, active, label }: any) {
  return (
    <Link href={href} className="group relative py-2">
      <div className={`text-[13px] font-black uppercase tracking-[0.1em] transition-all ${active ? 'text-[#3A4A43]' : 'text-gray-400 group-hover:text-[#3A4A43]'}`}>
        {label}
      </div>
      <motion.div className={`absolute -bottom-1 left-0 h-[3px] bg-[#748D83] rounded-full ${active ? 'w-full' : 'w-0 group-hover:w-full'}`} transition={{ duration: 0.3 }} />
    </Link>
  );
}