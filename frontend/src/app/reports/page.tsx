'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { 
  FileSpreadsheet, 
  Download, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  DollarSign, 
  Car, 
  Bike, 
  Users, 
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  ChevronDown,
  X,
  Filter,
  FileSpreadsheet as ExcelIcon,
  Inbox
} from 'lucide-react';
import * as XLSX from 'xlsx';
import AuthGuard from '@/components/auth/AuthGuard';
import { apiFetch, ReportSummary, DriverSubsidySummary, CutoffPeriod, Journey } from '@/lib/api';
import { generateCutoffPDFReport } from '@/lib/pdfReport';

export default function ReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cutoffs, setCutoffs] = useState<CutoffPeriod[]>([]);
  const [selectedCutoffId, setSelectedCutoffId] = useState<number | 'all'>('all');
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [allJourneys, setAllJourneys] = useState<Journey[]>([]);

  const [summary, setSummary] = useState<ReportSummary>({
    total_vehicles: 0,
    active_vehicles: 0,
    total_drivers: 0,
    active_drivers: 0,
    journeys_today: 0,
    flagged_journeys: 0,
    total_km_today: 0,
    auto_km_total: 0,
    moto_km_total: 0,
    total_subsidy_payout: 0,
    drivers_breakdown: []
  });

  useEffect(() => {
    setMounted(true);
    fetchCutoffs();
    fetchSummary('all');
    fetchAllJourneys();
  }, []);

  const fetchCutoffs = async () => {
    try {
      const periods = await apiFetch<CutoffPeriod[]>('/cutoffs');
      setCutoffs(periods);
    } catch (err) {
      console.log('Usando periodos de prueba');
    }
  };

  const fetchAllJourneys = async () => {
    try {
      const list = await apiFetch<Journey[]>('/journeys');
      setAllJourneys(list);
    } catch (err) {
      // Mock fallback data for PDF report testing
      setAllJourneys([
        {
          id: 101,
          driver_id: 4,
          driver: { id: 4, user_id: 7, license_number: 'LIC-774920', phone: '+505 8888-4444', status: 'active', user: { id: 7, email: 'jorge.mayorga@newcenturyni.com', full_name: 'Jorge Mayorga', role: 'driver', active: true } },
          vehicle_id: 4,
          vehicle: { id: 4, plate_number: 'MOTO-808-NI', brand: 'Yamaha', model: 'FZ-25 250cc', year: 2023, vehicle_type: 'moto', initial_km: 8000, current_km: 8500, status: 'active' },
          destination: 'SINSA Altamira',
          start_time: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
          end_time: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          start_lat: 12.1364,
          start_lng: -86.2514,
          start_address: 'Managua - Sucursal Central',
          end_lat: 12.1280,
          end_lng: -86.2400,
          end_address: 'SINSA Altamira',
          start_km: 8500,
          end_km: 8525,
          declared_dist_km: 25.0,
          gps_dist_km: 24.8,
          diff_km: 0.2,
          subsidy_rate: 6.0,
          subsidy_amount: 150.0,
          status: 'completed',
        },
        {
          id: 102,
          driver_id: 1,
          driver: { id: 1, user_id: 3, license_number: 'LIC-884920', phone: '+505 8888-1111', status: 'active', user: { id: 3, email: 'juan.perez@newcenturyni.com', full_name: 'Juan Pérez', role: 'driver', active: true } },
          vehicle_id: 1,
          vehicle: { id: 1, plate_number: 'M-289-401', brand: 'Toyota', model: 'Hilux 4x4', year: 2022, vehicle_type: 'auto', initial_km: 15000, current_km: 18450, status: 'active' },
          destination: 'Sucursal Linda Vista',
          start_time: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
          end_time: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
          start_lat: 12.1430,
          start_lng: -86.2080,
          start_address: 'Managua (Carretera Norte)',
          end_lat: 12.1550,
          end_lng: -86.2900,
          end_address: 'Linda Vista',
          start_km: 18400,
          end_km: 18440,
          declared_dist_km: 40.0,
          gps_dist_km: 39.5,
          diff_km: 0.5,
          subsidy_rate: 10.0,
          subsidy_amount: 400.0,
          status: 'completed',
        }
      ]);
    }
  };

  const fetchSummary = async (cutoffId: number | 'all') => {
    try {
      const query = cutoffId !== 'all' ? `?cutoff_id=${cutoffId}` : '';
      const data = await apiFetch<ReportSummary>(`/reports/summary${query}`);
      setSummary(data);
    } catch (err) {
      console.log('Error cargando reporte');
    }
  };

  const handleCutoffChange = (idStr: string) => {
    const val = idStr === 'all' ? 'all' : parseInt(idStr);
    setSelectedCutoffId(val);
    fetchSummary(val);
  };

  const driversList: DriverSubsidySummary[] = summary.drivers_breakdown || [];

  const filteredDrivers = driversList.filter(
    (d) =>
      d.driver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.license_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCutoffObj = cutoffs.find((c) => c.id === selectedCutoffId);

  const exportReportPDF = () => {
    const periodName = selectedCutoffObj ? selectedCutoffObj.period_name : 'Todos los Periodos Acumulados (2026)';
    const filteredJourneys = selectedCutoffId === 'all'
      ? allJourneys
      : allJourneys.filter((j) => j.cutoff_id === selectedCutoffId);

    generateCutoffPDFReport({
      periodName,
      journeys: filteredJourneys.length > 0 ? filteredJourneys : allJourneys,
      summary,
    });
  };

  const exportReportExcel = () => {
    const cutoffName = selectedCutoffObj ? selectedCutoffObj.period_name : "Todos los Periodos Acumulados";
    const wb = XLSX.utils.book_new();

    // 1. Sheet 1: Driver Breakdown
    const driversData = driversList.map((d) => ({
      "ID Conductor": d.driver_id,
      "Nombre Completo": d.driver_name,
      "No. Licencia": d.license_number || 'N/A',
      "KM en Auto (10 C$/km)": d.auto_km,
      "Subsidio Auto (C$)": d.auto_km * 10,
      "KM en Moto (6 C$/km)": d.moto_km,
      "Subsidio Moto (C$)": d.moto_km * 6,
      "Total KM Recorridos": d.total_km,
      "Monto Total Subsidio (C$)": d.total_subsidy,
    }));

    driversData.push({
      "ID Conductor": 0,
      "Nombre Completo": "TOTAL GENERAL CONSOLIDADO",
      "No. Licencia": "-",
      "KM en Auto (10 C$/km)": summary.auto_km_total || 0,
      "Subsidio Auto (C$)": (summary.auto_km_total || 0) * 10,
      "KM en Moto (6 C$/km)": summary.moto_km_total || 0,
      "Subsidio Moto (C$)": (summary.moto_km_total || 0) * 6,
      "Total KM Recorridos": summary.total_km_today || 0,
      "Monto Total Subsidio (C$)": summary.total_subsidy_payout || 0,
    });

    const wsDrivers = XLSX.utils.json_to_sheet(driversData);
    XLSX.utils.book_append_sheet(wb, wsDrivers, "Desglose Conductores");

    // 2. Sheet 2: Category Summary
    const categoryData = [
      {
        "Categoría de Vehículo": "Automóviles / Camionetas",
        "Tarifa por KM (C$)": 10.00,
        "Kilómetros Recorridos": summary.auto_km_total || 0,
        "Pago Subsidio (C$)": (summary.auto_km_total || 0) * 10
      },
      {
        "Categoría de Vehículo": "Motocicletas",
        "Tarifa por KM (C$)": 6.00,
        "Kilómetros Recorridos": summary.moto_km_total || 0,
        "Pago Subsidio (C$)": (summary.moto_km_total || 0) * 6
      },
      {
        "Categoría de Vehículo": "TOTAL CONSOLIDADO",
        "Tarifa por KM (C$)": 0,
        "Kilómetros Recorridos": summary.total_km_today || 0,
        "Pago Subsidio (C$)": summary.total_subsidy_payout || 0
      }
    ];

    const wsCategory = XLSX.utils.json_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(wb, wsCategory, "Resumen por Categoria");

    // 3. Sheet 3: Cutoff Calendar 2026
    if (cutoffs.length > 0) {
      const calendarData = cutoffs.map((c) => ({
        "ID Corte": c.id,
        "Nombre de Período": c.period_name,
        "Fecha Inicio": new Date(c.start_date).toLocaleDateString('es-NI'),
        "Fecha de Corte": new Date(c.cutoff_date).toLocaleDateString('es-NI'),
        "Fecha Probable de Pago": new Date(c.payment_date).toLocaleDateString('es-NI'),
        "Estado": c.status === 'paid' ? 'Pagado' : (c.status === 'in_audit' ? 'En Auditoría' : 'Pendiente')
      }));

      const wsCalendar = XLSX.utils.json_to_sheet(calendarData);
      XLSX.utils.book_append_sheet(wb, wsCalendar, "Calendario Cortes 2026");
    }

    const safeFileName = `Reporte_Subsidio_${cutoffName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, safeFileName);
  };

  if (!mounted) return null;

  const autoKM = summary.auto_km_total || 0;
  const autoPayout = autoKM * 10;
  const motoKM = summary.moto_km_total || 0;
  const motoPayout = motoKM * 6;
  const totalPayout = summary.total_subsidy_payout || (autoPayout + motoPayout);
  const hasData = filteredDrivers.some((d) => d.total_km > 0);

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Reportería de Subsidio y Cortes de Nómina
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Agrupación por cortes quincenales según Calendario Oficial 2026 y exportación en Excel (.xlsx)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCalendarModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
              >
                <CalendarIcon className="w-4 h-4 text-sky-400" /> Calendario de Cortes 2026
              </button>

              <button
                onClick={exportReportExcel}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-600/20 transition-all border border-emerald-500/40"
              >
                <ExcelIcon className="w-4 h-4" /> Exportar Libro de Excel (.xlsx)
              </button>
            </div>
          </div>

          {/* Cutoff Filter Bar */}
          <div className="glass-panel p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-sky-500/30">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl">
                <Filter className="w-5 h-5" />
              </div>
              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider">
                  Seleccionar Período de Corte (Quincena)
                </label>
                <p className="text-xs text-slate-400">Filtrar liquidaciones de subsidio por calendario de nómina</p>
              </div>
            </div>

            <select
              value={selectedCutoffId}
              onChange={(e) => handleCutoffChange(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs font-semibold text-white focus:outline-none focus:border-sky-500 cursor-pointer max-w-sm w-full"
            >
              <option value="all">🗓️ Ver Todos los Períodos Acumulados</option>
              {cutoffs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.period_name} ({new Date(c.start_date).toLocaleDateString('es-NI')} al {new Date(c.cutoff_date).toLocaleDateString('es-NI')})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Cutoff Info Card */}
          {selectedCutoffObj && (
            <div className="p-4 glass-panel border border-sky-500/30 rounded-xl bg-slate-900/90 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    {selectedCutoffObj.period_name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Período: {new Date(selectedCutoffObj.start_date).toLocaleDateString('es-NI')} al {new Date(selectedCutoffObj.cutoff_date).toLocaleDateString('es-NI')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">Fecha Probable Pago</span>
                  <span className="text-xs font-bold text-emerald-400">
                    {new Date(selectedCutoffObj.payment_date).toLocaleDateString('es-NI')}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">Estado Nómina</span>
                  {selectedCutoffObj.status === 'paid' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Pagado
                    </span>
                  )}
                  {selectedCutoffObj.status === 'in_audit' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
                      <Clock className="w-3.5 h-3.5" /> En Auditoría
                    </span>
                  )}
                  {selectedCutoffObj.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                      <AlertCircle className="w-3.5 h-3.5" /> Pendiente
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Consolidated Payout Banner */}
          <div className="glass-panel p-6 border border-emerald-500/30 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <DollarSign className="w-3.5 h-3.5" /> Liquidación Total Subsidio ({selectedCutoffObj ? selectedCutoffObj.period_name : 'Acumulado'})
                </span>
                <div className="text-3xl font-black text-white tracking-tight">
                  C$ {totalPayout.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-slate-400">
                  Pago total auditado para {driversList.length} conductores registrados
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                <div className="p-4 bg-slate-900/90 border border-sky-500/30 rounded-xl">
                  <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold">
                    <Car className="w-4 h-4" /> Autos (10 C$/km)
                  </div>
                  <div className="text-xl font-bold text-white mt-1">{autoKM} km</div>
                  <div className="text-xs font-mono text-emerald-400 font-semibold mt-0.5">C$ {autoPayout.toFixed(2)}</div>
                </div>

                <div className="p-4 bg-slate-900/90 border border-amber-500/30 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                    <Bike className="w-4 h-4" /> Motos (6 C$/km)
                  </div>
                  <div className="text-xl font-bold text-white mt-1">{motoKM} km</div>
                  <div className="text-xs font-mono text-emerald-400 font-semibold mt-0.5">C$ {motoPayout.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Breakdown Table */}
          <div className="glass-panel overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-sky-400" /> Desglose Técnico por Conductores (Nombres & Liquidación)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Kilometraje y pago de subsidio por conductor para el período de corte seleccionado
                </p>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar conductor..."
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5">Conductor</th>
                    <th className="px-6 py-3.5">Licencia</th>
                    <th className="px-6 py-3.5">KM Auto (10 C$/km)</th>
                    <th className="px-6 py-3.5">KM Moto (6 C$/km)</th>
                    <th className="px-6 py-3.5">Total KM</th>
                    <th className="px-6 py-3.5 text-right">Pago Subsidio (C$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                  {filteredDrivers.length > 0 ? (
                    filteredDrivers.map((d) => (
                      <tr key={d.driver_id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-sans font-semibold text-white flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-xs">
                            {d.driver_name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white font-bold">{d.driver_name}</div>
                            <div className="text-[11px] text-slate-500">ID Conductor: #{d.driver_id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-300 font-semibold">{d.license_number || 'N/A'}</td>
                        <td className="px-6 py-4 text-sky-400 font-bold">
                          {d.auto_km} km <span className="text-[10px] text-slate-500">({d.auto_km * 10} C$)</span>
                        </td>
                        <td className="px-6 py-4 text-amber-400 font-bold">
                          {d.moto_km} km <span className="text-[10px] text-slate-500">({d.moto_km * 6} C$)</span>
                        </td>
                        <td className="px-6 py-4 text-white font-bold text-sm">
                          {d.total_km} km
                        </td>
                        <td className="px-6 py-4 text-right text-emerald-400 font-black text-sm">
                          C$ {d.total_subsidy.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-slate-500">
                            <Inbox className="w-8 h-8" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-slate-300 font-bold text-sm">Sin Recorridos Registrados en este Período</h4>
                            <p className="text-slate-500 text-xs">
                              {selectedCutoffObj 
                                ? `No existen liquidaciones de subsidio para el corte "${selectedCutoffObj.period_name}".`
                                : 'No se encontraron recorridos ni acumulados en el sistema.'}
                            </p>
                          </div>
                          <div className="pt-1">
                            <button
                              onClick={() => handleCutoffChange('all')}
                              className="px-3.5 py-1.5 bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded-lg text-xs font-semibold hover:bg-sky-500/20 transition-colors"
                            >
                              🗓️ Ver Todos los Períodos Acumulados
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-900 border-t border-slate-700 font-mono">
                  <tr>
                    <td colSpan={2} className="px-6 py-4 font-sans font-black text-white text-sm">TOTAL PERÍODO SELECCIONADO</td>
                    <td className="px-6 py-4 text-sky-400 font-black">{autoKM} km</td>
                    <td className="px-6 py-4 text-amber-400 font-black">{motoKM} km</td>
                    <td className="px-6 py-4 text-white font-black text-sm">{(autoKM + motoKM)} km</td>
                    <td className="px-6 py-4 text-right text-emerald-400 font-black text-base">
                      C$ {totalPayout.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Modal: Full 2026 Cutoff Calendar View */}
          {isCalendarModalOpen && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="glass-panel w-full max-w-4xl p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl">
                      <CalendarIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">Calendario de Cortes de Nómina de Subsidio 2026</h3>
                      <p className="text-xs text-slate-400">Programación oficial de 24 cortes quincenales y fechas probables de pago</p>
                    </div>
                  </div>
                  <button onClick={() => setIsCalendarModalOpen(false)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cutoffs.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        handleCutoffChange(c.id.toString());
                        setIsCalendarModalOpen(false);
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        selectedCutoffId === c.id
                          ? 'bg-sky-950/60 border-sky-500 ring-1 ring-sky-500'
                          : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{c.period_name}</span>
                        {c.status === 'paid' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Pagado
                          </span>
                        )}
                        {c.status === 'in_audit' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            En Auditoría
                          </span>
                        )}
                        {c.status === 'pending' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            Pendiente
                          </span>
                        )}
                      </div>

                      <div className="mt-3 space-y-1 text-xs text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Fecha de Corte:</span>
                          <span className="font-mono font-bold text-sky-400">{new Date(c.cutoff_date).toLocaleDateString('es-NI')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Rango del Período:</span>
                          <span className="font-mono text-slate-300">{new Date(c.start_date).toLocaleDateString('es-NI')} al {new Date(c.cutoff_date).toLocaleDateString('es-NI')}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-800/60">
                          <span className="text-slate-400 font-semibold">Fecha Probable de Pago:</span>
                          <span className="font-mono font-bold text-emerald-400">{new Date(c.payment_date).toLocaleDateString('es-NI')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex justify-end border-t border-slate-800">
                  <button
                    onClick={() => setIsCalendarModalOpen(false)}
                    className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg transition-colors"
                  >
                    Cerrar Calendario
                  </button>
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
