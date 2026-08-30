import { Usuario, Atendimento, Encaminhamento } from '@/types'

export type PerfilAcesso = 'admin' | 'tecnico' | 'recepcao' | 'scfv' | 'usuario'

export function getPerfilUsuario(u?: Usuario | null): PerfilAcesso {
  if (!u) return 'recepcao'
  const p = (u.perfil || '').toLowerCase()
  const cargo = (u.cargo || '').toLowerCase()

  if (p === 'admin' || cargo.includes('coordenad') || cargo.includes('diretor')) return 'admin'
  
  // Digitadores, Entrevistadores CadÚnico, Recepção e Apoio Administrativo
  if (
    p === 'recepcao' || 
    p === 'atendimento' || 
    p === 'usuario' ||
    cargo.includes('digitador') ||
    cargo.includes('entrevistador') ||
    cargo.includes('cadúnico') ||
    cargo.includes('cadunico') ||
    cargo.includes('recep') ||
    cargo.includes('administrativ') ||
    cargo.includes('apoio')
  ) {
    return 'recepcao'
  }

  if (p === 'scfv' || p === 'educador' || cargo.includes('educador') || cargo.includes('orientador')) {
    return 'scfv'
  }

  if (isPsicologo(u) || isAssistenteSocial(u)) {
    return 'tecnico'
  }

  if (p === 'tecnico') {
    return 'tecnico'
  }

  return 'recepcao'
}

export function isPsicologo(u?: Usuario | null): boolean {
  if (!u) return false
  const cargo = (u.cargo || '').toLowerCase()
  const conselho = (u.conselho || '').toLowerCase()
  const perfil = (u.perfil || '').toLowerCase()
  if (conselho.includes('crp')) return true
  if (perfil === 'psicologo' || perfil === 'psicólogo') return true
  return cargo.includes('psicól') || cargo.includes('psicolog')
}

export function isAssistenteSocial(u?: Usuario | null): boolean {
  if (!u) return false
  const cargo = (u.cargo || '').toLowerCase()
  const conselho = (u.conselho || '').toLowerCase()
  const perfil = (u.perfil || '').toLowerCase()

  // Se o conselho profissional tiver CRESS, é Assistente Social
  if (conselho.includes('cress')) return true
  if (perfil === 'assistente_social' || perfil === 'assistente social') return true

  // Verificação estrita: deve conter 'assistente social', excluindo funções de nível médio/operacional
  const isTermoAssistenteSocial = cargo.includes('assistente social') || cargo.includes('assistente-social')
  const isFuncaoNaoSuperior = (
    cargo.includes('orientad') || 
    cargo.includes('educad') || 
    cargo.includes('visitad') || 
    cargo.includes('entrevistad') || 
    cargo.includes('digitad') || 
    cargo.includes('apoio') || 
    cargo.includes('agente') ||
    cargo.includes('recep')
  )

  if (isTermoAssistenteSocial && !isFuncaoNaoSuperior) {
    return true
  }

  return false
}

export function isTecnicoSuperior(u?: Usuario | null): boolean {
  if (!u) return false
  const perfil = getPerfilUsuario(u)
  if (perfil === 'admin') return true
  const cargo = (u.cargo || '').toLowerCase()
  if (cargo.includes('coordenad') || cargo.includes('diretor')) return true
  
  // Apenas Assistentes Sociais (CRESS) ou Psicólogos (CRP) são equipe técnica superior do PAIF/SUAS
  return isPsicologo(u) || isAssistenteSocial(u)
}

export function extrairSigiloAtendimento(atendimento: Partial<Atendimento>): string {
  if (atendimento.sigilo && atendimento.sigilo.trim()) {
    return atendimento.sigilo.toLowerCase().trim()
  }
  if (atendimento.relato) {
    const match = atendimento.relato.match(/\[SIGILO:(.*?)\]/i)
    if (match && match[1]) {
      return match[1].toLowerCase().trim()
    }
  }
  return 'equipe_tecnica'
}

export function extrairRelatoLimpo(relato?: string): string {
  if (!relato) return ''
  return relato.replace(/\s*\[SIGILO:.*?\]/gi, '').trim()
}

