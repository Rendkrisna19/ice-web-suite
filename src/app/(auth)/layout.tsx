export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Menggunakan surface-300 sesuai request untuk background utama
    <div className="min-h-screen w-full bg-surface-200 flex items-center justify-center p-4">
      {children}
    </div>
  );
}
