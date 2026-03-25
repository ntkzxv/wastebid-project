"use client";
import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
  isVisible: boolean;
  onClose: () => void;
  type: NotificationType;
  title: string;
  message: string;
}

const icons = {
  success: <CheckCircle2 className="text-green-500" size={20} />,
  error: <XCircle className="text-red-500" size={20} />,
  warning: <AlertCircle className="text-yellow-500" size={20} />,
  info: <Info className="text-blue-400" size={20} />,
};

export default function Notification({ isVisible, onClose, type, title, message }: NotificationProps) {
  
  // ให้ปิดเองอัตโนมัติหลังจาก 5 วินาที
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 50, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed top-24 right-6 z-[100] w-full max-w-[380px]"
        >
          <div className="bg-[#F8F9F8] border border-white/5 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] p-5 relative overflow-hidden">
            {/* กากบาทปิด (Top Right) F8F9F8*/}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex gap-4">
              {/* Icon ตามประเภท */}
              <div className="shrink-0 mt-0.5">
                {icons[type]}
              </div>

              {/* Text Content */}
              <div className="flex flex-col gap-1 pr-6">
                <h3 className="text-[14px] font-bold text-[#262626] font-kanit tracking-wide">
                  {title}
                </h3>
                <p className="text-[12px] text-gray-400 font-kanit leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            {/* Progress Bar ด้านล่าง (Optional: ให้ดูว่าใกล้จะหายไปยัง) */}
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              className={`absolute bottom-0 left-0 h-[2px] ${
                type === 'success' ? 'bg-green-500/50' : 
                type === 'error' ? 'bg-red-500/50' : 'bg-white/10'
              }`}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}