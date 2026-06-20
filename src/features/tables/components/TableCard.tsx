"use client";

import { Edit, Trash2, QrCode, Receipt, Users } from "lucide-react";
import { cn } from "@/utils/cn";
import { DiningTable } from "@/types/table";

interface TableCardProps {
  table: DiningTable;
  onEdit: (table: DiningTable) => void;
  onDelete: (table: DiningTable) => void;
  onShowQr: (table: DiningTable) => void;
  onShowBill: (table: DiningTable) => void;
}

export default function TableCard({ table, onEdit, onDelete, onShowQr, onShowBill }: TableCardProps) {
  const hasOpenBill = (table.open_orders_count || 0) > 0;

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col group">
      <div className="p-4 flex items-start justify-between">
        <div>
          <h3 className="font-bold text-neutral-800 text-lg">{table.name}</h3>
          {table.capacity && (
            <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
              <Users size={12} /> {table.capacity} kursi
            </p>
          )}
        </div>
        <span
          className={cn(
            "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
            hasOpenBill ? "bg-amber-100 text-amber-700" : "bg-emerald-50 text-emerald-600"
          )}
        >
          {hasOpenBill ? "Ada Tagihan" : "Kosong"}
        </span>
      </div>

      <div className="mt-auto p-3 pt-0 grid grid-cols-2 gap-2">
        <button
          onClick={() => onShowQr(table)}
          className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#15423C]/10 text-[#15423C] text-xs font-bold hover:bg-[#15423C]/20 transition-colors"
        >
          <QrCode size={14} /> Lihat QR
        </button>
        <button
          onClick={() => onShowBill(table)}
          className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors"
        >
          <Receipt size={14} /> Tagihan
        </button>
        <button
          onClick={() => onEdit(table)}
          className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-surface-100 text-neutral-600 text-xs font-bold hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <Edit size={14} /> Edit
        </button>
        <button
          onClick={() => onDelete(table)}
          className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-surface-100 text-neutral-600 text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <Trash2 size={14} /> Hapus
        </button>
      </div>
    </div>
  );
}
