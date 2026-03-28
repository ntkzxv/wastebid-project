"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, ChevronRight, Loader2, Filter, Sparkles, Navigation } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const CAT_MAP = [
    { label: "ทั้งหมด", value: "All" },
    { label: "โลหะ", value: "Metal" },
    { label: "พลาสติก", value: "Plastic" },
    { label: "กระดาษ", value: "Paper" },
    { label: "อิเล็กทรอนิกส์", value: "Electronic" },
    { label: "อื่นๆ", value: "Other" }
];

export default function MarketplacePage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCat, setSelectedCat] = useState("All");

    useEffect(() => { fetchItems(); }, []);

    const fetchItems = async () => {
        const { data } = await supabase
            .from('waste_listings')
            .select('*')
            .eq('status', 'open')
            .order('created_at', { ascending: false });
        setItems(data || []); 
        setLoading(false);
    };

    const filtered = useMemo(() => {
        return items.filter(i => 
            (selectedCat === "All" || i.category === selectedCat) && 
            (i.title.toLowerCase().includes(searchTerm.toLowerCase()) || i.location?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [items, searchTerm, selectedCat]);

    return (
        <div className="bg-[#F8F9F8] min-h-screen font-kanit pt-32 px-6 pb-32">
            <div className="max-w-7xl mx-auto">
                
                {/* --- Header Section --- */}
                <header className="relative mb-16">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-2 text-[#748D83] font-bold text-xs uppercase tracking-[0.3em]">
                                <Sparkles size={14} /> 
                                <span>Discover Premium Waste</span>
                            </div>
                            <h1 className="text-7xl md:text-8xl font-black text-[#3A4A43] tracking-tighter leading-[0.9]">
                                MARKET<br />
                                <span className="text-[#748D83] opacity-30">PLACE</span>
                            </h1>
                        </motion.div>

                        {/* --- Search Bar --- */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative w-full lg:max-w-md group"
                        >
                            <div className="absolute inset-0 bg-[#748D83]/5 blur-2xl group-hover:bg-[#748D83]/10 transition-all rounded-full" />
                            <div className="relative flex items-center bg-white border border-gray-100 rounded-[2rem] p-2 shadow-sm focus-within:shadow-xl focus-within:border-[#748D83]/30 transition-all duration-500">
                                <div className="pl-5 pr-3 text-gray-300">
                                    <Search size={20} strokeWidth={2.5} />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="ค้นหาขยะรีไซเคิล หรือพิกัด..." 
                                    value={searchTerm} 
                                    onChange={e => setSearchTerm(e.target.value)} 
                                    className="w-full py-4 bg-transparent outline-none text-sm font-bold text-[#3A4A43] placeholder:text-gray-300" 
                                />
                            </div>
                        </motion.div>
                    </div>
                </header>

                {/* --- Categories Filter --- */}
                <div className="flex items-center gap-4 mb-12 overflow-x-auto no-scrollbar pb-4">
                    <div className="flex items-center gap-2 pr-4 border-r border-gray-200 text-gray-400">
                        <Filter size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Filters</span>
                    </div>
                    <div className="flex gap-3">
                        {CAT_MAP.map((c, idx) => (
                            <motion.button 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={c.value} 
                                onClick={() => setSelectedCat(c.value)} 
                                className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                                    selectedCat === c.value 
                                    ? 'bg-[#3A4A43] text-white shadow-2xl shadow-[#3A4A43]/30 scale-105' 
                                    : 'bg-white text-gray-400 hover:text-[#3A4A43] border border-gray-100'
                                }`}
                            >
                                {c.label}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* --- Content Grid --- */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="space-y-5">
                                <div className="aspect-[4/5] bg-gray-200 rounded-[2.5rem] animate-pulse" />
                                <div className="h-4 w-2/3 bg-gray-200 rounded-full animate-pulse" />
                                <div className="h-4 w-1/2 bg-gray-100 rounded-full animate-pulse" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {filtered.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                                <AnimatePresence mode='popLayout'>
                                    {filtered.map((item, idx) => (
                                        <motion.div 
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                                            key={item.id} 
                                            className="group relative"
                                        >
                                            <Link href={`/listings/${item.id}`}>
                                                <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm group-hover:shadow-[0_30px_60px_-15px_rgba(58,74,67,0.15)] transition-all duration-700">
                                                    {/* Image Wrapper */}
                                                    <div className="aspect-[4/5] relative overflow-hidden">
                                                        <img 
                                                            src={item.image_urls?.[0]} 
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" 
                                                            alt={item.title}
                                                        />
                                                        {/* Category Overlay */}
                                                        <div className="absolute top-5 left-5">
                                                            <div className="bg-white/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/50 shadow-sm">
                                                                <p className="text-[9px] font-black text-[#3A4A43] uppercase tracking-[0.1em]">{item.category}</p>
                                                            </div>
                                                        </div>
                                                        {/* Location Overlay */}
                                                        <div className="absolute bottom-5 left-5 flex items-center gap-1.5 text-white bg-[#3A4A43]/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
                                                            <Navigation size={10} strokeWidth={3} />
                                                            <p className="text-[9px] font-bold truncate max-w-[120px]">{item.location}</p>
                                                        </div>
                                                    </div>

                                                    {/* Card Content */}
                                                    <div className="p-8">
                                                        <h3 className="font-black text-[#3A4A43] text-xl line-clamp-1 mb-6 leading-tight group-hover:text-[#748D83] transition-colors">
                                                            {item.title}
                                                        </h3>
                                                        <div className="flex justify-between items-end pt-6 border-t border-gray-50">
                                                            <div className="space-y-1">
                                                                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Current Bid</p>
                                                                <p className="text-2xl font-black text-[#3A4A43] tabular-nums tracking-tighter">
                                                                    ฿{Number(item.current_price).toLocaleString()}
                                                                </p>
                                                            </div>
                                                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-[#3A4A43] group-hover:text-white group-hover:rotate-[-45deg] transition-all duration-500 shadow-sm group-hover:shadow-lg group-hover:shadow-[#3A4A43]/20">
                                                                <ChevronRight size={20} strokeWidth={3} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center py-40 text-center"
                            >
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-300">
                                    <Search size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-[#3A4A43] mb-2 uppercase tracking-tight">ไม่พบรายการที่ค้นหา</h3>
                                <p className="text-gray-400 text-sm font-medium">ลองเปลี่ยนคำค้นหา หรือหมวดหมู่ใหม่อีกครั้ง</p>
                            </motion.div>
                        )}
                    </>
                )}
            </div>

            {/* --- Premium Scroll Indicator (Optional) --- */}
            {!loading && filtered.length > 0 && (
                <div className="mt-20 flex flex-col items-center gap-4">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">End of Collection</p>
                    <div className="w-px h-12 bg-gradient-to-b from-gray-200 to-transparent" />
                </div>
            )}
        </div>
    );
}