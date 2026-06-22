"use client";

import { useState } from "react";
import { Navigation, MapPin, Package, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { DriverJob } from "@/types/jobs";
import { cn } from "@/utils/cn";

interface ActiveJobCardProps {
  job: DriverJob;
  jobStatus: "assigned" | "picked_up" | "completed";
  onMainAction: () => void;
}

export default function ActiveJobCard({ job, jobStatus, onMainAction }: ActiveJobCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const openMaps = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${job.lat},${job.lng}`;
    window.open(url, '_blank');
  };

  const openChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `/driver/chat/${job.transaction_id}`;
  };

  return (
    <div className="mx-4 mt-2 bg-white rounded-2xl shadow-md border border-surface-200 overflow-hidden transition-all duration-300 mb-2">
      
      {/* STATUS HEADER */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "py-2.5 px-4 flex justify-between items-center cursor-pointer text-white transition-colors",
          jobStatus === "assigned" ? "bg-warning-500" : "bg-[#1A534B]"
        )}
      >
        <span className="font-bold text-[10px] uppercase tracking-[0.2em]">
          {jobStatus === "assigned" ? "Menuju Restoran" : "Menuju Pelanggan"}
        </span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>

      <div className="p-4">
        {/* SUMMARY INFO */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="cursor-pointer flex justify-between items-start"
        >
          <div className="pr-2">
            <h2 className="text-lg font-bold text-[#1A534B] mb-0.5">{job.customer_name}</h2>
            <div className="flex items-start gap-1.5 text-neutral-500 text-xs">
              <MapPin size={14} className="mt-0.5 shrink-0 text-danger-500" />
              <span className={cn("leading-snug", !isExpanded && "line-clamp-1")}>
                {job.address}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] text-neutral-400 block mb-0.5 font-medium">{job.items.length} Item</span>
            <span className="font-extrabold text-[#1A534B] text-sm">
              Rp {job.total_price.toLocaleString("id-ID")}
            </span>
            <span className={cn(
               "block mt-1 text-[9px] uppercase font-bold py-0.5 px-1.5 rounded-sm w-fit ml-auto",
               job.payment_method === 'online' ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
            )}>
               {job.payment_method === 'online' ? (job.payment_status === 'paid' ? 'LUNAS (ONLINE)' : 'ONLINE (UNPAID)') : 'COD (TAGIH TUNAI)'}
            </span>
          </div>
        </div>

        {/* EXPANDABLE DETAILS */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-neutral-100 animate-in fade-in slide-in-from-top-2 duration-300">
            
            {job.note && (
               <div className="bg-[#FFF8E1] text-[#B45309] p-3 rounded-xl text-xs font-medium flex gap-2 mb-4 border border-[#FDE68A]">
                 <AlertCircle size={16} className="shrink-0" />
                 <p className="leading-relaxed">"{job.note}"</p>
               </div>
            )}

            <div className="bg-[#F9FAFB] p-3 rounded-xl border border-surface-200 mb-5">
              <ul className="space-y-2 mb-3">
                {job.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between text-xs text-neutral-700 font-medium border-b border-dashed border-neutral-200 pb-2 last:border-0 last:pb-0">
                    <span>{item.qty}x {item.menu_name}</span>
                    {item.note && <span className="text-[10px] text-neutral-400 italic">({item.note})</span>}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 pt-2 border-t border-neutral-200">
                 <Package size={12} className="text-neutral-400" />
                 <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    Total {job.items.length} Item
                 </span>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_1fr_2fr] gap-2">
              <button 
                onClick={openMaps} 
                className="flex flex-col items-center justify-center gap-1 bg-[#F9FAFB] hover:bg-surface-100 border border-surface-200 rounded-xl py-2.5 text-primary-600 transition-colors"
              >
                <Navigation size={16} />
                <span className="text-[10px] font-bold">Maps</span>
              </button>

              <button
                onClick={openChat}
                className="flex flex-col items-center justify-center gap-1 bg-[#F9FAFB] hover:bg-surface-100 border border-surface-200 rounded-xl py-2.5 text-primary-600 transition-colors"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <span className="text-[10px] font-bold">Chat</span>
              </button>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onMainAction();
                }}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl py-2.5 text-white font-bold shadow-lg shadow-primary-500/20 active:scale-95 transition-all",
                  jobStatus === "assigned" ? "bg-warning-500" : "bg-[#1A534B]"
                )}
              >
                <CheckCircle2 size={18} />
                <span className="text-[10px] font-bold uppercase">
                   {jobStatus === "assigned" ? "Sudah Ambil" : "Selesai Antar"}
                </span>
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
