import api from "@/lib/axios";
import { Order, Driver } from "@/types";

export const merchantService = {
  getOrders: async (): Promise<Order[]> => {
    try {
      const response = await api.get("/merchant/orders");
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to fetch orders", error);
      throw error;
    }
  },

  getAvailableDrivers: async (): Promise<Driver[]> => {
    const response = await api.get("/merchant/drivers/available");
    return response.data.data || [];
  },

  updateStatus: async (orderId: number, status: string) => {
    const response = await api.post(`/merchant/orders/${orderId}/status`, { status });
    return response.data;
  },

  assignDriver: async (orderId: number, driverId: number) => {
    const response = await api.post(`/merchant/orders/${orderId}/assign`, { driver_id: driverId });
    return response.data;
  },

  rejectOrder: async (orderId: number, reason: string) => {
    const response = await api.post(`/merchant/orders/${orderId}/reject`, { reason });
    return response.data;
  },

  getOutletStatus: async () => {
    const response = await api.get("/merchant/outlet/status");
    return response.data.data || response.data;
  },

  toggleOutlet: async (isOpen: boolean) => {
    const response = await api.post("/merchant/outlet/toggle", { is_open: isOpen });
    return response.data;
  }
};
