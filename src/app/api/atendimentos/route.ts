import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { registrarLogAuditoria } from '@/lib/auditLogger'
import { getD1Database } from '@/lib/d1Client'

const PERFIS_TECNICOS_AUTORIZADOS = ['admin', 'coordenador', 'assistente_social', 'psicologo', 'tecnico', 'tecnico_superior']

function usuarioPodeVerSigilo(perfil: string | null): boolean {
  if (!perfil) return false
  const p = perfil.toLowerCase().trim()
  return PERFIS_TECNICOS_AUTORIZADOS.includes(p) || p.includes('assistente') || p.includes('psicolog') || p.includes('admin') || p.includes('coord')
}

export async function GET(request: NextRequest) {
  try {
    const perfil = request.headers.get('x-auth-user-perfil')
    const podeVerRestrito = usuarioPodeVerSigilo(perfil)

    // 1. Consulta prioritária no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        const atdRes = await db.prepare('SELECT * FROM historico_atendimentos ORDER BY criado_em DESC LIMIT 200').all<any>()
        const atdList = atdRes.results || []
        const atendimentosSanitizados = atdList.map((atd: any) => {
          const isSigiloso = atd.sigilo === 'restrito' || atd.sigilo === 'sigiloso'
          const isColetivoScfv = atd.tipo?.toLowerCase().includes('scfv') || atd.tipo?.toLowerCase().includes('oficina') || atd.tipo?.toLowerCase().includes('grupo')
          if (isColetivoScfv) return atd
          if (isSigiloso && !podeVerRestrito) {
            return {
              ...atd,
              relato_atendimento: '[CONTEÚDO PROTEGIDO POR SIGILO PROFISSIONAL - ACESSO RESTRITO À EQUIPE TÉCNICA]',
              providencias: '[PROTEGIDO POR SIGILO]',
              sigilo_ocultado_backend: true
            }
          }
          return atd
        })
        return NextResponse.json({ ok: true, data: atendimentosSanitizados, source: 'cloudflare-d1' })
      }
    } catch (d1Err) {
      console.warn('[D1_ATENDIMENTOS_FALLBACK]:', d1Err)
    }

    try {
      const supabase = getSupabaseServer()
      const { data, error } = await supabase
        .from('historico_atendimentos')
        .select('*')
        .order('criado_em', { ascending: false })

      if (!error && data) {
        const atendimentosSanitizados = data.map((atd: any) => {
          const isSigiloso = atd.sigilo === 'restrito' || atd.sigilo === 'sigiloso'
          const isColetivoScfv = atd.tipo?.toLowerCase().includes('scfv') || atd.tipo?.toLowerCase().includes('oficina') || atd.tipo?.toLowerCase().includes('grupo')
          if (isColetivoScfv) return atd
          if (isSigiloso && !podeVerRestrito) {
            return {
              ...atd,
              relato_atendimento: '[CONTEÚDO PROTEGIDO POR SIGILO PROFISSIONAL - ACESSO RESTRITO À EQUIPE TÉCNICA]',
              providencias: '[PROTEGIDO POR SIGILO]',
              sigilo_ocultado_backend: true
            }
          }
          return atd
        })
        return NextResponse.json({ ok: true, data: atendimentosSanitizados })
      }
    } catch (sbErr) {
      console.warn('[SUPABASE_ATD_ERR]:', sbErr)
    }

    return NextResponse.json({ ok: true, data: [] })
  } catch (e: any) {
    return NextResponse.json({ ok: true, data: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body) {
      return NextResponse.json({ ok: false, error: 'Dados de atendimento inválidos.' }, { status: 400 })
    }

    const items = Array.isArray(body) ? body : [body]
    if (items.length === 0 || !items[0].familia_id) {
      return NextResponse.json({ ok: false, error: 'Dados de atendimento ou família_id inválidos.' }, { status: 400 })
    }

    // 1. Validação de Segurança SUAS: Bloquear Acompanhamento PAIF e Visita Domiciliar para famílias sem PAIF ativo
    try {
      const db = await getD1Database()
      if (db) {
        for (const atd of items) {
          const tipoLower = (atd.tipo || '').toLowerCase()
          const exigePaif = tipoLower.includes('paif') || tipoLower.includes('visita domiciliar')
          if (exigePaif && atd.familia_id) {
            const famCheck = await db.prepare('SELECT id, paif_ativo, responsavel FROM familias WHERE id = ?').bind(atd.familia_id).first<any>()
            if (famCheck && !famCheck.paif_ativo) {
              return NextResponse.json(
                {
                  ok: false,
                  error: `Bloqueio SUAS: A família "${famCheck.responsavel || ''}" não possui Acompanhamento PAIF ativo. Não é permitido registrar "${atd.tipo}".`
                },
                { status: 400 }
              )
            }
          }
        }
      }
    } catch (d1Err) {
      console.warn('[D1_PAIF_CHECK_WARN]:', d1Err)
    }

    // 2. Inserir no Cloudflare D1
    const atdsInseridos: any[] = []
    try {
      const db = await getD1Database()
      if (db) {
        for (const atd of items) {
          const atdId = atd.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `atd_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`)
          const dataAtd = atd.data || new Date().toISOString().split('T')[0]
          const horaAtd = atd.hora || new Date().toTimeString().split(' ')[0]
          const partFamJson = typeof atd.participantes_familiares === 'string'
            ? atd.participantes_familiares
            : JSON.stringify(atd.participantes_familiares || [])

          await db.prepare(`
            INSERT INTO historico_atendimentos (
              id, familia_id, data, hora, usuario_visitado, participantes_familiares,
              local, compartilhada, profissionais_participantes, tecnico, tecnico_conselho,
              relato, providencias, sigilo, tipo, criado_em
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
          `).bind(
            atdId,
            atd.familia_id,
            dataAtd,
            horaAtd,
            atd.usuario_visitado || 'BENEFICIÁRIO',
            partFamJson,
            atd.local || 'CRAS',
            atd.compartilhada || 'Não',
            atd.profissionais_participantes || null,
            atd.tecnico || 'TÉCNICO RESPONSÁVEL',
            atd.tecnico_conselho || null,
            atd.relato || atd.relato_atendimento || '',
            atd.providencias || '',
            atd.sigilo || 'publico',
            atd.tipo || 'Atendimento'
          ).run()

          atdsInseridos.push({ ...atd, id: atdId })
        }
      }
    } catch (d1Err) {
      console.warn('[D1_ATENDIMENTO_INSERT_ERR]:', d1Err)
    }

    // 3. Tentar salvar no Supabase de forma resiliente em segundo plano (não-bloqueante)
    ;(async () => {
      try {
        const supabase = getSupabaseServer()
        let payloads = items.map(atd => ({ ...atd }))
        const { error: atdErr } = await supabase.from('historico_atendimentos').insert(payloads)
        if (atdErr && atdErr.message?.includes('sigilo')) {
          payloads = payloads.map(p => {
            const copy = { ...p }
            delete copy.sigilo
            return copy
          })
          await supabase.from('historico_atendimentos').insert(payloads)
        }
      } catch (sbErr) {
        console.warn('[SUPABASE_ATD_INSERT_FALLBACK]:', sbErr)
      }
    })().catch(() => {})

    await registrarLogAuditoria({
      acao: 'ATENDIMENTO_CRIADO',
      usuario_id: request.headers.get('x-auth-user-id') || undefined,
      usuario_nome: request.headers.get('x-auth-user-nome') || undefined,
      detalhes: `Registrados ${items.length} atendimento(s) / relato(s).`,
      entidade: 'historico_atendimentos'
    })

    const finalData = atdsInseridos.length > 0 ? atdsInseridos : items
    return NextResponse.json({
      ok: true,
      data: Array.isArray(body) ? finalData : finalData[0]
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, atendimento } = await request.json()

    if (!id || !atendimento) {
      return NextResponse.json({ ok: false, error: 'ID e dados de atendimento são obrigatórios.' }, { status: 400 })
    }

    // 1. Atualizar no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        await db.prepare(`
          UPDATE historico_atendimentos
          SET 
            relato = COALESCE(?, relato),
            providencias = COALESCE(?, providencias),
            tipo = COALESCE(?, tipo),
            tecnico = COALESCE(?, tecnico),
            local = COALESCE(?, local),
            sigilo = COALESCE(?, sigilo)
          WHERE id = ?
        `).bind(
          atendimento.relato || atendimento.relato_atendimento || null,
          atendimento.providencias || null,
          atendimento.tipo || null,
          atendimento.tecnico || null,
          atendimento.local || null,
          atendimento.sigilo || null,
          id
        ).run()
      }
    } catch (d1Err) {
      console.warn('[D1_ATD_UPDATE_ERR]:', d1Err)
    }

    // 2. Atualizar no Supabase em segundo plano (não-bloqueante)
    ;(async () => {
      try {
        const supabase = getSupabaseServer()
        let payload = { ...atendimento }
        const { error: atdErr } = await supabase.from('historico_atendimentos').update(payload).eq('id', id)
        if (atdErr && atdErr.message?.includes('sigilo')) {
          delete payload.sigilo
          await supabase.from('historico_atendimentos').update(payload).eq('id', id)
        }
      } catch (sbErr) {
        console.warn('[SUPABASE_ATD_UPDATE_FALLBACK]:', sbErr)
      }
    })().catch(() => {})

    return NextResponse.json({ ok: true, data: { id, ...atendimento } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID do atendimento é obrigatório.' }, { status: 400 })
    }

    const perfil = request.headers.get('x-auth-user-perfil')
    if (!usuarioPodeVerSigilo(perfil)) {
      return NextResponse.json({ ok: false, error: 'Apenas profissionais técnicos e coordenação podem excluir atendimentos.' }, { status: 403 })
    }

    // 1. Excluir no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        await db.prepare('DELETE FROM historico_atendimentos WHERE id = ?').bind(id).run()
      }
    } catch (d1Err) {
      console.warn('[D1_ATD_DELETE_ERR]:', d1Err)
    }

    // 2. Excluir no Supabase em segundo plano (não-bloqueante)
    ;(async () => {
      try {
        const supabase = getSupabaseServer()
        await supabase.from('historico_atendimentos').delete().eq('id', id)
      } catch (sbErr) {
        console.warn('[SUPABASE_ATD_DELETE_FALLBACK]:', sbErr)
      }
    })().catch(() => {})

    await registrarLogAuditoria({
      acao: 'ATENDIMENTO_EXCLUIDO',
      usuario_id: request.headers.get('x-auth-user-id') || undefined,
      usuario_nome: request.headers.get('x-auth-user-nome') || undefined,
      detalhes: `Atendimento excluído ID ${id}.`,
      entidade: 'historico_atendimentos',
      entidade_id: id
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
