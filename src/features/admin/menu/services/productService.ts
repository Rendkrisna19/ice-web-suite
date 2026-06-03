import api from "@/lib/axios";
import { MenuItem, ProductListResponse } from "@/types/menu";

// PERBAIKAN DISINI:
// Hapus "/v1" di depan. Cukup "/products" saja.
const BASE_PATH = "/products"; 

export const productService = {
  getProducts: async (): Promise<MenuItem[]> => {
    // Hasil Akhir: https://linen-deer-529188.hostingersite.com/api/v1/products (BENAR)
    const response = await api.get<ProductListResponse>(BASE_PATH);
    
    // Pastikan struktur response Laravel Pagination benar
    // Laravel default: { data: { data: [...] } }
    // Jika API kamu me-return array langsung tanpa pagination, gunakan response.data.data saja.
    // Tapi kalau pakai paginate(), kode di bawah ini sudah benar:
    const rawData = response.data.data.data; 

    // Mapping: Mengubah format API agar cocok dengan UI
    return rawData.map((item) => ({
      id: item.id,
      outlet_id: item.outlet_id || 1, // Default or map if available
      name: item.name,
      price: parseFloat(item.price), 
      category: item.category,       
      image_url: item.image_url,
      description: item.description,
      is_available: item.is_available ?? true,                 
    }));
  },
};
