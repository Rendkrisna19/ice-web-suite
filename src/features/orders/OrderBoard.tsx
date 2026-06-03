"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { BellRing, ChefHat, MapPin, Bike, Loader2, RefreshCw, CheckSquare } from "lucide-react";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { Order, Driver } from "@/types";
import { merchantService } from "./services/merchantService";

// Components
import POSHeader from "./components/POSHeader";
import POSSidebar from "./components/POSSidebar";
import OrderColumn from "./components/OrderColumn";
import RejectModal from "./components/RejectModal";
import IncomingOrderModal from "./components/IncomingOrderModal";
import ProofValidationModal from "./components/ProofValidationModal";

// Interface untuk response API jika dibungkus data
interface ApiResponse<T> {
  data: T;
}

export default function OrderBoard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [newOrder, setNewOrder] = useState<Order | null>(null);
  const prevOrderCountRef = useRef<number>(0);
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; orderId: number | null }>({
    isOpen: false,
    orderId: null,
  });
  
  const [validationModal, setValidationModal] = useState<{ isOpen: boolean; order: Order | null }>({
      isOpen: false,
      order: null
  });

  const fetchData = async (isBackground = false) => {
    try {
      if (!isBackground) setIsLoading(true);

      const [fetchedOrders, fetchedDrivers] = await Promise.all([
        merchantService.getOrders(),
        merchantService.getAvailableDrivers().catch(() => [])
      ]);

      // --- PERBAIKAN TIPE DATA (MENGHILANGKAN ANY) ---
      let safeOrders: Order[] = [];
      
      // Type Guard sederhana
      if (Array.isArray(fetchedOrders)) {
          safeOrders = fetchedOrders;
      } else if (typeof fetchedOrders === 'object' && fetchedOrders !== null && 'data' in fetchedOrders) {
          safeOrders = (fetchedOrders as any).data;
      } else {
          safeOrders = [];
      }

      let safeDrivers: Driver[] = [];
      // Lakukan hal yang sama untuk drivers jika perlu, atau casting sederhana jika yakin
      if (Array.isArray(fetchedDrivers)) {
          safeDrivers = fetchedDrivers;
      } else if (typeof fetchedDrivers === 'object' && fetchedDrivers !== null && 'data' in fetchedDrivers) {
          safeDrivers = (fetchedDrivers as ApiResponse<Driver[]>).data;
      }

      if (isBackground && safeOrders.length > prevOrderCountRef.current) {
         const latest = [...safeOrders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
         if (latest && (latest.status === 'pending' || latest.status === 'paid')) {
             setNewOrder(latest);
             
             // Play notification sound
             try {
               const audio = new Audio("/sounds/notification.mp3");
               audio.play().catch(e => console.log("Audio play failed (maybe blocked by browser):", e));
             } catch (e) {
               console.log("Audio initialization failed:", e);
             }
         }
      }

      setOrders(safeOrders);
      setDrivers(safeDrivers);
      prevOrderCountRef.current = safeOrders.length;

    } catch (error) {
      console.error("Fetch error:", error); // Gunakan error agar tidak unused
      if (!isBackground) toast.error("Gagal memuat data pesanan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); 
    const intervalId = setInterval(() => {
        fetchData(true);
    }, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const handleActionClick = async (orderId: number, action: string, payload?: number) => {
    if (action === "reject") {
      setRejectModal({ isOpen: true, orderId });
      return;
    }
    
    if (action === "validate_proof") {
        const targetOrder = Array.isArray(orders) ? orders.find(o => o.id === orderId) : null;
        if (targetOrder) {
            setValidationModal({ isOpen: true, order: targetOrder });
        }
        return;
    }

    const toastId = toast.loading("Memproses...");

    try {
      if (action === "accept") await merchantService.updateStatus(orderId, "preparing"); 
      else if (action === "ready") await merchantService.updateStatus(orderId, "ready");
      else if (action === "assign_driver" && payload) await merchantService.assignDriver(orderId, payload);

      await fetchData(true);  
      toast.success("Status berhasil diperbarui!", { id: toastId });

    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const msg = err.response?.data?.message || "Gagal memproses aksi";
      toast.error(msg, { id: toastId });
    }
  };

  const handleConfirmValidation = async (orderId: number) => {
      const toastId = toast.loading("Memvalidasi pengantaran...");
      try {
          await merchantService.updateStatus(orderId, "completed");
          setValidationModal({ isOpen: false, order: null });
          await fetchData(true);
          toast.success("Order Selesai! Saldo masuk.", { id: toastId });
      } catch (error) {
          console.error(error); // Log error
          toast.error("Gagal memvalidasi order", { id: toastId });
      }
  };

  const handleConfirmReject = async (reason: string) => {
    if (rejectModal.orderId) {
      const id = rejectModal.orderId;
      const toastId = toast.loading("Menolak pesanan...");
      try {
        await merchantService.rejectOrder(id, reason);
        setOrders(prev => Array.isArray(prev) ? prev.filter(o => o.id !== id) : []);
        toast.success(`Pesanan ditolak`, { id: toastId });
        setRejectModal({ isOpen: false, orderId: null });
      } catch (error) {
        console.error(error); // Log error
        toast.error("Gagal menolak pesanan", { id: toastId });
      }
    }
  };

  // --- PERBAIKAN DEPENDENCY ARRAY USEMEMO ---
  const safeOrdersList = Array.isArray(orders) ? orders : [];

  // Dependensi diganti dari [orders] menjadi [safeOrdersList]
  const incoming = useMemo(() => safeOrdersList.filter(o => o.status === "paid" || o.status === "pending"), [safeOrdersList]);
  const cooking = useMemo(() => safeOrdersList.filter(o => o.status === "preparing"), [safeOrdersList]);
  const ready = useMemo(() => safeOrdersList.filter(o => o.status === "ready"), [safeOrdersList]);
  const delivery = useMemo(() => safeOrdersList.filter(o => o.status === "on_delivery"), [safeOrdersList]);
  const delivered = useMemo(() => safeOrdersList.filter(o => o.status === "delivered"), [safeOrdersList]);

  if (isLoading && safeOrdersList.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface-200">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-surface-200 flex flex-col font-sans overflow-hidden">
      
      <POSSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <POSHeader onMenuClick={() => setIsSidebarOpen(true)} />

      <RejectModal 
        isOpen={rejectModal.isOpen} 
        onClose={() => setRejectModal({ isOpen: false, orderId: null })} 
        onConfirm={handleConfirmReject} 
      />
      
      <IncomingOrderModal 
        isOpen={!!newOrder}
        orderData={newOrder}
        onAccept={() => setNewOrder(null)} 
        onReject={() => setNewOrder(null)}
      />
      
      <ProofValidationModal 
        isOpen={validationModal.isOpen}
        order={validationModal.order}
        onClose={() => setValidationModal({ isOpen: false, order: null })}
        onValidate={handleConfirmValidation}
      />

      <main className="flex-1 overflow-x-auto overflow-y-hidden p-4 md:p-6 relative">
        <button 
          onClick={() => fetchData(false)} 
          className="absolute top-6 right-6 z-10 p-2.5 bg-white rounded-full shadow-sm hover:bg-surface-100 text-neutral-500 border border-surface-200 active:scale-95 transition-transform"
        >
          <RefreshCw size={20} />
        </button>

        <div className="flex gap-5 h-full w-full min-w-[1500px]">
          <OrderColumn 
            title="Baru Masuk" 
            orders={incoming} 
            variant="incoming"
            icon={<BellRing className="text-white"/>}
            accentColor="bg-primary-500"
            borderColor="border-primary-200"
            onAction={handleActionClick}
          />
          <OrderColumn 
            title="Dapur" 
            orders={cooking} 
            variant="cooking"
            icon={<ChefHat className="text-white"/>}
            accentColor="bg-warning-500"
            borderColor="border-warning-200"
            onAction={handleActionClick}
          />
          <OrderColumn 
            title="Siap Antar" 
            orders={ready} 
            variant="ready"
            drivers={drivers}
            icon={<MapPin className="text-white"/>}
            accentColor="bg-secondary-500"
            borderColor="border-secondary-200"
            onAction={handleActionClick}
          />
          <OrderColumn 
            title="Sedang Diantar" 
            orders={delivery} 
            variant="delivery"
            icon={<Bike className="text-white"/>}
            accentColor="bg-blue-500"
            borderColor="border-blue-200"
            onAction={handleActionClick}
          />
          <OrderColumn 
            title="Perlu Validasi" 
            orders={delivered} 
            variant="delivered"
            icon={<CheckSquare className="text-white"/>}
            accentColor="bg-purple-500"
            borderColor="border-purple-200"
            onAction={handleActionClick}
          />
        </div>
      </main>
    </div>
  );
}
