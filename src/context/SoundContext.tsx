"use client";

import React, { createContext, useContext, useRef } from "react";

interface SoundContextType {
  playAlert: () => void;
  stopAlert: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAlert = () => {
    // Inisialisasi audio jika belum ada
    if (!audioRef.current) {
      // Pastikan file ini ada di folder public, atau gunakan URL eksternal sementara
      // Contoh suara notifikasi (beeping)
      audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"); 
      audioRef.current.loop = true; // Loop suara sampai diterima/ditolak
    }
    
    // Play audio (perlu interaksi user biasanya, tapi di modal pop-up seringkali bisa jalan)
    audioRef.current.play().catch((error) => {
      console.warn("Autoplay blocked by browser:", error);
    });
  };

  const stopAlert = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset ke awal
    }
  };

  return (
    <SoundContext.Provider value={{ playAlert, stopAlert }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
}
