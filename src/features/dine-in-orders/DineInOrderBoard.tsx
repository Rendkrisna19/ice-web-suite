"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { BellRing, ChefHat, Soup, CheckCheck, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { dineInOrderService, DineInOrder, DineInKanban } from "./services/dineInOrderService";
import { useSound } from "@/context/SoundContext";

import POSHeader from "../orders/components/POSHeader";
import POSSidebar from "../orders/components/POSSidebar";
import DineInOrderColumn from "./components/DineInOrderColumn";

const EMPTY_KANBAN: DineInKanban = { pending: [], preparing: [], ready: [], completed: [] };

export default function DineInOrderBoard() {
  const { playOnce } = useSound();
  const [kanban, setKanban] = useState<DineInKanban>(EMPTY_KANBAN);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const knownOrderIdsRef = useRef<Set<number>>(new Set());

  const fetchData = async (isBackground = false) => {
    try {
      if (!isBackground) setIsLoading(true);
      const data = await dineInOrderService.getKanban();

      const allOrders = [...data.pending, ...data.preparing, ...data.ready, ...data.completed];
      const currentIds = knownOrderIdsRef.current;
      const newOrders = allOrders.filter((o) => !currentIds.has(o.id));

      if (isBackground && newOrders.length > 0) {
        const incomingNewOrders = newOrders.filter((o) => o.status === "pending");
        if (incomingNewOrders.length > 0) {
          const latest = incomingNewOrders[0];
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Pesanan Meja Baru Masuk!", {
              body: `${latest.table?.name || "Meja"} - Order #${latest.order_number?.split("-").pop()} senilai Rp ${Number(latest.total_price).toLocaleString()}`,
              icon: "/icons/icon-192x192.png",
            });
          }
          try { playOnce(); } catch { /* noop */ }
        }
      }

      setKanban(data);
      knownOrderIdsRef.current = new Set(allOrders.map((o) => o.id));
    } catch {
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

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchData(true);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const intervalId = setInterval(() => fetchData(true), 15000);
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleAction = async (orderId: number, status: string) => {
    const toastId = toast.loading("Memproses...");
    try {
      await dineInOrderService.updateStatus(orderId, status);
      await fetchData(true);
      toast.success("Status berhasil diperbarui!", { id: toastId });
    } catch {
      toast.error("Gagal memproses aksi", { id: toastId });
    }
  };

  if (isLoading) {
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

      <main className="flex-1 overflow-x-auto overflow-y-hidden p-4 md:p-6 relative">
        <button
          onClick={() => fetchData(false)}
          className="absolute top-6 right-6 z-10 p-2.5 bg-white rounded-full shadow-sm hover:bg-surface-100 text-neutral-500 border border-surface-200 active:scale-95 transition-transform"
        >
          <RefreshCw size={20} />
        </button>

        <div className="flex gap-5 h-full w-full min-w-[1280px]">
          <DineInOrderColumn
            title="Baru Masuk"
            orders={kanban.pending}
            variant="pending"
            icon={<BellRing className="text-white" />}
            accentColor="bg-primary-500"
            borderColor="border-primary-200"
            onAction={handleAction}
          />
          <DineInOrderColumn
            title="Diproses"
            orders={kanban.preparing}
            variant="preparing"
            icon={<ChefHat className="text-white" />}
            accentColor="bg-warning-500"
            borderColor="border-warning-200"
            onAction={handleAction}
          />
          <DineInOrderColumn
            title="Siap Disajikan"
            orders={kanban.ready}
            variant="ready"
            icon={<Soup className="text-white" />}
            accentColor="bg-secondary-500"
            borderColor="border-secondary-200"
            onAction={handleAction}
          />
          <DineInOrderColumn
            title="Selesai"
            orders={kanban.completed}
            variant="completed"
            icon={<CheckCheck className="text-white" />}
            accentColor="bg-emerald-500"
            borderColor="border-emerald-200"
            onAction={handleAction}
          />
        </div>
      </main>
    </div>
  );
}
