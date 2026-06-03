import Link from "next/link";
import { SearchX, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-surface-300 p-4 font-sans">
      <div className="bg-surface-100 p-8 md:p-12 rounded-3xl shadow-2xl text-center max-w-md w-full border border-white/50">
        
        {/* Icon Container */}
        <div className="bg-surface-300 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <SearchX size={48} className="text-primary-500 opacity-80" />
        </div>

        {/* Text Content */}
        <h2 className="text-3xl font-bold text-primary-900 mb-2">Halaman Hilang?</h2>
        <p className="text-neutral-500 mb-8 leading-relaxed">
          Waduh! Halaman yang kamu cari sepertinya tidak ada atau sudah dipindahkan ke alamat lain.
        </p>

        {/* Back Button */}
        <Link
          href="/"
          className="group flex items-center justify-center gap-3 w-full bg-primary-500 text-white py-4 rounded-xl font-bold hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/30 active:scale-[0.98]"
        >
          <Home size={20} className="group-hover:-translate-y-0.5 transition-transform" />
          Kembali ke Beranda
        </Link>

        <p className="text-[10px] text-neutral-300 mt-8 uppercase tracking-widest">
          Error Code: 404 Not Found
        </p>
      </div>
    </div>
  );
}
