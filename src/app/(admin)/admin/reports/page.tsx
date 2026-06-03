import type { Metadata } from "next";
import ReportBoard from "@/features/admin/reports/ReportBoard";

export const metadata: Metadata = {
  title: "Reports - Admin Panel",
  description: "Laporan keuangan dan statistik aplikasi.",
};

export default function AdminReportsPage() {
  return <ReportBoard />;
}
