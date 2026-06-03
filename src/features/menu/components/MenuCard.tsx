"use client";

import { Edit, Trash2, Utensils, Coffee } from "lucide-react";
import { cn } from "@/utils/cn";
import { MenuItem } from "@/types/product";
import StockToggle from "./StockToggle"; 

interface MenuCardProps {
  item: MenuItem;
  onToggle: (id: string) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
}

export default function MenuCard({ item, onToggle, onEdit, onDelete }: MenuCardProps) {
  const isAvailable = Boolean(item.is_available);

  // --- 1. TAMBAHKAN HELPER URL DI SINI ---
  const getImageUrl = (path?: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path; // Jika dari Unsplash/external, langsung pakai

    // Potong /api/v1 agar menyisakan http://localhost:8000 saja
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const baseUrl = apiUrl.split('/api')[0].replace(/\/$/, ""); 
    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    return `${baseUrl}${cleanPath}`;
  };

  // --- 2. GUNAKAN HELPERNYA ---
  const imageUrl = getImageUrl(item.image_url);

  return (
    <div 
      className={cn(
        "bg-white rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col h-full group relative",
        isAvailable 
          ? "border-surface-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-primary-200" 
          : "border-surface-200 bg-surface-50 opacity-90 grayscale-[0.8]"
      )}
    >
      <div className="h-48 w-full bg-surface-100 relative overflow-hidden border-b border-surface-100">
        
        {/* --- 3. GANTI item.image_url JADI imageUrl --- */}
        {imageUrl ? (
           <img 
             src={imageUrl} 
             alt={item.name} 
             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
             onError={(e) => {
                // Fallback jika gambar error/404 (misal terhapus di server)
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
             }}
           />
        ) : (
           <div className="w-full h-full flex flex-col items-center justify-center text-neutral-300 bg-surface-200">
              {item.category === 'makanan' ? <Utensils size={40} /> : <Coffee size={40} />}
           </div>
        )}

        {/* Fallback Container yang dimunculkan oleh onError di atas */}
        <div className="hidden absolute inset-0 w-full h-full flex flex-col items-center justify-center text-neutral-300 bg-surface-200">
            {item.category === 'makanan' ? <Utensils size={40} /> : <Coffee size={40} />}
        </div>
        
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          {/* Tombol Hapus (Muncul saat Hover) */}
          <button 
            onClick={() => onDelete(String(item.id))}
            className="p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-lg shadow-sm backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
            title="Hapus Menu"
          >
            <Trash2 size={14} strokeWidth={2.5} />
          </button>
          
          {/* Badge Status */}
          <span className={cn(
            "px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm backdrop-blur-md border border-white/20 uppercase tracking-wider flex items-center justify-center",
            isAvailable ? "bg-white/95 text-green-600" : "bg-neutral-900/90 text-white"
          )}>
            {isAvailable ? "Tersedia" : "Habis"}
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-4">
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
            {item.category === 'makanan' ? <Utensils size={10} /> : <Coffee size={10} />}
            {item.category === 'makanan' ? 'Makanan' : 'Minuman'}
          </p>
          
          <h3 className="font-bold text-neutral-800 text-lg group-hover:text-primary-700 transition-colors line-clamp-2 leading-snug" title={item.name}>
            {item.name}
          </h3>
        </div>
        
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-dashed border-surface-200">
           <div className="flex flex-col">
             <span className="text-[10px] text-neutral-400 font-medium">Harga Jual</span>
             <span className="font-bold text-primary-700 text-lg">
               Rp {Number(item.price).toLocaleString("id-ID")}
             </span>
             <span className="text-[10px] text-neutral-400 font-medium mt-1">Harga Modal</span>
             <span className="font-bold text-green-700 text-base">
               {item.cost_price ? `Rp ${Number(item.cost_price).toLocaleString("id-ID")}` : '-'}
             </span>
           </div>

          <div className="flex items-center gap-2">
             {/* Tombol Edit Aktif */}
             <button 
                onClick={() => onEdit(item)}
                className="p-2 rounded-full bg-surface-100 text-neutral-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                title="Edit Menu"
             >
                <Edit size={16} />
             </button>
             
             <StockToggle 
                isAvailable={isAvailable}
                onToggle={() => onToggle(String(item.id))} 
             />
          </div>
        </div>
      </div>
    </div>
  );
}