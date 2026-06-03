"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Loader2, Utensils } from "lucide-react";
import { MenuItem } from "@/types/menu"; 
import { menuService } from "@/features/admin/menu/services/menuService"; // Pastikan path benar
import { confirmAlert } from "@/utils/alert";

import AdminHeader from "@/features/admin/components/AdminHeader";
import MenuCard from "./components/MenuCard";
import MenuToolbar from "./components/MenuToolbar";
import MenuFormModal from "./components/MenuFormModal"; 

export default function MenuBoard() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filter, setFilter] = useState<string>("all"); 
  const [search, setSearch] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  
  // DEFAULT_OUTLET_ID digunakan HANYA untuk mengambil data awal (sebagai preview)
  // Logic Create/Update sudah menggunakan endpoint Global di dalam Modal
  const PREVIEW_OUTLET_ID = 2; 

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      // Mengambil menu dari salah satu outlet untuk ditampilkan di list admin
      // Idealnya nanti ada endpoint: await menuService.getAllGlobalMenus();
      const data = await menuService.getMenuByOutlet(PREVIEW_OUTLET_ID);
      setMenus(data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Gagal memuat data menu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredMenus = menus.filter((menu) => {
    const matchCategory = filter === "all" ? true : menu.category === filter;
    const matchSearch = menu.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleOpenModal = (menu?: MenuItem) => {
    setEditingMenu(menu || null);
    setIsModalOpen(true);
  };

  // Callback dari Modal setelah sukses Create/Update
  const handleModalSuccess = (updatedMenu: MenuItem, isEdit: boolean) => {
    if (isEdit) {
        // Update item di list
        setMenus(prev => prev.map(m => m.id === updatedMenu.id ? updatedMenu : m));
    } else {
        // Tambah item baru ke list
        setMenus(prev => [updatedMenu, ...prev]);
        // Opsional: fetch ulang agar ID sinkron jika perlu
        // fetchProducts(); 
    }
    // Modal akan ditutup oleh komponen modal sendiri
  };

  const handleDelete = async (id: number) => {
    confirmAlert("Yakin ingin menghapus menu ini? Ini akan menghapus dari semua outlet!", async () => {
      const toastId = toast.loading("Menghapus...");
      try {
        await menuService.deleteMenu(id);
        setMenus(prev => prev.filter(m => m.id !== id));
        toast.success("Menu dihapus dari sistem", { id: toastId });
      } catch (error) {
        console.error(error);
        toast.error("Gagal menghapus menu", { id: toastId });
      }
    }, { title: "Hapus Menu", type: "danger", confirmText: "Ya, Hapus" });
  };

  const handleToggleStatus = async (id: number) => {
    const menuToUpdate = menus.find(m => m.id === id);
    if (!menuToUpdate) return;

    // 1. Optimistic Update (Ubah UI dulu)
    const newStatus = !menuToUpdate.is_available;
    setMenus(prev => prev.map(m => m.id === id ? { ...m, is_available: newStatus } : m));
    
    try {
        // 2. Panggil API (gunakan status LAMA agar backend mentoggle-nya, atau kirim status BARU tergantung logic backend)
        // Di service kamu: logicnya menerima 'currentStatus' lalu mengirim kebalikan.
        // Jadi kita kirim status SEBELUM berubah (menuToUpdate.is_available)
        await menuService.toggleStatus(id, Boolean(menuToUpdate.is_available));
        
        toast.success(`Menu ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
    } catch (error) {
        // 3. Revert jika gagal
        setMenus(prev => prev.map(m => m.id === id ? { ...m, is_available: !!menuToUpdate.is_available } : m));
        toast.error("Gagal mengubah status menu.");
    }
  };

  return (
    <>
      <AdminHeader title="Menu Management" onRefresh={fetchProducts} />

      <main className="p-8 pb-32 space-y-8 animate-in fade-in duration-500 bg-surface-300 min-h-screen">
        
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Daftar Menu Global</h1>
          <p className="text-sm text-neutral-500 mt-1">
             Menambah menu di sini akan otomatis menambahkannya ke semua outlet merchant.
          </p>
        </div>

        <MenuToolbar 
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
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {filteredMenus.length > 0 ? (
                filteredMenus.map((menu) => (
                  <MenuCard 
                    key={menu.id} 
                    item={menu} 
                    onEdit={() => handleOpenModal(menu)} 
                    onDelete={() => handleDelete(menu.id)}
                    onToggleStatus={() => handleToggleStatus(menu.id)}
                  />
                ))
             ) : (
                <div className="col-span-full py-20 text-center text-neutral-400 bg-surface-100 rounded-3xl border border-dashed border-surface-300">
                  <Utensils size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-medium">Tidak ada menu yang ditemukan.</p>
                  <p className="text-xs mt-1">Coba kata kunci lain atau tambah menu baru.</p>
                </div>
             )}
           </div>
        )}

        <MenuFormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleModalSuccess} 
          initialData={editingMenu}
        />

      </main>
    </>
  );
}
