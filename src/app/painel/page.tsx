'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Screen = 'dashboard' | 'families' | 'appointments' | 'benefits' | 'scfv' | 'referrals' | 'settings'

export default function Painel() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard')
  const [loading, setLoading] = useState(true)

  // Configurações Municipais
  const [settings, setSettings] = useState({
    municipio: 'Prefeitura Municipal de Conceição do Tocantins',
    secretaria: 'Secretaria Municipal de Assistência Social',
    crasUnidade: 'CRAS Conceição do Tocantins',
    endereco: 'Rua Central, s/n - Centro',
    telefone: '(63) 3381-1234',
    email: 'cras@conceicao.to.gov.br',
    logoUrl: ''
  })

  // Dados do Sistema
  const [families, setFamilies] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [stock, setStock] = useState<any[]>([])
  const [agenda, setAgenda] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [referrals, setReferrals] = useState<any[]>([])
  
  // Dashboard Stats
  const [stats, setStats] = useState({
    families: 0,
    paif: 0,
    benefits: 0,
    referrals: 0
  })

  // Modals e Estados de Edição
  const [selectedFamily, setSelectedFamily] = useState<any>(null)
  const [selectedGroup, setSelectedGroup] = useState<any>(null)
  
  const [showFamilyModal, setShowFamilyModal] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [showEvolutionModal, setShowEvolutionModal] = useState(false)
  const [showBenefitModal, setShowBenefitModal] = useState(false)
  const [showAgendaModal, setShowAgendaModal] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showReferralModal, setShowReferralModal] = useState(false)
  const [showSCFVRegisterModal, setShowSCFVRegisterModal] = useState(false)

  // Estados de Busca
  const [searchTerm, setSearchTerm] = useState('')

  // Formulário Nova Família
  const [famForm, setFamForm] = useState({
    id: '',
    codFamiliar: '',
    responsavel: '',
    cpfResponsavel: '',
    nisResponsavel: '',
    logradouro: '',
    numero: '',
    bairro: '',
    municipio: 'Conceição do Tocantins',
    uf: 'TO',
    telefone: '',
    outroContato: '',
    moradiaTipo: 'Alvenaria com Revestimento',
    moradiaAgua: 'Rede Geral',
    moradiaSanear: 'Rede Geral',
    moradiaLixo: 'Coletado',
    vulnerabilidades: [] as string[],
    paifAtivo: false,
    paifMetas: '',
    
    // Campos do Responsável Familiar (que vão para a tabela de membros com parentesco = 'Responsável')
    dataNascimentoResponsavel: '',
    rgResponsavel: 'Não Informado',
    rendaResponsavel: '0',
    ocupacaoResponsavel: '',
    programaGovernoResponsavel: '',
    programaGovernoResponsavelOutros: '',
    escolaridadeResponsavel: ''
  })

  // Formulário Novo Membro
  const [memForm, setMemForm] = useState({
    id: '',
    nome: '',
    parentesco: '',
    dataNascimento: '',
    cpf: '',
    rg: '',
    nis: '',
    renda: '0',
    escolaridade: '',
    ocupacao: '',
    programaGoverno: '',
    programaGovernoOutros: ''
  })

  // Formulário Evolução / Visita / Atendimento
  const [evoForm, setEvoForm] = useState({
    tipo: 'Atendimento',
    usuarioVisitado: '',
    participantesFamiliares: [] as string[],
    local: 'CRAS',
    tecnico: '',
    compartilhada: 'Não',
    profissionaisParticipantes: [] as string[],
    relato: '',
    providencias: ''
  })

  // Formulário Nova Agenda
  const [ageForm, setAgeForm] = useState({
    data: '',
    hora: '',
    tipo: 'Atendimento',
    tecnico: '',
    descricao: ''
  })

  // Formulário Novo Grupo SCFV
  const [grpForm, setGrpForm] = useState({
    nome: '',
    descricao: '',
    tecnicoResponsavel: '',
    horario: ''
  })

  // Formulário Novo Encaminhamento
  const [refForm, setRefForm] = useState({
    beneficiario: '',
    destino: '',
    motivo: '',
    tecnico: ''
  })

  // Efetuar carregamento inicial
  useEffect(() => {
    const cachedUser = localStorage.getItem('cras_user')
    if (!cachedUser) {
      router.push('/')
      return
    }
    
    try {
      const parsed = JSON.parse(cachedUser)
      setCurrentUser(parsed)
    } catch (e) {
      router.push('/')
      return
    }

    async function loadData() {
      try {
        const { data: cfg } = await supabase.from('configuracoes').select('*').eq('id', 1).single()
        if (cfg) {
          const cfgData = {
            municipio: cfg.municipio,
            secretaria: cfg.secretaria,
            crasUnidade: cfg.cras_unidade,
            endereco: cfg.endereco,
            telefone: cfg.telefone,
            email: cfg.email,
            logoUrl: cfg.logo_url || ''
          }
          setSettings(cfgData)
          localStorage.setItem('cras_settings', JSON.stringify(cfgData))
        }

        const { data: users } = await supabase.from('usuarios').select('*').eq('ativo', true)
        if (users) setProfessionals(users)

        const { data: items } = await supabase.from('almoxarifado').select('*').order('tipo', { ascending: true })
        if (items) setStock(items)

        await fetchFamilies()
        await fetchAgenda()

        const { data: grps } = await supabase.from('grupos_scfv').select('*')
        if (grps) setGroups(grps)

        const { data: refs } = await supabase.from('encaminhamentos').select('*').order('created_at', { ascending: false })
        if (refs) setReferrals(refs)

      } catch (err) {
        console.error('Erro ao buscar dados:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Buscar Famílias atualizadas do Supabase
  async function fetchFamilies() {
    const { data: fams } = await supabase
      .from('familias')
      .select(`
        *,
        membros_familia(*),
        historico_atendimentos(*),
        beneficios_concedidos(*)
      `)
      .order('responsavel', { ascending: true })

    if (fams) {
      setFamilies(fams)
      
      const totalFams = fams.length
      const totalPaif = fams.filter(f => f.paif_ativo).length
      let totalBens = 0
      fams.forEach(f => {
        if (f.beneficios_concedidos) totalBens += f.beneficios_concedidos.length
      })
      
      const { count: refCount } = await supabase
        .from('encaminhamentos')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pendente')

      setStats({
        families: totalFams,
        paif: totalPaif,
        benefits: totalBens,
        referrals: refCount || 0
      })
    }
  }

  // Buscar Agenda
  async function fetchAgenda() {
    const { data: ag } = await supabase
      .from('agenda_tecnica')
      .select('*')
      .eq('status', 'Agendado')
      .order('data', { ascending: true })
      .order('hora', { ascending: true })
    if (ag) setAgenda(ag)
  }

  function fazerLogout() {
    localStorage.removeItem('cras_user')
    router.push('/')
  }

  // Lógica de Salvar Família (Criar ou Atualizar)
  async function handleSaveFamily(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      cod_familiar: famForm.codFamiliar.trim(),
      responsavel: famForm.responsavel.trim(),
      cpf_responsavel: famForm.cpfResponsavel.trim(),
      nis_responsavel: famForm.nisResponsavel.trim(),
      logradouro: famForm.logradouro.trim(),
      numero: famForm.numero.trim(),
      bairro: famForm.bairro.trim(),
      municipio: famForm.municipio.trim(),
      uf: famForm.uf.trim(),
      telefone: famForm.telefone.trim(),
      outro_contato: famForm.outroContato.trim(),
      moradia_tipo: famForm.moradiaTipo,
      moradia_agua: famForm.moradiaAgua,
      moradia_sanear: famForm.moradiaSanear,
      moradia_lixo: famForm.moradiaLixo,
      vulnerabilidades: famForm.vulnerabilidades,
      paif_ativo: famForm.paifAtivo,
      paif_metas: famForm.paifMetas
    }

    let familyId = famForm.id
    if (famForm.id) {
      const { error } = await supabase.from('familias').update(payload).eq('id', famForm.id)
      if (error) { alert('Erro ao atualizar família: ' + error.message); return; }
    } else {
      const { data, error } = await supabase.from('familias').insert(payload).select().single()
      if (error) { alert('Erro ao cadastrar família: ' + error.message); return; }
      familyId = data.id
    }

    // Upsert do Responsável na tabela de membros_familia
    const progGov = famForm.programaGovernoResponsavel === 'Outros'
      ? famForm.programaGovernoResponsavelOutros
      : famForm.programaGovernoResponsavel

    const birthDate = new Date(famForm.dataNascimentoResponsavel)
    const age = new Date().getFullYear() - birthDate.getFullYear()

    const memberPayload = {
      familia_id: familyId,
      nome: famForm.responsavel.trim(),
      parentesco: 'Responsável',
      data_nascimento: famForm.dataNascimentoResponsavel,
      idade: isNaN(age) ? 0 : age,
      cpf: famForm.cpfResponsavel.trim(),
      rg: famForm.rgResponsavel.trim() || 'Não Informado',
      nis: famForm.nisResponsavel.trim(),
      renda: parseFloat(famForm.rendaResponsavel) || 0,
      escolaridade: famForm.escolaridadeResponsavel,
      ocupacao: famForm.ocupacaoResponsavel.trim(),
      programa_governo: progGov
    }

    const { data: existingResp } = await supabase
      .from('membros_familia')
      .select('id')
      .eq('familia_id', familyId)
      .eq('parentesco', 'Responsável')
      .maybeSingle()

    if (existingResp) {
      await supabase.from('membros_familia').update(memberPayload).eq('id', existingResp.id)
    } else {
      await supabase.from('membros_familia').insert(memberPayload)
    }
    
    setShowFamilyModal(false)
    await fetchFamilies()
  }

  // Lógica de Salvar Membro
  async function handleSaveMember(e: React.FormEvent) {
    e.preventDefault()
    const progGov = memForm.programaGoverno === 'Outros' ? memForm.programaGovernoOutros : memForm.programaGoverno
    const birthDate = new Date(memForm.dataNascimento)
    const age = new Date().getFullYear() - birthDate.getFullYear()

    const payload = {
      familia_id: selectedFamily.id,
      nome: memForm.nome.trim(),
      parentesco: memForm.parentesco,
      data_nascimento: memForm.dataNascimento,
      idade: age,
      cpf: memForm.cpf.trim() || null,
      rg: memForm.rg.trim() || 'Não Informado',
      nis: memForm.nis.trim() || null,
      renda: parseFloat(memForm.renda) || 0,
      escolaridade: memForm.escolaridade,
      ocupacao: memForm.ocupacao.trim(),
      programa_governo: progGov
    }

    await supabase.from('membros_familia').insert(payload)
    setShowMemberModal(false)
    await fetchFamilies()
  }

  // Lógica de Salvar Evolução (Atendimento / Visita)
  async function handleSaveEvolution(e: React.FormEvent) {
    e.preventDefault()
    
    const payload = {
      familia_id: selectedFamily.id,
      tipo: evoForm.tipo,
      usuario_visitado: evoForm.tipo === 'Atendimento' ? evoForm.usuarioVisitado : 'Família Residência',
      participantes_familiares: evoForm.tipo === 'Visita Domiciliar' ? evoForm.participantesFamiliares : [],
      local: evoForm.tipo === 'Atendimento' ? 'CRAS' : 'Domicílio',
      compartilhada: evoForm.compartilhada,
      profissionais_participantes: evoForm.compartilhada === 'Sim' ? evoForm.profissionaisParticipantes.join(', ') : '',
      tecnico: evoForm.tecnico,
      relato: evoForm.relato.trim(),
      providencias: evoForm.providencias.trim()
    }

    await supabase.from('historico_atendimentos').insert(payload)
    setShowEvolutionModal(false)
    await fetchFamilies()
  }

  // Lógica de Agendamento
  async function handleSaveAgenda(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFamily) return

    const payload = {
      familia_id: selectedFamily.id,
      data: ageForm.data,
      hora: ageForm.hora,
      tipo: ageForm.tipo,
      responsavel: selectedFamily.responsavel,
      tecnico: ageForm.tecnico,
      descricao: ageForm.descricao,
      status: 'Agendado'
    }

    await supabase.from('agenda_tecnica').insert(payload)
    setShowAgendaModal(false)
    await fetchAgenda()
  }

  // Ações de alteração de status na agenda (Falta / Cancelar)
  async function handleAgendaStatusChange(item: any, newStatus: 'Não Compareceu' | 'Cancelado') {
    const reason = prompt(`Informe o motivo para o status "${newStatus}":`)
    if (!reason || reason.trim() === '') {
      alert('O motivo é obrigatório!')
      return
    }

    // 1. Atualizar status na agenda
    await supabase.from('agenda_tecnica').update({ status: newStatus }).eq('id', item.id)

    // 2. Registrar no histórico da família
    await supabase.from('historico_atendimentos').insert({
      familia_id: item.familia_id,
      tipo: newStatus,
      usuario_visitado: item.responsavel,
      tecnico: item.tecnico,
      local: item.tipo === 'Atendimento' ? 'CRAS' : 'Domicílio',
      relato: `Compromisso agendado para ${item.data} às ${item.hora} foi marcado como ${newStatus}. Motivo: ${reason}`,
      providencias: 'Nenhuma providência adicional.'
    })

    await fetchAgenda()
    await fetchFamilies()
  }

  // Lógica de Salvar Encaminhamento
  async function handleSaveReferral(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFamily) return

    const payload = {
      familia_id: selectedFamily.id,
      beneficiario: refForm.beneficiario,
      destino: refForm.destino,
      motivo: refForm.motivo,
      tecnico: refForm.tecnico,
      status: 'Pendente'
    }

    await supabase.from('encaminhamentos').insert(payload)
    setShowReferralModal(false)
    
    // Recarregar
    const { data: refs } = await supabase.from('encaminhamentos').select('*').order('created_at', { ascending: false })
    if (refs) setReferrals(refs)
    await fetchFamilies()
  }

  // Responder a um encaminhamento
  async function handleAnswerReferral(id: string) {
    const resposta = prompt('Escreva a resposta/devolutiva para o encaminhamento:')
    if (!resposta || resposta.trim() === '') return

    await supabase.from('encaminhamentos').update({ status: 'Respondido', resposta }).eq('id', id)
    
    const { data: refs } = await supabase.from('encaminhamentos').select('*').order('created_at', { ascending: false })
    if (refs) setReferrals(refs)
    await fetchFamilies()
  }

  // Conceder benefício
  async function handleGrantBenefit(e: React.FormEvent, itemStock: any) {
    e.preventDefault()
    if (!selectedFamily || itemStock.saldo <= 0) return

    // 1. Inserir benefício
    await supabase.from('beneficios_concedidos').insert({
      familia_id: selectedFamily.id,
      tipo: itemStock.tipo,
      status: 'Entregue',
      observacao: 'Benefício eventual liberado pela equipe técnica.'
    })

    // 2. Decrementar estoque
    await supabase.from('almoxarifado').update({ saldo: itemStock.saldo - 1 }).eq('id', itemStock.id)

    // Recarregar dados
    const { data: items } = await supabase.from('almoxarifado').select('*').order('tipo', { ascending: true })
    if (items) setStock(items)
    await fetchFamilies()
    setShowBenefitModal(false)
  }

  // Filtragem de famílias
  const filteredFamilies = families.filter(f => 
    f.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.cpf_responsavel.includes(searchTerm) ||
    f.cod_familiar.includes(searchTerm)
  )

  // Funções de Impressão Dinâmica
  function handlePrintDossie(fam: any) {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const htmlContent = `
      <html>
        <head>
          <title>Dossiê Familiar - ${fam.responsavel}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
            .header { text-align: center; text-transform: uppercase; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .section { margin-bottom: 25px; }
            .section-title { font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 10px; }
            .field { margin-bottom: 8px; }
            .field span { font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; }
            th { background-color: #f2f2f2; }
            .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 11px; color: #555; border-top: 1px solid #000; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h3>${settings.municipio.toUpperCase()}</h3>
            <h4>${settings.secretaria.toUpperCase()}</h4>
            <h5>CENTRO DE REFERÊNCIA DA ASSISTÊNCIA SOCIAL</h5>
            <h5>${settings.crasUnidade.toUpperCase()}</h5>
          </div>

          <div class="section">
            <div class="section-title">Dados da Família</div>
            <div class="field"><span>Código Familiar:</span> ${fam.cod_familiar}</div>
            <div class="field"><span>Responsável:</span> ${fam.responsavel}</div>
            <div class="field"><span>CPF / NIS:</span> ${fam.cpf_responsavel} / ${fam.nis_responsavel}</div>
            <div class="field"><span>Endereço:</span> ${fam.logradouro}, ${fam.numero} - ${fam.bairro}</div>
          </div>

          <div class="section">
            <div class="section-title">Composição Familiar (${fam.membros_familia?.length || 1} integrantes)</div>
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Parentesco</th>
                  <th>Idade</th>
                  <th>Ocupação</th>
                  <th>Renda</th>
                </tr>
              </thead>
              <tbody>
                ${(fam.membros_familia || []).map((m: any) => `
                  <tr>
                    <td>${m.nome}</td>
                    <td>${m.parentesco}</td>
                    <td>${m.idade} anos</td>
                    <td>${m.ocupacao}</td>
                    <td>R$ ${m.renda.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="footer">
            ${settings.crasUnidade} • ${settings.endereco} • Contato: ${settings.telefone} • E-mail: ${settings.email}
          </div>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.print()
  }

  function handlePrintEvolution(evo: any, responsavel: string) {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const isVisita = evo.tipo === 'Visita Domiciliar'
    const tech = professionals.find(p => p.nome === evo.tecnico)
    
    // Assinaturas dinâmicas
    let signaturesHtml = ''
    if (isVisita) {
      // Somente técnicos
      signaturesHtml += `
        <div style="display: flex; justify-content: space-around; margin-top: 60px;">
          <div style="text-align: center; width: 45%;">
            <div style="border-top: 1px solid #000; padding-top: 5px;">
              <strong>${evo.tecnico}</strong><br>
              <span style="font-size: 11px;">${tech?.cargo || 'Técnico(a) Responsável'} • ${tech?.conselho || ''}</span>
            </div>
          </div>
      `
      if (evo.profissionais_participantes) {
        signaturesHtml += `
          <div style="text-align: center; width: 45%;">
            <div style="border-top: 1px solid #000; padding-top: 5px;">
              <strong>${evo.profissionais_participantes}</strong><br>
              <span style="font-size: 11px;">Profissional Co-visitante</span>
            </div>
          </div>
        `
      }
      signaturesHtml += '</div>'
    } else {
      // Atendimento: Técnico + Usuário
      signaturesHtml += `
        <div style="display: flex; justify-content: space-around; margin-top: 60px;">
          <div style="text-align: center; width: 45%;">
            <div style="border-top: 1px solid #000; padding-top: 5px;">
              <strong>${evo.tecnico}</strong><br>
              <span style="font-size: 11px;">${tech?.cargo || 'Técnico(a)'} • ${tech?.conselho || ''}</span>
            </div>
          </div>
          <div style="text-align: center; width: 45%;">
            <div style="border-top: 1px solid #000; padding-top: 5px;">
              <strong>${responsavel}</strong><br>
              <span style="font-size: 11px;">Assinatura do Usuário</span>
            </div>
          </div>
        </div>
      `
    }

    const htmlContent = `
      <html>
        <head>
          <title>Evolução Técnica - ${responsavel}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
            .header { text-align: center; text-transform: uppercase; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .title { text-align: center; font-weight: bold; text-transform: uppercase; margin-bottom: 20px; font-size: 16px; }
            .section { margin-bottom: 20px; }
            .field { margin-bottom: 8px; }
            .field span { font-weight: bold; }
            .relato-box { border: 1px solid #000; padding: 15px; min-height: 150px; margin-top: 10px; font-size: 14px; text-align: justify; }
            .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 11px; color: #555; border-top: 1px solid #000; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h3>${settings.municipio.toUpperCase()}</h3>
            <h4>${settings.secretaria.toUpperCase()}</h4>
            <h5>CENTRO DE REFERÊNCIA DA ASSISTÊNCIA SOCIAL</h5>
            <h5>${settings.crasUnidade.toUpperCase()}</h5>
          </div>

          <div class="title">Relatório de ${evo.tipo}</div>

          <div class="section">
            <div class="field"><span>Família:</span> ${responsavel}</div>
            <div class="field"><span>Data / Hora:</span> ${evo.data} às ${evo.hora}</div>
            <div class="field"><span>Técnico Responsável:</span> ${evo.tecnico}</div>
            ${isVisita ? `<div class="field"><span>Participantes Familiares Presentes:</span> ${evo.participantes_familiares?.join(', ') || 'Nenhum informado'}</div>` : `<div class="field"><span>Usuário Atendido:</span> ${evo.usuario_visitado}</div>`}
            ${evo.profissionais_participantes ? `<div class="field"><span>Profissionais Co-visitantes:</span> ${evo.profissionais_participantes}</div>` : ''}
          </div>

          <div class="section">
            <strong>Relato da Ação Técnica:</strong>
            <div class="relato-box">${evo.relato}</div>
          </div>

          <div class="section">
            <strong>Providências / Encaminhamentos:</strong>
            <div class="relato-box" style="min-height: 80px;">${evo.providencias || 'Nenhuma providência registrada.'}</div>
          </div>

          ${signaturesHtml}

          <div class="footer">
            ${settings.crasUnidade} • ${settings.endereco} • Contato: ${settings.telefone} • E-mail: ${settings.email}
          </div>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.print()
  }

  function handleOpenFamilyModal(fam: any = null) {
    if (fam) {
      const resp = fam.membros_familia?.find((m: any) => m.parentesco === 'Responsável') || {}
      setFamForm({
        id: fam.id,
        codFamiliar: fam.cod_familiar,
        responsavel: fam.responsavel,
        cpfResponsavel: fam.cpf_responsavel,
        nisResponsavel: fam.nis_responsavel,
        logradouro: fam.logradouro,
        numero: fam.numero,
        bairro: fam.bairro,
        municipio: fam.municipio || 'Conceição do Tocantins',
        uf: fam.uf || 'TO',
        telefone: fam.telefone || '',
        outroContato: fam.outro_contato || '',
        moradiaTipo: fam.moradia_tipo || 'Alvenaria com Revestimento',
        moradiaAgua: fam.moradia_agua || 'Rede Geral',
        moradiaSanear: fam.moradia_sanear || 'Rede Geral',
        moradiaLixo: fam.moradia_lixo || 'Coletado',
        vulnerabilidades: fam.vulnerabilidades || [],
        paifAtivo: fam.paif_ativo || false,
        paifMetas: fam.paif_metas || '',
        
        // Novos campos
        dataNascimentoResponsavel: resp.data_nascimento || '',
        rgResponsavel: resp.rg || 'Não Informado',
        rendaResponsavel: resp.renda ? resp.renda.toString() : '0',
        ocupacaoResponsavel: resp.ocupacao || '',
        programaGovernoResponsavel: resp.programa_governo || '',
        programaGovernoResponsavelOutros: '',
        escolaridadeResponsavel: resp.escolaridade || ''
      })
    } else {
      setFamForm({
        id: '',
        codFamiliar: Math.floor(10000000 + Math.random() * 90000000).toString(),
        responsavel: '',
        cpfResponsavel: '',
        nisResponsavel: '',
        logradouro: '',
        numero: '',
        bairro: '',
        municipio: 'Conceição do Tocantins',
        uf: 'TO',
        telefone: '',
        outroContato: '',
        moradiaTipo: 'Alvenaria com Revestimento',
        moradiaAgua: 'Rede Geral',
        moradiaSanear: 'Rede Geral',
        moradiaLixo: 'Coletado',
        vulnerabilidades: [],
        paifAtivo: false,
        paifMetas: '',
        
        // Novos campos
        dataNascimentoResponsavel: '',
        rgResponsavel: 'Não Informado',
        rendaResponsavel: '0',
        ocupacaoResponsavel: '',
        programaGovernoResponsavel: '',
        programaGovernoResponsavelOutros: '',
        escolaridadeResponsavel: ''
      })
    }
    setShowFamilyModal(true)
  }

  function handleOpenMemberModal(fam: any) {
    setSelectedFamily(fam)
    setMemForm({
      id: '',
      nome: '',
      parentesco: '',
      dataNascimento: '',
      cpf: '',
      rg: 'Não Informado',
      nis: '',
      renda: '0',
      escolaridade: '',
      ocupacao: '',
      programaGoverno: '',
      programaGovernoOutros: ''
    })
    setShowMemberModal(true)
  }

  function handleOpenEvolutionModal(fam: any) {
    setSelectedFamily(fam)
    setEvoForm({
      tipo: 'Atendimento',
      usuarioVisitado: '',
      participantesFamiliares: [],
      local: 'CRAS',
      tecnico: currentUser?.nome || '',
      compartilhada: 'Não',
      profissionaisParticipantes: [],
      relato: '',
      providencias: ''
    })
    setShowEvolutionModal(true)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
      
      {/* 1. SIDEBAR MENU */}
      <aside style={{ width: '280px', background: 'linear-gradient(135deg, #17252a 0%, #2b7a78 100%)', color: 'white', display: 'flex', flexDirection: 'column', padding: '24px', flexShrink: 0, boxShadow: '4px 0 15px rgba(0,0,0,0.15)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" style={{ maxHeight: '48px', borderRadius: '4px', objectFit: 'contain' }} />
          ) : (
            <i className="fa-solid fa-people-roof" style={{ fontSize: '1.8rem', color: '#2ec4b6' }}></i>
          )}
          <h1 style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: '1.05rem', color: '#ffffff', lineHeight: 1.2, wordBreak: 'break-word' }}>
            {settings.crasUnidade}
            <span style={{ fontWeight: 400, fontSize: '0.75rem', display: 'block', color: '#2ec4b6', marginTop: '2px' }}>SUAS Digital</span>
          </h1>
        </div>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1, padding: 0, margin: 0 }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
            { id: 'families', label: 'Prontuário SUAS', icon: 'fa-address-book' },
            { id: 'appointments', label: 'Agenda Técnica', icon: 'fa-calendar-days' },
            { id: 'benefits', label: 'Benefícios / Estoque', icon: 'fa-hand-holding-heart' },
            { id: 'referrals', label: 'Encaminhamentos', icon: 'fa-route' },
            { id: 'settings', label: 'Configurações', icon: 'fa-gears' }
          ].map(item => (
            <li key={item.id}>
              <button
                onClick={() => setActiveScreen(item.id as Screen)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 18px',
                  color: activeScreen === item.id ? '#ffffff' : 'rgba(255,255,255,0.85)',
                  background: activeScreen === item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: activeScreen === item.id ? '600' : '500',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: activeScreen === item.id ? 'inset 4px 0 0 #2ec4b6' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <i className={`fa-solid ${item.icon}`} style={{ fontSize: '1.2rem', width: '24px', textAlign: 'center', color: activeScreen === item.id ? '#2ec4b6' : 'inherit' }}></i>
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button 
            onClick={fazerLogout}
            style={{ width: '100%', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(231, 29, 54, 0.15)', color: '#ff9eaf', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}
          >
            <i className="fa-solid fa-right-from-bracket" style={{ width: '24px', textAlign: 'center' }}></i>
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* 2. CORPO PRINCIPAL */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        
        {/* TOPBAR */}
        <header style={{ height: '75px', backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--bg-light)', padding: '8px 16px', borderRadius: '50px', width: '320px', border: '1px solid transparent' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--text-muted)' }}></i>
            <input 
              type="text" 
              placeholder="Buscar prontuário rápido..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '0.9rem', color: 'var(--text-main)' }} 
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: 'white', display: 'flex', alignItems: 'center', fontWeight: '700', fontSize: '1rem', justifyContent: 'center' }}>
                {currentUser?.nome ? currentUser.nome.substring(0, 2).toUpperCase() : 'CO'}
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                <p style={{ fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>{currentUser?.nome || 'Profissional'}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>{currentUser?.cargo || 'Coordenador(a)'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTAINER DE TELAS */}
        <div style={{ flexGrow: 1, padding: '24px 30px', overflowY: 'auto', overflowX: 'hidden', backgroundColor: 'var(--bg-light)' }}>
          
          {/* SCREEN: DASHBOARD */}
          {activeScreen === 'dashboard' && (
            <div>
              <div style={{ marginBottom: '30px' }}>
                <h2>Painel Geral</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>Visão geral da proteção social básica e acompanhamentos ativos.</p>
              </div>

              {/* Grid Estatístico */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '35px' }}>
                {[
                  { label: 'Famílias Cadastradas', val: stats.families, icon: 'fa-house-chimney', colorClass: '' },
                  { label: 'Acompanhados no PAIF', val: stats.paif, icon: 'fa-user-shield', colorClass: 'success' },
                  { label: 'Benefícios Entregues', val: stats.benefits, icon: 'fa-hand-holding-heart', colorClass: 'info' },
                  { label: 'Encaminhamentos Pendentes', val: stats.referrals, icon: 'fa-route', colorClass: 'warning' }
                ].map((st, i) => (
                  <div key={i} style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ zIndex: 1 }}>
                      <h3 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--primary)', margin: '0 0 4px' }}>{st.val}</h3>
                      <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>{st.label}</p>
                    </div>
                    <div style={{ fontSize: '2.5rem', color: 'rgba(43, 122, 120, 0.15)', zIndex: 0 }}><i className={`fa-solid ${st.icon}`}></i></div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 1.35fr', gap: '24px' }}>
                
                {/* Atendimentos Recentes */}
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #def2f1', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Últimas Evoluções do Prontuário</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #def2f1', textAlign: 'left' }}>
                          <th style={{ padding: '12px' }}>Data</th>
                          <th style={{ padding: '12px' }}>Família</th>
                          <th style={{ padding: '12px' }}>Técnico</th>
                          <th style={{ padding: '12px' }}>Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {families.flatMap(f => (f.historico_atendimentos || []).map((at: any) => ({ ...at, responsavel: f.responsavel }))).sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 5).map((at, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f3f9f9' }}>
                            <td style={{ padding: '12px' }}>{at.data}</td>
                            <td style={{ padding: '12px' }}><strong>{at.responsavel}</strong></td>
                            <td style={{ padding: '12px' }}>{at.tecnico}</td>
                            <td style={{ padding: '12px' }}><span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '20px', background: 'rgba(46, 196, 182, 0.1)', color: '#2ec4b6', fontWeight: 600 }}>{at.tipo}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Almoxarifado / Estoque Rápido */}
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #def2f1', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Estoque do Almoxarifado</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #def2f1', textAlign: 'left' }}>
                          <th style={{ padding: '12px' }}>Item Benefício</th>
                          <th style={{ padding: '12px' }}>Saldo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stock.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f3f9f9' }}>
                            <td style={{ padding: '12px' }}><strong>{item.tipo}</strong></td>
                            <td style={{ padding: '12px' }}><span style={{ fontWeight: 700, color: item.saldo < 10 ? '#e71d36' : '#2b7a78' }}>{item.saldo} {item.unidade}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SCREEN: FAMILIES (PRONTUÁRIO SUAS) */}
          {activeScreen === 'families' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                  <h2>Prontuário SUAS (Famílias)</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>Base de dados para acompanhamento das famílias e geração de dossiês.</p>
                </div>
                <button className="btn-primary" onClick={() => handleOpenFamilyModal()}>
                  <i className="fa-solid fa-plus"></i> Nova Família
                </button>
              </div>

              {/* Tabela de Famílias */}
              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #def2f1', boxShadow: 'var(--shadow-md)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #def2f1', textAlign: 'left', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '11px' }}>
                      <th style={{ padding: '12px 16px' }}>Cód.</th>
                      <th style={{ padding: '12px 16px' }}>Responsável</th>
                      <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>CPF/NIS</th>
                      <th style={{ padding: '12px 16px' }}>Endereço</th>
                      <th style={{ padding: '12px 16px' }}>Ações de Acompanhamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFamilies.map((fam, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f3f9f9' }}>
                        <td style={{ padding: '12px 16px' }}><code>{fam.cod_familiar}</code></td>
                        <td style={{ padding: '12px 16px' }}><strong>{fam.responsavel}</strong></td>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{fam.cpf_responsavel}</span><br />
                          <span style={{ fontSize: '0.75rem', color: 'var(--primary-light)' }}>{fam.nis_responsavel}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>{fam.logradouro}, {fam.numero} - {fam.bairro}</td>
                        <td style={{ padding: '12px 16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button onClick={() => handlePrintDossie(fam)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #def2f1', background: '#ffffff', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="fa-solid fa-print"></i> Dossiê
                          </button>
                          <button onClick={() => handleOpenMemberModal(fam)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #def2f1', background: '#ffffff', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="fa-solid fa-users"></i> Membros ({fam.membros_familia?.length || 1})
                          </button>
                          <button onClick={() => handleOpenEvolutionModal(fam)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #def2f1', background: '#ffffff', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="fa-solid fa-file-waveform"></i> Registrar Ação
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SCREEN: AGENDA TÉCNICA */}
          {activeScreen === 'appointments' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                  <h2>Agenda Técnica de Visitas & Atendimentos</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>Compromissos agendados pelo corpo técnico e assistentes sociais.</p>
                </div>
                <button className="btn-primary" onClick={() => {
                  if (families.length === 0) {
                    alert('Cadastre uma família primeiro!')
                    return
                  }
                  setSelectedFamily(families[0])
                  setAgeForm({
                    data: '',
                    hora: '',
                    tipo: 'Atendimento',
                    tecnico: currentUser?.nome || '',
                    descricao: ''
                  })
                  setShowAgendaModal(true)
                }}>
                  <i className="fa-solid fa-calendar-plus"></i> Novo Agendamento
                </button>
              </div>

              {/* Tabela de Agenda */}
              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #def2f1', boxShadow: 'var(--shadow-md)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #def2f1', textAlign: 'left', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '11px' }}>
                      <th style={{ padding: '12px 16px' }}>Data/Hora</th>
                      <th style={{ padding: '12px 16px' }}>Usuário / Família</th>
                      <th style={{ padding: '12px 16px' }}>Ação</th>
                      <th style={{ padding: '12px 16px' }}>Técnico Agendado</th>
                      <th style={{ padding: '12px 16px' }}>Ações Rápidas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agenda.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f3f9f9' }}>
                        <td style={{ padding: '12px 16px' }}><strong>{item.data}</strong> às {item.hora}</td>
                        <td style={{ padding: '12px 16px' }}><strong>{item.responsavel}</strong></td>
                        <td style={{ padding: '12px 16px' }}><span style={{ padding: '4px 8px', borderRadius: '20px', background: 'rgba(0, 119, 182, 0.1)', color: '#0077b6', fontSize: '11px', fontWeight: 600 }}>{item.tipo}</span></td>
                        <td style={{ padding: '12px 16px' }}>{item.tecnico}</td>
                        <td style={{ padding: '12px 16px', display: 'flex', gap: '8px' }}>
                          <button onClick={() => {
                            const fam = families.find(f => f.id === item.familia_id)
                            if (fam) {
                              setSelectedFamily(fam)
                              setEvoForm({
                                tipo: item.tipo,
                                usuarioVisitado: item.responsavel,
                                participantesFamiliares: [],
                                local: item.tipo === 'Atendimento' ? 'CRAS' : 'Domicílio',
                                tecnico: item.tecnico,
                                compartilhada: 'Não',
                                profissionaisParticipantes: [],
                                relato: '',
                                providencias: ''
                              })
                              setShowEvolutionModal(true)
                            }
                          }} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>
                            Realizado
                          </button>
                          <button onClick={() => handleAgendaStatusChange(item, 'Não Compareceu')} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e71d36', background: 'transparent', color: '#e71d36', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>
                            Falta
                          </button>
                          <button onClick={() => handleAgendaStatusChange(item, 'Cancelado')} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #6b7c85', background: 'transparent', color: '#6b7c85', cursor: 'pointer', fontSize: '11px' }}>
                            Cancelar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SCREEN: BENEFÍCIOS */}
          {activeScreen === 'benefits' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                  <h2>Benefícios Eventuais & Almoxarifado</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>Controle de estoque e liberação de insumos de assistência social.</p>
                </div>
                <button className="btn-primary" onClick={() => {
                  if (families.length === 0) {
                    alert('Cadastre uma família primeiro!')
                    return
                  }
                  setSelectedFamily(families[0])
                  setShowBenefitModal(true)
                }}>
                  <i className="fa-solid fa-gift"></i> Conceder Benefício
                </button>
              </div>

              {/* Tabela de Almoxarifado */}
              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #def2f1', boxShadow: 'var(--shadow-md)', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Estoque do Almoxarifado</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #def2f1', textAlign: 'left', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '11px' }}>
                        <th style={{ padding: '12px 16px' }}>Insumo / Benefício</th>
                        <th style={{ padding: '12px 16px' }}>Unidade</th>
                        <th style={{ padding: '12px 16px' }}>Saldo Atual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stock.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f3f9f9' }}>
                          <td style={{ padding: '12px 16px' }}><strong>{item.tipo}</strong></td>
                          <td style={{ padding: '12px 16px' }}>{item.unidade}</td>
                          <td style={{ padding: '12px 16px' }}><span style={{ fontWeight: 700, color: item.saldo < 10 ? '#e71d36' : '#2b7a78' }}>{item.saldo}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: ENCAMINHAMENTOS */}
          {activeScreen === 'referrals' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                  <h2>Rede de Serviços / Encaminhamentos</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>Referência e contra-referência para serviços setoriais externos.</p>
                </div>
                <button className="btn-primary" onClick={() => {
                  if (families.length === 0) {
                    alert('Cadastre uma família primeiro!')
                    return
                  }
                  setSelectedFamily(families[0])
                  setRefForm({
                    beneficiario: families[0].responsavel,
                    destino: '',
                    motivo: '',
                    tecnico: currentUser?.nome || ''
                  })
                  setShowReferralModal(true)
                }}>
                  <i className="fa-solid fa-arrow-up-right-from-square"></i> Novo Encaminhamento
                </button>
              </div>

              {/* Tabela de Encaminhamentos */}
              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #def2f1', boxShadow: 'var(--shadow-md)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #def2f1', textAlign: 'left', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '11px' }}>
                      <th style={{ padding: '12px 16px' }}>Data</th>
                      <th style={{ padding: '12px 16px' }}>Usuário / Membro</th>
                      <th style={{ padding: '12px 16px' }}>Encaminhado Para</th>
                      <th style={{ padding: '12px 16px' }}>Motivo</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((ref, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f3f9f9' }}>
                        <td style={{ padding: '12px 16px' }}>{new Date(ref.data_envio).toLocaleDateString('pt-BR')}</td>
                        <td style={{ padding: '12px 16px' }}><strong>{ref.beneficiario}</strong></td>
                        <td style={{ padding: '12px 16px' }}>{ref.destino}</td>
                        <td style={{ padding: '12px 16px' }}>{ref.motivo}</td>
                        <td style={{ padding: '12px 16px' }}><span style={{ padding: '4px 8px', borderRadius: '20px', background: ref.status === 'Pendente' ? 'rgba(255, 159, 28, 0.1)' : 'rgba(46, 196, 182, 0.1)', color: ref.status === 'Pendente' ? '#ff9f1c' : '#2ec4b6', fontSize: '11px', fontWeight: 600 }}>{ref.status}</span></td>
                        <td style={{ padding: '12px 16px' }}>
                          {ref.status === 'Pendente' && (
                            <button onClick={() => handleAnswerReferral(ref.id)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>
                              Responder
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SCREEN: CONFIGURAÇÕES */}
          {activeScreen === 'settings' && (
            <div>
              <div style={{ marginBottom: '30px' }}>
                <h2>Configurações da Unidade</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>Gerencie as informações institucionais exibidas em cabeçalhos e relatórios do CRAS.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #def2f1', boxShadow: 'var(--shadow-md)' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', borderBottom: '1px solid #def2f1', paddingBottom: '10px' }}>Identidade Visual & Contato</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ width: '80px', height: '80px', border: '1px dashed var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f9f9', overflow: 'hidden' }}>
                        {settings.logoUrl ? <img src={settings.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <i className="fa-solid fa-image" style={{ color: 'var(--text-muted)', fontSize: '24px' }}></i>}
                      </div>
                      <div>
                        <p style={{ fontWeight: '600', fontSize: '0.9rem', margin: '0 0 4px' }}>Logotipo/Brasão Municipal</p>
                        <input type="file" accept="image/*" onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = async (evt) => {
                              const b64 = evt.target?.result as string
                              setSettings(prev => {
                                const newSettings = { ...prev, logoUrl: b64 }
                                localStorage.setItem('cras_settings', JSON.stringify(newSettings))
                                return newSettings
                              })
                              const res = await fetch('/api/configuracoes', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ logo_url: b64 })
                              })
                              const result = await res.json()
                              if (!result.ok) {
                                alert('Erro ao salvar brasão: ' + result.error)
                              }
                            }
                            reader.readAsDataURL(file)
                          }
                        }} />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Nome da Prefeitura / Município</label>
                      <input className="input-modern" style={{ color: 'var(--text-main) !important', background: '#ffffff', borderColor: '#def2f1' }} value={settings.municipio} onChange={(e) => setSettings(prev => ({ ...prev, municipio: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Secretaria Municipal</label>
                      <input className="input-modern" style={{ color: 'var(--text-main) !important', background: '#ffffff', borderColor: '#def2f1' }} value={settings.secretaria} onChange={(e) => setSettings(prev => ({ ...prev, secretaria: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Nome da Unidade / CRAS</label>
                      <input className="input-modern" style={{ color: 'var(--text-main) !important', background: '#ffffff', borderColor: '#def2f1' }} value={settings.crasUnidade} onChange={(e) => setSettings(prev => ({ ...prev, crasUnidade: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Endereço da Unidade</label>
                      <input className="input-modern" style={{ color: 'var(--text-main) !important', background: '#ffffff', borderColor: '#def2f1' }} value={settings.endereco} onChange={(e) => setSettings(prev => ({ ...prev, endereco: e.target.value }))} />
                    </div>
                    
                    <button className="btn-primary" style={{ width: 'fit-content' }} onClick={async () => {
                      const res = await fetch('/api/configuracoes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          municipio: settings.municipio,
                          secretaria: settings.secretaria,
                          cras_unidade: settings.crasUnidade,
                          endereco: settings.endereco,
                          telefone: settings.telefone,
                          email: settings.email
                        })
                      })
                      const result = await res.json()
                      if (!result.ok) {
                        alert('Erro ao atualizar configurações: ' + result.error)
                      } else {
                        localStorage.setItem('cras_settings', JSON.stringify(settings))
                        alert('Configurações salvas no Supabase com sucesso!')
                      }
                    }}>
                      Salvar Identidade
                    </button>
                  </div>
                </div>

                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #def2f1', boxShadow: 'var(--shadow-md)' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', borderBottom: '1px solid #def2f1', paddingBottom: '10px' }}>Equipe Técnica Ativa</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #def2f1', textAlign: 'left' }}>
                          <th style={{ padding: '8px' }}>Nome</th>
                          <th style={{ padding: '8px' }}>Função</th>
                        </tr>
                      </thead>
                      <tbody>
                        {professionals.map((prof, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f3f9f9' }}>
                            <td style={{ padding: '8px' }}><strong>{prof.nome}</strong></td>
                            <td style={{ padding: '8px' }}>{prof.cargo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      {/* ─── MODAL: NOVA FAMÍLIA / EDITAR FAMÍLIA ─── */}
      {showFamilyModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: '20px' }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '100%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', color: 'var(--text-main)' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', borderBottom: '2px solid #def2f1', paddingBottom: '10px' }}>
              {famForm.id ? 'Editar Cadastro Familiar' : 'Cadastrar Nova Família - Prontuário SUAS'}
            </h3>
            
            <form onSubmit={handleSaveFamily} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* SEÇÃO 1: INFORMAÇÕES DO RESPONSÁVEL */}
              <div>
                <h4 style={{ color: 'var(--primary)', marginBottom: '15px', borderBottom: '1px solid #def2f1', paddingBottom: '6px', fontSize: '0.95rem' }}>
                  <i className="fa-solid fa-user" style={{ marginRight: '8px' }}></i> Informações do Responsável
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Nome Completo</label>
                    <input className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={famForm.responsavel} required onChange={(e) => setFamForm(f => ({ ...f, responsavel: e.target.value }))} placeholder="Nome do Responsável Familiar" />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Data de Nascimento</label>
                    <input className="input-modern" type="date" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={famForm.dataNascimentoResponsavel} required onChange={(e) => setFamForm(f => ({ ...f, dataNascimentoResponsavel: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>RG</label>
                    <input className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={famForm.rgResponsavel} onChange={(e) => setFamForm(f => ({ ...f, rgResponsavel: e.target.value }))} placeholder="Ex: 00.000.000-00" />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>CPF</label>
                    <input className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={famForm.cpfResponsavel} required onChange={(e) => setFamForm(f => ({ ...f, cpfResponsavel: e.target.value }))} placeholder="000.000.000-00" />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>NIS</label>
                    <input className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={famForm.nisResponsavel} required onChange={(e) => setFamForm(f => ({ ...f, nisResponsavel: e.target.value }))} placeholder="000.00000.00-0" />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Renda Mensal (R$)</label>
                    <input className="input-modern" type="number" step="0.01" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={famForm.rendaResponsavel} required onChange={(e) => setFamForm(f => ({ ...f, rendaResponsavel: e.target.value }))} placeholder="Ex: 0.00 ou 1320.00" />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Ocupação</label>
                    <input className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={famForm.ocupacaoResponsavel} required onChange={(e) => setFamForm(f => ({ ...f, ocupacaoResponsavel: e.target.value }))} placeholder="Digite a ocupação..." />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Telefone Principal</label>
                    <input className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={famForm.telefone} required onChange={(e) => setFamForm(f => ({ ...f, telefone: e.target.value }))} placeholder="(71) 90000-0000" />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Outro Contato / Tel. Alternativo</label>
                    <input className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={famForm.outroContato} onChange={(e) => setFamForm(f => ({ ...f, outroContato: e.target.value }))} placeholder="Ex: (71) 98888-8888 (Mãe Socorro)" />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Beneficiário de Programa do Governo</label>
                    <select className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={famForm.programaGovernoResponsavel} required onChange={(e) => setFamForm(f => ({ ...f, programaGovernoResponsavel: e.target.value }))}>
                      <option value="" disabled>Selecione...</option>
                      <option value="Nenhum">Nenhum</option>
                      <option value="Bolsa Família">Bolsa Família</option>
                      <option value="BPC (Benefício de Prestação Continuada)">BPC (Benefício de Prestação Continuada)</option>
                      <option value="Bolsa Família + BPC">Bolsa Família + BPC</option>
                      <option value="Outros">Outros</option>
                    </select>
                    {famForm.programaGovernoResponsavel === 'Outros' && (
                      <input className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1', marginTop: '8px' }} value={famForm.programaGovernoResponsavelOutros} onChange={(e) => setFamForm(f => ({ ...f, programaGovernoResponsavelOutros: e.target.value }))} placeholder="Especifique o programa..." />
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Escolaridade</label>
                    <select className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={famForm.escolaridadeResponsavel} required onChange={(e) => setFamForm(f => ({ ...f, escolaridadeResponsavel: e.target.value }))}>
                      <option value="" disabled>Selecione...</option>
                      <option value="Sem Idade Escolar">Sem Idade Escolar</option>
                      <option value="Fundamental Incompleto">Fundamental Incompleto</option>
                      <option value="Fundamental Completo">Fundamental Completo</option>
                      <option value="Médio Incompleto">Médio Incompleto</option>
                      <option value="Médio Completo">Médio Completo</option>
                      <option value="Superior Incompleto">Superior Incompleto</option>
                      <option value="Superior Completo">Superior Completo</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 2: ENDEREÇO E TERRITORIALIZAÇÃO */}
              <div>
                <h4 style={{ color: 'var(--primary)', marginBottom: '15px', borderBottom: '1px solid #def2f1', paddingBottom: '6px', fontSize: '0.95rem' }}>
                  <i className="fa-solid fa-map" style={{ marginRight: '8px' }}></i> Endereço e Territorialização
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Rua/Logradouro</label>
                    <input className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={famForm.logradouro} required onChange={(e) => setFamForm(f => ({ ...f, logradouro: e.target.value }))} placeholder="Rua, Avenida, Travessa..." />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Número</label>
                    <input className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={famForm.numero} required onChange={(e) => setFamForm(f => ({ ...f, numero: e.target.value }))} placeholder="Ex: 45A ou S/N" />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Bairro</label>
                    <select className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={famForm.bairro} required onChange={(e) => setFamForm(f => ({ ...f, bairro: e.target.value }))}>
                      <option value="" disabled>Selecione...</option>
                      <option value="Liberdade">Liberdade</option>
                      <option value="Pero Vaz">Pero Vaz</option>
                      <option value="Caixa d'Água">Caixa d'Água</option>
                      <option value="Palestina">Palestina</option>
                      <option value="Centro">Centro</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Acompanhamento PAIF?</label>
                    <select className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={famForm.paifAtivo ? 'Sim' : 'Não'} onChange={(e) => setFamForm(f => ({ ...f, paifAtivo: e.target.value === 'Sim' }))}>
                      <option value="Não">Não</option>
                      <option value="Sim">Sim</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 3: CONDIÇÕES HABITACIONAIS */}
              <div>
                <h4 style={{ color: 'var(--primary)', marginBottom: '15px', borderBottom: '1px solid #def2f1', paddingBottom: '6px', fontSize: '0.95rem' }}>
                  <i className="fa-solid fa-house" style={{ marginRight: '8px' }}></i> Condições Habitacionais
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Tipo de Construção</label>
                    <select className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={famForm.moradiaTipo} required onChange={(e) => setFamForm(f => ({ ...f, moradiaTipo: e.target.value }))}>
                      <option value="Alvenaria com Revestimento">Alvenaria com Revestimento</option>
                      <option value="Alvenaria sem Revestimento">Alvenaria sem Revestimento</option>
                      <option value="Madeira/Taipa">Madeira/Taipa</option>
                      <option value="Material Aproveitado">Material Aproveitado</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Abastecimento de Água</label>
                    <select className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={famForm.moradiaAgua} required onChange={(e) => setFamForm(f => ({ ...f, moradiaAgua: e.target.value }))}>
                      <option value="Rede Geral">Rede Geral</option>
                      <option value="Poço/Nascente">Poço/Nascente</option>
                      <option value="Caminhão Pipa">Caminhão Pipa</option>
                      <option value="Inexistente">Inexistente</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Escoamento Sanitário</label>
                    <select className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={famForm.moradiaSanear} required onChange={(e) => setFamForm(f => ({ ...f, moradiaSanear: e.target.value }))}>
                      <option value="Rede Geral">Rede Geral</option>
                      <option value="Fossa Séptica">Fossa Séptica</option>
                      <option value="Fossa Rudimentar">Fossa Rudimentar</option>
                      <option value="Céu Aberto">Céu Aberto</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Coleta de Lixo</label>
                    <select className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={famForm.moradiaLixo} required onChange={(e) => setFamForm(f => ({ ...f, moradiaLixo: e.target.value }))}>
                      <option value="Coletado">Coletado</option>
                      <option value="Depositado em caçamba">Depositado em caçamba</option>
                      <option value="Queimado/Enterrado">Queimado/Enterrado</option>
                      <option value="Descartado a céu aberto">Descartado a céu aberto</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 4: VULNERABILIDADES SOCIAIS */}
              <div>
                <h4 style={{ color: 'var(--primary)', marginBottom: '10px', borderBottom: '1px solid #def2f1', paddingBottom: '6px', fontSize: '0.95rem' }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '8px' }}></i> Vulnerabilidades Sociais
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '10px' }}>
                  {[
                    'Extrema Pobreza',
                    'Habitação Precária',
                    'Ausência de Saneamento',
                    'Membro com Deficiência (PcD)',
                    'Mãe / Pai Solo',
                    'Crianças fora da escola',
                    'Violência Doméstica Relatada',
                    'Analfabetismo',
                    'Família Atípica (Membro Neurodivergente/PCD)'
                  ].map((vul, idx) => (
                    <label key={idx} style={{ display: 'flex', gap: '8px', fontSize: '12px', cursor: 'pointer', alignItems: 'center' }}>
                      <input type="checkbox" checked={famForm.vulnerabilidades.includes(vul)} onChange={() => {
                        const exists = famForm.vulnerabilidades.includes(vul)
                        setFamForm(prev => ({
                          ...prev,
                          vulnerabilidades: exists 
                            ? prev.vulnerabilidades.filter(v => v !== vul)
                            : [...prev.vulnerabilidades, vul]
                        }))
                      }} />
                      {vul === 'Família Atípica (Membro Neurodivergente/PCD)' ? 'Família Atípica' : vul === 'Membro com Deficiência (PcD)' ? 'Membro com Deficiência' : vul === 'Violência Doméstica Relatada' ? 'Violência Doméstica' : vul}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid #def2f1', paddingTop: '16px' }}>
                <button type="button" onClick={() => setShowFamilyModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #def2f1', background: 'none', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" className="btn-primary">
                  <i className="fa-solid fa-save" style={{ marginRight: '6px' }}></i> Salvar Prontuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: COMPOSIÇÃO FAMILIAR / MEMBROS ─── */}
      {showMemberModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: '20px' }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '100%', maxWidth: '500px' }}>
            <h3>Integrantes da Família</h3>
            <form onSubmit={handleSaveMember} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Nome Completo</label>
                <input className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={memForm.nome} required onChange={(e) => setMemForm(m => ({ ...m, nome: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Parentesco</label>
                  <select className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={memForm.parentesco} required onChange={(e) => setMemForm(m => ({ ...m, parentesco: e.target.value }))}>
                    <option value="" disabled>Selecione...</option>
                    <option value="Filho(a)">Filho(a)</option>
                    <option value="Cônjuge">Cônjuge</option>
                    <option value="Mãe">Mãe</option>
                    <option value="Pai">Pai</option>
                    <option value="Irmão(ã)">Irmão(ã)</option>
                    <option value="Outro Parente">Outro Parente</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Data de Nascimento</label>
                  <input className="input-modern" type="date" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={memForm.dataNascimento} required onChange={(e) => setMemForm(m => ({ ...m, dataNascimento: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Escolaridade</label>
                  <select className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={memForm.escolaridade} required onChange={(e) => setMemForm(m => ({ ...m, escolaridade: e.target.value }))}>
                    <option value="" disabled>Selecione...</option>
                    <option value="Sem Idade Escolar">Sem Idade Escolar</option>
                    <option value="Fundamental Incompleto">Fundamental Incompleto</option>
                    <option value="Fundamental Completo">Fundamental Completo</option>
                    <option value="Médio Incompleto">Médio Incompleto</option>
                    <option value="Médio Completo">Médio Completo</option>
                    <option value="Superior Incompleto">Superior Incompleto</option>
                    <option value="Superior Completo">Superior Completo</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Ocupação</label>
                  <input className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={memForm.ocupacao} required onChange={(e) => setMemForm(m => ({ ...m, ocupacao: e.target.value }))} placeholder="Ex: Agricultor, Dona de Casa" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowMemberModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #def2f1', background: 'none', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" className="btn-primary">Adicionar Integrante</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: REGISTRAR EVOLUÇÃO (AÇÃO TÉCNICA) ─── */}
      {showEvolutionModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: '20px' }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>Registrar Ação Técnica / Evolução</h3>
            <form onSubmit={handleSaveEvolution} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Tipo de Ação</label>
                  <select className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={evoForm.tipo} onChange={(e) => setEvoForm(ev => ({ ...ev, tipo: e.target.value }))}>
                    <option value="Atendimento">Atendimento Individual</option>
                    <option value="Visita Domiciliar">Visita Domiciliar</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Técnico Responsável</label>
                  <select className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={evoForm.tecnico} required onChange={(e) => setEvoForm(ev => ({ ...ev, tecnico: e.target.value }))}>
                    <option value="" disabled>Selecione...</option>
                    {professionals.map((p, idx) => (
                      <option key={idx} value={p.nome}>{p.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
              {evoForm.tipo === 'Atendimento' ? (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Membro Atendido</label>
                  <select className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={evoForm.usuarioVisitado} required onChange={(e) => setEvoForm(ev => ({ ...ev, usuarioVisitado: e.target.value }))}>
                    <option value="" disabled>Selecione...</option>
                    <option value={selectedFamily.responsavel}>{selectedFamily.responsavel} (Responsável)</option>
                    {(selectedFamily.membros_familia || []).map((m: any, idx: number) => (
                      <option key={idx} value={m.nome}>{m.nome}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Membros Presentes (Visita)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '100px', overflowY: 'auto', border: '1px solid #def2f1', padding: '8px', borderRadius: '8px' }}>
                    <label style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                      <input type="checkbox" checked={evoForm.participantesFamiliares.includes(selectedFamily.responsavel)} onChange={(e) => {
                        const checked = e.target.checked
                        setEvoForm(ev => ({
                          ...ev,
                          participantesFamiliares: checked 
                            ? [...ev.participantesFamiliares, selectedFamily.responsavel]
                            : ev.participantesFamiliares.filter(n => n !== selectedFamily.responsavel)
                        }))
                      }} />
                      {selectedFamily.responsavel} (Responsável)
                    </label>
                    {(selectedFamily.membros_familia || []).map((m: any, idx: number) => (
                      <label key={idx} style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                        <input type="checkbox" checked={evoForm.participantesFamiliares.includes(m.nome)} onChange={(e) => {
                          const checked = e.target.checked
                          setEvoForm(ev => ({
                            ...ev,
                            participantesFamiliares: checked 
                              ? [...ev.participantesFamiliares, m.nome]
                              : ev.participantesFamiliares.filter(n => n !== m.nome)
                          }))
                        }} />
                        {m.nome}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Visita Compartilhada?</label>
                  <select className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={evoForm.compartilhada} onChange={(e) => setEvoForm(ev => ({ ...ev, compartilhada: e.target.value }))}>
                    <option value="Não">Não</option>
                    <option value="Sim">Sim</option>
                  </select>
                </div>
                {evoForm.compartilhada === 'Sim' && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Co-visitante(s)</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '100px', overflowY: 'auto', border: '1px solid #def2f1', padding: '8px', borderRadius: '8px' }}>
                      {professionals.filter(p => p.nome !== evoForm.tecnico).map((p, idx) => (
                        <label key={idx} style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                          <input type="checkbox" checked={evoForm.profissionaisParticipantes.includes(p.nome)} onChange={(e) => {
                            const checked = e.target.checked
                            setEvoForm(ev => ({
                              ...ev,
                              profissionaisParticipantes: checked 
                                ? [...ev.profissionaisParticipantes, p.nome]
                                : ev.profissionaisParticipantes.filter(n => n !== p.nome)
                            }))
                          }} />
                          {p.nome}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Relato Técnico da Ação</label>
                <textarea className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1', minHeight: '120px' }} value={evoForm.relato} required onChange={(e) => setEvoForm(ev => ({ ...ev, relato: e.target.value }))}></textarea>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Providências / Encaminhamentos</label>
                <textarea className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1', minHeight: '60px' }} value={evoForm.providencias} onChange={(e) => setEvoForm(ev => ({ ...ev, providencias: e.target.value }))}></textarea>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowEvolutionModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #def2f1', background: 'none', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" className="btn-primary">Registrar e Imprimir</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: NOVO AGENDAMENTO (AGENDA TÉCNICA) ─── */}
      {showAgendaModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: '20px' }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '100%', maxWidth: '500px' }}>
            <h3>Agendar Novo Compromisso</h3>
            <form onSubmit={handleSaveAgenda} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Família Selecionada</label>
                <select className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={selectedFamily?.id} required onChange={(e) => {
                  const fam = families.find(f => f.id === e.target.value)
                  if (fam) setSelectedFamily(fam)
                }}>
                  {families.map((f, idx) => (
                    <option key={idx} value={f.id}>{f.responsavel}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Data</label>
                  <input className="input-modern" type="date" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={ageForm.data} required onChange={(e) => setAgeForm(ag => ({ ...ag, data: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Hora</label>
                  <input className="input-modern" type="time" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={ageForm.hora} required onChange={(e) => setAgeForm(ag => ({ ...ag, hora: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Tipo</label>
                  <select className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={ageForm.tipo} onChange={(e) => setAgeForm(ag => ({ ...ag, tipo: e.target.value }))}>
                    <option value="Atendimento">Atendimento</option>
                    <option value="Visita Domiciliar">Visita Domiciliar</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Técnico Agendado</label>
                  <select className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={ageForm.tecnico} required onChange={(e) => setAgeForm(ag => ({ ...ag, tecnico: e.target.value }))}>
                    <option value="" disabled>Selecione...</option>
                    {professionals.map((p, idx) => (
                      <option key={idx} value={p.nome}>{p.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Descrição / Observações</label>
                <textarea className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1', minHeight: '60px' }} value={ageForm.descricao} onChange={(e) => setAgeForm(ag => ({ ...ag, descricao: e.target.value }))}></textarea>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowAgendaModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #def2f1', background: 'none', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" className="btn-primary">Criar Agendamento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: CONCEDER BENEFÍCIO EVENTUAL ─── */}
      {showBenefitModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: '20px' }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '100%', maxWidth: '450px' }}>
            <h3>Conceder Benefício Eventual</h3>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Família Beneficiária</label>
                <select className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={selectedFamily?.id} onChange={(e) => {
                  const fam = families.find(f => f.id === e.target.value)
                  if (fam) setSelectedFamily(fam)
                }}>
                  {families.map((f, idx) => (
                    <option key={idx} value={f.id}>{f.responsavel}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Selecione o Insumo no Estoque:</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {stock.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', border: '1px solid #def2f1', background: '#f3f9f9' }}>
                      <div>
                        <strong>{item.tipo}</strong>
                        <span style={{ fontSize: '11px', display: 'block', color: 'var(--text-muted)' }}>Saldo: {item.saldo} {item.unidade}</span>
                      </div>
                      <button 
                        onClick={(e) => handleGrantBenefit(e, item)} 
                        disabled={item.saldo <= 0}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: item.saldo > 0 ? 'var(--primary)' : '#6b7c85', color: 'white', cursor: item.saldo > 0 ? 'pointer' : 'not-allowed', fontSize: '11px', fontWeight: 600 }}
                      >
                        Entregar
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button onClick={() => setShowBenefitModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #def2f1', background: 'none', cursor: 'pointer' }}>Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: NOVO ENCAMINHAMENTO ─── */}
      {showReferralModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: '20px' }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '100%', maxWidth: '500px' }}>
            <h3>Novo Encaminhamento de Rede</h3>
            <form onSubmit={handleSaveReferral} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Beneficiário / Família</label>
                <select className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={selectedFamily?.id} onChange={(e) => {
                  const fam = families.find(f => f.id === e.target.value)
                  if (fam) {
                    setSelectedFamily(fam)
                    setRefForm(rf => ({ ...rf, beneficiario: fam.responsavel }))
                  }
                }}>
                  {families.map((f, idx) => (
                    <option key={idx} value={f.id}>{f.responsavel}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Destino / Setor (Saúde, Educação, etc.)</label>
                <input className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={refForm.destino} required onChange={(e) => setRefForm(rf => ({ ...rf, destino: e.target.value }))} placeholder="Ex: Secretaria de Saúde - Caps" />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Motivo do Encaminhamento</label>
                <textarea className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1', minHeight: '80px' }} value={refForm.motivo} required onChange={(e) => setRefForm(rf => ({ ...rf, motivo: e.target.value }))}></textarea>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Técnico Responsável</label>
                <select className="input-modern" style={{ background: '#ffffff', color: 'var(--text-main) !important', borderColor: '#def2f1' }} value={refForm.tecnico} required onChange={(e) => setRefForm(rf => ({ ...rf, tecnico: e.target.value }))}>
                  <option value="" disabled>Selecione...</option>
                  {professionals.map((p, idx) => (
                    <option key={idx} value={p.nome}>{p.nome}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowReferralModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #def2f1', background: 'none', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" className="btn-primary">Emitir Guia</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
