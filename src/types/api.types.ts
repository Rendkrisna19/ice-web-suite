// types/api.types.ts

import { Order, Driver, OutletStatusResponse } from './order.types';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface OrdersResponse {
  data: Order[];
}

export interface DriversResponse {
  data: Driver[];
}

export interface UpdateStatusRequest {
  status: string;
}

export interface AssignDriverRequest {
  driver_id: number;
}

export interface RejectOrderRequest {
  reason: string;
}

export interface OrderFromAPI {
  id: number;
  order_number: string;
  customer: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    id: number;
    product_name_snap: string;
    quantity: number;
    subtotal: string | number;
    variant_snap?: Record<string, string> | null;
  }>;
  total_price: string | number;
  status: string;
  created_at: string;
  driver_id?: number | null;
  driver?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    is_online: boolean;
    is_busy: boolean;
  } | null;
  delivery_address: string;
  delivery_latitude?: number | null;
  delivery_longitude?: number | null;
  distance_real?: number | null;
}
