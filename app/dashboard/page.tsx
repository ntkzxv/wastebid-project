"use client";
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, TrendingUp, ArrowUpRight, Filter, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

// รูปภาพสำรองกรณีใน DB ไม่มีรูป
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1558610530-5896a2472648?q=80&w=400";

export default function DashboardPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 1. ดึงข้อมูลรายการขยะจาก Database
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const { data, error } = await supabase
          .from('waste_listings')
          .select('*')
          .eq('status', 'open') // เอาเฉพาะที่กำลังเปิดประมูล
          .gt('end_time', new Date().toISOString()) // เอาเฉพาะที่ยังไม่หมดเวลา
          .order('created_at', { ascending: false });

        if (error) throw error;
        setItems(data || []);
      } catch (err) {
        console.error("Error fetching listings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // 2. ตัวนับเวลาถอยหลัง (อัปเดตทุก 1 วินาที)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ฟังก์ชันคำนวณเวลาที่เหลือให้ออกมาเป็นฟอร์แมต 00:00:00
  const getTimeLeft = (endTimeString: string) => {
    const end = new Date(endTimeString).getTime();
    const now = currentTime.getTime();
    const distance = end - now;

    if (distance <= 0) return "หมดเวลา";

    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-kanit">
      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* --- Header & Search Section --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-[#2D3A2E] tracking-tight">ยินดีต้อนรับสู่ WasteBid</h1>
            <p className="text-gray-400 text-sm mt-1 font-medium uppercase tracking-wider">ค้นหาและร่วมประมูลวัสดุรีไซเคิลจากทั่วประเทศ</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#748D83] transition-colors" />
              <input 
                type="text" 
                placeholder="ค้นหาขยะ, วัสดุ, พิกัด..." 
                className="bg-white border border-gray-100 rounded-2xl pl-11 pr-6 py-3.5 text-xs w-[280px] outline-none shadow-sm focus:border-[#748D83]/20 focus:ring-4 focus:ring-[#748D83]/5 transition-all"
              />
            </div>
            <button className="p-3.5 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-[#748D83] transition-all shadow-sm">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* --- Highlight Bento Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="md:col-span-2 bg-[#E8EDEB] rounded-[2.5rem] p-10 relative overflow-hidden flex flex-col justify-center border border-white">
            <div className="relative z-10">
              <span className="text-[10px] font-bold text-[#748D83] uppercase tracking-[0.2em] mb-4 block">Recommended for you</span>
              <h2 className="text-4xl font-bold text-[#3A4A43] leading-tight mb-8">ประมูลเศษโลหะ <br/>พิกัดใกล้ตัวคุณ</h2>
              <button className="bg-[#3A4A43] text-white px-8 py-4 rounded-2xl font-bold text-xs flex items-center gap-3 hover:scale-105 transition-transform shadow-lg shadow-gray-200">
                ดูแผนที่ <MapPin size={16} />
              </button>
            </div>
            <TrendingUp size={200} className="absolute -bottom-10 -right-10 text-[#748D83]/5 rotate-[-15deg]" />
          </div>

          <div className="bg-[#3A4A43] rounded-[2.5rem] p-10 text-white flex flex-col justify-between shadow-xl shadow-gray-200">
            <div className="p-3 bg-white/10 rounded-2xl w-fit border border-white/10">
              <ArrowUpRight size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2">ระบบความปลอดภัย</p>
              <p className="text-xl font-medium leading-relaxed">ผู้ซื้อและผู้ขายผ่านการ <br/> <span className="text-[#E8EDEB] font-bold underline decoration-[#748D83]">Verified 100%</span></p>
            </div>
          </div>
        </div>

        {/* --- List Section --- */}
        <div className="flex items-center justify-between mb-10 pb-4 border-b border-gray-100">
          <h3 className="text-xl font-bold text-[#2D3A2E] flex items-center gap-2">
            <TrendingUp size={20} className="text-[#748D83]" />
            กำลังประมูล (Live)
          </h3>
          <button className="text-[11px] font-bold text-gray-400 hover:text-[#748D83] uppercase tracking-widest transition-colors">ดูทั้งหมด</button>
        </div>

        {loading ? (
          // หน้าต่างโหลดข้อมูล (Loading State) ให้ UI ดูไม่แหว่ง
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="text-xs font-bold uppercase tracking-widest">กำลังโหลดรายการประมูล...</p>
          </div>
        ) : items.length === 0 ? (
          // กรณีไม่มีข้อมูลใน DB
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100">
            <p className="text-gray-400 font-medium">ยังไม่มีรายการประมูลในขณะนี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {items.map((item) => (
              <motion.div 
                key={item.id}
                whileHover={{ y: -8 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white border border-gray-100 shadow-sm group-hover:shadow-2xl transition-all duration-500">
                  {/* เปลี่ยนมาใช้ image_url จาก DB ถ้าไม่มีให้ใช้รูป Default */}
                  <img src={item.image_url || DEFAULT_IMAGE} alt={item.title} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700" />
                  
                  {/* Timer Badge (ดึงเวลาจริง) */}
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/50 shadow-sm">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[11px] font-bold text-[#2D3A2E]">
                      {getTimeLeft(item.end_time)}
                    </span>
                  </div>

                  <div className="absolute top-6 right-6 bg-[#3A4A43]/80 backdrop-blur-md px-3 py-1.5 rounded-xl">
                    <span className="text-[9px] font-bold text-white uppercase tracking-widest">
                      {item.category || 'ทั่วไป'}
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-[#2D3A2E]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                    <button className="w-full bg-white text-[#2D3A2E] py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl">เสนอราคาประมูล</button>
                  </div>
                </div>

                <div className="mt-6 px-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-lg text-[#2D3A2E] leading-snug group-hover:text-[#748D83] transition-colors line-clamp-1">{item.title}</h4>
                      <p className="flex items-center gap-1 text-[11px] text-gray-400 font-bold mt-2 uppercase tracking-wide">
                        <MapPin size={12} /> {item.location || 'ไม่ระบุพิกัด'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">ราคาปัจจุบัน</p>
                      {/* ดึงราคาปัจจุบันจาก DB */}
                      <p className="text-xl font-bold text-[#748D83]">฿{Number(item.current_price).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}