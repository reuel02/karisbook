/**
 * Builds a WhatsApp deep-link URL.
 * @param phone - Phone number with country code (digits only, e.g. "5511999990000")
 * @param message - Pre-filled message text (will be URL-encoded)
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

/**
 * Formats a booking confirmation message for WhatsApp.
 */
export function buildBookingMessage(params: {
  clientName: string
  serviceName: string
  professionalName: string
  date: string        // human-readable (e.g. "segunda-feira, 28 de julho")
  timeSlot: string
  price: string       // formatted (e.g. "R$ 45,00")
}): string {
  return (
    `Olá! Gostaria de confirmar meu agendamento:\n\n` +
    `👤 *Nome:* ${params.clientName}\n` +
    `✂️ *Serviço:* ${params.serviceName} (${params.price})\n` +
    `💈 *Profissional:* ${params.professionalName}\n` +
    `📅 *Data:* ${params.date}\n` +
    `🕐 *Horário:* ${params.timeSlot}\n\n` +
    `Aguardo confirmação. Obrigado!`
  )
}

/**
 * Builds a status notification message for the customer.
 */
export function buildStatusMessage(params: {
  clientName: string
  status: 'confirmed' | 'cancelled'
  serviceName: string
  date: string
  timeSlot: string
}): string {
  if (params.status === 'confirmed') {
    return (
      `Olá ${params.clientName}! Seu agendamento para *${params.serviceName}* ` +
      `no dia *${params.date}* às *${params.timeSlot}* foi ✅ *confirmado*! ` +
      `Te esperamos por aqui.`
    )
  }
  return (
    `Olá ${params.clientName}! Infelizmente seu agendamento para *${params.serviceName}* ` +
    `no dia *${params.date}* às *${params.timeSlot}* precisou ser ❌ *cancelado*. ` +
    `Entre em contato para remarcar.`
  )
}
