"use client";
import { useState } from "react";
import { Camera, X, UploadCloud, CheckCircle2 } from "lucide-react";
import Image from "next/image"; // Pakai Image Next.js

interface PhotoProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => Promise<void>;
}

export default function PhotoProofModal({ isOpen, onClose, onSubmit }: PhotoProofModalProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileObj, setFileObj] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileObj(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  // Submit file asli ke parent component
  const handleSubmit = async () => {
    if (preview && fileObj) {
      setIsSubmitting(true);
      try {
        await onSubmit(fileObj); 
        setPreview(null);
        setFileObj(null);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
        
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-neutral-800">Bukti Pengiriman</h3>
          <button onClick={onClose}><X size={20} className="text-neutral-400"/></button>
        </div>

        <div className="p-6 flex flex-col items-center gap-4">
          {preview ? (
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black">
              <Image src={preview} alt="Bukti" fill className="object-contain" />
              <button 
                onClick={() => setPreview(null)}
                className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full text-xs"
              >
                Ganti Foto
              </button>
            </div>
          ) : (
            <label className="w-full aspect-square rounded-2xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center bg-surface-50 cursor-pointer hover:bg-surface-100 transition-colors">
              <Camera size={40} className="text-neutral-400 mb-2" />
              <span className="text-sm font-bold text-neutral-500">Ambil Foto / Upload</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} capture="environment" />
            </label>
          )}

          <div className="text-xs text-center text-neutral-400">
            Pastikan foto makanan terlihat jelas di lokasi pelanggan.
          </div>
        </div>

        <div className="p-4 bg-surface-50 border-t">
          <button 
            disabled={!preview || isSubmitting}
            onClick={handleSubmit}
            className="w-full py-3.5 rounded-xl bg-primary-500 text-white font-bold text-sm shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? "Mengupload..." : (
              <>Kirim Bukti & Selesaikan <CheckCircle2 size={18}/></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
