"use client";

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, ShoppingBag, PlusSquare, User,
  Bell, Box, Wallet, AlertCircle, Trophy,
  ArrowDownRight, CheckCircle2
} from "lucide-react";
import { supabase } from '@/lib/supabase'; //

export default function Navbar() {
  const pathname = usePathname();
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Notification States
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUserData = () => {
      const savedUser = localStorage.getItem('wastebid_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);

        // ดึงยอดเงินจาก DB
        supabase.from('wallets').select('balance').eq('user_id', user.id).single()
          .then(({ data }) => { if (data) setWalletBalance(data.balance); });

        // ดึงแจ้งเตือนจาก DB
        fetchNotifications(user.id);
      }
    };

    loadUserData();

    // ฟัง Event เมื่อมีการอัปเดตข้อมูล User (เช่น เปลี่ยนรูป)
    window.addEventListener('userUpdated', loadUserData);

    const savedUser = localStorage.getItem('wastebid_user');
    let walletChannel: any;
    let notiChannel: any;

    if (savedUser) {
      const user = JSON.parse(savedUser);

      // Real-time Update สำหรับยอดเงิน
      walletChannel = supabase.channel('wallet_nav_updates')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'wallets', filter: `user_id=eq.${user.id}` }, (payload) => {
          setWalletBalance(payload.new.balance);
        }).subscribe();

      // Real-time Update สำหรับแจ้งเตือน
      notiChannel = supabase.channel('noti_nav_updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => {
          fetchNotifications(user.id);
        }).subscribe();
    }

    // ปิด Dropdown เมื่อคลิกข้างนอก
    const handleClickOutside = (event: MouseEvent) => {
      if (notiRef.current && !notiRef.current.contains(event.target as Node)) {
        setIsNotiOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener('userUpdated', loadUserData);
      if (walletChannel) supabase.removeChannel(walletChannel);
      if (notiChannel) supabase.removeChannel(notiChannel);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ในไฟล์ Navbar.tsx
  const fetchNotifications = async (userId: any) => {
    const cleanId = Number(userId); // 🔥 ต้องแปลงเป็น Number เสมอ!
    
    if (!cleanId) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', cleanId) // ดึงเฉพาะแจ้งเตือนที่มี user_id ตรงกับเรา
      .order('created_at', { ascending: false });

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };
  
  const markAllAsRead = async () => {
    if (!currentUser) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', currentUser.id).eq('is_read', false);
    fetchNotifications(currentUser.id);
  };

  const markAsRead = async (notiId: number) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', notiId);
    fetchNotifications(currentUser.id);
  };

  const navItems = [
    { name: "Home", href: "/", icon: <Home className="w-4 h-4" /> },
    { name: "Market", href: "/marketplace", icon: <ShoppingBag className="w-4 h-4" /> },
    { name: "Sell", href: "/listings/create", icon: <PlusSquare className="w-4 h-4" /> },
    { name: "Dashboard", href: "/dashboard", icon: <User className="w-4 h-4" /> },
  ];

  // Logic การแสดงผลรูปภาพโปรไฟล์
  const avatarImage = currentUser?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.username || 'wastebid'}`;

  // Helper สำหรับจัดการสไตล์แจ้งเตือนตาม Type (ที่เราเพิ่มใน SQL)
  const getNotiStyle = (type: string) => {
    switch (type) {
      case 'outbid': return { icon: <AlertCircle className="text-rose-500 w-5 h-5" />, bg: 'bg-rose-50' };
      case 'won': return { icon: <Trophy className="text-amber-500 w-5 h-5" />, bg: 'bg-amber-50' };
      case 'wallet': return { icon: <ArrowDownRight className="text-emerald-500 w-5 h-5" />, bg: 'bg-emerald-50' };
      default: return { icon: <CheckCircle2 className="text-blue-500 w-5 h-5" />, bg: 'bg-blue-50' };
    }
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-5xl"
    >
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-[0_4px_20px_rgba(0,0,0,0.04)] rounded-full px-3 py-2.5 flex items-center justify-between relative">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 pl-3 group">
          <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white">
            <Box className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 hidden sm:block">
            WasteBid.
          </span>
        </Link>

        {/* Desktop Menu (Center) */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-full flex items-center gap-2 z-10 ${isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                {isActive && (
                  <motion.div layoutId="navbar-active" className="absolute inset-0 bg-slate-100 rounded-full -z-10" transition={{ duration: 0.3 }} />
                )}
                <span className="relative z-10 flex items-center gap-1.5">{item.icon} {item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Actions: Wallet, Noti, Profile */}
        <div className="flex items-center gap-3 pr-1" ref={notiRef}>

          {/* Wallet Balance Display */}
          {walletBalance !== null && (
            <Link href="/dashboard/wallet" className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 transition-colors">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-bold text-slate-900 tabular-nums">฿{walletBalance.toLocaleString()}</span>
            </Link>
          )}

          <div className="w-px h-5 bg-slate-200 hidden sm:block"></div>

          {/* Notification Bell */}
          <button
            onClick={() => setIsNotiOpen(!isNotiOpen)}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors relative ${isNotiOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>

          {/* Notification Dropdown */}
          <AnimatePresence>
            {isNotiOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-16 w-[340px] sm:w-[380px] bg-white border border-slate-100 shadow-2xl rounded-[32px] overflow-hidden z-50 flex flex-col"
              >
                <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:text-emerald-700">
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                  {notifications.length > 0 ? notifications.map((noti) => {
                    const style = getNotiStyle(noti.type);
                    return (
                      <div
                        key={noti.id}
                        onClick={() => { if (!noti.is_read) markAsRead(noti.id); }}
                        className={`px-6 py-4 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0 relative ${!noti.is_read ? 'bg-slate-50/50' : 'bg-white'}`}
                      >
                        {!noti.is_read && (
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        )}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${style.bg}`}>
                          {style.icon}
                        </div>
                        <div className="flex-1 pr-2">
                          <p className={`text-sm font-bold ${noti.type === 'outbid' ? 'text-rose-600' : 'text-slate-900'}`}>{noti.title || 'Notification'}</p>
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{noti.message}</p>
                        </div>
                      </div>
                    )
                  }) : (
                    <div className="py-12 text-center text-slate-400">
                      <p className="text-xs font-bold uppercase tracking-widest">No notifications</p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                  <Link href="/dashboard" onClick={() => setIsNotiOpen(false)} className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors">
                    View All
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User Profile Avatar */}
          <Link href="/dashboard/profile" className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 hover:border-slate-400 transition-all bg-slate-50">
            <img src={avatarImage} alt="Profile" className="w-full h-full object-cover" />
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}