'use client'

import { useState, useEffect } from 'react'
import { Store, Phone, Clock, Bell, Copy, Palette, ImagePlus, X } from 'lucide-react'
import {
  fetchTenant, saveTenantInfo,
  fetchBusinessHours, saveBusinessHours,
  fetchTenantSettings, saveTenantSettings,
  checkSlugAvailability, uploadTenantLogo
} from '@/lib/karisbook-api'
import { useTenantId } from '@/lib/tenant-context'
import { BusinessHour, TenantSettings } from '@/lib/karisbook-types'
import { useToast } from '@/components/ui/Toast'

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

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export default function SettingsTab({ onSlugUpdated }: { onSlugUpdated?: () => void }) {
  const toast = useToast()
  const tenantId = useTenantId()
  const inputClass = `w-full px-3.5 py-2.5 rounded-xl bg-[#16203D] border border-[rgba(59,130,246,0.14)] text-[#EEF2FF] text-sm placeholder:text-[#4B5E82] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all duration-200`

  // ── Local state ───────────────────────────────────────────────────────────
  const [tenantName, setTenantName] = useState('Barbearia Karis Tech')
  const [tenantSlug, setTenantSlug] = useState('')
  const [tenantAddress, setTenantAddress] = useState('')
  const [tenantWhatsapp, setTenantWhatsapp] = useState('')
  const [isSlugAvailable, setIsSlugAvailable] = useState(true)
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)
  const [hours, setHours] = useState<BusinessHour[]>([])
  const [settings, setSettings] = useState<TenantSettings>({
    tenant_id: '',
    notify_new_booking_whatsapp: true,
    notify_reminder_24h: true,
    notify_auto_cancel_confirm: false,
    brand_color: '#3B82F6',
    bg_color: '#080D1A',
    theme_mode: 'dark',
    logo_url: '',
    instagram_url: '',
    facebook_url: '',
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // ── Load data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!tenantId) return

    Promise.all([
      fetchTenant(tenantId),
      fetchBusinessHours(tenantId),
      fetchTenantSettings(tenantId),
    ]).then(([tenant, bh, stg]) => {
      if (tenant) {
        setTenantName(tenant.name ?? '')
        setTenantSlug(tenant.slug ?? '')
        setTenantAddress(tenant.address ?? '')
        setTenantWhatsapp(tenant.whatsapp ?? '')
      }
      if (bh.length > 0) {
        setHours(bh)
      } else {
        // Default hours if not yet seeded
        setHours(
          Array.from({ length: 7 }, (_, i) => ({
            tenant_id: '',
            day_of_week: i,
            open_time: '08:00',
            close_time: '18:00',
            is_open: i !== 0, // closed on Sunday
          }))
        )
      }
      if (stg) setSettings(stg)
    }).catch(console.error)
      .finally(() => setIsLoading(false))
  }, [tenantId])

  const updateHour = (idx: number, field: keyof BusinessHour, value: string | boolean) => {
    setHours((prev) => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h))
  }

  const toggleSetting = (key: keyof Omit<TenantSettings, 'id' | 'tenant_id'>) => {
    setSettings((prev) => {
      const val = prev[key]
      if (typeof val === 'boolean') {
        return { ...prev, [key]: !val }
      }
      return prev
    })
  }

  const updateSetting = (key: keyof TenantSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  // ── Save all ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Upload logo first if a new file was selected
      let currentLogoUrl = settings.logo_url || ''
      if (logoFile) {
        currentLogoUrl = await uploadTenantLogo(tenantId, logoFile)
        setLogoFile(null)
      }

      await Promise.all([
        saveTenantInfo(tenantId, { name: tenantName, address: tenantAddress, whatsapp: tenantWhatsapp, slug: tenantSlug }),
        saveBusinessHours(tenantId, hours),
        saveTenantSettings(tenantId, {
          notify_new_booking_whatsapp: settings.notify_new_booking_whatsapp,
          notify_reminder_24h: settings.notify_reminder_24h,
          notify_auto_cancel_confirm: settings.notify_auto_cancel_confirm,
          brand_color: settings.brand_color,
          bg_color: settings.bg_color,
          theme_mode: settings.theme_mode,
          logo_url: currentLogoUrl,
          instagram_url: settings.instagram_url,
          facebook_url: settings.facebook_url,
        }),
      ])
      updateSetting('logo_url', currentLogoUrl)
      toast.success('Configurações salvas com sucesso!')
      if (tenantSlug && !tenantSlug.includes('temporario')) {
        onSlugUpdated?.()
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar configurações.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTenantName(val)
    const generated = val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    setTenantSlug(generated)
  }

  useEffect(() => {
    // Skip checks if empty or temporary
    if (!tenantSlug || tenantSlug.includes('temporario')) {
      setIsSlugAvailable(true)
      return
    }
    const timer = setTimeout(async () => {
      setIsCheckingSlug(true)
      try {
        const available = await checkSlugAvailability(tenantSlug, tenantId)
        setIsSlugAvailable(available)
        if (!available) toast.error('Este slug já está em uso por outro estabelecimento.')
      } catch (e) {
        console.error(e)
      } finally {
        setIsCheckingSlug(false)
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [tenantSlug, tenantId])

  const copyLink = () => {
    const link = `${window.location.origin}/?tenant=${tenantSlug}`
    navigator.clipboard.writeText(link)
    toast.success('Link copiado para a área de transferência!')
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 max-w-xl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-[#16203D] border border-[rgba(59,130,246,0.1)] animate-pulse" />
        ))}
      </div>
    )
  }

  const notifItems: { label: string; key: keyof Omit<TenantSettings, 'id' | 'tenant_id'> }[] = [
    { label: 'Novos agendamentos via WhatsApp', key: 'notify_new_booking_whatsapp' },
    { label: 'Lembrete 24h antes para o cliente', key: 'notify_reminder_24h' },
    { label: 'Confirmação automática de cancelamento', key: 'notify_auto_cancel_confirm' },
  ]

  return (
    <div className="flex flex-col gap-8 max-w-xl">
      <div>
        <h2 className="text-lg font-bold text-[#EEF2FF]">Configurações</h2>
        <p className="text-sm text-[#94A3C8]">Gerencie as informações do seu estabelecimento</p>
      </div>

      {/* Business info */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[rgba(59,130,246,0.1)]">
          <Store size={16} className="text-[#3B82F6]" />
          <h3 className="text-sm font-semibold text-[#EEF2FF]">Informações do Estabelecimento</h3>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#94A3C8] uppercase tracking-wider">Nome do estabelecimento</label>
            <input value={tenantName} onChange={handleNameChange} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#94A3C8] uppercase tracking-wider">Slug (Link de Agendamento)</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input 
                  value={tenantSlug}
                  readOnly 
                  className={`${inputClass} pr-10 opacity-60 cursor-not-allowed ${!isSlugAvailable ? 'border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]' : ''}`}
                  placeholder="ex: minha-barbearia"
                />
                {isCheckingSlug && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#3B82F6]/30 border-t-[#3B82F6] rounded-full animate-spin" />
                )}
              </div>
              <button
                onClick={copyLink}
                disabled={!tenantSlug || tenantSlug.includes('temporario') || !isSlugAvailable}
                className="px-3 rounded-xl bg-[#1D3A6E] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Copiar Link"
              >
                <Copy size={16} />
              </button>
            </div>
            {!isSlugAvailable && <p className="text-xs text-red-500">Este slug não está disponível.</p>}
            <p className="text-xs text-[#4B5E82]">Seu link será: {typeof window !== 'undefined' ? window.location.origin : 'https://dominio.com'}/?tenant={tenantSlug || 'seu-slug'}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#94A3C8] uppercase tracking-wider">Endereço</label>
            <input value={tenantAddress} onChange={(e) => setTenantAddress(e.target.value)} className={inputClass} />
          </div>
        </div>
      </section>

      {/* Contact & Socials */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[rgba(59,130,246,0.1)]">
          <Phone size={16} className="text-[#3B82F6]" />
          <h3 className="text-sm font-semibold text-[#EEF2FF]">Contato & Redes Sociais</h3>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#94A3C8] uppercase tracking-wider">Número do WhatsApp (com DDI)</label>
            <input value={tenantWhatsapp} onChange={(e) => setTenantWhatsapp(e.target.value)} className={inputClass} />
            <p className="text-xs text-[#4B5E82]">Usado para receber confirmações dos clientes</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#94A3C8] uppercase tracking-wider flex items-center gap-1.5">
                <InstagramIcon size={14}/> Instagram URL
              </label>
              <input 
                value={settings.instagram_url || ''} 
                onChange={(e) => updateSetting('instagram_url', e.target.value)} 
                className={inputClass} 
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#94A3C8] uppercase tracking-wider flex items-center gap-1.5">
                <FacebookIcon size={14}/> Facebook URL
              </label>
              <input 
                value={settings.facebook_url || ''} 
                onChange={(e) => updateSetting('facebook_url', e.target.value)} 
                className={inputClass} 
                placeholder="https://facebook.com/..."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Hours */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[rgba(59,130,246,0.1)]">
          <Clock size={16} className="text-[#3B82F6]" />
          <h3 className="text-sm font-semibold text-[#EEF2FF]">Horário de Funcionamento</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {hours.map((h, idx) => (
            <div key={h.day_of_week} className="bg-[#16203D] rounded-xl border border-[rgba(59,130,246,0.1)] p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-[#94A3C8]">{DAY_NAMES[h.day_of_week]}</p>
                <button
                  onClick={() => updateHour(idx, 'is_open', !h.is_open)}
                  className={`w-8 h-4.5 rounded-full cursor-pointer transition-colors relative flex items-center ${h.is_open ? 'bg-[#3B82F6]' : 'bg-[#16203D] border border-[rgba(59,130,246,0.2)]'}`}
                  style={{ height: '22px', width: '38px' }}
                  aria-label={h.is_open ? 'Fechar' : 'Abrir'}
                >
                  <div className={`absolute top-1 w-3.5 h-3.5 rounded-full bg-white transition-transform ${h.is_open ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
              {h.is_open && (
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={h.open_time}
                    onChange={(e) => updateHour(idx, 'open_time', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-[#111830] border border-[rgba(59,130,246,0.1)] text-xs text-[#EEF2FF] focus:outline-none focus:border-[#3B82F6] transition-colors"
                  />
                  <input
                    type="time"
                    value={h.close_time}
                    onChange={(e) => updateHour(idx, 'close_time', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-[#111830] border border-[rgba(59,130,246,0.1)] text-xs text-[#EEF2FF] focus:outline-none focus:border-[#3B82F6] transition-colors"
                  />
                </div>
              )}
              {!h.is_open && <p className="text-xs text-[#4B5E82]">Fechado</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[rgba(59,130,246,0.1)]">
          <Bell size={16} className="text-[#3B82F6]" />
          <h3 className="text-sm font-semibold text-[#EEF2FF]">Notificações</h3>
        </div>
        {notifItems.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-4">
            <p className="text-sm text-[#94A3C8]">{item.label}</p>
            <button
              onClick={() => toggleSetting(item.key)}
              className={`w-10 h-6 rounded-full cursor-pointer transition-colors relative ${settings[item.key] ? 'bg-[#3B82F6]' : 'bg-[#16203D] border border-[rgba(59,130,246,0.2)]'}`}
              aria-label={item.label}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings[item.key] ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
      </section>

      {/* Aparência da Marca (White-label) */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[rgba(59,130,246,0.1)]">
          <Palette size={16} className="text-[#3B82F6]" />
          <h3 className="text-sm font-semibold text-[#EEF2FF]">Aparência da Marca</h3>
        </div>
        <div className="flex flex-col gap-4">

          {/* Logo Upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#94A3C8] uppercase tracking-wider">Logotipo</label>
            <div className="flex items-start gap-4">
              {/* Preview */}
              {(logoFile || settings.logo_url) ? (
                <div className="relative shrink-0 group">
                  <img
                    src={logoFile ? URL.createObjectURL(logoFile) : settings.logo_url!}
                    alt="Logo"
                    className="w-20 h-20 object-contain rounded-xl border border-[rgba(59,130,246,0.2)] bg-[#111830] p-1"
                  />
                  <button
                    type="button"
                    onClick={() => { setLogoFile(null); updateSetting('logo_url', '') }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remover logo"
                  >
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-[rgba(59,130,246,0.2)] flex items-center justify-center bg-[#111830] shrink-0">
                  <ImagePlus size={24} className="text-[#4B5E82]" />
                </div>
              )}
              {/* Input */}
              <div className="flex-1">
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.svg,.webp"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-[#4B5E82] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#1D3A6E] file:text-[#3B82F6] hover:file:bg-[#3B82F6] hover:file:text-white transition-all cursor-pointer"
                />
                <p className="text-xs text-[#4B5E82] mt-2">PNG, JPG, SVG ou WebP até 2MB. Exibido na página pública de agendamento.</p>
                <p className="text-xs text-[#3B82F6] mt-1">⚠️ Recomendado: PNG com fundo transparente, sem margens.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#94A3C8] uppercase tracking-wider">Cor Principal</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={settings.brand_color || '#3B82F6'}
                onChange={(e) => updateSetting('brand_color', e.target.value)}
                className="w-12 h-10 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
              <input 
                type="text" 
                value={settings.brand_color || '#3B82F6'}
                onChange={(e) => updateSetting('brand_color', e.target.value)}
                className={inputClass}
                placeholder="#3B82F6"
              />
            </div>
            {settings.brand_color && !/^#([0-9A-Fa-f]{3}){1,2}$/.test(settings.brand_color) && (
              <p className="text-xs text-red-400">Cor hexadecimal inválida (ex: #3B82F6).</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#94A3C8] uppercase tracking-wider">Cor de Fundo Base</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={settings.bg_color || '#080D1A'}
                onChange={(e) => updateSetting('bg_color', e.target.value)}
                className="w-12 h-10 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
              <input 
                type="text" 
                value={settings.bg_color || '#080D1A'}
                onChange={(e) => updateSetting('bg_color', e.target.value)}
                className={inputClass}
                placeholder="#080D1A"
              />
            </div>
            {settings.bg_color && !/^#([0-9A-Fa-f]{3}){1,2}$/.test(settings.bg_color) && (
              <p className="text-xs text-red-400">Cor hexadecimal inválida (ex: #080D1A).</p>
            )}
          </div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-[#94A3C8]">Modo do Tema</p>
            <select
              value={settings.theme_mode || 'dark'}
              onChange={(e) => updateSetting('theme_mode', e.target.value)}
              className="bg-[#16203D] border border-[rgba(59,130,246,0.14)] text-[#EEF2FF] text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#3B82F6]"
            >
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
            </select>
          </div>
        </div>
      </section>

      <button
        onClick={handleSave}
        disabled={isSaving || !isSlugAvailable || !tenantSlug || tenantSlug.includes('temporario') || (!!settings.brand_color && !/^#([0-9A-Fa-f]{3}){1,2}$/.test(settings.brand_color)) || (!!settings.bg_color && !/^#([0-9A-Fa-f]{3}){1,2}$/.test(settings.bg_color))}
        className="w-full py-3 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors shadow-[0_2px_12px_rgba(59,130,246,0.3)]"
      >
        {isSaving ? 'Salvando…' : 'Salvar configurações'}
      </button>
    </div>
  )
}
