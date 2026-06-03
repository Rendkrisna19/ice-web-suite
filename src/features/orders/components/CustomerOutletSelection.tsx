"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link"; // PENTING: Pakai Link
import { MapPin, Store, ArrowRight, Loader2, Lock, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { customerSimulatorService, Outlet } from "../services/customerSimulatorService";

export default function CustomerOutletSelection() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        await customerSimulatorService.authenticate();
      }
      fetchOutlets();
    };
    init();
  }, []);

  const fetchOutlets = async () => {
    try {
      const data = await customerSimulatorService.getAllOutlets();
      if (Array.isArray(data)) {
        setOutlets(data);
      } else {
        setOutlets([]);
      }
    } catch (error) {
      toast.error("Gagal memuat daftar outlet");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-200">
        <Loader2 className="animate-spin text-[#15423C]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-200 font-sans p-6">
      <div className="max-w-md mx-auto space-y-6">
        
        <div className="text-center space-y-2 py-8">
           <h1 className="text-2xl font-bold text-[#15423C]">Pilih Restoran</h1>
           <p className="text-neutral-500 text-sm">Mau pesan makan di cabang mana?</p>
        </div>

        <div className="space-y-4">
          {outlets.map((outlet) => {
            // Logic Buka/Tutup
            const isOpen = !outlet.is_force_closed;

            // Konten Kartu (Tampilan sama seperti sebelumnya)
            const CardContent = (
              <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 bg-white shadow-sm ${
                  isOpen 
                  ? "border-surface-200 group-hover:border-[#15423C] group-hover:shadow-md" 
                  : "border-neutral-200 opacity-70 grayscale"
              }`}>
                   <div className="w-16 h-16 bg-surface-100 rounded-xl flex items-center justify-center text-neutral-400 shrink-0 overflow-hidden relative">
                      {outlet.image_url ? (
                         <Image src={outlet.image_url} alt={outlet.name} fill className="object-cover" />
                      ) : (
                         <Store size={24} />
                      )}
                   </div>
                   
                   <div className="flex-1">
                      <h3 className="font-bold text-neutral-800 group-hover:text-[#15423C] transition-colors">
                        {outlet.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
                         <MapPin size={12} />
                         <span className="line-clamp-1">{outlet.address || "Alamat tidak tersedia"}</span>
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-1">
                        Buka: {outlet.opening_hour} - {outlet.closing_hour}
                      </div>
                   </div>

                   <div className="text-right">
                      {isOpen ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-lg text-[10px] font-bold">
                           BUKA <Clock size={10} />
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-lg text-[10px] font-bold">
                           TUTUP <Lock size={10} />
                        </span>
                      )}
                   </div>
                   
                   {isOpen && (
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                        <ArrowRight className="text-[#15423C]" />
                     </div>
                   )}
              </div>
            );

            // JIKA BUKA: Bungkus dengan LINK agar bisa diklik
            if (isOpen) {
              return (
                <Link key={outlet.id} href={`/customer/order?outlet_id=${outlet.id}`} className="block group relative">
                  {CardContent}
                </Link>
              );
            }

            // JIKA TUTUP: Render div biasa (tidak bisa diklik)
            return (
              <div key={outlet.id} className="cursor-not-allowed">
                {CardContent}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
