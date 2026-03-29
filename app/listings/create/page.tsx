"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Package, DollarSign, Clock, MapPin, Tag, AlignLeft, Image as ImageIcon, Sparkles, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// --- นำเข้า Map Component กลับมา ---
const LocationPickerMap = dynamic(() => import('../../components/LocationPickerMap'), {
    ssr: false,
    loading: () => (
        <div className="h-[300px] w-full bg-slate-50 animate-pulse rounded-[24px] flex flex-col items-center justify-center text-xs font-bold uppercase tracking-widest text-slate-400 border border-slate-200">
            <MapPin className="mb-2 w-6 h-6 text-slate-300" />
            Loading Premium Map...
        </div>
    ),
});

const CATEGORIES = ["Metal", "Plastic", "Paper", "Electronic", "Other"];

export default function CreateListingPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State (เพิ่ม coords กลับมา)
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Metal',
        location: '',
        starting_price: '',
        min_increment: '',
        buy_it_now_price: '',
        end_time: '',
    });

    useEffect(() => {
        const saved = localStorage.getItem('wastebid_user');
        if (saved) {
            setCurrentUser(JSON.parse(saved));
        } else {
            router.push('/auth/login');
        }
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- Logic ปักหมุดแล้วดึงชื่อสถานที่ (ของเดิมของคุณ) ---
    const handleMapChange = async (newCoords: { lat: number; lng: number }) => {
        setCoords(newCoords);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${newCoords.lat}&lon=${newCoords.lng}&accept-language=th`);
            const data = await res.json();
            if (data.address) {
                const a = data.address;
                const addressParts = [
                    a.house_number || a.building || '',
                    a.road ? `ถ.${a.road}` : '',
                    a.suburb || a.subdistrict || a.village || '',
                    a.city_district || a.district || '',
                    a.province || a.city || '',
                    a.postcode || ''
                ].filter(p => p !== '');
                setFormData(prev => ({ ...prev, location: addressParts.join(' ') || data.display_name }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        if (!coords) return alert("📍 กรุณาปักหมุดตำแหน่งนัดรับบนแผนที่"); // Validation แผนที่

        setLoading(true);

        const newListing = {
            owner_id: currentUser.id,
            title: formData.title,
            description: formData.description,
            category: formData.category,
            location: formData.location,
            lat: coords.lat,
            lng: coords.lng,
            start_price: parseFloat(formData.starting_price), // 🔥 เพิ่มบรรทัดนี้ เพื่อให้ตรง DB
            current_price: parseFloat(formData.starting_price),
            min_increment: parseFloat(formData.min_increment),
            buy_it_now_price: formData.buy_it_now_price ? parseFloat(formData.buy_it_now_price) : null,
            // start_time ไม่ต้องส่ง เพราะเราทำ Default ใน DB ไว้แล้ว
            end_time: new Date(formData.end_time).toISOString(),
            status: 'open',
            version: 1,
            image_urls: ["https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=800"],
        };

        const { data, error } = await supabase.from('waste_listings').insert([newListing]).select().single();

        setLoading(false);
        if (error) {
            alert(error.message);
        } else {
            setSuccess(true);
            setTimeout(() => {
                router.push(`/listings/${data.id}`);
            }, 1500);
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-12 rounded-[40px] shadow-2xl flex flex-col items-center text-center max-w-sm">
                    <CheckCircle2 size={80} className="text-emerald-500 mb-6" />
                    <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Listing Created!</h2>
                    <p className="text-slate-500 font-medium">Your asset is now live on the marketplace.</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="bg-[#FAFAFA] min-h-screen pt-32 pb-40 px-6 md:px-12 selection:bg-emerald-200">
            <div className="max-w-6xl mx-auto">

                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-widest border border-emerald-100 mb-6">
                        <Sparkles size={14} /> <span>Create Listing</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-950 tracking-tighter leading-[0.9]">
                        Sell your <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Materials.</span>
                    </h1>
                </motion.div>

                <form onSubmit={handleSubmit}>
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        <div className="lg:col-span-8 space-y-8">

                            <motion.div variants={cardVariants} className="bg-white p-8 md:p-10 rounded-[40px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                <h3 className="text-2xl font-extrabold text-slate-900 mb-8 flex items-center gap-3">
                                    <Package className="text-emerald-500" /> Basic Information
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 uppercase tracking-widest mb-2">Listing Title</label>
                                        <div className="relative">
                                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                            <input required type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., 500kg of Recycled Copper Wire" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-4 ring-emerald-50 focus:border-emerald-500 transition-all font-medium text-slate-900 placeholder:text-slate-400" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 uppercase tracking-widest mb-2">Category</label>
                                            <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-4 ring-emerald-50 focus:border-emerald-500 transition-all font-medium text-slate-900 appearance-none">
                                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 uppercase tracking-widest mb-2">Location Text</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                                <input required type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Auto-filled from map or type here" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-4 ring-emerald-50 focus:border-emerald-500 transition-all font-medium text-slate-900 placeholder:text-slate-400" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- เพิ่ม Map Component กลับเข้ามาใน UI อย่างแนบเนียน --- */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 uppercase tracking-widest mb-2 flex justify-between items-center">
                                            <span>Pin Location</span>
                                            {!coords && <span className="text-rose-500 text-[10px]">* Required</span>}
                                        </label>
                                        <div className="rounded-[24px] overflow-hidden border border-slate-200 shadow-inner relative z-0">
                                            <LocationPickerMap value={coords} onChange={handleMapChange} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 uppercase tracking-widest mb-2 mt-2">Description</label>
                                        <div className="relative">
                                            <AlignLeft className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                                            <textarea required name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe the material quality, quantity, and pickup conditions..." className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-4 ring-emerald-50 focus:border-emerald-500 transition-all font-medium text-slate-900 placeholder:text-slate-400 resize-none" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div variants={cardVariants} className="bg-white p-8 md:p-10 rounded-[40px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                <h3 className="text-2xl font-extrabold text-slate-900 mb-8 flex items-center gap-3">
                                    <DollarSign className="text-emerald-500" /> Pricing & Auction Rules
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 uppercase tracking-widest mb-2">Starting Price (฿)</label>
                                        <input required type="number" min="0" name="starting_price" value={formData.starting_price} onChange={handleChange} placeholder="0.00" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-4 ring-emerald-50 focus:border-emerald-500 transition-all font-black text-2xl text-slate-900 placeholder:text-slate-300" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 uppercase tracking-widest mb-2">Min. Increment (฿)</label>
                                        <input required type="number" min="1" name="min_increment" value={formData.min_increment} onChange={handleChange} placeholder="100.00" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-4 ring-emerald-50 focus:border-emerald-500 transition-all font-black text-2xl text-slate-900 placeholder:text-slate-300" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 uppercase tracking-widest mb-2">Buy It Now Price (฿) <span className="text-slate-400 font-normal lowercase tracking-normal">(Optional)</span></label>
                                        <input type="number" min="0" name="buy_it_now_price" value={formData.buy_it_now_price} onChange={handleChange} placeholder="0.00" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-4 ring-emerald-50 focus:border-emerald-500 transition-all font-black text-2xl text-amber-500 placeholder:text-slate-300" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 uppercase tracking-widest mb-2">End Time</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                            <input required type="datetime-local" name="end_time" value={formData.end_time} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-4 ring-emerald-50 focus:border-emerald-500 transition-all font-medium text-slate-900" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <div className="lg:col-span-4 space-y-8 relative">
                            <div className="sticky top-32 space-y-8">

                                <motion.div variants={cardVariants} className="bg-slate-950 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                                    <h3 className="text-xl font-extrabold mb-6 flex items-center gap-3">
                                        <ImageIcon className="text-emerald-400" /> Media
                                    </h3>

                                    <div className="border-2 border-dashed border-white/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                                        <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Sparkles className="text-emerald-400 w-6 h-6" />
                                        </div>
                                        <p className="font-bold text-sm mb-1">Upload Images</p>
                                        <p className="text-xs text-slate-400">PNG, JPG up to 5MB</p>
                                    </div>
                                </motion.div>

                                <motion.button variants={cardVariants} type="submit" disabled={loading} className="w-full relative overflow-hidden group rounded-[32px] bg-gradient-to-r from-emerald-500 to-teal-600 p-1 shadow-xl shadow-emerald-500/20">
                                    <div className="bg-emerald-600 rounded-[28px] p-6 flex items-center justify-between transition-colors group-hover:bg-emerald-500">
                                        <div className="text-left text-white">
                                            <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-80">Ready to go?</p>
                                            <p className="text-2xl font-black">Publish Listing</p>
                                        </div>
                                        {loading ? (
                                            <Loader2 className="animate-spin text-white w-8 h-8" />
                                        ) : (
                                            <ArrowRight className="text-white w-8 h-8 group-hover:translate-x-2 transition-transform" />
                                        )}
                                    </div>
                                </motion.button>

                            </div>
                        </div>

                    </motion.div>
                </form>
            </div>
        </div>
    );
}