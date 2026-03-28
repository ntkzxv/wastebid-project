"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft, DollarSign, Clock, MapPin,
    Loader2, CheckCircle2, Image as ImageIcon,
    FileText, AlignLeft, Tag, Zap, Sparkles,
    Gavel, Trash2, Calendar,
    ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import ImageUploadDropzone from '../../components/ImageUploadDropzone';

const LocationPickerMap = dynamic(() => import('../../components/LocationPickerMap'), {
    ssr: false,
    loading: () => (
        <div className="h-[320px] w-full bg-[#F8F9F8] animate-pulse rounded-[2rem] flex flex-col items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-300 border border-dashed border-gray-200">
            <MapPin className="mb-2" size={24} />
            Initializing Premium Map...
        </div>
    ),
});

const FormCard = ({ children, icon: Icon, title, description, delay = 0 }: any) => (
    <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-8"
    >
        <div className="flex items-center gap-4 pb-6 border-b border-gray-50">
            <div className="p-3.5 rounded-2xl bg-[#F8F9F8] text-[#3A4A43]">
                <Icon size={20} strokeWidth={2} />
            </div>
            <div>
                <h2 className="font-black text-[#3A4A43] uppercase tracking-tight leading-none">{title}</h2>
                {description && <p className="text-gray-400 text-xs mt-1 font-medium">{description}</p>}
            </div>
        </div>
        <div className="space-y-6">{children}</div>
    </motion.section>
);

