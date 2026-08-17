'use client'

import { useState, useEffect } from 'react'
import { GrupoSCFV } from '@/types'

interface ModalNovoGrupoScfvProps {
  usuarioLogadoNome: string
  onClose: () => void
  onSalvar: (grupo: Partial<GrupoSCFV>) => Promise<void>
}

export function ModalNovoGrupoScfv({
  usuarioLogadoNome,
  onClose,
  onSalvar
}: ModalNovoGrupoScfvProps) {
  const [salvando, setSalvando] = useState(false)
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [horario, setHorario] = useState('')
  const [tecnico, setTecnico] = useState(usuarioLogadoNome || '')

  useEffect(() => {
    if (usuarioLogadoNome) setTecnico(usuarioLogadoNome)
  }, [usuarioLogadoNome])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return
    setSalvando(true)

    try {
      const novo: Partial<GrupoSCFV> = {
        nome: nome.trim(),
        descricao: descricao.trim(),
        horario: horario.trim(),
        tecnico_responsavel: tecnico.trim()
      }

      await onSalvar(novo)
      onClose()
    } catch (err: any) {
      alert('Erro ao criar grupo.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-indigo-800 text-white p-5 flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <i className="fa-solid fa-people-group text-indigo-300"></i> Criar Grupo / Oficina SCFV
          </h3>
          <button onClick={onClose} className="text-indigo-200 hover:text-white text-xl">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Nome do Coletivo / Grupo
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Grupo de Idosos 'Viver Melhor'..."
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Horário e Periodicidade dos Encontros
            </label>
            <input
              type="text"
              required
              value={horario}
              onChange={e => setHorario(e.target.value)}
              placeholder="Ex: Terças e Quintas às 09:00h"
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <i className="fa-solid fa-lock text-gray-400 text-[10px]"></i> Técnico / Orientador Responsável (Logado)
            </label>
            <input
              type="text"
              readOnly
              disabled
              value={tecnico || usuarioLogadoNome || 'TÉCNICO LOGADO'}
              className="w-full px-3 py-2 border rounded-lg text-xs uppercase font-bold bg-gray-100 text-gray-700 border-gray-300 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Objetivo e Descrição das Atividades
            </label>
            <textarea
              rows={3}
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Descrição das temáticas abordadas e perfil dos participantes..."
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-sm text-gray-600">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-6 py-2 bg-indigo-700 text-white rounded-lg text-sm font-bold shadow hover:bg-indigo-800 transition"
            >
              {salvando ? 'Criando...' : 'Salvar Grupo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
