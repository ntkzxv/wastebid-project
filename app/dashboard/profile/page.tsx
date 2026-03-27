"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User as UserIcon, Mail, Shield, 
  Calendar, LogOut, ArrowLeft, Wallet, 
  Settings, Camera, CheckCircle2 
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);

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

  if (!user) return null;

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-kanit pb-20 pt-32">
      <main className="max-w-2xl mx-auto px-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link href="/dashboard">
            <button className="p-3 bg-white rounded-full border border-gray-100 shadow-sm hover:bg-gray-50 text-gray-400 transition-all">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <h1 className="text-3xl font-black text-[#3A4A43] tracking-tighter uppercase">My Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden mb-8">
          {/* Top Decorative Banner */}
          <div className="h-32 bg-[#3A4A43] relative">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          </div>

          <div className="px-10 pb-10 relative">
            {/* Avatar Section */}
            <div className="relative -mt-16 mb-6 inline-block">
              <div className="w-32 h-32 rounded-[2.5rem] bg-gray-100 border-8 border-white shadow-2xl overflow-hidden">
                {user.avatar_url ? (
                  <img src={user.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300"><UserIcon size={48} /></div>
                )}
              </div>
              <div className="absolute bottom-1 right-1 p-2.5 bg-[#748D83] text-white rounded-2xl shadow-lg border-4 border-white">
                <Camera size={16} />
              </div>
            </div>

            {/* Name & Role */}
            <div className="mb-10">
              <div className="flex items-center gap-3">
                <h2 className="text-4xl font-black text-[#3A4A43] tracking-tighter">{user.username}</h2>
                <CheckCircle2 size={24} className="text-blue-500 fill-blue-50" />
              </div>
              <p className="text-[#748D83] font-black uppercase tracking-[0.2em] text-xs mt-2 bg-[#748D83]/10 inline-block px-4 py-1.5 rounded-full">
                {user.role} Member
              </p>
            </div>

            {/* Info Grid */}
            <div className="grid gap-6">
              <InfoItem icon={<Mail className="text-gray-400" />} label="Email Address" value={user.email || 'not-linked@wastebid.com'} />
              <InfoItem icon={<Shield className="text-gray-400" />} label="Account Status" value="Verified Account" />
              <InfoItem icon={<Wallet className="text-gray-400" />} label="Current Balance" value={`฿${wallet?.balance?.toLocaleString() || '0'}`} isMoney />
            </div>

            <div className="h-[1px] bg-gray-100 my-10" />

            {/* Logout Action (The only place to logout!) */}
            <button 
              onClick={handleLogout}
              className="w-full py-6 bg-red-50 text-red-500 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-100 active:scale-95 group"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              Log Out From Account
            </button>
          </div>
        </div>

        {/* Extra Settings Link */}
        <p className="text-center text-gray-300 text-[10px] font-black uppercase tracking-widest">
          WasteBid Security System • v1.0.4
        </p>
      </main>
    </div>
  );
}

// Sub-component for Info Items
function InfoItem({ icon, label, value, isMoney = false }: any) {
  return (
    <div className="flex items-center gap-5 p-5 bg-gray-50/50 rounded-2xl border border-gray-50">
      <div className="p-3 bg-white rounded-xl shadow-sm">{icon}</div>
      <div>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className={`font-bold ${isMoney ? 'text-[#748D83] text-xl font-black' : 'text-[#3A4A43]'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}