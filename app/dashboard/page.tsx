"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus, Clock,
  AlertCircle, ArrowRight,
  MapPin, Search,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('wastebid_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-kanit px-6">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 border-2 border-[color-mix(in_srgb,var(--wb-sage)_25%,transparent)] border-t-[var(--wb-sage)] rounded-full animate-spin"
          aria-hidden
        />
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--wb-sage)]">
          กำลังโหลดข้อมูล...
        </p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center font-kanit px-6 py-16">
      <div className="w-full max-w-md rounded-2xl bg-[var(--wb-white)] border border-[color-mix(in_srgb,var(--wb-sage)_18%,transparent)] px-8 py-10 text-center space-y-5">
        <AlertCircle size={40} strokeWidth={1.75} className="text-[var(--wb-sage-soft)] mx-auto" aria-hidden />
        <h2 className="text-lg font-semibold text-[var(--wb-forest)]">เข้าถึงไม่ได้</h2>
        <p className="text-sm text-[var(--wb-sage-soft)] font-medium leading-relaxed">
          กรุณาเข้าสู่ระบบก่อนใช้งาน Dashboard
        </p>
        <Link
          href="/auth/login"
          className="wb-focus inline-flex justify-center w-full py-3 rounded-xl text-sm font-semibold text-[var(--wb-white)] bg-[var(--wb-forest-mid)] hover:opacity-90 transition-opacity"
        >
          ไปหน้า Login
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen font-kanit pb-20 pt-24 sm:pt-28">
      <div className="relative z-10">
      {user.role === 'owner' ? (
        <OwnerDashboardView user={user} />
      ) : (
        <BidderDashboardView user={user} />
      )}
      </div>
    </div>
  );
}

