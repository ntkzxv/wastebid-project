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
        // 1. เช็กความพร้อมของข้อมูลกระเป๋าเงินก่อน
        if (!wallet) {
            return alert("ไม่พบข้อมูลกระเป๋าเงิน กรุณารีเฟรชหน้าเว็บอีกครั้ง");
        }

        // 2. เช็กชื่อธนาคาร
        if (!bankInfo.name.trim()) {
            return alert("กรุณาระบุชื่อธนาคาร");
        }


        if (bankInfo.accNo.length < 10 || bankInfo.accNo.length > 15) {
            return alert("📢 กรุณาใส่เลขบัญชีธนาคารให้ถูกต้อง (10 - 15 หลัก)");
        }

        // 4. เช็กจำนวนเงิน
        const numAmount = parseFloat(amount);
        if (!numAmount || numAmount <= 0) {
            return alert("กรุณาระบุจำนวนเงินที่ถูกต้อง");
        }

        // 5. กรณีถอนเงิน ต้องเช็กยอดเงินในกระเป๋าด้วย
        if (showModal === 'withdraw' && numAmount > wallet.balance) {
            return alert("ยอดเงินไม่พอให้ถอนครับเพื่อน!");
        }

        setLoading(true);

        try {
            // คำนวณยอดเงินใหม่
            const newBalance = showModal === 'deposit'
                ? wallet.balance + numAmount
                : wallet.balance - numAmount;

            // อัปเดตยอดเงินใน Wallets
            await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', user.id);

            // บันทึกประวัติ Transaction
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
            setBankInfo({ name: '', accNo: '' }); // ล้างข้อมูลฟอร์ม
            fetchData(user.id); // โหลดข้อมูลใหม่

        } catch (error) {
            console.error(error);
            alert("เกิดข้อผิดพลาดในการทำรายการ");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="bg-[#F8F9F8] min-h-screen font-kanit pb-32 pt-32 px-6">
            <main className="max-w-4xl mx-auto">

                {/*Header*/}
                <header className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-[#3A4A43]"
                            >
                                <ArrowLeft size={20} />
                            </motion.button>
                        </Link>
                        <h1 className="text-5xl font-black text-[#3A4A43] tracking-tighter">My <span className="text-[#748D83]">Wallet</span></h1>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm">
                        <ShieldCheck size={14} className="text-[#748D83]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#3A4A43]">Secured by WasteBid</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
                    {/*Premium Balance Card*/}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="md:col-span-8 relative group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#3A4A43] to-[#748D83] blur-2xl opacity-20 -z-10" />
                        <div className="bg-gradient-to-br from-[#3A4A43] via-[#4A5A53] to-[#3A4A43] rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden border border-white/10">
                            {/*Abstract Shapes for Premium Feel*/}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#748D83]/20 rounded-full -ml-20 -mb-20 blur-2xl" />

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-12">
                                    <div className="space-y-1">
                                        <p className="text-[#748D83] font-black text-[10px] uppercase tracking-[0.3em]">Total Balance</p>
                                        <h2 className="text-6xl font-black tracking-tighter tabular-nums">
                                            ฿{wallet?.balance?.toLocaleString() || '0'}
                                        </h2>
                                    </div>
                                    <div className="w-14 h-10 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 flex flex-col p-2 justify-between">
                                        <div className="w-6 h-4 bg-amber-400/40 rounded-sm" />
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 rounded-full bg-white/40" />
                                            <div className="w-2 h-2 rounded-full bg-white/40" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="px-4 py-2 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                                        <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-0.5">Account Status</p>
                                        <p className="text-xs font-black uppercase text-[#748D83]">Verified Member</p>
                                    </div>
                                    <div className="h-8 w-px bg-white/10" />
                                    <p className="text-[11px] font-medium text-white/60 tracking-wider">
                                        **** **** **** {user.id.toString().padStart(4, '0')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/*Escrow Card*/}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="md:col-span-4 bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Escrow Balance</p>
                                <Info size={12} className="text-gray-300" />
                            </div>
                            <h3 className="text-3xl font-black text-[#3A4A43] tabular-nums">
                                ฿{wallet?.held_balance?.toLocaleString() || '0'}
                            </h3>
                        </div>
                        <p className="text-[9px] text-gray-400 font-medium leading-relaxed">
                            เงินประกันที่ถูกล็อกไว้ระหว่างการประมูลสินค้า <br />
                            จะโอนเมื่อคุณยืนยันการรับสินค้า
                        </p>
                    </motion.div>
                </div>

                {/*Quick Actions*/}
                <div className="grid grid-cols-2 gap-6 mb-16">
                    {user.role === 'bidder' && (
                        <motion.button
                            whileHover={{ y: -5, boxShadow: "0 20px 40px -15px rgba(22, 163, 74, 0.2)" }}
                            onClick={() => setShowModal('deposit')}
                            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center gap-4 transition-all group"
                        >
                            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all duration-500">
                                <Plus size={28} strokeWidth={2.5} />
                            </div>
                            <span className="font-black text-[11px] uppercase tracking-[0.2em] text-[#3A4A43]">Deposit</span>
                        </motion.button>
                    )}
                    <motion.button
                        whileHover={{ y: -5, boxShadow: "0 20px 40px -15px rgba(37, 99, 235, 0.2)" }}
                        onClick={() => setShowModal('withdraw')}
                        className={`bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center gap-4 transition-all group ${user.role === 'owner' ? 'col-span-2' : ''}`}
                    >
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                            <ArrowUpRight size={28} strokeWidth={2.5} />
                        </div>
                        <span className="font-black text-[11px] uppercase tracking-[0.2em] text-[#3A4A43]">Withdraw</span>
                    </motion.button>
                </div>

                {/*Transaction History*/}
                <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-10 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <History size={20} className="text-[#748D83]" />
                            <h3 className="font-black text-[#3A4A43] text-sm uppercase tracking-widest">Recent Activity</h3>
                        </div>
                        <button className="text-[10px] font-black text-[#748D83] uppercase tracking-widest hover:underline">View All</button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {transactions.length > 0 ? transactions.map(t => (
                            <div key={t.id} className="p-8 flex justify-between items-center hover:bg-[#FAFAFA] transition-colors group">
                                <div className="flex items-center gap-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                        {t.amount > 0 ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-black text-[#3A4A43] text-sm group-hover:text-[#748D83] transition-colors">{t.description}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-tighter">
                                            {new Date(t.created_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-lg font-black tabular-nums tracking-tighter ${t.amount > 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {t.amount > 0 ? '+' : ''}฿{Math.abs(t.amount).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 flex flex-col items-center justify-center opacity-20">
                                <Banknote size={48} className="mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No transactions yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>


            {/*Premium Modal*/}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(null)}
                            className="absolute inset-0 bg-[#3A4A43]/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 50, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-[3.5rem] p-12 relative z-10 shadow-3xl"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <p className="text-[10px] font-black text-[#748D83] uppercase tracking-[0.3em] mb-1">Transaction</p>
                                    <h2 className="text-3xl font-black text-[#3A4A43] tracking-tighter">
                                        {showModal === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
                                    </h2>
                                </div>
                                <button onClick={() => setShowModal(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bank Name</label>
                                        <div className="relative">
                                            <select
                                                value={bankInfo.name}
                                                onChange={e => setBankInfo({ ...bankInfo, name: e.target.value })}
                                                className="w-full p-5 bg-gray-50 rounded-2xl border-none text-sm font-bold text-[#3A4A43] outline-none focus:ring-4 ring-[#748D83]/10 transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>โปรดเลือกธนาคารสำหรับทำรายการ</option>
                                                {/* มึงไปแก้ชื่อธนาคารตรงนี้ได้เลย 6 ช่อง */}
                                                <option value="ธนาคารที่ 1">ธนาคารกรุงเทพ (Bangkok Bank - BBL)</option>
                                                <option value="ธนาคารที่ 2">ธนาคารกสิกรไทย (Kasikornbank - KBANK)</option>
                                                <option value="ธนาคารที่ 3">ธนาคารกรุงไทย (Krungthai Bank - KTB)</option>
                                                <option value="ธนาคารที่ 4">ธนาคารไทยพาณิชย์ (Siam Commercial Bank - SCB)</option>
                                                <option value="ธนาคารที่ 5">ธนาคารยูโอบี (United Overseas Bank - UOB)</option>
                                                <option value="ธนาคารที่ 6">ธนาคารเกียรตินาคินภัทร (Kiatnakin Phatra Bank - KKP)</option>
                                            </select>
                                            {/* ลูกศร Dropdown แบบคลีนๆ */}
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Number</label>
                                        <input
                                            type="text"
                                            inputMode="numeric" // ให้มือถือเด้งแป้นตัวเลข
                                            maxLength={15}      // จำกัดไม่ให้พิมพ์เกิน 15 ตัว
                                            placeholder="ระบุเลขบัญชี 10 - 15 หลัก"
                                            value={bankInfo.accNo}
                                            onChange={e => {
                                                // 🔥 กรองให้เหลือแค่ตัวเลขเท่านั้น
                                                const val = e.target.value.replace(/\D/g, '');
                                                setBankInfo({ ...bankInfo, accNo: val });
                                            }}
                                            className="w-full p-5 bg-gray-50 rounded-2xl border-none text-sm font-bold text-[#3A4A43] outline-none focus:ring-4 ring-[#748D83]/10 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount (THB)</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-[#748D83]">฿</span>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                value={amount}
                                                onChange={e => setAmount(e.target.value)}
                                                className="w-full p-5 pl-10 bg-gray-50 rounded-2xl border-none text-2xl font-black text-[#3A4A43] outline-none focus:ring-4 ring-[#748D83]/10 transition-all tabular-nums"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleAction}
                                    disabled={loading}
                                    className="w-full bg-[#3A4A43] text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-[#3A4A43]/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Complete Transaction'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}