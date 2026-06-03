export type MenuCategory = "makanan" | "minuman";

export interface MenuItem {
  id: number;
  outlet_id: number;
  name: string;
  price: number;
  cost_price?: number | string | null;
  category: MenuCategory;
  image_url: string | null;
  description?: string;
  is_available: boolean | number;
}

export interface ProductListResponse {
  data: {
    data: any[];
  };
}
