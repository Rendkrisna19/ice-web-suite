"use client";

import { BellRing } from "lucide-react";

interface IncomingOrderModalProps {
  isOpen: boolean;
  orderData: any; // Bisa disesuaikan dengan tipe Order jika data lengkap
  onAccept: () => void;
  onReject: () => void;
}

export default function IncomingOrderModal({ isOpen, orderData, onAccept, onReject }: IncomingOrderModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center pointer-events-none px-4 pb-6 sm:pb-0">
       <div className="pointer-events-auto bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-surface-200 p-5 animate-in slide-in-from-bottom-10 fade-in duration-300 ring-4 ring-[#15423C]/10">
          
          <div className="flex items-start gap-4 mb-5">
             <div className="w-12 h-12 rounded-2xl bg-[#15423C] text-white flex items-center justify-center shrink-0 animate-pulse">
                <BellRing size={24} />
             </div>
             <div>
                <h4 className="font-bold text-lg text-neutral-900">Pesanan Baru Masuk!</h4>
                <p className="text-sm text-neutral-500 mt-1">
                   Order <span className="font-mono font-bold text-[#15423C]">#{orderData?.id || "NEW"}</span> senilai <span className="font-bold">Rp {(orderData?.total_price || orderData?.total || 0).toLocaleString()}</span>
                </p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <button 
               onClick={onReject}
               className="py-3 rounded-xl border border-surface-200 font-bold text-sm text-neutral-600 hover:bg-surface-50 transition-colors"
             >
               Abaikan
             </button>
             <button 
               onClick={onAccept}
               className="py-3 rounded-xl bg-[#15423C] text-white font-bold text-sm hover:bg-[#1A534B] shadow-lg shadow-[#15423C]/20 transition-all active:scale-95"
             >
               Lihat Order
             </button>
          </div>

       </div>
    </div>
  );
}
