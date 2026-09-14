// Utilitário de Trilha de Auditoria (Audit Logging) - LGPD & SUAS Digital
import { getSupabaseServer } from '@/lib/supabaseServer'

export type AuditAcao =
  | 'LOGIN_SUCESSO'
  | 'LOGIN_FALHA'
  | 'LOGOUT'
  | 'SENHA_REDEFINIDA'
  | 'RECUPERACAO_FALHA'
  | 'RECUPERACAO_BLOQUEADA'
  | 'FAMILIA_CRIADA'
  | 'FAMILIA_EDITADA'
  | 'FAMILIA_EXCLUIDA'
  | 'PRONTUARIO_VISUALIZADO'
  | 'ATENDIMENTO_CRIADO'
  | 'ATENDIMENTO_VISUALIZADO'
  | 'ATENDIMENTO_EXCLUIDO'
  | 'BENEFICIO_CRIADO'
  | 'ALMOXARIFADO_ALTERADO'
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

export async function registrarLogAuditoria(data: AuditLogData): Promise<void> {
  const logEntry = {
    ...data,
    criado_em: new Date().toISOString()
  }

  // Log local imediato
  console.log('[AUDIT_LOG]:', JSON.stringify(logEntry))

  // Persistência em segundo plano no Supabase sem bloquear a resposta da requisição
  try {
    const supabase = getSupabaseServer()
    void (async () => {
      try {
        await supabase.from('auditoria_logs').insert([logEntry])
      } catch (err: any) {
        console.warn('[AUDIT_LOG_FALLBACK]:', err?.message || err)
      }
    })()
  } catch (err) {
    console.warn('[AUDIT_LOG_FALLBACK]:', err)
  }
}
