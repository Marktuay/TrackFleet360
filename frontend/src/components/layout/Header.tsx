'use client';

import { Bell, ShieldCheck, User as UserIcon } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 bg-slate-900/60 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Sistema En Línea (Go API v1)
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full"></span>
        </button>

        <div className="h-5 w-px bg-slate-800"></div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-sky-600/30 border border-sky-500/40 flex items-center justify-center text-sky-400 font-semibold text-sm">
            MS
          </div>
          <div>
            <div className="text-sm font-semibold text-white leading-tight">Maria Supervisor</div>
            <div className="text-xs text-sky-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Supervisor
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
