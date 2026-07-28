'use client'

import { Clock, Tag } from 'lucide-react'
import { SERVICES, Service, formatDuration, formatPrice } from '@/lib/karis-data'

type Props = {
  selected: Service | null
  onSelect: (service: Service) => void
}

export default function StepServices({ selected, onSelect }: Props) {
  const categories = Array.from(new Set(SERVICES.map((s) => s.category)))

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold text-[#EEF2FF] text-balance">
          Escolha o serviço
        </h2>
        <p className="text-sm text-[#94A3C8] mt-1">
          Selecione o serviço que deseja agendar
        </p>
      </div>

      {categories.map((cat) => (
        <div key={cat} className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#4B5E82]">
            {cat}
          </p>
          {SERVICES.filter((s) => s.category === cat).map((service) => {
            const isSelected = selected?.id === service.id
            return (
              <button
                key={service.id}
                onClick={() => onSelect(service)}
                className={`w-full text-left rounded-xl p-4 border transition-all duration-200 cursor-pointer
                  ${isSelected
                    ? 'bg-[#3B82F6]/10 border-[#3B82F6]/60 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]'
                    : 'bg-[#16203D] border-[rgba(59,130,246,0.14)] hover:bg-[#1C2A50] hover:border-[rgba(59,130,246,0.28)]'
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <span className="shrink-0 w-2 h-2 rounded-full bg-[#3B82F6]" />
                      )}
                      <p className="font-semibold text-[#EEF2FF] text-sm leading-snug">
                        {service.name}
                      </p>
                    </div>
                    <p className="text-xs text-[#94A3C8] mt-1 leading-relaxed">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-[#94A3C8]">
                        <Clock size={11} />
                        {formatDuration(service.duration)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[#94A3C8]">
                        <Tag size={11} />
                        {service.category}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-[#3B82F6]">
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
