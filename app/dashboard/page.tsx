"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Gavel, Store, Package, 
  TrendingUp, Clock, LayoutDashboard, 
  ChevronRight, MessageCircle, CheckCircle2,
  AlertCircle, ArrowRight, Camera, User as UserIcon, Loader2,
  Wallet, MapPin, Search // ✅ เช็คแล้ว Import ครบทุกตัว
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
        <p className="text-gray-400 font-black uppercase tracking-widest text-xs">กำลังโหลดข้อมูล...</p>
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
    <div className="bg-[#FAFAFA] min-h-screen font-kanit pb-20 pt-32"> 
      {user.role === 'owner' ? (
        <OwnerDashboardView user={user} />
      ) : (
        <BidderDashboardView user={user} />
      )}
    </div>
  );
}

// ==========================================================
// 🏭 [VIEW] สำหรับ "ผู้ขาย" (Owner) - สไตล์ AuctionHouse
// ==========================================================
function OwnerDashboardView({ user }: { user: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchOwnerData = async () => {
      if (!user?.id) return;
      setFetching(true);
      const { data } = await supabase
        .from('waste_listings')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      
      setItems(data || []);
      setFetching(false);
    };
    fetchOwnerData();
  }, [user.id]);

  const filteredItems = items.filter(item => {
    const isEnded = item.status === 'closed' || new Date(item.end_time) <= new Date();
    if (activeTab === 'active') return !isEnded;
    if (activeTab === 'ended') return isEnded;
    return true;
  });

  const totalRevenue = items.reduce((acc, curr) => curr.status === 'closed' ? acc + Number(curr.current_price) : acc, 0);
  const activeCount = items.filter(i => i.status === 'open' && new Date(i.end_time) > new Date()).length;

  return (
    <main className="max-w-7xl mx-auto px-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-black text-[#3A4A43] tracking-tighter mb-2">การจัดการการขาย</h1>
          <p className="text-gray-400 font-medium text-sm">จัดการแคตตาล็อกขยะรีไซเคิลและติดตามยอดขายของคุณ</p>
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
          <div className="bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm flex-1 lg:flex-none">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">รายได้สะสม</p>
            <p className="text-xl font-black text-[#748D83]">฿{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm flex-1 lg:flex-none">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">กำลังประมูล</p>
            <p className="text-xl font-black text-[#3A4A43]">{activeCount} รายการ</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-full md:w-auto overflow-x-auto">
          <TabBtn label="ทั้งหมด" active={activeTab === 'all'} onClick={() => setActiveTab('all')} count={items.length} />
          <TabBtn label="กำลังประมูล" active={activeTab === 'active'} onClick={() => setActiveTab('active')} count={activeCount} />
          <TabBtn label="จบแล้ว" active={activeTab === 'ended'} onClick={() => setActiveTab('ended')} count={items.length - activeCount} />
        </div>
        <Link href="/listings/create" className="w-full md:w-auto">
          <button className="w-full bg-[#3A4A43] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#748D83] transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#3A4A43]/10">
            <Plus size={18} /> ลงขายสินค้าใหม่
          </button>
        </Link>
      </div>

      {fetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <div key={i} className="h-[400px] bg-white rounded-[2.5rem] animate-pulse border border-gray-100" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredItems.map(item => <OwnerAuctionCard key={item.id} item={item} />)}
        </div>
      )}
    </main>
  );
}

// ==========================================================
// 🛒 [VIEW] สำหรับ "ผู้ประมูล" (Bidder) - สไตล์พรีเมียม
// ==========================================================
function BidderDashboardView({ user }: { user: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState('marketplace');

  useEffect(() => {
    const fetchMarket = async () => {
      setFetching(true);
      let query = supabase.from('waste_listings').select('*');

      if (activeTab === 'marketplace') {
        query = query.eq('status', 'open').neq('owner_id', user.id);
      } else {
        // รายการที่จบแล้ว (Won/Closed)
        query = query.eq('status', 'closed');
      }

      const { data } = await query.order('end_time', { ascending: true });
      setItems(data || []);
      setFetching(false);
    };
    fetchMarket();
  }, [user.id, activeTab]);

  return (
    <main className="max-w-7xl mx-auto px-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
        <div>
          <h2 className="text-sm font-black text-[#748D83] uppercase tracking-[0.3em] mb-2">Recycle Marketplace</h2>
          <h1 className="text-4xl font-black text-[#3A4A43] tracking-tighter">ขยะรีไซเคิลรอบตัวคุณ</h1>
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
          <div className="bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm flex-1 lg:flex-none">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ประมูลไปแล้ว</p>
            <p className="text-xl font-black text-[#3A4A43]">0 ครั้ง</p>
          </div>
          <div className="bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm flex-1 lg:flex-none">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ชนะแล้ว</p>
            <p className="text-xl font-black text-[#748D83]">0 รายการ</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-full md:w-auto">
          <TabBtn label="สำรวจตลาด" active={activeTab === 'marketplace'} onClick={() => setActiveTab('marketplace')} />
          <TabBtn label="ประมูลของฉัน" active={activeTab === 'my_bids'} onClick={() => setActiveTab('my_bids')} />
        </div>
        <div className="relative w-full md:w-64">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
           <input type="text" placeholder="ค้นหา..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold outline-none" />
        </div>
      </div>

      {fetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <div key={i} className="h-[400px] bg-white rounded-[2.5rem] animate-pulse border border-gray-100" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {items.map(item => <AuctionCard key={item.id} item={item} />)}
        </div>
      )}
    </main>
  );
}

