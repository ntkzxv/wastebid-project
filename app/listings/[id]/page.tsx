"use client";
import { use } from 'react';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, MapPin, Clock, TrendingUp,
    User, Mail, Phone, Gavel, CheckCircle2,
    CalendarDays, Loader2, Minus, Plus
} from 'lucide-react';
import { supabase } from '@/lib/supabase'; // อย่าลืม import supabase

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1558610530-5896a2472648?q=80&w=800";

export default function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;

    const [currentUser, setCurrentUser] = useState<any>(null);
    const [item, setItem] = useState<any>(null);
    const [bids, setBids] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [bidding, setBidding] = useState(false);

    const [currentTime, setCurrentTime] = useState(new Date());
    const [bidAmount, setBidAmount] = useState(0);

    // --- 1. โหลดข้อมูลตอนเปิดหน้า ---
    useEffect(() => {
        const savedUser = localStorage.getItem('wastebid_user');
        if (savedUser) setCurrentUser(JSON.parse(savedUser));

        fetchAuctionData();

        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, [id]); // 4. เปลี่ยนจาก params.id เป็น id

    const fetchAuctionData = async () => {
        try {
            const { data: listingData, error: listingError } = await supabase
                .from('waste_listings')
                .select(`
          *,
          owner:users!owner_id (username, email, phone, created_at)
        `)
                .eq('id', id) // 5. เปลี่ยนจาก params.id เป็น id
                .single();

            if (listingError) throw listingError;

            setItem(listingData);
            setBidAmount(Number(listingData.current_price) + Number(listingData.min_increment));

            // 1.2 ดึงประวัติการประมูล (Join ตาราง users เพื่อเอาชื่อคนประมูล)
            const { data: bidsData, error: bidsError } = await supabase
                .from('bids')
                .select(`
          id, bid_amount, created_at,
          bidder:users!bidder_id (username)
        `)
                .eq('listing_id', id)
                .order('created_at', { ascending: false });

            if (bidsError) throw bidsError;
            setBids(bidsData || []);

        } catch (error) {
            console.error("Error fetching data:", error);
            alert("ไม่พบข้อมูลการประมูลนี้");
        } finally {
            setLoading(false);
        }
    };

    // --- 2. ฟังก์ชันคำนวณเวลา ---
    const getTimeLeft = (endTimeString: string) => {
        const end = new Date(endTimeString).getTime();
        const now = currentTime.getTime();
        const distance = end - now;
        if (distance <= 0) return { d: "00", h: "00", m: "00", s: "00", isEnded: true };
        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);
        return {
            d: String(d).padStart(2, '0'),
            h: String(h).padStart(2, '0'),
            m: String(m).padStart(2, '0'),
            s: String(s).padStart(2, '0'),
            isEnded: false
        };
    };

    // --- 3. ฟังก์ชันปรับราคา (Plus/Minus) ---
    const changeBidAmount = (type: 'plus' | 'minus') => {
        if (!item) return;
        const minBid = Number(item.current_price) + Number(item.min_increment);
        let newAmount = bidAmount;
        if (type === 'plus') {
            newAmount += Number(item.min_increment);
        } else {
            newAmount -= Number(item.min_increment);
            if (newAmount < minBid) newAmount = minBid;
        }
        setBidAmount(newAmount);
    };

    // --- 4. ฟังก์ชันยิงประมูลลง Database ---
    const handlePlaceBid = async () => {
        if (!currentUser) {
            alert("กรุณาล็อกอินก่อนร่วมประมูลครับเพื่อน!");
            return;
        }

        setBidding(true);
        try {
            // ยิง RPC ฟังก์ชันที่เราเขียนไว้ใน Postgres
            const { data, error } = await supabase.rpc('place_bid', {
                p_listing_id: Number(id),
                p_bidder_id: currentUser.id,
                p_bid_amount: bidAmount
            });

            if (error) throw error;

            alert("🎉 ประมูลสำเร็จ! คุณคือผู้นำตอนนี้");
            fetchAuctionData(); // รีเฟรชข้อมูลใหม่ทันที
        } catch (error: any) {
            console.error("Bidding Error:", error);
            alert(`❌ ประมูลไม่สำเร็จ: ${error.message || "มีคนตัดหน้าหรือราคาไม่ถูกต้อง"}`);
            fetchAuctionData(); // รีเฟรชเพื่อดึงราคาล่าสุดที่มีคนตัดหน้าไป
        } finally {
            setBidding(false);
        }
    };

    // --- Loading State ---
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA]">
                <Loader2 className="animate-spin text-[#748D83] mb-4" size={40} />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm font-kanit">กำลังโหลดข้อมูลการประมูล...</p>
            </div>
        );
    }

    if (!item) return <div className="text-center mt-20">ไม่พบข้อมูล</div>;

    const timeLeft = getTimeLeft(item.end_time);
    const isOwner = currentUser?.id === item.owner_id;
    const topBidderName = bids.length > 0 ? bids[0].bidder.username : "ยังไม่มีผู้ประมูล";

    return (
        <div className="bg-[#FAFAFA] min-h-screen font-kanit pb-20 fade-in-custom">
            <main className="max-w-7xl mx-auto px-6 py-8">

                {/* --- 🔙 Back & Header --- */}
                <div className="flex items-center justify-between mb-10 pb-4 border-b border-gray-100">
                    <Link href="/dashboard">
                        <button className="flex items-center gap-3 text-gray-400 hover:text-[#748D83] transition-colors group p-2 pr-4 pl-0">
                            <div className="p-2 bg-white rounded-xl border border-gray-50 group-hover:border-[#748D83]/20 shadow-sm transition-all">
                                <ArrowLeft size={16} />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-[0.2em]">กลับหน้าหลัก</span>
                        </button>
                    </Link>
                    <div className="text-right">
                        <span className="text-[10px] font-bold text-[#748D83] uppercase tracking-[0.2em] mb-1 block">ID: #{item.id}</span>
                        <div className="flex items-center gap-2 bg-[#3A4A43]/80 backdrop-blur-md px-3 py-1.5 rounded-xl">
                            <span className="text-[9px] font-bold text-white uppercase tracking-widest">{item.category || 'ทั่วไป'}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* ========================================================== */}
                    {/* 📸 Column 1: รูปภาพ & รายละเอียดผู้ขาย */}
                    {/* ========================================================== */}
                    <div className="lg:col-span-5 space-y-8">
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-white border border-gray-100 shadow-sm">
                            <img src={item.image_url || DEFAULT_IMAGE} alt={item.title} className="w-full h-full object-cover grayscale-[0.2]" />
                            {!timeLeft.isEnded && item.status === 'open' && (
                                <div className="absolute top-6 left-6 bg-red-500/90 text-white backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-red-500/20 shadow-sm z-10">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                    <span className="text-[11px] font-black uppercase tracking-widest">LIVE</span>
                                </div>
                            )}
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-lg shadow-gray-100/30">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">เจ้าของประกาศ</p>
                                <div className="flex items-center gap-2 bg-[#748D83]/10 text-[#748D83] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                                    <CheckCircle2 size={12} /> Verified Seller
                                </div>
                            </div>
                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-16 h-16 rounded-full bg-[#E8EDEB] flex items-center justify-center border border-white shadow-inner">
                                    <span className="text-[#3A4A43] text-2xl font-bold uppercase">
                                        {(item.owner?.username || 'US').substring(0, 2)}
                                    </span>
                                </div>
                                <div>
                                    <h5 className="font-black text-xl text-[#2D3A2E] leading-tight mb-1">{item.owner?.username || 'ไม่ระบุชื่อ'}</h5>
                                    <p className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                                        <CalendarDays size={14} className="text-[#748D83]" /> ลงประกาศเมื่อ {new Date(item.created_at).toLocaleDateString('th-TH')}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-[#F8F9F8] p-4 rounded-xl border border-gray-50 overflow-hidden">
                                    <Mail size={16} className="text-[#748D83] mx-auto mb-2" />
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">อีเมล</p>
                                    <p className="text-xs font-medium text-[#4A4A4A] truncate" title={item.owner?.email}>{item.owner?.email}</p>
                                </div>
                                <div className="bg-[#F8F9F8] p-4 rounded-xl border border-gray-50 overflow-hidden">
                                    <Phone size={16} className="text-[#748D83] mx-auto mb-2" />
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">เบอร์โทรศัพท์</p>
                                    <p className="text-xs font-medium text-[#4A4A4A] truncate">{item.owner?.phone || '-'}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* ========================================================== */}
                    {/* ⚡ Column 2: การประมูล (Bidding Area) */}
                    {/* ========================================================== */}
                    <div className="lg:col-span-7 space-y-10">
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-4">
                            <p className="flex items-center gap-1 text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                                <MapPin size={12} className="text-[#748D83]" /> {item.location || 'ไม่ระบุพิกัด'}
                            </p>
                            <h1 className="text-3xl md:text-4xl font-black text-[#2D3A2E] leading-tight tracking-tight">{item.title}</h1>
                            <p className="text-sm text-[#4A4A4A] font-thai leading-relaxed font-medium bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">{item.description}</p>
                        </motion.div>

                        {/* แผงควบคุมการประมูล */}
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#3A4A43] rounded-[2.5rem] p-10 text-white shadow-xl shadow-gray-300 relative overflow-hidden">
                            <TrendingUp size={200} className="absolute -bottom-10 -right-10 text-white/5 rotate-[-15deg] z-0" />

                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-10 border-r border-white/10 pr-10">
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <TrendingUp size={14} /> ราคาปัจจุบัน
                                        </p>
                                        <p className="text-6xl font-bold text-white tracking-tighter">฿{Number(item.current_price).toLocaleString()}</p>
                                        <p className="text-[11px] text-gray-300 font-medium uppercase tracking-widest mt-2">คนนำ: {topBidderName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Clock size={14} /> เวลาที่เหลือ
                                        </p>
                                        {timeLeft.isEnded || item.status !== 'open' ? (
                                            <div className="p-4 bg-red-500/20 rounded-xl border border-red-500/30 text-center">
                                                <p className="text-xl font-bold text-red-400 uppercase">จบการประมูลแล้ว</p>
                                            </div>
                                        ) : (
                                            <div className="flex gap-4">
                                                {[{ label: 'DAYS', val: timeLeft.d }, { label: 'HRS', val: timeLeft.h }, { label: 'MINS', val: timeLeft.m }, { label: 'SECS', val: timeLeft.s }].map(t => (
                                                    <div key={t.label} className="text-center p-3 bg-white/10 rounded-xl border border-white/10 flex-1">
                                                        <p className="text-2xl font-bold text-white">{t.val}</p>
                                                        <p className="text-[8px] font-bold text-gray-300 uppercase tracking-wider">{t.label}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                                        <Gavel size={14} /> เสนอราคาของคุณ
                                    </p>

                                    <div className={`bg-white/10 rounded-full p-2 flex items-center justify-between border border-white/10 ${timeLeft.isEnded ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <button onClick={() => changeBidAmount('minus')} className="p-4 bg-white/10 text-white rounded-full hover:bg-white/20 active:scale-95 transition-all">
                                            <Minus size={16} />
                                        </button>
                                        <p className="text-3xl font-black text-white px-4 truncate max-w-[150px]">฿{Number(bidAmount).toLocaleString()}</p>
                                        <button onClick={() => changeBidAmount('plus')} className="p-4 bg-white text-[#3A4A43] rounded-full hover:bg-[#E8EDEB] active:scale-95 transition-all">
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5 space-y-1.5">
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">เริ่มที่: ฿{Number(item.start_price).toLocaleString()}</p>
                                        <p className="text-[10px] text-white font-black uppercase tracking-[0.2em] font-kanit">ประมูลขั้นต่ำครั้งละ +{Number(item.min_increment).toLocaleString()} บาท</p>
                                    </div>

                                    {isOwner ? (
                                        <button disabled className="w-full bg-gray-500 text-white py-5 rounded-full font-black text-[10px] uppercase tracking-[0.25em] cursor-not-allowed">
                                            คุณคือเจ้าของประกาศนี้
                                        </button>
                                    ) : timeLeft.isEnded || item.status !== 'open' ? (
                                        <button disabled className="w-full bg-red-500/50 text-white py-5 rounded-full font-black text-[10px] uppercase tracking-[0.25em] cursor-not-allowed">
                                            ประมูลจบลงแล้ว
                                        </button>
                                    ) : (
                                        <button onClick={handlePlaceBid} disabled={bidding} className="w-full bg-[#748D83] text-white py-5 rounded-full font-black text-[10px] uppercase tracking-[0.25em] hover:bg-[#86A397] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(0,0,0,0.15)] disabled:opacity-70 disabled:cursor-wait">
                                            {bidding ? <Loader2 className="animate-spin" size={20} /> : <>เสนอราคา ฿{Number(bidAmount).toLocaleString()} <ArrowLeft className="rotate-180" size={14} /></>}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* ประวัติการประมูล */}
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                                <h3 className="text-xl font-bold text-[#2D3A2E] flex items-center gap-2">
                                    <Gavel size={20} className="text-[#748D83]" /> ประวัติการประมูล
                                </h3>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{bids.length} รายการ</span>
                            </div>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                <AnimatePresence>
                                    {bids.length === 0 ? (
                                        <p className="text-center text-gray-400 py-10 font-medium">ยังไม่มีการเสนอราคา เริ่มเป็นคนแรกเลย!</p>
                                    ) : (
                                        bids.map((log, index) => {
                                            const isNewest = index === 0;
                                            return (
                                                <motion.div key={log.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-center justify-between p-5 rounded-xl transition-all ${isNewest ? 'bg-[#748D83]/10 border border-[#748D83]/20 shadow-sm' : 'bg-[#F8F9F8] border border-gray-50'}`}>
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-black uppercase ${isNewest ? 'bg-[#748D83] text-white' : 'bg-[#E8EDEB] text-[#3A4A43]'}`}>
                                                            {log.bidder?.username.substring(0, 2) || 'US'}
                                                        </div>
                                                        <div>
                                                            <p className={`text-xs font-black uppercase ${isNewest ? 'text-[#3A4A43]' : 'text-gray-500'}`}>
                                                                {log.bidder?.username || 'ไม่ระบุชื่อ'} {isNewest && '— ผู้นำล่าสุด'}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                                                {new Date(log.created_at).toLocaleTimeString('th-TH')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-xl font-bold ${isNewest ? 'text-[#748D83]' : 'text-[#4A4A4A]'}`}>
                                                            ฿{Number(log.bid_amount).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}