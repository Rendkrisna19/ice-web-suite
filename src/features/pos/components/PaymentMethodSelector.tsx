import { Banknote, CreditCard } from "lucide-react";
import { cn } from "@/utils/cn";

export function PaymentMethodSelector({ activeMethod, onChange }: any) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button 
        onClick={() => onChange("tunai")}
        className={cn(
          "flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all",
          activeMethod === "tunai" ? "border-[#15423C] bg-emerald-50 text-[#15423C]" : "border-surface-200 text-neutral-400"
        )}
      >
        <Banknote size={20} />
        <span className="text-[10px] font-bold uppercase tracking-wider">Tunai</span>
      </button>
      <button 
        onClick={() => onChange("non-tunai")}
        className={cn(
          "flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all",
          activeMethod === "non-tunai" ? "border-[#15423C] bg-emerald-50 text-[#15423C]" : "border-surface-200 text-neutral-400"
        )}
      >
        <CreditCard size={20} />
        <span className="text-[10px] font-bold uppercase tracking-wider">Non-Tunai</span>
      </button>
    </div>
  );
}
