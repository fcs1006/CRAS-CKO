import { Usuario, Atendimento } from '@/types'

export type PerfilAcesso = 'admin' | 'tecnico' | 'recepcao' | 'scfv' | 'usuario'

export function getPerfilUsuario(u?: Usuario | null): PerfilAcesso {
  if (!u) return 'admin' // Fallback amplo para não bloquear se não logado
  const p = (u.perfil || '').toLowerCase()
  if (p === 'admin') return 'admin'
  if (p === 'recepcao' || p === 'atendimento') return 'recepcao'
  if (p === 'scfv' || p === 'educador') return 'scfv'
  if (p === 'tecnico' || p === 'usuario') return 'tecnico'
  return 'tecnico'
}

export function isPsicologo(u?: Usuario | null): boolean {
  if (!u) return false
  const cargo = (u.cargo || '').toLowerCase()
  const conselho = (u.conselho || '').toLowerCase()
  return cargo.includes('psicól') || cargo.includes('psicolog') || conselho.includes('crp')
}

export function isAssistenteSocial(u?: Usuario | null): boolean {
  if (!u) return false
  const cargo = (u.cargo || '').toLowerCase()
  const conselho = (u.conselho || '').toLowerCase()
  return cargo.includes('assistente social') || cargo.includes('social') || conselho.includes('cress')
}

export function isTecnicoSuperior(u?: Usuario | null): boolean {
  if (!u) return true
  const perfil = getPerfilUsuario(u)
  if (perfil === 'admin' || perfil === 'tecnico') return true
  return isPsicologo(u) || isAssistenteSocial(u)
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
    return { podeVer: true }
  }

  const perfil = getPerfilUsuario(usuarioLogado)
  // Administradores e Coordenadores do CRAS têm acesso de auditoria gerencial total
  if (perfil === 'admin') {
    return { podeVer: true }
  }

  const sigilo = atendimento.sigilo || 'equipe_tecnica'

  if (sigilo === 'publico') {
    return { podeVer: true }
  }

  if (sigilo === 'apenas_psicologia') {
    if (isPsicologo(usuarioLogado)) {
      return { podeVer: true }
    }
    return {
      podeVer: false,
      motivo: 'Apenas Psicologia',
      mensagemOculta: '🔒 [CONTEÚDO CONFIDENCIAL — SIGILO PROFISSIONAL DA PSICOLOGIA (RESOLUÇÃO CFP / RESTRITO A PSICÓLOGOS)]'
    }
  }

  if (sigilo === 'apenas_servico_social') {
    if (isAssistenteSocial(usuarioLogado)) {
      return { podeVer: true }
    }
    return {
      podeVer: false,
      motivo: 'Apenas Serviço Social',
      mensagemOculta: '🔒 [CONTEÚDO CONFIDENCIAL — SIGILO PROFISSIONAL DO SERVIÇO SOCIAL (CÓDIGO DE ÉTICA CRESS/CFESS / RESTRITO A ASSISTENTES SOCIAIS)]'
    }
  }

  // Sigilo 'equipe_tecnica' (Padrão das Equipes do PAIF)
  if (perfil === 'recepcao' || perfil === 'scfv') {
    return {
      podeVer: false,
      motivo: 'Restrito à Equipe Técnica Superior',
      mensagemOculta: '🔒 [CONTEÚDO CONFIDENCIAL — RESTRITO À EQUIPE TÉCNICA SUPERIOR (ASSISTENTE SOCIAL / PSICÓLOGO)]'
    }
  }

  return { podeVer: true }
}
