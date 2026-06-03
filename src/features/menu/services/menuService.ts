import api from "@/lib/axios";
import { MenuItem, ProductCategory } from "@/types/product";

interface ProductFormData {
  name: string;
  price: string;
  cost_price?: string | number;
  category: string; // "makanan" | "minuman"
  description?: string;
  image?: File | null;
  is_available?: boolean | number;
}

export const menuService = {
  // Get All Products
  getProducts: async (): Promise<MenuItem[]> => {
    const response = await api.get("/merchant/products");
    return response.data.data;
  },

  // Create Product
  createProduct: async (data: ProductFormData): Promise<MenuItem> => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("price", data.price);
    if (data.cost_price !== undefined) formData.append("cost_price", String(data.cost_price));
    formData.append("category", data.category);
    
    if (data.description) formData.append("description", data.description);
    if (data.image) formData.append("image", data.image);
    if (data.is_available !== undefined) formData.append("is_available", String(data.is_available));

    const response = await api.post("/merchant/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  // Update Product (Edit)
  updateProduct: async (id: string | number, data: ProductFormData): Promise<MenuItem> => {
    const formData = new FormData();
    // Backend hanya support POST untuk update, tanpa _method
    formData.append("name", data.name);
    formData.append("price", data.price);
    if (data.cost_price !== undefined) formData.append("cost_price", String(data.cost_price));
    formData.append("category", data.category);
    if (data.is_available !== undefined) formData.append("is_available", String(data.is_available));
    if (data.description) formData.append("description", data.description);
    if (data.image) formData.append("image", data.image); // Hanya dikirim jika user ganti foto

    const response = await api.post(`/merchant/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  // Delete Product (Hapus)
  deleteProduct: async (id: string | number): Promise<void> => {
    await api.delete(`/merchant/products/${id}`);
  },

  // Toggle Status
  toggleStatus: async (id: string | number): Promise<{ is_available: boolean }> => {
    const response = await api.post(`/merchant/products/${id}/toggle`);
    return response.data.data;
  }
};
