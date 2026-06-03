"use client";

import { CheckCircle2, XCircle, Clock, ArrowRight, FileText, Globe } from "lucide-react";
import { TransactionReport } from "../services/reportService";

interface TransactionTableProps {
  transactions: TransactionReport[];
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  // Fungsi Format Rupiah yang Bersih (Tanpa Koma Nol)
  const formatRupiah = (amount: number | string) => {
    const cleanNumber = Math.floor(Number(amount));
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cleanNumber);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-surface-200 overflow-hidden">
      
      {/* Table Header Title */}
      <div className="p-6 border-b border-surface-100 flex justify-between items-center bg-surface-50/50">
        <div>
          <h3 className="font-bold text-lg text-neutral-800">Riwayat Transaksi</h3>
          <p className="text-xs text-neutral-400">Transaksi hari ini</p>
        </div>
        <button className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg transition-colors group">
          Lihat Semua <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform"/>
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {transactions.length > 0 ? (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-50 text-neutral-500 uppercase tracking-wider text-[10px] font-bold border-b border-surface-100">
              <tr>
                <th className="px-6 py-4">Waktu & Order</th>
                <th className="px-6 py-4">Pelanggan</th>
                <th className="px-6 py-4 min-w-[200px]">Ringkasan Pesanan</th>
                <th className="px-6 py-4 text-right">Pendapatan Kotor</th>
                <th className="px-6 py-4 text-right">Keuntungan Bersih</th>
                <th className="px-6 py-4">Ongkir & Driver</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {transactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-surface-50 transition-colors group">
                  {/* WAKTU & ID ORDER */}
                  <td className="px-6 py-4">
                     <p className="font-bold text-neutral-800">{trx.order_number}</p>
                     <p className="font-mono text-xs text-neutral-500 group-hover:text-primary-600 transition-colors mt-0.5 flex items-center gap-1">
                        <Clock size={12} /> {trx.time}
                     </p>
                  </td>
                  
                  <td className="px-6 py-4 font-bold text-neutral-700">
                    {trx.customer_name}
                  </td>
                  
                  <td className="px-6 py-4 text-neutral-600 truncate max-w-[200px]" title={trx.summary}>
                    {trx.summary}
                  </td>
                  
                  <td className="px-6 py-4 text-right font-bold text-neutral-700 text-sm">
                    {formatRupiah(trx.revenue)}
                  </td>
                  
                  <td className="px-6 py-4 text-right font-black text-emerald-600 text-sm bg-emerald-50/30">
                    {formatRupiah(trx.net_profit)}
                  </td>
                  
                  <td className="px-6 py-4">
                     <p className="font-bold text-primary-700">{formatRupiah(trx.delivery_fee)}</p>
                     <p className="text-xs text-neutral-500 mt-0.5">Oleh: {trx.driver_name}</p>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={trx.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          // Empty State
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-surface-100 rounded-full text-neutral-400 mb-4">
               <FileText size={32} />
            </div>
            <p className="font-bold text-neutral-700">Belum ada transaksi</p>
            <p className="text-sm text-neutral-400 mt-1">Transaksi yang masuk hari ini akan muncul di sini.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component Badge Status
function StatusBadge({ status }: { status: string }) {
  const getBadgeStyle = (sts: string) => {
    switch (sts) {
      case 'completed': 
      case 'delivered': return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case 'cancelled': return "bg-rose-50 text-rose-700 border-rose-200";
      case 'pending': 
      case 'paid':
      case 'preparing':
      case 'ready': return "bg-amber-50 text-amber-700 border-amber-200";
      case 'on_delivery': return "bg-blue-50 text-blue-700 border-blue-200";
      default: return "bg-surface-100 text-neutral-600 border-surface-200";
    }
  };

  const getIcon = (sts: string) => {
    if (sts === 'completed' || sts === 'delivered') return <CheckCircle2 size={12} />;
    if (sts === 'cancelled') return <XCircle size={12} />;
    return <Clock size={12} />;
  };

  const getLabel = (sts: string) => {
    switch (sts) {
      case 'completed': return "SELESAI";
      case 'delivered': return "SELESAI";
      case 'cancelled': return "BATAL";
      case 'pending': return "BARU MASUK";
      case 'paid': return "DIBAYAR";
      case 'preparing': return "DAPUR";
      case 'ready': return "SIAP ANTAR";
      case 'on_delivery': return "DIANTAR";
      default: return sts.toUpperCase();
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border shadow-sm ${getBadgeStyle(status)}`}>
      {getIcon(status)} {getLabel(status)}
    </span>
  );
}