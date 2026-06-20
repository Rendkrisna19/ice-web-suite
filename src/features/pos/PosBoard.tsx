"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ShoppingCart, Search, Monitor, Loader2, RefreshCw, Menu,
  User, ChefHat, Printer, CreditCard, Clock,
  Calendar, ChevronLeft, ChevronRight, Receipt, Coffee, Utensils, CheckCircle2, X, Store, Armchair
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/utils/cn";

import { ProductCard } from "./components/ProductCard";
import { CartItem } from "./components/CartItem";
import POSSidebar from "../orders/components/POSSidebar";
import { posService } from "./services/posservice";
import { authService } from "@/features/auth/services/authService";
import { tableService } from "@/features/tables/services/tableService";

type PosTab = "katalog" | "antrean";
type QueueTab = "aktif" | "riwayat";
type FilterDate = "all" | "today" | "month";
type CategoryFilter = "all" | "makanan" | "minuman";

// Satu baris antrean: 1 transaksi POS manual, ATAU 1 meja dine-in (bisa berisi beberapa tiket dapur yang digabung jadi 1 tagihan)
interface QueueRow {
  kind: "pos" | "dine_in";
  key: string;
  displayName: string;
  created_at: string;
  total_price: number;
  itemCount: number;
  tableId?: number;
  orders: any[];
}

function buildQueueRows(orders: any[]): QueueRow[] {
  const posRows: QueueRow[] = orders
    .filter((o) => o.order_type !== "dine_in")
    .map((o) => ({
      kind: "pos",
      key: `pos-${o.id}`,
      displayName: o.delivery_address || "Pelanggan POS",
      created_at: o.created_at,
      total_price: Number(o.total_price || 0),
      itemCount: o.items?.length || 0,
      orders: [o],
    }));

  // Group dine-in per meja + batch pembayaran (paid_at sama = dibayar dalam 1 aksi "Tutup & Bayar")
  const groups = new Map<string, any[]>();
  orders.filter((o) => o.order_type === "dine_in").forEach((o) => {
    const tableId = o.table_id || o.table?.id;
    if (!tableId) return;
    const groupKey = `${tableId}|${o.paid_at || "open"}`;
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey)!.push(o);
  });

  const dineInRows: QueueRow[] = Array.from(groups.values()).map((ords) => {
    const sorted = [...ords].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const tableId = sorted[0].table_id || sorted[0].table?.id;
    return {
      kind: "dine_in",
      key: `table-${tableId}-${sorted[0].paid_at || "open"}`,
      displayName: sorted[0].table?.name || `Meja #${tableId}`,
      created_at: sorted[0].created_at,
      total_price: ords.reduce((sum, o) => sum + Number(o.total_price || 0), 0),
      itemCount: ords.reduce((sum, o) => sum + (o.items?.length || 0), 0),
      tableId,
      orders: sorted,
    };
  });

  return [...posRows, ...dineInRows].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// Bentuk 1 objek "order" gabungan supaya bisa dipakai apa adanya oleh template struk yang sudah ada
function toReceiptOrder(row: QueueRow) {
  if (row.kind === "pos") return row.orders[0];
  const items = row.orders.flatMap((o) => o.items || []);
  return {
    id: row.orders[0].id,
    order_number: `MEJA-${row.displayName}`,
    delivery_address: row.displayName,
    items,
    subtotal: row.orders.reduce((sum, o) => sum + Number(o.subtotal || 0), 0),
    tax: row.orders.reduce((sum, o) => sum + Number(o.tax || 0), 0),
    total_price: row.total_price,
    created_at: row.created_at,
    status: row.orders[0].status,
  };
}

