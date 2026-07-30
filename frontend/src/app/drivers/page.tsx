'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Plus } from 'lucide-react';
import { apiFetch, Driver } from '@/lib/api';
import AuthGuard from '@/components/auth/AuthGuard';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([
    { id: 1, user_id: 3, license_number: 'LIC-884920', phone: '+506 8888-1111', status: 'active', user: { id: 3, email: 'conductor1@trackfleet360.com', full_name: 'Juan Pérez', role: 'driver', active: true } },
    { id: 2, user_id: 4, license_number: 'LIC-993021', phone: '+506 8888-2222', status: 'active', user: { id: 4, email: 'conductor2@trackfleet360.com', full_name: 'Roberto Gómez', role: 'driver', active: true } },
  ]);

  useEffect(() => {
    apiFetch<Driver[]>('/drivers')
      .then((data) => setDrivers(data))
      .catch(() => {});
  }, []);

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Gestión de Conductores</h1>
              <p className="text-slate-400 text-sm mt-1">Administración de usuarios conductores autorizados y licencias de conducir</p>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-sky-600/20 transition-all">
              <Plus className="w-4 h-4" /> Nuevo Conductor
            </button>
          </div>

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
                  {drivers.map((d) => (
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
                          {d.fuel_type || 'gasolina'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs text-sky-300">{d.license_number}</div>
                        <div className="text-xs text-slate-400">{d.phone || 'Sin teléfono'}</div>
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
        </main>
      </div>
    </div>
    </AuthGuard>
  );
}
