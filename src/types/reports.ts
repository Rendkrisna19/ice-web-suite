export interface ReportSummary {
  revenue: { value: number; growth: number };
  net_income: { value: number; growth: number };
  orders: { value: number; growth: number };
  refund: { value: number; growth: number };
  gross_sales: { value: number; growth: number };
  cogs: { value: number; growth: number };
  gross_profit: { value: number; growth: number };
  gross_margin_percent: { value: number; growth: number | null };
  total_items_sold: { value: number; growth: number | null };
}

export interface UnitEconomics {
  gross_sales: number;
  cogs: number;
  gross_profit: number;
  gross_margin_percent: number;
  app_fee_income: number;
  combined_income: number;
  total_items_sold: number;
}

export interface AppliedFilters {
  start_date: string;
  end_date: string;
  outlet_id: number | null;
  outlet_mode: "single_outlet" | "all_outlets";
}

export interface ChartDataPoint {
  date: string;
  gross: number;
  net: number;
  gross_sales?: number;
  cogs?: number;
  gross_profit?: number;
}

export interface RecentTransaction {
  id: number;
  order_number?: string; // Backend mungkin kirim order_number
  created_at?: string;
  total_price: number;
  delivery_fee: number;
  tax: number;
  app_fee_est?: number;
  gross_sales_est?: number;
  cogs_est?: number;
  gross_profit_est?: number;
  status: string;
  user?: { name: string };
  outlet?: { name: string };
}

export interface AnalyticsResponse {
  summary: ReportSummary;
  unit_economics?: UnitEconomics;
  applied_filters?: AppliedFilters;
  chart: ChartDataPoint[];
  recent_orders: RecentTransaction[];
}

export type OutletFilterValue = number | "all";

// Tipe untuk UI Stat Card (Mapping dari Summary)
export interface ReportStatUI {
  label: string;
  value: string;
  trend?: string;
  isPositive?: boolean;
  icon: "money" | "wallet" | "order" | "cancel" | "profit" | "cost" | "margin" | "items";
}
