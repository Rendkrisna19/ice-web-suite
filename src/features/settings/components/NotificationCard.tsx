"use client";

import { useRef, useState } from "react";
import { Bell, Volume2, Play, VolumeX, Upload, RotateCcw, Trash2, Music } from "lucide-react";
import toast from "react-hot-toast";
import { StoreSettings } from "@/types/settings";
import { useSound } from "@/context/SoundContext";

interface NotificationCardProps {
  settings: StoreSettings;
  onChange: (key: keyof StoreSettings, value: boolean) => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB max
const ALLOWED_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm", "audio/mp4", "audio/x-m4a"];

export default function NotificationCard({ settings, onChange }: NotificationCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { playOnce, customSoundName, setCustomSound, resetCustomSound, getCurrentSoundUrl } = useSound();

  const handlePlaySound = () => {
    toast("Memainkan suara...", {
      icon: <Volume2 size={18} className="text-primary-500" />,
      style: { borderRadius: "10px", background: "#333", color: "#fff" },
      duration: 1500,
    });
    playOnce();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|webm|m4a|aac)$/i)) {
      toast.error("Format file harus MP3, WAV, OGG, atau M4A.");
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Ukuran file maksimal 2MB.");
      return;
    }

    setIsUploading(true);
    try {
      // Convert to base64 data URL
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setCustomSound(dataUrl, file.name);
        toast.success(`Suara "${file.name}" berhasil diupload!`, { icon: "🎵" });
        setIsUploading(false);
      };
      reader.onerror = () => {
        toast.error("Gagal membaca file audio.");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Gagal mengupload suara.");
      setIsUploading(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReset = () => {
    resetCustomSound();
    toast.success("Suara notifikasi dikembalikan ke default.");
  };

  return (
    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-surface-200 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="bg-[#FAF9F6] p-3.5 rounded-2xl text-neutral-500">
          <Bell size={28} />
        </div>
        <div>
          <h3 className="font-bold text-neutral-800 text-xl">Notifikasi Pesanan</h3>
          <p className="text-sm text-neutral-400 mt-1">Pengaturan suara saat order masuk.</p>
        </div>
      </div>

      {/* Toggle Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Volume2 className="text-neutral-400" size={24} />
          <span className="text-lg font-bold text-neutral-700">Suara Notifikasi</span>
        </div>

        {/* Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer group">
          <input
            type="checkbox"
            checked={settings.isNotificationEnabled}
            onChange={(e) => onChange("isNotificationEnabled", e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-16 h-9 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:bg-primary-500 transition-all duration-300 shadow-inner relative overflow-hidden peer-checked:shadow-[0_0_15px_rgba(21,66,60,0.3)]">
            <Volume2
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white transition-all duration-300 opacity-0 -translate-x-2 peer-checked:opacity-100 peer-checked:translate-x-0"
            />
            <VolumeX
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 transition-all duration-300 opacity-100 translate-x-0 peer-checked:opacity-0 peer-checked:translate-x-2"
            />
          </div>
          <div className="absolute left-[4px] top-[4px] bg-white w-7 h-7 rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-7 flex items-center justify-center group-hover:scale-105">
            <div
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                settings.isNotificationEnabled ? "bg-[#15423C]" : "bg-neutral-300"
              }`}
            />
          </div>
        </label>
      </div>

      {/* Current Sound Info */}
      <div className="p-4 bg-surface-50 rounded-2xl mb-4 flex items-center gap-3 border border-surface-200">
        <div className="p-2.5 bg-primary-50 rounded-xl">
          <Music size={20} className="text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-neutral-400 font-medium">Suara Aktif</p>
          <p className="text-sm font-bold text-neutral-700 truncate">
            {customSoundName || "Default (notification.mp3)"}
          </p>
        </div>
        {customSoundName && (
          <button
            onClick={handleReset}
            className="p-2 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Reset ke default"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>

      {/* Upload Section */}
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.wav,.ogg,.webm,.m4a,.aac,audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full p-4 border-2 border-dashed border-surface-300 rounded-2xl hover:border-primary-400 hover:bg-primary-50/30 transition-all flex flex-col items-center gap-2 group disabled:opacity-50"
        >
          {isUploading ? (
            <div className="animate-pulse text-primary-500 text-sm font-bold">Memproses...</div>
          ) : (
            <>
              <div className="p-3 bg-surface-100 rounded-xl group-hover:bg-primary-100 transition-colors">
                <Upload size={24} className="text-neutral-400 group-hover:text-primary-600 transition-colors" />
              </div>
              <p className="text-sm font-bold text-neutral-600 group-hover:text-primary-700 transition-colors">
                Upload Suara Custom
              </p>
              <p className="text-xs text-neutral-400">MP3, WAV, OGG, M4A (Maks. 2MB)</p>
            </>
          )}
        </button>
      </div>

      {/* Test Sound Box */}
      <div className="mt-auto p-6 bg-[#F2F0E9] rounded-2xl">
        <p className="text-sm text-neutral-500 mb-3 font-medium">Test Suara:</p>
        <div className="flex gap-2">
          <button
            onClick={handlePlaySound}
            className="flex-1 bg-primary-500 text-white px-5 py-3 rounded-xl hover:bg-primary-400 transition-all flex items-center justify-center gap-2 font-bold shadow-lg shadow-[#15423C]/20 active:scale-95"
          >
            <Play size={16} fill="currentColor" />
            Play Test
          </button>
          {customSoundName && (
            <button
              onClick={handleReset}
              className="px-4 py-3 bg-white text-neutral-500 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all border border-surface-200 active:scale-95"
              title="Reset ke default"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
