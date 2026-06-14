"use client";

import { useState, useMemo } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Search,
} from "lucide-react";
import { TransactionReport } from "../services/reportService";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: TransactionReport[];
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export default function TransactionModal({
  isOpen,
  onClose,
  transactions,
}: TransactionModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter by search
  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
    const term = searchTerm.toLowerCase();
    return transactions.filter(
      (t) =>
        (t.order_number || "").toLowerCase().includes(term) ||
        (t.customer_name || "").toLowerCase().includes(term) ||
        (t.summary || "").toLowerCase().includes(term) ||
        (t.driver_name || "").toLowerCase().includes(term)
    );
  }, [transactions, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  // Reset page when search/filter changes
  const handleSearch = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (val: number) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  };

  const formatRupiah = (amount: number | string) => {
    const cleanNumber = Math.floor(Number(amount));
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cleanNumber);
  };

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-surface-200 bg-surface-50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-neutral-800">
              Riwayat Transaksi
            </h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              Total {filteredTransactions.length} transaksi
              {searchTerm && ` (filter: "${searchTerm}")`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-surface-200 text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search & Controls */}
        <div className="px-4 sm:px-6 py-3 border-b border-surface-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between shrink-0 bg-white">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              placeholder="Cari order, pelanggan, menu..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-surface-100 rounded-xl text-sm border border-surface-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
            />
          </div>

          {/* Items per page */}
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <span>Tampilkan</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="bg-surface-100 border border-surface-200 rounded-lg px-3 py-2 font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              {ITEMS_PER_PAGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span>per halaman</span>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          {paginatedData.length > 0 ? (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-50 text-neutral-500 uppercase tracking-wider text-[10px] font-bold border-b border-surface-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 sm:px-6 py-4">Waktu & Order</th>
                  <th className="px-4 sm:px-6 py-4">Pelanggan</th>
                  <th className="px-4 sm:px-6 py-4 min-w-[200px]">
                    Ringkasan Pesanan
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-right">
                    Pendapatan Kotor
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-right">
                    Keuntungan Bersih
                  </th>
                  <th className="px-4 sm:px-6 py-4">Ongkir & Driver</th>
                  <th className="px-4 sm:px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {paginatedData.map((trx) => (
                  <tr
                    key={trx.id}
                    className="hover:bg-surface-50 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <p className="font-bold text-neutral-800">
                        {trx.order_number}
                      </p>
                      <p className="font-mono text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
                        <Clock size={12} /> {trx.time}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-4 font-bold text-neutral-700">
                      {trx.customer_name}
                    </td>
                    <td
                      className="px-4 sm:px-6 py-4 text-neutral-600 truncate max-w-[250px]"
                      title={trx.summary}
                    >
                      {trx.summary}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right font-bold text-neutral-700">
                      {formatRupiah(trx.revenue)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right font-black text-emerald-600 bg-emerald-50/30">
                      {formatRupiah(trx.net_profit)}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <p className="font-bold text-primary-700">
                        {formatRupiah(trx.delivery_fee)}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Oleh: {trx.driver_name || "-"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <StatusBadge status={trx.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-surface-100 rounded-full text-neutral-400 mb-4">
                <FileText size={32} />
              </div>
              <p className="font-bold text-neutral-700">
                Tidak ada transaksi ditemukan
              </p>
              <p className="text-sm text-neutral-400 mt-1">
                {searchTerm
                  ? "Coba ubah kata kunci pencarian."
                  : "Transaksi yang masuk hari ini akan muncul di sini."}
              </p>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-4 sm:px-6 py-4 border-t border-surface-200 bg-surface-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            {/* Info */}
            <p className="text-sm text-neutral-500">
              Halaman {currentPage} dari {totalPages} (
              {filteredTransactions.length} data)
            </p>

            {/* Controls */}
            <div className="flex items-center gap-1.5">
              {/* First */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-surface-200 bg-white text-neutral-500 hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsLeft size={16} />
              </button>

              {/* Prev */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-surface-200 bg-white text-neutral-500 hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((page, idx) =>
                typeof page === "string" ? (
                  <span
                    key={`dots-${idx}`}
                    className="px-2 text-neutral-400 text-sm"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[36px] h-9 rounded-lg text-sm font-bold transition-colors ${
                      page === currentPage
                        ? "bg-primary-500 text-white shadow-md shadow-primary-500/30"
                        : "bg-white border border-surface-200 text-neutral-600 hover:bg-surface-100"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              {/* Next */}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-surface-200 bg-white text-neutral-500 hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>

              {/* Last */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-surface-200 bg-white text-neutral-500 hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Status Badge Sub-component
function StatusBadge({ status }: { status: string }) {
  const getBadgeStyle = (sts: string) => {
    switch (sts) {
      case "completed":
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "pending":
      case "paid":
      case "preparing":
      case "ready":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "on_delivery":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-surface-100 text-neutral-600 border-surface-200";
    }
  };

  const getIcon = (sts: string) => {
    if (sts === "completed" || sts === "delivered")
      return <CheckCircle2 size={12} />;
    if (sts === "cancelled") return <XCircle size={12} />;
    return <Clock size={12} />;
  };

  const getLabel = (sts: string) => {
    switch (sts) {
      case "completed":
        return "SELESAI";
      case "delivered":
        return "SELESAI";
      case "cancelled":
        return "BATAL";
      case "pending":
        return "BARU MASUK";
      case "paid":
        return "DIBAYAR";
      case "preparing":
        return "DAPUR";
      case "ready":
        return "SIAP ANTAR";
      case "on_delivery":
        return "DIANTAR";
      default:
        return sts.toUpperCase();
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border shadow-sm ${getBadgeStyle(
        status
      )}`}
    >
      {getIcon(status)} {getLabel(status)}
    </span>
  );
}
