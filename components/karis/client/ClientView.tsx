'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Service, Professional } from '@/lib/karis-data'
import {
  fetchServices, fetchProfessionals, fetchAvailableSlots,
  fetchBusinessHours, fetchTenant, createAppointment,
} from '@/lib/karisbook-api'
import { useTenantId } from '@/lib/tenant-context'
import StepServices from './StepServices'
import StepProfessionals from './StepProfessionals'
import StepDateTime from './StepDateTime'
import StepIdentification from './StepIdentification'
import BookingSummaryModal from './BookingSummaryModal'

const STEPS = ['Serviço', 'Profissional', 'Data & Hora', 'Seus Dados']

export default function ClientView() {
  const tenantId = useTenantId()
  const [step, setStep] = useState(0)

  // ── Remote data ──────────────────────────────────────────────────────────
  const [services, setServices] = useState<Service[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [closedDays, setClosedDays] = useState<number[]>([])
  const [tenantWhatsapp, setTenantWhatsapp] = useState('')

  // ── Loading states ───────────────────────────────────────────────────────
  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [isLoadingPros, setIsLoadingPros] = useState(true)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ── Booking state ────────────────────────────────────────────────────────
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedPro, setSelectedPro] = useState<Professional | 'any' | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [clientName, setClientName] = useState('')
  const [clientWhatsapp, setClientWhatsapp] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // ── Fetch initial data ───────────────────────────────────────────────────
  useEffect(() => {
    if (!tenantId) return

    fetchServices(tenantId)
      .then(setServices)
      .catch(console.error)
      .finally(() => setIsLoadingServices(false))

    fetchProfessionals(tenantId)
      .then(setProfessionals)
      .catch(console.error)
      .finally(() => setIsLoadingPros(false))

    fetchBusinessHours(tenantId).then((bh) => {
      const closed = bh.filter((h) => !h.is_open).map((h) => h.day_of_week)
      setClosedDays(closed)
    }).catch(console.error)

    fetchTenant(tenantId).then((t) => {
      if (t?.whatsapp) setTenantWhatsapp(t.whatsapp)
    }).catch(console.error)
  }, [tenantId])

  // ── Fetch slots when date or professional changes ────────────────────────
  const refreshSlots = useCallback(async (date: string, pro: Professional | 'any' | null, svc: Service | null) => {
    if (!date || !svc) return
    setIsLoadingSlots(true)
    setAvailableSlots([])
    try {
      const proId = (pro && pro !== 'any') ? pro.id : null
      const slots = await fetchAvailableSlots(tenantId, date, proId, svc.duration)
      setAvailableSlots(slots)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingSlots(false)
    }
  }, [tenantId])

  useEffect(() => {
    if (selectedDate) {
      refreshSlots(selectedDate, selectedPro, selectedService)
    }
  }, [selectedDate, selectedPro, selectedService, refreshSlots])

  // ── Validation ───────────────────────────────────────────────────────────
  const canAdvance = [
    !!selectedService,
    selectedPro !== null,
    !!selectedDate && !!selectedSlot,
    clientName.trim().length >= 2 && clientWhatsapp.replace(/\D/g, '').length === 11,
  ]

  // ── Navigation ───────────────────────────────────────────────────────────
  const handleNext = () => {
    if (step === 3) { setShowModal(true); return }
    setStep((s) => s + 1)
  }
  const handleBack = () => setStep((s) => Math.max(0, s - 1))

  // ── Confirm booking → Supabase INSERT ────────────────────────────────────
  const handleConfirm = async () => {
    if (!selectedService || !selectedDate || !selectedSlot) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const proId = (selectedPro && selectedPro !== 'any') ? selectedPro.id : null
      // If "any", pick the first eligible professional
      let resolvedProId = proId
      if (!resolvedProId) {
        const eligible = professionals.filter((p) => p.services.includes(selectedService.id))
        resolvedProId = eligible[0]?.id ?? null
      }
      if (!resolvedProId) throw new Error('Nenhum profissional disponível para este serviço.')

      await createAppointment(tenantId, {
        service_id: selectedService.id,
        professional_id: resolvedProId,
        client_name: clientName,
        client_whatsapp: clientWhatsapp,
        date: selectedDate,
        time_slot: selectedSlot,
      })
      setConfirmed(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao confirmar agendamento.'
      setSubmitError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseModal = () => {
    if (confirmed) {
      setStep(0)
      setSelectedService(null)
      setSelectedPro(null)
      setSelectedDate(null)
      setSelectedSlot(null)
      setClientName('')
      setClientWhatsapp('')
      setConfirmed(false)
      setAvailableSlots([])
    }
    setSubmitError(null)
    setShowModal(false)
  }

  const progressPercent = ((step + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--bg-card)]/95 backdrop-blur-md border-b border-[var(--border-color)] px-4 py-3">
        <div className="max-w-md mx-auto flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border-color)] transition-colors shrink-0"
              aria-label="Voltar"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--text-muted)] font-medium">Passo {step + 1} de {STEPS.length}</p>
            <p className="text-sm font-semibold text-[var(--text-main)]">{STEPS[step]}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-md mx-auto mt-2">
          <div className="h-1 w-full bg-[var(--bg-card)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--brand-color)] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* Step dots */}
      <div className="max-w-md mx-auto w-full px-4 pt-4">
        <div className="flex items-center gap-1">
          {STEPS.map((label, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={`h-1.5 w-full rounded-full transition-all duration-300 ${i <= step ? 'bg-[var(--brand-color)]' : 'bg-[var(--bg-card)]'}`} />
              <p className={`text-[10px] font-medium transition-colors duration-200 ${i === step ? 'text-[var(--brand-color)]' : i < step ? 'text-[var(--text-muted)]' : 'text-[var(--text-muted)] opacity-50'}`}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6">
        <div className="transition-all duration-200">
          {step === 0 && (
            <StepServices
              services={services}
              isLoading={isLoadingServices}
              selected={selectedService}
              onSelect={(s) => { setSelectedService(s); setSelectedPro(null) }}
            />
          )}
          {step === 1 && selectedService && (
            <StepProfessionals
              service={selectedService}
              professionals={professionals}
              isLoading={isLoadingPros}
              selected={selectedPro}
              onSelect={setSelectedPro}
            />
          )}
          {step === 2 && (
            <StepDateTime
              availableSlots={availableSlots}
              isLoadingSlots={isLoadingSlots}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              closedDays={closedDays}
              onDateChange={(d) => { setSelectedDate(d); setSelectedSlot(null) }}
              onSlotChange={setSelectedSlot}
            />
          )}
          {step === 3 && (
            <StepIdentification
              name={clientName}
              whatsapp={clientWhatsapp}
              onNameChange={setClientName}
              onWhatsappChange={setClientWhatsapp}
            />
          )}
        </div>
      </main>

      {/* Footer CTA */}
      <footer className="sticky bottom-0 bg-[var(--bg-card)]/95 backdrop-blur-md border-t border-[var(--border-color)] px-4 py-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleNext}
            disabled={!canAdvance[step]}
            className="w-full py-4 rounded-2xl text-sm font-bold tracking-wide transition-all duration-200
              disabled:opacity-40 disabled:cursor-not-allowed
              enabled:bg-[var(--brand-color)] enabled:hover:opacity-90 enabled:shadow-[0_4px_20px_color-mix(in_srgb,var(--brand-color)_35%,transparent)] enabled:hover:shadow-[0_4px_24px_color-mix(in_srgb,var(--brand-color)_50%,transparent)]
              text-white"
          >
            {step === 3 ? 'Revisar e Confirmar' : 'Próximo'}
          </button>
        </div>
      </footer>

      {/* Summary modal */}
      {showModal && selectedService && selectedPro && selectedDate && selectedSlot && (
        <BookingSummaryModal
          service={selectedService}
          professional={selectedPro}
          date={selectedDate}
          timeSlot={selectedSlot}
          clientName={clientName}
          clientWhatsapp={clientWhatsapp}
          tenantWhatsapp={tenantWhatsapp}
          onClose={handleCloseModal}
          onConfirm={handleConfirm}
          confirmed={confirmed}
          isSubmitting={isSubmitting}
          error={submitError}
        />
      )}
    </div>
  )
}
