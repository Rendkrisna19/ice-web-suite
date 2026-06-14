"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, ShieldAlert, X } from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "@/features/auth/services/authService";
import { LoginPayload, LoginResponse } from "@/types/auth";

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [formData, setFormData] = useState<LoginPayload>({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response: LoginResponse = await authService.login(formData);

      const responseData = response.data || response;
      const token = responseData.token;
      const user = responseData.user;

      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        toast.success(`Selamat datang, ${user.name}!`);

        switch (user.role) {
          case "admin":
            router.push("/admin/dashboard");
            break;
          case "cashier":
            router.push("/merchant/orders");
            break;
          case "driver":
            router.push("/driver/job-list");
            break;
          case "customer":
            router.push("/customer/order");
            break;
          default:
            toast.error("Role tidak dikenali, hubungi admin.");
            localStorage.clear();
        }
      } else {
        toast.error("Gagal mendapatkan akses. Format respons tidak sesuai.");
      }
    } catch (error: unknown) {
      console.error("Login Error:", error);

      let msg = "Terjadi kesalahan koneksi.";
      let statusCode = 0;

      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response: { status: number; data: { message: string } } };
        msg = err.response?.data?.message || msg;
        statusCode = err.response?.status || 0;
      } else if (error instanceof Error) {
        msg = error.message;
      }

      // Show blocked modal if status 403 with blocked message
      if (statusCode === 403 && msg.toLowerCase().includes("blokir")) {
        setShowBlockedModal(true);
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* BLOCKED MODAL */}
      {showBlockedModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header Merah */}
            <div className="bg-gradient-to-br from-red-500 to-red-700 p-8 text-center relative">
              <button
                onClick={() => setShowBlockedModal(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              <div className="bg-white/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <ShieldAlert size={40} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Akun Diblokir</h2>
            </div>

            {/* Body */}
            <div className="p-8 text-center">
              <p className="text-neutral-600 leading-relaxed mb-6">
                Akun Anda telah <strong className="text-red-600">diblokir</strong> oleh admin. 
                Anda tidak dapat mengakses sistem untuk saat ini.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-amber-800">
                  <strong>Hubungi Admin</strong> untuk informasi lebih lanjut atau jika Anda merasa ini adalah kesalahan.
                </p>
              </div>
              <button
                onClick={() => setShowBlockedModal(false)}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold transition-colors active:scale-[0.98]"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN FORM */}
      <div className="w-full max-w-lg animate-in fade-in zoom-in duration-500 p-4">
        <div className="bg-[#15423C] rounded-[2.5rem] shadow-2xl shadow-[#15423C]/20 border border-[#15423C]/10 overflow-hidden relative">
          {/* Header Section */}
          <div className="bg-white p-6 sm:p-10 relative overflow-hidden text-center flex flex-col items-center justify-center rounded-t-[2.5rem]">
            <div className="relative z-10 flex flex-col items-center w-full">
              <Image
                src="/logo.png"
                alt="Zad Apps Logo"
                width={300}
                height={100}
                className="w-48 sm:w-64 h-auto object-contain mb-2 sm:mb-4"
                priority
              />
            </div>
          </div>

          {/* Form Section */}
          <div className="p-6 sm:p-10 pt-6 sm:pt-8 bg-[#15423C]">
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#15423C] pointer-events-none z-10">
                    <Mail size={22} />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    className="w-full pl-14 pr-5 py-4 bg-white border-2 border-white rounded-2xl text-[#15423C] font-medium placeholder:text-[#15423C]/50 outline-none focus:border-[#15423C]/30 focus:ring-4 focus:ring-[#15423C]/20 transition-all shadow-sm"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="pb-2">
                <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-2 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#15423C] pointer-events-none z-10">
                    <Lock size={22} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full pl-14 pr-14 py-4 bg-white border-2 border-white rounded-2xl text-[#15423C] font-medium placeholder:text-[#15423C]/50 outline-none focus:border-[#15423C]/30 focus:ring-4 focus:ring-[#15423C]/20 transition-all shadow-sm"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#15423C]/50 hover:text-[#15423C] transition-colors z-10 focus:outline-none"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-[#15423C] py-4 rounded-2xl font-bold text-lg shadow-xl shadow-black/10 hover:bg-gray-100 hover:shadow-black/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mt-8"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Masuk Sekarang <ArrowRight size={24} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-[#123833] py-5 text-center border-t border-[#1A534B]">
            <p className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">
              © 2026 Zad Apps System
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
