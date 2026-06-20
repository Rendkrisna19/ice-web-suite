"use client";

import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { Search, Plus, X, Loader2, LayoutGrid, SearchX } from "lucide-react";
import { DiningTable } from "@/types/table";
import { tableService } from "./services/tableService";
import { confirmAlert } from "@/utils/alert";

import POSSidebar from "../orders/components/POSSidebar";
import POSHeader from "../orders/components/POSHeader";
import TableCard from "./components/TableCard";
import TableFormModal from "./components/TableFormModal";
import QrCodeModal from "./components/QrCodeModal";
import TableBillModal from "./components/TableBillModal";

export default function TablesBoard() {
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<DiningTable | null>(null);

  const [qrTable, setQrTable] = useState<DiningTable | null>(null);
  const [billTable, setBillTable] = useState<DiningTable | null>(null);

  const fetchTables = async () => {
    try {
      const data = await tableService.getTables();
      setTables(data);
    } catch {
      toast.error("Gagal memuat data meja");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleSave = async (data: { name: string; capacity: number | null }, isEdit: boolean, id?: number) => {
    const loadingId = toast.loading(isEdit ? "Menyimpan perubahan..." : "Membuat meja baru...");
    try {
      if (isEdit && id) {
        await tableService.updateTable(id, data);
        toast.success("Meja berhasil diperbarui!", { id: loadingId });
      } else {
        await tableService.createTable(data);
        toast.success("Meja berhasil dibuat!", { id: loadingId });
      }
      await fetchTables();
      setIsFormOpen(false);
      setSelectedTable(null);
    } catch {
      toast.error("Gagal menyimpan meja", { id: loadingId });
    }
  };

  const handleDelete = (table: DiningTable) => {
    confirmAlert(
      `Hapus ${table.name}? QR code meja ini tidak akan berfungsi lagi.`,
      async () => {
        const loadingId = toast.loading("Menghapus meja...");
        try {
          await tableService.deleteTable(table.id);
          setTables((prev) => prev.filter((t) => t.id !== table.id));
          toast.success("Meja berhasil dihapus!", { id: loadingId });
        } catch {
          toast.error("Gagal menghapus meja", { id: loadingId });
        }
      },
      { title: "Hapus Meja", type: "danger", confirmText: "Ya, Hapus" }
    );
  };

  const handleRegenerateQr = async (id: number) => {
    const loadingId = toast.loading("Membuat ulang QR code...");
    try {
      const updated = await tableService.regenerateQr(id);
      setTables((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setQrTable(updated);
      toast.success("QR code berhasil diperbarui!", { id: loadingId });
    } catch {
      toast.error("Gagal membuat ulang QR code", { id: loadingId });
    }
  };

  const filteredTables = useMemo(
    () => tables.filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [tables, searchQuery]
  );

  return (
    <div className="fixed inset-0 z-50 bg-surface-300 flex flex-col font-sans overflow-hidden">
      <POSSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <POSHeader onMenuClick={() => setIsSidebarOpen(true)} />

      <TableFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedTable(null); }}
        onSave={handleSave}
        initialData={selectedTable}
      />
      <QrCodeModal
        isOpen={!!qrTable}
        onClose={() => setQrTable(null)}
        table={qrTable}
        onRegenerate={handleRegenerateQr}
      />
      <TableBillModal
        isOpen={!!billTable}
        onClose={() => setBillTable(null)}
        table={billTable}
        onClosed={fetchTables}
      />

      {/* CONTROL BAR */}
      <div className="bg-white/60 backdrop-blur-md border-b border-white/50 p-3 md:px-6 sticky top-0 z-30 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="relative group w-full md:max-w-xs">
            <div className="absolute left-0 top-0 h-full w-10 flex items-center justify-center pointer-events-none z-10">
              <Search className="text-neutral-400" size={18} />
            </div>
            <input
              type="text"
              placeholder="Cari meja..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-surface-100 border-2 border-transparent focus:bg-white focus:border-[#15423C]/30 rounded-xl outline-none text-sm font-semibold text-neutral-800 placeholder:text-neutral-400 transition-all duration-300 shadow-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-neutral-200 text-neutral-500 hover:bg-red-100 hover:text-red-600 transition-all">
                <X size={14} strokeWidth={3} />
              </button>
            )}
          </div>

          <button
            onClick={() => { setSelectedTable(null); setIsFormOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#15423C] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#15423C]/20 hover:bg-[#0f302b] transition-all active:scale-95 w-full md:w-auto justify-center"
          >
            <Plus size={18} strokeWidth={2.5} />
            Tambah Meja
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        {isLoading ? (
          <div className="h-[50vh] flex items-center justify-center text-[#15423C]">
            <Loader2 size={40} className="animate-spin" />
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="h-[50vh] flex flex-col items-center justify-center text-neutral-400">
            <div className="bg-surface-200 p-5 rounded-full mb-4">
              {tables.length === 0 ? <LayoutGrid size={40} className="opacity-50" /> : <SearchX size={40} className="opacity-50" />}
            </div>
            <h3 className="text-base font-bold text-neutral-600">
              {tables.length === 0 ? "Belum ada meja. Tambahkan meja pertama Anda." : "Meja tidak ditemukan"}
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-20">
            {filteredTables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                onEdit={(t) => { setSelectedTable(t); setIsFormOpen(true); }}
                onDelete={handleDelete}
                onShowQr={setQrTable}
                onShowBill={setBillTable}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
