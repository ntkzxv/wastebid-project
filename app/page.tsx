"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight, ShieldCheck, TrendingUp, 
  Clock, MapPin, Leaf, ChevronRight 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function GuestLandingPage() {
  const [liveItems, setLiveItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveAuctions();
  }, []);

  const fetchLiveAuctions = async () => {
    // ดึงข้อมูลรายการประมูลที่ยังเปิดอยู่ 6 รายการล่าสุด
    const { data } = await supabase
      .from('waste_listings')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(6);
    setLiveItems(data || []);
    setLoading(false);
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-kanit">
      
      {/* 🚀 Hero Section (เริ่มที่ pt-48 เพื่อหลบ Navbar ตัวบน) */}
      <section className="pt-48 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#748D83]/10 rounded-full text-[#748D83] text-[10px] font-black uppercase tracking-[0.2em]">
              <TrendingUp size={14} /> The Future of Waste Management
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-[#3A4A43] leading-[1.05] tracking-tighter">
              เปลี่ยนขยะในมือ <br /> 
              <span className="text-[#748D83]">ให้เป็นเงินสด</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl font-medium max-w-lg leading-relaxed">
              แพลตฟอร์มประมูลขยะรีไซเคิลที่ปลอดภัยและโปร่งใสที่สุด เชื่อมต่อผู้ขายขยะกับโรงงานรีไซเคิลโดยตรงเพื่อโลกที่ยั่งยืน
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5">
              <Link href="/auth/register">
                <button className="px-10 py-5 bg-[#3A4A43] text-white rounded-[1.8rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#748D83] transition-all shadow-2xl shadow-[#3A4A43]/20 group active:scale-95">
                  เริ่มประมูลเลย <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              
              <div className="flex items-center gap-4 px-2">
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-sm">
                      <img src={`https://i.pravatar.cc/100?img=${i+15}`} alt="user" />
                    </div>
                  ))}
                </div>
                <div className="text-xs font-bold text-gray-400">
                  <p className="text-[#3A4A43] font-black">1,200+ Users</p>
                  <p className="uppercase tracking-tighter">ใช้งานอยู่ขณะนี้</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Hero Image (Ref Style: eauction.club) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[4rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(58,74,67,0.2)] border-[12px] border-white">
              <img 
                src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=1200" 
                alt="Recycle" 
                className="w-full h-[550px] object-cover" 
              />
            </div>
            
            {/* Floating Badge */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute -bottom-8 -left-8 bg-white p-6 rounded-[2.5rem] shadow-2xl z-20 border border-gray-100 flex items-center gap-4"
            >
              <div className="bg-green-50 p-4 rounded-2xl text-green-600">
                <ShieldCheck size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ระบบความปลอดภัย</p>
                <p className="font-black text-[#3A4A43] text-lg leading-tight uppercase">Escrow <br />Verified</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 📊 Stats Section */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto bg-white p-12 rounded-[3.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-50 grid grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { label: 'ยอดประมูลสะสม', value: '฿2.5M+', color: 'text-[#3A4A43]' },
            { label: 'ขยะรีไซเคิลแล้ว', value: '450 Tons', color: 'text-[#748D83]' },
            { label: 'รายการประมูล', value: '12,000+', color: 'text-[#3A4A43]' },
            { label: 'ความพึงพอใจ', value: '99%', color: 'text-[#748D83]' },
          ].map((stat, i) => (
            <div key={i} className="text-center space-y-1">
              <p className={`${stat.color} text-4xl font-black tracking-tighter`}>{stat.value}</p>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🔥 Live Auctions Grid */}
      <section id="live-auctions" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Live Auctions</span>
              </div>
              <h3 className="text-5xl font-black text-[#3A4A43] tracking-tighter">รายการประมูลล่าสุด</h3>
            </div>
            <Link href="/auth/register" className="group flex items-center gap-3 px-6 py-3 bg-gray-50 rounded-2xl text-sm font-black text-[#3A4A43] hover:bg-[#3A4A43] hover:text-white transition-all">
              ดูทั้งหมด <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[500px] bg-gray-100 rounded-[3rem] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {liveItems.map(item => (
                <AuctionCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 🦶 Footer */}
      <footer className="bg-[#3A4A43] pt-24 pb-12 px-6 text-white rounded-t-[5rem]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 justify-between items-center gap-12">
          <div className="text-center md:text-left space-y-6">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="p-2 bg-[#748D83] rounded-xl"><Leaf size={24} /></div>
              <span className="text-3xl font-black tracking-tighter uppercase">WasteBid</span>
            </div>
            <p className="text-white/40 text-sm max-w-sm leading-relaxed">
              เราคือตัวกลางที่ทำให้ขยะของคุณมีมูลค่า และช่วยลดผลกระทบต่อสิ่งแวดล้อมอย่างยั่งยืน
            </p>
          </div>
          <div className="flex flex-col md:items-end gap-6 text-center md:text-right">
            <div className="flex justify-center md:justify-end gap-10 text-[10px] font-black uppercase tracking-widest text-white/60">
              <Link href="#" className="hover:text-[#748D83]">Privacy Policy</Link>
              <Link href="#" className="hover:text-[#748D83]">Terms of Service</Link>
              <Link href="#" className="hover:text-[#748D83]">Contact Us</Link>
            </div>
            <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
              © 2026 WASTE BID PLATFORM. DESIGNED FOR THE FUTURE.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}

// 📦 Small Component: Auction Card
function AuctionCard({ item }: { item: any }) {
  return (
    <motion.div 
      whileHover={{ y: -12 }} 
      className="bg-white rounded-[3rem] p-7 border border-gray-100 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all group"
    >
      <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden mb-7 bg-gray-50 relative">
        <img 
          src={item.image_urls?.[0] || 'https://via.placeholder.com/400'} 
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black text-[#3A4A43] uppercase tracking-widest border border-white/50 shadow-sm">
           {item.category}
        </div>
      </div>
      
      <div className="space-y-5 px-1">
        <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
           <MapPin size={14} className="text-[#748D83]" /> {item.location || 'Bangkok, Thailand'}
        </div>
        <h3 className="text-2xl font-black text-[#3A4A43] leading-tight truncate">{item.title}</h3>
        
        <div className="flex items-center justify-between py-5 border-y border-gray-50">
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">ราคาปัจจุบัน</p>
            <p className="text-2xl font-black text-[#748D83]">฿{Number(item.current_price).toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 flex items-center justify-end gap-1 text-right">
              <Clock size={12} /> สิ้นสุด
            </p>
            <p className="text-xs font-black text-[#3A4A43] uppercase bg-gray-50 px-3 py-1 rounded-lg">
              {new Date(item.end_time).toLocaleDateString('th-TH')}
            </p>
          </div>
        </div>

        <Link href="/auth/register">
          <button className="w-full py-5 bg-[#3A4A43] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#748D83] transition-all shadow-lg shadow-[#3A4A43]/10">
            ดูรายละเอียดและประมูล
          </button>
        </Link>
      </div>
    </motion.div>
  );
}