"use client";

import { TrendingUp, ShoppingBag, Users, AlertCircle } from "lucide-react";
import { cn } from "@/utils/cn";
import { DashboardStat } from "../services/dashboardService";

export default function StatCard({ stat }: { stat: DashboardStat }) {
  const isMoney = stat.type === "money";
  const isAlert = stat.type === "alert";

  const getIcon = () => {
    switch (stat.type) {
      case "money": return <TrendingUp size={20} />;
      case "order": return <ShoppingBag size={20} />;
      case "merchant": return <Users size={20} />;
      case "alert": return <AlertCircle size={20} />;
    }
  };

  return (
    <div className={cn(
      "p-6 rounded-2xl shadow-sm flex flex-col justify-between h-40 relative overflow-hidden group transition-all hover:-translate-y-1 hover:shadow-md border border-surface-200/50",
      isMoney ? "bg-primary-500 text-white" : "bg-surface-100 text-neutral-800",
      isAlert ? "bg-red-50 border border-red-100 text-red-900" : ""
    )}>
      
      {/* Header Card */}
      <div className="flex justify-between items-start">
        <div>
           <p className={cn(
             "text-[10px] font-bold uppercase tracking-widest mb-2",
             isMoney ? "text-white/70" : "text-neutral-400",
             isAlert ? "text-red-400" : ""
           )}>
             {stat.title}
           </p>
           <h3 className={cn(
             "text-2xl font-bold tracking-tight",
             isAlert ? "text-red-600" : ""
           )}>
             {stat.value}
           </h3>
        </div>

        {/* Icon Box */}
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm transition-transform group-hover:scale-110",
          isMoney ? "bg-white/20 text-white" : "bg-surface-50 text-neutral-500",
          isAlert ? "bg-white text-red-500 shadow-sm" : ""
        )}>
          {getIcon()}
        </div>
      </div>

      {/* Footer Trend */}
      <p className={cn(
        "text-xs font-medium mt-auto flex items-center gap-1",
        isMoney ? "text-white/90" : "text-neutral-500",
        isAlert ? "text-red-500" : ""
      )}>
        {stat.trend}
      </p>

    </div>
  );
}