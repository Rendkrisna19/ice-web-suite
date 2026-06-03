"use client";

import { Power } from "lucide-react";
import { cn } from "@/utils/cn";

interface StockToggleProps {
  isAvailable: boolean;
  onToggle: () => void;
}

export default function StockToggle({ isAvailable, onToggle }: StockToggleProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        "relative w-14 h-8 rounded-full transition-all duration-300 flex items-center p-1 shadow-inner group focus:outline-none",
        isAvailable ? "bg-green-500" : "bg-neutral-200"
      )}
      title={isAvailable ? "Matikan Stok (Habis)" : "Aktifkan Stok (Tersedia)"}
    >
      <div className={cn(
        "w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center z-10",
        isAvailable ? "translate-x-6" : "translate-x-0"
      )}>
        <Power size={12} className={cn(
          "transition-colors duration-300",
          isAvailable ? "text-green-600" : "text-neutral-400"
        )} />
      </div>

      <span className={cn(
        "absolute text-[9px] font-bold text-white transition-opacity duration-300 uppercase tracking-tighter",
        isAvailable ? "left-2 opacity-100" : "left-2 opacity-0"
      )}>
        ON
      </span>
      <span className={cn(
        "absolute text-[9px] font-bold text-neutral-400 transition-opacity duration-300 uppercase tracking-tighter",
        isAvailable ? "right-2 opacity-0" : "right-2 opacity-100"
      )}>
        OFF
      </span>
    </button>
  );
}
