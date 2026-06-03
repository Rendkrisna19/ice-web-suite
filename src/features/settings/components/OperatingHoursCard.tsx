"use client";

import { Clock, Store } from "lucide-react";
import { StoreSettings } from "@/types/settings";

interface OperatingHoursCardProps {
  settings: StoreSettings;
  onChange: (key: keyof StoreSettings, value: string) => void;
}

export default function OperatingHoursCard({ settings, onChange }: OperatingHoursCardProps) {
  return (
    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-surface-200 h-full flex flex-col">
      
      <div className="flex items-start gap-4 mb-8">
        <div className="bg-primary-50 p-3.5 rounded-2xl text-primary-500">
          <Clock size={28} />
        </div>
        <div>
          <h3 className="font-bold text-neutral-800 text-xl">Jam Operasional Otomatis</h3>
          <p className="text-sm text-neutral-400 mt-1">Toko akan buka/tutup otomatis sesuai jam ini.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="space-y-3">
          <label className="text-sm font-bold text-neutral-500">Jam Buka</label>
          <div className="relative group">
            <input 
              type="time" 
              value={settings.openTime}
              onChange={(e) => onChange("openTime", e.target.value)}
              className="w-full p-4 pr-12 bg-surface-100 rounded-2xl outline-none font-bold text-lg text-primary-600 transition-all border border-transparent focus:border-primary-500/30 focus:bg-white"
            />
            <Clock size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-neutral-500">Jam Tutup</label>
          <div className="relative group">
            <input 
              type="time" 
              value={settings.closeTime}
              onChange={(e) => onChange("closeTime", e.target.value)}
              className="w-full p-4 pr-12 bg-surface-100 rounded-2xl outline-none font-bold text-lg text-primary-600 transition-all border border-transparent focus:border-primary-500/30 focus:bg-white"
            />
            <Clock size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-start gap-3 p-4 bg-warning-50 rounded-2xl text-warning-700">
        <Store size={20} className="mt-0.5 shrink-0" />
        <span className="text-sm font-medium leading-relaxed">
          Di luar jam ini, toko akan otomatis berstatus <b className="text-warning-800">Tutup (Offline)</b>.
        </span>
      </div>
    </div>
  );
}
