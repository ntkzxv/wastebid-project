"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Clock, AlertCircle, ArrowRight, MapPin, Search, TrendingUp, Activity, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('wastebid_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center font-sans">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Workspace</p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center font-sans px-6">
      <div className="w-full max-w-md rounded-[40px] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-12 text-center space-y-6">
        <AlertCircle size={48} className="text-rose-400 mx-auto" />
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500 font-medium">Please sign in to view your dashboard.</p>
        </div>
        <Link href="/auth/login" className="inline-flex justify-center w-full py-4 rounded-2xl text-sm font-bold text-white bg-slate-950 hover:bg-emerald-600 transition-colors shadow-lg">
          Sign In Now
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-32 pt-32 selection:bg-emerald-200">
      <div className="relative z-10">
        {user.role === 'owner' ? <OwnerDashboardView user={user} /> : <BidderDashboardView user={user} />}
      </div>
    </div>
  );
}

// ==========================================================
// 🏭 [VIEW] สำหรับ "ผู้ขาย" (Owner)
// ==========================================================
function OwnerDashboardView({ user }: { user: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchOwnerData = async () => {
      if (!user?.id) return;
      setFetching(true);
      const { data } = await supabase.from('waste_listings').select('*').eq('owner_id', user.id).order('created_at', { ascending: false });
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

  // 🔥 แก้ไข Logic คำนวณรายได้ตรงนี้ 🔥
  const totalRevenue = items.reduce((acc, curr) => {
    const isEnded = curr.status === 'closed' || new Date(curr.end_time) <= new Date();
    // จะนับเป็นรายได้ก็ต่อเมื่อ "หมดเวลาประมูลแล้ว" และ "มีผู้ชนะประมูล (current_bidder_id ไม่ว่าง)"
    const hasWinner = curr.current_bidder_id != null; 
    
    if (isEnded && hasWinner) {
        return acc + Number(curr.current_price);
    }
    return acc;
  }, 0);

  const activeCount = items.filter(i => i.status === 'open' && new Date(i.end_time) > new Date()).length;

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 bg-slate-950 rounded-[40px] p-10 text-white flex flex-col justify-between relative overflow-hidden shadow-xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
           <div className="relative z-10">
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">Seller Workspace</p>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">Welcome back, {user.username}</h1>
              <p className="text-slate-400 text-lg max-w-md">Manage your material listings and track your total generated revenue.</p>
           </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex-1 flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-2 text-slate-500"><TrendingUp size={18} /> <span className="text-xs font-bold uppercase tracking-widest">Total Revenue</span></div>
             <p className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter">฿{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-emerald-50 rounded-[32px] p-8 border border-emerald-100 flex-1 flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-2 text-emerald-600"><Activity size={18} /> <span className="text-xs font-bold uppercase tracking-widest">Active Listings</span></div>
             <p className="text-4xl font-black text-emerald-700 tabular-nums tracking-tighter">{activeCount}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-10">
        <div className="flex p-1.5 rounded-full bg-slate-100/80 border border-slate-200/50 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <TabBtn label="All Items" active={activeTab === 'all'} onClick={() => setActiveTab('all')} count={items.length} />
          <TabBtn label="Live Now" active={activeTab === 'active'} onClick={() => setActiveTab('active')} count={activeCount} />
          <TabBtn label="Completed" active={activeTab === 'ended'} onClick={() => setActiveTab('ended')} count={items.length - activeCount} />
        </div>
        <Link href="/listings/create" className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full text-sm font-bold text-white bg-emerald-600 hover:bg-slate-950 transition-colors shadow-lg shadow-emerald-600/20 shrink-0">
          <Plus size={18} /> Create New Listing
        </Link>
      </div>

      {fetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => <div key={i} className="h-[400px] rounded-[32px] bg-slate-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => <OwnerAuctionCard key={item.id} item={item} />)}
        </div>
      )}
    </main>
  );
}

