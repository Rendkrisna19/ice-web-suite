"use client";

import { useState } from "react";
import { Order, Driver, OrderItem } from "@/types"; // Pastikan import OrderItem
import { Clock, ChevronDown, ChevronUp, Check, X, ShoppingBag, User, Bike, CheckSquare } from "lucide-react";
import { cn } from "@/utils/cn";

interface OrderCardProps {
  order: Order;
  variant: "incoming" | "cooking" | "ready" | "delivery" | "delivered";
  drivers?: Driver[];
  onAction: (orderId: number, action: string, payload?: number) => void;
}

export default function OrderCard({ order, variant, drivers = [], onAction }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getBorderColor = () => {
    switch (variant) {
      case "incoming": return "border-l-primary-500";
      case "cooking": return "border-l-orange-500";
      case "ready": return "border-l-blue-500";
      case "delivery": return "border-l-slate-500";
      case "delivered": return "border-l-purple-500";
      default: return "border-l-gray-200";
    }
  };

  return (
    <div className={cn(
        "bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden transition-all duration-300",
        "hover:shadow-md border-l-4",
        getBorderColor()
    )}>
      {/* Header Compact */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-surface-50 transition-colors"
      >
         <div className="flex items-center gap-3">
             <span className={cn(
                 "text-xs font-bold px-2 py-1 rounded-md border",
                 variant === 'incoming' ? "bg-primary-50 text-primary-700 border-primary-100" : "bg-surface-100 text-neutral-600 border-surface-200"
             )}>
                #{order.order_number?.split('-').pop() || order.id}
             </span>

             <div className="flex flex-col">
                <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-medium">
                   <Clock size={10} />
                   {new Date(order.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-[10px] font-semibold text-neutral-700">
                    {order.items?.length || 0} Item
                </div>
             </div>
         </div>

         <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-neutral-800">
               {formatCurrency(Number(order.total_price))}
            </span>
            {isExpanded ? <ChevronUp size={16} className="text-neutral-400"/> : <ChevronDown size={16} className="text-neutral-400"/>}
         </div>
      </div>

      {/* Detail Dropdown */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2 duration-200">
            <div className="h-px w-full bg-surface-100 mb-3" />

            <div className="flex items-start gap-3 mb-3">
                <div className="w-6 h-6 rounded-full bg-surface-100 flex items-center justify-center shrink-0 mt-0.5">
                    <User size={12} className="text-neutral-500"/>
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-neutral-800 truncate">
                        {order.customer?.name || "Guest"}
                    </h4>
                    <p className="text-[10px] text-neutral-500 leading-tight mt-0.5">
                        {order.delivery_address || "Ambil di tempat"}
                    </p>
                </div>
            </div>

            <div className="bg-surface-50 rounded-lg p-2 space-y-2 mb-4 border border-surface-100">
                {order.items && order.items.length > 0 ? (
                    order.items.map((item: OrderItem, idx: number) => ( // Gunakan OrderItem type
                        <div key={idx} className="flex flex-col text-xs border-b border-dashed border-surface-200 last:border-0 pb-2 mb-1 last:mb-0">
                            <div className="flex justify-between w-full">
                                <div className="flex gap-2">
                                    <span className="font-bold text-neutral-800">{item.quantity}x</span>
                                    <span className="text-neutral-600 line-clamp-1">{item.product_name_snap}</span>
                                </div>
                            </div>
                            {item.variant_snap && ((item.variant_snap as any).notes || (item.variant_snap as any).note || (typeof item.variant_snap === 'string' ? item.variant_snap : null)) && (
                                <div className="mt-1 pl-6 text-[10px] text-neutral-400 italic">
                                    Catatan: {(item.variant_snap as any).notes || (item.variant_snap as any).note || (typeof item.variant_snap === 'string' ? item.variant_snap : '')}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-xs text-neutral-400 italic flex items-center gap-1">
                        <ShoppingBag size={12} /> Data item tidak tersedia
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div>
                 {variant === "incoming" && (
                     <div className="grid grid-cols-2 gap-2">
                         <button 
                           onClick={(e) => { e.stopPropagation(); onAction(order.id, "reject"); }}
                           className="flex items-center justify-center gap-1 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors"
                         >
                            <X size={14} /> Tolak
                         </button>
                         <button 
                           onClick={(e) => { e.stopPropagation(); onAction(order.id, "accept"); }}
                           className="flex items-center justify-center gap-1 py-2 rounded-lg bg-[#15423C] text-white text-xs font-bold hover:bg-[#1A534B] transition-colors shadow-sm active:scale-95"
                         >
                            <Check size={14} /> Terima
                         </button>
                     </div>
                 )}

                 {variant === "cooking" && (
                     <button 
                        onClick={(e) => { e.stopPropagation(); onAction(order.id, "ready"); }}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors shadow-sm active:scale-95"
                     >
                        <Check size={14} /> Pesanan Siap
                     </button>
                 )}

                 {variant === "ready" && (
                     <div className="space-y-2">
                         <div className="relative">
                            <select 
                                className="w-full py-2 pl-2 pr-8 bg-white border border-surface-300 rounded-lg text-xs font-medium text-neutral-700 focus:outline-none focus:border-primary-500"
                                value={selectedDriverId}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setSelectedDriverId(e.target.value)}
                            >
                                <option value="" disabled>Pilih Driver...</option>
                                {drivers.length > 0 ? (
                                    drivers.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} {d.is_online ? '(On)' : '(Off)'}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>Tidak ada driver</option>
                                )}
                            </select>
                         </div>

                         <button 
                           disabled={!selectedDriverId}
                           onClick={(e) => { e.stopPropagation(); onAction(order.id, "assign_driver", Number(selectedDriverId)); }}
                           className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 active:scale-95"
                         >
                            <Bike size={14} /> Panggil Driver
                         </button>
                     </div>
                 )}

                 {variant === "delivery" && (
                     <div className="flex items-center justify-between bg-blue-50 p-2 rounded-lg border border-blue-100">
                         <div className="flex items-center gap-2 text-xs text-blue-700">
                             <Bike size={14} />
                             <span className="font-bold">{order.driver?.name || "Driver"}</span>
                         </div>
                         <button 
                           onClick={(e) => { e.stopPropagation(); onAction(order.id, "complete"); }}
                           className="p-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                           title="Force Complete"
                         >
                            <Check size={14} />
                         </button>
                     </div>
                 )}

                 {variant === "delivered" && (
                    <button 
                       onClick={(e) => { e.stopPropagation(); onAction(order.id, "validate_proof"); }}
                       className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors shadow-sm active:scale-95"
                    >
                       <CheckSquare size={14} /> Cek Bukti
                    </button>
                 )}
            </div>
        </div>
      )}
    </div>
  );
}
