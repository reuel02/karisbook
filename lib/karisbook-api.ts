import { supabase } from './supabase'
import type {
  Service, Professional, Appointment, AppointmentStatus,
  BusinessHour, TenantSettings,
} from './karisbook-types'

// ─── Services ─────────────────────────────────────────────────────────────────

export async function fetchServices(tenantId: string): Promise<Service[]> {
  const { data, error } = await supabase
    .schema('karisbook')
    .from('services')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .order('category')
    .order('name')

  if (error) throw new Error(error.message)
  return (data ?? []) as Service[]
}

export async function upsertService(
  tenantId: string,
  service: Partial<Service> & { name: string; duration: number; price: number }
): Promise<Service> {
  const payload: Record<string, unknown> = {
    tenant_id: tenantId,
    name: service.name,
    description: service.description ?? '',
    duration: service.duration,
    price: service.price,
    category: service.category ?? '',
    is_active: true,
  }
  let data: any
  let error: any

  if (service.id) {
    // É uma atualização. O .eq('tenant_id', tenantId) protege contra edição indevida
    const response = await supabase
      .schema('karisbook')
      .from('services')
      .update(payload)
      .eq('id', service.id)
      .eq('tenant_id', tenantId)
      .select()
      .single()
    data = response.data
    error = response.error
  } else {
    // É uma criação
    const response = await supabase
      .schema('karisbook')
      .from('services')
      .insert(payload)
      .select()
      .single()
    data = response.data
    error = response.error
  }

  if (error) throw new Error(error.message)
  return data as Service
}

export async function deleteService(tenantId: string, id: string): Promise<void> {
  const { error } = await supabase
    .schema('karisbook')
    .from('services')
    .update({ is_active: false })
    .eq('id', id)
    .eq('tenant_id', tenantId)

  if (error) throw new Error(error.message)
}

// ─── Professionals ────────────────────────────────────────────────────────────

export async function fetchProfessionals(tenantId: string): Promise<Professional[]> {
  const { data: pros, error: prosError } = await supabase
    .schema('karisbook')
    .from('professionals')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .order('name')

  if (prosError) throw new Error(prosError.message)

  const { data: links, error: linksError } = await supabase
    .schema('karisbook')
    .from('professional_services')
    .select('professional_id, service_id')
    .eq('tenant_id', tenantId)

  if (linksError) throw new Error(linksError.message)

  return (pros ?? []).map((p) => {
    const serviceIds = (links ?? [])
      .filter((l) => l.professional_id === p.id)
      .map((l) => l.service_id)
    return {
      ...p,
      services: serviceIds,
      color: p.avatar_color,         // UI compat alias
    } as Professional
  })
}

export async function upsertProfessional(
  tenantId: string,
  professional: Partial<Professional> & { name: string },
  serviceIds: string[]
): Promise<Professional> {
  const payload: Record<string, unknown> = {
    tenant_id: tenantId,
    name: professional.name,
    role: professional.role ?? '',
    initials: professional.initials ?? '',
    avatar_color: professional.color ?? professional.avatar_color ?? '#1D3A6E',
    is_active: true,
  }
  let data: any
  let error: any

  if (professional.id) {
    const response = await supabase
      .schema('karisbook')
      .from('professionals')
      .update(payload)
      .eq('id', professional.id)
      .eq('tenant_id', tenantId)
      .select()
      .single()
    data = response.data
    error = response.error
  } else {
    const response = await supabase
      .schema('karisbook')
      .from('professionals')
      .insert(payload)
      .select()
      .single()
    data = response.data
    error = response.error
  }

  if (error) throw new Error(error.message)
  const saved = data as Professional

  // Sync professional_services (delete old, insert new)
  await supabase
    .schema('karisbook')
    .from('professional_services')
    .delete()
    .eq('professional_id', saved.id)
    .eq('tenant_id', tenantId)

  if (serviceIds.length > 0) {
    const rows = serviceIds.map((sid) => ({
      tenant_id: tenantId,
      professional_id: saved.id,
      service_id: sid,
    }))
    const { error: linkError } = await supabase
      .schema('karisbook')
      .from('professional_services')
      .insert(rows)
    if (linkError) throw new Error(linkError.message)
  }

  return { ...saved, services: serviceIds, color: saved.avatar_color }
}

