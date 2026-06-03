"use client";

import { Ban, Trash2, CheckCircle2, ShoppingBag } from "lucide-react";
import { Customer } from "@/types/customer";
import { cn } from "@/utils/cn";
import Image from "next/image";

interface CustomerTableProps {
  customers: Customer[];
  onBlock: (id: number, currentStatus: string) => void;
  onDelete: (id: number) => void;
}

export default function CustomerTable({ customers, onBlock, onDelete }: CustomerTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          
          {/* Header Tabel */}
          <thead className="bg-surface-50 text-neutral-500 uppercase text-[10px] font-bold tracking-widest border-b border-surface-200">
            <tr>
              <th className="px-6 py-5">Info Pelanggan</th>
              <th className="px-6 py-5">Kontak</th>
              <th className="px-6 py-5">Statistik Belanja</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5 text-center">Aksi</th>
            </tr>
          </thead>

          {/* Body Tabel */}
          <tbody className="divide-y divide-surface-100">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-surface-50 transition-colors">
                
                {/* 1. Info Pelanggan */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-200 overflow-hidden border border-surface-300">
                      <Image 
                        src={customer.avatar || `https://ui-avatars.com/api/?name=${customer.name}&background=random`} 
                        alt={customer.name} 
                        width={40} 
                        height={40} 
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-800">{customer.name}</h4>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Bergabung: {new Date(customer.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </td>

                {/* 2. Kontak */}
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-neutral-700 font-medium">{customer.email}</span>
                    <span className="text-xs text-neutral-400 mt-0.5">{customer.phone || "-"}</span>
                  </div>
                </td>

                {/* 3. Statistik Belanja */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                         <ShoppingBag size={12} className="text-[#15423C]" />
                         <span className="font-bold text-neutral-800">{customer.orders_count} Order</span>
                      </div>
                      <span className="text-xs font-medium text-neutral-500 bg-surface-100 px-2 py-0.5 rounded-md w-fit">
                         Total: Rp {(customer.total_spent || 0).toLocaleString("id-ID")}
                      </span>
                  </div>
                </td>

                {/* 4. Status */}
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                    customer.status === "active" 
                      ? "bg-green-50 text-green-700 border-green-100" 
                      : "bg-red-50 text-red-700 border-red-100"
                  )}>
                    {customer.status === "active" ? "Aktif" : "Diblokir"}
                  </span>
                </td>

                {/* 5. Aksi (TOMBOL SELALU MUNCUL) */}
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    
                    {/* Tombol Block/Unblock */}
                    <button 
                      onClick={() => onBlock(customer.id, customer.status || "active")}
                      className={cn(
                        "p-2 rounded-lg border transition-colors",
                        customer.status === "active" 
                           ? "bg-white border-surface-200 text-neutral-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100"
                           : "bg-green-50 border-green-100 text-green-600 hover:bg-green-100"
                      )}
                      title={customer.status === "active" ? "Blokir User" : "Aktifkan User"}
                    >
                      {customer.status === "active" ? <Ban size={16} /> : <CheckCircle2 size={16} />}
                    </button>

                    {/* Tombol Hapus */}
                    <button 
                      onClick={() => onDelete(customer.id)}
                      className="p-2 bg-white border border-surface-200 text-neutral-400 rounded-lg hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors"
                      title="Hapus Permanen"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>
                </td>

              </tr>
            ))}

            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-20 text-center text-neutral-400">
                  Tidak ada data pelanggan yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}