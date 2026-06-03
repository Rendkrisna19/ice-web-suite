"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { XCircle, Search, Filter, Loader2, Store, User } from "lucide-react";   
import { Order } from "@/types/merchant"; // Gunakan type Order yang sudah ada
import { rejectedService } from "./services/rejectedService";
import AdminHeader from "@/features/admin/components/AdminHeader";

export default function RejectedOrdersBoard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await rejectedService.getRejectedOrders();
      
      if (data && Array.isArray(data.data)) {
        setOrders(data.data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Fetch rejected orders failed", error);
      toast.error("Gagal memuat data pesanan ditolak.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <>
      <AdminHeader title="Order History" onRefresh={fetchOrders} />

      <main className="p-8 pb-32 space-y-6 animate-in fade-in duration-500 bg-surface-300 min-h-screen">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Pesanan Ditolak (Rejected)</h1>
                <p className="text-sm text-neutral-500 mt-1">Daftar pesanan yang dibatalkan oleh Merchant.</p>
            </div>
            
            {/* Summary Card Kecil */}
            <div className="bg-red-50 px-5 py-3 rounded-xl border border-red-100 flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg text-red-600">
                    <XCircle size={20} />
                </div>
                <div>
                    <p className="text-xs text-neutral-500 font-semibold">Total Ditolak</p>
                    <p className="text-lg font-bold text-red-700">{orders.length} Pesanan</p>
                </div>
            </div>
        </div>

        {/* Filter Bar */}
        <div className="flex gap-4">
            <div className="relative flex-1 group">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none group-focus-within:text-[#15423C] transition-colors">
                   <Search size={20} />
               </div>
               <input 
                   type="text" 
                   placeholder="Cari Order ID, Merchant, atau Pelanggan..." 
                   className="w-full pl-12 pr-4 py-3 bg-white border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#15423C]/20 focus:border-[#15423C] font-medium transition-all placeholder:text-neutral-400 shadow-sm"
               />
            </div>

            <button className="bg-white border border-surface-200 text-neutral-600 px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-surface-50 transition-colors shadow-sm">
               <Filter size={18} /> 
               <span>Filter</span>
            </button>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-100 text-neutral-500 uppercase text-[10px] font-bold tracking-widest border-b border-surface-200">
                <tr>
                  <th className="px-6 py-5">Order Info</th>
                  <th className="px-6 py-5">Merchant (Outlet)</th>
                  <th className="px-6 py-5">Pelanggan</th>
                  <th className="px-6 py-5">Total</th>
                  <th className="px-6 py-5">Status</th>
                  {/* Kolom Alasan Cancel jika ada di DB */}
                  {/* <th className="px-6 py-5">Alasan</th> */} 
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                        <div className="flex justify-center items-center gap-2 text-neutral-400">
                           <Loader2 className="animate-spin text-[#15423C]" /> Memuat data...
                        </div>
                    </td>
                  </tr>
                ) : orders.length > 0 ? (
                    orders.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-50 transition-colors group">
                        
                        {/* Order ID & Tanggal */}
                        <td className="px-6 py-5">
                            <div className="font-bold text-[#15423C] mb-1">#{item.order_number || item.id}</div>
                            <div className="text-xs text-neutral-400 font-medium">
                                {new Date(item.updated_at || "").toLocaleDateString("id-ID", {
                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                })}
                            </div>
                        </td>

                        {/* Merchant Info */}
                        <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                                <Store size={16} className="text-neutral-400" />
                                <span className="font-semibold text-neutral-700">
                                    {/* Pastikan relasi outlet diload di backend */}
                                    {(item as any).outlet?.name || "Unknown Outlet"} 
                                </span>
                            </div>
                        </td>

                        {/* Customer Info */}
                        <td className="px-6 py-5">
                             <div className="flex items-center gap-2">
                                <User size={16} className="text-neutral-400" />
                                <div>
                                    <div className="font-semibold text-neutral-700">
                                        {(item as any).customer?.name || "Guest"}
                                    </div>
                                    <div className="text-xs text-neutral-400">
                                        {(item as any).customer?.email}
                                    </div>
                                </div>
                            </div>
                        </td>

                        {/* Total Price */}
                        <td className="px-6 py-5 font-bold text-neutral-800">
                            Rp {Number(item.total_price).toLocaleString("id-ID")}
                        </td>

                        {/* Status Badge */}
                        <td className="px-6 py-5">
                            <span className="bg-red-50 border border-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1">
                                <XCircle size={12} /> DITOLAK
                            </span>
                        </td>

                        {/* Jika ingin menampilkan alasan (Uncomment jika kolom ada) */}
                        {/* <td className="px-6 py-5 text-neutral-500 italic max-w-xs truncate">
                            {(item as any).cancel_reason || "-"}
                        </td> */}
                    </tr>
                    ))
                ) : (
                  <tr><td colSpan={6} className="py-20 text-center text-neutral-400">Tidak ada data pesanan ditolak.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}