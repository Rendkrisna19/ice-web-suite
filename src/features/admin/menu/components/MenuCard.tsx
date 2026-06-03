"use client";

import { Edit3, Trash2, Power, Utensils, Coffee } from "lucide-react";
import { MenuItem } from "@/types/menu";
import { cn } from "@/utils/cn";

interface MenuCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

export default function MenuCard({ item, onEdit, onDelete, onToggleStatus }: MenuCardProps) {
  // Pastikan konversi boolean aman (karena database kadang return 1/0)
  const isAvailable = Boolean(item.is_available);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-surface-200 hover:shadow-md transition-all group flex flex-col h-full">
      
      {/* Image Area */}
      <div className="relative h-40 w-full rounded-xl overflow-hidden bg-surface-100 mb-4 border border-surface-100">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-neutral-300">
             {item.category === "makanan" ? <Utensils size={32} /> : <Coffee size={32} />}
          </div>
        )}
        
        {/* Status Badge (Overlay) */}
        <div className={cn(
            "absolute top-3 right-3 px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm backdrop-blur-md border",
            isAvailable 
                ? "bg-green-500/90 text-white border-green-400" 
                : "bg-red-500/90 text-white border-red-400"
        )}>
            {isAvailable ? "TERSEDIA" : "HABIS"}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
           <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400">{item.category}</span>
        </div>
        
        <h3 className="font-bold text-neutral-800 line-clamp-1 mb-1" title={item.name}>{item.name}</h3>
        <p className="text-primary-600 font-bold text-sm">Rp {Number(item.price).toLocaleString('id-ID')}</p>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-4 border-t border-surface-100 flex gap-2">
         {/* Toggle Status Button */}
         <button 
           onClick={() => onToggleStatus(item.id)}
           className={cn(
             "flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all border",
             isAvailable
                ? "bg-surface-50 text-neutral-500 border-surface-200 hover:bg-surface-100"
                : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
           )}
         >
            <Power size={14} />
            {isAvailable ? "Matikan" : "Aktifkan"}
         </button>

         <button 
           onClick={() => onEdit(item)}
           className="w-9 h-9 flex items-center justify-center rounded-lg border border-surface-200 text-neutral-400 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-colors"
           title="Edit"
         >
            <Edit3 size={16} />
         </button>
         
         <button 
           onClick={() => onDelete(item.id)}
           className="w-9 h-9 flex items-center justify-center rounded-lg border border-surface-200 text-neutral-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
           title="Hapus"
         >
            <Trash2 size={16} />
         </button>
      </div>

    </div>
  );
}