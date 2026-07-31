'use client'

import { useState, useEffect } from 'react'
import { fetchCrmData } from '@/lib/karisbook-api'
import { useTenantId } from '@/lib/tenant-context'
import { Phone, Calendar as CalendarIcon, User as UserIcon, X } from 'lucide-react'
import { formatDate } from '@/lib/karis-data'

export default function CrmTab() {
  const tenantId = useTenantId()
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState<any | null>(null)

  useEffect(() => {
    if (!tenantId) return
    fetchCrmData(tenantId)
      .then(setClients)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [tenantId])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-[#16203D] border border-[rgba(59,130,246,0.1)] animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="bg-[#16203D] rounded-xl p-4 border border-[rgba(59,130,246,0.1)]">
          <p className="text-2xl font-bold text-[#EEF2FF]">{clients.length}</p>
          <p className="text-xs text-[#94A3C8] mt-0.5">Total de Clientes</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {clients.length === 0 && (
          <div className="rounded-xl bg-[#16203D] border border-[rgba(59,130,246,0.1)] p-8 text-center">
            <p className="text-[#4B5E82] text-sm">Nenhum cliente registrado</p>
          </div>
        )}
        
        {clients.map((client) => (
          <button
            key={client.client_whatsapp}
            onClick={() => setSelectedClient(client)}
            className="group bg-[#16203D] hover:bg-[#1C2A50] rounded-xl border border-[rgba(59,130,246,0.1)] hover:border-[rgba(59,130,246,0.25)] p-4 flex items-center justify-between text-left transition-all duration-150"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#EEF2FF] truncate flex items-center gap-2">
                <UserIcon size={14} className="text-[#3B82F6]" />
                {client.client_name}
              </p>
              <div className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1 text-xs text-[#94A3C8]">
                  <Phone size={12} /> {client.client_whatsapp}
                </span>
                <span className="flex items-center gap-1 text-xs text-[#94A3C8]">
                  <CalendarIcon size={12} /> Última: {formatDate(client.last_visit)}
                </span>
              </div>
            </div>
            
            <div className="shrink-0 text-right">
              <p className="text-lg font-bold text-[#3B82F6]">{client.total_visits}</p>
              <p className="text-[10px] text-[#4B5E82] uppercase tracking-wider font-semibold">Visitas</p>
            </div>
          </button>
        ))}
      </div>

      {/* Modal de Detalhes do Cliente */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedClient(null)} />
          <div className="relative bg-[#0C1226] border border-[rgba(59,130,246,0.18)] rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col">
            <button 
              onClick={() => setSelectedClient(null)}
              className="absolute top-4 right-4 text-[#4B5E82] hover:text-[#EEF2FF] transition-colors"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold text-[#EEF2FF] mb-6 flex items-center gap-2">
              <UserIcon className="text-[#3B82F6]" />
              Detalhes do Cliente
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[#4B5E82] font-semibold uppercase tracking-wider mb-1">Nome</p>
                <p className="text-sm text-[#EEF2FF] bg-[#16203D] p-3 rounded-xl border border-[rgba(59,130,246,0.1)]">{selectedClient.client_name}</p>
              </div>
              <div>
                <p className="text-xs text-[#4B5E82] font-semibold uppercase tracking-wider mb-1">WhatsApp</p>
                <p className="text-sm text-[#EEF2FF] bg-[#16203D] p-3 rounded-xl border border-[rgba(59,130,246,0.1)] flex items-center gap-2">
                  <Phone size={14} className="text-[#94A3C8]"/> {selectedClient.client_whatsapp}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#4B5E82] font-semibold uppercase tracking-wider mb-1">Total Visitas</p>
                  <p className="text-sm text-[#3B82F6] font-bold bg-[#16203D] p-3 rounded-xl border border-[rgba(59,130,246,0.1)]">{selectedClient.total_visits}</p>
                </div>
                <div>
                  <p className="text-xs text-[#4B5E82] font-semibold uppercase tracking-wider mb-1">Última Visita</p>
                  <p className="text-sm text-[#EEF2FF] bg-[#16203D] p-3 rounded-xl border border-[rgba(59,130,246,0.1)]">{formatDate(selectedClient.last_visit)}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setSelectedClient(null)}
                className="px-5 py-2 bg-[#16203D] text-[#EEF2FF] hover:bg-[#1C2A50] rounded-xl text-sm font-semibold transition-colors border border-[rgba(59,130,246,0.1)]"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
