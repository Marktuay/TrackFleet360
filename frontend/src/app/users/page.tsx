'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { 
  UserPlus, 
  ShieldCheck, 
  Lock, 
  User as UserIcon, 
  CheckCircle2, 
  XCircle, 
  X, 
  Search,
  Check,
  Edit2,
  Trash2,
  KeyRound,
  AlertTriangle
} from 'lucide-react';
import { apiFetch, User } from '@/lib/api';

export default function UsersPage() {
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<User[]>([
    { id: 1, email: 'admin@trackfleet360.com', full_name: 'Carlos Administrator', role: 'admin', active: true },
    { id: 2, email: 'supervisor@trackfleet360.com', full_name: 'Maria Supervisor', role: 'supervisor', active: true },
    { id: 3, email: 'conductor1@trackfleet360.com', full_name: 'Juan Pérez (Conductor)', role: 'driver', active: true },
    { id: 4, email: 'conductor2@trackfleet360.com', full_name: 'Roberto Gómez', role: 'driver', active: true },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Form states
  const [createFormData, setCreateFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'supervisor',
    license_number: '',
    phone: '',
    company: '',
    position: '',
    vehicle_type: 'auto',
    vehicle_subtype: 'sedan',
    fuel_type: 'gasolina',
    plate_number: '',
  });

  const [editFormData, setEditFormData] = useState({
    full_name: '',
    email: '',
    role: 'supervisor',
    new_password: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    apiFetch<User[]>('/users')
      .then((data) => setUsers(data))
      .catch(() => {});
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const res = await apiFetch<{ message: string; user: User }>('/users', {
        method: 'POST',
        body: JSON.stringify(createFormData),
      });

      setSuccessMsg(`Cuenta creada exitosamente para ${res.user.full_name}`);
      setUsers((prev) => [...prev, res.user]);
      setIsCreateModalOpen(false);
      setCreateFormData({
        full_name: '',
        email: '',
        password: '',
        role: 'supervisor',
        license_number: '',
        phone: '',
        company: '',
        position: '',
        vehicle_type: 'auto',
        vehicle_subtype: 'sedan',
        fuel_type: 'gasolina',
        plate_number: '',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al crear la cuenta de usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      new_password: '',
    });
    setErrorMsg('');
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const payload: any = {
        full_name: editFormData.full_name,
        email: editFormData.email,
        role: editFormData.role,
      };

      if (editFormData.new_password.trim() !== '') {
        payload.password = editFormData.new_password;
      }

      const res = await apiFetch<{ message: string; user: User }>(`/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setSuccessMsg(`Usuario ${res.user.full_name} actualizado correctamente`);
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? res.user : u)));
      setEditingUser(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al actualizar el usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      await apiFetch(`/users/${deletingUser.id}`, {
        method: 'DELETE',
      });

      setSuccessMsg(`Cuenta de usuario "${deletingUser.full_name}" eliminada exitosamente`);
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setDeletingUser(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al eliminar usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleUserStatus = async (user: User) => {
    const newStatus = !user.active;
    try {
      await apiFetch(`/users/${user.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ active: newStatus }),
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, active: newStatus } : u))
      );
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado del usuario');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Gestión de Usuarios y Seguridad
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Administración completa de cuentas (Crear, Editar datos y contraseña, Cambiar Rol y Eliminar)
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-sky-600/20 transition-all"
            >
              <UserPlus className="w-4 h-4" /> Crear Cuenta de Usuario
            </button>
          </div>

          {/* Security Status Banner */}
          <div className="p-5 glass-panel border border-sky-500/30 rounded-xl bg-gradient-to-r from-sky-950/40 via-slate-900/80 to-slate-900/80">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sky-500/20 text-sky-400 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Políticas de Seguridad & Cifrado Activas</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Contraseñas cifradas con **bcrypt** | Tokens **JWT** con firma criptográfica | Control de acceso basado en roles **(RBAC)**.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Check className="w-3.5 h-3.5" /> Auditoría Habilitada
                </span>
              </div>
            </div>
          </div>

          {successMsg && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-medium flex items-center justify-between">
              <span>{successMsg}</span>
              <button onClick={() => setSuccessMsg('')} className="p-1 text-emerald-400"><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Users List Table */}
          <div className="glass-panel overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar usuario por nombre o correo..."
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
              <span className="text-xs text-slate-400 font-semibold">{filteredUsers.length} Cuentas Registradas</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5">Usuario</th>
                    <th className="px-6 py-3.5">Correo Electrónico</th>
                    <th className="px-6 py-3.5">Rol de Acceso</th>
                    <th className="px-6 py-3.5">Estado</th>
                    <th className="px-6 py-3.5 text-right">Acciones Disponibles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-semibold text-xs">
                          {u.full_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-semibold">{u.full_name}</div>
                          <div className="text-xs text-slate-500">ID: #{u.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-mono text-xs">{u.email}</td>
                      <td className="px-6 py-4">
                        {u.role === 'admin' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            <Lock className="w-3 h-3" /> Administrador
                          </span>
                        )}
                        {u.role === 'supervisor' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                            <ShieldCheck className="w-3 h-3" /> Supervisor
                          </span>
                        )}
                        {u.role === 'driver' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <UserIcon className="w-3 h-3" /> Conductor
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {u.active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Activa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-700/60 text-slate-400 border border-slate-600">
                            <XCircle className="w-3 h-3" /> Desactivada
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle status */}
                          <button
                            onClick={() => toggleUserStatus(u)}
                            title={u.active ? "Desactivar acceso" : "Activar acceso"}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${
                              u.active
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            }`}
                          >
                            {u.active ? 'Bloquear' : 'Activar'}
                          </button>

                          {/* Edit User */}
                          <button
                            onClick={() => openEditModal(u)}
                            title="Editar datos, rol y contraseña"
                            className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30 hover:bg-sky-500/20 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete User */}
                          <button
                            onClick={() => setDeletingUser(u)}
                            title="Eliminar usuario definitivamente"
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal: Create User */}
          {isCreateModalOpen && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-panel w-full max-w-lg p-6 space-y-5 relative">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">Crear Cuenta de Usuario</h3>
                      <p className="text-xs text-slate-400">Asignación de credenciales y nivel de acceso</p>
                    </div>
                  </div>
                  <button onClick={() => setIsCreateModalOpen(false)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      required
                      value={createFormData.full_name}
                      onChange={(e) => setCreateFormData({ ...createFormData, full_name: e.target.value })}
                      placeholder="Ej. Ana Martínez"
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Correo Electrónico (Usuario)
                    </label>
                    <input
                      type="email"
                      required
                      value={createFormData.email}
                      onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                      placeholder="usuario@trackfleet360.com"
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Contraseña de Acceso (Min. 6 caracteres)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={createFormData.password}
                      onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Rol y Nivel de Acceso (RBAC)
                    </label>
                    <select
                      value={createFormData.role}
                      onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value })}
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                    >
                      <option value="supervisor">Supervisor (Administración de Flota y Validación)</option>
                      <option value="driver">Conductor (Captura de GPS y Registro de Odómetro)</option>
                      <option value="admin">Administrador del Sistema (Acceso Total)</option>
                    </select>
                  </div>

                  {createFormData.role === 'driver' && (
                    <div className="space-y-3 pt-2 border-t border-slate-800/80">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                            Licencia de Conducir
                          </label>
                          <input
                            type="text"
                            required
                            value={createFormData.license_number}
                            onChange={(e) => setCreateFormData({ ...createFormData, license_number: e.target.value })}
                            placeholder="LIC-123456"
                            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                            Teléfono de Contacto
                          </label>
                          <input
                            type="text"
                            value={createFormData.phone}
                            onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                            placeholder="+506 8888-0000"
                            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                            Empresa a la que Pertenece
                          </label>
                          <input
                            type="text"
                            value={createFormData.company}
                            onChange={(e) => setCreateFormData({ ...createFormData, company: e.target.value })}
                            placeholder="Ej. Newcentury NI / TrackFleet"
                            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                            Cargo / Puesto
                          </label>
                          <input
                            type="text"
                            value={createFormData.position}
                            onChange={(e) => setCreateFormData({ ...createFormData, position: e.target.value })}
                            placeholder="Ej. Conductor Operativo"
                            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                            Placa Asignada
                          </label>
                          <input
                            type="text"
                            value={createFormData.plate_number}
                            onChange={(e) => setCreateFormData({ ...createFormData, plate_number: e.target.value })}
                            placeholder="Ej. M-58392"
                            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                            Tipo de Vehículo
                          </label>
                          <select
                            value={createFormData.vehicle_type}
                            onChange={(e) => {
                              const vType = e.target.value;
                              const subType = vType === 'moto' ? 'moto' : 'sedan';
                              setCreateFormData({ ...createFormData, vehicle_type: vType, vehicle_subtype: subType });
                            }}
                            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                          >
                            <option value="auto">Vehículo (Auto)</option>
                            <option value="moto">Motocicleta</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                            Categoría / Subtipo
                          </label>
                          <select
                            value={createFormData.vehicle_subtype}
                            onChange={(e) => setCreateFormData({ ...createFormData, vehicle_subtype: e.target.value })}
                            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                          >
                            {createFormData.vehicle_type === 'moto' ? (
                              <option value="moto">Motocicleta</option>
                            ) : (
                              <>
                                <option value="sedan">Sedán</option>
                                <option value="suv">SUV</option>
                                <option value="camioneta">Camioneta (Pick-up)</option>
                              </>
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                            Combustible
                          </label>
                          <select
                            value={createFormData.fuel_type}
                            onChange={(e) => setCreateFormData({ ...createFormData, fuel_type: e.target.value })}
                            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                          >
                            <option value="gasolina">Gasolina</option>
                            <option value="diesel">Diésel</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs rounded-lg transition-all shadow-lg shadow-sky-600/20 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Creando Cuenta...' : 'Guardar y Crear Cuenta'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Edit User & Password */}
          {editingUser && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-panel w-full max-w-lg p-6 space-y-5 relative">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl">
                      <Edit2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">Editar Cuenta de Usuario</h3>
                      <p className="text-xs text-slate-400">Modificación de datos, rol y nueva contraseña</p>
                    </div>
                  </div>
                  <button onClick={() => setEditingUser(null)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleUpdateUser} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.full_name}
                      onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      required
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Rol y Nivel de Acceso (RBAC)
                    </label>
                    <select
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                    >
                      <option value="admin">Administrador (Acceso Total)</option>
                      <option value="supervisor">Supervisor (Administración de Flota y Validación)</option>
                      <option value="driver">Conductor (Captura de GPS y Registro de Odómetro)</option>
                    </select>
                  </div>

                  <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg space-y-2">
                    <label className="block text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5" /> Cambiar Contraseña (Opcional)
                    </label>
                    <input
                      type="password"
                      minLength={6}
                      placeholder="Dejar en blanco para mantener contraseña actual"
                      value={editFormData.new_password}
                      onChange={(e) => setEditFormData({ ...editFormData, new_password: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs rounded-lg transition-all shadow-lg shadow-sky-600/20 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Guardando Cambios...' : 'Actualizar Usuario'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Delete User Confirmation */}
          {deletingUser && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-panel w-full max-w-md p-6 space-y-4 relative">
                <div className="flex items-center gap-3 text-rose-400">
                  <div className="p-2.5 bg-rose-500/20 rounded-xl">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Eliminar Cuenta de Usuario</h3>
                    <p className="text-xs text-slate-400">Esta acción no se puede deshacer</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  ¿Está seguro de que desea eliminar permanentemente la cuenta de{' '}
                  <strong className="text-white font-semibold">{deletingUser.full_name}</strong> (
                  <span className="font-mono text-slate-400">{deletingUser.email}</span>)?
                </p>

                {errorMsg && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
                    {errorMsg}
                  </div>
                )}

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setDeletingUser(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteUser}
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Eliminando...' : 'Sí, Eliminar Cuenta'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
