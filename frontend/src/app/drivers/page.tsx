'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DriversPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/vehicles');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-slate-400 text-sm animate-pulse">Redirigiendo a Flota & Conductores...</div>
    </div>
  );
}
