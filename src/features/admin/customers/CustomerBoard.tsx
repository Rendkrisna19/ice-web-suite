"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Customer, CustomerStatus } from "@/types/customer";
import { customerService } from "@/features/admin/customers/services/customerService";
import { confirmAlert } from "@/utils/alert";

// Shared Components
import AdminHeader from "@/features/admin/components/AdminHeader";

// Local Components
import CustomerToolbar from "./components/CustomerToolbar";
import CustomerTable from "./components/CustomerTable";

export default function CustomerBoard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<CustomerStatus | "all">("all");
  const [search, setSearch] = useState("");

  // --- FETCH DATA ---
  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await customerService.getCustomers();
      const mappedData: Customer[] = data.map(c => ({
        ...c,
        status: (c.status || "active") as CustomerStatus,
        phone: c.phone || "-",
        total_spent: 0,
        avatar: c.avatar || c.profile_image || `https://ui-avatars.com/api/?name=${c.name}&background=random`
      }));
      setCustomers(mappedData);
    } catch (error) {
      toast.error("Gagal memuat data pelanggan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // --- LOGIC FILTERING ---
  const filteredCustomers = customers.filter((cust) => {
    const matchStatus = filter === "all" ? true : cust.status === filter;
    
    const term = search.toLowerCase();
    const matchSearch = 
        cust.name.toLowerCase().includes(term) || 
        cust.email.toLowerCase().includes(term) ||
        (cust.phone && cust.phone.includes(term));
        
    return matchStatus && matchSearch;
  });

  // --- HANDLERS ---
  const handleBlockToggle = async (id: number, currentStatus: string) => {
    const isBlocking = currentStatus === "active";
    const actionText = isBlocking ? "memblokir" : "mengaktifkan kembali";

    confirmAlert(
      `Apakah Anda yakin ingin ${actionText} pelanggan ini?`,
      async () => {
        const toastId = toast.loading(isBlocking ? "Memblokir pelanggan..." : "Mengaktifkan pelanggan...");
        try {
          const updatedCustomer = await customerService.toggleBlock(id);
          
          setCustomers(prev => prev.map(c =>
            c.id === id ? { ...c, status: updatedCustomer.status as CustomerStatus } : c
          ));

          if (updatedCustomer.status === "blocked") {
            toast.success("Pelanggan berhasil diblokir.", { id: toastId, icon: '🚫' });
          } else {
            toast.success("Pelanggan berhasil diaktifkan kembali.", { id: toastId, icon: '✅' });
          }
        } catch (error) {
          toast.error("Gagal mengubah status pelanggan.", { id: toastId });
        }
      },
      {
        title: isBlocking ? "Blokir Pelanggan" : "Aktifkan Pelanggan",
        type: isBlocking ? "danger" : "info",
        confirmText: isBlocking ? "Ya, Blokir" : "Ya, Aktifkan",
      }
    );
  };

  const handleDelete = async (id: number) => {
    confirmAlert("Apakah Anda yakin ingin menghapus pelanggan ini secara permanen?", async () => {
      const toastId = toast.loading("Menghapus...");
      try {
        await customerService.deleteCustomer(id);
        setCustomers(prev => prev.filter(c => c.id !== id));
        toast.success("Data pelanggan dihapus.", { id: toastId });
      } catch (error) {
        toast.error("Gagal menghapus pelanggan.", { id: toastId });
      }
    }, { title: "Hapus Pelanggan", type: "danger", confirmText: "Ya, Hapus" });
  };

  return (
    <>
      <AdminHeader title="Customer Management" onRefresh={fetchCustomers} />

      <main className="p-8 pb-32 space-y-8 animate-in fade-in duration-500 bg-surface-300 min-h-screen">
        
        {/* Header Title */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Data Pelanggan</h1>
          <p className="text-sm text-neutral-500 mt-1">Pantau aktivitas, riwayat belanja, dan status pengguna.</p>
        </div>

        {/* Toolbar */}
        <CustomerToolbar 
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
        />

        {/* Table List */}
        {isLoading ? (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="animate-spin text-primary-600" size={40} />
            </div>
        ) : (
            <CustomerTable 
              customers={filteredCustomers}
              onBlock={handleBlockToggle}
              onDelete={handleDelete}
            />
        )}

      </main>
    </>
  );
}
