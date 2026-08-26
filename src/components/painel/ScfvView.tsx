'use client'

import { useState, useEffect } from 'react'
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
  onAbrirModalRelatorioGrupo?: (grupo: GrupoSCFV, dataEncontroInicial?: string, apenasVisualizacao?: boolean) => void
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

  const [frequenciasHistorico, setFrequenciasHistorico] = useState<any[]>([])
  const [relatoriosHistorico, setRelatoriosHistorico] = useState<any[]>([])
  const [carregandoHistorico, setCarregandoHistorico] = useState(false)

  // Carregar histórico de frequências e relatórios do grupo atual
  const carregarHistoricoGrupo = async () => {
    if (!grupoAtual?.id) return
    setCarregandoHistorico(true)
    try {
      const [resFreq, resRel] = await Promise.all([
        fetch(`/api/scfv/frequencia?grupo_id=${grupoAtual.id}`),
        fetch(`/api/scfv/relatorio?grupo_id=${grupoAtual.id}`)
      ])
      if (resFreq.ok) {
        const json = await resFreq.json()
        if (json.ok && Array.isArray(json.data)) setFrequenciasHistorico(json.data)
      }
      if (resRel.ok) {
        const json = await resRel.json()
        if (json.ok && Array.isArray(json.data)) setRelatoriosHistorico(json.data)
      }
    } catch (e) {
      console.warn('Erro ao carregar histórico de encontros:', e)
    } finally {
      setCarregandoHistorico(false)
    }
  }

  useEffect(() => {
    carregarHistoricoGrupo()
  }, [grupoAtual?.id])

  // Excluir relatório e encontro gravado
  const handleExcluirEncontro = async (dataEncontroStr: string) => {
    const dataBr = dataEncontroStr.split('-').reverse().join('/')
    if (!confirm(`Deseja realmente excluir o relatório e registro do encontro do dia ${dataBr}?`)) return

    try {
      const res = await fetch(`/api/scfv/relatorio?grupo_id=${grupoAtual.id}&data_encontro=${dataEncontroStr}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        alert(`Registro do encontro do dia ${dataBr} excluído com sucesso!`)
        await carregarHistoricoGrupo()
      } else {
        alert('Erro ao excluir registro do encontro.')
      }
    } catch (err: any) {
      alert('Erro ao excluir registro: ' + (err.message || 'Tente novamente.'))
    }
  }

  function compararDatas(d1?: string, d2?: string) {
    if (!d1 || !d2) return false
    const s1 = d1.split('T')[0].split(' ')[0].trim()
    const s2 = d2.split('T')[0].split(' ')[0].trim()

    if (s1 === s2) return true

    const toIso = (str: string) => {
      if (str.includes('/')) {
        const parts = str.split('/')
        if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
      }
      return str
    }

    return toIso(s1) === toIso(s2)
  }

  // Consolidação dos dados para exibição na tabela de histórico
  const datasHistoricoUnicas = Array.from(
    new Set([
      ...frequenciasHistorico.map(f => f.data),
      ...relatoriosHistorico.map(r => r.data_encontro)
    ])
  ).filter(Boolean).sort().reverse()

  const encontrosConsolidados = datasHistoricoUnicas.map(dStr => {
    const freq = frequenciasHistorico.find(f => compararDatas(f.data, dStr))
    const rel = relatoriosHistorico.find(r => compararDatas(r.data_encontro, dStr))

    const dataBr = dStr.split('-').reverse().join('/')

    const registros = freq?.registros || []
    const presentesArr = freq?.presentes || []

    let qtdPresentes = 0
    let totalCadastrados = participantesGrupo.length

    if (registros.length > 0) {
      qtdPresentes = registros.filter((r: any) => r.status === 'presente').length
    } else if (presentesArr.length > 0) {
      qtdPresentes = presentesArr.length
    }

    return {
      dataStr: dStr,
      dataBr,
      objetivo: rel?.objetivo_encontro || rel?.atividade_realizada || rel?.relato || '—',
      atividade: rel?.atividade_realizada || '—',
      qtdPresentes,
      totalCadastrados,
      temRelatorio: !!rel,
      temFrequencia: !!freq
    }
  })

  return (
    <div className="space-y-6">
      <div className="space-y-6 print:hidden">
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
              {/* Cabeçalho do Coletivo Selecionado */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-extrabold text-gray-900 uppercase tracking-wide">{grupoAtual.nome}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-100 text-indigo-900 border border-indigo-200 uppercase">
                      {grupoAtual.tipo_grupo || 'SCFV'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium uppercase mt-0.5">
                    {grupoAtual.descricao || 'Sem descrição cadastrada'} • Horário: <strong className="text-gray-700">{grupoAtual.horario}</strong>
                  </p>
                </div>

                {/* Ações Administrativas de Gestão do Coletivo */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {onAbrirModalEditarGrupo && (
                    <button
                      type="button"
                      onClick={() => onAbrirModalEditarGrupo(grupoAtual)}
                      className="w-8 h-8 bg-gray-100 hover:bg-indigo-600 text-gray-600 hover:text-white rounded-lg transition flex items-center justify-center border border-gray-200"
                      title="Editar Configurações do Grupo"
                    >
                      <i className="fa-solid fa-pen-to-square text-xs"></i>
                    </button>
                  )}
                  {onExcluirGrupo && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm(`Deseja realmente excluir o grupo "${grupoAtual.nome}"?`)) {
                          await onExcluirGrupo(grupoAtual.id)
                        }
                      }}
                      className="w-8 h-8 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg transition flex items-center justify-center border border-rose-200"
                      title="Excluir Grupo"
                    >
                      <i className="fa-solid fa-trash-can text-xs"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* Barra de Ações Operacionais (Em linha única compacta com ícones) */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2 overflow-x-auto w-full">
                  <button
                    type="button"
                    onClick={() => onAbrirModalAdicionarParticipante(grupoAtual.id)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-2 shrink-0"
                    title="Vincular Participante ao Grupo"
                  >
                    <i className="fa-solid fa-user-plus text-emerald-200"></i>
                    <span>Vincular Participante</span>
                  </button>

                  {onAbrirModalFrequencia && (
                    <button
                      type="button"
                      onClick={() => onAbrirModalFrequencia(grupoAtual)}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-2 shrink-0"
                      title="Lançar Frequência / Chamada"
                    >
                      <i className="fa-solid fa-clipboard-user text-indigo-200"></i>
                      <span>Lançar Frequência</span>
                    </button>
                  )}

                  {onAbrirModalRelatorioGrupo && (
                    <button
                      type="button"
                      onClick={() => onAbrirModalRelatorioGrupo(grupoAtual)}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-2 shrink-0"
                      title="Novo Relatório do Encontro"
                    >
                      <i className="fa-solid fa-file-circle-plus text-slate-300"></i>
                      <span>Relatório do Encontro</span>
                    </button>
                  )}

                  {onAbrirModalRelatorioGeralGrupo && (
                    <button
                      type="button"
                      onClick={() => onAbrirModalRelatorioGeralGrupo(grupoAtual)}
                      className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-2 shrink-0"
                      title="Relatório Geral Consolidado (Todos Encontros)"
                    >
                      <i className="fa-solid fa-file-contract text-teal-200"></i>
                      <span>Relatório Geral</span>
                    </button>
                  )}
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

              {/* Seção do Histórico dos Relatórios & Encontros Realizados */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                    <i className="fa-solid fa-clock-rotate-left text-indigo-600"></i>
                    Histórico de Encontros & Relatórios Registrados ({encontrosConsolidados.length})
                  </h4>
                  <span className="text-[11px] text-gray-500 font-medium">
                    Consulte, edite ou exclua relatórios gravados por data
                  </span>
                </div>

                {carregandoHistorico ? (
                  <div className="p-4 text-center text-xs text-gray-500 font-semibold bg-gray-50 rounded-xl border border-gray-100">
                    <i className="fa-solid fa-circle-notch animate-spin mr-1.5"></i> Carregando histórico dos encontros...
                  </div>
                ) : encontrosConsolidados.length === 0 ? (
                  <div className="p-6 bg-gray-50 border border-gray-100 rounded-xl text-center text-xs text-gray-400 font-medium">
                    <i className="fa-solid fa-folder-open text-2xl block text-gray-300 mb-1.5"></i>
                    Nenhum encontro ou relatório registrado para este grupo.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-gray-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-700 font-extrabold uppercase text-[10px] border-b border-gray-200">
                        <tr>
                          <th className="py-2.5 px-3 w-32">Data do Encontro</th>
                          <th className="py-2.5 px-3 w-36 text-center">Qtd. Participantes</th>
                          <th className="py-2.5 px-3">Objetivo do Encontro</th>
                          <th className="py-2.5 px-3 text-center w-36">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {encontrosConsolidados.map((item) => (
                          <tr key={item.dataStr} className="hover:bg-gray-50/80 transition">
                            <td className="py-2.5 px-3 font-extrabold text-indigo-950 whitespace-nowrap">
                              {item.dataBr}
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-900 border border-indigo-200">
                                {item.qtdPresentes} / {item.totalCadastrados} Presentes
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-gray-800 uppercase leading-relaxed">
                              {item.objetivo}
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5">
                                {onAbrirModalRelatorioGrupo && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => onAbrirModalRelatorioGrupo(grupoAtual, item.dataStr, true)}
                                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-800 text-slate-700 hover:text-white transition flex items-center justify-center border border-slate-200"
                                      title="Visualizar Relatório do Encontro"
                                    >
                                      <i className="fa-solid fa-eye text-xs"></i>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => onAbrirModalRelatorioGrupo(grupoAtual, item.dataStr, false)}
                                      className="w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white transition flex items-center justify-center border border-indigo-200"
                                      title="Editar Relatório do Encontro"
                                    >
                                      <i className="fa-solid fa-pen-to-square text-xs"></i>
                                    </button>
                                  </>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleExcluirEncontro(item.dataStr)}
                                  className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white transition flex items-center justify-center border border-rose-200"
                                  title="Excluir Encontro"
                                >
                                  <i className="fa-solid fa-trash-can text-xs"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
  </div>
)
}
