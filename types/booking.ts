// types/booking.ts
export interface BookingFormData {
  partySize: number;
  date: string;
  time: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
}

export interface Booking {
  id: string;
  restaurant_id: string;
  table_id: string | null;
  booking_date: string;
  booking_time: string;
  party_size: number;
  duration: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes: string | null;
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  created_via: 'website' | 'admin';
  confirmation_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface Table {
  id: string;
  restaurant_id: string;
  table_number: string;
  capacity: number;
  min_capacity: number;
  x_position: number | null;
  y_position: number | null;
  shape: 'rectangle' | 'circle' | 'square';
  is_active: boolean;
}

export interface OpeningHours {
  id: string;
  restaurant_id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface SpecialHours {
  id: string;
  restaurant_id: string;
  date: string;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
  reason: string | null;
}

export interface BookingSettings {
  id: string;
  restaurant_id: string;
  slot_duration: number;
  booking_window_days: number;
  min_advance_hours: number;
  max_party_size: number;
  default_booking_duration: number;
}

export interface AvailabilitySlot {
  time: number;
  availableTables: number;
  isAvailable: boolean;
}