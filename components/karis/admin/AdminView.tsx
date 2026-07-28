'use client'

import { useState } from 'react'
import {
  CalendarDays, Scissors, Users, Settings, Menu, X, Zap,
} from 'lucide-react'
import {
  APPOINTMENTS, SERVICES, PROFESSIONALS,
  Service, Professional, Appointment, AppointmentStatus,
} from '@/lib/karis-data'
import AgendaTab from './AgendaTab'
import ServicesTab from './ServicesTab'
import TeamTab from './TeamTab'
import SettingsTab from './SettingsTab'

type Tab = 'agenda' | 'services' | 'team' | 'settings'

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'agenda',   label: 'Agenda do Dia', icon: <CalendarDays size={18} /> },
  { id: 'services', label: 'Serviços',       icon: <Scissors size={18} /> },
  { id: 'team',     label: 'Equipe',         icon: <Users size={18} /> },
  { id: 'settings', label: 'Configurações',  icon: <Settings size={18} /> },
]

export default function AdminView() {
  const [activeTab, setActiveTab] = useState<Tab>('agenda')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // State (mocked)
  const [appointments, setAppointments] = useState<Appointment[]>(APPOINTMENTS)
  const [services, setServices] = useState<Service[]>(SERVICES)
  const [professionals, setProfessionals] = useState<Professional[]>(PROFESSIONALS)

  // Appointment handlers
  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status } : a))
  }

  // Service CRUD
  const handleAddService = (s: Omit<Service, 'id'>) => {
    setServices((prev) => [...prev, { ...s, id: `svc-${Date.now()}` }])
  }
  const handleEditService = (s: Service) => {
    setServices((prev) => prev.map((x) => x.id === s.id ? s : x))
  }
  const handleDeleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id))
  }

  // Professional CRUD
  const handleAddPro = (p: Omit<Professional, 'id'>) => {
    setProfessionals((prev) => [...prev, { ...p, id: `pro-${Date.now()}` }])
  }
  const handleEditPro = (p: Professional) => {
    setProfessionals((prev) => prev.map((x) => x.id === p.id ? p : x))
  }
  const handleDeletePro = (id: string) => {
    setProfessionals((prev) => prev.filter((p) => p.id !== id))
  }

  const navigateTo = (tab: Tab) => { setActiveTab(tab); setSidebarOpen(false) }

  const SidebarContent = () => (
    <nav className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[rgba(59,130,246,0.12)]">
        <div className="w-9 h-9 rounded-xl bg-[#3B82F6] flex items-center justify-center shrink-0">
          <Zap size={18} className="text-white" fill="white" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#EEF2FF] leading-none">Karis Tech</p>
          <p className="text-xs text-[#4B5E82] mt-0.5">Agenda</p>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left
                ${isActive
                  ? 'bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30'
                  : 'text-[#94A3C8] hover:text-[#EEF2FF] hover:bg-white/5 border border-transparent'
                }`}
            >
              {item.icon}
              {item.label}
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[rgba(59,130,246,0.12)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1D3A6E] flex items-center justify-center text-xs font-bold text-[#3B82F6]">
            AD
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#EEF2FF] truncate">Admin</p>
            <p className="text-xs text-[#4B5E82] truncate">admin@karistech.com</p>
          </div>
        </div>
      </div>
    </nav>
  )

  return (
    <div className="min-h-screen bg-[#080D1A] flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-[#0C1226] border-r border-[rgba(59,130,246,0.12)] sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            role="presentation"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-[#0C1226] border-r border-[rgba(59,130,246,0.18)] flex flex-col lg:hidden">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-[#4B5E82] hover:text-[#EEF2FF] hover:bg-white/5 transition-colors"
              aria-label="Fechar menu"
            >
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#080D1A]/95 backdrop-blur-md border-b border-[rgba(59,130,246,0.1)] px-4 sm:px-6 py-3 flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#94A3C8] hover:text-[#EEF2FF] hover:bg-white/5 transition-colors lg:hidden shrink-0"
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-[#EEF2FF]">
              {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-[#4B5E82]">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Pending badge */}
          {appointments.filter((a) => a.status === 'pending').length > 0 && (
            <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-semibold text-amber-400">
                {appointments.filter((a) => a.status === 'pending').length} pendentes
              </span>
            </div>
          )}
        </header>

        {/* Tab content */}
        <main className="flex-1 p-4 sm:p-6">
          {activeTab === 'agenda' && (
            <AgendaTab appointments={appointments} onStatusChange={handleStatusChange} />
          )}
          {activeTab === 'services' && (
            <ServicesTab
              services={services}
              onAdd={handleAddService}
              onEdit={handleEditService}
              onDelete={handleDeleteService}
            />
          )}
          {activeTab === 'team' && (
            <TeamTab
              professionals={professionals}
              services={services}
              onAdd={handleAddPro}
              onEdit={handleEditPro}
              onDelete={handleDeletePro}
            />
          )}
          {activeTab === 'settings' && <SettingsTab />}
        </main>
      </div>
    </div>
  )
}
