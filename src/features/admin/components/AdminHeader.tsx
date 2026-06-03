"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, LogOut } from "lucide-react";
import { confirmAlert } from "@/utils/alert";

interface AdminHeaderProps {
  title: string;
  onRefresh?: () => void;
}

export default function AdminHeader({ title, onRefresh }: AdminHeaderProps) {
  const router = useRouter();
  
  // State dan Ref untuk Dropdown Profil
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Menutup dropdown jika klik di luar area
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
    confirmAlert("Apakah Anda yakin ingin keluar?", () => {
      // Hapus sesi login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Redirect ke halaman login
      router.push("/login");
    }, { title: "Keluar Akun", type: "logout", confirmText: "Ya, Keluar" });
  };

  return (
    <header className="h-20 bg-white border-b border-surface-200 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm/50">
      
      {/* Page Title */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Hamburger Menu (Mobile Only) */}
        <button 
          onClick={() => window.dispatchEvent(new Event('toggleAdminSidebar'))}
          className="md:hidden p-2 -ml-2 text-neutral-600 hover:bg-surface-100 rounded-lg transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-neutral-800 line-clamp-1">{title}</h2>
        
        {/* Opsional: Jika kamu ingin menambahkan icon refresh di header (memanfaatkan props onRefresh) */}
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors hidden sm:block"
            title="Refresh Data"
          >
            <RefreshCw size={16} />
          </button>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-neutral-800">Super Admin</p>
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Headquarters</p>
        </div>
        
        {/* Profile & Dropdown */}
        <div className="relative" ref={dropdownRef}>
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-9 h-9 rounded-full bg-[#15423C] text-white flex items-center justify-center font-bold text-xs shadow-md ring-4 ring-surface-100 cursor-pointer hover:bg-[#1A534B] hover:ring-surface-200 transition-all select-none"
              title="Profil Admin"
            >
                A
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl shadow-black/5 border border-surface-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                
                {/* Info profil khusus muncul di mobile (karena text-right disembunyikan di atas) */}
                <div className="px-4 py-2 border-b border-surface-100 mb-2 md:hidden">
                  <p className="text-xs font-bold text-neutral-800">Super Admin</p>
                  <p className="text-[10px] text-neutral-500 uppercase">Headquarters</p>
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
