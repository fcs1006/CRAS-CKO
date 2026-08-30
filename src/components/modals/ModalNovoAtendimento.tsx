'use client'

import { useState, useEffect, useRef } from 'react'
import { Familia, Atendimento, Usuario } from '@/types'
import { isPsicologo, isAssistenteSocial, isTecnicoSuperior } from '@/utils/permissoes'
import { maskCPF } from '@/utils/masks'

interface ModalNovoAtendimentoProps {
  familias: Familia[]
  usuarios: Usuario[]
  usuarioLogadoNome: string
  usuarioLogado?: Usuario | null
  dadosIniciais?: (Partial<Atendimento> & { agenda_id?: string }) | null
  onClose: () => void
  onSalvar: (atendimento: Partial<Atendimento> & { agenda_id?: string }) => Promise<void>
}

export function ModalNovoAtendimento({
  familias = [],
  usuarios = [],
  usuarioLogadoNome,
  usuarioLogado,
  dadosIniciais,
  onClose,
  onSalvar
}: ModalNovoAtendimentoProps) {
  const [salvando, setSalvando] = useState(false)
  const [familiaId, setFamiliaId] = useState(dadosIniciais?.familia_id || '')
  const [usuarioVisitado, setUsuarioVisitado] = useState(dadosIniciais?.usuario_visitado || '')
  const [tipo, setTipo] = useState(dadosIniciais?.tipo || '')
  const [local, setLocal] = useState(dadosIniciais?.local || '')
  const [data, setData] = useState(dadosIniciais?.data || new Date().toISOString().split('T')[0])
  const [hora, setHora] = useState(dadosIniciais?.hora || new Date().toTimeString().slice(0, 5))
  const [tecnico, setTecnico] = useState(dadosIniciais?.tecnico || usuarioLogadoNome || '')
  const [compartilhada, setCompartilhada] = useState<'Sim' | 'Não' | ''>((dadosIniciais?.compartilhada as 'Sim' | 'Não') || 'Não')
  const [profissionaisParticipantes, setProfissionaisParticipantes] = useState(dadosIniciais?.profissionais_participantes || '')
  const [selecionadosCompartilhados, setSelecionadosCompartilhados] = useState<string[]>([])
  const [outrosProfissionaisTexto, setOutrosProfissionaisTexto] = useState('')
  const [relato, setRelato] = useState(dadosIniciais?.relato || '')
  const [providencias, setProvidencias] = useState(dadosIniciais?.providencias || '')

  // 1. Sigilo Profissional: NUNCA vem pré-preenchido, deve ser selecionado pelo usuário
  const [sigilo, setSigilo] = useState<string>(dadosIniciais?.sigilo || '')

  // 2. Busca e Autocomplete de Família / Prontuário
  const [buscaFamilia, setBuscaFamilia] = useState('')
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)
  const containerBuscaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!tecnico && usuarioLogadoNome) {
      setTecnico(usuarioLogadoNome)
    }
  }, [usuarioLogadoNome])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerBuscaRef.current && !containerBuscaRef.current.contains(event.target as Node)) {
        setMostrarSugestoes(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const familiaSelecionada = familias.find(f => f.id === familiaId)

  // Filtragem de famílias em tempo real para o autocomplete
  const sugestoesFamilias = familias.filter(f => {
    if (!buscaFamilia.trim()) return true
    const termo = buscaFamilia.toLowerCase().trim()
    const cpfLimpo = termo.replace(/\D/g, '')

    const bateResp = (f.responsavel || '').toLowerCase().includes(termo)
    const bateProntuario = (f.cod_familiar || '').toLowerCase().includes(termo)
    const bateCpf = cpfLimpo.length > 0 && (f.cpf_responsavel || '').includes(cpfLimpo)
    const bateBairro = (f.bairro || '').toLowerCase().includes(termo)
    const bateMembro = (f.membros || []).some(m =>
      (m.nome || '').toLowerCase().includes(termo) ||
      (cpfLimpo.length > 0 && (m.cpf || '').includes(cpfLimpo))
    )

    return bateResp || bateProntuario || bateCpf || bateBairro || bateMembro
  }).slice(0, 15)

  function selecionarFamilia(f: Familia) {
    setFamiliaId(f.id)
    setUsuarioVisitado(f.responsavel || '')
    setBuscaFamilia('')
    setMostrarSugestoes(false)
  }

  function handleTipoChange(novoTipo: string) {
    setTipo(novoTipo)
    if (novoTipo === 'Visita Domiciliar') {
      setLocal('Domicílio')
    } else if (novoTipo === 'Recepção / Acolhida Inicial' || novoTipo === 'Atendimento Particularizado' || novoTipo === 'Acompanhamento PAIF') {
      if (!local || local === 'Domicílio') setLocal('CRAS')
    }
  }

  function toggleProfissionalCompartilhado(nomeCargo: string) {
    setSelecionadosCompartilhados(prev =>
      prev.includes(nomeCargo) ? prev.filter(n => n !== nomeCargo) : [...prev, nomeCargo]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!familiaId) {
      alert('Por favor, busque e selecione a Família / Prontuário atendido.')
      return
    }
    if (!usuarioVisitado.trim()) {
      alert('Por favor, informe quem foi a pessoa atendida / solicitante.')
      return
    }
    if (!tipo) {
      alert('Por favor, selecione a tipologia do atendimento (SUAS/RMA).')
      return
    }
    if (!local) {
      alert('Por favor, selecione o local do atendimento.')
      return
    }
    if (!data) {
      alert('Por favor, informe a data do atendimento.')
      return
    }
    if (!hora) {
      alert('Por favor, informe o horário do atendimento.')
      return
    }
    if (!tecnico) {
      alert('Por favor, selecione o técnico responsável.')
      return
    }

    // Validação estrita do Nível de Sigilo para Equipe Técnica
    const ehTecnicoSuperior = isTecnicoSuperior(usuarioLogado)
    if (ehTecnicoSuperior && !sigilo) {
      alert('Por favor, selecione o Nível de Sigilo Profissional / Privacidade da Escuta.')
      return
    }

    if (!relato.trim()) {
      alert('Por favor, preencha a síntese / relato técnico da escuta qualificada.')
      return
    }

    if (!providencias.trim()) {
      alert('Por favor, informe as Providências Adotadas e Encaminhamentos.')
      return
    }

    let profissionaisFinais: string | undefined = undefined
    if (compartilhada === 'Sim') {
      const lista = [...selecionadosCompartilhados]
      if (outrosProfissionaisTexto.trim()) {
        lista.push(outrosProfissionaisTexto.trim().toUpperCase())
      }
      if (lista.length === 0 && profissionaisParticipantes.trim()) {
        lista.push(profissionaisParticipantes.trim().toUpperCase())
      }
      if (lista.length === 0) {
        alert('Por favor, selecione ou informe ao menos um profissional participante do atendimento compartilhado.')
        return
      }
      profissionaisFinais = lista.join(', ')
    }

    setSalvando(true)

    try {
      const tecnicoObj = usuarios.find(u => u.nome === tecnico || u.usuario === tecnico)
      const conselhoInfo = tecnicoObj?.conselho && tecnicoObj.conselho !== 'Não aplicável' ? tecnicoObj.conselho : undefined
      const sigiloFinal = sigilo || 'publico'

      const atendimentoPayload: Partial<Atendimento> & { agenda_id?: string } = {
        familia_id: familiaId,
        data,
        hora,
        usuario_visitado: usuarioVisitado.trim().toUpperCase(),
        participantes_familiares: [usuarioVisitado.trim().toUpperCase()],
        local,
        compartilhada: (compartilhada as 'Sim' | 'Não') || 'Não',
        profissionais_participantes: compartilhada === 'Sim' ? profissionaisFinais : undefined,
        tecnico: tecnico.trim().toUpperCase(),
        tecnico_conselho: conselhoInfo,
        sigilo: sigiloFinal,
        relato: `${relato.trim().toUpperCase()}\n\n[SIGILO:${sigiloFinal}]`,
        providencias: providencias.trim().toUpperCase(),
        tipo,
        agenda_id: dadosIniciais?.agenda_id
      }

      await onSalvar(atendimentoPayload)
      onClose()
    } catch (err: any) {
      alert('Erro ao registrar atendimento: ' + (err.message || 'Tente novamente.'))
    } finally {
      setSalvando(false)
    }
  }

  const ehTecnicoSuperior = isTecnicoSuperior(usuarioLogado)
  const ehPsico = isPsicologo(usuarioLogado)
  const ehSocial = isAssistenteSocial(usuarioLogado)
  const ehAdmin = usuarioLogado?.perfil === 'admin' || (usuarioLogado?.cargo || '').toLowerCase().includes('coordenad') || (usuarioLogado?.cargo || '').toLowerCase().includes('diretor')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-teal-900 text-white p-5 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
              <i className="fa-solid fa-notes-medical text-teal-300"></i> Registro de Atendimento / Evolução Técnica (SUAS)
            </h3>
            <p className="text-[11px] text-teal-200 mt-0.5">
              Instrumento Oficial de Registro de Atendimentos do Prontuário SUAS
            </p>
          </div>
          <button onClick={onClose} className="text-teal-200 hover:text-white text-xl">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Seleção da Família por Busca / Autocomplete */}
          <div ref={containerBuscaRef} className="relative">
            <label className="block text-xs font-bold text-gray-800 mb-1 uppercase flex items-center justify-between">
              <span>Família / Prontuário SUAS <span className="text-red-600 font-bold">*</span></span>
              {familiaSelecionada && (
                <span className="text-[10px] text-gray-500 font-normal">
                  Prontuário Nº {familiaSelecionada.cod_familiar}
                </span>
              )}
            </label>

            {familiaSelecionada ? (
              <div className="p-3.5 bg-teal-50/80 border border-teal-200 rounded-xl flex flex-wrap justify-between items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-sm font-extrabold text-teal-950 uppercase">
                      {familiaSelecionada.responsavel}
                    </strong>
                    {familiaSelecionada.paif_ativo ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase">
                        <i className="fa-solid fa-circle-check mr-1 text-emerald-700"></i> PAIF Ativo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-700 border border-gray-300 uppercase">
                        Sem Acompanhamento PAIF
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-teal-900 font-medium">
                    CPF: {familiaSelecionada.cpf_responsavel ? maskCPF(familiaSelecionada.cpf_responsavel) : '—'} • Prontuário nº {familiaSelecionada.cod_familiar} • Bairro: {familiaSelecionada.bairro || '—'} ({familiaSelecionada.zona_territorio || 'Urbana'})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFamiliaId('')
                    setUsuarioVisitado('')
                    setBuscaFamilia('')
                    setMostrarSugestoes(true)
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-teal-100 text-teal-800 border border-teal-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                >
                  <i className="fa-solid fa-arrows-rotate"></i> Trocar Família
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-teal-700 text-xs"></i>
                  <input
                    type="text"
                    value={buscaFamilia}
                    onChange={e => {
                      setBuscaFamilia(e.target.value)
                      setMostrarSugestoes(true)
                    }}
                    onFocus={() => setMostrarSugestoes(true)}
                    placeholder="DIGITE O NOME DO RESPONSÁVEL, INTEGRANTE, CPF OU Nº DO PRONTUÁRIO..."
                    className="w-full pl-9 pr-3 py-2.5 border-2 border-teal-700/30 focus:border-teal-700 rounded-xl text-xs uppercase font-semibold bg-white shadow-xs focus:outline-none"
                  />
                </div>

                {/* Dropdown com resultados filtrados */}
                {mostrarSugestoes && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 divide-y divide-gray-100">
                    {sugestoesFamilias.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 font-medium">
                        Nenhuma família encontrada para "{buscaFamilia}".
                      </div>
                    ) : (
                      sugestoesFamilias.map(f => (
                        <div
                          key={f.id}
                          onClick={() => selecionarFamilia(f)}
                          className="p-3 hover:bg-teal-50/70 transition cursor-pointer flex justify-between items-center gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-gray-900 uppercase font-bold text-xs">
                                {f.responsavel}
                              </strong>
                              {f.paif_ativo ? (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-900 border border-emerald-200 uppercase">
                                  PAIF
                                </span>
                              ) : null}
                            </div>
                            <p className="text-[11px] text-gray-600 font-medium mt-0.5">
                              Prontuário: <span className="font-mono text-teal-900 font-bold">{f.cod_familiar}</span> • CPF: {f.cpf_responsavel ? maskCPF(f.cpf_responsavel) : '—'} • {f.bairro || 'Zona Urbana'}
                            </p>
                          </div>
                          <span className="text-[11px] font-bold text-teal-800 bg-teal-100/60 px-2.5 py-1 rounded-md shrink-0">
                            Selecionar
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pessoa Atendida e Tipo de Atendimento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                Pessoa Atendida / Solicitante <span className="text-red-600 font-bold">*</span>
              </label>
              {familiaSelecionada ? (
                <select
                  value={usuarioVisitado}
                  onChange={e => setUsuarioVisitado(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-bold text-teal-950 truncate"
                >
                  <option value="">SELECIONE QUEM FOI ATENDIDO *</option>
                  <option value={familiaSelecionada.responsavel}>
                    {familiaSelecionada.responsavel} (Responsável Familiar)
                  </option>
                  {familiaSelecionada.membros && familiaSelecionada.membros
                    .filter(m => m.nome.trim().toUpperCase() !== familiaSelecionada.responsavel.trim().toUpperCase())
                    .map(m => (
                      <option key={m.id || m.nome} value={m.nome}>
                        {m.nome} ({m.parentesco || 'Membro Familiar'})
                      </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={usuarioVisitado}
                  onChange={e => setUsuarioVisitado(e.target.value.toUpperCase())}
                  placeholder="SELECIONE A FAMÍLIA ACIMA"
                  className="w-full px-3 py-2 border rounded-lg text-xs uppercase font-medium bg-gray-50 text-gray-500"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                Tipologia do Atendimento (SUAS/RMA) <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                value={tipo}
                onChange={e => handleTipoChange(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-bold text-gray-900 uppercase truncate"
              >
                <option value="">SELECIONE A TIPOLOGIA DO RMA *</option>
                <option value="Recepção / Acolhida Inicial">RECEPÇÃO / ACOLHIDA INICIAL (PORTA DE ENTRADA)</option>
                <option value="Atendimento Particularizado">ATENDIMENTO PARTICULARIZADO (PONTUAL / DEMANDA)</option>
                <option value="Acompanhamento PAIF">
                  ACOMPANHAMENTO PAIF {familiaSelecionada && !familiaSelecionada.paif_ativo ? '(AVISO: FAMÍLIA SEM PAIF ATIVO)' : ''}
                </option>
                <option value="Visita Domiciliar">VISITA DOMICILIAR (PAIF / TERRITÓRIO)</option>
                <option value="Atendimento em Grupo / Coletivo">ATENDIMENTO EM GRUPO / COLETIVO</option>
              </select>
            </div>
          </div>

          {/* Verificação e Alerta de Família sem PAIF Ativo ao escolher Acompanhamento PAIF */}
          {tipo === 'Acompanhamento PAIF' && familiaSelecionada && !familiaSelecionada.paif_ativo && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-xs flex items-start gap-2.5">
              <i className="fa-solid fa-triangle-exclamation text-amber-600 mt-0.5 text-sm shrink-0"></i>
              <div>
                <strong className="block uppercase font-bold text-amber-950">Atenção: Esta família não possui Acompanhamento PAIF ativo no cadastro.</strong>
                <p className="mt-0.5 leading-relaxed text-[11px]">
                  Para atendimentos individualizados que não façam parte de um Plano de Acompanhamento Familiar (PAF) continuado, selecione <strong>"Atendimento Particularizado"</strong> ou <strong>"Recepção / Acolhida Inicial"</strong>. Caso a família esteja ingressando no PAIF, ative o acompanhamento no Prontuário.
                </p>
              </div>
            </div>
          )}

          {/* Técnico Responsável e Local */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                Técnico(a) Responsável <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                value={tecnico}
                onChange={e => setTecnico(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-bold text-teal-950 truncate"
              >
                <option value="">SELECIONE O TÉCNICO *</option>
                {usuarios
                  .filter(u => u.ativo !== false)
                  .map(u => (
                    <option key={u.id} value={u.nome}>
                      {u.nome} ({u.cargo || u.perfil}) {u.conselho && u.conselho !== 'Não aplicável' ? `— ${u.conselho}` : ''}
                    </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                Local da Ação <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                value={local}
                onChange={e => setLocal(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-bold text-gray-900"
              >
                <option value="">SELECIONE O LOCAL *</option>
                <option value="CRAS">CRAS (PRESENCIAL NA UNIDADE)</option>
                <option value="Domicílio">DOMICÍLIO (VISITA TÉCNICA)</option>
                <option value="Outro">OUTRO ESPAÇO COMUNITÁRIO / PÚBLICO</option>
              </select>
            </div>
          </div>

          {/* Data, Horário e Ação Compartilhada */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                Data do Atendimento <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="date"
                required
                value={data}
                onChange={e => setData(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs font-semibold bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                Horário <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="time"
                required
                value={hora}
                onChange={e => setHora(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs font-semibold bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                Atendimento Compartilhado?
              </label>
              <select
                value={compartilhada}
                onChange={e => setCompartilhada(e.target.value as 'Sim' | 'Não')}
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-bold text-gray-900"
              >
                <option value="Não">Não (Individual)</option>
                <option value="Sim">Sim (Com Co-visitantes/Equipe)</option>
              </select>
            </div>
          </div>

          {/* Seleção de Profissionais Co-visitantes */}
          {compartilhada === 'Sim' && (
            <div className="p-3.5 bg-teal-50/80 border border-teal-300 rounded-xl space-y-3">
              <label className="block text-xs font-bold text-teal-950 uppercase flex items-center gap-1.5">
                <i className="fa-solid fa-users text-teal-700"></i> Selecione os Profissionais Co-Participantes / Co-Visitantes *
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1">
                {usuarios
                  .filter(u => u.ativo !== false && u.nome !== tecnico)
                  .map(u => {
                    const labelProfissional = `${u.nome} (${u.cargo || u.perfil})`
                    const selecionado = selecionadosCompartilhados.includes(labelProfissional)
                    return (
                      <label
                        key={u.id}
                        onClick={() => toggleProfissionalCompartilhado(labelProfissional)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                          selecionado
                            ? 'bg-teal-700 text-white font-bold border-teal-800 shadow-2xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selecionado}
                          readOnly
                          className="rounded text-teal-800 focus:ring-teal-700"
                        />
                        <span className="truncate">{u.nome} <span className="text-[10px] opacity-80">({u.cargo || u.perfil})</span></span>
                      </label>
                    )
                  })}
              </div>

              <div className="pt-1">
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Outros Profissionais Externos / Participantes Adicionais (opcional):
                </label>
                <input
                  type="text"
                  value={outrosProfissionaisTexto}
                  onChange={e => setOutrosProfissionaisTexto(e.target.value.toUpperCase())}
                  placeholder="EX: ENFERMEIRA MARIA (POSTO DE SAÚDE), CONSELHEIRO PEDRO..."
                  className="w-full px-3 py-2 border rounded-lg text-xs uppercase bg-white"
                />
              </div>
            </div>
          )}

          {/* Nível de Sigilo Profissional: NÃO VEM PRÉ-PREENCHIDO, EXIGE ESCOLHA EXPLÍCITA */}
          {ehTecnicoSuperior && (
            <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1.5">
              <label className="block text-xs font-bold text-amber-950 uppercase flex items-center gap-1.5">
                <i className="fa-solid fa-lock text-amber-700"></i> Nível de Sigilo Profissional / Privacidade da Escuta <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                value={sigilo}
                onChange={e => setSigilo(e.target.value)}
                required
                className="w-full px-3 py-2 border-2 border-amber-300 focus:border-amber-500 rounded-lg text-xs bg-white uppercase font-bold text-gray-900"
              >
                <option value="">SELECIONE O NÍVEL DE SIGILO PROFISSIONAL *</option>
                <option value="equipe_tecnica">Restrito à Equipe Técnica Superior (Assistentes Sociais e Psicólogos)</option>

                {(ehPsico || ehAdmin) && (
                  <option value="apenas_psicologia">Restrito à Categoria Profissional de Psicologia (Resolução CFP / CRP)</option>
                )}

                {(ehSocial || ehAdmin) && (
                  <option value="apenas_servico_social">Restrito à Categoria Profissional de Serviço Social (Código de Ética CRESS)</option>
                )}

                <option value="publico">Geral / Público (Visível para toda a equipe do CRAS)</option>
              </select>
              {compartilhada === 'Sim' && (
                <p className="text-[10px] text-teal-900 font-medium">
                  Atendimento compartilhado: os profissionais e co-visitantes selecionados terão acesso garantido à leitura deste registro.
                </p>
              )}
            </div>
          )}

          {/* Relato Técnico / Síntese */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1 uppercase">
              Síntese do Atendimento / Relato Técnico (SUAS) <span className="text-red-600 font-bold">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={relato}
              onChange={e => setRelato(e.target.value.toUpperCase())}
              placeholder="DESCREVA DE FORMA OBJETIVA A DEMANDA APRESENTADA, A ESCUTA QUALIFICADA E A INTERVENÇÃO REALIZADA..."
              className="w-full px-3 py-2 border rounded-lg text-xs uppercase leading-relaxed font-medium bg-white"
            />
          </div>

          {/* Providências / Encaminhamentos */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1 uppercase">
              Providências Adotadas e Encaminhamentos <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={providencias}
              onChange={e => setProvidencias(e.target.value.toUpperCase())}
              placeholder="ORIENTAÇÕES FORNECIDAS, INSERÇÃO EM GRUPO, AGENDAMENTO DE VISITA OU ENCAMINHAMENTOS..."
              className="w-full px-3 py-2 border rounded-lg text-xs uppercase leading-relaxed font-medium bg-white"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 uppercase font-semibold text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-6 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shadow-md transition uppercase flex items-center gap-2"
            >
              <i className={`fa-solid ${salvando ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`}></i>
              {salvando ? 'Salvando...' : 'Salvar Atendimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}