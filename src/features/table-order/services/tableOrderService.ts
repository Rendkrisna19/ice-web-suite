import publicApi from "@/lib/publicApi";

export interface DineInProduct {
  id: number;
  name: string;
  price: number | string;
  category: string;
  image_url: string;
  description?: string | null;
  is_available: boolean;
}

export interface DineInOrderItem {
  id: number;
  product_id: number;
  quantity: number;
  product_name_snap: string;
  product_price_snap: number | string;
  variant_snap: { notes?: string } | null;
  subtotal: number | string;
}

export interface DineInOrder {
  id: number;
  order_number: string;
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled";
  subtotal: number | string;
  tax: number | string;
  total_price: number | string;
  created_at: string;
  paid_at: string | null;
  items: DineInOrderItem[];
}

export interface TableMenuResponse {
  table: { id: number; name: string };
  outlet: { id: number; name: string };
  products: DineInProduct[];
}

export const tableOrderService = {
  getMenu: async (token: string): Promise<TableMenuResponse> => {
    const response = await publicApi.get(`/table-order/${token}`);
    return response.data.data;
  },

  placeOrder: async (
    token: string,
    items: { product_id: number; quantity: number; notes?: string }[]
  ): Promise<DineInOrder> => {
    const response = await publicApi.post(`/table-order/${token}/orders`, { items });
    return response.data.data;
  },

  // Daftar pesanan yang masih berjalan di meja ini, digabung dari SEMUA device yang scan QR yang sama
  getOrders: async (token: string): Promise<DineInOrder[]> => {
    const response = await publicApi.get(`/table-order/${token}/orders`);
    return response.data.data;
  },
};
