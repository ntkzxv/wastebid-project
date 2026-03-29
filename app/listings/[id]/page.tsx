"use client";
import { use } from 'react';
import Link from 'next/link';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2, Minus, Plus, Wallet, ChevronLeft, Activity, Phone, Mail, Zap, ShieldCheck, Timer, ArrowRight } from 'lucide-react';
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
        setBidAmount(Number(listingData.current_price) + Number(listingData.min_increment));
        setLoading(false);
    }, [id, router]);

    useEffect(() => {
        const numericId = parseInt(id, 10);
        const channel = supabase.channel(`auction-${numericId}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'waste_listings', filter: `id=eq.${numericId}` }, () => fetchAuctionData())
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bid_logs', filter: `listing_id=eq.${numericId}` }, () => fetchAuctionData())
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

    // 🔥 ฟังก์ชันซื้อขาด (Buy It Now) พร้อมระบบแจ้งเตือน 3 ทิศทาง
    const handleBuyNow = async () => {
        if (!window.confirm("Confirm Buy It Now?")) return;
        
        const previousBidderId = item?.current_bidder_id;
        const { error } = await supabase.rpc('buy_now', { p_listing_id: item.id, p_user_id: currentUser.id });
        
        if (error) {
            alert(error.message);
        } else {
            // 1. แจ้งเตือนคนขาย (Owner)
            await supabase.from('notifications').insert([{
                user_id: item.owner_id,
                title: 'Item Sold!',
                message: `${currentUser.username} ได้กดซื้อขาดรายการ ${item.title} ของคุณแล้ว!`,
                type: 'won',
                is_read: false
            }]);

            // 2. แจ้งเตือนตัวเอง (Buyer)
            await supabase.from('notifications').insert([{
                user_id: currentUser.id,
                title: 'Purchase Success',
                message: `คุณได้ซื้อขาดรายการ ${item.title} เรียบร้อยแล้ว`,
                type: 'won',
                is_read: false
            }]);

            // 3. แจ้งเตือนคนประมูลก่อนหน้าที่ค้างอยู่ (ถ้ามี)
            if (previousBidderId && previousBidderId !== currentUser.id) {
                await supabase.from('notifications').insert([{
                    user_id: previousBidderId,
                    title: 'Auction Ended',
                    message: `รายการ ${item.title} ถูกซื้อขาดไปแล้วโดยผู้ใช้อื่น`,
                    type: 'outbid',
                    is_read: false
                }]);
            }

            alert("สั่งซื้อสำเร็จ!");
            router.push('/dashboard');
        }
    };

   const handlePlaceBid = async () => {
        if (bidAmount <= item.current_price) return alert("Bid must be higher than current price");
        setBidding(true);
        
        const previousBidderId = item?.current_bidder_id;
        const currentUserId = Number(currentUser.id); // 🔥 แปลงเป็นตัวเลขให้ชัวร์

        const { error } = await supabase.rpc('place_bid', {
            p_listing_id: item.id,
            p_user_id: currentUserId,
            p_bid_amount: bidAmount,
            p_current_version: item.version
        });

        if (error) {
            alert(error.message);
        } else {
            // 1. ส่งให้เจ้าของสินค้า
            await supabase.from('notifications').insert([{
                user_id: Number(item.owner_id), 
                title: 'New Bid Received',
                message: `มีคนเสนอราคาใหม่ ฿${bidAmount.toLocaleString()} ใน ${item.title}`,
                type: 'system'
            }]);

            // 2. ส่งให้ตัวเอง (Bidder) 👈 เช็กตรงนี้!!
            await supabase.from('notifications').insert([{
                user_id: currentUserId, 
                title: 'Bid Placed!',
                message: `คุณประมูล ฿${bidAmount.toLocaleString()} ใน ${item.title} แล้ว`,
                type: 'system'
            }]);

            // 3. ส่งให้คนเก่าที่โดนปาด
            if (previousBidderId && Number(previousBidderId) !== currentUserId) {
                await supabase.from('notifications').insert([{
                    user_id: Number(previousBidderId),
                    title: 'Outbid Alert!',
                    message: `คุณโดนปาดหน้าในรายการ ${item.title} แล้ว!`,
                    type: 'outbid'
                }]);
            }
            alert("ประมูลสำเร็จ!");
        }
        setBidding(false);
    };

    if (loading || !item) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-slate-800" size={40} />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Syncing Auction Data...</p>
            </div>
        );
    }

    const isAuctionActive = item?.status === 'open' && new Date(item.end_time).getTime() > currentTime.getTime();
    const canBuyNow = item?.buy_it_now_price && item?.status === 'open' && Number(item.current_price) <= (Number(item.buy_it_now_price) * 0.95);

    const getTimeLeft = () => {
        const diff = new Date(item.end_time).getTime() - currentTime.getTime();
        if (diff <= 0) return "Ended";
        const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    return (
        <div className="bg-[#FAFAFA] min-h-screen font-sans pb-32 pt-32 px-6 lg:px-12 selection:bg-emerald-200">
            <main className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-10">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
                        <ChevronLeft size={20} /> <span className="text-sm font-bold uppercase tracking-widest">Back</span>
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
                        <div className={`w-2 h-2 rounded-full ${isAuctionActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-900">
                            {isAuctionActive ? 'Live Auction' : 'Closed'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    <div className="lg:col-span-7 space-y-10">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-4 rounded-[40px] border border-slate-100 shadow-sm">
                            <div className="aspect-[4/3] rounded-[32px] overflow-hidden relative">
                                <img src={item?.image_urls?.[0] || DEFAULT_IMAGE} className="w-full h-full object-cover" alt={item?.title} />
                                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
                                    <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">{item?.category}</p>
                                </div>
                            </div>
                        </motion.div>

                        <div className="px-4">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter leading-tight mb-6">{item?.title}</h1>
                            <div className="flex items-center gap-4 text-slate-500 font-semibold text-sm mb-8">
                                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full"><MapPin size={16} />{item?.location}</div>
                                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full"><Activity size={16} />{bidLogs.length} Bids</div>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-lg mb-10 font-light whitespace-pre-wrap">{item?.description}</p>

                            <div className="flex items-center justify-between p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden relative border-2 border-white shadow-md">
                                        <img src={item?.owner?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item?.owner?.username}`} className="w-full h-full object-cover" />
                                        <div className="absolute bottom-0 right-0 bg-emerald-500 p-1 rounded-full"><ShieldCheck size={12} color="white" /></div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-lg">{item?.owner?.username}</p>
                                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Verified Partner</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-full transition-colors"><Phone size={20} /></button>
                                    <button className="p-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-full transition-colors"><Mail size={20} /></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32">
                        {canBuyNow && currentUser?.id !== item?.owner_id && (
                            <motion.button onClick={handleBuyNow} className="w-full relative overflow-hidden group rounded-[32px] bg-gradient-to-r from-amber-400 to-orange-500 p-1">
                                <div className="bg-white rounded-[28px] p-6 flex items-center justify-between group-hover:bg-amber-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center"><Zap size={24} /></div>
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Buy It Now</p>
                                            <p className="text-2xl font-black text-slate-900">฿{Number(item?.buy_it_now_price).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="text-amber-500 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </motion.button>
                        )}

                        <div className="bg-slate-950 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                            <div className="relative z-10">
                                <div className="flex justify-between items-end mb-10 border-b border-white/10 pb-8">
                                    <div>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Current Bid</p>
                                        <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white tabular-nums">฿{Number(item?.current_price).toLocaleString()}</h2>
                                    </div>
                                    <div className="text-right">
                                        <Timer size={20} className="text-emerald-400 mb-2 ml-auto" />
                                        <p className="text-2xl font-black tabular-nums tracking-tighter text-emerald-400">{getTimeLeft()}</p>
                                    </div>
                                </div>

                                {isAuctionActive && currentUser?.id !== item?.owner_id ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between bg-white/5 border border-white/10 p-2 rounded-full">
                                            <button onClick={() => setBidAmount(prev => Math.max(item.current_price + item.min_increment, prev - item.min_increment))} className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"><Minus size={20} /></button>
                                            <div className="text-center flex-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Your Offer</p>
                                                <span className="text-3xl font-black tabular-nums tracking-tighter">฿{bidAmount.toLocaleString()}</span>
                                            </div>
                                            <button onClick={() => setBidAmount(prev => prev + item.min_increment)} className="w-14 h-14 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center text-white"><Plus size={20} /></button>
                                        </div>
                                        <button onClick={handlePlaceBid} disabled={bidding} className="w-full py-6 bg-white text-slate-950 hover:bg-slate-200 rounded-full font-black uppercase tracking-widest text-sm transition-all shadow-xl flex items-center justify-center gap-2">
                                            {bidding ? <Loader2 className="animate-spin" size={20} /> : "Place Bid Now"}
                                        </button>
                                        <div className="flex justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            <Wallet size={14} /> Balance: <span className="text-white">฿{userWallet?.balance?.toLocaleString() || 0}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center bg-white/5 rounded-[32px] border border-white/10">
                                        <p className="text-sm font-black uppercase tracking-widest text-emerald-400">{item?.status === 'sold' ? 'Sold Out' : 'Bidding Closed'}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden p-8">
                            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-widest mb-6 flex items-center gap-2"><Activity size={18} className="text-emerald-500" /> Live Feed</h3>
                            <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
                                <AnimatePresence>
                                    {bidLogs.map((log, i) => (
                                        <motion.div key={log.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`flex items-center gap-4 p-4 rounded-3xl ${i === 0 ? 'bg-slate-50 border border-slate-100' : ''}`}>
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold overflow-hidden">
                                                {log.user?.username?.[0]?.toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <p className="text-sm font-bold text-slate-900">{log.user?.username}</p>
                                                    <p className={`text-sm font-black tabular-nums ${i === 0 ? 'text-emerald-600' : 'text-slate-500'}`}>฿{Number(log.amount).toLocaleString()}</p>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(log.created_at).toLocaleTimeString()}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}