'use client'

import { useState, useEffect } from 'react'
import { fetchFinanceData } from '@/lib/karisbook-api'
import { useTenantId } from '@/lib/tenant-context'
import { DollarSign, Activity } from 'lucide-react'
import { formatPrice } from '@/lib/karis-data'

export default function FinanceTab() {
  const tenantId = useTenantId()
  const [data, setData] = useState<{ totalRevenue: number; totalDone: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return
    fetchFinanceData(tenantId)
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [tenantId])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-[#16203D] border border-[rgba(59,130,246,0.1)] animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Faturamento Bruto */}
        <div className="bg-[#16203D] rounded-xl p-6 border border-[rgba(59,130,246,0.1)] flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <DollarSign size={20} className="text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-[#94A3C8]">Faturamento Bruto Total</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#EEF2FF]">{formatPrice(data?.totalRevenue || 0)}</p>
            <p className="text-xs text-[#4B5E82] mt-1">Apenas serviços concluídos (status: done)</p>
          </div>
        </div>

        {/* Total de Serviços Concluídos */}
        <div className="bg-[#16203D] rounded-xl p-6 border border-[rgba(59,130,246,0.1)] flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Activity size={20} className="text-indigo-400" />
            </div>
            <p className="text-sm font-semibold text-[#94A3C8]">Serviços Concluídos</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#EEF2FF]">{data?.totalDone || 0}</p>
            <p className="text-xs text-[#4B5E82] mt-1">Soma de todos os agendamentos concluídos</p>
          </div>
        </div>

      </div>
    </div>
  )
}
