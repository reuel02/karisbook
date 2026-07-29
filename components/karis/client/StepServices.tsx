'use client'

import { Clock, Tag, Loader2 } from 'lucide-react'
import { Service, formatDuration, formatPrice } from '@/lib/karis-data'

type Props = {
  services: Service[]
  isLoading: boolean
  selected: Service | null
  onSelect: (service: Service) => void
}

export default function StepServices({ services, isLoading, selected, onSelect }: Props) {
  const categories = Array.from(new Set(services.map((s) => s.category)))

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-main)] text-balance">Escolha o serviço</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">Selecione o serviço que deseja agendar</p>
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-[var(--text-main)] text-balance">Escolha o serviço</h2>
        <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-8 text-center">
          <p className="text-[var(--text-muted)] text-sm">Nenhum serviço disponível no momento.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-main)] text-balance">Escolha o serviço</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">Selecione o serviço que deseja agendar</p>
      </div>

      {categories.map((cat) => (
        <div key={cat} className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{cat}</p>
          {services.filter((s) => s.category === cat).map((service) => {
            const isSelected = selected?.id === service.id
            return (
              <button
                key={service.id}
                onClick={() => onSelect(service)}
                className={`w-full text-left rounded-xl p-4 border transition-all duration-200 cursor-pointer
                  ${isSelected
                    ? 'bg-[color-mix(in_srgb,var(--brand-color)_10%,transparent)] border-[color-mix(in_srgb,var(--brand-color)_60%,transparent)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--brand-color)_30%,transparent)]'
                    : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-color-hover)]'
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {isSelected && <span className="shrink-0 w-2 h-2 rounded-full bg-[var(--brand-color)]" />}
                      <p className="font-semibold text-[var(--text-main)] text-sm leading-snug">{service.name}</p>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{service.description}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <Clock size={12} />
                        {service.duration} min
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <Tag size={11} />{service.category}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-[var(--brand-color)]">
                    {formatPrice(service.price)}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
