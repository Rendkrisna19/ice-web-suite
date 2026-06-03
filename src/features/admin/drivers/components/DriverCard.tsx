"use client";

import { Bike, Car, Star, Wallet, Edit3, Trash2 } from "lucide-react";
import { Driver } from "@/types/driver";
import { cn } from "@/utils/cn";
import Image from "next/image";

interface DriverCardProps {
  driver: Driver;
  onEdit: (driver: Driver) => void;
  onDelete: (id: number) => void;
}

export default function DriverCard({ driver, onEdit, onDelete }: DriverCardProps) {
  // Mapping data backend ke UI
  const vehicleType = driver.vehicle_type || "motor";
  const plateNumber = driver.plate_number || "-";
  const status = driver.status || "active"; // Default active jika backend null
  const balance = driver.balance || 0;
  const rating = driver.rating || 5.0;
  const avatar = driver.avatar || `https://ui-avatars.com/api/?name=${driver.name}&background=random`;

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-surface-200 hover:shadow-md transition-all group relative flex flex-col h-full">
      
      <div className="flex justify-between items-start mb-4">
        <div className="relative">
           <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-100 border-2 border-white shadow-sm">
             <Image 
               src={avatar} 
               alt={driver.name} 
               width={56} 
               height={56} 
               className="object-cover w-full h-full"
               unoptimized
             />
           </div>
           
           <div className={cn(
             "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
             driver.is_online ? "bg-green-500" : "bg-neutral-400"
           )}></div>
        </div>

        <span className={cn(
          "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
          status === "active" ? "bg-green-50 text-green-700 border-green-100" :
          status === "suspended" ? "bg-red-50 text-red-700 border-red-100" :
          "bg-neutral-100 text-neutral-500 border-neutral-200"
        )}>
          {status}
        </span>
      </div>

      <div className="mb-4">
        <h3 className="font-bold text-lg text-neutral-800 leading-tight mb-0.5">{driver.name}</h3>
        <p className="text-xs text-neutral-500 font-medium">{driver.email}</p>
        
        <div className="flex items-center gap-2 mt-3 text-sm text-neutral-600">
           {vehicleType === 'motor' ? <Bike size={16} /> : <Car size={16} />}
           <span className="font-bold bg-surface-100 px-1.5 py-0.5 rounded text-xs">{plateNumber}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-5">
         <div className="bg-surface-50 p-2.5 rounded-xl border border-surface-100 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
               <Wallet size={12} /> <span className="text-[10px] font-bold uppercase">Saldo</span>
            </div>
            <span className="font-bold text-primary-700 text-sm">Rp {balance.toLocaleString("id-ID")}</span>
         </div>
         <div className="bg-surface-50 p-2.5 rounded-xl border border-surface-100 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
               <Star size={12} /> <span className="text-[10px] font-bold uppercase">Rating</span>
            </div>
            <div className="flex items-center gap-1">
               <span className="font-bold text-neutral-800 text-sm">{rating}</span>
               <Star size={10} className="text-orange-400 fill-orange-400" />
            </div>
         </div>
      </div>

      <div className="mt-auto flex items-center gap-2 pt-4 border-t border-surface-100">
        <button 
          onClick={() => onEdit(driver)}
          className="flex-1 flex items-center justify-center gap-2 bg-surface-50 hover:bg-surface-100 border border-surface-200 text-neutral-600 py-2.5 rounded-xl text-xs font-bold transition-colors"
        >
          <Edit3 size={14} /> Edit Data
        </button>
        <button 
          onClick={() => onDelete(driver.id)}
          className="w-10 h-10 flex items-center justify-center bg-white border border-surface-200 hover:bg-red-50 hover:border-red-100 hover:text-red-600 rounded-xl text-neutral-400 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

    </div>
  );
}
