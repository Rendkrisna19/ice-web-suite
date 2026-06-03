"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/features/admin/components/AdminSidebar";
import { cn } from "@/utils/cn";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsMobileOpen(true);
    window.addEventListener("toggleAdminSidebar", handler);
    return () => window.removeEventListener("toggleAdminSidebar", handler);
  }, []);

  return (
    <div className="min-h-screen bg-surface-300 font-sans flex text-neutral-800">
      
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <AdminSidebar 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Wrapper */}
      <div 
        className={cn(
          "flex-1 flex flex-col min-h-screen relative transition-all duration-300",
          isCollapsed ? "md:ml-20" : "md:ml-64",
          "ml-0" // Mobile always 0
        )}
      >
        {children}
      </div>

    </div>
  );
}
