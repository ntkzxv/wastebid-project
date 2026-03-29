"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, User as UserIcon, Bell, Leaf, Wallet, 
  LogOut, ShoppingBag, LayoutDashboard, Gavel 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
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
        fetchBalance(parsed.id);
      } else {
        setUser(null);
        setBalance(0);
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
  }, [pathname]);

  const fetchBalance = async (uid: number) => {
    const { data } = await supabase.from('wallets').select('balance').eq('user_id', uid).single();
    if (data) setBalance(data.balance);
  };

  const handleLogout = () => {
    localStorage.removeItem('wastebid_user');
    setUser(null);
    router.push('/');
    router.refresh();
  };

  if (!mounted) return null;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${
          isScrolled
            ? 'py-3 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
            : 'py-6 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
          
          {/* --- LOGO --- */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center text-white bg-[#3A4A43] shadow-lg shadow-[#3A4A43]/20"
            >
              <Leaf size={22} strokeWidth={2.5} />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-[#3A4A43] uppercase tracking-tighter leading-none">
                Waste<span className="text-[#748D83]">Bid</span>
              </span>
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#748D83]/60">Ecosystem</span>
            </div>
          </Link>

          {/* --- DESKTOP MENU --- */}
          <div className="hidden md:flex items-center bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100/50 backdrop-blur-sm">
            {!user ? (
              <>
                <NavLink href="/" active={pathname === '/'} label="หน้าแรก" />
                <NavLink href="/marketplace" active={pathname === '/marketplace'} label="ตลาดขยะ" />
                <NavLink href="/#services" label="บริการ" />
                <NavLink href="/#services" label="ติดต่อ" />
              </>
            ) : (
              <>
                <NavLink href="/marketplace" active={pathname === '/marketplace'} label="Marketplace" icon={<ShoppingBag size={14}/>} />
                <NavLink href="/dashboard" active={pathname === '/dashboard'} label="แดชบอร์ด" icon={<LayoutDashboard size={14}/>} />
                {/*เพิ่มเมนู My Bids สำหรับคนที่ไปประมูลขยะ*/}
                {user.role === 'bidder' && (
                  <NavLink href="/dashboard/my_bid" active={pathname === '/dashboard/my_bid'} label="My Bids" icon={<Gavel size={14}/>} />
                )}
              </>
            )}
          </div>

          {/*RIGHT SECTION: User & Wallet*/}
          <div className="flex items-center gap-2 sm:gap-4">
            {!user ? (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-[#3A4A43] hover:text-[#748D83] transition-colors">
                  Login
                </Link>
                <Link href="/auth/register" className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-[#3A4A43] shadow-xl shadow-[#3A4A43]/10 hover:bg-[#748D83] transition-all">
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/*Wallet Balance*/}
                <motion.div 
                   initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                   className="hidden sm:flex items-center gap-3 pl-4 pr-1.5 py-1.5 rounded-2xl bg-[#3A4A43] text-white shadow-lg shadow-[#3A4A43]/10"
                >
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Balance</span>
                    <span className="text-xs font-black tabular-nums">฿{balance.toLocaleString()}</span>
                  </div>
                  <Link href="/dashboard/wallet" className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                    <Wallet size={16} />
                  </Link>
                </motion.div>

                {/*Profile Toggle*/}
                <div className="h-8 w-[1px] bg-gray-100 hidden sm:block mx-1" />
                
                <Link href="/dashboard/profile" className="flex items-center gap-3 p-1 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                  <div className="hidden lg:flex flex-col text-right">
                    <p className="text-[10px] font-black text-[#3A4A43] uppercase tracking-tight">{user.username}</p>
                    <p className="text-[8px] font-bold text-[#748D83] uppercase tracking-widest">{user.role || 'Member'}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-md bg-[#F8F9F8]">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#748D83]">
                        <UserIcon size={18} strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                </Link>

                <button onClick={handleLogout} className="p-2.5 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                  <LogOut size={20} />
                </button>
              </div>
            )}

            {/*Mobile Toggle*/}
            <button
              className="md:hidden p-3 rounded-2xl bg-gray-50 text-[#3A4A43] hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/*MOBILE MENU*/}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 p-6 flex flex-col gap-3 shadow-2xl md:hidden"
            >
              {!user ? (
                <>
                  <MobileNavRow href="/" label="หน้าแรก" onClick={() => setMobileMenuOpen(false)} />
                  <MobileNavRow href="/marketplace" label="Marketplace" onClick={() => setMobileMenuOpen(false)} />
                  <Link href="/auth/login" className="w-full py-4 text-center rounded-2xl font-black uppercase text-xs tracking-widest bg-gray-50 text-[#3A4A43]">Login</Link>
                </>
              ) : (
                <>
                  <MobileNavRow href="/dashboard" label="Dashboard" onClick={() => setMobileMenuOpen(false)} />
                  <MobileNavRow href="/marketplace" label="Marketplace" onClick={() => setMobileMenuOpen(false)} />
                  {/* 🚀 Mobile Menu สำหรับ My Bids */}
                  {user.role === 'bidder' && (
                    <MobileNavRow href="/dashboard/my_bid" label="My Bids" onClick={() => setMobileMenuOpen(false)} />
                  )}
                  <MobileNavRow href="/dashboard/wallet" label="Wallet" onClick={() => setMobileMenuOpen(false)} />
                  <button onClick={handleLogout} className="w-full py-4 text-center text-red-500 font-black uppercase text-xs tracking-widest">Sign Out</button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      {/* Spacer */}
      <div className={isScrolled ? "h-0" : "h-0"} />
    </>
  );
}

//SUB-COMPONENTS

function NavLink({ href, active, label, icon }: { href: string; active?: boolean; label: string, icon?: React.ReactNode }) {
  return (
    <Link href={href} className="relative px-6 py-2.5 rounded-xl transition-all group overflow-hidden">
      <div className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] relative z-10 transition-colors duration-300 ${active ? 'text-white' : 'text-gray-400 group-hover:text-[#3A4A43]'}`}>
        {icon && icon}
        {label}
      </div>
      {active && (
        <motion.div 
          layoutId="activeTab"
          className="absolute inset-0 bg-[#3A4A43] rounded-xl z-0"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </Link>
  );
}

function MobileNavRow({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="w-full p-5 rounded-2xl bg-gray-50 flex items-center justify-between group"
    >
      <span className="font-black uppercase text-xs tracking-widest text-[#3A4A43]">{label}</span>
      <ChevronRight size={16} className="text-gray-300 group-hover:text-[#3A4A43] transition-all" />
    </Link>
  );
}

function ChevronRight({ size, className }: { size: number, className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}