export async function deleteProfessional(tenantId: string, id: string): Promise<void> {
  const { error } = await supabase
    .schema('karisbook')
    .from('professionals')
    .update({ is_active: false })
    .eq('id', id)
    .eq('tenant_id', tenantId)

  if (error) throw new Error(error.message)
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export async function fetchAppointmentsByDate(tenantId: string, date: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .schema('karisbook')
    .from('appointments')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('date', date)
    .order('time_slot')

  if (error) throw new Error(error.message)
  return (data ?? []) as Appointment[]
}

export async function updateAppointmentStatus(
  tenantId: string,
  id: string,
  status: AppointmentStatus
): Promise<void> {
  const { error } = await supabase
    .schema('karisbook')
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .eq('tenant_id', tenantId)

  if (error) throw new Error(error.message)
}

export async function createAppointment(
  tenantId: string,
  data: {
    service_id: string
    professional_id: string | null
    client_name: string
    client_whatsapp: string
    date: string
    time_slot: string
  }
): Promise<Appointment> {
  const { data: created, error } = await supabase
    .schema('karisbook')
    .from('appointments')
    .insert({
      tenant_id: tenantId,
      ...data,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return created as Appointment
}

// ─── Slot Engine ──────────────────────────────────────────────────────────────
// Computes available time slots for a given date + professional + service duration.
// Crosses: BusinessHours, service.duration, existing Appointments.

export async function fetchAvailableSlots(
  tenantId: string,
  date: string,
  professionalId: string | null,
  serviceDuration: number
): Promise<string[]> {
  const dayOfWeek = new Date(date + 'T12:00:00').getDay() // avoid UTC offset issues

  // 1. Check business hours for this day
  const { data: bh, error: bhError } = await supabase
    .schema('karisbook')
    .from('business_hours')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('day_of_week', dayOfWeek)
    .single()

  if (bhError || !bh || !bh.is_open) return []

  // 2. Generate all 30-min slots from open_time to close_time - duration
  const [openH, openM] = bh.open_time.split(':').map(Number)
  const [closeH, closeM] = bh.close_time.split(':').map(Number)
  const openMins = openH * 60 + openM
  const closeMins = closeH * 60 + closeM

  const allSlots: string[] = []
  for (let m = openMins; m + serviceDuration <= closeMins; m += 30) {
    const h = Math.floor(m / 60)
    const min = m % 60
    allSlots.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`)
  }

  // 3. Fetch booked slots for this date / professional
  let query = supabase
    .schema('karisbook')
    .from('appointments')
    .select('time_slot, service_id')
    .eq('tenant_id', tenantId)
    .eq('date', date)
    .in('status', ['pending', 'confirmed'])

  if (professionalId) {
    query = query.eq('professional_id', professionalId)
  }

  const { data: booked, error: bookError } = await query
  if (bookError) throw new Error(bookError.message)

  // Fetch durations for booked services to block out their full time
  const serviceIds = [...new Set((booked ?? []).map((b) => b.service_id))]
  let bookedDurations: Record<string, number> = {}
  if (serviceIds.length > 0) {
    const { data: svcs } = await supabase
      .schema('karisbook')
      .from('services')
      .select('id, duration')
      .in('id', serviceIds)
    ;(svcs ?? []).forEach((s) => { bookedDurations[s.id] = s.duration })
  }

  // Build a set of minutes that are blocked
  const blockedMinutes = new Set<number>()
  for (const b of booked ?? []) {
    const [bH, bM] = b.time_slot.split(':').map(Number)
    const startMin = bH * 60 + bM
    const dur = bookedDurations[b.service_id] ?? 30
    for (let i = 0; i < dur; i++) blockedMinutes.add(startMin + i)
  }

  // 4. Also block past slots if date is today
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const currentMins = now.getHours() * 60 + now.getMinutes()

  return allSlots.filter((slot) => {
    const [h, m] = slot.split(':').map(Number)
    const slotMin = h * 60 + m
    // Block if today and in the past
    if (date === todayStr && slotMin <= currentMins) return false
    // Block if any minute in the slot's duration is occupied
    for (let i = 0; i < serviceDuration; i++) {
      if (blockedMinutes.has(slotMin + i)) return false
    }
    return true
  })
}

// ─── Business Hours ───────────────────────────────────────────────────────────

export async function fetchBusinessHours(tenantId: string): Promise<BusinessHour[]> {
  const { data, error } = await supabase
    .schema('karisbook')
    .from('business_hours')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('day_of_week')

  if (error) throw new Error(error.message)
  return (data ?? []) as BusinessHour[]
}

export async function saveBusinessHours(tenantId: string, hours: BusinessHour[]): Promise<void> {
  const payload = hours.map((h) => ({ ...h, tenant_id: tenantId }))
  const { error } = await supabase
    .schema('karisbook')
    .from('business_hours')
    .upsert(payload, { onConflict: 'tenant_id,day_of_week' })

  if (error) throw new Error(error.message)
}

// ─── Tenant Settings ──────────────────────────────────────────────────────────

export async function fetchTenantSettings(tenantId: string): Promise<TenantSettings | null> {
  const { data, error } = await supabase
    .schema('karisbook')
    .from('tenant_settings')
    .select('*')
    .eq('tenant_id', tenantId)
    .single()

  if (error) return null
  return data as TenantSettings
}

export async function saveTenantSettings(tenantId: string, settings: Partial<TenantSettings>): Promise<void> {
  const { error } = await supabase
    .schema('karisbook')
    .from('tenant_settings')
    .upsert({ ...settings, tenant_id: tenantId }, { onConflict: 'tenant_id' })

  if (error) throw new Error(error.message)
}

export async function fetchTenant(tenantId: string) {
  const { data, error } = await supabase
    .schema('karisbook')
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .single()

  if (error) return null
  return data
}

export async function saveTenantInfo(
  tenantId: string,
  info: { name: string; address: string; whatsapp: string; slug?: string }
): Promise<void> {
  const { error } = await supabase
    .schema('karisbook')
    .from('tenants')
    .update(info)
    .eq('id', tenantId)

  if (error) throw new Error(error.message)
}

export async function checkSlugAvailability(slug: string, tenantId: string): Promise<boolean> {
  const { data, error } = await supabase
    .schema('karisbook')
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .single()

  // Se der erro de "Row not found", significa que está disponível.
  if (error && error.code === 'PGRST116') return true
  
  // Se encontrou, verifica se é o próprio tenant atual
  if (data && data.id === tenantId) return true

  // Se não houver erro e retornou data de outro tenant, não está disponível.
  return !data
}