export interface ResultadoSigilo {
  podeVer: boolean
  motivo?: string
  mensagemOculta?: string
}

export function verificarAcessoRelatoAtendimento(
  atendimento: Partial<Atendimento>,
  usuarioLogado?: Usuario | null
): ResultadoSigilo {
  if (!usuarioLogado) {
    return {
      podeVer: false,
      motivo: 'Usuário Não Autenticado',
      mensagemOculta: '[CONTEÚDO CONFIDENCIAL — RESTRITO A PROFISSIONAIS HABILITADOS]'
    }
  }

  // 1. Administradores e Coordenadores do CRAS possuem acesso gerencial/auditoria
  const perfil = getPerfilUsuario(usuarioLogado)
  const cargo = (usuarioLogado.cargo || '').toLowerCase()
  if (perfil === 'admin' || cargo.includes('coordenad') || cargo.includes('diretor')) {
    return { podeVer: true }
  }

  // 2. Atividades coletivas de Oficinas, Convivência e Grupos SCFV são públicas e abertas a toda a equipe
  const tipoUpper = (atendimento.tipo || '').toUpperCase()
  const relatoUpper = (atendimento.relato || '').toUpperCase()
  const isColetivoScfv = 
    tipoUpper.includes('SCFV') || 
    tipoUpper.includes('CONVIVÊNCIA') || 
    tipoUpper.includes('CONVIVENCIA') || 
    tipoUpper.includes('GRUPO') || 
    tipoUpper.includes('OFICINA') || 
    tipoUpper.includes('COLETIVO') ||
    relatoUpper.includes('SCFV') ||
    relatoUpper.includes('FREQUÊNCIA') ||
    relatoUpper.includes('FREQUENCIA') ||
    relatoUpper.includes('ENCONTRO DE CONVIVÊNCIA') ||
    relatoUpper.includes('OFICINA')

  if (isColetivoScfv) {
    return { podeVer: true }
  }

  // 3. Se o usuário logado for o próprio técnico responsável ou co-visitante
  const nomeLogado = (usuarioLogado.nome || usuarioLogado.usuario || '').trim().toUpperCase()
  const tecAtendimento = (atendimento.tecnico || '').trim().toUpperCase()
  const coTecsAtendimento = (atendimento.profissionais_participantes || '').trim().toUpperCase()

  if (
    nomeLogado && 
    (tecAtendimento.includes(nomeLogado) || coTecsAtendimento.includes(nomeLogado))
  ) {
    return { podeVer: true }
  }

  // 4. Obtenção do nível de sigilo
  const sigiloRaw = extrairSigiloAtendimento(atendimento)

  // Se o sigilo for GERAL / PÚBLICO
  if (
    sigiloRaw === 'publico' ||
    sigiloRaw === 'público' ||
    sigiloRaw === 'geral' ||
    sigiloRaw === 'livre' ||
    sigiloRaw === 'aberto'
  ) {
    return { podeVer: true }
  }

  // Se o sigilo for Apenas Psicologia
  if (sigiloRaw === 'apenas_psicologia' || sigiloRaw === 'psicologia') {
    if (isPsicologo(usuarioLogado)) {
      return { podeVer: true }
    }
    return {
      podeVer: false,
      motivo: 'Apenas Psicologia',
      mensagemOculta: '[CONTEÚDO CONFIDENCIAL — SIGILO PROFISSIONAL DA PSICOLOGIA (RESOLUÇÃO CFP / RESTRITO A PSICÓLOGOS)]'
    }
  }

  // Se o sigilo for Apenas Serviço Social
  if (sigiloRaw === 'apenas_servico_social' || sigiloRaw === 'servico_social') {
    if (isAssistenteSocial(usuarioLogado)) {
      return { podeVer: true }
    }
    return {
      podeVer: false,
      motivo: 'Apenas Serviço Social',
      mensagemOculta: '[CONTEÚDO CONFIDENCIAL — SIGILO PROFISSIONAL DO SERVIÇO SOCIAL (CÓDIGO DE ÉTICA CRESS/CFESS / RESTRITO A ASSISTENTES SOCIAIS)]'
    }
  }

  // 4. Sigilo 'equipe_tecnica' (Padrão para Atendimentos Técnicos do PAIF / Escuta Qualificada)
  // Exige estritamente ser Equipe Técnica Superior (Assistente Social ou Psicólogo)
  if (!isTecnicoSuperior(usuarioLogado)) {
    return {
      podeVer: false,
      motivo: 'Restrito à Equipe Técnica Superior',
      mensagemOculta: '[CONTEÚDO CONFIDENCIAL — RESTRITO À EQUIPE TÉCNICA SUPERIOR (ASSISTENTE SOCIAL / PSICÓLOGO)]'
    }
  }

  return { podeVer: true }
}

