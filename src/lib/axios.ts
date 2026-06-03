import axios from "axios";
import toast from "react-hot-toast";

// Base URL API
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://linen-deer-529188.hostingersite.com/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// --- INTERCEPTOR REQUEST (Kirim Token) ---
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      // 1. Ambil token dari LocalStorage
      const rawToken = localStorage.getItem("token");
      let token = rawToken;

      // 2. Cek apakah token tersimpan sebagai JSON Object string? (Kadang terjadi)
      // Contoh: '{"token": "..."}' -> Kita ambil isinya saja
      try {
        if (rawToken && (rawToken.startsWith("{") || rawToken.startsWith("["))) {
             const parsed = JSON.parse(rawToken);
             token = parsed.token || parsed.access_token || rawToken;
        }
      } catch (e) {
        // Jika error parse, berarti itu string biasa (token murni)
        token = rawToken;
      }

      // 3. Jika token ada, pasang di Header Authorization
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- INTERCEPTOR RESPONSE (Handle Error Global) ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle Network Error (Server Mati / CORS)
    if (!error.response) {
      // toast.error("Gagal terhubung ke server. Periksa koneksi internet.");
      return Promise.reject(error);
    }

    const status = error.response.status;
    const message = error.response.data?.message || "Terjadi kesalahan.";

    // 1. Handle 401 (Unauthorized / Token Expired)
    if (status === 401) {
      if (typeof window !== "undefined") {
        // Hapus token lama yang invalid
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        // Redirect paksa ke login jika sedang tidak di halaman login
        if (!window.location.pathname.includes("/login")) {
             window.location.href = "/auth/login";
             toast.error("Sesi berakhir, silakan login kembali.");
        }
      }
    } 
    // 2. Handle Error Validasi (422) atau Server (500)
    else if (status !== 404) { 
       // Kita skip 404 biar bisa dihandle manual di service (misal: cek active job)
       toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;