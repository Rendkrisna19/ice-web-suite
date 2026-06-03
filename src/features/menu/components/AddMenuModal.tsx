"use client";

import { useState, useEffect } from "react";
import { X, Plus, UploadCloud, Utensils, Coffee, CheckCircle2, Save } from "lucide-react";
import { cn } from "@/utils/cn";
import { MenuItem } from "@/types/product";

interface AddMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newMenu: any, isEdit: boolean, id?: string | number) => void; 
  initialData?: MenuItem | null; // Data awal jika mode EDIT
}

export default function AddMenuModal({ isOpen, onClose, onSave, initialData }: AddMenuModalProps) {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    cost_price: "",
    category: "makanan", // Perbaikan: Langsung pakai makanan/minuman agar sinkron
    description: "",
    is_available: true,
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Helper mapping image URL
  const getImageUrl = (path?: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) {
      // Patch: jika ada double storage, ganti jadi single
      return path.replace("/storage/storage/", "/storage/");
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://linen-deer-529188.hostingersite.com";
    const baseUrl = apiUrl.split('/api')[0].replace(/\/$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  };

  // Jika modal terbuka dan ada initialData, isi form-nya (Mode Edit)
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name,
        price: String(initialData.price),
        cost_price: initialData.cost_price ? String(initialData.cost_price) : "",
        category: initialData.category || "makanan",
        description: initialData.description || "",
        is_available: initialData.is_available ?? true,
      });
      setPreviewUrl(getImageUrl(initialData.image_url));
    } else if (isOpen && !initialData) {
      // Reset form jika mode Tambah
      setFormData({ name: "", price: "", cost_price: "", category: "makanan", description: "", is_available: true });
      setPreviewUrl(null);
    }
    setSelectedFile(null);
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    onSave({
      name: formData.name,
      price: formData.price,
      cost_price: formData.cost_price,
      category: formData.category,
      description: formData.description,
      is_available: formData.is_available,
      imageFile: selectedFile 
    }, isEditMode, initialData?.id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Buat preview lokal
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface-100 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/50 flex flex-col max-h-[90vh]">
        
        <div className="p-5 border-b border-surface-200 flex justify-between items-center bg-white shrink-0">
          <h3 className="font-bold text-lg text-neutral-800 flex items-center gap-2">
            <div className={cn("p-1.5 rounded-lg", isEditMode ? "bg-blue-100 text-blue-600" : "bg-[#15423C]/10 text-[#15423C]")}>
              {isEditMode ? <Save size={18} /> : <Plus size={18} />}
            </div>
            {isEditMode ? "Edit Menu Produk" : "Tambah Menu Baru"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-200 text-neutral-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar">
          <form id="addMenuForm" onSubmit={handleSubmit} className="p-6 space-y-5">
            
            <div className="space-y-1.5">
                          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Status Ketersediaan</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={formData.is_available}
                              onChange={e => setFormData({ ...formData, is_available: e.target.checked })}
                              className="accent-[#15423C] w-4 h-4"
                              id="isAvailableCheckbox"
                            />
                            <label htmlFor="isAvailableCheckbox" className="text-sm font-medium text-neutral-700">Tersedia</label>
                          </div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Nama Produk</label>
              <input 
                type="text" 
                placeholder="Contoh: Nasi Goreng Spesial" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 bg-white border border-surface-300 rounded-xl focus:ring-2 focus:ring-[#15423C]/20 focus:border-[#15423C] outline-none text-sm font-medium transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Harga Jual (Rp)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs">Rp</span>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full pl-8 p-3 bg-white border border-surface-300 rounded-xl focus:ring-2 focus:ring-[#15423C]/20 focus:border-[#15423C] outline-none text-sm font-bold transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Harga Modal (Rp)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs">Rp</span>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={formData.cost_price}
                    onChange={(e) => setFormData({...formData, cost_price: e.target.value})}
                    className="w-full pl-8 p-3 bg-white border border-surface-300 rounded-xl focus:ring-2 focus:ring-[#15423C]/20 focus:border-[#15423C] outline-none text-sm font-bold transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Kategori</label>
                <div className="flex bg-surface-200 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, category: "makanan"})}
                    className={cn(
                      "flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-bold transition-all",
                      formData.category === "makanan" ? "bg-white text-[#15423C] shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                    )}
                  >
                    <Utensils size={14} className="mr-1"/> Makanan
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, category: "minuman"})}
                    className={cn(
                      "flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-bold transition-all",
                      formData.category === "minuman" ? "bg-white text-[#15423C] shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                    )}
                  >
                    <Coffee size={14} className="mr-1"/> Minuman
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Deskripsi (Opsional)</label>
              <textarea 
                placeholder="Contoh: Nasi goreng dengan bumbu rahasia..." 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-3 bg-white border border-surface-300 rounded-xl focus:ring-2 focus:ring-[#15423C]/20 focus:border-[#15423C] outline-none text-sm font-medium transition-all resize-none min-h-[80px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Foto Produk</label>
              <label className="border-2 border-dashed border-surface-300 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-50 hover:border-[#15423C]/50 transition-colors group relative block w-full overflow-hidden">
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                
                {previewUrl ? (
                  <div className="flex flex-col items-center w-full">
                    <img src={previewUrl} alt="Preview" className="h-24 object-contain mb-2 rounded-lg shadow-sm" />
                    <p className="text-xs font-bold text-[#15423C] truncate w-full">{selectedFile ? selectedFile.name : "Gambar Saat Ini"}</p>
                    <p className="text-[10px] text-neutral-400 mt-1">Klik untuk mengganti gambar</p>
                  </div>
                ) : (
                  <>
                    <div className="p-3 bg-[#15423C]/5 rounded-full text-[#15423C]/60 mb-2 group-hover:scale-110 group-hover:text-[#15423C] transition-all">
                      <UploadCloud size={24} />
                    </div>
                    <p className="text-xs font-bold text-neutral-600">Klik untuk Upload Foto</p>
                    <p className="text-[10px] text-neutral-400 mt-1">PNG, JPG up to 2MB</p>
                  </>
                )}
              </label>
            </div>

          </form>
        </div>

        <div className="p-5 bg-white border-t border-surface-200 flex gap-3 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-surface-300 text-neutral-600 font-bold text-sm hover:bg-surface-50 transition-colors"
          >
            Batal
          </button>
          
          <button 
            type="submit"
            form="addMenuForm"
            className={cn(
              "flex-[2] py-3 rounded-xl text-white font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2",
              isEditMode ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20" : "bg-[#15423C] hover:bg-[#0f302b] shadow-[#15423C]/20"
            )}
          >
            {isEditMode ? <Save size={18} /> : <Plus size={18} />} 
            {isEditMode ? "Simpan Perubahan" : "Simpan Produk"}
          </button>
        </div>

      </div>
    </div>
  );
}