// ==========================================================
// 🛒 [VIEW] สำหรับ "ผู้ประมูล" (Bidder)
// ==========================================================
function BidderDashboardView({ user }: { user: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState('marketplace');
  const [searchQuery, setSearchQuery] = useState('');
  const [bidActivityCount, setBidActivityCount] = useState(0);
  const [wonCount, setWonCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const loadStats = async () => {
      const uid = user.id;
      const [bidsRes, winsRes] = await Promise.all([
        supabase.from('bid_logs').select('*', { count: 'exact', head: true }).eq('user_id', uid),
        supabase.from('waste_listings').select('*', { count: 'exact', head: true }).eq('status', 'closed').eq('current_bidder_id', uid),
      ]);
      if (cancelled) return;
      setBidActivityCount(bidsRes.count ?? 0);
      setWonCount(winsRes.count ?? 0);
    };
    loadStats();
    return () => { cancelled = true; };
  }, [user.id]);

  useEffect(() => {
    let cancelled = false;
    const fetchMarket = async () => {
      setFetching(true);
      try {
        if (activeTab === 'marketplace') {
          const { data } = await supabase.from('waste_listings').select('*').eq('status', 'open').neq('owner_id', user.id).order('end_time', { ascending: true });
          if (!cancelled) setItems(data || []);
        } else {
          const { data: logs } = await supabase.from('bid_logs').select('listing_id').eq('user_id', user.id);
          if (cancelled) return;
          const ids = [...new Set((logs || []).map((r: { listing_id: number }) => r.listing_id))];
          if (ids.length === 0) { setItems([]); return; }
          const { data } = await supabase.from('waste_listings').select('*').in('id', ids).order('end_time', { ascending: false });
          if (!cancelled) setItems(data || []);
        }
      } finally {
        if (!cancelled) setFetching(false);
      }
    };
    fetchMarket();
    return () => { cancelled = true; };
  }, [user.id, activeTab]);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const displayItems = normalizedSearch.length === 0 ? items : items.filter((item) => {
    return (item.title || '').toLowerCase().includes(normalizedSearch) || (item.location || '').toLowerCase().includes(normalizedSearch) || (item.category || '').toLowerCase().includes(normalizedSearch);
  });

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 bg-slate-900 rounded-[40px] p-10 text-white flex flex-col justify-between relative overflow-hidden shadow-xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
           <div className="relative z-10">
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">Bidder Portal</p>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">Discover Materials</h1>
              <p className="text-slate-400 text-lg max-w-md">Explore available resources and track your ongoing auction activities.</p>
           </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex-1 flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-2 text-slate-500"><Activity size={18} /> <span className="text-xs font-bold uppercase tracking-widest">Total Bids Placed</span></div>
             <p className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter">{bidActivityCount.toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 rounded-[32px] p-8 border border-blue-100 flex-1 flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-2 text-blue-600"><Package size={18} /> <span className="text-xs font-bold uppercase tracking-widest">Auctions Won</span></div>
             <p className="text-4xl font-black text-blue-700 tabular-nums tracking-tighter">{wonCount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-10">
        <div className="flex p-1.5 rounded-full bg-slate-100/80 border border-slate-200/50 w-full md:w-auto overflow-x-auto no-scrollbar">
          <TabBtn label="Explore Market" active={activeTab === 'marketplace'} onClick={() => setActiveTab('marketplace')} />
          <TabBtn label="My Bids" active={activeTab === 'my_bids'} onClick={() => setActiveTab('my_bids')} />
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search materials or locations..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition-all shadow-sm" />
        </div>
      </div>

      {fetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => <div key={i} className="h-[400px] rounded-[32px] bg-slate-100 animate-pulse" />)}
        </div>
      ) : displayItems.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-[40px] bg-white border border-slate-100 shadow-sm">
          <Package size={48} className="text-slate-300 mx-auto mb-4" />
          <p className="text-xl font-bold text-slate-900 mb-2">No items found</p>
          <p className="text-slate-500 font-medium">Try adjusting your search criteria or explore the market later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayItems.map((item) => <AuctionCard key={item.id} item={item} />)}
        </div>
      )}
    </main>
  );
}

// ==========================================================
// 🎨 Shared Components
// ==========================================================
function TabBtn({ label, active, onClick, count }: { label: string; active: boolean; onClick: () => void; count?: number; }) {
  return (
    <button onClick={onClick} className={`relative px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 ${active ? 'text-white' : 'text-slate-500 hover:text-slate-900'}`}>
      {active && <motion.div layoutId="dashboard-tab" className="absolute inset-0 bg-slate-950 rounded-full -z-10" transition={{ type: "spring", stiffness: 300, damping: 25 }} />}
      <span className="relative z-10">{label}</span>
      {count !== undefined && <span className={`relative z-10 tabular-nums text-[10px] px-2 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>{count}</span>}
    </button>
  );
}

function OwnerAuctionCard({ item }: { item: any }) {
  const isEnded = item.status === 'closed' || new Date(item.end_time) <= new Date();
  return (
    <article className="rounded-[32px] bg-white border border-slate-100 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all overflow-hidden flex flex-col group p-3">
      <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden bg-slate-100">
        <img src={item.image_urls?.[0]} alt="" className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${isEnded ? 'opacity-60 grayscale' : ''}`} />
        <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md ${isEnded ? 'bg-slate-900/80 text-white' : 'bg-white/90 text-emerald-600 shadow-sm'}`}>
          {isEnded ? 'Ended' : 'Live Now'}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1 gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            <span>{item.category}</span> &bull; <span><MapPin size={12} className="inline mr-1" />{item.location}</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 leading-tight line-clamp-2 group-hover:text-emerald-600 transition-colors">{item.title}</h3>
        </div>
        <div className="flex justify-between items-end pt-4 mt-auto border-t border-slate-50">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Current Bid</p>
            <p className="text-2xl font-black text-slate-900 tabular-nums tracking-tighter">฿{Number(item.current_price).toLocaleString()}</p>
          </div>
        </div>
        <Link href={`/listings/${item.id}`} className={`w-full py-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${isEnded ? 'bg-slate-50 text-slate-500 hover:bg-slate-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'}`}>
          {isEnded ? 'View Details' : 'Manage Listing'} <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}

function AuctionCard({ item }: { item: any }) {
  return (
    <article className="rounded-[32px] bg-white border border-slate-100 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all overflow-hidden flex flex-col group p-3">
      <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden bg-slate-100">
        <img src={item.image_urls?.[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/90 backdrop-blur-md text-slate-900 shadow-sm">
          {item.category}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1 gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            <MapPin size={12} className="inline mr-1" />{item.location}
          </div>
          <h3 className="text-xl font-black text-slate-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">{item.title}</h3>
        </div>
        <div className="flex justify-between items-end pt-4 mt-auto border-t border-slate-50">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Current Bid</p>
            <p className="text-2xl font-black text-slate-900 tabular-nums tracking-tighter">฿{Number(item.current_price).toLocaleString()}</p>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1"><Clock size={12} className="inline mr-1" />Ends</p>
             <p className="text-sm font-bold text-slate-900">{new Date(item.end_time).toLocaleDateString()}</p>
          </div>
        </div>
        <Link href={`/listings/${item.id}`} className="w-full py-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 bg-slate-950 text-white hover:bg-blue-600 transition-colors shadow-lg shadow-slate-900/10">
          Place Bid <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}