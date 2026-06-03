"use client";

import { MapPin, Clock } from "lucide-react";
import { DriverJob } from "@/types/jobs";

interface IncomingJobCardProps {
  job: DriverJob;
  onAccept: () => void;
  onReject: () => void;
}

export default function IncomingJobCard({ job, onAccept, onReject }: IncomingJobCardProps) {
  return (
    <div className="mx-6 mt-4 relative z-20 animate-in zoom-in-95 duration-300">
      
      {/* Efek Ping */}
      <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full animate-pulse"></div>

      <div className="relative bg-white rounded-3xl shadow-2xl border border-white overflow-hidden">
        
        {/* Header Gradient */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-warning-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-widest">Orderan Masuk!</span>
          </div>
          <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold border border-white/10">
              ~2.5 km
          </span>
        </div>

        <div className="p-6">
          {/* Customer Info */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-neutral-800 mb-1">{job.customer_name}</h2>
            <div className="flex items-center justify-center gap-1.5 text-neutral-500 text-xs bg-surface-50 py-1.5 px-3 rounded-full w-fit mx-auto">
              <MapPin size={12} className="text-danger-500" />
              <span className="line-clamp-1 max-w-[200px]">{job.address}</span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
             <div className="bg-surface-50 border border-surface-200 p-3 rounded-2xl flex flex-col items-center justify-center gap-1">
               <span className="text-[10px] text-neutral-400 font-bold uppercase">Estimasi</span>
               <div className="flex items-center gap-1 text-neutral-700">
                 <Clock size={16} className="text-primary-500"/>
                 <span className="font-bold text-sm">15 Min</span>
               </div>
             </div>

             <div className="bg-primary-50 border border-primary-100 p-3 rounded-2xl flex flex-col items-center justify-center gap-1">
               <span className="text-[10px] text-primary-400 font-bold uppercase">Pendapatan</span>
               <div className="flex items-center gap-1 text-primary-700">
                 <div className="w-4 h-4 rounded-full bg-primary-600 text-white flex items-center justify-center text-[8px] font-bold pt-[1px]">
                   Rp
                 </div>
                 <span className="font-extrabold text-sm">{job.total_price.toLocaleString("id-ID")}</span>
               </div>
             </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={onReject}
              className="py-3.5 rounded-2xl border-2 border-surface-200 text-neutral-400 font-bold text-sm hover:bg-surface-50 hover:text-neutral-600 transition-colors"
            >
              Lewati
            </button>
            <button 
              onClick={onAccept}
              className="py-3.5 rounded-2xl bg-primary-600 text-white font-bold text-sm shadow-xl shadow-primary-600/30 hover:bg-primary-700 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Terima Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
