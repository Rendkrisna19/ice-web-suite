"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { Bike, Coffee, Loader2, BellRing } from "lucide-react";
import { DriverJob, DriverProfile } from "@/types/jobs";
import { driverService } from "./services/driverService";
import { confirmAlert } from "@/utils/alert";

// Components
import DriverHeader from "./components/DriverHeader";
import ShiftToggle from "./components/ShiftToggle";
import ActiveJobCard from "./components/ActiveJobCard";
import DriverBottomNav from "./components/DriverBottomNav";
import PhotoProofModal from "./components/PhotoProofModal";
import ProfileStats from "./components/ProfileStats";
import WalletCard from "./components/WalletCard";
import AccountInfo from "./components/AccountInfo";
import ProfileMenu from "./components/ProfileMenu";

// =========================================================================
// KOMPONEN MODAL NOTIFIKASI DRIVER (Digabung di sini agar mudah)
// =========================================================================
interface IncomingJobModalProps {
  isOpen: boolean;
  jobData: DriverJob | null; 
  onClose: () => void;
}

function IncomingJobModal({ isOpen, jobData, onClose }: IncomingJobModalProps) {
  if (!isOpen || !jobData) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center pointer-events-none px-4 pb-6 sm:pb-0">
       <div className="pointer-events-auto bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-surface-200 p-5 animate-in slide-in-from-bottom-10 fade-in duration-300 ring-4 ring-[#1A534B]/10">
          
          <div className="flex items-start gap-4 mb-5">
             <div className="w-12 h-12 rounded-2xl bg-[#1A534B] text-white flex items-center justify-center shrink-0 animate-pulse">
                <BellRing size={24} />
             </div>
             <div>
                <h4 className="font-bold text-lg text-neutral-900">Tugas Baru Diberikan!</h4>
                <p className="text-sm text-neutral-500 mt-1">
                   Kasir menugaskan Order <span className="font-mono font-bold text-[#1A534B]">#{jobData.transaction_id || jobData.id}</span> dari <span className="font-bold">{jobData.customer_name}</span>.
                </p>
             </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
             <button 
               onClick={onClose}
               className="w-full py-3 rounded-xl bg-[#1A534B] text-white font-bold text-sm hover:bg-[#15423C] shadow-lg shadow-[#1A534B]/20 transition-all active:scale-95"
             >
               Siap, Laksanakan!
             </button>
          </div>

       </div>
    </div>
  );
}
// =========================================================================

