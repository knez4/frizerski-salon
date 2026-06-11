import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  appointments: {
    id: string
    client_name: string
    client_phone: string
    service_id: string
    appointment_date: string
    appointment_time: string
    status: 'pending' | 'confirmed' | 'cancelled'
    created_at: string
  }
  services: {
    id: string
    name: string
    duration_min: number
    price: number
    is_active: boolean
  }
  working_hours: {
    id: string
    day_of_week: number
    start_time: string
    end_time: string
    is_off: boolean
  }
}