
export interface Client {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: number;
}

export interface Service {
  id?: string;
  name: string;
  price: number;
  durationMinutes: number;
  color?: string;
}

export interface Appointment {
  id?: string;
  clientId: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  date: string; // ISO String
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: 'scheduled' | 'completed' | 'cancelled';
  totalPrice: number;
}

export interface BusinessHours {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface FinancialRecord {
  month: string;
  revenue: number;
  appointments: number;
}
