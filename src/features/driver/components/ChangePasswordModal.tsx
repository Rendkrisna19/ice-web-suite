"use client";

import { useState } from "react";
import { X, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { driverService } from "../services/driverService";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validasi Frontend Sederhana
    if (!formData.current_password) {
      toast.error("Password saat ini wajib diisi!");
      return;
    }
    if (formData.new_password.length < 8) {
      toast.error("Password baru minimal 8 karakter");
      return;
    }
    if (formData.new_password !== formData.new_password_confirmation) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Mengupdate password...");

    try {
      await driverService.changePassword(formData);
      
      toast.success("Password berhasil diganti!", { id: toastId });
      
      // Reset Form & Tutup Modal
      setFormData({ current_password: "", new_password: "", new_password_confirmation: "" });
      onClose();
      
    } catch (error: any) {
      // Tangkap error validasi dari backend (misal: password lama salah)
      const msg = error?.response?.data?.message || "Gagal mengganti password";
      toast.error(msg, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-100">
          <h3 className="font-bold text-lg text-neutral-800">Ganti Kata Sandi</h3>
          <button onClick={onClose} className="p-2 hover:bg-surface-100 rounded-full transition-colors">
            <X size={20} className="text-neutral-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Field: Password Lama */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-500 uppercase">Password Saat Ini</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input 
                type={showCurrent ? "text" : "password"}
                name="current_password"
                value={formData.current_password}
                onChange={handleChange}
                placeholder="Masukkan password lama"
                className="w-full pl-10 pr-10 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
              <button 
                type="button" 
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <hr className="border-dashed border-surface-200 my-2" />

          {/* Field: Password Baru */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-500 uppercase">Password Baru</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input 
                type={showNew ? "text" : "password"}
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                placeholder="Minimal 8 karakter"
                className="w-full pl-10 pr-10 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
              <button 
                type="button" 
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Field: Konfirmasi Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-500 uppercase">Ulangi Password Baru</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input 
                type={showNew ? "text" : "password"} // Ikut toggle password baru
                name="new_password_confirmation"
                value={formData.new_password_confirmation}
                onChange={handleChange}
                placeholder="Ketik ulang password baru"
                className="w-full pl-10 pr-3 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-600/20 hover:bg-primary-700 active:scale-95 transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Simpan Perubahan"}
          </button>
        </form>

      </div>
    </div>
  );
}
