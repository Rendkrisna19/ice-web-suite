"use client";

import { X, CheckCircle, AlertCircle, Maximize2 } from "lucide-react";
import { Order } from "@/types";
import Image from "next/image"; // Kita gunakan Image component agar warning eslint hilang

interface ProofValidationModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onValidate: (orderId: number) => void;
}

export default function ProofValidationModal({ isOpen, order, onClose, onValidate }: ProofValidationModalProps) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-surface-100 flex justify-between items-center bg-surface-50">
          <div>
            <h3 className="text-lg font-bold text-neutral-800">Validasi Pengantaran</h3>
            <p className="text-xs text-neutral-500">Order #{order.order_number}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-200 rounded-full transition-colors">
            <X size={20} className="text-neutral-400" />
          </button>
        </div>

        {/* Content: Foto Bukti */}
        <div className="p-6 space-y-4">
          <div className="aspect-[4/3] bg-surface-100 rounded-2xl overflow-hidden relative border-2 border-dashed border-surface-300 flex items-center justify-center group">
            {order.proof_of_delivery ? (
               <div className="relative w-full h-full">
                  {/* Gunakan unoptimized jika domain gambar eksternal belum di-whitelist di next.config.js */}
                  <Image 
                    src={order.proof_of_delivery} 
                    alt="Bukti Pengantaran" 
                    fill
                    className="object-cover"
                    unoptimized 
                  />
                  
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="bg-white/20 backdrop-blur-md border border-white/50 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                          <Maximize2 size={14}/> Lihat Full
                      </span>
                  </div>
                  {/* Link clickable overlay */}
                  <a 
                    href={order.proof_of_delivery} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-10"
                    title="Buka gambar penuh"
                  ></a>
               </div>
            ) : (
               <div className="flex flex-col items-center text-neutral-400">
                  <AlertCircle size={32} className="mb-2 opacity-50"/>
                  <span className="text-xs font-medium">Foto bukti tidak ditemukan</span>
               </div>
            )}
          </div>

          <div className="bg-primary-50 p-4 rounded-xl border border-primary-100">
             <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">Info Driver</span>
                <span className="text-[10px] bg-white px-2 py-1 rounded-md text-primary-600 font-mono font-bold shadow-sm">
                    {order.driver?.plate_number || "N/A"}
                </span>
             </div>
             <p className="text-sm font-medium text-primary-900">{order.driver?.name || "Driver"}</p>
             <p className="text-xs text-primary-600 mt-0.5">
               Sampai pada: {order.delivered_at ? new Date(order.delivered_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) : "-"}
             </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl border border-surface-200 font-bold text-neutral-600 hover:bg-surface-50 transition-colors text-sm"
          >
            Tutup
          </button>
          <button 
            onClick={() => onValidate(order.id)}
            className="flex-[2] py-3.5 rounded-xl bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/20 hover:bg-purple-700 hover:shadow-purple-600/30 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} />
            Validasi & Selesaikan
          </button>
        </div>

      </div>
    </div>
  );
}
