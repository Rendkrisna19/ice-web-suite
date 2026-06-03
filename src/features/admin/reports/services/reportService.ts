// src/features/admin/reports/services/reportService.ts

import api from "@/lib/axios";
import { AnalyticsResponse, OutletFilterValue } from "@/types/reports";

export const reportService = {
  getAnalytics: async (startDate?: string, endDate?: string, outletId?: OutletFilterValue): Promise<AnalyticsResponse> => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (outletId !== undefined) params.append("outlet_id", outletId.toString());

      const response = await api.get(`/admin/analytics?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error("Gagal mengambil data laporan:", error);
      throw error;
    }
  },

  exportExcel: async (startDate?: string, endDate?: string, outletId?: OutletFilterValue): Promise<Blob> => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    if (outletId !== undefined) params.append("outlet_id", outletId.toString());

    // Menggunakan responseType: 'blob' sangat penting untuk file download
    const response = await api.get(`/admin/analytics/export/excel?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  exportPdf: async (startDate?: string, endDate?: string, outletId?: OutletFilterValue): Promise<Blob> => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    if (outletId !== undefined) params.append("outlet_id", outletId.toString());

    const response = await api.get(`/admin/analytics/export/pdf?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
