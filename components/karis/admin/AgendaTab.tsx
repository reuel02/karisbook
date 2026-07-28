'use client'

import { useState } from 'react'
import { ChevronDown, Phone, Scissors } from 'lucide-react'
import {
  Appointment, AppointmentStatus, SERVICES, PROFESSIONALS,
  STATUS_LABELS, STATUS_COLORS, formatPrice,
} from '@/lib/karis-data'

type Props = {
  appointments: Appointment[]
  onStatusChange: (id: string, status: AppointmentStatus) => void
}

const ALL_STATUSES: AppointmentStatus[] = ['pending', 'confirmed', 'done', 'cancelled']

function StatusDropdown({
  current, onSelect,
}: { current: AppointmentStatus; onSelect: (s: AppointmentStatus) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${STATUS_COLORS[current]}`}
      >
        {STATUS_LABELS[current]}
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} role="presentation" />
          <div className="absolute left-0 top-full mt-1 z-20 w-36 bg-[#16203D] border border-[rgba(59,130,246,0.2)] rounded-xl overflow-hidden shadow-xl">
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => { onSelect(s); setOpen(false) }}
                className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-white/5 ${
                  s === current ? 'text-[#3B82F6]' : 'text-[#94A3C8]'
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function AgendaTab({ appointments, onStatusChange }: Props) {
  const sorted = [...appointments].sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    done: appointments.filter((a) => a.status === 'done').length,
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-[#EEF2FF]', bg: 'bg-[#16203D]' },
          { label: 'Pendentes', value: stats.pending, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Confirmados', value: stats.confirmed, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Concluídos', value: stats.done, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-4 border border-[rgba(59,130,246,0.1)]`}>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-[#94A3C8] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Appointment list */}
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-[#94A3C8] mb-2">
          Agendamentos de hoje · {new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' })}
        </h3>
        {sorted.length === 0 && (
          <div className="rounded-xl bg-[#16203D] border border-[rgba(59,130,246,0.1)] p-8 text-center">
            <p className="text-[#4B5E82] text-sm">Nenhum agendamento para hoje</p>
          </div>
        )}
        {sorted.map((apt) => {
          const service = SERVICES.find((s) => s.id === apt.serviceId)
          const pro = PROFESSIONALS.find((p) => p.id === apt.professionalId)
          return (
            <div
              key={apt.id}
              className="group bg-[#16203D] hover:bg-[#1C2A50] rounded-xl border border-[rgba(59,130,246,0.1)] hover:border-[rgba(59,130,246,0.25)] p-4 flex items-center gap-4 transition-all duration-150"
            >
              {/* Time */}
              <div className="shrink-0 w-14 text-center">
                <p className="text-lg font-bold text-[#EEF2FF] leading-none">{apt.timeSlot}</p>
              </div>

              {/* Divider */}
              <div className="w-px h-10 bg-[rgba(59,130,246,0.15)] shrink-0" />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#EEF2FF] truncate">{apt.clientName}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-[#94A3C8]">
                    <Scissors size={11} />
                    {service?.name}
                  </span>
                  {pro && (
                    <span className="flex items-center gap-1 text-xs text-[#94A3C8]">
                      <span
                        className="w-3 h-3 rounded-sm inline-block"
                        style={{ backgroundColor: pro.color }}
                      />
                      {pro.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-xs text-[#4B5E82]">
                  <Phone size={10} />
                  {apt.clientWhatsapp}
                </div>
              </div>

              {/* Price */}
              <p className="shrink-0 text-sm font-bold text-[#3B82F6] hidden sm:block">
                {service ? formatPrice(service.price) : '—'}
              </p>

              {/* Status badge + dropdown */}
              <StatusDropdown
                current={apt.status}
                onSelect={(s) => onStatusChange(apt.id, s)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
