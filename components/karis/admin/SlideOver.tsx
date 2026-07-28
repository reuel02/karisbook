'use client'

import { X } from 'lucide-react'
import { ReactNode, useEffect } from 'react'

type Props = {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export default function SlideOver({ open, title, subtitle, onClose, children, footer }: Props) {
  // Prevent background scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        role="presentation"
      />

      {/* Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col bg-[#0C1226] border-l border-[rgba(59,130,246,0.18)] shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[rgba(59,130,246,0.12)]">
          <div>
            <h2 className="text-base font-bold text-[#EEF2FF]">{title}</h2>
            {subtitle && <p className="text-sm text-[#94A3C8] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4B5E82] hover:text-[#EEF2FF] hover:bg-white/5 transition-colors shrink-0"
            aria-label="Fechar painel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-5 border-t border-[rgba(59,130,246,0.12)]">
            {footer}
          </div>
        )}
      </div>
    </>
  )
}
