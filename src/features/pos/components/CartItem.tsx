import { Minus, Plus, Trash2 } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CartItem({ item, onUpdateQty, onRemove }: any) {
  return (
    <div className="flex flex-col gap-2 p-3 bg-surface-50 rounded-lg border border-surface-100">
      <div className="flex justify-between items-start">
        <span className="text-xs font-bold text-neutral-800 flex-1">{item.name}</span>
        <button onClick={() => onRemove(item.id)} className="text-neutral-400 hover:text-red-500">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-neutral-500">
          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
        </span>
        <div className="flex items-center gap-2 bg-white border border-surface-200 rounded-md px-1.5 py-0.5">
          <button onClick={() => onUpdateQty(item.id, -1)} className="text-primary-600"><Minus size={12}/></button>
          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
          <button onClick={() => onUpdateQty(item.id, 1)} className="text-primary-600"><Plus size={12}/></button>
        </div>
      </div>
    </div>
  );
}