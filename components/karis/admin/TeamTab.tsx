'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Professional, Service } from '@/lib/karis-data'
import SlideOver from './SlideOver'
import { useToast } from '@/components/ui/Toast'

type Props = {
  professionals: Professional[]
  services: Service[]
  isLoading: boolean
  onAdd: (p: Omit<Professional, 'id' | 'tenant_id' | 'is_active' | 'created_at'>, serviceIds: string[]) => Promise<void>
  onEdit: (p: Professional, serviceIds: string[]) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const AVATAR_COLORS = [
  '#1D3A6E', '#1A3D2B', '#3D1A1A', '#2A1D6E', '#3D2B1A',
  '#1D3D3A', '#3A1D3D',
]

type FormState = {
  name: string
  role: string
  initials: string
  color: string
  serviceIds: string[]
}

const EMPTY_FORM: FormState = {
  name: '', role: '', initials: '', color: AVATAR_COLORS[0], serviceIds: [],
}

export default function TeamTab({ professionals, services, isLoading, onAdd, onEdit, onDelete }: Props) {
  const toast = useToast()
  const [slideOpen, setSlideOpen] = useState(false)
  const [editing, setEditing] = useState<Professional | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setSlideOpen(true) }
  const openEdit = (p: Professional) => {
    setEditing(p)
    setForm({ name: p.name, role: p.role, initials: p.initials, color: p.color, serviceIds: [...p.services] })
    setSlideOpen(true)
  }
  const handleClose = () => setSlideOpen(false)

  const handleSave = async () => {
    if (!form.name.trim()) return
    setIsSubmitting(true)
    try {
      if (editing) await onEdit({ ...editing, ...form, avatar_color: form.color }, form.serviceIds)
      else await onAdd({ name: form.name, role: form.role, initials: form.initials, color: form.color, avatar_color: form.color, services: form.serviceIds }, form.serviceIds)
      toast.success(editing ? 'Profissional atualizado!' : 'Profissional adicionado!')
      handleClose()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar profissional.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id)
      toast.success('Profissional removido.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao remover profissional.')
    }
  }

  const toggleService = (id: string) => {
    setForm((f) => ({
      ...f,
      serviceIds: f.serviceIds.includes(id)
        ? f.serviceIds.filter((s) => s !== id)
        : [...f.serviceIds, id],
    }))
  }

  const inputClass = `w-full px-3.5 py-2.5 rounded-xl bg-[#16203D] border border-[rgba(59,130,246,0.14)] text-[#EEF2FF] text-sm placeholder:text-[#4B5E82] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all duration-200`
  const field = (label: string, content: React.ReactNode) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-[#94A3C8] uppercase tracking-wider">{label}</label>
      {content}
    </div>
  )

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#EEF2FF]">Equipe</h2>
          <p className="text-sm text-[#94A3C8]">{professionals.length} profissionais ativos</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold transition-colors shadow-[0_2px_12px_rgba(59,130,246,0.3)]"
        >
          <Plus size={16} />Novo membro
        </button>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-[#16203D] border border-[rgba(59,130,246,0.1)] animate-pulse" />
          ))
        ) : (
          professionals.map((pro) => {
            const proServices = services.filter((s) => pro.services.includes(s.id))
            return (
              <div
                key={pro.id}
                className="bg-[#16203D] rounded-2xl border border-[rgba(59,130,246,0.1)] p-5 flex flex-col gap-4 hover:border-[rgba(59,130,246,0.25)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0"
                    style={{ backgroundColor: pro.color }}
                  >
                    {pro.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#EEF2FF] text-sm truncate">{pro.name}</p>
                    <p className="text-xs text-[#94A3C8] mt-0.5">{pro.role}</p>
                  </div>
                </div>

                {proServices.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {proServices.map((s) => (
                      <span key={s.id} className="text-[11px] px-2 py-0.5 rounded-lg bg-[#3B82F6]/10 text-[#94A3C8] border border-[rgba(59,130,246,0.15)]">
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-auto pt-2 border-t border-[rgba(59,130,246,0.08)]">
                  <button
                    onClick={() => openEdit(pro)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-[#94A3C8] hover:text-[#3B82F6] hover:bg-[#3B82F6]/10 transition-colors border border-[rgba(59,130,246,0.1)] hover:border-[rgba(59,130,246,0.25)]"
                  >
                    <Pencil size={12} /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(pro.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-[#94A3C8] hover:text-red-400 hover:bg-red-400/10 transition-colors border border-[rgba(59,130,246,0.1)] hover:border-red-500/25"
                  >
                    <Trash2 size={12} /> Remover
                  </button>
                </div>
              </div>
            )
          })
        )}
        {!isLoading && professionals.length === 0 && (
          <div className="col-span-full p-8 text-center text-[#4B5E82] text-sm bg-[#16203D] rounded-2xl border border-[rgba(59,130,246,0.1)]">
            Nenhum profissional cadastrado
          </div>
        )}
      </div>

      {/* SlideOver form */}
      <SlideOver
        open={slideOpen}
        title={editing ? 'Editar Membro' : 'Novo Membro'}
        subtitle={editing ? `Editando "${editing.name}"` : 'Adicione um novo profissional à equipe'}
        onClose={handleClose}
        footer={
          <div className="flex gap-3">
            <button onClick={handleClose} disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl border border-[rgba(59,130,246,0.2)] text-[#94A3C8] hover:text-[#EEF2FF] text-sm font-medium transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-60 text-white text-sm font-semibold transition-colors">
              {isSubmitting ? 'Salvando…' : editing ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          {field('Nome completo', <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome do profissional" className={inputClass} />)}
          {field('Cargo / Função', <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Ex: Barbeiro Sênior" className={inputClass} />)}
          <div className="grid grid-cols-2 gap-4">
            {field('Iniciais', <input value={form.initials} maxLength={2} onChange={(e) => setForm({ ...form, initials: e.target.value.toUpperCase() })} placeholder="AB" className={inputClass} />)}
            {field('Cor do avatar', (
              <div className="flex flex-wrap gap-2 pt-1">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    className={`w-8 h-8 rounded-lg transition-all ${form.color === c ? 'ring-2 ring-[#3B82F6] ring-offset-2 ring-offset-[#0C1226]' : ''}`}
                    style={{ backgroundColor: c }}
                    aria-label={`Cor ${c}`}
                  />
                ))}
              </div>
            ))}
          </div>
          {field('Serviços atendidos', (
            <div className="flex flex-col gap-2 mt-1">
              {services.map((s) => (
                <label key={s.id} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.serviceIds.includes(s.id)}
                    onChange={() => toggleService(s.id)}
                    className="w-4 h-4 rounded accent-[#3B82F6]"
                  />
                  <span className="text-sm text-[#94A3C8] group-hover:text-[#EEF2FF] transition-colors">{s.name}</span>
                </label>
              ))}
            </div>
          ))}
        </div>
      </SlideOver>
    </div>
  )
}
