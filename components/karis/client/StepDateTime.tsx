'use client'

import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useState } from 'react'

type Props = {
  availableSlots: string[]        // computed by the smart slot engine (karisbook-api)
  isLoadingSlots: boolean
  selectedDate: string | null
  selectedSlot: string | null
  closedDays: number[]            // day_of_week (0-6) where is_open = false
  onDateChange: (date: string) => void
  onSlotChange: (slot: string) => void
}

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const blanks = Array(firstDay).fill(null)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  return [...blanks, ...days]
}

export default function StepDateTime({
  availableSlots, isLoadingSlots,
  selectedDate, selectedSlot,
  closedDays,
  onDateChange, onSlotChange,
}: Props) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const calDays = buildCalendarDays(viewYear, viewMonth)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const canGoPrev = !(viewYear === today.getFullYear() && viewMonth === today.getMonth())

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-main)] text-balance">Data e Horário</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">Escolha quando você quer ser atendido</p>
      </div>

      {/* Calendar */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-4">
        {/* Calendar header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            disabled={!canGoPrev}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border-color)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <p className="text-sm font-semibold text-[var(--text-main)]">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </p>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border-color)] transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_NAMES.map((d) => (
            <p key={d} className="text-center text-xs font-medium text-[var(--text-muted)] py-1">{d}</p>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {calDays.map((day, i) => {
            if (!day) return <div key={`blank-${i}`} />

            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dayDate = new Date(viewYear, viewMonth, day)
            const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
            const isPast = dayDate < todayDate
            const dayOfWeek = dayDate.getDay()
            const isClosed = closedDays.includes(dayOfWeek)
            const isDisabled = isPast || isClosed
            const isSelected = selectedDate === dateStr
            const isToday = dateStr === toISODate(todayDate)

            return (
              <button
                key={dateStr}
                onClick={() => !isDisabled && onDateChange(dateStr)}
                disabled={isDisabled}
                className={`relative aspect-square flex items-center justify-center rounded-lg text-sm transition-all duration-150
                  ${isSelected
                    ? 'bg-[var(--brand-color)] text-white font-bold shadow-[0_0_10px_color-mix(in_srgb,var(--brand-color)_40%,transparent)]'
                    : isDisabled
                      ? 'text-[var(--text-muted)] opacity-40 cursor-not-allowed'
                      : 'text-[var(--text-main)] hover:bg-[var(--border-color)] cursor-pointer'
                  }
                  ${isToday && !isSelected ? 'ring-1 ring-[var(--brand-color)]/50' : ''}
                `}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Horários disponíveis
          </p>

          {isLoadingSlots ? (
            <div className="flex items-center justify-center py-8 gap-2 text-[var(--text-muted)]">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm">Verificando disponibilidade…</span>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 text-center">
              <p className="text-sm text-[var(--text-muted)]">Nenhum horário disponível nesta data.</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Tente selecionar outro dia.</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {availableSlots.map((slot) => {
                const isSelected = selectedSlot === slot
                return (
                  <button
                    key={slot}
                    onClick={() => onSlotChange(slot)}
                    className={`py-2.5 rounded-xl text-sm font-medium border transition-all duration-150
                      ${isSelected
                        ? 'bg-[var(--brand-color)] text-white border-[var(--brand-color)] shadow-[0_0_10px_color-mix(in_srgb,var(--brand-color)_30%,transparent)]'
                        : 'bg-[var(--bg-card)] text-[var(--text-main)] border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-color-hover)] cursor-pointer'
                      }`}
                  >
                    {slot}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <p className="text-sm text-[#4B5E82] text-center py-4">
          Selecione uma data para ver os horários disponíveis
        </p>
      )}
    </div>
  )
}
