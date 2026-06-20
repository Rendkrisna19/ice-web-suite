export interface DiningTable {
  id: number;
  outlet_id: number;
  name: string;
  capacity: number | null;
  qr_token: string;
  open_orders_count?: number;
  created_at?: string;
  updated_at?: string;
}
