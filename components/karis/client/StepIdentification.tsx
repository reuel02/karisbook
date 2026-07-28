'use client'

import { User, Phone } from 'lucide-react'

type Props = {
  name: string
  whatsapp: string
  onNameChange: (v: string) => void
  onWhatsappChange: (v: string) => void
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  return value
}

export default function StepIdentification({ name, whatsapp, onNameChange, onWhatsappChange }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-[#EEF2FF] text-balance">
          Seus dados
        </h2>
        <p className="text-sm text-[#94A3C8] mt-1">
          Informe seu nome e WhatsApp para confirmar o agendamento
        </p>
      </div>

      {/* Name field */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[#EEF2FF]" htmlFor="client-name">
          Nome completo
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
            <User size={16} className="text-[#4B5E82]" />
          </div>
          <input
            id="client-name"
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Seu nome"
            autoComplete="name"
            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-[#16203D] border border-[rgba(59,130,246,0.14)]
              text-[#EEF2FF] placeholder:text-[#4B5E82] text-sm
              focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]
              transition-all duration-200"
          />
        </div>
      </div>

      {/* WhatsApp field */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[#EEF2FF]" htmlFor="client-whatsapp">
          WhatsApp
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
            <Phone size={16} className="text-[#4B5E82]" />
          </div>
          <input
            id="client-whatsapp"
            type="tel"
            value={whatsapp}
            onChange={(e) => onWhatsappChange(formatPhone(e.target.value))}
            placeholder="(11) 99999-9999"
            autoComplete="tel"
            inputMode="numeric"
            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-[#16203D] border border-[rgba(59,130,246,0.14)]
              text-[#EEF2FF] placeholder:text-[#4B5E82] text-sm
              focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]
              transition-all duration-200"
          />
        </div>
        <p className="text-xs text-[#4B5E82]">
          Usaremos para enviar a confirmação do agendamento
        </p>
      </div>

      {/* Info box */}
      <div className="rounded-xl bg-[#1D3A6E]/40 border border-[#3B82F6]/20 p-4">
        <p className="text-xs text-[#94A3C8] leading-relaxed">
          Seus dados são usados exclusivamente para a confirmação e lembretes do agendamento. Nenhuma conta é necessária.
        </p>
      </div>
    </div>
  )
}
