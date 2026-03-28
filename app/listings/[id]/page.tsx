"use client";
import { use } from 'react';
import Link from 'next/link';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MapPin, Clock, Gavel, CheckCircle2, Loader2, Minus, Plus, 
    Wallet, ChevronLeft, Activity, User, Phone, Mail, Zap,
    ShieldCheck, TrendingUp, Timer,
    ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1558610530-5896a2472648?q=80&w=800";

export default function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    const router = useRouter();

    const [currentUser, setCurrentUser] = useState<any>(null);
    const [userWallet, setUserWallet] = useState<any>(null);
    const [item, setItem] = useState<any>(null);
    const [bidLogs, setBidLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [bidding, setBidding] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [bidAmount, setBidAmount] = useState(0);

    const fetchWallet = useCallback(async (uid: number) => {
        const { data } = await supabase.from('wallets').select('*').eq('user_id', uid).single();
        if (data) setUserWallet(data);
    }, []);

    const fetchAuctionData = useCallback(async () => {
        const numericId = parseInt(id, 10);
        const { data: listingData } = await supabase.from('waste_listings').select('*').eq('id', numericId).single();
        if (!listingData) return router.push('/dashboard');
        
        const { data: ownerData } = await supabase.from('users').select('*').eq('id', listingData.owner_id).single();
        const { data: logsData } = await supabase.from('bid_logs').select('*, user:users!user_id(*)').eq('listing_id', numericId).order('created_at', { ascending: false });

        setItem({ ...listingData, owner: ownerData });
        setBidLogs(logsData || []);
        // ให้ค่าตั้งต้นคือราคาปัจจุบัน + ขั้นต่ำเสมอ
        setBidAmount(Number(listingData.current_price) + Number(listingData.min_increment));
        setLoading(false);
    }, [id, router]);

    useEffect(() => {
        const numericId = parseInt(id, 10);
        const channel = supabase.channel(`auction-${numericId}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'waste_listings', filter: `id=eq.${numericId}` }, (p) => {
                fetchAuctionData();
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bid_logs', filter: `listing_id=eq.${numericId}` }, () => {
                fetchAuctionData();
            })
            .subscribe();

        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        fetchAuctionData();
        
        const saved = localStorage.getItem('wastebid_user');
        if (saved) { 
            const u = JSON.parse(saved); 
            setCurrentUser(u); 
            fetchWallet(u.id); 
        }

        return () => { supabase.removeChannel(channel); clearInterval(timer); };
    }, [id, fetchAuctionData, fetchWallet]);

    const handleBuyNow = async () => {
        if (!window.confirm("คุณต้องการซื้อสินค้านี้ทันทีใช่หรือไม่?")) return;
        const { error } = await supabase.rpc('buy_now', { p_listing_id: item.id, p_user_id: currentUser.id });
        if (error) alert(error.message); else router.push('/dashboard/my_bid');
    };

    const handlePlaceBid = async () => {
        if (bidAmount <= item.current_price) return alert("ราคาประมูลต้องมากกว่าราคาปัจจุบัน");
        setBidding(true);
        const { error } = await supabase.rpc('place_bid', { 
            p_listing_id: item.id, 
            p_user_id: currentUser.id, 
            p_bid_amount: bidAmount, 
            p_current_version: item.version 
        });
        if (error) alert(error.message);
        setBidding(false);
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9F8] gap-4 font-kanit">
            <Loader2 className="animate-spin text-[#3A4A43]" size={48} strokeWidth={1.5} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#748D83]">Loading Auction</p>
        </div>
    );

    const isAuctionActive = item?.status === 'open' && new Date(item.end_time).getTime() > currentTime.getTime();
    const canBuyNow = item?.buy_it_now_price && item?.status === 'open' && Number(item.current_price) <= (Number(item.buy_it_now_price) * 0.7);

    // คำนวณเวลาที่เหลือแบบหรูๆ
    const getTimeLeft = () => {
        const diff = new Date(item.end_time).getTime() - currentTime.getTime();
        if (diff <= 0) return "Auction Ended";
        const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    return (
        <div className="bg-[#F8F9F8] min-h-screen font-kanit pb-32 pt-32 px-6">
            <main className="max-w-7xl mx-auto">
                
                {/* --- Top Navigation --- */}
                <div className="flex items-center justify-between mb-12">
                    <button 
                        onClick={() => router.back()} 
                        className="group flex items-center gap-3 text-gray-400 hover:text-[#3A4A43] transition-all"
                    >
                        <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:shadow-md transition-all border border-gray-100">
                            <ChevronLeft size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">ย้อนกลับ</span>
                    </button>
                    
                    <div className="flex items-center gap-4">
                         <div className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 rounded-full shadow-sm">
                             <div className={`w-2 h-2 rounded-full ${isAuctionActive ? 'bg-[#748D83] animate-pulse' : 'bg-red-400'}`} />
                             <span className="text-[10px] font-black uppercase tracking-widest text-[#3A4A43]">
                                 {isAuctionActive ? 'Live Auction' : 'Finished'}
                             </span>
                         </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    
                    {/* --- Left: Media & Description --- */}
                    <div className="lg:col-span-7 space-y-12">
                        {/* Hero Image */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-[#3A4A43]/10 blur-3xl rounded-[4rem] group-hover:bg-[#3A4A43]/15 transition-all duration-1000" />
                            <div className="relative rounded-[3.5rem] overflow-hidden bg-white border-[12px] border-white shadow-2xl aspect-[4/3]">
                                <img 
                                    src={item.image_urls?.[0] || DEFAULT_IMAGE} 
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                                    alt={item.title} 
                                />
                                {/* Overlay Badges */}
                                <div className="absolute top-8 left-8 flex flex-col gap-3">
                                    <div className="bg-white/80 backdrop-blur-xl px-5 py-2 rounded-2xl border border-white/50 shadow-xl">
                                        <p className="text-[10px] font-black text-[#3A4A43] uppercase tracking-widest">{item.category}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Description Card */}
                        <div className="bg-white rounded-[3.5rem] p-12 shadow-sm border border-gray-50 space-y-8">
                            <div className="flex flex-col gap-4">
                                <h1 className="text-5xl font-black text-[#3A4A43] tracking-tighter leading-[1.1]">
                                    {item.title}
                                </h1>
                                <div className="flex items-center gap-4 text-gray-400 font-bold text-xs">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-xl">
                                        <MapPin size={14} className="text-[#748D83]" />
                                        <span>{item.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-xl">
                                        <TrendingUp size={14} className="text-[#748D83]" />
                                        <span>{bidLogs.length} Bids</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-500 leading-[1.8] text-lg font-medium whitespace-pre-wrap">
                                {item.description}
                            </p>

                            {/* Seller Profile */}
                            <div className="pt-10 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
                                            {item.owner?.avatar_url ? (
                                                <img src={item.owner.avatar_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[#3A4A43] text-xl font-black">
                                                    {item.owner?.username?.[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-md">
                                            <ShieldCheck size={18} className="text-[#748D83]" fill="currentColor" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-[#3A4A43] text-lg">{item.owner?.username}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-[#748D83] uppercase tracking-widest">Verified Seller</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-4 bg-gray-50 hover:bg-[#3A4A43] text-gray-400 hover:text-white rounded-2xl transition-all shadow-sm">
                                        <Phone size={18} />
                                    </button>
                                    <button className="p-4 bg-gray-50 hover:bg-[#3A4A43] text-gray-400 hover:text-white rounded-2xl transition-all shadow-sm">
                                        <Mail size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Right: Controls --- */}
                    <div className="lg:col-span-5 space-y-8">
                        
                        {/* Buy It Now (Flash Deal Style) */}
                        {canBuyNow && currentUser?.id !== item.owner_id && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative group overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                                <button 
                                    onClick={handleBuyNow} 
                                    className="relative w-full bg-white p-1 rounded-[2.5rem] shadow-xl border border-amber-100 flex items-center overflow-hidden"
                                >
                                    <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 rounded-[2.3rem] text-white">
                                        <Zap size={24} strokeWidth={3} />
                                    </div>
                                    <div className="flex-1 text-left px-8">
                                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Buy It Now Special</p>
                                        <h3 className="text-2xl font-black text-[#3A4A43] tracking-tighter">
                                            ฿{Number(item.buy_it_now_price).toLocaleString()}
                                        </h3>
                                    </div>
                                    <div className="pr-8 text-amber-500">
                                        <ChevronRight size={24} strokeWidth={3} />
                                    </div>
                                </button>
                            </motion.div>
                        )}

                        {/* Main Bidding Card */}
                        <div className="bg-[#3A4A43] rounded-[3.5rem] p-12 text-white shadow-3xl relative overflow-hidden">
                            {/* Glass Background Elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#748D83]/20 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

                            <div className="relative z-10 space-y-10">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Current Bid</p>
                                        <h2 className="text-7xl font-black tracking-tighter text-white tabular-nums">
                                            ฿{Number(item.current_price).toLocaleString()}
                                        </h2>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <Timer size={20} className="text-[#748D83] mb-2" />
                                        <p className="text-2xl font-black tabular-nums tracking-tighter text-[#748D83]">
                                            {getTimeLeft()}
                                        </p>
                                    </div>
                                </div>

                                {isAuctionActive && currentUser?.id !== item.owner_id ? (
                                    <div className="space-y-6">
                                        {/* Amount Selector */}
                                        <div className="flex items-center justify-between bg-white/5 backdrop-blur-xl p-3 rounded-3xl border border-white/10 shadow-inner">
                                            <button 
                                                onClick={() => setBidAmount(prev => Math.max(item.current_price + item.min_increment, prev - item.min_increment))} 
                                                className="p-5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-[#748D83]"
                                            >
                                                <Minus size={20} strokeWidth={3} />
                                            </button>
                                            <div className="text-center">
                                                <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Your Offer</p>
                                                <span className="text-3xl font-black tabular-nums tracking-tighter">
                                                    ฿{bidAmount.toLocaleString()}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={() => setBidAmount(prev => prev + item.min_increment)} 
                                                className="p-5 bg-[#748D83] text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#748D83]/20"
                                            >
                                                <Plus size={20} strokeWidth={3} />
                                            </button>
                                        </div>

                                        {/* Action Button */}
                                        <button 
                                            onClick={handlePlaceBid} 
                                            disabled={bidding} 
                                            className="w-full py-7 bg-white text-[#3A4A43] hover:bg-[#748D83] hover:text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[12px] transition-all duration-500 shadow-xl group"
                                        >
                                            {bidding ? (
                                                <Loader2 className="animate-spin mx-auto" size={20} />
                                            ) : (
                                                <div className="flex items-center justify-center gap-3">
                                                    <Gavel size={20} className="group-hover:rotate-12 transition-transform" />
                                                    <span>Place My Bid</span>
                                                </div>
                                            )}
                                        </button>

                                        {/* Wallet Status */}
                                        <div className="flex items-center justify-center gap-3 py-4 bg-white/5 rounded-2xl border border-white/5">
                                            <Wallet size={14} className="text-[#748D83]" />
                                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                                                Wallet: <span className="text-white">฿{userWallet?.balance?.toLocaleString() || 0}</span>
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-10 text-center bg-white/5 rounded-[2.5rem] border border-white/10">
                                        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#748D83]">
                                            {item.status === 'sold' ? 'Sold Out' : 'Bidding Closed'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Activity Feed (High-End Style) */}
                        <div className="bg-white rounded-[3.5rem] border border-gray-100 overflow-hidden shadow-sm flex flex-col">
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Activity size={18} className="text-[#748D83]" />
                                    <h3 className="font-black text-[#3A4A43] text-xs uppercase tracking-widest">Bid Activity</h3>
                                </div>
                                <div className="bg-[#F8F9F8] px-4 py-1.5 rounded-full text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                    Real-time
                                </div>
                            </div>
                            
                            <div className="max-h-[380px] overflow-y-auto p-4 space-y-3 no-scrollbar">
                                <AnimatePresence mode='popLayout'>
                                    {bidLogs.length > 0 ? bidLogs.map((log, i) => (
                                        <motion.div 
                                            key={log.id} 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`flex items-center gap-5 p-5 rounded-[2rem] transition-all ${
                                                i === 0 
                                                ? 'bg-[#3A4A43] text-white shadow-xl' 
                                                : 'bg-[#FAFAFA] border border-gray-50'
                                            }`}
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 shadow-sm overflow-hidden font-black text-sm">
                                                {log.user?.avatar_url ? (
                                                    <img src={log.user.avatar_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className={i === 0 ? 'text-white' : 'text-[#3A4A43]'}>
                                                        {log.user?.username?.[0]?.toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className={`text-xs font-black ${i === 0 ? 'text-white' : 'text-[#3A4A43]'}`}>
                                                        {log.user?.username}
                                                        {i === 0 && <span className="ml-2 text-[9px] text-[#748D83] uppercase tracking-widest">Highest</span>}
                                                    </p>
                                                    <p className={`text-base font-black tabular-nums tracking-tighter ${i === 0 ? 'text-white' : 'text-[#748D83]'}`}>
                                                        ฿{Number(log.amount).toLocaleString()}
                                                    </p>
                                                </div>
                                                <p className={`text-[9px] font-bold uppercase ${i === 0 ? 'text-white/40' : 'text-gray-300'}`}>
                                                    {new Date(log.created_at).toLocaleTimeString()} • เสนอราคา
                                                </p>
                                            </div>
                                        </motion.div>
                                    )) : (
                                        <div className="flex flex-col items-center justify-center py-20 opacity-20">
                                            <Activity size={48} className="mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Bids Yet</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}