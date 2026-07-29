'use client'

import {
  createContext, useContext, useState, useCallback, ReactNode,
} from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  type: ToastType
  message: string
}

interface ToastContextValue {
  success: (msg: string) => void
  error: (msg: string) => void
  info: (msg: string) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  let counter = 0

  const push = useCallback((type: ToastType, message: string) => {
    const id = ++counter
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, []) // eslint-disable-line

  const dismiss = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id))

  const value: ToastContextValue = {
    success: (msg) => push('success', msg),
    error:   (msg) => push('error', msg),
    info:    (msg) => push('info', msg),
  }

  const icons: Record<ToastType, ReactNode> = {
    success: <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />,
    error:   <XCircle size={16} className="text-red-400 shrink-0" />,
    info:    <Info size={16} className="text-[#3B82F6] shrink-0" />,
  }

  const borders: Record<ToastType, string> = {
    success: 'border-emerald-500/30',
    error:   'border-red-500/30',
    info:    'border-[#3B82F6]/30',
  }

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast container */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 min-w-[240px] max-w-sm
              bg-[#111830] border ${borders[t.type]} rounded-xl shadow-xl px-4 py-3
              animate-in slide-in-from-right-4 fade-in duration-300`}
          >
            {icons[t.type]}
            <p className="flex-1 text-sm text-[#EEF2FF] leading-snug">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 text-[#4B5E82] hover:text-[#EEF2FF] transition-colors"
              aria-label="Fechar"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
