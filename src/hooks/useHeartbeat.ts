import { useEffect } from "react";
// Nanti kita ganti dengan import { merchantService } saat API ready
// import { merchantService } from "@/features/merchant/services/merchantService";

export const useHeartbeat = (isActive: boolean) => {
  useEffect(() => {
    if (!isActive) return;

    // Fungsi ping ke server
    const sendPulse = async () => {
      try {
        console.log("💓 Heartbeat sent...");
        // await merchantService.sendHeartbeat(); // Integrasi API nanti
      } catch (error) {
        console.error("Heartbeat failed", error);
      }
    };

    // Kirim pertama kali saat mount
    sendPulse();

    // Setup Interval 30 Detik
    const intervalId = setInterval(sendPulse, 30000);

    // Cleanup saat unmount
    return () => clearInterval(intervalId);
  }, [isActive]);
};