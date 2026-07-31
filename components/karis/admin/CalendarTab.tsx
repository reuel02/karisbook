'use client'

import { useState, useEffect, useMemo } from 'react'
import { fetchCalendarAppointments } from '@/lib/karisbook-api'
import { useTenantId } from '@/lib/tenant-context'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { startOfMonth, endOfMonth, format, isSameDay, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Appointment, AppointmentStatus, STATUS_LABELS, STATUS_COLORS } from '@/lib/karis-data'
import { X, User, Scissors, ChevronDown } from 'lucide-react'

const ALL_STATUSES: AppointmentStatus[] = ['pending', 'confirmed', 'done', 'cancelled']

function StatusDropdown({
  current, isUpdating, onSelect,
}: { current: AppointmentStatus; isUpdating: boolean; onSelect: (s: AppointmentStatus) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => !isUpdating && setOpen(!open)}
        disabled={isUpdating}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${STATUS_COLORS[current]} disabled:opacity-60`}
      >
        {STATUS_LABELS[current]}
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} role="presentation" />
          <div className="absolute right-0 top-full mt-1 z-20 w-36 bg-[#16203D] border border-[rgba(59,130,246,0.2)] rounded-xl overflow-hidden shadow-xl">
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

export default function CalendarTab({ services, onStatusChange }: { services: any[], onStatusChange?: (id: string, status: AppointmentStatus) => Promise<void> }) {
  const tenantId = useTenantId()
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date())
  const [appointmentsCache, setAppointmentsCache] = useState<Record<string, Appointment[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const monthKey = format(currentMonth, 'yyyy-MM')

  useEffect(() => {
    if (!tenantId) return
    if (appointmentsCache[monthKey]) return // cached

    const loadMonth = async () => {
      setIsLoading(true)
      try {
        const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
        const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd')
        const data = await fetchCalendarAppointments(tenantId, start, end)
        setAppointmentsCache(prev => ({ ...prev, [monthKey]: data }))
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    loadMonth()
  }, [tenantId, currentMonth, monthKey, appointmentsCache])

  const currentMonthAppointments = appointmentsCache[monthKey] || []

  // Add modifiers for days with appointments
  const modifiers = useMemo(() => {
    const daysWithAppointments = currentMonthAppointments.map(a => parseISO(a.date))
    return { hasAppointment: daysWithAppointments }
  }, [currentMonthAppointments])

  const modifiersStyles = {
    hasAppointment: {
      fontWeight: 'bold',
      backgroundColor: 'rgba(59,130,246,0.1)',
      color: '#3B82F6',
      border: '1px solid rgba(59,130,246,0.5)',
    }
  }

  const handleDayClick = (day: Date) => {
    setSelectedDay(day)
    setShowModal(true)
  }

  const handleStatusChange = async (apt: Appointment, newStatus: AppointmentStatus) => {
    if (!onStatusChange) return
    setUpdatingId(apt.id)
    await onStatusChange(apt.id, newStatus)
    setUpdatingId(null)
    setAppointmentsCache(prev => {
      const mk = format(parseISO(apt.date), 'yyyy-MM')
      if (!prev[mk]) return prev
      return {
        ...prev,
        [mk]: prev[mk].map(a => a.id === apt.id ? { ...a, status: newStatus } : a)
      }
    })
  }

  const selectedDayAppointments = currentMonthAppointments.filter(a => 
    selectedDay && isSameDay(parseISO(a.date), selectedDay)
  )

  return (
    <div className="flex flex-col gap-6 items-center">
      <div className="bg-[#16203D] rounded-xl p-6 border border-[rgba(59,130,246,0.1)] w-full max-w-md">
        <style dangerouslySetInnerHTML={{ __html: `
          .rdp {
            --rdp-cell-size: 40px;
            --rdp-accent-color: #3B82F6;
            --rdp-background-color: rgba(59,130,246,0.15);
            --rdp-accent-color-dark: #3B82F6;
            --rdp-background-color-dark: rgba(59,130,246,0.15);
            --rdp-outline: 2px solid var(--rdp-accent-color);
            --rdp-outline-selected: 2px solid rgba(59, 130, 246, 0.5);
            margin: 0 auto;
            color: #EEF2FF;
          }
          .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
            color: #EEF2FF;
            opacity: 1;
            background-color: var(--rdp-accent-color);
          }
        `}} />
        <DayPicker
          mode="single"
          selected={selectedDay}
          onSelect={(day) => day && handleDayClick(day)}
          onMonthChange={setCurrentMonth}
          locale={ptBR}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          className="mx-auto"
        />
        {isLoading && (
          <div className="mt-4 text-center">
            <p className="text-xs text-[#3B82F6] animate-pulse">Carregando agendamentos...</p>
          </div>
        )}
      </div>

      {showModal && selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#0C1226] border border-[rgba(59,130,246,0.18)] rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col max-h-[80vh]">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-[#4B5E82] hover:text-[#EEF2FF] transition-colors"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold text-[#EEF2FF] mb-6">
              Agendamentos: {format(selectedDay, "dd 'de' MMMM", { locale: ptBR })}
            </h2>
            
            <div className="overflow-y-auto pr-2 space-y-3">
              {selectedDayAppointments.length === 0 ? (
                <div className="p-8 text-center bg-[#16203D] rounded-xl border border-[rgba(59,130,246,0.1)]">
                  <p className="text-sm text-[#4B5E82]">Nenhum agendamento para este dia.</p>
                </div>
              ) : (
                selectedDayAppointments.map(apt => {
                  const svc = services.find(s => s.id === apt.service_id)
                  return (
                    <div key={apt.id} className="bg-[#16203D] rounded-xl p-4 border border-[rgba(59,130,246,0.1)] flex gap-4 items-center">
                      <div className="w-14 text-center shrink-0">
                        <p className="text-lg font-bold text-[#EEF2FF]">{apt.time_slot.substring(0,5)}</p>
                      </div>
                      <div className="w-px h-10 bg-[rgba(59,130,246,0.15)] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#EEF2FF] truncate flex items-center gap-1.5">
                          <User size={12} className="text-[#3B82F6]"/> {apt.client_name}
                        </p>
                        <p className="text-xs text-[#94A3C8] mt-1 flex items-center gap-1.5">
                          <Scissors size={12}/> {svc?.name || 'Serviço'}
                        </p>
                      </div>
                      <StatusDropdown
                        current={apt.status}
                        isUpdating={updatingId === apt.id}
                        onSelect={(s) => handleStatusChange(apt, s)}
                      />
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
