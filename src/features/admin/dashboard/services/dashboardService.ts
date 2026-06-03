// src/features/admin/dashboard/services/dashboardService.ts

import api from "@/lib/axios";

export interface DashboardResponse {
  cards: {
    revenue: { value: number; growth: number; label: string };
    orders: { value: number; label: string };
    outlets: { active: number; total: number; label: string };
    rejected: { count: number; label: string }; // <-- UBAH INI
  };
  chart: { time: string; count: number }[];
  recent_activities: ActivityLog[];
}

export interface ActivityLog {
  id: number;
  time: string;
  title: string;
  description: string;
  type: "success" | "warning" | "info" | "system" | "danger";
}

export interface DashboardStat {
  title: string;
  value: string;
  trend: string;
  type: "money" | "order" | "merchant" | "alert";
}

export const dashboardService = {
  getOverview: async (): Promise<DashboardResponse> => {
    try {
      const response = await api.get("/admin/dashboard");
      return response.data.data;
    } catch (error) {
      console.error("Gagal memuat data dashboard:", error);
      throw error;
    }
  },
};