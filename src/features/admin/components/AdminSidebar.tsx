"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { 
  LayoutDashboard, 
  Store, 
  UtensilsCrossed, 
  Users, 
  Bike, 
  LogOut, 
  FileBarChart,
  ChevronLeft,
  ChevronRight,
  Calculator,
  RefreshCcw 
} from "lucide-react";

import { cn } from "@/utils/cn";
import { authService } from "@/features/auth/services/authService";
import { confirmAlert } from "@/utils/alert";

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
}

export default function AdminSidebar({ 
  isCollapsed, 
  setIsCollapsed, 
  isMobileOpen, 
  setIsMobileOpen 
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // --- MENU ITEMS (Sesuai Folder Screenshot) ---
  const menuItems = [
    { 
      name: "Dasbor Utama", 
      icon: LayoutDashboard, 
      href: "/admin/dashboard" 
    },
    { 
      name: "Toko Mitra", // Folder: merchants
      icon: Store, 
      href: "/admin/merchants" 
    },
    { 
      name: "Pengaturan Harga", // Folder: pricing
      icon: Calculator, 
      href: "/admin/pricing" 
    },
    { 
      name: "Pelanggan", // Folder: customers
      icon: Users, 
      href: "/admin/customers" 
    },
    { 
      name: "Kurir Driver", // Folder: drivers
      icon: Bike, 
      href: "/admin/drivers" 
    },
    { 
      name: "Pesanan Batal", // Folder: refunds (BARU)
      icon: RefreshCcw, 
      href: "/admin/rejects" 
    },
    { 
      name: "Laporan", // Folder: reports
      icon: FileBarChart, 
      href: "/admin/reports" 
    },
    // { name: "Settings", icon: Settings, href: "/admin/settings" }, // Folder belum ada di screenshot
  ];

  // --- HANDLER LOGOUT ---
  const handleLogout = async () => {
    confirmAlert("Apakah Anda yakin ingin keluar?", async () => {
      setIsLoggingOut(true);
      const toastId = toast.loading("Sedang keluar...");

      try {
        await authService.logout();
        localStorage.removeItem("token"); 
        localStorage.removeItem("user");
        
        toast.success("Berhasil logout", { id: toastId });
        router.push("/login"); 
        
      } catch (error) {
        toast.error("Gagal logout", { id: toastId });
        console.error(error);
      } finally {
        setIsLoggingOut(false);
      }
    }, { title: "Keluar Akun", type: "logout", confirmText: "Ya, Keluar" });
  };

  return (
    <aside 
      className={cn(
        "bg-[#15423C] text-white h-screen fixed left-0 top-0 z-50 flex flex-col transition-all duration-300 shadow-xl",
        isCollapsed ? "w-20" : "w-64",
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      {/* --- LOGO AREA --- */}
      <div className="h-16 flex items-center justify-center border-b border-white/10 relative">
        {isCollapsed ? (
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#15423C] font-bold text-xl">
            Z
          </div>
        ) : (
          <h1 className="text-xl font-bold tracking-wider">ZAD<span className="text-primary-300 font-light">ADMIN</span></h1>
        )}
        
        {/* Toggle Button (Desktop Only) */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 bg-white text-[#15423C] p-1 rounded-full shadow-md border border-neutral-200 hover:bg-neutral-100 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* --- MENU LIST --- */}
      <nav className="flex-1 overflow-y-auto py-6 space-y-2 px-3 custom-scrollbar">
        {menuItems.map((item) => {
          // Logic Active State: Jika URL diawali dengan href menu tsb
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-white/10 text-white font-semibold shadow-inner" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={20} className={cn("shrink-0", isActive && "text-primary-200")} />
              
              {!isCollapsed && (
                <span className="truncate">{item.name}</span>
              )}

              {/* Tooltip saat collapsed */}
              {isCollapsed && (
                <div className="absolute left-14 bg-neutral-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* --- FOOTER (LOGOUT) --- */}
      <div className="p-3 border-t border-white/10">
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all duration-200 group relative",
            isLoggingOut && "opacity-50 cursor-not-allowed"
          )}
        >
          <LogOut size={20} className="shrink-0" />
          
          {!isCollapsed && (
            <span className="font-medium truncate">
              {isLoggingOut ? "Keluar..." : "Logout"}
            </span>
          )}

          {isCollapsed && (
            <div className="absolute left-14 bg-red-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
              Logout
            </div>
          )}
        </button>
      </div>

    </aside>
  );
}
