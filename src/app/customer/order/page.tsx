import { Suspense } from "react"; // 1. Import Suspense
import CustomerOrderBoard from "@/features/orders/components/CustomerOrderBoard";
import { Loader2 } from "lucide-react";

export default function CustomerOrderPage() {
  return (
    // 2. Bungkus Component dengan Suspense
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center text-[#15423C]">
        <Loader2 className="animate-spin" size={40} />
      </div>
    }>
      <CustomerOrderBoard />
    </Suspense>
  );
}
