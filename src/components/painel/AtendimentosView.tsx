import { useState } from 'react'
import { Atendimento, AgendaItem, Familia, Configuracao, Usuario } from '@/types'
import { maskCPF } from '@/utils/masks'
import { DocumentoOficialLayout } from '@/components/impressao/DocumentoOficialLayout'
import { verificarAcessoRelatoAtendimento } from '@/utils/permissoes'

interface AtendimentosViewProps {
  atendimentos: Atendimento[]
  agenda?: AgendaItem[]
  familias?: Familia[]
  usuarios?: Usuario[]
  configuracao?: Configuracao
  usuarioLogado?: Usuario | null
  onAbrirModalNovoAtendimento: (dadosPreenchidos?: Partial<Atendimento> & { agenda_id?: string }) => void
  onAbrirModalNovoAgendamento?: () => void
  onAtualizarStatusAgendamento?: (agendamento: AgendaItem, novoStatus: string, motivoCancelamento?: string) => void
  onEditarAtendimento?: (id: string, atendimentoData: Partial<Atendimento>) => Promise<void>
  onExcluirAtendimento?: (id: string) => Promise<void>
}

function extrairInfoTecnico(rawStr: string, listaUsuarios: Usuario[] = []) {
  if (!rawStr) return { nome: 'NÃO INFORMADO', cargoConselho: 'TÉCNICO(A) RESPONSÁVEL — CRAS' }

  let nome = rawStr.trim()
  let cargo = ''
  let conselho = ''

  // 1. Tentar extrair do formato "NOME (CARGO — CONSELHO)" ou "NOME (CARGO)" ou "NOME - CARGO"
  const matchParenteses = nome.match(/^(.*?)\s*\((.*?)\)$/)
  if (matchParenteses) {
    nome = matchParenteses[1].trim()
    const interior = matchParenteses[2].trim()
    if (interior.includes('—') || interior.includes(' - ')) {
      const parts = interior.split(/[—]|(?:\s+-\s+)/).map(s => s.trim())
      cargo = parts[0]
      conselho = parts.slice(1).join(' — ')
    } else {
      cargo = interior
    }
  }

  // 2. Tentar buscar pelo nome na lista de usuários cadastrados
  const cleanNome = nome.toUpperCase().trim()
  const usuarioEncontrado = listaUsuarios.find(u => {
    const uNome = (u.nome || '').toUpperCase().trim()
    return uNome === cleanNome || cleanNome.startsWith(uNome) || uNome.startsWith(cleanNome)
  })

  if (usuarioEncontrado) {
    nome = usuarioEncontrado.nome
    if (!cargo && usuarioEncontrado.cargo) cargo = usuarioEncontrado.cargo
    if (!conselho && usuarioEncontrado.conselho && usuarioEncontrado.conselho !== 'Não aplicável') {
      conselho = usuarioEncontrado.conselho
    }
  }

  if (conselho === 'Não aplicável') conselho = ''

  // Montar a segunda linha (Cargo e Conselho)
  let cargoConselho = ''
  if (cargo && conselho) {
    cargoConselho = `${cargo} — ${conselho}`
  } else if (cargo) {
    cargoConselho = cargo
  } else if (conselho) {
    cargoConselho = conselho
  } else {
    cargoConselho = 'TÉCNICO(A) RESPONSÁVEL — CRAS'
  }

  return {
    nome: nome.toUpperCase(),
    cargoConselho: cargoConselho.toUpperCase()
  }
}

