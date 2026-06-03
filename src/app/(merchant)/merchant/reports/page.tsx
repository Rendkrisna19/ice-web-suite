import type { Metadata } from "next";
import ReportBoard from "@/features/reports/ReportBoard";

export const metadata: Metadata = {
  title: "Laporan Penjualan - Merchant POS",
  description: "Ringkasan transaksi harian dan performa outlet.",
};

export default function MerchantReportsPage() {
  return <ReportBoard />;
}