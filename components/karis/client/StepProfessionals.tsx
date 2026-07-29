'use client'

import { Shuffle } from 'lucide-react'
import { Professional, Service } from '@/lib/karis-data'

type Props = {
  service: Service
  professionals: Professional[]
  isLoading: boolean
  selected: Professional | 'any' | null
  onSelect: (pro: Professional | 'any') => void
}

export default function StepProfessionals({ service, professionals, isLoading, selected, onSelect }: Props) {
  // Filter professionals who handle this service (by service ID)
  const eligible = professionals.filter((p) => p.services.includes(service.id))

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-main)] text-balance">Escolha o profissional</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Para <span className="text-[var(--text-main)] font-medium">{service.name}</span>
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-main)] text-balance">Escolha o profissional</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Para <span className="text-[var(--text-main)] font-medium">{service.name}</span>
        </p>
      </div>

      {/* Any Professional option */}
      <button
        onClick={() => onSelect('any')}
        className={`w-full text-left rounded-xl p-4 border flex items-center gap-4 transition-all duration-200 cursor-pointer
          ${selected === 'any'
            ? 'bg-[color-mix(in_srgb,var(--brand-color)_10%,transparent)] border-[color-mix(in_srgb,var(--brand-color)_60%,transparent)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--brand-color)_30%,transparent)]'
            : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-color-hover)]'
          }`}
      >
        <div className="w-12 h-12 rounded-xl bg-[color-mix(in_srgb,var(--brand-color)_15%,transparent)] border border-[color-mix(in_srgb,var(--brand-color)_30%,transparent)] flex items-center justify-center shrink-0">
          <Shuffle size={20} className="text-[var(--brand-color)]" />
        </div>
        <div>
          <p className="font-semibold text-[var(--text-main)] text-sm">Qualquer Profissional</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Primeiro horário disponível</p>
        </div>
        {selected === 'any' && <span className="ml-auto w-2 h-2 rounded-full bg-[var(--brand-color)] shrink-0" />}
      </button>

      {/* Individual professionals */}
      {eligible.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
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
                    ? 'bg-[color-mix(in_srgb,var(--brand-color)_10%,transparent)] border-[color-mix(in_srgb,var(--brand-color)_60%,transparent)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--brand-color)_30%,transparent)]'
                    : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-color-hover)]'
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
                  <p className="font-semibold text-[var(--text-main)] text-sm">{pro.name}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{pro.role}</p>
                </div>
                {isSelected && <span className="ml-auto w-2 h-2 rounded-full bg-[var(--brand-color)] shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
