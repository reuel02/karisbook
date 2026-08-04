'use client'

import { useState, useEffect, Suspense } from 'react'
import { Smartphone, LayoutDashboard, Zap, AlertCircle } from 'lucide-react'

const InstagramIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
)

const FacebookIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)
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
  const [tenantName, setTenantName] = useState<string>('')
  const [brandColor, setBrandColor] = useState('#3B82F6')
  const [bgColor, setBgColor] = useState('#080D1A')
  const [themeMode, setThemeMode] = useState('dark')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [logoUrl, setLogoUrl] = useState('')

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
        // Step 1: validate tenant by slug (minimal query — never fails due to missing settings columns)
        const { data: tenant, error: tenantError } = await supabase
          .schema('karisbook')
          .from('tenants')
          .select('id, name')
          .eq('slug', tenantSlug)
          .single()

        if (tenant && !tenantError) {
          setTenantId(tenant.id)
          setTenantName(tenant.name || '')
          setIsTenantValid(true)

          // Step 2: load settings (gracefully handles missing columns with fallback)
          const { data: settings, error: settingsError } = await supabase
            .schema('karisbook')
            .from('tenant_settings')
            .select('brand_color, bg_color, theme_mode, instagram_url, facebook_url, logo_url')
            .eq('tenant_id', tenant.id)
            .single()

          if (settingsError) {
            // Some optional columns may not exist yet — retry with only the guaranteed base columns
            console.warn('Settings full query failed, retrying with base columns:', settingsError.message)
            const { data: baseSettings } = await supabase
              .schema('karisbook')
              .from('tenant_settings')
              .select('brand_color, bg_color, theme_mode')
              .eq('tenant_id', tenant.id)
              .single()

            if (baseSettings) {
              if (baseSettings.brand_color) setBrandColor(baseSettings.brand_color)
              if (baseSettings.bg_color) setBgColor(baseSettings.bg_color)
              if (baseSettings.theme_mode) setThemeMode(baseSettings.theme_mode)
            }
          } else if (settings) {
            if (settings.brand_color) setBrandColor(settings.brand_color)
            if (settings.bg_color) setBgColor(settings.bg_color)
            if (settings.theme_mode) setThemeMode(settings.theme_mode)
            if (settings.instagram_url) setInstagramUrl(settings.instagram_url)
            if (settings.facebook_url) setFacebookUrl(settings.facebook_url)
            if (settings.logo_url) setLogoUrl(settings.logo_url)
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
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={tenantName || 'Logo'}
                  className="h-8 w-auto max-w-[160px] object-contain object-left"
                />
              ) : (
                <>
                  <div className="w-7 h-7 rounded-lg bg-[var(--brand-color)] flex items-center justify-center">
                    <Zap size={14} className="text-white" fill="white" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-[var(--text-main)] leading-none">{tenantName || 'Karis Tech'}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Agenda</p>
                  </div>
                </>
              )}
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
          <div className="w-full max-w-[430px] flex-1 flex flex-col pb-8">
            <ClientView />
            
            {/* Footer with Socials */}
            <div className="mt-12 flex flex-col items-center gap-6">
              <p className="text-sm font-semibold text-[var(--text-muted)]">Siga-nos nas redes sociais</p>
              <div className="flex gap-4">
                {instagramUrl && (
                  <a href={instagramUrl} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] transition-colors">
                    <InstagramIcon size={20} />
                  </a>
                )}
                {facebookUrl && (
                  <a href={facebookUrl} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] transition-colors">
                    <FacebookIcon size={20} />
                  </a>
                )}
                {!instagramUrl && !facebookUrl && (
                  <p className="text-xs text-[var(--text-muted)] italic">Nenhuma rede social vinculada</p>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-4">
                Desenvolvido por <a href="https://instagram.com/karis.tech" target="_blank" rel="noreferrer" className="font-bold text-red-500 hover:underline">Karis Tech</a>
              </p>
            </div>
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
