"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Search, MapPin, Loader2, Filter, Sparkles, Navigation, ArrowUpRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const CAT_MAP = [
    { label: "All Assets", value: "All" },
    { label: "Metals", value: "Metal" },
    { label: "Plastics", value: "Plastic" },
    { label: "Paper", value: "Paper" },
    { label: "Electronics", value: "Electronic" },
    { label: "Others", value: "Other" }
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

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } },
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
    };

    return (
        <div className="bg-[#FAFAFA] min-h-screen font-sans pt-32 px-6 md:px-12 pb-32 selection:bg-emerald-200">
            <div className="max-w-7xl mx-auto">
                
                {/* --- Premium Header Section --- */}
                <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-widest border border-emerald-100">
                            <Sparkles size={14} /> <span>Live Marketplace</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-950 tracking-tighter leading-[0.9]">
                            Discover <br /> <span className="text-slate-300">Materials.</span>
                        </h1>
                    </motion.div>

                    {/* Dribbble Style Search Bar */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full md:max-w-md relative group">
                        <div className="absolute inset-0 bg-emerald-500/5 blur-xl rounded-full transition-all group-hover:bg-emerald-500/10" />
                        <div className="relative flex items-center bg-white border border-slate-200 rounded-full p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus-within:ring-4 ring-emerald-50 transition-all">
                            <div className="pl-4 pr-2 text-slate-400">
                                <Search size={20} strokeWidth={2.5} />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search by name or location..." 
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)} 
                                className="w-full py-3 bg-transparent outline-none text-base font-medium text-slate-900 placeholder:text-slate-400" 
                            />
                        </div>
                    </motion.div>
                </header>

                {/* --- Categories Filter (Pill style) --- */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-12 overflow-x-auto pb-4 no-scrollbar">
                    {CAT_MAP.map((c) => (
                        <button 
                            key={c.value} 
                            onClick={() => setSelectedCat(c.value)} 
                            className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                                selectedCat === c.value 
                                ? 'bg-slate-950 text-white shadow-lg shadow-slate-900/20' 
                                : 'bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 shadow-sm'
                            }`}
                        >
                            {c.label}
                        </button>
                    ))}
                </motion.div>

                {/* --- Listing Grid --- */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="animate-pulse bg-white rounded-[32px] p-4 border border-slate-100 shadow-sm aspect-[3/4]" />
                        ))}
                    </div>
                ) : (
                    <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        <AnimatePresence mode='popLayout'>
                            {filtered.length > 0 ? filtered.map((item) => (
                                <motion.div 
                                    layout
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    key={item.id} 
                                    className="group"
                                >
                                    <Link href={`/listings/${item.id}`}>
                                        <div className="bg-white rounded-[32px] p-3 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 group-hover:-translate-y-2 h-full flex flex-col">
                                            {/* Image */}
                                            <div className="relative w-full aspect-[4/3] rounded-[24px] overflow-hidden bg-slate-100 mb-5">
                                                <img 
                                                    src={item.image_urls?.[0] || "https://images.unsplash.com/photo-1558610530-5896a2472648?q=80&w=800"} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                                                    alt={item.title}
                                                />
                                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                                                    <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{item.category}</p>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="px-3 pb-3 flex flex-col flex-1 justify-between">
                                                <div>
                                                    <div className="flex items-center gap-1.5 text-slate-400 mb-2">
                                                        <MapPin size={14} />
                                                        <p className="text-xs font-semibold truncate">{item.location}</p>
                                                    </div>
                                                    <h3 className="font-extrabold text-slate-900 text-lg line-clamp-2 leading-tight mb-4 group-hover:text-emerald-600 transition-colors">
                                                        {item.title}
                                                    </h3>
                                                </div>
                                                
                                                <div className="flex justify-between items-end pt-4 border-t border-slate-50 mt-auto">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Bid</p>
                                                        <p className="text-2xl font-black text-slate-950 tabular-nums tracking-tighter">
                                                            ฿{Number(item.current_price).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                                                        <ArrowUpRight size={20} strokeWidth={2.5} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            )) : (
                                <div className="col-span-full py-32 flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                        <Search size={32} className="text-slate-300" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">No Items Found</h3>
                                    <p className="text-slate-500">Try adjusting your search or filter criteria.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
}