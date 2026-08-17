'use client'

import { useState } from 'react'
import { Familia, AgendaItem, Usuario } from '@/types'

interface ModalNovoAgendamentoProps {
  familias: Familia[]
  usuarios: Usuario[]
  usuarioLogadoNome: string
  onClose: () => void
  onSalvar: (agendamento: Partial<AgendaItem>) => Promise<void>
}

export function ModalNovoAgendamento({
  familias,
  usuarios,
  usuarioLogadoNome,
  onClose,
  onSalvar
}: ModalNovoAgendamentoProps) {
  const [salvando, setSalvando] = useState(false)
  const [familiaId, setFamiliaId] = useState('')
  const [tipo, setTipo] = useState<string>('')
  const [data, setData] = useState('')
  const [hora, setHora] = useState('')
  const [tecnico, setTecnico] = useState('')
  const [descricao, setDescricao] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!familiaId) return alert('Selecione a família a ser agendada.')
    if (!tipo) return alert('Selecione o tipo de compromisso.')
    if (!data) return alert('Selecione a data do agendamento.')
    if (!hora) return alert('Selecione o horário do agendamento.')
    if (!tecnico) return alert('Selecione o técnico responsável.')

    setSalvando(true)
    const fam = familias.find(f => f.id === familiaId)

    try {
      const novo: Partial<AgendaItem> = {
        familia_id: familiaId,
        responsavel: fam?.responsavel || 'Responsável Familiar',
        bairro: fam?.bairro || '',
        data,
        hora,
        tipo: (tipo as 'Atendimento' | 'Visita Domiciliar') || 'Atendimento',
        tecnico: tecnico.trim().toUpperCase(),
        descricao: descricao.trim().toUpperCase(),
        status: 'Agendado'
      }

      await onSalvar(novo)
      onClose()
    } catch (err: any) {
      alert('Erro ao criar agendamento: ' + (err.message || 'Tente novamente.'))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-8 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-teal-900 text-white p-5 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
              <i className="fa-regular fa-calendar-plus text-emerald-400"></i> Novo Agendamento Técnico
            </h3>
            <p className="text-[11px] text-teal-200 mt-0.5">
              Agendamento de atendimentos no CRAS ou visitas domiciliares
            </p>
          </div>
          <button onClick={onClose} className="text-teal-200 hover:text-white text-xl">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Família */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Família / Prontuário <span className="text-red-600 font-bold">*</span>
            </label>
            <select
              value={familiaId}
              onChange={e => setFamiliaId(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-semibold"
            >
              <option value="">SELECIONE A FAMÍLIA *</option>
              {familias.map(f => (
                <option key={f.id} value={f.id}>
                  {f.responsavel} — PRONTUÁRIO Nº: {f.cod_familiar} (CPF: {f.cpf_responsavel || '—'})
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Agendamento */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Tipo de Compromisso <span className="text-red-600 font-bold">*</span>
            </label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-semibold"
            >
              <option value="">SELECIONE O TIPO DE COMPROMISSO *</option>
              <option value="Atendimento">Atendimento Particularizado (na Unidade)</option>
              <option value="Visita Domiciliar">Visita Domiciliar (no Território)</option>
            </select>
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Data Prevista <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="date"
                required
                value={data}
                onChange={e => setData(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Horário <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="time"
                required
                value={hora}
                onChange={e => setHora(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          {/* Técnico */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Técnico(a) Responsável <span className="text-red-600 font-bold">*</span>
            </label>
            <select
              value={tecnico}
              onChange={e => setTecnico(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-semibold"
            >
              <option value="">SELECIONE O TÉCNICO *</option>
              {usuarios.map(u => (
                <option key={u.id} value={u.nome}>
                  {u.nome} ({u.cargo || 'Técnico'})
                </option>
              ))}
            </select>
          </div>

          {/* Descrição / Motivo */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Objetivo / Observações
            </label>
            <textarea
              rows={3}
              value={descricao}
              onChange={e => setDescricao(e.target.value.toUpperCase())}
              placeholder="DESCREVA O MOTIVO OU OBJETIVO DO AGENDAMENTO..."
              className="w-full px-3 py-2 border rounded-lg text-xs uppercase"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 uppercase font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-6 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold shadow transition uppercase flex items-center gap-1.5"
            >
              <i className="fa-solid fa-calendar-check"></i>
              {salvando ? 'Agendando...' : 'Salvar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}