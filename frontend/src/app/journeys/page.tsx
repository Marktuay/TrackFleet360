'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { 
  MapPin, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  X, 
  FileText, 
  Check, 
  Clock, 
  ShieldAlert,
  Car,
  Bike,
  DollarSign,
  Map as MapIcon,
  Navigation,
  Route
} from 'lucide-react';
import { apiFetch, Journey } from '@/lib/api';
import AuthGuard from '@/components/auth/AuthGuard';

// Dynamically import RouteMap without SSR to prevent Leaflet window hydration errors
const RouteMap = dynamic(() => import('@/components/map/RouteMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] bg-slate-900 animate-pulse rounded-xl flex items-center justify-center text-slate-500 text-xs font-semibold">
      Cargando Trazado de Carretera GPS (Nicaragua)...
    </div>
  ),
});

export default function JourneysPage() {
  const [mounted, setMounted] = useState(false);
  const [journeys, setJourneys] = useState<Journey[]>([
    {
      id: 1,
      driver_id: 1,
      driver: { id: 1, user_id: 3, user: { id: 3, email: 'conductor1@trackfleet360.com', full_name: 'Juan Pérez (Conductor)', role: 'driver', active: true }, license_number: 'LIC-884920', phone: '+505 8888-1111', status: 'active' },
      vehicle_id: 1,
      vehicle: { id: 1, plate_number: 'M-289-401', brand: 'Toyota', model: 'Hilux 4x4', year: 2022, vehicle_type: 'auto', subsidy_rate: 10, initial_km: 15000, current_km: 18450, status: 'active' },
      start_time: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      end_time: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      start_lat: 12.1430,
      start_lng: -86.2080,
      start_address: 'Managua (Carretera Norte - Mercado Mayoreo)',
      end_lat: 12.1978,
      end_lng: -86.0967,
      end_address: 'Tipitapa (Parque Industrial / Carretera NIC-1)',
      start_km: 18400,
      end_km: 18450,
      declared_dist_km: 50,
      gps_dist_km: 22.5,
      diff_km: 27.5,
      subsidy_rate: 10,
      subsidy_amount: 500,
      status: 'flagged',
      // Real Highway Coordinates following Nicaragua's Carretera Norte (NIC-1)
      points: [
        { id: 1, journey_id: 1, latitude: 12.1430, longitude: -86.2080, speed: 0, recorded_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString() },
        { id: 2, journey_id: 1, latitude: 12.1445, longitude: -86.2000, speed: 45, recorded_at: new Date(Date.now() - 2.8 * 3600 * 1000).toISOString() },
        { id: 3, journey_id: 1, latitude: 12.1470, longitude: -86.1800, speed: 55, recorded_at: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString() },
        { id: 4, journey_id: 1, latitude: 12.1485, longitude: -86.1680, speed: 60, recorded_at: new Date(Date.now() - 2.2 * 3600 * 1000).toISOString() },
        { id: 5, journey_id: 1, latitude: 12.1550, longitude: -86.1500, speed: 62, recorded_at: new Date(Date.now() - 1.9 * 3600 * 1000).toISOString() },
        { id: 6, journey_id: 1, latitude: 12.1650, longitude: -86.1300, speed: 58, recorded_at: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString() },
        { id: 7, journey_id: 1, latitude: 12.1800, longitude: -86.1150, speed: 50, recorded_at: new Date(Date.now() - 1.2 * 3600 * 1000).toISOString() },
        { id: 8, journey_id: 1, latitude: 12.1930, longitude: -86.1000, speed: 40, recorded_at: new Date(Date.now() - 1.1 * 3600 * 1000).toISOString() },
        { id: 9, journey_id: 1, latitude: 12.1978, longitude: -86.0967, speed: 0, recorded_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString() },
      ],
      photos: [
        { id: 1, journey_id: 1, photo_type: 'end_odometer', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80', captured_at: new Date().toISOString() }
      ]
    },
    {
      id: 2,
      driver_id: 2,
      driver: { id: 2, user_id: 4, user: { id: 4, email: 'conductor2@trackfleet360.com', full_name: 'Roberto Gómez', role: 'driver', active: true }, license_number: 'LIC-993021', phone: '+505 8888-2222', status: 'active' },
      vehicle_id: 2,
      vehicle: { id: 2, plate_number: 'MOTO-808-NI', brand: 'Yamaha', model: 'FZ-25 250cc', year: 2023, vehicle_type: 'moto', subsidy_rate: 6, initial_km: 2000, current_km: 8500, status: 'active' },
      start_time: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      end_time: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      start_lat: 12.4379,
      start_lng: -86.8780,
      start_address: 'León Centro (Salida a Chinandega - Carretera NIC-12)',
      end_lat: 12.6294,
      end_lng: -87.1311,
      end_address: 'Chinandega Centro (Distribuidora Norte - NIC-12)',
      start_km: 8460,
      end_km: 8500,
      declared_dist_km: 40,
      gps_dist_km: 39.2,
      diff_km: 0.8,
      subsidy_rate: 6,
      subsidy_amount: 240,
      status: 'approved',
      // Real Highway Coordinates following Nicaragua's Carretera León - Chinandega (NIC-12 / NIC-26)
      points: [
        { id: 5, journey_id: 2, latitude: 12.4379, longitude: -86.8780, speed: 0, recorded_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString() },
        { id: 6, journey_id: 2, latitude: 12.4800, longitude: -86.8650, speed: 65, recorded_at: new Date(Date.now() - 5.7 * 3600 * 1000).toISOString() },
        { id: 7, journey_id: 2, latitude: 12.5220, longitude: -86.8580, speed: 70, recorded_at: new Date(Date.now() - 5.4 * 3600 * 1000).toISOString() }, // Empalme Telica
        { id: 8, journey_id: 2, latitude: 12.5450, longitude: -86.9790, speed: 68, recorded_at: new Date(Date.now() - 5.0 * 3600 * 1000).toISOString() }, // Posoltega
        { id: 9, journey_id: 2, latitude: 12.5730, longitude: -87.0270, speed: 65, recorded_at: new Date(Date.now() - 4.5 * 3600 * 1000).toISOString() }, // Chichigalpa
        { id: 10, journey_id: 2, latitude: 12.6000, longitude: -87.0800, speed: 50, recorded_at: new Date(Date.now() - 4.2 * 3600 * 1000).toISOString() },
        { id: 11, journey_id: 2, latitude: 12.6294, longitude: -87.1311, speed: 0, recorded_at: new Date(Date.now() - 4.0 * 3600 * 1000).toISOString() },
      ]
    }
  ]);

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal audit state
  const [auditingJourney, setAuditingJourney] = useState<Journey | null>(null);
  const [expandedMapId, setExpandedMapId] = useState<number | null>(null);
  const [supervisorNotes, setSupervisorNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchJourneys();
  }, []);

  const fetchJourneys = () => {
    apiFetch<Journey[]>('/journeys')
      .then((data) => setJourneys(data))
      .catch(() => {});
  };

  const handleAuditAction = async (status: 'approved' | 'rejected') => {
    if (!auditingJourney) return;
    setIsSubmitting(true);

    try {
      await apiFetch(`/journeys/${auditingJourney.id}/validate`, {
        method: 'POST',
        body: JSON.stringify({
          status,
          supervisor_notes: supervisorNotes,
        }),
      });

      setJourneys((prev) =>
        prev.map((j) => (j.id === auditingJourney.id ? { ...j, status, supervisor_notes: supervisorNotes } : j))
      );

      setAuditingJourney(null);
      setSupervisorNotes('');
    } catch (err: any) {
      alert(err.message || 'Error al validar recorrido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredJourneys = journeys.filter((j) => {
    const matchesStatus = selectedStatus === 'all' || j.status === selectedStatus;
    const matchesSearch = 
      j.driver?.user?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.vehicle?.plate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.start_address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (!mounted) return null;

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Monitoreo y Validación de Recorridos (Carreteras Nicaragua)
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Auditoría objetiva de trayectos, trazado GPS sobre carreteras principales de Nicaragua y comprobación de odómetro
            </p>
          </div>

          {/* Filter Bar */}
          <div className="glass-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por placa, conductor o carretera en Nicaragua..."
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
              >
                <option value="all">Todos los Estados</option>
                <option value="flagged">⚠️ Revisión Requerida (Inconsistente)</option>
                <option value="completed">Pendientes de Validación</option>
                <option value="approved">✅ Aprobados</option>
                <option value="rejected">❌ Rechazados</option>
              </select>
            </div>
          </div>

          {/* Journeys List */}
          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5">ID / Fecha</th>
                    <th className="px-6 py-3.5">Conductor</th>
                    <th className="px-6 py-3.5">Vehículo</th>
                    <th className="px-6 py-3.5">Trayecto por Carretera (Nicaragua)</th>
                    <th className="px-6 py-3.5">KM Decl.</th>
                    <th className="px-6 py-3.5">KM GPS</th>
                    <th className="px-6 py-3.5">Diferencia</th>
                    <th className="px-6 py-3.5">Subsidio (C$)</th>
                    <th className="px-6 py-3.5">Estado</th>
                    <th className="px-6 py-3.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredJourneys.map((j) => {
                    const isMoto = j.vehicle?.vehicle_type === 'moto';
                    const rate = isMoto ? 6 : 10;
                    const subsidy = j.subsidy_amount || (j.declared_dist_km * rate);
                    const isMapOpen = expandedMapId === j.id;

                    return (
                      <>
                        <tr key={j.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs">
                            <div className="font-bold text-white">#REC-{j.id}</div>
                            <div className="text-slate-500 text-[11px]">{new Date(j.start_time).toLocaleDateString('es-NI')}</div>
                          </td>
                          <td className="px-6 py-4 font-medium text-white">
                            {j.driver?.user?.full_name || 'Conductor #' + j.driver_id}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 text-xs">
                              {j.vehicle?.plate_number}
                            </span>
                            <div className="text-[11px] text-slate-400 mt-0.5">{j.vehicle?.brand} {j.vehicle?.model}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Destino: {j.destination || 'SINSA Altamira'}
                            </div>
                            <div className="text-[11px] text-slate-300 flex items-center gap-1 mt-1">
                              <Route className="w-3 h-3 text-sky-400 shrink-0" /> {j.start_address} → {j.end_address || 'En Ruta'}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-white text-xs">{j.declared_dist_km} KM</td>
                          <td className="px-6 py-4 font-mono text-sky-400 font-bold text-xs">{j.gps_dist_km.toFixed(1)} KM</td>
                          <td className="px-6 py-4 font-mono text-xs">
                            {j.diff_km > 5 ? (
                              <span className="font-bold text-amber-400">+{j.diff_km.toFixed(1)} KM</span>
                            ) : (
                              <span className="text-emerald-400 font-semibold">{j.diff_km.toFixed(1)} KM</span>
                            )}
                          </td>
                          <td className="px-6 py-4 font-mono text-emerald-400 font-bold text-xs">
                            C$ {subsidy.toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            {j.status === 'flagged' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                <AlertTriangle className="w-3.5 h-3.5" /> Revisión Requerida
                              </span>
                            )}
                            {j.status === 'approved' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Aprobado
                              </span>
                            )}
                            {j.status === 'rejected' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                <XCircle className="w-3.5 h-3.5" /> Rechazado
                              </span>
                            )}
                            {j.status === 'completed' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                                <Clock className="w-3.5 h-3.5" /> Completado
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Toggle Inline Map */}
                              <button
                                onClick={() => setExpandedMapId(isMapOpen ? null : j.id)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                                  isMapOpen
                                    ? 'bg-sky-500 text-white border-sky-400'
                                    : 'bg-slate-800 hover:bg-slate-700 text-sky-400 border-slate-700'
                                }`}
                              >
                                <MapIcon className="w-3.5 h-3.5" /> {isMapOpen ? 'Ocultar Mapa' : 'Ver Carretera'}
                              </button>

                              {/* Audit Modal Button */}
                              <button
                                onClick={() => {
                                  setAuditingJourney(j);
                                  setSupervisorNotes(j.supervisor_notes || '');
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 transition-colors flex items-center gap-1.5"
                              >
                                <Eye className="w-3.5 h-3.5" /> Auditar
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Inline Expandable Map */}
                        {isMapOpen && (
                          <tr className="bg-slate-900/60 border-b border-slate-800">
                            <td colSpan={10} className="p-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                                  <span className="flex items-center gap-2 text-sky-400 font-bold">
                                    <Navigation className="w-4 h-4" /> Trazado de Carretera GPS Real en Nicaragua (#REC-{j.id})
                                  </span>
                                  <span>Conductor: {j.driver?.user?.full_name} | Placa: {j.vehicle?.plate_number}</span>
                                </div>
                                <RouteMap
                                  points={j.points}
                                  startLat={j.start_lat}
                                  startLng={j.start_lng}
                                  endLat={j.end_lat}
                                  endLng={j.end_lng}
                                  startAddress={j.start_address}
                                  endAddress={j.end_address}
                                  height="320px"
                                />
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit & Validation Modal with Split Map & Details View */}
          {auditingJourney && (
            <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="glass-panel w-full max-w-5xl p-6 space-y-6 relative max-h-[92vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">
                        Auditoría y Validación de Carretera en Nicaragua #REC-{auditingJourney.id}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Evaluación de trazado por carreteras de Nicaragua, odómetro de vehículo y cálculo de subsidio (C$)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAuditingJourney(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Split Content: Left Details & Right Map */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column: Journey Details & Photo */}
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                      <h4 className="font-bold text-white text-xs uppercase tracking-wider text-sky-400">
                        Detalles del Conductor y Vehículo
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block">Conductor:</span>
                          <span className="font-bold text-white">{auditingJourney.driver?.user?.full_name}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Vehículo / Placa:</span>
                          <span className="font-bold text-sky-400 font-mono">{auditingJourney.vehicle?.plate_number}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Tipo Vehículo:</span>
                          <span className="font-semibold text-slate-200 uppercase">{auditingJourney.vehicle?.vehicle_type || 'auto'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Subsidio a Pagar:</span>
                          <span className="font-bold text-emerald-400 font-mono text-sm">
                            C$ {(auditingJourney.subsidy_amount || auditingJourney.declared_dist_km * (auditingJourney.vehicle?.vehicle_type === 'moto' ? 6 : 10)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Distance Audit Metrics */}
                    <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                      <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
                        Contraste de Kilometraje y Odómetro
                      </h4>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                          <span className="text-slate-400 text-[10px] block">Declarado</span>
                          <span className="font-mono font-bold text-white text-sm">{auditingJourney.declared_dist_km} KM</span>
                        </div>
                        <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                          <span className="text-slate-400 text-[10px] block">Calculado GPS</span>
                          <span className="font-mono font-bold text-sky-400 text-sm">{auditingJourney.gps_dist_km.toFixed(1)} KM</span>
                        </div>
                        <div className="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/30">
                          <span className="text-amber-400 text-[10px] block">Diferencia</span>
                          <span className="font-mono font-bold text-amber-400 text-sm">+{auditingJourney.diff_km.toFixed(1)} KM</span>
                        </div>
                      </div>
                    </div>

                    {/* Odómetro Photo Evidence */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Evidencia Fotográfica de Odómetro Final
                      </label>
                      <div className="relative rounded-xl overflow-hidden border border-slate-800 h-44 bg-slate-900">
                        {auditingJourney.photos && auditingJourney.photos.length > 0 ? (
                          <img
                            src={auditingJourney.photos[0].url}
                            alt="Foto Odómetro Final"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                            <span>Fotografía registrada en sistema</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Interactive GPS Route Map */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                        <span className="text-sky-400 font-bold flex items-center gap-1.5">
                          <MapIcon className="w-4 h-4" /> Mapa de Trazado por Carretera GPS (Nicaragua)
                        </span>
                        <span className="text-[11px] text-slate-500">{auditingJourney.points?.length || 0} Puntos de Ruta</span>
                      </div>
                      <RouteMap
                        points={auditingJourney.points}
                        startLat={auditingJourney.start_lat}
                        startLng={auditingJourney.start_lng}
                        endLat={auditingJourney.end_lat}
                        endLng={auditingJourney.end_lng}
                        startAddress={auditingJourney.start_address}
                        endAddress={auditingJourney.end_address}
                        height="340px"
                      />
                    </div>

                    {/* Supervisor Notes */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Observaciones del Supervisor / Dictamen
                      </label>
                      <textarea
                        rows={2}
                        value={supervisorNotes}
                        onChange={(e) => setSupervisorNotes(e.target.value)}
                        placeholder="Escriba aquí los detalles de la auditoría o justificativo en caso de rechazo/aprobación..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-400">
                    Última actualización: {new Date().toLocaleString('es-NI')}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setAuditingJourney(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleAuditAction('rejected')}
                      className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-bold rounded-lg transition-all"
                    >
                      ❌ Rechazar Recorrido
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleAuditAction('approved')}
                      className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-lg transition-all shadow-lg shadow-emerald-600/20"
                    >
                      ✅ Aprobar y Liberar Subsidio
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
    </AuthGuard>
  );
}
