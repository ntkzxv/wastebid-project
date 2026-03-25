"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, Mail, Lock, Phone, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Notification, { NotificationType } from '../../components/ui/Notification';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // 🛡️ เพิ่มตัวล็อกสถานะสำเร็จ
  const [noti, setNoti] = useState({ show: false, type: 'success' as NotificationType, title: '', msg: '' });
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'bidder'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🛡️ กันเหนียว: ถ้ากำลังโหลด หรือสมัครสำเร็จไปแล้ว ห้ามรันฟังก์ชันนี้ซ้ำ
    if (loading || isSuccess) return;

    setLoading(true);

    try {
      // 1. เช็คความยาวรหัสผ่านก่อนส่ง
      if (formData.password.length < 6) {
        throw new Error("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      }

      // 2. เช็คก่อนว่า Email นี้มีคนใช้หรือยัง
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', formData.email)
        .maybeSingle(); // ใช้ maybeSingle เพื่อไม่ให้ error ถ้าไม่เจอ

      if (existingUser) {
        throw new Error("อีเมลนี้ถูกใช้งานแล้ว");
      }

      // 3. Insert ลงตาราง users
      const { error: insertError } = await supabase
        .from('users')
        .insert([{ 
          name: formData.name, 
          email: formData.email, 
          password: formData.password, 
          phone: formData.phone,
          role: formData.role,
          status: 'active',
          created_at: new Date()
        }]);

      if (insertError) throw insertError;

      // ✅ สมัครสำเร็จ: ล็อกสถานะไว้ทันที
      setIsSuccess(true); 
      setNoti({ show: true, type: 'success', title: 'สำเร็จ', msg: 'สมัครสมาชิกเรียบร้อย! กำลังพาไปหน้าเข้าสู่ระบบ...' });
      
      // หน่วงเวลา 2 วินาทีแล้วไปหน้า Login
      setTimeout(() => router.push('/auth/login'), 2000);

    } catch (err: any) {
      setNoti({ show: true, type: 'error', title: 'ผิดพลาด', msg: err.message });
      setLoading(false); // ถ้าพลาด ให้ปลดโหลดเพื่อให้ User แก้ไขข้อมูลได้
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-white flex items-center justify-center px-6 py-12 font-kanit fade-in-custom relative">
      
      {/* 🛡️ Overlay ชั้นสูงสุด: กันการคลิกทุกอย่างถ้ากำลัง Loading หรือสมัครสำเร็จแล้ว */}
      {(loading || isSuccess) && (
        <div className="fixed inset-0 z-[100] cursor-wait" />
      )}

      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        className={`w-full max-w-md transition-opacity duration-300 ${(loading || isSuccess) ? 'opacity-60' : 'opacity-100'}`}
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-[#2D3A2E] tracking-tight mb-2">สร้างบัญชีใหม่</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">เปลี่ยนขยะให้เป็นทุนกับ WasteBid</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'name', placeholder: 'ชื่อ-นามสกุล', icon: User, type: 'text' },
            { id: 'email', placeholder: 'อีเมล', icon: Mail, type: 'email' },
            { id: 'phone', placeholder: 'เบอร์โทรศัพท์', icon: Phone, type: 'tel' },
            { id: 'password', placeholder: 'รหัสผ่าน (6 ตัวขึ้นไป)', icon: Lock, type: 'password' },
            { id: 'confirmPassword', placeholder: 'ยืนยันรหัสผ่านอีกครั้ง', icon: Lock, type: 'password' },
          ].map((field) => (
            <div key={field.id} className="relative group">
              <field.icon className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${(loading || isSuccess) ? 'text-gray-200' : 'text-gray-300 group-focus-within:text-[#748D83]'}`} size={16} />
              <input 
                type={field.type} 
                required 
                placeholder={field.placeholder}
                disabled={loading || isSuccess} // 🛡️ ล็อก Input
                className="w-full bg-[#F8F9F8] border border-gray-50 rounded-[20px] pl-14 pr-6 py-4.5 outline-none focus:bg-[#F4F5F4] focus:border-[#748D83]/20 focus:ring-4 focus:ring-[#748D83]/5 transition-all duration-300 text-sm text-[#4A4A4A] disabled:cursor-not-allowed"
                onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
              />
            </div>
          ))}

          <div className="pt-4 pb-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">เลือกประเภทผู้ใช้งาน</p>
            <div className={`flex gap-3 bg-[#F8F9F8] p-1.5 rounded-[20px] border border-gray-100/50 transition-opacity ${(loading || isSuccess) ? 'opacity-50' : 'opacity-100'}`}>
              {['bidder', 'owner'].map((r) => (
                <button
                  key={r} 
                  type="button" 
                  disabled={loading || isSuccess} // 🛡️ ล็อกปุ่ม Role
                  onClick={() => setFormData({...formData, role: r})}
                  className={`flex-1 py-3.5 rounded-[15px] text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
                    formData.role === r ? 'bg-white text-[#3A4A43] shadow-sm border border-gray-100' : 'text-gray-300 hover:text-gray-500'
                  } disabled:cursor-not-allowed`}
                >
                  {formData.role === r && <CheckCircle2 size={12} className="text-[#748D83]" />}
                  {r === 'bidder' ? 'ผู้ประมูล' : 'ผู้ขาย'}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || isSuccess} // 🛡️ ล็อกปุ่ม Submit
            className="w-full bg-[#3A4A43] text-white py-4.5 rounded-[20px] font-black text-[10px] uppercase tracking-[0.25em] hover:bg-[#2D3A2E] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(58,74,67,0.15)] mt-4 disabled:opacity-70 disabled:cursor-wait"
          >
            {(loading || isSuccess) ? <Loader2 className="animate-spin" size={18} /> : <>สมัครสมาชิก <ArrowRight size={14} /></>}
          </button>
        </form>

        <p className={`text-center mt-12 text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] transition-opacity ${(loading || isSuccess) ? 'opacity-0' : 'opacity-100'}`}>
          มีบัญชีอยู่แล้ว? <Link href="/auth/login" className="text-[#748D83] hover:underline ml-2">เข้าสู่ระบบ</Link>
        </p>
      </motion.div>

      <Notification isVisible={noti.show} onClose={() => setNoti({...noti, show: false})} type={noti.type} title={noti.title} message={noti.msg} />
    </div>
  );
}