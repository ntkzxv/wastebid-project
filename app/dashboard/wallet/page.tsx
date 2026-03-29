"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Wallet, Plus, ArrowUpRight, History,
    X, Loader2, CreditCard, ArrowDownRight, Info,
    ShieldCheck, Banknote
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function WalletPage() {
    const [user, setUser] = useState<any>(null);
    const [wallet, setWallet] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [showModal, setShowModal] = useState<'deposit' | 'withdraw' | null>(null);
    const [loading, setLoading] = useState(false);

    // Form States
    const [amount, setAmount] = useState('');
    const [bankInfo, setBankInfo] = useState({ name: '', accNo: '' });

    useEffect(() => {
        const savedUser = localStorage.getItem('wastebid_user');
        if (savedUser) {
            const parsed = JSON.parse(savedUser);
            setUser(parsed);
            fetchData(parsed.id);
        }
    }, []);

    const fetchData = async (uid: string) => {
        const { data: w } = await supabase.from('wallets').select('*').eq('user_id', uid).single();
        setWallet(w);
        const { data: t } = await supabase.from('transactions').select('*').eq('user_id', uid).order('created_at', { ascending: false });
        setTransactions(t || []);
    };

    const handleAction = async () => {
        if (!wallet) return alert("ไม่พบข้อมูลกระเป๋าเงิน กรุณารีเฟรชหน้าเว็บอีกครั้ง");
        if (!bankInfo.name.trim()) return alert("กรุณาระบุชื่อธนาคาร");
        if (bankInfo.accNo.length < 10 || bankInfo.accNo.length > 15) return alert("📢 กรุณาใส่เลขบัญชีธนาคารให้ถูกต้อง (10 - 15 หลัก)");

        const numAmount = parseFloat(amount);
        if (!numAmount || numAmount <= 0) return alert("กรุณาระบุจำนวนเงินที่ถูกต้อง");
        if (showModal === 'withdraw' && numAmount > wallet.balance) return alert("ยอดเงินไม่พอให้ถอนครับเพื่อน!");

        setLoading(true);

        try {
            const newBalance = showModal === 'deposit' ? wallet.balance + numAmount : wallet.balance - numAmount;

            await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', user.id);

            await supabase.from('transactions').insert([{
                user_id: user.id,
                type: showModal,
                amount: showModal === 'deposit' ? numAmount : -numAmount,
                description: showModal === 'deposit'
                    ? `ฝากเงินผ่าน ${bankInfo.name} (${bankInfo.accNo})`
                    : `ถอนเงินไปที่ ${bankInfo.name} (${bankInfo.accNo})`
            }]);

            alert("ดำเนินการเสร็จสิ้น");
            setShowModal(null);
            setAmount('');
            setBankInfo({ name: '', accNo: '' });
            fetchData(user.id);

        } catch (error) {
            console.error(error);
            alert("เกิดข้อผิดพลาดในการทำรายการ");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="bg-[#FAFAFA] min-h-screen font-sans pb-32 pt-32 px-6 md:px-12 selection:bg-emerald-200">
            <main className="max-w-5xl mx-auto">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard" className="p-3 bg-white rounded-full shadow-sm border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Financial Overview</p>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">My Wallet.</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm self-start md:self-auto">
                        <ShieldCheck size={16} className="text-emerald-600" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800">Secured by WasteBid</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                    {/* Premium Balance Card */}
                    <div className="lg:col-span-8 relative group">
                        <div className="bg-slate-950 rounded-[40px] p-10 md:p-12 text-white shadow-xl relative overflow-hidden h-full flex flex-col justify-center">
                            {/* Abstract Glow Effect */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                            
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="space-y-2">
                                        <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest">Available Balance</p>
                                        <h2 className="text-5xl md:text-6xl font-black tracking-tighter tabular-nums">
                                            ฿{wallet?.balance?.toLocaleString() || '0'}
                                        </h2>
                                    </div>
                                    <div className="w-14 h-10 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex flex-col p-2.5 justify-between">
                                        <div className="w-6 h-3 bg-emerald-400/80 rounded-[2px]" />
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 mt-auto">
                                    <div className="px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Verified Member</p>
                                    </div>
                                    <div className="h-6 w-px bg-white/20" />
                                    <p className="text-xs font-medium text-slate-400 tracking-widest">
                                        **** **** **** {user.id.toString().padStart(4, '0')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Escrow Card */}
                    <div className="lg:col-span-4 bg-white rounded-[40px] p-10 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 text-slate-100">
                            <LockIcon className="w-32 h-32 opacity-50 -rotate-12 translate-x-10 -translate-y-10" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Escrow Balance</p>
                                <Info size={14} className="text-slate-300" />
                            </div>
                            <h3 className="text-4xl font-black text-slate-900 tabular-nums mb-4">
                                ฿{wallet?.held_balance?.toLocaleString() || '0'}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[200px]">
                                เงินประกันที่ถูกล็อกไว้ระหว่างการประมูลสินค้า จะถูกปลดเมื่อจบรายการ
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions (Bento Grid Style) */}
                <div className="grid grid-cols-2 gap-6 mb-16">
                    {user.role === 'bidder' && (
                        <button
                            onClick={() => setShowModal('deposit')}
                            className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-start gap-6 hover:shadow-md hover:border-emerald-200 transition-all group text-left"
                        >
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <Plus size={24} strokeWidth={2} />
                            </div>
                            <div>
                                <span className="block font-black text-xl text-slate-900 mb-1 tracking-tight">Deposit Funds</span>
                                <span className="text-sm text-slate-500 font-medium">Add money to your balance</span>
                            </div>
                        </button>
                    )}
                    <button
                        onClick={() => setShowModal('withdraw')}
                        className={`bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-start gap-6 hover:shadow-md hover:border-slate-300 transition-all group text-left ${user.role === 'owner' ? 'col-span-2' : ''}`}
                    >
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                            <ArrowUpRight size={24} strokeWidth={2} />
                        </div>
                        <div>
                            <span className="block font-black text-xl text-slate-900 mb-1 tracking-tight">Withdraw Funds</span>
                            <span className="text-sm text-slate-500 font-medium">Transfer to bank account</span>
                        </div>
                    </button>
                </div>

                {/* Transaction History */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] overflow-hidden">
                    <div className="p-8 md:px-10 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <History size={20} className="text-slate-400" />
                            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-widest">Recent Activity</h3>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {transactions.length > 0 ? transactions.map(t => (
                            <div key={t.id} className="p-6 md:px-10 flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:bg-slate-50/50 transition-colors group">
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${t.amount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                                        {t.amount > 0 ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-base mb-1">{t.description}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            {new Date(t.created_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-left md:text-right pl-17 md:pl-0">
                                    <p className={`text-xl font-black tabular-nums tracking-tighter ${t.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                                        {t.amount > 0 ? '+' : ''}฿{Math.abs(t.amount).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <div className="py-24 flex flex-col items-center justify-center opacity-40">
                                <Banknote size={48} className="mb-4 text-slate-300" />
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">No transactions yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Premium Modal (Fade Animation Only) */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setShowModal(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white w-full max-w-md rounded-[40px] p-10 md:p-12 relative z-10 shadow-2xl"
                        >
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Transaction</p>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                                        {showModal === 'deposit' ? 'Deposit' : 'Withdraw'}
                                    </h2>
                                </div>
                                <button onClick={() => setShowModal(null)} className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Bank Name</label>
                                    <div className="relative">
                                        <select
                                            value={bankInfo.name}
                                            onChange={e => setBankInfo({ ...bankInfo, name: e.target.value })}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 ring-emerald-50 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>Select Bank...</option>
                                            <option value="ธนาคารกรุงเทพ">ธนาคารกรุงเทพ (BBL)</option>
                                            <option value="ธนาคารกสิกรไทย">ธนาคารกสิกรไทย (KBANK)</option>
                                            <option value="ธนาคารกรุงไทย">ธนาคารกรุงไทย (KTB)</option>
                                            <option value="ธนาคารไทยพาณิชย์">ธนาคารไทยพาณิชย์ (SCB)</option>
                                            <option value="ธนาคารยูโอบี">ธนาคารยูโอบี (UOB)</option>
                                            <option value="ธนาคารเกียรตินาคินภัทร">ธนาคารเกียรตินาคินภัทร (KKP)</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Account Number</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={15}
                                        placeholder="10 - 15 digits"
                                        value={bankInfo.accNo}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            setBankInfo({ ...bankInfo, accNo: val });
                                        }}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 ring-emerald-50 focus:border-emerald-500 transition-all placeholder:text-slate-300"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Amount (THB)</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xl">฿</span>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={e => setAmount(e.target.value)}
                                            className="w-full py-4 pr-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-black text-slate-900 outline-none focus:bg-white focus:ring-4 ring-emerald-50 focus:border-emerald-500 transition-all tabular-nums placeholder:text-slate-300"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleAction}
                                    disabled={loading}
                                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs mt-4 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Confirm'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Icon สำหรับตกแต่ง Escrow Card
function LockIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );
}