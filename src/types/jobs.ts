export interface DriverJobItem {
  menu_name: string;
  qty: number;
  note: string;
}

export interface DriverJob {
  id: number;
  transaction_id?: number; // Tambahkan jika belum ada
  customer_name: string;
  customer_phone: string;
  address: string;
  total_price: number;
  lat: number;
  lng: number;
  outlet_lat: number;
  outlet_lng: number;
  items: DriverJobItem[];
  status: 'ready' | 'on_delivery' | 'delivered' | 'completed';
  note?: string; // Catatan tambahan order
}

export interface DriverProfile {
  name: string;
  email: string;
  phone: string;
  plate_number: string;
  is_online: boolean;
  is_busy: boolean;
  completed_today: number;
  rating: number;
  join_date: string;
  wallet_balance: number; // Nanti diambil dari API wallet
  profile_image?: string;
}
