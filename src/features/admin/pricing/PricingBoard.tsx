"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Calculator, Save, Loader2 } from "lucide-react";

// Types & Service
import { PricingConfig } from "@/types/pricing";
import { pricingService } from "@/features/admin/pricing/services/pricingService";

// Shared Components
import AdminHeader from "@/features/admin/components/AdminHeader";

// Local Components
import PricingConfigForm from "./components/PricingConfigForm";
import PricingSimulator from "./components/PricingSimulator";

// Default Initial State (Placeholder sebelum fetch)
const DEFAULT_CONFIG: PricingConfig = {
  basePrice: 0,
  baseDistance: 0,
  pricePerKm: 0,
  serviceFee: 0,
  taxPercentage: 0
};

export default function PricingBoard() {
  const [config, setConfig] = useState<PricingConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // --- FETCH DATA ---
  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const data = await pricingService.getConfig();
      setConfig(data);
    } catch (error) {
      toast.error("Gagal memuat konfigurasi harga.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // --- HANDLERS ---
  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Menyimpan konfigurasi...");
    
    try {
      await pricingService.updateConfig(config);
      toast.success("Rumus harga berhasil diperbarui!", {
        id: toastId,
        style: { background: '#15423C', color: '#fff' }
      });
    } catch (error) {
      toast.error("Gagal menyimpan konfigurasi.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = () => {
      fetchConfig();
      toast.success("Konfigurasi disinkronisasi!");
  };

  return (
    <>
      <AdminHeader title="Global Pricing" onRefresh={handleRefresh} />

      <main className="p-8 pb-32 space-y-8 animate-in fade-in duration-500 bg-surface-300 min-h-screen">
        
        {isLoading ? (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="animate-spin text-primary-600" size={50} />
            </div>
        ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* --- KOLOM KIRI: KONFIGURASI UTAMA --- */}
            <div className="xl:col-span-2 space-y-6">
                
                {/* Hero Section */}
                <div className="bg-[#15423C] text-white p-8 rounded-3xl shadow-xl shadow-[#15423C]/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Calculator className="text-white/80" /> Global Pricing Engine
                    </h2>
                    <p className="text-white/70 mt-2 max-w-xl leading-relaxed text-sm">
                    Atur algoritma harga pengiriman secara global. Perubahan di sini akan langsung berdampak pada semua outlet dan driver secara real-time.
                    </p>
                </div>
                </div>

                {/* Config Form */}
                <PricingConfigForm config={config} onChange={setConfig} />

                <div className="pt-2 flex justify-end">
                <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="flex items-center gap-3 bg-[#15423C] text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-[#15423C]/20 hover:bg-[#1A534B] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {isSaving ? "Menyimpan..." : "Simpan Konfigurasi"}
                </button>
                </div>

            </div>

            {/* --- KOLOM KANAN: SIMULATOR --- */}
            <div className="xl:col-span-1">
                <PricingSimulator config={config} />
            </div>

            </div>
        )}
      </main>
    </>
  );
}
