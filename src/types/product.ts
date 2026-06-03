export type ProductCategory = "makanan" | "minuman";

export interface MenuItem {
  id: number | string;
  outlet_id?: number;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  cost_price?: number | string | null;
  category: ProductCategory; // Kuncinya disini
  image_url: string;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}
