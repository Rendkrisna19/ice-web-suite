"use client";

import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";

const CUSTOM_SOUND_KEY = "zadapps_custom_notif_sound";
const DEFAULT_SOUND = "/sounds/notification.mp3";

interface SoundContextType {
  playAlert: () => void;
  stopAlert: () => void;
  playOnce: () => void;
  customSoundName: string | null;
  setCustomSound: (dataUrl: string, name: string) => void;
  resetCustomSound: () => void;
  getCurrentSoundUrl: () => string;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const [customSoundName, setCustomSoundName] = useState<string | null>(null);

  // Load custom sound name from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(CUSTOM_SOUND_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.name) setCustomSoundName(parsed.name);
        } catch { /* ignore */ }
      }
    }
  }, []);

  // Get current sound URL (custom or default)
  const getCurrentSoundUrl = useCallback((): string => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(CUSTOM_SOUND_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.dataUrl) return parsed.dataUrl;
        } catch { /* ignore */ }
      }
    }
    return DEFAULT_SOUND;
  }, []);

  // Request Wake Lock to keep device awake (for background notifications)
  const requestWakeLock = useCallback(async () => {
    try {
      if ("wakeLock" in navigator && !wakeLockRef.current) {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
        wakeLockRef.current.addEventListener("release", () => {
          wakeLockRef.current = null;
        });
      }
    } catch {
      // Wake Lock not available or denied
    }
  }, []);

  // Re-acquire wake lock when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    // Initial request
    requestWakeLock();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }
    };
  }, [requestWakeLock]);

  // Play sound using Web Audio API (more reliable in background)
  const playWithWebAudio = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;

      // Resume if suspended (browser policy)
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Create oscillator as fallback beep if no custom sound
      const url = getCurrentSoundUrl();
      fetch(url)
        .then((response) => response.arrayBuffer())
        .then((buffer) => ctx.decodeAudioData(buffer))
        .then((audioBuffer) => {
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(ctx.destination);
          source.start(0);
        })
        .catch(() => {
          // Fallback: simple beep using oscillator
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscillator.frequency.value = 880;
          gainNode.gain.value = 0.3;
          oscillator.start();
          oscillator.stop(ctx.currentTime + 0.3);
        });
    } catch {
      // Web Audio API not available
    }
  }, [getCurrentSoundUrl]);

  // Play looping alert sound
  const playAlert = useCallback(() => {
    requestWakeLock();

    // Method 1: HTML Audio element (primary)
    if (!audioRef.current) {
      audioRef.current = new Audio(getCurrentSoundUrl());
      audioRef.current.loop = true;
      audioRef.current.volume = 1.0;
    } else {
      audioRef.current.src = getCurrentSoundUrl();
    }

    audioRef.current.play().catch(() => {
      // Method 2: Web Audio API fallback (works better in background)
      playWithWebAudio();
    });
  }, [getCurrentSoundUrl, playWithWebAudio, requestWakeLock]);

  // Stop looping alert
  const stopAlert = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  // Play sound once (non-looping, for single notification)
  const playOnce = useCallback(() => {
    requestWakeLock();

    const audio = new Audio(getCurrentSoundUrl());
    audio.volume = 1.0;
    audio.play().catch(() => {
      playWithWebAudio();
    });
  }, [getCurrentSoundUrl, playWithWebAudio, requestWakeLock]);

  // Save custom sound to localStorage
  const setCustomSound = useCallback((dataUrl: string, name: string) => {
    localStorage.setItem(CUSTOM_SOUND_KEY, JSON.stringify({ dataUrl, name }));
    setCustomSoundName(name);
    // Update current audio if playing
    if (audioRef.current) {
      audioRef.current.src = dataUrl;
    }
  }, []);

  // Reset to default sound
  const resetCustomSound = useCallback(() => {
    localStorage.removeItem(CUSTOM_SOUND_KEY);
    setCustomSoundName(null);
    if (audioRef.current) {
      audioRef.current.src = DEFAULT_SOUND;
    }
  }, []);

  return (
    <SoundContext.Provider
      value={{
        playAlert,
        stopAlert,
        playOnce,
        customSoundName,
        setCustomSound,
        resetCustomSound,
        getCurrentSoundUrl,
      }}
    >
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
