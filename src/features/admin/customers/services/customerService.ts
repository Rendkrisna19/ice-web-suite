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

  deleteCustomer: async (id: number): Promise<void> => {
    try {
      await api.delete(`/admin/customers/${id}`);
    } catch (error) {
      console.error("Gagal menghapus customer:", error);
      throw error;
    }
  },

  // Note: Fitur Block Customer belum ada di backend ManagementController kita tadi.
  // Jadi sementara kita handle di frontend saja atau tambah endpoint block nanti.
};