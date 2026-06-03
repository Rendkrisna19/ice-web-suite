"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // TAMBAH useSearchParams
import Image from "next/image";
import { 
  ShoppingBag, Plus, Minus, ChefHat, 
  Utensils, ArrowRight, Loader2, LogOut, ArrowLeft
} from "lucide-react";
import toast from "react-hot-toast";
import { customerSimulatorService, Product, CartItem } from "@/features/orders/services/customerSimulatorService";

export default function CustomerOrderBoard() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Hook untuk baca URL
  
  // AMBIL ID DARI URL (Contoh: /customer/order?outlet_id=2)
  // Jika tidak ada, default ke 0 (nanti diredirect)
  const outletIdParam = searchParams.get("outlet_id");
  const OUTLET_ID = outletIdParam ? parseInt(outletIdParam) : 0;

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Validasi: Jika tidak ada Outlet ID, kembalikan ke halaman pilih outlet
    if (!OUTLET_ID) {
        toast.error("Pilih restoran terlebih dahulu");
        router.push("/customer/outlets");
        return;
    }

    const init = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
        loadMenu();
      } else {
        const success = await customerSimulatorService.authenticate();
        if (success) {
          const newUser = localStorage.getItem("user");
          if (newUser) setUser(JSON.parse(newUser));
          loadMenu();
        } else {
          toast.error("Gagal Login Simulator.");
          setIsLoading(false);
        }
      }
    };
    init();
  }, [OUTLET_ID]); // Re-run jika ID berubah

  const loadMenu = async () => {
    try {
      const data = await customerSimulatorService.getOutletProducts(OUTLET_ID);
      setProducts(data);
    } catch (error: any) {
      console.error(error);
      toast.error("Gagal memuat menu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(p => p.product_id === product.id);
      const finalPrice = Number(product.price); 
      
      if (existing) {
        return prev.map(p => 
          p.product_id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { 
        product_id: product.id, 
        name: product.name, 
        price: finalPrice, 
        quantity: 1,
        image_url: product.image_url 
      }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.map(p => 
      p.product_id === productId ? { ...p, quantity: p.quantity - 1 } : p
    ).filter(p => p.quantity > 0));
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      await customerSimulatorService.createOrder(
        OUTLET_ID, // Pakai ID Dinamis
        cart, 
        "Meja No. 5 (Simulasi FE)"
      );
      toast.success("Pesanan Berhasil Dibuat!");
      setCart([]);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Gagal membuat pesanan";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-300 flex-col gap-2">
        <Loader2 className="animate-spin text-[#15423C]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-200 font-sans pb-40">
      
      {/* Header */}
      <header className="bg-[#15423C] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-md mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <button onClick={() => router.push('/customer/outlets')} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
                <ArrowLeft size={20} />
             </button>
             <div>
                <h1 className="text-lg font-bold flex items-center gap-2">
                <ChefHat size={20} /> Resto Nusantara
                </h1>
                <p className="text-[10px] text-white/70">
                Outlet ID: {OUTLET_ID} • {user?.name || "Pelanggan"}
                </p>
             </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleLogout} className="text-white/70 hover:text-white" title="Logout">
                <LogOut size={20} />
            </button>
            <div className="relative">
                <ShoppingBag size={24} />
                {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold animate-bounce">
                    {cart.reduce((a,c) => a + c.quantity, 0)}
                </span>
                )}
            </div>
          </div>
        </div>
      </header>

      {/* Menu List */}
      <main className="max-w-md mx-auto p-4 space-y-4">
        {products.length === 0 ? (
            <div className="text-center py-10 text-neutral-400">
                <p>Tidak ada menu tersedia di outlet ini.</p>
            </div>
        ) : (
            products.map((item) => {
            const inCart = cart.find(c => c.product_id === item.id);
            return (
                <div key={item.id} className="bg-white p-3 rounded-2xl shadow-sm border border-surface-200 flex gap-4">
                <div className="w-24 h-24 bg-surface-100 rounded-xl overflow-hidden relative shrink-0">
                    {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" unoptimized/>
                    ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-300">
                        <Utensils size={24} />
                    </div>
                    )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                    <h3 className="font-bold text-neutral-800 line-clamp-1">{item.name}</h3>
                    <p className="text-[10px] text-neutral-400 line-clamp-2 mt-1">{item.description || "Menu spesial"}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-[#15423C]">Rp {Number(item.price).toLocaleString("id-ID")}</span>
                    {inCart ? (
                        <div className="flex items-center gap-3 bg-surface-50 rounded-lg p-1 border border-surface-200">
                        <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 bg-white rounded-md flex items-center justify-center text-neutral-600 shadow-sm border border-surface-200"><Minus size={12}/></button>
                        <span className="text-xs font-bold w-4 text-center">{inCart.quantity}</span>
                        <button onClick={() => addToCart(item)} className="w-6 h-6 bg-[#15423C] rounded-md flex items-center justify-center text-white shadow-sm"><Plus size={12}/></button>
                        </div>
                    ) : (
                        <button onClick={() => addToCart(item)} className="bg-[#15423C] text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-[#15423C]/20 active:scale-95 transition-all">
                        Tambah
                        </button>
                    )}
                    </div>
                </div>
                </div>
            );
            })
        )}
      </main>

      {/* Checkout Panel */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full z-[100]">
           <div className="max-w-md mx-auto">
             <div className="bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] p-6 animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between mb-4 border-b border-dashed border-surface-200 pb-4">
                   <div>
                      <p className="text-xs text-neutral-400 font-bold">Total Pembayaran</p>
                      <h2 className="text-2xl font-bold text-[#15423C]">Rp {calculateTotal().toLocaleString("id-ID")}</h2>
                   </div>
                   <div className="text-right">
                      <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-md">{cart.length} Item</span>
                   </div>
                </div>
                <button onClick={handleCheckout} disabled={isSubmitting} className="w-full bg-[#15423C] text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-[#15423C]/30 flex items-center justify-center gap-2 hover:bg-[#1A534B] transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <>Pesan Sekarang <ArrowRight size={20}/></>}
                </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
