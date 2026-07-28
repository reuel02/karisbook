'use client'

import { Store, Phone, Clock, Globe, Bell, Lock } from 'lucide-react'

export default function SettingsTab() {
  const inputClass = `w-full px-3.5 py-2.5 rounded-xl bg-[#16203D] border border-[rgba(59,130,246,0.14)] text-[#EEF2FF] text-sm placeholder:text-[#4B5E82] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all duration-200`

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
            <input defaultValue="Barbearia Karis Tech" className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#94A3C8] uppercase tracking-wider">Endereço</label>
            <input defaultValue="Av. Paulista, 1000 — São Paulo, SP" className={inputClass} />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[rgba(59,130,246,0.1)]">
          <Phone size={16} className="text-[#3B82F6]" />
          <h3 className="text-sm font-semibold text-[#EEF2FF]">Contato & WhatsApp</h3>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#94A3C8] uppercase tracking-wider">Número do WhatsApp (com DDI)</label>
            <input defaultValue="+5511999990000" className={inputClass} />
            <p className="text-xs text-[#4B5E82]">Usado para receber confirmações dos clientes</p>
          </div>
        </div>
      </section>

      {/* Hours */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[rgba(59,130,246,0.1)]">
          <Clock size={16} className="text-[#3B82F6]" />
          <h3 className="text-sm font-semibold text-[#EEF2FF]">Horário de Funcionamento</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { day: 'Segunda', open: '08:00', close: '18:00' },
            { day: 'Terça', open: '08:00', close: '18:00' },
            { day: 'Quarta', open: '08:00', close: '18:00' },
            { day: 'Quinta', open: '08:00', close: '18:00' },
            { day: 'Sexta', open: '08:00', close: '19:00' },
            { day: 'Sábado', open: '09:00', close: '17:00' },
          ].map((h) => (
            <div key={h.day} className="bg-[#16203D] rounded-xl border border-[rgba(59,130,246,0.1)] p-3">
              <p className="text-xs font-semibold text-[#94A3C8] mb-2">{h.day}</p>
              <div className="flex gap-2">
                <input defaultValue={h.open} className="w-full px-2 py-1.5 rounded-lg bg-[#111830] border border-[rgba(59,130,246,0.1)] text-xs text-[#EEF2FF] focus:outline-none focus:border-[#3B82F6] transition-colors" />
                <input defaultValue={h.close} className="w-full px-2 py-1.5 rounded-lg bg-[#111830] border border-[rgba(59,130,246,0.1)] text-xs text-[#EEF2FF] focus:outline-none focus:border-[#3B82F6] transition-colors" />
              </div>
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
        {[
          { label: 'Novos agendamentos via WhatsApp', enabled: true },
          { label: 'Lembrete 24h antes para o cliente', enabled: true },
          { label: 'Confirmação automática de cancelamento', enabled: false },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4">
            <p className="text-sm text-[#94A3C8]">{item.label}</p>
            <div
              className={`w-10 h-6 rounded-full cursor-pointer transition-colors relative ${item.enabled ? 'bg-[#3B82F6]' : 'bg-[#16203D] border border-[rgba(59,130,246,0.2)]'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${item.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
          </div>
        ))}
      </section>

      <button className="w-full py-3 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-sm transition-colors shadow-[0_2px_12px_rgba(59,130,246,0.3)]">
        Salvar configurações
      </button>
    </div>
  )
}
