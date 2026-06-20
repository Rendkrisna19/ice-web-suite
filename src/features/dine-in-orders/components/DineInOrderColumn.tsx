"use client";

import { ReactNode } from "react";
import { cn } from "@/utils/cn";
import DineInOrderCard from "./DineInOrderCard";
import { DineInOrder } from "../services/dineInOrderService";
import { Banknote, Inbox } from "lucide-react";

interface DineInOrderColumnProps {
  title: string;
  orders: DineInOrder[];
  variant: "pending" | "preparing" | "ready" | "completed";
  icon: ReactNode;
  accentColor: string;
  borderColor: string;
  onAction: (orderId: number, status: string) => void;
}

export default function DineInOrderColumn({ title, orders, variant, icon, accentColor, borderColor, onAction }: DineInOrderColumnProps) {
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_price), 0);

  return (
    <div className={cn("flex-1 min-w-[320px] max-w-[400px] flex flex-col h-full bg-white rounded-3xl border shadow-sm overflow-hidden", borderColor)}>
      <div className="p-4 border-b border-surface-100 flex items-center justify-between bg-surface-50/50">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm text-white", accentColor)}>
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-neutral-800 text-sm leading-tight">{title}</h3>
            <span className="text-[10px] text-neutral-500 font-medium">{orders.length} Pesanan</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-2 bg-surface-50 flex justify-between items-center text-[10px] font-medium text-neutral-500 border-b border-surface-100">
        <div className="flex items-center gap-1">
          <span className="bg-surface-200 p-0.5 rounded text-neutral-600"><Banknote size={10} /></span>
          Est. Pendapatan
        </div>
        <span className="font-bold text-neutral-800">Rp {totalRevenue.toLocaleString("id-ID")}</span>
      </div>

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
            <DineInOrderCard key={order.id} order={order} variant={variant} onAction={onAction} />
          ))
        )}
      </div>
    </div>
  );
}
