"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, Mail, Lock, Phone, ArrowRight, Loader2, CheckCircle2, Box } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import Notification, { NotificationType } from '../../components/ui/Notification';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [noti, setNoti] = useState({ show: false, type: 'success' as NotificationType, title: '', msg: '' });
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'bidder'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || isSuccess) return;
    setLoading(true);

    try {
      if (formData.password.length < 6) throw new Error("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      if (formData.password !== formData.confirmPassword) throw new Error("รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง");

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email, password: formData.password, options: { data: { username: formData.name } }
      });

      if (authError) {
        if (authError.message.includes('already registered') || authError.status === 400) throw new Error("อีเมลนี้ถูกใช้งานแล้ว");
        throw authError;
      }

      if (authData.user) {
        const { error: insertError } = await supabase.from('users').insert([{ 
            username: formData.name, email: formData.email, password_hash: 'managed_by_supabase_auth', 
            phone: formData.phone, role: formData.role
        }]);
        if (insertError) throw insertError;
      }

      setIsSuccess(true); 
      setNoti({ show: true, type: 'success', title: 'สำเร็จ', msg: 'สมัครสมาชิกเรียบร้อย' });
      setTimeout(() => router.push('/auth/login'), 2000);

    } catch (err: any) {
      setNoti({ show: true, type: 'error', title: 'ผิดพลาด', msg: err.message });
      setLoading(false); 
    }
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6 py-20 font-sans relative overflow-hidden selection:bg-emerald-200">
      
      {/* Premium Background Glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-300/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-300/20 blur-[120px] pointer-events-none" />

      {(loading || isSuccess) && <div className="fixed inset-0 z-[100] cursor-wait" />}

      <motion.div initial="hidden" animate="visible" variants={fadeUp} className={`w-full max-w-[480px] relative z-10 transition-opacity duration-300 ${(loading || isSuccess) ? 'opacity-60' : 'opacity-100'}`}>
        <div className="bg-white/80 backdrop-blur-2xl p-10 md:p-12 rounded-[40px] shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-white/60">
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-slate-950 tracking-tight mb-2">Create Account</h1>
            <p className="text-sm text-slate-500 font-medium">เปลี่ยนขยะให้เป็นทุนกับ WasteBid</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { id: 'name', placeholder: 'ชื่อ-นามสกุล', icon: User, type: 'text' },
              { id: 'email', placeholder: 'อีเมล', icon: Mail, type: 'email' },
              { id: 'phone', placeholder: 'เบอร์โทรศัพท์', icon: Phone, type: 'tel' },
              { id: 'password', placeholder: 'รหัสผ่าน (6 ตัวขึ้นไป)', icon: Lock, type: 'password' },
              { id: 'confirmPassword', placeholder: 'ยืนยันรหัสผ่านอีกครั้ง', icon: Lock, type: 'password' },
            ].map((field) => (
              <div key={field.id} className="relative group">
                <field.icon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input 
                  type={field.type} required placeholder={field.placeholder} disabled={loading || isSuccess}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                  onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
                />
              </div>
            ))}

            {/* Premium Role Selector */}
            <div className="pt-2 pb-2">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 pl-1">I want to:</p>
              <div className="flex gap-2 bg-slate-100/50 p-1.5 rounded-[20px] border border-slate-200/50">
                {['bidder', 'owner'].map((r) => (
                  <button
                    key={r} type="button" disabled={loading || isSuccess}
                    onClick={() => setFormData({...formData, role: r})}
                    className={`flex-1 py-3 rounded-[16px] text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
                      formData.role === r ? 'bg-white text-emerald-600 shadow-md border border-slate-100' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {formData.role === r && <CheckCircle2 size={14} className="text-emerald-500" />}
                    {r === 'bidder' ? 'Bid & Buy' : 'Sell Materials'}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading || isSuccess} className="w-full bg-slate-950 text-white py-4 rounded-2xl font-bold text-sm tracking-wide hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 mt-6 group">
              {(loading || isSuccess) ? <Loader2 className="animate-spin" size={18} /> : <>Create Account <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </form>

          <p className="text-center mt-10 text-sm font-medium text-slate-500">
            มีบัญชีอยู่แล้ว? <Link href="/auth/login" className="text-emerald-600 font-bold hover:underline ml-1">เข้าสู่ระบบ</Link>
          </p>
        </div>
      </motion.div>

      <Notification isVisible={noti.show} onClose={() => setNoti({...noti, show: false})} type={noti.type} title={noti.title} message={noti.msg} />
    </div>
  );
}