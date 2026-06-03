"use client";

import { useState, useEffect } from "react";
import { RotateCcw, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { dashboardService, DashboardResponse, DashboardStat } from "./services/dashboardService";
import AdminHeader from "../components/AdminHeader";
import StatCard from "./components/StatCard";
import ActivityList from "./components/ActivityList";

export default function DashboardBoard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await dashboardService.getOverview();
      setData(response);
    } catch (error) {
      toast.error("Gagal memuat data dashboard.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    const loadingToast = toast.loading("Memperbarui data...");
    await fetchDashboardData();
    toast.dismiss(loadingToast);
    toast.success("Data berhasil diperbarui!");
  };

  // Mapping data API ke format UI Card
  const stats: DashboardStat[] = data ? [
    {
      title: "TOTAL PENDAPATAN",
      value: `Rp ${Number(data.cards.revenue.value).toLocaleString("id-ID")}`,
      trend: data.cards.revenue.label,
      type: "money",
    },
    {
      title: "TOTAL ORDER",
      value: `${Number(data.cards.orders.value).toLocaleString("id-ID")} Order`,
      trend: data.cards.orders.label,
      type: "order",
    },
    {
      title: "OUTLET AKTIF",
      value: `${Number(data.cards.outlets.active).toLocaleString("id-ID")} Outlet`,
      trend: data.cards.outlets.label,
      type: "merchant",
    },
    {
      title: "PESANAN DITOLAK", // <-- UBAH INI
      value: `${Number(data.cards.rejected.count).toLocaleString("id-ID")} Pesanan`, // <-- UBAH INI
      trend: data.cards.rejected.label, // <-- UBAH INI
      type: "alert",
    },
  ] : [];
  // Hitung nilai tertinggi di chart untuk normalisasi tinggi bar (skala 100%)
  const maxChartCount = data ? Math.max(...data.chart.map(c => c.count), 1) : 1;

  return (
    <>
      <AdminHeader title="Dashboard" onRefresh={handleRefresh} />

      <main className="p-8 pb-20 space-y-8 animate-in fade-in duration-500 min-h-screen">
        
        {/* Title Section */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-primary-800">Dashboard Overview</h1>
            <p className="text-sm text-neutral-500 mt-1">Ringkasan aktivitas bisnis hari ini.</p>
          </div>
          <button 
             onClick={handleRefresh}
             className="bg-white border border-primary-200 text-neutral-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-surface-50 flex items-center gap-2 active:scale-95 transition-all"
          >
             <RotateCcw size={14} className={isLoading ? "animate-spin" : ""} /> Refresh Data
          </button>
        </div>

        {isLoading ? (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="animate-spin text-primary-600" size={40} />
            </div>
        ) : data ? (
          <>
            {/* 1. STAT CARDS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <StatCard key={idx} stat={stat} />
              ))}
            </div>

            {/* 2. CHART & ACTIVITY ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* LIVE CHART SECTION */}
              <div className="bg-surface-100 p-8 rounded-2xl border border-surface-200 shadow-sm flex flex-col min-h-[450px]">
                 <div className="flex justify-between items-center mb-10 shrink-0">
                  <h3 className="font-bold text-lg text-neutral-800">Traffic Order Live</h3>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold bg-green-50 text-green-600 px-2.5 py-1 rounded-full border border-green-100">
                     <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                     LIVE HARI INI
                  </span>
                </div>

                <div className="flex-1 flex items-end justify-between gap-2 sm:gap-4 px-2 relative">
                  {data.chart.map((item, i) => {
                    const heightPercent = (item.count / maxChartCount) * 100;
                    return (
                      <div key={i} className="flex-1 w-full flex flex-col justify-end group h-full relative cursor-pointer">
                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-800 text-white text-[10px] px-2 py-1 rounded mb-2 whitespace-nowrap z-10 pointer-events-none">
                           {item.time} - {item.count} Order
                        </div>
                        {/* The Bar */}
                        <div 
                          className="w-full bg-surface-200 rounded-t-md relative group-hover:bg-[#15423C] transition-all duration-300 ease-out" 
                          style={{ height: `${Math.max(heightPercent, 2)}%` }} // min-height 2% agar selalu terlihat garis dasar
                        ></div>
                      </div>
                    );
                  })}
                </div>
                
                {/* X-Axis Labels (Ambil beberapa label agar tidak menumpuk) */}
                <div className="mt-6 pt-4 border-t border-surface-100 flex justify-between text-xs font-bold text-neutral-400">
                  <span>{data.chart[0]?.time}</span>
                  <span>{data.chart[Math.floor(data.chart.length / 2)]?.time}</span>
                  <span>{data.chart[data.chart.length - 1]?.time}</span>
                </div>
              </div>

              {/* ACTIVITY LOG SECTION */}
              <ActivityList logs={data.recent_activities} />

            </div>
          </>
        ) : (
           <div className="text-center py-20 text-neutral-400">Gagal memuat data dashboard.</div>
        )}

      </main>
    </>
  );
}
