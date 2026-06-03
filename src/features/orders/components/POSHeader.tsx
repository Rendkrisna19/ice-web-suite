"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Menu, Search, Bell, LogOut, User as UserIcon } from "lucide-react";
import StoreToggle from "./StoreToggle"; 
import { merchantService } from "../services/merchantService";
import { confirmAlert } from "@/utils/alert";

interface POSHeaderProps {
  onMenuClick: () => void;
}

export default function POSHeader({ onMenuClick }: POSHeaderProps) {
  const router = useRouter();
  const [outletName, setOutletName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  
  // State dan Ref untuk Dropdown Profil
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch Nama Outlet saat komponen dimuat
  useEffect(() => {
    const fetchOutletInfo = async () => {
      try {
        const data = await merchantService.getOutletStatus();
        setOutletName(data.name);
      } catch (error) {
        console.error("Gagal memuat informasi outlet", error);
        setOutletName("Merchant POS"); // Fallback jika gagal
      } finally {
        setIsLoading(false);
      }
    };

    fetchOutletInfo();
  }, []);

  // Menutup dropdown jika user klik di luar area dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fungsi Logout
  const handleLogout = () => {
    confirmAlert("Yakin ingin keluar dari akun Kasir?", () => {
      // Hapus data sesi dari localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Arahkan kembali ke halaman login
      router.push("/login");
    }, { title: "Keluar Akun", type: "logout", confirmText: "Ya, Keluar" });
  };

  return (
    <header className="h-16 bg-white border-b border-surface-200 px-4 flex items-center justify-between shrink-0 shadow-sm z-30 relative">
       
       {/* KIRI: Menu & Judul */}
       <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="p-2 hover:bg-surface-50 rounded-lg text-neutral-600 transition-colors"
          >
             <Menu size={24} />
          </button>
          
          <div className="hidden md:flex items-center gap-2">
             {isLoading ? (
                // Skeleton Loader saat loading nama
                <div className="h-6 w-40 bg-surface-100 rounded animate-pulse" />
             ) : (
                <h1 className="text-lg font-bold text-[#15423C] truncate max-w-[250px]">
                   {outletName}
                </h1>
             )}
             <span className="text-neutral-400 font-normal text-lg">| Order Management</span>
          </div>
       </div>

       {/* KANAN: Tools & Profile */}
       <div className="flex items-center gap-3 sm:gap-4">
          
          {/* 1. Store Toggle (Status Buka/Tutup) */}
          <div className="hidden sm:block">
             <StoreToggle />
          </div>

          {/* Search Bar Kecil (Hanya di Desktop) */}
          <div className="relative hidden lg:block">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
             <input 
                type="text" 
                placeholder="Cari Order ID..." 
                className="pl-9 pr-4 py-2 bg-surface-50 border border-surface-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 w-48 xl:w-64 transition-all"
             />
          </div>

          <div className="w-px h-6 bg-surface-200 mx-1 hidden sm:block"></div>

          {/* Notification */}
          <button className="relative p-2 hover:bg-surface-50 rounded-full text-neutral-600 transition-colors">
             <Bell size={20} />
             <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          
          {/* Profile Avatar & Dropdown */}
          <div className="relative" ref={dropdownRef}>
             <div 
               onClick={() => setIsDropdownOpen(!isDropdownOpen)}
               className="w-9 h-9 rounded-full bg-[#15423C] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary-900/20 cursor-pointer hover:bg-[#1A534B] transition-colors select-none"
             >
                {/* Ambil huruf depan nama outlet atau 'M' jika loading */}
                {isLoading ? "..." : outletName.charAt(0).toUpperCase()}
             </div>

             {/* Dropdown Menu */}
             {isDropdownOpen && (
               <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl shadow-black/5 border border-surface-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                 
                 {/* Header Dropdown (Opsional: Menampilkan Nama Info Singkat) */}
                 <div className="px-4 py-2 border-b border-surface-100 mb-2">
                   <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Kasir Aktif</p>
                   <p className="text-sm font-semibold text-neutral-800 truncate">{isLoading ? "Memuat..." : outletName}</p>
                 </div>

                 {/* Tombol Logout */}
                 <button 
                   onClick={handleLogout}
                   className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-3 transition-colors font-medium"
                 >
                   <LogOut size={18} />
                   Keluar (Logout)
                 </button>
               </div>
             )}
          </div>

       </div>
    </header>
  );
}