"use client";

import { cn } from "@/utils/cn";
import { RecentTransaction } from "@/types/reports"; 
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";

export default function TransactionTable({ transactions }: { transactions: RecentTransaction[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden h-full flex flex-col">
       <div className="p-6 border-b border-surface-100 shrink-0">
          <h3 className="font-bold text-lg text-neutral-800">Riwayat Transaksi Terakhir</h3>
       </div>
       <div className="overflow-x-auto custom-scrollbar flex-1">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface-50 text-neutral-500 uppercase text-[10px] font-bold tracking-widest border-b border-surface-200 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4">ID / Waktu</th>
            <th className="px-6 py-4">Merchant / Order</th>
              <th className="px-6 py-4">Total Order</th>
            <th className="px-6 py-4">Gross Sales (Est)</th>
            <th className="px-6 py-4">COGS (Est)</th>
            <th className="px-6 py-4">Gross Profit (Est)</th>
            <th className="px-6 py-4">App Fee (Est)</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {transactions.length > 0 ? (
                transactions.map((trx) => {
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
    </div>
  );
}