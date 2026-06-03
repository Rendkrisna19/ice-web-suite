"use client";

import { Star, Bike, ShieldCheck } from "lucide-react";


interface Props {
  rating: number;
  completedToday: number;
  joinDate: string;
}

export default function ProfileStats({ rating, completedToday, joinDate }: Props) {
  return (
    <div className="mx-6 relative z-20 -mt-6">
      <div className="bg-primary-500 rounded-3xl p-6 text-white shadow-xl shadow-primary-500/30 flex justify-between items-center text-center">
        <div className="flex-1 border-r border-white/20">
          <h3 className="text-xl font-bold">{rating}</h3>
          <p className="text-[10px] font-medium opacity-70 uppercase">Rating</p>
        </div>
        <div className="flex-1 border-r border-white/20">
          <h3 className="text-xl font-bold">{completedToday}</h3>
          <p className="text-[10px] font-medium opacity-70 uppercase">Order Hari Ini</p>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold">{joinDate}</h3>
          <p className="text-[10px] font-medium opacity-70 uppercase">Mitra Sejak</p>
        </div>
      </div>
    </div>
  );
}