"use client";
import React, { useState, useRef, useEffect } from 'react';
import {
  Leaf, Search, Gavel, LayoutDashboard, User,
  ChevronDown, LogOut, X, LogIn, UserPlus, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MinimalNavbar() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  const [showSearch, setShowSearch] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // --- 👤 User State ---
  const [user, setUser] = useState<{ username?: string; name?: string; email: string } | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ดึงข้อมูล User จาก LocalStorage (Manual Auth)
    const savedUser = localStorage.getItem('wastebid_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);

    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setShowAccount(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- 🚪 Logout Function ---
  const handleLogout = () => {
    localStorage.removeItem('wastebid_user');
    setUser(null);
    setShowAccount(false);
    router.push('/auth/login');
    router.refresh(); // บังคับให้โหลดใหม่เพื่อล้างสถานะในทุกจุด
  };

  const menuItems = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'listings', label: 'Listings', icon: Gavel },
    { id: 'watchlist', label: 'Watchlist', icon: Heart },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className={`sticky top-0 w-full z-50 transition-all duration-300 ${isScrolled
      ? "bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm shadow-gray-100/20"
      : "bg-white border-b border-transparent"
      }`}>
      <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between relative">

        {/* --- Minimal Logo --- */}
        <Link href="/" className={`flex items-center gap-3 cursor-pointer shrink-0 transition-all duration-500 ${showSearch ? 'opacity-0 scale-90 translate-x-[-20px] md:opacity-100 md:scale-100 md:translate-x-0' : 'opacity-100'}`}>
          <Leaf size={20} className="text-[#748D83]" />
          <span className="font-bold text-lg tracking-tight text-[#4A4A4A] font-thai font-black">wastebid.</span>
        </Link>

        {/* --- Center Navigation --- */}
        <div className={`hidden md:flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 transition-all duration-500 ${showSearch ? 'opacity-0 invisible scale-95' : 'opacity-100 visible scale-100'}`}>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-10 py-2.5 min-w-[130px] text-[10px] font-black tracking-widest transition-colors duration-300 z-10 font-kanit ${isActive ? 'text-[#3A4A43]' : 'text-gray-300 hover:text-gray-500'
                  }`}
              >
                <span className="relative z-20 uppercase tracking-widest">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabBackground"
                    className="absolute inset-0 bg-[#F1F1F1] rounded-xl z-10"
                    transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* --- Right Section --- */}
        <div className="flex items-center gap-5 relative">

          <div ref={searchRef} className="flex items-center justify-end">
            <div className={`flex items-center bg-[#F8F9F8] rounded-full transition-all duration-500 border ${showSearch ? 'w-[260px] md:w-[320px] px-3 py-1.5 border-gray-100 shadow-inner' : 'w-10 h-10 bg-transparent border-transparent'}`}>
              <button onClick={() => setShowSearch(!showSearch)} className={`p-2 shrink-0 rounded-full transition-colors duration-300 ${showSearch ? 'text-[#748D83]' : 'text-gray-400 hover:text-[#748D83]'}`}>
                <Search size={19} strokeWidth={2.5} />
              </button>
              <input
                type="text"
                placeholder="ค้นหาวัสดุหรือพิกัด..."
                className={`bg-transparent border-none text-xs text-[#4A4A4A] placeholder:text-gray-300 outline-none transition-all duration-500 font-thai ${showSearch ? 'w-full ml-2 opacity-100' : 'w-0 opacity-0'}`}
                autoFocus={showSearch}
              />
            </div>
          </div>

          {/* --- Account Dropdown --- */}
          <div className="relative" ref={accountRef}>
            <button
              onClick={() => setShowAccount(!showAccount)}
              className="flex items-center gap-2 group p-1 pr-3 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
            >
              <div className="w-9 h-9 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center transition-transform group-hover:scale-105 active:scale-95 overflow-hidden">
                {user ? (
                  <div className="w-full h-full bg-[#748D83] flex items-center justify-center text-white text-[10px] font-bold uppercase">
                    {((user as any)?.username || (user as any)?.name || 'US').substring(0, 2).toUpperCase()}
                  </div>
                ) : (
                  <User size={18} className="text-[#748D83]" />
                )}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-[10px] font-black text-[#4A4A4A] uppercase leading-none">
                  {user ? (user.username || user.name) : 'Account'}
                </p>
              </div>
              <ChevronDown size={12} className={`text-gray-400 transition-transform duration-300 ${showAccount ? 'rotate-180 text-[#3A4A43]' : ''}`} />
            </button>

            <AnimatePresence>
              {showAccount && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-14 right-0 w-64 bg-white rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 p-2 z-[60]"
                >
                  {/* Header: User Info */}
                  <div className="p-4 mb-2 border-b border-gray-50">
                    {user ? (
                      <>
                        <p className="text-[11px] font-black text-[#3A4A43] uppercase tracking-tight">{user.username || user.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">{user.email}</p>
                      </>
                    ) : (
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] font-kanit">Welcome to WasteBid</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    {!user ? (
                      <>
                        <Link href="/auth/login" className="block" onClick={() => setShowAccount(false)}>
                          <button className="w-full flex items-center gap-4 p-3.5 hover:bg-[#F9FAFA] rounded-[1rem] transition-all group/item">
                            <div className="p-2 bg-gray-50 rounded-xl group-hover/item:bg-[#E8EDEB] transition-colors">
                              <LogIn size={15} className="text-[#3A4A43]" />
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-bold text-[#3A4A43] font-kanit leading-none">Sign In</p>
                              <p className="text-[9px] text-gray-400 font-kanit mt-1">เข้าสู่ระบบ</p>
                            </div>
                          </button>
                        </Link>

                        <Link href="/auth/register" className="block" onClick={() => setShowAccount(false)}>
                          <button className="w-full flex items-center gap-4 p-3.5 hover:bg-[#F9FAFA] rounded-[1rem] transition-all group/item">
                            <div className="p-2 bg-gray-50 rounded-xl group-hover/item:bg-[#E8EDEB] transition-colors">
                              <UserPlus size={15} className="text-[#3A4A43]" />
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-bold text-[#3A4A43] font-kanit leading-none">Sign Up</p>
                              <p className="text-[9px] text-gray-400 font-kanit mt-1">สมัครสมาชิกใหม่</p>
                            </div>
                          </button>
                        </Link>
                      </>
                    ) : (
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 p-3.5 hover:bg-red-50 rounded-[1rem] transition-all group/item"
                      >
                        <div className="p-2 bg-red-50/50 rounded-xl group-hover/item:bg-red-100 transition-colors">
                          <LogOut size={15} className="text-red-500" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-red-500 font-kanit leading-none">Sign Out</p>
                          <p className="text-[9px] text-red-400 font-kanit mt-1">ออกจากระบบ</p>
                        </div>
                      </button>
                    )}
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-50 px-2 pb-2">
                    <p className="text-[9px] text-gray-300 font-kanit text-center">Version 1.0.0 — WasteBid Project</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}