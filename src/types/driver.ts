// src/types/driver.ts

export interface Driver {
  id: number; // Backend menggunakan ID number (Auto Increment)
  name: string;
  email: string;
  phone?: string;
  vehicle_type?: "motor" | "mobil"; // Backend mungkin menggunakan underscore
  plate_number?: string;
  is_online: boolean; // boolean 1/0
  is_busy: boolean;
  status?: "active" | "suspended" | "inactive";
  balance?: number;
  rating?: number;
  avatar?: string;
  outlet_id?: number;
}

export interface DriverPayload {
  name: string;
  email: string;
  password?: string;
  phone?: string; // Sesuai validasi backend
  vehicle_type?: string;
  plate_number?: string;
}
