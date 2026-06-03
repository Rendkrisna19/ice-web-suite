"use client";

import { Mail, Phone, Bike } from "lucide-react";

interface AccountInfoProps {
  email?: string;
  phone?: string;
  plate?: string;
}

export default function AccountInfo({ email, phone, plate }: AccountInfoProps) {
  return (
    <div className="mx-6 mt-6 bg-white rounded-3xl p-6 shadow-sm border border-surface-200">
      <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-6">Informasi Akun</h4>
      
      <div className="space-y-6">
        {/* Email */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-surface-50 text-neutral-500 flex items-center justify-center shrink-0">
            <Mail size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-neutral-400 font-medium mb-0.5">Email</p>
            <p className="text-sm font-bold text-primary-900 truncate">{email || "-"}</p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-surface-50 text-neutral-500 flex items-center justify-center shrink-0">
            <Phone size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-neutral-400 font-medium mb-0.5">No. HP</p>
            <p className="text-sm font-bold text-primary-900">{phone || "-"}</p>
          </div>
        </div>

        {/* Plat Nomor */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-surface-50 text-neutral-500 flex items-center justify-center shrink-0">
            <Bike size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-neutral-400 font-medium mb-0.5">Plat Nomor</p>
            <p className="text-sm font-bold text-primary-900 uppercase">{plate || "BK XXXX XX"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
