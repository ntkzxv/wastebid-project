"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  User as UserIcon, Mail, Shield, 
  Calendar, LogOut, ArrowLeft, Wallet, 
  Settings, Camera, CheckCircle2, Loader2 
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('wastebid_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      fetchWallet(parsed.id);
    }
  }, []);

  const fetchWallet = async (uid: any) => {
    const { data } = await supabase.from('wallets').select('*').eq('user_id', uid).single();
    setWallet(data);
  };

  const handleLogout = () => {
    if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      localStorage.removeItem('wastebid_user');
      window.location.href = '/';
    }
  };

  // 🔥 ฟังก์ชันอัปโหลดรูปโปรไฟล์
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('กรุณาเลือกรูปภาพ');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. อัปโหลดรูปขึ้น Supabase Storage (Bucket ชื่อ avatars)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. ดึง Public URL ของรูปที่เพิ่งอัปโหลด
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. อัปเดตข้อมูลในตาราง users
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 4. อัปเดต State และ LocalStorage
      const updatedUser = { ...user, avatar_url: publicUrl };
      setUser(updatedUser);
      localStorage.setItem('wastebid_user', JSON.stringify(updatedUser));

      // 5. ส่งสัญญาณไปบอก Navbar ให้เปลี่ยนรูปตามทันที
      window.dispatchEvent(new Event('userUpdated'));

      alert('อัปเดตรูปโปรไฟล์สำเร็จ!');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-sans pb-20 pt-32 selection:bg-emerald-200">
      <main className="max-w-3xl mx-auto px-6">
        
        <div className="flex items-center gap-4 mb-10">
          <Link href="/dashboard" className="p-3 bg-white rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-500 transition-all">
             <ArrowLeft size={20} />
          </Link>
          <div>
             <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Account Settings</p>
             <h1 className="text-3xl font-black text-slate-900 tracking-tighter">My Profile.</h1>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="bg-white rounded-[40px] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] overflow-hidden mb-8 relative"
        >
          <div className="h-40 bg-slate-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          </div>

          <div className="px-8 md:px-12 pb-12 relative">
            {/* Avatar Section */}
            <div className="relative -mt-20 mb-6 inline-block">
              <div className="w-36 h-36 rounded-[32px] bg-slate-100 border-8 border-white shadow-lg overflow-hidden flex items-center justify-center relative">
                {uploading ? (
                   <Loader2 className="animate-spin text-emerald-500" size={32} />
                ) : user.avatar_url ? (
                  <img src={user.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} className="w-full h-full object-cover bg-slate-50" />
                )}
              </div>
              
              {/* ซ่อน Input ไฟล์ไว้ */}
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={uploadAvatar} 
                className="hidden" 
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={uploading}
                className="absolute bottom-2 right-2 p-3 bg-slate-900 text-white rounded-2xl shadow-md border-4 border-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                <Camera size={16} />
              </button>
            </div>

            {/* Rest of Profile Content */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">{user.username}</h2>
                  <CheckCircle2 size={24} className="text-blue-500 fill-blue-50" />
                </div>
                <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-1.5 rounded-full">
                  <Shield size={14} className="text-emerald-600" />
                  <p className="text-emerald-700 font-bold uppercase tracking-widest text-[10px]">
                    {user.role} Member
                  </p>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-4 min-w-[200px]">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600">
                  <Wallet size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Balance</p>
                  <p className="text-xl font-black text-slate-900 tabular-nums">฿{wallet?.balance?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem icon={<UserIcon className="text-slate-400" />} label="Full Name" value={user.username || '-'} />
              <InfoItem icon={<Mail className="text-slate-400" />} label="Email Address" value={user.email || '-'} />
              <InfoItem icon={<Calendar className="text-slate-400" />} label="Joined Date" value={new Date(user.created_at || Date.now()).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })} />
              <InfoItem icon={<Settings className="text-slate-400" />} label="Account Type" value={user.role === 'owner' ? 'Seller Account' : 'Bidder Account'} />
            </div>

            <div className="h-px bg-slate-100 my-10" />

            <button 
              onClick={handleLogout}
              className="w-full py-5 bg-white border border-rose-100 text-rose-500 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-sm"
            >
              <LogOut size={18} />
              Sign Out Securely
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function InfoItem({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4 p-5 bg-white rounded-3xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.01)]">
      <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}