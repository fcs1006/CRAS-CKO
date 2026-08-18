'use client'

import { useState } from 'react'
import { GrupoSCFV, ParticipanteSCFV } from '@/types'

interface ScfvViewProps {
  grupos: GrupoSCFV[]
  participantes: ParticipanteSCFV[]
  onAbrirModalNovoGrupo: () => void
  onAbrirModalAdicionarParticipante: (grupoId: string) => void
  onExcluirParticipante?: (participanteId: string) => Promise<void>
}

export function ScfvView({
  grupos,
  participantes,
  onAbrirModalNovoGrupo,
  onAbrirModalAdicionarParticipante,
  onExcluirParticipante
}: ScfvViewProps) {
  const [grupoSelecionadoId, setGrupoSelecionadoId] = useState<string | null>(
    grupos.length > 0 ? grupos[0].id : null
  )

  const grupoAtual = grupos.find(g => g.id === grupoSelecionadoId) || grupos[0]
  const participantesGrupo = participantes.filter(p => p.grupo_id === grupoAtual?.id)

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <i className="fa-solid fa-people-group text-indigo-600"></i> Oficinas & Grupos SCFV
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Serviço de Convivência e Fortalecimento de Vínculos (Crianças, Jovens e Idosos).
          </p>
        </div>
        <button
          onClick={onAbrirModalNovoGrupo}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow transition flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i> Criar Novo Coletivo / Grupo
        </button>
      </div>

      {/* Grid de Coletivos e Participantes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Grupos */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
            Grupos Ativos ({grupos.length})
          </h3>
          {grupos.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">Nenhum grupo cadastrado.</p>
          ) : (
            grupos.map(g => {
              const count = participantes.filter(p => p.grupo_id === g.id).length
              const isSelected = g.id === grupoAtual?.id
              return (
                <div
                  key={g.id}
                  onClick={() => setGrupoSelecionadoId(g.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-800 text-sm">{g.nome}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                      {count} Integrantes
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{g.descricao || 'Sem descrição'}</p>
                  <div className="mt-3 pt-2 border-t border-gray-100/60 flex justify-between text-[11px] text-gray-500">
                    <span>Horário: <strong>{g.horario}</strong></span>
                    <span>Técnico: <strong>{g.tecnico_responsavel}</strong></span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Detalhes e Lista de Integrantes do Grupo Selecionado */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          {grupoAtual ? (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{grupoAtual.nome}</h3>
                  <p className="text-xs text-gray-500">{grupoAtual.descricao}</p>
                </div>
                <button
                  onClick={() => onAbrirModalAdicionarParticipante(grupoAtual.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition flex items-center gap-1"
                >
                  <i className="fa-solid fa-user-plus"></i> Vincular Participante
                </button>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">
                  Integrantes Matriculados ({participantesGrupo.length})
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 font-semibold text-xs uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Nome do Participante</th>
                        <th className="py-2.5 px-3">Data de Inclusão</th>
                        <th className="py-2.5 px-3 text-center">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {participantesGrupo.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-6 text-center text-gray-400 text-xs">
                            Nenhum integrante vinculado a este grupo.
                          </td>
                        </tr>
                      ) : (
                        participantesGrupo.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="py-2.5 px-3 font-semibold text-gray-800 uppercase">{p.nome}</td>
                            <td className="py-2.5 px-3 text-xs text-gray-500">
                              {p.criado_em ? new Date(p.criado_em).toLocaleDateString('pt-BR') : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {onExcluirParticipante && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (confirm(`Deseja desvincular ${p.nome} deste grupo?`)) {
                                      await onExcluirParticipante(p.id)
                                    }
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-rose-600 rounded transition"
                                  title="Desvincular do Grupo"
                                >
                                  <i className="fa-solid fa-user-minus text-xs"></i>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              Selecione um grupo para visualizar os detalhes.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
