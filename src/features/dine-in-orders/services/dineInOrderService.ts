import api from "@/lib/axios";

export interface DineInOrderItem {
  id: number;
  product_name_snap: string;
  quantity: number;
  subtotal: number | string;
  variant_snap: { notes?: string } | null;
}

export interface DineInOrder {
  id: number;
  order_number: string;
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled";
  total_price: number | string;
  created_at: string;
  items: DineInOrderItem[];
  table: { id: number; name: string } | null;
}

export interface DineInKanban {
  pending: DineInOrder[];
  preparing: DineInOrder[];
  ready: DineInOrder[];
  completed: DineInOrder[];
}

export const dineInOrderService = {
  getKanban: async (): Promise<DineInKanban> => {
    const response = await api.get("/merchant/dine-in-orders/kanban");
    return response.data.data;
  },

  updateStatus: async (orderId: number, status: string) => {
    const response = await api.post(`/merchant/dine-in-orders/${orderId}/status`, { status });
    return response.data.data;
  },
};
