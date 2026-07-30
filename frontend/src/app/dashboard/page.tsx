'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { 
  Truck, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Bike, 
  Car,
  Navigation,
  FileSpreadsheet
} from 'lucide-react';
import { apiFetch, ReportSummary, Journey } from '@/lib/api';
import AuthGuard from '@/components/auth/AuthGuard';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [summary, setSummary] = useState<ReportSummary>({
    total_vehicles: 3,
    active_vehicles: 2,
    total_drivers: 2,
    active_drivers: 2,
    journeys_today: 2,
    flagged_journeys: 1,
    total_km_today: 90,
    auto_km_total: 50,
    moto_km_total: 40,
    total_subsidy_payout: 740,
  });

  const [recentJourneys, setRecentJourneys] = useState<Journey[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const summaryData = await apiFetch<ReportSummary>('/reports/summary');
      setSummary(summaryData);

      const journeysData = await apiFetch<Journey[]>('/journeys');
      setRecentJourneys(journeysData.slice(0, 5));
    } catch (err) {
      console.log('Usando datos de prueba locales para dashboard');
    }
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-8 overflow-y-auto space-y-8">
            {/* Header section */}
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Panel de Control Operativo y Subsidio</h1>
              <p className="text-slate-400 text-sm mt-1">
                Monitoreo en tiempo real de recorridos, discrepancias de odómetro y liquidación de subsidio vehicular (C$)
              </p>
            </div>

            {/* Operational & Financial KPIs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: Subsidio Total ($) */}
              <div className="glass-panel p-5 border border-emerald-500/30 bg-gradient-to-tr from-emerald-950/30 via-slate-900/80 to-slate-900/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Subsidio a Pagar</span>
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-white tracking-tight">
                  C$ {summary.total_subsidy_payout?.toLocaleString('es-NI', { minimumFractionDigits: 2 }) || '0.00'}
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400 font-medium">
                  <span className="text-sky-400 flex items-center gap-1 font-semibold">
                    <Car className="w-3.5 h-3.5" /> 10 C$/km
                  </span>
                  <span>•</span>
                  <span className="text-amber-400 flex items-center gap-1 font-semibold">
                    <Bike className="w-3.5 h-3.5" /> 6 C$/km
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Kilometraje por Tipo */}
            <div className="glass-panel p-5 border border-sky-500/30 bg-gradient-to-tr from-sky-950/30 via-slate-900/80 to-slate-900/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Total Kilómetros</span>
                <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-white tracking-tight">
                  {summary.total_km_today || 0} <span className="text-sm font-normal text-slate-400">km</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                  <span className="text-sky-300">Autos: {summary.auto_km_total || 0} km</span>
                  <span>|</span>
                  <span className="text-amber-300">Motos: {summary.moto_km_total || 0} km</span>
                </div>
              </div>
            </div>

            {/* Card 3: Recorridos Inconsistentes */}
            <div className="glass-panel p-5 border border-amber-500/30 bg-gradient-to-tr from-amber-950/30 via-slate-900/80 to-slate-900/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Discrepancias GPS</span>
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-white tracking-tight">
                  {summary.flagged_journeys || 0}
                </div>
                <p className="text-xs text-slate-400 mt-1 font-medium">Recorridos marcados para revisión</p>
              </div>
            </div>

            {/* Card 4: Flota Activa */}
            <div className="glass-panel p-5 border border-blue-500/30 bg-gradient-to-tr from-blue-950/30 via-slate-900/80 to-slate-900/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Vehículos Operativos</span>
                <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl">
                  <Truck className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-white tracking-tight">
                  {summary.active_vehicles} / {summary.total_vehicles}
                </div>
                <p className="text-xs text-slate-400 mt-1 font-medium">Conductores activos: {summary.active_drivers}</p>
              </div>
            </div>
          </div>

          {/* Tarifas de Subsidio Summary Banner */}
          <div className="glass-panel p-6 border border-sky-500/30 rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-900">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" /> Esquema de Tarifas de Subsidio Vehicular
                </h3>
                <p className="text-xs text-slate-400">
                  Cálculo automático basado en el kilometraje declarado y auditado por trazado GPS en tiempo real.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-900/90 border border-sky-500/30 rounded-xl">
                  <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Automóviles / Camionetas</div>
                    <div className="text-sm font-black text-white">10.00 C$ <span className="text-xs font-normal text-slate-400">/ km</span></div>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-900/90 border border-amber-500/30 rounded-xl">
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Motocicletas</div>
                    <div className="text-sm font-black text-white">6.00 C$ <span className="text-xs font-normal text-slate-400">/ km</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Journeys Table */}
          <div className="glass-panel overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Últimos Recorridos Registrados</h2>
                <p className="text-xs text-slate-400 mt-0.5">Control de odómetro, auditoría GPS y pago en C$</p>
              </div>
              <a
                href="/journeys"
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
              >
                Ver todos los recorridos →
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5">Conductor & Vehículo</th>
                    <th className="px-6 py-3.5">Recorrido</th>
                    <th className="px-6 py-3.5">KM Decl. vs GPS</th>
                    <th className="px-6 py-3.5">Subsidio (C$)</th>
                    <th className="px-6 py-3.5">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentJourneys.map((j) => {
                    const isMoto = j.vehicle?.vehicle_type === 'moto';
                    const rate = isMoto ? 6 : 10;
                    const subsidy = j.subsidy_amount || (j.declared_dist_km * rate);

                    return (
                      <tr key={j.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{j.driver?.user?.full_name || 'Conductor #' + j.driver_id}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                            {isMoto ? (
                              <span className="text-amber-400 flex items-center gap-1"><Bike className="w-3 h-3" /> Moto</span>
                            ) : (
                              <span className="text-sky-400 flex items-center gap-1"><Car className="w-3 h-3" /> Auto</span>
                            )}
                            <span>•</span>
                            <span>{j.vehicle?.plate_number || 'Vehículo #' + j.vehicle_id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-slate-300">{j.start_address} → {j.end_address || 'En ruta...'}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{new Date(j.start_time).toLocaleString('es-NI')}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-mono text-xs font-semibold text-white">
                            Decl: {j.declared_dist_km} km | GPS: {j.gps_dist_km.toFixed(1)} km
                          </div>
                          {j.diff_km > 5 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 mt-0.5">
                              <AlertTriangle className="w-3 h-3" /> Dif: +{j.diff_km.toFixed(1)} km
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-mono text-sm font-bold text-emerald-400">
                            C$ {subsidy.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            ({j.declared_dist_km} km × {rate} C$)
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {j.status === 'flagged' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              Inconsistente
                            </span>
                          )}
                          {j.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              Aprobado
                            </span>
                          )}
                          {j.status === 'completed' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                              Completado
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
    </AuthGuard>
  );
}
