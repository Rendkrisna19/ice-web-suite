"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { X, Download, Printer, RefreshCw } from "lucide-react";
import { DiningTable } from "@/types/table";

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: DiningTable | null;
  onRegenerate: (id: number) => void;
}

export default function QrCodeModal({ isOpen, onClose, table, onRegenerate }: QrCodeModalProps) {
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !table) return null;

  const orderUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/order/${table.qr_token}`;

  const handleDownload = () => {
    const canvas = canvasWrapperRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `QR-${table.name.replace(/\s+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 print:bg-white print:relative">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 print:shadow-none print:rounded-none">
        <div className="p-5 border-b border-surface-200 flex justify-between items-center print:hidden">
          <h3 className="font-bold text-lg text-neutral-800">QR Code Meja</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-100 text-neutral-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center" id="qr-print-area">
          <p className="font-black text-xl text-[#15423C] mb-1">{table.name}</p>
          <p className="text-xs text-neutral-400 mb-4">Scan untuk memesan dari meja ini</p>

          <div ref={canvasWrapperRef} className="p-4 bg-white border border-surface-200 rounded-2xl shadow-sm">
            <QRCodeCanvas value={orderUrl} size={200} level="M" marginSize={2} />
          </div>

          <p className="text-[10px] text-neutral-400 mt-4 break-all max-w-full">{orderUrl}</p>
        </div>

        <div className="p-5 bg-surface-50 border-t border-surface-200 flex gap-2 print:hidden">
          <button
            onClick={() => onRegenerate(table.id)}
            className="flex-1 py-2.5 rounded-xl border border-surface-300 text-neutral-600 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-white transition-colors"
            title="Buat ulang QR (QR lama tidak akan berfungsi lagi)"
          >
            <RefreshCw size={14} /> Regenerate
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 py-2.5 rounded-xl border border-surface-300 text-neutral-600 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-white transition-colors"
          >
            <Download size={14} /> Unduh
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 py-2.5 rounded-xl bg-[#15423C] text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#0f302b] transition-colors"
          >
            <Printer size={14} /> Cetak
          </button>
        </div>
      </div>
    </div>
  );
}
