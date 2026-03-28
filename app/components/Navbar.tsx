"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User as UserIcon, Bell, Leaf, Wallet } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkUser = () => {
      const savedUser = localStorage.getItem('wastebid_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        fetchBalance(parsed.id);
      } else {
        setUser(null);
        setBalance(0);
      }
    };

    checkUser();
    window.addEventListener('storage', checkUser);
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', checkUser);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const fetchBalance = async (uid: number) => {
    const { data } = await supabase.from('wallets').select('balance').eq('user_id', uid).single();
    if (data) setBalance(data.balance);
  };

  if (!mounted) return null;

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-[100] transition-[padding,background-color,box-shadow] duration-200 ${
        isScrolled
          ? 'bg-[color-mix(in_srgb,var(--wb-white)_92%,transparent)] backdrop-blur-md py-3 border-b border-[color-mix(in_srgb,var(--wb-sage)_16%,transparent)] shadow-sm'
          : 'bg-[color-mix(in_srgb,var(--wb-white)_88%,transparent)] backdrop-blur-sm py-4 sm:py-5 border-b border-[color-mix(in_srgb,var(--wb-sage)_12%,transparent)]'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-6 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="wb-focus flex items-center gap-2.5 group shrink-0 rounded-lg"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-[var(--wb-white)] bg-[var(--wb-forest-mid)]">
            <Leaf size={20} strokeWidth={1.75} aria-hidden />
          </div>
          <span className="text-lg sm:text-xl font-bold text-[var(--wb-forest)] uppercase tracking-tight">
            Waste<span className="text-[var(--wb-sage)]">Bid</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {!user ? (
            <>
              <NavLink href="/" active={pathname === '/'} label="หน้าแรก" />
              <NavLink href="/#services" label="บริการของเรา" />
              <NavLink href="/#contact" label="ติดต่อเรา" />
            </>
          ) : (
            <>
              <NavLink href="/dashboard" active={pathname === '/dashboard'} label="แดชบอร์ด" />
              <NavLink href="/chat" active={pathname.includes('/chat')} label="แชทสนทนา" />
            </>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {!user ? (
            <Link
              href="/auth/register"
              className="wb-focus hidden sm:inline-flex px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-[var(--wb-white)] bg-[var(--wb-forest-mid)] hover:opacity-90 transition-opacity"
            >
              สมัครสมาชิก
            </Link>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/dashboard/wallet" className="hidden sm:block wb-focus rounded-xl">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[color-mix(in_srgb,var(--wb-sage)_18%,transparent)] bg-[var(--wb-white)] hover:bg-[var(--wb-mist)] transition-colors">
                  <Wallet size={16} strokeWidth={1.75} className="text-[var(--wb-sage)]" aria-hidden />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--wb-sage)]">
                      ยอดเงิน
                    </span>
                    <span className="text-sm font-semibold text-[var(--wb-forest)] tabular-nums truncate">
                      ฿{balance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>

              <button
                type="button"
                className="wb-focus p-2.5 rounded-xl text-[var(--wb-sage)] hover:bg-[var(--wb-mist)] transition-colors"
                aria-label="การแจ้งเตือน"
              >
                <Bell size={20} strokeWidth={1.75} />
              </button>

              <div className="h-8 w-px bg-[color-mix(in_srgb,var(--wb-sage)_20%,transparent)] hidden sm:block" />

              <Link
                href="/dashboard/profile"
                className="wb-focus flex items-center gap-2.5 rounded-xl py-1 pr-1"
              >
                <div className="hidden lg:flex flex-col text-right min-w-0">
                  <p className="text-xs font-semibold text-[var(--wb-forest)] truncate max-w-[120px]">
                    {user.username}
                  </p>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--wb-sage)]">
                    {user.role}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-[color-mix(in_srgb,var(--wb-sage)_18%,transparent)] bg-[var(--wb-mist)] shrink-0">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--wb-sage)]">
                      <UserIcon size={20} strokeWidth={1.75} />
                    </div>
                  )}
                </div>
              </Link>
            </div>
          )}

          <button
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
            className="wb-focus md:hidden p-2.5 rounded-xl text-[var(--wb-forest-mid)] border border-[color-mix(in_srgb,var(--wb-sage)_18%,transparent)] bg-[var(--wb-white)]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} strokeWidth={1.75} /> : <Menu size={22} strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="md:hidden overflow-hidden border-t border-[color-mix(in_srgb,var(--wb-sage)_14%,transparent)] bg-[var(--wb-white)]"
          >
            <div className="max-w-6xl mx-auto px-5 py-4 flex flex-col gap-2">
              {!user ? (
                <>
                  <MobileNavRow href="/" label="หน้าแรก" onNavigate={() => setMobileMenuOpen(false)} />
                  <MobileNavRow href="/#services" label="บริการของเรา" onNavigate={() => setMobileMenuOpen(false)} />
                  <MobileNavRow href="/#contact" label="ติดต่อเรา" onNavigate={() => setMobileMenuOpen(false)} />
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="wb-focus mt-1 py-3 text-center text-sm font-semibold text-[var(--wb-forest-mid)] border border-[color-mix(in_srgb,var(--wb-sage)_22%,transparent)] rounded-xl"
                  >
                    เข้าสู่ระบบ
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="wb-focus py-3 text-center rounded-xl text-sm font-semibold text-[var(--wb-white)] bg-[var(--wb-forest-mid)]"
                  >
                    สมัครสมาชิก
                  </Link>
                </>
              ) : (
                <>
                  <MobileNavRow href="/dashboard" label="แดชบอร์ด" onNavigate={() => setMobileMenuOpen(false)} />
                  <MobileNavRow href="/chat" label="แชทสนทนา" onNavigate={() => setMobileMenuOpen(false)} />
                  <MobileNavRow href="/dashboard/wallet" label="วอลเล็ต" onNavigate={() => setMobileMenuOpen(false)} />
                  <MobileNavRow href="/dashboard/profile" label="โปรไฟล์" onNavigate={() => setMobileMenuOpen(false)} />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function MobileNavRow({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="wb-focus py-3 px-4 rounded-xl text-sm font-semibold text-[var(--wb-forest)] bg-[var(--wb-mist)] hover:opacity-90 transition-opacity border border-transparent"
    >
      {label}
    </Link>
  );
}

function NavLink({ href, active, label }: { href: string; active?: boolean; label: string }) {
  return (
    <Link href={href} className="group relative py-1.5 wb-focus rounded-md">
      <span
        className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
          active ? 'text-[var(--wb-forest)]' : 'text-[var(--wb-sage-soft)] group-hover:text-[var(--wb-forest-mid)]'
        }`}
      >
        {label}
      </span>
      <span
        className={`absolute -bottom-0.5 left-0 right-0 h-px bg-[var(--wb-sage)] transition-opacity ${
          active ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
        }`}
      />
    </Link>
  );
}
