"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, ArrowRight, Loader2, KeyRound, Box } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
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
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError || !authData.user) throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");

      const { data: user, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('email', formData.email)
        .single();

      if (dbError || !user) throw new Error("ล็อกอินสำเร็จ แต่ไม่พบข้อมูลโปรไฟล์ในระบบ");

      localStorage.setItem('wastebid_user', JSON.stringify(user));

      setNoti({
        show: true, type: 'success', title: 'Welcome Back',
        msg: `ยินดีต้อนรับคุณ ${user.username || user.name || 'ผู้ใช้งาน'}`
      });

      setTimeout(() => { window.location.href = '/dashboard'; }, 1500);

    } catch (err: any) {
      setNoti({ show: true, type: 'error', title: 'เข้าสู่ระบบไม่สำเร็จ', msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6 py-12 font-sans relative overflow-hidden selection:bg-emerald-200">
      
      {/* Premium Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-300/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-300/20 blur-[120px] pointer-events-none" />

      {loading && <div className="fixed inset-0 z-[100] cursor-wait" />}

      <motion.div
        initial="hidden" animate="visible" variants={fadeUp}
        className={`w-full max-w-[420px] relative z-10 transition-opacity duration-300 ${loading ? 'opacity-60' : 'opacity-100'}`}
      >
        <div className="bg-white/80 backdrop-blur-2xl p-10 md:p-12 rounded-[40px] shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-white/60">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-slate-950 text-emerald-400 mb-6 shadow-inner">
              <Box size={28} />
            </div>
            <h1 className="text-3xl font-black text-slate-950 tracking-tight mb-2">Welcome Back</h1>
            <p className="text-sm text-slate-500 font-medium">เข้าสู่ระบบเพื่อจัดการการประมูลของคุณ</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input
                type="email" required placeholder="อีเมลของคุณ" disabled={loading}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input
                type="password" required placeholder="รหัสผ่าน" disabled={loading}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-slate-950 text-white py-4 rounded-2xl font-bold text-sm tracking-wide hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 mt-8 disabled:opacity-70 group">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Sign In <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </form>

          <p className="text-center mt-10 text-sm font-medium text-slate-500">
            ยังไม่มีบัญชี? <Link href="/auth/register" className="text-emerald-600 font-bold hover:underline ml-1">สมัครสมาชิกใหม่</Link>
          </p>
        </div>
      </motion.div>

      <Notification isVisible={noti.show} onClose={() => setNoti({ ...noti, show: false })} type={noti.type} title={noti.title} message={noti.msg} />
    </div>
  );
}