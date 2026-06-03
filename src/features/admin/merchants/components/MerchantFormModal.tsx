"use client";

import { useRef, useState } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { Outlet } from "@/types/merchant";
import Image from "next/image";

interface MerchantFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    initialData: Outlet | null;
}

export default function MerchantFormModal({ isOpen, onClose, onSubmit, initialData }: MerchantFormModalProps) {
    const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logo || null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(initialData?.banner || null);

    // Ref untuk reset input file jika perlu
    const logoInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const defaultStatus = initialData?.is_force_closed ? "maintenance" : "active";
    const isEditMode = !!initialData;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setPreview: (url: string | null) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="px-6 py-4 border-b border-surface-100 flex justify-between items-center bg-surface-50 shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-neutral-800">
                            {isEditMode ? "Edit Informasi Outlet" : "Registrasi Outlet Baru"}
                        </h3>
                        <p className="text-xs text-neutral-500">Lengkapi data cabang dan akun pengelola.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-surface-200 rounded-full transition-colors text-neutral-400 hover:text-neutral-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Form Scrollable */}
                <div className="overflow-y-auto p-6 custom-scrollbar">
                    <form onSubmit={onSubmit} className="space-y-8" encType="multipart/form-data">

                        {/* SECTION 1: MEDIA UPLOAD */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-primary-700 uppercase tracking-wider border-b border-primary-100 pb-2">Media Outlet</h4>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Logo Upload */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-semibold text-neutral-700">Logo Outlet (1:1)</label>
                                    <div
                                        onClick={() => logoInputRef.current?.click()}
                                        className="aspect-square w-32 rounded-2xl border-2 border-dashed border-surface-300 hover:border-primary-400 bg-surface-50 hover:bg-primary-50 cursor-pointer transition-all flex flex-col items-center justify-center relative overflow-hidden group"
                                    >
                                        {logoPreview ? (
                                            <Image src={logoPreview} alt="Preview" fill className="object-cover" unoptimized />
                                        ) : (
                                            <div className="text-neutral-400 flex flex-col items-center">
                                                <Upload size={20} className="mb-1" />
                                                <span className="text-[10px]">Upload</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">Ubah</div>
                                    </div>
                                    <input
                                        ref={logoInputRef}
                                        type="file"
                                        name="logo"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleFileChange(e, setLogoPreview)}
                                    />
                                </div>

                                {/* Banner Upload */}
                                <div className="md:col-span-2 flex flex-col gap-2">
                                    <label className="text-xs font-semibold text-neutral-700">Banner Outlet (16:9)</label>
                                    <div
                                        onClick={() => bannerInputRef.current?.click()}
                                        className="w-full h-32 rounded-2xl border-2 border-dashed border-surface-300 hover:border-primary-400 bg-surface-50 hover:bg-primary-50 cursor-pointer transition-all flex flex-col items-center justify-center relative overflow-hidden group"
                                    >
                                        {bannerPreview ? (
                                            <Image src={bannerPreview} alt="Preview" fill className="object-cover" unoptimized />
                                        ) : (
                                            <div className="text-neutral-400 flex flex-col items-center">
                                                <ImageIcon size={24} className="mb-1" />
                                                <span className="text-xs">Klik untuk upload banner</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">Ubah Banner</div>
                                    </div>
                                    <input
                                        ref={bannerInputRef}
                                        type="file"
                                        name="banner"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleFileChange(e, setBannerPreview)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: INFORMASI OUTLET */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-primary-700 uppercase tracking-wider border-b border-primary-100 pb-2">Detail Lokasi</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Nama Outlet</label>
                                    <input name="name" defaultValue={initialData?.name} required placeholder="Contoh: Cabang Merdeka" className="w-full p-2.5 bg-surface-50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm" />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Alamat Lengkap</label>
                                    <textarea name="address" defaultValue={initialData?.address} required rows={2} placeholder="Jl. Contoh No. 123" className="w-full p-2.5 bg-surface-50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm resize-none" />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">No. Telepon</label>
                                    <input name="phone" defaultValue={initialData?.phone} required placeholder="021-xxxxxx" className="w-full p-2.5 bg-surface-50 border border-surface-200 rounded-xl focus:border-primary-500 outline-none text-sm" />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Whatsapp (Format 62)</label>
                                    <input name="whatsapp_number" defaultValue={initialData?.whatsapp_number} placeholder="628xxxxxxxx" className="w-full p-2.5 bg-surface-50 border border-surface-200 rounded-xl focus:border-primary-500 outline-none text-sm" />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Jam Buka</label>
                                    <input type="time" name="opening_hour" defaultValue={initialData?.opening_hour} required className="w-full p-2.5 bg-surface-50 border border-surface-200 rounded-xl focus:border-primary-500 outline-none text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Jam Tutup</label>
                                    <input type="time" name="closing_hour" defaultValue={initialData?.closing_hour} required className="w-full p-2.5 bg-surface-50 border border-surface-200 rounded-xl focus:border-primary-500 outline-none text-sm" />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Latitude</label>
                                    <input type="text" name="latitude" defaultValue={initialData?.latitude || "-6.200000"} className="w-full p-2.5 bg-surface-50 border border-surface-200 rounded-xl focus:border-primary-500 outline-none text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Longitude</label>
                                    <input type="text" name="longitude" defaultValue={initialData?.longitude || "106.816666"} className="w-full p-2.5 bg-surface-50 border border-surface-200 rounded-xl focus:border-primary-500 outline-none text-sm" />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Status Awal</label>
                                    <select name="status" defaultValue={defaultStatus} className="w-full p-2.5 bg-surface-50 border border-surface-200 rounded-xl cursor-pointer focus:border-primary-500 outline-none text-sm">
                                        <option value="active">Buka (Active)</option>
                                        <option value="maintenance">Tutup Paksa (Maintenance)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: AKUN MERCHANT (Hanya tampil saat Create Baru) */}
                        {!isEditMode && (
                            <div className="space-y-4 bg-orange-50 p-4 rounded-2xl border border-orange-100">
                                <h4 className="text-sm font-bold text-orange-800 uppercase tracking-wider border-b border-orange-200 pb-2">Buat Akun Pengelola</h4>
                                <p className="text-xs text-orange-600 mb-2">Akun ini akan digunakan oleh Kasir/Merchant untuk login ke dashboard outlet ini.</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-orange-900 mb-1.5">Nama Pengelola / Kasir</label>
                                        <input name="owner_name" required placeholder="Nama Lengkap" className="w-full p-2.5 bg-white border border-orange-200 rounded-xl focus:border-orange-500 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-orange-900 mb-1.5">Email Login</label>
                                        <input type="email" name="email" required placeholder="email@outlet.com" className="w-full p-2.5 bg-white border border-orange-200 rounded-xl focus:border-orange-500 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-orange-900 mb-1.5">Password</label>
                                        <input type="password" name="password" required placeholder="******" className="w-full p-2.5 bg-white border border-orange-200 rounded-xl focus:border-orange-500 outline-none text-sm" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-4 flex gap-3 sticky bottom-0 bg-white pb-2 border-t border-surface-100">
                            <button type="button" onClick={onClose} className="flex-1 py-3 text-neutral-500 font-bold hover:bg-surface-100 rounded-xl transition-colors text-sm">Batal</button>
                            <button type="submit" className="flex-1 py-3 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20 text-sm">Simpan Data</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
