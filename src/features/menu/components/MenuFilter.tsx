"use client";

import { Search, Utensils, Coffee, Pizza } from "lucide-react";
import { cn } from "@/utils/cn";

interface MenuFilterProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterCategory: string;
  setFilterCategory: (c: "all" | "food" | "beverage") => void;
  totalItems: number;
}

export default function MenuFilter({ 
  searchQuery, setSearchQuery, filterCategory, setFilterCategory, totalItems 
}: MenuFilterProps) {
  
  const categories = [
    { id: "all", label: "Semua", icon: <Utensils size={14}/> },
    { id: "food", label: "Makanan", icon: <Pizza size={14}/> },
    { id: "beverage", label: "Minuman", icon: <Coffee size={14}/> },
  ];

  return (
    <div className="h-20 px-6 flex items-center justify-between bg-surface-300/80 backdrop-blur-md border-b border-white/50 sticky top-0 z-40 shadow-sm">
      
      {/* KIRI: Title */}
      <div>
        <h1 className="text-xl font-bold text-primary-900 flex items-center gap-2">
          <Utensils className="text-secondary-500" /> Manajemen Menu
        </h1>
        <p className="text-xs text-neutral-500 font-medium">Total {totalItems} Item Terdaftar</p>
      </div>

      {/* TENGAH: Kategori Filter (Pill Shape) */}
      <div className="hidden md:flex bg-surface-100 p-1 rounded-full border border-white/60 shadow-sm">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all",
              filterCategory === cat.id 
                ? "bg-primary-500 text-white shadow-md" 
                : "text-neutral-500 hover:bg-surface-200"
            )}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* KANAN: Search Bar */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-500 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Cari nama menu..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2.5 bg-surface-100 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none w-64 transition-all text-sm font-medium text-neutral-700 shadow-sm"
        />
      </div>

    </div>
  );
}