// ==========================================================
// 🏭 [VIEW] สำหรับ "ผู้ขาย" (Owner) - สไตล์ AuctionHouse
// ==========================================================
function OwnerDashboardView({ user }: { user: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchOwnerData = async () => {
      if (!user?.id) return;
      setFetching(true);
      const { data } = await supabase
        .from('waste_listings')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      
      setItems(data || []);
      setFetching(false);
    };
    fetchOwnerData();
  }, [user.id]);

  const filteredItems = items.filter(item => {
    const isEnded = item.status === 'closed' || new Date(item.end_time) <= new Date();
    if (activeTab === 'active') return !isEnded;
    if (activeTab === 'ended') return isEnded;
    return true;
  });

  const totalRevenue = items.reduce((acc, curr) => curr.status === 'closed' ? acc + Number(curr.current_price) : acc, 0);
  const activeCount = items.filter(i => i.status === 'open' && new Date(i.end_time) > new Date()).length;

  return (
    <main className="max-w-6xl mx-auto px-5 sm:px-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-12">
        <div className="space-y-2 max-w-xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--wb-forest)] tracking-tight">
            การจัดการการขาย
          </h1>
          <p className="text-sm text-[var(--wb-sage-soft)] font-medium leading-relaxed">
            จัดการแคตตาล็อกและติดตามรายการประมูลของคุณ
          </p>
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          <div className="flex-1 lg:flex-none min-w-[140px] rounded-xl bg-[var(--wb-white)] px-5 py-4 border border-[color-mix(in_srgb,var(--wb-sage)_16%,transparent)]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--wb-sage)] mb-1">
              รายได้สะสม
            </p>
            <p className="text-lg font-bold text-[var(--wb-forest-mid)] tabular-nums">
              ฿{totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="flex-1 lg:flex-none min-w-[140px] rounded-xl bg-[var(--wb-white)] px-5 py-4 border border-[color-mix(in_srgb,var(--wb-sage)_16%,transparent)]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--wb-sage)] mb-1">
              กำลังประมูล
            </p>
            <p className="text-lg font-bold text-[var(--wb-forest)] tabular-nums">{activeCount} รายการ</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-10">
        <div className="flex p-1 rounded-xl bg-[var(--wb-mist)] border border-[color-mix(in_srgb,var(--wb-sage)_12%,transparent)] w-full sm:w-auto overflow-x-auto">
          <TabBtn label="ทั้งหมด" active={activeTab === 'all'} onClick={() => setActiveTab('all')} count={items.length} />
          <TabBtn label="กำลังประมูล" active={activeTab === 'active'} onClick={() => setActiveTab('active')} count={activeCount} />
          <TabBtn label="จบแล้ว" active={activeTab === 'ended'} onClick={() => setActiveTab('ended')} count={items.length - activeCount} />
        </div>
        <Link
          href="/listings/create"
          className="wb-focus inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-[var(--wb-white)] bg-[var(--wb-forest-mid)] hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus size={18} strokeWidth={1.75} aria-hidden /> ลงขายสินค้าใหม่
        </Link>
      </div>

      {fetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[360px] rounded-2xl wb-shimmer-skeleton border border-[color-mix(in_srgb,var(--wb-sage)_12%,transparent)]"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredItems.map((item) => (
            <OwnerAuctionCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </main>
  );
}

// ==========================================================
// 🛒 [VIEW] สำหรับ "ผู้ประมูล" (Bidder) - สไตล์พรีเมียม
// ==========================================================
function BidderDashboardView({ user }: { user: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState('marketplace');
  const [searchQuery, setSearchQuery] = useState('');
  const [bidActivityCount, setBidActivityCount] = useState(0);
  const [wonCount, setWonCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const loadStats = async () => {
      const uid = user.id;
      const [bidsRes, winsRes] = await Promise.all([
        supabase.from('bid_logs').select('*', { count: 'exact', head: true }).eq('user_id', uid),
        supabase
          .from('waste_listings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'closed')
          .eq('current_bidder_id', uid),
      ]);
      if (cancelled) return;
      if (bidsRes.error || winsRes.error) {
        setBidActivityCount(0);
        setWonCount(0);
        return;
      }
      setBidActivityCount(bidsRes.count ?? 0);
      setWonCount(winsRes.count ?? 0);
    };
    loadStats();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  useEffect(() => {
    let cancelled = false;
    const fetchMarket = async () => {
      setFetching(true);
      try {
        if (activeTab === 'marketplace') {
          const { data, error } = await supabase
            .from('waste_listings')
            .select('*')
            .eq('status', 'open')
            .neq('owner_id', user.id)
            .order('end_time', { ascending: true });
          if (!cancelled) {
            if (error) setItems([]);
            else setItems(data || []);
          }
        } else {
          const { data: logs, error: logErr } = await supabase
            .from('bid_logs')
            .select('listing_id')
            .eq('user_id', user.id);
          if (logErr || cancelled) {
            if (!cancelled) setItems([]);
            return;
          }
          const ids = [...new Set((logs || []).map((r: { listing_id: number }) => r.listing_id))];
          if (ids.length === 0) {
            setItems([]);
            return;
          }
          const { data, error } = await supabase
            .from('waste_listings')
            .select('*')
            .in('id', ids)
            .order('end_time', { ascending: false });
          if (!cancelled) {
            if (error) setItems([]);
            else setItems(data || []);
          }
        }
      } finally {
        if (!cancelled) setFetching(false);
      }
    };
    fetchMarket();
    return () => {
      cancelled = true;
    };
  }, [user.id, activeTab]);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const displayItems =
    normalizedSearch.length === 0
      ? items
      : items.filter((item) => {
          const t = (item.title || '').toLowerCase();
          const loc = (item.location || '').toLowerCase();
          const cat = (item.category || '').toLowerCase();
          return t.includes(normalizedSearch) || loc.includes(normalizedSearch) || cat.includes(normalizedSearch);
        });

  return (
    <main className="max-w-6xl mx-auto px-5 sm:px-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-12">
        <div className="space-y-2 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--wb-sage)]">ตลาดรีไซเคิล</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--wb-forest)] tracking-tight">
            ขยะรีไซเคิลรอบตัวคุณ
          </h1>
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          <div className="flex-1 lg:flex-none min-w-[140px] rounded-xl bg-[var(--wb-white)] px-5 py-4 border border-[color-mix(in_srgb,var(--wb-sage)_16%,transparent)]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--wb-sage)] mb-1">
              ครั้งที่เสนอราคา
            </p>
            <p className="text-lg font-bold text-[var(--wb-forest)] tabular-nums">
              {bidActivityCount.toLocaleString()} ครั้ง
            </p>
          </div>
          <div className="flex-1 lg:flex-none min-w-[140px] rounded-xl bg-[var(--wb-white)] px-5 py-4 border border-[color-mix(in_srgb,var(--wb-sage)_16%,transparent)]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--wb-sage)] mb-1">
              ชนะแล้ว
            </p>
            <p className="text-lg font-bold text-[var(--wb-forest-mid)] tabular-nums">
              {wonCount.toLocaleString()} รายการ
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-10">
        <div className="flex p-1 rounded-xl bg-[var(--wb-mist)] border border-[color-mix(in_srgb,var(--wb-sage)_12%,transparent)] w-full md:w-auto overflow-x-auto">
          <TabBtn label="สำรวจตลาด" active={activeTab === 'marketplace'} onClick={() => setActiveTab('marketplace')} />
          <TabBtn label="ประมูลของฉัน" active={activeTab === 'my_bids'} onClick={() => setActiveTab('my_bids')} />
        </div>
        <div className="relative w-full md:w-64">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--wb-sage)] pointer-events-none"
            size={17}
            strokeWidth={1.75}
            aria-hidden
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหา..."
            className="wb-focus w-full pl-10 pr-3 py-2.5 bg-[var(--wb-white)] border border-[color-mix(in_srgb,var(--wb-sage)_16%,transparent)] rounded-xl text-sm font-medium text-[var(--wb-forest)] placeholder:text-[color-mix(in_srgb,var(--wb-sage)_55%,transparent)]"
            autoComplete="off"
          />
        </div>
      </div>

      {fetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[360px] rounded-2xl wb-shimmer-skeleton border border-[color-mix(in_srgb,var(--wb-sage)_12%,transparent)]"
            />
          ))}
        </div>
      ) : displayItems.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-[var(--wb-white)] border border-[color-mix(in_srgb,var(--wb-sage)_14%,transparent)]">
          <p className="text-sm text-[var(--wb-sage-soft)] font-medium leading-relaxed max-w-md mx-auto">
            {normalizedSearch
              ? 'ไม่พบรายการที่ตรงกับการค้นหา'
              : activeTab === 'my_bids'
                ? 'คุณยังไม่เคยเสนอราคาในรายการใด — ลองสำรวจตลาดดูนะ'
                : 'ยังไม่มีรายการประมูลในตลาดตอนนี้'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {displayItems.map((item) => (
            <AuctionCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </main>
  );
}

function TabBtn({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`wb-focus px-4 py-2.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 shrink-0 ${
        active
          ? 'bg-[var(--wb-forest-mid)] text-[var(--wb-white)]'
          : 'text-[var(--wb-sage-soft)] hover:text-[var(--wb-forest-mid)]'
      }`}
    >
      {label}
      {count !== undefined && (
        <span
          className={`tabular-nums text-[10px] px-1.5 py-0.5 rounded-md ${
            active ? 'bg-[color-mix(in_srgb,var(--wb-white)_18%,transparent)]' : 'bg-[var(--wb-white)]'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function OwnerAuctionCard({ item }: { item: any }) {
  const isEnded = item.status === 'closed' || new Date(item.end_time) <= new Date();
  return (
    <article className="rounded-2xl bg-[var(--wb-white)] border border-[color-mix(in_srgb,var(--wb-sage)_16%,transparent)] overflow-hidden flex flex-col">
      <div className="relative aspect-[16/11] bg-[var(--wb-mist)]">
        <img
          src={item.image_urls?.[0]}
          alt=""
          className={`w-full h-full object-cover ${isEnded ? 'opacity-75' : ''}`}
        />
        <div
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide border ${
            isEnded
              ? 'bg-[var(--wb-forest)] text-[var(--wb-white)] border-transparent'
              : 'bg-[var(--wb-white)] text-[var(--wb-forest-mid)] border-[color-mix(in_srgb,var(--wb-sage)_15%,transparent)]'
          }`}
        >
          {isEnded ? 'จบแล้ว' : 'เปิดประมูล'}
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1 gap-4">
        <div className="flex items-center gap-2 text-[11px] font-medium text-[var(--wb-sage)]">
          <span>{item.category}</span>
          <span aria-hidden>·</span>
          <MapPin size={12} strokeWidth={1.75} aria-hidden />
          {item.location || 'Bangkok'}
        </div>
        <h3 className="text-lg font-semibold text-[var(--wb-forest)] leading-snug line-clamp-2">{item.title}</h3>
        <div className="grid grid-cols-2 gap-4 pt-4 mt-auto border-t border-[color-mix(in_srgb,var(--wb-sage)_12%,transparent)]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--wb-sage)] mb-1">ราคาปัจจุบัน</p>
            <p className="text-xl font-bold text-[var(--wb-forest-mid)] tabular-nums">
              ฿{Number(item.current_price).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--wb-sage)] mb-1">
              {isEnded ? 'จบเมื่อ' : 'สิ้นสุด'}
            </p>
            <p className="text-xs font-semibold text-[var(--wb-forest)] tabular-nums">
              {new Date(item.end_time).toLocaleDateString('th-TH')}
            </p>
          </div>
        </div>
        <Link
          href={`/listings/${item.id}`}
          className={`wb-focus w-full py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-opacity ${
            isEnded
              ? 'border border-[color-mix(in_srgb,var(--wb-sage)_22%,transparent)] text-[var(--wb-sage-soft)] hover:opacity-80'
              : 'bg-[var(--wb-forest-mid)] text-[var(--wb-white)] hover:opacity-90'
          }`}
        >
          {isEnded ? 'ดูรายละเอียด' : 'จัดการรายการ'}
          <ArrowRight size={15} strokeWidth={1.75} aria-hidden />
        </Link>
      </div>
    </article>
  );
}

function AuctionCard({ item }: { item: any }) {
  return (
    <article className="rounded-2xl bg-[var(--wb-white)] border border-[color-mix(in_srgb,var(--wb-sage)_16%,transparent)] overflow-hidden flex flex-col">
      <div className="relative aspect-[16/11] bg-[var(--wb-mist)]">
        <img src={item.image_urls?.[0]} alt="" className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide text-[var(--wb-forest-mid)] bg-[var(--wb-white)] border border-[color-mix(in_srgb,var(--wb-sage)_15%,transparent)]">
          {item.category}
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1 gap-4">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--wb-sage)]">
          <MapPin size={13} strokeWidth={1.75} aria-hidden />
          {item.location || 'Bangkok'}
        </div>
        <h3 className="text-lg font-semibold text-[var(--wb-forest)] leading-snug line-clamp-2">{item.title}</h3>
        <div className="grid grid-cols-2 gap-4 pt-4 mt-auto border-t border-[color-mix(in_srgb,var(--wb-sage)_12%,transparent)]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--wb-sage)] mb-1">ราคาปัจจุบัน</p>
            <p className="text-xl font-bold text-[var(--wb-forest-mid)] tabular-nums">
              ฿{Number(item.current_price).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--wb-sage)] mb-1 flex items-center justify-end gap-1">
              <Clock size={12} strokeWidth={1.75} aria-hidden /> สิ้นสุด
            </p>
            <p className="text-xs font-semibold text-[var(--wb-forest)] tabular-nums">
              {new Date(item.end_time).toLocaleDateString('th-TH')}
            </p>
          </div>
        </div>
        <Link
          href={`/listings/${item.id}`}
          className="wb-focus w-full py-3 rounded-xl text-xs font-semibold uppercase tracking-wider bg-[var(--wb-forest-mid)] text-[var(--wb-white)] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          เข้าร่วมประมูล
          <ArrowRight size={15} strokeWidth={1.75} aria-hidden />
        </Link>
      </div>
    </article>
  );
}