"use client";

import { useState, useEffect } from "react";
import { Save, Settings } from "lucide-react";
import toast from "react-hot-toast";

import { DEFAULT_SETTINGS } from "@/data/settings";
import { StoreSettings } from "@/types/settings";
import { settingService } from "./services/api";

import POSSidebar from "../orders/components/POSSidebar";
import POSHeader from "../orders/components/POSHeader";

import OperatingHoursCard from "./components/OperatingHoursCard";
import NotificationCard from "./components/NotificationCard";

export default function SettingsBoard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingService.getOperationalHours();
        setSettings((prev) => ({
          ...prev,
          openTime: data.opening_hour || "08:00",
          closeTime: data.closing_hour || "22:00",
        }));
      } catch (error) {
        toast.error("Gagal memuat jam operasional");
      } finally {
        setIsFetching(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSettingChange = (key: keyof StoreSettings, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    const loadingToast = toast.loading("Menyimpan konfigurasi...");
    
    try {
      await settingService.updateOperationalHours({
        opening_hour: settings.openTime,
        closing_hour: settings.closeTime,
      });
      
      toast.success("Pengaturan berhasil disimpan! 🎉", { id: loadingToast });
    } catch (error) {
      toast.error("Gagal menyimpan pengaturan", { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-surface-300 flex flex-col font-sans overflow-hidden">
      
      <POSSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <POSHeader onMenuClick={() => setIsSidebarOpen(true)} />
    
      <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto pb-32">
          
          <div className="mb-8 flex items-center gap-3">
             <div className="p-2 bg-white rounded-xl shadow-sm border border-surface-200">
               <Settings size={24} className="text-neutral-600" />
             </div>
             <div>
               <h1 className="text-2xl font-bold text-primary-900">Pengaturan Toko</h1>
               <p className="text-neutral-500 text-sm">Kelola preferensi operasional dan sistem.</p>
             </div>
          </div>

          {!isFetching && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <OperatingHoursCard settings={settings} onChange={handleSettingChange} />
              <NotificationCard settings={settings} onChange={handleSettingChange} />
            </div>
          )}

        </div>
      </main>

      <div className="fixed bottom-0 right-0 p-8 z-40 pointer-events-none">
        <button 
          onClick={handleSave}
          disabled={isLoading || isFetching}
          className="pointer-events-auto flex items-center gap-3 bg-primary-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-primary-500/30 hover:bg-primary-600 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="animate-pulse">Menyimpan...</span>
          ) : (
            <>
              <Save size={24} /> Simpan Perubahan
            </>
          )}
        </button>
      </div>

    </div>
  );
}