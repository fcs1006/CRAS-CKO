'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Usuario,
  Familia,
  MembroFamilia,
  Atendimento,
  BeneficioConcedido,
  AlmoxarifadoItem,
  GrupoSCFV,
  ParticipanteSCFV,
  Encaminhamento,
  AgendaItem,
  Configuracao
} from '@/types'
import { parseResponseJson } from '@/utils/safeFetch'

// Importação das Sub-Vistas Modulares
import { DashboardView } from '@/components/painel/DashboardView'
import { FamiliasView } from '@/components/painel/FamiliasView'
import { AtendimentosView } from '@/components/painel/AtendimentosView'
import { BeneficiosView } from '@/components/painel/BeneficiosView'
import { ScfvView } from '@/components/painel/ScfvView'
import { EncaminhamentosView } from '@/components/painel/EncaminhamentosView'
import { GeomapeamentoView } from '@/components/painel/GeomapeamentoView'
import { RmaView } from '@/components/painel/RmaView'
import { UsuariosView } from '@/components/painel/UsuariosView'
import { ConfiguracoesView } from '@/components/painel/ConfiguracoesView'

// Importação dos Modais Isolados
import { ModalNovaFamilia } from '@/components/modals/ModalNovaFamilia'
import { ModalVerFamilia } from '@/components/modals/ModalVerFamilia'
import { ModalEditarFamilia } from '@/components/modals/ModalEditarFamilia'
import { ModalNovoAgendamento } from '@/components/modals/ModalNovoAgendamento'
import { ModalNovoAtendimento } from '@/components/modals/ModalNovoAtendimento'
import { ModalConcederBeneficio } from '@/components/modals/ModalConcederBeneficio'
import { ModalNovoGrupoScfv } from '@/components/modals/ModalNovoGrupoScfv'
import { ModalVincularParticipanteScfv } from '@/components/modals/ModalVincularParticipanteScfv'
import { ModalFrequenciaGrupoScfv } from '@/components/modals/ModalFrequenciaGrupoScfv'
import { ModalRelatorioGrupoScfv } from '@/components/modals/ModalRelatorioGrupoScfv'
import { ModalRelatorioGeralGrupoScfv } from '@/components/modals/ModalRelatorioGeralGrupoScfv'
import { ModalNovoEncaminhamento } from '@/components/modals/ModalNovoEncaminhamento'

// Dados Mock de Fallback para ambiente de desenvolvimento offline
const INITIAL_CONFIG: Configuracao = {
  municipio: 'Prefeitura Municipal de Conceição do Tocantins',
  secretaria: 'Secretaria Municipal de Assistência Social',
  cras_unidade: 'Centro de Referência e Assistência Social Pedro de Santana Brito',
  endereco: 'Rua Central, s/n - Centro, Conceição do Tocantins - TO, CEP: 77305-000',
  telefone: '(63) 3381-1234',
  email: 'cras@conceicao.to.gov.br'
}

const INITIAL_ALMOXARIFADO: AlmoxarifadoItem[] = [
  { id: 1, tipo: 'Cesta Básica', saldo: 40, unidade: 'Unidades' },
  { id: 2, tipo: 'Enxoval de Bebê / Auxílio Natalidade', saldo: 15, unidade: 'Kits' },
  { id: 3, tipo: 'Auxílio Funeral', saldo: 5, unidade: 'Ordens' },
  { id: 4, tipo: 'Aluguel Social', saldo: 10, unidade: 'Benefícios' }
]

