"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Wallet, Plus, ArrowUpRight, History, X, Loader2 } from 'lucide-react';
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

    // 🚀 Logic ฝาก/ถอน แบบจำลอง (กดปุ๊บ เงินเปลี่ยนปั๊บ)
    const handleAction = async () => {
        const numAmount = parseFloat(amount);
        if (!numAmount || numAmount <= 0) return alert("กรุณาระบุจำนวนเงินที่ถูกต้อง");
        if (showModal === 'withdraw' && numAmount > wallet.balance) return alert("ยอดเงินไม่พอให้ถอนครับเพื่อน!");

        setLoading(true);

        // 1. อัปเดตยอดเงินใน Wallets
        const newBalance = showModal === 'deposit' ? wallet.balance + numAmount : wallet.balance - numAmount;
        await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', user.id);

        // 2. บันทึกประวัติ Transaction
        await supabase.from('transactions').insert([{
            user_id: user.id,
            type: showModal,
            amount: showModal === 'deposit' ? numAmount : -numAmount,
            description: showModal === 'deposit' ? `ฝากเงินผ่าน ${bankInfo.name}` : `ถอนเงินไปที่ ${bankInfo.name}`
        }]);

        alert("🎉 ดำเนินการสำเร็จ!");
        setShowModal(null);
        setAmount('');
        fetchData(user.id);
        setLoading(false);
    };

    if (!user) return null;

    return (
        <div className="bg-[#FAFAFA] min-h-screen font-kanit pb-20 pt-28">
            <main className="max-w-4xl mx-auto px-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard"><button className="p-3 bg-white rounded-full border border-gray-100 shadow-sm"><ArrowLeft size={20}/></button></Link>
                    <h1 className="text-3xl font-black text-[#3A4A43]">Wallet Simulator</h1>
                </div>

                {/* Balance Card */}
                <div className="bg-[#3A4A43] rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden mb-10">
                    <p className="text-[#748D83] font-bold text-[10px] uppercase tracking-widest">ยอดเงินคงเหลือ (จำลอง)</p>
                    <h2 className="text-5xl font-black mt-2">฿{wallet?.balance?.toLocaleString() || '0'}</h2>
                    <div className="mt-8 pt-8 border-t border-white/10 flex gap-10">
                        <div>
                            <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">เงินที่รอการยืนยัน (Escrow)</p>
                            <p className="text-lg font-black text-[#748D83]">฿{wallet?.held_balance?.toLocaleString() || '0'}</p>
                        </div>
                    </div>
                </div>

                {/* Buttons: Bidder ฝาก/ถอน | Owner ถอนอย่างเดียว */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    {user.role === 'bidder' && (
                        <button onClick={() => setShowModal('deposit')} className="flex items-center justify-center gap-3 bg-white p-6 rounded-3xl font-black text-xs uppercase border border-gray-100 shadow-sm hover:bg-gray-50 transition-all">
                            <Plus size={18} className="text-green-600" /> ฝากเงินทันที
                        </button>
                    )}
                    <button onClick={() => setShowModal('withdraw')} className={`flex items-center justify-center gap-3 bg-white p-6 rounded-3xl font-black text-xs uppercase border border-gray-100 shadow-sm hover:bg-gray-50 transition-all ${user.role === 'owner' ? 'sm:col-span-2' : ''}`}>
                        <ArrowUpRight size={18} className="text-blue-600" /> ถอนเงินทันที
                    </button>
                </div>

                {/* History */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex items-center gap-3">
                        <History size={18} className="text-gray-400" />
                        <h3 className="font-black text-[#3A4A43] text-sm uppercase tracking-widest text-center">ประวัติการทำรายการ</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {transactions.map(t => (
                            <div key={t.id} className="p-6 flex justify-between items-center hover:bg-gray-50/50">
                                <div>
                                    <p className="font-bold text-[#3A4A43] text-sm">{t.description}</p>
                                    <p className="text-[10px] text-gray-400">{new Date(t.created_at).toLocaleDateString('th-TH')}</p>
                                </div>
                                <p className={`font-black ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {t.amount > 0 ? '+' : ''}฿{t.amount.toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

{/* Modal ฟอร์ม (ปรับสีลายน้ำและหัวข้อให้ชัดขึ้น 100%) */}
<AnimatePresence>
    {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setShowModal(null)} className="absolute inset-0 bg-[#3A4A43]/40 backdrop-blur-sm" />
            <motion.div initial={{scale:0.9, y:20}} animate={{scale:1, y:0}} exit={{scale:0.9, y:20}} className="bg-white w-full max-w-md rounded-[2.5rem] p-10 relative z-10 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-[#3A4A43] uppercase tracking-tighter">
                        {showModal === 'deposit' ? 'เติมเงินจำลอง' : 'ถอนเงินจำลอง'}
                    </h2>
                    <button onClick={()=>setShowModal(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>

                <div className="space-y-5">
                    {/* Input: ชื่อธนาคาร */}
                    <div>
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">ธนาคาร (เช่น กสิกร, ไทยพาณิชย์)</label>
                        <input 
                            type="text" 
                            placeholder="พิมพ์ชื่อธนาคารที่นี่..." 
                            value={bankInfo.name} 
                            onChange={e=>setBankInfo({...bankInfo, name: e.target.value})} 
                            className="w-full mt-2 p-4 bg-gray-50 rounded-2xl border-none text-sm font-bold text-[#1A1A1A] placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-[#748D83] transition-all shadow-inner" 
                        />
                    </div>

                    {/* Input: เลขบัญชี */}
                    <div>
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">เลขบัญชี</label>
                        <input 
                            type="text" 
                            placeholder="ระบุเลขบัญชี 10 หลัก..." 
                            value={bankInfo.accNo} 
                            onChange={e=>setBankInfo({...bankInfo, accNo: e.target.value})} 
                            className="w-full mt-2 p-4 bg-gray-50 rounded-2xl border-none text-sm font-bold text-[#1A1A1A] placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-[#748D83] transition-all shadow-inner" 
                        />
                    </div>

                    {/* Input: จำนวนเงิน */}
                    <div>
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">จำนวนเงินที่ต้องการ (บาท)</label>
                        <input 
                            type="number" 
                            placeholder="0.00" 
                            value={amount} 
                            onChange={e=>setAmount(e.target.value)} 
                            className="w-full mt-2 p-4 bg-gray-50 rounded-2xl border-none text-2xl font-black text-[#3A4A43] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#748D83] transition-all shadow-inner" 
                        />
                    </div>

                    <button 
                        onClick={handleAction} 
                        disabled={loading} 
                        className="w-full bg-[#3A4A43] text-white py-5 rounded-2xl font-black uppercase tracking-widest mt-4 hover:bg-[#748D83] transition-all shadow-lg shadow-[#3A4A43]/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20}/> : 'ยืนยันรายการ'}
                    </button>
                </div>
            </motion.div>
        </div>
    )}
</AnimatePresence>
        </div>
    );
}