export default function CreateListingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Metal');
    const [location, setLocation] = useState('');
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [startPrice, setStartPrice] = useState('');
    const [buyNowPrice, setBuyNowPrice] = useState('');
    const [minIncrement, setMinIncrement] = useState('100');
    const [endTime, setEndTime] = useState('');
    const [images, setImages] = useState<File[]>([]);

    useEffect(() => {
        const savedUser = localStorage.getItem('wastebid_user');
        if (!savedUser) { router.push('/auth/login'); return; }
        setUser(JSON.parse(savedUser));
    }, [router]);

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
                setLocation(addressParts.join(' ') || data.display_name);
            }
        } catch (err) { console.error(err); }
    };

    const uploadImages = async (files: File[]) => {
        const uploadedUrls = [];
        for (const file of files) {
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
            const filePath = `${user.id}/${fileName}`;
            await supabase.storage.from('listings').upload(filePath, file);
            const { data } = supabase.storage.from('listings').getPublicUrl(filePath);
            uploadedUrls.push(data.publicUrl);
        }
        return uploadedUrls;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (images.length === 0) return alert("❌ กรุณาอัปโหลดรูปภาพสินค้า");
        if (!coords) return alert("📍 กรุณาปักหมุดตำแหน่งนัดรับ");

        setLoading(true);
        try {
            const imageUrls = await uploadImages(images);
            const { error } = await supabase.from('waste_listings').insert([{
                title, description, category, location, lat: coords.lat, lng: coords.lng,
                start_price: parseFloat(startPrice),
                current_price: parseFloat(startPrice),
                buy_it_now_price: buyNowPrice ? parseFloat(buyNowPrice) : null,
                min_increment: parseFloat(minIncrement),
                start_time: new Date().toISOString(),
                end_time: new Date(endTime).toISOString(),
                owner_id: user.id, status: 'open', image_urls: imageUrls
            }]);
            if (error) throw error;
            alert("🎉 สินค้าของคุณขึ้นระบบประมูลเรียบร้อยแล้ว!");
            router.push('/dashboard');
        } catch (error: any) { alert(error.message); } finally { setLoading(false); }
    };

    const inputClasses = 'w-full mt-2 px-5 py-4 rounded-2xl border border-gray-100 bg-[#F8F9F8] text-sm font-bold text-[#3A4A43] outline-none focus:ring-4 focus:ring-[#748D83]/10 focus:bg-white transition-all duration-300 placeholder:text-gray-300';
    const labelCls = 'text-[10px] font-black uppercase tracking-[0.2em] text-[#748D83] ml-1';

    return (
        <div className="bg-[#F8F9F8] min-h-screen font-kanit pb-32 pt-32 px-6">
            <main className="max-w-6xl mx-auto">
                
                {/* --- Header Section --- */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div className="space-y-4">
                        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#3A4A43] transition-colors group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Back to Dashboard</span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Sparkles className="text-[#748D83]" size={32} />
                            <h1 className="text-6xl font-black text-[#3A4A43] tracking-tighter">CREATE<br /><span className="text-[#748D83] opacity-30 text-5xl">LISTING</span></h1>
                        </div>
                    </div>
                    <div className="hidden lg:block bg-white px-6 py-4 rounded-[1.5rem] border border-gray-100 shadow-sm">
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Selling as</p>
                        <p className="text-sm font-black text-[#3A4A43]">{user?.username}</p>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    
                    {/* --- Left Column: Form Details --- */}
                    <div className="lg:col-span-8 space-y-10">
                        
                        <FormCard icon={FileText} title="General Information" description="ระบุชื่อและหมวดหมู่ของขยะที่ต้องการประมูล">
                            <div className="space-y-6">
                                <div>
                                    <label className={labelCls}>ชื่อรายการสินค้า</label>
                                    <input required type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="เช่น เหล็กเส้นสภาพดี 50 กิโลกรัม" className={inputClasses} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelCls}>หมวดหมู่ขยะ</label>
                                        <select value={category} onChange={e => setCategory(e.target.value)} className={inputClasses}>
                                            <option value="Metal">โลหะ / เหล็ก</option>
                                            <option value="Plastic">พลาสติก</option>
                                            <option value="Paper">กระดาษ</option>
                                            <option value="Electronic">ขยะอิเล็กทรอนิกส์</option>
                                            <option value="Other">อื่นๆ</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelCls}>พิกัดจุดนัดรับ</label>
                                        <div className="relative">
                                            <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                                            <input required type="text" value={location} onChange={e => setLocation(e.target.value)} className={`${inputClasses} pl-12`} />
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-[2rem] overflow-hidden border border-gray-100 shadow-inner">
                                    <LocationPickerMap value={coords} onChange={handleMapChange} />
                                </div>
                            </div>
                        </FormCard>

                        <FormCard icon={Gavel} title="Bidding Rules" description="กำหนดราคาเริ่มต้นและระยะเวลาการประมูล">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className={labelCls}>ราคาเริ่มต้น (บาท)</label>
                                        <div className="relative">
                                            <DollarSign size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                                            <input required type="number" value={startPrice} onChange={e => setStartPrice(e.target.value)} placeholder="0.00" className={`${inputClasses} pl-12 tabular-nums`} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelCls}>เคาะขั้นต่ำครั้งละ</label>
                                        <input required type="number" value={minIncrement} onChange={e => setMinIncrement(e.target.value)} className={inputClasses} />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-amber-50/30 p-6 rounded-[2rem] border border-amber-100/50">
                                        <label className={`${labelCls} text-amber-600`}>⚡ ราคาซื้อเลย (Buy It Now)</label>
                                        <input type="number" value={buyNowPrice} onChange={e => setBuyNowPrice(e.target.value)} placeholder="ไม่ต้องใส่หากไม่ต้องการ" className={`${inputClasses} bg-white border-amber-100 focus:ring-amber-400/10 focus:border-amber-200 text-amber-600`} />
                                        <p className="text-[8px] font-bold text-amber-400 uppercase mt-3 tracking-widest italic">* ระบบจะปิดการซื้อทันทีหากราคาประมูลแตะ 70%</p>
                                    </div>
                                    <div>
                                        <label className={labelCls}>วันและเวลาสิ้นสุด</label>
                                        <div className="relative">
                                            <Calendar size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                                            <input required type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className={`${inputClasses} pl-12`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </FormCard>

                        <FormCard icon={AlignLeft} title="Item Description" description="รายละเอียดเพิ่มเติมเพื่อช่วยในการตัดสินใจ">
                             <textarea required rows={6} value={description} onChange={e => setDescription(e.target.value)} placeholder="ระบุสภาพของขยะ, น้ำหนักโดยประมาณ, หรือข้อมูลอื่นๆ..." className={`${inputClasses} resize-none`} />
                        </FormCard>
                    </div>

                    {/* --- Right Column: Media & Publish --- */}
                    <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-32">
                        
                        <div className="bg-[#3A4A43] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center gap-3">
                                    <ImageIcon size={20} className="text-[#748D83]" />
                                    <h3 className="font-black text-sm uppercase tracking-widest">Media Assets</h3>
                                </div>
                                <ImageUploadDropzone onImagesChange={setImages} maxImages={5} />
                                <div className="space-y-4 pt-4">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-white/40 tracking-widest">
                                        <span>Listing Fee</span>
                                        <span className="text-white">Free</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-white/40 tracking-widest">
                                        <span>Sales Commission</span>
                                        <span className="text-white">10%</span>
                                    </div>
                                    <div className="h-px bg-white/10" />
                                    <button 
                                        type="submit" 
                                        disabled={loading} 
                                        className="w-full bg-white text-[#3A4A43] hover:bg-[#748D83] hover:text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all duration-500 shadow-xl disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <Loader2 className="animate-spin mx-auto" />
                                        ) : (
                                            <div className="flex items-center justify-center gap-2">
                                                <Zap size={16} />
                                                Publish Auction
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                            <h4 className="font-black text-[10px] uppercase text-[#3A4A43] tracking-widest mb-4 flex items-center gap-2">
                                <ShieldCheck size={14} className="text-[#748D83]" /> 
                                WasteBid Safety
                            </h4>
                            <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                                การลงขายสินค้าต้องเป็นขยะรีไซเคิลที่ถูกต้องตามกฎหมายเท่านั้น ระบบ Escrow ของเราจะปกป้องเงินของคุณจนกว่าผู้ซื้อจะกดยืนยันรับสินค้า
                            </p>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}