'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  CalendarDays, Scissors, Users, Settings, Menu, X, Zap, LogOut,
  HeartHandshake, DollarSign, Calendar
} from 'lucide-react'
import { Service, Professional, Appointment, AppointmentStatus } from '@/lib/karis-data'
import {
  fetchServices, upsertService, deleteService,
  fetchProfessionals, upsertProfessional, deleteProfessional,
  fetchAppointmentsByDate, updateAppointmentStatus,
  fetchTenantSettings, fetchTenant,
} from '@/lib/karisbook-api'
import { useTenantId } from '@/lib/tenant-context'
import AgendaTab from './AgendaTab'
import ServicesTab from './ServicesTab'
import TeamTab from './TeamTab'
import SettingsTab from './SettingsTab'
import CrmTab from './CrmTab'
import FinanceTab from './FinanceTab'
import CalendarTab from './CalendarTab'

type Tab = 'agenda' | 'calendar' | 'crm' | 'finance' | 'services' | 'team' | 'settings'

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'agenda',   label: 'Agenda do Dia', icon: <CalendarDays size={18} /> },
  { id: 'calendar', label: 'Calendário',    icon: <Calendar size={18} /> },
  { id: 'crm',      label: 'Meus Clientes', icon: <HeartHandshake size={18} /> },
  { id: 'finance',  label: 'Financeiro',    icon: <DollarSign size={18} /> },
  { id: 'services', label: 'Serviços',       icon: <Scissors size={18} /> },
  { id: 'team',     label: 'Equipe',         icon: <Users size={18} /> },
  { id: 'settings', label: 'Configurações',  icon: <Settings size={18} /> },
]

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function AdminView() {
  const router = useRouter()
  const tenantId = useTenantId()
  const [activeTab, setActiveTab] = useState<Tab>('agenda')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isTemporarySlug, setIsTemporarySlug] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('Admin')

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  // ── Busca o email do usuário logado ──────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setUserEmail(user.email)
    })
  }, [])

  // ── Remote data ──────────────────────────────────────────────────────────
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [tenantWhatsapp, setTenantWhatsapp] = useState('')
  const [tenantName, setTenantName] = useState('')
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(false)

  // ── Loading states ───────────────────────────────────────────────────────
  const [isLoadingAgenda, setIsLoadingAgenda] = useState(true)
  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [isLoadingPros, setIsLoadingPros] = useState(true)

  // ── Initial fetch ─────────────────────────────────────────────────────────
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

    fetchAppointmentsByDate(tenantId, todayISO())
      .then(setAppointments)
      .catch(console.error)
      .finally(() => setIsLoadingAgenda(false))

    fetchTenant(tenantId).then((t) => { 
      if (t) {
        if (t.name) setTenantName(t.name)
        if (t.whatsapp) setTenantWhatsapp(t.whatsapp) 
        if (t.slug && t.slug.includes('temporario')) {
          setIsTemporarySlug(true)
          setActiveTab('settings')
        }
      }
    }).catch(console.error)
    fetchTenantSettings(tenantId).then((s) => { if (s) setNotifyWhatsapp(s.notify_new_booking_whatsapp) }).catch(console.error)
  }, [tenantId])

  // ── Appointment handlers ──────────────────────────────────────────────────
  const handleStatusChange = useCallback(async (id: string, status: AppointmentStatus) => {
    await updateAppointmentStatus(tenantId, id, status)
    setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status } : a))
  }, [tenantId])

  // ── Service CRUD ──────────────────────────────────────────────────────────
  const handleAddService = useCallback(async (s: Omit<Service, 'id' | 'tenant_id' | 'is_active' | 'created_at'>) => {
    const saved = await upsertService(tenantId, s)
    setServices((prev) => [...prev, saved])
  }, [tenantId])

  const handleEditService = useCallback(async (s: Service) => {
    const saved = await upsertService(tenantId, s)
    setServices((prev) => prev.map((x) => x.id === saved.id ? saved : x))
  }, [tenantId])

  const handleDeleteService = useCallback(async (id: string) => {
    await deleteService(tenantId, id)
    setServices((prev) => prev.filter((s) => s.id !== id))
  }, [tenantId])

  // ── Professional CRUD ─────────────────────────────────────────────────────
  const handleAddPro = useCallback(async (p: Omit<Professional, 'id' | 'tenant_id' | 'is_active' | 'created_at'>, serviceIds: string[]) => {
    const saved = await upsertProfessional(tenantId, p, serviceIds)
    setProfessionals((prev) => [...prev, saved])
  }, [tenantId])

  const handleEditPro = useCallback(async (p: Professional, serviceIds: string[]) => {
    const saved = await upsertProfessional(tenantId, p, serviceIds)
    setProfessionals((prev) => prev.map((x) => x.id === saved.id ? saved : x))
  }, [tenantId])

  const handleDeletePro = useCallback(async (id: string) => {
    await deleteProfessional(tenantId, id)
    setProfessionals((prev) => prev.filter((p) => p.id !== id))
  }, [tenantId])

  const navigateTo = (tab: Tab) => { 
    if (isTemporarySlug && tab !== 'settings') return;
    setActiveTab(tab); 
    setSidebarOpen(false) 
  }
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
          const isDisabled = isTemporarySlug && item.id !== 'settings'
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              disabled={isDisabled}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left
                ${isActive
                  ? 'bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30'
                  : isDisabled
                    ? 'opacity-50 cursor-not-allowed text-[#4B5E82] border border-transparent'
                    : 'text-[#94A3C8] hover:text-[#EEF2FF] hover:bg-white/5 border border-transparent'
                }`}
            >
              {item.icon}
              {item.label}
            </button>
          )
        })}
      </div>

      {/* Footer com email real do usuário logado*/}
      <div className="px-5 py-4 border-t border-[rgba(59,130,246,0.12)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1D3A6E] flex items-center justify-center text-xs font-bold text-[#3B82F6]">
            {userEmail.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#EEF2FF] truncate">Admin</p>
            <p className="text-xs text-[#4B5E82] truncate">{userEmail}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#4B5E82] hover:bg-red-500/10 hover:text-red-400 transition-colors shrink-0"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
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
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} role="presentation" />
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
            <AgendaTab
              appointments={appointments}
              services={services}
              professionals={professionals}
              tenantWhatsapp={tenantWhatsapp}
              tenantName={tenantName}
              notifyWhatsapp={notifyWhatsapp}
              isLoading={isLoadingAgenda}
              onStatusChange={handleStatusChange}
            />
          )}
          {activeTab === 'calendar' && (
            <CalendarTab services={services} onStatusChange={handleStatusChange} />
          )}
          {activeTab === 'crm' && (
            <CrmTab />
          )}
          {activeTab === 'finance' && (
            <FinanceTab />
          )}
          {activeTab === 'services' && (
            <ServicesTab
              services={services}
              isLoading={isLoadingServices}
              onAdd={handleAddService}
              onEdit={handleEditService}
              onDelete={handleDeleteService}
            />
          )}
          {activeTab === 'team' && (
            <TeamTab
              professionals={professionals}
              services={services}
              isLoading={isLoadingPros}
              onAdd={handleAddPro}
              onEdit={handleEditPro}
              onDelete={handleDeletePro}
            />
          )}
          {activeTab === 'settings' && (
            <>
              {isTemporarySlug && (
                <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                    <Settings size={18} className="text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-500">Configuração Inicial Pendente</h3>
                    <p className="text-xs text-amber-500/80 mt-1">
                      Por favor, defina o nome do seu estabelecimento e crie um <b>Slug</b> (link de agendamento) válido para liberar o acesso ao painel.
                    </p>
                  </div>
                </div>
              )}
              <SettingsTab onSlugUpdated={() => setIsTemporarySlug(false)} />
            </>
          )}
        </main>
      </div>
    </div>
  )
}
