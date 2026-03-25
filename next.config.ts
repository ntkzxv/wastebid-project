import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // ท่าที่ 1: ย้ายมาไว้นอกสุด (บาง Patch ของ Next 16 ย้ายมาตรงนี้)
  // @ts-ignore
  allowedDevOrigins: ['192.168.0.195'],

  // ท่าที่ 2: ถ้ายังบ่นใน experimental ให้เปลี่ยนเป็น 'any' เพื่อให้มันอ่านค่าได้โดยไม่ตรวจ
  experimental: {
    serverActions: {
      allowedOrigins: ['192.168.0.195', 'localhost:3000'],
    },
  } as any,
};

export default nextConfig;