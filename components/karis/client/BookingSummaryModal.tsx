'use client'

import { X, Scissors, User, Calendar, Clock, Phone, CheckCircle2, MessageCircle } from 'lucide-react'
import { Service, Professional, formatDate, formatDuration, formatPrice } from '@/lib/karis-data'

type Props = {
  service: Service
  professional: Professional | 'any'
  date: string
  timeSlot: string
  clientName: string
  clientWhatsapp: string
  onClose: () => void
  onConfirm: () => void
  confirmed: boolean
}

export default function BookingSummaryModal({
  service, professional, date, timeSlot,
  clientName, clientWhatsapp,
  onClose, onConfirm, confirmed,
}: Props) {
  const proName = professional === 'any' ? 'Qualquer profissional' : professional.name

  const rows = [
    { icon: <Scissors size={15} />, label: 'Serviço', value: `${service.name} — ${formatPrice(service.price)}` },
    { icon: <Clock size={15} />, label: 'Duração', value: formatDuration(service.duration) },
    { icon: <User size={15} />, label: 'Profissional', value: proName },
    { icon: <Calendar size={15} />, label: 'Data', value: formatDate(date) },
    { icon: <Clock size={15} />, label: 'Horário', value: timeSlot },
    { icon: <Phone size={15} />, label: 'WhatsApp', value: clientWhatsapp },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-[#111830] rounded-2xl border border-[rgba(59,130,246,0.2)] shadow-2xl overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-[#4B5E82] hover:text-[#EEF2FF] hover:bg-white/5 transition-colors"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        <div className="p-6">
          {!confirmed ? (
            <>
              <h3 className="text-lg font-bold text-[#EEF2FF] text-balance pr-8">
                Confirmar agendamento
              </h3>
              <p className="text-sm text-[#94A3C8] mt-1 mb-5">
                Olá, <span className="text-[#EEF2FF] font-medium">{clientName}</span>! Confira os detalhes:
              </p>

              <div className="flex flex-col gap-3 mb-6">
                {rows.map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] shrink-0">
                      {row.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[#4B5E82]">{row.label}</p>
                      <p className="text-sm text-[#EEF2FF] font-medium truncate">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={onConfirm}
                className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1EBF5A] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle size={18} />
                Confirmar no WhatsApp
              </button>
              <p className="text-xs text-center text-[#4B5E82] mt-3">
                Você será redirecionado para o WhatsApp para confirmar
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center text-center py-4 gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#EEF2FF]">Agendamento enviado!</h3>
                <p className="text-sm text-[#94A3C8] mt-1 leading-relaxed">
                  Seu pedido foi enviado via WhatsApp. Aguarde a confirmação do estabelecimento.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-sm transition-colors"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
