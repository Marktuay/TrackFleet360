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
  DollarSign
} from 'lucide-react';
import { apiFetch, Vehicle } from '@/lib/api';
import AuthGuard from '@/components/auth/AuthGuard';

export default function VehiclesPage() {
  const [mounted, setMounted] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: 1, plate_number: 'TF-101-AB', brand: 'Toyota', model: 'Hilux 4x4', year: 2022, vehicle_type: 'auto', subsidy_rate: 10, initial_km: 15000, current_km: 18450, status: 'active' },
    { id: 2, plate_number: 'MOTO-808-NI', brand: 'Yamaha', model: 'FZ-25 250cc', year: 2023, vehicle_type: 'moto', subsidy_rate: 6, initial_km: 2000, current_km: 8500, status: 'active' },
    { id: 3, plate_number: 'TF-303-EF', brand: 'Isuzu', model: 'D-Max', year: 2021, vehicle_type: 'auto', subsidy_rate: 10, initial_km: 45000, current_km: 62100, status: 'maintenance' },
  ]);

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
  }, []);

  const fetchVehicles = () => {
    apiFetch<Vehicle[]>('/vehicles')
      .then((data) => setVehicles(data))
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

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Gestión de Flota Vehicular y Tarifas
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Catálogo de autos (10 C$/km) y motos (6 C$/km) con seguimiento de odómetro
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-sky-600/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Registrar Nuevo Vehículo
            </button>
          </div>

          {/* Vehicles Table */}
          <div className="glass-panel overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar por placa, marca o modelo..."
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
              <span className="text-xs text-slate-400 font-semibold">{vehicles.length} Vehículos en Registro</span>
            </div>

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
                  {vehicles.map((v) => {
                    const isMoto = v.vehicle_type === 'moto';
                    const rate = isMoto ? 6 : 10;
                    const kmTraveled = v.current_km - v.initial_km;
                    const totalSubsidy = kmTraveled * rate;

                    return (
                      <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-medium text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                              {isMoto ? <Bike className="w-5 h-5 text-amber-400" /> : <Car className="w-5 h-5 text-sky-400" />}
                            </div>
                            <div>
                              <div className="text-white font-bold tracking-wide">{v.plate_number}</div>
                              <div className="text-xs text-slate-400">{v.brand} {v.model} ({v.year})</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {isMoto ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              <Bike className="w-3.5 h-3.5" /> Moto (6.00 C$/km)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                              <Car className="w-3.5 h-3.5" /> Auto (10.00 C$/km)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono text-white text-xs font-bold">
                          {v.current_km.toLocaleString()} km
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-300 text-xs">
                          {kmTraveled.toLocaleString()} km
                        </td>
                        <td className="px-6 py-4 font-mono text-emerald-400 text-sm font-black">
                          C$ {totalSubsidy.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4">
                          {v.status === 'active' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Operativo
                            </span>
                          )}
                          {v.status === 'maintenance' && (
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

          {/* Modal: Create Vehicle */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-panel w-full max-w-lg p-6 space-y-5 relative">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">Registrar Nuevo Vehículo</h3>
                      <p className="text-xs text-slate-400">Asignación de placa, categoría y tarifa de subsidio</p>
                    </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleCreateVehicle} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Número de Placa
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.plate_number}
                      onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                      placeholder="Ej. TF-505-XYZ o MOTO-123-NI"
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Marca
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="Ej. Toyota / Yamaha"
                        className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Modelo
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        placeholder="Ej. Hilux / FZ-25"
                        className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Tipo de Vehículo & Tarifa de Subsidio
                    </label>
                    <select
                      value={formData.vehicle_type}
                      onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                    >
                      <option value="auto">Automóvil / Camioneta (10.00 C$ por KM)</option>
                      <option value="moto">Motocicleta (6.00 C$ por KM)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Kilometraje Inicial
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={formData.initial_km}
                        onChange={(e) => setFormData({ ...formData, initial_km: parseFloat(e.target.value) || 0, current_km: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Año de Fabricación
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 2024 })}
                        className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
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
