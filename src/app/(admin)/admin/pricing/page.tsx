import type { Metadata } from "next";
import PricingBoard from "@/features/admin/pricing/PricingBoard";

export const metadata: Metadata = {
  title: "Global Pricing - Admin Panel",
  description: "Konfigurasi harga dan tarif aplikasi.",
};

export default function AdminPricingPage() {
  return <PricingBoard />;
}