export default function PainelPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null)
  const [carregandoDados, setCarregandoDados] = useState(true)

  // Estados dos Dados do Sistema
  const [configuracao, setConfiguracao] = useState<Configuracao>(INITIAL_CONFIG)
  const [familias, setFamilias] = useState<Familia[]>([])
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([])
  const [beneficios, setBeneficios] = useState<BeneficioConcedido[]>([])
  const [almoxarifado, setAlmoxarifado] = useState<AlmoxarifadoItem[]>(INITIAL_ALMOXARIFADO)
  const [grupos, setGrupos] = useState<GrupoSCFV[]>([])
  const [participantes, setParticipantes] = useState<ParticipanteSCFV[]>([])
  const [encaminhamentos, setEncaminhamentos] = useState<Encaminhamento[]>([])
  const [agenda, setAgenda] = useState<AgendaItem[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])

  // Estados dos Modais
  const [modalNovaFamilia, setModalNovaFamilia] = useState(false)
  const [modalVerFamilia, setModalVerFamilia] = useState<Familia | null>(null)
  const [modalEditarFamilia, setModalEditarFamilia] = useState<Familia | null>(null)
  const [modalNovoAtendimento, setModalNovoAtendimento] = useState(false)
  const [dadosPreenchidosAtendimento, setDadosPreenchidosAtendimento] = useState<(Partial<Atendimento> & { agenda_id?: string }) | null>(null)
  const [modalNovoAgendamento, setModalNovoAgendamento] = useState(false)
  const [modalConcederBeneficio, setModalConcederBeneficio] = useState(false)
  const [modalNovoGrupo, setModalNovoGrupo] = useState(false)
  const [grupoParaEditar, setGrupoParaEditar] = useState<GrupoSCFV | null>(null)
  const [grupoParaVincular, setGrupoParaVincular] = useState<GrupoSCFV | null>(null)
  const [grupoParaFrequencia, setGrupoParaFrequencia] = useState<GrupoSCFV | null>(null)
  const [grupoParaRelatorio, setGrupoParaRelatorio] = useState<GrupoSCFV | null>(null)
  const [grupoParaRelatorioGeral, setGrupoParaRelatorioGeral] = useState<GrupoSCFV | null>(null)
  const [modalNovoEncaminhamento, setModalNovoEncaminhamento] = useState(false)

  // Carregar sessão do usuário e carregar dados
  useEffect(() => {
    const rawUser = localStorage.getItem('cras_user')
    if (!rawUser) {
      router.push('/')
      return
    }
    try {
      const parsed = JSON.parse(rawUser)
      setUsuarioLogado(parsed)
    } catch (e) {
      router.push('/')
      return
    }

    // Carregar configurações do cache local imediatamente para exibição instantânea (0ms)
    const cachedConfig = localStorage.getItem('cras_settings')
    if (cachedConfig) {
      try {
        const parsedCfg = JSON.parse(cachedConfig)
        setConfiguracao(prev => ({
          ...prev,
          cras_unidade: parsedCfg.crasUnidade || prev.cras_unidade,
          municipio: parsedCfg.municipio || prev.municipio,
          secretaria: parsedCfg.secretaria || prev.secretaria,
          logo_url: parsedCfg.logoUrl || prev.logo_url
        }))
      } catch (e) {}
    }

    // Buscar configurações mais recentes do servidor prioritariamente
    fetch('/api/configuracoes')
      .then(res => parseResponseJson(res, 'Erro ao carregar configurações'))
      .then(json => {
        if (json && json.ok && json.data) {
          setConfiguracao(json.data)
          try {
            localStorage.setItem('cras_settings', JSON.stringify({
              crasUnidade: json.data.cras_unidade,
              municipio: json.data.municipio,
              secretaria: json.data.secretaria,
              logoUrl: json.data.logo_url
            }))
          } catch (e) {}
        }
      })
      .catch(err => console.error('Erro ao carregar configurações:', err))

    carregarTodosOsDados()
  }, [])

  async function carregarTodosOsDados() {
    try {
      const [
        famRes,
        atdRes,
        benRes,
        almRes,
        grpRes,
        partRes,
        encRes,
        agRes,
        usrRes
      ] = await Promise.all([
        fetch('/api/familias'),
        fetch('/api/atendimentos'),
        fetch('/api/beneficios'),
        supabase.from('almoxarifado').select('*'),
        fetch('/api/scfv'),
        fetch('/api/scfv/participantes'),
        fetch('/api/encaminhamentos'),
        fetch('/api/agenda'),
        fetch('/api/usuarios')
      ])

      if (famRes.ok && famRes.headers.get('content-type')?.includes('application/json')) {
        const famJson = await famRes.json()
        if (famJson.ok && famJson.data) setFamilias(famJson.data as Familia[])
      }

      if (atdRes.ok && atdRes.headers.get('content-type')?.includes('application/json')) {
        const atdJson = await atdRes.json()
        if (atdJson.ok && atdJson.data) setAtendimentos(atdJson.data as Atendimento[])
      }

      if (benRes.ok && benRes.headers.get('content-type')?.includes('application/json')) {
        const benJson = await benRes.json()
        if (benJson.ok && benJson.data) setBeneficios(benJson.data as BeneficioConcedido[])
      }

      if (almRes.data && almRes.data.length > 0) setAlmoxarifado(almRes.data as AlmoxarifadoItem[])

      if (grpRes.ok && grpRes.headers.get('content-type')?.includes('application/json')) {
        const grpJson = await grpRes.json()
        if (grpJson.ok && grpJson.data) setGrupos(grpJson.data as GrupoSCFV[])
      }
      if (partRes.ok && partRes.headers.get('content-type')?.includes('application/json')) {
        const partJson = await partRes.json()
        if (partJson.ok && partJson.data) setParticipantes(partJson.data as ParticipanteSCFV[])
      }

      if (encRes.ok && encRes.headers.get('content-type')?.includes('application/json')) {
        const encJson = await encRes.json()
        if (encJson.ok && encJson.data) setEncaminhamentos(encJson.data as Encaminhamento[])
      }

      if (agRes.ok && agRes.headers.get('content-type')?.includes('application/json')) {
        const agJson = await agRes.json()
        if (agJson.ok && agJson.data) setAgenda(agJson.data as AgendaItem[])
      }

      if (usrRes.ok && usrRes.headers.get('content-type')?.includes('application/json')) {
        const usrJson = await usrRes.json()
        if (usrJson.ok && usrJson.data) setUsuarios(usrJson.data as Usuario[])
      }
    } catch (err) {
      console.error('Erro ao carregar dados do Supabase:', err)
    } finally {
      setCarregandoDados(false)
    }
  }

  // --- Handlers de Ações Otimizados ---
  async function handleSalvarFamilia(familiaData: Partial<Familia>, membrosData: MembroFamilia[]) {
    const res = await fetch('/api/familias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ familia: familiaData, membros: membrosData })
    })

    const json = await parseResponseJson(res, 'Erro ao cadastrar família')
    if (!res.ok || !json.ok) {
      throw new Error(json.error || 'Erro ao cadastrar família.')
    }

    if (json.data) {
      setFamilias(prev => [json.data, ...prev])
    }
    carregarTodosOsDados()
  }

  async function handleEditarFamilia(id: string, familiaData: Partial<Familia>, membrosData: MembroFamilia[]) {
    const res = await fetch('/api/familias', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, familia: familiaData, membros: membrosData })
    })

    const json = await parseResponseJson(res, 'Erro ao alterar prontuário da família')
    if (!res.ok || !json.ok) {
      throw new Error(json.error || 'Erro ao alterar prontuário da família.')
    }

    if (json.data) {
      setFamilias(prev => prev.map(f => f.id === id ? json.data : f))
    }
    carregarTodosOsDados()
  }

  async function handleExcluirFamilia(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta família e todo o histórico?')) return
    
    setFamilias(prev => prev.filter(f => f.id !== id))
    
    const res = await fetch(`/api/familias?id=${id}`, { method: 'DELETE' })
    const json = await parseResponseJson(res, 'Erro ao excluir família')
    if (!res.ok || !json.ok) {
      alert('Erro ao excluir família: ' + (json.error || 'Erro ao processar exclusão.'))
      carregarTodosOsDados()
      return
    }
    carregarTodosOsDados()
  }

  async function handleTogglePaif(familiaId: string, paifAtual: boolean) {
    setFamilias(prev => prev.map(f => f.id === familiaId ? { ...f, paif_ativo: !paifAtual } : f))
    await supabase
      .from('familias')
      .update({ paif_ativo: !paifAtual, paif_data_inicio: !paifAtual ? new Date().toISOString() : null })
      .eq('id', familiaId)
    carregarTodosOsDados()
  }

  async function handleSalvarAtendimento(atendimentoData: Partial<Atendimento> & { agenda_id?: string }) {
    const { agenda_id: agendaId, ...payload } = atendimentoData

    const reqs: Promise<any>[] = [
      fetch('/api/atendimentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    ]

    if (agendaId) {
      reqs.push(
        fetch('/api/agenda', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: agendaId, status: 'Realizado' })
        })
      )
    }

    setDadosPreenchidosAtendimento(null)

    const [resAtd] = await Promise.all(reqs)
    const jsonAtd = await parseResponseJson(resAtd, 'Erro ao registrar atendimento')
    if (!resAtd.ok || !jsonAtd.ok) {
      throw new Error(jsonAtd.error || 'Erro ao registrar atendimento.')
    }

    if (jsonAtd.data) {
      setAtendimentos(prev => [jsonAtd.data, ...prev])
    }

    if (agendaId) {
      setAgenda(prev => prev.map(a => a.id === agendaId ? { ...a, status: 'Realizado' } : a))
    }

    carregarTodosOsDados()
  }

  async function handleEditarAtendimento(id: string, atendimentoData: Partial<Atendimento>) {
    setAtendimentos(prev => prev.map(a => a.id === id ? { ...a, ...atendimentoData } : a))

    const res = await fetch('/api/atendimentos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, atendimento: atendimentoData })
    })

    const json = await parseResponseJson(res, 'Erro ao editar atendimento')
    if (!res.ok || !json.ok) {
      alert('Erro ao editar atendimento: ' + (json.error || 'Tente novamente.'))
      carregarTodosOsDados()
      return
    }

    carregarTodosOsDados()
  }

  async function handleExcluirAtendimento(id: string) {
    if (!confirm('Tem certeza que deseja excluir este registro de atendimento?')) return

    setAtendimentos(prev => prev.filter(a => a.id !== id))

    const res = await fetch(`/api/atendimentos?id=${id}`, { method: 'DELETE' })
    const json = await parseResponseJson(res, 'Erro ao excluir atendimento')
    if (!res.ok || !json.ok) {
      alert('Erro ao excluir atendimento: ' + (json.error || 'Tente novamente.'))
      carregarTodosOsDados()
      return
    }

    carregarTodosOsDados()
  }

  async function handleSalvarAgendamento(agendamentoData: any) {
    const res = await fetch('/api/agenda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agendamentoData)
    })
    const json = await parseResponseJson(res, 'Erro ao agendar visita')
    if (!res.ok || !json.ok) {
      throw new Error(json.error || 'Erro ao agendar visita.')
    }
    if (json.data) {
      setAgenda(prev => [...prev, json.data])
    }
    carregarTodosOsDados()
  }

  async function handleAtualizarStatusAgendamento(agendamento: AgendaItem, novoStatus: string, motivo?: string) {
    const isFalta = novoStatus === 'Falta'
    const isVisita = (agendamento.tipo || '').includes('Visita')

    // Atualização otimista local
    setAgenda(prev => prev.map(a => a.id === agendamento.id ? { ...a, status: novoStatus } : a))

    const reqs: Promise<any>[] = [
      fetch('/api/agenda', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: agendamento.id, status: novoStatus, motivoCancelamento: motivo })
      })
    ]

    if (isFalta) {
      reqs.push(
        fetch('/api/atendimentos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            familia_id: agendamento.familia_id,
            data: agendamento.data,
            hora: agendamento.hora,
            usuario_visitado: agendamento.responsavel,
            participantes_familiares: [agendamento.responsavel],
            local: isVisita ? 'Domicílio' : 'CRAS',
            compartilhada: 'Não',
            tecnico: agendamento.tecnico,
            tipo: 'Falta / Não Comparecimento',
            relato: `COMPROMISSO AGENDADO NÃO REALIZADO. SITUAÇÃO: FALTA / NÃO COMPARECIMENTO. MOTIVO REGISTRADO: ${(motivo || 'NÃO INFORMADO').trim().toUpperCase()}`,
            providencias: 'COMPROMISSO ARQUIVADO NO HISTÓRICO DA FAMÍLIA. REAVALIAR NECESSIDADE DE REMARCAÇÃO.'
          })
        })
      )
    }

    const [res] = await Promise.all(reqs)
    const json = await parseResponseJson(res, 'Erro ao atualizar agendamento')
    if (!res.ok || !json.ok) {
      alert('Erro ao atualizar agendamento: ' + (json.error || 'Tente novamente.'))
      carregarTodosOsDados()
      return
    }

    carregarTodosOsDados()
  }

  async function handleSalvarBeneficio(beneficioData: Partial<BeneficioConcedido>) {
    const res = await fetch('/api/beneficios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(beneficioData)
    })
    const json = await parseResponseJson(res, 'Erro ao conceder benefício')
    if (!res.ok || !json.ok) {
      throw new Error(json.error || 'Erro ao conceder benefício.')
    }
    await carregarTodosOsDados()
  }

  async function handleEditarBeneficio(id: string, updates: Partial<BeneficioConcedido>) {
    const res = await fetch('/api/beneficios', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    })
    const json = await parseResponseJson(res, 'Erro ao atualizar benefício')
    if (!res.ok || !json.ok) {
      throw new Error(json.error || 'Erro ao atualizar benefício.')
    }
    await carregarTodosOsDados()
  }

  async function handleExcluirBeneficio(id: string) {
    const res = await fetch(`/api/beneficios?id=${id}`, {
      method: 'DELETE'
    })
    const json = await parseResponseJson(res, 'Erro ao excluir benefício')
    if (!res.ok || !json.ok) {
      throw new Error(json.error || 'Erro ao excluir benefício.')
    }
    await carregarTodosOsDados()
  }

  async function handleSalvarGrupo(grupoData: Partial<GrupoSCFV>) {
    const isEdit = Boolean(grupoData.id)
    const method = isEdit ? 'PUT' : 'POST'
    const res = await fetch('/api/scfv', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(grupoData)
    })
    const json = await parseResponseJson(res, `Erro ao ${isEdit ? 'atualizar' : 'criar'} grupo SCFV`)
    if (!res.ok || !json.ok) {
      throw new Error(json.error || `Erro ao ${isEdit ? 'atualizar' : 'criar'} grupo SCFV.`)
    }
    await carregarTodosOsDados()
  }

  async function handleExcluirGrupo(grupoId: string) {
    const res = await fetch(`/api/scfv?id=${grupoId}`, {
      method: 'DELETE'
    })
    const json = await parseResponseJson(res, 'Erro ao excluir grupo SCFV')
    if (!res.ok || !json.ok) {
      alert('Erro ao excluir grupo: ' + (json.error || 'Tente novamente.'))
      return
    }
    setGrupos(prev => prev.filter(g => g.id !== grupoId))
    await carregarTodosOsDados()
  }

  async function handleSalvarFrequencia(dados: any) {
    const res = await fetch('/api/scfv/frequencia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    })
    const json = await parseResponseJson(res, 'Erro ao registrar frequência')
    if (!res.ok || !json.ok) {
      throw new Error(json.error || 'Erro ao registrar frequência.')
    }
    await carregarTodosOsDados()
  }

  async function handleSalvarRelatorioGrupo(dados: {
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
  }) {
    const integrantesGrupo = participantes.filter(p => p.grupo_id === dados.grupo_id && p.familia_id)
    
    if (integrantesGrupo.length > 0) {
      const dataRelato = dados.data_encontro || new Date().toISOString().split('T')[0]
      const dataPartes = dataRelato.split('-')
      const dataBr = dataPartes.length === 3 ? `${dataPartes[2]}/${dataPartes[1]}/${dataPartes[0]}` : dataRelato

      const registrosHistorico = integrantesGrupo.map(p => {
        const partesRelato = [
          `RELATÓRIO DE ENCONTRO SCFV [${dados.grupo_nome}] - DATA: ${dataBr}`,
          dados.objetivo_encontro ? `OBJETIVO: ${dados.objetivo_encontro}` : '',
          dados.atividade_realizada ? `ATIVIDADE REALIZADA: ${dados.atividade_realizada}` : '',
          dados.detalhamento ? `DETALHAMENTO: ${dados.detalhamento}` : '',
          dados.relato ? `RELATO TÉCNICO: ${dados.relato}` : '',
          dados.profissionais_participantes ? `PROFISSIONAIS PARTICIPANTES: ${dados.profissionais_participantes}` : ''
        ].filter(Boolean).join('\n')

        return {
          familia_id: p.familia_id,
          usuario_visitado: p.nome.toUpperCase(),
          tecnico: dados.tecnico || usuarioLogado?.nome || 'TÉCNICO RESPONSÁVEL',
          tipo: 'SCFV / Convivência',
          local: 'CRAS',
          relato: partesRelato,
          providencias: dados.providencias || 'Acompanhamento continuado em grupo de convivência.',
          sigilo: 'equipe_tecnica',
          data: dataRelato
        }
      })

      await supabase.from('historico_atendimentos').insert(registrosHistorico)
    }

    await carregarTodosOsDados()
  }

  async function handleSalvarParticipante(dados: { grupo_id: string; membro_id: string; nome: string; familia_id?: string }) {
    const res = await fetch('/api/scfv/participantes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    })
    const json = await parseResponseJson(res, 'Erro ao vincular participante')
    if (!res.ok || !json.ok) {
      throw new Error(json.error || 'Erro ao vincular participante ao grupo.')
    }
    if (json.data) {
      setParticipantes(prev => [json.data as ParticipanteSCFV, ...prev])
    }
    await carregarTodosOsDados()
  }

  async function handleExcluirParticipante(participanteId: string) {
    const res = await fetch(`/api/scfv/participantes?id=${participanteId}`, {
      method: 'DELETE'
    })
    const json = await parseResponseJson(res, 'Erro ao desvincular participante')
    if (!res.ok || !json.ok) {
      alert('Erro ao desvincular participante: ' + (json.error || 'Tente novamente.'))
      return
    }
    setParticipantes(prev => prev.filter(p => p.id !== participanteId))
    await carregarTodosOsDados()
  }

  async function handleSalvarEncaminhamento(encaminhamentoData: Partial<Encaminhamento>) {
    const res = await fetch('/api/encaminhamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(encaminhamentoData)
    })
    const json = await parseResponseJson(res, 'Erro ao registrar encaminhamento')
    if (!res.ok || !json.ok) {
      throw new Error(json.error || 'Erro ao registrar encaminhamento.')
    }
    await carregarTodosOsDados()
  }

  async function handleAprovarUsuario(id: number) {
    const res = await fetch('/api/usuarios', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ativo: true })
    })
    await parseResponseJson(res, 'Erro ao aprovar usuário')
    await carregarTodosOsDados()
  }

  async function handleAlternarStatusUsuario(id: number, ativoAtual: boolean) {
    const res = await fetch('/api/usuarios', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ativo: !ativoAtual })
    })
    await parseResponseJson(res, 'Erro ao atualizar status do usuário')
    await carregarTodosOsDados()
  }

  async function handleCadastrarUsuario(dados: any) {
    const res = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    })
    const json = await parseResponseJson(res, 'Erro ao cadastrar profissional')
    if (!res.ok || !json.ok) {
      throw new Error(json.error || 'Erro ao cadastrar profissional.')
    }
    await carregarTodosOsDados()
  }

  async function handleEditarUsuario(id: number, dados: any) {
    const res = await fetch('/api/usuarios', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...dados })
    })
    const json = await parseResponseJson(res, 'Erro ao salvar alterações do profissional')
    if (!res.ok || !json.ok) {
      throw new Error(json.error || 'Erro ao salvar alterações do profissional.')
    }
    await carregarTodosOsDados()
  }

  async function handleExcluirUsuario(id: number) {
    try {
      const res = await fetch(`/api/usuarios?id=${id}`, {
        method: 'DELETE'
      })
      const json = await parseResponseJson(res, 'Erro ao excluir profissional')
      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'Erro ao excluir profissional.')
      }
      await carregarTodosOsDados()
    } catch (err: any) {
      alert('Erro ao excluir profissional: ' + (err.message || 'Tente novamente.'))
    }
  }

  async function handleSalvarConfiguracao(configData: Configuracao) {
    const res = await fetch('/api/configuracoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configData)
    })
    const json = await parseResponseJson(res, 'Erro ao salvar configurações')
    if (!res.ok || !json.ok) throw new Error(json.error || 'Erro ao salvar configurações.')
    if (json.data) {
      setConfiguracao(json.data)
      try {
        localStorage.setItem('cras_settings', JSON.stringify({
          crasUnidade: json.data.cras_unidade,
          municipio: json.data.municipio,
          secretaria: json.data.secretaria,
          logoUrl: json.data.logo_url
        }))
      } catch (e) {}
    }
    await carregarTodosOsDados()
  }

  function handleLogout() {
    localStorage.removeItem('cras_user')
    document.cookie = 'cras_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    router.push('/')
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-chart-line' },
    { id: 'families', label: 'Prontuário SUAS', icon: 'fa-solid fa-address-book' },
    { id: 'appointments', label: 'Atendimentos', icon: 'fa-solid fa-file-signature' },
    { id: 'benefits', label: 'Benefícios', icon: 'fa-solid fa-hand-holding-heart' },
    { id: 'scfv', label: 'Oficinas & SCFV', icon: 'fa-solid fa-people-group' },
    { id: 'referrals', label: 'Encaminhamentos', icon: 'fa-solid fa-route' },
    { id: 'map', label: 'Geomapeamento', icon: 'fa-solid fa-map-location-dot' },
    { id: 'rma', label: 'Relatórios & RMA', icon: 'fa-solid fa-chart-pie' },
    { id: 'users', label: 'Gestão Técnicos', icon: 'fa-solid fa-users-gear' },
    { id: 'settings', label: 'Configurações', icon: 'fa-solid fa-gears' }
  ]

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans print:h-auto print:w-full print:bg-white print:overflow-visible print:block">
      {/* Sidebar Navigation */}
      <aside className={`fixed lg:static z-40 h-full w-72 bg-gradient-to-b from-teal-900 to-teal-800 text-white flex flex-col justify-between p-5 shadow-xl transition-transform duration-300 print:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div>
          {/* Logo / Header Sidebar */}
          <div className="flex items-center gap-3 pb-5 mb-5 border-b border-teal-700/60">
            {configuracao.logo_url ? (
              <img src={configuracao.logo_url} alt="Logo CRAS" className="h-10 w-auto object-contain rounded bg-white/10 p-1" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center text-xl font-bold shadow">
                <i className="fa-solid fa-people-roof"></i>
              </div>
            )}
            <div>
              <h1 className="font-extrabold text-sm tracking-wide text-white leading-tight font-montserrat uppercase">
                {configuracao.cras_unidade || 'SUAS Digital'}
              </h1>
              <p className="text-[10px] text-teal-200 mt-0.5">
                {configuracao.municipio}
              </p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {menuItems.map(item => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'text-teal-100 hover:bg-teal-700/50 hover:text-white'
                  }`}
                >
                  <i className={`${item.icon} text-sm`}></i>
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="pt-4 border-t border-teal-700/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                {usuarioLogado?.nome?.[0] || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate max-w-[120px]">
                  {usuarioLogado?.nome || 'Usuário'}
                </p>
                <p className="text-[10px] text-teal-200 truncate">
                  {usuarioLogado?.cargo || 'Técnico'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="text-teal-300 hover:text-red-300 p-1.5 rounded transition"
              title="Sair do Sistema"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col h-full overflow-hidden print:h-auto print:overflow-visible ${modalVerFamilia || modalConcederBeneficio ? 'print:hidden' : ''}`}>
        {/* Top Navbar Mobile */}
        <header className="lg:hidden bg-teal-900 text-white p-4 flex justify-between items-center shadow-md">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-xl p-1 text-teal-200 hover:text-white"
          >
            <i className="fa-solid fa-bars"></i>
          </button>
          <span className="font-bold text-sm">{configuracao.cras_unidade}</span>
          <button onClick={handleLogout} className="text-sm text-teal-200">
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </header>

        {/* Dynamic View Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {carregandoDados ? (
            <div className="flex flex-col items-center justify-center h-full text-teal-800 space-y-3">
              <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-semibold">Carregando Prontuários e Informações...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  familias={familias}
                  atendimentos={atendimentos}
                  beneficios={beneficios}
                  agenda={agenda}
                  onNavegarTab={setActiveTab}
                  onAbrirModalNovoAtendimento={() => setModalNovoAtendimento(true)}
                  onAbrirModalNovaFamilia={() => setModalNovaFamilia(true)}
                />
              )}

              {activeTab === 'families' && (
                <FamiliasView
                  familias={familias}
                  onAbrirModalNovaFamilia={() => setModalNovaFamilia(true)}
                  onAbrirModalVerFamilia={fam => setModalVerFamilia(fam)}
                  onAbrirModalEditarFamilia={fam => setModalEditarFamilia(fam)}
                  onExcluirFamilia={handleExcluirFamilia}
                />
              )}

              {activeTab === 'appointments' && (
                <AtendimentosView
                  atendimentos={atendimentos}
                  agenda={agenda}
                  familias={familias}
                  usuarios={usuarios}
                  configuracao={configuracao}
                  usuarioLogado={usuarioLogado}
                  onAbrirModalNovoAtendimento={(dadosPreenchidos) => {
                    setDadosPreenchidosAtendimento(dadosPreenchidos || null)
                    setModalNovoAtendimento(true)
                  }}
                  onAbrirModalNovoAgendamento={() => setModalNovoAgendamento(true)}
                  onAtualizarStatusAgendamento={handleAtualizarStatusAgendamento}
                  onEditarAtendimento={handleEditarAtendimento}
                  onExcluirAtendimento={handleExcluirAtendimento}
                />
              )}

              {activeTab === 'benefits' && (
                <BeneficiosView
                  beneficios={beneficios}
                  almoxarifado={almoxarifado}
                  familias={familias}
                  usuarios={usuarios}
                  configuracao={configuracao}
                  onAbrirModalConcederBeneficio={() => setModalConcederBeneficio(true)}
                  onAtualizarAlmoxarifado={async itens => {
                    setAlmoxarifado(itens)
                    try {
                      const res = await fetch('/api/almoxarifado')
                      if (res.ok) {
                        const json = await res.json()
                        if (json.ok && json.data) setAlmoxarifado(json.data)
                      }
                    } catch (e) {}
                  }}
                  onEditarBeneficio={handleEditarBeneficio}
                  onExcluirBeneficio={handleExcluirBeneficio}
                />
              )}

              {activeTab === 'scfv' && (
                <ScfvView
                  grupos={grupos}
                  participantes={participantes}
                  onAbrirModalNovoGrupo={() => {
                    setGrupoParaEditar(null)
                    setModalNovoGrupo(true)
                  }}
                  onAbrirModalEditarGrupo={(grupo) => setGrupoParaEditar(grupo)}
                  onExcluirGrupo={handleExcluirGrupo}
                  onAbrirModalAdicionarParticipante={(grupoId) => {
                    const grp = grupos.find(g => g.id === grupoId)
                    if (grp) setGrupoParaVincular(grp)
                  }}
                  onExcluirParticipante={handleExcluirParticipante}
                  onAbrirModalFrequencia={(grupo) => setGrupoParaFrequencia(grupo)}
                  onAbrirModalRelatorioGrupo={(grupo) => setGrupoParaRelatorio(grupo)}
                  onAbrirModalRelatorioGeralGrupo={(grupo) => setGrupoParaRelatorioGeral(grupo)}
                />
              )}

              {activeTab === 'referrals' && (
                <EncaminhamentosView
                  encaminhamentos={encaminhamentos}
                  familias={familias}
                  usuarios={usuarios}
                  configuracao={configuracao}
                  onAbrirModalNovoEncaminhamento={() => setModalNovoEncaminhamento(true)}
                />
              )}

              {activeTab === 'map' && (
                <GeomapeamentoView familias={familias} />
              )}

              {activeTab === 'rma' && (
                <RmaView
                  familias={familias}
                  atendimentos={atendimentos}
                  beneficios={beneficios}
                  grupos={grupos}
                  participantes={participantes}
                  encaminhamentos={encaminhamentos}
                  configuracao={configuracao}
                />
              )}

              {activeTab === 'users' && (
                <UsuariosView
                  usuarios={usuarios}
                  usuarioLogado={usuarioLogado}
                  onAprovarUsuario={handleAprovarUsuario}
                  onAlternarStatusUsuario={handleAlternarStatusUsuario}
                  onCadastrarUsuario={handleCadastrarUsuario}
                  onEditarUsuario={handleEditarUsuario}
                  onExcluirUsuario={handleExcluirUsuario}
                />
              )}

              {activeTab === 'settings' && (
                <ConfiguracoesView
                  configuracao={configuracao}
                  onSalvarConfiguracao={handleSalvarConfiguracao}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* --- Modais Globais --- */}
      {modalNovaFamilia && (
        <ModalNovaFamilia
          familiasExistentes={familias}
          usuarios={usuarios}
          onClose={() => setModalNovaFamilia(false)}
          onSalvar={handleSalvarFamilia}
        />
      )}

      {modalVerFamilia && (
        <ModalVerFamilia
          familia={modalVerFamilia}
          atendimentosFamilia={atendimentos.filter(a => a.familia_id === modalVerFamilia.id)}
          beneficiosFamilia={beneficios.filter(b => b.familia_id === modalVerFamilia.id)}
          configuracao={configuracao}
          usuarioLogado={usuarioLogado}
          familiasExistentes={familias}
          onClose={() => setModalVerFamilia(null)}
          onTogglePaif={handleTogglePaif}
          onSalvarMembro={async (familiaId, novoMembro) => {
            const famAtual = familias.find(f => f.id === familiaId)
            if (!famAtual) return
            const membrosAtualizados = [...(famAtual.membros || []), novoMembro]
            await handleEditarFamilia(familiaId, {}, membrosAtualizados)
            const r = await fetch('/api/familias')
            if (r.ok && r.headers.get('content-type')?.includes('application/json')) {
              const json = await r.json()
              const famNova = json.data?.find((f: any) => f.id === familiaId)
              if (famNova) setModalVerFamilia(famNova)
            }
          }}
        />
      )}

      {modalEditarFamilia && (
        <ModalEditarFamilia
          familia={modalEditarFamilia}
          familiasExistentes={familias}
          usuarios={usuarios}
          onClose={() => setModalEditarFamilia(null)}
          onSalvar={handleEditarFamilia}
        />
      )}

      {modalNovoAtendimento && (
        <ModalNovoAtendimento
          familias={familias}
          usuarios={usuarios}
          usuarioLogadoNome={usuarioLogado?.nome || usuarioLogado?.usuario || ''}
          dadosIniciais={dadosPreenchidosAtendimento}
          onClose={() => {
            setModalNovoAtendimento(false)
            setDadosPreenchidosAtendimento(null)
          }}
          onSalvar={handleSalvarAtendimento}
        />
      )}

      {modalNovoAgendamento && (
        <ModalNovoAgendamento
          familias={familias}
          usuarios={usuarios}
          usuarioLogadoNome={usuarioLogado?.nome || usuarioLogado?.usuario || ''}
          onClose={() => setModalNovoAgendamento(false)}
          onSalvar={handleSalvarAgendamento}
        />
      )}

      {modalConcederBeneficio && (
        <ModalConcederBeneficio
          familias={familias}
          almoxarifado={almoxarifado}
          usuarios={usuarios}
          usuarioLogadoNome={usuarioLogado?.nome || usuarioLogado?.usuario || ''}
          configuracao={configuracao}
          onClose={() => setModalConcederBeneficio(false)}
          onSalvar={handleSalvarBeneficio}
        />
      )}

      {(modalNovoGrupo || grupoParaEditar) && (
        <ModalNovoGrupoScfv
          usuarioLogadoNome={usuarioLogado?.nome || usuarioLogado?.usuario || ''}
          usuarios={usuarios}
          grupoParaEditar={grupoParaEditar}
          onClose={() => {
            setModalNovoGrupo(false)
            setGrupoParaEditar(null)
          }}
          onSalvar={handleSalvarGrupo}
        />
      )}

      {grupoParaVincular && (
        <ModalVincularParticipanteScfv
          grupo={grupoParaVincular}
          familias={familias}
          participantesGrupoExistentes={participantes.filter(p => p.grupo_id === grupoParaVincular.id)}
          onClose={() => setGrupoParaVincular(null)}
          onSalvarParticipante={handleSalvarParticipante}
        />
      )}

      {grupoParaFrequencia && (
        <ModalFrequenciaGrupoScfv
          grupo={grupoParaFrequencia}
          participantes={participantes.filter(p => p.grupo_id === grupoParaFrequencia.id)}
          usuarioLogadoNome={usuarioLogado?.nome || usuarioLogado?.usuario || ''}
          onClose={() => setGrupoParaFrequencia(null)}
          onSalvarFrequencia={handleSalvarFrequencia}
        />
      )}

      {grupoParaRelatorio && (
        <ModalRelatorioGrupoScfv
          grupo={grupoParaRelatorio}
          participantes={participantes.filter(p => p.grupo_id === grupoParaRelatorio.id)}
          familias={familias}
          configuracao={configuracao}
          usuarioLogadoNome={usuarioLogado?.nome || usuarioLogado?.usuario || ''}
          usuarios={usuarios}
          onClose={() => setGrupoParaRelatorio(null)}
          onSalvarRelatorio={handleSalvarRelatorioGrupo}
        />
      )}

      {grupoParaRelatorioGeral && (
        <ModalRelatorioGeralGrupoScfv
          grupo={grupoParaRelatorioGeral}
          participantes={participantes.filter(p => p.grupo_id === grupoParaRelatorioGeral.id)}
          familias={familias}
          configuracao={configuracao}
          usuarioLogadoNome={usuarioLogado?.nome || usuarioLogado?.usuario || ''}
          onClose={() => setGrupoParaRelatorioGeral(null)}
        />
      )}

      {modalNovoEncaminhamento && (
        <ModalNovoEncaminhamento
          familias={familias}
          usuarioLogadoNome={usuarioLogado?.nome || usuarioLogado?.usuario || ''}
          onClose={() => setModalNovoEncaminhamento(false)}
          onSalvar={handleSalvarEncaminhamento}
        />
      )}
    </div>
  )
}
