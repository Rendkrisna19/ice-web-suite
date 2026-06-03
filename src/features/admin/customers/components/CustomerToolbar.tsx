"use client";

import { Search, UserCheck, Ban, LayoutGrid } from "lucide-react";
import { cn } from "@/utils/cn";
import { CustomerStatus } from "@/types/customer";

interface CustomerToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  filter: CustomerStatus | "all";
  onFilterChange: (val: CustomerStatus | "all") => void;
}

export default function CustomerToolbar({ search, onSearchChange, filter, onFilterChange }: CustomerToolbarProps) {
  
  const filters = [
    { value: "all", label: "Semua", icon: LayoutGrid },
    { value: "active", label: "Aktif", icon: UserCheck },
    { value: "blocked", label: "Diblokir", icon: Ban },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
      
      {/* Search Bar */}
      <div className="relative w-full md:w-96 group">
         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-500 transition-colors">
            <Search size={18} />
         </div>
         <input 
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nama, email, atau no. hp..." 
            className="w-full pl-11 pr-4 py-3 bg-white border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium shadow-sm transition-all"
         />
      </div>

      {/* Filter Buttons */}
      <div className="flex p-1 bg-white rounded-full shadow-sm border border-surface-200">
         {filters.map((item) => {
            const Icon = item.icon;
            const isActive = filter === item.value;

            return (
              <button
                key={item.value}
                onClick={() => onFilterChange(item.value as CustomerStatus | "all")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all",
                  isActive 
                    ? "bg-[#15423C] text-white shadow-md" 
                    : "bg-white text-neutral-500 hover:bg-surface-50"
                )}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
         })}
      </div>

    </div>
  );
}