// --- SUB-COMPONENTS (กูรวมมาให้ที่นี่แล้ว ไม่ Error แน่นอน) ---

function TabBtn({ label, active, onClick, count }: any) {
  return (
    <button onClick={onClick} className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 ${active ? 'bg-[#3A4A43] text-white shadow-md' : 'text-gray-400 hover:text-[#3A4A43]'}`}>
      {label} {count !== undefined && <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${active ? 'bg-white/20' : 'bg-gray-100'}`}>{count}</span>}
    </button>
  );
}

function OwnerAuctionCard({ item }: { item: any }) {
  const isEnded = item.status === 'closed' || new Date(item.end_time) <= new Date();
  return (
    <motion.div whileHover={{ y: -8 }} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all overflow-hidden group">
      <div className="relative aspect-[16/11] overflow-hidden bg-gray-100">
        <img src={item.image_urls?.[0]} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isEnded ? 'grayscale-[0.5]' : ''}`} />
        <div className={`absolute top-6 left-6 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm border ${isEnded ? 'bg-gray-900/80 text-white border-white/20' : 'bg-white/90 text-[#3A4A43] border-white'}`}>
          {isEnded ? 'จบการประมูลแล้ว' : 'กำลังเปิดประมูล'}
        </div>
      </div>
      <div className="p-8">
        <div className="flex items-center gap-2 mb-3 text-[9px] font-black text-[#748D83] uppercase tracking-[0.2em]">
           {item.category} <span className="text-gray-200 ml-1">•</span> <MapPin size={10} className="ml-1" /> {item.location || 'Bangkok'}
        </div>
        <h3 className="text-xl font-black text-[#3A4A43] leading-tight mb-6 line-clamp-1">{item.title}</h3>
        <div className="flex items-center justify-between py-5 border-t border-gray-50">
          <div><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">ราคาปัจจุบัน</p><p className="text-2xl font-black text-[#3A4A43]">฿{Number(item.current_price).toLocaleString()}</p></div>
          <div className="text-right"><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{isEnded ? 'จบเมื่อ' : 'สิ้นสุดใน'}</p><p className="text-xs font-bold text-[#748D83] bg-[#748D83]/5 px-3 py-1 rounded-lg">{new Date(item.end_time).toLocaleDateString('th-TH')}</p></div>
        </div>
        <Link href={`/listings/${item.id}`} className="block mt-2">
          <button className={`w-full py-4 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isEnded ? 'bg-gray-50 text-gray-400 hover:bg-gray-100' : 'bg-[#3A4A43] text-white hover:bg-[#748D83] shadow-lg'}`}>
            {isEnded ? 'ดูรายละเอียด' : 'จัดการรายการ'} <ArrowRight size={16} />
          </button>
        </Link>
      </div>
    </motion.div>
  );
}

function AuctionCard({ item }: { item: any }) {
  return (
    <motion.div whileHover={{ y: -8 }} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all overflow-hidden group">
      <div className="relative aspect-[16/11] overflow-hidden bg-gray-100">
        <img src={item.image_urls?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black text-[#3A4A43] shadow-sm uppercase tracking-widest border border-white/50">{item.category}</div>
      </div>
      <div className="p-8">
        <div className="flex items-center gap-2 mb-3 text-[9px] font-black text-gray-400 uppercase tracking-widest"><MapPin size={10} className="text-[#748D83]" /> {item.location || 'Bangkok'}</div>
        <h3 className="text-xl font-black text-[#3A4A43] leading-tight mb-6 line-clamp-1">{item.title}</h3>
        <div className="flex items-center justify-between py-5 border-t border-gray-50">
          <div><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">ราคาปัจจุบัน</p><p className="text-2xl font-black text-[#748D83]">฿{Number(item.current_price).toLocaleString()}</p></div>
          <div className="text-right"><p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 flex items-center justify-end gap-1"><Clock size={12} /> สิ้นสุดใน</p><p className="text-xs font-bold text-[#3A4A43] bg-gray-50 px-3 py-1 rounded-lg">{new Date(item.end_time).toLocaleDateString('th-TH')}</p></div>
        </div>
        <Link href={`/listings/${item.id}`} className="block mt-4"><button className="w-full py-4 bg-[#3A4A43] text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-[#748D83] shadow-lg flex items-center justify-center gap-2">เข้าร่วมประมูล <ArrowRight size={16} /></button></Link>
      </div>
    </motion.div>
  );
}