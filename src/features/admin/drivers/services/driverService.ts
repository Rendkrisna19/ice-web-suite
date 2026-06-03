import api from "@/lib/axios";
import { Driver, DriverPayload } from "@/types/driver";

export const driverService = {
  // Update: Sekarang support Global Fetch
  getDrivers: async (outletId?: number): Promise<Driver[]> => {
    try {
      // Jika ada outletId, ambil spesifik cabang. Jika tidak, ambil SEMUA (Global).
      const url = outletId 
        ? `/admin/outlets/${outletId}/drivers` 
        : `/admin/drivers`; 
        
      const response = await api.get(url);
      return response.data.data;
    } catch (error) {
      console.error("Gagal mengambil data driver:", error);
      throw error;
    }
  },

  // ... (createDriver, updateDriver, deleteDriver TETAP SAMA) ...
  createDriver: async (outletId: number, payload: DriverPayload): Promise<Driver> => {
    try {
      const response = await api.post(`/admin/outlets/${outletId}/drivers`, payload);
      return response.data.data;
    } catch (error) {
      console.error("Gagal mendaftarkan driver:", error);
      throw error;
    }
  },
  
  updateDriver: async (driverId: number, payload: Partial<DriverPayload>): Promise<Driver> => {
    try {
      const response = await api.put(`/admin/drivers/${driverId}`, payload);
      return response.data.data;
    } catch (error) {
      console.error("Gagal update driver:", error);
      throw error;
    }
  },

  deleteDriver: async (driverId: number): Promise<void> => {
    try {
      await api.delete(`/admin/drivers/${driverId}`);
    } catch (error) {
      console.error("Gagal menghapus driver:", error);
      throw error;
    }
  }
};