"use client";

import Image from "next/image";
import { Store, MapPin, Clock, Edit3, Trash2, Users } from "lucide-react";
import { cn } from "@/utils/cn";
import { Outlet } from "@/types/merchant";

interface MerchantCardProps {
  outlet: Outlet;
  onEdit: (outlet: Outlet) => void;
  onDelete: (id: number) => void;
  onManageMenu?: (outlet: Outlet) => void;
}

export default function MerchantCard({ outlet, onEdit, onDelete, onManageMenu }: MerchantCardProps) {
    const isActive = !outlet.is_force_closed;
    const staffCount = outlet.users ? outlet.users.length : 0;
    const openTime = outlet.opening_hour?.substring(0, 5) || "00:00";
    const closeTime = outlet.closing_hour?.substring(0, 5) || "00:00";

    // --- LOGIKA URL GAMBAR YANG DIPERBAIKI ---
    const getImageUrl = (path?: string | null) => {
        if (!path) return null;
        if (path.startsWith("http")) return path;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://linen-deer-529188.hostingersite.com";
        const baseUrl = apiUrl.split('/api')[0].replace(/\/$/, ""); 
        const cleanPath = path.startsWith("/") ? path : `/${path}`;

        return `${baseUrl}${cleanPath}`;
    };

    const logoUrl = getImageUrl(outlet.logo);
    const bannerUrl = getImageUrl(outlet.banner);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-surface-200 hover:shadow-md transition-all group relative overflow-hidden flex flex-col h-full">
      
      {/* Banner Image */}
        <div className="h-32 bg-surface-100 relative w-full overflow-hidden">
          {bannerUrl ? (
              <>
                <Image 
                   src={bannerUrl} 
                   alt={`${outlet.name} Banner`}
                   fill
                   className="object-cover group-hover:scale-105 transition-transform duration-500"
                   unoptimized
                   // Fallback jika banner error/404
                   onError={(e) => {
                     e.currentTarget.style.display = 'none';
                     e.currentTarget.nextElementSibling?.classList.remove('hidden');
                   }}
                />
                {/* Fallback Container untuk Banner (Tersembunyi secara default) */}
                <div className="hidden absolute inset-0 w-full h-full flex items-center justify-center bg-surface-200 text-surface-400">
                    <Store size={48} className="opacity-20"/>
                </div>
              </>
          ) : (
              <div className="w-full h-full flex items-center justify-center bg-surface-200 text-surface-400">
                  <Store size={48} className="opacity-20"/>
              </div>
          )}
        
        {/* Status Badge Overlay */}
        <div className="absolute top-3 right-3">
            <span className={cn(
                "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border shadow-sm backdrop-blur-md",
                isActive 
                ? "bg-green-500/90 text-white border-green-400" 
                : "bg-orange-500/90 text-white border-orange-400"
            )}>
                {isActive ? "Buka" : "Tutup"}
            </span>
        </div>
      </div>

      <div className="p-5 pt-10 relative flex-1 flex flex-col">
         {/* Logo Avatar */}
         <div className="absolute -top-8 left-5 w-16 h-16 rounded-xl border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center">
            {logoUrl ? (
                <>
                  <Image 
                    src={logoUrl} 
                    alt="Logo" 
                    fill 
                    className="object-cover" 
                    unoptimized
                    // Fallback jika logo error/404
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  {/* Fallback Container untuk Logo (Tersembunyi secara default) */}
                  <div className="hidden absolute inset-0 bg-primary-50 w-full h-full flex items-center justify-center text-primary-500">
                      <Store size={24} />
                  </div>
                </>
            ) : (
                <div className="bg-primary-50 w-full h-full flex items-center justify-center text-primary-500">
                    <Store size={24} />
                </div>
            )}
         </div>

         <div className="mb-4 pl-1">
            <h3 className="font-bold text-lg text-neutral-800 leading-tight line-clamp-1">{outlet.name}</h3>
            <p className="text-xs text-neutral-500 flex items-center gap-1.5 mt-1 line-clamp-1">
                <MapPin size={12} className="shrink-0 text-neutral-400" /> {outlet.address}
            </p>
         </div>

         <div className="bg-surface-50 rounded-xl p-3 space-y-2 mb-4 text-xs border border-surface-100">
            <div className="flex justify-between items-center">
                <span className="text-neutral-500 flex items-center gap-1.5">
                    <Clock size={12} className="text-neutral-400"/> Jam Operasional
                </span>
                <span className="font-semibold text-neutral-700">{openTime} - {closeTime}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-neutral-500 flex items-center gap-1.5">
                    <Users size={12} className="text-neutral-400"/> Total Staff
                </span>
                <span className="font-semibold text-neutral-700">{staffCount} Orang</span>
            </div>
         </div>

         <div className="mt-auto grid grid-cols-2 gap-2">
            <button 
                onClick={() => onEdit(outlet)}
                className="flex items-center justify-center gap-2 border border-surface-200 py-2.5 rounded-xl text-neutral-500 hover:bg-surface-50 hover:text-primary-600 hover:border-primary-200 transition-colors text-xs font-semibold"
                title="Edit Info"
            >
                <Edit3 size={16} /> Edit
            </button>
            <button 
                onClick={() => onDelete(outlet.id)}
                className="flex items-center justify-center gap-2 border border-surface-200 py-2.5 rounded-xl text-red-500 hover:bg-red-50 hover:border-red-100 transition-colors text-xs font-semibold"
                title="Hapus Outlet"
            >
                <Trash2 size={16} /> Hapus
            </button>
         </div>
      </div>
    </div>
  );
}
