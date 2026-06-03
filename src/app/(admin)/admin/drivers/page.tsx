import type { Metadata } from "next";
import DriverBoard from "@/features/admin/drivers/DriverBoard";

export const metadata: Metadata = {
  title: "Driver Management - Admin Panel",
  description: "Kelola armada kurir dan driver.",
};

export default function AdminDriversPage() {
  return <DriverBoard />;
}