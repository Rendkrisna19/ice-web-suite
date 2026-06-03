"use client";

import { useEffect, useState } from "react";
import { Store, Bike } from "lucide-react";

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Mulai efek memudar (fade out) di detik ke 2.0
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2000);

    // Hapus komponen sepenuhnya dari layar di detik ke 2.5
    const removeTimer = setTimeout(() => {
      setShow(false);
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#15423C] text-white transition-opacity duration-500 ease-in-out ${
        isFadingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      
      {/* Background Pattern & Glow (Menyesuaikan tema halaman Login) */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-[length:24px_24px]"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in slide-in-from-bottom-4 duration-1000">
        
        {/* Bantalan Animasi Icon (Glassmorphism) */}
        <div className="flex items-center justify-center gap-6 mb-8 bg-white/10 backdrop-blur-md px-10 py-8 rounded-[2rem] border border-white/20 shadow-2xl">
          <Store size={48} className="text-white drop-shadow-md animate-bounce" style={{ animationDuration: "2s" }} />
          <div className="flex gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-ping"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-ping delay-150"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-ping delay-300"></div>
          </div>
          <Bike size={48} className="text-white drop-shadow-md animate-bounce" style={{ animationDelay: "0.2s", animationDuration: "2s" }} />
        </div>
        
        {/* Teks Logo (Zad Apps) */}
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 drop-shadow-lg">
          ZAD<span className="font-light text-white/80">Apps</span>
        </h1>
        <p className="text-[11px] text-white/60 font-semibold tracking-[0.3em] uppercase mb-10">
          Lifestyle & Care
        </p>

        {/* Loading Bar Elegan */}
        <div className="w-56 h-1.5 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10 relative">
          <div className="absolute top-0 left-0 h-full bg-white rounded-full w-1/2 animate-[loading_1.5s_ease-in-out_infinite]"></div>
        </div>
        
        <p className="text-[10px] text-white/40 mt-5 animate-pulse uppercase tracking-widest font-medium">
          Memuat Sistem...
        </p>
      </div>

      {/* Custom Keyframe untuk Loading Bar Bolak-Balik */}
      <style jsx>{`
        @keyframes loading {
          0% { left: -50%; }
          100% { left: 100%; }
        }
      `}</style>

    </div>
  );
}
