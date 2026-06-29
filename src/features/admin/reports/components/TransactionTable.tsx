"use client";

import { useState } from "react";
import { cn } from "@/utils/cn";
import { RecentTransaction } from "@/types/reports"; 
import { CheckCircle2, XCircle, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";

export default function TransactionTable({ transactions }: { transactions: RecentTransaction[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = transactions.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when limit changes
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden h-full flex flex-col">
       <div className="p-6 border-b border-surface-100 shrink-0 flex items-center justify-between">
          <h3 className="font-bold text-lg text-neutral-800">Riwayat Transaksi Terakhir</h3>
          
          {transactions.length > 0 && (
             <div className="flex items-center gap-2 text-sm text-neutral-600">
               <span>Tampilkan:</span>
               <select 
                 value={itemsPerPage} 
                 onChange={handleItemsPerPageChange}
                 className="bg-surface-50 border border-surface-200 rounded-lg px-2 py-1 outline-none focus:border-primary-500"
               >
                 <option value={5}>5</option>
                 <option value={10}>10</option>
                 <option value={15}>15</option>
                 <option value={20}>20</option>
                 <option value={50}>50</option>
               </select>
             </div>
          )}
       </div>
       <div className="overflow-x-auto custom-scrollbar flex-1">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface-50 text-neutral-500 uppercase text-[10px] font-bold tracking-widest border-b border-surface-200 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4">ID / Waktu</th>
              <th className="px-6 py-4">Merchant / Order</th>
              <th className="px-6 py-4">Total Order</th>
              <th className="px-6 py-4">Total Penjualan (Est)</th>
              <th className="px-6 py-4">HPP / Modal (Est)</th>
              <th className="px-6 py-4">Laba Kotor (Est)</th>
              <th className="px-6 py-4">Biaya Aplikasi (Est)</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((trx) => {
              const estimatedAppFee = Number(trx.app_fee_est ?? (Number(trx.delivery_fee) + Number(trx.tax)));
              const estimatedGrossSales = Number(trx.gross_sales_est ?? 0);
              const estimatedCogs = Number(trx.cogs_est ?? 0);
              const estimatedGrossProfit = Number(trx.gross_profit_est ?? 0);

                    return (
                    <tr key={trx.id} className="hover:bg-surface-50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="font-bold text-neutral-800">#{trx.id}</div>
                            <div className="text-xs text-neutral-400 mt-0.5 font-mono">
                    {trx.created_at
                      ? new Date(trx.created_at).toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                      })
                      : "-"}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                  <div className="font-medium text-neutral-800">{trx.outlet?.name || "Unknown Outlet"}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">Order: {trx.order_number || `#${trx.id}`}</div>
                        </td>
                        <td className="px-6 py-4 font-bold text-neutral-800">
                            Rp {Number(trx.total_price).toLocaleString("id-ID")}
                        </td>
                <td className="px-6 py-4 font-bold text-neutral-800">
                  Rp {estimatedGrossSales.toLocaleString("id-ID")}
                </td>
                <td className="px-6 py-4 font-bold text-red-600">
                  Rp {estimatedCogs.toLocaleString("id-ID")}
                </td>
                <td className="px-6 py-4 font-bold text-green-700">
                  Rp {estimatedGrossProfit.toLocaleString("id-ID")}
                </td>
                        <td className="px-6 py-4 font-bold text-green-600">
                            +Rp {estimatedAppFee.toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4">
                            <span className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold w-fit border",
                            trx.status === "completed" ? "bg-green-50 text-green-700 border-green-100" :
                            trx.status === "refunded" ? "bg-orange-50 text-orange-700 border-orange-100" :
                            "bg-red-50 text-red-700 border-red-100"
                            )}>
                            {trx.status === "completed" && <CheckCircle2 size={12} />}
                            {trx.status === "refunded" && <RotateCcw size={12} />}
                            {trx.status === "cancelled" && <XCircle size={12} />}
                            
                            {trx.status === "completed" ? "Selesai" : 
                                trx.status === "refunded" ? "Refund" : "Batal"}
                            </span>
                        </td>
                    </tr>
                    );
                })
            ) : (
                <tr>
                    <td colSpan={8} className="py-10 text-center text-neutral-400">Belum ada transaksi periode ini.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {transactions.length > 0 && (
         <div className="p-4 border-t border-surface-100 flex items-center justify-between shrink-0 bg-white">
            <span className="text-sm text-neutral-500">
               Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, transactions.length)} dari {transactions.length} transaksi
            </span>
            <div className="flex items-center gap-2">
               <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-surface-200 text-neutral-600 hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  <ChevronLeft size={16} />
               </button>
               <span className="text-sm font-bold text-neutral-700 px-2">
                  {currentPage} / {totalPages}
               </span>
               <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-surface-200 text-neutral-600 hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  <ChevronRight size={16} />
               </button>
            </div>
         </div>
      )}
    </div>
  );
}
