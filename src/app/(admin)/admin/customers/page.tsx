import type { Metadata } from "next";
import CustomerBoard from "@/features/admin/customers/CustomerBoard";

export const metadata: Metadata = {
  title: "Pelanggan - Admin Panel",
  description: "Kelola data pelanggan dan pengguna aplikasi.",
};

export default function AdminCustomersPage() {
  return <CustomerBoard />;
}
