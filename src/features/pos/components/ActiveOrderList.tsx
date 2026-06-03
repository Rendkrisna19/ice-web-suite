import { User, Clock, ChevronRight } from "lucide-react";

export function ActiveOrderList({ orders, onSelect }: any) {
  return (
    <div className="grid gap-3">
      {orders.length === 0 ? (
        <p className="text-center text-neutral-400 py-10">Tidak ada pesanan aktif</p>
      ) : (
        orders.map((order: any) => (
          <div 
            key={order.id}
            onClick={() => onSelect(order)}
            className="bg-white p-4 rounded-2xl border border-surface-200 flex items-center justify-between hover:border-[#15423C] cursor-pointer transition-all shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-[#15423C]">
                <User size={20} />
              </div>
              <div>
                <h4 className="font-bold text-neutral-800">{order.delivery_address}</h4>
                <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-medium">
                  <Clock size={10} />
                  {new Date(order.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                  <span className="mx-1">•</span>
                  <span>{order.items_count || 0} Item</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <span className="text-sm font-black text-neutral-900">
                 Rp {Number(order.total_price).toLocaleString('id-ID')}
               </span>
               <ChevronRight size={18} className="text-neutral-300" />
            </div>
          </div>
        ))
      )}
    </div>
  );
}