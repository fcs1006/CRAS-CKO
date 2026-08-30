'use client'

import { useState, useEffect } from 'react'
import { GrupoSCFV, ParticipanteSCFV, Usuario } from '@/types'

interface ModalFrequenciaGrupoScfvProps {
  grupo: GrupoSCFV
  participantes: ParticipanteSCFV[]
  usuarioLogadoNome?: string
  usuarios?: Usuario[]
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

function validarDiaSemanaEncontro(dataStr: string, diasSemanaStr?: string) {
  if (!dataStr) return { valido: true, diaFormatado: '', diasConfigurados: '' }
  
  const diasConfig = (diasSemanaStr || '').trim()
  if (!diasConfig || diasConfig.toLowerCase().includes('periódico') || diasConfig.toLowerCase().includes('periodico')) {
    return { valido: true, diaFormatado: '', diasConfigurados: '' }
  }

  const [year, month, day] = dataStr.split('-').map(Number)
  if (!year || !month || !day) return { valido: true, diaFormatado: '', diasConfigurados: '' }

  const dateObj = new Date(year, month - 1, day)
  const dayOfWeekNum = dateObj.getDay()

  const mapDias: Record<number, { nome: string; regex: RegExp }> = {
    0: { nome: 'Domingo', regex: /domingo/i },
    1: { nome: 'Segunda-feira', regex: /segunda/i },
    2: { nome: 'Terça-feira', regex: /ter[çc]a/i },
    3: { nome: 'Quarta-feira', regex: /quarta/i },
    4: { nome: 'Quinta-feira', regex: /quinta/i },
    5: { nome: 'Sexta-feira', regex: /sexta/i },
    6: { nome: 'Sábado', regex: /s[áa]bado/i },
  }

  const diaAtual = mapDias[dayOfWeekNum]
  const valido = diaAtual ? diaAtual.regex.test(diasConfig) : true

  return {
    valido,
    diaFormatado: diaAtual ? diaAtual.nome : '',
    diasConfigurados: diasConfig
  }
}

export function ModalFrequenciaGrupoScfv({
  grupo,
  participantes,
  usuarioLogadoNome = '',
  usuarios = [],
  onClose,
  onSalvarFrequencia
}: ModalFrequenciaGrupoScfvProps) {
  const [salvando, setSalvando] = useState(false)
  const [carregandoHistorico, setCarregandoHistorico] = useState(true)
  const [historicoFrequencias, setHistoricoFrequencias] = useState<any[]>([])
  const [jaRegistrado, setJaRegistrado] = useState(false)

  const [dataChamada, setDataChamada] = useState<string>('')
  const [tecnico, setTecnico] = useState(usuarioLogadoNome || grupo.tecnico_responsavel || '')

  useEffect(() => {
    if (!tecnico && usuarioLogadoNome) {
      setTecnico(usuarioLogadoNome)
    }
  }, [usuarioLogadoNome, tecnico])

  const diasConfiguradosGrupo = grupo.dias_semana || grupo.horario || ''
  const validacaoDia = validarDiaSemanaEncontro(dataChamada, diasConfiguradosGrupo)

  const [frequencias, setFrequencias] = useState<Record<string, { status: StatusFrequencia; observacao: string }>>({})

  // 1. Carregar histórico de frequências do grupo da API
  async function carregarFrequenciasAnteriores() {
    if (!grupo?.id) return
    setCarregandoHistorico(true)
    try {
      const res = await fetch(`/api/scfv/frequencia?grupo_id=${grupo.id}`)
      if (res.ok) {
        const json = await res.json()
        if (json.ok && Array.isArray(json.data)) {
          setHistoricoFrequencias(json.data)
        }
      }
    } catch (err) {
      console.warn('Erro ao buscar frequências anteriores do grupo:', err)
    } finally {
      setCarregandoHistorico(false)
    }
  }

  useEffect(() => {
    carregarFrequenciasAnteriores()
  }, [grupo.id])

  // 2. Quando a dataChamada muda, verificar se já existe frequência salva para este dia
  useEffect(() => {
    if (!dataChamada) {
      setJaRegistrado(false)
      setFrequencias({})
      return
    }

    const freqExistente = historicoFrequencias.find((f: any) => {
      const fData = (f.data || '').split('T')[0].split(' ')[0].trim()
      return fData === dataChamada.trim()
    })

    const mapaNovasFrequencias: Record<string, { status: StatusFrequencia; observacao: string }> = {}

    if (freqExistente) {
      setJaRegistrado(true)
      if (freqExistente.tecnico) {
        setTecnico(freqExistente.tecnico)
      }
      const registrosArr: any[] = Array.isArray(freqExistente.registros) ? freqExistente.registros : []
      const presentesArr: any[] = Array.isArray(freqExistente.presentes) ? freqExistente.presentes : []

      participantes.forEach(p => {
        const regEncontrado = registrosArr.find(r => r.membro_id === p.membro_id || r.nome === p.nome)
        if (regEncontrado) {
          mapaNovasFrequencias[p.id] = {
            status: regEncontrado.status || 'presente',
            observacao: regEncontrado.observacao || ''
          }
        } else if (presentesArr.length > 0) {
          const ehPresente = presentesArr.includes(p.membro_id) || presentesArr.includes(p.id)
          mapaNovasFrequencias[p.id] = {
            status: ehPresente ? 'presente' : 'falta_nao_justificada',
            observacao: ''
          }
        } else {
          mapaNovasFrequencias[p.id] = { status: 'presente', observacao: '' }
        }
      })
    } else {
      setJaRegistrado(false)
      participantes.forEach(p => {
        mapaNovasFrequencias[p.id] = { status: 'presente', observacao: '' }
      })
    }

    setFrequencias(mapaNovasFrequencias)
  }, [dataChamada, historicoFrequencias, participantes])

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
    if (!tecnico.trim()) return alert('Por favor, informe ou selecione o Orientador(a) / Técnico(a) responsável.')

    if (!validacaoDia.valido) {
      const dataBr = dataChamada.split('-').reverse().join('/')
      return alert(
        `A data selecionada (${dataBr}) cai em uma ${validacaoDia.diaFormatado}.\n\n` +
        `Este grupo foi configurado para encontros em: ${validacaoDia.diasConfigurados}.\n` +
        `Selecione uma data que corresponda aos dias do encontro.`
      )
    }

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
        tecnico: tecnico.trim().toUpperCase(),
        registros
      })

      await carregarFrequenciasAnteriores()
      onClose()
    } catch (err: any) {
      alert('Erro ao registrar frequência: ' + (err.message || 'Tente novamente.'))
    } finally {
      setSalvando(false)
    }
  }

  const totalPresentes = Object.values(frequencias).filter(f => f.status === 'presente').length
  const totalFaltasJustificadas = Object.values(frequencias).filter(f => f.status === 'falta_justificada').length
  const totalFaltasNaoJustificadas = Object.values(frequencias).filter(f => f.status === 'falta_nao_justificada').length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-indigo-900 text-white p-4 sm:p-5 flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-800 text-indigo-200 uppercase border border-indigo-700">
                {grupo.faixa_etaria || 'SCFV'}
              </span>
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wide">
                Lançamento de Frequência / Chamada
              </h3>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              Grupo: <strong className="text-white">{grupo.nome}</strong> • {participantes.length} Participantes Vinculados
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-indigo-200 hover:text-white text-xl">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Cabeçalho do Formulário (Data, Técnico, Resumo) */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 shrink-0 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                  Data do Encontro *
                </label>
                <input
                  type="date"
                  required
                  value={dataChamada}
                  onChange={e => setDataChamada(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl text-xs font-bold bg-white text-gray-900 ${
                    !dataChamada
                      ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                      : !validacaoDia.valido
                      ? 'border-amber-500 text-amber-900 bg-amber-50/50 ring-2 ring-amber-500/20'
                      : 'border-gray-300'
                  }`}
                />
                {diasConfiguradosGrupo && (
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    Dias cadastrados: <strong className="text-indigo-800">{diasConfiguradosGrupo}</strong>
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                  Orientador(a) / Técnico(a) Responsável *
                </label>
                {usuarios && usuarios.length > 0 ? (
                  <select
                    value={tecnico}
                    onChange={e => setTecnico(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold bg-white text-gray-900 uppercase truncate"
                  >
                    <option value="">SELECIONE O PROFISSIONAL *</option>
                    {usuarios
                      .filter(u => u.ativo !== false)
                      .map(u => (
                        <option key={u.id} value={u.nome}>
                          {u.nome} ({u.cargo || u.perfil})
                        </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={tecnico}
                    onChange={e => setTecnico(e.target.value.toUpperCase())}
                    placeholder="NOME DO ORIENTADOR / TÉCNICO"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold bg-white text-gray-900 uppercase"
                  />
                )}
              </div>
            </div>

            {jaRegistrado && (
              <div className="px-3 py-1.5 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-1.5">
                <i className="fa-solid fa-circle-check text-emerald-600"></i> Chamada já registrada para este dia (Modo Edição)
              </div>
            )}

            {!dataChamada ? (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-950 font-semibold text-xs flex items-center gap-2.5">
                <i className="fa-solid fa-calendar-days text-indigo-600 text-base shrink-0"></i>
                <p>Selecione a <strong>Data do Encontro</strong> no campo acima para carregar ou lançar a frequência do grupo.</p>
              </div>
            ) : !validacaoDia.valido ? (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 font-semibold text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation text-amber-600 text-base shrink-0"></i>
                  <strong>Atenção: A data selecionada ({dataChamada.split('-').reverse().join('/')}) não é um dia habitual deste grupo.</strong>
                </div>
                <p className="text-[11px] text-amber-800 ml-6">
                  Este grupo realiza encontros em: <strong>{diasConfiguradosGrupo}</strong>. Certifique-se de selecionar a data correta.
                </p>
              </div>
            ) : null}

            {/* Placar de Resumo & Botões de Marcar Todos */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <i className="fa-solid fa-check text-emerald-600 mr-1"></i> {totalPresentes} Presentes
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
                  <i className="fa-solid fa-user-clock text-amber-600 mr-1"></i> {totalFaltasJustificadas} Justificadas
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 border border-rose-200">
                  <i className="fa-solid fa-xmark text-rose-600 mr-1"></i> {totalFaltasNaoJustificadas} Faltas
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-gray-500 font-bold uppercase mr-1">Marcar todos:</span>
                <button
                  type="button"
                  onClick={() => marcarTodos('presente')}
                  className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold transition"
                >
                  Presentes
                </button>
                <button
                  type="button"
                  onClick={() => marcarTodos('falta_justificada')}
                  className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold transition"
                >
                  Justificados
                </button>
                <button
                  type="button"
                  onClick={() => marcarTodos('falta_nao_justificada')}
                  className="px-2 py-1 bg-rose-700 hover:bg-rose-800 text-white rounded font-bold transition"
                >
                  Faltas
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Integrantes */}
          <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-gray-50/50">
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
                    className={`p-4 rounded-xl border transition space-y-3 ${
                      item.status === 'presente'
                        ? 'bg-emerald-50/40 border-emerald-200 shadow-2xs'
                        : item.status === 'falta_justificada'
                        ? 'bg-amber-50/50 border-amber-200 shadow-2xs'
                        : 'bg-rose-50/50 border-rose-200 shadow-2xs'
                    }`}
                  >
                    {/* Linha 1: Nome Completo do Participante sem truncamento */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/70 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-indigo-950 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <strong className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                          {p.nome}
                        </strong>
                      </div>

                      {/* Badge de Status */}
                      <span className={`self-start sm:self-auto px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        item.status === 'presente'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : item.status === 'falta_justificada'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-rose-100 text-rose-900 border-rose-300'
                      }`}>
                        {item.status === 'presente' ? 'Presente' : item.status === 'falta_justificada' ? 'Falta Justificada' : 'Falta Não Justificada'}
                      </span>
                    </div>

                    {/* Linha 2: Botões de Ação + Campo de Observação */}
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                      {/* Botões de Seleção de Status */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => alterarStatus(p.id, 'presente')}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition flex items-center gap-1.5 border ${
                            item.status === 'presente'
                              ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <i className="fa-solid fa-check"></i> Presente
                        </button>

                        <button
                          type="button"
                          onClick={() => alterarStatus(p.id, 'falta_justificada')}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition flex items-center gap-1.5 border ${
                            item.status === 'falta_justificada'
                              ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <i className="fa-solid fa-user-clock"></i> Justificada
                        </button>

                        <button
                          type="button"
                          onClick={() => alterarStatus(p.id, 'falta_nao_justificada')}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition flex items-center gap-1.5 border ${
                            item.status === 'falta_nao_justificada'
                              ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <i className="fa-solid fa-xmark"></i> Falta
                        </button>
                      </div>

                      {/* Observação / Justificativa Individual */}
                      <div className="flex-1 min-w-0 md:min-w-[240px]">
                        <input
                          type="text"
                          value={item.observacao}
                          onChange={e => alterarObservacao(p.id, e.target.value)}
                          placeholder="OBSERVAÇÃO / JUSTIFICATIVA..."
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium uppercase bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                        />
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t flex justify-end gap-2 shrink-0 p-4 bg-gray-50 border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 uppercase font-semibold text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando || participantes.length === 0 || !validacaoDia.valido}
              className="px-6 py-2 bg-indigo-800 hover:bg-indigo-900 text-white rounded-xl font-bold shadow transition uppercase flex items-center gap-1.5 text-xs disabled:opacity-50"
            >
              <i className="fa-solid fa-floppy-disk"></i>
              {salvando ? 'Gravando...' : 'Salvar Chamada & Histórico'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
