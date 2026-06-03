"use client";

import { useState, useEffect } from "react";
import { Power, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import toast from "react-hot-toast";
import { merchantService } from "../services/merchantService";
import { confirmAlert } from "@/utils/alert";

export default function StoreToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  // 1. Cek Status Awal saat Load
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await merchantService.getOutletStatus();
        // Backend: is_currently_open true/false
        setIsOpen(data.is_currently_open); 
      } catch (error) {
        console.error("Gagal load status toko", error);
        toast.error("Gagal memuat status toko");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, []);

  // 2. Handle Toggle Click
  const handleToggleClick = async () => {
    // Konfirmasi sebelum aksi
    const confirmMsg = isOpen 
        ? "Apakah Anda yakin ingin MENUTUP toko sementara? Pelanggan tidak akan bisa memesan."
        : "Siap menerima pesanan? Toko akan DIBUKA sekarang.";

    confirmAlert(confirmMsg, async () => {
      const newState = !isOpen;
      setIsToggling(true);
      
      // Optimistic Update (Ubah UI dulu biar cepat)
      setIsOpen(newState); 
      
      try {
        await merchantService.toggleOutlet(newState);
        
        if (newState) {
          toast.success("Toko BERHASIL DIBUKA! Semangat berjualan! 🚀");
        } else {
          toast.success("Toko DITUTUP sementara. Selamat beristirahat! 😴");
        }
      } catch (error) {
        // Revert jika gagal (Rollback UI)
        setIsOpen(!newState);
        toast.error("Gagal mengubah status toko. Coba lagi.");
        console.error(error);
      } finally {
          setIsToggling(false);
      }
    }, { 
      title: isOpen ? "Tutup Toko" : "Buka Toko", 
      type: isOpen ? "warning" : "info",
      confirmText: isOpen ? "Ya, Tutup" : "Ya, Buka"
    });
  };

  if (isLoading) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-surface-100 rounded-full animate-pulse border border-surface-200">
            <div className="w-8 h-8 bg-surface-300 rounded-full"></div>
            <div className="flex flex-col gap-1">
                <div className="w-16 h-2 bg-surface-300 rounded"></div>
                <div className="w-10 h-3 bg-surface-300 rounded"></div>
            </div>
        </div>
      );
  }

  return (
    <button
      onClick={handleToggleClick}
      disabled={isToggling}
      className={cn(
        "group flex items-center gap-3 pl-4 pr-1 py-1 rounded-full border transition-all duration-300 shadow-sm hover:shadow-md active:scale-95",
        isOpen 
          ? "bg-white border-green-200 hover:border-green-300" 
          : "bg-surface-50 border-neutral-200 hover:border-neutral-300"
      )}
      title={isOpen ? "Klik untuk Tutup Toko" : "Klik untuk Buka Toko"}
    >
      <div className="flex flex-col text-right mr-1">
        <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 group-hover:text-neutral-500 transition-colors">
            Status Toko
        </span>
        {/* PERBAIKAN ADA DI SINI: Menambahkan className */}
        <span className={cn(
            "text-sm font-bold leading-none transition-colors",
            isOpen ? "text-green-600" : "text-neutral-500"
        )}>
            {isOpen ? "BUKA" : "TUTUP"}
        </span>
      </div>
      
      <div className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center transition-all relative overflow-hidden",
        isOpen 
            ? "bg-green-500 text-white shadow-lg shadow-green-500/30 group-hover:bg-green-600" 
            : "bg-neutral-300 text-white group-hover:bg-neutral-400"
      )}>
        {isToggling ? (
            <Loader2 size={16} className="animate-spin" />
        ) : (
            <Power size={16} strokeWidth={3} />
        )}
        
        {/* Ping Animation Effect saat Buka */}
        {isOpen && !isToggling && (
           <span className="absolute inset-0 rounded-full bg-green-400 opacity-20 animate-ping"></span>
        )}
      </div>
    </button>
  );
}