'use client'

import { useState, useEffect } from 'react'
import { GrupoSCFV, ParticipanteSCFV, Familia, Configuracao, Usuario } from '@/types'
import { maskCPF, maskNIS } from '@/utils/masks'

interface ModalRelatorioGrupoScfvProps {
  grupo: GrupoSCFV
  participantes: ParticipanteSCFV[]
  familias: Familia[]
  configuracao: Configuracao
  usuarioLogadoNome?: string
  usuarios?: Usuario[]
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
  onClose,
  onSalvarRelatorio
}: ModalRelatorioGrupoScfvProps) {
  const [dataEncontro, setDataEncontro] = useState<string>(new Date().toISOString().split('T')[0])
  const [objetivoEncontro, setObjetivoEncontro] = useState(
    'FORTALECER VÍNCULOS FAMILIARES E COMUNITÁRIOS, DESENVOLVER A AUTONOMIA E PROMOVER A CONVIVÊNCIA SOCIAL.'
  )
  const [atividadeRealizada, setAtividadeRealizada] = useState(
    'RODA DE CONVERSA TEMÁTICA, DINÂMICA INTERATIVA E OFICINA PRÁTICA.'
  )
  const [detalhamento, setDetalhamento] = useState(
    'ACOLHIMENTO INICIAL DOS INTEGRANTES, APRESENTAÇÃO DA PAUTA DO DIA, DESENVOLVIMENTO DA ATIVIDADE EM GRUPO COM PARTICIPAÇÃO ATIVA E ESPAÇO PARA DÚVIDAS E DEBATES.'
  )
  const [relato, setRelato] = useState(
    grupo.descricao
      ? `RELATÓRIO DO ENCONTRO DO GRUPO: ${grupo.nome.toUpperCase()}\nAVALIAÇÃO TÉCNICA: ${grupo.descricao.toUpperCase()}\n\nO encontro ocorreu conforme o planejado com engajamento dos integrantes e escuta qualificada da equipe.`
      : 'O ENCONTRO FOI REALIZADO COM ABUNDANTE PARTICIPAÇÃO DOS INTEGRANTES, PROPICIANDO A TROCA DE EXPERIÊNCIAS E O FORTALECIMENTO DA REDE DE APOIO MÚTUO.'
  )
  const [providencias, setProvidencias] = useState(
    'PROVIDÊNCIAS E ENCAMINHAMENTOS: MANUTENÇÃO DO ACOMPANHAMENTO CONTINUADO, ARTICULAÇÃO COM A REDE INTERSETORIAL (SAÚDE E EDUCAÇÃO) E REGISTRO DE FREQUÊNCIA.'
  )
  
  const [profissionaisSelecionados, setProfissionaisSelecionados] = useState<string[]>(() => {
    const padrao = usuarioLogadoNome || grupo.tecnico_responsavel || ''
    return padrao ? [padrao.toUpperCase()] : []
  })
  const [outroProfissional, setOutroProfissional] = useState('')
  const [tecnicoAssinatura, setTecnicoAssinatura] = useState(
    usuarioLogadoNome || grupo.tecnico_responsavel || 'TÉCNICO RESPONSÁVEL'
  )

  const [salvando, setSalvando] = useState(false)
  const [frequenciaEncontro, setFrequenciaEncontro] = useState<any>(null)
  const [carregandoFrequencia, setCarregandoFrequencia] = useState(false)

  // Buscar a frequência registrada para a data do encontro selecionada
  useEffect(() => {
    async function carregarFrequenciaData() {
      if (!grupo?.id || !dataEncontro) return
      setCarregandoFrequencia(true)
      try {
        const res = await fetch(`/api/scfv/frequencia?grupo_id=${grupo.id}`)
        if (res.ok) {
          const json = await res.json()
          if (json.ok && Array.isArray(json.data)) {
            const freqNoDia = json.data.find((f: any) => f.data === dataEncontro)
            setFrequenciaEncontro(freqNoDia || null)
          }
        }
      } catch (err) {
        console.warn('Erro ao carregar frequência do encontro:', err)
      } finally {
        setCarregandoFrequencia(false)
      }
    }
    carregarFrequenciaData()
  }, [grupo?.id, dataEncontro])

  function toggleProfissional(nomeProf: string) {
    const profUpper = nomeProf.toUpperCase()
    if (profissionaisSelecionados.includes(profUpper)) {
      setProfissionaisSelecionados(profissionaisSelecionados.filter(p => p !== profUpper))
    } else {
      setProfissionaisSelecionados([...profissionaisSelecionados, profUpper])
    }
  }

  function handleAdicionarOutroProfissional() {
    if (!outroProfissional.trim()) return
    const novoUpper = outroProfissional.trim().toUpperCase()
    if (!profissionaisSelecionados.includes(novoUpper)) {
      setProfissionaisSelecionados([...profissionaisSelecionados, novoUpper])
    }
    setOutroProfissional('')
  }

  function handleImprimir() {
    window.print()
  }

  async function handleSalvar() {
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
      if (onSalvarRelatorio) {
        await onSalvarRelatorio({
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
        })
      }
      alert('Relatório do encontro salvo com sucesso e registrado no histórico dos beneficiários!')
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
      case '0_a_6': return '0 a 6 Anos (Primeira Infância)'
      case '6_a_15': return '6 a 15 Anos (Crianças e Adolescentes)'
      case '15_a_17': return '15 a 17 Anos (Jovens)'
      case '18_a_59': return '18 a 59 Anos (Adultos)'
      case '60_mais': return '60 Anos ou Mais (Pessoas Idosas)'
      case 'Intergeracional': return 'Intergeracional (Todas as Idades)'
      default: return grupo.faixa_etaria || 'Todas as Idades'
    }
  })()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Estilos Específicos para Impressão A4 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #documento-relatorio-grupo, #documento-relatorio-grupo * {
            visibility: visible;
          }
          #documento-relatorio-grupo {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      ` }} />

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-6 overflow-hidden flex flex-col max-h-[95vh] border border-gray-200 print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Header Superior (Visível apenas na tela) */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex justify-between items-center shrink-0 no-print">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2 uppercase tracking-wide">
              <i className="fa-solid fa-file-invoice text-indigo-400 text-lg"></i> Relatório Técnico do Encontro de Grupo / SCFV
            </h3>
            <p className="text-[11px] text-slate-300 mt-0.5 font-medium">
              Serviço de Convivência e Fortalecimento de Vínculos • Relatório Individual por Encontro
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleImprimir}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs uppercase tracking-wide transition shadow flex items-center gap-1.5"
            >
              <i className="fa-solid fa-print"></i> Imprimir (A4)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        {/* Formulário Interativo na Tela e Documento Oficial de Impressão */}
        <div id="documento-relatorio-grupo" className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-gray-900 bg-white">
          
          {/* Cabeçalho Timbrado do Município */}
          <div className="text-center border-b-2 border-gray-900 pb-4 space-y-1">
            <h1 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-gray-900">
              {configuracao.municipio || 'PREFEITURA MUNICIPAL DE CONCEIÇÃO DO TOCANTINS'}
            </h1>
            <h2 className="text-xs sm:text-sm font-bold uppercase text-gray-800">
              {configuracao.secretaria || 'SECRETARIA MUNICIPAL DE ASSISTÊNCIA SOCIAL'}
            </h2>
            <h3 className="text-xs font-semibold uppercase text-indigo-900">
              {configuracao.cras_unidade || 'CENTRO DE REFERÊNCIA DE ASSISTÊNCIA SOCIAL (CRAS)'}
            </h3>
            <p className="text-[11px] text-gray-600 font-bold uppercase tracking-wider pt-1">
              RELATÓRIO TÉCNICO DE ENCONTRO DE GRUPO / OFICINA DE CONVIVÊNCIA
            </p>
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
                <span className="text-gray-500 font-bold uppercase text-[10px] block">Data do Encontro:</span>
                <input
                  type="date"
                  value={dataEncontro}
                  onChange={e => setDataEncontro(e.target.value)}
                  className="w-full mt-0.5 px-2.5 py-1 border border-gray-300 rounded-lg font-bold text-xs bg-white uppercase text-indigo-950 no-print"
                />
                <strong className="text-indigo-950 font-extrabold text-xs print:block hidden">{dataBr}</strong>
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
                <strong className="text-gray-900 font-bold text-xs block">{grupo.horario}</strong>
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
              <span className="text-[10px] text-gray-500 font-semibold lowercase no-print">(selecione os presentes)</span>
            </label>

            {/* Seleção Interativa de Profissionais (no-print) */}
            <div className="no-print space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {usuarios.length > 0 ? (
                  usuarios.map(u => {
                    const nomeProf = `${u.nome || u.usuario} (${u.cargo || 'Técnico'})`.toUpperCase()
                    const selecionado = profissionaisSelecionados.includes(nomeProf)
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
                  <span className="text-xs text-gray-500 italic">Nenhum outro profissional cadastrado no sistema.</span>
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
              <span className="text-[10px] text-gray-500 font-semibold lowercase no-print">(editável)</span>
            </label>
            <textarea
              rows={2}
              value={objetivoEncontro}
              onChange={e => setObjetivoEncontro(e.target.value)}
              placeholder="DESCREVA O OBJETIVO PRINCIPAL DO ENCONTRO..."
              className="w-full p-3 border border-gray-300 rounded-xl text-xs leading-relaxed font-medium uppercase bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 print:border-none print:p-0 print:bg-transparent print:resize-none"
            />
          </div>

          {/* 4. ATIVIDADE REALIZADA */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-wider flex justify-between items-center">
              <span>4. Atividade Realizada *</span>
              <span className="text-[10px] text-gray-500 font-semibold lowercase no-print">(editável)</span>
            </label>
            <textarea
              rows={2}
              value={atividadeRealizada}
              onChange={e => setAtividadeRealizada(e.target.value)}
              placeholder="DESCREVA A ATIVIDADE / DINÂMICA REALIZADA..."
              className="w-full p-3 border border-gray-300 rounded-xl text-xs leading-relaxed font-medium uppercase bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 print:border-none print:p-0 print:bg-transparent print:resize-none"
            />
          </div>

          {/* 5. DETALHAMENTO DO ENCONTRO */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-wider flex justify-between items-center">
              <span>5. Detalhamento do Encontro & Metodologia *</span>
              <span className="text-[10px] text-gray-500 font-semibold lowercase no-print">(editável)</span>
            </label>
            <textarea
              rows={3}
              value={detalhamento}
              onChange={e => setDetalhamento(e.target.value)}
              placeholder="DESCREVA O PASSO A PASSO DA METODOLOGIA UTILIZADA NO ENCONTRO..."
              className="w-full p-3 border border-gray-300 rounded-xl text-xs leading-relaxed font-medium uppercase bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 print:border-none print:p-0 print:bg-transparent print:resize-none"
            />
          </div>

          {/* 6. RELATO TÉCNICO & ESCUTA QUALIFICADA */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-wider flex justify-between items-center">
              <span>6. Relato Técnico / Síntese da Escuta Coletiva & Avaliação *</span>
              <span className="text-[10px] text-gray-500 font-semibold lowercase no-print">(editável)</span>
            </label>
            <textarea
              rows={4}
              value={relato}
              onChange={e => setRelato(e.target.value)}
              placeholder="DESCREVA AS SÍNTESES, ENGAJAMENTO E ESCUTA QUALIFICADA..."
              className="w-full p-3 border border-gray-300 rounded-xl text-xs leading-relaxed font-medium uppercase bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 print:border-none print:p-0 print:bg-transparent print:resize-none"
            />
          </div>

          {/* 7. PROVIDÊNCIAS E ENCAMINHAMENTOS */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-wider flex justify-between items-center">
              <span>7. Providências, Articulações da Rede & Encaminhamentos</span>
              <span className="text-[10px] text-gray-500 font-semibold lowercase no-print">(editável)</span>
            </label>
            <textarea
              rows={2}
              value={providencias}
              onChange={e => setProvidencias(e.target.value)}
              placeholder="DESCREVA OS ENCAMINHAMENTOS ADOTADOS..."
              className="w-full p-3 border border-gray-300 rounded-xl text-xs leading-relaxed font-medium uppercase bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 print:border-none print:p-0 print:bg-transparent print:resize-none"
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

            {carregandoFrequencia ? (
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

          {/* DADOS DE EMISSÃO E CAMPO DE ASSINATURA TÉCNICA */}
          <div className="pt-6 border-t border-gray-300 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
              <div className="text-right w-full">
                <p className="font-semibold text-gray-800">
                  {configuracao.municipio ? configuracao.municipio.replace(/PREFEITURA MUNICIPAL DE /i, '') : 'Conceição do Tocantins - TO'}, {dataBr}.
                </p>
              </div>
            </div>

            {/* Linha de Assinatura */}
            <div className="pt-10 flex justify-center text-center">
              <div className="w-80 border-t border-gray-900 pt-2 space-y-1">
                <input
                  type="text"
                  value={tecnicoAssinatura}
                  onChange={e => setTecnicoAssinatura(e.target.value)}
                  className="w-full text-center font-bold text-xs uppercase bg-transparent border-none p-0 focus:ring-0 text-gray-900 no-print"
                />
                <p className="font-extrabold text-xs text-gray-900 uppercase tracking-wide print:block hidden">
                  {tecnicoAssinatura}
                </p>
                <p className="text-[11px] text-gray-600 font-semibold uppercase">
                  TÉCNICO / ORIENTADOR SOCIAL RESPONSÁVEL
                </p>
                <p className="text-[10px] text-gray-500 uppercase">
                  {configuracao.cras_unidade || 'CRAS - CENTRO DE REFERÊNCIA DE ASSISTÊNCIA SOCIAL'}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Inferior de Ações (Apenas na Tela) */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center shrink-0 no-print">
          <p className="text-[11px] text-gray-500 font-medium">
            Ao salvar, o relatório deste encontro será gravado no histórico dos beneficiários.
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold uppercase transition"
            >
              Fechar
            </button>

            <button
              type="button"
              onClick={handleImprimir}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs uppercase tracking-wide transition shadow flex items-center gap-1.5"
            >
              <i className="fa-solid fa-print"></i> Imprimir (A4)
            </button>

            <button
              type="button"
              disabled={salvando}
              onClick={handleSalvar}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs uppercase tracking-wide transition shadow flex items-center gap-2 disabled:opacity-50"
            >
              {salvando ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin"></i> Salvando...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk"></i> Salvar Relatório do Encontro
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
