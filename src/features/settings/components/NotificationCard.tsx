"use client";

import { Bell, Volume2, Play, VolumeX } from "lucide-react";
import toast from "react-hot-toast";
import { StoreSettings } from "@/types/settings";

interface NotificationCardProps {
  settings: StoreSettings;
  onChange: (key: keyof StoreSettings, value: boolean) => void;
}

export default function NotificationCard({ settings, onChange }: NotificationCardProps) {
  
  const playSound = () => {
    toast("Memainkan suara...", {
      icon: <Volume2 size={18} className="text-primary-500" />,
      style: { borderRadius: '10px', background: '#333', color: '#fff' },
    });
    
    try {
      const audio = new Audio("/sounds/notification.mp3");
      audio.play().catch(e => console.log("Audio play failed:", e));
    } catch (e) {
      console.log("Audio initialization failed:", e);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-surface-200 h-full flex flex-col">
      
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="bg-[#FAF9F6] p-3.5 rounded-2xl text-neutral-500">
          <Bell size={28} />
        </div>
        <div>
          <h3 className="font-bold text-neutral-800 text-xl">Notifikasi Pesanan</h3>
          <p className="text-sm text-neutral-400 mt-1">Pengaturan suara &quot;Ting-tong&quot; saat order masuk.</p>
        </div>
      </div>

      {/* Toggle Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Volume2 className="text-neutral-400" size={24} />
          <span className="text-lg font-bold text-neutral-700">Suara Notifikasi</span>
        </div>
        
        {/* PREMIUM TOGGLE SWITCH */}
        <label className="relative inline-flex items-center cursor-pointer group">
          <input 
            type="checkbox" 
            checked={settings.isNotificationEnabled}
            onChange={(e) => onChange("isNotificationEnabled", e.target.checked)}
            className="sr-only peer" 
          />
          
          {/* Track (Latar Belakang) */}
          <div className="w-16 h-9 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:bg-primary-500 transition-all duration-300 shadow-inner relative overflow-hidden peer-checked:shadow-[0_0_15px_rgba(21,66,60,0.3)]">
            
            {/* Icon ON (Muncul saat Hidup) */}
            <Volume2 
              size={14} 
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white transition-all duration-300 opacity-0 -translate-x-2 peer-checked:opacity-100 peer-checked:translate-x-0" 
            />
            
            {/* Icon OFF (Muncul saat Mati) */}
            <VolumeX 
              size={14} 
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 transition-all duration-300 opacity-100 translate-x-0 peer-checked:opacity-0 peer-checked:translate-x-2" 
            />

          </div>

          {/* Knob (Lingkaran Putih) */}
          <div className="absolute left-[4px] top-[4px] bg-white w-7 h-7 rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-7 flex items-center justify-center group-hover:scale-105">
            {/* Titik Kecil di Tengah Knob (Aksen Visual) */}
            <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${settings.isNotificationEnabled ? 'bg-[#15423C]' : 'bg-neutral-300'}`}></div>
          </div>
        </label>
      </div>
      
      {/* Test Sound Box */}
      <div className="mt-auto p-6 bg-[#F2F0E9] rounded-2xl">
        <p className="text-sm text-neutral-500 mb-3 font-medium">Test Suara:</p>
        <button 
          onClick={playSound}
          className="bg-primary-500 text-white px-5 py-3 rounded-xl hover:bg-primary-400 transition-all flex items-center gap-2 font-bold shadow-lg shadow-[#15423C]/20 active:scale-95"
        >
          <Play size={16} fill="currentColor" /> 
          Play &quot;Ting-tong&quot;
        </button>
      </div>
    </div>
  );
}