"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Plus, Loader2 } from "lucide-react";
import { AxiosError } from "axios"; 

import { Outlet } from "@/types/merchant";
import { outletService } from "./services/outletService";
import { confirmAlert } from "@/utils/alert";

import AdminHeader from "@/features/admin/components/AdminHeader";
import MerchantCard from "./components/MerchantCard";
import MerchantFormModal from "./components/MerchantFormModal";
import MerchantMenuModal from "./components/MerchantMenuModal";

export default function MerchantBoard() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentOutlet, setCurrentOutlet] = useState<Outlet | null>(null);

  const fetchOutlets = async () => {
    try {
      setIsLoading(true);
      const data = await outletService.getOutlets();
      setOutlets(data);
    } catch (error) {
      console.error("Failed to fetch outlets", error);
      toast.error("Gagal memuat data outlet.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOutlets();
  }, []);

  const handleOpenForm = (outlet?: Outlet) => {
    setCurrentOutlet(outlet || null);
    setIsFormOpen(true);
  };

  const generateSlug = (name: string): string => {
    return name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
  };

  const formatTime = (time: string): string => {
    if (!time) return "00:00:00";
    return time.length === 5 ? `${time}:00` : time;
  };

  const handleSaveOutlet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const formData = new FormData(formElement); // Ambil semua data form termasuk file
    const toastId = toast.loading("Menyimpan data...");

    // Manual manipulasi data sebelum kirim (jika perlu slug otomatis dari frontend)
    // Tapi backend biasanya sudah handle slug, namun jika backend minta slug:
    const name = formData.get("name") as string;
    if (!formData.get("slug")) {
        formData.append("slug", generateSlug(name));
    }

    // Hapus file kosong agar tidak nimpa data lama atau error di backend
    const logoFile = formData.get("logo") as File;
    if (logoFile && logoFile.size === 0) {
        formData.delete("logo");
    }
    const bannerFile = formData.get("banner") as File;
    if (bannerFile && bannerFile.size === 0) {
        formData.delete("banner");
    }
    
    // Format Time
    const open = formData.get("opening_hour") as string;
    const close = formData.get("closing_hour") as string;
    formData.set("opening_hour", formatTime(open));
    formData.set("closing_hour", formatTime(close));


    // Handle Boolean/Status manually if backend expects boolean
    const status = formData.get("status");
    // Karena kirim via FormData, boolean akan jadi string "true"/"false" atau "1"/"0"
    // Backend sebaiknya handle string "maintenance" -> is_force_closed = 1
    // Di sini kita biarkan 'status' terkirim atau map ke 'is_force_closed' jika backend minta field itu
    // Sesuai kode backend kita: if status == maintenance -> is_force_closed = true (handled di controller jika dimapping manual)
    // Tapi karena backend kita baca 'is_force_closed' dari request, kita set manual:
    if (status === 'maintenance') {
        formData.append('is_force_closed', '1');
    } else {
        formData.append('is_force_closed', '0');
    }

    try {
      if (currentOutlet) {
        // Update
        const updated = await outletService.updateOutlet(currentOutlet.id, formData);
        setOutlets(prev => prev.map(o => o.id === currentOutlet.id ? updated : o));
        toast.success("Data outlet berhasil diperbarui!", { id: toastId });
      } else {
        // Create
        const created = await outletService.createOutlet(formData);
        // Created mungkin return { outlet: ..., user: ... }, kita ambil outletnya saja jika struktur returnnya beda
        // Tapi di service tadi return response.data.data.outlet (sesuaikan jika perlu)
        // Jika controller return { outlet: ..., merchant_account: ... }
        // Kita asumsikan service sudah mereturn object Outlet yang valid atau kita fetch ulang
        await fetchOutlets(); // Fetch ulang agar data paling segar
        toast.success("Outlet & Akun Merchant dibuat!", { id: toastId });
      }
      setIsFormOpen(false);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMsg = axiosError.response?.data?.message || "Gagal menyimpan data outlet.";
      toast.error(errorMsg, { id: toastId });
    }
  };

  const handleDelete = async (id: number) => {
    confirmAlert("Yakin ingin menghapus outlet ini? Data tidak bisa dikembalikan.", async () => {
      const toastId = toast.loading("Menghapus...");
      try {
        await outletService.deleteOutlet(id);
        setOutlets(prev => prev.filter(o => o.id !== id));
        toast.success("Outlet dihapus.", { id: toastId });
      } catch (error) {
        toast.error("Gagal menghapus outlet.", { id: toastId });
      }
    }, { title: "Hapus Outlet", type: "danger", confirmText: "Ya, Hapus" });
  };

  const handleManageMenu = (outlet: Outlet) => {
    setCurrentOutlet(outlet);
    setIsMenuOpen(true);
  };

  return (
    <>
      <AdminHeader title="Merchant Management" onRefresh={fetchOutlets} />

      <main className="p-8 pb-32 space-y-6 animate-in fade-in duration-500 bg-surface-300 min-h-screen">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Daftar Outlet</h1>
            <p className="text-sm text-neutral-500 mt-1">Kelola lokasi, jam operasional, dan status cabang.</p>
          </div>
          <button 
            onClick={() => handleOpenForm()}
            className="flex items-center gap-2 bg-primary-500 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-600 hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <Plus size={18} /> Tambah Outlet
          </button>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-primary-600" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {outlets.map((outlet) => (
              <MerchantCard 
                key={outlet.id} 
                outlet={outlet} 
                onEdit={handleOpenForm}
                onDelete={handleDelete}
                onManageMenu={handleManageMenu}
              />
            ))}
          </div>
        )}

        <MerchantFormModal 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          onSubmit={handleSaveOutlet} 
          initialData={currentOutlet} 
        />

        <MerchantMenuModal 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
          outlet={currentOutlet} 
        />

      </main>
    </>
  );
}
