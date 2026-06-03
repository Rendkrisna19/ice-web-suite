"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  TrendingUp, ShoppingBag, Banknote, Loader2, 
  FileText, Sheet, Store, Globe 
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/utils/cn";

import { reportService, DailyReportResponse } from "./services/reportService";
import POSSidebar from "../orders/components/POSSidebar"; 
import POSHeader from "../orders/components/POSHeader"; 
import StatCard from "./components/StatCard";
import TransactionTable from "./components/TransactionTable";

type SourceFilter = "all" | "pos" | "online";

export default function ReportBoard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<DailyReportResponse | null>(null);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setIsLoading(true);
        const data = await reportService.getDailyReport(selectedDate);
        setReportData(data);
      } catch (error) {
        toast.error("Gagal memuat data laporan.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [selectedDate]);

  const handleDownloadExcel = async () => {
    const toastId = toast.loading("Menyiapkan Excel...");
    try {
      await reportService.downloadExcel(selectedDate);
      toast.success("Excel berhasil diunduh!", { id: toastId });
    } catch (error) {
      toast.error("Gagal mengunduh Excel", { id: toastId });
    }
  };

  const handleDownloadPdf = async () => {
    const toastId = toast.loading("Menyiapkan PDF...");
    try {
      await reportService.downloadPdf(selectedDate);
      toast.success("PDF berhasil diunduh!", { id: toastId });
    } catch (error) {
      toast.error("Gagal mengunduh PDF", { id: toastId });
    }
  };

  const formatRupiah = (amount: number | string) => {
    const cleanNumber = Math.floor(Number(amount));
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cleanNumber);
  };

  const summary = reportData?.summary;
  const transactions = reportData?.transactions || [];

  return (
    <div className="fixed inset-0 z-50 bg-surface-300 flex flex-col font-sans overflow-hidden">
      
      <POSSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <POSHeader onMenuClick={() => setIsSidebarOpen(true)} />

      <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
          
          {/* HEADER SECTION */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-primary-900">Laporan Penjualan</h1>
              <p className="text-neutral-500 text-sm mt-1">Ringkasan performa pesanan online food delivery.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white px-4 py-2.5 rounded-xl border border-surface-200 text-sm font-bold text-neutral-700 shadow-sm focus:ring-2 focus:ring-[#15423C] outline-none cursor-pointer"
              />
              <button onClick={handleDownloadExcel} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-bold text-sm transition-colors border border-emerald-200 shadow-sm">
                <Sheet size={18} /> <span className="hidden sm:inline">Excel</span>
              </button>
              <button onClick={handleDownloadPdf} className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-bold text-sm transition-colors border border-rose-200 shadow-sm">
                <FileText size={18} /> <span className="hidden sm:inline">PDF</span>
              </button>
            </div>
          </div>

          {isLoading || !summary ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#15423C]">
               <Loader2 size={40} className="animate-spin mb-4" />
               <p className="text-sm font-bold text-neutral-500">Memuat Laporan...</p>
            </div>
          ) : (
            <>
              {/* KARTU STATISTIK UTAMA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <StatCard 
                  title="Total Pendapatan" 
                  value={formatRupiah(summary.total_revenue)} 
                  icon={<Banknote size={24} className="text-white" />} 
                  bgClass="bg-[#15423C]" 
                />
                <StatCard 
                  title="Total Modal (HPP)" 
                  value={formatRupiah(summary.total_modal)} 
                  icon={<Store size={24} className="text-[#8A7863]" />} 
                  bgClass="bg-[#F5F1E8] !text-neutral-800 border-none shadow-sm" 
                  titleClass="!text-neutral-500" 
                  valueClass="!text-neutral-800"
                />
                <StatCard 
                  title="Keuntungan Bersih" 
                  value={formatRupiah(summary.net_profit)} 
                  icon={<TrendingUp size={24} className="text-white" />} 
                  bgClass="bg-[#8A7863]" 
                />
                <StatCard 
                  title="Ongkir Driver" 
                  value={formatRupiah(summary.total_delivery_fee)} 
                  icon={<Globe size={24} className="text-[#15423C]" />} 
                  bgClass="bg-white !text-neutral-800 border-surface-200 shadow-sm" 
                  titleClass="!text-neutral-500" 
                  valueClass="!text-neutral-800"
                />
              </div>

              {/* TABEL TRANSAKSI DENGAN FILTER */}
              <div className="bg-white rounded-3xl shadow-sm border border-surface-200 overflow-hidden flex flex-col mt-8">
                <div className="p-4 border-b border-surface-200 bg-surface-50 flex items-center justify-between">
                  <h3 className="font-bold text-neutral-700">Riwayat Pesanan ({transactions.length})</h3>
                </div>

                <div className="p-0 overflow-x-auto">
                  <TransactionTable transactions={transactions} />
                </div>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}