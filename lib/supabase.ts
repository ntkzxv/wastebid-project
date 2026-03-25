// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// ดึงค่าจาก .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// สร้าง Client สำหรับเรียกใช้งาน
export const supabase = createClient(supabaseUrl, supabaseAnonKey)