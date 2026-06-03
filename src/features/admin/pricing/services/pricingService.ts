import api from "@/lib/axios";
import { PricingConfig, SimulationResult } from "@/types/pricing";

export const pricingService = {
  // GET CONFIG
  getConfig: async (): Promise<PricingConfig> => {
    try {
      const response = await api.get("/admin/pricing");
      const data = response.data.data;
      
      // Mapping Backend (snake_case) -> Frontend (camelCase)
      return {
        basePrice: data.delivery_base_price,
        baseDistance: data.delivery_base_distance,
        pricePerKm: data.delivery_price_per_km,
        serviceFee: data.platform_fee || 0,
        taxPercentage: data.tax_percentage
      };
    } catch (error) {
      console.error("Gagal mengambil konfigurasi harga:", error);
      throw error;
    }
  },

  // UPDATE CONFIG
  updateConfig: async (config: PricingConfig): Promise<PricingConfig> => {
    try {
      // Mapping Frontend -> Backend
      const payload = {
        delivery_base_price: config.basePrice,
        delivery_base_distance: config.baseDistance,
        delivery_price_per_km: config.pricePerKm,
        platform_fee: config.serviceFee,
        tax_percentage: config.taxPercentage
      };

      const response = await api.put("/admin/pricing", payload);
      const data = response.data.data;
      
      return {
        basePrice: data.delivery_base_price,
        baseDistance: data.delivery_base_distance,
        pricePerKm: data.delivery_price_per_km,
        serviceFee: data.platform_fee || 0,
        taxPercentage: data.tax_percentage
      };
    } catch (error) {
      console.error("Gagal update konfigurasi harga:", error);
      throw error;
    }
  },

  // SIMULATE PRICE (Opsional: Bisa hitung di frontend saja untuk instant preview, 
  // tapi kalau mau akurat sesuai rumus backend, pakai ini)
  simulatePrice: async (distance: number, subtotal: number = 0): Promise<SimulationResult> => {
    try {
      const response = await api.post("/admin/pricing/simulate", {
        distance: distance,
        subtotal: subtotal
      });
      return response.data.data;
    } catch (error) {
      console.error("Gagal simulasi harga:", error);
      throw error;
    }
  }
};
