"use client";

import { User } from "lucide-react";
import Image from "next/image";

export default function DriverHeader({ name, profileImage }: { name?: string, profileImage?: string }) {
  return (
    <div className="fixed top-0 left-0 right-0 mx-auto w-full max-w-md z-50 bg-primary-500 pt-12 pb-6 px-6 rounded-b-[2rem] shadow-xl shadow-primary-500/20">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mb-0.5">Driver App</p>
          <h1 className="text-xl font-bold text-white tracking-tight">Halo, {name || "Driver"}</h1>
        </div>
        
        {/* Avatar Profile */}
        <div className="w-10 h-10 rounded-full border-2 border-white/30 p-0.5 bg-white/10 backdrop-blur-sm relative overflow-hidden">
             <div className="w-full h-full rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden relative">
                 <Image 
                    src={profileImage || "https://i.pravatar.cc/150?u=d1"} 
                    alt="Profile" 
                    fill 
                    className="object-cover"
                    unoptimized
                 />
             </div>
        </div>
      </div>
    </div>
  );
}
