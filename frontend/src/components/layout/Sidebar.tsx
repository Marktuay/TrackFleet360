'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  MapPin, 
  Truck, 
  Users, 
  UserCog,
  FileSpreadsheet, 
  LogOut,
  Navigation
} from 'lucide-react';
import { removeStoredToken } from '@/lib/api';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Recorridos', href: '/journeys', icon: MapPin },
  { name: 'Flota & Conductores', href: '/vehicles', icon: Truck },
  { name: 'Usuarios & Roles', href: '/users', icon: UserCog },
  { name: 'Reportería', href: '/reports', icon: FileSpreadsheet },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    removeStoredToken();
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-tr from-sky-500 to-blue-600 rounded-xl shadow-lg shadow-sky-500/20 text-white">
          <Navigation className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-tight">TrackFleet<span className="text-sky-400">360</span></h1>
          <p className="text-xs text-slate-400 font-medium">Control de Recorridos</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Menú Principal</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href) || (item.href === '/dashboard' && pathname === '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
