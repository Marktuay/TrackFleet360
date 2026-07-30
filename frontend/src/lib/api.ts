export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085/api/v1';
export const API_BASE_URL = API_URL;

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'supervisor' | 'driver';
  active: boolean;
}

export interface Vehicle {
  id: number;
  plate_number: string;
  brand: string;
  model: string;
  year: number;
  vehicle_type?: 'auto' | 'moto';
  subsidy_rate?: number;
  initial_km: number;
  current_km: number;
  status: 'active' | 'maintenance' | 'inactive';
}

export interface Driver {
  id: number;
  user_id: number;
  user?: User;
  license_number: string;
  phone: string;
  company?: string;
  position?: string;
  vehicle_type?: string;
  vehicle_subtype?: string;
  fuel_type?: string;
  plate_number?: string;
  status: string;
}

export interface CutoffPeriod {
  id: number;
  period_name: string;
  start_date: string;
  cutoff_date: string;
  payment_date: string;
  status: 'paid' | 'in_audit' | 'pending';
}

export interface GPSPoint {
  id: number;
  journey_id: number;
  latitude: number;
  longitude: number;
  speed: number;
  recorded_at: string;
}

export interface Photo {
  id: number;
  journey_id: number;
  photo_type: string;
  url: string;
  captured_at: string;
}

export interface Journey {
  id: number;
  driver_id: number;
  driver?: Driver;
  vehicle_id: number;
  vehicle?: Vehicle;
  cutoff_id?: number;
  cutoff?: CutoffPeriod;
  start_time: string;
  end_time?: string;
  start_lat: number;
  start_lng: number;
  start_address: string;
  end_lat?: number;
  end_lng?: number;
  end_address?: string;
  start_km: number;
  end_km?: number;
  declared_dist_km: number;
  gps_dist_km: number;
  diff_km: number;
  subsidy_rate?: number;
  subsidy_amount?: number;
  status: 'in_progress' | 'completed' | 'flagged' | 'approved' | 'rejected';
  supervisor_notes?: string;
  points?: GPSPoint[];
  photos?: Photo[];
}

export interface DriverSubsidySummary {
  driver_id: number;
  driver_name: string;
  license_number: string;
  auto_km: number;
  moto_km: number;
  total_km: number;
  total_subsidy: number;
}

export interface ReportSummary {
  cutoff_id?: number;
  cutoff_period?: CutoffPeriod;
  total_vehicles: number;
  active_vehicles: number;
  total_drivers: number;
  active_drivers: number;
  journeys_today: number;
  flagged_journeys: number;
  total_km_today: number;
  auto_km_total?: number;
  moto_km_total?: number;
  total_subsidy_payout?: number;
  drivers_breakdown?: DriverSubsidySummary[];
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setStoredToken(token: string) {
  localStorage.setItem('token', token);
}

export function removeStoredToken() {
  localStorage.removeItem('token');
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error de red o servidor' }));
    throw new Error(errorData.error || `HTTP Error ${response.status}`);
  }

  return response.json();
}
