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
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  // 1. Initialize Leaflet Map ONCE on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;
    const container = mapRef.current;
    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !container) return;

      // Fix default marker icon paths in webpack/next
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      if (!mapInstanceRef.current) {
        const defaultCenter: [number, number] = [startLat || 12.1364, startLng || -86.2514];
        const map = L.map(container, {
          center: defaultCenter,
          zoom: 12,
          zoomControl: true,
          fadeAnimation: false,
        });

        // OpenStreetMap standard tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          subdomains: ['a', 'b', 'c'],
        }).addTo(map);

        const layerGroup = L.layerGroup().addTo(map);
        layerGroupRef.current = layerGroup;
        mapInstanceRef.current = map;
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        layerGroupRef.current = null;
      }
    };
  }, []); // Run once on mount

  // 2. Update Layers (Markers, Polyline, Bounds) smoothly without destroying map
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      const layerGroup = layerGroupRef.current;

      if (!map || !layerGroup) return;

      layerGroup.clearLayers();
      const bounds: [number, number][] = [];

      // 1. Add Start Marker (Green Pin)
      if (startLat && startLng) {
        bounds.push([startLat, startLng]);
        const startIcon = L.divIcon({
          className: 'custom-start-marker',
          html: `<div style="background-color: #10b981; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 12px #10b981;"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        L.marker([startLat, startLng], { icon: startIcon })
          .addTo(layerGroup)
          .bindPopup(`<strong style="color: #10b981;">🟢 ORIGEN (Nicaragua):</strong><br/>${startAddress}`);
      }

      // 2. Add End Marker (Red Pin)
      if (endLat && endLng) {
        bounds.push([endLat, endLng]);
        const endIcon = L.divIcon({
          className: 'custom-end-marker',
          html: `<div style="background-color: #ef4444; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 12px #ef4444;"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        L.marker([endLat, endLng], { icon: endIcon })
          .addTo(layerGroup)
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
        polylineCoords.push([startLat, startLng], [endLat, endLng]);
      }

      if (polylineCoords.length > 1) {
        L.polyline(polylineCoords, {
          color: '#0284c7',
          weight: 5,
          opacity: 0.9,
          dashArray: '8, 8',
        }).addTo(layerGroup);
      }

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }

      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 100);
    });
  }, [points, startLat, startLng, endLat, endLng, startAddress, endAddress]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 shadow-xl">
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
