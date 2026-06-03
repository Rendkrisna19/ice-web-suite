"use client";

import { useState } from "react";
import { Bike, Info, ArrowRight, MapPin } from "lucide-react";
import { PricingConfig } from "@/types/pricing";

interface PricingSimulatorProps {
  config: PricingConfig;
}

export default function PricingSimulator({ config }: PricingSimulatorProps) {
  const [distance, setDistance] = useState(8.5);
  const basePrice = Number(config.basePrice) || 0;
  const baseDist = Number(config.baseDistance) || 0;
  const perKm = Number(config.pricePerKm) || 0;
  const fee = Number(config.serviceFee) || 0;
  const extraDist = Math.max(0, distance - baseDist);
  const extraCost = extraDist * perKm; 
  const driverFee = basePrice + extraCost;
  const totalCost = driverFee + fee;

  const formatRupiah = (value: number) => {
    return value.toLocaleString("id-ID", { 
      maximumFractionDigits: 0, 
      style: "currency", 
      currency: "IDR" 
    }).replace("Rp", "Rp "); 
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-surface-200 sticky top-24">
      <h3 className="font-bold text-neutral-800 mb-6 flex items-center gap-2">
          Live Simulator <span className="bg-green-50 text-green-700 text-[10px] px-2 py-0.5 rounded-full border border-green-100">PREVIEW</span>
      </h3>

      {/* Slider Jarak */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2 font-medium">
          <span className="text-neutral-500">Jarak Tempuh</span>
          <span className="text-primary-600 font-bold">{distance} Km</span>
        </div>
        <input 
          type="range" 
          min="1" 
          max="25" 
          step="0.5"
          value={distance} 
          onChange={(e) => setDistance(Number(e.target.value))}
          className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
        />
        <div className="flex justify-between text-xs text-neutral-400 mt-2">
          <span>1 Km</span>
          <span>25 Km</span>
        </div>
      </div>

      {/* Receipt Preview */}
      <div className="bg-surface-50 p-5 rounded-2xl border border-surface-200 space-y-3 relative overflow-hidden">
        
        {/* Decorative Blur */}
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl pointer-events-none"></div>
        
        {/* Ongkir Driver Header */}
        <div className="flex items-center justify-between pb-3 border-b border-dashed border-neutral-300">
           <div className="flex items-center gap-2">
             <div className="bg-white p-1.5 rounded-lg shadow-sm">
                <Bike size={16} className="text-primary-600"/>
             </div>
             <span className="text-sm font-semibold text-neutral-700">Ongkir Driver</span>
           </div>
           <span className="text-sm font-bold text-neutral-800">
             {formatRupiah(driverFee)}
           </span>
        </div>

        {/* Breakdown Detail */}
        <div className="space-y-2 text-xs text-neutral-500 py-1 font-mono">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1">
                <MapPin size={10} /> Base ({baseDist} km)
            </span>
            <span>{formatRupiah(basePrice)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Extra ({extraDist.toFixed(1)} km x {formatRupiah(perKm)})</span>
            <span>{formatRupiah(extraCost)}</span>
          </div>
        </div>

        {/* App Fee */}
        <div className="flex items-center justify-between pt-3 border-t border-dashed border-neutral-300">
           <div className="flex items-center gap-2">
             <div className="bg-purple-50 p-1.5 rounded-lg">
                <Info size={16} className="text-purple-600"/>
             </div>
             <span className="text-sm font-semibold text-neutral-700">App Fee</span>
           </div>
           <span className="text-sm font-bold text-purple-600">
             {formatRupiah(fee)}
           </span>
        </div>
      </div>

      {/* Total Besar */}
      <div className="bg-primary-500 text-white mt-4 p-5 rounded-2xl shadow-lg shadow-primary-500/20 flex justify-between items-center group cursor-default">
         <div>
           <p className="text-[10px] text-white/70 uppercase tracking-widest mb-1 font-bold">Total Ongkir User</p>
           <p className="text-3xl font-bold tracking-tight">
             {formatRupiah(totalCost)}
           </p>
         </div>
         <div className="bg-white/10 p-2 rounded-full group-hover:bg-white/20 transition-colors">
           <ArrowRight size={20} />
         </div>
      </div>

      <p className="text-center text-xs text-neutral-400 mt-6 leading-relaxed">
        *Simulasi ini menghitung estimasi realtime berdasarkan input konfigurasi di sebelah kiri.
      </p>

    </div>
  );
}
