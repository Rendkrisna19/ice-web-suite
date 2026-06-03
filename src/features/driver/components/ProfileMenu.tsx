"use client";

import { useState } from "react";
import { User, Settings, HelpCircle, ChevronRight, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ChangePasswordModal from "./ChangePasswordModal"; // Import Modal
import { confirmAlert } from "@/utils/alert";

export default function ProfileMenu() {
  const router = useRouter();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Logic Menu Action
  const handleMenuClick = (label: string) => {
    switch (label) {
      case "Edit Profil":
        // Navigasi ke halaman edit profil (nanti dibuat)
        toast("Fitur Edit Profil segera hadir!", { icon: "🚧" });
        break;
      case "Pengaturan Aplikasi":
        // Buka Modal Password
        setIsPasswordModalOpen(true);
        break;
      case "Bantuan & Laporan":
        toast("Fitur Bantuan segera hadir!", { icon: "🚧" });
        break;
      default:
        break;
    }
  };

  const handleLogout = async () => {
    confirmAlert("Yakin ingin keluar dari akun?", () => {
      // Clear token storage
      localStorage.removeItem("token"); 
      // Redirect
      window.location.href = "/login"; 
    }, {
      title: "Keluar Akun",
      type: "logout",
      confirmText: "Ya, Keluar"
    });
  };

  const menus = [
    { label: "Edit Profil", icon: <User size={18} /> },
    { label: "Pengaturan Aplikasi", icon: <Settings size={18} /> },
    { label: "Bantuan & Laporan", icon: <HelpCircle size={18} /> },
  ];

  return (
    <>
      <div className="mx-6 mt-6 mb-24 bg-white rounded-3xl p-2 shadow-sm border border-surface-200">
        <div className="divide-y divide-surface-100">
          {menus.map((item, idx) => (
            <button 
              key={idx} 
              onClick={() => handleMenuClick(item.label)}
              className="w-full flex items-center justify-between p-4 hover:bg-surface-50 transition-colors rounded-2xl group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F8F6F2] text-neutral-500 flex items-center justify-center group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                  {item.icon}
                </div>
                <span className="text-sm font-bold text-neutral-700">{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-neutral-300" />
            </button>
          ))}
          
          {/* Logout Button */}
          <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 hover:bg-danger-50 transition-colors rounded-2xl group mt-1"
          >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-danger-50 text-danger-500 flex items-center justify-center">
                  <LogOut size={18} />
                </div>
                <span className="text-sm font-bold text-danger-500">Keluar Akun</span>
              </div>
          </button>
        </div>
      </div>

      {/* Render Modal disini */}
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </>
  );
}
