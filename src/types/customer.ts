export type CustomerStatus = "active" | "blocked";

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  profile_image?: string;
  created_at: string;
  orders_count: number;
  total_spent?: number;
  status: CustomerStatus;
}
