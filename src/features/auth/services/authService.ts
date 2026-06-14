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

  requestRegisterOtp: async (email: string): Promise<{ email: string; expires_at: string }> => {
    const response = await api.post("/auth/register/request-otp", { email });
    return response.data.data;
  },

  register: async (payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    otp: string;
    phone?: string;
  }): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/register/verify-otp", {
      ...payload,
      role: "customer",
    });
    return response.data;
  },
};
