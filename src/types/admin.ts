// src/types/admin.ts

export interface DashboardStat {
  title: string;
  value: string;
  trend: string;
  type: "money" | "order" | "merchant" | "alert";
}

export interface ActivityLog {
  id: string;
  time: string;
  title: string;
  description: string;
  type: "success" | "warning" | "info" | "system";
}

export interface AdminMenuItem {
  label: string;
  href: string;
//   icon: any; // Lucide Icon Type
}

export interface RefundRequest {
  id: number;
  order_id?: string; // Optional jika id sama dengan order_id
  user_id: number;
  total_price: number; // Mapping dari amount
  status: string;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
  items?: any[];
}
export interface RefundListResponse {
  data: {
    current_page: number;
    data: RefundRequest[];
    total: number;
  };
}

export interface ProcessRefundPayload {
  refund_id: number;
  action: "approve" | "reject";
}
