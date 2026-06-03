"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/utils/cn";

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export default function RejectModal({ isOpen, onClose, onConfirm }: RejectModalProps) {
  const [reason, setReason] = useState("Stok Habis");
  const reasons = ["Stok Habis", "Outlet Tutup", "Terlalu Ramai", "Lainnya"];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
       <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
          
          <div className="flex items-center gap-3 mb-4 text-red-600">
             <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
             </div>
             <h3 className="font-bold text-lg text-neutral-900">Tolak Pesanan?</h3>
          </div>
          
          <p className="text-sm text-neutral-500 mb-4">
             Pilih alasan penolakan. Pelanggan akan menerima notifikasi pembatalan ini.
          </p>

          <div className="space-y-2 mb-6">
             {reasons.map((r) => (
                 <button
                    key={r}
                    onClick={() => setReason(r)}
                    className={cn(
                        "w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition-all",
                        reason === r 
                          ? "border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500" 
                          : "border-surface-200 bg-white text-neutral-600 hover:bg-surface-50"
                    )}
                 >
                    {r}
                 </button>
             ))}
          </div>

          <div className="flex gap-3">
             <button 
               onClick={onClose}
               className="flex-1 py-3 font-bold text-neutral-600 bg-surface-100 hover:bg-surface-200 rounded-xl transition-colors text-sm"
             >
               Batal
             </button>
             <button 
               onClick={() => onConfirm(reason)}
               className="flex-1 py-3 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-lg shadow-red-600/20 text-sm active:scale-95 transform"
             >
               Tolak Order
             </button>
          </div>

       </div>
    </div>
  );
}