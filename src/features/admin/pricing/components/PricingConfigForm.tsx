"use client";

import { DollarSign, MapPin, TrendingUp, Info, Percent,Banknote } from "lucide-react";
import { PricingConfig } from "@/types/pricing";

interface PricingConfigFormProps {
  config: PricingConfig;
  onChange: (config: PricingConfig) => void;
}

export default function PricingConfigForm({
  config,
  onChange,
}: PricingConfigFormProps) {
  const handleChange = (key: keyof PricingConfig, value: string) => {
    onChange({
      ...config,
      [key]: Number(value),
    });
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-surface-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
        {/* Base Price */}
        <div className="group">
          <label className="flex items-center gap-2 text-sm font-bold text-neutral-700 mb-3">
            <Banknote size={16} className="text-primary-500" /> Harga Dasar
            (Base Price)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">
              Rp
            </span>
            <input
              type="number"
              value={config.basePrice}
              onChange={(e) => handleChange("basePrice", e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-surface-50 border-2 border-transparent focus:bg-white focus:border-primary-500/20 rounded-2xl text-lg font-bold text-neutral-800 outline-none transition-all"
            />
          </div>
          <p className="text-xs text-neutral-400 mt-2 ml-1">
            Tarif minimum untuk setiap pesanan.
          </p>
        </div>

        {/* Base Distance */}
        <div className="group">
          <label className="flex items-center gap-2 text-sm font-bold text-neutral-700 mb-3">
            <MapPin size={16} className="text-blue-500" /> Jarak Dasar (Base
            Distance)
          </label>
          <div className="relative">
            <input
              type="number"
              value={config.baseDistance}
              onChange={(e) => handleChange("baseDistance", e.target.value)}
              className="w-full pl-4 pr-16 py-4 bg-surface-50 border-2 border-transparent focus:bg-white focus:border-primary-500/20 rounded-2xl text-lg font-bold text-neutral-800 outline-none transition-all"
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">
              Km
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-2 ml-1">
            Jarak maksimal yang dicakup harga dasar.
          </p>
        </div>

        {/* Extra Price */}
        <div className="group">
          <label className="flex items-center gap-2 text-sm font-bold text-neutral-700 mb-3">
            <TrendingUp size={16} className="text-orange-500" /> Tarif Ekstra
            per Km
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">
              Rp
            </span>
            <input
              type="number"
              value={config.pricePerKm}
              onChange={(e) => handleChange("pricePerKm", e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-surface-50 border-2 border-transparent focus:bg-white focus:border-primary-500/20 rounded-2xl text-lg font-bold text-neutral-800 outline-none transition-all"
            />
          </div>
          <p className="text-xs text-neutral-400 mt-2 ml-1">
            Dikenakan untuk setiap Km setelah jarak dasar.
          </p>
        </div>



        {/* Tax Percentage (Optional if needed) */}
        <div className="group">
          <label className="flex items-center gap-2 text-sm font-bold text-neutral-700 mb-3">
            <Percent size={16} className="text-red-500" /> Pajak (Tax)
          </label>
          <div className="relative">
            <input
              type="number"
              value={config.taxPercentage}
              onChange={(e) => handleChange("taxPercentage", e.target.value)}
              className="w-full pl-4 pr-12 py-4 bg-surface-50 border-2 border-transparent focus:bg-white focus:border-primary-500/20 rounded-2xl text-lg font-bold text-neutral-800 outline-none transition-all"
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">
              %
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-2 ml-1">
            Persentase pajak yang dikenakan.
          </p>
        </div>
      </div>
    </div>
  );
}
