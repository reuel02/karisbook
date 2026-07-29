'use client'

import { useState, useEffect, Suspense } from 'react'
import { Smartphone, LayoutDashboard, Zap, AlertCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ClientView from '@/components/karis/client/ClientView'
import { TenantProvider } from '@/lib/tenant-context'

function AgendaContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isTenantValid, setIsTenantValid] = useState(false)
  const [isCheckingTenant, setIsCheckingTenant] = useState(true)
  const [tenantId, setTenantId] = useState<string>('')
  const [brandColor, setBrandColor] = useState('#3B82F6')
  const [bgColor, setBgColor] = useState('#080D1A')
  const [themeMode, setThemeMode] = useState('dark')

  // Helpers de cor
  const getBrightness = (hex: string) => {
    const rgb = parseInt(hex.replace('#', ''), 16)
    const r = (rgb >> 16) & 0xff
    const g = (rgb >> 8) & 0xff
    const b = (rgb >> 0) & 0xff
    return (r * 299 + g * 587 + b * 114) / 1000
  }
  
  const isLight = getBrightness(bgColor) > 155
  
  const customStyles = {
    '--brand-color': brandColor,
    '--bg-base': bgColor,
    '--bg-card': isLight ? `color-mix(in srgb, ${bgColor} 90%, black)` : `color-mix(in srgb, ${bgColor} 90%, white)`,
    '--bg-card-hover': isLight ? `color-mix(in srgb, ${bgColor} 80%, black)` : `color-mix(in srgb, ${bgColor} 80%, white)`,
    '--text-main': isLight ? '#111827' : '#EEF2FF',
    '--text-muted': isLight ? '#4B5563' : '#94A3C8',
    '--border-color': isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
    '--border-color-hover': isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
  } as React.CSSProperties


  useEffect(() => {
    const init = async () => {
      // Check session
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setIsAdmin(true)

      // Check tenant from URL
      const tenantSlug = searchParams.get('tenant')
      if (tenantSlug) {
        const { data, error } = await supabase
          .schema('karisbook')
          .from('tenants')
          .select('id, tenant_settings(brand_color, bg_color, theme_mode)')
          .eq('slug', tenantSlug)
          .single()

        if (data && !error) {
          setTenantId(data.id)
          setIsTenantValid(true)
          
          const settings = data.tenant_settings?.[0] || data.tenant_settings
          if (settings) {
            if (settings.brand_color) setBrandColor(settings.brand_color)
            if (settings.bg_color) setBgColor(settings.bg_color)
            if (settings.theme_mode) setThemeMode(settings.theme_mode)
          }
        }
      }
      setIsCheckingTenant(false)
    }
    init()
  }, [searchParams])

  if (isCheckingTenant) {
    return (
      <div className="min-h-screen bg-[#080D1A] flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[color-mix(in_srgb,var(--brand-color)_20%,transparent)] flex items-center justify-center animate-pulse">
          <Zap size={24} className="text-[var(--brand-color)]" fill="currentColor" />
        </div>
      </div>
    )
  }

  if (!isTenantValid) {
    return (
      <div className="min-h-screen bg-[#080D1A] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-[#EEF2FF] mb-2">Estabelecimento não encontrado</h1>
        <p className="text-sm text-[#94A3C8] max-w-sm">
          Verifique se o link de agendamento (URL) está correto ou se a barbearia ainda está ativa.
        </p>
      </div>
    )
  }

  return (
    <TenantProvider id={tenantId}>
      <div 
        className="min-h-screen bg-[var(--bg-base)] text-[var(--text-main)] flex flex-col"
        style={customStyles}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-50 w-full bg-[var(--bg-card)]/95 backdrop-blur-md border-b border-[var(--border-color)]">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
            {/* Brand */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-[var(--brand-color)] flex items-center justify-center">
                <Zap size={14} className="text-white" fill="white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-[var(--text-main)] leading-none">Karis Tech</p>
                <p className="text-[10px] text-[var(--text-muted)]">Agenda</p>
              </div>
            </div>

            {/* Admin Access Button (Ghost Button logic) */}
            {isAdmin && (
              <div className="flex items-center gap-1 bg-[var(--bg-base)] rounded-xl p-1 border border-[var(--border-color)]">
                <button
                  onClick={() => router.push('/admin')}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]"
                >
                  <LayoutDashboard size={14} />
                  <span className="hidden sm:inline">Acessar Painel</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* View container (Client Only) */}
        <div className="flex-1 flex flex-col items-center">
          {/* Mobile frame hint on desktop */}
          <div className="hidden md:flex items-center justify-center py-4 w-full">
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
              <Smartphone size={12} />
              Visão mobile do cliente — experimente redimensionar para celular
            </p>
          </div>
          <div className="w-full max-w-[430px] flex-1 flex flex-col">
            <ClientView />
          </div>
        </div>
      </div>
    </TenantProvider>
  )
}

export default function KarisTechAgendaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#3B82F6]/20 flex items-center justify-center animate-pulse">
          <Zap size={24} className="text-[#3B82F6]" fill="currentColor" />
        </div>
      </div>
    }>
      <AgendaContent />
    </Suspense>
  )
}
