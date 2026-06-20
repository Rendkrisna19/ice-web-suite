"use client";

import { useState, useEffect } from "react";
import { X, Plus, Save } from "lucide-react";
import { cn } from "@/utils/cn";
import { DiningTable } from "@/types/table";

interface TableFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; capacity: number | null }, isEdit: boolean, id?: number) => void;
  initialData?: DiningTable | null;
}

export default function TableFormModal({ isOpen, onClose, onSave, initialData }: TableFormModalProps) {
  const isEditMode = !!initialData;
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");

  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name);
      setCapacity(initialData.capacity ? String(initialData.capacity) : "");
    } else if (isOpen && !initialData) {
      setName("");
      setCapacity("");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onSave({ name, capacity: capacity ? Number(capacity) : null }, isEditMode, initialData?.id);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-surface-200 flex justify-between items-center">
          <h3 className="font-bold text-lg text-neutral-800 flex items-center gap-2">
            <div className={cn("p-1.5 rounded-lg", isEditMode ? "bg-blue-100 text-blue-600" : "bg-[#15423C]/10 text-[#15423C]")}>
              {isEditMode ? <Save size={18} /> : <Plus size={18} />}
            </div>
            {isEditMode ? "Edit Meja" : "Tambah Meja Baru"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-100 text-neutral-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form id="tableForm" onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Nama Meja</label>
            <input
              type="text"
              placeholder="Contoh: Meja 1 / VIP 2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-surface-50 border border-surface-300 rounded-xl focus:ring-2 focus:ring-[#15423C]/20 focus:border-[#15423C] outline-none text-sm font-medium transition-all"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Kapasitas (Opsional)</label>
            <input
              type="number"
              placeholder="Contoh: 4"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full p-3 bg-surface-50 border border-surface-300 rounded-xl focus:ring-2 focus:ring-[#15423C]/20 focus:border-[#15423C] outline-none text-sm font-medium transition-all"
            />
          </div>
        </form>

        <div className="p-5 bg-surface-50 border-t border-surface-200 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-surface-300 text-neutral-600 font-bold text-sm hover:bg-white transition-colors">
            Batal
          </button>
          <button
            type="submit"
            form="tableForm"
            className={cn(
              "flex-[2] py-3 rounded-xl text-white font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2",
              isEditMode ? "bg-blue-600 hover:bg-blue-700" : "bg-[#15423C] hover:bg-[#0f302b]"
            )}
          >
            {isEditMode ? <Save size={18} /> : <Plus size={18} />}
            {isEditMode ? "Simpan Perubahan" : "Simpan Meja"}
          </button>
        </div>
      </div>
    </div>
  );
}
