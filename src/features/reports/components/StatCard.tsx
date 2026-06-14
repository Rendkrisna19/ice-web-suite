"use client";

import { cn } from "@/utils/cn";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  bgClass: string;
  titleClass?: string;
  valueClass?: string;
}

export default function StatCard({ title, value, icon, bgClass, titleClass, valueClass }: StatCardProps) {
  return (
    <div className={cn(
      "p-6 rounded-2xl shadow-lg shadow-black/5 text-white relative overflow-hidden group border border-white/10 transition-transform duration-300 hover:-translate-y-1",
      bgClass
    )}>
      {/* Content */}
      <div className="relative z-10">
        <p className={cn("text-white/80 text-xs font-bold uppercase tracking-wider mb-2", titleClass)}>
          {title}
        </p>
        <h3 className={cn("text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-sm break-words leading-tight", valueClass)}>
          {value}
        </h3>
      </div>
      
      {/* Icon Bubble */}
      <div className="absolute right-4 top-4 bg-white/20 p-3 rounded-2xl backdrop-blur-md shadow-inner border border-white/20 group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>

      {/* Decorative Blur */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors duration-500"></div>
    </div>
  );
}
