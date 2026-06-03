"use client";

import { useState, useEffect } from "react";
import { Search, X, Check, Utensils, Coffee, Loader2, Power } from "lucide-react"; 
import toast from "react-hot-toast";

import { Outlet } from "@/types/merchant";
import { MenuItem } from "@/types/menu"; 
import { menuService } from "@/features/admin/menu/services/menuService"; 
import { cn } from "@/utils/cn";

interface MerchantMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  outlet: Outlet | null;
}

export default function MerchantMenuModal({ isOpen, onClose, outlet }: MerchantMenuModalProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && outlet) {
      fetchMenu();
    } else {
        setMenuItems([]);
        setSearch("");
    }
  }, [isOpen, outlet]);

  const fetchMenu = async () => {
    if (!outlet) return;
    setIsLoading(true);
    try {
      const data = await menuService.getMenuByOutlet(outlet.id);
      setMenuItems(data);
    } catch (error) {
      console.error("Fetch menu error:", error);
      toast.error("Gagal memuat daftar menu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (item: MenuItem) => {
    if (togglingId === item.id) return; 
    
    setTogglingId(item.id);
    
    const previousStatus = Boolean(item.is_available);
    setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, is_available: !previousStatus } : m));

    try {
        await menuService.toggleStatus(item.id, previousStatus);
    } catch (error) {
        setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, is_available: previousStatus } : m));
        toast.error("Gagal mengubah status menu.");
    } finally {
        setTogglingId(null);
    }
  };

  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  // --- LOGIKA URL GAMBAR (Helper Function) ---
  const getImageUrl = (path?: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://linen-deer-529188.hostingersite.com";
    const baseUrl = apiUrl.split('/api')[0].replace(/\/$/, ""); 
    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    return `${baseUrl}${cleanPath}`;
  };

  if (!isOpen || !outlet) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg h-[650px] flex flex-col rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden ring-1 ring-white/20">
        
        {/* --- HEADER --- */}
        <div className="p-6 border-b border-surface-100 bg-surface-50 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-neutral-800">Kelola Ketersediaan Menu</h3>
            <div className="flex items-center gap-2 mt-1">
               <span className="w-2 h-2 rounded-full bg-primary-500"></span>
               <p className="text-sm text-neutral-500 font-medium">{outlet.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 -mt-2 text-neutral-400 hover:text-neutral-600 hover:bg-surface-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- SEARCH BAR --- */}
        <div className="p-4 border-b border-surface-100 bg-white">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input 
              placeholder="Cari nama menu..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium" 
            />
          </div>
        </div>

        {/* --- MENU LIST --- */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-white">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-400">
                <Loader2 className="animate-spin text-primary-500" size={32} />
                <p className="text-sm font-medium">Memuat menu...</p>
             </div>
          ) : filteredItems.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-neutral-400 gap-2">
                <Utensils size={40} className="opacity-20" />
                <p className="text-sm">Tidak ada menu ditemukan.</p>
             </div>
          ) : (
            filteredItems.map((item) => {
                const isAvailable = Boolean(item.is_available);
                // Gunakan helper function di sini
                const imageUrl = getImageUrl(item.image_url);

                return (
                    <div 
                        key={item.id} 
                        className={cn(
                            "flex items-center justify-between p-3 pr-4 rounded-2xl border transition-all group select-none",
                            isAvailable 
                                ? "bg-white border-transparent hover:border-surface-200 hover:bg-surface-50" 
                                : "bg-surface-50 border-surface-100 opacity-75 grayscale-[0.5]"
                        )}
                    >
                      
                      <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative border",
                            isAvailable ? "bg-surface-100 border-transparent" : "bg-surface-200 border-surface-200"
                        )}>
                           {imageUrl ? (
                             <img 
                               src={imageUrl} 
                               alt={item.name} 
                               className="w-full h-full object-cover" 
                               // Tambahkan fallback error juga di sini
                               onError={(e) => {
                                 e.currentTarget.style.display = 'none';
                                 e.currentTarget.nextElementSibling?.classList.remove('hidden');
                               }}
                             />
                           ) : (
                             item.category === "minuman" ? <Coffee size={20} className="text-surface-400"/> : <Utensils size={20} className="text-surface-400"/>
                           )}

                           {/* Fallback container jika gambar rusak */}
                           <div className="hidden absolute inset-0 w-full h-full flex items-center justify-center text-surface-400 bg-surface-100">
                               {item.category === 'makanan' ? <Utensils size={20} /> : <Coffee size={20} />}
                           </div>
                           
                           {togglingId === item.id && (
                               <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                   <Loader2 size={16} className="animate-spin text-primary-600" />
                               </div>
                           )}
                        </div>
                        
                        <div className="flex flex-col">
                            <span className={cn("font-bold text-sm transition-colors", isAvailable ? "text-neutral-700" : "text-neutral-500 line-through")}>
                                {item.name}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-neutral-400 font-medium">
                                    Rp {Number(item.price).toLocaleString('id-ID')}
                                </span>
                                {!isAvailable && (
                                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">HABIS</span>
                                )}
                            </div>
                        </div>
                      </div>
                      
                      {/* TOGGLE SWITCH */}
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={isAvailable} 
                            onChange={() => handleToggleStatus(item)}
                            disabled={togglingId === item.id}
                            className="sr-only peer" 
                        />
                        <div className={cn(
                            "w-12 h-7 rounded-full peer-focus:outline-none transition-all duration-300 shadow-inner",
                            isAvailable ? "bg-primary-500" : "bg-surface-300"
                        )}></div>
                        <div className={cn(
                            "absolute left-[3px] top-[3px] bg-white w-[22px] h-[22px] rounded-full shadow-md transition-all duration-300 flex items-center justify-center",
                            isAvailable ? "translate-x-5" : "translate-x-0"
                        )}>
                            {isAvailable ? (
                                <Check size={12} strokeWidth={4} className="text-primary-500 scale-100 transition-transform" />
                            ) : (
                                <Power size={12} strokeWidth={4} className="text-neutral-300 scale-100 transition-transform" />
                            )}
                        </div>
                      </label>

                    </div>
                );
            })
          )}
        </div>

        {/* --- FOOTER ACTIONS --- */}
        <div className="p-5 border-t border-surface-100 bg-surface-50 flex justify-end">
            <button 
              onClick={onClose} 
              className="bg-primary-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 active:scale-95 w-full sm:w-auto"
            >
              Selesai
            </button>
        </div>

      </div>
    </div>
  );
}
