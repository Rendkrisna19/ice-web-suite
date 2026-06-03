import api from "@/lib/axios";

export interface DailyReportSummary {
  date: string;
  total_revenue: number;
  total_modal: number;
  net_profit: number;
  total_delivery_fee: number;
  total_orders: number;
  completed_orders: number;
  success_percentage: number;
}

export interface TransactionReport {
  id: number;
  time: string;
  customer_name?: string;
  order_number?: string;
  summary: string;
  total: number | string; // Total bayar customer
  revenue: number;
  modal: number;
  net_profit: number;
  delivery_fee: number;
  driver_name: string;
  status: string;
}

export interface DailyReportResponse {
  summary: DailyReportSummary;
  transactions: TransactionReport[];
}

export const reportService = {
  getDailyReport: async (date?: string): Promise<DailyReportResponse> => {
    const url = date ? `/merchant/reports/daily?date=${date}` : `/merchant/reports/daily`;
    const response = await api.get(url);
    return response.data.data;
  },

  downloadExcel: async (date: string) => {
    const response = await api.get(`/merchant/reports/daily/excel?date=${date}`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_${date}.xlsx`); 
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  downloadPdf: async (date: string) => {
    const response = await api.get(`/merchant/reports/daily/pdf?date=${date}`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_${date}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
