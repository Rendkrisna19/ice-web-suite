import AdminSidebar from "@/features/admin/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-300 font-sans flex text-neutral-800">
      
      <AdminSidebar />

      {/* Main Content Wrapper */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen relative">
        {children}
      </div>

    </div>
  );
}