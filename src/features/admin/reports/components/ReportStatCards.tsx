"use client";

import { TrendingUp, TrendingDown, Wallet, ShoppingBag, XCircle, Banknote, HandCoins, ChartNoAxesCombined, Boxes } from "lucide-react";
import { ReportStatUI } from "@/types/reports";
import { cn } from "@/utils/cn";

export default function ReportStatCards({ stats }: { stats: ReportStatUI[] }) {
  
  const getIcon = (type: string) => {
    switch (type) {
      case "money": return <Banknote size={20} />;
      case "order": return <ShoppingBag size={20} />;
      case "cancel": return <XCircle size={20} />;
      case "profit": return <Wallet size={20} />;
      case "cost": return <HandCoins size={20} />;
      case "margin": return <ChartNoAxesCombined size={20} />;
      case "items": return <Boxes size={20} />;
      default: return <Wallet size={20} />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-surface-200 flex flex-col justify-between h-36 relative overflow-hidden group">
          
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">{stat.label}</p>
              <h3 className="text-2xl font-bold text-neutral-800">{stat.value}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-50 flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform">
              {getIcon(stat.icon)}
            </div>
          </div>

          <div className="mt-auto flex items-center gap-2">
            {stat.trend ? (
              <>
                <span className={cn(
                  "flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full",
                  stat.isPositive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                )}>
                  {stat.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {stat.trend}
                </span>
                <span className="text-xs text-neutral-400 font-medium">vs periode lalu</span>
              </>
            ) : (
              <span className="text-xs text-neutral-400 font-medium">Tidak ada data pembanding</span>
            )}
          </div>

        </div>
      ))}
    </div>
  );
}