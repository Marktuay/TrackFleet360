'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getStoredToken, getRoleFromToken, getStoredUser, removeStoredToken } from '@/lib/api';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Exclude login page from auth check
    if (pathname === '/login') {
      setAuthorized(true);
      return;
    }

    const token = getStoredToken();
    if (!token) {
      setAuthorized(false);
      router.replace('/login');
      return;
    }

    const user = getStoredUser();
    const roleFromToken = getRoleFromToken(token);
    const userRole = user?.role || roleFromToken;

    // Security Rule: Driver accounts are strictly blocked from web administration panel
    if (userRole === 'driver') {
      removeStoredToken();
      setAuthorized(false);
      router.replace('/login?error=driver_unauthorized');
      return;
    }

    setAuthorized(true);
  }, [pathname, router]);

  if (!authorized && pathname !== '/login') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse">Verificando sesión y seguridad...</div>
      </div>
    );
  }

  return <>{children}</>;
}
