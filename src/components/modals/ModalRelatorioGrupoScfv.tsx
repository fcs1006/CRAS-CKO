'use client'

import { useState } from 'react'
import { GrupoSCFV, ParticipanteSCFV, Familia, Configuracao } from '@/types'
import { maskCPF, maskNIS } from '@/utils/masks'

interface ModalRelatorioGrupoScfvProps {
  grupo: GrupoSCFV
  participantes: ParticipanteSCFV[]
  familias: Familia[]
  configuracao: Configuracao
  usuarioLogadoNome?: string
  onClose: () => void
  onSalvarRelatorio?: (dados: { grupo_id: string; grupo_nome: string; relato: string; providencias: string; tecnico: string }) => Promise<void>
}

export function ModalRelatorioGrupoScfv({
  grupo,
  participantes,
  familias,
  configuracao,
  usuarioLogadoNome = '',
  onClose,
  onSalvarRelatorio
}: ModalRelatorioGrupoScfvProps) {
  const [relato, setRelato] = useState(
    grupo.descricao
      ? `RELATÓRIO DE ACOMPANHAMENTO DO GRUPO: ${grupo.nome.toUpperCase()}\nOBJETIVO E AVALIAÇÃO TÉCNICA: ${grupo.descricao.toUpperCase()}\n\nO coletivo realizou encontros regulares abordando o fortalecimento de vínculos familiares e comunitários, com participação ativa dos integrantes.`
      : 'SÍNTESE DAS ATIVIDADES: O GRUPO MANTEVE ENCONTROS PERIÓDICOS DE CONVIVÊNCIA COM ABORDAGEM DE TEMÁTICAS DE FORTALECIMENTO DE VÍNCULOS, CIDADANIA E AUTONOMIA.'
  )
  const [providencias, setProvidencias] = useState(
    'PROVIDÊNCIAS E ENCAMINHAMENTOS: ACOMPANHAMENTO CONTINUADO DOS INTEGRANTES, ARTICULAÇÃO COM A REDE INTERSETORIAL (SAÚDE E EDUCAÇÃO) E MANUTENÇÃO DAS OFICINAS PROGRAMADAS.'
  )
  const [tecnicoAssinatura, setTecnicoAssinatura] = useState(
    usuarioLogadoNome || grupo.tecnico_responsavel || 'TÉCNICO RESPONSÁVEL'
  )
  const [dataRelatorio, setDataRelatorio] = useState(new Date().toISOString().split('T')[0])
  const [salvando, setSalvando] = useState(false)

  function handleImprimir() {
    window.print()
  }

  async function handleSalvar() {
    if (!relato.trim()) return alert('Por favor, informe o relato técnico das atividades do grupo.')
    setSalvando(true)
    try {
      if (onSalvarRelatorio) {
        await onSalvarRelatorio({
          grupo_id: grupo.id,
          grupo_nome: grupo.nome,
          relato: relato.trim().toUpperCase(),
          providencias: providencias.trim().toUpperCase(),
          tecnico: tecnicoAssinatura.trim().toUpperCase()
        })
      }
      alert('Relatório do grupo salvo com sucesso e registrado no histórico dos beneficiários!')
      onClose()
    } catch (err: any) {
      alert('Erro ao salvar relatório: ' + (err.message || 'Tente novamente.'))
    } finally {
      setSalvando(false)
    }
  }

  // Cruzamento de dados dos integrantes matriculados
  const listaDetalhada = participantes.map(p => {
    const fam = familias.find(f => f.id === p.familia_id)
    return {
      id: p.id,
      nome: p.nome.toUpperCase(),
      responsavel: fam?.responsavel?.toUpperCase() || 'PRÓPRIO / NÃO INFORMADO',
      cpf: fam?.cpf_responsavel || (fam as any)?.cpf,
      nis: fam?.nis_responsavel || (fam as any)?.nis,
      cod_familiar: fam?.cod_familiar || '—',
      data_inclusao: p.criado_em ? new Date(p.criado_em).toLocaleDateString('pt-BR') : '—'
    }
  })

  // Data formatada para exibição
  const dataBr = (() => {
    const p = dataRelatorio.split('-')
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : dataRelatorio
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
              <i className="fa-solid fa-file-invoice text-indigo-400 text-lg"></i> Relatório Técnico do Grupo / Coletivo SCFV
            </h3>
            <p className="text-[11px] text-slate-300 mt-0.5 font-medium">
              Serviço de Convivência e Fortalecimento de Vínculos • Impressão e Registro em Prontuário
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
              RELATÓRIO TÉCNICO DE ACOMPANHAMENTO DE GRUPO / OFICINA DE CONVIVÊNCIA
            </p>
          </div>

          {/* 1. DADOS IDENTIFICADORES DO GRUPO */}
          <div className="border border-gray-300 rounded-xl p-4 bg-gray-50/60 space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-gray-900 border-b border-gray-200 pb-1.5 flex items-center gap-1.5">
              <i className="fa-solid fa-layer-group text-indigo-800 no-print"></i> 1. Dados Identificadores do Coletivo / Grupo
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-gray-500 font-bold uppercase text-[10px] block">Nome do Coletivo / Grupo:</span>
                <strong className="text-gray-900 font-extrabold uppercase text-xs block">{grupo.nome}</strong>
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

              <div>
                <span className="text-gray-500 font-bold uppercase text-[10px] block">Técnico / Orientador Responsável:</span>
                <strong className="text-indigo-950 font-extrabold uppercase text-xs block">{grupo.tecnico_responsavel}</strong>
              </div>
            </div>
          </div>

          {/* 2. INTEGRANTES MATRICULADOS NO GRUPO */}
          <div className="space-y-2">
            <div className="flex justify-between items-center border-b border-gray-300 pb-1.5">
              <h4 className="text-xs font-extrabold uppercase text-gray-900 flex items-center gap-1.5">
                <i className="fa-solid fa-users text-indigo-800 no-print"></i> 2. Relação de Integrantes Matriculados no Coletivo ({participantes.length})
              </h4>
              <span className="text-[10px] font-bold text-gray-600 uppercase">
                Capacidade: {participantes.length} / {grupo.vagas_limite || 25} Vagas
              </span>
            </div>

            <div className="overflow-x-auto border border-gray-300 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 text-gray-800 font-extrabold uppercase text-[10px] border-b border-gray-300">
                  <tr>
                    <th className="py-2 px-2.5 w-10 text-center">Nº</th>
                    <th className="py-2 px-2.5">Nome do Integrante</th>
                    <th className="py-2 px-2.5">Responsável Familiar</th>
                    <th className="py-2 px-2.5">CPF / NIS</th>
                    <th className="py-2 px-2.5 text-center">Cód. Prontuário</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {listaDetalhada.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-500 text-xs font-medium">
                        Nenhum integrante matriculado neste grupo.
                      </td>
                    </tr>
                  ) : (
                    listaDetalhada.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-1.5 px-2.5 text-center font-bold text-gray-600">{idx + 1}</td>
                        <td className="py-1.5 px-2.5 font-bold text-gray-900 uppercase">{item.nome}</td>
                        <td className="py-1.5 px-2.5 font-medium text-gray-700 uppercase">{item.responsavel}</td>
                        <td className="py-1.5 px-2.5 font-semibold text-gray-800">
                          {item.cpf && item.cpf !== '—' ? maskCPF(item.cpf) : item.nis && item.nis !== '—' ? maskNIS(item.nis) : '—'}
                        </td>
                        <td className="py-1.5 px-2.5 text-center font-bold text-indigo-900 uppercase">{item.cod_familiar}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. RELATO TÉCNICO / SÍNTESE DA ESCUTA E ATIVIDADES */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-wider flex justify-between items-center">
              <span>3. Relato Técnico / Síntese da Escuta Coletiva & Avaliação das Oficinas *</span>
              <span className="text-[10px] text-gray-500 font-semibold lowercase no-print">(editável)</span>
            </label>
            <textarea
              rows={5}
              value={relato}
              onChange={e => setRelato(e.target.value)}
              placeholder="DESCREVA AS TEMÁTICAS ABORDADAS, DINÂMICAS REALIZADAS, EVOLUÇÃO DOS INTEGRANTES E AVALIAÇÃO QUALITATIVA DO ACOMPANHAMENTO DO GRUPO..."
              className="w-full p-3 border border-gray-300 rounded-xl text-xs leading-relaxed font-medium uppercase bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 print:border-none print:p-0 print:bg-transparent print:resize-none"
            />
          </div>

          {/* 4. PROVIDÊNCIAS E ENCAMINHAMENTOS ADOTADOS */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-wider flex justify-between items-center">
              <span>4. Providências, Articulações da Rede & Encaminhamentos Adotados</span>
              <span className="text-[10px] text-gray-500 font-semibold lowercase no-print">(editável)</span>
            </label>
            <textarea
              rows={3}
              value={providencias}
              onChange={e => setProvidencias(e.target.value)}
              placeholder="DESCREVA OS ENCAMINHAMENTOS REALIZADOS (SAÚDE, EDUCAÇÃO, HABITAÇÃO, PASSE LIVRE, ETC.)..."
              className="w-full p-3 border border-gray-300 rounded-xl text-xs leading-relaxed font-medium uppercase bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 print:border-none print:p-0 print:bg-transparent print:resize-none"
            />
          </div>

          {/* DADOS DE EMISSÃO E CAMPO DE ASSINATURA TÉCNICA */}
          <div className="pt-6 border-t border-gray-300 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
              <div className="no-print w-full sm:w-72">
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Data da Emissão do Relatório:</label>
                <input
                  type="date"
                  value={dataRelatorio}
                  onChange={e => setDataRelatorio(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-bold bg-white"
                />
              </div>

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
            Ao salvar, este relatório será registrado no histórico dos beneficiários do grupo.
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
                  <i className="fa-solid fa-floppy-disk"></i> Salvar Relatório & Prontuário
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
