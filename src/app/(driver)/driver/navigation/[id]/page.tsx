"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { driverService } from "@/features/driver/services/driverService";
import { DriverJob } from "@/types/jobs";
import NavigationMap from "@/features/driver/components/NavigationMap";
import { Loader2, ArrowLeft } from "lucide-react";
import PhotoProofModal from "@/features/driver/components/PhotoProofModal";

import toast from "react-hot-toast";

export default function NavigationPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<DriverJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobs = await driverService.getActiveJobs();
        const found = jobs.find(j => j.id.toString() === params.id);
        if (found) {
          setJob(found);
        } else {
          // If not found, maybe it's completed or invalid
          router.replace("/driver/job-list");
        }
      } catch (error) {
        console.error("Failed to load job for navigation", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [params.id, router]);

  const handleComplete = () => {
    setIsPhotoModalOpen(true);
  };

  const handlePhotoUploadSubmit = async (file: File) => {
    if (!job) return;
    try {
      await driverService.completeDelivery(job.id, file);
      
      toast.success("Pengiriman berhasil diselesaikan!");
      setIsPhotoModalOpen(false);
      router.replace("/driver/job-list");
    } catch (error: any) {
      console.error("Gagal menyelesaikan order", error);
      const msg = error.response?.data?.message || "Gagal mengupload bukti (Maksimal foto 5MB).";
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-500" size={40} />
      </div>
    );
  }

  if (!job) return null;

  return (
    <main className="min-h-screen bg-surface-100 flex flex-col relative">
      {/* HEADER (Floating over map) */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-4 flex items-center gap-3">
        <button 
          onClick={() => router.replace("/driver/job-list")}
          className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg text-neutral-700 active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* FULLSCREEN MAP */}
      <div className="flex-1 w-full relative">
        <NavigationMap 
           job={job} 
           onComplete={handleComplete} 
        />
      </div>

      {/* PHOTO PROOF MODAL */}
      <PhotoProofModal 
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onSubmit={handlePhotoUploadSubmit}
      />
    </main>
  );
}
