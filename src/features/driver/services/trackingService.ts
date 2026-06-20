import api from '@/lib/axios';

export interface LocationPayload {
  order_id: number;
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
}

export const trackingService = {
  /**
   * Mengirim posisi driver ke backend secara periodik
   */
  updateLocation: async (data: LocationPayload) => {
    try {
      const response = await api.post('/v1/driver/location', data);
      return response.data;
    } catch (error) {
      console.error('Failed to update driver location:', error);
      throw error;
    }
  },
};
