"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/cn";

interface DeliveryActionProps {
  status: "assigned" | "picked_up";
  onAction: () => void;
}

export default function DeliveryAction({ status, onAction }: DeliveryActionProps) {
  return (
    <div className="fixed bottom-24 left-0 right-0 mx-auto max-w-md px-6 z-40">
        <button 
            onClick={onAction}
            className={cn(
            "w-full py-4 rounded-2xl font-extrabold text-white shadow-xl shadow-black/10 active:scale-95 transition-all flex items-center justify-center gap-3 text-sm tracking-widest uppercase border-2 border-white/20 backdrop-blur-sm",
            status === "assigned" 
                ? "bg-warning-500 hover:bg-warning-600 shadow-warning-500/40" 
                : "bg-primary-600 hover:bg-primary-700 shadow-primary-600/40"
            )}
        >
            <CheckCircle2 size={20} />
            {status === "assigned" ? "Sudah Ambil Makanan" : "Selesaikan & Upload"}
        </button>
    </div>
  );
}