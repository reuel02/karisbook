// ─── Re-exports for UI compatibility ─────────────────────────────────────────
// Types are defined in lib/karisbook-types.ts.
// Only helpers and display maps remain here.

export type {
  Service,
  Professional,
  Appointment,
  AppointmentStatus,
  BusinessHour,
  TenantSettings,
  Tenant,
} from './karisbook-types'

// ─── Formatting helpers ───────────────────────────────────────────────────────

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

// ─── Status display maps ──────────────────────────────────────────────────────

export const STATUS_LABELS: Record<string, string> = {
  pending:   'Pendente',
  confirmed: 'Confirmado',
  done:      'Concluído',
  cancelled: 'Cancelado',
}

export const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  confirmed: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  done:      'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border border-red-500/30',
}
