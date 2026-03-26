"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Gavel, Store, Package, 
  TrendingUp, Clock, LayoutDashboard, 
  ChevronRight, MessageCircle, CheckCircle2,
  AlertCircle, ArrowRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('wastebid_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] font-kanit">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#748D83]/20 border-t-[#748D83] rounded-full animate-spin"></div>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">กำลังเข้าสู่ระบบหลังบ้าน...</p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center font-kanit bg-[#FAFAFA]">
      <AlertCircle size={48} className="text-red-400 mb-4" />
      <h2 className="text-xl font-black text-[#3A4A43] mb-2">เข้าถึงไม่ได้</h2>
      <p className="text-gray-400 mb-6">กรุณาเข้าสู่ระบบก่อนใช้งาน Dashboard</p>
      <Link href="/auth/login">
        <button className="bg-[#3A4A43] text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest">ไปหน้า Login</button>
      </Link>
    </div>
  );

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-kanit pb-20">
      {/* 🛡️ Switch View based on Role */}
      {user.role === 'owner' ? (
        <OwnerDashboardView user={user} />
      ) : (
        <BidderDashboardView user={user} />
      )}
    </div>
  );
}

// ==========================================================
// 🏭 [VIEW] สำหรับ "ผู้ขาย" (Owner)
// ==========================================================
function OwnerDashboardView({ user }: { user: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchOwnerData = async () => {
      // ดึงของที่เราขาย + Join เพื่อดูคนประมูลล่าสุด (คนชนะ)
      const { data } = await supabase
        .from('waste_listings')
        .select(`
          *,
          bids (
            id,
            bid_amount,
            bidder_id,
            users!bidder_id (username)
          )
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      
      setItems(data || []);
      setFetching(false);
    };
    fetchOwnerData();
  }, [user.id]);

  // แยก Logic: กำลังขาย กับ จบแล้ว
  const activeItems = items.filter(i => i.status === 'open' && new Date(i.end_time) > new Date());
  const finishedItems = items.filter(i => i.status === 'closed' || new Date(i.end_time) <= new Date());

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-[#748D83] rounded-full"></div>
            <span className="text-[10px] font-black text-[#748D83] uppercase tracking-[0.3em]">Owner Mode</span>
          </div>
          <h1 className="text-4xl font-black text-[#3A4A43] tracking-tighter">การจัดการการขาย</h1>
          <p className="text-gray-400 mt-2 font-medium">จัดการรายการขยะและนัดรับสินค้ากับผู้ชนะ</p>
        </div>
        <Link href="/listings/create">
          <button className="bg-[#3A4A43] text-white px-8 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-[#748D83] transition-all flex items-center gap-3 shadow-xl shadow-gray-200 active:scale-95 group">
            <Plus size={18} className="group-hover:rotate-90 transition-transform" /> เพิ่มรายการขยะใหม่
          </button>
        </Link>
      </div>

      {/* --- 🟢 ส่วนที่ 1: รายการที่กำลังประมูลอยู่ --- */}
      <div className="mb-16">
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-8 flex items-center gap-2">
          <Clock size={16} className="text-[#748D83]" /> รายการที่เปิดประมูลอยู่ ({activeItems.length})
        </h2>
        {fetching ? (
            <div className="animate-pulse flex gap-6"><div className="w-full h-64 bg-gray-100 rounded-[2rem]"></div></div>
        ) : activeItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeItems.map(item => <AuctionCard key={item.id} item={item} isOwner />)}
          </div>
        ) : (
          <div className="py-12 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center text-gray-300">
             <Package size={40} className="mb-2 opacity-20" />
             <p className="text-sm font-bold">ยังไม่มีสินค้าที่กำลังประมูล</p>
          </div>
        )}
      </div>

      {/* --- 🏁 ส่วนที่ 2: รายการที่จบแล้ว (นัดรับ/แชท) --- */}
      <div>
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-8 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#3A4A43]" /> จบการประมูลแล้ว ({finishedItems.length})
        </h2>
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          {finishedItems.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F8F9F8] text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50">
                <tr>
                  <th className="p-8">สินค้า</th>
                  <th className="p-8 text-center">ราคาจบ</th>
                  <th className="p-8">ผู้ชนะการประมูล</th>
                  <th className="p-8 text-right">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {finishedItems.map(item => {
                  const winner = item.bids && item.bids.length > 0 ? item.bids[0] : null;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-8">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                              <img src={item.image_url} className="w-full h-full object-cover" />
                           </div>
                           <p className="font-black text-[#3A4A43] text-sm">{item.title}</p>
                        </div>
                      </td>
                      <td className="p-8 text-center">
                        <p className="font-black text-[#748D83]">฿{Number(item.current_price).toLocaleString()}</p>
                      </td>
                      <td className="p-8">
                        {winner ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-[#E8EDEB] rounded-full flex items-center justify-center text-[9px] font-bold text-[#3A4A43]">
                              {winner.users?.username?.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-xs font-bold text-gray-600">{winner.users?.username}</span>
                          </div>
                        ) : <span className="text-xs text-gray-300 italic">ไม่มีผู้ประมูล</span>}
                      </td>
                      <td className="p-8 text-right">
                        {winner ? (
                          <Link href={`/chat/${winner.bidder_id}`}>
                            <button className="bg-[#3A4A43] text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#748D83] transition-all flex items-center gap-2 ml-auto shadow-md">
                              <MessageCircle size={14} /> ติดต่อผู้ชนะ
                            </button>
                          </Link>
                        ) : (
                          <button disabled className="text-gray-300 text-[9px] font-bold uppercase tracking-widest">ลงขายใหม่</button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-20 text-center text-gray-300 font-bold uppercase tracking-widest text-xs">ยังไม่มีรายการที่จบการประมูล</div>
          )}
        </div>
      </div>
    </main>
  );
}

// ==========================================================
// 🛒 [VIEW] สำหรับ "ผู้ประมูล" (Bidder)
// ==========================================================
function BidderDashboardView({ user }: { user: any }) {
  const [marketItems, setMarketItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchMarket = async () => {
      const { data } = await supabase
        .from('waste_listings')
        .select('*')
        .eq('status', 'open')
        .neq('owner_id', user.id) // ไม่โชว์ของตัวเอง (ถ้ามี)
        .order('end_time', { ascending: true });
      setMarketItems(data || []);
    };
    fetchMarket();
  }, [user.id]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-[#748D83] rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-[#748D83] uppercase tracking-[0.3em]">Marketplace</span>
        </div>
        <h1 className="text-4xl font-black text-[#2D3A2E] tracking-tighter">ขยะรีไซเคิลรอบตัวคุณ</h1>
        <p className="text-gray-400 mt-2 font-medium">ค้นหาวัสดุที่คุณต้องการและเริ่มเสนอราคาแข่งขัน</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {marketItems.length > 0 ? (
          marketItems.map(item => <AuctionCard key={item.id} item={item} />)
        ) : (
          <div className="col-span-full py-20 bg-white rounded-[2.5rem] border border-gray-100 text-center">
            <p className="text-gray-400 font-bold uppercase tracking-widest">ยังไม่มีสินค้าเปิดประมูลในขณะนี้</p>
          </div>
        )}
      </div>
    </main>
  );
}

// ==========================================================
// 💳 [COMPONENT] การ์ดแสดงผลขยะ (Shared Card)
// ==========================================================
function AuctionCard({ item, isOwner = false }: { item: any, isOwner?: boolean }) {
  return (
    <motion.div whileHover={{ y: -5 }} className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
      <div className="aspect-[4/3] rounded-[2rem] overflow-hidden mb-6 bg-gray-50 relative">
        <img 
          src={item.image_url || 'https://images.unsplash.com/photo-1558610530-5896a2472648?q=80&w=800'} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black text-[#3A4A43] shadow-sm uppercase tracking-widest border border-white/50">
           {item.category}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-black text-[#2D3A2E] leading-tight truncate">{item.title}</h3>
        
        <div className="flex items-center justify-between py-4 border-y border-gray-50">
          <div>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">ราคาปัจจุบัน</p>
            <p className="text-xl font-black text-[#748D83]">฿{Number(item.current_price).toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1 flex items-center justify-end gap-1">
              <Clock size={10} /> {isOwner ? 'หมดเวลา' : 'เวลาที่เหลือ'}
            </p>
            <p className="text-xs font-bold text-[#3A4A43] uppercase">
              {new Date(item.end_time).toLocaleDateString('th-TH')}
            </p>
          </div>
        </div>

        <Link href={`/listings/${item.id}`} className="block">
          <button className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${isOwner ? 'bg-[#F8F9F8] text-[#3A4A43] hover:bg-[#3A4A43] hover:text-white' : 'bg-[#3A4A43] text-white hover:bg-[#748D83] shadow-lg shadow-gray-100'}`}>
            {isOwner ? 'จัดการ/ดูรายละเอียด' : 'เข้าร่วมประมูล'} <ArrowRight size={14} />
          </button>
        </Link>
      </div>
    </motion.div>
  );
}