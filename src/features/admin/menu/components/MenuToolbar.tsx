"use client";

import { Search, Plus, Utensils, Coffee, LayoutGrid } from "lucide-react";
import { cn } from "@/utils/cn";

interface MenuToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  filter: string; // Ubah ke string agar fleksibel
  onFilterChange: (val: string) => void;
  onAdd: () => void;
}

export default function MenuToolbar({ search, onSearchChange, filter, onFilterChange, onAdd }: MenuToolbarProps) {
  
  const filters = [
    { value: "all", label: "Semua", icon: LayoutGrid },
    { value: "makanan", label: "Makanan", icon: Utensils },
    { value: "minuman", label: "Minuman", icon: Coffee },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-transparent">
      
      {/* Search Bar */}
      <div className="relative w-full md:w-80">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
         <input 
           value={search}
           onChange={(e) => onSearchChange(e.target.value)}
           placeholder="Cari menu favorit..." 
           className="w-full pl-11 pr-4 py-3 bg-white border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium shadow-sm"
         />
      </div>

      {/* Category Filter */}
      <div className="flex p-1 bg-white rounded-full shadow-sm border border-surface-200">
         {filters.map((item) => {
            const Icon = item.icon;
            const isActive = filter === item.value;
            
            return (
              <button
                key={item.value}
                onClick={() => onFilterChange(item.value)}
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

      {/* Add Button */}
      <button 
        onClick={onAdd}
        className="flex items-center gap-2 bg-[#15423C] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-[#15423C]/20 hover:bg-[#1A534B] hover:-translate-y-0.5 transition-all active:scale-95"
      >
         <Plus size={18} /> Menu Baru
      </button>

    </div>
  );
}