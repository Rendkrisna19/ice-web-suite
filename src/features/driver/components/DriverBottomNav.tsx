"use client";

import { ClipboardList, User } from "lucide-react";
import { cn } from "@/utils/cn";

interface DriverBottomNavProps {
  activeTab: "tasks" | "profile";
  onTabChange: (tab: "tasks" | "profile") => void;
}

export default function DriverBottomNav({ activeTab, onTabChange }: DriverBottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-md bg-white border-t border-surface-100 py-3 px-12 pb-6 z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
      <div className="grid grid-cols-2 gap-16"> {/* Gap dirapatkan / dijauhkan sesuai selera (gap-16 pas) */}
        
        <button 
          onClick={() => onTabChange("tasks")}
          className="flex flex-col items-center gap-1.5 group w-full"
        >
          <div className={cn(
            "p-2.5 rounded-2xl transition-all duration-300",
            activeTab === "tasks" ? "text-primary-600 -translate-y-1" : "text-neutral-300 hover:text-neutral-500"
          )}>
            <ClipboardList size={24} strokeWidth={activeTab === "tasks" ? 2.5 : 2} />
          </div>
          <span className={cn(
            "text-[10px] font-bold transition-colors",
            activeTab === "tasks" ? "text-primary-600" : "text-neutral-300"
          )}>
            Tugas
          </span>
        </button>

        <button 
          onClick={() => onTabChange("profile")}
          className="flex flex-col items-center gap-1.5 group w-full"
        >
           <div className={cn(
            "p-2.5 rounded-2xl transition-all duration-300",
            activeTab === "profile" ? "text-primary-600 -translate-y-1" : "text-neutral-300 hover:text-neutral-500"
          )}>
            <User size={24} strokeWidth={activeTab === "profile" ? 2.5 : 2} />
          </div>
          <span className={cn(
            "text-[10px] font-bold transition-colors",
            activeTab === "profile" ? "text-primary-600" : "text-neutral-300"
          )}>
            Profil
          </span>
        </button>

      </div>
    </div>
  );
}
