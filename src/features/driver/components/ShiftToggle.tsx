"use client";

import { Power, Loader2 } from "lucide-react"; // Import Loader icon
import { cn } from "@/utils/cn";

interface ShiftToggleProps {
  isOnline: boolean;
  isLoading?: boolean; // Tambahan prop loading
  onToggle: () => void;
}

export default function ShiftToggle({ isOnline, isLoading = false, onToggle }: ShiftToggleProps) {
  return (
    <div className={cn(
      "relative -mt-6 mx-6 p-5 rounded-2xl shadow-lg border transition-all duration-300 flex justify-between items-center z-20",
      isOnline 
        ? "bg-white border-primary-500 ring-1 ring-primary-500" 
        : "bg-white border-surface-200"
    )}>
      <div>
        <h3 className="text-base font-bold text-neutral-800">Status Kerja</h3>
        <p className={cn("text-xs font-bold mt-1", isOnline ? "text-primary-500" : "text-neutral-400")}>
          {isLoading 
            ? "Memproses..." 
            : (isOnline ? "ONLINE (Siap Terima Order)" : "OFFLINE (Istirahat)")
          }
        </p>
      </div>
      
      <button
        onClick={onToggle}
        disabled={isLoading} // Disable saat loading
        className={cn(
          "w-12 h-7 rounded-full p-1 transition-all duration-300 shadow-inner flex items-center",
          isOnline ? "bg-primary-500" : "bg-neutral-300",
          isLoading && "opacity-70 cursor-not-allowed"
        )}
      >
        <div className={cn(
          "w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 flex items-center justify-center",
          isOnline ? "translate-x-5" : "translate-x-0"
        )}>
          {isLoading ? (
            <Loader2 size={12} className="animate-spin text-neutral-400" />
          ) : (
            <Power size={12} className={cn(isOnline ? "text-primary-600" : "text-neutral-400")} />
          )}
        </div>
      </button>
    </div>
  );
}