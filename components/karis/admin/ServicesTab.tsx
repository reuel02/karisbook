'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Clock, Tag } from 'lucide-react'
import { Service, formatDuration, formatPrice } from '@/lib/karis-data'
import SlideOver from './SlideOver'

type Props = {
  services: Service[]
  onAdd: (s: Omit<Service, 'id'>) => void
  onEdit: (s: Service) => void
  onDelete: (id: string) => void
}

const EMPTY_FORM: Omit<Service, 'id'> = {
  name: '', description: '', duration: 30, price: 0, category: '',
}

export default function ServicesTab({ services, onAdd, onEdit, onDelete }: Props) {
  const [slideOpen, setSlideOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState<Omit<Service, 'id'>>(EMPTY_FORM)

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setSlideOpen(true) }
  const openEdit = (s: Service) => { setEditing(s); setForm({ name: s.name, description: s.description, duration: s.duration, price: s.price, category: s.category }); setSlideOpen(true) }
  const handleClose = () => setSlideOpen(false)

  const handleSave = () => {
    if (!form.name.trim()) return
    if (editing) onEdit({ ...editing, ...form })
    else onAdd(form)
    handleClose()
  }

  const field = (label: string, content: React.ReactNode) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-[#94A3C8] uppercase tracking-wider">{label}</label>
      {content}
    </div>
  )

  const inputClass = `w-full px-3.5 py-2.5 rounded-xl bg-[#16203D] border border-[rgba(59,130,246,0.14)] text-[#EEF2FF] text-sm placeholder:text-[#4B5E82] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all duration-200`

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#EEF2FF]">Serviços</h2>
          <p className="text-sm text-[#94A3C8]">{services.length} serviços cadastrados</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold transition-colors shadow-[0_2px_12px_rgba(59,130,246,0.3)]"
        >
          <Plus size={16} />
          Novo serviço
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-[rgba(59,130,246,0.12)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#111830] border-b border-[rgba(59,130,246,0.1)]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#4B5E82] uppercase tracking-wider">Serviço</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#4B5E82] uppercase tracking-wider hidden md:table-cell">Categoria</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#4B5E82] uppercase tracking-wider hidden sm:table-cell">Duração</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#4B5E82] uppercase tracking-wider">Preço</th>
              <th className="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody>
            {services.map((svc, i) => (
              <tr
                key={svc.id}
                className={`border-b border-[rgba(59,130,246,0.06)] hover:bg-[#1C2A50]/50 transition-colors ${i % 2 === 0 ? 'bg-[#16203D]' : 'bg-[#111830]'}`}
              >
                <td className="px-4 py-3.5">
                  <p className="font-medium text-[#EEF2FF]">{svc.name}</p>
                  <p className="text-xs text-[#4B5E82] mt-0.5 hidden sm:block">{svc.description}</p>
                </td>
                <td className="px-4 py-3.5 hidden md:table-cell">
                  <span className="flex items-center gap-1 text-xs text-[#94A3C8]">
                    <Tag size={11} />{svc.category}
                  </span>
                </td>
                <td className="px-4 py-3.5 hidden sm:table-cell">
                  <span className="flex items-center gap-1 text-xs text-[#94A3C8]">
                    <Clock size={11} />{formatDuration(svc.duration)}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="font-bold text-[#3B82F6]">{formatPrice(svc.price)}</span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => openEdit(svc)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#4B5E82] hover:text-[#3B82F6] hover:bg-[#3B82F6]/10 transition-colors" aria-label="Editar">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => onDelete(svc.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#4B5E82] hover:text-red-400 hover:bg-red-400/10 transition-colors" aria-label="Excluir">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {services.length === 0 && (
          <div className="p-8 text-center text-[#4B5E82] text-sm bg-[#16203D]">Nenhum serviço cadastrado</div>
        )}
      </div>

      {/* SlideOver form */}
      <SlideOver
        open={slideOpen}
        title={editing ? 'Editar Serviço' : 'Novo Serviço'}
        subtitle={editing ? `Editando "${editing.name}"` : 'Preencha os dados do novo serviço'}
        onClose={handleClose}
        footer={
          <div className="flex gap-3">
            <button onClick={handleClose} className="flex-1 py-2.5 rounded-xl border border-[rgba(59,130,246,0.2)] text-[#94A3C8] hover:text-[#EEF2FF] text-sm font-medium transition-colors">
              Cancelar
            </button>
            <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold transition-colors">
              {editing ? 'Salvar alterações' : 'Criar serviço'}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          {field('Nome', <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Corte Masculino" className={inputClass} />)}
          {field('Descrição', <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Breve descrição do serviço" rows={3} className={`${inputClass} resize-none`} />)}
          {field('Categoria', <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ex: Cabelo, Barba..." className={inputClass} />)}
          <div className="grid grid-cols-2 gap-4">
            {field('Duração (min)', <input type="number" min={5} step={5} value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} className={inputClass} />)}
            {field('Preço (R$)', <input type="number" min={0} step={0.5} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputClass} />)}
          </div>
        </div>
      </SlideOver>
    </div>
  )
}
