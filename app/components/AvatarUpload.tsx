"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Camera, Loader2, User as UserIcon } from 'lucide-react';

export default function AvatarUpload({ url, onUpload }: { url: string | null, onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (event: any) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) throw new Error('เลือกรูปก่อนเพื่อน!');

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      // 1. อัปโหลดเข้า Storage
      let { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      // 2. เอา Public URL มา
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      onUpload(data.publicUrl);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="w-24 h-24 rounded-[2rem] overflow-hidden bg-gray-100 border-4 border-white shadow-xl flex items-center justify-center">
          {url ? (
            <img src={url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <UserIcon size={40} className="text-gray-300" />
          )}
        </div>
        
        <label className="absolute bottom-0 right-0 p-2 bg-[#3A4A43] text-white rounded-xl cursor-pointer hover:bg-[#748D83] transition-all shadow-lg">
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
          <input type="file" accept="image/*" onChange={uploadAvatar} disabled={uploading} className="hidden" />
        </label>
      </div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">รูปโปรไฟล์ของคุณ</p>
    </div>
  );
}