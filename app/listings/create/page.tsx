"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft, DollarSign, Clock, MapPin,
    Loader2, CheckCircle2, Image as ImageIcon,
    FileText, AlignLeft, CalendarDays, Tag,
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import ImageUploadDropzone from '../../components/ImageUploadDropzone';

const LocationPickerMap = dynamic(() => import('../../components/LocationPickerMap'), {
    ssr: false,
    loading: () => (
        <div className="h-[320px] w-full wb-shimmer-skeleton rounded-xl flex items-center justify-center text-sm font-medium text-[var(--wb-sage)] border border-[color-mix(in_srgb,var(--wb-sage)_12%,transparent)]">
            กำลังโหลดแผนที่…
        </div>
    ),
});

const FormCard = ({ children, icon: Icon, title, description, delay = 0 }: any) => (
    <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.22, ease: 'easeOut' }}
        className="bg-[var(--wb-white)] rounded-2xl p-6 md:p-8 border border-[color-mix(in_srgb,var(--wb-sage)_16%,transparent)] space-y-6"
    >
        <div className="flex items-start gap-3 pb-2 border-b border-[color-mix(in_srgb,var(--wb-sage)_10%,transparent)]">
            <div className="shrink-0 p-2 rounded-lg bg-[color-mix(in_srgb,var(--wb-sage)_10%,transparent)] text-[var(--wb-forest-mid)]">
                <Icon size={18} strokeWidth={1.75} />
            </div>
            <div>
                <h2 className="font-semibold text-[var(--wb-forest)] leading-snug">{title}</h2>
                {description && <p className="text-[var(--wb-sage-soft)] text-sm mt-1 font-medium">{description}</p>}
            </div>
        </div>
        <div className="space-y-5">{children}</div>
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
    const [minIncrement, setMinIncrement] = useState('100');
    const [endTime, setEndTime] = useState('');
    const [images, setImages] = useState<File[]>([]);

    useEffect(() => {
        const savedUser = localStorage.getItem('wastebid_user');
        if (!savedUser) {
            router.push('/auth/login');
            return;
        }
        setUser(JSON.parse(savedUser));
    }, []);

    const handleMapChange = async (newCoords: { lat: number; lng: number }) => {
        setCoords(newCoords);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${newCoords.lat}&lon=${newCoords.lng}&accept-language=th`
            );
            const data = await res.json();

            if (data.address) {
                const a = data.address;
                const addressParts = [
                    a.house_number || a.building || '',
                    a.road ? `ถ.${a.road}` : '',
                    a.suburb || a.subdistrict || a.village || '',
                    a.city_district || a.district || '',
                    a.province || a.city || '',
                    a.postcode || '',
                ].filter((part: string) => part !== '');

                const detailedAddr = addressParts.join(' ');
                setLocation(detailedAddr || data.display_name);
            }
        } catch (err) {
            console.error('Reverse Geocoding Error:', err);
        }
    };

    const uploadImages = async (files: File[]) => {
        const uploadedUrls = [];
        for (const file of files) {
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
            const filePath = `${user.id}/${fileName}`;
            const { error: uploadError } = await supabase.storage.from('listings').upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data } = supabase.storage.from('listings').getPublicUrl(filePath);
            uploadedUrls.push(data.publicUrl);
        }
        return uploadedUrls;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (images.length === 0) return alert("❌ กรุณาอัปโหลดรูปภาพ");
        if (!coords) return alert("📍 กรุณาปักหมุดตำแหน่งนัดรับบนแผนที่");

        setLoading(true);
        try {
            const imageUrls = await uploadImages(images);
            const { error } = await supabase.from('waste_listings').insert([{
                title,
                description,
                category,
                location,
                lat: coords.lat,
                lng: coords.lng,
                start_price: parseFloat(startPrice),
                current_price: parseFloat(startPrice),
                min_increment: parseFloat(minIncrement),
                start_time: new Date().toISOString(),
                end_time: new Date(endTime).toISOString(),
                owner_id: user.id,
                status: 'open',
                image_urls: imageUrls
            }]);

            if (error) throw error;
            alert("🎉 ลงประกาศขายสำเร็จ!");
            router.push('/dashboard');
        } catch (error: any) {
            alert(`ผิดพลาด: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const inputClasses =
        'wb-focus w-full mt-1.5 px-3.5 py-3 rounded-xl border border-[color-mix(in_srgb,var(--wb-sage)_18%,transparent)] bg-[var(--wb-mist)] text-sm font-medium text-[var(--wb-forest)] placeholder:text-[color-mix(in_srgb,var(--wb-sage)_45%,transparent)] outline-none transition-colors';

    const labelCls = 'text-[11px] font-semibold uppercase tracking-wider text-[var(--wb-sage)]';

    return (
        <div className="min-h-screen font-kanit pb-20 pt-6 sm:pt-8">
            <main className="max-w-6xl mx-auto px-5 sm:px-6 py-6">
                <header className="flex flex-col sm:flex-row sm:items-center gap-4 mb-10 pb-6 border-b border-[color-mix(in_srgb,var(--wb-sage)_14%,transparent)]">
                    <Link
                        href="/dashboard"
                        className="wb-focus inline-flex self-start p-2.5 rounded-xl border border-[color-mix(in_srgb,var(--wb-sage)_16%,transparent)] text-[var(--wb-sage)] hover:bg-[var(--wb-mist)] transition-colors"
                        aria-label="กลับไปแดชบอร์ด"
                    >
                        <ArrowLeft size={20} strokeWidth={1.75} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--wb-forest)] tracking-tight">ลงประกาศขายขยะ</h1>
                        <p className="text-sm text-[var(--wb-sage-soft)] font-medium mt-1">
                            ระบุรายละเอียดและปักหมุดตำแหน่งรับของ
                        </p>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-8 lg:gap-10 items-start">
                    <div className="space-y-8">
                        <FormCard icon={FileText} title="ข้อมูลสินค้าและพิกัด" description="ปักหมุดบนแผนที่เพื่อระบุจุดนัดรับ">
                            <div>
                                <label className={labelCls}>ชื่อรายการขยะ</label>
                                <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น เศษเหล็กเกรด A" className={inputClasses} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelCls}>หมวดหมู่</label>
                                    <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClasses}>
                                        <option value="Metal">โลหะ / เหล็ก</option>
                                        <option value="Plastic">พลาสติก</option>
                                        <option value="Paper">กระดาษ</option>
                                        <option value="Electronic">ขยะอิเล็กทรอนิกส์</option>
                                        <option value="Other">อื่นๆ</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>ที่อยู่นัดรับ</label>
                                    <div className="relative">
                                        <MapPin size={16} strokeWidth={1.75} className="absolute left-3.5 top-[calc(50%+2px)] -translate-y-1/2 text-[var(--wb-sage)] pointer-events-none" />
                                        <input required type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="ปักหมุดบนแผนที่…" className={`${inputClasses} pl-10`} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className={`${labelCls} block mb-2`}>ตำแหน่งบนแผนที่</label>
                                <p className="text-xs text-[var(--wb-sage-soft)] mb-3">คลิกเลือกพิกัดที่ถูกต้องบนแผนที่</p>
                                <LocationPickerMap value={coords} onChange={handleMapChange} />
                            </div>
                        </FormCard>

                        <FormCard icon={AlignLeft} title="รายละเอียดประมูล" description="ตั้งราคาและเวลาสิ้นสุด" delay={0.06}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelCls}>ราคาเริ่มต้น (บาท)</label>
                                    <div className="relative mt-1.5">
                                        <DollarSign size={16} strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--wb-sage)] pointer-events-none" />
                                        <input required type="number" value={startPrice} onChange={(e) => setStartPrice(e.target.value)} className={`${inputClasses} pl-10 text-base font-semibold tabular-nums`} />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>เคาะขั้นต่ำครั้งละ (บาท)</label>
                                    <input required type="number" value={minIncrement} onChange={(e) => setMinIncrement(e.target.value)} className={inputClasses} />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className={`${labelCls} flex items-center gap-2`}>
                                        <Clock size={14} strokeWidth={1.75} aria-hidden />
                                        สิ้นสุดการประมูล
                                    </label>
                                    <div className="relative mt-1.5">
                                        <CalendarDays size={16} strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--wb-sage)] pointer-events-none" />
                                        <input required type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={`${inputClasses} pl-10`} />
                                    </div>
                                </div>
                            </div>
                        </FormCard>

                        <FormCard icon={Tag} title="รายละเอียดขยะ" description="ระบุสภาพและน้ำหนัก" delay={0.1}>
                            <div>
                                <label className={labelCls}>รายละเอียด</label>
                                <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClasses} resize-y min-h-[100px]`} placeholder="สภาพสินค้า…" />
                            </div>
                        </FormCard>
                    </div>

                    <div className="space-y-6 lg:sticky lg:top-28">
                        <FormCard icon={ImageIcon} title="รูปภาพสินค้า" description="สูงสุด 5 รูป" delay={0.12}>
                            <ImageUploadDropzone onImagesChange={(files) => setImages(files)} maxImages={5} />
                        </FormCard>

                        <button
                            type="submit"
                            disabled={loading}
                            className="wb-focus w-full bg-[var(--wb-forest-mid)] text-[var(--wb-white)] py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider hover:opacity-90 disabled:opacity-55 transition-opacity flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} strokeWidth={1.75} /> : <><CheckCircle2 size={18} strokeWidth={1.75} /> ยืนยันและลงประกาศ</>}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
