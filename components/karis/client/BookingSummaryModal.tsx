'use client'

import { X, Scissors, User, Calendar, Clock, Phone, CheckCircle2, MessageCircle, Loader2 } from 'lucide-react'
import { Service, Professional, formatDate, formatDuration, formatPrice } from '@/lib/karis-data'
import { buildWhatsAppUrl, buildBookingMessage } from '@/lib/whatsapp'

type Props = {
  service: Service
  professional: Professional | 'any'
  date: string
  timeSlot: string
  clientName: string
  clientWhatsapp: string
  tenantWhatsapp: string     // from tenant record
  onClose: () => void
  onConfirm: () => Promise<void>
  confirmed: boolean
  isSubmitting: boolean
  error: string | null
}

export default function BookingSummaryModal({
  service, professional, date, timeSlot,
  clientName, clientWhatsapp, tenantWhatsapp,
  onClose, onConfirm, confirmed, isSubmitting, error,
}: Props) {
  const proName = professional === 'any' ? 'Qualquer profissional' : professional.name

  const rows = [
    { icon: <Scissors size={15} />, label: 'Serviço',      value: `${service.name} — ${formatPrice(service.price)}` },
    { icon: <Clock size={15} />,    label: 'Duração',      value: formatDuration(service.duration) },
    { icon: <User size={15} />,     label: 'Profissional', value: proName },
    { icon: <Calendar size={15} />, label: 'Data',         value: formatDate(date) },
    { icon: <Clock size={15} />,    label: 'Horário',      value: timeSlot },
    { icon: <Phone size={15} />,    label: 'WhatsApp',     value: clientWhatsapp },
  ]

  const handleConfirmAndWhatsApp = async () => {
    await onConfirm()
    // After the appointment is saved, open WhatsApp with the establishment
    const message = buildBookingMessage({
      clientName,
      serviceName: service.name,
      professionalName: proName,
      date: formatDate(date),
      timeSlot,
      price: formatPrice(service.price),
    })
    const url = buildWhatsAppUrl(tenantWhatsapp, message)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={!isSubmitting ? onClose : undefined}
        role="presentation"
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-2xl overflow-hidden">
        {/* Close */}
        {!isSubmitting && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border-color)] transition-colors"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        )}

        <div className="p-6">
          {!confirmed ? (
            <>
              <h3 className="text-lg font-bold text-[var(--text-main)] text-balance pr-8">
                Confirmar agendamento
              </h3>
              <p className="text-sm text-[var(--text-muted)] mt-1 mb-5">
                Olá, <span className="text-[var(--text-main)] font-medium">{clientName}</span>! Confira os detalhes:
              </p>

              <div className="flex flex-col gap-3 mb-6">
                {rows.map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[color-mix(in_srgb,var(--brand-color)_10%,transparent)] flex items-center justify-center text-[var(--brand-color)] shrink-0">
                      {row.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[var(--text-muted)]">{row.label}</p>
                      <p className="text-sm text-[var(--text-main)] font-medium truncate">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Error feedback */}
              {error && (
                <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              <button
                onClick={handleConfirmAndWhatsApp}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1EBF5A] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Confirmando…
                  </>
                ) : (
                  <>
                    <MessageCircle size={18} />
                    Confirmar no WhatsApp
                  </>
                )}
              </button>
              <p className="text-xs text-center text-[var(--text-muted)] mt-3">
                Você será redirecionado para o WhatsApp para confirmar
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center text-center py-4 gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-main)]">Agendamento enviado!</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1 leading-relaxed">
                  Seu pedido foi enviado via WhatsApp. Aguarde a confirmação do estabelecimento.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-[var(--brand-color)] hover:opacity-90 text-white font-semibold text-sm transition-colors"
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
