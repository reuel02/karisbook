// ─── Karisbook Domain Types ────────────────────────────────────────────────
// These types mirror the karisbook schema in Supabase.
// They are compatible with the existing UI components.

export type AppointmentStatus = 'pending' | 'confirmed' | 'done' | 'cancelled'

export interface Service {
  id: string
  tenant_id: string
  name: string
  description: string
  duration: number   // minutes
  price: number      // BRL
  category: string
  is_active: boolean
  created_at?: string
}

export interface Professional {
  id: string
  tenant_id: string
  name: string
  role: string
  initials: string
  avatar_color: string  // hex color for avatar background
  is_active: boolean
  created_at?: string
  // Joined from professional_services:
  services: string[]    // array of service IDs
  // UI compat alias:
  color: string         // same as avatar_color
}

export interface Appointment {
  id: string
  tenant_id: string
  service_id: string
  professional_id: string
  client_name: string
  client_whatsapp: string
  date: string       // ISO date YYYY-MM-DD
  time_slot: string  // HH:MM
  status: AppointmentStatus
  notes?: string
  created_at?: string
}

export interface BusinessHour {
  id?: string
  tenant_id: string
  day_of_week: number  // 0=Sun … 6=Sat
  open_time: string    // HH:MM
  close_time: string   // HH:MM
  is_open: boolean
}

export interface TenantSettings {
  id?: string
  tenant_id: string
  notify_new_booking_whatsapp: boolean
  notify_reminder_24h: boolean
  notify_auto_cancel_confirm: boolean
  brand_color?: string
  bg_color?: string
  theme_mode?: string
}

export interface Tenant {
  id: string
  name: string
  address?: string
  whatsapp?: string
  slug: string
  is_active: boolean
}
