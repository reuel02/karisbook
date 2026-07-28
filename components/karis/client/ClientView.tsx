'use client'

import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Service, Professional } from '@/lib/karis-data'
import StepServices from './StepServices'
import StepProfessionals from './StepProfessionals'
import StepDateTime from './StepDateTime'
import StepIdentification from './StepIdentification'
import BookingSummaryModal from './BookingSummaryModal'

const STEPS = ['Serviço', 'Profissional', 'Data & Hora', 'Seus Dados']

export default function ClientView() {
  const [step, setStep] = useState(0)

  // Booking state
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedPro, setSelectedPro] = useState<Professional | 'any' | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [clientName, setClientName] = useState('')
  const [clientWhatsapp, setClientWhatsapp] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  // Validation per step
  const canAdvance = [
    !!selectedService,
    selectedPro !== null,
    !!selectedDate && !!selectedSlot,
    clientName.trim().length >= 2 && clientWhatsapp.replace(/\D/g, '').length === 11,
  ]

  const handleNext = () => {
    if (step === 3) {
      setShowModal(true)
      return
    }
    setStep((s) => s + 1)
  }

  const handleBack = () => setStep((s) => Math.max(0, s - 1))

  const handleConfirm = () => {
    setConfirmed(true)
  }

  const handleCloseModal = () => {
    if (confirmed) {
      // Reset everything
      setStep(0)
      setSelectedService(null)
      setSelectedPro(null)
      setSelectedDate(null)
      setSelectedSlot(null)
      setClientName('')
      setClientWhatsapp('')
      setConfirmed(false)
    }
    setShowModal(false)
  }

  const progressPercent = ((step + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-[#080D1A] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#080D1A]/95 backdrop-blur-md border-b border-[rgba(59,130,246,0.1)] px-4 py-3">
        <div className="max-w-md mx-auto flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[#94A3C8] hover:text-[#EEF2FF] hover:bg-white/5 transition-colors shrink-0"
              aria-label="Voltar"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#4B5E82] font-medium">
              Passo {step + 1} de {STEPS.length}
            </p>
            <p className="text-sm font-semibold text-[#EEF2FF]">{STEPS[step]}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-md mx-auto mt-2">
          <div className="h-1 w-full bg-[#16203D] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3B82F6] rounded-full transition-all duration-500 ease-out"
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
              <div
                className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                  i <= step ? 'bg-[#3B82F6]' : 'bg-[#16203D]'
                }`}
              />
              <p className={`text-[10px] font-medium transition-colors duration-200 ${
                i === step ? 'text-[#3B82F6]' : i < step ? 'text-[#94A3C8]' : 'text-[#4B5E82]'
              }`}>
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
              selected={selectedService}
              onSelect={(s) => { setSelectedService(s); setSelectedPro(null) }}
            />
          )}
          {step === 1 && selectedService && (
            <StepProfessionals
              service={selectedService}
              selected={selectedPro}
              onSelect={setSelectedPro}
            />
          )}
          {step === 2 && (
            <StepDateTime
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
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
      <footer className="sticky bottom-0 bg-[#080D1A]/95 backdrop-blur-md border-t border-[rgba(59,130,246,0.1)] px-4 py-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleNext}
            disabled={!canAdvance[step]}
            className="w-full py-4 rounded-2xl text-sm font-bold tracking-wide transition-all duration-200
              disabled:opacity-40 disabled:cursor-not-allowed
              enabled:bg-[#3B82F6] enabled:hover:bg-[#2563EB] enabled:shadow-[0_4px_20px_rgba(59,130,246,0.35)] enabled:hover:shadow-[0_4px_24px_rgba(59,130,246,0.5)]
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
          onClose={handleCloseModal}
          onConfirm={handleConfirm}
          confirmed={confirmed}
        />
      )}
    </div>
  )
}
