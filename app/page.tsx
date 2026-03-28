"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  MapPin,
  Leaf,
  ChevronRight,
  Zap,
  MapPinned,
  Users,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const serviceItems = [
  {
    icon: Zap,
    t: 'ประมูลแบบเรียลไทม์',
    d: 'อัปเดตราคาและประวัติการเสนอราคาทันที',
  },
  {
    icon: MapPinned,
    t: 'ลงขายพร้อมแผนที่',
    d: 'ระบุจุดนัดรับให้ชัดเจน ลดความเสี่ยงในการส่งมอบ',
  },
  {
    icon: Users,
    t: 'แยกสิทธิ์ผู้ขาย / ผู้ซื้อ',
    d: 'แดชบอร์ดเฉพาะบทบาท ใช้งานง่ายทั้งสองฝ่าย',
  },
];

export default function GuestLandingPage() {
  const [liveItems, setLiveItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchLiveAuctions = async () => {
      setLoading(true);
      setFetchError(null);
      const { data, error } = await supabase
        .from('waste_listings')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(6);
      if (cancelled) return;
      if (error) {
        console.error(error);
        setFetchError('ไม่สามารถโหลดรายการได้ในขณะนี้');
        setLiveItems([]);
      } else {
        setLiveItems(data || []);
      }
      setLoading(false);
    };
    fetchLiveAuctions();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative min-h-screen font-kanit overflow-x-hidden">
      <section className="relative pt-36 sm:pt-40 md:pt-44 pb-20 md:pb-28 px-5 sm:px-6">
        <div
          className="pointer-events-none absolute inset-0 wb-grid-dots opacity-[0.2]"
          aria-hidden
        />

        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
            className="space-y-8 text-center lg:text-left"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--wb-sage)] mx-auto lg:mx-0 max-w-md">
              Marketplace &amp; Auction
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[var(--wb-forest)] leading-[1.12] tracking-tight">
              เปลี่ยนขยะในมือ
              <br />
              <span className="text-[var(--wb-sage)]">ให้เป็นเงินสด</span>
            </h1>
            <p className="text-[var(--wb-sage-soft)] text-base md:text-lg font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed">
              แพลตฟอร์มประมูลขยะรีไซเคิลที่โปร่งใส เชื่อมผู้ขายกับผู้ซื้อโดยตรง
            </p>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-center lg:justify-start">
              <Link
                href="/auth/register"
                className="wb-focus inline-flex justify-center items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-[var(--wb-white)] bg-[var(--wb-forest-mid)] hover:opacity-90 transition-opacity"
              >
                เริ่มประมูลเลย
                <ArrowRight size={18} strokeWidth={1.75} aria-hidden />
              </Link>
              <Link
                href="/#live-auctions"
                className="wb-focus inline-flex justify-center items-center gap-1.5 px-8 py-3.5 rounded-xl text-sm font-semibold text-[var(--wb-forest-mid)] border border-[color-mix(in_srgb,var(--wb-sage)_32%,transparent)] bg-[var(--wb-white)] hover:bg-[var(--wb-mist)] transition-colors"
              >
                สำรวจรายการ
                <ChevronRight size={18} strokeWidth={1.75} aria-hidden />
              </Link>
            </div>

            <div className="flex items-center gap-4 justify-center lg:justify-start pt-2 border-t border-[color-mix(in_srgb,var(--wb-sage)_18%,transparent)] lg:border-0 lg:pt-0">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-[var(--wb-cream)] bg-[var(--wb-mist)] overflow-hidden"
                  >
                    <img
                      src={`https://i.pravatar.cc/100?img=${i + 15}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="text-left text-xs">
                <p className="text-[var(--wb-forest)] font-semibold">1,200+ ผู้ใช้</p>
                <p className="text-[var(--wb-sage-soft)] font-medium">ใช้งานอยู่ขณะนี้</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.06, ease: 'easeOut' }}
            className="relative mx-auto max-w-md lg:max-w-none"
          >
            <div className="rounded-3xl overflow-hidden border border-[color-mix(in_srgb,var(--wb-sage)_22%,transparent)] bg-[var(--wb-white)]">
              <img
                src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=1200"
                alt="Recycle"
                className="w-full h-[min(420px,52vh)] object-cover"
              />
            </div>

            <div className="mt-6 sm:absolute sm:bottom-4 sm:left-4 sm:mt-0 flex items-start gap-4 rounded-2xl bg-[var(--wb-white)] p-4 border border-[color-mix(in_srgb,var(--wb-sage)_18%,transparent)] max-w-[min(100%,280px)] shadow-sm">
              <div className="shrink-0 p-2.5 rounded-xl bg-[color-mix(in_srgb,var(--wb-sage)_14%,transparent)] text-[var(--wb-forest-mid)]">
                <ShieldCheck size={22} strokeWidth={1.75} aria-hidden />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--wb-sage)]">
                  ความน่าเชื่อถือ
                </p>
                <p className="font-semibold text-[var(--wb-forest)] text-sm leading-snug">
                  Escrow · ตรวจสอบย้อนหลัง
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="services" className="py-20 md:py-24 px-5 sm:px-6 scroll-mt-28 border-t border-[color-mix(in_srgb,var(--wb-sage)_15%,transparent)]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 md:mb-14 max-w-2xl mx-auto md:mx-0 text-center md:text-left">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--wb-sage)] mb-3">
              บริการของเรา
            </h2>
            <p className="text-2xl md:text-3xl font-bold text-[var(--wb-forest)] leading-snug tracking-tight">
              เชื่อมผู้ขายกับผู้ซื้อโดยตรง โปร่งใส และมีวอลเล็ตรองรับ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {serviceItems.map((x) => (
              <div
                key={x.t}
                className="rounded-2xl bg-[var(--wb-white)] border border-[color-mix(in_srgb,var(--wb-sage)_18%,transparent)] p-8 flex flex-col gap-4"
              >
                <div className="inline-flex p-2.5 rounded-lg bg-[color-mix(in_srgb,var(--wb-sage)_10%,transparent)] text-[var(--wb-forest-mid)]">
                  <x.icon size={20} strokeWidth={1.75} aria-hidden />
                </div>
                <h3 className="font-semibold text-[var(--wb-forest)] text-lg leading-snug">
                  {x.t}
                </h3>
                <p className="text-sm text-[var(--wb-sage-soft)] leading-relaxed font-medium">
                  {x.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 px-5 sm:px-6">
        <div className="max-w-6xl mx-auto rounded-2xl bg-[var(--wb-forest-mid)] px-8 py-12 md:px-12 md:py-14 border border-[color-mix(in_srgb,var(--wb-white)_12%,transparent)]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 lg:divide-x lg:divide-[color-mix(in_srgb,var(--wb-white)_18%,transparent)]">
            {[
              { label: 'ยอดประมูลสะสม', value: '฿2.5M+' },
              { label: 'ขยะรีไซเคิลแล้ว', value: '450 Tons' },
              { label: 'รายการประมูล', value: '12,000+' },
              { label: 'ความพึงพอใจ', value: '99%' },
            ].map((stat) => (
              <div key={stat.label} className="text-center lg:px-6 first:lg:pl-0 space-y-2">
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--wb-white)] tabular-nums tracking-tight">
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[color-mix(in_srgb,var(--wb-white)_58%,transparent)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="live-auctions" className="py-20 md:py-24 px-5 sm:px-6 scroll-mt-24 border-t border-[color-mix(in_srgb,var(--wb-sage)_15%,transparent)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--wb-sage)] ring-2 ring-[color-mix(in_srgb,var(--wb-sage)_35%,transparent)]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--wb-sage)]">
                  กำลังเปิดประมูล
                </span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-[var(--wb-forest)] tracking-tight">
                รายการประมูลล่าสุด
              </h3>
              <p className="text-sm text-[var(--wb-sage-soft)] font-medium max-w-md leading-relaxed">
                เน้นข้อมูลราคาและวันสิ้นสุดให้อ่านได้เร็ว
              </p>
            </div>
            <Link
              href="/dashboard"
              className="wb-focus shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-[var(--wb-forest-mid)] border border-[color-mix(in_srgb,var(--wb-sage)_28%,transparent)] bg-[var(--wb-white)] hover:bg-[var(--wb-mist)] transition-colors"
            >
              ดูทั้งหมดในแดชบอร์ด
              <ChevronRight size={18} strokeWidth={1.75} aria-hidden />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[420px] rounded-2xl wb-shimmer-skeleton border border-[color-mix(in_srgb,var(--wb-sage)_12%,transparent)]"
                />
              ))}
            </div>
          ) : fetchError ? (
            <p className="text-center text-[var(--wb-sage-soft)] font-medium py-14 px-4 rounded-2xl bg-[var(--wb-white)] border border-[color-mix(in_srgb,var(--wb-sage)_15%,transparent)]">
              {fetchError}
            </p>
          ) : liveItems.length === 0 ? (
            <p className="text-center text-[var(--wb-sage-soft)] font-medium py-14 px-4 rounded-2xl border border-dashed border-[color-mix(in_srgb,var(--wb-sage)_25%,transparent)]">
              ยังไม่มีรายการประมูลที่เปิดอยู่ในขณะนี้
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {liveItems.map((item) => (
                <AuctionCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      <footer
        id="contact"
        className="mt-12 text-[var(--wb-white)] scroll-mt-24 border-t border-[color-mix(in_srgb,var(--wb-sage)_20%,transparent)]"
      >
        <div className="bg-[var(--wb-forest)]">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 py-14 md:py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              <div className="space-y-5 text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <div className="p-2 rounded-lg bg-[color-mix(in_srgb,var(--wb-white)_12%,transparent)]">
                    <Leaf size={22} strokeWidth={1.75} aria-hidden />
                  </div>
                  <span className="text-2xl font-bold tracking-tight">WasteBid</span>
                </div>
                <p className="text-sm text-[color-mix(in_srgb,var(--wb-white)_65%,transparent)] leading-relaxed max-w-md mx-auto md:mx-0 font-medium">
                  เราคือตัวกลางที่ทำให้ขยะของคุณมีมูลค่า และช่วยลดผลกระทบต่อสิ่งแวดล้อมอย่างยั่งยืน
                </p>
                <p className="text-sm font-medium text-[color-mix(in_srgb,var(--wb-white)_75%,transparent)]">
                  ติดต่อ:{' '}
                  <a
                    href="mailto:hello@wastebid.app"
                    className="text-[var(--wb-sage-soft)] underline underline-offset-4 decoration-[color-mix(in_srgb,var(--wb-white)_35%,transparent)] hover:opacity-90 wb-focus rounded-sm"
                  >
                    hello@wastebid.app
                  </a>
                </p>
              </div>
              <div className="flex flex-col md:items-end gap-6 text-center md:text-right">
                <div className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-2 text-[11px] font-semibold uppercase tracking-wider text-[color-mix(in_srgb,var(--wb-white)_55%,transparent)]">
                  <span className="cursor-default" title="เร็ว ๆ นี้">
                    Privacy
                  </span>
                  <span className="cursor-default" title="เร็ว ๆ นี้">
                    Terms
                  </span>
                  <a
                    href="mailto:hello@wastebid.app"
                    className="text-[var(--wb-sage-soft)] hover:opacity-90 wb-focus rounded-sm"
                  >
                    Contact
                  </a>
                </div>
                <p className="text-[10px] text-[color-mix(in_srgb,var(--wb-white)_38%,transparent)] font-semibold uppercase tracking-widest">
                  © 2026 Waste Bid
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AuctionCard({ item }: { item: any }) {
  return (
    <article className="flex flex-col rounded-2xl bg-[var(--wb-white)] border border-[color-mix(in_srgb,var(--wb-sage)_18%,transparent)] overflow-hidden hover:border-[color-mix(in_srgb,var(--wb-sage)_32%,transparent)] transition-colors">
      <div className="aspect-[4/3] bg-[var(--wb-mist)] relative">
        <img
          src={item.image_urls?.[0] || 'https://via.placeholder.com/400'}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide text-[var(--wb-forest-mid)] bg-[var(--wb-white)]/95 border border-[color-mix(in_srgb,var(--wb-sage)_15%,transparent)]">
          {item.category}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6 gap-5">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--wb-sage)] mb-2">
            <MapPin size={14} strokeWidth={1.75} aria-hidden />
            {item.location || 'Bangkok, Thailand'}
          </div>
          <h3 className="text-lg font-semibold text-[var(--wb-forest)] leading-snug line-clamp-2">
            {item.title}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[color-mix(in_srgb,var(--wb-sage)_14%,transparent)]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--wb-sage)] mb-1">
              ราคาปัจจุบัน
            </p>
            <p className="text-xl font-bold text-[var(--wb-forest-mid)] tabular-nums">
              ฿{Number(item.current_price).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--wb-sage)] mb-1 flex items-center justify-end gap-1">
              <Clock size={12} strokeWidth={1.75} aria-hidden />
              สิ้นสุด
            </p>
            <p className="text-xs font-semibold text-[var(--wb-forest)] tabular-nums">
              {new Date(item.end_time).toLocaleDateString('th-TH')}
            </p>
          </div>
        </div>

        <Link
          href={`/listings/${item.id}`}
          className="wb-focus mt-auto w-full py-3.5 rounded-xl text-center text-xs font-semibold uppercase tracking-wider text-[var(--wb-white)] bg-[var(--wb-forest-mid)] hover:opacity-90 transition-opacity"
        >
          ดูรายละเอียดและประมูล
        </Link>
      </div>
    </article>
  );
}
