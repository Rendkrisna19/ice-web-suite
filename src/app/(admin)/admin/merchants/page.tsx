import type { Metadata } from "next";
import MerchantBoard from "@/features/admin/merchants/MerchantBoard";

export const metadata: Metadata = {
  title: "Merchant Management - Admin Panel",
  description: "Kelola daftar outlet dan cabang.",
};

export default function AdminMerchantsPage() {
  return <MerchantBoard />;
}