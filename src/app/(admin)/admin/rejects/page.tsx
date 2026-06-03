import type { Metadata } from "next";
import RejectedOrdersBoard from "@/features/admin/reject-center/RejectedOrdersBoard";

export const metadata: Metadata = {
  title: "Refund Center - Admin Panel",
  description: "Kelola pengajuan pengembalian dana.",
};

export default function AdminRefundsPage() {
  return <RejectedOrdersBoard />;
}
