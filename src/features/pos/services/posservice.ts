// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Order } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const posService = {
  /**
   * Helper untuk mengekstrak data dari response Laravel successResponse
   */
  async handleResponse(response: Response) {
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Terjadi kesalahan pada server");
    }
    // Jika result memiliki properti .data (standar successResponse), ambil itu. 
    // Jika tidak, asumsikan result adalah data itu sendiri.
    return result.data !== undefined ? result.data : result;
  },

  /**
   * Mengambil produk khusus untuk merchant
   */
  async getProducts() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/merchant/pos/products`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return this.handleResponse(response);
  },

  /**
   * Menyimpan transaksi POS
   */
  async createPosOrder(orderData: {
    items: any[];
    payment_method: "tunai" | "non-tunai";
    subtotal: number;
    tax: number;
    total_price: number;
    customer_name: string;
    status?: "pending" | "completed";
  }) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/merchant/pos/orders`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...orderData,
        delivery_address: orderData.customer_name, 
        status: orderData.status || "pending",
        paid_at: orderData.status === "completed" ? new Date().toISOString() : null,
      }),
    });
    return this.handleResponse(response);
  },

  /**
   * Mengambil daftar antrean aktif (Status Pending)
   */
    async getActiveOrders() {
      const token = localStorage.getItem('token');
      // Tambahkan parameter status agar dibaca oleh MerchantOrderController@index
      const response = await fetch(`${API_URL}/merchant/orders?status=pending`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const result = await this.handleResponse(response);
      
      // Safety check: Jika Laravel menggunakan paginate(), ambil result.data. 
      // Jika kita sudah merubahnya ke get() di backend, result biasanya langsung array.
      return Array.isArray(result) ? result : (result.data || []);
    },

  /**
   * Finalisasi Pembayaran
   */
  async completePayment(orderId: number, paymentMethod: "tunai" | "non-tunai") {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/merchant/pos/orders/${orderId}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ payment_method: paymentMethod }),
    });
    return this.handleResponse(response);
  },

  /**
   * Mengambil konfigurasi PPN (Mencegah error 404 configs)
   */
  async getConfigs() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/merchant/pos/configs`, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return this.handleResponse(response);
  }
};