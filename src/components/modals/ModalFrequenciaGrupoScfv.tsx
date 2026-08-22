'use client'

import { useState, useEffect } from 'react'
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
  onClose,
  onSalvarFrequencia
}: ModalFrequenciaGrupoScfvProps) {
  const [salvando, setSalvando] = useState(false)
  const [carregandoHistorico, setCarregandoHistorico] = useState(true)
  const [historicoFrequencias, setHistoricoFrequencias] = useState<any[]>([])
  const [jaRegistrado, setJaRegistrado] = useState(false)

  const [dataChamada, setDataChamada] = useState<string>('')
  const [tecnico, setTecnico] = useState(usuarioLogadoNome || grupo.tecnico_responsavel || '')

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
  }, [grupo?.id])

  // 2. Quando a data do encontro ou o histórico mudar, sincronizar os status dos participantes
  useEffect(() => {
    if (!dataChamada) {
      setJaRegistrado(false)
      setFrequencias({})
      return
    }

    const registroExistente = historicoFrequencias.find(f => f.data === dataChamada)
    const mapaNovasFrequencias: Record<string, { status: StatusFrequencia; observacao: string }> = {}

    if (registroExistente) {
      setJaRegistrado(true)
      const registrosArr = registroExistente.registros || []
      const presentesArr = registroExistente.presentes || []

      participantes.forEach(p => {
        // Buscar por membro_id, id ou nome
        const regEncontrado = registrosArr.find(
          (r: any) =>
            (r.membro_id && (r.membro_id === p.membro_id || r.membro_id === p.id)) ||
            (r.nome && r.nome.toUpperCase() === p.nome.toUpperCase())
        )

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
        tecnico: tecnico.trim().toUpperCase() || 'TÉCNICO RESPONSÁVEL',
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
          {/* Cabeçalho do Formulário (Data, Resumo) */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 shrink-0 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                  Data do Encontro *
                </label>
                <input
                  type="date"
                  required
                  value={dataChamada}
                  onChange={e => setDataChamada(e.target.value)}
                  className={`w-full max-w-xs px-3 py-2 border rounded-xl text-xs font-bold bg-white text-gray-900 ${
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

              {jaRegistrado && (
                <div className="px-3 py-1.5 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-1.5 shrink-0">
                  <i className="fa-solid fa-circle-check text-emerald-600"></i> Chamada já registrada para este dia (Modo Edição)
                </div>
              )}
            </div>

            {!dataChamada ? (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-950 font-semibold text-xs flex items-center gap-2.5">
                <i className="fa-solid fa-calendar-days text-indigo-600 text-base shrink-0"></i>
                <p>Selecione a <strong>Data do Encontro</strong> no campo acima para carregar ou lançar a frequência do grupo.</p>
              </div>
            ) : !validacaoDia.valido ? (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 font-semibold text-xs flex items-center gap-2.5">
                <i className="fa-solid fa-triangle-exclamation text-amber-600 text-base shrink-0"></i>
                <div>
                  <p className="font-bold">Data incompatível com os dias de encontro do grupo!</p>
                  <p className="text-[11px] text-amber-900 font-medium">
                    A data selecionada ({dataChamada.split('-').reverse().join('/')}) cai em uma <strong>{validacaoDia.diaFormatado}</strong>, porém este grupo possui encontros configurados em: <strong>{validacaoDia.diasConfigurados}</strong>.
                  </p>
                </div>
              </div>
            ) : null}

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
                disabled={salvando || participantes.length === 0 || !validacaoDia.valido}
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
