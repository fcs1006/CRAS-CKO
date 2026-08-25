'use client'

import { useState, useEffect } from 'react'
import { GrupoSCFV, ParticipanteSCFV, Familia, Configuracao, Usuario } from '@/types'
import { maskCPF, maskNIS } from '@/utils/masks'
import { DocumentoOficialLayout } from '@/components/impressao/DocumentoOficialLayout'

interface ModalRelatorioGrupoScfvProps {
  grupo: GrupoSCFV
  participantes: ParticipanteSCFV[]
  familias: Familia[]
  configuracao: Configuracao
  usuarioLogadoNome?: string
  usuarios?: Usuario[]
  dataEncontroInicial?: string
  apenasVisualizacao?: boolean
  onClose: () => void
  onSalvarRelatorio?: (dados: {
    grupo_id: string
    grupo_nome: string
    data_encontro: string
    objetivo_encontro?: string
    atividade_realizada?: string
    detalhamento?: string
    relato: string
    providencias?: string
    profissionais_participantes?: string
    tecnico: string
  }) => Promise<void>
}

export function ModalRelatorioGrupoScfv({
  grupo,
  participantes,
  familias,
  configuracao,
  usuarioLogadoNome = '',
  usuarios = [],
  dataEncontroInicial = '',
  apenasVisualizacao = false,
  onClose,
  onSalvarRelatorio
}: ModalRelatorioGrupoScfvProps) {
  const [dataEncontro, setDataEncontro] = useState<string>(dataEncontroInicial)
  const [modoDataOutra, setModoDataOutra] = useState(false)

  const [objetivoEncontro, setObjetivoEncontro] = useState('')
  const [atividadeRealizada, setAtividadeRealizada] = useState('')
  const [detalhamento, setDetalhamento] = useState('')
  const [relato, setRelato] = useState('')
  const [providencias, setProvidencias] = useState('')
  
  const [profissionaisSelecionados, setProfissionaisSelecionados] = useState<string[]>(() => {
    const padrao = usuarioLogadoNome || grupo.tecnico_responsavel || ''
    return padrao ? [padrao.toUpperCase()] : []
  })
  const [outroProfissional, setOutroProfissional] = useState('')
  const [tecnicoAssinatura, setTecnicoAssinatura] = useState(
    usuarioLogadoNome || grupo.tecnico_responsavel || 'TÉCNICO RESPONSÁVEL'
  )

  const [salvando, setSalvando] = useState(false)
  const [carregandoHistorico, setCarregandoHistorico] = useState(true)
  const [historicoFrequencias, setHistoricoFrequencias] = useState<any[]>([])
  const [historicoRelatorios, setHistoricoRelatorios] = useState<any[]>([])
  const [frequenciaEncontro, setFrequenciaEncontro] = useState<any>(null)
  const [relatorioSalvoNoDia, setRelatorioSalvoNoDia] = useState<boolean>(false)

  // 1. Carregar Históricos do Grupo da API
  async function carregarHistoricos() {
    if (!grupo?.id) return
    setCarregandoHistorico(true)
    try {
      const [resFreq, resRel] = await Promise.all([
        fetch(`/api/scfv/frequencia?grupo_id=${grupo.id}`),
        fetch(`/api/scfv/relatorio?grupo_id=${grupo.id}`)
      ])

      if (resFreq.ok) {
        const json = await resFreq.json()
        if (json.ok && Array.isArray(json.data)) setHistoricoFrequencias(json.data)
      }

      if (resRel.ok) {
        const json = await resRel.json()
        if (json.ok && Array.isArray(json.data)) setHistoricoRelatorios(json.data)
      }
    } catch (err) {
      console.warn('Erro ao carregar históricos do grupo:', err)
    } finally {
      setCarregandoHistorico(false)
    }
  }

  useEffect(() => {
    carregarHistoricos()
  }, [grupo?.id])

  // Obter datas únicas do histórico
  const datasHistoricoUnicas = Array.from(
    new Set([
      ...historicoFrequencias.map(f => f.data),
      ...historicoRelatorios.map(r => r.data_encontro)
    ])
  ).filter(Boolean).sort().reverse()

  // 2. Quando a Data do Encontro mudar, carregar Frequência e Relatório gravados daquela data
  useEffect(() => {
    if (!dataEncontro) {
      setFrequenciaEncontro(null)
      setRelatorioSalvoNoDia(false)
      return
    }

    const freqNoDia = historicoFrequencias.find(f => f.data === dataEncontro)
    setFrequenciaEncontro(freqNoDia || null)

    const relNoDia = historicoRelatorios.find(r => r.data_encontro === dataEncontro)

    if (relNoDia) {
      setRelatorioSalvoNoDia(true)
      setObjetivoEncontro(relNoDia.objetivo_encontro || '')
      setAtividadeRealizada(relNoDia.atividade_realizada || '')
      setDetalhamento(relNoDia.detalhamento || '')
      setRelato(relNoDia.relato || '')
      setProvidencias(relNoDia.providencias || '')
      if (relNoDia.tecnico) setTecnicoAssinatura(relNoDia.tecnico)
      if (relNoDia.profissionais_participantes) {
        const profsArr = relNoDia.profissionais_participantes.split(',').map((s: string) => s.trim().toUpperCase())
        setProfissionaisSelecionados(profsArr)
      }
    } else {
      setRelatorioSalvoNoDia(false)
      setObjetivoEncontro('')
      setAtividadeRealizada('')
      setDetalhamento('')
      setRelato('')
      setProvidencias('')
    }
  }, [dataEncontro, historicoFrequencias, historicoRelatorios])

  function isProfissionalSelecionado(nomeProf: string) {
    const target = nomeProf.toUpperCase().trim()
    const nomeLimpo = target.split('(')[0].trim()

    return profissionaisSelecionados.some(p => {
      const pUpper = p.toUpperCase().trim()
      const pLimpo = pUpper.split('(')[0].trim()
      return pUpper === target || (pLimpo && (pLimpo === nomeLimpo || pUpper.includes(nomeLimpo) || target.includes(pLimpo)))
    })
  }

  function toggleProfissional(nomeProf: string) {
    const target = nomeProf.toUpperCase().trim()
    const nomeLimpo = target.split('(')[0].trim()

    if (isProfissionalSelecionado(nomeProf)) {
      setProfissionaisSelecionados(
        profissionaisSelecionados.filter(p => {
          const pUpper = p.toUpperCase().trim()
          const pLimpo = pUpper.split('(')[0].trim()
          return pUpper !== target && pLimpo !== nomeLimpo && !pUpper.includes(nomeLimpo) && !target.includes(pLimpo)
        })
      )
    } else {
      setProfissionaisSelecionados([...profissionaisSelecionados, target])
    }
  }

  function handleAdicionarOutroProfissional() {
    if (!outroProfissional.trim()) return
    const novoUpper = outroProfissional.trim().toUpperCase()
    if (!isProfissionalSelecionado(novoUpper)) {
      setProfissionaisSelecionados([...profissionaisSelecionados, novoUpper])
    }
    setOutroProfissional('')
  }

  function handleImprimir() {
    window.print()
  }

  async function handleSalvar() {
    if (!dataEncontro) return alert('Por favor, selecione a Data do Encontro.')
    if (!objetivoEncontro.trim()) return alert('Por favor, informe o Objetivo do Encontro.')
    if (!atividadeRealizada.trim()) return alert('Por favor, informe a Atividade Realizada.')
    if (!detalhamento.trim()) return alert('Por favor, informe o Detalhamento do Encontro.')
    if (!relato.trim()) return alert('Por favor, informe o Relato Técnico.')

    const listaProfissionaisFinal = [...profissionaisSelecionados]
    if (outroProfissional.trim() && !listaProfissionaisFinal.includes(outroProfissional.trim().toUpperCase())) {
      listaProfissionaisFinal.push(outroProfissional.trim().toUpperCase())
    }

    const profissionaisTexto = listaProfissionaisFinal.length > 0
      ? listaProfissionaisFinal.join(', ')
      : tecnicoAssinatura.toUpperCase()

    setSalvando(true)
    try {
      // Gravar na API de relatorios_scfv
      const payloadApi = {
        grupo_id: grupo.id,
        grupo_nome: grupo.nome,
        data_encontro: dataEncontro,
        objetivo_encontro: objetivoEncontro.trim().toUpperCase(),
        atividade_realizada: atividadeRealizada.trim().toUpperCase(),
        detalhamento: detalhamento.trim().toUpperCase(),
        relato: relato.trim().toUpperCase(),
        providencias: providencias.trim().toUpperCase(),
        profissionais_participantes: profissionaisTexto,
        tecnico: tecnicoAssinatura.trim().toUpperCase()
      }

      await fetch('/api/scfv/relatorio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadApi)
      })

      // Gravar no histórico de prontuários dos beneficiários
      if (onSalvarRelatorio) {
        await onSalvarRelatorio(payloadApi)
      }

      alert('Relatório do encontro salvo com sucesso no banco de dados e nos prontuários!')
      window.print()
      await carregarHistoricos()
      onClose()
    } catch (err: any) {
      alert('Erro ao salvar relatório do encontro: ' + (err.message || 'Tente novamente.'))
    } finally {
      setSalvando(false)
    }
  }

  // Cruzamento de dados dos integrantes com a frequência daquela data
  const listaDetalhadaComFrequencia = participantes.map(p => {
    const fam = familias.find(f => f.id === p.familia_id)
    
    let statusFrequencia = 'não_informada'
    let observacaoFrequencia = ''

    if (frequenciaEncontro) {
      const registros = frequenciaEncontro.registros || []
      const presentesArr = frequenciaEncontro.presentes || []

      const reg = registros.find(
        (r: any) =>
          (r.membro_id && (r.membro_id === p.membro_id || r.membro_id === p.id)) ||
          (r.nome && r.nome.toUpperCase() === p.nome.toUpperCase())
      )

      if (reg) {
        statusFrequencia = reg.status || 'presente'
        observacaoFrequencia = reg.observacao || ''
      } else if (presentesArr.length > 0) {
        const ehPresente = presentesArr.includes(p.membro_id) || presentesArr.includes(p.id)
        statusFrequencia = ehPresente ? 'presente' : 'falta_nao_justificada'
      }
    }

    return {
      id: p.id,
      nome: p.nome.toUpperCase(),
      responsavel: fam?.responsavel?.toUpperCase() || 'PRÓPRIO / NÃO INFORMADO',
      cpf: fam?.cpf_responsavel || (fam as any)?.cpf,
      nis: fam?.nis_responsavel || (fam as any)?.nis,
      cod_familiar: fam?.cod_familiar || '—',
      statusFrequencia,
      observacaoFrequencia
    }
  })

  // Contagem do encontro
  const totalPresentes = listaDetalhadaComFrequencia.filter(i => i.statusFrequencia === 'presente').length
  const totalFaltasJustificadas = listaDetalhadaComFrequencia.filter(i => i.statusFrequencia === 'falta_justificada').length
  const totalFaltasNaoJustificadas = listaDetalhadaComFrequencia.filter(i => i.statusFrequencia === 'falta_nao_justificada').length

  // Data formatada para exibição
  const dataBr = (() => {
    const p = dataEncontro.split('-')
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : dataEncontro
  })()

  // Formatador amigável da faixa etária
  const faixaEtariaRotulo = (() => {
    switch (grupo.faixa_etaria) {
      case '0_a_6': return '0 a 6 Anos'
      case '6_a_15': return '6 a 15 Anos'
      case '15_a_17': return '15 a 17 Anos'
      case '18_a_59': return '18 a 59 Anos'
      case '60_mais': return '60 Anos ou Mais'
      case 'Intergeracional': return 'Intergeracional'
      default: return (grupo.faixa_etaria || 'Todas as Idades').replace(/\s*\([^)]*\)/g, '')
    }
  })()

  // Formatador limpo de Horário e Dias (evita duplicações como "Terça (Terça das 09:00 às 10:30)")
  const horarioDiasFormatado = (() => {
    const h = (grupo.horario || '').trim()
    const d = (grupo.dias_semana || '').trim()
    if (!d) return h || 'Não informado'
    if (!h) return d
    if (h.toLowerCase().includes(d.toLowerCase())) return h
    return `${d} - ${h}`
  })()

  // Lista de outros usuários cadastrados excluindo o técnico responsável / usuário logado
  const usuariosOutros = usuarios.filter(u => {
    const nomeU = (u.nome || u.usuario || '').toUpperCase().trim()
    const tecNome = tecnicoAssinatura.toUpperCase().trim()
    const logadoNome = (usuarioLogadoNome || '').toUpperCase().trim()
    
    if (!nomeU) return false
    if (tecNome && (nomeU === tecNome || tecNome.includes(nomeU) || nomeU.includes(tecNome))) return false
    if (logadoNome && (nomeU === logadoNome || logadoNome.includes(nomeU) || nomeU.includes(logadoNome))) return false

    return true
  })

  // Lista unificada de profissionais com assinaturas
  const listaAssinaturasFinais = (() => {
    const items: { nome: string; cargo: string }[] = []
    const nomesAdicionados = new Set<string>()

    // 1. Técnico Responsável (Assinatura principal)
    const tecnicoNome = tecnicoAssinatura.trim().toUpperCase()
    if (tecnicoNome) {
      items.push({
        nome: tecnicoNome,
        cargo: 'TÉCNICO / ORIENTADOR SOCIAL RESPONSÁVEL'
      })
      nomesAdicionados.add(tecnicoNome)
    }

    // 2. Todos os profissionais participantes selecionados
    profissionaisSelecionados.forEach(prof => {
      const profUpper = prof.trim().toUpperCase()
      if (!profUpper) return

      let nome = profUpper
      let cargo = 'PROFISSIONAL PARTICIPANTE / FACILITADOR'

      const matchCargo = profUpper.match(/^(.*?)\s*\((.*?)\)$/)
      if (matchCargo) {
        nome = matchCargo[1].trim()
        cargo = matchCargo[2].trim()
      }

      // Verifica se o profissional já foi incluído no técnico principal ou na lista
      const jaExiste = Array.from(nomesAdicionados).some(n => 
        nome === n || (nome.length > 3 && n.includes(nome)) || (n.length > 3 && nome.includes(n))
      )

      if (!jaExiste && nome) {
        items.push({ nome, cargo })
        nomesAdicionados.add(nome)
      }
    })

    return items
  })()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print:static print:inset-auto print:p-0 print:m-0 print:bg-transparent print:backdrop-blur-none print:overflow-visible print:block print:w-full print:h-auto">
      
      {/* Área de Impressão Oficial (Renderizada exclusivamente durante a impressão A4) */}
      <div className="hidden print:block print:w-full print-document-area">
        <DocumentoOficialLayout
          configuracao={configuracao}
          tituloDocumento="RELATÓRIO TÉCNICO DE ENCONTRO"
          subtituloDocumento={`GRUPO: ${grupo.nome.toUpperCase()}`}
          dataExtensa={dataBr}
          assinaturas={
            <div className="pt-8 space-y-4 break-inside-avoid page-break-inside-avoid print:break-inside-avoid">
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-6 text-center uppercase text-[10px]">
                {listaAssinaturasFinais.map((sig, idx) => (
                  <div key={idx} className="border-t-[1.5px] border-black pt-1.5 min-w-[220px] max-w-[320px] flex-1">
                    <p className="font-extrabold text-black text-[10.5px] leading-tight">{sig.nome}</p>
                    <p className="text-black font-semibold text-[9px] leading-tight mt-0.5">{sig.cargo}</p>
                    <p className="text-black text-[8.5px] leading-tight">{configuracao.cras_unidade || 'CRAS - CENTRO DE REFERÊNCIA DE ASSISTÊNCIA SOCIAL'}</p>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <div className="space-y-3.5 text-[10.5px]">
            {/* 1. DADOS IDENTIFICADORES DO ENCONTRO E GRUPO */}
            <div className="border border-black rounded p-3 space-y-2 break-inside-avoid page-break-inside-avoid print:break-inside-avoid">
              <h4 className="text-[11px] font-black uppercase text-black border-b border-black pb-1">
                1. Dados Identificadores do Coletivo & Data do Encontro
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-0.5">
                <div>
                  <strong className="font-extrabold">Nome do Coletivo / Grupo:</strong> {grupo.nome}
                </div>
                <div>
                  <strong className="font-extrabold">Data do Encontro:</strong> {dataBr}
                </div>
                <div>
                  <strong className="font-extrabold">Modalidade / Serviço:</strong> {grupo.tipo_grupo || 'SCFV'}
                </div>
                <div>
                  <strong className="font-extrabold">Faixa Etária / Perfil:</strong> {faixaEtariaRotulo}
                </div>
                <div>
                  <strong className="font-extrabold">Horário e Dias:</strong> {horarioDiasFormatado}
                </div>
                <div>
                  <strong className="font-extrabold">Local de Realização:</strong> {grupo.local_encontro || 'CRAS (SEDE)'}
                </div>
              </div>
            </div>

            {/* 2. PROFISSIONAIS PARTICIPANTES / FACILITADORES */}
            <div className="border border-black rounded p-3 space-y-1 break-inside-avoid page-break-inside-avoid print:break-inside-avoid">
              <h4 className="text-[11px] font-black uppercase text-black border-b border-black pb-1">
                2. Profissionais Participantes / Facilitadores do Encontro
              </h4>
              <p className="pt-0.5">
                <strong className="font-extrabold">Equipe de Facilitadores Registrada:</strong> {profissionaisSelecionados.join(', ') || tecnicoAssinatura}
              </p>
            </div>

            {/* 3. OBJETIVO DO ENCONTRO */}
            <div className="border border-black rounded p-3 space-y-1 break-inside-avoid page-break-inside-avoid print:break-inside-avoid">
              <h4 className="text-[11px] font-black uppercase text-black border-b border-black pb-1">
                3. Objetivo do Encontro
              </h4>
              <p className="pt-0.5 whitespace-pre-wrap">{objetivoEncontro || 'Não informado.'}</p>
            </div>

            {/* 4. ATIVIDADE REALIZADA */}
            <div className="border border-black rounded p-3 space-y-1 break-inside-avoid page-break-inside-avoid print:break-inside-avoid">
              <h4 className="text-[11px] font-black uppercase text-black border-b border-black pb-1">
                4. Atividade Realizada
              </h4>
              <p className="pt-0.5 whitespace-pre-wrap">{atividadeRealizada || 'Não informada.'}</p>
            </div>

            {/* 5. DETALHAMENTO DO ENCONTRO & METODOLOGIA */}
            <div className="border border-black rounded p-3 space-y-1 break-inside-avoid page-break-inside-avoid print:break-inside-avoid">
              <h4 className="text-[11px] font-black uppercase text-black border-b border-black pb-1">
                5. Detalhamento do Encontro & Metodologia
              </h4>
              <p className="pt-0.5 whitespace-pre-wrap">{detalhamento || 'Não informado.'}</p>
            </div>

            {/* 6. RELATO TÉCNICO / SÍNTESE DA ESCUTA COLETIVA & AVALIAÇÃO */}
            <div className="border border-black rounded p-3 space-y-1 break-inside-avoid page-break-inside-avoid print:break-inside-avoid">
              <h4 className="text-[11px] font-black uppercase text-black border-b border-black pb-1">
                6. Relato Técnico / Síntese da Escuta Coletiva & Avaliação
              </h4>
              <p className="pt-0.5 whitespace-pre-wrap">{relato || 'Não informado.'}</p>
            </div>

            {/* 7. PROVIDÊNCIAS, ARTICULAÇÕES DA REDE & ENCAMINHAMENTOS */}
            <div className="border border-black rounded p-3 space-y-1 break-inside-avoid page-break-inside-avoid print:break-inside-avoid">
              <h4 className="text-[11px] font-black uppercase text-black border-b border-black pb-1">
                7. Providências, Articulações da Rede & Encaminhamentos
              </h4>
              <p className="pt-0.5 whitespace-pre-wrap">{providencias || 'Não informadas.'}</p>
            </div>

            {/* 8. RELAÇÃO DE INTEGRANTES E FREQUÊNCIA DO ENCONTRO */}
            <div className="border border-black rounded p-3 space-y-2 break-inside-avoid page-break-inside-avoid print:break-inside-avoid">
              <h4 className="text-[11px] font-black uppercase text-black border-b border-black pb-1 flex justify-between items-center">
                <span>8. Relação de Integrantes e Frequência do Encontro ({dataBr})</span>
                <span className="text-[10px]">
                  {totalPresentes} Presentes • {totalFaltasJustificadas} Justificadas • {totalFaltasNaoJustificadas} Faltas
                </span>
              </h4>
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="border-b border-black bg-gray-100">
                    <th className="py-1 px-1.5 font-bold border-r border-black w-8 text-center">Nº</th>
                    <th className="py-1 px-1.5 font-bold border-r border-black">Nome do Integrante</th>
                    <th className="py-1 px-1.5 font-bold border-r border-black">Responsável Familiar</th>
                    <th className="py-1 px-1.5 font-bold border-r border-black">CPF / NIS</th>
                    <th className="py-1 px-1.5 font-bold text-center">Frequência no Encontro</th>
                  </tr>
                </thead>
                <tbody>
                  {listaDetalhadaComFrequencia.map((p, idx) => (
                    <tr key={p.id} className="border-b border-gray-300 break-inside-avoid page-break-inside-avoid print:break-inside-avoid">
                      <td className="py-1 px-1.5 border-r border-gray-300 text-center font-bold">{idx + 1}</td>
                      <td className="py-1 px-1.5 border-r border-gray-300 font-bold uppercase">{p.nome}</td>
                      <td className="py-1 px-1.5 border-r border-gray-300 uppercase">{p.responsavel}</td>
                      <td className="py-1 px-1.5 border-r border-gray-300">{p.cpf ? maskCPF(p.cpf) : p.nis || '—'}</td>
                      <td className="py-1 px-1.5 text-center font-bold uppercase">
                        {p.statusFrequencia === 'presente' ? 'PRESENTE' : p.statusFrequencia === 'falta_justificada' ? 'FALTA JUSTIFICADA' : 'FALTA NÃO JUSTIFICADA'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </DocumentoOficialLayout>
      </div>

      {/* Modal Interativo de Tela (Visível exclusivamente na tela) */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-6 overflow-hidden flex flex-col max-h-[95vh] border border-gray-200 print:hidden">
        
        {/* Header Superior (Visível apenas na tela) */}
        <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0 no-print">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
              <i className={`fa-solid ${apenasVisualizacao ? 'fa-eye text-indigo-400' : 'fa-file-invoice text-indigo-400'}`}></i> {apenasVisualizacao ? 'Visualização de Relatório Técnico do Encontro' : 'Relatório Técnico do Encontro de Grupo / SCFV'}
            </h3>
            <p className="text-[11px] text-slate-300 mt-0.5 font-medium">
              Serviço de Convivência e Fortalecimento de Vínculos • {apenasVisualizacao ? 'Modo de Apenas Visualização (Leitura)' : 'Relatório Individual por Encontro'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="text-slate-300 hover:text-white text-xl p-1">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {/* Formulário Interativo na Tela e Documento Oficial de Impressão */}
        <div id="documento-relatorio-grupo" className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-gray-900 bg-white">
          
          {/* Cabeçalho Timbrado do Município */}
          <div className="border-b-2 border-gray-900 pb-3 flex items-center justify-between gap-4 w-full">
            {configuracao?.logo_url ? (
              <img
                src={configuracao.logo_url}
                alt="Brasão Oficial"
                className="h-16 w-auto max-w-[90px] object-contain shrink-0"
              />
            ) : (
              <div className="w-16 shrink-0" />
            )}

            <div className="text-center flex-1 space-y-0.5 min-w-0">
              <h1 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-gray-900 leading-tight">
                {configuracao.municipio || 'PREFEITURA MUNICIPAL DE CONCEIÇÃO DO TOCANTINS'}
              </h1>
              <h2 className="text-xs sm:text-sm font-bold uppercase text-gray-800 leading-tight">
                {configuracao.secretaria || 'SECRETARIA MUNICIPAL DE ASSISTÊNCIA SOCIAL'}
              </h2>
              <h3 className="text-xs font-semibold uppercase text-indigo-900 leading-tight">
                {configuracao.cras_unidade || 'CENTRO DE REFERÊNCIA DE ASSISTÊNCIA SOCIAL (CRAS)'}
              </h3>
              <p className="text-[11px] text-gray-700 font-bold uppercase tracking-wider pt-1">
                RELATÓRIO TÉCNICO DE ENCONTRO DE GRUPO / OFICINA DE CONVIVÊNCIA
              </p>
            </div>

            <div className="w-16 shrink-0" />
          </div>

          {/* 1. DADOS IDENTIFICADORES DO ENCONTRO E GRUPO */}
          <div className="border border-gray-300 rounded-xl p-4 bg-gray-50/60 space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-gray-900 border-b border-gray-200 pb-1.5 flex items-center gap-1.5">
              <i className="fa-solid fa-layer-group text-indigo-800 no-print"></i> 1. Dados Identificadores do Coletivo & Data do Encontro
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-gray-500 font-bold uppercase text-[10px] block">Nome do Coletivo / Grupo:</span>
                <strong className="text-gray-900 font-extrabold uppercase text-xs block">{grupo.nome}</strong>
              </div>

              <div>
                <span className="text-gray-500 font-bold uppercase text-[10px] block mb-0.5">Selecione o Encontro do Histórico *</span>
                
                <select
                  disabled={apenasVisualizacao}
                  value={modoDataOutra ? 'outra' : dataEncontro}
                  onChange={e => {
                    if (e.target.value === 'outra') {
                      setModoDataOutra(true)
                      setDataEncontro('')
                    } else {
                      setModoDataOutra(false)
                      setDataEncontro(e.target.value)
                    }
                  }}
                  className={`w-full px-2.5 py-1.5 border rounded-lg font-bold text-xs bg-white text-gray-900 no-print ${
                    !dataEncontro ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20' : 'border-gray-300'
                  } ${apenasVisualizacao ? 'opacity-90 cursor-not-allowed bg-gray-100' : ''}`}
                >
                  <option value="">-- SELECIONE O ENCONTRO DO HISTÓRICO --</option>
                  {datasHistoricoUnicas.map(dStr => {
                    const dataBrFormat = dStr.split('-').reverse().join('/')
                    const temFreq = historicoFrequencias.some(f => f.data === dStr)
                    const temRel = historicoRelatorios.some(r => r.data_encontro === dStr)
                    
                    let rotulo = `Encontro de ${dataBrFormat}`
                    if (temFreq && temRel) rotulo += apenasVisualizacao ? ' (Frequência & Relatório salvos)' : ' (Frequência & Relatório salvos - Editar)'
                    else if (temFreq) rotulo += ' (Frequência salva)'
                    else if (temRel) rotulo += apenasVisualizacao ? ' (Relatório salvo)' : ' (Relatório salvo - Editar)'

                    return (
                      <option key={dStr} value={dStr}>
                        {rotulo}
                      </option>
                    )
                  })}
                  {!apenasVisualizacao && <option value="outra">+ Informar outra data de encontro...</option>}
                </select>

                {modoDataOutra && (
                  <input
                    type="date"
                    required
                    disabled={apenasVisualizacao}
                    value={dataEncontro}
                    onChange={e => setDataEncontro(e.target.value)}
                    className="w-full mt-1.5 px-2.5 py-1 border border-gray-300 rounded-lg font-bold text-xs bg-white uppercase text-indigo-950 no-print disabled:bg-gray-100"
                  />
                )}

                <strong className="text-indigo-950 font-extrabold text-xs print:block hidden">{dataBr}</strong>

                {relatorioSalvoNoDia && (
                  <span className="text-[10px] text-emerald-700 font-bold block mt-1 no-print">
                    <i className="fa-solid fa-circle-check text-emerald-600 mr-1"></i> {apenasVisualizacao ? 'Relatório deste encontro gravado (Modo Visualização)' : 'Relatório deste encontro gravado (Modo Edição)'}
                  </span>
                )}
              </div>
              
              <div>
                <span className="text-gray-500 font-bold uppercase text-[10px] block">Modalidade / Serviço:</span>
                <strong className="text-indigo-900 font-bold uppercase text-xs block">{grupo.tipo_grupo || 'SCFV'}</strong>
              </div>

              <div>
                <span className="text-gray-500 font-bold uppercase text-[10px] block">Faixa Etária / Perfil:</span>
                <strong className="text-gray-900 font-bold text-xs block">{faixaEtariaRotulo}</strong>
              </div>

              <div>
                <span className="text-gray-500 font-bold uppercase text-[10px] block">Horário e Dias dos Encontros:</span>
                <strong className="text-gray-900 font-bold text-xs block">{horarioDiasFormatado}</strong>
              </div>

              <div>
                <span className="text-gray-500 font-bold uppercase text-[10px] block">Local de Realização:</span>
                <strong className="text-gray-900 font-bold uppercase text-xs block">{grupo.local_encontro || 'CRAS (SEDE)'}</strong>
              </div>
            </div>
          </div>

          {/* 2. PROFISSIONAIS PARTICIPANTES */}
          <div className="border border-gray-300 rounded-xl p-4 bg-indigo-50/40 space-y-2.5">
            <label className="block text-xs font-extrabold uppercase text-gray-900 flex justify-between items-center">
              <span>2. Profissionais Participantes / Facilitadores do Encontro *</span>
              <span className="text-[10px] text-gray-500 font-semibold lowercase no-print">{apenasVisualizacao ? '(somente leitura)' : '(selecione os presentes)'}</span>
            </label>

            {/* Seleção Interativa de Profissionais (no-print) */}
            {!apenasVisualizacao && (
              <div className="no-print space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {usuariosOutros.length > 0 ? (
                    usuariosOutros.map(u => {
                      const nomeProf = `${u.nome || u.usuario} (${u.cargo || 'Técnico'})`.toUpperCase()
                      const selecionado = isProfissionalSelecionado(nomeProf)
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => toggleProfissional(nomeProf)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                            selecionado
                              ? 'bg-indigo-700 text-white border-indigo-800'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          <i className={`fa-solid ${selecionado ? 'fa-check-double text-indigo-200 mr-1' : 'fa-user text-gray-400 mr-1'}`}></i>
                          {u.nome || u.usuario}
                        </button>
                      )
                    })
                  ) : (
                    <span className="text-xs text-gray-500 italic font-medium">Nenhum outro profissional cadastrado para adicionar como co-facilitador.</span>
                  )}
                </div>

                {/* Campo para adicionar outro profissional de fora */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={outroProfissional}
                    onChange={e => setOutroProfissional(e.target.value)}
                    placeholder="DIGITE O NOME DE OUTRO PROFISSIONAL PARTICIPANTE..."
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs uppercase bg-white font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleAdicionarOutroProfissional}
                    className="px-3 py-1.5 bg-indigo-800 text-white rounded-lg text-xs font-bold uppercase transition"
                  >
                    <i className="fa-solid fa-plus"></i> Adicionar
                  </button>
                </div>
              </div>
            )}

            {/* Exibição Oficial na Impressão e Resumo */}
            <div className="pt-1">
              <span className="text-gray-500 font-bold uppercase text-[10px] block">Equipe de Facilitadores Registrada:</span>
              <p className="text-xs font-extrabold uppercase text-indigo-950">
                {profissionaisSelecionados.length > 0
                  ? profissionaisSelecionados.join(' • ')
                  : (grupo.tecnico_responsavel || usuarioLogadoNome || 'TÉCNICO RESPONSÁVEL')}
              </p>
            </div>
          </div>

          {/* 3. OBJETIVO DO ENCONTRO */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-wider flex justify-between items-center">
              <span>3. Objetivo do Encontro *</span>
              <span className="text-[10px] text-gray-500 font-semibold lowercase no-print">{apenasVisualizacao ? '(somente leitura)' : '(editável)'}</span>
            </label>
            <textarea
              rows={2}
              readOnly={apenasVisualizacao}
              value={objetivoEncontro}
              onChange={e => setObjetivoEncontro(e.target.value)}
              placeholder="DESCREVA O OBJETIVO PRINCIPAL DO ENCONTRO..."
              className={`w-full p-3 border rounded-xl text-xs leading-relaxed font-medium uppercase print:border-none print:p-0 print:bg-transparent print:resize-none ${
                apenasVisualizacao ? 'bg-gray-50/70 border-gray-200 text-gray-800 focus:ring-0' : 'bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600'
              }`}
            />
          </div>

          {/* 4. ATIVIDADE REALIZADA */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-wider flex justify-between items-center">
              <span>4. Atividade Realizada *</span>
              <span className="text-[10px] text-gray-500 font-semibold lowercase no-print">{apenasVisualizacao ? '(somente leitura)' : '(editável)'}</span>
            </label>
            <textarea
              rows={2}
              readOnly={apenasVisualizacao}
              value={atividadeRealizada}
              onChange={e => setAtividadeRealizada(e.target.value)}
              placeholder="DESCREVA A ATIVIDADE / DINÂMICA REALIZADA..."
              className={`w-full p-3 border rounded-xl text-xs leading-relaxed font-medium uppercase print:border-none print:p-0 print:bg-transparent print:resize-none ${
                apenasVisualizacao ? 'bg-gray-50/70 border-gray-200 text-gray-800 focus:ring-0' : 'bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600'
              }`}
            />
          </div>

          {/* 5. DETALHAMENTO DO ENCONTRO */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-wider flex justify-between items-center">
              <span>5. Detalhamento do Encontro & Metodologia *</span>
              <span className="text-[10px] text-gray-500 font-semibold lowercase no-print">{apenasVisualizacao ? '(somente leitura)' : '(editável)'}</span>
            </label>
            <textarea
              rows={3}
              readOnly={apenasVisualizacao}
              value={detalhamento}
              onChange={e => setDetalhamento(e.target.value)}
              placeholder="DESCREVA O PASSO A PASSO DA METODOLOGIA UTILIZADA NO ENCONTRO..."
              className={`w-full p-3 border rounded-xl text-xs leading-relaxed font-medium uppercase print:border-none print:p-0 print:bg-transparent print:resize-none ${
                apenasVisualizacao ? 'bg-gray-50/70 border-gray-200 text-gray-800 focus:ring-0' : 'bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600'
              }`}
            />
          </div>

          {/* 6. RELATO TÉCNICO & ESCUTA QUALIFICADA */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-wider flex justify-between items-center">
              <span>6. Relato Técnico / Síntese da Escuta Coletiva & Avaliação *</span>
              <span className="text-[10px] text-gray-500 font-semibold lowercase no-print">{apenasVisualizacao ? '(somente leitura)' : '(editável)'}</span>
            </label>
            <textarea
              rows={4}
              readOnly={apenasVisualizacao}
              value={relato}
              onChange={e => setRelato(e.target.value)}
              placeholder="DESCREVA AS SÍNTESES, ENGAJAMENTO E ESCUTA QUALIFICADA..."
              className={`w-full p-3 border rounded-xl text-xs leading-relaxed font-medium uppercase print:border-none print:p-0 print:bg-transparent print:resize-none ${
                apenasVisualizacao ? 'bg-gray-50/70 border-gray-200 text-gray-800 focus:ring-0' : 'bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600'
              }`}
            />
          </div>

          {/* 7. PROVIDÊNCIAS E ENCAMINHAMENTOS */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-wider flex justify-between items-center">
              <span>7. Providências, Articulações da Rede & Encaminhamentos</span>
              <span className="text-[10px] text-gray-500 font-semibold lowercase no-print">{apenasVisualizacao ? '(somente leitura)' : '(editável)'}</span>
            </label>
            <textarea
              rows={2}
              readOnly={apenasVisualizacao}
              value={providencias}
              onChange={e => setProvidencias(e.target.value)}
              placeholder="DESCREVA OS ENCAMINHAMENTOS ADOTADOS..."
              className={`w-full p-3 border rounded-xl text-xs leading-relaxed font-medium uppercase print:border-none print:p-0 print:bg-transparent print:resize-none ${
                apenasVisualizacao ? 'bg-gray-50/70 border-gray-200 text-gray-800 focus:ring-0' : 'bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600'
              }`}
            />
          </div>

          {/* 8. RELAÇÃO DE INTEGRANTES E FREQUÊNCIA DA DATA */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-300 pb-1.5 gap-2">
              <h4 className="text-xs font-extrabold uppercase text-gray-900 flex items-center gap-1.5">
                <i className="fa-solid fa-users text-indigo-800 no-print"></i> 8. Relação de Integrantes e Frequência do Encontro ({dataBr})
              </h4>
              
              <div className="flex items-center gap-2 text-[10px] font-bold">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                  {totalPresentes} Presentes
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  {totalFaltasJustificadas} Justificadas
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300">
                  {totalFaltasNaoJustificadas} Faltas
                </span>
              </div>
            </div>

            {carregandoHistorico ? (
              <div className="p-4 text-center text-xs text-gray-500 font-semibold">
                <i className="fa-solid fa-circle-notch animate-spin mr-1"></i> Carregando registro de frequência da data {dataBr}...
              </div>
            ) : !frequenciaEncontro ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold flex items-center justify-between">
                <span>
                  <i className="fa-solid fa-triangle-exclamation text-amber-600 mr-1.5"></i>
                  Atenção: Ainda não foi lançada a frequência para este grupo na data {dataBr}.
                </span>
              </div>
            ) : null}

            <div className="overflow-x-auto border border-gray-300 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 text-gray-800 font-extrabold uppercase text-[10px] border-b border-gray-300">
                  <tr>
                    <th className="py-2 px-2.5 w-10 text-center">Nº</th>
                    <th className="py-2 px-2.5">Nome do Integrante</th>
                    <th className="py-2 px-2.5">Responsável Familiar</th>
                    <th className="py-2 px-2.5">CPF / NIS</th>
                    <th className="py-2 px-2.5 text-center">Frequência no Encontro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {listaDetalhadaComFrequencia.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-500 text-xs font-medium">
                        Nenhum integrante matriculado neste grupo.
                      </td>
                    </tr>
                  ) : (
                    listaDetalhadaComFrequencia.map((item, idx) => {
                      let badgeFrequencia = null
                      if (item.statusFrequencia === 'presente') {
                        badgeFrequencia = (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase">
                            <i className="fa-solid fa-check text-emerald-600 mr-1"></i> Presente
                          </span>
                        )
                      } else if (item.statusFrequencia === 'falta_justificada') {
                        badgeFrequencia = (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                            <i className="fa-solid fa-user-clock text-amber-600 mr-1"></i> Falta Justificada
                            {item.observacaoFrequencia ? ` (${item.observacaoFrequencia})` : ''}
                          </span>
                        )
                      } else if (item.statusFrequencia === 'falta_nao_justificada') {
                        badgeFrequencia = (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-900 border border-rose-300 uppercase">
                            <i className="fa-solid fa-xmark text-rose-600 mr-1"></i> Falta Não Justificada
                            {item.observacaoFrequencia ? ` (${item.observacaoFrequencia})` : ''}
                          </span>
                        )
                      } else {
                        badgeFrequencia = (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 uppercase">
                            Não Registrada
                          </span>
                        )
                      }

                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="py-1.5 px-2.5 text-center font-bold text-gray-600">{idx + 1}</td>
                          <td className="py-1.5 px-2.5 font-bold text-gray-900 uppercase">{item.nome}</td>
                          <td className="py-1.5 px-2.5 font-medium text-gray-700 uppercase">{item.responsavel}</td>
                          <td className="py-1.5 px-2.5 font-semibold text-gray-800">
                            {item.cpf && item.cpf !== '—' ? maskCPF(item.cpf) : item.nis && item.nis !== '—' ? maskNIS(item.nis) : '—'}
                          </td>
                          <td className="py-1.5 px-2.5 text-center">{badgeFrequencia}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* DADOS DE EMISSÃO E CAMPO DE ASSINATURAS TÉCNICAS */}
          <div className="pt-6 border-t border-gray-300 space-y-6">
            <div className="flex justify-end text-xs font-semibold text-gray-800">
              {configuracao.municipio ? configuracao.municipio.replace(/PREFEITURA MUNICIPAL DE /i, '') : 'Conceição do Tocantins - TO'}, {dataBr}.
            </div>

            {/* Linhas de Assinatura para Todos os Profissionais Participantes */}
            <div className="pt-4 flex flex-wrap justify-center gap-x-8 gap-y-6 text-center">
              {listaAssinaturasFinais.map((sig, idx) => (
                <div key={idx} className="w-72 border-t border-gray-900 pt-2 space-y-1">
                  {idx === 0 ? (
                    <input
                      type="text"
                      readOnly={apenasVisualizacao}
                      value={tecnicoAssinatura}
                      onChange={e => setTecnicoAssinatura(e.target.value)}
                      className="w-full text-center font-bold text-xs uppercase bg-transparent border-none p-0 focus:ring-0 text-gray-900 no-print"
                    />
                  ) : (
                    <p className="font-extrabold text-xs text-gray-900 uppercase tracking-wide">
                      {sig.nome}
                    </p>
                  )}
                  <p className="font-extrabold text-xs text-gray-900 uppercase tracking-wide print:block hidden">
                    {sig.nome}
                  </p>
                  <p className="text-[11px] text-gray-600 font-semibold uppercase">
                    {sig.cargo}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase">
                    {configuracao.cras_unidade || 'CRAS - CENTRO DE REFERÊNCIA DE ASSISTÊNCIA SOCIAL'}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Inferior de Ações (Apenas na Tela) */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center shrink-0 no-print">
          <p className="text-[11px] text-gray-500 font-medium">
            {apenasVisualizacao
              ? 'Modo de visualização. Para alterar informações deste relatório, utilize o botão de edição na tabela de encontros.'
              : 'Ao salvar, o relatório deste encontro será gravado no histórico dos beneficiários.'}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 uppercase font-semibold text-xs"
            >
              Fechar
            </button>


            {!apenasVisualizacao && (
              <button
                type="button"
                disabled={salvando}
                onClick={handleSalvar}
                className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow transition uppercase flex items-center gap-1.5 text-xs disabled:opacity-50"
              >
                <i className="fa-solid fa-floppy-disk"></i>
                {salvando ? 'Salvando...' : 'Salvar Relatório do Encontro'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
