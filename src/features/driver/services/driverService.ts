import api from "@/lib/axios";
import { DriverJob, DriverProfile } from "@/types/jobs";

// --- Interfaces untuk Type Safety ---
interface ApiOrderItem {
  product_name?: string;
  name?: string;
  quantity: number;
  note?: string;
}

interface ApiOrder {
  id: number;
  transaction_id?: string | number; // Ditambahkan agar tidak error saat mapping
  customer: { name: string; phone: string };
  delivery_address: string;
  total_price: string | number;
  delivery_latitude: string | number;
  delivery_longitude: string | number;
  status: 'ready' | 'on_delivery' | 'delivered' | 'completed';
  notes: string;
  items: ApiOrderItem[];
}

// Interface Payload
interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export const driverService = {
  changePassword: async (payload: ChangePasswordPayload) => {
    try {
      const response = await api.post("/driver/change-password", payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getDriverProfile: async (): Promise<DriverProfile> => {
    try {
      const response = await api.get("/driver/status");
      const data = response.data.data; 
      return {
        name: data.name,
        email: data.email,
        phone: data.phone || "-",
        plate_number: data.plate_number || "-",
        is_online: Boolean(data.is_online),
        is_busy: Boolean(data.is_busy),
        completed_today: data.completed_today || 0,
        rating: Number(data.rating) || 5.0,
        join_date: data.join_date || new Date().getFullYear().toString(),
        wallet_balance: Number(data.wallet_balance) || 0,
        profile_image: data.profile_image
      };
    } catch (error) {
      console.error("Service Error: Gagal ambil profil driver", error);
      throw error;
    }
  },

  clockIn: async () => {
    const response = await api.post("/driver/clock-in");
    return response.data;
  },

  clockOut: async () => {
    const response = await api.post("/driver/clock-out");
    return response.data;
  },

  // --- ORDER MANAGEMENT ---
  // Berubah menjadi getActiveJobs (jamak) dan me-return Array of DriverJob
  getActiveJobs: async (): Promise<DriverJob[]> => {
    try {
      const response = await api.get("/driver/orders/active");
      // Pastikan response.data.data adalah array, jika objek bungkus ke array
      const raw = response?.data?.data;
      const orders = Array.isArray(raw) ? raw : raw ? [raw] : [];
      return orders.map((order: ApiOrder) => ({
        id: order.id,
        transaction_id: order.transaction_id ? Number(order.transaction_id) : order.id, 
        customer_name: order.customer?.name || "Pelanggan",
        customer_phone: order.customer?.phone || "-",
        address: order.delivery_address,
        total_price: Number(order.total_price),
        lat: Number(order.delivery_latitude) || 0,
        lng: Number(order.delivery_longitude) || 0,
        outlet_lat: Number((order as any).outlet_latitude) || 0,
        outlet_lng: Number((order as any).outlet_longitude) || 0,
        status: order.status,
        note: order.notes || "",
        payment_method: (order as any).payment_method || 'cod',
        payment_status: (order as any).payment_status || 'unpaid',
        items: (order.items || []).map((item: ApiOrderItem) => ({
          menu_name: item.product_name || item.name || "Item Menu", 
          qty: item.quantity,
          note: item.note || ""
        }))
      }));
    } catch (err) {
      console.error("Service Error: Gagal ambil active jobs", err);
      // Return array kosong jika error agar UI tidak crash
      return [];
    }
  },

  startDelivery: async (orderId: number) => {
    const response = await api.post(`/driver/orders/${orderId}/start`);
    return response.data.data;
  },

  completeDelivery: async (orderId: number, photoFile: File) => {
    const formData = new FormData();
    formData.append("proof_image", photoFile);
    
    const response = await api.post(`/driver/orders/${orderId}/complete`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  }
};
