'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { 
  Truck, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  X,
  Car,
  Bike,
  Users,
  ShieldCheck,
  Fuel
} from 'lucide-react';
import { apiFetch, Vehicle, Driver } from '@/lib/api';
import AuthGuard from '@/components/auth/AuthGuard';

export default function VehiclesPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'drivers' | 'fleet'>('drivers');

  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: 1, plate_number: 'TF-101-AB', brand: 'Toyota', model: 'Hilux 4x4', year: 2022, vehicle_type: 'auto', subsidy_rate: 10, initial_km: 15000, current_km: 18450, status: 'active' },
    { id: 2, plate_number: 'MOTO-808-NI', brand: 'Yamaha', model: 'FZ-25 250cc', year: 2023, vehicle_type: 'moto', subsidy_rate: 6, initial_km: 2000, current_km: 8500, status: 'active' },
    { id: 3, plate_number: 'TF-303-EF', brand: 'Isuzu', model: 'D-Max', year: 2021, vehicle_type: 'auto', subsidy_rate: 10, initial_km: 45000, current_km: 62100, status: 'maintenance' },
  ]);

  const [drivers, setDrivers] = useState<Driver[]>([
    { id: 1, user_id: 3, license_number: 'LIC-884920', phone: '+506 8888-1111', company: 'Newcentury NI', position: 'Conductor Operativo', vehicle_type: 'auto', vehicle_subtype: 'sedan', fuel_type: 'gasolina', plate_number: 'M-58392', status: 'active', user: { id: 3, email: 'conductor1@trackfleet360.com', full_name: 'Juan Pérez', role: 'driver', active: true } },
    { id: 2, user_id: 4, license_number: 'LIC-993021', phone: '+506 8888-2222', company: 'TrackFleet360', position: 'Conductor Reparto', vehicle_type: 'moto', vehicle_subtype: 'moto', fuel_type: 'gasolina', plate_number: 'M-99102', status: 'active', user: { id: 4, email: 'conductor2@trackfleet360.com', full_name: 'Roberto Gómez', role: 'driver', active: true } },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    plate_number: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    vehicle_type: 'auto',
    initial_km: 0,
    current_km: 0,
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchVehicles();
    fetchDrivers();
  }, []);

  const fetchVehicles = () => {
    apiFetch<Vehicle[]>('/vehicles')
      .then((data) => setVehicles(data))
      .catch(() => {});
  };

  const fetchDrivers = () => {
    apiFetch<Driver[]>('/drivers')
      .then((data) => setDrivers(data))
      .catch(() => {});
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const subsidyRate = formData.vehicle_type === 'moto' ? 6 : 10;
      const res = await apiFetch<Vehicle>('/vehicles', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          subsidy_rate: subsidyRate,
          status: 'active',
        }),
      });

      setVehicles((prev) => [...prev, res]);
      setIsModalOpen(false);
      setFormData({
        plate_number: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        vehicle_type: 'auto',
        initial_km: 0,
        current_km: 0,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar el vehículo');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  const filteredDrivers = drivers.filter(
    (d) =>
      d.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.plate_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.position?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.plate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-8 overflow-y-auto space-y-6">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  Gestión Unificada de Flota & Conductores
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Administración de conductores autorizados, vehículos asignados, placas y tarifas de subsidio
                </p>
              </div>

              {activeTab === 'fleet' && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-sky-600/20 transition-all"
                >
                  <Plus className="w-4 h-4" /> Registrar Nuevo Vehículo
                </button>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 gap-2">
              <button
                onClick={() => setActiveTab('drivers')}
                className={`flex items-center gap-2 px-5 py-3 font-medium text-sm transition-all border-b-2 ${
                  activeTab === 'drivers'
                    ? 'border-sky-500 text-sky-400 font-semibold bg-sky-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                Conductores & Vehículos Asignados ({drivers.length})
              </button>

              <button
                onClick={() => setActiveTab('fleet')}
                className={`flex items-center gap-2 px-5 py-3 font-medium text-sm transition-all border-b-2 ${
                  activeTab === 'fleet'
                    ? 'border-sky-500 text-sky-400 font-semibold bg-sky-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Truck className="w-4 h-4" />
                Catálogo de Flota Vehicular ({vehicles.length})
              </button>
            </div>

            {/* Search bar */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'drivers'
                    ? 'Buscar por nombre, placa, empresa o cargo...'
                    : 'Buscar por placa, marca o modelo...'
                }
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* TAB 1: DRIVERS & ASSIGNED VEHICLES */}
            {activeTab === 'drivers' && (
              <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-3.5">Conductor</th>
                        <th className="px-6 py-3.5">Empresa / Cargo</th>
                        <th className="px-6 py-3.5">Vehículo & Categoría</th>
                        <th className="px-6 py-3.5">Combustible</th>
                        <th className="px-6 py-3.5">Licencia & Teléfono</th>
                        <th className="px-6 py-3.5">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredDrivers.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4 font-medium text-white">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-semibold text-xs">
                                {d.user?.full_name?.slice(0, 2).toUpperCase() || 'CD'}
                              </div>
                              <div>
                                <div className="text-white font-semibold">{d.user?.full_name || 'Conductor'}</div>
                                <div className="text-xs text-slate-500">{d.user?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-white font-medium text-xs">{d.company || 'Newcentury NI'}</div>
                            <div className="text-xs text-slate-400">{d.position || 'Conductor Operativo'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                                d.vehicle_type === 'moto'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                  : 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                              }`}>
                                {d.vehicle_type === 'moto' ? 'Motocicleta' : 'Vehículo'} ({d.vehicle_subtype || 'sedan'})
                              </span>
                              {d.plate_number && (
                                <span className="text-xs font-mono font-bold text-sky-300">
                                  Placa: {d.plate_number}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 capitalize border border-slate-700">
                              <Fuel className="w-3 h-3 text-amber-400" />
                              {d.fuel_type || 'gasolina'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs font-mono text-slate-300">{d.license_number}</div>
                            <div className="text-xs text-slate-400">{d.phone || 'No especificado'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              Activo
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: FLEET CATALOG & SUBSIDY RATES */}
            {activeTab === 'fleet' && (
              <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-3.5">Placa & Vehículo</th>
                        <th className="px-6 py-3.5">Tipo y Tarifa Subsidio</th>
                        <th className="px-6 py-3.5">Odómetro Actual</th>
                        <th className="px-6 py-3.5">KM Recorridos</th>
                        <th className="px-6 py-3.5">Subsidio Generado (C$)</th>
                        <th className="px-6 py-3.5">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredVehicles.map((v) => {
                        const isMoto = v.vehicle_type === 'moto';
                        const rate = isMoto ? 6 : 10;
                        const kmTraveled = v.current_km - v.initial_km;
                        const totalSubsidy = kmTraveled * rate;

                        return (
                          <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="px-6 py-4 font-medium text-white">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isMoto ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'}`}>
                                  {isMoto ? <Bike className="w-5 h-5" /> : <Car className="w-5 h-5" />}
                                </div>
                                <div>
                                  <div className="font-bold text-sky-400 tracking-wide font-mono text-sm">{v.plate_number}</div>
                                  <div className="text-xs text-slate-400">{v.brand} {v.model} ({v.year})</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                                isMoto 
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                                  : 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                              }`}>
                                {isMoto ? 'Moto (6 C$/KM)' : 'Auto (10 C$/KM)'}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-mono font-semibold text-white">
                              {v.current_km.toLocaleString('es-NI')} KM
                            </td>
                            <td className="px-6 py-4 font-mono text-slate-300">
                              +{kmTraveled.toLocaleString('es-NI')} KM
                            </td>
                            <td className="px-6 py-4 font-bold text-emerald-400 font-mono">
                              C$ {totalSubsidy.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4">
                              {v.status === 'active' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Activo
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                  <Wrench className="w-3.5 h-3.5" /> Mantenimiento
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
            )}

            {/* Modal para Registrar Vehículo */}
            {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Truck className="w-5 h-5 text-sky-400" /> Registrar Nuevo Vehículo
                    </h3>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" /> {errorMsg}
                    </div>
                  )}

                  <form onSubmit={handleCreateVehicle} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                          Número de Placa
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.plate_number}
                          onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                          placeholder="M-123456 / TF-101"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                          Tipo de Vehículo
                        </label>
                        <select
                          value={formData.vehicle_type}
                          onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                        >
                          <option value="auto">Auto / Camioneta (10 C$/km)</option>
                          <option value="moto">Motocicleta (6 C$/km)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                          Marca
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                          placeholder="Toyota / Yamaha"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                          Modelo y Año
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            value={formData.model}
                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                            placeholder="Hilux / FZ-25"
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                          />
                          <input
                            type="number"
                            required
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 2024 })}
                            className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                          Odómetro Inicial (KM)
                        </label>
                        <input
                          type="number"
                          required
                          value={formData.initial_km}
                          onChange={(e) => setFormData({ ...formData, initial_km: parseFloat(e.target.value) || 0 })}
                          placeholder="15000"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                          Odómetro Actual (KM)
                        </label>
                        <input
                          type="number"
                          required
                          value={formData.current_km}
                          onChange={(e) => setFormData({ ...formData, current_km: parseFloat(e.target.value) || 0 })}
                          placeholder="18450"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-5 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs rounded-lg transition-all shadow-lg shadow-sky-600/20 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Guardando...' : 'Registrar Vehículo'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
