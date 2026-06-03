import api from "@/lib/axios";
import { AxiosError } from "axios";
// Pastikan tipe data Order sudah ada (bisa pakai tipe yang sama dengan merchant)
import { Order } from "@/types/merchant"; 

export const rejectedService = {
  getRejectedOrders: async (page = 1) => {
    try {
      // URL Baru
      const response = await api.get(`/admin/rejected-orders?page=${page}`);
      
      // Validasi struktur response pagination Laravel
      if (response.data && response.data.data) {
        return response.data.data; // Mengembalikan object { data: [], current_page: ... }
      }
      return null;

    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || "Gagal mengambil data reject.");
      }
      throw error;
    }
  }
};