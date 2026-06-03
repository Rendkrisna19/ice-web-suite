import api from "@/lib/axios";

// UPDATE INTERFACE SESUAI JSON API KAMU
export interface Outlet {
  id: number;
  name: string;
  address: string;
  image_url: string | null; // Di JSON tidak ada, tapi kita biarkan nullable
  is_force_closed: boolean | number; // JSON pakai ini, bukan is_open
  opening_hour: string;
  closing_hour: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
  description: string;
  pivot?: {
    is_available: number;
    custom_price?: number;
  };
}

export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
}

export const customerSimulatorService = {
  
  authenticate: async (): Promise<boolean> => {
    try {
      const response = await api.post("/auth/login", {
        email: "customer1@example.com",
        password: "password123",
        role: "customer"
      });
      
      const data = response.data.data || response.data;
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  // --- PERBAIKAN DISINI ---
  getAllOutlets: async (): Promise<Outlet[]> => {
    const response = await api.get("/outlets"); 
    
    // JSON kamu: { data: { current_page: 1, data: [...] } }
    // Jadi kita butuh masuk ke .data.data
    // Cek apakah response berupa pagination atau array langsung
    const responseData = response.data.data;
    
    if (Array.isArray(responseData)) {
        return responseData;
    } else if (responseData && Array.isArray(responseData.data)) {
        return responseData.data; // Ambil array dari dalam pagination
    }
    
    return [];
  },

  getOutletProducts: async (outletId: number): Promise<Product[]> => {
    const response = await api.get(`/customer/outlets/${outletId}/products`);
    return response.data.data;
  },

  createOrder: async (outletId: number, items: CartItem[], address: string) => {
    const payload = {
      outlet_id: outletId,
      delivery_address: address,
      delivery_latitude: -6.200000, 
      delivery_longitude: 106.816666,
      distance_real: 2.5,
      items: items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        variant_snap: [] 
      }))
    };

    const response = await api.post("/customer/orders", payload);
    return response.data;
  }
};