// --- PERMISSÕES ESTRUTURADAS DE AÇÕES (EDITAR / EXCLUIR / IMPRIMIR) ---

export function podeEditarAtendimento(u?: Usuario | null, atendimento?: Partial<Atendimento>): boolean {
  if (!u) return false
  const perfil = getPerfilUsuario(u)
  if (perfil === 'admin') return true

  // Se o usuário logado for o técnico que registrou ou co-participou
  const nomeLogado = (u.nome || u.usuario || '').trim().toUpperCase()
  const tecAtendimento = (atendimento?.tecnico || '').trim().toUpperCase()
  const coTecs = (atendimento?.profissionais_participantes || '').trim().toUpperCase()

  const isAutorOuParticipante = Boolean(nomeLogado && (tecAtendimento.includes(nomeLogado) || coTecs.includes(nomeLogado)))
  if (isAutorOuParticipante) return true

  // Se for Técnico Superior (Assistente Social / Psicólogo) e o atendimento for público ou da equipe técnica, pode editar
  if (isTecnicoSuperior(u)) {
    const resSigilo = verificarAcessoRelatoAtendimento(atendimento || {}, u)
    return resSigilo.podeVer
  }

  return false
}

export function podeExcluirAtendimento(u?: Usuario | null, atendimento?: Partial<Atendimento>): boolean {
  if (!u) return false
  const perfil = getPerfilUsuario(u)
  if (perfil === 'admin') return true
  if (isTecnicoSuperior(u)) {
    const nomeLogado = (u.nome || u.usuario || '').trim().toUpperCase()
    const tecAtendimento = (atendimento?.tecnico || '').trim().toUpperCase()
    return tecAtendimento.includes(nomeLogado)
  }
  return false
}

export function podeExcluirFamilia(u?: Usuario | null): boolean {
  if (!u) return false
  const perfil = getPerfilUsuario(u)
  return perfil === 'admin' || isTecnicoSuperior(u)
}

export function podeEmitirEncaminhamento(u?: Usuario | null): boolean {
  if (!u) return false
  const perfil = getPerfilUsuario(u)
  return perfil === 'admin' || isTecnicoSuperior(u)
}

export function podeVerDetalheEncaminhamento(u?: Usuario | null, enc?: Partial<Encaminhamento>): boolean {
  if (!u) return false
  const perfil = getPerfilUsuario(u)
  if (perfil === 'admin' || isTecnicoSuperior(u)) return true

  const nomeLogado = (u.nome || u.usuario || '').trim().toUpperCase()
  const tec = (enc?.tecnico || '').trim().toUpperCase()
  if (nomeLogado && tec.includes(nomeLogado)) return true

  return false
}

export function podeExcluirEncaminhamento(u?: Usuario | null): boolean {
  if (!u) return false
  const perfil = getPerfilUsuario(u)
  return perfil === 'admin' || isTecnicoSuperior(u)
}

export function podeEditarEncaminhamento(u?: Usuario | null, encaminhamento?: any): boolean {
  if (!u) return false
  const perfil = getPerfilUsuario(u)
  if (perfil === 'admin') return true

  const nomeLogado = (u.nome || u.usuario || '').trim().toUpperCase()
  const tec = (encaminhamento?.tecnico || '').trim().toUpperCase()
  const isEmissor = Boolean(nomeLogado && tec.includes(nomeLogado))

  if (isEmissor) return true
  if (isTecnicoSuperior(u)) return true

  return false
}

export function podeExcluirGrupoScfv(u?: Usuario | null): boolean {
  if (!u) return false
  const perfil = getPerfilUsuario(u)
  return perfil === 'admin' || isTecnicoSuperior(u)
}
