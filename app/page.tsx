'use client'

import { useState } from 'react'
import { Smartphone, LayoutDashboard, Zap } from 'lucide-react'
import ClientView from '@/components/karis/client/ClientView'
import AdminView from '@/components/karis/admin/AdminView'

type ViewMode = 'client' | 'admin'

export default function KarisTechAgendaPage() {
  const [view, setView] = useState<ViewMode>('client')

  return (
    <div className="min-h-screen bg-[#080D1A] flex flex-col">
      {/* Top toggle bar */}
      <div className="sticky top-0 z-50 w-full bg-[#0C1226]/95 backdrop-blur-md border-b border-[rgba(59,130,246,0.15)]">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#3B82F6] flex items-center justify-center">
              <Zap size={14} className="text-white" fill="white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-[#EEF2FF] leading-none">Karis Tech</p>
              <p className="text-[10px] text-[#4B5E82]">Agenda</p>
            </div>
          </div>

          {/* Toggle pill */}
          <div className="flex items-center gap-1 bg-[#111830] rounded-xl p-1 border border-[rgba(59,130,246,0.15)]">
            <button
              onClick={() => setView('client')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                ${view === 'client'
                  ? 'bg-[#3B82F6] text-white shadow-[0_2px_8px_rgba(59,130,246,0.4)]'
                  : 'text-[#94A3C8] hover:text-[#EEF2FF]'
                }`}
            >
              <Smartphone size={14} />
              <span className="hidden sm:inline">Cliente</span>
            </button>
            <button
              onClick={() => setView('admin')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                ${view === 'admin'
                  ? 'bg-[#3B82F6] text-white shadow-[0_2px_8px_rgba(59,130,246,0.4)]'
                  : 'text-[#94A3C8] hover:text-[#EEF2FF]'
                }`}
            >
              <LayoutDashboard size={14} />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>

          {/* Status label */}
          <div className="shrink-0 hidden sm:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-[#4B5E82]">Demo interativo</span>
          </div>
        </div>
      </div>

      {/* View container */}
      {view === 'client' ? (
        <div className="flex-1 flex flex-col items-center">
          {/* Mobile frame hint on desktop */}
          <div className="hidden md:flex items-center justify-center py-4 w-full">
            <p className="text-xs text-[#4B5E82] flex items-center gap-1.5">
              <Smartphone size={12} />
              Visão mobile do cliente — experimente redimensionar para celular
            </p>
          </div>
          <div className="w-full max-w-[430px] flex-1 flex flex-col">
            <ClientView />
          </div>
        </div>
      ) : (
        <div className="flex-1">
          <AdminView />
        </div>
      )}
    </div>
  )
}
