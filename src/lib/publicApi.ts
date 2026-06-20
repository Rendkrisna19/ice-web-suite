import axios from "axios";

// Axios instance khusus untuk halaman publik (guest, tanpa login).
// Sengaja TIDAK pakai interceptor auth/redirect-login seperti `api` di axios.ts,
// karena guest yang scan QR di meja tidak punya & tidak butuh akun.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

const publicApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

export default publicApi;
