import api from "@/lib/axios";
import { LoginPayload, LoginResponse } from "@/types/auth";

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", payload);
    return response.data;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout API failed", error);
    }
  },

  getUser: async () => {
    const response = await api.get("/auth/user");
    return response.data;
  },
};
