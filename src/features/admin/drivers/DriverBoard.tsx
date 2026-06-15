"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Driver, DriverPayload } from "@/types/driver";
import { driverService } from "@/features/admin/drivers/services/driverService";
import { confirmAlert } from "@/utils/alert";

import AdminHeader from "@/features/admin/components/AdminHeader";
import DriverCard from "./components/DriverCard";
import DriverToolbar from "./components/DriverToolbar";
import DriverFormModal from "./components/DriverFormModal";

export default function DriverBoard() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filter, setFilter] = useState<"all" | "motor" | "mobil">("all");
  const [search, setSearch] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // ID Outlet Default untuk pendaftaran Driver Baru (Misal: Outlet Pusat / ID 1)
  const DEFAULT_OUTLET_ID = 1; 

  const fetchDrivers = async () => {
    try {
      setIsLoading(true);
      // Panggil tanpa parameter untuk mengambil SEMUA driver (Global)
      const data = await driverService.getDrivers();
      setDrivers(data);
    } catch (error) {
      toast.error("Gagal memuat data driver.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const filteredDrivers = drivers.filter((drv) => {
    // Handle data undefined dari backend
    const vType = drv.vehicle_type || "motor"; 
    const matchType = filter === "all" ? true : vType === filter;
    
    const term = search.toLowerCase();
    const plate = drv.plate_number || "";
    const matchSearch = drv.name.toLowerCase().includes(term) || plate.toLowerCase().includes(term);
    
    return matchType && matchSearch;
  });

  const handleOpenModal = (driver?: Driver) => {
    setEditingDriver(driver || null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Mapping nama input form ke payload API (snake_case)
    const payload: DriverPayload = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || "",
      plate_number: (formData.get("plateNumber") as string) || "",
      vehicle_type: (formData.get("vehicleType") as string) || "motor",
    };

    // Only include password when creating new driver (not editing)
    const rawPassword = formData.get("password") as string;
    if (rawPassword) {
      payload.password = rawPassword;
    }

    const toastId = toast.loading("Menyimpan data...");

    try {
      if (editingDriver) {
        const updated = await driverService.updateDriver(editingDriver.id, payload);
        setDrivers(prev => prev.map(d => d.id === editingDriver.id ? updated : d));
        toast.success("Data driver diperbarui!", { id: toastId });
      } else {
        // Create Driver baru memerlukan Outlet ID
        const created = await driverService.createDriver(DEFAULT_OUTLET_ID, payload);
        setDrivers(prev => [created, ...prev]); 
        toast.success("Driver baru berhasil didaftarkan!", { id: toastId });
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Gagal menyimpan data driver.", { id: toastId });
    }
  };

  const handleDelete = async (id: number) => {
    confirmAlert("Yakin ingin menghapus driver ini?", async () => {
      const toastId = toast.loading("Menghapus...");
      try {
        await driverService.deleteDriver(id);
        setDrivers(prev => prev.filter(d => d.id !== id));
        toast.success("Driver dihapus.", { id: toastId });
      } catch (error) {
        toast.error("Gagal menghapus driver.", { id: toastId });
      }
    }, { title: "Hapus Driver", type: "danger", confirmText: "Ya, Hapus" });
  };

  return (
    <>
      <AdminHeader title="Driver Management" onRefresh={fetchDrivers} />

      <main className="p-8 pb-32 space-y-8 animate-in fade-in duration-500 bg-surface-300 min-h-screen">
        
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Manajemen Driver</h1>
          <p className="text-sm text-neutral-500 mt-1">Kelola pendaftaran, status, dan kinerja kurir.</p>
        </div>

        <DriverToolbar 
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
          onAdd={() => handleOpenModal()}
        />

        {isLoading ? (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="animate-spin text-primary-600" size={40} />
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDrivers.map((driver) => (
                <DriverCard 
                key={driver.id} 
                driver={driver} 
                onEdit={handleOpenModal} 
                onDelete={handleDelete}
                />
            ))}
            {filteredDrivers.length === 0 && (
                <div className="col-span-full py-20 text-center text-neutral-400">
                <p>Tidak ada driver yang ditemukan.</p>
                </div>
            )}
            </div>
        )}

        <DriverFormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleSave} 
          initialData={editingDriver}
        />

      </main>
    </>
  );
}
