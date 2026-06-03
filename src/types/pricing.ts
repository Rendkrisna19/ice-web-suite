export interface PricingConfig {
  basePrice: number;        // Backend: delivery_base_price
  baseDistance: number;     // Backend: delivery_base_distance
  pricePerKm: number;       // Backend: delivery_price_per_km
  serviceFee: number;       // Backend: platform_fee (opsional)
  taxPercentage: number;    // Backend: tax_percentage
}

export interface SimulationResult {
  simulation_input: {
    distance_km: number;
    subtotal: number;
  };
  calculation_breakdown: {
    base_price: number;
    base_distance_quota: string;
    extra_distance_charged: string;
    price_per_km: number;
    delivery_fee_result: number;
    tax_amount: number;
    grand_total: number;
  };
}