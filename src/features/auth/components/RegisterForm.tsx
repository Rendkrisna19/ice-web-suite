"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  Phone,
} from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "@/features/auth/services/authService";

type Step = "email" | "register";

export default function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Form Data
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      countdownRef.current = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => {
      if (countdownRef.current) clearTimeout(countdownRef.current);
    };
  }, [countdown]);

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await authService.requestRegisterOtp(email);
      toast.success("Kode OTP telah dikirim ke email Anda!");
      setStep("register");
      setCountdown(60);
      // Focus first OTP input
      setTimeout(() => otpRefs.current[0]?.focus(), 300);
    } catch (error: unknown) {
      let msg = "Gagal mengirim OTP. Silakan coba lagi.";
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response: { data: { message: string } } };
        msg = err.response?.data?.message || msg;
      }
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    try {
      await authService.requestRegisterOtp(email);
      toast.success("Kode OTP baru telah dikirim!");
      setCountdown(60);
    } catch (error: unknown) {
      let msg = "Gagal mengirim ulang OTP.";
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response: { data: { message: string } } };
        msg = err.response?.data?.message || msg;
      }
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Input Handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      otpRefs.current[5]?.focus();
    }
  };

  // Step 2: Register with OTP
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast.error("Masukkan 6 digit kode OTP.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.register({
        name,
        email,
        password,
        password_confirmation: confirmPassword,
        otp: otpCode,
        phone: phone || undefined,
      });

      const responseData = response.data || response;
      const token = responseData.token;
      const user = responseData.user;

      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        toast.success(`Pendaftaran berhasil! Selamat datang, ${user.name}!`);
        router.push("/customer/order");
      }
    } catch (error: unknown) {
      let msg = "Pendaftaran gagal. Silakan coba lagi.";
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response: { data: { message: string } } };
        msg = err.response?.data?.message || msg;
      }
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-lg animate-in fade-in zoom-in duration-500 p-4">
      <div className="bg-[#15423C] rounded-[2.5rem] shadow-2xl shadow-[#15423C]/20 border border-[#15423C]/10 overflow-hidden relative">
        {/* Header */}
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

        {/* Form Body */}
        <div className="p-6 sm:p-10 pt-6 sm:pt-8 bg-[#15423C]">
          {/* STEP 1: Email */}
          {step === "email" && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div className="text-center mb-2">
                <h2 className="text-white font-bold text-xl">Buat Akun Baru</h2>
                <p className="text-white/50 text-sm mt-1">
                  Masukkan email untuk menerima kode verifikasi
                </p>
              </div>

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-white text-[#15423C] py-4 rounded-2xl font-bold text-lg shadow-xl shadow-black/10 hover:bg-gray-100 hover:shadow-black/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    Mengirim OTP...
                  </>
                ) : (
                  <>
                    Kirim Kode OTP <ArrowRight size={24} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Register with OTP */}
          {step === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="text-center mb-2">
                <h2 className="text-white font-bold text-xl">Lengkapi Pendaftaran</h2>
                <p className="text-white/50 text-sm mt-1">
                  Masukkan kode OTP dan lengkapi data Anda
                </p>
              </div>

              {/* Email info */}
              <div className="bg-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
                <Mail size={18} className="text-white/60" />
                <p className="text-white/80 text-sm flex-1 truncate">{email}</p>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp(["", "", "", "", "", ""]);
                  }}
                  className="text-white/50 hover:text-white text-xs font-semibold"
                >
                  Ganti
                </button>
              </div>

              {/* OTP Input */}
              <div>
                <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-2 ml-1">
                  Kode OTP
                </label>
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="w-12 h-14 bg-white border-2 border-white rounded-xl text-center text-[#15423C] font-bold text-xl outline-none focus:border-[#15423C]/30 focus:ring-4 focus:ring-[#15423C]/20 transition-all shadow-sm"
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    />
                  ))}
                </div>
                {/* Resend OTP */}
                <div className="text-center mt-3">
                  {countdown > 0 ? (
                    <p className="text-white/50 text-xs">
                      Kirim ulang dalam <span className="font-bold text-white/80">{formatCountdown(countdown)}</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-white/70 hover:text-white text-xs font-semibold underline underline-offset-2"
                    >
                      Kirim Ulang OTP
                    </button>
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-2 ml-1">
                  Nama Lengkap
                </label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#15423C] pointer-events-none z-10">
                    <User size={22} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap Anda"
                    className="w-full pl-14 pr-5 py-4 bg-white border-2 border-white rounded-2xl text-[#15423C] font-medium placeholder:text-[#15423C]/50 outline-none focus:border-[#15423C]/30 focus:ring-4 focus:ring-[#15423C]/20 transition-all shadow-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-2 ml-1">
                  No. Handphone <span className="text-white/40 normal-case">(opsional)</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#15423C] pointer-events-none z-10">
                    <Phone size={22} />
                  </div>
                  <input
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    className="w-full pl-14 pr-5 py-4 bg-white border-2 border-white rounded-2xl text-[#15423C] font-medium placeholder:text-[#15423C]/50 outline-none focus:border-[#15423C]/30 focus:ring-4 focus:ring-[#15423C]/20 transition-all shadow-sm"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
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
                    placeholder="Minimal 8 karakter"
                    className="w-full pl-14 pr-14 py-4 bg-white border-2 border-white rounded-2xl text-[#15423C] font-medium placeholder:text-[#15423C]/50 outline-none focus:border-[#15423C]/30 focus:ring-4 focus:ring-[#15423C]/20 transition-all shadow-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#15423C]/50 hover:text-[#15423C] transition-colors z-10"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-2 ml-1">
                  Konfirmasi Password
                </label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#15423C] pointer-events-none z-10">
                    <ShieldCheck size={22} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Ulangi password"
                    className="w-full pl-14 pr-14 py-4 bg-white border-2 border-white rounded-2xl text-[#15423C] font-medium placeholder:text-[#15423C]/50 outline-none focus:border-[#15423C]/30 focus:ring-4 focus:ring-[#15423C]/20 transition-all shadow-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#15423C]/50 hover:text-[#15423C] transition-colors z-10"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp(["", "", "", "", "", ""]);
                  }}
                  className="bg-white/10 text-white py-4 px-5 rounded-2xl font-bold hover:bg-white/20 transition-all flex items-center justify-center"
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-white text-[#15423C] py-4 rounded-2xl font-bold text-lg shadow-xl shadow-black/10 hover:bg-gray-100 hover:shadow-black/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={24} className="animate-spin" />
                      Mendaftar...
                    </>
                  ) : (
                    <>
                      Daftar Sekarang <ArrowRight size={24} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="text-white font-bold hover:underline transition-all"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>

        <div className="bg-[#123833] py-5 text-center border-t border-[#1A534B]">
          <p className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">
            © 2026 Zad Apps System
          </p>
        </div>
      </div>
    </div>
  );
}
