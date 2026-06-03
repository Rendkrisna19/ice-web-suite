import api from "@/lib/axios";
import { MenuItem } from "@/types/menu";

export const menuService = {
  // 1. GET MENU (Tetap sama)
  getMenuByOutlet: async (outletId: number): Promise<MenuItem[]> => {
    try {
      const response = await api.get(`/admin/outlets/${outletId}/products`);
      return response.data.data;
    } catch (error) {
      console.error("[MenuService] Gagal mengambil menu:", error);
      throw error;
    }
  },

  // 2. CREATE GLOBAL MENU (PERBAIKAN DISINI)
  // Tidak butuh outletId lagi, karena ini Global Product
  createGlobalMenu: async (formData: FormData): Promise<MenuItem> => {
    try {
      // Endpoint Global: /admin/products
      const response = await api.post(`/admin/products`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    } catch (error) {
      console.error("[MenuService] Gagal membuat menu global:", error);
      throw error;
    }
  },

  // 3. UPDATE MENU (Tetap sama)
  updateMenu: async (productId: number, formData: FormData): Promise<MenuItem> => {
    try {
      const response = await api.post(`/admin/products/${productId}/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    } catch (error) {
      console.error("[MenuService] Gagal update menu:", error);
      throw error;
    }
  },

  // 4. TOGGLE STATUS (Tetap sama)
  toggleStatus: async (productId: number, currentStatus: boolean): Promise<MenuItem> => {
    try {
      const formData = new FormData();
      const newStatus = currentStatus ? "0" : "1";
      formData.append("is_available", newStatus);

      const response = await api.post(`/admin/products/${productId}/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    } catch (error) {
      console.error("[MenuService] Gagal mengubah status menu:", error);
      throw error;
    }
  },

  // 5. DELETE MENU (Tetap sama)
  deleteMenu: async (productId: number): Promise<void> => {
    try {
      await api.delete(`/admin/products/${productId}`);
    } catch (error) {
      console.error("[MenuService] Gagal menghapus menu:", error);
      throw error;
    }
  }
};
