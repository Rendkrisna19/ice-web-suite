import api from "@/lib/axios";
import { Customer } from "@/types/customer";

export const customerService = {
  getCustomers: async (): Promise<Customer[]> => {
    try {
      const response = await api.get("/admin/customers");
      return response.data.data;
    } catch (error) {
      console.error("Gagal mengambil data customer:", error);
      throw error;
    }
  },

  toggleBlock: async (id: number): Promise<Customer> => {
    try {
      const response = await api.post(`/admin/customers/${id}/toggle-block`);
      return response.data.data;
    } catch (error) {
      console.error("Gagal toggle block customer:", error);
      throw error;
    }
  },

  deleteCustomer: async (id: number): Promise<void> => {
    try {
      await api.delete(`/admin/customers/${id}`);
    } catch (error) {
      console.error("Gagal menghapus customer:", error);
      throw error;
    }
  },
};
