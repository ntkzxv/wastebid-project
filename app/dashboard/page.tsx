"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Gavel, Store, Package, 
  TrendingUp, Clock, LayoutDashboard, 
  ChevronRight, MessageCircle, CheckCircle2,
  AlertCircle, ArrowRight, Camera, User as UserIcon, Loader2,
  Wallet // 💳 เพิ่มไอคอน Wallet
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [balance, setBalance] = useState(0); // 💰 [NEW] State สำหรับยอดเงิน

  useEffect(() => {
    const savedUser = localStorage.getItem('wastebid_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchWallet(parsedUser.id); // 🚀 [NEW] ดึงยอดเงินทันทีที่โหลด User
    }
    setLoading(false);
  }, []);

  // 💰 [NEW] ฟังก์ชันดึงยอดเงินจำลอง
  const fetchWallet = async (userId: any) => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // ถ้ายังไม่มี Wallet ให้สร้างใหม่ (สำหรับ User ใหม่)
        const { data: newWallet } = await supabase
          .from('wallets')
          .insert([{ user_id: userId, balance: 0 }])
          .select()
          .single();
        if (newWallet) setBalance(newWallet.balance);
      } else if (data) {
        setBalance(data.balance);
      }
    } catch (err) {
      console.error("Wallet Fetch Error:", err);
    }
  };

  // 🚀 ฟังก์ชันอัปโหลดรูปโปรไฟล์ (Avatar) - โค้ดเดิมของมึง
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const newAvatarUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      const updatedUser = { ...user, avatar_url: newAvatarUrl };
      localStorage.setItem('wastebid_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      alert("📸 อัปเดตรูปโปรไฟล์สำเร็จ!");
    } catch (error: any) {
      console.error("Upload Error:", error);
      alert("ผิดพลาด: " + error.message);
    } finally {
      setUploading(false);
    }
  };

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
    <div className="bg-[#FAFAFA] min-h-screen font-kanit pb-20 pt-10">
      
      {/* 📸 Profile Header */}
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#748D83]/5 rounded-full -mr-16 -mt-16"></div>
          
          <div className="relative shrink-0">
            <div className="w-28 h-28 rounded-[2.5rem] overflow-hidden bg-gray-50 border-4 border-white shadow-xl flex items-center justify-center">
              {user.avatar_url ? (
                <img src={user.avatar_url} className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-300"><UserIcon size={48} /></div>
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 p-3 bg-[#3A4A43] text-white rounded-2xl cursor-pointer hover:bg-[#748D83] transition-all shadow-lg active:scale-90 border-2 border-white">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} className="hidden" />
            </label>
          </div>

          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h2 className="text-3xl font-black text-[#3A4A43] tracking-tighter">{user.username}</h2>
              <span className="px-4 py-1.5 bg-[#748D83]/10 text-[#748D83] text-[10px] font-black uppercase tracking-widest rounded-full border border-[#748D83]/20">
                {user.role}
              </span>
            </div>
            <p className="text-gray-400 text-sm font-medium">ยินดีต้อนรับกลับมา! จัดการข้อมูลส่วนตัวและการทำธุรกรรมของคุณได้ที่นี่</p>
          </div>
        </div>
      </div>

      {/* 💳 [NEW] Wallet Stats Card: ส่วนที่เพิ่มใหม่เพื่อให้กดเข้าหน้า Wallet ได้ */}
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <Link href="/dashboard/wallet">
          <motion.div 
            whileHover={{ y: -2, scale: 1.01 }}
            className="inline-flex items-center gap-6 bg-white p-6 pr-12 rounded-[2.5rem] border border-gray-100 shadow-sm hover:border-[#748D83]/30 transition-all cursor-pointer group"
          >
            <div className="w-14 h-14 bg-[#3A4A43] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#3A4A43]/10 group-hover:bg-[#748D83] transition-colors">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ยอดเงินในวอลเล็ต (จำลอง)</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-black text-[#748D83]">฿</span>
                <p className="text-3xl font-black text-[#3A4A43] tracking-tighter">{balance.toLocaleString()}</p>
              </div>
            </div>
            <div className="ml-6 p-2 bg-gray-50 rounded-full text-gray-300 group-hover:text-[#748D83] group-hover:bg-[#748D83]/5 transition-all">
              <ChevronRight size={20} />
            </div>
          </motion.div>
        </Link>
      </div>

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
// 🏭 [VIEW] สำหรับ "ผู้ขาย" (Owner) - โค้ดเดิมของมึง
// ==========================================================
function OwnerDashboardView({ user }: { user: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchOwnerData = async () => {
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

  const activeItems = items.filter(i => i.status === 'open' && new Date(i.end_time) > new Date());
  const finishedItems = items.filter(i => i.status === 'closed' || new Date(i.end_time) <= new Date());

  return (
    <main className="max-w-7xl mx-auto px-6 py-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-sm font-black text-[#748D83] uppercase tracking-[0.3em] mb-1">Owner Management</h2>
          <h1 className="text-4xl font-black text-[#3A4A43] tracking-tighter">การจัดการการขาย</h1>
        </div>
        <Link href="/listings/create">
          <button className="bg-[#3A4A43] text-white px-8 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-[#748D83] transition-all flex items-center gap-3 shadow-xl active:scale-95 group">
            <Plus size={18} className="group-hover:rotate-90 transition-transform" /> เพิ่มรายการขยะใหม่
          </button>
        </Link>
      </div>

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

      <div>
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-8 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#3A4A43]" /> จบการประมูลแล้ว ({finishedItems.length})
        </h2>
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          {finishedItems.length > 0 ? (
            <div className="overflow-x-auto">
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
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-8">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 shadow-sm">
                                <img src={item.image_urls?.[0]} className="w-full h-full object-cover" />
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
            </div>
          ) : (
            <div className="p-20 text-center text-gray-300 font-bold uppercase tracking-widest text-xs">ยังไม่มีรายการที่จบการประมูล</div>
          )}
        </div>
      </div>
    </main>
  );
}

// ==========================================================
// 🛒 [VIEW] สำหรับ "ผู้ประมูล" (Bidder) - โค้ดเดิมของมึง
// ==========================================================
function BidderDashboardView({ user }: { user: any }) {
  const [marketItems, setMarketItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchMarket = async () => {
      const { data } = await supabase
        .from('waste_listings')
        .select('*')
        .eq('status', 'open')
        .neq('owner_id', user.id)
        .order('end_time', { ascending: true });
      setMarketItems(data || []);
    };
    fetchMarket();
  }, [user.id]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-5">
      <div className="mb-12">
        <h2 className="text-sm font-black text-[#748D83] uppercase tracking-[0.3em] mb-1">Recycle Marketplace</h2>
        <h1 className="text-4xl font-black text-[#2D3A2E] tracking-tighter">ขยะรีไซเคิลรอบตัวคุณ</h1>
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
// 💳 [COMPONENT] การ์ดแสดงผลขยะ - โค้ดเดิมของมึง
// ==========================================================
function AuctionCard({ item, isOwner = false }: { item: any, isOwner?: boolean }) {
  return (
    <motion.div whileHover={{ y: -5 }} className="bg-white rounded-[3rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
      <div className="aspect-[4/3] rounded-[2.2rem] overflow-hidden mb-6 bg-gray-50 relative">
        <img 
          src={item.image_urls?.[0] || 'https://images.unsplash.com/photo-1558610530-5896a2472648?q=80&w=800'} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
        />
        <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black text-[#3A4A43] shadow-sm uppercase tracking-widest border border-white/50">
           {item.category}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-black text-[#2D3A2E] leading-tight truncate px-2">{item.title}</h3>
        
        <div className="flex items-center justify-between py-5 border-y border-gray-50 px-2">
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">ราคาปัจจุบัน</p>
            <p className="text-2xl font-black text-[#748D83]">฿{Number(item.current_price).toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 flex items-center justify-end gap-1">
              <Clock size={12} /> {isOwner ? 'ปิดประมูล' : 'เวลาที่เหลือ'}
            </p>
            <p className="text-xs font-bold text-[#3A4A43] uppercase bg-gray-50 px-3 py-1 rounded-lg">
              {new Date(item.end_time).toLocaleDateString('th-TH')}
            </p>
          </div>
        </div>

        <Link href={`/listings/${item.id}`} className="block">
          <button className={`w-full py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${isOwner ? 'bg-[#F8F9F8] text-[#3A4A43] hover:bg-[#3A4A43] hover:text-white' : 'bg-[#3A4A43] text-white hover:bg-[#748D83] shadow-lg shadow-gray-200'}`}>
            {isOwner ? 'จัดการรายการนี้' : 'เข้าร่วมประมูล'} <ArrowRight size={16} />
          </button>
        </Link>
      </div>
    </motion.div>
  );
}