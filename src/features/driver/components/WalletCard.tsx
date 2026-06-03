"use client";

import { Wallet, ChevronRight } from "lucide-react";

interface WalletCardProps {
  balance?: number;
}

export default function WalletCard({ balance = 0 }: WalletCardProps) {
  return (
    <div className="mx-6 mt-6 bg-white rounded-3xl p-5 shadow-sm border border-surface-200 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-secondary-50 text-secondary-500 flex items-center justify-center">
          <Wallet size={24} />
        </div>
        <div>
          <p className="text-xs text-neutral-400 font-medium mb-0.5">Saldo Dompet</p>
          <h3 className="text-xl font-bold text-neutral-800">
             Rp {balance.toLocaleString("id-ID")}
          </h3>
        </div>
      </div>
      <button className="p-2 rounded-full hover:bg-surface-50 text-neutral-400 transition-colors">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}