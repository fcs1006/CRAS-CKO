'use client'

import { useState, useMemo } from 'react'
import {
  Familia,
  Atendimento,
  BeneficioConcedido,
  GrupoSCFV,
  ParticipanteSCFV,
  Encaminhamento,
  Configuracao,
  Usuario
} from '@/types'
import {
  verificarAcessoRelatoAtendimento,
  extrairRelatoLimpo,
  podeVerDetalheEncaminhamento,
  isTecnicoSuperior,
  getPerfilUsuario
} from '@/utils/permissoes'

interface RmaViewProps {
  familias: Familia[]
  atendimentos: Atendimento[]
  beneficios: BeneficioConcedido[]
  grupos: GrupoSCFV[]
  participantes?: ParticipanteSCFV[]
  encaminhamentos?: Encaminhamento[]
  configuracao?: Configuracao
  usuarioLogado?: Usuario | null
}

interface DetalheAuditoria {
  titulo: string
  codigo: string
  itens: {
    id: string
    principal: string
    secundario: string
    detalhes?: string
    data?: string
  }[]
}

export function RmaView({
  familias = [],
  atendimentos = [],
  beneficios = [],
  grupos = [],
  participantes = [],
  encaminhamentos = [],
  configuracao,
  usuarioLogado
}: RmaViewProps) {
  const currentMonthStr = new Date().toISOString().slice(0, 7)
  const [mesAno, setMesAno] = useState(currentMonthStr)
  const [modalAuditoria, setModalAuditoria] = useState<DetalheAuditoria | null>(null)

  // Separar Ano e Mês para exibição oficial
  const [anoRef, mesRef] = mesAno.split('-')
  const mesesNomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  const mesExtenso = mesesNomes[parseInt(mesRef, 10) - 1] || mesRef

  // ==========================================
  // CÁLCULOS OFICIAIS DO RMA (MDS / SNAS)
  // ==========================================
  const rmaData = useMemo(() => {
    // ----------------------------------------
    // BLOCO 1 - Famílias em acompanhamento PAIF
    // ----------------------------------------
    // A.1: Total de famílias em acompanhamento pelo PAIF no mês
    const familiasAcompanhamentoPaif = familias.filter(f => {
      if (!f.paif_ativo) return false
      const dataCriacao = f.criado_em ? f.criado_em.slice(0, 7) : ''
      const dataInicio = f.paif_data_inicio ? f.paif_data_inicio.slice(0, 7) : dataCriacao
      return dataInicio <= mesAno
    })

    // A.2: Novas famílias inseridas no acompanhamento do PAIF durante o mês de referência
    const novasFamiliasPaif = familias.filter(f => {
      if (!f.paif_ativo) return false
      const dataCriacao = f.criado_em ? f.criado_em.slice(0, 7) : ''
      const dataInicio = f.paif_data_inicio ? f.paif_data_inicio.slice(0, 7) : dataCriacao
      return dataInicio === mesAno
    })

    // B: Perfil das novas famílias (sobre A.2)
    // B.1: Extrema Pobreza (Renda per capita <= R$ 218 ou vulnerabilidade extrema pobreza)
    const novasExtremaPobreza = novasFamiliasPaif.filter(f => {
      const membrosList = f.membros || []
      const totalRenda = (f.renda_responsavel || 0) + membrosList.reduce((acc, m) => acc + (m.renda || 0), 0)
      const totalPessoas = Math.max(1, (membrosList.length > 0 ? membrosList.length : 1))
      const perCapita = totalRenda / totalPessoas
      const hasVuln = (f.vulnerabilidades || []).some(v => v.toUpperCase().includes('EXTREMA') || v.toUpperCase().includes('POBREZA'))
      return perCapita <= 218 || hasVuln
    })

    // B.2: Beneficiárias do Bolsa Família
    const novasBolsaFamilia = novasFamiliasPaif.filter(f => {
      const respPbf = (f.programa_social_responsavel || '').toUpperCase().includes('BOLSA')
      const membPbf = (f.membros || []).some(m => (m.programa_governo || '').toUpperCase().includes('BOLSA'))
      const vulnPbf = (f.vulnerabilidades || []).some(v => v.toUpperCase().includes('BOLSA'))
      return respPbf || membPbf || vulnPbf
    })

    // B.3: Bolsa Família em descumprimento de condicionalidades
    const novasDescumprimento = novasFamiliasPaif.filter(f => {
      const vulnDesc = (f.vulnerabilidades || []).some(v => v.toUpperCase().includes('CONDICIONALIDADE') || v.toUpperCase().includes('DESCUMPRIMENTO'))
      const membDesc = (f.membros || []).some(m => m.descumprimento_condicionalidades === true)
      return vulnDesc || membDesc
    })

    // B.4: Famílias com membros beneficiários do BPC
    const novasBpc = novasFamiliasPaif.filter(f => {
      const respBpc = (f.programa_social_responsavel || '').toUpperCase().includes('BPC')
      const membBpc = (f.membros || []).some(m => (m.programa_governo || '').toUpperCase().includes('BPC'))
      const vulnBpc = (f.vulnerabilidades || []).some(v => v.toUpperCase().includes('BPC'))
      return respBpc || membBpc || vulnBpc
    })

    // B.5: Crianças ou adolescentes em situação de trabalho infantil
    const novasTrabalhoInfantil = novasFamiliasPaif.filter(f => {
      const vulnTI = (f.vulnerabilidades || []).some(v => v.toUpperCase().includes('INFANTIL') || v.toUpperCase().includes('TRABALHO'))
      const membTI = (f.membros || []).some(m => m.trabalho_infantil === true || (m.idade < 16 && (m.ocupacao || '').toUpperCase().includes('TRABALH')))
      return vulnTI || membTI
    })

    // B.6: Crianças ou adolescentes em Serviço de Acolhimento
    const novasAcolhimento = novasFamiliasPaif.filter(f => {
      const vulnAcolh = (f.vulnerabilidades || []).some(v => v.toUpperCase().includes('ACOLHIMENTO') || v.toUpperCase().includes('ABRIGO'))
      const membAcolh = (f.membros || []).some(m => m.acolhimento_institucional === true)
      return vulnAcolh || membAcolh
    })

    // ----------------------------------------
    // BLOCO 2 - Atendimentos Particularizados no CRAS
    // ----------------------------------------
    const atendimentosNoMes = atendimentos.filter(a => {
      const dataAtend = a.data ? a.data.slice(0, 7) : (a.criado_em ? a.criado_em.slice(0, 7) : '')
      return dataAtend === mesAno
    })

    // C.1: Total de atendimentos particularizados no mês
    const particularizados = atendimentosNoMes.filter(a => {
      const tipo = (a.tipo || '').toUpperCase()
      return !tipo.includes('FALTA') && !tipo.includes('CANCELADO') && !tipo.includes('GRUPO')
    })

    // Encaminhamentos no mês
    const encaminhamentosNoMes = encaminhamentos.filter(e => {
      const dataEnc = e.data_envio ? e.data_envio.slice(0, 7) : (e.criado_em ? e.criado_em.slice(0, 7) : '')
      return dataEnc === mesAno
    })

    // C.2: Famílias encaminhadas para inclusão no Cadastro Único
    const encInclusaoCadUnico = encaminhamentosNoMes.filter(e => {
      return e.tipo_rma === 'inclusao_cadunico' || (e.destino || '').toUpperCase().includes('INCLUSÃO') || (e.motivo || '').toUpperCase().includes('INCLUSÃO CADÚNICO')
    })

    // C.3: Famílias encaminhadas para atualização cadastral no Cadastro Único
    const encAtualizacaoCadUnico = encaminhamentosNoMes.filter(e => {
      return e.tipo_rma === 'atualizacao_cadunico' || (e.destino || '').toUpperCase().includes('ATUALIZAÇÃO') || (e.motivo || '').toUpperCase().includes('ATUALIZAÇÃO CADÚNICO')
    })

    // C.4: Indivíduos encaminhados para acesso ao BPC
    const encBpc = encaminhamentosNoMes.filter(e => {
      return e.tipo_rma === 'acesso_bpc' || (e.destino || '').toUpperCase().includes('BPC') || (e.motivo || '').toUpperCase().includes('BPC') || (e.destino || '').toUpperCase().includes('INSS')
    })

    // C.5: Famílias encaminhadas para o CREAS
    const encCreas = encaminhamentosNoMes.filter(e => {
      return e.tipo_rma === 'creas' || (e.destino || '').toUpperCase().includes('CREAS') || (e.motivo || '').toUpperCase().includes('CREAS') || (e.destino || '').toUpperCase().includes('ESPECIAL')
    })

    // C.6: Visitas domiciliares realizadas
    const visitasDomiciliares = atendimentosNoMes.filter(a => {
      const tipo = (a.tipo || '').toUpperCase()
      const local = (a.local || '').toUpperCase()
      return tipo.includes('VISITA') || local.includes('DOMICÍLIO') || local.includes('DOMICILIO')
    })

    // Benefícios no mês
    const beneficiosNoMes = beneficios.filter(b => {
      const dataBen = b.data ? b.data.slice(0, 7) : (b.criado_em ? b.criado_em.slice(0, 7) : '')
      return dataBen === mesAno && (b.status || '').toUpperCase() !== 'CANCELADO'
    })

    // C.7: Auxílios-natalidade concedidos/entregues
    const auxiliosNatalidade = beneficiosNoMes.filter(b => {
      const tipo = (b.tipo || '').toUpperCase()
      return tipo.includes('NATALIDADE') || tipo.includes('ENXOVAL') || tipo.includes('BEBÊ') || tipo.includes('BEBE')
    })

    // C.8: Auxílios-funeral concedidos/entregues
    const auxiliosFuneral = beneficiosNoMes.filter(b => {
      const tipo = (b.tipo || '').toUpperCase()
      return tipo.includes('FUNERAL') || tipo.includes('MORTE') || tipo.includes('URNA')
    })

    // C.9: Outros benefícios eventuais concedidos/entregues
    const outrosBeneficios = beneficiosNoMes.filter(b => {
      const tipo = (b.tipo || '').toUpperCase()
      const isNatalidade = tipo.includes('NATALIDADE') || tipo.includes('ENXOVAL') || tipo.includes('BEBÊ') || tipo.includes('BEBE')
      const isFuneral = tipo.includes('FUNERAL') || tipo.includes('MORTE') || tipo.includes('URNA')
      return !isNatalidade && !isFuneral
    })

    // ----------------------------------------
    // BLOCO 3 - Atendimentos Coletivos no CRAS
    // ----------------------------------------
    // D.1: Famílias participando regularmente de grupos PAIF
    const gruposPaif = grupos.filter(g => (g.tipo_grupo || '').toUpperCase() === 'PAIF' || (g.nome || '').toUpperCase().includes('PAIF'))
    const participantesPaif = participantes.filter(p => gruposPaif.some(g => g.id === p.grupo_id))
    const familiasParticipandoPaif = Array.from(new Set(participantesPaif.map(p => p.familia_id))).length

    // SCFV por faixas etárias (D.2 a D.8)
    const gruposScfv = grupos.filter(g => (g.tipo_grupo || '').toUpperCase() !== 'PAIF')
    const participantesScfv = participantes.filter(p => gruposScfv.some(g => g.id === p.grupo_id))

    // Cruzar participante com membro para obter idade precisa e status de PcD
    const participantesComIdade = participantesScfv.map(part => {
      const fam = familias.find(f => f.id === part.familia_id)
      const membro = (fam?.membros || []).find(m => m.id === part.membro_id || m.nome === part.nome)
      return {
        ...part,
        idade: membro?.idade !== undefined ? membro.idade : (part.idade || 0),
        possui_deficiencia: membro?.possui_deficiencia || part.possui_deficiencia || false
      }
    })

    // D.2: 0 a 6 anos
    const scfv0a6 = participantesComIdade.filter(p => p.idade >= 0 && p.idade <= 6)
    // D.3: 7 a 14 anos
    const scfv7a14 = participantesComIdade.filter(p => p.idade >= 7 && p.idade <= 14)
    // D.4: 15 a 17 anos
    const scfv15a17 = participantesComIdade.filter(p => p.idade >= 15 && p.idade <= 17)
    // D.8: 18 a 59 anos
    const scfv18a59 = participantesComIdade.filter(p => p.idade >= 18 && p.idade <= 59)
    // D.5: 60 anos ou mais (Idosos)
    const scfv60mais = participantesComIdade.filter(p => p.idade >= 60)

    // D.6: Participantes em palestras, oficinas e atividades coletivas não continuadas
    const coletivosPontuais = atendimentosNoMes.filter(a => (a.tipo || '').toUpperCase().includes('GRUPO') || (a.tipo || '').toUpperCase().includes('COLETIVO'))
    const totalD6 = coletivosPontuais.reduce((acc, a) => acc + (a.participantes_familiares?.length || 1), 0)

    // D.7: Pessoas com deficiência participando do SCFV ou grupos PAIF
    const pcdScfvOuPaif = [...participantesComIdade.filter(p => p.possui_deficiencia), ...participantesPaif.filter(p => p.possui_deficiencia)]
    const totalPcdUnicos = Array.from(new Set(pcdScfvOuPaif.map(p => p.membro_id || p.nome))).length

    return {
      A1: { total: familiasAcompanhamentoPaif.length, lista: familiasAcompanhamentoPaif },
      A2: { total: novasFamiliasPaif.length, lista: novasFamiliasPaif },
      B1: { total: novasExtremaPobreza.length, lista: novasExtremaPobreza },
      B2: { total: novasBolsaFamilia.length, lista: novasBolsaFamilia },
      B3: { total: novasDescumprimento.length, lista: novasDescumprimento },
      B4: { total: novasBpc.length, lista: novasBpc },
      B5: { total: novasTrabalhoInfantil.length, lista: novasTrabalhoInfantil },
      B6: { total: novasAcolhimento.length, lista: novasAcolhimento },

      C1: { total: particularizados.length, lista: particularizados },
      C2: { total: encInclusaoCadUnico.length, lista: encInclusaoCadUnico },
      C3: { total: encAtualizacaoCadUnico.length, lista: encAtualizacaoCadUnico },
      C4: { total: encBpc.length, lista: encBpc },
      C5: { total: encCreas.length, lista: encCreas },
      C6: { total: visitasDomiciliares.length, lista: visitasDomiciliares },
      C7: { total: auxiliosNatalidade.length, lista: auxiliosNatalidade },
      C8: { total: auxiliosFuneral.length, lista: auxiliosFuneral },
      C9: { total: outrosBeneficios.length, lista: outrosBeneficios },

      D1: { total: familiasParticipandoPaif, lista: participantesPaif },
      D2: { total: scfv0a6.length, lista: scfv0a6 },
      D3: { total: scfv7a14.length, lista: scfv7a14 },
      D4: { total: scfv15a17.length, lista: scfv15a17 },
      D8: { total: scfv18a59.length, lista: scfv18a59 },
      D5: { total: scfv60mais.length, lista: scfv60mais },
      D6: { total: totalD6, lista: coletivosPontuais },
      D7: { total: totalPcdUnicos, lista: pcdScfvOuPaif }
    }
  }, [familias, atendimentos, beneficios, grupos, participantes, encaminhamentos, mesAno])

  function abrirAuditoria(codigo: string, titulo: string, lista: any[], tipo: 'familia' | 'atendimento' | 'beneficio' | 'encaminhamento' | 'participante') {
    const itens = lista.map((item, idx) => {
      if (tipo === 'familia') {
        const f = item as Familia
        const podeVerVuln = isTecnicoSuperior(usuarioLogado) || getPerfilUsuario(usuarioLogado) === 'admin'
        return {
          id: f.id || String(idx),
          principal: `${f.responsavel} (Prontuário: ${f.cod_familiar})`,
          secundario: `CPF: ${f.cpf_responsavel || '—'} • Bairro: ${f.bairro || '—'} • PAIF: ${f.paif_ativo ? 'SIM' : 'NÃO'}`,
          detalhes: f.vulnerabilidades && f.vulnerabilidades.length > 0
            ? (podeVerVuln ? `Vulnerabilidades: ${f.vulnerabilidades.join(', ')}` : 'Vulnerabilidades: [RESTRITO AO ACOMPANHAMENTO TÉCNICO PAIF]')
            : undefined,
          data: f.paif_data_inicio || f.criado_em
        }
      } else if (tipo === 'atendimento') {
        const a = item as Atendimento
        const resSig = verificarAcessoRelatoAtendimento(a, usuarioLogado)
        const relatoExibido = resSig.podeVer ? (extrairRelatoLimpo(a.relato) || 'Atendimento realizado') : resSig.mensagemOculta
        return {
          id: a.id || String(idx),
          principal: `${a.usuario_visitado || a.responsavel_nome || 'Usuário'} — ${a.tipo}`,
          secundario: `Técnico(a): ${a.tecnico} • Local: ${a.local} • Horário: ${a.hora || '10:00'}`,
          detalhes: `Síntese / Relato: ${relatoExibido}`,
          data: a.data
        }
      } else if (tipo === 'beneficio') {
        const b = item as BeneficioConcedido
        return {
          id: b.id || String(idx),
          principal: `${b.responsavel_nome || 'Beneficiário'} — ${b.tipo}`,
          secundario: `Status: ${b.status} • Bairro: ${b.bairro || '—'}`,
          detalhes: b.observacao ? `Obs: ${b.observacao}` : undefined,
          data: b.data
        }
      } else if (tipo === 'encaminhamento') {
        const e = item as Encaminhamento
        const podeVerMot = podeVerDetalheEncaminhamento(usuarioLogado, e)
        return {
          id: e.id || String(idx),
          principal: `${e.beneficiario} -> Destino: ${e.destino}`,
          secundario: `Técnico: ${e.tecnico} • Status: ${e.status} • Categoria: ${e.tipo_rma || 'Geral'}`,
          detalhes: e.motivo ? `Motivo: ${podeVerMot ? e.motivo : '[CONTEÚDO CONFIDENCIAL — RESTRITO À EQUIPE TÉCNICA SUPERIOR]'}` : undefined,
          data: e.data_envio
        }
      } else {
        const p = item as ParticipanteSCFV
        return {
          id: p.id || String(idx),
          principal: `${p.nome}`,
          secundario: `Idade: ${p.idade !== undefined ? p.idade + ' anos' : '—'} • PcD: ${p.possui_deficiencia ? 'Sim' : 'Não'}`,
          data: p.criado_em
        }
      }
    })

    setModalAuditoria({
      codigo,
      titulo,
      itens
    })
  }

  return (
    <div className="space-y-6">
      {/* ========================================================
          CABEÇALHO DE IMPRESSÃO OFICIAL DO RMA (PADRÃO MDS/SNAS)
          ======================================================== */}
      <div className="hidden print:block border-2 border-black p-3 mb-4 text-black text-xs font-sans">
        <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-2">
          <div className="flex items-center gap-3">
            {configuracao?.logo_url ? (
              <img src={configuracao.logo_url} alt="Brasão" className="h-14 w-auto object-contain" />
            ) : null}
            <div>
              <h1 className="text-sm font-black uppercase tracking-wide">
                FORMULÁRIO DE REGISTRO MENSAL DE ATENDIMENTOS DO CRAS (RMA)
              </h1>
              <p className="text-[10px] uppercase font-bold text-gray-700">
                SISTEMA ÚNICO DE ASSISTÊNCIA SOCIAL (SUAS) — MINISTÉRIO DO DESENVOLVIMENTO SOCIAL (MDS)
              </p>
            </div>
          </div>
          <div className="text-right border-2 border-black px-3 py-1 bg-gray-100">
            <span className="text-[11px] font-black uppercase block">MÊS DE REFERÊNCIA</span>
            <span className="text-sm font-black">{mesExtenso.toUpperCase()} / {anoRef}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] pb-2 border-b border-black">
          <div>
            <p><strong>Nome da Unidade:</strong> {configuracao?.cras_unidade || 'CRAS Conceição do Tocantins'}</p>
            <p><strong>Endereço:</strong> {configuracao?.endereco || 'Rua Central, s/n - Centro'}</p>
          </div>
          <div>
            <p><strong>Município / UF:</strong> {configuracao?.municipio || 'Conceição do Tocantins'} — TO</p>
            <p><strong>Telefone / Contato:</strong> {configuracao?.telefone || '(63) 3381-1234'} | {configuracao?.email || 'cras@municipio.gov.br'}</p>
          </div>
        </div>
      </div>

      {/* ========================================================
          CABEÇALHO EM TELA (INTERATIVO)
          ======================================================== */}
      {/* Banner Principal Padronizado */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-teal-900 rounded-2xl p-6 text-white shadow-xl border border-teal-800/40 relative overflow-hidden print:hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 bottom-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-teal-500/30 text-teal-200 border border-teal-400/30 tracking-wider">
                Relatórios Oficiais • SUAS / MDS
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <i className="fa-solid fa-file-invoice text-teal-400 text-xl"></i>
              <span>Registro Mensal de Atendimentos (RMA)</span>
            </h2>
            <p className="text-xs text-teal-200/90 leading-relaxed font-normal">
              Espelho oficial dos Blocos 1, 2 e 3 alinhado às normativas do MDS e ao Manual do Prontuário SUAS.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 text-xs">
              <label className="text-xs font-bold text-teal-200 whitespace-nowrap">
                <i className="fa-solid fa-calendar-days text-teal-400 mr-1.5"></i> Mês:
              </label>
              <input
                type="month"
                value={mesAno}
                onChange={e => setMesAno(e.target.value)}
                className="px-2 py-1 bg-slate-900 text-white border border-teal-500/40 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-400 font-mono"
              />
            </div>

            <button
              onClick={() => window.print()}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-3 rounded-xl text-xs shadow-lg transition flex items-center gap-2.5 hover:scale-[1.02] active:scale-95 border border-emerald-300"
            >
              <i className="fa-solid fa-print text-sm"></i>
              <span>Imprimir RMA Oficial</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          BLOCO 1 - FAMÍLIAS EM ACOMPANHAMENTO PELO PAIF
          ======================================================== */}
      <div className="bg-white rounded-2xl border border-teal-900/20 shadow-sm overflow-hidden print:border-black print:rounded-none">
        <div className="bg-teal-800 text-white px-4 py-2.5 flex justify-between items-center print:bg-black print:text-white">
          <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2">
            <i className="fa-solid fa-people-roof text-teal-300 print:hidden"></i> Bloco 1 — Famílias em acompanhamento pelo PAIF
          </h3>
          <span className="text-[10px] font-bold text-teal-100 print:text-white uppercase">
            Mês: {mesExtenso} / {anoRef}
          </span>
        </div>

        <div className="divide-y divide-gray-200 text-xs">
          {/* Seção A */}
          <div className="p-4 bg-teal-50/40 print:bg-white">
            <h4 className="font-extrabold text-teal-900 uppercase text-[11px] mb-3 flex items-center gap-1.5">
              <span className="w-5 h-5 bg-teal-800 text-white rounded flex items-center justify-center text-[10px]">A</span>
              Volume de famílias em acompanhamento pelo PAIF
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* A.1 */}
              <div
                onClick={() => abrirAuditoria('A.1', 'Total de Famílias em Acompanhamento pelo PAIF', rmaData.A1.lista, 'familia')}
                className="flex justify-between items-center p-3 bg-white border border-teal-100 rounded-xl hover:border-teal-400 hover:shadow-sm cursor-pointer transition print:border-black print:rounded-none"
              >
                <div>
                  <span className="font-bold text-gray-900 block text-xs">A.1. Total de famílias em acompanhamento pelo PAIF</span>
                  <span className="text-[10px] text-gray-500">Volume total ativo no mês de referência</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-teal-900 font-mono">{rmaData.A1.total}</span>
                  <i className="fa-solid fa-magnifying-glass text-teal-600 text-xs print:hidden"></i>
                </div>
              </div>

              {/* A.2 */}
              <div
                onClick={() => abrirAuditoria('A.2', 'Novas Famílias Inseridas no Acompanhamento PAIF no Mês', rmaData.A2.lista, 'familia')}
                className="flex justify-between items-center p-3 bg-white border border-teal-100 rounded-xl hover:border-teal-400 hover:shadow-sm cursor-pointer transition print:border-black print:rounded-none"
              >
                <div>
                  <span className="font-bold text-gray-900 block text-xs">A.2. Novas famílias inseridas no acompanhamento no mês</span>
                  <span className="text-[10px] text-gray-500">Iniciaram acompanhamento em {mesExtenso}/{anoRef}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-emerald-800 font-mono">{rmaData.A2.total}</span>
                  <i className="fa-solid fa-magnifying-glass text-emerald-600 text-xs print:hidden"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Seção B */}
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-extrabold text-gray-900 uppercase text-[11px] flex items-center gap-1.5">
                <span className="w-5 h-5 bg-gray-800 text-white rounded flex items-center justify-center text-[10px]">B</span>
                Perfil das novas famílias inseridas em acompanhamento no PAIF no mês de referência
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* B.1 */}
              <div
                onClick={() => abrirAuditoria('B.1', 'Novas Famílias em Situação de Extrema Pobreza', rmaData.B1.lista, 'familia')}
                className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-teal-400 cursor-pointer transition print:border-black print:bg-white print:rounded-none"
              >
                <div className="pr-2">
                  <span className="font-bold text-gray-800 text-[11px] block">B.1. Famílias em situação de extrema pobreza</span>
                  <span className="text-[10px] text-gray-500">Renda per capita ≤ R$ 218</span>
                </div>
                <span className="text-base font-black text-gray-900 font-mono">{rmaData.B1.total}</span>
              </div>

              {/* B.2 */}
              <div
                onClick={() => abrirAuditoria('B.2', 'Novas Famílias Beneficiárias do Bolsa Família', rmaData.B2.lista, 'familia')}
                className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-teal-400 cursor-pointer transition print:border-black print:bg-white print:rounded-none"
              >
                <div className="pr-2">
                  <span className="font-bold text-gray-800 text-[11px] block">B.2. Famílias beneficiárias do Bolsa Família</span>
                  <span className="text-[10px] text-gray-500">Beneficiárias ativas do PBF</span>
                </div>
                <span className="text-base font-black text-gray-900 font-mono">{rmaData.B2.total}</span>
              </div>

              {/* B.3 */}
              <div
                onClick={() => abrirAuditoria('B.3', 'Novas Famílias em Descumprimento de Condicionalidades', rmaData.B3.lista, 'familia')}
                className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-teal-400 cursor-pointer transition print:border-black print:bg-white print:rounded-none"
              >
                <div className="pr-2">
                  <span className="font-bold text-gray-800 text-[11px] block">B.3. Em descumprimento de condicionalidades</span>
                  <span className="text-[10px] text-gray-500">Condicionalidades de saúde/educação</span>
                </div>
                <span className="text-base font-black text-gray-900 font-mono">{rmaData.B3.total}</span>
              </div>

              {/* B.4 */}
              <div
                onClick={() => abrirAuditoria('B.4', 'Novas Famílias com Membros Beneficiários do BPC', rmaData.B4.lista, 'familia')}
                className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-teal-400 cursor-pointer transition print:border-black print:bg-white print:rounded-none"
              >
                <div className="pr-2">
                  <span className="font-bold text-gray-800 text-[11px] block">B.4. Com membros beneficiários do BPC</span>
                  <span className="text-[10px] text-gray-500">Idoso ou PcD beneficiário</span>
                </div>
                <span className="text-base font-black text-gray-900 font-mono">{rmaData.B4.total}</span>
              </div>

              {/* B.5 */}
              <div
                onClick={() => abrirAuditoria('B.5', 'Novas Famílias com Crianças/Adolescentes em Trabalho Infantil', rmaData.B5.lista, 'familia')}
                className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-teal-400 cursor-pointer transition print:border-black print:bg-white print:rounded-none"
              >
                <div className="pr-2">
                  <span className="font-bold text-gray-800 text-[11px] block">B.5. Crianças/adolescentes em trabalho infantil</span>
                  <span className="text-[10px] text-gray-500">Identificação de trabalho precoce</span>
                </div>
                <span className="text-base font-black text-gray-900 font-mono">{rmaData.B5.total}</span>
              </div>

              {/* B.6 */}
              <div
                onClick={() => abrirAuditoria('B.6', 'Novas Famílias com Crianças/Adolescentes em Serviço de Acolhimento', rmaData.B6.lista, 'familia')}
                className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-teal-400 cursor-pointer transition print:border-black print:bg-white print:rounded-none"
              >
                <div className="pr-2">
                  <span className="font-bold text-gray-800 text-[11px] block">B.6. Crianças/adolescentes em Acolhimento</span>
                  <span className="text-[10px] text-gray-500">Serviço de Acolhimento Institucional</span>
                </div>
                <span className="text-base font-black text-gray-900 font-mono">{rmaData.B6.total}</span>
              </div>
            </div>

            <p className="text-[10px] text-gray-500 italic mt-3 pt-2 border-t border-gray-100 print:text-black">
              * Atenção: Os itens B.1 a B.6 identificam perfis específicos das famílias contadas em A.2. Uma família pode se enquadrar simultaneamente em mais de uma condição ou em nenhuma.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          BLOCO 2 - ATENDIMENTOS PARTICULARIZADOS NO CRAS
          ======================================================== */}
      <div className="bg-white rounded-2xl border border-blue-900/20 shadow-sm overflow-hidden print:border-black print:rounded-none">
        <div className="bg-blue-900 text-white px-4 py-2.5 flex justify-between items-center print:bg-black print:text-white">
          <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2">
            <i className="fa-solid fa-user-check text-blue-300 print:hidden"></i> Bloco 2 — Atendimentos particularizados realizados no CRAS
          </h3>
          <span className="text-[10px] font-bold text-blue-100 print:text-white uppercase">
            Mês: {mesExtenso} / {anoRef}
          </span>
        </div>

        <div className="p-4 text-xs space-y-4">
          <h4 className="font-extrabold text-blue-950 uppercase text-[11px] flex items-center gap-1.5">
            <span className="w-5 h-5 bg-blue-900 text-white rounded flex items-center justify-center text-[10px]">C</span>
            Volume de atendimentos particularizados realizados no CRAS no mês de referência
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* C.1 */}
            <div
              onClick={() => abrirAuditoria('C.1', 'Total de Atendimentos Particularizados no Mês', rmaData.C1.lista, 'atendimento')}
              className="flex justify-between items-center p-3 bg-blue-50/60 border border-blue-200 rounded-xl hover:border-blue-500 cursor-pointer transition lg:col-span-3 print:border-black print:bg-white print:rounded-none"
            >
              <div>
                <span className="font-bold text-blue-950 text-xs block">C.1. Total de atendimentos particularizados realizados no mês de referência</span>
                <span className="text-[10px] text-gray-600">Soma de todos os atendimentos individuais, acolhidas e escutas no CRAS</span>
              </div>
              <span className="text-xl font-black text-blue-950 font-mono">{rmaData.C1.total}</span>
            </div>

            {/* C.2 */}
            <div
              onClick={() => abrirAuditoria('C.2', 'Famílias Encaminhadas para Inclusão no CadÚnico', rmaData.C2.lista, 'encaminhamento')}
              className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-blue-400 cursor-pointer transition print:border-black print:bg-white print:rounded-none"
            >
              <span className="font-bold text-gray-800 text-[11px]">C.2. Encaminhadas para inclusão no Cadastro Único</span>
              <span className="text-base font-black text-gray-900 font-mono">{rmaData.C2.total}</span>
            </div>

            {/* C.3 */}
            <div
              onClick={() => abrirAuditoria('C.3', 'Famílias Encaminhadas para Atualização Cadastral no CadÚnico', rmaData.C3.lista, 'encaminhamento')}
              className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-blue-400 cursor-pointer transition print:border-black print:bg-white print:rounded-none"
            >
              <span className="font-bold text-gray-800 text-[11px]">C.3. Encaminhadas para atualização no Cadastro Único</span>
              <span className="text-base font-black text-gray-900 font-mono">{rmaData.C3.total}</span>
            </div>

            {/* C.4 */}
            <div
              onClick={() => abrirAuditoria('C.4', 'Indivíduos Encaminhados para Acesso ao BPC', rmaData.C4.lista, 'encaminhamento')}
              className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-blue-400 cursor-pointer transition print:border-black print:bg-white print:rounded-none"
            >
              <span className="font-bold text-gray-800 text-[11px]">C.4. Indivíduos encaminhados para acesso ao BPC</span>
              <span className="text-base font-black text-gray-900 font-mono">{rmaData.C4.total}</span>
            </div>

            {/* C.5 */}
            <div
              onClick={() => abrirAuditoria('C.5', 'Famílias Encaminhadas para o CREAS', rmaData.C5.lista, 'encaminhamento')}
              className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-blue-400 cursor-pointer transition print:border-black print:bg-white print:rounded-none"
            >
              <span className="font-bold text-gray-800 text-[11px]">C.5. Famílias encaminhadas para o CREAS</span>
              <span className="text-base font-black text-gray-900 font-mono">{rmaData.C5.total}</span>
            </div>

            {/* C.6 */}
            <div
              onClick={() => abrirAuditoria('C.6', 'Visitas Domiciliares Realizadas no Mês', rmaData.C6.lista, 'atendimento')}
              className="flex justify-between items-center p-3 bg-purple-50/50 border border-purple-200 rounded-xl hover:border-purple-500 cursor-pointer transition print:border-black print:bg-white print:rounded-none"
            >
              <span className="font-bold text-purple-950 text-[11px]">C.6. Visitas domiciliares realizadas</span>
              <span className="text-base font-black text-purple-900 font-mono">{rmaData.C6.total}</span>
            </div>

            {/* C.7 */}
            <div
              onClick={() => abrirAuditoria('C.7', 'Auxílios-Natalidade Concedidos / Entregues', rmaData.C7.lista, 'beneficio')}
              className="flex justify-between items-center p-3 bg-amber-50/50 border border-amber-200 rounded-xl hover:border-amber-500 cursor-pointer transition print:border-black print:bg-white print:rounded-none"
            >
              <span className="font-bold text-amber-950 text-[11px]">C.7. Total de auxílios-natalidade concedidos/entregues</span>
              <span className="text-base font-black text-amber-900 font-mono">{rmaData.C7.total}</span>
            </div>

            {/* C.8 */}
            <div
              onClick={() => abrirAuditoria('C.8', 'Auxílios-Funeral Concedidos / Entregues', rmaData.C8.lista, 'beneficio')}
              className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-gray-500 cursor-pointer transition print:border-black print:bg-white print:rounded-none"
            >
              <span className="font-bold text-gray-800 text-[11px]">C.8. Total de auxílios-funeral concedidos/entregues</span>
              <span className="text-base font-black text-gray-900 font-mono">{rmaData.C8.total}</span>
            </div>

            {/* C.9 */}
            <div
              onClick={() => abrirAuditoria('C.9', 'Outros Benefícios Eventuais Concedidos (Cestas, etc.)', rmaData.C9.lista, 'beneficio')}
              className="flex justify-between items-center p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl hover:border-emerald-500 cursor-pointer transition print:border-black print:bg-white print:rounded-none"
            >
              <span className="font-bold text-emerald-950 text-[11px]">C.9. Outros benefícios eventuais concedidos/entregues</span>
              <span className="text-base font-black text-emerald-900 font-mono">{rmaData.C9.total}</span>
            </div>
          </div>

          <p className="text-[10px] text-gray-500 italic pt-2 border-t border-gray-100 print:text-black">
            * Atenção: Nos campos C.1 a C.6 são contabilizadas todas as famílias/indivíduos atendidos no mês, independente de estarem ou não em acompanhamento sistemático pelo PAIF.
          </p>
        </div>
      </div>

      {/* ========================================================
          BLOCO 3 - ATENDIMENTOS COLETIVOS REALIZADOS NO CRAS
          ======================================================== */}
      <div className="bg-white rounded-2xl border border-emerald-900/20 shadow-sm overflow-hidden print:border-black print:rounded-none">
        <div className="bg-emerald-900 text-white px-4 py-2.5 flex justify-between items-center print:bg-black print:text-white">
          <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2">
            <i className="fa-solid fa-users text-emerald-300 print:hidden"></i> Bloco 3 — Atendimentos coletivos realizados no CRAS
          </h3>
          <span className="text-[10px] font-bold text-emerald-100 print:text-white uppercase">
            Mês: {mesExtenso} / {anoRef}
          </span>
        </div>

        <div className="p-4 text-xs space-y-4">
          <h4 className="font-extrabold text-emerald-950 uppercase text-[11px] flex items-center gap-1.5">
            <span className="w-5 h-5 bg-emerald-900 text-white rounded flex items-center justify-center text-[10px]">D</span>
            Volume de atendimentos coletivos realizados no CRAS durante o mês de referência
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* D.1 */}
            <div
              onClick={() => abrirAuditoria('D.1', 'Famílias Participando Regularmente de Grupos PAIF', rmaData.D1.lista, 'participante')}
              className="flex justify-between items-center p-3 bg-teal-50/60 border border-teal-200 rounded-xl hover:border-teal-500 cursor-pointer transition md:col-span-2 print:border-black print:bg-white print:rounded-none"
            >
              <div>
                <span className="font-bold text-teal-950 text-xs block">D.1. Famílias participando regularmente de grupos PAIF</span>
                <span className="text-[10px] text-gray-500">Grupos reflexivos, oficinas e encontros continuados do PAIF</span>
              </div>
              <span className="text-lg font-black text-teal-950 font-mono">{rmaData.D1.total}</span>
            </div>

            {/* D.2 */}
            <div
              onClick={() => abrirAuditoria('D.2', 'Crianças de 0 a 6 anos no SCFV', rmaData.D2.lista, 'participante')}
              className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-emerald-400 cursor-pointer transition print:border-black print:bg-white print:rounded-none"
            >
              <span className="font-bold text-gray-800 text-[11px]">D.2. Crianças de 0 a 6 anos em SCFV</span>
              <span className="text-base font-black text-gray-900 font-mono">{rmaData.D2.total}</span>
            </div>

            {/* D.3 */}
            <div
              onClick={() => abrirAuditoria('D.3', 'Crianças/Adolescentes de 7 a 14 anos no SCFV', rmaData.D3.lista, 'participante')}
              className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-emerald-400 cursor-pointer transition print:border-black print:bg-white print:rounded-none"
            >
              <span className="font-bold text-gray-800 text-[11px]">D.3. Crianças/adolescentes de 7 a 14 anos em SCFV</span>
              <span className="text-base font-black text-gray-900 font-mono">{rmaData.D3.total}</span>
            </div>

            {/* D.4 */}
            <div
              onClick={() => abrirAuditoria('D.4', 'Adolescentes de 15 a 17 anos no SCFV', rmaData.D4.lista, 'participante')}
              className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-emerald-400 cursor-pointer transition print:border-black print:bg-white print:rounded-none"
            >
              <span className="font-bold text-gray-800 text-[11px]">D.4. Adolescentes de 15 a 17 anos em SCFV</span>
              <span className="text-base font-black text-gray-900 font-mono">{rmaData.D4.total}</span>
            </div>

            {/* D.8 */}
            <div
              onClick={() => abrirAuditoria('D.8', 'Adultos entre 18 e 59 anos no SCFV', rmaData.D8.lista, 'participante')}
              className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-emerald-400 cursor-pointer transition print:border-black print:bg-white print:rounded-none"
            >
              <span className="font-bold text-gray-800 text-[11px]">D.8. Adultos entre 18 e 59 anos em SCFV</span>
              <span className="text-base font-black text-gray-900 font-mono">{rmaData.D8.total}</span>
            </div>

            {/* D.5 */}
            <div
              onClick={() => abrirAuditoria('D.5', 'Idosos (60+ anos) no SCFV para Idosos', rmaData.D5.lista, 'participante')}
              className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-emerald-400 cursor-pointer transition print:border-black print:bg-white print:rounded-none"
            >
              <span className="font-bold text-gray-800 text-[11px]">D.5. Idosos (60+ anos) no SCFV para idosos</span>
              <span className="text-base font-black text-gray-900 font-mono">{rmaData.D5.total}</span>
            </div>

            {/* D.6 */}
            <div
              onClick={() => abrirAuditoria('D.6', 'Participantes de Palestras, Oficinas e Eventos Coletivos Não Continuados', rmaData.D6.lista, 'atendimento')}
              className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-emerald-400 cursor-pointer transition md:col-span-2 print:border-black print:bg-white print:rounded-none"
            >
              <span className="font-bold text-gray-800 text-[11px]">D.6. Palestras, oficinas e atividades coletivas não continuadas</span>
              <span className="text-base font-black text-gray-900 font-mono">{rmaData.D6.total}</span>
            </div>

            {/* D.7 */}
            <div
              onClick={() => abrirAuditoria('D.7', 'Pessoas com Deficiência Participando de SCFV ou Grupos PAIF', rmaData.D7.lista, 'participante')}
              className="flex justify-between items-center p-3 bg-amber-50/60 border border-amber-200 rounded-xl hover:border-amber-500 cursor-pointer transition md:col-span-2 print:border-black print:bg-white print:rounded-none"
            >
              <div>
                <span className="font-bold text-amber-950 text-[11px] block">D.7. Pessoas com deficiência participantes de SCFV ou PAIF</span>
                <span className="text-[10px] text-gray-500">Membros com deficiência incluídos nos serviços</span>
              </div>
              <span className="text-base font-black text-amber-900 font-mono">{rmaData.D7.total}</span>
            </div>
          </div>

          <p className="text-[10px] text-gray-500 italic pt-2 border-t border-gray-100 print:text-black">
            * Apesar dos serviços de convivência não estarem mais vinculados a faixas etárias estritas, para facilidade de registro no RMA, os usuários são contabilizados de acordo com sua idade.
          </p>
        </div>
      </div>

      {/* ========================================================
          RODAPÉ E ASSINATURA OFICIAL DE IMPRESSÃO
          ======================================================== */}
      <div className="hidden print:block pt-8 text-black text-xs font-sans">
        <div className="grid grid-cols-2 gap-10 mt-6 pt-6 border-t-2 border-black">
          <div className="text-center">
            <div className="border-t border-black w-3/4 mx-auto pt-1 font-bold">
              Nome e Cargo do(a) Responsável pelo Preenchimento
            </div>
            <p className="text-[10px] text-gray-600 uppercase">Técnico(a) de Referência / Assistente Social / Psicólogo(a)</p>
          </div>
          <div className="text-center">
            <div className="border-t border-black w-3/4 mx-auto pt-1 font-bold">
              Coordenação da Unidade CRAS
            </div>
            <p className="text-[10px] text-gray-600 uppercase">Visto e Homologação da Coordenação</p>
          </div>
        </div>

        <p className="text-[9px] text-center text-gray-500 pt-4 font-mono">
          Relatório emitido pelo Sistema SUAS Digital em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
        </p>
      </div>

      {/* ========================================================
          MODAL DE AUDITORIA / DRILL-DOWN (LISTA DE FAMÍLIAS/ITENS)
          ======================================================== */}
      {modalAuditoria && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-teal-900 text-white p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-teal-700 text-white rounded font-mono font-bold text-xs">
                  {modalAuditoria.codigo}
                </span>
                <h3 className="text-sm font-bold uppercase tracking-wide">
                  {modalAuditoria.titulo} ({modalAuditoria.itens.length})
                </h3>
              </div>
              <button
                onClick={() => setModalAuditoria(null)}
                className="text-teal-200 hover:text-white text-xl"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 divide-y divide-gray-100 text-xs">
              {modalAuditoria.itens.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <i className="fa-solid fa-folder-open text-3xl text-gray-300 mb-2 block"></i>
                  Nenhum registro encontrado para este indicador no mês de referência selecionado ({mesExtenso}/{anoRef}).
                </div>
              ) : (
                modalAuditoria.itens.map((item, idx) => (
                  <div key={item.id || idx} className="py-3 px-2 hover:bg-gray-50 rounded-lg transition">
                    <div className="flex justify-between items-start gap-2">
                      <div className="font-bold text-gray-900 uppercase">{item.principal}</div>
                      {item.data && (
                        <span className="text-[10px] text-gray-500 font-mono shrink-0 bg-gray-100 px-2 py-0.5 rounded">
                          {item.data.slice(0, 10).split('-').reverse().join('/')}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-600 mt-0.5">{item.secundario}</div>
                    {item.detalhes && (
                      <div className="text-[10px] text-teal-800 bg-teal-50/80 p-1.5 rounded mt-1.5 font-medium">
                        {item.detalhes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-gray-50 border-t flex justify-between items-center text-xs">
              <span className="text-gray-500 text-[11px]">
                Total contabilizado: <strong>{modalAuditoria.itens.length} registro(s)</strong>
              </span>
              <button
                onClick={() => setModalAuditoria(null)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-bold uppercase text-[11px]"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