export default function PosBoard() {
  // --- STATE UTAMA ---
  const [activeTab, setActiveTab] = useState<PosTab>("katalog");
  const [queueTab, setQueueTab] = useState<QueueTab>("aktif"); 
  
  const [products, setProducts] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [historyOrders, setHistoryOrders] = useState<any[]>([]); 
  
  const [cart, setCart] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [taxConfig, setTaxConfig] = useState(11); 
  const [outletInfo, setOutletInfo] = useState<any>(null);

  // --- UI & UX STATE ---
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all"); 
  
  const [queueSearch, setQueueSearch] = useState("");
  // Antrean aktif default "all" supaya pesanan baru langsung kelihatan tanpa harus ganti filter
  // Riwayat default "today"
  const [activeDateFilter, setActiveDateFilter] = useState<FilterDate>("all");
  const [historyDateFilter, setHistoryDateFilter] = useState<FilterDate>("today");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // --- PRINT STATE ---
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isKitchenPrint, setIsKitchenPrint] = useState(false);
  const [isKitchenModalOpen, setIsKitchenModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // --- FETCH DATA (STRICT & BACKGROUND REFRESH) ---
  const fetchData = async (backgroundRefresh = false) => {
    try {
      if (!backgroundRefresh) setIsLoading(true);
      
      const [prodData, orderData, configData, userData] = await Promise.all([
        posService.getProducts(),
        posService.getActiveOrders(), 
        posService.getConfigs(),
        authService.getUser()
      ]);

      const fetchedProducts = Array.isArray(prodData) ? prodData : (prodData.data || []);
      const allOrders = Array.isArray(orderData) ? orderData : (orderData.data || []);

      // Tampilkan transaksi yang ditangani langsung kasir: POS manual + pesanan meja (dine-in)
      const fetchedOrders = allOrders.filter((o: any) => o.order_type === 'pos' || o.order_type === 'dine_in');

      setProducts(fetchedProducts);
      setTaxConfig(Number(configData.tax_percentage || configData.data?.tax_percentage || 11));

      if (userData?.data?.outlet) {
        setOutletInfo(userData.data.outlet);
      } else if (userData?.outlet) {
        setOutletInfo(userData.outlet);
      }

      // Acuan utama: belum ada paid_at = masih harus dibayar (berlaku sama utk POS & dine-in)
      setActiveOrders(fetchedOrders.filter((o: any) => !o.paid_at && o.status !== 'cancelled'));

      // Tambahkan ke riwayat jika belum ada (mencegah duplikasi data optimistik)
      const fetchedHistory = fetchedOrders.filter((o: any) => !!o.paid_at);
      setHistoryOrders(prev => {
        const newHistory = [...prev];
        fetchedHistory.forEach((fo: any) => {
          if (!newHistory.find(ho => ho.id === fo.id)) newHistory.push(fo);
        });
        return newHistory;
      });

    } catch (error) {
      if (!backgroundRefresh) toast.error("Gagal menarik data terbaru.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Antrean ditampilkan per "baris": 1 transaksi POS, atau 1 meja dine-in (tiket-tiketnya digabung)
  const activeQueueRows = useMemo(() => buildQueueRows(activeOrders), [activeOrders]);
  const historyQueueRows = useMemo(() => buildQueueRows(historyOrders), [historyOrders]);

  // --- LOGIC KERANJANG & KATALOG ---
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (categoryFilter !== "all") result = result.filter(p => p.category?.toLowerCase() === categoryFilter);
    return result.sort((a, b) => {
      const catA = a.category?.toLowerCase() || "";
      const catB = b.category?.toLowerCase() || "";
      if (catA === "minuman" && catB !== "minuman") return -1;
      if (catA !== "minuman" && catB === "minuman") return 1;
      return 0; 
    });
  }, [products, searchQuery, categoryFilter]);

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
  const taxAmount = (subtotal * taxConfig) / 100;
  const total = subtotal + taxAmount;

  const addToCart = (product: any) => setCart(prev => prev.find(i => i.id === product.id) ? prev.map(i => i.id === product.id ? {...i, quantity: i.quantity + 1} : i) : [...prev, {...product, quantity: 1}]);
  const updateCartQty = (id: number, delta: number) => setCart(prev => prev.map(it => it.id === id ? { ...it, quantity: Math.max(1, it.quantity + delta) } : it));
  const removeFromCart = (id: number) => setCart(cart.filter(it => it.id !== id));

  // --- FUNGSI TRIGGER PRINT ---
  const triggerPrint = (shouldResetCart = false, shouldRefreshData = false) => {
    toast.dismiss(); 
    setTimeout(() => {
      window.print();
      if (shouldResetCart) {
        setCart([]);
        setCustomerName("");
      }
      if (shouldRefreshData) {
        fetchData(true); 
      }
    }, 400); 
  };

  // --- HANDLER: KIRIM KE DAPUR ---
  const handleSendToKitchen = async () => {
    if (!customerName || cart.length === 0) return toast.error("Isi nama pelanggan & pilih menu!");
    const tid = toast.loading("Mengirim pesanan...");
    
    // Simpan snapshot cart & kalkulasi SEBELUM reset
    const cartSnapshot = [...cart];
    const subtotalSnap = cartSnapshot.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const taxSnap = (subtotalSnap * taxConfig) / 100;
    const totalSnap = subtotalSnap + taxSnap;
    const customerSnap = customerName;

    try {
      const response = await posService.createPosOrder({
        items: cartSnapshot,
        customer_name: customerSnap,
        payment_method: "tunai",
        subtotal: subtotalSnap,
        tax: taxSnap,
        total_price: totalSnap,
        status: "pending"
      });

      toast.success("Terkirim ke Dapur!", { id: tid });

      // posService sudah mengekstrak .data dari response Laravel, jadi response IS the order
      const serverOrder = response;
      const newOrder = {
        // Data dari server (prioritas utama)
        id: serverOrder?.id || `temp-${Date.now()}`,
        order_number: serverOrder?.order_number || `ORD-${Date.now()}`,
        // Kalkulasi keuangan yang sudah benar (dari snapshot lokal sebagai fallback)
        subtotal: serverOrder?.subtotal ?? subtotalSnap,
        tax: serverOrder?.tax ?? taxSnap,
        total_price: serverOrder?.total_price ?? totalSnap,
        // Info pesanan
        delivery_address: serverOrder?.delivery_address ?? customerSnap,
        customer_name: serverOrder?.customer_name ?? customerSnap,
        items: serverOrder?.items ?? cartSnapshot.map(item => ({
          product_name_snap: item.name,
          quantity: item.quantity,
          product_price_snap: item.price
        })),
        created_at: serverOrder?.created_at ?? new Date().toISOString(),
        status: serverOrder?.status ?? 'pending',
        payment_method: 'tunai',
      };

      // ✅ Masukkan order LENGKAP ke antrean aktif (data sudah komplit untuk proses bayar)
      setActiveOrders(prev => [newOrder, ...prev]);

      setIsKitchenPrint(true);
      setSelectedOrder(newOrder);
      setIsKitchenModalOpen(true);
      setCart([]);
      setCustomerName("");
      fetchData(true);
    } catch (e) {
      toast.error("Gagal mengirim pesanan", { id: tid });
    }
  };

  // --- HANDLER: BAYAR & CETAK KASIR (POS manual ATAU 1 meja dine-in sekaligus) ---
  const handlePay = async (row: QueueRow) => {
    // ✅ GUARD: Pastikan order POS memiliki ID yang valid (bukan temp ID)
    if (row.kind === "pos" && (!row.orders[0].id || String(row.orders[0].id).startsWith('temp-'))) {
      toast.error("Data pesanan belum sinkron. Mohon tunggu sebentar atau refresh halaman.");
      fetchData(true);
      return;
    }

    const tid = toast.loading("Memproses Pembayaran...");
    try {
      if (row.kind === "dine_in" && row.tableId) {
        // Bayar 1x utk semua tiket meja ini -> backend set paid_at di semua order -> meja otomatis kosong lagi
        await tableService.closeBill(row.tableId);
      } else {
        await posService.completePayment(row.orders[0].id, "tunai");
      }

      const paidAt = new Date().toISOString();
      const orderIds = new Set(row.orders.map((o) => o.id));

      // OPTIMISTIC UPDATE: Hilang dari Antrean, Muncul di Riwayat seketika
      setActiveOrders(prev => prev.filter(o => !orderIds.has(o.id)));
      setHistoryOrders(prev => [
        ...row.orders.map((o) => ({ ...o, status: 'completed', paid_at: paidAt })),
        ...prev,
      ]);

      toast.success(
        <div className="flex flex-col">
          <span className="font-bold">Pembayaran Lunas!</span>
          <span className="text-xs opacity-80">
            {row.kind === "dine_in" ? `${row.displayName} kembali kosong` : "Pesanan dipindah ke Riwayat Selesai"}
          </span>
        </div>,
        { id: tid, duration: 4000 }
      );

      setIsKitchenPrint(false);
      setSelectedOrder(toReceiptOrder(row));
      setIsReceiptModalOpen(true);
      fetchData(true);
    } catch (e) {
      toast.error("Gagal memproses pembayaran", { id: tid });
    }
  };

  // --- MODAL HANDLERS ---
  const openKitchenModal = (order: any) => { setIsKitchenPrint(true); setSelectedOrder(order); setIsKitchenModalOpen(true); };
  const openReceiptModal = (order: any) => { setIsKitchenPrint(false); setSelectedOrder(order); setIsReceiptModalOpen(true); };
  const handleKitchenPrint = () => { setIsKitchenModalOpen(false); toast.dismiss(); setTimeout(() => window.print(), 350); };
  const handleReceiptPrint = () => { setIsReceiptModalOpen(false); toast.dismiss(); setTimeout(() => window.print(), 350); };

  // --- FILTER & PAGINATION ANTREAN & RIWAYAT ---
  const filteredQueue = useMemo(() => {
    const baseData = queueTab === "aktif" ? activeQueueRows : historyQueueRows;
    let result = Array.isArray(baseData) ? baseData : [];

    if (queueSearch) result = result.filter(row => row.displayName?.toLowerCase().includes(queueSearch.toLowerCase()));

    // ✅ Filter tanggal yang berbeda untuk antrean aktif vs riwayat
    const dateFilter = queueTab === "aktif" ? activeDateFilter : historyDateFilter;
    const today = new Date();
    if (dateFilter === "today") result = result.filter(row => new Date(row.created_at).toDateString() === today.toDateString());
    else if (dateFilter === "month") result = result.filter(row =>
      new Date(row.created_at).getMonth() === today.getMonth() &&
      new Date(row.created_at).getFullYear() === today.getFullYear()
    );

    return result;
  }, [activeQueueRows, historyQueueRows, queueTab, queueSearch, activeDateFilter, historyDateFilter]);

  const totalPages = Math.ceil(filteredQueue.length / itemsPerPage);
  const paginatedQueue = filteredQueue.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [queueSearch, activeDateFilter, historyDateFilter, queueTab]);

  // Helper untuk date filter yang sedang aktif
  const currentDateFilter = queueTab === "aktif" ? activeDateFilter : historyDateFilter;
  const setCurrentDateFilter = queueTab === "aktif" ? setActiveDateFilter : setHistoryDateFilter;

  return (
    <div className="fixed inset-0 z-50 bg-surface-100 flex flex-col font-sans overflow-hidden">
      {/* CSS KHUSUS PRINT - Disesuaikan untuk Printer Thermal 58mm/80mm */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          html, body { 
            height: auto; 
            margin: 0 !important; 
            padding: 0 !important; 
            background: white !important;
          }
          
          #print-area, #print-area * { visibility: visible; }
          #print-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 58mm;
            margin: 0; 
            padding: 0; 
          }
          
          .go3958317564, .go4109123758, #toast-container { display: none !important; }

          @page {
            size: 58mm auto;
            margin: 0mm;
          }
        }
      `}</style>

      <POSSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* HEADER */}
      <header className="h-[60px] lg:h-[70px] bg-[#15423C] text-white flex items-center justify-between px-3 lg:px-8 shadow-md shrink-0 print:hidden z-10">
        <div className="flex items-center gap-2 lg:gap-8">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><Menu size={24} /></button>
          <div className="hidden md:flex items-center gap-3">
            {outletInfo?.logo ? (
              <img 
                src={outletInfo.logo.startsWith('http') ? outletInfo.logo : `${(process.env.NEXT_PUBLIC_API_URL || "https://linen-deer-529188.hostingersite.com/api").split('/api')[0]}/${outletInfo.logo.replace(/^\//, '')}`} 
                alt="Logo Outlet" 
                className="w-9 h-9 rounded-full object-cover bg-white shadow-sm border-2 border-emerald-400" 
              />
            ) : (
              <Monitor size={20} className="text-emerald-300" />
            )}
            <span className="font-black text-lg tracking-tight">{outletInfo?.name || "ZAD POS"}</span>
          </div>
          <nav className="flex bg-black/25 p-1 rounded-xl">
            <button onClick={() => setActiveTab("katalog")} className={cn("px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-bold transition-all", activeTab === "katalog" ? "bg-white text-[#15423C] shadow-sm" : "text-white/80 hover:bg-white/10")}>Katalog Menu</button>
            <button onClick={() => setActiveTab("antrean")} className={cn("px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-bold transition-all flex items-center gap-2", activeTab === "antrean" ? "bg-white text-[#15423C] shadow-sm" : "text-white/80 hover:bg-white/10")}>
              Transaksi {activeQueueRows.length > 0 && <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-md text-[10px] leading-none animate-pulse">{activeQueueRows.length}</span>}
            </button>
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block bg-black/20 px-4 py-1.5 rounded-xl border border-white/10">
            <p className="text-[9px] uppercase text-emerald-200 font-bold tracking-widest leading-none mb-1">Pajak Aktif</p>
            <p className="text-sm font-black leading-none">{taxConfig}%</p>
          </div>
          <button onClick={() => fetchData(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors" title="Muat Ulang Data"><RefreshCw className={isLoading ? "animate-spin" : ""} size={18} /></button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden print:hidden bg-surface-50">
        {activeTab === "katalog" ? (
          <>
            {/* KATALOG KIRI */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
              <div className="p-3 lg:p-6 bg-white border-b border-surface-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 z-10 shadow-sm shrink-0">
                <div className="relative w-full sm:w-72 lg:max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input type="text" placeholder="Cari makanan atau minuman..." className="w-full pl-11 pr-4 py-2.5 bg-surface-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#15423C] focus:ring-2 focus:ring-[#15423C]/10 font-medium transition-all text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="flex items-center bg-surface-50 border border-neutral-200 rounded-xl p-1 w-full sm:w-auto overflow-x-auto">
                  <button onClick={() => setCategoryFilter("all")} className={cn("px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all", categoryFilter === "all" ? "bg-white text-[#15423C] shadow-sm" : "text-neutral-500 hover:text-neutral-800")}>Semua</button>
                  <button onClick={() => setCategoryFilter("minuman")} className={cn("px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5", categoryFilter === "minuman" ? "bg-white text-[#15423C] shadow-sm" : "text-neutral-500 hover:text-neutral-800")}><Coffee size={14} /> Minuman</button>
                  <button onClick={() => setCategoryFilter("makanan")} className={cn("px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5", categoryFilter === "makanan" ? "bg-white text-[#15423C] shadow-sm" : "text-neutral-500 hover:text-neutral-800")}><Utensils size={14} /> Makanan</button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 lg:p-6 pb-6">
                {isLoading ? (
                  <div className="flex h-full flex-col items-center justify-center text-primary-600 gap-4"><Loader2 className="animate-spin" size={40} /><p className="font-medium animate-pulse text-sm">Memuat Katalog...</p></div>
                ) : filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-5">
                    {filteredProducts.map((p) => <ProductCard key={p.id} product={p} onAdd={addToCart} />)}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-neutral-400"><ChefHat size={60} className="mb-4 opacity-20" /><h3 className="text-lg font-bold text-neutral-600">Produk Tidak Ditemukan</h3></div>
                )}
              </div>
            </div>

            {/* KERANJANG KANAN */}
            <div className="w-full lg:w-[380px] xl:w-[420px] bg-white border-t lg:border-t-0 lg:border-l border-surface-200 flex flex-col shadow-2xl lg:shadow-[-10px_0_30px_rgba(0,0,0,0.03)] z-20 shrink-0 h-[45vh] lg:h-auto">
              <div className="p-4 lg:p-5 bg-surface-50/80 border-b border-surface-200 shrink-0">
                <label className="block relative">
                  <span className="text-[9px] lg:text-[10px] font-black text-[#15423C] uppercase tracking-widest mb-1.5 block">Identitas Pelanggan / Meja</span>
                  <div className="flex items-center gap-3 bg-white border border-neutral-200 rounded-xl px-3 py-2.5 focus-within:border-[#15423C] focus-within:ring-2 focus-within:ring-[#15423C]/10 transition-all">
                    <User size={16} className="text-[#15423C]" />
                    <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Meja 05 / Bapak Budi" className="bg-transparent w-full outline-none font-bold text-neutral-800 text-sm" />
                  </div>
                </label>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 lg:p-5 space-y-3">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-400 opacity-60"><ShoppingCart size={48} strokeWidth={1} className="mb-3" /><p className="font-medium text-sm">Keranjang kosong</p></div>
                ) : (
                  cart.map((item, i) => <CartItem key={i} item={item} onUpdateQty={updateCartQty} onRemove={removeFromCart} />)
                )}
              </div>
              
              <div className="p-4 lg:p-5 bg-white border-t border-surface-200 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] shrink-0">
                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between text-xs text-neutral-500 font-medium"><span>Subtotal</span><span>Rp {Math.floor(subtotal).toLocaleString('id-ID')}</span></div>
                  <div className="flex justify-between text-xs text-neutral-500 font-medium"><span>Pajak Resto ({taxConfig}%)</span><span>Rp {Math.floor(taxAmount).toLocaleString('id-ID')}</span></div>
                  <div className="flex justify-between font-black text-xl lg:text-2xl text-[#15423C] pt-2 border-t border-dashed border-neutral-200"><span>Total</span><span>Rp {Math.floor(total).toLocaleString('id-ID')}</span></div>
                </div>
                
                <button disabled={cart.length === 0 || !customerName} onClick={handleSendToKitchen} className="w-full py-3.5 bg-[#15423C] text-white rounded-xl lg:rounded-2xl font-black text-base lg:text-lg shadow-[0_8px_20px_rgba(21,66,60,0.3)] hover:shadow-[0_12px_25px_rgba(21,66,60,0.4)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none disabled:transform-none transition-all flex items-center justify-center gap-2">
                  <ChefHat size={20} /> KIRIM KE DAPUR
                </button>
              </div>
            </div>
          </>
        ) : (
          /* =======================
             TAB ANTREAN & KASIR 
             ======================= */
          <div className="flex-1 p-3 lg:p-8 bg-surface-50 overflow-hidden flex flex-col max-w-7xl mx-auto w-full">
            <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-surface-200 p-4 lg:p-6 flex flex-col h-full">
              
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 lg:gap-6 mb-6">
                <div>
                  <h2 className="text-xl lg:text-3xl font-black text-[#15423C]">Daftar Transaksi</h2>
                  <p className="text-neutral-500 text-xs lg:text-sm mt-1">Kelola antrean pembayaran dan riwayat selesai.</p>
                </div>

                <div className="flex flex-col lg:flex-row w-full xl:w-auto gap-3 lg:gap-4">
                  {/* TAB SWITCHER */}
                  <div className="flex items-center bg-surface-100 border border-surface-200 rounded-xl p-1 w-full sm:w-auto">
                    <button onClick={() => setQueueTab("aktif")} className={cn("flex-1 px-4 py-2 rounded-lg text-xs lg:text-sm font-bold whitespace-nowrap transition-all relative", queueTab === "aktif" ? "bg-white text-[#15423C] shadow-sm" : "text-neutral-500 hover:text-neutral-800")}>
                      Antrean Aktif {activeQueueRows.length > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] animate-pulse border border-white">{activeQueueRows.length}</span>}
                    </button>
                    <button onClick={() => setQueueTab("riwayat")} className={cn("flex-1 px-4 py-2 rounded-lg text-xs lg:text-sm font-bold whitespace-nowrap transition-all", queueTab === "riwayat" ? "bg-white text-[#15423C] shadow-sm" : "text-neutral-500 hover:text-neutral-800")}>
                      Riwayat Selesai
                    </button>
                  </div>

                  {/* DATE FILTER - berbeda untuk aktif dan riwayat */}
                  <div className="flex items-center bg-surface-50 border border-neutral-200 rounded-xl p-1 w-full sm:w-auto overflow-x-auto">
                    {/* Antrean aktif: default Semua (supaya langsung terlihat), ada opsi filter */}
                    {queueTab === "aktif" && (
                      <>
                        <button onClick={() => setActiveDateFilter("all")} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all", activeDateFilter === "all" ? "bg-[#15423C] text-white shadow-sm" : "text-neutral-500 hover:text-neutral-800")}>Semua</button>
                        <button onClick={() => setActiveDateFilter("today")} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all", activeDateFilter === "today" ? "bg-[#15423C] text-white shadow-sm" : "text-neutral-500 hover:text-neutral-800")}>Hari Ini</button>
                        <button onClick={() => setActiveDateFilter("month")} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all", activeDateFilter === "month" ? "bg-[#15423C] text-white shadow-sm" : "text-neutral-500 hover:text-neutral-800")}>Bulan Ini</button>
                      </>
                    )}
                    {/* Riwayat: default Hari Ini */}
                    {queueTab === "riwayat" && (
                      <>
                        <button onClick={() => setHistoryDateFilter("today")} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all", historyDateFilter === "today" ? "bg-[#15423C] text-white shadow-sm" : "text-neutral-500 hover:text-neutral-800")}>Hari Ini</button>
                        <button onClick={() => setHistoryDateFilter("month")} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all", historyDateFilter === "month" ? "bg-[#15423C] text-white shadow-sm" : "text-neutral-500 hover:text-neutral-800")}>Bulan Ini</button>
                        <button onClick={() => setHistoryDateFilter("all")} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all", historyDateFilter === "all" ? "bg-[#15423C] text-white shadow-sm" : "text-neutral-500 hover:text-neutral-800")}>Semua</button>
                      </>
                    )}
                  </div>

                  {/* SEARCH */}
                  <div className="relative w-full sm:w-56">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                    <input type="text" placeholder="Cari pelanggan..." className="w-full pl-9 pr-3 py-2 bg-surface-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#15423C] focus:ring-2 focus:ring-[#15423C]/10 transition-all font-medium text-xs" value={queueSearch} onChange={(e) => setQueueSearch(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* TABLE */}
              <div className="flex-1 overflow-x-auto overflow-y-auto border border-neutral-100 rounded-xl lg:rounded-2xl relative">
                <table className="w-full text-left border-collapse min-w-[750px]">
                  <thead className="bg-[#15423C]/5 sticky top-0 z-10 backdrop-blur-md">
                    <tr>
                      <th className="p-3 lg:p-5 text-[10px] lg:text-xs font-black text-[#15423C] uppercase tracking-widest w-[20%]">Waktu</th>
                      <th className="p-3 lg:p-5 text-[10px] lg:text-xs font-black text-[#15423C] uppercase tracking-widest w-[25%]">Pelanggan / Meja</th>
                      <th className="p-3 lg:p-5 text-[10px] lg:text-xs font-black text-[#15423C] uppercase tracking-widest w-[20%]">Tagihan</th>
                      <th className="p-3 lg:p-5 text-[10px] lg:text-xs font-black text-[#15423C] uppercase tracking-widest w-[35%] text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {paginatedQueue.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-12 lg:p-16 text-center">
                          <Receipt size={48} className="mx-auto mb-3 text-neutral-200" />
                          <p className="text-base font-bold text-neutral-500">{queueTab === "aktif" ? "Tidak ada antrean pesanan." : "Belum ada riwayat selesai."}</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedQueue.map((row) => {
                        const isTemp = row.kind === "pos" && String(row.orders[0].id).startsWith('temp-');
                        return (
                        <tr key={row.key} className="hover:bg-surface-50 transition-colors group">
                          <td className="p-3 lg:p-5 text-xs lg:text-sm font-medium text-neutral-500">
                            <div className="flex flex-col gap-1">
                              <span className="flex items-center gap-1"><Calendar size={12} className="text-neutral-400" /> {new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year:'numeric' })}</span>
                              <span className="flex items-center gap-1"><Clock size={12} className="text-neutral-400" /> {new Date(row.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                            </div>
                          </td>
                          <td className="p-3 lg:p-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#15423C]/10 flex items-center justify-center text-[#15423C] shrink-0">
                                {row.kind === "dine_in" ? <Armchair size={16} /> : <User size={16} />}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-neutral-800 text-sm lg:text-base line-clamp-1">{row.displayName}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                  {row.kind === "dine_in" ? `Pesanan Meja${row.orders.length > 1 ? ` (${row.orders.length} tiket)` : ""}` : "POS Manual"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 lg:p-5">
                            <div className="flex flex-col">
                              <span className="font-black text-base lg:text-lg text-primary-700">Rp {Math.floor(row.total_price).toLocaleString('id-ID')}</span>
                              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{row.itemCount} Item</span>
                            </div>
                          </td>
                          <td className="p-3 lg:p-5 text-right">
                            {queueTab === "aktif" ? (
                              <div className="flex items-center justify-end gap-2">
                                {row.kind === "pos" && (
                                  <button onClick={() => openKitchenModal(row.orders[0])} className="bg-surface-100 hover:bg-surface-200 text-neutral-600 px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all" title="Lihat & Cetak Tiket Dapur">
                                    <Printer size={14} /> Cetak Dapur
                                  </button>
                                )}
                                <button
                                  onClick={() => handlePay(row)}
                                  disabled={isTemp}
                                  className="bg-[#15423C] hover:bg-[#1a534b] text-white px-5 py-2.5 rounded-lg font-bold text-xs lg:text-sm flex items-center gap-2 shadow-md hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all"
                                  title={isTemp ? "Menunggu sinkronisasi..." : "Bayar & Cetak Struk"}
                                >
                                  {isTemp ? (
                                    <><Loader2 size={16} className="animate-spin" /> Sinkronisasi...</>
                                  ) : (
                                    <><CreditCard size={16} /> Bayar & Cetak</>
                                  )}
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => openReceiptModal(toReceiptOrder(row))} className="bg-surface-100 hover:bg-[#15423C] hover:text-white text-neutral-600 px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all">
                                  <Printer size={14} /> Cetak Struk
                                </button>
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm">
                                  <CheckCircle2 size={14} /> Selesai
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );})
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 lg:mt-6 flex flex-col sm:flex-row items-center justify-between border-t border-neutral-100 pt-4 gap-4">
                  <p className="text-xs lg:text-sm font-medium text-neutral-500">Hal <span className="font-bold text-neutral-800">{currentPage}</span> / <span className="font-bold text-neutral-800">{totalPages}</span></p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="p-1.5 border border-neutral-200 rounded-lg hover:bg-surface-50 disabled:opacity-50"><ChevronLeft size={18} /></button>
                    <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="p-1.5 border border-neutral-200 rounded-lg hover:bg-surface-50 disabled:opacity-50"><ChevronRight size={18} /></button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* =========================================
          AREA KHUSUS PRINT - STRUK THERMAL CAFE 58mm
          ========================================= */}
      <div id="print-area" className="hidden print:block bg-white text-black" style={{ width: '58mm', fontFamily: 'monospace', fontSize: '10px', lineHeight: '1.3' }}>
        {selectedOrder && (
          isKitchenPrint ? (
            /* --- STRUK DAPUR --- */
            <div style={{ width: '58mm', padding: '2mm 3mm', boxSizing: 'border-box' }}>
              <div style={{ textAlign: 'center', fontWeight: 900, fontSize: '13px', borderBottom: '1px dashed black', paddingBottom: '4px', marginBottom: '6px', letterSpacing: '1px' }}>
                ★ ORDER DAPUR ★
              </div>
              <div style={{ marginBottom: '6px', fontSize: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Meja/Nama</span>
                  <span style={{ fontWeight: 700, maxWidth: '55%', textAlign: 'right' }}>{selectedOrder.delivery_address}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>No. Order</span>
                  <span style={{ fontWeight: 700 }}>{String(selectedOrder.order_number || '-').substring(0, 12)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Waktu</span>
                  <span style={{ fontWeight: 700 }}>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                </div>
              </div>
              <div style={{ borderTop: '1px dashed black', borderBottom: '1px dashed black', padding: '4px 0', marginBottom: '6px' }}>
                <div style={{ display: 'flex', fontWeight: 900, fontSize: '10px', marginBottom: '2px' }}>
                  <span style={{ width: '22px' }}>QTY</span>
                  <span>MENU</span>
                </div>
                {selectedOrder.items?.map((item: any, i: number) => (
                  <div key={i} style={{ display: 'flex', marginBottom: '3px', fontSize: '11px' }}>
                    <span style={{ width: '22px', fontWeight: 900 }}>{item.quantity}x</span>
                    <span style={{ fontWeight: 700, flex: 1 }}>{item.product_name_snap}</span>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', fontSize: '9px', fontStyle: 'italic' }}>-- Siapkan dengan teliti --</div>
            </div>
          ) : (
            /* --- STRUK KASIR THERMAL 58mm --- */
            <div style={{ width: '58mm', padding: '3mm 3mm', boxSizing: 'border-box' }}>
              {/* HEADER CAFE */}
              <div style={{ textAlign: 'center', marginBottom: '6px' }}>
                <div style={{ fontWeight: 900, fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>{outletInfo?.name || "ZAD CAFE"}</div>
                <div style={{ fontSize: '8px', fontWeight: 400, marginTop: '1px', textTransform: 'capitalize' }}>{outletInfo?.address || "Medan, Sumatera Utara"}</div>
                <div style={{ fontSize: '8px', fontWeight: 400 }}>--------------------------------</div>
              </div>
              
              {/* INFO ORDER */}
              <div style={{ fontSize: '9px', marginBottom: '4px' }}>
                <div>No  : {selectedOrder.order_number || '-'}</div>
                <div>Cst : {selectedOrder.delivery_address || 'Guest'}</div>
                <div>Wkt : {new Date(selectedOrder.created_at || new Date()).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
              </div>

              <div style={{ borderTop: '1px dashed black', marginBottom: '4px' }} />

              {/* ITEM LIST */}
              <div style={{ marginBottom: '4px' }}>
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: '4px', fontSize: '9px' }}>
                    <div style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{item.product_name_snap}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 400 }}>
                      <span>{item.quantity} x {Math.floor(item.product_price_snap).toLocaleString('id-ID')}</span>
                      <span>{Math.floor(item.quantity * item.product_price_snap).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px dashed black', marginBottom: '3px' }} />

              {/* TOTAL */}
              <div style={{ fontSize: '9px', marginBottom: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal</span>
                  <span>Rp{Math.floor(selectedOrder.subtotal || 0).toLocaleString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>PPN ({taxConfig}%)</span>
                  <span>Rp{Math.floor(selectedOrder.tax || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed black', marginBottom: '3px' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '12px', marginBottom: '2px' }}>
                <span>TOTAL</span>
                <span>Rp{Math.floor(selectedOrder.total_price || 0).toLocaleString('id-ID')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: 400 }}>
                <span>Bayar (TUNAI)</span>
                <span>Rp{Math.floor(selectedOrder.total_price || 0).toLocaleString('id-ID')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: 400 }}>
                <span>Kembali</span>
                <span>Rp 0</span>
              </div>

              <div style={{ borderTop: '1px dashed black', marginTop: '6px', paddingTop: '4px', textAlign: 'center' }}>
                <div style={{ fontSize: '9px' }}>Terima kasih atas kunjungan Anda!</div>
                <div style={{ fontSize: '8px', fontWeight: 400, color: '#666', marginTop: '1px' }}>★ Selamat Menikmati ★</div>
                <div style={{ fontSize: '7px', fontWeight: 400, color: '#999', marginTop: '3px' }}>POS by CodifyHub.id</div>
              </div>
            </div>
          )
        )}
      </div>

      {/* =============================================
          MODAL TIKET DAPUR
          ============================================= */}
      {isKitchenModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* Header */}
            <div className="bg-[#15423C] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ChefHat size={20} className="text-emerald-300" />
                <div>
                  <p className="font-black text-base leading-tight">Tiket Dapur</p>
                  <p className="text-emerald-300 text-[10px] font-medium leading-none mt-0.5">Review sebelum cetak</p>
                </div>
              </div>
              <button
                onClick={() => setIsKitchenModalOpen(false)}
                className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tiket Dapur — tampilan thermal receipt */}
            <div className="bg-amber-50 px-5 py-4 font-mono">
              {/* Title */}
              <div className="text-center font-black text-sm tracking-[0.2em] border-b-2 border-dashed border-gray-400 pb-3 mb-3">
                ★ ORDER DAPUR ★
              </div>

              {/* Info order */}
              <div className="text-[11px] space-y-1 mb-3">
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500 shrink-0">Meja / Nama</span>
                  <span className="font-bold text-right truncate">{selectedOrder.delivery_address || '-'}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500 shrink-0">No. Order</span>
                  <span className="font-bold">{String(selectedOrder.order_number || '-').substring(0, 16)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500 shrink-0">Waktu</span>
                  <span className="font-bold">{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                </div>
              </div>

              {/* Daftar item */}
              <div className="border-t-2 border-b-2 border-dashed border-gray-400 py-3 mb-3">
                <div className="flex text-[10px] font-black text-gray-500 uppercase mb-2 gap-3">
                  <span className="w-8">Qty</span>
                  <span>Menu</span>
                </div>
                {selectedOrder.items?.length > 0 ? (
                  selectedOrder.items.map((item: any, i: number) => (
                    <div key={i} className="flex gap-3 mb-1.5 text-[12px]">
                      <span className="w-8 font-black text-[#15423C]">{item.quantity}x</span>
                      <span className="font-bold flex-1 leading-tight">{item.product_name_snap}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic text-center py-1">Tidak ada item</p>
                )}
              </div>

              <div className="text-center text-[10px] italic text-gray-400">
                — Siapkan dengan teliti —
              </div>
            </div>

            {/* Action */}
            <div className="px-5 py-4 bg-white flex gap-3 border-t border-gray-100">
              <button
                onClick={() => setIsKitchenModalOpen(false)}
                className="flex-1 py-2.5 border-2 border-neutral-200 rounded-xl font-bold text-neutral-600 hover:bg-neutral-50 transition-colors text-sm"
              >
                Tutup
              </button>
              <button
                onClick={handleKitchenPrint}
                className="flex-1 py-2.5 bg-[#15423C] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#1a534b] active:scale-95 transition-all shadow-md"
              >
                <Printer size={16} /> Cetak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============================================
          MODAL STRUK PEMBAYARAN (QRIS-style)
          ============================================= */}
      {isReceiptModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* Success header */}
            <div className="relative bg-gradient-to-b from-[#15423C] to-[#1d6155] text-white px-6 pt-8 pb-6 text-center">
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
              >
                <X size={16} />
              </button>

              {/* Icon lunas */}
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg ring-4 ring-white/20">
                <CheckCircle2 size={34} className="text-[#15423C]" strokeWidth={2.5} />
              </div>
              <p className="text-emerald-200 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Status Transaksi</p>
              <h2 className="text-2xl font-black tracking-wide">LUNAS</h2>

              {/* Jumlah total */}
              <div className="mt-4 bg-black/20 rounded-2xl px-5 py-3.5 backdrop-blur-sm">
                <p className="text-emerald-200 text-[10px] font-semibold mb-1">Total Dibayar</p>
                <p className="text-3xl font-black tracking-tight">
                  Rp {Math.floor(Number(selectedOrder.total_price || 0)).toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            {/* Divider zigzag */}
            <div className="relative h-4 bg-white">
              <div className="absolute -top-2 left-0 right-0 flex">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="flex-1 h-4 overflow-hidden">
                    <div className="w-4 h-4 bg-black/70 rounded-full -translate-x-1/2" />
                  </div>
                ))}
              </div>
            </div>

            {/* Body struk */}
            <div className="px-5 pb-2 bg-white space-y-4">

              {/* Nama cafe & no order */}
              <div className="text-center pt-1">
                <div className="flex items-center justify-center gap-2 mb-0.5">
                  <Store size={14} className="text-[#15423C]" />
                  <p className="font-black text-neutral-800 text-base">{outletInfo?.name || 'ZAD CAFE'}</p>
                </div>
                <p className="text-[11px] text-neutral-400 font-mono">{selectedOrder.order_number || '-'}</p>
              </div>

              {/* Info transaksi */}
              <div className="bg-surface-50 rounded-xl p-3.5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Pelanggan</span>
                  <span className="font-bold text-neutral-800 truncate max-w-[55%] text-right">{selectedOrder.delivery_address || 'Guest'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Waktu</span>
                  <span className="font-medium text-neutral-700">
                    {new Date(selectedOrder.created_at || new Date()).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Metode Bayar</span>
                  <span className="font-bold text-[#15423C] uppercase">Tunai</span>
                </div>
              </div>

              {/* Daftar item */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Rincian Pesanan</p>
                <div className="divide-y divide-neutral-100">
                  {selectedOrder.items?.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 text-sm">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="w-6 h-6 bg-[#15423C]/10 text-[#15423C] rounded-md flex items-center justify-center text-[10px] font-black shrink-0">{item.quantity}</span>
                        <span className="font-medium text-neutral-700 truncate">{item.product_name_snap}</span>
                      </div>
                      <span className="font-bold text-neutral-800 ml-2 shrink-0">
                        Rp {Math.floor(Number(item.product_price_snap || 0) * Number(item.quantity || 1)).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kalkulasi total */}
              <div className="border-t border-dashed border-neutral-200 pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span>
                  <span>Rp {Math.floor(Number(selectedOrder.subtotal || 0)).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>PPN ({taxConfig}%)</span>
                  <span>Rp {Math.floor(Number(selectedOrder.tax || 0)).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-black text-base text-[#15423C] pt-1 border-t border-neutral-200">
                  <span>TOTAL</span>
                  <span>Rp {Math.floor(Number(selectedOrder.total_price || 0)).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-neutral-400 text-xs">
                  <span>Tunai</span>
                  <span>Rp {Math.floor(Number(selectedOrder.total_price || 0)).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-neutral-400 text-xs">
                  <span>Kembali</span>
                  <span>Rp 0</span>
                </div>
              </div>

              <p className="text-center text-[10px] text-neutral-300 pb-1">Terima kasih atas kunjungan Anda ★</p>
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 pt-2 bg-white flex gap-3">
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="flex-1 py-3 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-600 hover:bg-neutral-50 transition-colors text-sm"
              >
                Tutup
              </button>
              <button
                onClick={handleReceiptPrint}
                className="flex-1 py-3 bg-[#15423C] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#1a534b] active:scale-95 transition-all shadow-lg shadow-[#15423C]/25"
              >
                <Printer size={16} /> Cetak Struk
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
