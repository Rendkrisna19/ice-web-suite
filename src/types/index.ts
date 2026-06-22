export type OrderStatus = 'paid' | 'preparing' | 'ready' | 'on_delivery' | 'completed' | 'cancelled';

export interface OrderItem {
  id: number;
  product_name_snap: string;
  quantity: number;
  subtotal: number;
  variant_snap: { notes?: string } | null;
}

export interface Customer {
  id: number;
  name: string;
  phone?: string;
}

export interface Driver {
  id: number;
  name: string;
  email: string;
  phone?: string;
  plate_number?: string;
  is_online: boolean;
  is_busy: boolean;
  rating?: number;
}

// ... type Order dll

export interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'paid' | 'preparing' | 'ready' | 'on_delivery' | 'delivered' | 'completed' | 'cancelled';
  total_price: number | string;
  created_at: string;
  updated_at?: string;
  delivery_address: string;
  
  // Relasi
  items: OrderItem[];
  customer?: Customer;
  driver?: Driver; // <-- Pastikan ini ada
  
  // Kolom Baru (Delivery)
  proof_of_delivery?: string | null; // <-- PENTING
  delivered_at?: string | null;      // <-- PENTING
  picked_up_at?: string | null;

  // Payment
  payment_method?: 'cod' | 'online';
  payment_status?: 'unpaid' | 'paid' | 'failed';
}

export interface OrderItem {
  id: number;
  product_name_snap: string;
  quantity: number;
  product_price_snap: number;
  note?: string;
}
