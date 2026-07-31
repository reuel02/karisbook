'use client'

import { useState, useEffect } from 'react'
import { fetchFinanceData } from '@/lib/karisbook-api'
import { useTenantId } from '@/lib/tenant-context'
import { DollarSign, Activity } from 'lucide-react'
import { formatPrice } from '@/lib/karis-data'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay, format } from 'date-fns'

export default function FinanceTab() {
  const tenantId = useTenantId()
  const [filter, setFilter] = useState<'day' | 'week' | 'month'>('month')
  const [data, setData] = useState<{ totalRevenue: number; totalDone: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return
    setIsLoading(true)

    const now = new Date()
    let start, end;
    if (filter === 'day') {
      start = format(startOfDay(now), 'yyyy-MM-dd')
      end = format(endOfDay(now), 'yyyy-MM-dd')
    } else if (filter === 'week') {
      start = format(startOfWeek(now), 'yyyy-MM-dd')
      end = format(endOfWeek(now), 'yyyy-MM-dd')
    } else {
      start = format(startOfMonth(now), 'yyyy-MM-dd')
      end = format(endOfMonth(now), 'yyyy-MM-dd')
    }

    fetchFinanceData(tenantId, start, end)
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [tenantId, filter])

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
      
      <div className="flex items-center gap-2 mb-2 bg-[#16203D] p-1.5 rounded-xl border border-[rgba(59,130,246,0.1)] self-start">
        <button 
          onClick={() => setFilter('day')} 
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === 'day' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3C8] hover:text-[#EEF2FF]'}`}
        >
          Hoje
        </button>
        <button 
          onClick={() => setFilter('week')} 
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === 'week' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3C8] hover:text-[#EEF2FF]'}`}
        >
          Esta Semana
        </button>
        <button 
          onClick={() => setFilter('month')} 
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === 'month' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3C8] hover:text-[#EEF2FF]'}`}
        >
          Este Mês
        </button>
      </div>

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
