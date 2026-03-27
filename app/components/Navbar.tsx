"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, LogOut, Gavel, 
  LayoutDashboard, Store, Search, Menu, X 
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem('wastebid_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('wastebid_user');
    setUser(null); 
    setMobileMenuOpen(false);
    window.location.href = '/auth/login'; 
  };

  if (!mounted || !user) return null;

  const isOwner = user.role === 'owner';

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${
      isScrolled ? 'py-3' : 'py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`relative flex items-center justify-between p-2 px-6 rounded-[2.2rem] transition-all duration-500 ${
          isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg border border-white/20' : 'bg-white border border-gray-100'
        }`}>
          
          {/* --- LOGO --- */}
          <Link href="/dashboard" className="flex items-center gap-2 group shrink-0">
            <motion.div whileHover={{ rotate: 15 }} className="w-10 h-10 bg-[#3A4A43] rounded-xl flex items-center justify-center text-white shadow-lg">
              <Gavel size={20} />
            </motion.div>
            <span className="text-xl font-black text-[#3A4A43] uppercase tracking-tighter">
              Waste<span className="text-[#748D83]">Bid</span>
            </span>
          </Link>

          {/* --- DESKTOP MENU --- */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-50/50 p-1 rounded-2xl border border-gray-100/50">
              <NavTab href="/dashboard" active={pathname === '/dashboard'} icon={<LayoutDashboard size={16}/>} label="แดชบอร์ด" />
              
              {isOwner ? (
                <NavTab href="/dashboard" active={false} icon={<Store size={16}/>} label="การประมูลของฉัน" />
              ) : (
                <NavTab href="/dashboard" active={false} icon={<Search size={16}/>} label="ตลาดประมูล" />
              )}
              
              <NavTab href="/chat" active={pathname.includes('/chat')} icon={<MessageCircle size={16}/>} label="แชท" />
            </div>

            <div className="h-6 w-[1px] bg-gray-200 mx-4" />

            {/* --- ACTION BUTTONS --- */}
            <div className="flex items-center gap-3">
              {/* เหลือแค่ปุ่ม Logout คลีนๆ ตามสั่ง */}
              <motion.button 
                whileHover={{ backgroundColor: '#fee2e2', color: '#ef4444', scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="p-3 rounded-xl bg-gray-50 text-gray-400 transition-all border border-gray-100 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"
              >
                <LogOut size={16} /> Logout
              </motion.button>
            </div>
          </div>

          {/* --- MOBILE TOGGLE --- */}
          <button className="md:hidden p-2 text-[#3A4A43]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* --- MOBILE MENU --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 w-full p-4 md:hidden"
          >
            <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-6 flex flex-col gap-4">
              
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl font-bold text-[#3A4A43]">
                <LayoutDashboard size={20}/> แดชบอร์ด
              </Link>
              <Link href="/chat" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl font-bold text-[#3A4A43]">
                <MessageCircle size={20}/> แชทสนทนา
              </Link>
              
              <button 
                onClick={handleLogout} 
                className="flex items-center justify-center gap-4 p-5 text-red-500 font-black uppercase text-xs tracking-widest border-t border-gray-50 mt-2"
              >
                <LogOut size={20} /> ออกจากระบบ
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavTab({ href, active, icon, label }: { href: string, active: boolean, icon: any, label: string }) {
  return (
    <Link href={href} className="relative px-5 py-2 group">
      <div className={`relative z-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
        active ? 'text-[#3A4A43]' : 'text-gray-400 group-hover:text-[#3A4A43]'
      }`}>
        {icon} <span>{label}</span>
      </div>
      {active && (
        <motion.div 
          layoutId="activeTab"
          className="absolute inset-0 bg-white rounded-xl shadow-sm border border-gray-100"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}
    </Link>
  );
}