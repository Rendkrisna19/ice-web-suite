import type { Metadata } from "next";
import MenuBoard from "@/features/admin/menu/MenuBoard";

export const metadata: Metadata = {
  title: "Menu Management - Admin Panel",
  description: "Kelola daftar menu makanan dan minuman.",
};

export default function AdminMenusPage() {
  return <MenuBoard />;
}