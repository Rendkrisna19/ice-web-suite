import api from "@/lib/axios";
import { MenuItem, ProductListResponse } from "@/types/menu";

// PERBAIKAN DISINI:
// Hapus "/v1" di depan. Cukup "/products" saja.
const BASE_PATH = "/products"; 

export const productService = {
  getProducts: async (): Promise<MenuItem[]> => {
    // Hasil Akhir: http://localhost:8000/api/v1/products (BENAR)
    const response = await api.get<ProductListResponse>(BASE_PATH);
    
    // Pastikan struktur response Laravel Pagination benar
    // Laravel default: { data: { data: [...] } }
    // Jika API kamu me-return array langsung tanpa pagination, gunakan response.data.data saja.
    // Tapi kalau pakai paginate(), kode di bawah ini sudah benar:
    const rawData = response.data.data.data; 

    // Mapping: Mengubah format API agar cocok dengan UI
    return rawData.map((item) => ({
      id: item.id,
      name: item.name,
      price: parseFloat(item.price), // Convert "35000.00" ke 35000
      category: item.category,       // "Makanan" / "Minuman"
      image: item.image_url,
      description: item.description,
      isReady: true,                 // Default true
    }));
  },
};