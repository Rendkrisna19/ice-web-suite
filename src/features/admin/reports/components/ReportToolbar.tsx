// src/features/admin/reports/components/ReportToolbar.tsx
"use client";

import { useState } from "react";
import { Calendar, Download, ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";
import { Outlet } from "@/types/merchant";
import { OutletFilterValue } from "@/types/reports";

interface ReportToolbarProps {
  onExportExcel: () => void;
  onExportPdf: () => void;
  onDateChange: (start: string, end: string, label: string) => void;
  onOutletChange: (outletId: OutletFilterValue) => void;
  dateLabel: string;
  selectedOutletId: OutletFilterValue;
  outlets: Outlet[];
  isExportingExcel?: boolean;
  isExportingPdf?: boolean;
}

export default function ReportToolbar({ 
  onExportExcel, 
  onExportPdf, 
  onDateChange, 
  onOutletChange,
  dateLabel,
  selectedOutletId,
  outlets,
  isExportingExcel,
  isExportingPdf
}: ReportToolbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Helper untuk mendapatkan format YYYY-MM-DD
  const getFormattedDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleFilterClick = (type: string, label: string) => {
    const today = new Date();
    let start = "";
    let end = getFormattedDate(today);

    if (type === "today") {
      start = end;
    } else if (type === "this_week") {
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 7);
      start = getFormattedDate(lastWeek);
    } else if (type === "this_month") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      start = getFormattedDate(firstDay);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      end = getFormattedDate(lastDay);
    }

    onDateChange(start, end, label);
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 relative">
       
       {/* Date Filter */}
       <div className="flex items-center bg-white border border-surface-200 rounded-xl p-1 pr-4 shadow-sm w-full sm:w-auto relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-surface-50 rounded-lg text-sm font-bold text-neutral-700 hover:bg-surface-100 transition-colors"
          >
             <Calendar size={16} />
             <span>{dateLabel}</span>
             <ChevronDown size={14} className="text-neutral-400" />
          </button>
          <span className="ml-3 text-xs font-medium text-neutral-400">Periode Aktif</span>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-surface-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <button onClick={() => handleFilterClick("today", "Hari Ini")} className="w-full text-left px-4 py-3 text-sm hover:bg-surface-50 transition-colors font-medium">Hari Ini</button>
                <button onClick={() => handleFilterClick("this_week", "7 Hari Terakhir")} className="w-full text-left px-4 py-3 text-sm hover:bg-surface-50 transition-colors font-medium">7 Hari Terakhir</button>
                <button onClick={() => handleFilterClick("this_month", "Bulan Ini")} className="w-full text-left px-4 py-3 text-sm hover:bg-surface-50 transition-colors font-medium border-t border-surface-100">Bulan Ini</button>
            </div>
          )}
       </div>

       {/* Counter Filter */}
       <div className="w-full sm:w-auto">
          <select
            value={selectedOutletId.toString()}
            onChange={(e) => {
              const value = e.target.value;
              onOutletChange(value === "all" ? "all" : Number(value));
            }}
            className="w-full sm:w-[220px] h-[44px] px-3 rounded-xl border border-surface-200 bg-white text-sm font-medium text-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#15423C]/20"
          >
            <option value="all">Semua Counter</option>
            {outlets.map((outlet) => (
              <option key={outlet.id} value={outlet.id}>
                {outlet.name}
              </option>
            ))}
          </select>
       </div>

       {/* Actions */}
       <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className={cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-surface-200 text-neutral-600 px-6 py-3 rounded-xl text-sm font-bold hover:bg-surface-50 transition-colors shadow-sm",
                isExportingPdf && "opacity-50 cursor-not-allowed"
            )}
          >
             <Download size={18} />
             <span>{isExportingPdf ? "Memproses..." : "Unduh PDF"}</span>
          </button>
          <button 
            onClick={onExportExcel}
            disabled={isExportingExcel}
            className={cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#15423C] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#1A534B] transition-colors shadow-lg shadow-[#15423C]/20 active:scale-95",
                isExportingExcel && "opacity-70 cursor-not-allowed"
            )}
          >
             <Download size={18} />
             <span>{isExportingExcel ? "Memproses..." : "Export Excel"}</span>
          </button>
       </div>

    </div>
  );
}