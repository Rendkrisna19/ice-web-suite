"use client";

import { useState, useRef } from "react";
import { X, Camera, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import api from "@/lib/axios";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentPhone: string;
  currentProfileImage?: string;
  onSuccess: () => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  currentName,
  currentPhone,
  currentProfileImage,
  onSuccess
}: EditProfileModalProps) {
  const [name, setName] = useState(currentName);
  const [phone, setPhone] = useState(currentPhone);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 2 * 1024 * 1024) {
        toast.error("Maksimal ukuran foto adalah 2MB");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Menyimpan profil...");

    try {
      // 1. Update text info
      await api.post("/auth/profile/update", {
        name,
        phone,
      });

      // 2. Update photo if selected
      if (file) {
        const formData = new FormData();
        formData.append("profile_image", file);
        await api.post("/auth/profile/photo", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      toast.success("Profil berhasil diupdate!", { id: toastId });
      onSuccess();
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Gagal menyimpan profil";
      toast.error(msg, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayImage = preview || currentProfileImage || "https://i.pravatar.cc/150?u=d1";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={isSubmitting ? undefined : onClose}
      />

      {/* Modal */}
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-surface-50">
          <h2 className="font-bold text-lg text-neutral-800">Edit Profil</h2>
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 bg-white rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-3">
             <div className="relative w-24 h-24 rounded-full border-4 border-surface-100 overflow-hidden bg-neutral-100">
                <Image src={displayImage} alt="Profile" fill className="object-cover" unoptimized />
                <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                >
                   <Camera className="text-white" size={24} />
                </div>
             </div>
             <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-bold text-primary-600 active:scale-95 transition-transform"
             >
                Ganti Foto
             </button>
             <input 
                ref={fileInputRef}
                type="file" 
                accept="image/png, image/jpeg, image/jpg" 
                className="hidden" 
                onChange={handleFileChange}
             />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1.5 ml-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full bg-surface-100 border-none rounded-xl px-4 py-3.5 text-neutral-800 font-medium focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
                placeholder="Nama Anda"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1.5 ml-1">
                Nomor HP / WA
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full bg-surface-100 border-none rounded-xl px-4 py-3.5 text-neutral-800 font-medium focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
                placeholder="0812xxx"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-[#1A534B] hover:bg-[#15443D] text-white font-bold shadow-lg shadow-[#1A534B]/30 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Menyimpan...</span>
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
