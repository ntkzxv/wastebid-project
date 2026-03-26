"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Upload, DollarSign, Clock, MapPin,
    Tag, Loader2, CheckCircle2, Image as ImageIcon,
    FileText, AlignLeft, CalendarDays, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// sub-component สำหรับ DropZone รูปภาพ
import ImageUploadDropzone from '../../components/ImageUploadDropzone';

// --- Card Animation Wrapper ---
const FormCard = ({ children, icon: Icon, title, description, delay = 0 }: any) => (
    <motion.section
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay, duration: 0.5 }}
        className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm space-y-6"
    >
        <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-[#748D83]/10 rounded-xl text-[#748D83]">
                <Icon size={20} />
            </div>
            <div>
                <h2 className="font-black text-[#3A4A43] leading-tight">{title}</h2>
                {description && <p className="text-gray-400 text-xs mt-1">{description}</p>}
            </div>
        </div>
        <div className="space-y-5">
            {children}
        </div>
    </motion.section>
);

export default function CreateListingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    // --- 📝 Form States ---
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Metal');
    const [location, setLocation] = useState('');
    const [startPrice, setStartPrice] = useState('');
    const [minIncrement, setMinIncrement] = useState('100');
    const [endTime, setEndTime] = useState('');

    // --- 📸 Image State ---
    const [images, setImages] = useState<File[]>([]);

    useEffect(() => {
        const savedUser = localStorage.getItem('wastebid_user');
        if (!savedUser) {
            alert("กรุณาล็อกอินก่อนลงขายครับ!");
            router.push('/auth/login');
            return;
        }
        setUser(JSON.parse(savedUser));
    }, []);

    // 🚀 ฟังก์ชันอัปโหลดรูปไป Supabase Storage จริงๆ
    const uploadImages = async (files: File[]) => {
        const uploadedUrls = [];
        for (const file of files) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('listings')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('listings').getPublicUrl(filePath);
            uploadedUrls.push(data.publicUrl);
        }
        return uploadedUrls;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (images.length === 0) {
            alert("❌ กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป");
            return;
        }

        setLoading(true);

        try {
            // 🚀 STEP 1: อัปโหลดรูปภาพจริง
            const imageUrls = await uploadImages(images);

            // 🚀 STEP 2: บันทึกข้อมูลลง Database
            const { data, error } = await supabase
                .from('waste_listings')
                .insert([
                    {
                        title,
                        description,
                        category,
                        location,
                        start_price: parseFloat(startPrice),
                        current_price: parseFloat(startPrice),
                        min_increment: parseFloat(minIncrement),

                        // ✅ เพิ่มบรรทัดนี้เข้าไป! (บอกว่าเริ่มประมูล "เดี๋ยวนี้")
                        start_time: new Date().toISOString(),

                        end_time: new Date(endTime).toISOString(),
                        owner_id: user.id,
                        status: 'open',
                        image_urls: imageUrls
                    }
                ])
                .select();

            if (error) throw error;

            alert("🎉 ลงประกาศขายสำเร็จ!");
            router.push('/dashboard');
        } catch (error: any) {
            console.error("Error:", error);
            alert(`ผิดพลาด: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // 🎨 ตัวแปรคุมสี Input ให้เข้มชัดเจน
    const inputClasses = "w-full mt-2 p-4 bg-[#F8F9F8] border border-gray-50 rounded-2xl outline-none focus:border-[#748D83] transition-all text-sm font-bold text-[#1A1A1A] placeholder:text-gray-400 shadow-inner";

    return (
        <div className="bg-[#FAFAFA] min-h-screen font-kanit pb-20">
            <main className="max-w-7xl mx-auto px-6 py-12 antialiased">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10 pb-4 border-b border-gray-100">
                    <Link href="/dashboard">
                        <button className="p-3.5 bg-white rounded-full border border-gray-100 shadow-sm hover:bg-gray-50 transition-all text-gray-400">
                            <ArrowLeft size={20} />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-[#2D3A2E] tracking-tight">ลงประกาศขายขยะ</h1>
                        <p className="text-gray-400 text-sm mt-1">กรอกรายละเอียดและอัปโหลดรูปภาพเพื่อเริ่มการประมูล</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-10 items-start">

                    <div className="space-y-8">
                        {/* ส่วนที่ 1: ข้อมูลสินค้า */}
                        <FormCard icon={FileText} title="ข้อมูลสินค้าพื้นฐาน" description="ชื่อ, หมวดหมู่ และพิกัดรับของ">
                            <div>
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">ชื่อรายการขยะ</label>
                                <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น เศษเหล็กเกรด A, สายไฟเก่า 10kg" className={inputClasses} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">หมวดหมู่</label>
                                    <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClasses}>
                                        <option value="Metal">โลหะ / เหล็ก</option>
                                        <option value="Plastic">พลาสติก</option>
                                        <option value="Paper">กระดาษ</option>
                                        <option value="Electronic">ขยะอิเล็กทรอนิกส์</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">พิกัดรับของ (จังหวัด/พื้นที่)</label>
                                    <div className="relative">
                                        <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input required type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="ปทุมธานี, ลาดหลุมแก้ว" className={`${inputClasses} pl-12`} />
                                    </div>
                                </div>
                            </div>
                        </FormCard>

                        {/* ส่วนที่ 2: ตั้งราคาและเวลา (แก้ให้เลือกเวลาได้ชัดเจน) */}
                        <FormCard icon={AlignLeft} title="รายละเอียดประมูล" description="ตั้งราคาเริ่มต้น เคาะขั้นต่ำ และวันเวลาที่สิ้นสุด" delay={0.1}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">ราคาเริ่มต้น (บาท)</label>
                                    <div className="relative mt-2">
                                        <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input required type="number" value={startPrice} onChange={(e) => setStartPrice(e.target.value)} placeholder="0" className={`${inputClasses} pl-12 text-lg font-black`} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">เคาะขั้นต่ำครั้งละ (บาท)</label>
                                    <input required type="number" value={minIncrement} onChange={(e) => setMinIncrement(e.target.value)} className={inputClasses} />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-[11px] font-black text-[#748D83] uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Clock size={12} /> สิ้นสุดการประมูล (เลือกวันที่และเวลา)
                                    </label>
                                    <div className="relative mt-2">
                                        <CalendarDays size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        {/* ใช้ datetime-local เพื่อเลือกได้ทั้งวัน-ชั่วโมง-นาที */}
                                        <input
                                            required
                                            type="datetime-local"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className={`${inputClasses} pl-12 font-bold cursor-pointer`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </FormCard>

                        <FormCard icon={Tag} title="รายละเอียดขยะ" description="ระบุสภาพสินค้า น้ำหนัก และเงื่อนไข" delay={0.2}>
                            <div>
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">รายละเอียดเพิ่มเติม</label>
                                <textarea required rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="ระบุสภาพสินค้า น้ำหนัก..." className={`${inputClasses} resize-none leading-relaxed`} />
                            </div>
                        </FormCard>
                    </div>

                    {/* ซีกขวา: รูปภาพ & ปุ่มส่ง */}
                    <div className="space-y-8 lg:sticky lg:top-28">
                        <FormCard icon={ImageIcon} title="📸 รูปภาพสินค้า" description="อัปโหลดอย่างน้อย 1 รูป (สูงสุด 5 รูป)" delay={0.3}>
                            <ImageUploadDropzone onImagesChange={(files) => setImages(files)} maxImages={5} />
                        </FormCard>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#3A4A43] text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-[#748D83] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(58,74,67,0.15)] disabled:opacity-70 disabled:cursor-wait"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={18} /> ยืนยันและลงประกาศ</>}
                        </motion.button>
                    </div>

                </form>
            </main>
        </div>
    );
}