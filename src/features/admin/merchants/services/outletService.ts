import api from "@/lib/axios";
import { Outlet } from "@/types/merchant";

export const outletService = {
  getOutlets: async (): Promise<Outlet[]> => {
    const response = await api.get("/admin/outlets");
    const responseData = response.data.data;
    
    if (responseData && Array.isArray(responseData.data)) {
      return responseData.data;
    }
    if (Array.isArray(responseData)) {
        return responseData;
    }
    return [];
  },

  createOutlet: async (payload: FormData): Promise<Outlet> => {
    const response = await api.post("/admin/outlets", payload);
    return response.data.data;
  },

  updateOutlet: async (id: number, payload: FormData): Promise<Outlet> => {
    payload.append("_method", "PUT"); 
    const response = await api.post(`/admin/outlets/${id}`, payload);
    return response.data.data;
  },

  deleteOutlet: async (id: number): Promise<void> => {
    await api.delete(`/admin/outlets/${id}`);
  }
};
