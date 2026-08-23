'use client'

import { useState, useEffect } from 'react'
import { GrupoSCFV, ParticipanteSCFV, Familia, Configuracao } from '@/types'
import { maskCPF, maskNIS } from '@/utils/masks'

interface ModalRelatorioGeralGrupoScfvProps {
  grupo: GrupoSCFV
  participantes: ParticipanteSCFV[]
  familias: Familia[]
  configuracao: Configuracao
  usuarioLogadoNome?: string
  onClose: () => void
}

export function ModalRelatorioGeralGrupoScfv({
  grupo,
  participantes,
  familias,
  configuracao,
  usuarioLogadoNome = '',
  onClose
}: ModalRelatorioGeralGrupoScfvProps) {
  const [carregando, setCarregando] = useState(true)
  const [frequencias, setFrequencias] = useState<any[]>([])
  const [relatorios, setRelatorios] = useState<any[]>([])
  
  const [sinteseGeral, setSinteseGeral] = useState(
    `RELATÓRIO CONSOLIDADO DO COLETIVO [${grupo.nome.toUpperCase()}]: O GRUPO TEVE SEUS ENCONTROS REALIZADOS COM REGULARIDADE, PROMOVENDO A CONVIVÊNCIA SOCIAL, O FORTALECIMENTO DE VÍNCULOS FAMILIARES E COMUNITÁRIOS E A PROMOÇÃO DA AUTONOMIA DOS BENEFICIÁRIOS.`
  )
  const [tecnicoAssinatura, setTecnicoAssinatura] = useState(
    usuarioLogadoNome || grupo.tecnico_responsavel || 'TÉCNICO RESPONSÁVEL'
  )

  useEffect(() => {
    async function carregarDadosGerais() {
      setCarregando(true)
      try {
        const [resFreq, resRel] = await Promise.all([
          fetch(`/api/scfv/frequencia?grupo_id=${grupo.id}`),
          fetch(`/api/scfv/relatorio?grupo_id=${grupo.id}`)
        ])

        if (resFreq.ok) {
          const json = await resFreq.json()
          if (json.ok && Array.isArray(json.data)) setFrequencias(json.data)
        }

        if (resRel.ok) {
          const json = await resRel.json()
          if (json.ok && Array.isArray(json.data)) setRelatorios(json.data)
        }
      } catch (err) {
        console.warn('Erro ao carregar dados consolidados do grupo:', err)
      } finally {
        setCarregando(false)
      }
    }
    if (grupo?.id) {
      carregarDadosGerais()
    }
  }, [grupo?.id])

  function handleImprimir() {
    window.print()
  }

  // Obter todas as datas únicas de encontros gravadas (frequência ou relatórios)
  const todasDatas = Array.from(
    new Set([
      ...frequencias.map(f => f.data),
      ...relatorios.map(r => r.data_encontro)
    ])
  ).filter(Boolean).sort().reverse()

  // Consolidar informações por encontro
  const encontrosConsolidados = todasDatas.map(dataStr => {
    const freq = frequencias.find(f => f.data === dataStr)
    const rel = relatorios.find(r => r.data_encontro === dataStr)

    const registros = freq?.registros || []
    const presentesArr = freq?.presentes || []

    let numPresentes = 0
    let numFaltasJustificadas = 0
    let numFaltasNaoJustificadas = 0

    if (registros.length > 0) {
      numPresentes = registros.filter((r: any) => r.status === 'presente').length
      numFaltasJustificadas = registros.filter((r: any) => r.status === 'falta_justificada').length
      numFaltasNaoJustificadas = registros.filter((r: any) => r.status === 'falta_nao_justificada').length
    } else if (presentesArr.length > 0) {
      numPresentes = presentesArr.length
      numFaltasNaoJustificadas = Math.max(0, participantes.length - numPresentes)
    }

    const dataParts = dataStr.split('-')
    const dataBr = dataParts.length === 3 ? `${dataParts[2]}/${dataParts[1]}/${dataParts[0]}` : dataStr

    return {
      dataStr,
      dataBr,
      numPresentes,
      numFaltasJustificadas,
      numFaltasNaoJustificadas,
      objetivo: rel?.objetivo_encontro || '—',
      atividade: rel?.atividade_realizada || '—',
      relato: rel?.relato || 'Registro de encontro mantido no serviço.',
      profissionais: rel?.profissionais_participantes || rel?.tecnico || grupo.tecnico_responsavel || '—'
    }
  })

  // Estatística individual de assiduidade dos integrantes
  const estatisticasIntegrantes = participantes.map(p => {
    const fam = familias.find(f => f.id === p.familia_id)

    let totalEncontros = 0
    let presencas = 0
    let faltasJust = 0
    let faltasNaoJust = 0

    frequencias.forEach(f => {
      totalEncontros++
      const registros = f.registros || []
      const presentesArr = f.presentes || []

      const reg = registros.find(
        (r: any) =>
          (r.membro_id && (r.membro_id === p.membro_id || r.membro_id === p.id)) ||
          (r.nome && r.nome.toUpperCase() === p.nome.toUpperCase())
      )

      if (reg) {
        if (reg.status === 'presente') presencas++
        else if (reg.status === 'falta_justificada') faltasJust++
        else if (reg.status === 'falta_nao_justificada') faltasNaoJust++
      } else if (presentesArr.length > 0) {
        if (presentesArr.includes(p.membro_id) || presentesArr.includes(p.id)) presencas++
        else faltasNaoJust++
      }
    })

    const pctAssiduidade = totalEncontros > 0 ? Math.round((presencas / totalEncontros) * 100) : 100

    return {
      id: p.id,
      nome: p.nome.toUpperCase(),
      responsavel: fam?.responsavel?.toUpperCase() || 'PRÓPRIO / NÃO INFORMADO',
      cod_familiar: fam?.cod_familiar || '—',
      totalEncontros,
      presencas,
      faltasJust,
      faltasNaoJust,
      pctAssiduidade
    }
  })

  // Totais gerais do coletivo
  const totalEncontrosGeral = todasDatas.length
  const somaPresencasGeral = encontrosConsolidados.reduce((acc, e) => acc + e.numPresentes, 0)
  const somaFaltasGeral = encontrosConsolidados.reduce((acc, e) => acc + e.numFaltasJustificadas + e.numFaltasNaoJustificadas, 0)
  const taxaMediaPresenca = totalEncontrosGeral > 0 && participantes.length > 0
    ? Math.round((somaPresencasGeral / (totalEncontrosGeral * participantes.length)) * 100)
    : 100

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
          #documento-relatorio-geral, #documento-relatorio-geral * {
            visibility: visible;
          }
          #documento-relatorio-geral {
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

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-6 overflow-hidden flex flex-col max-h-[95vh] border border-gray-200 print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Header Superior */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex justify-between items-center shrink-0 no-print">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2 uppercase tracking-wide">
              <i className="fa-solid fa-file-lines text-indigo-400 text-lg"></i> Relatório Geral Consolidado do Grupo / SCFV
            </h3>
            <p className="text-[11px] text-slate-300 mt-0.5 font-medium">
              Documento Geral com Histórico Completo de Encontros, Frequência Acumulada e Síntese Qualitativa
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleImprimir}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs uppercase tracking-wide transition shadow flex items-center gap-1.5"
            >
              <i className="fa-solid fa-print"></i> Imprimir Relatório Geral
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

        {/* Documento Impresso e Visualização na Tela */}
        <div id="documento-relatorio-geral" className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-gray-900 bg-white">
          
          {/* Cabeçalho Timbrado */}
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
              RELATÓRIO GERAL CONSOLIDADO DE ACOMPANHAMENTO DE GRUPO (SCFV)
            </p>
          </div>

          {/* 1. DADOS DO GRUPO */}
          <div className="border border-gray-300 rounded-xl p-4 bg-gray-50/60 space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-gray-900 border-b border-gray-200 pb-1.5 flex items-center gap-1.5">
              <i className="fa-solid fa-layer-group text-indigo-800 no-print"></i> 1. Identificação do Coletivo SCFV
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-gray-500 font-bold uppercase text-[10px] block">Nome do Grupo:</span>
                <strong className="text-gray-900 font-extrabold uppercase text-xs block">{grupo.nome}</strong>
              </div>

              <div>
                <span className="text-gray-500 font-bold uppercase text-[10px] block">Modalidade:</span>
                <strong className="text-indigo-900 font-bold uppercase text-xs block">{grupo.tipo_grupo || 'SCFV'}</strong>
              </div>

              <div>
                <span className="text-gray-500 font-bold uppercase text-[10px] block">Perfil / Faixa Etária:</span>
                <strong className="text-gray-900 font-bold text-xs block">{faixaEtariaRotulo}</strong>
              </div>

              <div>
                <span className="text-gray-500 font-bold uppercase text-[10px] block">Técnico Responsável:</span>
                <strong className="text-indigo-950 font-extrabold uppercase text-xs block">{grupo.tecnico_responsavel}</strong>
              </div>
            </div>
          </div>

          {/* 2. RESUMO ESTATÍSTICO DO GRUPO */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-center">
              <span className="text-[10px] font-bold text-indigo-800 uppercase block">Encontros Realizados</span>
              <strong className="text-lg font-black text-indigo-950">{totalEncontrosGeral}</strong>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Presenças Acumuladas</span>
              <strong className="text-lg font-black text-emerald-950">{somaPresencasGeral}</strong>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
              <span className="text-[10px] font-bold text-rose-800 uppercase block">Total de Faltas</span>
              <strong className="text-lg font-black text-rose-950">{somaFaltasGeral}</strong>
            </div>

            <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl text-center">
              <span className="text-[10px] font-bold text-slate-700 uppercase block">Taxa Média Assiduidade</span>
              <strong className="text-lg font-black text-slate-900">{taxaMediaPresenca}%</strong>
            </div>
          </div>

          {/* 3. HISTÓRICO CONSOLIDADO DE TODOS OS ENCONTROS */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase text-gray-900 border-b border-gray-300 pb-1 flex items-center gap-1.5">
              <i className="fa-solid fa-calendar-check text-indigo-800 no-print"></i> 3. Histórico e Memória de Todos os Encontros Realizados ({encontrosConsolidados.length})
            </h4>

            {carregando ? (
              <div className="p-4 text-center text-xs text-gray-500 font-semibold">
                <i className="fa-solid fa-circle-notch animate-spin mr-1"></i> Carregando todos os encontros do grupo...
              </div>
            ) : encontrosConsolidados.length === 0 ? (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-xs text-gray-500 font-medium">
                Nenhum encontro com chamada ou relatório gravado até o momento.
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-300 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-800 font-extrabold uppercase text-[10px] border-b border-gray-300">
                    <tr>
                      <th className="py-2 px-2.5 w-24">Data</th>
                      <th className="py-2 px-2.5">Objetivo & Atividade</th>
                      <th className="py-2 px-2.5">Facilitadores</th>
                      <th className="py-2 px-2.5 text-center">Frequência</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {encontrosConsolidados.map((e) => (
                      <tr key={e.dataStr} className="hover:bg-gray-50">
                        <td className="py-2 px-2.5 font-extrabold text-indigo-950 align-top">{e.dataBr}</td>
                        <td className="py-2 px-2.5 align-top space-y-0.5">
                          <p className="font-bold text-gray-900 uppercase">{e.objetivo}</p>
                          <p className="text-[11px] text-gray-600 uppercase font-medium">{e.atividade}</p>
                        </td>
                        <td className="py-2 px-2.5 font-semibold text-gray-700 uppercase align-top">{e.profissionais}</td>
                        <td className="py-2 px-2.5 text-center align-top whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 mr-1">
                            {e.numPresentes} P
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                            {e.numFaltasJustificadas + e.numFaltasNaoJustificadas} F
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 4. Relação Geral de Integrantes e Assiduidade Individual */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase text-gray-900 border-b border-gray-300 pb-1 flex items-center gap-1.5">
              <i className="fa-solid fa-users text-indigo-800 no-print"></i> 4. Assiduidade e Frequência Individual dos Integrantes
            </h4>

            <div className="overflow-x-auto border border-gray-300 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 text-gray-800 font-extrabold uppercase text-[10px] border-b border-gray-300">
                  <tr>
                    <th className="py-2 px-2.5 w-10 text-center">Nº</th>
                    <th className="py-2 px-2.5">Nome do Integrante</th>
                    <th className="py-2 px-2.5">Responsável</th>
                    <th className="py-2 px-2.5 text-center">Presenças</th>
                    <th className="py-2 px-2.5 text-center">Faltas Just.</th>
                    <th className="py-2 px-2.5 text-center">Faltas Não Just.</th>
                    <th className="py-2 px-2.5 text-center">% Assiduidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {estatisticasIntegrantes.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="py-1.5 px-2.5 text-center font-bold text-gray-600">{idx + 1}</td>
                      <td className="py-1.5 px-2.5 font-bold text-gray-900 uppercase">{item.nome}</td>
                      <td className="py-1.5 px-2.5 font-medium text-gray-700 uppercase">{item.responsavel}</td>
                      <td className="py-1.5 px-2.5 text-center font-extrabold text-emerald-800">{item.presencas}</td>
                      <td className="py-1.5 px-2.5 text-center font-bold text-amber-800">{item.faltasJust}</td>
                      <td className="py-1.5 px-2.5 text-center font-bold text-rose-800">{item.faltasNaoJust}</td>
                      <td className="py-1.5 px-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          item.pctAssiduidade >= 75
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}>
                          {item.pctAssiduidade}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Síntese Qualitativa da Equipe Técnica */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-wider flex justify-between items-center">
              <span>5. Síntese Técnica Qualitativa & Avaliação do Período</span>
              <span className="text-[10px] text-gray-500 font-semibold lowercase no-print">(editável)</span>
            </label>
            <textarea
              rows={4}
              value={sinteseGeral}
              onChange={e => setSinteseGeral(e.target.value)}
              placeholder="DESCREVA A AVALIAÇÃO GERAL DO ACOMPANHAMENTO DO COLETIVO..."
              className="w-full p-3 border border-gray-300 rounded-xl text-xs leading-relaxed font-medium uppercase bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 print:border-none print:p-0 print:bg-transparent print:resize-none"
            />
          </div>

          {/* DADOS DE EMISSÃO E ASSINATURA */}
          <div className="pt-6 border-t border-gray-300 space-y-8">
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-800">
                {configuracao.municipio ? configuracao.municipio.replace(/PREFEITURA MUNICIPAL DE /i, '') : 'Conceição do Tocantins - TO'}, {new Date().toLocaleDateString('pt-BR')}.
              </p>
            </div>

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

        {/* Footer de Ações */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center shrink-0 no-print">
          <p className="text-[11px] text-gray-500 font-medium">
            Relatório Geral Consolidado de todos os encontros realizados pelo grupo.
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
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs uppercase tracking-wide transition shadow flex items-center gap-1.5"
            >
              <i className="fa-solid fa-print"></i> Imprimir Relatório Geral
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
