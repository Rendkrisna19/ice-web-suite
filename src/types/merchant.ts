// src/types/merchant.ts

export interface OutletUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Outlet {
  id: number;
  name: string;
  slug: string;
  address: string;
  phone: string;
  whatsapp_number: string; // Bisa null di DB, tapi string di API JSON biasanya
  opening_hour: string;
  closing_hour: string;
  latitude: number | string;
  longitude: number | string;
  is_force_closed: boolean; // 0 atau 1 di DB, boolean di JSON response

  // --- TAMBAHAN BARU (MEDIA) ---
  logo: string | null;   // URL Logo
  banner: string | null; // URL Banner

  users?: OutletUser[];
  staffCount?: number;   // Opsional untuk UI (dihitung di frontend/backend)
  created_at?: string;
  updated_at?: string;
}

// Payload untuk Create/Update
export interface OutletPayload {
  name: string;
  slug: string;
  address: string;
  phone: string;
  whatsapp_number: string;
  opening_hour: string;
  closing_hour: string;
  latitude: number | string;
  longitude: number | string;
  is_force_closed: boolean;

  // --- TAMBAHAN BARU (UPLOAD) ---
  // Optional (?) karena saat update tidak wajib diganti
  // Tipe bisa File (saat upload) atau null
  logo?: File | null;
  banner?: File | null;
}

// Wrapper Response Standar Laravel
export interface OutletResponse {
  status: string;
  message: string;
  data: Outlet;
}

// Wrapper Response untuk List (Pagination)
export interface OutletListResponse {
  status: string;
  message: string;
  data: {
    current_page: number;
    data: Outlet[];
    total: number;
    last_page: number;
    per_page: number;
  };
}