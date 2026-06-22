"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { DriverJob } from "@/types/jobs";
import { useGeolocation } from "../hooks/useGeolocation";
import { trackingService } from "../services/trackingService";
import "leaflet/dist/leaflet.css";

// Dynamic import for Leaflet to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false });

interface NavigationMapProps {
  job: DriverJob;
  onComplete: () => void;
}

export default function NavigationMap({ job, onComplete }: NavigationMapProps) {
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [distanceRemaining, setDistanceRemaining] = useState<number | null>(null);
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null);
  const lastSentRef = useRef<string>("");

  // GPS tracking dari browser
  const location = useGeolocation(true, 5000);

  // Koordinat tujuan customer (dari database order)
  const destLat = job.lat;
  const destLng = job.lng;
  // Koordinat outlet (dari database outlet via backend)
  const outletLat = job.outlet_lat;
  const outletLng = job.outlet_lng;

  // Posisi center peta: prioritas GPS driver, fallback ke outlet, fallback terakhir ke Medan
  const fallbackLat = 3.5852;
  const fallbackLng = 98.6756;
  const centerLat = location.latitude !== 0 ? location.latitude : (outletLat || fallbackLat);
  const centerLng = location.longitude !== 0 ? location.longitude : (outletLng || fallbackLng);

  // Kirim GPS ke backend dan hitung ETA+rute saat posisi berubah
  useEffect(() => {
    if (location.latitude === 0 || location.longitude === 0) return;

    // Throttle: jangan kirim kalau posisi sama
    const posKey = `${location.latitude.toFixed(5)},${location.longitude.toFixed(5)}`;
    if (posKey === lastSentRef.current) return;
    lastSentRef.current = posKey;

    // 1. Kirim posisi GPS ke backend
    trackingService.updateLocation({
      order_id: job.id,
      latitude: location.latitude,
      longitude: location.longitude,
      speed: location.speed,
      heading: location.heading,
    }).then((res) => {
      if (res.data) {
        if (res.data.distance_remaining) setDistanceRemaining(res.data.distance_remaining);
        if (res.data.eta_minutes) setEtaMinutes(res.data.eta_minutes);
      }
    }).catch(err => {
      console.error("Failed to send tracking data", err);
    });

    // 2. Fetch rute OSRM dari posisi driver ke customer (REAL driving route)
    if (destLat && destLng) {
      fetch(`https://router.project-osrm.org/route/v1/driving/${location.longitude},${location.latitude};${destLng},${destLat}?overview=full&geometries=geojson`)
        .then(r => r.json())
        .then(data => {
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const coords = route.geometry.coordinates;
            const latLngs = coords.map((c: number[]) => [c[1], c[0]] as [number, number]);
            setRouteCoords(latLngs);
            
            // Gunakan OSRM untuk ETA real (lebih akurat dari Haversine)
            const durationMin = Math.round(route.duration / 60);
            const distanceKm = Number((route.distance / 1000).toFixed(1));
            setEtaMinutes(durationMin);
            setDistanceRemaining(distanceKm);
          }
        })
        .catch(err => console.error("OSRM route error", err));
    }
  }, [location.latitude, location.longitude, location.speed, location.heading, job.id, destLat, destLng]);

  // Fallback: fetch rute dari outlet ke customer jika GPS belum ada
  useEffect(() => {
    if (location.latitude !== 0 || !outletLat || !outletLng || !destLat || !destLng) return;
    
    fetch(`https://router.project-osrm.org/route/v1/driving/${outletLng},${outletLat};${destLng},${destLat}?overview=full&geometries=geojson`)
      .then(r => r.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates;
          setRouteCoords(coords.map((c: number[]) => [c[1], c[0]] as [number, number]));
          setEtaMinutes(Math.round(route.duration / 60));
          setDistanceRemaining(Number((route.distance / 1000).toFixed(1)));
        }
      })
      .catch(err => console.error("OSRM fallback error", err));
  }, [outletLat, outletLng, destLat, destLng, location.latitude]);

  // Fix for leaflet icons in Next.js
  useEffect(() => {
    import("leaflet").then((L) => {
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
      
      // Custom Motor Icon (Match Flutter App Icons.two_wheeler)
      (window as any).motorIcon = L.divIcon({
        className: "custom-driver-marker",
        html: `<div style="background-color: #1A534B; width: 48px; height: 48px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center;">
                 <svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 -960 960 960" width="28" fill="white"><path d="M280-160q-66 0-113-47T120-320q0-66 47-113t113-47q42 0 78.5 22.5T415-397l85-83-80-80 56-56 56 56 47-47-53-73 66-48 76 104q16-4 32.5-6t33.5-2q99 0 169.5 70.5T880-480q0 99-70.5 169.5T640-240q-68 0-123-38.5T436-379l-49 47q21 44 60 76t88 36v80q-73-6-136-40.5T291-344l-25 24H360v80H280Zm0-80h-2l16-16q-31-15-47.5-43T230-360q0-31 16.5-59T294-464l-16-16h2q33 0 56.5 23.5T360-400q0 33-23.5 56.5T280-240Zm360 0q66 0 113-47t47-113q0-66-47-113t-113-47q-29 0-54 10t-45 28l78 78-56 56-94-94q-21 32-24.5 70t13.5 74q18 42 54 69t82 29v-80h-40v-80h80v160Zm0-120q17 0 28.5-11.5T680-400q0-17-11.5-28.5T640-440q-17 0-28.5 11.5T600-400q0 17 11.5 28.5T640-360Z"/></svg>
               </div>`,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
        popupAnchor: [0, -24]
      });

      // Custom Customer Home Icon (Match Flutter App Icons.home)
      (window as any).customerIcon = L.divIcon({
        className: "custom-customer-marker",
        html: `<div style="background-color: white; width: 40px; height: 40px; border-radius: 50%; box-shadow: 0 3px 6px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center;">
                 <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="#1A534B"><path d="M160-120v-480l320-240 320 240v480H560v-280H400v280H160Z"/></svg>
               </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
      });
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#E5E3DF]">
      {/* Map Information Overlay */}
      <div className="absolute top-16 left-4 right-4 z-[1000] bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             Navigasi ke
          </p>
          <p className="font-bold text-[15px] text-neutral-900 leading-tight">{job.customer_name}</p>
          <p className="text-[10px] text-neutral-500 mt-0.5 line-clamp-1">{job.address}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-black text-emerald-600 tracking-tighter">
            {etaMinutes !== null ? `${etaMinutes} min` : '...'}
          </p>
          <p className="text-[10px] text-neutral-500 font-bold bg-neutral-100 px-2 py-0.5 rounded-md inline-block mt-0.5">
            {distanceRemaining !== null ? `${distanceRemaining} km` : 'menghitung...'}
          </p>
        </div>
      </div>

      {typeof window !== 'undefined' && centerLat !== 0 && (
        <MapContainer 
          // @ts-ignore
          center={[centerLat, centerLng]} 
          zoom={15} 
          zoomControl={false}
          style={{ height: '100%', width: '100%', zIndex: 10 }}
        >
          <TileLayer
            // @ts-ignore
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Route Line (Gojek Style Thick Green Line) */}
          {routeCoords.length > 0 && (
            <Polyline positions={routeCoords} color="#10b981" weight={8} opacity={0.9} lineCap="round" lineJoin="round" />
          )}

          {/* Customer Marker (Tujuan) */}
          {destLat !== 0 && (window as any).customerIcon && (
            <Marker position={[destLat, destLng]} icon={(window as any).customerIcon}>
              <Popup>
                <b>{job.customer_name} (Tujuan)</b><br/>
                {job.address}
              </Popup>
            </Marker>
          )}

          {/* Driver Live GPS Marker */}
          {location.latitude !== 0 && (window as any).motorIcon && (
            <Marker position={[location.latitude, location.longitude]} icon={(window as any).motorIcon}>
              <Popup>
                <b>Posisi Saya</b>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      )}

      {/* Action Button at the bottom */}
      <div className="absolute bottom-8 left-4 right-4 z-[1000] pb-[env(safe-area-inset-bottom)]">
        <button 
          onClick={onComplete}
          className="w-full py-4 rounded-2xl bg-[#1A534B] hover:bg-[#15443D] text-white font-bold shadow-2xl shadow-[#1A534B]/40 transition-all active:scale-95 uppercase tracking-widest text-sm"
        >
          Tiba di Tujuan & Upload Bukti
        </button>
      </div>
    </div>
  );
}
