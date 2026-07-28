'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { BOOKED_SLOTS, TIME_SLOTS } from '@/lib/karis-data'

type Props = {
  selectedDate: string | null
  selectedSlot: string | null
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

export default function StepDateTime({ selectedDate, selectedSlot, onDateChange, onSlotChange }: Props) {
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

  const bookedForDay = selectedDate ? (BOOKED_SLOTS[selectedDate] ?? []) : []
  const currentHour = today.getHours()
  const currentMinute = today.getMinutes()

  const isSlotDisabled = (slot: string) => {
    if (bookedForDay.includes(slot)) return true
    if (selectedDate === toISODate(today)) {
      const [h, m] = slot.split(':').map(Number)
      if (h < currentHour || (h === currentHour && m <= currentMinute)) return true
    }
    return false
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-[#EEF2FF] text-balance">
          Data e Horário
        </h2>
        <p className="text-sm text-[#94A3C8] mt-1">
          Escolha quando você quer ser atendido
        </p>
      </div>

      {/* Calendar */}
      <div className="bg-[#16203D] rounded-2xl border border-[rgba(59,130,246,0.14)] p-4">
        {/* Calendar header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            disabled={!canGoPrev}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3C8] hover:text-[#EEF2FF] hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <p className="text-sm font-semibold text-[#EEF2FF]">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </p>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3C8] hover:text-[#EEF2FF] hover:bg-white/5 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_NAMES.map((d) => (
            <p key={d} className="text-center text-xs font-medium text-[#4B5E82] py-1">
              {d}
            </p>
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
            const isSunday = dayDate.getDay() === 0
            const isDisabled = isPast || isSunday
            const isSelected = selectedDate === dateStr
            const isToday = dateStr === toISODate(todayDate)

            return (
              <button
                key={dateStr}
                onClick={() => !isDisabled && onDateChange(dateStr)}
                disabled={isDisabled}
                className={`relative aspect-square flex items-center justify-center rounded-lg text-sm transition-all duration-150
                  ${isSelected
                    ? 'bg-[#3B82F6] text-white font-bold shadow-[0_0_10px_rgba(59,130,246,0.4)]'
                    : isDisabled
                      ? 'text-[#4B5E82] opacity-40 cursor-not-allowed'
                      : 'text-[#EEF2FF] hover:bg-white/8 cursor-pointer'
                  }
                  ${isToday && !isSelected ? 'ring-1 ring-[#3B82F6]/50' : ''}
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
          <p className="text-xs font-semibold uppercase tracking-wider text-[#4B5E82]">
            Horários disponíveis
          </p>
          <div className="grid grid-cols-4 gap-2">
            {TIME_SLOTS.map((slot) => {
              const disabled = isSlotDisabled(slot)
              const isSelected = selectedSlot === slot
              return (
                <button
                  key={slot}
                  onClick={() => !disabled && onSlotChange(slot)}
                  disabled={disabled}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-all duration-150
                    ${isSelected
                      ? 'bg-[#3B82F6] text-white border-[#3B82F6] shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                      : disabled
                        ? 'bg-[#0F1628] text-[#4B5E82] border-[rgba(59,130,246,0.08)] opacity-40 cursor-not-allowed line-through'
                        : 'bg-[#16203D] text-[#EEF2FF] border-[rgba(59,130,246,0.14)] hover:bg-[#1C2A50] hover:border-[rgba(59,130,246,0.3)] cursor-pointer'
                    }`}
                >
                  {slot}
                </button>
              )
            })}
          </div>
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
