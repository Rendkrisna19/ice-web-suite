import api from "@/lib/axios";

export const settingService = {
  getOperationalHours: async () => {
    const response = await api.get("/merchant/settings/operational-hours");
    return response.data.data;
  },

  updateOperationalHours: async (data: { opening_hour: string; closing_hour: string }) => {
    const response = await api.put("/merchant/settings/operational-hours", data);
    return response.data.data;
  }
};
