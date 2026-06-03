import { CheckCircle2, AlertTriangle, Info, RotateCcw } from "lucide-react";
import { cn } from "@/utils/cn";
import { ActivityLog } from "../services/dashboardService";

export default function ActivityList({ logs }: { logs: ActivityLog[] }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm h-full">
      <h3 className="font-bold text-lg text-neutral-800 mb-6">Aktivitas Terbaru</h3>
      
      {logs.length > 0 ? (
        <div className="space-y-0 relative">
          {/* Vertical Line */}
          <div className="absolute left-4 top-2 bottom-6 w-0.5 bg-surface-100"></div>
          {logs.map((log) => (
            <ActivityItem key={log.id} log={log} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 text-neutral-400 text-sm">
          Belum ada aktivitas hari ini.
        </div>
      )}
    </div>
  );
}

function ActivityItem({ log }: { log: ActivityLog }) {
  // Menambahkan style 'danger' untuk order refund
  const styles = {
    success: { bg: "bg-green-50", text: "text-green-600", icon: <CheckCircle2 size={16} /> },
    warning: { bg: "bg-orange-50", text: "text-orange-600", icon: <AlertTriangle size={16} /> },
    danger: { bg: "bg-red-50", text: "text-red-600", icon: <AlertTriangle size={16} /> },
    info: { bg: "bg-blue-50", text: "text-blue-600", icon: <Info size={16} /> },
    system: { bg: "bg-neutral-100", text: "text-neutral-600", icon: <RotateCcw size={16} /> },
  };
  
  // Fallback jika tipe tidak dikenal
  const style = styles[log.type] || styles.system;

  return (
    <div className="flex gap-4 items-start relative pb-6 last:pb-0 group cursor-pointer hover:bg-surface-50/50 p-2 rounded-lg -ml-2 transition-colors">
      <div className={cn("relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm shrink-0", style.bg, style.text)}>
        {style.icon}
      </div>
      <div className="flex-1 pt-0.5">
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-sm font-bold text-neutral-800 group-hover:text-primary-600 transition-colors">{log.title}</h4>
          <span className="text-[10px] font-mono text-neutral-400 bg-surface-100 px-1.5 py-0.5 rounded">{log.time}</span>
        </div>
        <p className="text-xs text-neutral-500 leading-relaxed">{log.description}</p>
      </div>
    </div>
  );
}
