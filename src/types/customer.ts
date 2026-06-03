export type CustomerStatus = "active" | "blocked";

export interface Customer {
  id: number; // Backend user ID (number)
  name: string;
  email: string;
  phone?: string; // Opsional di backend
  avatar?: string;
  created_at: string; // Tanggal join
  orders_count: number; // Jumlah order (dari withCount di Laravel)
  total_spent?: number; 
  status?: CustomerStatus; // Belum ada kolom status di table user, kita anggap semua active dulu atau tambah kolom nanti
}