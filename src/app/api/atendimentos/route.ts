import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { registrarLogAuditoria } from '@/lib/auditLogger'

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

    const supabase = getSupabaseServer()
    const { data, error } = await supabase
      .from('historico_atendimentos')
      .select('*')
      .order('criado_em', { ascending: false })

    if (error) {
      console.error('Erro ao buscar atendimentos:', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    // Sanitização de Sigilo no Nível do Servidor (LGPD / SUAS)
    const atendimentosSanitizados = (data || []).map((atd: any) => {
      const isSigiloso = atd.sigilo === 'restrito' || atd.sigilo === 'sigiloso'
      const isColetivoScfv = atd.tipo?.toLowerCase().includes('scfv') || atd.tipo?.toLowerCase().includes('oficina') || atd.tipo?.toLowerCase().includes('grupo')

      // Grupos coletivos e oficinas do SCFV são públicos
      if (isColetivoScfv) return atd

      // Se for restrito e o perfil não tiver autorização técnica, mascara o relato e providências
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
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
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

    const supabase = getSupabaseServer()

    // Validação de Segurança SUAS: Bloquear Acompanhamento PAIF e Visita Domiciliar para famílias sem PAIF ativo
    for (const atd of items) {
      const tipoLower = (atd.tipo || '').toLowerCase()
      const exigePaif = tipoLower.includes('paif') || tipoLower.includes('visita domiciliar')
      if (exigePaif && atd.familia_id) {
        const { data: famCheck } = await supabase
          .from('familias')
          .select('id, paif_ativo, responsavel')
          .eq('id', atd.familia_id)
          .maybeSingle()

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

    let payloads = items.map(atd => ({ ...atd }))

    let { data: atdsInseridos, error: atdErr } = await supabase
      .from('historico_atendimentos')
      .insert(payloads)
      .select()

    if (atdErr && atdErr.message?.includes('sigilo')) {
      payloads = payloads.map(p => {
        const copy = { ...p }
        delete copy.sigilo
        return copy
      })
      const retry = await supabase
        .from('historico_atendimentos')
        .insert(payloads)
        .select()
      atdsInseridos = retry.data
      atdErr = retry.error
    }

    if (atdErr) {
      console.error('Erro ao inserir atendimento:', atdErr)
      return NextResponse.json({ ok: false, error: atdErr.message }, { status: 500 })
    }

    await registrarLogAuditoria({
      acao: 'ATENDIMENTO_CRIADO',
      usuario_id: request.headers.get('x-auth-user-id') || undefined,
      usuario_nome: request.headers.get('x-auth-user-nome') || undefined,
      detalhes: `Registrados ${payloads.length} atendimento(s) / relato(s).`,
      entidade: 'historico_atendimentos'
    })

    return NextResponse.json({
      ok: true,
      data: Array.isArray(body) ? atdsInseridos : (atdsInseridos && atdsInseridos[0])
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

    const supabase = getSupabaseServer()
    let payload = { ...atendimento }
    let { data: atdAtualizado, error: atdErr } = await supabase
      .from('historico_atendimentos')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (atdErr && atdErr.message?.includes('sigilo')) {
      delete payload.sigilo
      const retry = await supabase
        .from('historico_atendimentos')
        .update(payload)
        .eq('id', id)
        .select()
        .single()
      atdAtualizado = retry.data
      atdErr = retry.error
    }

    if (atdErr) {
      console.error('Erro ao atualizar atendimento:', atdErr)
      return NextResponse.json({ ok: false, error: atdErr.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data: atdAtualizado })
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

    const supabase = getSupabaseServer()
    const { error: err } = await supabase
      .from('historico_atendimentos')
      .delete()
      .eq('id', id)

    if (err) {
      console.error('Erro ao excluir atendimento:', err)
      return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
    }

    await registrarLogAuditoria({
      acao: 'ATENDIMENTO_CRIADO',
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
