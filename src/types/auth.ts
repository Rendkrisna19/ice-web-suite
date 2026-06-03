// src/types/auth.ts

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "cashier" | "driver" | "customer"; // Sesuaikan dengan role di database
  outlet_id?: number;
  is_online?: boolean;
}

export interface LoginResponse {
  status: string;
  message?: string;
  data?: {
    token: string;
    user: User;
  };
  // Fallback jika backend tidak pakai wrapper 'data'
  token?: string;
  user?: User;
}

export interface LoginPayload {
  email?: string;
  password?: string;
}
