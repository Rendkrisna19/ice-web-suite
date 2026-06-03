import type { Metadata } from "next";
import SettingsBoard from "@/features/settings/SettingsBoard";

export const metadata: Metadata = {
  title: "Pengaturan - Merchant POS",
  description: "Konfigurasi toko dan notifikasi.",
};

export default function MerchantSettingsPage() {
  return <SettingsBoard />;
}
