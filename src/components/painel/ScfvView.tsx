'use client'

import { useState, useEffect, useMemo } from 'react'
import { GrupoSCFV, ParticipanteSCFV, Usuario } from '@/types'
import { podeExcluirGrupoScfv } from '@/utils/permissoes'

interface ScfvViewProps {
  grupos: GrupoSCFV[]
  participantes: ParticipanteSCFV[]
  usuarioLogado?: Usuario | null
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
  usuarioLogado,
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

  const grupoAtual = grupos.find(g => g.id === grupoSelecionadoId) || grupos[0] || null
  const participantesGrupo = useMemo(() => {
    return participantes.filter(p => p.grupo_id === grupoAtual?.id)
  }, [participantes, grupoAtual?.id])

  const [buscaParticipante, setBuscaParticipante] = useState('')
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

  function formatarDataSemFuso(dStr?: string): string {
    if (!dStr) return '—'
    const apenasData = dStr.split('T')[0].split(' ')[0].trim()
    const partes = apenasData.split('-')
    if (partes.length === 3) {
      return `${partes[2].padStart(2, '0')}/${partes[1].padStart(2, '0')}/${partes[0]}`
    }
    return dStr
  }

  // Excluir relatório e encontro gravado
  const handleExcluirEncontro = async (dataEncontroStr: string) => {
    const apenasData = dataEncontroStr.split('T')[0].split(' ')[0].trim()
    const dataBr = formatarDataSemFuso(apenasData)
    if (!confirm(`Deseja realmente excluir o relatório e registro do encontro do dia ${dataBr}?`)) return

    // Remocao otimista local para atualizacao instantanea na tela
    setFrequenciasHistorico(prev => prev.filter(f => !compararDatas(f.data, apenasData)))
    setRelatoriosHistorico(prev => prev.filter(r => !compararDatas(r.data_encontro, apenasData)))

    try {
      const grupoId = grupoAtual?.id || ''
      const res = await fetch(`/api/scfv/relatorio?grupo_id=${grupoId}&data_encontro=${encodeURIComponent(apenasData)}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        alert(`Registro do encontro do dia ${dataBr} excluído com sucesso!`)
      } else {
        alert('Erro ao excluir registro do encontro.')
      }
      await carregarHistoricoGrupo()
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
      ...frequenciasHistorico.map(f => (f.data || '').split('T')[0]),
      ...relatoriosHistorico.map(r => (r.data_encontro || '').split('T')[0])
    ])
  ).filter(Boolean).sort().reverse()

  const encontrosConsolidados = datasHistoricoUnicas.map(dStr => {
    const freq = frequenciasHistorico.find(f => compararDatas(f.data, dStr))
    const rel = relatoriosHistorico.find(r => compararDatas(r.data_encontro, dStr))

    const dataBr = formatarDataSemFuso(dStr)

    const registros = freq?.registros || []
    const presentesArr = freq?.presentes || []

    let qtdPresentes = 0
    let totalCadastrados = participantesGrupo.length

    if (registros.length > 0) {
      qtdPresentes = registros.filter((r: any) => r.status === 'presente').length
    } else if (presentesArr.length > 0) {
      qtdPresentes = presentesArr.length
    }

    let objetivoTexto = rel?.objetivo_encontro || rel?.atividade_realizada || ''

    if (!objetivoTexto) {
      if (freq && !rel) {
        objetivoTexto = 'Frequência Lançada (Aguardando Relatório)'
      } else {
        objetivoTexto = '—'
      }
    }

    return {
      dataStr: dStr,
      dataBr,
      objetivo: objetivoTexto,
      atividade: rel?.atividade_realizada || '—',
      qtdPresentes,
      totalCadastrados,
      temRelatorio: !!rel,
      temFrequencia: !!freq
    }
  })

  // Integrantes filtrados por busca
  const participantesFiltrados = useMemo(() => {
    if (!buscaParticipante.trim()) return participantesGrupo
    const termo = buscaParticipante.toLowerCase().trim()
    return participantesGrupo.filter(p => (p.nome || '').toLowerCase().includes(termo))
  }, [participantesGrupo, buscaParticipante])

  return (
    <div className="space-y-6 print:hidden">
      {/* Dynamic Modern Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 bottom-0 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 tracking-wider">
                Proteção Social Básica • SUAS Digital
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <i className="fa-solid fa-people-group text-indigo-400 text-xl"></i>
              <span>Oficinas & Grupos SCFV</span>
            </h2>
            <p className="text-xs text-indigo-200/90 leading-relaxed font-normal">
              Serviço de Convivência e Fortalecimento de Vínculos. Gestão integrada de coletivos, controle de frequências diárias e emissão de relatórios técnicos.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {/* Quick Stats Badges */}
            <div className="hidden lg:flex items-center gap-3 bg-white/5 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-xs">
              <div className="px-3 py-1 border-r border-white/10 text-center">
                <span className="text-[10px] uppercase text-indigo-300 block font-semibold">Coletivos Ativos</span>
                <strong className="text-base font-black text-white">{grupos.length}</strong>
              </div>
              <div className="px-3 py-1 text-center">
                <span className="text-[10px] uppercase text-indigo-300 block font-semibold">Integrantes</span>
                <strong className="text-base font-black text-emerald-400">{participantes.length}</strong>
              </div>
            </div>

            <button
              onClick={onAbrirModalNovoGrupo}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-3 rounded-xl text-xs shadow-lg transition flex items-center gap-2.5 hover:scale-[1.02] active:scale-95 border border-emerald-300"
            >
              <i className="fa-solid fa-plus text-sm"></i>
              <span>Criar Novo Coletivo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container Layout: Left Panel (Groups) & Right Panel (Group Details & History) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Coletivos Cadastrados */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-4 h-fit">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-layer-group text-indigo-600"></i>
              <span>Coletivos Ativos</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-indigo-100 text-indigo-900 border border-indigo-200">
              {grupos.length}
            </span>
          </div>

          {grupos.length === 0 ? (
            <div className="p-8 text-center bg-gray-50/70 rounded-xl border border-dashed border-gray-200 space-y-2">
              <i className="fa-solid fa-users-slash text-2xl text-gray-300 block"></i>
              <p className="text-xs text-gray-500 font-semibold">Nenhum grupo cadastrado.</p>
              <p className="text-[11px] text-gray-400">Clique em "Criar Novo Coletivo" para registrar o primeiro grupo.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {grupos.map(g => {
                const count = participantes.filter(p => p.grupo_id === g.id).length
                const isSelected = g.id === grupoAtual?.id

                return (
                  <div
                    key={g.id}
                    onClick={() => setGrupoSelecionadoId(g.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-500/30'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50/80 bg-white'
                    }`}
                  >
                    {/* Active Accent Left Border Bar */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600" />
                    )}

                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="font-extrabold text-gray-900 text-sm uppercase truncate">
                          {g.nome}
                        </h4>
                        <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100/80 px-2 py-0.5 rounded border border-indigo-200/60 uppercase inline-block">
                          {g.tipo_grupo || 'SCFV'}
                        </span>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 group-hover:bg-indigo-100 group-hover:text-indigo-900'
                      }`}>
                        {count} integrante{count !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2 uppercase font-medium">
                      {g.descricao || 'Sem descrição cadastrada'}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-gray-200/60 flex justify-between items-center text-[11px] text-gray-600">
                      <div className="flex items-center gap-1.5 font-semibold text-gray-700">
                        <i className="fa-solid fa-clock text-gray-400 text-[10px]"></i>
                        <span>{g.horario}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {onAbrirModalEditarGrupo && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              onAbrirModalEditarGrupo(g)
                            }}
                            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-indigo-600 text-gray-600 hover:text-white transition flex items-center justify-center border border-gray-200"
                            title="Editar Configurações do Grupo"
                          >
                            <i className="fa-solid fa-pen-to-square text-[10px]"></i>
                          </button>
                        )}
                        {onExcluirGrupo && podeExcluirGrupoScfv(usuarioLogado) && (
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation()
                              if (confirm(`Deseja realmente excluir o grupo "${g.nome}"?`)) {
                                await onExcluirGrupo(g.id)
                              }
                            }}
                            className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white transition flex items-center justify-center border border-rose-200"
                            title="Excluir Grupo"
                          >
                            <i className="fa-solid fa-trash-can text-[10px]"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Detailed View of Selected Group & Encounter History */}
        <div className="lg:col-span-2 space-y-6">
          {grupoAtual ? (
            <>
              {/* Coletivo Header Card & Operational Action Toolbar */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-5">
                
                {/* Header Information Banner */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-black text-gray-900 uppercase tracking-wide">
                        {grupoAtual.nome}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white uppercase tracking-wider shadow-xs">
                        {grupoAtual.tipo_grupo || 'SCFV'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 font-medium uppercase flex items-center gap-2 flex-wrap">
                      <span>{grupoAtual.descricao || 'Sem descrição cadastrada'}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-indigo-900 font-bold flex items-center gap-1">
                        <i className="fa-solid fa-clock text-indigo-600"></i>
                        {grupoAtual.horario}
                      </span>
                    </p>
                  </div>

                  {/* Actions Toolbar: Exclusively Icon Buttons in a Single Row */}
                  <div className="flex items-center gap-1.5 shrink-0 flex-nowrap">
                    <button
                      type="button"
                      onClick={() => onAbrirModalAdicionarParticipante(grupoAtual.id)}
                      className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition flex items-center justify-center border border-emerald-700"
                      title="Vincular Participante ao Grupo"
                    >
                      <i className="fa-solid fa-user-plus text-xs"></i>
                    </button>

                    {onAbrirModalFrequencia && (
                      <button
                        type="button"
                        onClick={() => onAbrirModalFrequencia(grupoAtual)}
                        className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition flex items-center justify-center border border-indigo-700"
                        title="Lançar Frequência / Chamada"
                      >
                        <i className="fa-solid fa-clipboard-user text-xs"></i>
                      </button>
                    )}

                    {onAbrirModalRelatorioGrupo && (
                      <button
                        type="button"
                        onClick={() => onAbrirModalRelatorioGrupo(grupoAtual)}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-900 text-white shadow-xs transition flex items-center justify-center border border-slate-900"
                        title="Novo Relatório Técnico do Encontro"
                      >
                        <i className="fa-solid fa-file-circle-plus text-xs"></i>
                      </button>
                    )}

                    {onAbrirModalRelatorioGeralGrupo && (
                      <button
                        type="button"
                        onClick={() => onAbrirModalRelatorioGeralGrupo(grupoAtual)}
                        className="w-8 h-8 rounded-lg bg-teal-700 hover:bg-teal-800 text-white shadow-xs transition flex items-center justify-center border border-teal-800"
                        title="Relatório Geral Consolidado (Todos os Encontros)"
                      >
                        <i className="fa-solid fa-file-contract text-xs"></i>
                      </button>
                    )}

                    <div className="h-5 w-px bg-gray-200 mx-0.5"></div>

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
                        title="Excluir Coletivo"
                      >
                        <i className="fa-solid fa-trash-can text-xs"></i>
                      </button>
                    )}
                  </div>
                </div>

                {/* Integrantes Matriculados Section with Search Filter */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                      <i className="fa-solid fa-users text-indigo-600"></i>
                      <span>Integrantes Matriculados ({participantesGrupo.length})</span>
                    </h4>

                    {participantesGrupo.length > 0 && (
                      <div className="relative w-full sm:w-64">
                        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                        <input
                          type="text"
                          value={buscaParticipante}
                          onChange={e => setBuscaParticipante(e.target.value)}
                          placeholder="FILTRAR INTEGRANTE POR NOME..."
                          className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-xl text-xs uppercase bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-semibold"
                        />
                      </div>
                    )}
                  </div>

                  <div className="overflow-x-auto border border-gray-200/80 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-700 font-extrabold uppercase text-[10px] border-b border-gray-200">
                        <tr>
                          <th className="py-2.5 px-3.5">Nome do Participante</th>
                          <th className="py-2.5 px-3.5 w-36">Data de Inclusão</th>
                          <th className="py-2.5 px-3.5 text-center w-24">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {participantesGrupo.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="py-8 text-center text-gray-400 bg-gray-50/50">
                              <i className="fa-solid fa-user-slash text-2xl text-gray-300 block mb-1.5"></i>
                              Nenhum integrante vinculado a este grupo.
                              <span className="block text-[11px] text-gray-400 mt-1">Utilize o botão "Vincular" no topo para matricular beneficiários.</span>
                            </td>
                          </tr>
                        ) : participantesFiltrados.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="py-6 text-center text-gray-400">
                              Nenhum integrante localizado com a busca "{buscaParticipante}".
                            </td>
                          </tr>
                        ) : (
                          participantesFiltrados.map(p => (
                            <tr key={p.id} className="hover:bg-indigo-50/30 transition">
                              <td className="py-2.5 px-3.5 font-bold text-gray-900 uppercase flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-900 flex items-center justify-center font-extrabold text-[10px] shrink-0 border border-indigo-200">
                                  {p.nome.charAt(0)}
                                </div>
                                <span>{p.nome}</span>
                              </td>
                              <td className="py-2.5 px-3.5 text-gray-500 font-medium">
                                {p.criado_em ? new Date(p.criado_em).toLocaleDateString('pt-BR') : '—'}
                              </td>
                              <td className="py-2.5 px-3.5 text-center">
                                {onExcluirParticipante && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (confirm(`Deseja desvincular ${p.nome} deste grupo?`)) {
                                        await onExcluirParticipante(p.id)
                                      }
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                    title="Desvincular do Coletivo"
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
              </div>

              {/* Seção do Histórico dos Relatórios & Encontros Realizados */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-gray-100">
                  <div>
                    <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                      <i className="fa-solid fa-clock-rotate-left text-indigo-600"></i>
                      <span>Histórico de Encontros & Relatórios Registrados ({encontrosConsolidados.length})</span>
                    </h4>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                      Consulte, edite ou imprima relatórios gravados por data de encontro.
                    </p>
                  </div>
                </div>

                {carregandoHistorico ? (
                  <div className="p-8 text-center text-xs text-gray-500 font-semibold bg-gray-50 rounded-xl border border-gray-100">
                    <i className="fa-solid fa-circle-notch animate-spin text-indigo-600 text-lg mr-2"></i>
                    Carregando histórico dos encontros...
                  </div>
                ) : encontrosConsolidados.length === 0 ? (
                  <div className="p-8 bg-gray-50/70 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400 font-medium">
                    <i className="fa-solid fa-folder-open text-2xl block text-gray-300 mb-2"></i>
                    Nenhum encontro ou relatório registrado para este grupo.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-gray-200/80 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-700 font-extrabold uppercase text-[10px] border-b border-gray-200">
                        <tr>
                          <th className="py-3 px-3.5 w-32">Data do Encontro</th>
                          <th className="py-3 px-3.5 w-36 text-center">Frequência</th>
                          <th className="py-3 px-3.5">Objetivo do Encontro</th>
                          <th className="py-3 px-3.5 text-center w-32">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {encontrosConsolidados.map((item) => (
                          <tr key={item.dataStr} className="hover:bg-gray-50/80 transition">
                            <td className="py-3.5 px-3.5 font-extrabold text-indigo-950 whitespace-nowrap align-top">
                              <div className="flex items-center gap-1.5">
                                <i className="fa-solid fa-calendar-day text-indigo-600 text-xs"></i>
                                <span>{item.dataBr}</span>
                              </div>
                            </td>

                            <td className="py-3.5 px-3.5 text-center whitespace-nowrap align-top">
                              <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-900 border border-indigo-200/80 shadow-xs">
                                {item.qtdPresentes} / {item.totalCadastrados} Presentes
                              </span>
                            </td>

                            <td className="py-3.5 px-3.5 font-medium text-gray-800 uppercase leading-relaxed align-top">
                              <p className="line-clamp-3 text-xs" title={item.objetivo}>
                                {item.objetivo}
                              </p>
                              {item.temRelatorio ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1 uppercase">
                                  <i className="fa-solid fa-check-double text-[8px]"></i> Relatório Técnico Salvo
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1 uppercase">
                                  <i className="fa-solid fa-clock text-[8px]"></i> Aguardando Relatório
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-3.5 text-center whitespace-nowrap align-top">
                              <div className="flex items-center justify-center gap-1.5">
                                {onAbrirModalRelatorioGrupo && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => onAbrirModalRelatorioGrupo(grupoAtual, item.dataStr, true)}
                                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-800 text-slate-700 hover:text-white transition flex items-center justify-center border border-slate-200"
                                      title="Visualizar / Imprimir Relatório do Encontro"
                                    >
                                      <i className="fa-solid fa-eye text-xs"></i>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => onAbrirModalRelatorioGrupo(grupoAtual, item.dataStr, false)}
                                      className="w-8 h-8 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white transition flex items-center justify-center border border-indigo-200"
                                      title="Editar Relatório do Encontro"
                                    >
                                      <i className="fa-solid fa-pen-to-square text-xs"></i>
                                    </button>
                                  </>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleExcluirEncontro(item.dataStr)}
                                  className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white transition flex items-center justify-center border border-rose-200"
                                  title="Excluir Registro do Encontro"
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
            <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center text-gray-400 space-y-2">
              <i className="fa-solid fa-layer-group text-3xl text-gray-300 block"></i>
              <p className="text-sm font-semibold">Selecione um grupo na coluna à esquerda para visualizar os detalhes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
