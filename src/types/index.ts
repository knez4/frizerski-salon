export interface Service {
  id: string
  name: string
  duration_min: number
  price: number
  is_active: boolean
}

export interface Appointment {
  id: string
  client_name: string
  client_phone: string
  service_id: string
  appointment_date: string
  appointment_time: string
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
  services?: Service
}

export interface WorkingHours {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_off: boolean
}