export default function DriverBoard() {
  const [activeTab, setActiveTab] = useState<"tasks" | "profile">("tasks");
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  
  // Data State
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [activeJobs, setActiveJobs] = useState<DriverJob[]>([]); 
  
  // State Notifikasi Modal
  const [isIncomingModalOpen, setIsIncomingModalOpen] = useState(false);
  const [newestJob, setNewestJob] = useState<DriverJob | null>(null);

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  // Menggunakan useRef agar nilainya selalu up-to-date di dalam setInterval
  const previousJobCountRef = useRef(0);
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);

  // --- BACKGROUND KEEP-ALIVE HACK ---
  // Memutar audio hening (silent) secara loop agar browser HP tidak mematikan background JS
  const SILENT_AUDIO = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";


  // --- INIT DATA ---
  const initData = useCallback(async () => {
    try {
      const [profileData, jobsData] = await Promise.all([
        driverService.getDriverProfile(),
        driverService.getActiveJobs() 
      ]);
      
      setProfile(profileData);
      setActiveJobs(jobsData);
      previousJobCountRef.current = jobsData.length; // Set nilai awal

      // Request Notification Permission (agar bunyi/muncul popup meski app di background)
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
    } catch (error) {
      console.error("Init Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initData();
  }, [initData]);

  // --- REALTIME POLLING ---
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (profile?.is_online) {
      intervalId = setInterval(async () => {
        try {
          const jobsData = await driverService.getActiveJobs();
          
          // Jika jumlah pesanan yang ditarik dari API LEBIH BANYAK dari sebelumnya = Ada pesanan masuk!
          if (jobsData.length > previousJobCountRef.current) {
              // Ambil pesanan terbaru (index terakhir dari array)
              const latestJob = jobsData[jobsData.length - 1]; 
              
              setNewestJob(latestJob);
              setIsIncomingModalOpen(true); // Munculkan modal
              
              // Trigger System Notification + Getar
              if ("Notification" in window && Notification.permission === "granted") {
                new Notification("Tugas Baru Diberikan!", {
                  body: `Kasir menugaskan Order dari ${latestJob.customer_name}.`,
                  icon: "/icons/icon-192x192.png",
                  vibrate: [200, 100, 200, 100, 500]
                } as NotificationOptions & { vibrate?: number[] });
              } else if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200, 100, 500]);
              }

              // Play notification sound
              try {
                const audio = new Audio("/sounds/notification.mp3");
                audio.play().catch(e => console.log("Audio play failed (maybe blocked by browser):", e));
              } catch (e) {
                console.log("Audio initialization failed:", e);
              }
          }

          setActiveJobs(jobsData);
          previousJobCountRef.current = jobsData.length; // Update referensi

        } catch (error) {
          console.error("Gagal update data realtime", error);
        }
      }, 5000); // 5000 ms = Cek setiap 5 detik agar driver cepat menerima pesanan
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [profile?.is_online]);

  // --- HANDLERS ---
  const toggleShift = async () => {
    if (!profile || isToggling) return;
    
    setIsToggling(true);
    const toastId = toast.loading("Mengubah status...");

    try {
      if (profile.is_online) {
        if (activeJobs.length > 0) { 
           toast.error("Selesaikan semua orderan aktif dulu!", { id: toastId });
           setIsToggling(false);
           return;
        }

        await driverService.clockOut();
        setProfile({ ...profile, is_online: false });
        silentAudioRef.current?.pause();
        toast.success("Mode Istirahat (Offline)", { id: toastId, icon: '💤' });

      } else {
        await driverService.clockIn();
        setProfile({ ...profile, is_online: true });
        
        // Memulai background keep-alive saat online (butuh interaksi user, makanya pas klik tombol)
        try {
          silentAudioRef.current?.play();
        } catch (e) {
          console.log("Gagal memulai silent audio:", e);
        }

        toast.success("Mode Kerja (Online)", { id: toastId });
        initData(); 
      }
    } catch (error: any) {
      let msg = "Gagal mengubah status shift";
      if (error?.response?.data?.message) {
          msg = error.response.data.message;
      }
      toast.error(msg, { id: toastId });
    } finally {
      setIsToggling(false);
    }
  };

  const handleStartDelivery = async (orderId: number) => {
    confirmAlert("Sudah ambil pesanan di Resto?", async () => {
      const toastId = toast.loading("Memulai pengantaran...");
      try {
        await driverService.startDelivery(orderId);
        toast.success("Status: Mengantar ke Customer", { id: toastId });
        
        const updatedJobs = await driverService.getActiveJobs();
        setActiveJobs(updatedJobs);
        previousJobCountRef.current = updatedJobs.length;
      } catch (error) {
        toast.error("Gagal update status", { id: toastId });
      }
    }, { title: "Mulai Pengantaran", type: "info", confirmText: "Ya, Sudah" });
  };

  const handleCompleteOrder = async (photoBlobUrl: string) => {
    if (!selectedJobId) return;
    const toastId = toast.loading("Mengupload bukti...");
    
    try {
      const response = await fetch(photoBlobUrl);
      const blob = await response.blob();
      const file = new File([blob], "proof.jpg", { type: "image/jpeg" });

      await driverService.completeDelivery(selectedJobId, file);
      
      setIsPhotoModalOpen(false);
      setSelectedJobId(null);
      
      // Update profile from backend to get fresh wallet_balance and stats
      try {
        const updatedProfile = await driverService.getDriverProfile();
        setProfile(updatedProfile);
      } catch (e) {
        if(profile) {
          setProfile({ ...profile, completed_today: profile.completed_today + 1 });
        }
      }

      const updatedJobs = await driverService.getActiveJobs();
      setActiveJobs(updatedJobs);
      previousJobCountRef.current = updatedJobs.length; // Update agar modal tidak terpanggil saat berkurang

      toast.success("Order Selesai! Menunggu validasi.", { id: toastId });
    } catch (error) {
      toast.error("Gagal upload bukti", { id: toastId });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-300 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen bg-surface-300 pb-32 pt-32 transition-colors duration-500">
      
      {/* BACKGROUND KEEP-ALIVE AUDIO ELEMENT */}
      <audio 
        ref={silentAudioRef} 
        src={SILENT_AUDIO} 
        loop 
        playsInline
        className="hidden" 
      />

      <DriverHeader name={profile?.name} profileImage={profile?.profile_image} />
      
      {activeTab === "tasks" ? (
        <>
          <div className="max-w-md mx-auto px-0 relative z-30">
             <ShiftToggle 
                isOnline={!!profile?.is_online} 
                isLoading={isToggling}
                onToggle={toggleShift} 
             />
          </div>

          <div className="max-w-md mx-auto min-h-[50vh] relative z-20 px-4">
            
            {/* KONDISI 1: OFFLINE */}
            {!profile?.is_online && (
               <div className="flex flex-col items-center justify-center pt-10 text-neutral-400">
                 <div className="bg-surface-100 p-8 rounded-full shadow-inner mb-4 border border-white">
                    <Coffee size={48} className="opacity-40 text-neutral-500" />
                 </div>
                 <p className="font-bold text-neutral-500 text-lg">Kamu sedang offline</p>
                 <p className="text-xs text-neutral-400 mt-2 text-center max-w-[200px]">
                    Aktifkan tombol shift di atas untuk mulai menerima orderan.
                 </p>
               </div>
            )}

            {/* KONDISI 2: ONLINE, TAPI TIDAK ADA ORDER */}
            {profile?.is_online && activeJobs.length === 0 && (
               <div className="flex flex-col items-center justify-center pt-20">
                 <div className="relative mb-8">
                    <div className="absolute inset-0 bg-primary-500 rounded-full animate-ping opacity-20 duration-1000"></div>
                    <div className="relative bg-white p-6 rounded-full shadow-xl border-4 border-surface-100 text-primary-600">
                       <Bike size={48} />
                    </div>
                 </div>
                 <p className="font-bold text-primary-700 animate-pulse text-lg tracking-tight">Menunggu Orderan...</p>
                 <p className="text-xs text-neutral-400 mt-1 bg-white/50 px-3 py-1 rounded-full">Standby</p>
               </div>
            )}

            {/* KONDISI 3: SEDANG MENJALANKAN ORDER (ACTIVE) */}
            {profile?.is_online && activeJobs.length > 0 && (
              <div className="flex flex-col gap-4 mt-4 animate-in slide-in-from-bottom-10 duration-500">
                {activeJobs.map((job) => (
                  <ActiveJobCard 
                    key={job.id}
                    job={job} 
                    jobStatus={job.status === 'ready' ? 'assigned' : 'picked_up'} 
                    onMainAction={
                      job.status === 'ready' 
                        ? () => handleStartDelivery(job.id) 
                        : () => {
                            setSelectedJobId(job.id);
                            setIsPhotoModalOpen(true);
                          }
                    }
                  />
                ))}
              </div>
            )}

          </div>
        </>
      ) : (
        /* TAB PROFILE */
        <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-20">
           <ProfileStats 
              rating={profile?.rating || 0} 
              completedToday={profile?.completed_today || 0}
              joinDate={profile?.join_date || "-"}
           />
           <WalletCard balance={profile?.wallet_balance || 0} />
           <AccountInfo 
              email={profile?.email} 
              phone={profile?.phone} 
              plate={profile?.plate_number} 
           />
           <ProfileMenu />
        </div>
      )}

      <DriverBottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <PhotoProofModal 
        isOpen={isPhotoModalOpen} 
        onClose={() => {
          setIsPhotoModalOpen(false);
          setSelectedJobId(null);
        }} 
        onSubmit={handleCompleteOrder} 
      />

      {/* TAMPILKAN MODAL NOTIFIKASI PESANAN BARU DRIVER */}
      <IncomingJobModal 
        isOpen={isIncomingModalOpen}
        jobData={newestJob}
        onClose={() => {
            setIsIncomingModalOpen(false);
            setNewestJob(null);
        }}
      />

    </div>
  );
}
