"use client";
import { use } from 'react';
import Link from 'next/link';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Clock, Gavel, CheckCircle2,
    Loader2, Minus, Plus, History, Wallet, ChevronLeft, Activity, User, Phone, Mail
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

    const refetchBidLogs = useCallback(async (listingId: number) => {
        const { data } = await supabase
            .from('bid_logs')
            .select('*, user:users!user_id (username, avatar_url)')
            .eq('listing_id', listingId)
            .order('created_at', { ascending: false });
        if (data) setBidLogs(data);
    }, []);

    const fetchAuctionData = useCallback(async () => {
        try {
            const numericId = parseInt(id, 10);
            if (Number.isNaN(numericId)) {
                router.push('/dashboard');
                return;
            }

            const { data: listingData, error: listingError } = await supabase
                .from('waste_listings')
                .select('*')
                .eq('id', numericId)
                .single();

            if (listingError || !listingData) {
                console.error('Listing Error:', listingError?.message);
                router.push('/dashboard');
                return;
            }

            const { data: ownerData } = await supabase
                .from('users')
                .select('username, email, phone, avatar_url')
                .eq('id', listingData.owner_id)
                .single();

            const { data: logsData } = await supabase
                .from('bid_logs')
                .select('*, user:users!user_id (username, avatar_url)')
                .eq('listing_id', numericId)
                .order('created_at', { ascending: false });

            setItem({ ...listingData, owner: ownerData });
            setBidLogs(logsData || []);
            setBidAmount(Number(listingData.current_price) + Number(listingData.min_increment));
        } catch (error) {
            console.error('Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        setLoading(true);
        const savedUser = localStorage.getItem('wastebid_user');
        if (savedUser) {
            const parsed = JSON.parse(savedUser);
            setCurrentUser(parsed);
            void fetchWallet(parsed.id);
        }
        void fetchAuctionData();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, [id, fetchWallet, fetchAuctionData]);

    useEffect(() => {
        const numericId = parseInt(id, 10);
        if (Number.isNaN(numericId)) return;

        const channel = supabase
            .channel(`listing-detail-${numericId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'waste_listings',
                    filter: `id=eq.${numericId}`,
                },
                (payload) => {
                    setItem((prev: any) => {
                        if (!prev) return prev;
                        const owner = prev.owner;
                        return { ...prev, ...(payload.new as Record<string, unknown>), owner };
                    });
                    void refetchBidLogs(numericId);
                    const saved = localStorage.getItem('wastebid_user');
                    if (saved) {
                        try {
                            const u = JSON.parse(saved) as { id: number };
                            void fetchWallet(u.id);
                        } catch {
                            /* noop */
                        }
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'bid_logs',
                    filter: `listing_id=eq.${numericId}`,
                },
                () => {
                    void refetchBidLogs(numericId);
                }
            )
            .subscribe((status) => {
                if (status === 'CHANNEL_ERROR') {
                    console.warn(
                        '[WasteBid] Realtime error — ใน Supabase: Database → Replication ให้รวมตาราง waste_listings และ bid_logs'
                    );
                }
            });

        return () => {
            void supabase.removeChannel(channel);
        };
    }, [id, refetchBidLogs, fetchWallet]);

    useEffect(() => {
        if (!item?.id) return;
        const floor = Number(item.current_price) + Number(item.min_increment);
        setBidAmount((prev) => (prev < floor ? floor : prev));
    }, [item?.id, item?.current_price, item?.min_increment]);

    const handlePlaceBid = async () => {
        if (!currentUser || !item) return;
        if (bidAmount > (userWallet?.balance || 0)) return alert("ยอดเงินในวอลเล็ตไม่พอครับ!");

        setBidding(true);
        try {
            const { data, error } = await supabase.rpc('place_bid', {
                p_listing_id: item.id,
                p_user_id: currentUser.id,
                p_bid_amount: bidAmount,
                p_current_version: item.version
            });

            if (error) throw error;
            alert("🚀 ประมูลสำเร็จ!");
            void fetchAuctionData();
            void fetchWallet(currentUser.id);
        } catch (error: any) {
            alert(`❌ ${error.message || "เกิดข้อผิดพลาด"}`);
            void fetchAuctionData();
        } finally {
            setBidding(false);
        }
    };

    // --- ฟังก์ชันใหม่: คำนวณเวลาที่เหลือสำหรับยกเลิก (15 นาที) ---
    const getCancelTimeLeft = () => {
        if (!item) return null;
        const createdAt = new Date(item.created_at).getTime();
        const deadline = createdAt + (15 * 60 * 1000); // 15 นาที
        const diff = deadline - currentTime.getTime();
        
        if (diff <= 0) return null;
        
        const m = Math.floor(diff / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        return { m, s };
    };

    // --- ฟังก์ชันใหม่: ส่งคำขอยกเลิกรายการ ---
    const handleCancelListing = async () => {
        if (!window.confirm("คุณแน่ใจนะว่าต้องการยกเลิกรายการนี้?")) return;
        
        try {
            const { data, error } = await supabase.rpc('cancel_listing', {
                p_listing_id: item.id,
                p_user_id: currentUser.id
            });
            if (error) throw error;
            alert("✅ ยกเลิกรายการเรียบร้อยแล้ว");
            router.push('/dashboard');
        } catch (error: any) {
            alert(`❌ ไม่สามารถยกเลิกได้: ${error.message}`);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
            <Loader2 className="animate-spin text-[#3A4A43]" size={40} />
        </div>
    );

    if (!item) return null;

    const isAuctionActive =
        item.status === 'open' && new Date(item.end_time).getTime() > currentTime.getTime();

    const timeLeft = () => {
        if (item.status === 'closed') return 'ENDED';
        const end = new Date(item.end_time).getTime();
        const diff = end - currentTime.getTime();
        if (diff <= 0) return 'ENDED';
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        return `${h}h ${m}m ${s}s`;
    };

    const cancelTimer = getCancelTimeLeft();

    return (
        <div className="bg-[#FAFAFA] min-h-screen font-kanit pb-20 pt-32">
            <main className="max-w-7xl mx-auto px-6">
                
                <div className="flex justify-between items-center mb-10">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-[#3A4A43] bg-white px-5 py-3 rounded-full border border-gray-100 shadow-sm transition-all font-black uppercase text-[10px] tracking-widest">
                        <ChevronLeft size={16} /> ย้อนกลับ
                    </button>
                    <div className="bg-white px-5 py-3 rounded-full border border-gray-100 text-[10px] font-black uppercase tracking-widest text-[#748D83] flex items-center gap-2">
                        {isAuctionActive ? (
                            <>
                                <div className="w-1.5 h-1.5 bg-[#748D83] rounded-full animate-ping" aria-hidden />
                                Live Auction
                            </>
                        ) : (
                            <span className="text-gray-500">จบการประมูล</span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    <div className="lg:col-span-7 space-y-8">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[3.5rem] overflow-hidden bg-white border-[10px] border-white shadow-2xl shadow-[#3A4A43]/10 aspect-[4/3] relative">
                            <img 
                                src={item?.image_urls?.[0] || item?.image_url || DEFAULT_IMAGE} 
                                className="w-full h-full object-cover" 
                                alt="Auction Item"
                            />
                            <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md px-6 py-3 rounded-[2rem] shadow-xl border border-white/50">
                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ID: #{item.id}</p>
                               <p className="font-black text-[#3A4A43] uppercase tracking-tighter">{item.category || 'Recycle'}</p>
                            </div>
                        </motion.div>

                        <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 text-[#748D83] text-[11px] font-black uppercase tracking-widest">
                                <MapPin size={16} /> {item.location || 'Bangkok'}
                            </div>
                            <h1 className="text-5xl font-black text-[#3A4A43] mb-8 tracking-tighter leading-tight">{item.title}</h1>
                            <div className="h-[1px] bg-gray-50 mb-8" />
                            <p className="text-gray-500 leading-relaxed text-lg font-medium">{item.description}</p>
                            
                            <div className="mt-12 bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-[#3A4A43] rounded-2xl overflow-hidden flex items-center justify-center text-white text-2xl font-black shadow-lg">
                                        {item.owner?.avatar_url ? (
                                            <img src={item.owner.avatar_url} className="w-full h-full object-cover" />
                                        ) : (
                                            item.owner?.username?.[0]?.toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-black text-xl text-[#3A4A43]">{item.owner?.username || 'Unknown'}</p>
                                            <CheckCircle2 size={16} className="text-[#748D83]" />
                                        </div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verified Seller</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button className="p-4 bg-white rounded-2xl border border-gray-200 text-gray-400 hover:text-[#3A4A43] transition-all"><Phone size={20} /></button>
                                    <button className="p-4 bg-white rounded-2xl border border-gray-200 text-gray-400 hover:text-[#3A4A43] transition-all"><Mail size={20} /></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-8">
                        {Number(currentUser?.id) === Number(item?.owner_id) ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }} 
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-[3.5rem] p-10 border-4 border-dashed border-gray-100 text-center"
                            >
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <User size={32} className="text-gray-300" />
                                </div>
                                <h3 className="text-3xl font-black text-[#3A4A43] mb-2">คุณเป็นเจ้าของรายการนี้</h3>
                                <p className="text-gray-400 text-sm mb-8 font-medium italic">เจ้าของไม่สามารถประมูลสินค้าตนเองได้ครับ</p>
                                
                                <div className="space-y-3">
                                    <Link href={`/dashboard/edit/${item.id}`} className="block">
                                        <button className="w-full py-5 bg-[#3A4A43] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-[#748D83] transition-all">
                                            แก้ไขข้อมูลสินค้า
                                        </button>
                                    </Link>
                                    
                                    {/* ✅ ปุ่มยกเลิกแบบมีเงื่อนไขเวลานับถอยหลัง */}
                                    {cancelTimer ? (
                                        <button 
                                            onClick={handleCancelListing}
                                            className="w-full py-5 bg-red-50 text-red-500 border border-red-100 font-black uppercase tracking-widest text-[11px] hover:bg-red-500 hover:text-white transition-all rounded-2xl flex flex-col items-center justify-center gap-1 group"
                                        >
                                            <span>ยกเลิกการประกาศขาย</span>
                                            <span className="text-[9px] opacity-60 font-bold">
                                                เหลือเวลา {cancelTimer.m}:{cancelTimer.s.toString().padStart(2, '0')} นาที
                                            </span>
                                        </button>
                                    ) : (
                                        <div className="py-5 bg-gray-50 text-gray-300 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                                            หมดสิทธิ์ยกเลิกรายการแล้ว
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-[#3A4A43] rounded-[3.5rem] p-10 text-white shadow-3xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-2">ราคาปัจจุบัน</p>
                                    <motion.h2 key={item.current_price} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="text-6xl font-black tracking-tighter mb-8 text-white">
                                        ฿{Number(item.current_price).toLocaleString()}
                                    </motion.h2>
                                    
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between bg-white/5 p-2 rounded-2xl border border-white/10">
                                            <button type="button" onClick={() => setBidAmount(bidAmount - Number(item.min_increment))} disabled={!isAuctionActive} className="p-4 bg-white/5 rounded-xl hover:bg-white/10 disabled:opacity-40 disabled:pointer-events-none"><Minus size={18} /></button>
                                            <span className="text-2xl font-black text-white">฿{bidAmount.toLocaleString()}</span>
                                            <button type="button" onClick={() => setBidAmount(bidAmount + Number(item.min_increment))} disabled={!isAuctionActive} className="p-4 bg-white rounded-xl text-[#3A4A43] hover:bg-[#748D83] hover:text-white disabled:opacity-40 disabled:pointer-events-none"><Plus size={18} /></button>
                                        </div>

                                        <button 
                                            onClick={handlePlaceBid} 
                                            disabled={bidding || !isAuctionActive} 
                                            className="w-full py-6 bg-[#748D83] hover:bg-white hover:text-[#3A4A43] text-white rounded-2xl font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-xl"
                                        >
                                            {bidding ? <Loader2 className="animate-spin text-white" /> : <><Gavel size={20} /> ยืนยันราคาประมูล</>}
                                        </button>
                                        <p className="text-center text-[9px] font-black text-white/30 uppercase tracking-widest flex items-center justify-center gap-2">
                                            <Wallet size={12} /> ยอดเงินของคุณ: ฿{userWallet?.balance?.toLocaleString() || 0}
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#748D83]/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                            </div>
                        )}

                        <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                <h3 className="font-black text-[#3A4A43] uppercase tracking-widest text-xs flex items-center gap-3">
                                    <Activity size={18} className="text-[#748D83]" /> ความเคลื่อนไหวการประมูล
                                </h3>
                                <div className="text-[10px] font-black bg-gray-50 px-3 py-1 rounded-full uppercase">{timeLeft()}</div>
                            </div>
                            
                            <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
                                <AnimatePresence>
                                    {bidLogs.length > 0 ? bidLogs.map((log, i) => (
                                        <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`flex items-center gap-4 p-4 rounded-3xl ${i === 0 ? 'bg-green-50 border border-green-100' : 'bg-white'}`}>
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                                                {log.user?.avatar_url ? <img src={log.user.avatar_url} className="w-full h-full object-cover" /> : <User size={18} className="text-gray-300" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-xs font-black text-[#3A4A43]">{log.user?.username || 'Guest'}</p>
                                                    <p className="text-sm font-black text-[#748D83]">฿{Number(log.amount).toLocaleString()}</p>
                                                </div>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">
                                                    {new Date(log.created_at).toLocaleTimeString()} • เสนอราคา
                                                </p>
                                            </div>
                                        </motion.div>
                                    )) : (
                                        <div className="p-10 text-center opacity-20"><Activity size={40} className="mx-auto mb-2" /><p className="text-[10px] font-black uppercase tracking-widest">ยังไม่มีการเสนอราคา</p></div>
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