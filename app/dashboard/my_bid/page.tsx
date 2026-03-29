"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    PackageCheck, ChevronRight, Loader2, ArrowLeft, 
    Info, Gavel, ShoppingBag, Sparkles, CheckCircle2 
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function MyBidPage() {
    const [bids, setBids] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem('wastebid_user') || '{}');
        setUser(u);
        if (u.id) fetchBids(u.id);
    }, []);

 const fetchBids = async (uid: number) => {
    setLoading(true);

    
    const { data: bidData } = await supabase
        .from('bids')
        .select('*, waste_listings(*)')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

    const { data: wonData } = await supabase
        .from('waste_listings')
        .select('*')
        .eq('current_bidder_id', uid);

    let finalBids: any[] = [];

    if (bidData) {
        const uniqueBidsMap = new Map();
        bidData.forEach((item: any) => {
            if (!uniqueBidsMap.has(item.listing_id)) {
                uniqueBidsMap.set(item.listing_id, item);
            }
        });
        finalBids = Array.from(uniqueBidsMap.values());
    }

    if (wonData) {
        wonData.forEach((item: any) => {
            const exists = finalBids.find(b => b.listing_id === item.id);
            if (!exists) {
                finalBids.push({
                    id: `won-${item.id}`,
                    listing_id: item.id,
                    bid_amount: item.current_price,
                    waste_listings: item
                });
            }
        });
    }

    setBids(finalBids);
    setLoading(false);
};

    const handleConfirm = async (listingId: number) => {
        if (!window.confirm("ยืนยันการรับสินค้า")) return;
        
        const { data, error } = await supabase.rpc('confirm_receipt', { 
            p_listing_id: listingId, 
            p_user_id: user.id 
        });

        if (error) {
            alert(` ผิดพลาด: ${error.message}`);
        } else {
            alert("ยืนยันการรับสินค้าสำเร็จ");
            fetchBids(user.id);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9F8] gap-4 font-kanit text-[#3A4A43]">
            <Loader2 className="animate-spin" size={40} strokeWidth={1.5} />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Loading your bids</p>
        </div>
    );

    return (
        <div className="bg-[#F8F9F8] min-h-screen font-kanit pb-32 pt-32 px-6">
            <main className="max-w-4xl mx-auto">
                
                {/*Header*/}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-4">
                        <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-[#3A4A43] transition-colors group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <ShoppingBag className="text-[#748D83]" size={32} />
                            <h1 className="text-6xl font-black text-[#3A4A43] tracking-tighter">MY <span className="text-[#748D83] opacity-30">BIDS</span></h1>
                        </div>
                    </div>
                </header>

                {/*Alert Banner*/}
                <div className="bg-[#3A4A43] p-8 rounded-[2.5rem] mb-12 shadow-xl relative overflow-hidden group">
                    <Sparkles className="absolute right-8 top-1/2 -translate-y-1/2 text-white/5 group-hover:scale-125 transition-transform duration-1000" size={120} />
                    <div className="relative z-10 flex gap-6 items-center">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-[#748D83] shrink-0 border border-white/10">
                            <Info size={24} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-white font-black uppercase tracking-widest text-xs">Escrow Protection Active</h4>
                            <p className="text-white/60 text-[11px] font-medium leading-relaxed max-w-md">
                                สำหรับรายการที่ท่านชนะหรือกดซื้อทันที กรุณากดปุ่ม <span className="text-[#748D83] font-black">CONFIRM RECEIPT</span> เมื่อได้รับของแล้ว เพื่อความปลอดภัยของผู้ขายและระบบ
                            </p>
                        </div>
                    </div>
                </div>

                {/*Bids List*/}
                <div className="space-y-4">
                    <AnimatePresence mode='popLayout'>
                        {bids.length > 0 ? bids.map((b, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={b.id} 
                                className="bg-white p-6 md:p-8 rounded-[3rem] border border-gray-100 flex flex-col md:flex-row items-center gap-8 shadow-sm hover:shadow-xl transition-all duration-500 group"
                            >
                                {/*Item Image*/}
                                <div className="relative shrink-0">
                                    <div className="w-24 h-24 rounded-[1.8rem] overflow-hidden bg-gray-50 border-4 border-white shadow-md">
                                        <img src={b.waste_listings.image_urls?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                    </div>
                                    {b.waste_listings.payment_status === 'completed' && (
                                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-2 border-white shadow-lg">
                                            <CheckCircle2 size={12} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>

                                {/*Content*/}
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                                        <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full tracking-widest ${
                                            b.waste_listings.status === 'sold' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                            {b.waste_listings.status === 'sold' ? 'Sold Out' : 'Active'}
                                        </span>
                                        <h3 className="font-black text-[#3A4A43] text-xl tracking-tight leading-none truncate">
                                            {b.waste_listings.title}
                                        </h3>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-4 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><Gavel size={12} className="text-[#748D83]" /> ฿{b.bid_amount.toLocaleString()}</span>
                                        <span>•</span>
                                        <span>ID: #{b.waste_listings.id}</span>
                                    </div>
                                </div>

                                {/*Action Buttons*/}
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    {b.waste_listings.payment_status === 'escrow' && b.waste_listings.current_bidder_id === user?.id ? (
                                        <motion.button 
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleConfirm(b.waste_listings.id)} 
                                            className="flex-1 md:flex-none px-8 py-4 bg-[#3A4A43] text-white text-[10px] font-black rounded-2xl uppercase tracking-[0.2em] shadow-lg shadow-[#3A4A43]/20 hover:bg-[#748D83] transition-all flex items-center justify-center gap-3"
                                        >
                                            <PackageCheck size={16} />
                                            <span>Confirm Receipt</span>
                                        </motion.button>
                                    ) : (
                                        <div className="flex-1 md:flex-none px-6 py-4 bg-gray-50 text-gray-300 text-[9px] font-black rounded-2xl uppercase tracking-widest text-center">
                                            {b.waste_listings.payment_status === 'completed' ? 'Transaction Success' : 'Pending Status'}
                                        </div>
                                    )}
                                    <Link href={`/listings/${b.waste_listings.id}`} className="p-4 bg-gray-50 rounded-2xl text-gray-300 hover:bg-[#3A4A43] hover:text-white transition-all">
                                        <ChevronRight size={20} />
                                    </Link>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="py-32 flex flex-col items-center justify-center text-center opacity-20">
                                <Gavel size={64} className="mb-6" strokeWidth={1} />
                                <h3 className="text-xl font-black uppercase tracking-[0.3em]">No Bids Found</h3>
                                <p className="text-xs font-bold mt-2">ท่านยังไม่ได้ทำการประมูลสินค้า</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}