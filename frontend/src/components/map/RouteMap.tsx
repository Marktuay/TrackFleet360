'use client';

import { useEffect, useRef } from 'react';
import { GPSPoint } from '@/lib/api';

interface RouteMapProps {
  points?: GPSPoint[];
  startLat: number;
  startLng: number;
  endLat?: number;
  endLng?: number;
  startAddress?: string;
  endAddress?: string;
  height?: string;
}

export default function RouteMap({
  points = [],
  startLat,
  startLng,
  endLat,
  endLng,
  startAddress = 'Managua, Nicaragua',
  endAddress = 'Destino en Nicaragua',
  height = '360px',
}: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;
    const container = mapRef.current;

    // Load Leaflet dynamically
    import('leaflet').then((L) => {
      if (!container) return;

      // Fix default marker icon paths in webpack/next
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      if (leafletInstance.current) {
        leafletInstance.current.remove();
      }

      // Default center: Managua, Nicaragua (12.1364, -86.2514)
      const defaultCenter: [number, number] = [startLat || 12.1364, startLng || -86.2514];
      const map = L.map(container, {
        center: defaultCenter,
        zoom: 12,
        zoomControl: true,
      });
      leafletInstance.current = map;

      // Esri World Dark Gray Canvas tiles (100% free, no API key required, dark theme)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a> & OpenStreetMap Nicaragua',
        maxZoom: 16,
      }).addTo(map);

      const bounds: [number, number][] = [];

      // 1. Add Start Marker (Green Pin)
      if (startLat && startLng) {
        bounds.push([startLat, startLng]);
        const startIcon = L.divIcon({
          className: 'custom-start-marker',
          html: `<div style="background-color: #10b981; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 12px #10b981;"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        L.marker([startLat, startLng], { icon: startIcon })
          .addTo(map)
          .bindPopup(`<strong style="color: #10b981;">🟢 ORIGEN (Nicaragua):</strong><br/>${startAddress}`);
      }

      // 2. Add End Marker (Red Pin)
      if (endLat && endLng) {
        bounds.push([endLat, endLng]);
        const endIcon = L.divIcon({
          className: 'custom-end-marker',
          html: `<div style="background-color: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 12px #ef4444;"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        L.marker([endLat, endLng], { icon: endIcon })
          .addTo(map)
          .bindPopup(`<strong style="color: #ef4444;">🔴 DESTINO (Nicaragua):</strong><br/>${endAddress}`);
      }

      // 3. Draw GPS Polyline path
      const polylineCoords: [number, number][] = [];
      if (points && points.length > 0) {
        points.forEach((pt) => {
          polylineCoords.push([pt.latitude, pt.longitude]);
          bounds.push([pt.latitude, pt.longitude]);
        });
      } else if (startLat && startLng && endLat && endLng) {
        // Fallback straight line if points empty
        polylineCoords.push([startLat, startLng], [endLat, endLng]);
      }

      if (polylineCoords.length > 1) {
        L.polyline(polylineCoords, {
          color: '#38bdf8', // Sky Blue
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 8',
        }).addTo(map);
      }

      // Fit map view bounds
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    });

    return () => {
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, [points, startLat, startLng, endLat, endLng, startAddress, endAddress]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 shadow-xl">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div ref={mapRef} style={{ height }} className="w-full bg-slate-900 z-10" />
      <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 z-20 text-[11px] text-slate-300 font-semibold flex items-center gap-3 shadow-md">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Origen (Nicaragua)
        </span>
        <span className="flex items-center gap-1.5 text-rose-400">
          <span className="w-2 h-2 rounded-full bg-rose-400"></span> Destino (Nicaragua)
        </span>
        <span className="flex items-center gap-1.5 text-sky-400">
          <span className="w-3 h-0.5 bg-sky-400"></span> Trazado GPS Real
        </span>
      </div>
    </div>
  );
}
