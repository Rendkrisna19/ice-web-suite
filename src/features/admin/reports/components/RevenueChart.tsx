// src/features/admin/reports/components/RevenueChart.tsx
"use client";

import { ChartDataPoint } from "@/types/reports";
import { cn } from "@/utils/cn";

interface RevenueChartProps {
  data: ChartDataPoint[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  // Handle empty data state
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm flex flex-col h-[450px] justify-center items-center">
         <div className="text-4xl mb-3 opacity-50">📊</div>
         <p className="text-sm font-bold text-neutral-600">Belum Ada Data</p>
         <p className="text-xs text-neutral-400 mt-1">Tidak ada transaksi pada periode ini.</p>
      </div>
    );
  }

  // Hitung max value dengan buffer 10% agar bar tertinggi tidak mentok ke atap chart
  const rawMax = Math.max(...data.map((d) => Number(d.gross)), 1);
  const maxGross = rawMax + (rawMax * 0.1); 
  
  // Generate Y-Axis Ticks (5 level: 100%, 75%, 50%, 25%, 0%)
  const yTicks = [1, 0.75, 0.5, 0.25, 0].map(multiplier => maxGross * multiplier);

  // Helper format nominal ringkas (Contoh: 1.500.000 -> 1.5M)
  const formatCompact = (val: number) => {
    if (val === 0) return "0";
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
    return `${val}`;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm flex flex-col h-[450px]">
      
      {/* Header Chart */}
      <div className="flex justify-between items-start mb-6 shrink-0">
        <div>
          <h3 className="font-bold text-lg text-neutral-800">Tren Pendapatan</h3>
          <p className="text-sm text-neutral-400">Grafik omzet harian periode ini</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-600 bg-surface-50 px-3 py-1.5 rounded-lg border border-surface-200 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-[#15423C]"></span> 
          Gross Revenue
        </div>
      </div>

      {/* Chart Layout */}
      <div className="flex-1 flex min-h-0 relative mt-2">
        
        {/* Y-Axis (Sumbu Kiri) */}
        <div className="flex flex-col justify-between text-[10px] font-bold text-neutral-400 pb-8 pr-4 shrink-0">
          {yTicks.map((tick, i) => (
            <span key={i} className="-translate-y-1/2 text-right">
              {formatCompact(tick)}
            </span>
          ))}
        </div>

        {/* Scrollable Chart Area (Bergeser jika data terlalu banyak) */}
        <div className="flex-1 relative overflow-x-auto custom-scrollbar pb-2">
          
          {/* Background Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pb-8 pointer-events-none min-w-full">
            {yTicks.map((_, i) => (
              <div key={i} className="w-full border-t border-dashed border-surface-200"></div>
            ))}
          </div>

          {/* Bars Container */}
          <div className="absolute inset-0 flex items-end justify-around gap-2 sm:gap-4 px-2 pb-8 min-w-max">
            {data.map((item, i) => {
              // Minimum 2% agar bar dengan nilai Rp 0 tetap punya garis tipis
              const heightPercent = Math.max((Number(item.gross) / maxGross) * 100, 1.5); 
              
              // Formatting Label Tanggal
              const dateObj = new Date(item.date);
              const dateNum = dateObj.getDate();
              const monthShort = dateObj.toLocaleDateString('id-ID', { month: 'short' });

              // Logika Sumbu X: Jika data sebulan, tampilkan kelipatan 3 agar teks tidak tabrakan
              const showLabel = data.length <= 15 || i === 0 || i === data.length - 1 || i % 3 === 0;

              return (
                <div key={i} className="flex flex-col items-center justify-end h-full group relative cursor-pointer w-8 sm:w-10">
                  
                  {/* Tooltip Interaktif */}
                  <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out bg-neutral-900 text-white text-xs px-3 py-2.5 rounded-xl mb-1 whitespace-nowrap z-20 shadow-xl pointer-events-none transform translate-y-3 group-hover:translate-y-0">
                    <div className="font-bold text-neutral-300 text-center mb-1 text-[10px] uppercase tracking-wider">
                        {dateNum} {monthShort}
                    </div>
                    <div className="font-bold text-sm text-[#3AE2CE]">
                        Rp {Number(item.gross).toLocaleString('id-ID')}
                    </div>
                    {/* Segitiga Panah Bawah */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-neutral-900"></div>
                  </div>
                  
                  {/* Bar Grafik */}
                  <div 
                    className={cn(
                      "w-full bg-surface-200 rounded-t-md relative group-hover:bg-[#15423C] transition-all duration-500 ease-out",
                      "after:absolute after:inset-x-0 after:bottom-0 after:h-full after:bg-gradient-to-t after:from-black/10 after:to-transparent after:opacity-0 group-hover:after:opacity-100" // Efek gradient saat hover
                    )}
                    style={{ height: `${heightPercent}%` }}
                  ></div>

                  {/* X-Axis Label */}
                  <div className="absolute -bottom-6 text-[10px] font-bold text-neutral-400 whitespace-nowrap transition-colors group-hover:text-[#15423C]">
                     {showLabel ? dateNum : <span className="text-surface-300">•</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
