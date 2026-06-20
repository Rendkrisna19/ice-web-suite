import api from "@/lib/axios";
import { DiningTable } from "@/types/table";

interface TableFormData {
  name: string;
  capacity?: number | null;
}

export interface TableBill {
  orders: {
    id: number;
    order_number: string;
    total_price: number | string;
    created_at: string;
    items: { id: number; product_name_snap: string; quantity: number; subtotal: number | string }[];
  }[];
  total: number;
}

export const tableService = {
  getTables: async (): Promise<DiningTable[]> => {
    const response = await api.get("/merchant/tables");
    return response.data.data;
  },

  createTable: async (data: TableFormData): Promise<DiningTable> => {
    const response = await api.post("/merchant/tables", data);
    return response.data.data;
  },

  updateTable: async (id: number, data: TableFormData): Promise<DiningTable> => {
    const response = await api.put(`/merchant/tables/${id}`, data);
    return response.data.data;
  },

  deleteTable: async (id: number): Promise<void> => {
    await api.delete(`/merchant/tables/${id}`);
  },

  regenerateQr: async (id: number): Promise<DiningTable> => {
    const response = await api.post(`/merchant/tables/${id}/regenerate-qr`);
    return response.data.data;
  },

  getBill: async (id: number): Promise<TableBill> => {
    const response = await api.get(`/merchant/tables/${id}/bill`);
    return response.data.data;
  },

  closeBill: async (id: number): Promise<void> => {
    await api.post(`/merchant/tables/${id}/close-bill`);
  },
};
