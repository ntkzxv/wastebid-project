"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Notification, { NotificationType } from '../../components/ui/Notification';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [noti, setNoti] = useState({ show: false, type: 'success' as NotificationType, title: '', msg: '' });
  const [formData, setFormData] = useState({ email: '', password: '' });

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    // ค้นหา User จากตาราง users
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', formData.email)
      .eq('password', formData.password) // เช็ครหัสผ่านตรงๆ
      .single();

    if (error || !user) {
      throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }

    // เก็บข้อมูล User ลงใน LocalStorage (เพื่อให้เครื่องจำได้ว่าล็อกอินแล้ว)
    localStorage.setItem('wastebid_user', JSON.stringify(user));

    setNoti({ show: true, type: 'success', title: 'สำเร็จ', msg: `ยินดีต้อนรับคุณ ${user.name}` });
    
    setTimeout(() => {
      router.push('/dashboard');
      window.location.reload(); // รีเฟรชเพื่อให้ Navbar เห็นค่าใน LocalStorage
    }, 1500);

  } catch (err: any) {
    setNoti({ show: true, type: 'error', title: 'เข้าสู่ระบบไม่สำเร็จ', msg: err.message });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-[calc(100vh-80px)] bg-white flex items-center justify-center px-6 py-12 font-kanit fade-in-custom relative">
      
      {/* 🛡️ Overlay กันการกดซ้ำ */}
      {loading && <div className="fixed inset-0 z-[100] cursor-wait" />}

      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        className={`w-full max-w-md transition-opacity duration-300 ${loading ? 'opacity-60' : 'opacity-100'}`}
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#748D83]/10 text-[#748D83] mb-4">
            <KeyRound size={24} />
          </div>
          <h1 className="text-3xl font-black text-[#2D3A2E] tracking-tight mb-2">ยินดีต้อนรับกลับมา</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">เข้าสู่ระบบเพื่อจัดการการประมูลของคุณ</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative group">
            <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${loading ? 'text-gray-200' : 'text-gray-300 group-focus-within:text-[#748D83]'}`} size={16} />
            <input 
              type="email" required placeholder="อีเมลของคุณ" disabled={loading}
              className="w-full bg-[#F8F9F8] border border-gray-50 rounded-[20px] pl-14 pr-6 py-4.5 outline-none focus:bg-[#F4F5F4] focus:border-[#748D83]/20 focus:ring-4 focus:ring-[#748D83]/5 transition-all duration-300 text-sm text-[#4A4A4A] disabled:cursor-not-allowed"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="relative group">
            <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${loading ? 'text-gray-200' : 'text-gray-300 group-focus-within:text-[#748D83]'}`} size={16} />
            <input 
              type="password" required placeholder="รหัสผ่าน" disabled={loading}
              className="w-full bg-[#F8F9F8] border border-gray-50 rounded-[20px] pl-14 pr-6 py-4.5 outline-none focus:bg-[#F4F5F4] focus:border-[#748D83]/20 focus:ring-4 focus:ring-[#748D83]/5 transition-all duration-300 text-sm text-[#4A4A4A] disabled:cursor-not-allowed"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="text-right px-2">
            <button type="button" disabled={loading} className="text-[10px] font-bold text-gray-400 hover:text-[#748D83] transition-colors uppercase tracking-widest disabled:opacity-50">ลืมรหัสผ่าน?</button>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#3A4A43] text-white py-4.5 rounded-[20px] font-black text-[10px] uppercase tracking-[0.25em] hover:bg-[#2D3A2E] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(58,74,67,0.15)] mt-6 disabled:opacity-70 disabled:cursor-wait">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <>เข้าสู่ระบบ <ArrowRight size={14} /></>}
          </button>
        </form>

        <p className={`text-center mt-12 text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] transition-opacity ${loading ? 'opacity-0' : 'opacity-100'}`}>
          ยังไม่มีบัญชี? <Link href="/auth/register" className="text-[#748D83] hover:underline ml-2">สมัครสมาชิกใหม่</Link>
        </p>
      </motion.div>

      <Notification isVisible={noti.show} onClose={() => setNoti({...noti, show: false})} type={noti.type} title={noti.title} message={noti.msg} />
    </div>
  );
}