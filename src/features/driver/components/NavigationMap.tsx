"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { DriverJob } from "@/types/jobs";
import { useGeolocation } from "../hooks/useGeolocation";
import { trackingService } from "../services/trackingService";

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

  // We only start geolocation if we have an order ID
  const location = useGeolocation(true, 5000);

  // Fallback coords if job doesn't have coordinates
  const destLat = job.lat || -6.200000;
  const destLng = job.lng || 106.816666;
  const outletLat = (job as any).outlet_lat || -6.210000;
  const outletLng = (job as any).outlet_lng || 106.826666;

  // Send GPS data to backend when location changes
  useEffect(() => {
    if (location.latitude !== 0 && location.longitude !== 0) {
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
    }
  }, [location.latitude, location.longitude, location.speed, location.heading, job.id]);

  // Fetch route from OSRM
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        // Start from outlet to customer
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${outletLng},${outletLat};${destLng},${destLat}?overview=full&geometries=geojson`);
        const data = await res.json();
        
        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates;
          // GeoJSON returns [lng, lat], we need [lat, lng] for Leaflet
          const latLngs = coords.map((c: number[]) => [c[1], c[0]] as [number, number]);
          setRouteCoords(latLngs);
        }
      } catch (error) {
        console.error("Failed to fetch route from OSRM", error);
      }
    };
    
    fetchRoute();
  }, [outletLat, outletLng, destLat, destLng]);

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
    });
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#E5E3DF]">
      {/* Map Information Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[400] bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             Navigasi ke
          </p>
          <p className="font-bold text-[15px] text-neutral-900 leading-tight">{job.customer_name}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-emerald-600 tracking-tighter">
            {etaMinutes !== null ? `${etaMinutes} min` : '...'}
          </p>
          <p className="text-[10px] text-neutral-500 font-bold bg-neutral-100 px-2 py-0.5 rounded-md inline-block mt-0.5">
            {distanceRemaining !== null ? `${distanceRemaining.toFixed(1)} km` : 'menghitung...'}
          </p>
        </div>
      </div>

      {typeof window !== 'undefined' && (
        <MapContainer 
          // @ts-ignore
          center={[outletLat, outletLng]} 
          zoom={14} 
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

          {/* Outlet Marker */}
          <Marker position={[outletLat, outletLng]}>
            <Popup>
              <b>Outlet (Start)</b>
            </Popup>
          </Marker>

          {/* Customer Marker */}
          <Marker position={[destLat, destLng]}>
            <Popup>
              <b>{job.customer_name} (Tujuan)</b><br/>
              {job.address}
            </Popup>
          </Marker>

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
      <div className="absolute bottom-4 left-4 right-4 z-[400]">
        <button 
          onClick={onComplete}
          className="w-full py-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-600/30 transition-all active:scale-95 uppercase tracking-widest text-sm"
        >
          Tiba di Tujuan & Upload Bukti
        </button>
      </div>
    </div>
  );
}
