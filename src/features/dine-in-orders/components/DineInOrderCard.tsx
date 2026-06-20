"use client";

import { useState } from "react";
import { Clock, ChevronDown, ChevronUp, Check, X, ShoppingBag, Armchair, ChefHat, CheckCheck } from "lucide-react";
import { cn } from "@/utils/cn";
import { DineInOrder, DineInOrderItem } from "../services/dineInOrderService";

interface DineInOrderCardProps {
  order: DineInOrder;
  variant: "pending" | "preparing" | "ready" | "completed";
  onAction: (orderId: number, status: string) => void;
}

export default function DineInOrderCard({ order, variant, onAction }: DineInOrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  const getBorderColor = () => {
    switch (variant) {
      case "pending": return "border-l-primary-500";
      case "preparing": return "border-l-orange-500";
      case "ready": return "border-l-blue-500";
      case "completed": return "border-l-emerald-500";
      default: return "border-l-gray-200";
    }
  };

  return (
    <div className={cn(
      "bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden transition-all duration-300",
      "hover:shadow-md border-l-4",
      getBorderColor()
    )}>
      <div onClick={() => setIsExpanded(!isExpanded)} className="p-3 flex items-center justify-between cursor-pointer hover:bg-surface-50 transition-colors">
        <div className="flex items-center gap-3">
          <span className={cn(
            "text-xs font-bold px-2 py-1 rounded-md border",
            variant === "pending" ? "bg-primary-50 text-primary-700 border-primary-100" : "bg-surface-100 text-neutral-600 border-surface-200"
          )}>
            #{order.order_number?.split("-").pop() || order.id}
          </span>
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-medium">
              <Clock size={10} />
              {new Date(order.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="text-[10px] font-semibold text-neutral-700">{order.items?.length || 0} Item</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-neutral-800">{formatCurrency(Number(order.total_price))}</span>
          {isExpanded ? <ChevronUp size={16} className="text-neutral-400" /> : <ChevronDown size={16} className="text-neutral-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2 duration-200">
          <div className="h-px w-full bg-surface-100 mb-3" />

          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-surface-100 flex items-center justify-center shrink-0">
              <Armchair size={12} className="text-neutral-500" />
            </div>
            <h4 className="text-xs font-bold text-neutral-800">{order.table?.name || "Meja tidak diketahui"}</h4>
          </div>

          <div className="bg-surface-50 rounded-lg p-2 space-y-2 mb-4 border border-surface-100">
            {order.items && order.items.length > 0 ? (
              order.items.map((item: DineInOrderItem, idx: number) => (
                <div key={idx} className="flex justify-between text-xs border-b border-dashed border-surface-200 last:border-0 pb-2 mb-1 last:mb-0">
                  <div className="flex gap-2">
                    <span className="font-bold text-neutral-800">{item.quantity}x</span>
                    <span className="text-neutral-600 line-clamp-1">{item.product_name_snap}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-neutral-400 italic flex items-center gap-1">
                <ShoppingBag size={12} /> Data item tidak tersedia
              </div>
            )}
          </div>

          <div>
            {variant === "pending" && (
              <div className="grid grid-cols-2 gap-2">
                <button onClick={(e) => { e.stopPropagation(); onAction(order.id, "cancelled"); }} className="flex items-center justify-center gap-1 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors">
                  <X size={14} /> Tolak
                </button>
                <button onClick={(e) => { e.stopPropagation(); onAction(order.id, "preparing"); }} className="flex items-center justify-center gap-1 py-2 rounded-lg bg-[#15423C] text-white text-xs font-bold hover:bg-[#1A534B] transition-colors shadow-sm active:scale-95">
                  <Check size={14} /> Terima
                </button>
              </div>
            )}

            {variant === "preparing" && (
              <button onClick={(e) => { e.stopPropagation(); onAction(order.id, "ready"); }} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors shadow-sm active:scale-95">
                <ChefHat size={14} /> Pesanan Siap
              </button>
            )}

            {variant === "ready" && (
              <button onClick={(e) => { e.stopPropagation(); onAction(order.id, "completed"); }} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm active:scale-95">
                <CheckCheck size={14} /> Sudah Disajikan
              </button>
            )}

            {variant === "completed" && (
              <div className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 py-2 rounded-lg text-xs font-bold border border-emerald-100">
                <Check size={14} /> Selesai
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
