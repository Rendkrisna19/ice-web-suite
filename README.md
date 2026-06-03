# ICE Web Suite (Next.js Monorepo)

**Document Reference:** SAD-ICE-2026-FINAL [cite: 4]
**Type:** Frontend Web Suite (Admin, Merchant, Driver)
**Stack:** Next.js 14+ (App Router), TanStack Query, Tailwind CSS

## 1. Overview
Repository ini menggunakan pendekatan **Modular Monolith** di dalam framework Next.js. Terdapat tiga aplikasi logika bisnis yang berjalan dalam satu instance:

1.  **Merchant App (`/merchant`)**: "Command Center" untuk restoran menerima order.
2.  **Driver App (`/driver`)**: Aplikasi berbasis Web PWA untuk kurir.
3.  **Admin Backoffice (`/admin`)**: Dashboard manajemen pusat.

## 2. Technology Stack & Libraries
* **Framework:** Next.js 14+ (App Router) [cite: 20]
* **State Management:** TanStack Query (Server State) & React Context (Client State) [cite: 20]
* **Styling:** Tailwind CSS + Lucide React (Icons)
* **Real-time:** Laravel Echo + Pusher JS (Connect to Laravel Reverb) [cite: 20]
* **Notification:** Firebase SDK (FCM Background Messaging) [cite: 20]
* **PWA Support:** `next-pwa` (Khusus module Driver) [cite: 20]

## 3. Folder Structure (STRICT)
Project ini menggunakan **Feature-Sliced Design (Lite)**. Developer dilarang menaruh *Business Logic* di dalam folder `app/`.

```text
src/
├── app/                        # HANYA Routing & Layout (View Layer)
│   ├── (admin)/                # Route Group: Admin
│   ├── (merchant)/             # Route Group: Merchant
│   └── (driver)/               # Route Group: Driver
│
├── features/                   # LOGIKA BISNIS UTAMA (Domain Layer)
│   ├── auth/                   # Login/Logout Logic
│   ├── heartbeat/              # Logic Ping Server (Merchant) [cite: 155]
│   ├── orders/                 # WebSocket Listener & Order Modal [cite: 156]
│   ├── menu/                   # Availability Toggle [cite: 158]
│   ├── shift/                  # Driver Online/Offline Status [cite: 166]
│   ├── jobs/                   # Driver Job Card & Actions [cite: 168]
│   └── refund-center/          # Admin Refund Approval [cite: 176]
│
├── lib/                        # Konfigurasi Global (Axios, Firebase, Echo)
└── hooks/                      # Global Hooks

```

## 4. Module Guidelines

### A. Merchant App (`/merchant`)

* 
**Heartbeat Mechanism:** Wajib implementasi `useHeartbeat` yang mengirim POST request ke API setiap **30 detik** untuk menandakan toko online.


* **Incoming Order:** Menggunakan WebSocket (channel private). Saat order masuk, `IncomingOrderModal` harus muncul dan tidak bisa ditutup (persistent) sampai diterima/ditolak.


* 
**Audio:** Gunakan `SoundContext` untuk memutar suara notifikasi berulang (looping).



### B. Driver App (`/driver`)

* **PWA Requirement:** Module ini harus bisa di-install di Android (Add to Home Screen). Service Worker harus aktif untuk caching asset.


* **Geolocation:** Wajib meminta izin lokasi saat shift dimulai ("Online").
* **UI:** Fokus pada tampilan Mobile Portrait. Gunakan komponen besar yang mudah ditekan.

### C. Admin Backoffice (`/admin`)

* **Refund Logic:** Admin memverifikasi status `refund_needed`. Setelah transfer manual, Admin menekan tombol "Mark as Refunded" untuk mengupdate status di backend.


* 
**Configuration:** Form harga (Base Price, Price per KM) harus mengambil data dari API, bukan hardcode.



## 5. Development Setup

### Prerequisites

* Node.js 18+
* Backend API (Running di port 8000)
* Laravel Reverb (Running di port 8080)

### Installation

1. **Install Dependencies:**
```bash
npm install

```


2. **Environment Variables:**
Copy `.env.example` ke `.env.local` dan isi konfigurasi:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_REVERB_HOST=localhost
NEXT_PUBLIC_REVERB_PORT=8080
NEXT_PUBLIC_REVERB_KEY=your_app_key

```


3. **Run Development Server:**
```bash
npm run dev

```



### Access Points

* **Admin:** [http://localhost:3000/admin/dashboard](https://www.google.com/search?q=http://localhost:3000/admin/dashboard)
* **Merchant:** [http://localhost:3000/merchant/orders](https://www.google.com/search?q=http://localhost:3000/merchant/orders)
* **Driver:** [http://localhost:3000/driver/job-list](https://www.google.com/search?q=http://localhost:3000/driver/job-list)