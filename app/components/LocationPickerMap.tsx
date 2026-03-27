"use client";
import React, { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// 🛠️ แก้ไขปัญหา Marker Icon ไม่ขึ้นใน Next.js
const markerIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

type Coordinates = { lat: number; lng: number };

function ClickHandler({ onChange }: { onChange: (coords: Coordinates) => void }) {
    useMapEvents({
        click(event) {
            onChange({ lat: event.latlng.lat, lng: event.latlng.lng });
        },
    });
    return null;
}

function FlyToMarker({ center }: { center: Coordinates }) {
    const map = useMap();
    useEffect(() => {
        if (center.lat !== 13.7563) { // ถ้าไม่ใช่ค่า Default ให้บินไป
            map.flyTo(center, 15, { animate: true, duration: 0.8 });
        }
    }, [center, map]);
    return null;
}

export default function LocationPickerMap({ value, onChange }: { value: Coordinates | null, onChange: (c: Coordinates) => void }) {
    const defaultCenter = { lat: 13.7563, lng: 100.5018 };
    const currentCenter = value || defaultCenter;

// แก้ไขเฉพาะส่วน return ใน LocationPickerMap.tsx
return (
    <div className="overflow-hidden rounded-[2.5rem] border-2 border-[#748D83]/10 shadow-md bg-white transition-all">
        <MapContainer
            center={currentCenter}
            zoom={value ? 17 : 6} // ✅ ถ้าปักแล้วให้ซูมเข้าไปใกล้ๆ เลย (17 คือเห็นหลังคาบ้าน)
            scrollWheelZoom
            className="h-[400px] md:h-[550px] w-full z-10" // ✅ ขยายความสูงให้ใหญ่ขึ้นชัดเจน
        >
            <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler onChange={onChange} />
            <FlyToMarker center={currentCenter} />
            {value && <Marker position={value} icon={markerIcon} />}
        </MapContainer>
        
        <div className="bg-[#F8F9F8] px-6 py-5 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500 animate-pulse' : 'bg-orange-400'}`} />
                <span className="text-xs font-black text-[#3A4A43] uppercase tracking-widest">
                    {value ? "ยืนยันพิกัดเรียบร้อย" : "กรุณาคลิกเลือกจุดนัดรับบนแผนที่"}
                </span>
            </div>
            {value && (
                <span className="text-[10px] font-bold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100">
                    LAT: {value.lat.toFixed(6)} / LNG: {value.lng.toFixed(6)}
                </span>
            )}
        </div>
    </div>
);
}