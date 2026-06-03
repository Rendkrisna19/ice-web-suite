"use client";

import { ReactNode } from "react";
import { Order, Driver } from "@/types";
import { cn } from "@/utils/cn";
import OrderCard from "./OrderCard";
import { Banknote, Inbox } from "lucide-react"; // Ikon default jika icon prop kosong

interface OrderColumnProps {
  title: string;
  orders: Order[];
  variant: "incoming" | "cooking" | "ready" | "delivery" | "delivered";
  icon: ReactNode;
  accentColor: string;
  borderColor: string;
  drivers?: Driver[];
  // Payload diganti dari 'any' menjadi 'number' (untuk ID) atau null
  onAction: (orderId: number, action: string, payload?: number) => void;
}

export default function OrderColumn({ 
  title, 
  orders, 
  variant, 
  icon, 
  accentColor, 
  borderColor, 
  drivers = [], // Default empty array biar ga error map
  onAction 
}: OrderColumnProps) {

  // Hitung total estimasi pendapatan per kolom
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_price), 0);

  return (
    <div className={cn(
        "flex-1 min-w-[320px] max-w-[400px] flex flex-col h-full bg-white rounded-3xl border shadow-sm overflow-hidden",
        borderColor
    )}>
      
      {/* HEADER KOLOM */}
      <div className="p-4 border-b border-surface-100 flex items-center justify-between bg-surface-50/50">
         <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm text-white", accentColor)}>
               {icon}
            </div>
            <div>
               <h3 className="font-bold text-neutral-800 text-sm leading-tight">{title}</h3>
               <span className="text-[10px] text-neutral-500 font-medium">{orders.length} Pesanan Aktif</span>
            </div>
         </div>
      </div>

      {/* REVENUE INFO */}
      <div className="px-4 py-2 bg-surface-50 flex justify-between items-center text-[10px] font-medium text-neutral-500 border-b border-surface-100">
         <div className="flex items-center gap-1">
            <span className="bg-surface-200 p-0.5 rounded text-neutral-600"><Banknote size={10}/></span> 
            Est. Pendapatan
         </div>
         <span className="font-bold text-neutral-800">Rp {totalRevenue.toLocaleString("id-ID")}</span>
      </div>

      {/* ORDER LIST (SCROLLABLE) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-surface-50/30 custom-scrollbar">
         {orders.length === 0 ? (
             <div className="h-40 flex flex-col items-center justify-center text-neutral-300 gap-2">
                 <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center opacity-50">
                    <Inbox size={24} />
                 </div>
                 <span className="text-xs font-medium">Belum ada pesanan</span>
             </div>
         ) : (
             orders.map((order) => (
                 <OrderCard 
                    key={order.id} 
                    order={order} 
                    variant={variant} 
                    drivers={drivers}
                    onAction={onAction}
                 />
             ))
         )}
      </div>

    </div>
  );
}