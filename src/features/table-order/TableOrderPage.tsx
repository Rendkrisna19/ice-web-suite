"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Loader2, ShoppingCart, Search, Coffee, Utensils, X, Plus, Minus, Store, ClipboardList, CheckCircle2, Clock, ChefHat, Soup } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/utils/cn";
import { ProductCard } from "@/features/pos/components/ProductCard";
import { tableOrderService, DineInProduct, DineInOrder, TableMenuResponse } from "./services/tableOrderService";

interface CartLine {
  product: DineInProduct;
  quantity: number;
}

type ViewTab = "menu" | "orders";
type CategoryFilter = "all" | "makanan" | "minuman";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

const STATUS_LABEL: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: "Menunggu Konfirmasi", icon: Clock, color: "bg-amber-50 text-amber-700 border-amber-200" },
  preparing: { label: "Sedang Diproses", icon: ChefHat, color: "bg-orange-50 text-orange-700 border-orange-200" },
  ready: { label: "Siap Disajikan", icon: Soup, color: "bg-blue-50 text-blue-700 border-blue-200" },
  completed: { label: "Selesai", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Dibatalkan", icon: X, color: "bg-red-50 text-red-700 border-red-200" },
};

export default function TableOrderPage({ token }: { token: string }) {
  const [menu, setMenu] = useState<TableMenuResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [tab, setTab] = useState<ViewTab>("menu");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [myOrders, setMyOrders] = useState<DineInOrder[]>([]);

  const loadMenu = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await tableOrderService.getMenu(token);
      setMenu(data);
      setLoadError(null);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403) setLoadError(err.response?.data?.message || "Maaf, toko sedang tutup.");
      else if (status === 404) setLoadError("Meja tidak ditemukan. Coba scan ulang QR code.");
      else setLoadError("Gagal memuat menu. Periksa koneksi internet Anda.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  // Daftar pesanan meja ini, digabung dari SEMUA device yang scan QR yang sama (bukan cuma device sendiri)
  const refreshMyOrders = useCallback(async () => {
    try {
      const orders = await tableOrderService.getOrders(token);
      setMyOrders(orders);
    } catch {
      // Diamkan saat polling gagal sesaat (mis. jaringan blip) - coba lagi di interval berikutnya
    }
  }, [token]);

  useEffect(() => {
    refreshMyOrders();
    const interval = setInterval(refreshMyOrders, 5000);
    return () => clearInterval(interval);
  }, [refreshMyOrders]);

  const filteredProducts = useMemo(() => {
    if (!menu) return [];
    let result = menu.products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (category !== "all") result = result.filter((p) => p.category?.toLowerCase() === category);
    return result;
  }, [menu, search, category]);

  const addToCart = (product: DineInProduct) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) => (l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(`${product.name} ditambahkan`, { duration: 1200 });
  };

  const updateQty = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) => (l.product.id === productId ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0)
    );
  };

  const cartTotal = useMemo(() => cart.reduce((sum, l) => sum + Number(l.product.price) * l.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, l) => sum + l.quantity, 0), [cart]);

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const order = await tableOrderService.placeOrder(
        token,
        cart.map((l) => ({ product_id: l.product.id, quantity: l.quantity }))
      );
      setMyOrders((prev) => [order, ...prev]);
      setCart([]);
      setIsCartOpen(false);
      setTab("orders");
      toast.success("Pesanan berhasil dikirim ke dapur!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal mengirim pesanan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 gap-3">
        <Loader2 className="animate-spin text-[#15423C]" size={40} />
        <p className="text-sm text-neutral-500 font-medium">Memuat menu...</p>
      </div>
    );
  }

  if (loadError || !menu) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 p-6 text-center gap-3">
        <Store size={48} className="text-neutral-300" />
        <h2 className="text-lg font-bold text-neutral-700">{loadError}</h2>
        <button
          onClick={loadMenu}
          className="mt-2 px-5 py-2.5 bg-[#15423C] text-white rounded-xl font-bold text-sm active:scale-95 transition-all"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 pb-28">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-[#15423C] text-white px-4 py-4 shadow-md">
        <div className="flex items-center gap-2">
          <Store size={18} className="text-emerald-300" />
          <h1 className="font-black text-lg truncate">{menu.outlet.name}</h1>
        </div>
        <p className="text-emerald-200 text-xs font-semibold mt-0.5">{menu.table.name}</p>

        <div className="flex bg-black/20 p-1 rounded-xl mt-3">
          <button
            onClick={() => setTab("menu")}
            className={cn(
              "flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all",
              tab === "menu" ? "bg-white text-[#15423C] shadow-sm" : "text-white/80"
            )}
          >
            Menu
          </button>
          <button
            onClick={() => setTab("orders")}
            className={cn(
              "flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
              tab === "orders" ? "bg-white text-[#15423C] shadow-sm" : "text-white/80"
            )}
          >
            <ClipboardList size={14} /> Pesanan Saya
            {myOrders.length > 0 && (
              <span className="bg-red-500 text-white px-1.5 rounded-full text-[10px] leading-none">{myOrders.length}</span>
            )}
          </button>
        </div>
      </header>

      {tab === "menu" ? (
        <main className="p-4">
          <div className="flex flex-col gap-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari menu..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-[#15423C] focus:ring-2 focus:ring-[#15423C]/10"
              />
            </div>
            <div className="flex items-center bg-white border border-neutral-200 rounded-xl p-1 w-fit">
              <button onClick={() => setCategory("all")} className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", category === "all" ? "bg-[#15423C] text-white" : "text-neutral-500")}>Semua</button>
              <button onClick={() => setCategory("makanan")} className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5", category === "makanan" ? "bg-[#15423C] text-white" : "text-neutral-500")}><Utensils size={12} /> Makanan</button>
              <button onClick={() => setCategory("minuman")} className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5", category === "minuman" ? "bg-[#15423C] text-white" : "text-neutral-500")}><Coffee size={12} /> Minuman</button>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
              <Utensils size={48} className="mb-3 opacity-20" />
              <p className="font-bold text-sm">Menu tidak ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={addToCart} />
              ))}
            </div>
          )}
        </main>
      ) : (
        <main className="p-4 space-y-3">
          {myOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
              <ClipboardList size={48} className="mb-3 opacity-20" />
              <p className="font-bold text-sm">Belum ada pesanan</p>
              <p className="text-xs mt-1">Pesanan yang kamu buat akan muncul di sini</p>
            </div>
          ) : (
            myOrders.map((order) => {
              const statusInfo = STATUS_LABEL[order.status] || STATUS_LABEL.pending;
              const StatusIcon = statusInfo.icon;
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-surface-200 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-neutral-400">#{order.order_number?.split("-").pop()}</span>
                    <span className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border", statusInfo.color)}>
                      <StatusIcon size={12} /> {statusInfo.label}
                    </span>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-neutral-600">{item.quantity}x {item.product_name_snap}</span>
                        <span className="font-medium text-neutral-700">{formatCurrency(Number(item.subtotal))}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between pt-2 border-t border-dashed border-neutral-200 font-black text-[#15423C]">
                    <span>Total</span>
                    <span>{formatCurrency(Number(order.total_price))}</span>
                  </div>
                </div>
              );
            })
          )}
        </main>
      )}

      {/* BOTTOM CART BAR */}
      {tab === "menu" && cartCount > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-4 left-4 right-4 z-40 bg-[#15423C] text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart size={22} />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold">{cartCount}</span>
            </div>
            <span className="font-bold text-sm">Lihat Keranjang</span>
          </div>
          <span className="font-black">{formatCurrency(cartTotal)}</span>
        </button>
      )}

      {/* CART SHEET */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end" onClick={() => setIsCartOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white w-full rounded-t-3xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between p-4 border-b border-surface-100">
              <h3 className="font-black text-neutral-800">Keranjang Pesanan</h3>
              <button onClick={() => setIsCartOpen(false)} className="p-1.5 bg-surface-100 rounded-full"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map((line) => (
                <div key={line.product.id} className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-neutral-800 truncate">{line.product.name}</p>
                    <p className="text-xs text-neutral-500">{formatCurrency(Number(line.product.price))}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-surface-50 rounded-full border border-surface-200 px-1">
                    <button onClick={() => updateQty(line.product.id, -1)} className="p-1.5 text-neutral-600"><Minus size={14} /></button>
                    <span className="font-bold text-sm w-5 text-center">{line.quantity}</span>
                    <button onClick={() => updateQty(line.product.id, 1)} className="p-1.5 text-neutral-600"><Plus size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-surface-100">
              <div className="flex justify-between font-black text-lg text-[#15423C] mb-3">
                <span>Total</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting || cart.length === 0}
                className="w-full py-3.5 bg-[#15423C] text-white rounded-2xl font-black flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <ChefHat size={20} />}
                Pesan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