export function ConteudoDocumentoAtendimento({
  item,
  configuracao,
  familias = [],
  usuarios = [],
  usuarioLogado
}: {
  item: Atendimento
  configuracao?: Configuracao
  familias?: Familia[]
  usuarios?: Usuario[]
  usuarioLogado?: Usuario | null
}) {
  const resSigilo = verificarAcessoRelatoAtendimento(item, usuarioLogado)
  const relatoExibido = resSigilo.podeVer ? (item.relato || 'Atendimento socioassistencial realizado no âmbito das ações do PAIF / CRAS.') : resSigilo.mensagemOculta
  const providenciasExibidas = resSigilo.podeVer ? (item.providencias || 'Orientações socioassistenciais prestadas e inserção no acompanhamento familiar do PAIF / CRAS.') : '[CONTEÚDO RESTRITO À CATEGORIA HABILITADA CONFORME SIGILO PROFISSIONAL]'
  const isCompartilhada = item.compartilhada === 'Sim' || item.tecnico?.toLowerCase().includes('co-visitantes') || Boolean(item.profissionais_participantes)

  const rawTecnico = (item.tecnico || '').trim()
  let tecnicoPrincipal = rawTecnico
  let coTecnicos: string[] = []

  // Extrair Co-visitantes de item.tecnico mesmo em caixa alta ou com parênteses internos
  const regexCoVisitantes = /\s*\((?:co[- ](?:visitantes?|participantes?)|participantes?):\s*([\s\S]+?)\)\s*$/i
  const matchCo = rawTecnico.match(regexCoVisitantes)

  if (matchCo) {
    tecnicoPrincipal = rawTecnico.replace(regexCoVisitantes, '').trim()
    const strCo = matchCo[1].trim()
    coTecnicos = strCo.split(/,\s*(?=[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ0-9])/i).map(s => s.trim()).filter(Boolean)
  }

  if (item.profissionais_participantes) {
    const listPart = item.profissionais_participantes.split(/,\s*(?=[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ0-9])/i).map(s => s.trim()).filter(Boolean)
    if (listPart.length > 0) {
      coTecnicos = Array.from(new Set([...coTecnicos, ...listPart]))
    }
  }

  // Limpeza de segurança final em tecnicoPrincipal
  tecnicoPrincipal = tecnicoPrincipal.replace(/\s*\((?:co[- ](?:visitantes?|participantes?)|participantes?):.*$/i, '').trim()
  if (!tecnicoPrincipal) tecnicoPrincipal = 'TÉCNICO RESPONSÁVEL'

  const infoPrincipal = extrairInfoTecnico(tecnicoPrincipal, usuarios)
  const infosCoTecnicos = coTecnicos.map(ct => extrairInfoTecnico(ct, usuarios))

  // Buscar CPF do beneficiário / família
  let cpfBeneficiario = ''
  if (item.familia_id) {
    const fam = familias.find(f => f.id === item.familia_id)
    if (fam) {
      cpfBeneficiario = fam.cpf_responsavel || ''
      if (!cpfBeneficiario && fam.membros) {
        const m = fam.membros.find(mb => mb.nome.trim().toLowerCase() === (item.usuario_visitado || '').trim().toLowerCase())
        if (m) cpfBeneficiario = m.cpf || ''
      }
    }
  }
  if (!cpfBeneficiario && item.usuario_visitado) {
    for (const fam of familias) {
      if (fam.responsavel.trim().toLowerCase() === item.usuario_visitado.trim().toLowerCase()) {
        cpfBeneficiario = fam.cpf_responsavel || ''
        break
      }
      if (fam.membros) {
        const m = fam.membros.find(mb => mb.nome.trim().toLowerCase() === item.usuario_visitado?.trim().toLowerCase())
        if (m && m.cpf) {
          cpfBeneficiario = m.cpf
          break
        }
      }
    }
  }

  const dataExtenso = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <DocumentoOficialLayout
      configuracao={configuracao}
      tituloDocumento="REGISTRO OFICIAL DE"
      subtituloDocumento="ATENDIMENTO"
      dataExtensa={dataExtenso}
      assinaturas={
        <div className={`pt-10 pb-2 ${isCompartilhada ? 'grid grid-cols-2 gap-8' : 'flex justify-center'} text-center uppercase text-[10px]`}>
          <div className="border-t-[1.5px] border-black pt-1.5 min-w-[260px] max-w-[340px] mx-auto">
            <p className="font-extrabold text-black text-[10.5px] leading-tight">{infoPrincipal.nome}</p>
            <p className="text-black font-semibold text-[9.5px] leading-tight mt-0.5">{infoPrincipal.cargoConselho}</p>
          </div>

          {isCompartilhada && (
            infosCoTecnicos.length > 0 ? (
              infosCoTecnicos.map((coTec, idx) => (
                <div key={idx} className="border-t-[1.5px] border-black pt-1.5 min-w-[260px] max-w-[340px] mx-auto">
                  <p className="font-extrabold text-black text-[10.5px] leading-tight">{coTec.nome}</p>
                  <p className="text-black font-semibold text-[9.5px] leading-tight mt-0.5">{coTec.cargoConselho}</p>
                </div>
              ))
            ) : (
              <div className="border-t-[1.5px] border-black pt-1.5 min-w-[260px] max-w-[340px] mx-auto">
                <p className="font-extrabold text-black text-[10.5px] leading-tight">PROFISSIONAL CO-PARTICIPANTE</p>
                <p className="text-black font-semibold text-[9.5px] leading-tight mt-0.5">TÉCNICO(A) CONVIDADO(A)</p>
              </div>
            )
          )}
        </div>
      }
    >
      {/* 1. Identificação do Usuário / Família e Atendimento */}
      <div className="space-y-1">
        <h4 className="text-[11px] font-black uppercase text-black border-b-[1.5px] border-black pb-0.5 tracking-wide">
          1. Identificação do(a) Beneficiário(a) e Dados do Atendimento
        </h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 text-[10.5px]">
          <div>
            <strong className="font-extrabold">Pessoa / Família Atendida:</strong> {(item.usuario_visitado || item.responsavel_nome || 'NÃO INFORMADO').toUpperCase()}
          </div>
          <div>
            <strong className="font-extrabold">CPF:</strong> {cpfBeneficiario ? maskCPF(cpfBeneficiario) : '—'}
          </div>
          <div>
            <strong className="font-extrabold">Técnico(a) Responsável:</strong> {infoPrincipal.nome}
          </div>
          <div>
            <strong className="font-extrabold">Data & Horário:</strong> {item.data ? item.data.split('-').reverse().join('/') : '—'} às {item.hora || '10:00'}
          </div>
          <div className="col-span-2">
            <strong className="font-extrabold">Tipologia & Local:</strong> {item.tipo?.toUpperCase()} ({item.local || 'CRAS'}) {isCompartilhada ? ' • AÇÃO COMPARTILHADA' : ''}
            {isCompartilhada && infosCoTecnicos.length > 0 && (
              <span className="block text-[10px] font-semibold text-black mt-0.5">
                Co-participantes: {infosCoTecnicos.map(c => c.nome).join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Relato Técnico / Síntese */}
      <div className="space-y-1 w-full max-w-full overflow-hidden">
        <h4 className="text-[11px] font-black uppercase text-black border-b-[1.5px] border-black pb-0.5 tracking-wide">
          2. Relato Técnico / Síntese da Escuta Qualificada
        </h4>
        <div className="p-2.5 border border-black rounded bg-white text-[10.5px] leading-relaxed text-black font-normal min-h-[90px] text-justify whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] max-w-full overflow-hidden">
          {relatoExibido}
        </div>
      </div>

      {/* 3. Providências Adotadas */}
      <div className="space-y-1 w-full max-w-full overflow-hidden">
        <h4 className="text-[11px] font-black uppercase text-black border-b-[1.5px] border-black pb-0.5 tracking-wide">
          3. Providências e Encaminhamentos Adotados
        </h4>
        <div className="p-2.5 border border-black rounded bg-white text-[10.5px] leading-relaxed text-black font-medium text-justify whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] max-w-full overflow-hidden">
          {providenciasExibidas}
        </div>
      </div>
    </DocumentoOficialLayout>
  )
}

export function AtendimentosView({
  atendimentos,
  agenda = [],
  familias = [],
  usuarios = [],
  configuracao,
  usuarioLogado,
  onAbrirModalNovoAtendimento,
  onAbrirModalNovoAgendamento,
  onAtualizarStatusAgendamento,
  onEditarAtendimento,
  onExcluirAtendimento
}: AtendimentosViewProps) {
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('TODOS')
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState<Atendimento | null>(null)
  
  // Modal de Edição de Atendimento
  const [atendimentoParaEditar, setAtendimentoParaEditar] = useState<Atendimento | null>(null)
  const [relatoEdicao, setRelatoEdicao] = useState('')
  const [providenciasEdicao, setProvidenciasEdicao] = useState('')
  const [localEdicao, setLocalEdicao] = useState('')
  const [sigiloEdicao, setSigiloEdicao] = useState('equipe_tecnica')
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)

  // Modal de Impressão de Atendimento
  const [atendimentoParaImprimir, setAtendimentoParaImprimir] = useState<Atendimento | null>(null)

  // Modal de Cancelamento com Motivo
  const [agendamentoParaCancelar, setAgendamentoParaCancelar] = useState<AgendaItem | null>(null)
  const [motivoCancelamento, setMotivoCancelamento] = useState('')

  // Modal de Falta com Motivo
  const [agendamentoParaFalta, setAgendamentoParaFalta] = useState<AgendaItem | null>(null)
  const [motivoFalta, setMotivoFalta] = useState('')

  const atendimentosFiltrados = atendimentos.filter(a => {
    const termo = busca.toLowerCase().trim()
    const bateTexto =
      (a.usuario_visitado || '').toLowerCase().includes(termo) ||
      (a.responsavel_nome || '').toLowerCase().includes(termo) ||
      (a.relato || '').toLowerCase().includes(termo) ||
      (a.tecnico || '').toLowerCase().includes(termo)

    const bateTipo = filtroTipo === 'TODOS' || a.tipo === filtroTipo

    return bateTexto && bateTipo
  })

  // Agendamentos pendentes da agenda técnica (excluindo Concluído, Realizado, Cancelado e Falta)
  const agendamentosExibidos = agenda.filter(a => a.status !== 'Concluído' && a.status !== 'Realizado' && a.status !== 'Cancelado' && a.status !== 'Falta')

  function handleClicarRealizado(item: AgendaItem) {
    const isVisita = item.tipo.includes('Visita')
    const rawTecnico = item.tecnico || ''
    let tecnicoPrincipal = rawTecnico
    let coVisitantes: string[] = []
    let isCompartilhada = 'Não'

    const matchCo = rawTecnico.match(/\s*\((?:co[- ](?:visitantes?|participantes?)|participantes?):\s*([\s\S]+?)\)\s*$/i)
    if (matchCo) {
      tecnicoPrincipal = rawTecnico.replace(matchCo[0], '').trim()
      coVisitantes = matchCo[1].split(/,\s*(?=[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ0-9])/i).map(s => s.trim()).filter(Boolean)
      isCompartilhada = 'Sim'
    } else if (rawTecnico.toLowerCase().includes('co-visitantes')) {
      isCompartilhada = 'Sim'
    }

    const dadosPreenchidos: Partial<Atendimento> & { agenda_id?: string } = {
      agenda_id: item.id,
      familia_id: item.familia_id,
      tipo: isVisita ? 'Visita Domiciliar' : 'Atendimento',
      data: item.data,
      hora: item.hora,
      local: isVisita ? 'Domicílio' : 'CRAS',
      tecnico: tecnicoPrincipal,
      profissionais_participantes: coVisitantes.join(', '),
      compartilhada: isCompartilhada
    }

    onAbrirModalNovoAtendimento(dadosPreenchidos)
  }

  async function handleConfirmarCancelamento() {
    if (!agendamentoParaCancelar) return
    if (!motivoCancelamento.trim()) return alert('Por favor, informe o motivo do cancelamento.')

    if (onAtualizarStatusAgendamento) {
      await onAtualizarStatusAgendamento(agendamentoParaCancelar, 'Cancelado', motivoCancelamento.trim())
    }
    setAgendamentoParaCancelar(null)
    setMotivoCancelamento('')
  }

  async function handleConfirmarFalta() {
    if (!agendamentoParaFalta) return
    if (!motivoFalta.trim()) return alert('Por favor, informe o motivo da falta / não comparecimento.')

    if (onAtualizarStatusAgendamento) {
      await onAtualizarStatusAgendamento(agendamentoParaFalta, 'Falta', motivoFalta.trim())
    }
    setAgendamentoParaFalta(null)
    setMotivoFalta('')
  }

  async function handleSalvarEdicao() {
    if (!atendimentoParaEditar || !onEditarAtendimento) return
    if (!relatoEdicao.trim()) return alert('Por favor, informe o relato técnico.')
    if (!providenciasEdicao.trim()) return alert('Por favor, informe as providências e encaminhamentos adotados.')

    setSalvandoEdicao(true)
    try {
      await onEditarAtendimento(atendimentoParaEditar.id, {
        relato: relatoEdicao.trim().toUpperCase(),
        providencias: providenciasEdicao.trim().toUpperCase(),
        local: localEdicao,
        sigilo: sigiloEdicao
      })
      setAtendimentoParaEditar(null)
    } catch (err: any) {
      alert('Erro ao editar atendimento: ' + (err.message || 'Tente novamente.'))
    } finally {
      setSalvandoEdicao(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6 print:hidden">
        {/* Banner Principal Padronizado */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-32 bottom-0 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 tracking-wider">
                  Atendimento Técnico • SUAS Digital
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <i className="fa-solid fa-file-signature text-indigo-400 text-xl"></i>
                <span>Atendimentos e Visitas Domiciliares</span>
              </h2>
              <p className="text-xs text-indigo-200/90 leading-relaxed font-normal">
                Registre atendimentos realizados, visitas domiciliares, escuta qualificada, acompanhamentos e evoluções do Prontuário SUAS.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              {onAbrirModalNovoAgendamento && (
                <button
                  onClick={onAbrirModalNovoAgendamento}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-4 py-3 rounded-xl text-xs shadow-lg transition flex items-center gap-2 hover:scale-[1.02] active:scale-95 border border-indigo-400/40"
                >
                  <i className="fa-solid fa-calendar-plus text-sm"></i>
                  <span>Agendar Visita / Atendimento</span>
                </button>
              )}
              <button
                onClick={() => onAbrirModalNovoAtendimento()}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-3 rounded-xl text-xs shadow-lg transition flex items-center gap-2.5 hover:scale-[1.02] active:scale-95 border border-emerald-300"
              >
                <i className="fa-solid fa-plus text-sm"></i>
                <span>Registrar Atendimento</span>
              </button>
            </div>
          </div>
        </div>

      {/* 2. BLOCO PRIMEIRO (TOPO): Agenda Técnica de Visitas/Atendimentos */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-4 print:hidden">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <i className="fa-solid fa-calendar-check text-emerald-700 text-sm"></i> Agenda Técnica de Visitas/Atendimentos ({agendamentosExibidos.length})
          </h3>
        </div>

        {agendamentosExibidos.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs bg-gray-50 rounded-xl border border-dashed">
            <i className="fa-solid fa-calendar-xmark text-3xl mb-2 text-gray-300 block"></i>
            Nenhum agendamento pendente na agenda técnica.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agendamentosExibidos.map(item => (
              <div key={item.id} className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-xl hover:bg-emerald-50 transition space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 bg-emerald-700 text-white rounded font-bold text-[10px] uppercase font-mono">
                      <i className="fa-solid fa-clock text-[9px] mr-1"></i> {item.data} às {item.hora}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded font-bold text-[10px] uppercase">
                      {item.status || 'PENDENTE'}
                    </span>
                  </div>

                  <div>
                    <strong className="text-gray-900 block text-xs uppercase">{item.responsavel}</strong>
                    <span className="text-[11px] text-emerald-900 font-semibold uppercase block mt-0.5">
                      {item.tipo} • {item.bairro || 'CENTRO'}
                    </span>
                  </div>

                  {item.descricao && (
                    <p className="text-[11px] text-gray-600 leading-relaxed italic border-t border-emerald-200/60 pt-1.5">
                      "{item.descricao}"
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-emerald-200/60 space-y-2">
                  <div className="text-[10px] text-gray-500 uppercase">
                    Técnico: <strong>{item.tecnico}</strong>
                  </div>

                  {/* Três botões de ação: Realizado, Falta, Cancelar */}
                  {onAtualizarStatusAgendamento && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <button
                        onClick={() => handleClicarRealizado(item)}
                        className="flex-1 py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-[10px] transition uppercase flex items-center justify-center gap-1 shadow-sm"
                        title="Marcar como Realizado e abrir formulário de atendimento"
                      >
                        <i className="fa-solid fa-check text-[9px]"></i> Realizado
                      </button>

                      <button
                        onClick={() => {
                          setAgendamentoParaFalta(item)
                          setMotivoFalta('')
                        }}
                        className="flex-1 py-1.5 px-2 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-[10px] transition uppercase flex items-center justify-center gap-1 shadow-sm"
                        title="Marcar como Falta / Não Comparecimento"
                      >
                        <i className="fa-solid fa-user-slash text-[9px]"></i> Falta
                      </button>

                      <button
                        onClick={() => {
                          setAgendamentoParaCancelar(item)
                          setMotivoCancelamento('')
                        }}
                        className="flex-1 py-1.5 px-2 bg-rose-700 hover:bg-rose-800 text-white rounded font-bold text-[10px] transition uppercase flex items-center justify-center gap-1 shadow-sm"
                        title="Cancelar agendamento informando motivo"
                      >
                        <i className="fa-solid fa-xmark text-[9px]"></i> Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. BLOCO SEGUNDO (ABAIXO): Registros de Atendimento Realizados */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-4 print:hidden">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <i className="fa-solid fa-clock-history text-teal-700 text-sm"></i> Registros de Atendimento Realizados ({atendimentosFiltrados.length})
          </h3>
        </div>

        {/* Filtros de Pesquisa */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-gray-400 text-xs"></i>
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="PESQUISAR POR BENEFICIÁRIO OU TÉCNICO..."
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-700"
            />
          </div>

          <div>
            <select
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-700"
            >
              <option value="TODOS">TODOS OS TIPOS DE AÇÃO</option>
              <option value="Atendimento">ATENDIMENTO PRESENCIAL NO CRAS</option>
              <option value="Visita Domiciliar">VISITA DOMICILIAR (PAIF)</option>
              <option value="Falta / Não Comparecimento">FALTA / NÃO COMPARECIMENTO</option>
            </select>
          </div>
        </div>

        {/* Tabela de Atendimentos */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100/80 text-gray-700 uppercase font-bold border-b border-gray-200">
                <th className="py-2.5 px-3 whitespace-nowrap">Data / Hora</th>
                <th className="py-2.5 px-3">Família / Visitado(s)</th>
                <th className="py-2.5 px-3">Técnico(s)</th>
                <th className="py-2.5 px-3">Local</th>
                <th className="py-2.5 px-3">Relato / Providência</th>
                <th className="py-2.5 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {atendimentosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    <i className="fa-solid fa-clipboard-list text-3xl mb-2 text-gray-300 block"></i>
                    Nenhum registro de atendimento encontrado.
                  </td>
                </tr>
              ) : (
                  atendimentosFiltrados.map(a => {
                    const isCompartilhada = a.compartilhada === 'Sim' || (a.tecnico && a.tecnico.toLowerCase().includes('co-visitantes')) || Boolean(a.profissionais_participantes)
                    const rawTec = (a.tecnico || '').trim()
                    let tecPrincipal = rawTec
                    let coTecs: string[] = []

                    const regexCo = /\s*\((?:co[- ](?:visitantes?|participantes?)|participantes?):\s*([\s\S]+?)\)\s*$/i
                    const matchCo = rawTec.match(regexCo)
                    if (matchCo) {
                      tecPrincipal = rawTec.replace(regexCo, '').trim()
                      const strCo = matchCo[1].trim()
                      coTecs = strCo.split(/,\s*(?=[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ0-9])/i).map(s => s.trim()).filter(Boolean)
                    }

                    if (a.profissionais_participantes) {
                      const listPart = a.profissionais_participantes.split(/,\s*(?=[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ0-9])/i).map(s => s.trim()).filter(Boolean)
                      if (listPart.length > 0) {
                        coTecs = Array.from(new Set([...coTecs, ...listPart]))
                      }
                    }

                    tecPrincipal = tecPrincipal.replace(/\s*\(.*?\)\s*$/, '').trim() || 'TÉCNICO'
                    const coTecsNomes = coTecs.map(ct => ct.replace(/\s*\(.*?\)\s*$/, '').trim()).filter(Boolean)

                    return (
                      <tr key={a.id} className="hover:bg-gray-50/80 transition">
                        <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-gray-600">
                          <strong className="text-gray-800 block font-sans">{a.data}</strong>
                          <span>{a.hora || '10:00'}</span>
                        </td>
                        <td className="py-3 px-3">
                          <strong className="text-gray-900 block uppercase">{a.usuario_visitado || a.responsavel_nome || 'Família'}</strong>
                          <span className="text-[10px] text-teal-800 font-bold uppercase">{a.tipo}</span>
                        </td>
                        <td className="py-3 px-3 text-gray-700 uppercase font-medium">
                          <strong className="block text-gray-900">{tecPrincipal}</strong>
                          {isCompartilhada && coTecsNomes.length > 0 && (
                            <span className="text-[10px] text-emerald-800 font-semibold block mt-0.5">
                              Visita compartilhada com: {coTecsNomes.join(', ')}
                            </span>
                          )}
                        </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                        a.tipo === 'Falta / Não Comparecimento'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : a.local === 'CRAS' || a.tipo === 'Atendimento'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {a.local || (a.tipo === 'Visita Domiciliar' ? 'DOMICÍLIO' : 'CRAS')}
                      </span>
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      {(() => {
                        const resA = verificarAcessoRelatoAtendimento(a, usuarioLogado)
                        if (!resA.podeVer) {
                          return (
                            <span className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-1 rounded block">
                              {resA.mensagemOculta}
                            </span>
                          )
                        }
                        return (
                          <>
                            <p className="line-clamp-2 text-gray-600 text-[11px] leading-relaxed">
                              {a.relato}
                            </p>
                            {a.providencias && (
                              <span className="text-[10px] font-semibold text-amber-800 block truncate mt-0.5">
                                Providências: {a.providencias}
                              </span>
                            )}
                          </>
                        )
                      })()}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setAtendimentoSelecionado(a)}
                          className="w-7 h-7 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg font-bold transition border border-teal-200 flex items-center justify-center shadow-xs"
                          title="Ver Detalhes do Relato Técnico"
                        >
                          <i className="fa-solid fa-eye text-xs"></i>
                        </button>

                        {onEditarAtendimento && (
                          <button
                            onClick={() => {
                              setAtendimentoParaEditar(a)
                              setRelatoEdicao(a.relato || '')
                              setProvidenciasEdicao(a.providencias || '')
                              setLocalEdicao(a.local || 'CRAS')
                              setSigiloEdicao(a.sigilo || 'equipe_tecnica')
                            }}
                            className="w-7 h-7 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg font-bold transition border border-blue-200 flex items-center justify-center shadow-xs"
                            title="Editar Registro de Atendimento"
                          >
                            <i className="fa-solid fa-pen-to-square text-xs"></i>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setAtendimentoParaImprimir(a)
                            setTimeout(() => {
                              window.print()
                            }, 50)
                          }}
                          className="w-7 h-7 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg font-bold transition border border-purple-200 flex items-center justify-center shadow-xs"
                          title="Imprimir Registro / Relatório de Atendimento"
                        >
                          <i className="fa-solid fa-print text-xs"></i>
                        </button>

                        {onExcluirAtendimento && (
                          <button
                            onClick={() => onExcluirAtendimento(a.id)}
                            className="w-7 h-7 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg font-bold transition border border-rose-200 flex items-center justify-center shadow-xs"
                            title="Excluir Registro de Atendimento"
                          >
                            <i className="fa-solid fa-trash text-xs"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
          </table>
        </div>
      </div>
      </div>

      {/* Modal de Edição de Atendimento */}
      {atendimentoParaEditar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] my-auto overflow-hidden flex flex-col">
            <div className="bg-blue-900 text-white p-5 flex justify-between items-center shrink-0">
              <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
                <i className="fa-solid fa-pen-to-square text-blue-300"></i> Editar Registro de Atendimento
              </h3>
              <button onClick={() => setAtendimentoParaEditar(null)} className="text-blue-200 hover:text-white text-xl">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <strong className="text-gray-900 block uppercase text-xs">
                  {atendimentoParaEditar.usuario_visitado || atendimentoParaEditar.responsavel_nome}
                </strong>
                <span className="text-[11px] text-blue-900 block font-medium uppercase">
                  {atendimentoParaEditar.tipo} em {atendimentoParaEditar.data} às {atendimentoParaEditar.hora || '10:00'} • TÉCNICO: {atendimentoParaEditar.tecnico.replace(/\s*\((?:co[- ](?:visitantes?|participantes?)|participantes?):.*$/i, '').replace(/\s*\(.*?\)\s*$/, '').trim()}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Local do Atendimento</label>
                <select
                  value={localEdicao}
                  onChange={e => setLocalEdicao(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-semibold"
                >
                  <option value="CRAS">CRAS (PRESENCIAL)</option>
                  <option value="Domicílio">DOMICÍLIO (VISITA)</option>
                  <option value="Outro">OUTRO ESPAÇO COMUNITÁRIO</option>
                </select>
              </div>

              {(() => {
                const tecnicoStr = atendimentoParaEditar.tecnico || ''
                const tecnicoObj = usuarios.find(u => u.nome === tecnicoStr || u.usuario === tecnicoStr)
                const ehPsicologoTecnico = (tecnicoObj?.cargo || '').toLowerCase().includes('psicól') || (tecnicoObj?.conselho || '').toLowerCase().includes('crp') || tecnicoStr.toLowerCase().includes('psicól') || tecnicoStr.toLowerCase().includes('crp')
                const ehAssistenteSocialTecnico = (tecnicoObj?.cargo || '').toLowerCase().includes('social') || (tecnicoObj?.conselho || '').toLowerCase().includes('cress') || tecnicoStr.toLowerCase().includes('social') || tecnicoStr.toLowerCase().includes('cress')
                const ehAdmin = usuarioLogado?.perfil === 'admin'

                return (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">
                      Nível de Sigilo Profissional / Privacidade da Escuta
                    </label>
                    <select
                      value={sigiloEdicao}
                      onChange={e => setSigiloEdicao(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-bold text-teal-950"
                    >
                      <option value="equipe_tecnica">Restrito à Equipe Técnica Superior (Assistentes Sociais e Psicólogos)</option>

                      {(ehPsicologoTecnico || ehAdmin || (!ehPsicologoTecnico && !ehAssistenteSocialTecnico)) && (
                        <option value="apenas_psicologia">Restrito à Categoria Profissional de Psicologia (Resolução CFP / CRP)</option>
                      )}

                      {(ehAssistenteSocialTecnico || ehAdmin || (!ehPsicologoTecnico && !ehAssistenteSocialTecnico)) && (
                        <option value="apenas_servico_social">Restrito à Categoria Profissional de Serviço Social (Código de Ética CRESS)</option>
                      )}

                      <option value="publico">Geral / Público (Visível para toda a equipe do CRAS)</option>
                    </select>
                  </div>
                )
              })()}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">
                  Relato Técnico / Anotações de Escuta Qualificada <span className="text-red-600 font-bold">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={relatoEdicao}
                  onChange={e => setRelatoEdicao(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border rounded-lg text-xs font-semibold uppercase leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">
                  Providências & Encaminhamentos Adotados <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={providenciasEdicao}
                  onChange={e => setProvidenciasEdicao(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border rounded-lg text-xs font-semibold uppercase leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAtendimentoParaEditar(null)}
                  className="px-4 py-2 border rounded-lg text-xs text-gray-600 hover:bg-gray-50 uppercase font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={salvandoEdicao}
                  onClick={handleSalvarEdicao}
                  className="px-6 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-xs font-bold shadow uppercase transition"
                >
                  {salvandoEdicao ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Área de Impressão Direta do Atendimento */}
      {atendimentoParaImprimir && (
        <div className="hidden print:block print:w-full print-document-area">
          <ConteudoDocumentoAtendimento item={atendimentoParaImprimir} configuracao={configuracao} familias={familias} usuarios={usuarios} usuarioLogado={usuarioLogado} />
        </div>
      )}

      {/* Modal de Falta com Pergunta do Motivo */}
      {agendamentoParaFalta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] my-auto overflow-hidden flex flex-col">
            <div className="bg-amber-700 text-white p-5 flex justify-between items-center shrink-0">
              <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
                <i className="fa-solid fa-user-slash text-amber-200"></i> Registrar Falta / Não Comparecimento
              </h3>
              <button onClick={() => setAgendamentoParaFalta(null)} className="text-amber-200 hover:text-white text-xl">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Agendamento de:</span>
                <strong className="text-gray-900 uppercase block text-xs">{agendamentoParaFalta.responsavel}</strong>
                <span className="text-[11px] text-amber-900 block font-medium">
                  {agendamentoParaFalta.tipo} em {agendamentoParaFalta.data} às {agendamentoParaFalta.hora}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-800 uppercase mb-1">
                  Qual o Motivo da Falta / Não Comparecimento? <span className="text-red-600 font-bold">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={motivoFalta}
                  onChange={e => setMotivoFalta(e.target.value.toUpperCase())}
                  placeholder="EX: BENEFICIÁRIO NÃO ESTAVA EM CASA / NÃO COMPARECEU AO CRAS..."
                  className="w-full px-3 py-2 border rounded-lg text-xs font-semibold uppercase leading-relaxed focus:ring-2 focus:ring-amber-500/20 focus:border-amber-700"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAgendamentoParaFalta(null)}
                  className="px-4 py-2 border rounded-lg text-xs text-gray-600 hover:bg-gray-50 uppercase font-semibold"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmarFalta}
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold shadow uppercase transition"
                >
                  Confirmar Registro de Falta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cancelamento com Pergunta do Motivo */}
      {agendamentoParaCancelar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] my-auto overflow-hidden flex flex-col">
            <div className="bg-rose-800 text-white p-5 flex justify-between items-center shrink-0">
              <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
                <i className="fa-solid fa-ban text-rose-300"></i> Cancelar Agendamento Técnico
              </h3>
              <button onClick={() => setAgendamentoParaCancelar(null)} className="text-rose-200 hover:text-white text-xl">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-rose-800 uppercase block">Agendamento de:</span>
                <strong className="text-gray-900 uppercase block text-xs">{agendamentoParaCancelar.responsavel}</strong>
                <span className="text-[11px] text-rose-900 block font-medium">
                  {agendamentoParaCancelar.tipo} em {agendamentoParaCancelar.data} às {agendamentoParaCancelar.hora}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-800 uppercase mb-1">
                  Qual o Motivo do Cancelamento? <span className="text-red-600 font-bold">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={motivoCancelamento}
                  onChange={e => setMotivoCancelamento(e.target.value.toUpperCase())}
                  placeholder="EX: FAMÍLIA SOLICITOU REMARCAÇÃO / TÉCNICO EM CAPACITAÇÃO..."
                  className="w-full px-3 py-2 border rounded-lg text-xs font-semibold uppercase leading-relaxed focus:ring-2 focus:ring-rose-500/20 focus:border-rose-700"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAgendamentoParaCancelar(null)}
                  className="px-4 py-2 border rounded-lg text-xs text-gray-600 hover:bg-gray-50 uppercase font-semibold"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmarCancelamento}
                  className="px-5 py-2 bg-rose-800 hover:bg-rose-900 text-white rounded-lg text-xs font-bold shadow uppercase transition"
                >
                  Confirmar Cancelamento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Relato de Atendimento Selecionado */}
      {atendimentoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] my-auto overflow-hidden flex flex-col">
            <div className="bg-teal-900 text-white p-5 flex justify-between items-center shrink-0">
              <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
                <i className="fa-solid fa-file-text text-emerald-400"></i> Detalhes do Registros de Atendimento
              </h3>
              <button onClick={() => setAtendimentoSelecionado(null)} className="text-teal-200 hover:text-white text-xl">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <span className="text-gray-500 uppercase text-[10px] font-bold block">Beneficiário / Família</span>
                  <strong className="text-gray-900 uppercase text-xs">{atendimentoSelecionado.usuario_visitado || atendimentoSelecionado.responsavel_nome}</strong>
                </div>
                <div>
                  <span className="text-gray-500 uppercase text-[10px] font-bold block">Técnico Responsável</span>
                  <strong className="text-gray-900 uppercase text-xs block">
                    {atendimentoSelecionado.tecnico.replace(/\s*\((?:co[- ](?:visitantes?|participantes?)|participantes?):.*$/i, '').replace(/\s*\(.*?\)\s*$/, '').trim()}
                  </strong>
                  {(atendimentoSelecionado.compartilhada === 'Sim' || atendimentoSelecionado.tecnico.toLowerCase().includes('co-visitantes') || Boolean(atendimentoSelecionado.profissionais_participantes)) && (
                    <span className="text-[10px] text-emerald-800 font-semibold block mt-0.5">
                      {atendimentoSelecionado.profissionais_participantes
                        ? `Visita compartilhada com: ${atendimentoSelecionado.profissionais_participantes.split(/,\s*(?=[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ0-9])/i).map(s => s.replace(/\s*\(.*?\)\s*$/, '').trim()).join(', ')}`
                        : (() => {
                            const matchCo = atendimentoSelecionado.tecnico.match(/\s*\((?:co[- ](?:visitantes?|participantes?)|participantes?):\s*([\s\S]+?)\)\s*$/i)
                            if (matchCo) {
                              const coNomes = matchCo[1].split(/,\s*(?=[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ0-9])/i).map(s => s.replace(/\s*\(.*?\)\s*$/, '').trim()).filter(Boolean)
                              return `Visita compartilhada com: ${coNomes.join(', ')}`
                            }
                            return ''
                          })()}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-gray-500 uppercase text-[10px] font-bold block">Data & Horário</span>
                  <strong className="text-gray-900 uppercase text-xs">{atendimentoSelecionado.data} às {atendimentoSelecionado.hora || '10:00'}</strong>
                </div>
                <div>
                  <span className="text-gray-500 uppercase text-[10px] font-bold block">Tipo de Ação & Local</span>
                  <strong className="text-teal-800 uppercase text-xs">{atendimentoSelecionado.tipo} ({atendimentoSelecionado.local || 'CRAS'})</strong>
                </div>
              </div>

              {(() => {
                const resSel = verificarAcessoRelatoAtendimento(atendimentoSelecionado, usuarioLogado)
                if (!resSel.podeVer) {
                  return (
                    <div className="p-5 bg-amber-50 rounded-2xl border border-amber-300 text-xs font-bold text-amber-950 uppercase text-center space-y-2">
                      <i className="fa-solid fa-user-lock text-2xl text-amber-700 block"></i>
                      <p>{resSel.mensagemOculta}</p>
                    </div>
                  )
                }

                return (
                  <>
                    <div>
                      <h4 className="font-bold text-gray-800 uppercase mb-1">Relato Técnico / Anotações de Escuta Qualificada:</h4>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-800 leading-relaxed whitespace-pre-line font-medium">
                        {atendimentoSelecionado.relato}
                      </div>
                    </div>

                    {atendimentoSelecionado.providencias && (
                      <div>
                        <h4 className="font-bold text-amber-900 uppercase mb-1">Providências & Encaminhamentos Adotados:</h4>
                        <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-950 leading-relaxed font-semibold whitespace-pre-line">
                          {atendimentoSelecionado.providencias}
                        </div>
                      </div>
                    )}
                  </>
                )
              })()}

              <div className="pt-4 border-t flex justify-end">
                <button
                  onClick={() => setAtendimentoSelecionado(null)}
                  className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-bold uppercase"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
