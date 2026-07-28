// ─── Types ────────────────────────────────────────────────────────────────────

export type Service = {
  id: string
  name: string
  description: string
  duration: number // minutes
  price: number    // BRL
  category: string
}

export type Professional = {
  id: string
  name: string
  role: string
  initials: string
  color: string   // bg color for avatar
  services: string[] // service IDs
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'done' | 'cancelled'

export type Appointment = {
  id: string
  serviceId: string
  professionalId: string
  clientName: string
  clientWhatsapp: string
  date: string     // ISO date string YYYY-MM-DD
  timeSlot: string // e.g. "09:00"
  status: AppointmentStatus
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const SERVICES: Service[] = [
  {
    id: 'svc-1',
    name: 'Corte Masculino',
    description: 'Corte clássico ou moderno com acabamento perfeito',
    duration: 45,
    price: 45,
    category: 'Cabelo',
  },
  {
    id: 'svc-2',
    name: 'Barba Completa',
    description: 'Aparar, modelar e hidratação da barba',
    duration: 30,
    price: 35,
    category: 'Barba',
  },
  {
    id: 'svc-3',
    name: 'Corte + Barba',
    description: 'Combo completo: corte e barba com produtos premium',
    duration: 70,
    price: 70,
    category: 'Combo',
  },
  {
    id: 'svc-4',
    name: 'Pigmentação',
    description: 'Coloração e pigmentação de cabelo e barba',
    duration: 60,
    price: 80,
    category: 'Coloração',
  },
  {
    id: 'svc-5',
    name: 'Sobrancelha',
    description: 'Design e modelagem de sobrancelha masculina',
    duration: 20,
    price: 25,
    category: 'Estética',
  },
]

export const PROFESSIONALS: Professional[] = [
  {
    id: 'pro-1',
    name: 'Carlos Silva',
    role: 'Barbeiro Sênior',
    initials: 'CS',
    color: '#1D3A6E',
    services: ['svc-1', 'svc-2', 'svc-3', 'svc-4', 'svc-5'],
  },
  {
    id: 'pro-2',
    name: 'Lucas Mendes',
    role: 'Barbeiro',
    initials: 'LM',
    color: '#1A3D2B',
    services: ['svc-1', 'svc-2', 'svc-3'],
  },
  {
    id: 'pro-3',
    name: 'Rafael Costa',
    role: 'Barbeiro & Esteticista',
    initials: 'RC',
    color: '#3D1A1A',
    services: ['svc-1', 'svc-4', 'svc-5'],
  },
]

export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30',
]

// Slots that are already booked (for demo purposes)
export const BOOKED_SLOTS: Record<string, string[]> = {
  '2026-07-27': ['09:00', '10:30', '14:00', '15:30'],
  '2026-07-28': ['08:00', '11:00', '16:00'],
  '2026-07-29': ['08:30', '09:30', '13:00', '17:00'],
}

export const APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    serviceId: 'svc-3',
    professionalId: 'pro-1',
    clientName: 'João Pereira',
    clientWhatsapp: '(11) 99999-1111',
    date: '2026-07-27',
    timeSlot: '09:00',
    status: 'confirmed',
  },
  {
    id: 'apt-2',
    serviceId: 'svc-1',
    professionalId: 'pro-2',
    clientName: 'Marcos Lima',
    clientWhatsapp: '(11) 99999-2222',
    date: '2026-07-27',
    timeSlot: '10:00',
    status: 'pending',
  },
  {
    id: 'apt-3',
    serviceId: 'svc-2',
    professionalId: 'pro-1',
    clientName: 'André Santos',
    clientWhatsapp: '(11) 99999-3333',
    date: '2026-07-27',
    timeSlot: '11:00',
    status: 'done',
  },
  {
    id: 'apt-4',
    serviceId: 'svc-4',
    professionalId: 'pro-3',
    clientName: 'Felipe Rocha',
    clientWhatsapp: '(11) 99999-4444',
    date: '2026-07-27',
    timeSlot: '14:00',
    status: 'cancelled',
  },
  {
    id: 'apt-5',
    serviceId: 'svc-5',
    professionalId: 'pro-3',
    clientName: 'Bruno Alves',
    clientWhatsapp: '(11) 99999-5555',
    date: '2026-07-27',
    timeSlot: '15:00',
    status: 'pending',
  },
  {
    id: 'apt-6',
    serviceId: 'svc-1',
    professionalId: 'pro-2',
    clientName: 'Rodrigo Nunes',
    clientWhatsapp: '(11) 99999-6666',
    date: '2026-07-27',
    timeSlot: '16:00',
    status: 'confirmed',
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price)
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })
}

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  done: 'Concluído',
  cancelled: 'Cancelado',
}

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending:   'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  confirmed: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  done:      'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border border-red-500/30',
}
