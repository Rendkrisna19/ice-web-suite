"use client";

import { useState, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import { Search, Utensils, Pizza, Coffee, SearchX, Plus, X, Loader2 } from "lucide-react";
import { MenuItem, ProductCategory } from "@/types/product";
import { cn } from "@/utils/cn";
import { menuService } from "./services/menuService";
import { confirmAlert } from "@/utils/alert";

import MenuCard from "./components/MenuCard";
import POSSidebar from "../orders/components/POSSidebar"; 
import POSHeader from "../orders/components/POSHeader"; 
import AddMenuModal from "./components/AddMenuModal";

type FilterCategoryType = "all" | ProductCategory;

export default function MenuBoard() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<FilterCategoryType>("all");
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null); // State untuk Edit

  // --- FETCH DATA ---
  const fetchMenus = async () => {
    try {
      const data = await menuService.getProducts();
      setMenus(data);
    } catch (error) {
      console.error("Gagal load menu", error);
      toast.error("Gagal memuat data menu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  // --- LOGIC ADD & EDIT MENU ---
  const handleSaveMenu = async (menuData: any, isEdit: boolean, id?: string | number) => {
    const loadingId = toast.loading(isEdit ? "Menyimpan perubahan..." : "Menyimpan menu baru...");
    
    try {
      if (isEdit && id) {
        // UPDATE (EDIT)
        await menuService.updateProduct(id, {
          name: menuData.name,
          price: String(menuData.price),
          cost_price: menuData.cost_price,
          category: menuData.category,
          image: menuData.imageFile,
          description: menuData.description,
          is_available: menuData.is_available,
        });
        toast.success("Menu berhasil diperbarui!", { id: loadingId });
      } else {
        // CREATE (TAMBAH)
        await menuService.createProduct({
          name: menuData.name,
          price: String(menuData.price),
          cost_price: menuData.cost_price,
          category: menuData.category,
          image: menuData.imageFile,
          description: menuData.description,
          is_available: menuData.is_available,
        });
        toast.success("Menu berhasil ditambahkan!", { id: loadingId });
      }

      await fetchMenus(); 
      handleCloseModal();

    } catch (error) {
      console.error(error);
      toast.error(isEdit ? "Gagal memperbarui menu" : "Gagal menyimpan menu", { id: loadingId });
    }
  };

  // --- LOGIC DELETE MENU ---
  const handleDeleteMenu = async (id: string) => {
    confirmAlert("Apakah Anda yakin ingin menghapus menu ini secara permanen?", async () => {
      const loadingId = toast.loading("Menghapus menu...");
      try {
        await menuService.deleteProduct(id);
        toast.success("Menu berhasil dihapus!", { id: loadingId });
        
        // Update UI tanpa fetch ulang (lebih cepat)
        setMenus(prev => prev.filter(m => String(m.id) !== id));
      } catch (error) {
        toast.error("Gagal menghapus menu. Menu mungkin sedang digunakan di pesanan aktif.", { id: loadingId });
      }
    }, { title: "Hapus Menu", type: "danger", confirmText: "Ya, Hapus" });
  };

  // --- OPEN / CLOSE MODAL HELPERS ---
  const handleOpenAddModal = () => {
    setSelectedMenu(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setSelectedMenu(item);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedMenu(null);
    setIsAddModalOpen(false);
  };

  // --- LOGIC TOGGLE STOK ---
  const toggleAvailability = async (id: string) => {
    const targetItem = menus.find((item) => String(item.id) === String(id));
    if (!targetItem) return;

    const oldStatus = targetItem.is_available;
    const newStatus = !oldStatus;

    setMenus((prev) =>
      prev.map((item) => String(item.id) === String(id) ? { ...item, is_available: newStatus } : item)
    );

    try {
      await menuService.toggleStatus(id);
      if (newStatus) {
        toast.success(`Stok ${targetItem.name} AKTIF`);
      } else {
        toast.error(`Stok ${targetItem.name} NON-AKTIF`);
      }
    } catch (error) {
      setMenus((prev) =>
        prev.map((item) => String(item.id) === String(id) ? { ...item, is_available: oldStatus } : item)
      );
      toast.error("Gagal mengubah status stok");
    }
  };

  // --- LOGIC FILTER ---
  const filteredMenus = useMemo(() => {
    return menus.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = filterCategory === "all" || item.category === filterCategory;
      return matchSearch && matchCategory;
    });
  }, [menus, searchQuery, filterCategory]);

  const categories = [
    { id: "all", label: "Semua", icon: <Utensils size={14}/> },
    { id: "makanan", label: "Makanan", icon: <Pizza size={14}/> },
    { id: "minuman", label: "Minuman", icon: <Coffee size={14}/> },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-surface-300 flex flex-col font-sans overflow-hidden">
      
      <POSSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <POSHeader onMenuClick={() => setIsSidebarOpen(true)} />

      <AddMenuModal 
        isOpen={isAddModalOpen} 
        onClose={handleCloseModal} 
        onSave={handleSaveMenu} 
        initialData={selectedMenu} // Prop baru untuk mode EDIT
      />

      {/* CONTROL BAR */}
      <div className="bg-white/60 backdrop-blur-md border-b border-white/50 p-3 md:px-6 sticky top-0 z-30 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">

            {/* Search Input */}
            <div className="relative group w-full md:max-w-xs"> 
              <div className="absolute left-0 top-0 h-full w-10 flex items-center justify-center pointer-events-none z-10">
                <Search className="text-neutral-400 group-focus-within:text-primary-600 transition-colors duration-300" size={18} />
              </div>

              <input 
                type="text" 
                placeholder="Cari menu favorit..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-surface-100 border-2 border-transparent focus:bg-white focus:border-primary-500/30 rounded-xl outline-none text-sm font-semibold text-neutral-800 placeholder:text-neutral-400 transition-all duration-300 shadow-sm"
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-neutral-200 text-neutral-500 hover:bg-danger-100 hover:text-danger-600 transition-all focus:outline-none"
                >
                    <X size={14} strokeWidth={3} />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex justify-center">
                <div className="flex bg-surface-100 p-1 rounded-full border border-white/60 shadow-inner">
                    {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setFilterCategory(cat.id as FilterCategoryType)}
                        className={cn(
                        "flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300",
                        filterCategory === cat.id 
                            ? "bg-primary-500 text-white shadow-md transform scale-105" 
                            : "text-neutral-500 hover:bg-surface-200 hover:text-neutral-700"
                        )}
                    >
                        {cat.icon} {cat.label}
                    </button>
                    ))}
                </div>
            </div>

            {/* Tombol Tambah Menu */}
            <div className="flex justify-end">
               <button 
                 onClick={handleOpenAddModal}
                 className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-500/20 hover:bg-primary-600 hover:shadow-primary-600/30 transition-all active:scale-95"
               >
                 <Plus size={18} strokeWidth={2.5} />
                 <span className="hidden lg:inline">Menu Baru</span>
                 <span className="lg:hidden">Baru</span>
               </button>
            </div>

        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        {isLoading ? (
            <div className="h-[50vh] flex items-center justify-center text-primary-500">
                <Loader2 size={40} className="animate-spin" />
            </div>
        ) : (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 pb-20">
                  {filteredMenus.map((item) => (
                    <MenuCard 
                      key={item.id} 
                      item={item} 
                      onToggle={toggleAvailability} 
                      onEdit={handleOpenEditModal} // Passing ke card
                      onDelete={handleDeleteMenu}  // Passing ke card
                    />
                  ))}
                </div>

                {filteredMenus.length === 0 && (
                  <div className="h-[50vh] flex flex-col items-center justify-center text-neutral-400">
                    <div className="bg-surface-200 p-5 rounded-full mb-4">
                       <SearchX size={40} className="opacity-50" />
                    </div>
                    <h3 className="text-base font-bold text-neutral-600">Menu tidak ditemukan</h3>
                  </div>
                )}
            </>
        )}
      </main>

    </div>
  );
}
