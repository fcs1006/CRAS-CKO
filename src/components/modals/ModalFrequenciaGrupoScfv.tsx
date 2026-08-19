'use client'

import { useState } from 'react'
import { GrupoSCFV, ParticipanteSCFV } from '@/types'

interface ModalFrequenciaGrupoScfvProps {
  grupo: GrupoSCFV
  participantes: ParticipanteSCFV[]
  usuarioLogadoNome?: string
  onClose: () => void
  onSalvarFrequencia: (dados: {
    grupo_id: string
    grupo_nome: string
    data: string
    tema?: string
    tecnico: string
    registros: Array<{
      membro_id: string
      nome: string
      familia_id?: string
      status: 'presente' | 'falta_justificada' | 'falta_nao_justificada'
      observacao?: string
    }>
  }) => Promise<void>
}

type StatusFrequencia = 'presente' | 'falta_justificada' | 'falta_nao_justificada'

export function ModalFrequenciaGrupoScfv({
  grupo,
  participantes,
  usuarioLogadoNome = '',
  onClose,
  onSalvarFrequencia
}: ModalFrequenciaGrupoScfvProps) {
  const [salvando, setSalvando] = useState(false)
  const [dataChamada, setDataChamada] = useState<string>(new Date().toISOString().split('T')[0])
  const [tema, setTema] = useState('')
  const [tecnico, setTecnico] = useState(usuarioLogadoNome || grupo.tecnico_responsavel || '')

  // Inicializa a lista de frequências com 'presente' por padrão
  const [frequencias, setFrequencias] = useState<Record<string, { status: StatusFrequencia; observacao: string }>>(() => {
    const inicial: Record<string, { status: StatusFrequencia; observacao: string }> = {}
    participantes.forEach(p => {
      inicial[p.id] = { status: 'presente', observacao: '' }
    })
    return inicial
  })

  function alterarStatus(partId: string, status: StatusFrequencia) {
    setFrequencias(prev => ({
      ...prev,
      [partId]: { ...prev[partId], status }
    }))
  }

  function alterarObservacao(partId: string, observacao: string) {
    setFrequencias(prev => ({
      ...prev,
      [partId]: { ...prev[partId], observacao }
    }))
  }

  function marcarTodos(status: StatusFrequencia) {
    setFrequencias(prev => {
      const atualizado: Record<string, { status: StatusFrequencia; observacao: string }> = {}
      participantes.forEach(p => {
        atualizado[p.id] = { status, observacao: prev[p.id]?.observacao || '' }
      })
      return atualizado
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!dataChamada) return alert('Por favor, selecione a data do encontro.')
    setSalvando(true)

    try {
      const registros = participantes.map(p => {
        const item = frequencias[p.id] || { status: 'presente', observacao: '' }
        return {
          membro_id: p.membro_id,
          nome: p.nome,
          familia_id: p.familia_id,
          status: item.status,
          observacao: item.observacao.trim().toUpperCase()
        }
      })

      await onSalvarFrequencia({
        grupo_id: grupo.id,
        grupo_nome: grupo.nome,
        data: dataChamada,
        tema: tema.trim().toUpperCase(),
        tecnico: tecnico.trim().toUpperCase() || 'TÉCNICO RESPONSÁVEL',
        registros
      })

      onClose()
    } catch (err: any) {
      alert('Erro ao registrar frequência: ' + (err.message || 'Tente novamente.'))
    } finally {
      setSalvando(false)
    }
  }

  // Contadores instantâneos
  const totalPresentes = Object.values(frequencias).filter(f => f.status === 'presente').length
  const totalFaltasJustificadas = Object.values(frequencias).filter(f => f.status === 'falta_justificada').length
  const totalFaltasNaoJustificadas = Object.values(frequencias).filter(f => f.status === 'falta_nao_justificada').length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print:hidden">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-6 overflow-hidden flex flex-col max-h-[92vh] border border-indigo-100">
        
        {/* Header */}
        <div className="bg-indigo-900 text-white p-5 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2 uppercase tracking-wide">
              <i className="fa-solid fa-clipboard-user text-indigo-300 text-lg"></i> Registrar Frequência / Chamada do Dia
            </h3>
            <p className="text-[11px] text-indigo-200 mt-0.5 font-medium uppercase">
              Grupo: <strong className="text-white">{grupo.nome}</strong> • {participantes.length} Integrantes Matriculados
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-indigo-100 hover:text-white flex items-center justify-center transition"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Cabeçalho do Formulário (Data, Tema, Resumo) */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 shrink-0 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                  Data do Encontro *
                </label>
                <input
                  type="date"
                  required
                  value={dataChamada}
                  onChange={e => setDataChamada(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold bg-white text-gray-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                  Pauta / Tema da Oficina (Opcional)
                </label>
                <input
                  type="text"
                  value={tema}
                  onChange={e => setTema(e.target.value)}
                  placeholder="EX: OFICINA DE AUTOESTIMA, CIDADANIA E DIREITOS DOS IDOSOS"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold uppercase bg-white"
                />
              </div>
            </div>

            {/* Ações de Lote e Resumo de Frequência */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-200">
                  <i className="fa-solid fa-circle-check text-emerald-600 mr-1"></i> {totalPresentes} Presentes
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-200">
                  <i className="fa-solid fa-triangle-exclamation text-amber-600 mr-1"></i> {totalFaltasJustificadas} Justificadas
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-900 border border-rose-200">
                  <i className="fa-solid fa-circle-xmark text-rose-600 mr-1"></i> {totalFaltasNaoJustificadas} Faltas
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase">
                <span className="text-gray-500">Marcar todos:</span>
                <button
                  type="button"
                  onClick={() => marcarTodos('presente')}
                  className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded transition"
                >
                  Presentes
                </button>
                <button
                  type="button"
                  onClick={() => marcarTodos('falta_justificada')}
                  className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded transition"
                >
                  Justificados
                </button>
                <button
                  type="button"
                  onClick={() => marcarTodos('falta_nao_justificada')}
                  className="px-2 py-1 bg-rose-700 hover:bg-rose-800 text-white rounded transition"
                >
                  Faltas
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Integrantes */}
          <div className="p-4 overflow-y-auto flex-1 space-y-3">
            {participantes.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <i className="fa-solid fa-users-slash text-3xl block text-gray-300 mb-2"></i>
                <p className="font-semibold text-xs">Nenhum participante matriculado neste grupo.</p>
                <p className="text-[11px] text-gray-400">Vincule beneficiários antes de lançar a frequência.</p>
              </div>
            ) : (
              participantes.map((p, idx) => {
                const item = frequencias[p.id] || { status: 'presente', observacao: '' }

                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                      item.status === 'presente'
                        ? 'bg-emerald-50/30 border-emerald-200'
                        : item.status === 'falta_justificada'
                        ? 'bg-amber-50/40 border-amber-200'
                        : 'bg-rose-50/40 border-rose-200'
                    }`}
                  >
                    {/* Nome do Participante */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <strong className="text-gray-900 font-bold text-xs uppercase truncate">
                          {p.nome}
                        </strong>
                      </div>
                    </div>

                    {/* Botões de Seleção de Status */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => alterarStatus(p.id, 'presente')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition flex items-center gap-1 border ${
                          item.status === 'presente'
                            ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <i className="fa-solid fa-check"></i> Presente
                      </button>

                      <button
                        type="button"
                        onClick={() => alterarStatus(p.id, 'falta_justificada')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition flex items-center gap-1 border ${
                          item.status === 'falta_justificada'
                            ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <i className="fa-solid fa-user-clock"></i> Justificada
                      </button>

                      <button
                        type="button"
                        onClick={() => alterarStatus(p.id, 'falta_nao_justificada')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition flex items-center gap-1 border ${
                          item.status === 'falta_nao_justificada'
                            ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <i className="fa-solid fa-xmark"></i> Falta
                      </button>
                    </div>

                    {/* Observação / Justificativa Individual */}
                    <div className="w-full sm:w-64 shrink-0">
                      <input
                        type="text"
                        value={item.observacao}
                        onChange={e => alterarObservacao(p.id, e.target.value)}
                        placeholder="OBSERVAÇÃO / JUSTIFICATIVA..."
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-[11px] font-medium uppercase bg-white"
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center shrink-0">
            <p className="text-[11px] text-gray-500 font-medium">
              As presenças/faltas serão gravadas automaticamente no histórico do beneficiário.
            </p>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold uppercase transition"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={salvando || participantes.length === 0}
                className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl text-xs uppercase tracking-wide transition shadow flex items-center gap-2 disabled:opacity-50"
              >
                {salvando ? (
                  <>
                    <i className="fa-solid fa-circle-notch animate-spin"></i> Gravando...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-floppy-disk"></i> Salvar Chamada & Histórico
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
