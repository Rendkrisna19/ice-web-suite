"use client";

import { X, UploadCloud, Utensils, Coffee, Loader2 } from "lucide-react";
import { MenuItem, MenuCategory } from "@/types/menu";
import { cn } from "@/utils/cn";
import { useState, useRef, useEffect } from "react";
import { menuService } from "../services/menuService"; // Pastikan path import benar
import toast from "react-hot-toast";

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Callback saat sukses create/update. Menerima MenuItem yang baru/diupdate
  onSuccess: (menu: MenuItem, isEdit: boolean) => void;
  initialData: MenuItem | null;
}

export default function MenuFormModal({ isOpen, onClose, onSuccess, initialData }: MenuFormModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>("makanan");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form saat modal dibuka/ditutup atau initialData berubah
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setSelectedCategory(initialData.category || "makanan");
        setPreviewImage(initialData.image_url || null);
      } else {
        setSelectedCategory("makanan");
        setPreviewImage(null);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("Menyimpan menu...");

    try {
      const formData = new FormData(e.currentTarget);
      formData.set("category", selectedCategory);

      // Cegah upload file kosong
      const imageFile = formData.get("image") as File;
      if (imageFile && imageFile.size === 0) {
        formData.delete("image");
      }

      let result: MenuItem;

      if (initialData) {
        // --- MODE EDIT ---
        // Panggil service update
        result = await menuService.updateMenu(initialData.id, formData);
        toast.success("Menu berhasil diperbarui!", { id: toastId });
        onSuccess(result, true); // true = isEdit
      } else {
        // --- MODE CREATE (GLOBAL) ---
        // Panggil service createGlobalMenu
        result = await menuService.createGlobalMenu(formData);
        toast.success("Menu global berhasil dibuat!", { id: toastId });
        onSuccess(result, false); // false = isCreate
      }
      
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan menu. Cek koneksi atau input.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden max-h-[90vh] overflow-y-auto">
        
        <div className="px-6 py-5 border-b border-surface-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-neutral-800">
             {initialData ? "Edit Menu Global" : "Tambah Menu Global"}
          </h3>
          <button onClick={onClose} disabled={isLoading} className="p-2 text-neutral-400 hover:bg-surface-50 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
           {/* Nama Produk */}
           <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Nama Produk</label>
              <input 
                name="name" 
                defaultValue={initialData?.name} 
                required 
                disabled={isLoading}
                placeholder="Contoh: Nasi Goreng Spesial" 
                className="w-full p-4 bg-surface-50 border border-surface-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#15423C] focus:ring-4 focus:ring-[#15423C]/10 outline-none transition-all" 
              />
           </div>

           <div className="grid grid-cols-2 gap-5">
              {/* Harga */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Harga (Rp)</label>
                <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-sm">Rp</span>
                   <input 
                      type="number" 
                      name="price"
                      defaultValue={initialData?.price} 
                      required 
                      disabled={isLoading}
                      placeholder="0" 
                      className="w-full pl-10 pr-4 py-3.5 bg-surface-50 border border-surface-200 rounded-xl text-sm font-bold focus:bg-white focus:border-[#15423C] outline-none transition-all" 
                   />
                </div>
              </div>

              {/* Kategori */}
              <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Kategori</label>
                  <div className="flex bg-surface-50 p-1 rounded-xl border border-surface-200">
                     <button 
                       type="button" 
                       disabled={isLoading}
                       onClick={() => setSelectedCategory("makanan")}
                       className={cn(
                         "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all",
                         selectedCategory === "makanan" ? "bg-white text-[#15423C] shadow-sm" : "text-neutral-400 hover:text-neutral-600"
                       )}
                     >
                        <Utensils size={14} /> Makanan
                     </button>
                     <button 
                       type="button" 
                       disabled={isLoading}
                       onClick={() => setSelectedCategory("minuman")}
                       className={cn(
                         "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all",
                         selectedCategory === "minuman" ? "bg-white text-[#15423C] shadow-sm" : "text-neutral-400 hover:text-neutral-600"
                       )}
                     >
                        <Coffee size={14} /> Minuman
                     </button>
                  </div>
              </div>
           </div>

           {/* Deskripsi (Tambahan penting untuk admin) */}
           <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Deskripsi (Opsional)</label>
              <textarea 
                name="description"
                defaultValue={initialData?.description} 
                disabled={isLoading}
                placeholder="Deskripsi menu..." 
                className="w-full p-4 bg-surface-50 border border-surface-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#15423C] outline-none transition-all resize-none h-24" 
              />
           </div>

           {/* Upload Image */}
           <div 
             onClick={() => !isLoading && fileInputRef.current?.click()}
             className="relative border-2 border-dashed border-surface-200 bg-surface-50 rounded-2xl h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-surface-100 hover:border-surface-300 transition-colors group overflow-hidden"
           >
              <input 
                type="file" 
                name="image" 
                ref={fileInputRef}
                onChange={handleImageChange} 
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                accept="image/*" 
                disabled={isLoading}
              />
              {previewImage ? (
                <>
                    <img src={previewImage} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                    <div className="z-10 bg-white/80 px-3 py-1 rounded-full text-xs font-bold text-primary-700 shadow-sm backdrop-blur-sm">Ganti Foto</div>
                </>
              ) : (
                <>
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-[#15423C] mb-3 group-hover:scale-110 transition-transform z-20">
                        <UploadCloud size={24} />
                    </div>
                    <p className="text-sm font-bold text-neutral-600 z-20">Upload Foto Produk</p>
                </>
              )}
           </div>

           {/* Actions */}
           <div className="flex gap-4 pt-2 sticky bottom-0 bg-white pb-2">
              <button 
                type="button" 
                onClick={onClose} 
                disabled={isLoading}
                className="flex-1 py-3.5 border border-surface-200 text-neutral-600 font-bold rounded-xl hover:bg-surface-50 transition-colors"
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 py-3.5 bg-[#15423C] text-white font-bold rounded-xl hover:bg-[#1A534B] transition-colors shadow-lg shadow-[#15423C]/20 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                {isLoading ? (initialData ? "Menyimpan..." : "Buat Global") : (initialData ? "Simpan Perubahan" : "Simpan Produk")}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
}
