"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  X, ShoppingBag, LayoutDashboard, Settings, LogOut, Monitor, Utensils, QrCode
} from "lucide-react";
import { cn } from "@/utils/cn";
import toast from "react-hot-toast";
import { confirmAlert } from "@/utils/alert";

interface POSSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function POSSidebar({ isOpen, onClose }: POSSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const MENU_ITEMS = [
    { label: "POS (Kasir)", icon: <Monitor size={20} />, href: "/merchant/pos" },
    { label: "Pesanan Masuk", icon: <ShoppingBag size={20} />, href: "/merchant/orders" },
    { label: "Meja & QR Code", icon: <QrCode size={20} />, href: "/merchant/tables" },
    { label: "Menu Merchants", icon: <Utensils size={20} />, href: "/merchant/menu" },
    { label: "Laporan", icon: <LayoutDashboard size={20} />, href: "/merchant/reports" },
    { label: "Pengaturan", icon: <Settings size={20} />, href: "/merchant/settings" },
  ];

  const handleLogout = () => {
    confirmAlert("Yakin ingin keluar dari akun Merchant?", () => {
      localStorage.removeItem("token");
      toast.success("Berhasil Logout");
      router.push("/login");
    }, { title: "Keluar Akun", type: "logout", confirmText: "Ya, Keluar" });
  };

  return (
    <>
      {/* Overlay Background */}
      <div 
        onClick={onClose}
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Sidebar Container */}
      <div className={cn(
        "fixed top-0 left-0 h-full w-72 bg-[#1b433d] z-[90] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col border-r border-white/5",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        
        {/* Header */}
        <div className="h-24 flex items-center justify-between px-6 border-b border-white/5 bg-[#1b433d]">
          <div className="flex flex-col gap-1 mt-2">
            <h2 className="text-white font-extrabold text-2xl tracking-tight leading-none">Merchant POS</h2>
            <p className="text-[#649e95] text-[11px] uppercase tracking-widest font-semibold">Navigation</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 bg-white/10 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors active:scale-95"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose} 
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group",
                  isActive 
                    ? "bg-white/10 text-white font-semibold shadow-sm" 
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className={cn(
                  "transition-colors",
                  isActive ? "text-white" : "text-white/60 group-hover:text-white"
                )}>
                  {item.icon}
                </div>
                <span className="tracking-wide text-[15px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className="p-6 bg-[#173a35] border-t border-white/5">
          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 text-[#ff8b7e] hover:text-[#ff9c91] hover:bg-[#ff8b7e]/10 w-full px-4 py-3.5 rounded-2xl transition-all active:scale-95 group"
          >
            <LogOut size={20} className="transition-transform group-hover:-translate-x-1" strokeWidth={2.5}/>
            <span className="font-bold text-[15px]">Keluar Aplikasi</span>
          </button>

          {/* User Profile / Version Detail (Sesuai area paling bawah gambar) */}
          <div className="flex items-center justify-between mt-8">
            <div className="w-11 h-11 rounded-full bg-[#0a0a0a] flex items-center justify-center border border-white/10 shadow-inner">
              <span className="text-white font-medium text-lg">N</span>
            </div>
            <p className="text-[12px] text-[#649e95] font-medium tracking-wide">Version 1.0.0 &copy; 2026</p>
          </div>
        </div>

      </div>
    </>
  );
}
