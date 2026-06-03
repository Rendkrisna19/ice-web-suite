// types/order.types.ts

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

export interface OrderItem {
  id: number;
  product_name_snap: string;
  quantity: number;
  subtotal: number;
  variant_snap?: Record<string, string> | null;
}

export interface Driver {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  is_online: boolean;
  is_busy: boolean;
}

export type OrderStatus = 
  | 'paid' 
  | 'cooking' 
  | 'preparing' 
  | 'ready' 
  | 'on_delivery' 
  | 'completed' 
  |   

export interface Order {
  id: number;
  order_number: string;
  customer: Customer;
  items: OrderItem[]; 
  total_price: number;
  status: OrderStatus;
  created_at: string;
  driver_id?: number | null;
  driver?: Driver | null;
  delivery_address: string;
  delivery_latitude?: number | null;
  delivery_longitude?: number | null;
  distance_real?: number | null;
}

export interface Outlet {
  id: number;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  opening_hour: string;
  closing_hour: string;
  is_force_closed: boolean;
  is_currently_open: boolean;
  opening_hour_str?: string;
  closing_hour_str?: string;
}

export interface OutletStatusResponse {
  id: number;
  name: string;
  address: string;
  opening_hour: string;
  closing_hour: string;
  is_force_closed: boolean;
  is_currently_open: boolean;
  opening_hour_str: string;
  closing_hour_str: string;
}
