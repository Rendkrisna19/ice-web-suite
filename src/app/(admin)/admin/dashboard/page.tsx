import type { Metadata } from "next";
import DashboardBoard from "@/features/admin/dashboard/DashboardBoard";

export const metadata: Metadata = {
  title: "Dashboard - Admin Panel",
  description: "Ringkasan statistik dan aktivitas aplikasi.",
};

export default function AdminDashboardPage() {
  return <DashboardBoard />;
}
