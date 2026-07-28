'use client'

import { Shuffle } from 'lucide-react'
import { PROFESSIONALS, Professional, Service } from '@/lib/karis-data'

type Props = {
  service: Service
  selected: Professional | 'any' | null
  onSelect: (pro: Professional | 'any') => void
}

export default function StepProfessionals({ service, selected, onSelect }: Props) {
  const eligible = PROFESSIONALS.filter((p) => p.services.includes(service.id))

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold text-[#EEF2FF] text-balance">
          Escolha o profissional
        </h2>
        <p className="text-sm text-[#94A3C8] mt-1">
          Para <span className="text-[#EEF2FF] font-medium">{service.name}</span>
        </p>
      </div>

      {/* Any Professional option */}
      <button
        onClick={() => onSelect('any')}
        className={`w-full text-left rounded-xl p-4 border flex items-center gap-4 transition-all duration-200 cursor-pointer
          ${selected === 'any'
            ? 'bg-[#3B82F6]/10 border-[#3B82F6]/60 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]'
            : 'bg-[#16203D] border-[rgba(59,130,246,0.14)] hover:bg-[#1C2A50] hover:border-[rgba(59,130,246,0.28)]'
          }`}
      >
        <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center shrink-0">
          <Shuffle size={20} className="text-[#3B82F6]" />
        </div>
        <div>
          <p className="font-semibold text-[#EEF2FF] text-sm">Qualquer Profissional</p>
          <p className="text-xs text-[#94A3C8] mt-0.5">Primeiro horário disponível</p>
        </div>
        {selected === 'any' && (
          <span className="ml-auto w-2 h-2 rounded-full bg-[#3B82F6] shrink-0" />
        )}
      </button>

      {/* Individual professionals */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#4B5E82]">
          Ou escolha um específico
        </p>
        {eligible.map((pro) => {
          const isSelected = typeof selected === 'object' && selected?.id === pro.id
          return (
            <button
              key={pro.id}
              onClick={() => onSelect(pro)}
              className={`w-full text-left rounded-xl p-4 border flex items-center gap-4 transition-all duration-200 cursor-pointer
                ${isSelected
                  ? 'bg-[#3B82F6]/10 border-[#3B82F6]/60 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]'
                  : 'bg-[#16203D] border-[rgba(59,130,246,0.14)] hover:bg-[#1C2A50] hover:border-[rgba(59,130,246,0.28)]'
                }`}
            >
              {/* Avatar */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold text-white"
                style={{ backgroundColor: pro.color }}
              >
                {pro.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#EEF2FF] text-sm">{pro.name}</p>
                <p className="text-xs text-[#94A3C8] mt-0.5">{pro.role}</p>
              </div>
              {isSelected && (
                <span className="ml-auto w-2 h-2 rounded-full bg-[#3B82F6] shrink-0" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
