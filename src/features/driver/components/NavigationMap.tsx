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

  // Posisi center peta: prioritas GPS driver, fallback ke outlet
  const centerLat = location.latitude !== 0 ? location.latitude : outletLat;
  const centerLng = location.longitude !== 0 ? location.longitude : outletLng;

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
      
      // Custom Motor Icon
      (window as any).motorIcon = new L.Icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/3202/3202926.png",
        iconSize: [46, 46],
        iconAnchor: [23, 23],
        popupAnchor: [0, -20]
      });

      // Custom Customer Pin (red)
      (window as any).customerIcon = new L.Icon({
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
      });
    });
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#E5E3DF]">
      {/* Map Information Overlay */}
      <div className="absolute top-16 left-4 right-4 z-[400] bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 flex justify-between items-center">
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
          {destLat !== 0 && (
            <Marker position={[destLat, destLng]}>
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
      <div className="absolute bottom-8 left-4 right-4 z-[400]">
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
