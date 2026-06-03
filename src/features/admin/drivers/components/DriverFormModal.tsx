"use client";

import { X } from "lucide-react";
import { Driver } from "@/types/driver";

interface DriverFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  initialData: Driver | null;
}

export default function DriverFormModal({ isOpen, onClose, onSubmit, initialData }: DriverFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-5 border-b border-surface-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-neutral-800">
             {initialData ? "Edit Data Driver" : "Registrasi Driver Baru"}
          </h3>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:bg-surface-50 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 custom-scrollbar">
          <form id="driverForm" onSubmit={onSubmit} className="space-y-5">
            
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
              <input name="name" defaultValue={initialData?.name} required className="w-full p-3.5 bg-surface-50 border border-surface-200 rounded-xl text-sm font-medium focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" placeholder="Nama sesuai KTP" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Email</label>
                <input type="email" name="email" defaultValue={initialData?.email} required className="w-full p-3.5 bg-surface-50 border border-surface-200 rounded-xl text-sm font-medium focus:border-primary-500 outline-none" placeholder="email@driver.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">No. WhatsApp</label>
                <input type="tel" name="phone" defaultValue={initialData?.phone} className="w-full p-3.5 bg-surface-50 border border-surface-200 rounded-xl text-sm font-medium focus:border-primary-500 outline-none" placeholder="0812..." />
              </div>
            </div>

            {!initialData && (
                 <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Password Default</label>
                    <input type="text" name="password" defaultValue="password123" className="w-full p-3.5 bg-surface-50 border border-surface-200 rounded-xl text-sm font-medium focus:border-primary-500 outline-none" />
                 </div>
            )}

            <div className="bg-surface-50 p-4 rounded-xl border border-surface-200">
               <h4 className="text-sm font-bold text-neutral-800 mb-3 border-b border-surface-200 pb-2">Info Kendaraan</h4>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Jenis Kendaraan</label>
                    <select name="vehicleType" defaultValue={initialData?.vehicle_type || "motor"} className="w-full p-3 bg-white border border-surface-200 rounded-xl text-sm focus:border-primary-500 outline-none">
                       <option value="motor">Motor</option>
                       <option value="mobil">Mobil</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Plat Nomor</label>
                    <input name="plateNumber" defaultValue={initialData?.plate_number} className="w-full p-3 bg-white border border-surface-200 rounded-xl text-sm font-medium focus:border-primary-500 outline-none uppercase" placeholder="BK 1234 XX" />
                  </div>
               </div>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-surface-100 flex gap-3">
           <button 
             type="button" 
             onClick={onClose} 
             className="flex-1 py-3.5 border border-surface-200 text-neutral-600 font-bold rounded-xl hover:bg-surface-50 transition-colors"
           >
             Batal
           </button>
           <button 
             type="submit" 
             form="driverForm"
             className="flex-1 py-3.5 bg-[#15423C] text-white font-bold rounded-xl hover:bg-[#1A534B] transition-colors shadow-lg shadow-[#15423C]/20"
           >
             Simpan Data
           </button>
        </div>

      </div>
    </div>
  );
}
