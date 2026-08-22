'use client'

import { useState } from 'react'
import { GrupoSCFV, ParticipanteSCFV } from '@/types'

interface ScfvViewProps {
  grupos: GrupoSCFV[]
  participantes: ParticipanteSCFV[]
  onAbrirModalNovoGrupo: () => void
  onAbrirModalAdicionarParticipante: (grupoId: string) => void
  onAbrirModalEditarGrupo?: (grupo: GrupoSCFV) => void
  onExcluirGrupo?: (grupoId: string) => Promise<void>
  onExcluirParticipante?: (participanteId: string) => Promise<void>
  onAbrirModalFrequencia?: (grupo: GrupoSCFV) => void
  onAbrirModalRelatorioGrupo?: (grupo: GrupoSCFV) => void
  onAbrirModalRelatorioGeralGrupo?: (grupo: GrupoSCFV) => void
}

export function ScfvView({
  grupos,
  participantes,
  onAbrirModalNovoGrupo,
  onAbrirModalAdicionarParticipante,
  onAbrirModalEditarGrupo,
  onExcluirGrupo,
  onExcluirParticipante,
  onAbrirModalFrequencia,
  onAbrirModalRelatorioGrupo,
  onAbrirModalRelatorioGeralGrupo
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
                  className={`p-4 rounded-xl border transition cursor-pointer relative group ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-800 text-sm uppercase">{g.nome}</h4>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                        {count} Integrantes
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 uppercase">{g.descricao || 'Sem descrição'}</p>
                  <div className="mt-3 pt-2 border-t border-gray-100/60 flex justify-between items-center text-[11px] text-gray-500">
                    <span>Horário: <strong>{g.horario}</strong></span>
                    <div className="flex items-center gap-1">
                      {onAbrirModalEditarGrupo && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onAbrirModalEditarGrupo(g)
                          }}
                          className="p-1 text-gray-400 hover:text-indigo-700 rounded transition"
                          title="Editar Grupo"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                      )}
                      {onExcluirGrupo && (
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation()
                            if (confirm(`Deseja realmente excluir o grupo "${g.nome}"?`)) {
                              await onExcluirGrupo(g.id)
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded transition"
                          title="Excluir Grupo"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      )}
                    </div>
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 uppercase">{grupoAtual.nome}</h3>
                  <p className="text-xs text-gray-500 uppercase">{grupoAtual.descricao}</p>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  {onAbrirModalEditarGrupo && (
                    <button
                      onClick={() => onAbrirModalEditarGrupo(grupoAtual)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
                    >
                      <i className="fa-solid fa-pen-to-square text-gray-600"></i> Editar Grupo
                    </button>
                  )}
                  
                  {onExcluirGrupo && (
                    <button
                      onClick={async () => {
                        if (confirm(`Deseja realmente excluir o grupo "${grupoAtual.nome}"?`)) {
                          await onExcluirGrupo(grupoAtual.id)
                        }
                      }}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
                    >
                      <i className="fa-solid fa-trash-can text-rose-600"></i> Excluir Grupo
                    </button>
                  )}

                  {onAbrirModalRelatorioGrupo && (
                    <button
                      onClick={() => onAbrirModalRelatorioGrupo(grupoAtual)}
                      className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-file-invoice text-slate-300"></i> Relatório do Encontro
                    </button>
                  )}

                  {onAbrirModalRelatorioGeralGrupo && (
                    <button
                      onClick={() => onAbrirModalRelatorioGeralGrupo(grupoAtual)}
                      className="bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-file-lines text-teal-200"></i> Relatório Geral (Todos Encontros)
                    </button>
                  )}

                  {onAbrirModalFrequencia && (
                    <button
                      onClick={() => onAbrirModalFrequencia(grupoAtual)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-clipboard-user text-indigo-200"></i> Lançar Frequência / Chamada
                    </button>
                  )}

                  <button
                    onClick={() => onAbrirModalAdicionarParticipante(grupoAtual.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow transition flex items-center gap-1"
                  >
                    <i className="fa-solid fa-user-plus"></i> Vincular Participante
                  </button>
                </div>
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
