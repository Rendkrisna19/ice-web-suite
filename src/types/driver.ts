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
  wallet_balance?: number; // Real balance from backend (field: wallet_balance)
  balance?: number; // Legacy alias (frontend-only)
  rating?: number;
  profile_image?: string; // Backend returns profile_image URL
  avatar?: string; // Frontend-only fallback
  outlet_id?: number;
  outlet?: { id: number; name: string }; // Backend eager-loaded outlet
  completed_deliveries?: number; // Computed by backend
}

export interface DriverPayload {
  name: string;
  email: string;
  password?: string;
  phone?: string; // Sesuai validasi backend
  vehicle_type?: string;
  plate_number?: string;
}
