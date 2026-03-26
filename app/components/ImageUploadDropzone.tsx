"use client";
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone'; // ถ้ายังไม่ได้ลง ให้รัน: npm install react-dropzone
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onImagesChange: (files: File[]) => void;
  maxImages?: number;
}

export default function ImageUploadDropzone({ onImagesChange, maxImages = 5 }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // จำกัดจำนวนรูปไม่ให้เกิน maxImages
    const newFiles = [...files, ...acceptedFiles].slice(0, maxImages);
    setFiles(newFiles);
    
    // สร้าง Preview URL สำหรับโชว์รูป
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
    
    // ส่งไฟล์กลับไปให้หน้า Create Page
    onImagesChange(newFiles);
  }, [files, maxImages, onImagesChange]);

  const removeImage = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    // ล้าง Memory สำหรับ ObjectURL ตัวเก่า
    URL.revokeObjectURL(previews[index]);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
    onImagesChange(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: maxImages
  });

  return (
    <div className="space-y-6">
      {/* 📸 ส่วนของการเลือกรูป (Dropzone) */}
      {files.length < maxImages && (
        <div 
          {...getRootProps()} 
          className={`relative border-2 border-dashed rounded-[2rem] p-10 transition-all cursor-pointer flex flex-col items-center justify-center gap-4
            ${isDragActive ? 'border-[#748D83] bg-[#748D83]/5 scale-[0.98]' : 'border-gray-100 hover:border-[#748D83] hover:bg-gray-50'}`}
        >
          <input {...getInputProps()} />
          <div className="p-4 bg-white rounded-2xl shadow-sm text-gray-400">
            <Upload size={24} />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-[#3A4A43]">คลิกหรือลากรูปภาพมาวางที่นี่</p>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1">PNG, JPG ขนาดไม่เกิน 5MB ({files.length}/{maxImages})</p>
          </div>
        </div>
      )}

      {/* 🖼️ ส่วนของการแสดงพรีวิวรูปที่เลือกแล้ว */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <AnimatePresence>
          {previews.map((url, index) => (
            <motion.div 
              key={url}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative aspect-square rounded-[1.5rem] overflow-hidden border border-gray-100 group shadow-sm"
            >
              <img src={url} alt="preview" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
              <button 
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
              <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/50 to-transparent">
                <p className="text-[8px] text-white font-bold uppercase tracking-widest">รูปที่ {index + 1}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ปุ่มเพิ่มรูปเล็กๆ (โชว์เมื่อมีรูปแล้วแต่ยังไม่เต็ม) */}
        {files.length > 0 && files.length < maxImages && (
          <div {...getRootProps()} className="aspect-square rounded-[1.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-1 text-gray-300 hover:border-[#748D83] hover:text-[#748D83] cursor-pointer transition-all">
            <Plus size={20} />
            <span className="text-[8px] font-black uppercase tracking-widest">เพิ่มรูป</span>
          </div>
        )}
      </div>
    </div>
  );
}