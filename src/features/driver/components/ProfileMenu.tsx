"use client";

import { useState } from "react";
import { User, Settings, HelpCircle, ChevronRight, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import ChangePasswordModal from "./ChangePasswordModal";
import EditProfileModal from "./EditProfileModal";
import { confirmAlert } from "@/utils/alert";

interface ProfileMenuProps {
  name?: string;
  phone?: string;
  profileImage?: string;
  onProfileUpdate?: () => void;
}

export default function ProfileMenu({ name = "", phone = "", profileImage, onProfileUpdate }: ProfileMenuProps) {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  const handleMenuClick = (label: string) => {
    switch (label) {
      case "Edit Profil":
        setIsEditProfileModalOpen(true);
        break;
      case "Pengaturan Aplikasi":
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
      localStorage.removeItem("token"); 
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

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />

      <EditProfileModal 
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        currentName={name}
        currentPhone={phone}
        currentProfileImage={profileImage}
        onSuccess={() => {
           if (onProfileUpdate) onProfileUpdate();
        }}
      />
    </>
  );
}
