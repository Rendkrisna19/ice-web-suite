"use client";

import { useEffect, useState } from "react";
import { X, Receipt, CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { DiningTable } from "@/types/table";
import { tableService, TableBill } from "../services/tableService";

interface TableBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: DiningTable | null;
  onClosed: () => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

export default function TableBillModal({ isOpen, onClose, table, onClosed }: TableBillModalProps) {
  const [bill, setBill] = useState<TableBill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen && table) {
      setIsLoading(true);
      tableService
        .getBill(table.id)
        .then(setBill)
        .catch(() => toast.error("Gagal memuat tagihan"))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, table]);

  if (!isOpen || !table) return null;

  const handleCloseBill = async () => {
    setIsClosing(true);
    try {
      await tableService.closeBill(table.id);
      toast.success(`Tagihan ${table.name} berhasil ditutup`);
      onClosed();
      onClose();
    } catch {
      toast.error("Gagal menutup tagihan");
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        <div className="p-5 border-b border-surface-200 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg text-neutral-800 flex items-center gap-2">
            <Receipt size={18} className="text-[#15423C]" /> Tagihan {table.name}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-100 text-neutral-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#15423C]" size={32} /></div>
          ) : !bill || bill.orders.length === 0 ? (
            <div className="text-center py-10 text-neutral-400">
              <Receipt size={40} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-bold">Belum ada tagihan terbuka</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bill.orders.map((order) => (
                <div key={order.id} className="bg-surface-50 rounded-xl p-3.5 border border-surface-100">
                  <p className="text-xs font-bold text-neutral-400 mb-2">#{order.order_number}</p>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm mb-1">
                      <span className="text-neutral-600">{item.quantity}x {item.product_name_snap}</span>
                      <span className="font-medium text-neutral-700">{formatCurrency(Number(item.subtotal))}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 bg-surface-50 border-t border-surface-200 shrink-0">
          <div className="flex justify-between font-black text-xl text-[#15423C] mb-4">
            <span>Total Tagihan</span>
            <span>{formatCurrency(bill?.total || 0)}</span>
          </div>
          <button
            onClick={handleCloseBill}
            disabled={isClosing || !bill || bill.orders.length === 0}
            className="w-full py-3.5 bg-[#15423C] text-white rounded-2xl font-black flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-all"
          >
            {isClosing ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
            Tutup & Tandai Lunas
          </button>
        </div>
      </div>
    </div>
  );
}
