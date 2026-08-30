// Utilitário de Trilha de Auditoria (Audit Logging) - LGPD & SUAS Digital
import { getSupabaseServer } from '@/lib/supabaseServer'

export type AuditAcao =
  | 'LOGIN_SUCESSO'
  | 'LOGIN_FALHA'
  | 'LOGOUT'
  | 'SENHA_REDEFINIDA'
  | 'FAMILIA_CRIADA'
  | 'FAMILIA_EDITADA'
  | 'FAMILIA_EXCLUIDA'
  | 'PRONTUARIO_VISUALIZADO'
  | 'ATENDIMENTO_CRIADO'
  | 'ATENDIMENTO_VISUALIZADO'
  | 'ENCAMINHAMENTO_CRIADO'
  | 'USUARIO_CRIADO'
  | 'USUARIO_EDITADO'
  | 'USUARIO_EXCLUIDO'
  | 'ACESSO_NEGADO_SIGILO'

export interface AuditLogData {
  usuario_id?: string | number
  usuario_nome?: string
  usuario_perfil?: string
  acao: AuditAcao
  detalhes?: string
  entidade?: string
  entidade_id?: string | number
  ip?: string
}

/**
 * Registra uma ação de auditoria no sistema
 */
export async function registrarLogAuditoria(data: AuditLogData): Promise<void> {
  const logEntry = {
    ...data,
    criado_em: new Date().toISOString()
  }

  // Tenta persistir no Supabase (se a tabela auditoria_logs existir)
  try {
    const supabase = getSupabaseServer()
    await supabase.from('auditoria_logs').insert([logEntry])
  } catch (err) {
    // Fallback gracioso para logs de console caso a tabela ainda não tenha sido criada
    console.warn('[AUDIT_LOG_FALLBACK]:', JSON.stringify(logEntry))
  }
}
