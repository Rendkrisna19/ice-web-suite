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
  const knownOrderIdsRef = useRef<Set<number>>(new Set());
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);

  // --- BACKGROUND KEEP-ALIVE HACK ---
  const SILENT_AUDIO = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

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

      let safeOrders: Order[] = [];
      if (Array.isArray(fetchedOrders)) {
          safeOrders = fetchedOrders;
      } else if (typeof fetchedOrders === 'object' && fetchedOrders !== null && 'data' in fetchedOrders) {
          safeOrders = (fetchedOrders as any).data;
      }

      let safeDrivers: Driver[] = [];
      if (Array.isArray(fetchedDrivers)) {
          safeDrivers = fetchedDrivers;
      } else if (typeof fetchedDrivers === 'object' && fetchedDrivers !== null && 'data' in fetchedDrivers) {
          safeDrivers = (fetchedDrivers as ApiResponse<Driver[]>).data;
      }

      const currentIds = knownOrderIdsRef.current;
      const newOrders = safeOrders.filter(o => !currentIds.has(o.id));

      if (isBackground && newOrders.length > 0) {
         // Cek apakah ada order dengan status pending/paid di dalam newOrders
         const incomingNewOrders = newOrders.filter(o => o.status === 'pending' || o.status === 'paid');
         
         if (incomingNewOrders.length > 0) {
             const latest = incomingNewOrders[0];
             setNewOrder(latest);
             
             // Trigger System Notification + Getar
             if ("Notification" in window && Notification.permission === "granted") {
               new Notification("Pesanan Baru Masuk!", {
                 body: `Order #${latest.order_number?.split('-').pop() || latest.id} senilai Rp ${(latest.total_price || latest.total_amount || 0).toLocaleString()}`,
                 icon: "/icons/icon-192x192.png",
                 vibrate: [200, 100, 200, 100, 500]
               } as NotificationOptions & { vibrate?: number[] });
             } else if (navigator.vibrate) {
               navigator.vibrate([200, 100, 200, 100, 500]);
             }
             
             // Play notification sound
             try {
               const notifAudio = document.getElementById('cashier-notif-audio') as HTMLAudioElement;
               if (notifAudio) {
                   notifAudio.currentTime = 0;
                   notifAudio.play().catch(e => console.log("Audio play blocked:", e));
               }
             } catch (e) {
               console.log("Audio initialization failed:", e);
             }
         }
      }

      setOrders(safeOrders);
      setDrivers(safeDrivers);
      knownOrderIdsRef.current = new Set(safeOrders.map(o => o.id));

    } catch (error) {
      console.error("Fetch error:", error); // Gunakan error agar tidak unused
      if (!isBackground) toast.error("Gagal memuat data pesanan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); 
    
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const startSilentAudio = () => {
      silentAudioRef.current?.play().catch(() => {});
      document.removeEventListener('click', startSilentAudio);
    };
    document.addEventListener('click', startSilentAudio);

    const intervalId = setInterval(() => {
        fetchData(true);
    }, 15000);
    return () => {
        clearInterval(intervalId);
        document.removeEventListener('click', startSilentAudio);
    };
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
      
      {/* BACKGROUND KEEP-ALIVE AUDIO ELEMENT */}
      <audio 
        ref={silentAudioRef} 
        src={SILENT_AUDIO} 
        loop 
        playsInline
        className="hidden" 
      />

      {/* NOTIFICATION AUDIO ELEMENT */}
      <audio id="cashier-notif-audio" src="/sounds/notification.mp3" preload="auto" className="hidden" />

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
